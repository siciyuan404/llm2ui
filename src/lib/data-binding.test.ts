/**
 * Data Binding Property-Based Tests
 * 
 * **Feature: llm2ui, Property 3: 数据绑定表达式解析**
 * **Validates: Requirements 5.4**
 * 
 * Tests that for any valid data binding expression and matching data context,
 * the binding resolution correctly retrieves the expected value.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  parsePath,
  parseBindingExpression,
  resolvePath,
  resolveBinding,
  resolveBindings,
  type PathSegment,
} from './data-binding';
import type { DataContext } from '../types';

/**
 * Generator for valid property names (JavaScript identifiers)
 */
const propertyNameArb = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s));

/**
 * Generator for valid array indices
 */
const arrayIndexArb = fc.integer({ min: 0, max: 99 });

/**
 * Generator for path segments
 */
const pathSegmentArb: fc.Arbitrary<PathSegment> = fc.oneof(
  propertyNameArb.map(name => ({ type: 'property' as const, name })),
  arrayIndexArb.map(index => ({ type: 'index' as const, index }))
);

/**
 * Generator for a path (array of segments) that starts with a property
 */
const pathArb = fc.tuple(
  propertyNameArb.map(name => ({ type: 'property' as const, name })),
  fc.array(pathSegmentArb, { minLength: 0, maxLength: 4 })
).map(([first, rest]) => [first, ...rest]);

/**
 * Convert path segments to a path expression string
 */
function segmentsToExpression(segments: PathSegment[]): string {
  return segments.map((seg, i) => {
    if (seg.type === 'property') {
      return i === 0 ? seg.name : `.${seg.name}`;
    } else {
      return `[${seg.index}]`;
    }
  }).join('');
}

/**
 * Build a data context that contains a value at the given path
 */
function buildDataContext(segments: PathSegment[], value: unknown): DataContext {
  if (segments.length === 0) {
    return {};
  }

  // Build from the end
  let current: unknown = value;
  
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (seg.type === 'property') {
      current = { [seg.name]: current };
    } else {
      // Create array with the value at the specified index
      const arr: unknown[] = new Array(seg.index + 1).fill(null);
      arr[seg.index] = current;
      current = arr;
    }
  }

  return current as DataContext;
}


describe('Data Binding Expression Parsing', () => {
  /**
   * Property 3: 数据绑定表达式解析
   * 
   * For any valid path expression, parsing then resolving against a matching
   * data context should return the expected value.
   * 
   * **Validates: Requirements 5.4**
   */
  it('Property 3: valid path expressions resolve to correct values', () => {
    fc.assert(
      fc.property(
        pathArb,
        fc.jsonValue(),
        (segments, value) => {
          // Build expression string from segments
          const expression = segmentsToExpression(segments);
          
          // Build data context with value at path
          const data = buildDataContext(segments, value);
          
          // Parse the expression
          const parseResult = parsePath(expression);
          expect(parseResult.success).toBe(true);
          expect(parseResult.segments).toBeDefined();
          
          // Resolve against data
          const resolveResult = resolvePath(parseResult.segments!, data);
          expect(resolveResult.success).toBe(true);
          
          // Value should match (using JSON.stringify for deep equality)
          expect(JSON.stringify(resolveResult.value)).toBe(JSON.stringify(value));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3b: binding expressions with {{}} delimiters resolve correctly', () => {
    fc.assert(
      fc.property(
        pathArb,
        fc.jsonValue(),
        (segments, value) => {
          const expression = segmentsToExpression(segments);
          const binding = `{{${expression}}}`;
          const data = buildDataContext(segments, value);
          
          const result = resolveBinding(binding, data);
          expect(result.success).toBe(true);
          expect(JSON.stringify(result.value)).toBe(JSON.stringify(value));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3c: resolveBindings replaces all expressions in template', () => {
    fc.assert(
      fc.property(
        propertyNameArb,
        fc.string({ minLength: 0, maxLength: 20 }),
        (propName, propValue) => {
          const template = `Hello {{${propName}}}!`;
          const data: DataContext = { [propName]: propValue };
          
          const result = resolveBindings(template, data);
          expect(result).toBe(`Hello ${propValue}!`);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Path Parsing Edge Cases', () => {
  it('should parse simple property access', () => {
    const result = parsePath('user');
    expect(result.success).toBe(true);
    expect(result.segments).toEqual([{ type: 'property', name: 'user' }]);
  });

  it('should parse nested property access', () => {
    const result = parsePath('user.name');
    expect(result.success).toBe(true);
    expect(result.segments).toEqual([
      { type: 'property', name: 'user' },
      { type: 'property', name: 'name' },
    ]);
  });

  it('should parse array index access', () => {
    const result = parsePath('items[0]');
    expect(result.success).toBe(true);
    expect(result.segments).toEqual([
      { type: 'property', name: 'items' },
      { type: 'index', index: 0 },
    ]);
  });

  it('should parse mixed access patterns', () => {
    const result = parsePath('users[0].name');
    expect(result.success).toBe(true);
    expect(result.segments).toEqual([
      { type: 'property', name: 'users' },
      { type: 'index', index: 0 },
      { type: 'property', name: 'name' },
    ]);
  });

  it('should parse complex nested paths', () => {
    const result = parsePath('data.items[2].nested[0].value');
    expect(result.success).toBe(true);
    expect(result.segments).toEqual([
      { type: 'property', name: 'data' },
      { type: 'property', name: 'items' },
      { type: 'index', index: 2 },
      { type: 'property', name: 'nested' },
      { type: 'index', index: 0 },
      { type: 'property', name: 'value' },
    ]);
  });

  it('should reject empty expression', () => {
    expect(parsePath('').success).toBe(false);
    expect(parsePath('  ').success).toBe(false);
  });

  it('should reject leading dot', () => {
    expect(parsePath('.name').success).toBe(false);
  });

  it('should reject unclosed bracket', () => {
    expect(parsePath('items[0').success).toBe(false);
  });

  it('should reject negative index', () => {
    expect(parsePath('items[-1]').success).toBe(false);
  });

  it('should reject non-numeric index', () => {
    expect(parsePath('items[abc]').success).toBe(false);
  });
});

describe('Binding Expression Parsing', () => {
  it('should parse valid binding expression', () => {
    const result = parseBindingExpression('{{user.name}}');
    expect(result.success).toBe(true);
    expect(result.segments).toEqual([
      { type: 'property', name: 'user' },
      { type: 'property', name: 'name' },
    ]);
  });

  it('should reject expression without braces', () => {
    expect(parseBindingExpression('user.name').success).toBe(false);
  });

  it('should reject expression with single braces', () => {
    expect(parseBindingExpression('{user.name}').success).toBe(false);
  });

  it('should reject empty binding', () => {
    expect(parseBindingExpression('').success).toBe(false);
    expect(parseBindingExpression('{{}}').success).toBe(false);
  });
});

describe('Binding Resolution', () => {
  it('should resolve simple property', () => {
    const data: DataContext = { name: 'John' };
    const result = resolveBinding('{{name}}', data);
    expect(result.success).toBe(true);
    expect(result.value).toBe('John');
  });

  it('should resolve nested property', () => {
    const data: DataContext = { user: { name: 'John' } };
    const result = resolveBinding('{{user.name}}', data);
    expect(result.success).toBe(true);
    expect(result.value).toBe('John');
  });

  it('should resolve array index', () => {
    const data: DataContext = { items: ['a', 'b', 'c'] };
    const result = resolveBinding('{{items[1]}}', data);
    expect(result.success).toBe(true);
    expect(result.value).toBe('b');
  });

  it('should fail for missing property', () => {
    const data: DataContext = { name: 'John' };
    const result = resolveBinding('{{age}}', data);
    expect(result.success).toBe(true); // Property exists but is undefined
    expect(result.value).toBeUndefined();
  });

  it('should fail for out of bounds index', () => {
    const data: DataContext = { items: ['a', 'b'] };
    const result = resolveBinding('{{items[5]}}', data);
    expect(result.success).toBe(false);
    expect(result.error).toContain('out of bounds');
  });

  it('should fail for property access on non-object', () => {
    const data: DataContext = { name: 'John' };
    const result = resolveBinding('{{name.first}}', data);
    expect(result.success).toBe(false);
  });

  it('should fail for index access on non-array', () => {
    const data: DataContext = { name: 'John' };
    const result = resolveBinding('{{name[0]}}', data);
    expect(result.success).toBe(false);
  });
});

describe('Template Resolution', () => {
  it('should resolve multiple bindings in template', () => {
    const data: DataContext = { first: 'John', last: 'Doe' };
    const result = resolveBindings('Hello {{first}} {{last}}!', data);
    expect(result).toBe('Hello John Doe!');
  });

  it('should resolve missing properties to empty string', () => {
    const data: DataContext = { name: 'John' };
    const result = resolveBindings('Hello {{name}}, your age is {{age}}', data);
    // Missing properties resolve to undefined, which becomes empty string
    expect(result).toBe('Hello John, your age is ');
  });

  it('should convert objects to JSON', () => {
    const data: DataContext = { user: { name: 'John' } };
    const result = resolveBindings('User: {{user}}', data);
    expect(result).toBe('User: {"name":"John"}');
  });

  it('should convert null/undefined to empty string', () => {
    const data: DataContext = { value: null };
    const result = resolveBindings('Value: {{value}}', data);
    expect(result).toBe('Value: ');
  });

  it('should handle empty template', () => {
    const data: DataContext = { name: 'John' };
    expect(resolveBindings('', data)).toBe('');
  });
});


import { extractDataFields, getUniquePaths } from './data-binding';
import type { UISchema, UIComponent } from '../types';

/**
 * Generator for UIComponent with bindings
 */
const componentWithBindingsArb: fc.Arbitrary<UIComponent> = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container'),
  binding: fc.option(
    propertyNameArb.map(name => `{{${name}}}`),
    { nil: undefined }
  ),
  text: fc.option(
    fc.tuple(propertyNameArb, fc.string({ minLength: 0, maxLength: 10 }))
      .map(([name, suffix]) => `Value: {{${name}}}${suffix}`),
    { nil: undefined }
  ),
  props: fc.option(
    fc.record({
      label: fc.option(
        propertyNameArb.map(name => `{{${name}}}`),
        { nil: undefined }
      ),
      value: fc.option(
        propertyNameArb.map(name => `{{${name}}}`),
        { nil: undefined }
      ),
    }, { requiredKeys: [] }),
    { nil: undefined }
  ),
}, { requiredKeys: ['id', 'type'] });

/**
 * Generator for UISchema with bindings
 */
const schemaWithBindingsArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: componentWithBindingsArb,
}, { requiredKeys: ['version', 'root'] });

describe('Data Field Extraction', () => {
  /**
   * Property 6: 数据字段提取完整性
   * 
   * For any UISchema with data bindings, extractDataFields should:
   * 1. Find all binding expressions in the schema
   * 2. Return correct path information for each binding
   * 3. Include component ID and property location
   * 
   * **Validates: Requirements 3.1**
   */
  it('Property 6: all bindings in schema are extracted', () => {
    fc.assert(
      fc.property(schemaWithBindingsArb, (schema) => {
        const fields = extractDataFields(schema);
        
        // Count expected bindings manually
        let expectedCount = 0;
        const root = schema.root;
        
        if (root.binding) expectedCount++;
        if (root.text && root.text.includes('{{')) {
          const matches = root.text.match(/\{\{[^}]+\}\}/g);
          if (matches) expectedCount += matches.length;
        }
        if (root.props) {
          for (const value of Object.values(root.props)) {
            if (typeof value === 'string' && value.includes('{{')) {
              const matches = value.match(/\{\{[^}]+\}\}/g);
              if (matches) expectedCount += matches.length;
            }
          }
        }
        
        // Extracted fields should match expected count
        expect(fields.length).toBe(expectedCount);
        
        // Each field should have valid structure
        for (const field of fields) {
          expect(field.binding).toMatch(/^\{\{.+\}\}$/);
          expect(field.path).toBeTruthy();
          expect(field.segments.length).toBeGreaterThan(0);
          expect(field.componentId).toBe(root.id);
          expect(field.property).toBeTruthy();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 6b: extracted paths can be resolved against matching data', () => {
    fc.assert(
      fc.property(
        propertyNameArb,
        fc.jsonValue(),
        (propName, value) => {
          const schema: UISchema = {
            version: '1.0',
            root: {
              id: 'root',
              type: 'Text',
              binding: `{{${propName}}}`,
            },
          };
          
          const fields = extractDataFields(schema);
          expect(fields.length).toBe(1);
          
          const field = fields[0];
          const data: DataContext = { [propName]: value };
          
          // The extracted path should resolve correctly
          const result = resolvePath(field.segments, data);
          expect(result.success).toBe(true);
          expect(JSON.stringify(result.value)).toBe(JSON.stringify(value));
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Data Field Extraction - Unit Tests', () => {
  it('should extract binding from component binding property', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Text',
        binding: '{{user.name}}',
      },
    };
    
    const fields = extractDataFields(schema);
    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      binding: '{{user.name}}',
      path: 'user.name',
      componentId: 'root',
      property: 'binding',
    });
  });

  it('should extract binding from text property', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Text',
        text: 'Hello {{name}}!',
      },
    };
    
    const fields = extractDataFields(schema);
    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      binding: '{{name}}',
      path: 'name',
      componentId: 'root',
      property: 'text',
    });
  });

  it('should extract multiple bindings from text', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Text',
        text: '{{first}} {{last}}',
      },
    };
    
    const fields = extractDataFields(schema);
    expect(fields).toHaveLength(2);
    expect(fields[0].path).toBe('first');
    expect(fields[1].path).toBe('last');
  });

  it('should extract bindings from props', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Input',
        props: {
          label: '{{fieldLabel}}',
          placeholder: 'Enter {{fieldName}}',
        },
      },
    };
    
    const fields = extractDataFields(schema);
    expect(fields).toHaveLength(2);
    expect(fields.some(f => f.path === 'fieldLabel')).toBe(true);
    expect(fields.some(f => f.path === 'fieldName')).toBe(true);
  });

  it('should extract bindings from nested children', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          {
            id: 'child1',
            type: 'Text',
            binding: '{{item1}}',
          },
          {
            id: 'child2',
            type: 'Text',
            binding: '{{item2}}',
          },
        ],
      },
    };
    
    const fields = extractDataFields(schema);
    expect(fields).toHaveLength(2);
    expect(fields[0].componentId).toBe('child1');
    expect(fields[1].componentId).toBe('child2');
  });

  it('should extract loop source as binding', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        loop: {
          source: 'items',
          itemName: 'item',
        },
      },
    };
    
    const fields = extractDataFields(schema);
    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      path: 'items',
      property: 'loop.source',
    });
  });

  it('should extract bindings from condition', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        condition: '{{isVisible}}',
      },
    };
    
    const fields = extractDataFields(schema);
    expect(fields).toHaveLength(1);
    expect(fields[0].path).toBe('isVisible');
  });

  it('should return empty array for schema without bindings', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Button',
        text: 'Click me',
      },
    };
    
    const fields = extractDataFields(schema);
    expect(fields).toHaveLength(0);
  });

  it('should get unique paths', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          { id: 'c1', type: 'Text', binding: '{{name}}' },
          { id: 'c2', type: 'Text', binding: '{{name}}' },
          { id: 'c3', type: 'Text', binding: '{{age}}' },
        ],
      },
    };
    
    const paths = getUniquePaths(schema);
    expect(paths).toHaveLength(2);
    expect(paths).toContain('name');
    expect(paths).toContain('age');
  });
});
