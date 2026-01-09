/**
 * Component Catalog Property-Based Tests
 * 
 * **Feature: agent-output-optimization**
 * 
 * Property 1: 组件目录同步一致性
 * Property 2: 类型别名解析正确性
 * 
 * @module component-catalog.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import { ComponentRegistry } from './component-registry';
import { ComponentCatalog, TYPE_ALIAS_MAP } from './component-catalog';
import type { ComponentDefinition } from './component-registry';

/**
 * Create a mock React component for testing
 */
const createMockComponent = (name: string): React.ComponentType<Record<string, unknown>> => {
  const MockComponent: React.FC<Record<string, unknown>> = () => null;
  MockComponent.displayName = name;
  return MockComponent;
};

/**
 * Generator for valid component names
 */
const componentNameArb = fc.string({ minLength: 1, maxLength: 30 })
  .filter(s => s.trim().length > 0);

/**
 * Generator for prop schema types
 */
const propTypeArb = fc.constantFrom('string', 'number', 'boolean', 'object', 'array', 'function');


/**
 * Generator for prop schema
 */
const propSchemaArb = fc.record({
  type: propTypeArb,
  required: fc.option(fc.boolean(), { nil: undefined }),
  description: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
});

/**
 * Generator for props schema (dictionary of prop schemas)
 */
const propsSchemaArb = fc.option(
  fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }),
    propSchemaArb
  ),
  { nil: undefined }
);

/**
 * Generator for component category
 */
const categoryArb = fc.option(
  fc.constantFrom('layout', 'input', 'display', 'navigation', 'feedback'),
  { nil: undefined }
);

/**
 * Generator for valid component definitions
 */
const componentDefinitionArb = (name?: string): fc.Arbitrary<ComponentDefinition> =>
  fc.record({
    name: name ? fc.constant(name) : componentNameArb,
    component: fc.constant(createMockComponent(name || 'MockComponent')),
    propsSchema: propsSchemaArb,
    description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    category: categoryArb,
  });


describe('ComponentCatalog', () => {
  let registry: ComponentRegistry;
  let catalog: ComponentCatalog;

  beforeEach(() => {
    registry = new ComponentRegistry();
    catalog = new ComponentCatalog(registry);
  });

  /**
   * Property 1: 组件目录同步一致性 (Component Catalog Sync Consistency)
   * 
   * *对于任意* ComponentRegistry 中注册的组件，Component_Catalog 的 
   * getValidTypes() 返回的列表应当包含该组件的类型名称。
   * 
   * **Feature: agent-output-optimization, Property 1: 组件目录同步一致性**
   * **Validates: Requirements 1.1, 1.3, 1.4**
   */
  it('Property 1: registered components appear in getValidTypes()', () => {
    fc.assert(
      fc.property(componentDefinitionArb(), (definition) => {
        // Register the component
        registry.register(definition);
        
        // getValidTypes() should include the component name
        const validTypes = catalog.getValidTypes();
        expect(validTypes).toContain(definition.name);
        
        // isValidType() should return true
        expect(catalog.isValidType(definition.name)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });


  /**
   * Property 1b: Multiple registrations maintain sync consistency
   * 
   * For any set of unique component definitions, all should appear in getValidTypes().
   * 
   * **Feature: agent-output-optimization, Property 1: 组件目录同步一致性**
   * **Validates: Requirements 1.1, 1.3, 1.4**
   */
  it('Property 1b: multiple registrations maintain sync consistency', () => {
    fc.assert(
      fc.property(
        fc.array(componentNameArb, { minLength: 1, maxLength: 10 })
          .chain(names => {
            const uniqueNames = [...new Set(names)];
            return fc.tuple(
              ...uniqueNames.map(name => componentDefinitionArb(name))
            );
          }),
        (definitions) => {
          // Register all components
          for (const def of definitions) {
            registry.register(def);
          }
          
          // All should appear in getValidTypes()
          const validTypes = catalog.getValidTypes();
          for (const def of definitions) {
            expect(validTypes).toContain(def.name);
            expect(catalog.isValidType(def.name)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });


  /**
   * Property 1c: Unregistered components are not in getValidTypes()
   * 
   * **Feature: agent-output-optimization, Property 1: 组件目录同步一致性**
   * **Validates: Requirements 1.1, 1.3, 1.4**
   */
  it('Property 1c: unregistered components are not in getValidTypes()', () => {
    fc.assert(
      fc.property(componentNameArb, (name) => {
        // Without registration, should not be valid
        // (unless it happens to be an alias)
        const isAlias = TYPE_ALIAS_MAP[name.toLowerCase()] !== undefined;
        
        if (!isAlias) {
          expect(catalog.getValidTypes()).not.toContain(name);
          expect(catalog.isValidType(name)).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1d: Unregistration removes from getValidTypes()
   * 
   * **Feature: agent-output-optimization, Property 1: 组件目录同步一致性**
   * **Validates: Requirements 1.1, 1.3, 1.4**
   */
  it('Property 1d: unregistration removes from getValidTypes()', () => {
    fc.assert(
      fc.property(componentDefinitionArb(), (definition) => {
        // Register then unregister
        registry.register(definition);
        expect(catalog.getValidTypes()).toContain(definition.name);
        
        registry.unregister(definition.name);
        expect(catalog.getValidTypes()).not.toContain(definition.name);
      }),
      { numRuns: 100 }
    );
  });
});


describe('ComponentCatalog Type Alias Resolution', () => {
  let registry: ComponentRegistry;
  let catalog: ComponentCatalog;

  beforeEach(() => {
    registry = new ComponentRegistry();
    catalog = new ComponentCatalog(registry);
  });

  /**
   * Property 2: 类型别名解析正确性 (Type Alias Resolution Correctness)
   * 
   * *对于任意* Type_Alias_Map 中定义的别名，调用 resolveAlias(alias) 
   * 应当返回对应的规范类型名称，且该名称应当在 getValidTypes() 列表中
   * （前提是规范类型已注册）。
   * 
   * **Feature: agent-output-optimization, Property 2: 类型别名解析正确性**
   * **Validates: Requirements 1.5, 1.6**
   */
  it('Property 2: resolveAlias returns canonical type for all aliases', () => {
    // First register all canonical types that aliases point to
    const canonicalTypes = new Set(Object.values(TYPE_ALIAS_MAP));
    for (const canonicalType of canonicalTypes) {
      registry.register({
        name: canonicalType,
        component: createMockComponent(canonicalType),
      });
    }

    // Test all aliases
    for (const [alias, canonical] of Object.entries(TYPE_ALIAS_MAP)) {
      // resolveAlias should return the canonical name
      const resolved = catalog.resolveAlias(alias);
      expect(resolved).toBe(canonical);
      
      // The canonical name should be in getValidTypes()
      expect(catalog.getValidTypes()).toContain(canonical);
      
      // isValidType should return true for the alias
      expect(catalog.isValidType(alias)).toBe(true);
    }
  });


  /**
   * Property 2b: Alias resolution is case-insensitive
   * 
   * **Feature: agent-output-optimization, Property 2: 类型别名解析正确性**
   * **Validates: Requirements 1.5, 1.6**
   */
  it('Property 2b: alias resolution is case-insensitive', () => {
    // Register canonical types
    const canonicalTypes = new Set(Object.values(TYPE_ALIAS_MAP));
    for (const canonicalType of canonicalTypes) {
      registry.register({
        name: canonicalType,
        component: createMockComponent(canonicalType),
      });
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(TYPE_ALIAS_MAP)),
        (alias) => {
          const canonical = TYPE_ALIAS_MAP[alias];
          
          // Test various case variations
          expect(catalog.resolveAlias(alias.toLowerCase())).toBe(canonical);
          expect(catalog.resolveAlias(alias.toUpperCase())).toBe(canonical);
          
          // Mixed case should also work
          const mixedCase = alias.split('').map((c, i) => 
            i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
          ).join('');
          expect(catalog.resolveAlias(mixedCase)).toBe(canonical);
        }
      ),
      { numRuns: 100 }
    );
  });


  /**
   * Property 2c: Non-alias types return undefined from resolveAlias
   * 
   * **Feature: agent-output-optimization, Property 2: 类型别名解析正确性**
   * **Validates: Requirements 1.5, 1.6**
   */
  it('Property 2c: non-alias types return undefined from resolveAlias', () => {
    fc.assert(
      fc.property(
        componentNameArb.filter(name => 
          !Object.keys(TYPE_ALIAS_MAP).includes(name.toLowerCase())
        ),
        (nonAliasName) => {
          expect(catalog.resolveAlias(nonAliasName)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2d: isValidType returns true for aliases when canonical is registered
   * 
   * **Feature: agent-output-optimization, Property 2: 类型别名解析正确性**
   * **Validates: Requirements 1.5, 1.6**
   */
  it('Property 2d: isValidType returns true for aliases when canonical is registered', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.entries(TYPE_ALIAS_MAP)),
        ([alias, canonical]) => {
          // Before registration, alias should not be valid
          // (unless the canonical type happens to be registered)
          const wasValid = catalog.isValidType(alias);
          
          // Register the canonical type
          registry.register({
            name: canonical,
            component: createMockComponent(canonical),
          });
          
          // Now the alias should be valid
          expect(catalog.isValidType(alias)).toBe(true);
          
          // Unregister
          registry.unregister(canonical);
          
          // If it wasn't valid before, it shouldn't be valid now
          if (!wasValid) {
            expect(catalog.isValidType(alias)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('ComponentCatalog Metadata Export', () => {
  let registry: ComponentRegistry;
  let catalog: ComponentCatalog;

  beforeEach(() => {
    registry = new ComponentRegistry();
    catalog = new ComponentCatalog(registry);
  });

  it('getAllMetadata returns metadata for all registered components', () => {
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
      category: 'input',
      description: 'A button component',
      propsSchema: {
        variant: { type: 'string', required: false },
      },
    });
    registry.register({
      name: 'Card',
      component: createMockComponent('Card'),
      category: 'layout',
      description: 'A card component',
    });

    const metadata = catalog.getAllMetadata();
    expect(metadata).toHaveLength(2);
    
    const buttonMeta = metadata.find(m => m.name === 'Button');
    expect(buttonMeta).toBeDefined();
    expect(buttonMeta!.category).toBe('input');
    expect(buttonMeta!.description).toBe('A button component');
    expect(buttonMeta!.propsSchema).toHaveProperty('variant');
  });

  it('getByCategory groups components correctly', () => {
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
      category: 'input',
    });
    registry.register({
      name: 'Input',
      component: createMockComponent('Input'),
      category: 'input',
    });
    registry.register({
      name: 'Card',
      component: createMockComponent('Card'),
      category: 'layout',
    });

    const grouped = catalog.getByCategory();
    expect(grouped['input']).toHaveLength(2);
    expect(grouped['layout']).toHaveLength(1);
    expect(grouped['input'].map(m => m.name).sort()).toEqual(['Button', 'Input']);
  });

  it('getPropsSchema returns schema for registered component', () => {
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
      propsSchema: {
        variant: { type: 'string', required: false, enum: ['default', 'outline'] },
        disabled: { type: 'boolean', required: false },
      },
    });

    const schema = catalog.getPropsSchema('Button');
    expect(schema).toBeDefined();
    expect(schema!.variant.type).toBe('string');
    expect(schema!.variant.enum).toEqual(['default', 'outline']);
    expect(schema!.disabled.type).toBe('boolean');
  });

  it('getPropsSchema returns undefined for unregistered component', () => {
    const schema = catalog.getPropsSchema('NonExistent');
    expect(schema).toBeUndefined();
  });

  it('getPropsSchema resolves aliases', () => {
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
      propsSchema: {
        variant: { type: 'string' },
      },
    });

    // 'btn' is an alias for 'Button'
    const schema = catalog.getPropsSchema('btn');
    expect(schema).toBeDefined();
    expect(schema!.variant.type).toBe('string');
  });
});
