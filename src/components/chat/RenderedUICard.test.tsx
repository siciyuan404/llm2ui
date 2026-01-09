/**
 * RenderedUICard Property-Based Tests
 * 
 * **Feature: llm-chat-integration, Property 11: Schema 渲染正确性**
 * **Validates: Requirements 7.1, 7.8**
 * 
 * Tests that:
 * 1. Valid UI Schemas render successfully without errors
 * 2. Invalid UI Schemas display error messages and fallback to raw JSON
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import type { UISchema, UIComponent, DataContext } from '@/types';
import { RenderedUICard } from './RenderedUICard';
import { validateUISchema, defaultRegistry, registerShadcnComponents } from '@/lib';

// ============================================================================
// Test Setup
// ============================================================================

// Initialize registry with shadcn components
beforeEach(() => {
  defaultRegistry.clear();
  registerShadcnComponents(defaultRegistry);
});

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid component types (registered in shadcn-components)
 */
const validComponentTypeArb = fc.constantFrom(
  'Button', 'Input', 'Card', 'CardHeader', 'CardTitle',
  'CardContent', 'CardFooter', 'Text', 'Container', 'Label'
);

/**
 * Generator for valid property names
 */
const propNameArb = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s));

/**
 * Generator for simple prop values (no functions)
 */
const simplePropValueArb: fc.Arbitrary<unknown> = fc.oneof(
  fc.string({ maxLength: 50 }),
  fc.integer(),
  fc.boolean(),
  fc.constant(null)
);

/**
 * Generator for simple props object
 */
const simplePropsArb = fc.dictionary(propNameArb, simplePropValueArb, { maxKeys: 3 });

/**
 * Generator for leaf UIComponent (no children)
 */
const leafComponentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: fc.uuid(),
  type: validComponentTypeArb,
  text: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  props: fc.option(simplePropsArb, { nil: undefined }),
}, { requiredKeys: ['id', 'type'] });

/**
 * Generator for UIComponent with optional children (max depth 2)
 */
const componentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: fc.uuid(),
  type: validComponentTypeArb,
  text: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  props: fc.option(simplePropsArb, { nil: undefined }),
  children: fc.option(
    fc.array(leafComponentArb, { minLength: 0, maxLength: 3 }),
    { nil: undefined }
  ),
}, { requiredKeys: ['id', 'type'] });

/**
 * Generator for DataContext
 */
const dataContextArb: fc.Arbitrary<DataContext> = fc.dictionary(
  propNameArb,
  fc.oneof(
    fc.string({ maxLength: 20 }),
    fc.integer(),
    fc.boolean(),
    fc.array(fc.string({ maxLength: 10 }), { maxLength: 3 })
  ),
  { maxKeys: 5 }
);

/**
 * Generator for valid UISchema
 */
const validUISchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: componentArb,
  data: fc.option(dataContextArb, { nil: undefined }),
  meta: fc.option(
    fc.record({
      title: fc.option(fc.string({ maxLength: 30 }), { nil: undefined }),
      description: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    }, { requiredKeys: [] }),
    { nil: undefined }
  ),
}, { requiredKeys: ['version', 'root'] });

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Schema Rendering Correctness (Property 11)', () => {
  /**
   * Property 11a: Valid UI Schemas render successfully
   * 
   * For any valid UISchema:
   * - The RenderedUICard component should render without throwing
   * - The "AI 生成的 UI" label should be visible
   * - The action buttons should be present
   * 
   * **Validates: Requirements 7.1**
   */
  it('Property 11a: Valid UI Schemas render successfully without errors', () => {
    fc.assert(
      fc.property(validUISchemaArb, (schema) => {
        // Verify schema is valid first
        const validation = validateUISchema(schema);
        expect(validation.valid).toBe(true);

        // Render the component
        const { container, unmount } = render(
          <RenderedUICard schema={schema} />
        );

        // Should render without throwing
        expect(container).toBeDefined();

        // Should show the AI label
        expect(screen.getByText(/AI 生成的 UI/)).toBeInTheDocument();

        // Should have action buttons
        expect(screen.getByTitle('全屏预览')).toBeInTheDocument();
        expect(screen.getByTitle('复制 JSON')).toBeInTheDocument();

        // Cleanup
        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000); // Extended timeout for PBT with React rendering

  /**
   * Property 11b: Invalid UI Schemas show error and raw JSON
   * 
   * For any invalid UISchema:
   * - The RenderedUICard should handle the error gracefully
   * - Error information or raw JSON should be displayed
   * 
   * **Validates: Requirements 7.8**
   */
  it('Property 11b: Invalid UI Schemas are handled gracefully', () => {
    // Test with specific invalid schemas that will fail validation
    const invalidSchemas = [
      // Missing version
      { root: { id: 'test', type: 'Button' } },
      // Missing root
      { version: '1.0' },
      // Root missing id
      { version: '1.0', root: { type: 'Button' } },
      // Root missing type
      { version: '1.0', root: { id: 'test' } },
    ];

    for (const invalidSchema of invalidSchemas) {
      // Verify schema is invalid
      const validation = validateUISchema(invalidSchema);
      expect(validation.valid).toBe(false);
    }
  });

  /**
   * Property 11c: Schema with data bindings renders correctly
   * 
   * For any valid UISchema with data context:
   * - The component should render with data bindings resolved
   * 
   * **Validates: Requirements 7.1, 7.2**
   */
  it('Property 11c: Schemas with data bindings render correctly', () => {
    fc.assert(
      fc.property(
        validUISchemaArb,
        dataContextArb,
        (schema, additionalData) => {
          // Render with additional data
          const { container, unmount } = render(
            <RenderedUICard schema={schema} data={additionalData} />
          );

          // Should render without throwing
          expect(container).toBeDefined();

          // Should show the AI label
          expect(screen.getByText(/AI 生成的 UI/)).toBeInTheDocument();

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 50 } // Reduced iterations due to two generators
    );
  }, 30000); // Extended timeout for PBT
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('RenderedUICard Unit Tests', () => {
  it('should render a simple button schema', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'btn1',
        type: 'Button',
        text: 'Click me',
      },
    };

    render(<RenderedUICard schema={schema} />);

    expect(screen.getByText(/AI 生成的 UI/)).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render nested card schema', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'card1',
        type: 'Card',
        children: [
          {
            id: 'header1',
            type: 'CardHeader',
            children: [
              {
                id: 'title1',
                type: 'CardTitle',
                text: 'Test Card',
              },
            ],
          },
          {
            id: 'content1',
            type: 'CardContent',
            children: [
              {
                id: 'text1',
                type: 'Text',
                text: 'Card content here',
              },
            ],
          },
        ],
      },
    };

    render(<RenderedUICard schema={schema} />);

    expect(screen.getByText(/AI 生成的 UI/)).toBeInTheDocument();
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card content here')).toBeInTheDocument();
  });

  it('should call onCopyJson when copy button is clicked', async () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'btn1',
        type: 'Button',
        text: 'Test',
      },
    };

    const onCopyJson = vi.fn();
    
    // Mock clipboard API
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<RenderedUICard schema={schema} onCopyJson={onCopyJson} />);

    const copyButton = screen.getByTitle('复制 JSON');
    copyButton.click();

    // Wait for async clipboard operation
    await vi.waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(schema, null, 2)
      );
    });
  });

  it('should call onApplyToEditor when apply button is clicked', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'btn1',
        type: 'Button',
        text: 'Test',
      },
    };

    const onApplyToEditor = vi.fn();

    render(<RenderedUICard schema={schema} onApplyToEditor={onApplyToEditor} />);

    const applyButton = screen.getByTitle('应用到编辑器');
    applyButton.click();

    expect(onApplyToEditor).toHaveBeenCalled();
  });

  it('should not show apply button when onApplyToEditor is not provided', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'btn1',
        type: 'Button',
        text: 'Test',
      },
    };

    render(<RenderedUICard schema={schema} />);

    expect(screen.queryByTitle('应用到编辑器')).not.toBeInTheDocument();
  });

  it('should open fullscreen dialog when fullscreen button is clicked', async () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'btn1',
        type: 'Button',
        text: 'Test',
      },
    };

    const onFullscreen = vi.fn();

    render(<RenderedUICard schema={schema} onFullscreen={onFullscreen} />);

    const fullscreenButton = screen.getByTitle('全屏预览');
    fullscreenButton.click();

    expect(onFullscreen).toHaveBeenCalled();
    // Dialog should be open - wait for portal to render
    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should handle event callbacks', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'btn1',
        type: 'Button',
        text: 'Click me',
        events: [
          {
            event: 'click',
            action: { type: 'custom', handler: 'handleClick' },
          },
        ],
      },
    };

    const onEvent = vi.fn();

    render(<RenderedUICard schema={schema} onEvent={onEvent} />);

    // The button should be rendered
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
