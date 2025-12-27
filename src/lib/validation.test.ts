/**
 * Schema Validation Property-Based Tests
 * 
 * Tests for JSON syntax validation and UI Schema validation.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateJSON } from './validation';

describe('JSON Syntax Validation', () => {
  /**
   * Property 10: JSON 语法验证正确性
   * 
   * For any valid JSON value, validateJSON should:
   * 1. Return valid: true
   * 2. Return the parsed value
   * 
   * For any invalid JSON string, validateJSON should:
   * 1. Return valid: false
   * 2. Provide error details
   * 
   * **Validates: Requirements 2.2**
   */
  it('Property 10: valid JSON values are correctly validated', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const json = JSON.stringify(value);
        const result = validateJSON(json);
        
        expect(result.valid).toBe(true);
        // Use JSON.stringify for comparison to handle -0 vs 0 edge case
        // JSON.stringify(-0) === "0", so we compare serialized forms
        expect(JSON.stringify(result.value)).toEqual(JSON.stringify(value));
        expect(result.error).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('Property 10b: invalid JSON strings are rejected with error details', () => {
    // Generator for invalid JSON strings
    const invalidJsonArb = fc.oneof(
      // Missing closing brace
      fc.constant('{"key": "value"'),
      // Missing closing bracket
      fc.constant('[1, 2, 3'),
      // Trailing comma
      fc.constant('{"key": "value",}'),
      // Single quotes instead of double
      fc.constant("{'key': 'value'}"),
      // Unquoted keys
      fc.constant('{key: "value"}'),
      // Missing colon
      fc.constant('{"key" "value"}'),
      // Extra comma
      fc.constant('[1, 2, 3,]'),
      // Invalid escape sequence
      fc.constant('{"key": "value\\x"}'),
      // Unclosed string
      fc.constant('{"key": "value'),
      // Random non-JSON text
      fc.string({ minLength: 1, maxLength: 20 })
        .filter((s: string) => {
          try {
            JSON.parse(s);
            return false;
          } catch {
            return true;
          }
        })
    );

    fc.assert(
      fc.property(invalidJsonArb, (invalidJson) => {
        const result = validateJSON(invalidJson);
        
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject empty input with position info', () => {
    const result = validateJSON('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('Empty input');
    expect(result.error!.position).toBe(0);
    expect(result.error!.line).toBe(1);
    expect(result.error!.column).toBe(1);
  });

  it('should reject whitespace-only input', () => {
    const result = validateJSON('   \n\t  ');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('Empty input');
  });
});


import { validateUISchema } from './validation';
import type { UISchema, UIComponent, StyleProps, EventBinding } from '../types';

// Arbitrary generators for UISchema types (reused from serialization tests)

/**
 * Generator for StyleProps
 */
const stylePropsArb: fc.Arbitrary<StyleProps> = fc.record({
  className: fc.option(fc.string(), { nil: undefined }),
  width: fc.option(fc.oneof(fc.string(), fc.integer({ min: 0, max: 1000 })), { nil: undefined }),
  height: fc.option(fc.oneof(fc.string(), fc.integer({ min: 0, max: 1000 })), { nil: undefined }),
  display: fc.option(fc.constantFrom('block', 'inline', 'flex', 'grid', 'none'), { nil: undefined }),
}, { requiredKeys: [] });

/**
 * Generator for EventBinding
 */
const eventBindingArb: fc.Arbitrary<EventBinding> = fc.record({
  event: fc.constantFrom('click', 'change', 'submit', 'focus', 'blur'),
  action: fc.oneof(
    fc.record({ type: fc.constant('navigate' as const), url: fc.webUrl() }),
    fc.record({ type: fc.constant('submit' as const), endpoint: fc.option(fc.webUrl(), { nil: undefined }) }),
    fc.record({ type: fc.constant('toggle' as const), path: fc.string({ minLength: 1, maxLength: 20 }) }),
  ),
});

/**
 * Generator for UIComponent (recursive structure)
 */
const uiComponentArb: fc.Arbitrary<UIComponent> = fc.letrec<{ component: UIComponent }>(tie => ({
  component: fc.record({
    id: fc.uuid(),
    type: fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container'),
    props: fc.option(
      fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.jsonValue()),
      { nil: undefined }
    ),
    style: fc.option(stylePropsArb, { nil: undefined }),
    children: fc.option(
      fc.array(tie('component'), { minLength: 0, maxLength: 2 }),
      { nil: undefined }
    ),
    text: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
    events: fc.option(fc.array(eventBindingArb, { minLength: 0, maxLength: 2 }), { nil: undefined }),
  }, { requiredKeys: ['id', 'type'] }),
})).component;

/**
 * Generator for valid UISchema
 */
const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constantFrom('1.0', '1.1', '2.0'),
  root: uiComponentArb,
  data: fc.option(
    fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.jsonValue()),
    { nil: undefined }
  ),
  meta: fc.option(
    fc.record({
      title: fc.option(fc.string({ minLength: 0, maxLength: 30 }), { nil: undefined }),
      description: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
    }, { requiredKeys: [] }),
    { nil: undefined }
  ),
}, { requiredKeys: ['version', 'root'] });

describe('UI Schema Validation', () => {
  /**
   * Property 5: Schema 验证完整性
   * 
   * For any valid UISchema, validateUISchema should return valid: true.
   * For any schema missing required fields, validateUISchema should return valid: false
   * with appropriate error messages.
   * 
   * **Validates: Requirements 5.2, 5.3**
   */
  it('Property 5: valid UISchema passes validation', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const result = validateUISchema(schema);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.schema).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('Property 5b: schema without version fails validation', () => {
    fc.assert(
      fc.property(uiComponentArb, (root) => {
        const invalidSchema = { root } as unknown;
        const result = validateUISchema(invalidSchema);
        
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.path === 'version')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 5c: schema without root fails validation', () => {
    fc.assert(
      fc.property(fc.constantFrom('1.0', '1.1', '2.0'), (version) => {
        const invalidSchema = { version } as unknown;
        const result = validateUISchema(invalidSchema);
        
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.path === 'root')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 5d: component without id fails validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('1.0', '1.1', '2.0'),
        fc.constantFrom('Button', 'Input', 'Card'),
        (version, type) => {
          const invalidSchema = {
            version,
            root: { type }, // missing id
          };
          const result = validateUISchema(invalidSchema);
          
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.code === 'MISSING_FIELD' && e.path.includes('id'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5e: component without type fails validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('1.0', '1.1', '2.0'),
        fc.uuid(),
        (version, id) => {
          const invalidSchema = {
            version,
            root: { id }, // missing type
          };
          const result = validateUISchema(invalidSchema);
          
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.code === 'MISSING_FIELD' && e.path.includes('type'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect duplicate component IDs', () => {
    const schema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          { id: 'child1', type: 'Button' },
          { id: 'child1', type: 'Input' }, // duplicate ID
        ],
      },
    };
    
    const result = validateUISchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_ID')).toBe(true);
  });

  it('should validate nested children recursively', () => {
    const schema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          {
            id: 'level1',
            type: 'Card',
            children: [
              { type: 'Button' }, // missing id in nested child
            ],
          },
        ],
      },
    };
    
    const result = validateUISchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.path.includes('children[0].children[0]'))).toBe(true);
  });

  it('should reject non-object input', () => {
    expect(validateUISchema(null).valid).toBe(false);
    expect(validateUISchema(undefined).valid).toBe(false);
    expect(validateUISchema('string').valid).toBe(false);
    expect(validateUISchema(123).valid).toBe(false);
    expect(validateUISchema([]).valid).toBe(false);
  });
});
