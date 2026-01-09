/**
 * Component Registry Property-Based Tests
 * 
 * **Feature: llm2ui, Property 4: 组件注册表查找一致性**
 * **Validates: Requirements 6.2, 6.4**
 * 
 * Tests that for any registered component, lookup operations are consistent:
 * - After registering a component, get() returns the same definition
 * - has() correctly reflects registration state
 * - getAll() includes all registered components
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import {
  ComponentRegistry,
  validateComponentDefinition,
} from './component-registry';
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

describe('ComponentRegistry', () => {
  /**
   * Property 4: 组件注册表查找一致性 (Component Registry Lookup Consistency)
   * 
   * For any valid component definition, after registration:
   * - get(name) returns the exact same definition
   * - has(name) returns true
   * - getAll() includes the registered component
   * 
   * **Validates: Requirements 6.2, 6.4**
   */
  it('Property 4: registered components can be retrieved consistently', () => {
    fc.assert(
      fc.property(componentDefinitionArb(), (definition) => {
        const registry = new ComponentRegistry();
        
        // Register the component
        registry.register(definition);
        
        // get() should return the same definition
        const retrieved = registry.get(definition.name);
        expect(retrieved).toBeDefined();
        expect(retrieved!.name).toBe(definition.name);
        expect(retrieved!.component).toBe(definition.component);
        expect(retrieved!.propsSchema).toEqual(definition.propsSchema);
        expect(retrieved!.description).toBe(definition.description);
        expect(retrieved!.category).toBe(definition.category);
        
        // has() should return true
        expect(registry.has(definition.name)).toBe(true);
        
        // getAll() should include the component
        const all = registry.getAll();
        expect(all.some(c => c.name === definition.name)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4b: Multiple registrations maintain consistency
   * 
   * For any set of unique component definitions, all can be retrieved correctly.
   */
  it('Property 4b: multiple registrations maintain lookup consistency', () => {
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
          const registry = new ComponentRegistry();
          
          // Register all components
          for (const def of definitions) {
            registry.register(def);
          }
          
          // Verify each can be retrieved
          for (const def of definitions) {
            expect(registry.has(def.name)).toBe(true);
            const retrieved = registry.get(def.name);
            expect(retrieved).toBeDefined();
            expect(retrieved!.name).toBe(def.name);
          }
          
          // getAll() should have all components
          expect(registry.getAll().length).toBe(definitions.length);
          expect(registry.size).toBe(definitions.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4c: Unregistered components return undefined/false
   */
  it('Property 4c: unregistered components are not found', () => {
    fc.assert(
      fc.property(componentNameArb, (name) => {
        const registry = new ComponentRegistry();
        
        // Before registration
        expect(registry.has(name)).toBe(false);
        expect(registry.get(name)).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4d: Re-registration overwrites previous definition
   */
  it('Property 4d: re-registration overwrites previous definition', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        fc.string({ maxLength: 100 }),
        fc.string({ maxLength: 100 }),
        (name, desc1, desc2) => {
          const registry = new ComponentRegistry();
          const component = createMockComponent(name);
          
          // Register first definition
          registry.register({ name, component, description: desc1 });
          expect(registry.get(name)?.description).toBe(desc1);
          
          // Re-register with different description
          registry.register({ name, component, description: desc2 });
          expect(registry.get(name)?.description).toBe(desc2);
          
          // Size should still be 1
          expect(registry.size).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4e: Unregister removes component
   */
  it('Property 4e: unregister removes component from registry', () => {
    fc.assert(
      fc.property(componentDefinitionArb(), (definition) => {
        const registry = new ComponentRegistry();
        
        // Register then unregister
        registry.register(definition);
        expect(registry.has(definition.name)).toBe(true);
        
        const removed = registry.unregister(definition.name);
        expect(removed).toBe(true);
        expect(registry.has(definition.name)).toBe(false);
        expect(registry.get(definition.name)).toBeUndefined();
        
        // Unregistering again returns false
        expect(registry.unregister(definition.name)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

describe('validateComponentDefinition', () => {
  it('should validate correct definitions', () => {
    const result = validateComponentDefinition({
      name: 'Button',
      component: createMockComponent('Button'),
      propsSchema: {
        variant: { type: 'string', required: false },
        disabled: { type: 'boolean' },
      },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing name', () => {
    const result = validateComponentDefinition({
      component: createMockComponent('Test'),
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('name'))).toBe(true);
  });

  it('should reject empty name', () => {
    const result = validateComponentDefinition({
      name: '   ',
      component: createMockComponent('Test'),
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('empty'))).toBe(true);
  });

  it('should reject missing component', () => {
    const result = validateComponentDefinition({
      name: 'Button',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Component is required'))).toBe(true);
  });

  it('should reject invalid prop schema type', () => {
    const result = validateComponentDefinition({
      name: 'Button',
      component: createMockComponent('Button'),
      propsSchema: {
        variant: { type: 'invalid' as 'string' },
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid type'))).toBe(true);
  });

  it('should validate examples array', () => {
    const validResult = validateComponentDefinition({
      name: 'Button',
      component: createMockComponent('Button'),
      examples: [
        {
          title: 'Basic Button',
          description: 'A simple button example',
          schema: { version: '1.0', root: { id: '1', type: 'Button' } },
        },
      ],
    });
    expect(validResult.valid).toBe(true);
  });

  it('should reject invalid examples', () => {
    const result = validateComponentDefinition({
      name: 'Button',
      component: createMockComponent('Button'),
      examples: [
        {
          title: '', // Empty title
          description: 'A simple button example',
          schema: { version: '1.0', root: { id: '1', type: 'Button' } },
        } as import('./component-registry').ComponentExample,
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('title'))).toBe(true);
  });

  it('should reject examples without schema', () => {
    const result = validateComponentDefinition({
      name: 'Button',
      component: createMockComponent('Button'),
      examples: [
        {
          title: 'Basic Button',
          description: 'A simple button example',
        } as import('./component-registry').ComponentExample,
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('schema'))).toBe(true);
  });

  it('should validate tags array', () => {
    const validResult = validateComponentDefinition({
      name: 'Button',
      component: createMockComponent('Button'),
      tags: ['ui', 'input', 'interactive'],
    });
    expect(validResult.valid).toBe(true);
  });

  it('should reject invalid tags', () => {
    const result = validateComponentDefinition({
      name: 'Button',
      component: createMockComponent('Button'),
      tags: ['valid', '', 'another'], // Empty tag
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Tag') && e.includes('empty'))).toBe(true);
  });

  it('should reject non-string tags', () => {
    const result = validateComponentDefinition({
      name: 'Button',
      component: createMockComponent('Button'),
      tags: ['valid', 123 as unknown as string],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Tag') && e.includes('string'))).toBe(true);
  });

  it('should validate complete ComponentDefinition with all fields', () => {
    const result = validateComponentDefinition({
      name: 'Button',
      version: '1.0.0',
      platforms: ['pc-web', 'mobile-web'],
      component: createMockComponent('Button'),
      propsSchema: {
        variant: { type: 'string', required: false, description: 'Button variant' },
        disabled: { type: 'boolean', default: false },
      },
      description: 'A customizable button component',
      category: 'input',
      examples: [
        {
          title: 'Primary Button',
          description: 'A primary styled button',
          schema: { version: '1.0', root: { id: '1', type: 'Button', props: { variant: 'default' } } },
          preview: 'https://example.com/preview.png',
        },
      ],
      icon: 'button-icon',
      tags: ['button', 'input', 'interactive', 'clickable'],
      deprecated: false,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('ComponentRegistry.getByCategory', () => {
  it('should filter components by category', () => {
    const registry = new ComponentRegistry();
    
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
      category: 'input',
    });
    registry.register({
      name: 'Card',
      component: createMockComponent('Card'),
      category: 'layout',
    });
    registry.register({
      name: 'Input',
      component: createMockComponent('Input'),
      category: 'input',
    });
    
    const inputComponents = registry.getByCategory('input');
    expect(inputComponents).toHaveLength(2);
    expect(inputComponents.map(c => c.name).sort()).toEqual(['Button', 'Input']);
    
    const layoutComponents = registry.getByCategory('layout');
    expect(layoutComponents).toHaveLength(1);
    expect(layoutComponents[0].name).toBe('Card');
  });
});


/**
 * Multi-Platform Support Tests
 * 
 * **Feature: component-showcase, Property 1: 组件注册表查找一致性**
 * **Validates: Requirements 1.1, 7.1, 10.1, 10.2**
 */
describe('ComponentRegistry Multi-Platform Support', () => {
  /**
   * Generator for platform types
   */
  const platformArb = fc.constantFrom<import('./component-registry').PlatformType>(
    'pc-web', 'mobile-web', 'mobile-native', 'pc-desktop'
  );

  /**
   * Generator for platform arrays
   */
  const platformsArb = fc.array(platformArb, { minLength: 1, maxLength: 4 })
    .map(platforms => [...new Set(platforms)]);

  /**
   * Generator for version strings (semver-like)
   */
  const versionArb = fc.tuple(
    fc.integer({ min: 0, max: 10 }),
    fc.integer({ min: 0, max: 10 }),
    fc.integer({ min: 0, max: 10 })
  ).map(([major, minor, patch]) => `${major}.${minor}.${patch}`);

  /**
   * Property 1: Platform filtering consistency
   * 
   * For any component with specified platforms, get() with platform filter
   * should only return the component if it supports that platform.
   * 
   * **Validates: Requirements 7.1, 7.2**
   */
  it('Property 1: platform filtering returns only supported components', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        platformsArb,
        platformArb,
        (name, platforms, queryPlatform) => {
          const registry = new ComponentRegistry();
          const component = createMockComponent(name);
          
          registry.register({ name, component, platforms });
          
          const result = registry.get(name, queryPlatform);
          
          if (platforms.includes(queryPlatform)) {
            // Should return the component
            expect(result).toBeDefined();
            expect(result!.name).toBe(name);
          } else {
            // Should not return the component
            expect(result).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1b: getAll platform filtering
   * 
   * For any set of components with different platforms, getAll(platform)
   * should only return components that support that platform.
   * 
   * **Validates: Requirements 7.1**
   */
  it('Property 1b: getAll returns only platform-compatible components', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(componentNameArb, platformsArb),
          { minLength: 1, maxLength: 5 }
        ).map(items => {
          // Ensure unique names
          const seen = new Set<string>();
          return items.filter(([name]) => {
            if (seen.has(name)) return false;
            seen.add(name);
            return true;
          });
        }),
        platformArb,
        (componentSpecs, queryPlatform) => {
          const registry = new ComponentRegistry();
          
          for (const [name, platforms] of componentSpecs) {
            registry.register({
              name,
              component: createMockComponent(name),
              platforms,
            });
          }
          
          const results = registry.getAll(queryPlatform);
          
          // All results should support the query platform
          for (const result of results) {
            if (result.platforms && result.platforms.length > 0) {
              expect(result.platforms).toContain(queryPlatform);
            }
          }
          
          // Count expected results
          const expectedCount = componentSpecs.filter(
            ([, platforms]) => platforms.includes(queryPlatform)
          ).length;
          expect(results.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Version lookup consistency
   * 
   * For any component registered with a specific version,
   * get(name, platform, version) should return that exact version.
   * 
   * **Validates: Requirements 10.1, 10.2**
   */
  it('Property 7: version lookup returns exact version', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        versionArb,
        (name, version) => {
          const registry = new ComponentRegistry();
          const component = createMockComponent(name);
          
          registry.register({ name, component, version });
          
          // Get by version should return exact match
          const result = registry.get(name, undefined, version);
          expect(result).toBeDefined();
          expect(result!.version).toBe(version);
          
          // getVersions should include this version
          const versions = registry.getVersions(name);
          expect(versions).toContain(version);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7b: Multiple versions are tracked correctly
   * 
   * For any component with multiple versions, all versions should be retrievable.
   * 
   * **Validates: Requirements 10.2**
   */
  it('Property 7b: multiple versions are all retrievable', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        fc.array(versionArb, { minLength: 1, maxLength: 5 })
          .map(versions => [...new Set(versions)]),
        (name, versions) => {
          const registry = new ComponentRegistry();
          
          // Register multiple versions
          for (const version of versions) {
            registry.register({
              name,
              component: createMockComponent(`${name}-${version}`),
              version,
              description: `Version ${version}`,
            });
          }
          
          // All versions should be retrievable
          for (const version of versions) {
            const result = registry.get(name, undefined, version);
            expect(result).toBeDefined();
            expect(result!.version).toBe(version);
          }
          
          // getVersions should return all versions
          const retrievedVersions = registry.getVersions(name);
          expect(retrievedVersions.length).toBe(versions.length);
          for (const version of versions) {
            expect(retrievedVersions).toContain(version);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isSupported correctly reports platform support
   * 
   * **Validates: Requirements 7.5**
   */
  it('isSupported correctly reports platform support', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        platformsArb,
        platformArb,
        (name, platforms, queryPlatform) => {
          const registry = new ComponentRegistry();
          registry.register({
            name,
            component: createMockComponent(name),
            platforms,
          });
          
          const isSupported = registry.isSupported(name, queryPlatform);
          expect(isSupported).toBe(platforms.includes(queryPlatform));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Components without platforms support all platforms
   * 
   * **Validates: Requirements 7.1**
   */
  it('components without platforms support all platforms', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        platformArb,
        (name, queryPlatform) => {
          const registry = new ComponentRegistry();
          registry.register({
            name,
            component: createMockComponent(name),
            // No platforms specified
          });
          
          // Should be available on any platform
          const result = registry.get(name, queryPlatform);
          expect(result).toBeDefined();
          
          const isSupported = registry.isSupported(name, queryPlatform);
          expect(isSupported).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Search Functionality Tests
 * 
 * **Feature: component-showcase, Property 3: 搜索结果相关性**
 * **Validates: Requirements 5.2, 5.3**
 */
describe('ComponentRegistry Search', () => {
  /**
   * Property 3: Search results contain query in name, description, or tags
   * 
   * **Validates: Requirements 5.2, 5.3**
   */
  it('Property 3: search results match query in name, description, or tags', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: componentNameArb,
            description: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
            // Filter out whitespace-only tags since validation rejects them
            tags: fc.option(
              fc.array(
                fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
                { maxLength: 5 }
              ),
              { nil: undefined }
            ),
          }),
          { minLength: 1, maxLength: 10 }
        ).map(items => {
          // Ensure unique names
          const seen = new Set<string>();
          return items.filter(item => {
            if (seen.has(item.name)) return false;
            seen.add(item.name);
            return true;
          });
        }),
        // Generate non-whitespace queries to test actual search behavior
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
        (componentSpecs, query) => {
          const registry = new ComponentRegistry();
          
          for (const spec of componentSpecs) {
            registry.register({
              name: spec.name,
              component: createMockComponent(spec.name),
              description: spec.description,
              tags: spec.tags,
            });
          }
          
          const results = registry.search(query);
          const lowerQuery = query.toLowerCase().trim();
          
          // All results should match the query
          for (const result of results) {
            const matchesName = result.name.toLowerCase().includes(lowerQuery);
            const matchesDescription = result.description?.toLowerCase().includes(lowerQuery);
            const matchesTags = result.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
            
            expect(matchesName || matchesDescription || matchesTags).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3c: Whitespace-only query returns all components
   * 
   * **Validates: Requirements 5.2**
   */
  it('Property 3c: whitespace-only query returns all components', () => {
    fc.assert(
      fc.property(
        fc.array(componentNameArb, { minLength: 1, maxLength: 5 })
          .map(names => [...new Set(names)]),
        fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 5 })
          .map(chars => chars.join('')),
        (names, whitespaceQuery) => {
          const registry = new ComponentRegistry();
          
          for (const name of names) {
            registry.register({
              name,
              component: createMockComponent(name),
            });
          }
          
          const results = registry.search(whitespaceQuery);
          expect(results.length).toBe(names.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3b: Empty query returns all components
   */
  it('Property 3b: empty query returns all components', () => {
    fc.assert(
      fc.property(
        fc.array(componentNameArb, { minLength: 1, maxLength: 5 })
          .map(names => [...new Set(names)]),
        (names) => {
          const registry = new ComponentRegistry();
          
          for (const name of names) {
            registry.register({
              name,
              component: createMockComponent(name),
            });
          }
          
          const results = registry.search('');
          expect(results.length).toBe(names.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Category Filtering Tests
 * 
 * **Feature: component-showcase, Property 2: 分类筛选完整性**
 * **Validates: Requirements 4.2, 4.3**
 */
describe('ComponentRegistry Category Filtering', () => {
  /**
   * Property 2: Category filtering returns all and only components in that category
   * 
   * **Validates: Requirements 4.2, 4.3**
   */
  it('Property 2: category filtering is complete and exclusive', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            componentNameArb,
            fc.constantFrom('input', 'layout', 'display', 'feedback', 'navigation')
          ),
          { minLength: 1, maxLength: 10 }
        ).map(items => {
          // Ensure unique names
          const seen = new Set<string>();
          return items.filter(([name]) => {
            if (seen.has(name)) return false;
            seen.add(name);
            return true;
          });
        }),
        fc.constantFrom('input', 'layout', 'display', 'feedback', 'navigation'),
        (componentSpecs, queryCategory) => {
          const registry = new ComponentRegistry();
          
          for (const [name, category] of componentSpecs) {
            registry.register({
              name,
              component: createMockComponent(name),
              category,
            });
          }
          
          const results = registry.getByCategory(queryCategory);
          
          // All results should be in the query category
          for (const result of results) {
            expect(result.category).toBe(queryCategory);
          }
          
          // Count expected results
          const expectedCount = componentSpecs.filter(
            ([, category]) => category === queryCategory
          ).length;
          expect(results.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2b: getCategoryCounts returns correct counts
   */
  it('Property 2b: getCategoryCounts returns accurate counts', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            componentNameArb,
            fc.constantFrom('input', 'layout', 'display', 'feedback', 'navigation')
          ),
          { minLength: 1, maxLength: 10 }
        ).map(items => {
          // Ensure unique names
          const seen = new Set<string>();
          return items.filter(([name]) => {
            if (seen.has(name)) return false;
            seen.add(name);
            return true;
          });
        }),
        (componentSpecs) => {
          const registry = new ComponentRegistry();
          
          for (const [name, category] of componentSpecs) {
            registry.register({
              name,
              component: createMockComponent(name),
              category,
            });
          }
          
          const counts = registry.getCategoryCounts();
          
          // Verify counts match actual filtering
          for (const [category, count] of Object.entries(counts)) {
            const filtered = registry.getByCategory(category);
            expect(filtered.length).toBe(count);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('shadcn-ui Component Registration', () => {
  it('should register all shadcn-ui components', { timeout: 15000 }, async () => {
    const { registerShadcnComponents, getRegisteredComponentNames } = await import('./shadcn-components');
    const { ComponentRegistry } = await import('./component-registry');
    
    const registry = new ComponentRegistry();
    registerShadcnComponents(registry);
    
    const names = getRegisteredComponentNames(registry);
    
    // Verify core components are registered
    expect(names).toContain('Button');
    expect(names).toContain('Input');
    expect(names).toContain('Card');
    expect(names).toContain('CardHeader');
    expect(names).toContain('CardTitle');
    expect(names).toContain('CardContent');
    expect(names).toContain('Table');
    expect(names).toContain('TableHeader');
    expect(names).toContain('TableBody');
    expect(names).toContain('TableRow');
    expect(names).toContain('TableCell');
    expect(names).toContain('Label');
    expect(names).toContain('Text');
    expect(names).toContain('Container');
    
    // Verify component definitions have propsSchema
    const buttonDef = registry.get('Button');
    expect(buttonDef).toBeDefined();
    expect(buttonDef!.propsSchema).toBeDefined();
    expect(buttonDef!.propsSchema!.variant).toBeDefined();
    expect(buttonDef!.category).toBe('input');
    
    const cardDef = registry.get('Card');
    expect(cardDef).toBeDefined();
    expect(cardDef!.category).toBe('layout');
    
    const tableDef = registry.get('Table');
    expect(tableDef).toBeDefined();
    expect(tableDef!.category).toBe('display');
  });
});
