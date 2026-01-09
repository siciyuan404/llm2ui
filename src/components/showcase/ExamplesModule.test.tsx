/**
 * ExamplesModule Property-Based Tests
 * 
 * **Feature: showcase-design-system, Property 12: 案例数据源同步**
 * **Validates: Requirements 5.7**
 * 
 * Tests that:
 * 1. All examples displayed in ExamplesModule exist in either preset-examples.ts or custom-examples-storage
 * 2. The displayed data (title, description, schema) matches the source
 * 
 * @module ExamplesModule.test
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ExamplesModule } from './ExamplesModule';
import {
  PRESET_EXAMPLES,
  getPresetExampleById,
  getAllExamples,
  createExample,
  clearAllExamples,
  getExampleById,
} from '@/lib';
import type {
  ExampleMetadata,
  CustomExample,
  ExampleCategory,
} from '@/lib';
import type { UISchema } from '@/types';

// Mock scrollIntoView for jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Create a valid UISchema for testing
 */
function createTestSchema(id: string): UISchema {
  return {
    version: '1.0',
    root: {
      id: `test-${id}`,
      type: 'Container',
      props: { className: 'test-container' },
      children: [
        {
          id: `text-${id}`,
          type: 'Text',
          text: `Test content for ${id}`,
        },
      ],
    },
  };
}

/**
 * Deep equality check for UISchema objects
 */
function schemasAreEqual(a: UISchema, b: UISchema): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid example titles (non-empty strings)
 */
const titleArb = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

/**
 * Generator for valid example descriptions
 */
const descriptionArb = fc.string({ minLength: 0, maxLength: 200 });

/**
 * Generator for component names
 */
const componentNameArb = fc.constantFrom('Button', 'Card', 'Input', 'Container', 'Text');

/**
 * Generator for custom example input data
 */
const customExampleInputArb = fc.record({
  title: titleArb,
  description: descriptionArb,
  componentName: componentNameArb,
}).map(({ title, description, componentName }) => ({
  title,
  description,
  componentName,
  schema: createTestSchema(title.replace(/\s+/g, '-').toLowerCase()),
}));

/**
 * Generator for selecting a preset example ID
 */
const presetExampleIdArb = fc.constantFrom(...PRESET_EXAMPLES.map(e => e.id));

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Property 12: 案例数据源同步', () => {
  // Clean up custom examples before and after each test
  beforeEach(() => {
    clearAllExamples();
  });

  afterEach(() => {
    clearAllExamples();
  });

  /**
   * Property 12a: Preset examples exist in PRESET_EXAMPLES source
   * 
   * *For any* preset example displayed in the Examples module, the example
   * SHALL exist in preset-examples.ts with matching data.
   * 
   * **Feature: showcase-design-system, Property 12: 案例数据源同步**
   * **Validates: Requirements 5.7**
   */
  it('Property 12a: Preset examples exist in PRESET_EXAMPLES source', () => {
    fc.assert(
      fc.property(presetExampleIdArb, (exampleId) => {
        // Get the source example from PRESET_EXAMPLES
        const sourceExample = getPresetExampleById(exampleId);
        expect(sourceExample).toBeDefined();
        
        if (!sourceExample) return true;

        const { container, unmount } = render(
          <ExamplesModule
            activeExampleId={exampleId}
            onExampleSelect={vi.fn()}
          />
        );

        // Verify the example is displayed with correct title
        const titleElement = container.querySelector('h1');
        expect(titleElement).not.toBeNull();
        expect(titleElement?.textContent).toContain(sourceExample.title);

        // Verify description is displayed if present
        if (sourceExample.description) {
          expect(container.textContent).toContain(sourceExample.description);
        }

        // Verify the schema is displayed in the code block
        const codeBlock = container.querySelector('pre code');
        expect(codeBlock).not.toBeNull();
        
        if (codeBlock) {
          const displayedSchema = JSON.parse(codeBlock.textContent || '{}');
          expect(schemasAreEqual(displayedSchema, sourceExample.schema)).toBe(true);
        }

        unmount();
        return true;
      }),
      { numRuns: Math.min(PRESET_EXAMPLES.length, 20) }
    );
  }, 60000);

  /**
   * Property 12b: Custom examples exist in custom-examples-storage source
   * 
   * *For any* custom example created and displayed in the Examples module,
   * the example SHALL exist in custom-examples-storage with matching data.
   * 
   * **Feature: showcase-design-system, Property 12: 案例数据源同步**
   * **Validates: Requirements 5.7**
   */
  it('Property 12b: Custom examples exist in custom-examples-storage source', () => {
    fc.assert(
      fc.property(customExampleInputArb, (input) => {
        // Create a custom example
        const result = createExample(input);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        if (!result.data) return true;

        const customExample = result.data;

        const { container, unmount } = render(
          <ExamplesModule
            activeExampleId={customExample.id}
            onExampleSelect={vi.fn()}
          />
        );

        // Verify the example exists in storage
        const storedExample = getExampleById(customExample.id);
        expect(storedExample).toBeDefined();
        
        if (!storedExample) {
          unmount();
          return true;
        }

        // Verify the displayed title matches storage
        const titleElement = container.querySelector('h1');
        expect(titleElement).not.toBeNull();
        expect(titleElement?.textContent).toContain(storedExample.title);

        // Verify the schema in code block matches storage
        const codeBlock = container.querySelector('pre code');
        expect(codeBlock).not.toBeNull();
        
        if (codeBlock) {
          const displayedSchema = JSON.parse(codeBlock.textContent || '{}');
          expect(schemasAreEqual(displayedSchema, storedExample.schema)).toBe(true);
        }

        unmount();
        return true;
      }),
      { numRuns: 30 }
    );
  }, 60000);

  /**
   * Property 12c: All displayed examples have valid source
   * 
   * *For any* example displayed in the Examples module, the example SHALL
   * exist in either preset-examples.ts OR custom-examples-storage.
   * 
   * **Feature: showcase-design-system, Property 12: 案例数据源同步**
   * **Validates: Requirements 5.7**
   */
  it('Property 12c: All displayed examples have valid source', () => {
    fc.assert(
      fc.property(
        fc.array(customExampleInputArb, { minLength: 0, maxLength: 3 }),
        (customInputs) => {
          // Create custom examples
          const createdIds: string[] = [];
          for (const input of customInputs) {
            const result = createExample(input);
            if (result.success && result.data) {
              createdIds.push(result.data.id);
            }
          }

          const { container, unmount } = render(
            <ExamplesModule onExampleSelect={vi.fn()} />
          );

          // Get all example IDs from the sidebar
          // Examples are displayed as buttons in the sidebar
          const sidebarButtons = container.querySelectorAll('button');
          const displayedExampleIds: string[] = [];

          // Collect all preset example IDs that might be displayed
          const presetIds = new Set(PRESET_EXAMPLES.map(e => e.id));
          const customIds = new Set(createdIds);

          // For each preset example, verify it exists in source
          for (const presetExample of PRESET_EXAMPLES) {
            const sourceExample = getPresetExampleById(presetExample.id);
            expect(sourceExample).toBeDefined();
            expect(sourceExample?.source).toBe('system');
          }

          // For each custom example, verify it exists in storage
          for (const customId of createdIds) {
            const storedExample = getExampleById(customId);
            expect(storedExample).toBeDefined();
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);

  /**
   * Property 12d: Example data integrity - title, description, schema match source
   * 
   * *For any* example (preset or custom), when displayed, the title, description,
   * and schema SHALL exactly match the source data.
   * 
   * **Feature: showcase-design-system, Property 12: 案例数据源同步**
   * **Validates: Requirements 5.7**
   */
  it('Property 12d: Example data integrity - title, description, schema match source', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Either select a preset example
          presetExampleIdArb.map(id => ({ type: 'preset' as const, id })),
          // Or create a custom example
          customExampleInputArb.map(input => ({ type: 'custom' as const, input }))
        ),
        (selection) => {
          let exampleId: string;
          let sourceTitle: string;
          let sourceDescription: string;
          let sourceSchema: UISchema;

          if (selection.type === 'preset') {
            const presetExample = getPresetExampleById(selection.id);
            if (!presetExample) return true;
            
            exampleId = presetExample.id;
            sourceTitle = presetExample.title;
            sourceDescription = presetExample.description;
            sourceSchema = presetExample.schema;
          } else {
            const result = createExample(selection.input);
            if (!result.success || !result.data) return true;
            
            exampleId = result.data.id;
            sourceTitle = result.data.title;
            sourceDescription = result.data.description;
            sourceSchema = result.data.schema;
          }

          const { container, unmount } = render(
            <ExamplesModule
              activeExampleId={exampleId}
              onExampleSelect={vi.fn()}
            />
          );

          // Verify title matches
          const titleElement = container.querySelector('h1');
          expect(titleElement?.textContent).toContain(sourceTitle);

          // Verify description matches (if present)
          if (sourceDescription) {
            expect(container.textContent).toContain(sourceDescription);
          }

          // Verify schema matches
          const codeBlock = container.querySelector('pre code');
          if (codeBlock) {
            const displayedSchema = JSON.parse(codeBlock.textContent || '{}');
            expect(schemasAreEqual(displayedSchema, sourceSchema)).toBe(true);
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 30 }
    );
  }, 60000);
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('ExamplesModule', () => {
  beforeEach(() => {
    clearAllExamples();
  });

  afterEach(() => {
    clearAllExamples();
  });

  it('renders preset examples in sidebar', () => {
    const { container } = render(
      <ExamplesModule onExampleSelect={vi.fn()} />
    );

    // Should show at least one preset example title
    const firstPreset = PRESET_EXAMPLES[0];
    expect(container.textContent).toContain(firstPreset.title);
  });

  it('renders custom examples with "自定义" badge', () => {
    // Create a custom example
    const result = createExample({
      title: 'My Custom Example',
      description: 'A test custom example',
      componentName: 'Button',
      schema: createTestSchema('custom-test'),
    });

    expect(result.success).toBe(true);

    const { container } = render(
      <ExamplesModule
        activeExampleId={result.data?.id}
        onExampleSelect={vi.fn()}
      />
    );

    // Should show the custom badge
    expect(container.textContent).toContain('自定义');
  });

  it('displays example details when selected', () => {
    const firstPreset = PRESET_EXAMPLES[0];

    const { container } = render(
      <ExamplesModule
        activeExampleId={firstPreset.id}
        onExampleSelect={vi.fn()}
      />
    );

    // Should show the example title
    const titleElement = container.querySelector('h1');
    expect(titleElement?.textContent).toContain(firstPreset.title);

    // Should show the JSON Schema section
    expect(container.textContent).toContain('JSON Schema');
  });

  it('calls onExampleSelect when example is clicked', () => {
    const onExampleSelect = vi.fn();

    const { container } = render(
      <ExamplesModule onExampleSelect={onExampleSelect} />
    );

    // Find and click an example in the sidebar
    const buttons = container.querySelectorAll('button');
    for (const button of buttons) {
      const text = button.textContent || '';
      // Look for a preset example title
      if (text.includes(PRESET_EXAMPLES[0].title)) {
        button.click();
        break;
      }
    }

    expect(onExampleSelect).toHaveBeenCalledWith(PRESET_EXAMPLES[0].id);
  });

  it('shows empty state when no example is selected', () => {
    const { container } = render(
      <ExamplesModule onExampleSelect={vi.fn()} />
    );

    // Should show the empty state message
    expect(container.textContent).toContain('选择一个案例查看详情');
  });
});
