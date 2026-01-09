/**
 * Schema Generator Property-Based Tests
 * 
 * **Feature: component-showcase, Property 4: Schema 生成一致性**
 * **Validates: Requirements 8.1, 8.3**
 * 
 * @module lib/utils/schema-generator.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import { SchemaGenerator, createSchemaGenerator } from './schema-generator';
import { ComponentRegistry } from '../core/component-registry';
import type { ComponentDefinition, PlatformType, PropSchema } from '../core/component-registry';

const createMockComponent = (name: string): React.ComponentType<Record<string, unknown>> => {
  const MockComponent: React.FC<Record<string, unknown>> = () => null;
  MockComponent.displayName = name;
  return MockComponent;
};

const componentNameArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);
const propTypeArb = fc.constantFrom('string', 'number', 'boolean', 'object', 'array', 'function') as fc.Arbitrary<PropSchema['type']>;
const categoryArb = fc.constantFrom('layout', 'input', 'display', 'navigation', 'feedback');
const platformArb = fc.constantFrom<PlatformType>('pc-web', 'mobile-web', 'mobile-native', 'pc-desktop');
const versionArb = fc.tuple(
  fc.integer({ min: 0, max: 10 }),
  fc.integer({ min: 0, max: 10 }),
  fc.integer({ min: 0, max: 10 })
).map(([major, minor, patch]) => `${major}.${minor}.${patch}`);

describe('SchemaGenerator', () => {
  let registry: ComponentRegistry;
  let generator: SchemaGenerator;

  beforeEach(() => {
    registry = new ComponentRegistry();
    generator = createSchemaGenerator(registry);
    generator.clearCache();
  });

  it('Property 4: generated schema contains all props from component definition', () => {
    fc.assert(
      fc.property(componentNameArb, (name) => {
        const propsSchema: Record<string, PropSchema> = {
          label: { type: 'string', required: true, description: 'Button label' },
          disabled: { type: 'boolean', required: false, default: false },
        };
        
        registry.register({
          name,
          component: createMockComponent(name),
          propsSchema,
          deprecated: false,
        });
        
        const schema = generator.generate(name, { includeDeprecated: true });
        
        expect(schema).toBeDefined();
        expect(schema!.component).toBe(name);
        expect(schema!.props).toHaveProperty('label');
        expect(schema!.props.label.type).toBe('string');
        expect(schema!.props.label.required).toBe(true);
        expect(schema!.props).toHaveProperty('disabled');
        expect(schema!.props.disabled.default).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  it('Property 4b: generated schema includes correct version', () => {
    fc.assert(
      fc.property(componentNameArb, versionArb, (name, version) => {
        registry.register({ name, component: createMockComponent(name), version });
        
        const schema = generator.generate(name);
        expect(schema).toBeDefined();
        expect(schema!.version).toBe(version);
      }),
      { numRuns: 50 }
    );
  });

  it('Property 4c: generated schema includes category and description', () => {
    fc.assert(
      fc.property(componentNameArb, categoryArb, fc.string({ minLength: 1, maxLength: 100 }), (name, category, description) => {
        registry.register({ name, component: createMockComponent(name), category, description });
        
        const schema = generator.generate(name);
        expect(schema).toBeDefined();
        expect(schema!.category).toBe(category);
        expect(schema!.description).toBe(description);
      }),
      { numRuns: 50 }
    );
  });

  it('Property 4f: deprecated components excluded unless includeDeprecated is true', () => {
    fc.assert(
      fc.property(componentNameArb, fc.string({ minLength: 1, maxLength: 100 }), (name, deprecationMessage) => {
        registry.register({ 
          name, 
          component: createMockComponent(name), 
          deprecated: true, 
          deprecationMessage 
        });
        
        const schemaWithout = generator.generate(name);
        expect(schemaWithout).toBeUndefined();
        
        const schemaWith = generator.generate(name, { includeDeprecated: true });
        expect(schemaWith).toBeDefined();
        expect(schemaWith!.deprecated).toBe(true);
      }),
      { numRuns: 50 }
    );
  });
});

describe('SchemaGenerator.generateAll', () => {
  let registry: ComponentRegistry;
  let generator: SchemaGenerator;

  beforeEach(() => {
    registry = new ComponentRegistry();
    generator = createSchemaGenerator(registry);
  });

  it('Property 4g: generateAll returns schemas for all non-deprecated components', () => {
    const names = ['Button', 'Input', 'Card'];
    
    for (const name of names) {
      registry.register({
        name,
        component: createMockComponent(name),
        deprecated: false,
      });
    }
    
    const allSchemas = generator.generateAll();
    expect(Object.keys(allSchemas).length).toBe(names.length);
    
    for (const name of names) {
      expect(allSchemas).toHaveProperty(name);
    }
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

  it('Property 4i: loadOnDemand caches results correctly', async () => {
    registry.register({
      name: 'CachedComponent',
      component: createMockComponent('CachedComponent'),
      deprecated: false,
    });
    
    expect(generator.getCacheSize()).toBe(0);
    
    const schema1 = await generator.loadOnDemand('CachedComponent');
    expect(schema1).toBeDefined();
    expect(generator.getCacheSize()).toBe(1);
    
    const schema2 = await generator.loadOnDemand('CachedComponent');
    expect(schema2).toBeDefined();
    expect(generator.getCacheSize()).toBe(1);
    
    expect(schema1).toEqual(schema2);
    
    generator.clearCache();
    expect(generator.getCacheSize()).toBe(0);
  });

  it('Property 4j: loadOnDemand returns undefined for non-existent components', async () => {
    const schema = await generator.loadOnDemand('NonExistent');
    expect(schema).toBeUndefined();
    expect(generator.getCacheSize()).toBe(0);
  });
});

describe('SchemaGenerator Events Generation', () => {
  let registry: ComponentRegistry;
  let generator: SchemaGenerator;

  beforeEach(() => {
    registry = new ComponentRegistry();
    generator = createSchemaGenerator(registry);
  });

  it('Property 4k: events are generated based on category', () => {
    fc.assert(
      fc.property(componentNameArb, categoryArb, (name, category) => {
        registry.register({
          name,
          component: createMockComponent(name),
          category,
        });
        
        const schema = generator.generate(name);
        expect(schema).toBeDefined();
        expect(schema!.events).toBeDefined();
        expect(schema!.events.length).toBeGreaterThan(0);
        
        const eventNames = schema!.events.map(e => e.name);
        
        switch (category) {
          case 'input':
            expect(eventNames).toContain('onChange');
            break;
          case 'navigation':
            expect(eventNames).toContain('onClick');
            break;
          default:
            expect(eventNames).toContain('onClick');
        }
      }),
      { numRuns: 50 }
    );
  });
});
