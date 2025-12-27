/**
 * Platform Adapter Property-Based Tests
 * 
 * **Feature: component-showcase, Property 6: 平台适配映射正确性**
 * **Validates: Requirements 7.2, 7.4, 7.5**
 * 
 * Tests that for any cross-platform component, the adapted schema maintains
 * semantic equivalence with only property names and style names being mapped.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import { PlatformAdapter, createPlatformAdapter } from './platform-adapter';
import type { PlatformMapping } from './platform-adapter';
import { ComponentRegistry } from './component-registry';
import type { PlatformType } from './component-registry';
import type { UISchema, UIComponent, StyleProps, EventBinding } from '../types';

/**
 * Create a mock React component for testing
 */
const createMockComponent = (name: string): React.ComponentType<Record<string, unknown>> => {
  const MockComponent: React.FC<Record<string, unknown>> = () => null;
  MockComponent.displayName = name;
  return MockComponent;
};

/**
 * Generator for platform types
 */
const platformArb = fc.constantFrom<PlatformType>('pc-web', 'mobile-web', 'mobile-native', 'pc-desktop');

/**
 * Generator for valid component IDs
 */
const componentIdArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0);

/**
 * Generator for valid component types
 */
const componentTypeArb = fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container', 'Image');

/**
 * Generator for simple props
 */
const propsArb = fc.option(
  fc.dictionary(
    fc.constantFrom('variant', 'size', 'disabled', 'placeholder', 'value', 'label'),
    fc.oneof(fc.string({ maxLength: 20 }), fc.integer({ min: 0, max: 100 }), fc.boolean()),
    { minKeys: 0, maxKeys: 4 }
  ),
  { nil: undefined }
);

/**
 * Generator for style props
 */
const stylePropsArb: fc.Arbitrary<StyleProps | undefined> = fc.option(
  fc.record({
    width: fc.option(fc.oneof(fc.constant('100%'), fc.integer({ min: 0, max: 500 })), { nil: undefined }),
    height: fc.option(fc.oneof(fc.constant('auto'), fc.integer({ min: 0, max: 500 })), { nil: undefined }),
    padding: fc.option(fc.integer({ min: 0, max: 50 }), { nil: undefined }),
    margin: fc.option(fc.integer({ min: 0, max: 50 }), { nil: undefined }),
    backgroundColor: fc.option(fc.constantFrom('#fff', '#000', 'red', 'blue'), { nil: undefined }),
    color: fc.option(fc.constantFrom('#333', '#666', 'white', 'black'), { nil: undefined }),
    fontSize: fc.option(fc.integer({ min: 10, max: 32 }), { nil: undefined }),
    borderRadius: fc.option(fc.integer({ min: 0, max: 20 }), { nil: undefined }),
  }),
  { nil: undefined }
);


/**
 * Generator for event bindings
 */
const eventBindingArb: fc.Arbitrary<EventBinding> = fc.record({
  event: fc.constantFrom('onClick', 'onChange', 'onFocus', 'onBlur', 'onMouseEnter', 'onMouseLeave'),
  action: fc.oneof(
    fc.record({ type: fc.constant('navigate' as const), url: fc.webUrl() }),
    fc.record({ type: fc.constant('submit' as const), endpoint: fc.option(fc.webUrl(), { nil: undefined }) }),
    fc.record({ type: fc.constant('toggle' as const), path: fc.string({ minLength: 1, maxLength: 20 }) })
  ),
});

const eventsArb = fc.option(
  fc.array(eventBindingArb, { minLength: 0, maxLength: 3 }),
  { nil: undefined }
);

/**
 * Generator for simple UIComponent (no children for simplicity)
 */
const simpleComponentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: componentIdArb,
  type: componentTypeArb,
  props: propsArb,
  style: stylePropsArb,
  text: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  events: eventsArb,
});

/**
 * Generator for UIComponent with children (max depth 2)
 */
const uiComponentArb: fc.Arbitrary<UIComponent> = fc.letrec(tie => ({
  leaf: simpleComponentArb,
  node: fc.record({
    id: componentIdArb,
    type: componentTypeArb,
    props: propsArb,
    style: stylePropsArb,
    text: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
    events: eventsArb,
    children: fc.array(tie('leaf') as fc.Arbitrary<UIComponent>, { minLength: 0, maxLength: 3 }),
  }),
})).node as fc.Arbitrary<UIComponent>;

/**
 * Generator for UISchema
 */
const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: uiComponentArb,
  data: fc.option(
    fc.dictionary(
      fc.string({ minLength: 1, maxLength: 10 }),
      fc.oneof(fc.string(), fc.integer(), fc.boolean()),
      { minKeys: 0, maxKeys: 3 }
    ),
    { nil: undefined }
  ),
  meta: fc.option(
    fc.record({
      title: fc.option(fc.string({ maxLength: 30 }), { nil: undefined }),
      description: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
    }),
    { nil: undefined }
  ),
});

/**
 * Count total components in a schema (including nested children)
 */
function countComponents(component: UIComponent): number {
  let count = 1;
  if (component.children) {
    for (const child of component.children) {
      count += countComponents(child);
    }
  }
  return count;
}

/**
 * Get all component IDs from a schema
 */
function getAllIds(component: UIComponent): string[] {
  const ids = [component.id];
  if (component.children) {
    for (const child of component.children) {
      ids.push(...getAllIds(child));
    }
  }
  return ids;
}

/**
 * Get all component types from a schema
 */
function getAllTypes(component: UIComponent): string[] {
  const types = [component.type];
  if (component.children) {
    for (const child of component.children) {
      types.push(...getAllTypes(child));
    }
  }
  return types;
}

/**
 * Count total props values (not keys) in a component tree
 */
function countPropValues(component: UIComponent): number {
  let count = component.props ? Object.values(component.props).length : 0;
  if (component.children) {
    for (const child of component.children) {
      count += countPropValues(child);
    }
  }
  return count;
}

/**
 * Count total style values in a component tree
 */
function countStyleValues(component: UIComponent): number {
  let count = component.style ? Object.values(component.style).filter(v => v !== undefined).length : 0;
  if (component.children) {
    for (const child of component.children) {
      count += countStyleValues(child);
    }
  }
  return count;
}

/**
 * Count total events in a component tree
 */
function countEvents(component: UIComponent): number {
  let count = component.events ? component.events.length : 0;
  if (component.children) {
    for (const child of component.children) {
      count += countEvents(child);
    }
  }
  return count;
}

describe('PlatformAdapter', () => {
  let adapter: PlatformAdapter;
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();
    adapter = new PlatformAdapter(registry);
  });

  describe('Basic Functionality', () => {
    it('should create adapter with factory function', () => {
      const factoryAdapter = createPlatformAdapter();
      expect(factoryAdapter).toBeInstanceOf(PlatformAdapter);
    });

    it('should create adapter with registry', () => {
      const adapterWithRegistry = createPlatformAdapter(registry);
      expect(adapterWithRegistry).toBeInstanceOf(PlatformAdapter);
    });
  });


  describe('Property 6: Platform Adaptation Semantic Equivalence', () => {
    /**
     * Property 6: 平台适配映射正确性 (Platform Adaptation Mapping Correctness)
     * 
     * For any cross-platform component, the adapted schema SHALL maintain
     * semantic equivalence with only property names and style names being mapped.
     * 
     * **Feature: component-showcase, Property 6: 平台适配映射正确性**
     * **Validates: Requirements 7.4**
     */
    it('Property 6: adapted schema preserves structure and component count', () => {
      fc.assert(
        fc.property(uiSchemaArb, platformArb, (schema, targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          
          // Structure should be preserved
          expect(adapted.version).toBe(schema.version);
          
          // Component count should be the same
          const originalCount = countComponents(schema.root);
          const adaptedCount = countComponents(adapted.root);
          expect(adaptedCount).toBe(originalCount);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6a: Component IDs are preserved after adaptation
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6a: component IDs are preserved after adaptation', () => {
      fc.assert(
        fc.property(uiSchemaArb, platformArb, (schema, targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          
          const originalIds = getAllIds(schema.root);
          const adaptedIds = getAllIds(adapted.root);
          
          expect(adaptedIds).toEqual(originalIds);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6b: Component types are preserved after adaptation
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6b: component types are preserved after adaptation', () => {
      fc.assert(
        fc.property(uiSchemaArb, platformArb, (schema, targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          
          const originalTypes = getAllTypes(schema.root);
          const adaptedTypes = getAllTypes(adapted.root);
          
          expect(adaptedTypes).toEqual(originalTypes);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6c: Props values are preserved (only keys may change)
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6c: props value count is preserved after adaptation', () => {
      fc.assert(
        fc.property(uiSchemaArb, platformArb, (schema, targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          
          const originalPropCount = countPropValues(schema.root);
          const adaptedPropCount = countPropValues(adapted.root);
          
          expect(adaptedPropCount).toBe(originalPropCount);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6d: Style values are preserved (only keys may change)
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6d: style value count is preserved after adaptation', () => {
      fc.assert(
        fc.property(uiSchemaArb, platformArb, (schema, targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          
          const originalStyleCount = countStyleValues(schema.root);
          const adaptedStyleCount = countStyleValues(adapted.root);
          
          expect(adaptedStyleCount).toBe(originalStyleCount);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6e: Event count is preserved after adaptation
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6e: event count is preserved after adaptation', () => {
      fc.assert(
        fc.property(uiSchemaArb, platformArb, (schema, targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          
          const originalEventCount = countEvents(schema.root);
          const adaptedEventCount = countEvents(adapted.root);
          
          expect(adaptedEventCount).toBe(originalEventCount);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6f: Text content is preserved after adaptation
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6f: text content is preserved after adaptation', () => {
      fc.assert(
        fc.property(uiSchemaArb, platformArb, (schema, targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          
          // Root text should be preserved
          expect(adapted.root.text).toBe(schema.root.text);
          
          // Children text should be preserved
          if (schema.root.children && adapted.root.children) {
            for (let i = 0; i < schema.root.children.length; i++) {
              expect(adapted.root.children[i].text).toBe(schema.root.children[i].text);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6g: Data context is preserved after adaptation
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6g: data context is preserved after adaptation', () => {
      fc.assert(
        fc.property(uiSchemaArb, platformArb, (schema, targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          
          expect(adapted.data).toEqual(schema.data);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 6h: Meta information is preserved after adaptation
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6h: meta information is preserved after adaptation', () => {
      fc.assert(
        fc.property(uiSchemaArb, platformArb, (schema, targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          
          expect(adapted.meta).toEqual(schema.meta);
        }),
        { numRuns: 100 }
      );
    });
  });


  describe('Event Mapping', () => {
    /**
     * Property 6i: Events are mapped according to platform rules
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6i: onClick maps to onTap for mobile-web', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'btn1',
          type: 'Button',
          events: [{ event: 'onClick', action: { type: 'navigate', url: '/test' } }],
        },
      };
      
      const adapted = adapter.adapt(schema, 'mobile-web');
      
      expect(adapted.root.events).toBeDefined();
      expect(adapted.root.events![0].event).toBe('onTap');
    });

    it('Property 6j: onClick maps to onPress for mobile-native', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'btn1',
          type: 'Button',
          events: [{ event: 'onClick', action: { type: 'navigate', url: '/test' } }],
        },
      };
      
      const adapted = adapter.adapt(schema, 'mobile-native');
      
      expect(adapted.root.events).toBeDefined();
      expect(adapted.root.events![0].event).toBe('onPress');
    });

    it('Property 6k: onChange maps to onChangeText for mobile-native Input', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'input1',
          type: 'Input',
          events: [{ event: 'onChange', action: { type: 'update', path: 'value', value: '' } }],
        },
      };
      
      const adapted = adapter.adapt(schema, 'mobile-native');
      
      expect(adapted.root.events).toBeDefined();
      expect(adapted.root.events![0].event).toBe('onChangeText');
    });
  });

  describe('getMapping', () => {
    /**
     * Property 6l: getMapping returns consistent mappings
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6l: getMapping returns valid mapping structure', () => {
      fc.assert(
        fc.property(componentTypeArb, platformArb, platformArb, (componentName, sourcePlatform, targetPlatform) => {
          const mapping = adapter.getMapping(componentName, sourcePlatform, targetPlatform);
          
          expect(mapping).toBeDefined();
          expect(mapping).toHaveProperty('props');
          expect(mapping).toHaveProperty('styles');
          expect(mapping).toHaveProperty('events');
          expect(typeof mapping.props).toBe('object');
          expect(typeof mapping.styles).toBe('object');
          expect(typeof mapping.events).toBe('object');
        }),
        { numRuns: 100 }
      );
    });

    it('getMapping returns mobile-native specific mappings for Button', () => {
      const mapping = adapter.getMapping('Button', 'pc-web', 'mobile-native');
      
      expect(mapping.events.onClick).toBe('onPress');
    });

    it('getMapping returns mobile-native specific mappings for Input', () => {
      const mapping = adapter.getMapping('Input', 'pc-web', 'mobile-native');
      
      expect(mapping.events.onChange).toBe('onChangeText');
    });
  });

  describe('isSupported', () => {
    /**
     * Property 6m: isSupported correctly checks platform support
     * 
     * **Validates: Requirements 7.5**
     */
    it('Property 6m: isSupported returns true when no registry', () => {
      const adapterNoRegistry = new PlatformAdapter();
      
      fc.assert(
        fc.property(componentTypeArb, platformArb, (componentName, platform) => {
          // Without registry, all components are considered supported
          expect(adapterNoRegistry.isSupported(componentName, platform)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('Property 6n: isSupported checks registry for platform support', () => {
      // Register a component with specific platforms
      registry.register({
        name: 'MobileButton',
        component: createMockComponent('MobileButton'),
        platforms: ['mobile-web', 'mobile-native'],
      });
      
      expect(adapter.isSupported('MobileButton', 'mobile-web')).toBe(true);
      expect(adapter.isSupported('MobileButton', 'mobile-native')).toBe(true);
      expect(adapter.isSupported('MobileButton', 'pc-web')).toBe(false);
      expect(adapter.isSupported('MobileButton', 'pc-desktop')).toBe(false);
    });

    it('Property 6o: isSupported returns false for unregistered components', () => {
      expect(adapter.isSupported('NonExistent', 'pc-web')).toBe(false);
    });

    it('Property 6p: isSupported returns true for components without platform restrictions', () => {
      registry.register({
        name: 'UniversalButton',
        component: createMockComponent('UniversalButton'),
        // No platforms specified
      });
      
      fc.assert(
        fc.property(platformArb, (platform) => {
          expect(adapter.isSupported('UniversalButton', platform)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });


  describe('registerMapping', () => {
    /**
     * Property 6q: Custom mappings override default mappings
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6q: custom mappings are used after registration', () => {
      const customMapping: PlatformMapping = {
        props: { customProp: 'mappedProp' },
        styles: { customStyle: 'mappedStyle' },
        events: { customEvent: 'mappedEvent' },
      };
      
      adapter.registerMapping('CustomComponent', 'mobile-web', customMapping);
      
      const retrieved = adapter.getMapping('CustomComponent', 'pc-web', 'mobile-web');
      
      expect(retrieved.props.customProp).toBe('mappedProp');
      expect(retrieved.styles.customStyle).toBe('mappedStyle');
      expect(retrieved.events.customEvent).toBe('mappedEvent');
    });

    it('Property 6r: custom mappings are retrievable via getMapping', () => {
      const customMapping: PlatformMapping = {
        props: { label: 'title' },
        styles: { customStyle: 'mappedStyle' },
        events: { onClick: 'onCustomClick' },
      };
      
      adapter.registerMapping('CustomButton', 'mobile-web', customMapping);
      
      // Custom mappings should be retrievable
      const retrieved = adapter.getMapping('CustomButton', 'pc-web', 'mobile-web');
      
      expect(retrieved.props.label).toBe('title');
      expect(retrieved.styles.customStyle).toBe('mappedStyle');
      expect(retrieved.events.onClick).toBe('onCustomClick');
    });
  });

  describe('getUnsupportedComponents', () => {
    /**
     * Property 6s: getUnsupportedComponents returns correct list
     * 
     * **Validates: Requirements 7.5**
     */
    it('Property 6s: getUnsupportedComponents returns empty array without registry', () => {
      const adapterNoRegistry = new PlatformAdapter();
      
      fc.assert(
        fc.property(platformArb, (platform) => {
          const unsupported = adapterNoRegistry.getUnsupportedComponents(platform);
          expect(unsupported).toEqual([]);
        }),
        { numRuns: 100 }
      );
    });

    it('Property 6t: getUnsupportedComponents lists components not supporting platform', () => {
      registry.register({
        name: 'WebOnly',
        component: createMockComponent('WebOnly'),
        platforms: ['pc-web'],
      });
      
      registry.register({
        name: 'MobileOnly',
        component: createMockComponent('MobileOnly'),
        platforms: ['mobile-web', 'mobile-native'],
      });
      
      registry.register({
        name: 'Universal',
        component: createMockComponent('Universal'),
        // No platforms = all supported
      });
      
      const unsupportedOnMobile = adapter.getUnsupportedComponents('mobile-web');
      expect(unsupportedOnMobile).toContain('WebOnly');
      expect(unsupportedOnMobile).not.toContain('MobileOnly');
      expect(unsupportedOnMobile).not.toContain('Universal');
      
      const unsupportedOnWeb = adapter.getUnsupportedComponents('pc-web');
      expect(unsupportedOnWeb).toContain('MobileOnly');
      expect(unsupportedOnWeb).not.toContain('WebOnly');
      expect(unsupportedOnWeb).not.toContain('Universal');
    });
  });

  describe('Nested Component Adaptation', () => {
    /**
     * Property 6u: Nested children are recursively adapted
     * 
     * **Validates: Requirements 7.4**
     */
    it('Property 6u: nested children events are mapped correctly', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'container',
          type: 'Container',
          children: [
            {
              id: 'btn1',
              type: 'Button',
              events: [{ event: 'onClick', action: { type: 'navigate', url: '/page1' } }],
            },
            {
              id: 'btn2',
              type: 'Button',
              events: [{ event: 'onClick', action: { type: 'navigate', url: '/page2' } }],
            },
          ],
        },
      };
      
      const adapted = adapter.adapt(schema, 'mobile-native');
      
      expect(adapted.root.children).toBeDefined();
      expect(adapted.root.children!.length).toBe(2);
      expect(adapted.root.children![0].events![0].event).toBe('onPress');
      expect(adapted.root.children![1].events![0].event).toBe('onPress');
    });

    /**
     * Property 6v: Deep nesting is handled correctly
     */
    it('Property 6v: deeply nested components are adapted', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          platformArb,
          (depth, targetPlatform) => {
            // Build a deeply nested schema
            let current: UIComponent = {
              id: `leaf`,
              type: 'Button',
              events: [{ event: 'onClick', action: { type: 'navigate', url: '/test' } }],
            };
            
            for (let i = depth - 1; i >= 0; i--) {
              current = {
                id: `level-${i}`,
                type: 'Container',
                children: [current],
              };
            }
            
            const schema: UISchema = { version: '1.0', root: current };
            const adapted = adapter.adapt(schema, targetPlatform);
            
            // Navigate to the leaf
            let adaptedCurrent = adapted.root;
            for (let i = 0; i < depth; i++) {
              expect(adaptedCurrent.children).toBeDefined();
              expect(adaptedCurrent.children!.length).toBe(1);
              adaptedCurrent = adaptedCurrent.children![0];
            }
            
            // Check the leaf event was mapped
            expect(adaptedCurrent.events).toBeDefined();
            if (targetPlatform === 'mobile-native') {
              expect(adaptedCurrent.events![0].event).toBe('onPress');
            } else if (targetPlatform === 'mobile-web') {
              expect(adaptedCurrent.events![0].event).toBe('onTap');
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
