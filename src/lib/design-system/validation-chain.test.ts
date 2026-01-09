/**
 * @file validation-chain.test.ts
 * @description 验证链模块属性测试
 * @module lib/design-system/validation-chain.test
 * @requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  executeValidationChain,
  formatErrorsForLLM,
  getValidationLayerOrder,
  type ValidationLayer,
  type ChainValidationError,
} from './validation-chain';
import { ComponentRegistry } from '../core/component-registry';
import { ComponentCatalog } from '../core/component-catalog';
import { getDefaultDesignTokens } from './design-tokens';

// ============================================================================
// Test Setup
// ============================================================================

let testRegistry: ComponentRegistry;
let testCatalog: ComponentCatalog;

beforeEach(() => {
  testRegistry = new ComponentRegistry();
  
  testRegistry.register({
    name: 'Button',
    component: () => null,
    category: 'input',
    description: 'A button component',
    propsSchema: {
      label: { type: 'string', required: true, description: 'Button label' },
      variant: { type: 'string', required: false, enum: ['primary', 'secondary', 'danger'] },
      disabled: { type: 'boolean', required: false },
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

// ============================================================================
// Arbitrary Generators
// ============================================================================

const validUISchemaJsonArb = fc.record({
  version: fc.constantFrom('1.0', '1.1', '2.0'),
  root: fc.record({
    id: fc.uuid(),
    type: fc.constantFrom('Button', 'Container', 'Text'),
    props: fc.option(
      fc.record({
        label: fc.string({ minLength: 1, maxLength: 20 }),
      }),
      { nil: undefined }
    ),
  }),
}).map(schema => JSON.stringify(schema, null, 2));

const invalidJsonArb = fc.oneof(
  fc.constant('{"key": "value"'),
  fc.constant('[1, 2, 3'),
  fc.constant('{"key": "value",}'),
  fc.constant("{'key': 'value'}"),
  fc.constant('{key: "value"}'),
);

const invalidStructureJsonArb = fc.oneof(
  fc.record({
    root: fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('Button', 'Container'),
    }),
  }).map(s => JSON.stringify(s)),
  fc.record({
    version: fc.constantFrom('1.0', '1.1'),
  }).map(s => JSON.stringify(s)),
);

const unknownComponentJsonArb = fc.record({
  version: fc.constantFrom('1.0', '1.1'),
  root: fc.record({
    id: fc.uuid(),
    type: fc.constantFrom('UnknownType', 'InvalidComponent', 'FakeButton'),
  }),
}).map(s => JSON.stringify(s));


// ============================================================================
// Property 2: 验证链顺序执行
// ============================================================================

describe('Property 2: 验证链顺序执行', () => {
  it('should return timing for all validation layers in correct order', () => {
    fc.assert(
      fc.property(validUISchemaJsonArb, (jsonInput) => {
        const result = executeValidationChain(jsonInput, { catalog: testCatalog });
        
        const expectedOrder = getValidationLayerOrder();
        for (const layer of expectedOrder) {
          expect(result.timing[layer]).toBeDefined();
          expect(typeof result.timing[layer]).toBe('number');
          expect(result.timing[layer]).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should stop at json-syntax layer when JSON is invalid', () => {
    fc.assert(
      fc.property(invalidJsonArb, (invalidJson) => {
        const result = executeValidationChain(invalidJson, { catalog: testCatalog });
        
        expect(result.timing['json-syntax']).toBeGreaterThan(0);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].layer).toBe('json-syntax');
        expect(result.valid).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should proceed to schema-structure layer when JSON is valid', () => {
    fc.assert(
      fc.property(invalidStructureJsonArb, (jsonInput) => {
        const result = executeValidationChain(jsonInput, { catalog: testCatalog });
        
        expect(result.timing['json-syntax']).toBeGreaterThan(0);
        expect(result.timing['schema-structure']).toBeGreaterThan(0);
        
        const structureErrors = result.errors.filter(e => e.layer === 'schema-structure');
        expect(structureErrors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should proceed to component-existence layer when structure is valid', () => {
    fc.assert(
      fc.property(unknownComponentJsonArb, (jsonInput) => {
        const result = executeValidationChain(jsonInput, { catalog: testCatalog });
        
        expect(result.timing['json-syntax']).toBeGreaterThan(0);
        expect(result.timing['schema-structure']).toBeGreaterThanOrEqual(0);
        expect(result.timing['component-existence']).toBeGreaterThan(0);
        
        const componentErrors = result.errors.filter(e => e.layer === 'component-existence');
        expect(componentErrors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should execute all layers for valid input', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom('Container', 'Text'),
        (id, type) => {
          const schema = {
            version: '1.0',
            root: { id, type },
          };
          const jsonInput = JSON.stringify(schema);
          
          const result = executeValidationChain(jsonInput, { catalog: testCatalog });
          
          const layers = getValidationLayerOrder();
          for (const layer of layers) {
            expect(result.timing[layer]).toBeGreaterThanOrEqual(0);
          }
          
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain layer order in getValidationLayerOrder', () => {
    const order = getValidationLayerOrder();
    
    expect(order).toEqual([
      'json-syntax',
      'schema-structure',
      'component-existence',
      'props-validation',
      'style-compliance',
      'token-usage-compliance',
      'icon-compliance',
    ]);
  });
});

// ============================================================================
// Property 3: 验证错误路径准确性
// ============================================================================

describe('Property 3: 验证错误路径准确性', () => {
  function resolvePath(obj: unknown, path: string): unknown {
    if (!path || path === '') return obj;
    
    const parts = path.split(/\.|\[|\]/).filter(p => p !== '');
    let current: unknown = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      
      const index = parseInt(part, 10);
      if (!isNaN(index) && Array.isArray(current)) {
        current = current[index];
      } else {
        current = (current as Record<string, unknown>)[part];
      }
    }
    
    return current;
  }

  it('should return valid paths for schema structure errors', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom('Button', 'Container'),
        (id, type) => {
          const schema = { root: { id, type } };
          const jsonInput = JSON.stringify(schema);
          
          const result = executeValidationChain(jsonInput, { catalog: testCatalog });
          
          const structureErrors = result.errors.filter(e => e.layer === 'schema-structure');
          expect(structureErrors.length).toBeGreaterThan(0);
          
          for (const error of structureErrors) {
            expect(typeof error.path).toBe('string');
            
            if (error.message.includes('version')) {
              expect(error.path).toBe('version');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return valid paths for component existence errors', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 5, maxLength: 15 }).filter(s => 
          !['Button', 'Container', 'Text'].includes(s)
        ),
        (id, unknownType) => {
          const schema = {
            version: '1.0',
            root: { id, type: unknownType },
          };
          const jsonInput = JSON.stringify(schema);
          
          const result = executeValidationChain(jsonInput, { catalog: testCatalog });
          
          const componentError = result.errors.find(e => 
            e.layer === 'component-existence'
          );
          expect(componentError).toBeDefined();
          expect(componentError!.path).toBe('root.type');
          
          const parsed = JSON.parse(jsonInput);
          const resolved = resolvePath(parsed, 'root.type');
          expect(resolved).toBe(unknownType);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 4: 验证错误建议有效性
// ============================================================================

describe('Property 4: 验证错误建议有效性', () => {
  it('should suggest valid component names for unknown components', () => {
    const typos = [
      { typo: 'Buton', expected: 'Button' },
      { typo: 'Buttn', expected: 'Button' },
      { typo: 'Containr', expected: 'Container' },
      { typo: 'Textt', expected: 'Text' },
    ];

    for (const { typo, expected } of typos) {
      const schema = {
        version: '1.0',
        root: { id: 'test-id', type: typo },
      };
      const jsonInput = JSON.stringify(schema);
      
      const result = executeValidationChain(jsonInput, { catalog: testCatalog });
      
      const componentError = result.errors.find(e => 
        e.layer === 'component-existence'
      );
      expect(componentError).toBeDefined();
      expect(componentError!.suggestion).toBeDefined();
      expect(componentError!.suggestion).toContain(expected);
    }
  });

  it('should suggest components sorted by similarity', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom('Buton', 'Buttn', 'Butto'),
        (id, typo) => {
          const schema = {
            version: '1.0',
            root: { id, type: typo },
          };
          const jsonInput = JSON.stringify(schema);
          
          const result = executeValidationChain(jsonInput, { catalog: testCatalog });
          
          const componentError = result.errors.find(e => 
            e.layer === 'component-existence'
          );
          expect(componentError).toBeDefined();
          expect(componentError!.suggestion).toBeDefined();
          
          const suggestion = componentError!.suggestion!;
          if (suggestion.includes('Did you mean:')) {
            const match = suggestion.match(/Did you mean: ([^,]+)/);
            if (match) {
              expect(match[1].trim()).toBe('Button');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// formatErrorsForLLM Tests
// ============================================================================

describe('formatErrorsForLLM', () => {
  it('should format errors in LLM-readable format', () => {
    const errors: ChainValidationError[] = [
      {
        layer: 'json-syntax',
        severity: 'error',
        path: '',
        message: 'Unexpected token',
        line: 5,
        column: 10,
        suggestion: 'Check for missing brackets',
      },
      {
        layer: 'component-existence',
        severity: 'error',
        path: 'root.type',
        message: 'Unknown component "Btn"',
        suggestion: 'Did you mean: Button?',
      },
    ];

    const formatted = formatErrorsForLLM(errors);

    expect(formatted).toContain('## Previous Attempt Errors (MUST FIX)');
    expect(formatted).toContain('[JSON Syntax]');
    expect(formatted).toContain('Line 5:10');
    expect(formatted).toContain('[Component]');
    expect(formatted).toContain('Unknown component "Btn"');
    expect(formatted).toContain('Did you mean: Button?');
  });

  it('should return empty string for no errors', () => {
    const formatted = formatErrorsForLLM([]);
    expect(formatted).toBe('');
  });

  it('should include all error layers', () => {
    const layers: ValidationLayer[] = [
      'json-syntax',
      'schema-structure',
      'component-existence',
      'props-validation',
      'style-compliance',
    ];

    const errors: ChainValidationError[] = layers.map((layer, i) => ({
      layer,
      severity: 'error' as const,
      path: `path${i}`,
      message: `Error in ${layer}`,
    }));

    const formatted = formatErrorsForLLM(errors);

    expect(formatted).toContain('[JSON Syntax]');
    expect(formatted).toContain('[Schema Structure]');
    expect(formatted).toContain('[Component]');
    expect(formatted).toContain('[Props]');
    expect(formatted).toContain('[Style]');
  });
});
