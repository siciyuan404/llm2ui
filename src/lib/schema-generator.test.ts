/**
 * Schema Generator Property-Based Tests
 * 
 * **Feature: component-showcase, Property 4: Schema 生成一致性**
 * **Validates: Requirements 8.1, 8.3**
 * 
 * Tests that for any component definition, the generated schema contains
 * all props, events, and slots definitions from the original component.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import { SchemaGenerator, createSchemaGenerator } from './schema-generator';
import { ComponentRegistry } from './component-registry';
import type { ComponentDefinition, PlatformType, PropSchema } from './component-registry';

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
const propTypeArb = fc.constantFrom('string', 'number', 'boolean', 'object', 'array', 'function') as fc.Arbitrary<PropSchema['type']>;

/**
 * Generator for prop schema
 */
const propSchemaArb: fc.Arbitrary<PropSchema> = fc.record({
  type: propTypeArb,
  required: fc.option(fc.boolean(), { nil: undefined }),
  default: fc.option(fc.oneof(fc.string(), fc.integer(), fc.boolean()), { nil: undefined }),
  description: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  enum: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }), { nil: undefined }),
});

/**
 * Generator for props schema (dictionary of prop schemas)
 */
const propsSchemaArb = fc.option(
  fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
    propSchemaArb,
    { minKeys: 1, maxKeys: 10 }
  ),
  { nil: undefined }
);

/**
 * Generator for component category
 */
const categoryArb = fc.constantFrom('layout', 'input', 'display', 'navigation', 'feedback');

/**
 * Generator for platform types
 */
const platformArb = fc.constantFrom<PlatformType>('pc-web', 'mobile-web', 'mobile-native', 'pc-desktop');

/**
 * Generator for platform arrays
 */
const platformsArb = fc.array(platformArb, { minLength: 1, maxLength: 4 })
  .map(platforms => [...new Set(platforms)] as PlatformType[]);

/**
 * Generator for version strings (semver-like)
 */
const versionArb = fc.tuple(
  fc.integer({ min: 0, max: 10 }),
  fc.integer({ min: 0, max: 10 }),
  fc.integer({ min: 0, max: 10 })
).map(([major, minor, patch]) => `${major}.${minor}.${patch}`);

/**
 * Generator for component examples
 */
const exampleArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  schema: fc.record({
    version: fc.constant('1.0'),
    root: fc.record({
      id: fc.string({ minLength: 1, maxLength: 10 }),
      type: fc.string({ minLength: 1, maxLength: 20 }),
    }),
  }),
});

/**
 * Generator for valid component definitions with props
 */
const componentDefinitionWithPropsArb = (name?: string): fc.Arbitrary<ComponentDefinition> =>
  fc.record({
    name: name ? fc.constant(name) : componentNameArb,
    version: fc.option(versionArb, { nil: undefined }),
    platforms: fc.option(platformsArb, { nil: undefined }),
    component: fc.constant(createMockComponent(name || 'MockComponent')),
    propsSchema: propsSchemaArb,
    description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    category: fc.option(categoryArb, { nil: undefined }),
    examples: fc.option(fc.array(exampleArb, { minLength: 1, maxLength: 3 }), { nil: undefined }),
    deprecated: fc.option(fc.boolean(), { nil: undefined }),
    deprecationMessage: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  });

describe('SchemaGenerator', () => {
  let registry: ComponentRegistry;
  let generator: SchemaGenerator;

  beforeEach(() => {
    registry = new ComponentRegistry();
    generator = createSchemaGenerator(registry);
    generator.clearCache();
  });

  /**
   * Property 4: Schema 生成一致性 (Schema Generation Consistency)
   * 
   * For any valid component definition, the generated schema SHALL contain
   * all props definitions from the original component.
   * 
   * **Feature: component-showcase, Property 4: Schema 生成一致性**
   * **Validates: Requirements 8.1, 8.3**
   */
  it('Property 4: generated schema contains all props from component definition', () => {
    fc.assert(
      fc.property(componentDefinitionWithPropsArb(), (definition) => {
        registry.register(definition);
        
        const schema = generator.generate(definition.name, { includeDeprecated: true });
        
        // Schema should be generated
        expect(schema).toBeDefined();
        
        // Component name should match
        expect(schema!.component).toBe(definition.name);
        
        // All props from definition should be in generated schema
        if (definition.propsSchema) {
          for (const [propName, propSchema] of Object.entries(definition.propsSchema)) {
            expect(schema!.props).toHaveProperty(propName);
            
            const generatedProp = schema!.props[propName];
            
            // Type should match
            expect(generatedProp.type).toBe(propSchema.type);
            
            // Required should match (default to false)
            expect(generatedProp.required).toBe(propSchema.required ?? false);
            
            // Default should match if present
            if (propSchema.default !== undefined) {
              expect(generatedProp.default).toEqual(propSchema.default);
            }
            
            // Description should match if present
            if (propSchema.description !== undefined) {
              expect(generatedProp.description).toBe(propSchema.description);
            }
            
            // Enum should match if present
            if (propSchema.enum !== undefined) {
              expect(generatedProp.enum).toEqual(propSchema.enum);
            }
          }
        }
        
        // Events should be generated based on category
        expect(schema!.events).toBeDefined();
        expect(Array.isArray(schema!.events)).toBe(true);
        expect(schema!.events.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });


  /**
   * Property 4b: Schema includes version from component definition
   * 
   * **Validates: Requirements 8.1**
   */
  it('Property 4b: generated schema includes correct version', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        versionArb,
        (name, version) => {
          const component = createMockComponent(name);
          registry.register({ name, component, version });
          
          const schema = generator.generate(name);
          
          expect(schema).toBeDefined();
          expect(schema!.version).toBe(version);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4c: Schema includes category and description
   * 
   * **Validates: Requirements 8.3**
   */
  it('Property 4c: generated schema includes category and description', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        categoryArb,
        fc.string({ minLength: 1, maxLength: 100 }),
        (name, category, description) => {
          const component = createMockComponent(name);
          registry.register({ name, component, category, description });
          
          const schema = generator.generate(name);
          
          expect(schema).toBeDefined();
          expect(schema!.category).toBe(category);
          expect(schema!.description).toBe(description);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4d: Schema includes platforms from component definition
   * 
   * **Validates: Requirements 8.3**
   */
  it('Property 4d: generated schema includes platforms', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        platformsArb,
        (name, platforms) => {
          const component = createMockComponent(name);
          registry.register({ name, component, platforms });
          
          const schema = generator.generate(name);
          
          expect(schema).toBeDefined();
          expect(schema!.platforms).toEqual(platforms);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4e: Schema includes examples when requested
   * 
   * **Validates: Requirements 8.3**
   */
  it('Property 4e: generated schema includes examples when includeExamples is true', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        fc.array(exampleArb, { minLength: 1, maxLength: 3 }),
        (name, examples) => {
          const component = createMockComponent(name);
          registry.register({ name, component, examples });
          
          // Without includeExamples
          const schemaWithout = generator.generate(name, { includeExamples: false });
          expect(schemaWithout).toBeDefined();
          expect(schemaWithout!.examples).toBeUndefined();
          
          // With includeExamples
          const schemaWith = generator.generate(name, { includeExamples: true });
          expect(schemaWith).toBeDefined();
          expect(schemaWith!.examples).toBeDefined();
          expect(schemaWith!.examples!.length).toBe(examples.length);
          
          // Each example schema should be included
          for (let i = 0; i < examples.length; i++) {
            expect(schemaWith!.examples![i]).toEqual(examples[i].schema);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4f: Deprecated components are excluded by default
   * 
   * **Validates: Requirements 8.1**
   */
  it('Property 4f: deprecated components excluded unless includeDeprecated is true', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        fc.string({ minLength: 1, maxLength: 100 }),
        (name, deprecationMessage) => {
          const component = createMockComponent(name);
          registry.register({ 
            name, 
            component, 
            deprecated: true, 
            deprecationMessage 
          });
          
          // Without includeDeprecated (default)
          const schemaWithout = generator.generate(name);
          expect(schemaWithout).toBeUndefined();
          
          // With includeDeprecated
          const schemaWith = generator.generate(name, { includeDeprecated: true });
          expect(schemaWith).toBeDefined();
          expect(schemaWith!.deprecated).toBe(true);
          expect(schemaWith!.deprecationMessage).toBe(deprecationMessage);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('SchemaGenerator.generateAll', () => {
  let registry: ComponentRegistry;
  let generator: SchemaGenerator;

  beforeEach(() => {
    registry = new ComponentRegistry();
    generator = createSchemaGenerator(registry);
    generator.clearCache();
  });

  /**
   * Property 4g: generateAll returns schemas for all registered components
   * 
   * **Validates: Requirements 8.1, 8.2**
   */
  it('Property 4g: generateAll returns schemas for all non-deprecated components', () => {
    fc.assert(
      fc.property(
        fc.array(componentNameArb, { minLength: 1, maxLength: 5 })
          .map(names => [...new Set(names)]),
        (names) => {
          // Create fresh registry for each test run
          const testRegistry = new ComponentRegistry();
          const testGenerator = createSchemaGenerator(testRegistry);
          
          // Register all components (none deprecated)
          for (const name of names) {
            testRegistry.register({
              name,
              component: createMockComponent(name),
              deprecated: false,
            });
          }
          
          const allSchemas = testGenerator.generateAll();
          
          // Should have schema for each component
          expect(Object.keys(allSchemas).length).toBe(names.length);
          
          for (const name of names) {
            expect(allSchemas).toHaveProperty(name);
            expect(allSchemas[name].component).toBe(name);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4h: generateAll respects platform filter
   * 
   * **Validates: Requirements 8.2**
   */
  it('Property 4h: generateAll respects platform filter', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(componentNameArb, platformsArb),
          { minLength: 1, maxLength: 5 }
        ).map(items => {
          const seen = new Set<string>();
          return items.filter(([name]) => {
            if (seen.has(name)) return false;
            seen.add(name);
            return true;
          });
        }),
        platformArb,
        (componentSpecs, queryPlatform) => {
          // Create fresh registry for each test run
          const testRegistry = new ComponentRegistry();
          const testGenerator = createSchemaGenerator(testRegistry);
          
          for (const [name, platforms] of componentSpecs) {
            testRegistry.register({
              name,
              component: createMockComponent(name),
              platforms,
            });
          }
          
          const allSchemas = testGenerator.generateAll({ platform: queryPlatform });
          
          // Count expected components
          const expectedCount = componentSpecs.filter(
            ([, platforms]) => platforms.includes(queryPlatform)
          ).length;
          
          expect(Object.keys(allSchemas).length).toBe(expectedCount);
          
          // All returned schemas should support the platform
          for (const schema of Object.values(allSchemas)) {
            if (schema.platforms && schema.platforms.length > 0) {
              expect(schema.platforms).toContain(queryPlatform);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('SchemaGenerator.loadOnDemand', () => {
  let registry: ComponentRegistry;
  let generator: SchemaGenerator;

  beforeEach(() => {
    registry = new ComponentRegistry();
    generator = createSchemaGenerator(registry);
    generator.clearCache();
  });

  /**
   * Property 4i: loadOnDemand caches results
   * 
   * **Validates: Requirements 8.2**
   */
  it('Property 4i: loadOnDemand caches results correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        componentNameArb,
        fc.option(versionArb, { nil: undefined }),
        fc.option(platformsArb, { nil: undefined }),
        propsSchemaArb,
        fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
        fc.option(categoryArb, { nil: undefined }),
        async (name, version, platforms, propsSchema, description, category) => {
          // Create fresh registry for each test run
          const testRegistry = new ComponentRegistry();
          const testGenerator = createSchemaGenerator(testRegistry);
          testGenerator.clearCache();
          
          // Register a non-deprecated component
          testRegistry.register({
            name,
            version,
            platforms,
            component: createMockComponent(name),
            propsSchema,
            description,
            category,
            deprecated: false, // Ensure not deprecated
          });
          
          // Initial cache should be empty
          expect(testGenerator.getCacheSize()).toBe(0);
          
          // First load
          const schema1 = await testGenerator.loadOnDemand(name);
          expect(schema1).toBeDefined();
          expect(testGenerator.getCacheSize()).toBe(1);
          
          // Second load should return cached result
          const schema2 = await testGenerator.loadOnDemand(name);
          expect(schema2).toBeDefined();
          expect(testGenerator.getCacheSize()).toBe(1);
          
          // Both should be equal
          expect(schema1).toEqual(schema2);
          
          // Clear cache
          testGenerator.clearCache();
          expect(testGenerator.getCacheSize()).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4j: loadOnDemand returns undefined for non-existent components
   * 
   * **Validates: Requirements 8.2**
   */
  it('Property 4j: loadOnDemand returns undefined for non-existent components', async () => {
    await fc.assert(
      fc.asyncProperty(componentNameArb, async (name) => {
        // Don't register the component
        const schema = await generator.loadOnDemand(name);
        expect(schema).toBeUndefined();
        
        // Cache should not grow for non-existent components
        expect(generator.getCacheSize()).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});

describe('SchemaGenerator Events Generation', () => {
  let registry: ComponentRegistry;
  let generator: SchemaGenerator;

  beforeEach(() => {
    registry = new ComponentRegistry();
    generator = createSchemaGenerator(registry);
  });

  /**
   * Property 4k: Events are generated based on component category
   * 
   * **Validates: Requirements 8.3**
   */
  it('Property 4k: events are generated based on category', () => {
    fc.assert(
      fc.property(
        componentNameArb,
        categoryArb,
        (name, category) => {
          registry.register({
            name,
            component: createMockComponent(name),
            category,
          });
          
          const schema = generator.generate(name);
          expect(schema).toBeDefined();
          expect(schema!.events).toBeDefined();
          expect(schema!.events.length).toBeGreaterThan(0);
          
          // Verify events based on category
          const eventNames = schema!.events.map(e => e.name);
          
          switch (category) {
            case 'input':
              expect(eventNames).toContain('onChange');
              expect(eventNames).toContain('onFocus');
              expect(eventNames).toContain('onBlur');
              break;
            case 'navigation':
              expect(eventNames).toContain('onClick');
              expect(eventNames).toContain('onNavigate');
              break;
            case 'feedback':
              expect(eventNames).toContain('onClose');
              expect(eventNames).toContain('onAction');
              break;
            default:
              expect(eventNames).toContain('onClick');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
