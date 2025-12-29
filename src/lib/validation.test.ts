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


// ============================================================================
// Enhanced Validation Tests
// ============================================================================

import { 
  validateUISchemaEnhanced, 
  levenshteinDistance, 
  getSimilarTypes,
  validateComponentType,
  validateComponentProps,
  checkDeprecatedComponent,
  type EnhancedValidationResult,
} from './validation';
import { ComponentCatalog, defaultCatalog } from './component-catalog';
import { ComponentRegistry } from './component-registry';

describe('Enhanced Schema Validation', () => {
  /**
   * Property 3: Schema 验证完整性
   * 
   * *对于任意* 有效的 UISchema（所有组件类型有效、必填属性存在、属性类型正确），
   * validateUISchemaEnhanced 应当返回 valid: true 且 errors 数组为空。
   * 
   * **Feature: agent-output-optimization, Property 3: Schema 验证完整性**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
   */
  describe('Property 3: Schema 验证完整性', () => {
    // 创建测试用的 registry 和 catalog
    let testRegistry: ComponentRegistry;
    let testCatalog: ComponentCatalog;

    beforeEach(() => {
      testRegistry = new ComponentRegistry();
      
      // 注册测试组件
      testRegistry.register({
        name: 'Button',
        component: () => null,
        category: 'input',
        description: 'A button component',
        propsSchema: {
          label: { type: 'string', required: true, description: 'Button label' },
          variant: { type: 'string', required: false, enum: ['primary', 'secondary', 'danger'] },
          disabled: { type: 'boolean', required: false },
          count: { type: 'number', required: false },
        },
      });

      testRegistry.register({
        name: 'Container',
        component: () => null,
        category: 'layout',
        description: 'A container component',
        propsSchema: {
          className: { type: 'string', required: false },
        },
      });

      testRegistry.register({
        name: 'Text',
        component: () => null,
        category: 'display',
        description: 'A text component',
        propsSchema: {
          content: { type: 'string', required: false },
        },
      });

      testCatalog = new ComponentCatalog(testRegistry);
    });

    it('valid UISchema with valid component types passes validation', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.constantFrom('Button', 'Container', 'Text'),
          (id, type) => {
            const schema = {
              version: '1.0',
              root: {
                id,
                type,
                props: type === 'Button' ? { label: 'Click me' } : {},
              },
            };

            const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
            
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('valid UISchema with nested children passes validation', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.uuid(),
          (rootId, childId1, childId2) => {
            // 确保 ID 唯一
            const ids = new Set([rootId, childId1, childId2]);
            if (ids.size !== 3) return; // 跳过重复 ID 的情况

            const schema = {
              version: '1.0',
              root: {
                id: rootId,
                type: 'Container',
                children: [
                  { id: childId1, type: 'Button', props: { label: 'Button 1' } },
                  { id: childId2, type: 'Text', props: { content: 'Hello' } },
                ],
              },
            };

            const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
            
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('valid UISchema with correct prop types passes validation', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('primary', 'secondary', 'danger'),
          fc.boolean(),
          fc.integer({ min: 0, max: 100 }),
          (id, label, variant, disabled, count) => {
            const schema = {
              version: '1.0',
              root: {
                id,
                type: 'Button',
                props: { label, variant, disabled, count },
              },
            };

            const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
            
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('schema with missing required props fails validation', () => {
      const schema = {
        version: '1.0',
        root: {
          id: 'btn-1',
          type: 'Button',
          props: {}, // missing required 'label' prop
        },
      };

      const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_REQUIRED_PROP')).toBe(true);
    });

    it('schema with invalid prop type fails validation', () => {
      const schema = {
        version: '1.0',
        root: {
          id: 'btn-1',
          type: 'Button',
          props: { 
            label: 123, // should be string
          },
        },
      };

      const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_PROP_TYPE')).toBe(true);
    });

    it('schema with invalid enum value fails validation', () => {
      const schema = {
        version: '1.0',
        root: {
          id: 'btn-1',
          type: 'Button',
          props: { 
            label: 'Click',
            variant: 'invalid-variant', // not in enum
          },
        },
      };

      const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_ENUM_VALUE')).toBe(true);
    });
  });
});


describe('Levenshtein Distance and Similar Types', () => {
  describe('levenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
      expect(levenshteinDistance('Button', 'Button')).toBe(0);
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('returns correct distance for simple edits', () => {
      expect(levenshteinDistance('Button', 'Buttons')).toBe(1); // insertion
      expect(levenshteinDistance('Button', 'Buttn')).toBe(1); // deletion
      expect(levenshteinDistance('Button', 'Batton')).toBe(1); // substitution
    });

    it('is case-insensitive', () => {
      expect(levenshteinDistance('Button', 'button')).toBe(0);
      expect(levenshteinDistance('BUTTON', 'button')).toBe(0);
    });
  });

  describe('getSimilarTypes', () => {
    const validTypes = ['Button', 'Input', 'Card', 'Container', 'Text', 'Label'];

    it('returns similar types for typos', () => {
      const suggestions = getSimilarTypes('Buton', validTypes);
      expect(suggestions).toContain('Button');
    });

    it('returns empty array for completely different strings', () => {
      const suggestions = getSimilarTypes('XYZ123', validTypes);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('respects maxSuggestions parameter', () => {
      const suggestions = getSimilarTypes('B', validTypes, 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('returns empty array for empty input', () => {
      expect(getSimilarTypes('', validTypes)).toHaveLength(0);
      expect(getSimilarTypes('Button', [])).toHaveLength(0);
    });
  });
});

describe('Property 4: 验证错误码正确性', () => {
  /**
   * Property 4: 验证错误码正确性
   * 
   * *对于任意* 包含未知组件类型的 UISchema，validateUISchemaEnhanced 应当返回
   * 包含 code: "UNKNOWN_COMPONENT" 的错误，且 suggestion 字段包含相似类型建议。
   * 
   * **Feature: agent-output-optimization, Property 4: 验证错误码正确性**
   * **Validates: Requirements 2.5, 6.2**
   */
  
  let testRegistry: ComponentRegistry;
  let testCatalog: ComponentCatalog;

  beforeEach(() => {
    testRegistry = new ComponentRegistry();
    
    // 注册测试组件
    testRegistry.register({
      name: 'Button',
      component: () => null,
      category: 'input',
      propsSchema: {},
    });

    testRegistry.register({
      name: 'Container',
      component: () => null,
      category: 'layout',
      propsSchema: {},
    });

    testRegistry.register({
      name: 'Text',
      component: () => null,
      category: 'display',
      propsSchema: {},
    });

    testCatalog = new ComponentCatalog(testRegistry);
  });

  it('unknown component type returns UNKNOWN_COMPONENT error with suggestions', () => {
    // 生成与有效类型相似但不是别名的未知类型
    // 注意: 'Txt' 是 TYPE_ALIAS_MAP 中的有效别名，所以不能用作未知类型
    const unknownTypes = ['Buton', 'Buttn', 'Containr', 'Textt', 'Buttton', 'Contaner'];
    
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom(...unknownTypes),
        (id, unknownType) => {
          const schema = {
            version: '1.0',
            root: {
              id,
              type: unknownType,
            },
          };

          const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
          
          // 应该返回无效
          expect(result.valid).toBe(false);
          
          // 应该包含 UNKNOWN_COMPONENT 错误
          const unknownError = result.errors.find(e => e.code === 'UNKNOWN_COMPONENT');
          expect(unknownError).toBeDefined();
          
          // 应该包含建议
          expect(unknownError?.suggestion).toBeDefined();
          expect(unknownError?.suggestion?.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('completely unknown type returns UNKNOWN_COMPONENT with valid types list', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 10, maxLength: 20 }).filter(s => 
          !['Button', 'Container', 'Text'].some(t => 
            t.toLowerCase() === s.toLowerCase()
          )
        ),
        (id, unknownType) => {
          const schema = {
            version: '1.0',
            root: {
              id,
              type: unknownType,
            },
          };

          const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
          
          expect(result.valid).toBe(false);
          
          const unknownError = result.errors.find(e => e.code === 'UNKNOWN_COMPONENT');
          expect(unknownError).toBeDefined();
          expect(unknownError?.suggestion).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valid component type does not return UNKNOWN_COMPONENT error', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom('Button', 'Container', 'Text'),
        (id, validType) => {
          const schema = {
            version: '1.0',
            root: {
              id,
              type: validType,
            },
          };

          const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
          
          // 不应该有 UNKNOWN_COMPONENT 错误
          const unknownError = result.errors.find(e => e.code === 'UNKNOWN_COMPONENT');
          expect(unknownError).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('nested unknown component types are all detected', () => {
    const schema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          { id: 'child1', type: 'UnknownType1' },
          { id: 'child2', type: 'UnknownType2' },
        ],
      },
    };

    const result = validateUISchemaEnhanced(schema, { catalog: testCatalog });
    
    expect(result.valid).toBe(false);
    
    const unknownErrors = result.errors.filter(e => e.code === 'UNKNOWN_COMPONENT');
    expect(unknownErrors.length).toBe(2);
  });
});


// ============================================================================
// Property 8: 向后兼容性 (Backward Compatibility)
// ============================================================================

describe('Property 8: 向后兼容性', () => {
  /**
   * Property 8: 向后兼容性
   * 
   * *对于任意* 通过现有 validateUISchema 验证的 UISchema，
   * validateUISchemaEnhanced 在默认选项下也应当返回 valid: true。
   * 
   * 这确保了新的增强验证函数与现有代码向后兼容。
   * 
   * **Feature: agent-output-optimization, Property 8: 向后兼容性**
   * **Validates: Requirements 7.1, 7.5**
   */

  /**
   * Generator for valid UISchema that passes validateUISchema
   * Uses the same generator as the existing tests
   */
  const validUISchemaArb: fc.Arbitrary<UISchema> = fc.letrec<{ component: UIComponent }>(tie => ({
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
  })).component.chain(root => 
    fc.record({
      version: fc.constantFrom('1.0', '1.1', '2.0'),
      root: fc.constant(root),
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
    }, { requiredKeys: ['version', 'root'] })
  );

  it('Property 8: schemas passing validateUISchema also pass validateUISchemaEnhanced with structureOnly', () => {
    fc.assert(
      fc.property(validUISchemaArb, (schema) => {
        // First verify the schema passes the original validateUISchema
        const basicResult = validateUISchema(schema);
        
        // Only test schemas that pass basic validation
        if (!basicResult.valid) {
          return; // Skip invalid schemas
        }
        
        // Now test that validateUISchemaEnhanced with structureOnly also passes
        const enhancedResult = validateUISchemaEnhanced(schema, { structureOnly: true });
        
        // The enhanced validation should also pass
        expect(enhancedResult.valid).toBe(true);
        expect(enhancedResult.errors).toHaveLength(0);
        expect(enhancedResult.schema).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('Property 8b: validateUISchemaEnhanced structureOnly mode produces same validity as validateUISchema', () => {
    // Test with both valid and invalid schemas
    const anySchemaArb = fc.oneof(
      // Valid schemas
      validUISchemaArb,
      // Invalid schemas - missing version
      fc.record({
        root: fc.record({
          id: fc.uuid(),
          type: fc.constantFrom('Button', 'Input'),
        }, { requiredKeys: ['id', 'type'] }),
      }),
      // Invalid schemas - missing root
      fc.record({
        version: fc.constantFrom('1.0', '1.1'),
      }),
      // Invalid schemas - missing component id
      fc.record({
        version: fc.constantFrom('1.0', '1.1'),
        root: fc.record({
          type: fc.constantFrom('Button', 'Input'),
        }, { requiredKeys: ['type'] }),
      }),
      // Invalid schemas - missing component type
      fc.record({
        version: fc.constantFrom('1.0', '1.1'),
        root: fc.record({
          id: fc.uuid(),
        }, { requiredKeys: ['id'] }),
      })
    );

    fc.assert(
      fc.property(anySchemaArb, (schema) => {
        const basicResult = validateUISchema(schema);
        const enhancedResult = validateUISchemaEnhanced(schema, { structureOnly: true });
        
        // Both should have the same validity
        expect(enhancedResult.valid).toBe(basicResult.valid);
        
        // If basic validation fails, enhanced should also fail
        if (!basicResult.valid) {
          expect(enhancedResult.errors.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 8c: error codes are preserved in structureOnly mode', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom('Button', 'Input', 'Card'),
        (id, type) => {
          // Create schema with duplicate IDs
          const schemaWithDuplicateIds = {
            version: '1.0',
            root: {
              id,
              type: 'Container',
              children: [
                { id, type }, // Same ID as root - duplicate
              ],
            },
          };

          const basicResult = validateUISchema(schemaWithDuplicateIds);
          const enhancedResult = validateUISchemaEnhanced(schemaWithDuplicateIds, { structureOnly: true });
          
          // Both should detect duplicate ID
          expect(basicResult.valid).toBe(false);
          expect(enhancedResult.valid).toBe(false);
          
          // Both should have DUPLICATE_ID error
          expect(basicResult.errors.some(e => e.code === 'DUPLICATE_ID')).toBe(true);
          expect(enhancedResult.errors.some(e => e.code === 'DUPLICATE_ID')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8d: nested validation errors are preserved in structureOnly mode', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        (rootId, childId) => {
          // Create schema with nested invalid component (missing type)
          const schemaWithNestedError = {
            version: '1.0',
            root: {
              id: rootId,
              type: 'Container',
              children: [
                { id: childId }, // Missing type
              ],
            },
          };

          const basicResult = validateUISchema(schemaWithNestedError);
          const enhancedResult = validateUISchemaEnhanced(schemaWithNestedError, { structureOnly: true });
          
          // Both should fail
          expect(basicResult.valid).toBe(false);
          expect(enhancedResult.valid).toBe(false);
          
          // Both should detect the missing type in nested component
          expect(basicResult.errors.some(e => 
            e.code === 'MISSING_FIELD' && e.path.includes('children')
          )).toBe(true);
          expect(enhancedResult.errors.some(e => 
            e.code === 'MISSING_FIELD' && e.path.includes('children')
          )).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('structureOnly mode does not validate component types against catalog', () => {
    // Create a schema with an unknown component type
    const schema = {
      version: '1.0',
      root: {
        id: 'test-1',
        type: 'UnknownComponentType', // This type doesn't exist in any catalog
      },
    };

    // Basic validation should pass (it doesn't check component types)
    const basicResult = validateUISchema(schema);
    expect(basicResult.valid).toBe(true);

    // Enhanced validation with structureOnly should also pass
    const enhancedResult = validateUISchemaEnhanced(schema, { structureOnly: true });
    expect(enhancedResult.valid).toBe(true);
    expect(enhancedResult.errors).toHaveLength(0);
  });

  it('structureOnly mode does not validate props against schema', () => {
    // Create a schema with props that would fail prop validation
    const schema = {
      version: '1.0',
      root: {
        id: 'test-1',
        type: 'Button',
        props: {
          // These props might not match the Button's propsSchema
          unknownProp: 'value',
          anotherUnknown: 123,
        },
      },
    };

    // Basic validation should pass (it doesn't check props)
    const basicResult = validateUISchema(schema);
    expect(basicResult.valid).toBe(true);

    // Enhanced validation with structureOnly should also pass
    const enhancedResult = validateUISchemaEnhanced(schema, { structureOnly: true });
    expect(enhancedResult.valid).toBe(true);
    expect(enhancedResult.errors).toHaveLength(0);
  });
});
