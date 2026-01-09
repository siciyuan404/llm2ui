/**
 * Schema Fixer Property-Based Tests
 * 
 * **Feature: agent-output-optimization**
 * 
 * Property 5: Schema 修复往返一致性
 * 
 * @module schema-fixer.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import { ComponentRegistry } from './core/component-registry';
import { ComponentCatalog, TYPE_ALIAS_MAP } from './core/component-catalog';
import { fixUISchema, generateComponentId } from './core/schema-fixer';
import { validateUISchemaEnhanced } from './core/validation';

/**
 * Create a mock React component for testing
 */
const createMockComponent = (name: string): React.ComponentType<Record<string, unknown>> => {
  const MockComponent: React.FC<Record<string, unknown>> = () => null;
  MockComponent.displayName = name;
  return MockComponent;
};

/**
 * Generator for valid component IDs
 */
const componentIdArb = fc.string({ minLength: 1, maxLength: 30 })
  .map(s => s.replace(/[^a-zA-Z0-9-_]/g, ''))
  .filter(s => s.length > 0);

/**
 * Generator for valid component types (registered types)
 */
const registeredTypeArb = fc.constantFrom('Button', 'Container', 'Text', 'Input', 'Card');

/**
 * Generator for type aliases
 */
const typeAliasArb = fc.constantFrom(...Object.keys(TYPE_ALIAS_MAP));

/**
 * Generator for case variations of registered types
 */
const caseVariationArb = fc.constantFrom('Button', 'Container', 'Text', 'Input', 'Card')
  .chain(type => fc.constantFrom(
    type.toLowerCase(),
    type.toUpperCase(),
    type.charAt(0).toLowerCase() + type.slice(1),
  ));


/**
 * Generator for simple props
 */
const simplePropsArb = fc.option(
  fc.record({
    variant: fc.option(fc.constantFrom('default', 'outline', 'ghost'), { nil: undefined }),
    disabled: fc.option(fc.boolean(), { nil: undefined }),
    className: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  }),
  { nil: undefined }
);

/**
 * Generator for a valid component (with all required fields)
 */
const validComponentArb = fc.record({
  id: componentIdArb,
  type: registeredTypeArb,
  props: simplePropsArb,
});

/**
 * Generator for a component missing id
 */
const componentMissingIdArb = fc.record({
  type: registeredTypeArb,
  props: simplePropsArb,
});

/**
 * Generator for a component with type alias
 */
const componentWithAliasArb = fc.record({
  id: componentIdArb,
  type: typeAliasArb,
  props: simplePropsArb,
});

/**
 * Generator for a component with wrong casing
 */
const componentWithWrongCasingArb = fc.record({
  id: componentIdArb,
  type: caseVariationArb,
  props: simplePropsArb,
});

/**
 * Generator for a valid UISchema
 */
const validUISchemaArb = fc.record({
  version: fc.constant('1.0'),
  root: validComponentArb,
});

/**
 * Generator for UISchema missing version
 */
const schemaMissingVersionArb = fc.record({
  root: validComponentArb,
});

/**
 * Generator for UISchema with fixable issues
 */
const fixableSchemaArb = fc.oneof(
  // Missing version
  schemaMissingVersionArb,
  // Component with type alias
  fc.record({
    version: fc.constant('1.0'),
    root: componentWithAliasArb,
  }),
  // Component missing id
  fc.record({
    version: fc.constant('1.0'),
    root: componentMissingIdArb,
  }),
  // Component with wrong casing
  fc.record({
    version: fc.constant('1.0'),
    root: componentWithWrongCasingArb,
  }),
);


describe('Schema Fixer', () => {
  let registry: ComponentRegistry;
  let catalog: ComponentCatalog;

  beforeEach(() => {
    registry = new ComponentRegistry();
    catalog = new ComponentCatalog(registry);
    
    // Register test components
    const testComponents = ['Button', 'Container', 'Text', 'Input', 'Card', 'Image', 'Label', 'Select', 'Checkbox', 'Table', 'Link'];
    for (const name of testComponents) {
      registry.register({
        name,
        component: createMockComponent(name),
        propsSchema: {
          variant: { type: 'string', required: false },
          disabled: { type: 'boolean', required: false },
          className: { type: 'string', required: false },
        },
      });
    }
  });

  describe('generateComponentId', () => {
    it('generates unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const id = generateComponentId('Button');
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    });

    it('includes sanitized type in ID', () => {
      const id = generateComponentId('Button');
      expect(id).toMatch(/^button-[a-z0-9]+$/);
    });

    it('handles special characters in type', () => {
      const id = generateComponentId('My-Special_Component!');
      expect(id).toMatch(/^myspecialcomponent-[a-z0-9]+$/);
    });
  });

  /**
   * Property 5: Schema 修复往返一致性 (Schema Fix Round-Trip Consistency)
   * 
   * *对于任意* 可修复的 UISchema（仅包含缺失 version、类型别名、缺失 id、大小写错误），
   * fixUISchema 返回的 schema 应当通过 validateUISchemaEnhanced 验证。
   * 
   * **Feature: agent-output-optimization, Property 5: Schema 修复往返一致性**
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
   */
  it('Property 5: fixed schemas pass validation', () => {
    fc.assert(
      fc.property(fixableSchemaArb, (schema) => {
        const result = fixUISchema(schema, { catalog });
        
        // If fixed, the schema should pass validation
        if (result.fixed) {
          expect(result.schema).toBeDefined();
          const validationResult = validateUISchemaEnhanced(result.schema, { catalog });
          expect(validationResult.valid).toBe(true);
          expect(validationResult.errors).toHaveLength(0);
        }
      }),
      { numRuns: 100 }
    );
  });


  /**
   * Property 5b: Missing version is fixed
   * 
   * **Feature: agent-output-optimization, Property 5: Schema 修复往返一致性**
   * **Validates: Requirements 4.1**
   */
  it('Property 5b: missing version is fixed with default "1.0"', () => {
    fc.assert(
      fc.property(schemaMissingVersionArb, (schema) => {
        const result = fixUISchema(schema, { catalog });
        
        expect(result.fixed).toBe(true);
        expect(result.schema).toBeDefined();
        expect(result.schema!.version).toBe('1.0');
        expect(result.fixes).toContain('Added missing version field with default value "1.0"');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5c: Type aliases are replaced
   * 
   * **Feature: agent-output-optimization, Property 5: Schema 修复往返一致性**
   * **Validates: Requirements 4.2**
   */
  it('Property 5c: type aliases are replaced with canonical types', () => {
    fc.assert(
      fc.property(
        fc.record({
          version: fc.constant('1.0'),
          root: componentWithAliasArb,
        }),
        (schema) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const originalType = (schema.root as any).type as string;
          const expectedCanonical = TYPE_ALIAS_MAP[originalType.toLowerCase()];
          
          const result = fixUISchema(schema, { catalog });
          
          expect(result.fixed).toBe(true);
          expect(result.schema).toBeDefined();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expect((result.schema!.root as any).type).toBe(expectedCanonical);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5d: Missing IDs are generated
   * 
   * **Feature: agent-output-optimization, Property 5: Schema 修复往返一致性**
   * **Validates: Requirements 4.3**
   */
  it('Property 5d: missing IDs are generated', () => {
    fc.assert(
      fc.property(
        fc.record({
          version: fc.constant('1.0'),
          root: componentMissingIdArb,
        }),
        (schema) => {
          const result = fixUISchema(schema, { catalog });
          
          expect(result.fixed).toBe(true);
          expect(result.schema).toBeDefined();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expect((result.schema!.root as any).id).toBeDefined();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expect(typeof (result.schema!.root as any).id).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5e: Wrong casing is normalized
   * 
   * **Feature: agent-output-optimization, Property 5: Schema 修复往返一致性**
   * **Validates: Requirements 4.4**
   */
  it('Property 5e: wrong casing is normalized', () => {
    fc.assert(
      fc.property(
        fc.record({
          version: fc.constant('1.0'),
          root: componentWithWrongCasingArb,
        }),
        (schema) => {
          const result = fixUISchema(schema, { catalog });
          
          expect(result.fixed).toBe(true);
          expect(result.schema).toBeDefined();
          
          // The type should be one of the registered types (proper casing)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fixedType = (result.schema!.root as any).type as string;
          expect(['Button', 'Container', 'Text', 'Input', 'Card']).toContain(fixedType);
        }
      ),
      { numRuns: 100 }
    );
  });


  /**
   * Property 5f: Recursive fix for nested children
   * 
   * **Feature: agent-output-optimization, Property 5: Schema 修复往返一致性**
   * **Validates: Requirements 4.6**
   */
  it('Property 5f: nested children are fixed recursively', () => {
    const schemaWithChildren = {
      version: '1.0',
      root: {
        id: 'root-1',
        type: 'Container',
        children: [
          { type: 'btn' }, // alias, missing id
          { type: 'BUTTON', id: 'btn-1' }, // wrong casing
          {
            type: 'Container',
            id: 'nested-1',
            children: [
              { type: 'txt' }, // alias, missing id
            ],
          },
        ],
      },
    };

    const result = fixUISchema(schemaWithChildren, { catalog });
    
    expect(result.fixed).toBe(true);
    expect(result.schema).toBeDefined();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = result.schema!.root as any;
    const children = root.children as Array<Record<string, unknown>>;
    
    // First child: alias replaced, id generated
    expect(children[0].type).toBe('Button');
    expect(children[0].id).toBeDefined();
    
    // Second child: casing normalized
    expect(children[1].type).toBe('Button');
    
    // Nested child: alias replaced, id generated
    const nestedChildren = (children[2].children as Array<Record<string, unknown>>);
    expect(nestedChildren[0].type).toBe('Text');
    expect(nestedChildren[0].id).toBeDefined();
  });

  /**
   * Property 5g: Unfixable schemas return remaining errors
   * 
   * **Feature: agent-output-optimization, Property 5: Schema 修复往返一致性**
   * **Validates: Requirements 4.7**
   */
  it('Property 5g: unfixable schemas return remaining errors', () => {
    const unfixableSchema = {
      version: '1.0',
      root: {
        id: 'root-1',
        type: 'UnknownComponent', // Not a valid type, no alias
      },
    };

    const result = fixUISchema(unfixableSchema, { catalog });
    
    expect(result.fixed).toBe(false);
    expect(result.remainingErrors).toBeDefined();
    expect(result.remainingErrors!.length).toBeGreaterThan(0);
    expect(result.remainingErrors!.some(e => e.code === 'UNKNOWN_COMPONENT')).toBe(true);
  });

  /**
   * Property 5h: Valid schemas pass through unchanged
   */
  it('Property 5h: valid schemas pass through unchanged', () => {
    fc.assert(
      fc.property(validUISchemaArb, (schema) => {
        const result = fixUISchema(schema, { catalog });
        
        expect(result.fixed).toBe(true);
        expect(result.fixes).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5i: Non-object input returns error
   */
  it('Property 5i: non-object input returns error', () => {
    const nonObjects = [null, 'string', 123, true, []];
    
    for (const input of nonObjects) {
      const result = fixUISchema(input, { catalog });
      expect(result.fixed).toBe(false);
      expect(result.remainingErrors).toBeDefined();
    }
  });
});
