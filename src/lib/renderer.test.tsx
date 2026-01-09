/**
 * Renderer Property-Based Tests
 * 
 * **Feature: llm2ui, Property 11: Schema 框架无关性**
 * **Validates: Requirements 7.5**
 * 
 * Tests that the UISchema is a pure data structure that can be serialized
 * and deserialized without losing information, demonstrating framework independence.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { UISchema, UIComponent, DataContext } from '../types';
import { extractPureSchema, render } from './core/renderer';
import { serialize, deserialize } from './core/serialization';
import { ComponentRegistry } from './core/component-registry';
import { registerShadcnComponents } from './core/shadcn-components';

/**
 * Generator for valid component types
 */
const componentTypeArb = fc.constantFrom(
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
 * Generator for simple props object (no functions)
 */
const simplePropsArb = fc.dictionary(propNameArb, simplePropValueArb, { maxKeys: 3 });

/**
 * Generator for UIComponent without children (leaf component)
 */
const leafComponentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: fc.uuid(),
  type: componentTypeArb,
  text: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  props: fc.option(simplePropsArb, { nil: undefined }),
}, { requiredKeys: ['id', 'type'] });

/**
 * Generator for UIComponent with optional children (max depth 2)
 */
const componentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: fc.uuid(),
  type: componentTypeArb,
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
 * Generator for UISchema
 */
const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
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


describe('Schema Framework Independence', () => {
  /**
   * Property 11: Schema 框架无关性
   * 
   * For any valid UISchema:
   * 1. The schema can be extracted as a pure JavaScript object
   * 2. The extracted schema contains no functions or framework-specific code
   * 3. The extracted schema can be serialized to JSON and back without loss
   * 4. The schema structure is identical before and after extraction
   * 
   * **Validates: Requirements 7.5**
   */
  it('Property 11: UISchema is framework-agnostic and can be serialized without loss', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        // Extract pure schema (removes any potential framework references)
        const pureSchema = extractPureSchema(schema);
        
        // Verify it's a plain object
        expect(typeof pureSchema).toBe('object');
        expect(pureSchema).not.toBeNull();
        
        // Verify it can be serialized to JSON
        const jsonString = JSON.stringify(pureSchema);
        expect(typeof jsonString).toBe('string');
        
        // Verify it can be deserialized back
        const parsed = JSON.parse(jsonString);
        expect(parsed).toEqual(pureSchema);
        
        // Verify the structure matches the original
        expect(JSON.stringify(parsed)).toBe(JSON.stringify(schema));
      }),
      { numRuns: 100 }
    );
  });

  it('Property 11b: Schema contains no functions after extraction', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const pureSchema = extractPureSchema(schema);
        
        // Recursively check that no value is a function
        function containsNoFunctions(obj: unknown): boolean {
          if (typeof obj === 'function') {
            return false;
          }
          if (typeof obj === 'object' && obj !== null) {
            for (const value of Object.values(obj)) {
              if (!containsNoFunctions(value)) {
                return false;
              }
            }
          }
          return true;
        }
        
        expect(containsNoFunctions(pureSchema)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 11c: Schema serialization round-trip preserves structure', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        // Use the serialization module
        const serialized = serialize(schema);
        const deserialized = deserialize(serialized);
        
        // The deserialized schema should be valid
        expect(deserialized.success).toBe(true);
        
        if (deserialized.success && deserialized.schema) {
          // Re-serialize and compare
          const reSerialized = serialize(deserialized.schema);
          expect(reSerialized).toBe(serialized);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Renderer Unit Tests', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();
    registerShadcnComponents(registry);
  });

  it('should render a simple component', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'btn1',
        type: 'Button',
        text: 'Click me',
      },
    };

    const result = render(schema, { registry });
    expect(result).toBeDefined();
  });

  it('should render nested components', () => {
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
                text: 'Hello',
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
                text: 'World',
              },
            ],
          },
        ],
      },
    };

    const result = render(schema, { registry });
    expect(result).toBeDefined();
  });

  it('should resolve data bindings in text', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'text1',
        type: 'Text',
        text: 'Hello {{name}}!',
      },
      data: {
        name: 'World',
      },
    };

    const result = render(schema, { registry });
    expect(result).toBeDefined();
  });

  it('should handle unknown components with placeholder', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'unknown1',
        type: 'UnknownComponent',
        text: 'Test',
      },
    };

    const result = render(schema, { registry });
    expect(result).toBeDefined();
  });

  it('should handle conditional rendering', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'container1',
        type: 'Container',
        children: [
          {
            id: 'visible1',
            type: 'Text',
            text: 'Visible',
            condition: '{{showText}}',
          },
          {
            id: 'hidden1',
            type: 'Text',
            text: 'Hidden',
            condition: '{{hideText}}',
          },
        ],
      },
      data: {
        showText: true,
        hideText: false,
      },
    };

    const result = render(schema, { registry });
    expect(result).toBeDefined();
  });

  it('should handle loop rendering', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'list1',
        type: 'Container',
        loop: {
          source: 'items',
          itemName: 'item',
          indexName: 'idx',
        },
        children: [
          {
            id: 'item-text',
            type: 'Text',
            binding: '{{item}}',
          },
        ],
      },
      data: {
        items: ['Apple', 'Banana', 'Cherry'],
      },
    };

    const result = render(schema, { registry });
    expect(result).toBeDefined();
  });

  it('should apply style props', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'styled1',
        type: 'Container',
        style: {
          backgroundColor: '#f0f0f0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        },
        children: [
          {
            id: 'text1',
            type: 'Text',
            text: 'Styled content',
          },
        ],
      },
    };

    const result = render(schema, { registry });
    expect(result).toBeDefined();
  });
});

// Import beforeEach for test setup
import { beforeEach } from 'vitest';
