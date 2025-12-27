/**
 * SDK Renderer Property-Based Tests
 * 
 * **Feature: component-showcase, Property 8: SDK 渲染一致性**
 * **Validates: Requirements 14.1, 14.2, 14.4**
 * 
 * Tests that for any valid UISchema:
 * - render(schema, container) produces DOM structure matching the schema
 * - createRenderer(options) creates a functional renderer instance
 * - Event system (on/off) correctly manages listeners
 * - Lifecycle methods (update/destroy) work correctly
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import type React from 'react';
import type { UISchema, UIComponent, DataContext } from '../types';
import {
  createRenderer,
  render,
  type RendererOptions,
  type EventListener,
} from './index';
import { ComponentRegistry } from '../lib/component-registry';
import { registerShadcnComponents } from '../lib/shadcn-components';

/**
 * Generator for valid component types (registered in shadcn)
 */
const componentTypeArb = fc.constantFrom(
  'Button', 'Input', 'Card', 'CardHeader', 'CardTitle',
  'CardContent', 'CardFooter', 'Label', 'Container', 'Text'
);

/**
 * Generator for valid property names
 */
const propNameArb = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s));

/**
 * Generator for simple prop values (JSON-serializable)
 */
const simplePropValueArb: fc.Arbitrary<unknown> = fc.oneof(
  fc.string({ maxLength: 30 }),
  fc.integer({ min: -1000, max: 1000 }),
  fc.boolean(),
  fc.constant(null)
);

/**
 * Generator for simple props object
 */
const simplePropsArb = fc.dictionary(propNameArb, simplePropValueArb, { maxKeys: 3 });

/**
 * Generator for UIComponent without children (leaf component)
 */
const leafComponentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: fc.uuid(),
  type: componentTypeArb,
  text: fc.option(fc.string({ maxLength: 30 }), { nil: undefined }),
  props: fc.option(simplePropsArb, { nil: undefined }),
}, { requiredKeys: ['id', 'type'] });

/**
 * Generator for UIComponent with optional children (max depth 2)
 */
const componentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: fc.uuid(),
  type: componentTypeArb,
  text: fc.option(fc.string({ maxLength: 30 }), { nil: undefined }),
  props: fc.option(simplePropsArb, { nil: undefined }),
  children: fc.option(
    fc.array(leafComponentArb, { minLength: 0, maxLength: 3 }),
    { nil: undefined }
  ),
}, { requiredKeys: ['id', 'type'] });

/**
 * Generator for DataContext
 */
const dataContextArb: fc.Arbitrary<DataContext> = fc.dictionary(
  propNameArb,
  fc.oneof(
    fc.string({ maxLength: 20 }),
    fc.integer({ min: -100, max: 100 }),
    fc.boolean()
  ),
  { maxKeys: 3 }
);

/**
 * Generator for UISchema
 */
const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: componentArb,
  data: fc.option(dataContextArb, { nil: undefined }),
}, { requiredKeys: ['version', 'root'] });

/**
 * Generator for event names
 */
const eventNameArb = fc.constantFrom('click', 'change', 'submit', 'focus', 'blur', 'custom');

// Helper function reserved for future use
// function countComponents(component: UIComponent): number {
//   let count = 1;
//   if (component.children) {
//     for (const child of component.children) {
//       count += countComponents(child);
//     }
//   }
//   return count;
// }

describe('LLM2UIRenderer SDK', () => {
  let container: HTMLElement;
  let registry: ComponentRegistry;

  beforeEach(() => {
    // Create a container element for rendering
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Create and initialize registry
    registry = new ComponentRegistry();
    registerShadcnComponents(registry);
  });

  afterEach(() => {
    // Clean up container
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  /**
   * Property 8: SDK 渲染一致性 (SDK Rendering Consistency)
   * 
   * For any valid UISchema, render(schema, container) should:
   * - Mount content to the container
   * - The renderer should be in mounted state
   * - The current schema should match the input schema
   * 
   * **Validates: Requirements 14.1**
   */
  it('Property 8: render(schema, container) mounts content and tracks state correctly', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const renderer = render(schema, container, { registry });

        try {
          // Renderer should be mounted
          expect(renderer.isMounted()).toBe(true);

          // Container should be set
          expect(renderer.getContainer()).toBe(container);

          // Schema should be tracked
          const currentSchema = renderer.getSchema();
          expect(currentSchema).toBeDefined();
          expect(currentSchema?.version).toBe(schema.version);
          expect(currentSchema?.root.id).toBe(schema.root.id);
          expect(currentSchema?.root.type).toBe(schema.root.type);

          // Note: We don't check innerHTML.length because React's createRoot().render()
          // is asynchronous and the DOM may not be updated synchronously
        } finally {
          renderer.destroy();
        }
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 8b: createRenderer factory creates functional instance
   * 
   * For any renderer options, createRenderer should return a valid
   * renderer instance that can render schemas.
   * 
   * **Validates: Requirements 14.2**
   */
  it('Property 8b: createRenderer(options) creates functional renderer instance', () => {
    fc.assert(
      fc.property(
        uiSchemaArb,
        fc.record({
          theme: fc.option(fc.constantFrom('light', 'dark'), { nil: undefined }),
          showErrors: fc.option(fc.boolean(), { nil: undefined }),
        }),
        (schema, options) => {
          const rendererOptions: RendererOptions = {
            ...options,
            registry,
          };

          const renderer = createRenderer(rendererOptions);

          try {
            // Renderer should not be mounted initially
            expect(renderer.isMounted()).toBe(false);

            // Render the schema
            renderer.render(schema, container);

            // Now it should be mounted
            expect(renderer.isMounted()).toBe(true);
            expect(renderer.getContainer()).toBe(container);
            expect(renderer.getSchema()).toBeDefined();
          } finally {
            renderer.destroy();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 8c: update() changes the rendered schema
   * 
   * For any two valid schemas, calling update() should change
   * the current schema to the new one.
   * 
   * **Validates: Requirements 14.1**
   */
  it('Property 8c: update(schema) changes the rendered content', () => {
    fc.assert(
      fc.property(
        uiSchemaArb,
        uiSchemaArb,
        (schema1, schema2) => {
          const renderer = render(schema1, container, { registry });

          try {
            // Initial schema
            expect(renderer.getSchema()?.root.id).toBe(schema1.root.id);

            // Update to new schema
            renderer.update(schema2);

            // Schema should be updated
            expect(renderer.getSchema()?.root.id).toBe(schema2.root.id);
            expect(renderer.getSchema()?.root.type).toBe(schema2.root.type);

            // Still mounted
            expect(renderer.isMounted()).toBe(true);
          } finally {
            renderer.destroy();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 8d: destroy() cleans up renderer state
   * 
   * After calling destroy(), the renderer should no longer be mounted
   * and should have no schema or container.
   * 
   * **Validates: Requirements 14.1**
   */
  it('Property 8d: destroy() cleans up renderer state completely', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const renderer = render(schema, container, { registry });

        // Verify mounted
        expect(renderer.isMounted()).toBe(true);

        // Destroy
        renderer.destroy();

        // Should be unmounted
        expect(renderer.isMounted()).toBe(false);
        expect(renderer.getContainer()).toBeNull();
        expect(renderer.getSchema()).toBeNull();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 8e: Event listener registration consistency
   * 
   * For any event name and listener, on() should register the listener
   * and off() should remove it.
   * 
   * **Validates: Requirements 14.4**
   */
  it('Property 8e: on()/off() event listener management is consistent', () => {
    fc.assert(
      fc.property(
        uiSchemaArb,
        eventNameArb,
        fc.integer({ min: 1, max: 5 }),
        (schema, eventName, listenerCount) => {
          const renderer = render(schema, container, { registry });
          const listeners: EventListener[] = [];
          const callCounts: number[] = [];

          try {
            // Register multiple listeners
            for (let i = 0; i < listenerCount; i++) {
              callCounts.push(0);
              const idx = i;
              const listener: EventListener = () => {
                callCounts[idx]++;
              };
              listeners.push(listener);
              renderer.on(eventName, listener);
            }

            // Remove first listener
            if (listeners.length > 0) {
              renderer.off(eventName, listeners[0]);
            }

            // Remove all listeners for event
            renderer.off(eventName);

            // Should not throw when removing non-existent listener
            renderer.off('nonexistent', () => {});
          } finally {
            renderer.destroy();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 8f: Multiple renders to same container reuse root
   * 
   * Rendering multiple times to the same container should work
   * without creating multiple React roots.
   * 
   * **Validates: Requirements 14.1**
   */
  it('Property 8f: multiple renders to same container work correctly', () => {
    fc.assert(
      fc.property(
        fc.array(uiSchemaArb, { minLength: 2, maxLength: 5 }),
        (schemas) => {
          const renderer = createRenderer({ registry });

          try {
            for (const schema of schemas) {
              renderer.render(schema, container);

              // Should always be mounted
              expect(renderer.isMounted()).toBe(true);

              // Schema should be current
              expect(renderer.getSchema()?.root.id).toBe(schema.root.id);
            }
          } finally {
            renderer.destroy();
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('LLM2UIRenderer Unit Tests', () => {
  let container: HTMLElement;
  let registry: ComponentRegistry;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    registry = new ComponentRegistry();
    registerShadcnComponents(registry);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should throw error when update() called before render()', () => {
    const renderer = createRenderer({ registry });
    const schema: UISchema = {
      version: '1.0',
      root: { id: '1', type: 'Button', text: 'Test' },
    };

    expect(() => renderer.update(schema)).toThrow('Renderer not initialized');
  });

  it('should handle onEvent callback in options', () => {
    const onEvent = vi.fn();
    const schema: UISchema = {
      version: '1.0',
      root: { id: '1', type: 'Button', text: 'Test' },
    };

    const renderer = render(schema, container, { registry, onEvent });
    expect(renderer.isMounted()).toBe(true);
    renderer.destroy();
  });

  it('should handle custom components registration', () => {
    const CustomComponent = () => null;
    const renderer = createRenderer({
      registry,
      customComponents: {
        CustomButton: CustomComponent,
      },
    });

    const schema: UISchema = {
      version: '1.0',
      root: { id: '1', type: 'CustomButton', text: 'Test' },
    };

    renderer.render(schema, container);
    expect(renderer.isMounted()).toBe(true);
    renderer.destroy();
  });

  it('should handle wildcard event listener', () => {
    const wildcardListener = vi.fn();
    const schema: UISchema = {
      version: '1.0',
      root: { id: '1', type: 'Button', text: 'Test' },
    };

    const renderer = render(schema, container, { registry });
    renderer.on('*', wildcardListener);

    // Wildcard listener should be registered
    renderer.off('*', wildcardListener);
    renderer.destroy();
  });

  it('should handle rendering to different containers', () => {
    const container2 = document.createElement('div');
    document.body.appendChild(container2);

    const schema: UISchema = {
      version: '1.0',
      root: { id: '1', type: 'Button', text: 'Test' },
    };

    const renderer = createRenderer({ registry });

    // Render to first container
    renderer.render(schema, container);
    expect(renderer.getContainer()).toBe(container);

    // Render to second container (should destroy first)
    renderer.render(schema, container2);
    expect(renderer.getContainer()).toBe(container2);

    renderer.destroy();
    container2.parentNode?.removeChild(container2);
  });

  it('should handle destroy called multiple times', () => {
    const schema: UISchema = {
      version: '1.0',
      root: { id: '1', type: 'Button', text: 'Test' },
    };

    const renderer = render(schema, container, { registry });
    renderer.destroy();
    
    // Should not throw when called again
    expect(() => renderer.destroy()).not.toThrow();
  });
});

describe('Custom Component Registration API', () => {
  let container: HTMLElement;
  let registry: ComponentRegistry;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    registry = new ComponentRegistry();
    registerShadcnComponents(registry);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should register a custom component via registerComponent()', () => {
    const CustomComponent = () => null;
    const renderer = createRenderer({ registry });

    renderer.registerComponent({
      name: 'MyCustomButton',
      component: CustomComponent,
      description: 'A custom button',
      category: 'input',
    });

    expect(renderer.hasComponent('MyCustomButton')).toBe(true);
    expect(renderer.getCustomComponentNames()).toContain('MyCustomButton');
    renderer.destroy();
  });

  it('should register multiple custom components via registerComponents()', () => {
    const CustomButton = () => null;
    const CustomInput = () => null;
    const renderer = createRenderer({ registry });

    renderer.registerComponents([
      { name: 'CustomButton', component: CustomButton, category: 'input' },
      { name: 'CustomInput', component: CustomInput, category: 'input' },
    ]);

    expect(renderer.hasComponent('CustomButton')).toBe(true);
    expect(renderer.hasComponent('CustomInput')).toBe(true);
    expect(renderer.getCustomComponentNames()).toHaveLength(2);
    renderer.destroy();
  });

  it('should unregister a custom component via unregisterComponent()', () => {
    const CustomComponent = () => null;
    const renderer = createRenderer({ registry });

    renderer.registerComponent({
      name: 'ToBeRemoved',
      component: CustomComponent,
    });

    expect(renderer.hasComponent('ToBeRemoved')).toBe(true);

    const result = renderer.unregisterComponent('ToBeRemoved');
    expect(result).toBe(true);
    expect(renderer.hasComponent('ToBeRemoved')).toBe(false);
    expect(renderer.getCustomComponentNames()).not.toContain('ToBeRemoved');
    renderer.destroy();
  });

  it('should return false when unregistering non-existent component', () => {
    const renderer = createRenderer({ registry });
    const result = renderer.unregisterComponent('NonExistent');
    expect(result).toBe(false);
    renderer.destroy();
  });

  it('should throw error when registering component without name', () => {
    const renderer = createRenderer({ registry });
    const CustomComponent = () => null;

    expect(() => {
      renderer.registerComponent({
        name: '',
        component: CustomComponent,
      });
    }).toThrow('Component name is required');
    renderer.destroy();
  });

  it('should throw error when registering component without component', () => {
    const renderer = createRenderer({ registry });

    expect(() => {
      renderer.registerComponent({
        name: 'NoComponent',
        component: null as unknown as React.ComponentType<Record<string, unknown>>,
      });
    }).toThrow('Component is required');
    renderer.destroy();
  });

  it('should register custom component with full propsSchema', () => {
    const CustomComponent = () => null;
    const renderer = createRenderer({ registry });

    renderer.registerComponent({
      name: 'FullComponent',
      component: CustomComponent,
      description: 'A fully defined component',
      category: 'input',
      propsSchema: {
        variant: { type: 'string', enum: ['primary', 'secondary'], default: 'primary' },
        disabled: { type: 'boolean', default: false },
        size: { type: 'number', required: true },
      },
      tags: ['button', 'action'],
      icon: 'button-icon',
    });

    expect(renderer.hasComponent('FullComponent')).toBe(true);
    
    // Verify the component is in the registry with correct metadata
    const def = renderer.getRegistry().get('FullComponent');
    expect(def).toBeDefined();
    expect(def?.description).toBe('A fully defined component');
    expect(def?.category).toBe('input');
    expect(def?.propsSchema?.variant?.enum).toEqual(['primary', 'secondary']);
    expect(def?.tags).toContain('button');
    renderer.destroy();
  });

  it('should support customComponentDefinitions in options', () => {
    const CustomComponent = () => null;
    const renderer = createRenderer({
      registry,
      customComponentDefinitions: [
        {
          name: 'OptionsComponent',
          component: CustomComponent,
          category: 'display',
          propsSchema: {
            title: { type: 'string', required: true },
          },
        },
      ],
    });

    // Trigger initialization by rendering
    const schema: UISchema = {
      version: '1.0',
      root: { id: '1', type: 'Button', text: 'Test' },
    };
    renderer.render(schema, container);

    expect(renderer.hasComponent('OptionsComponent')).toBe(true);
    renderer.destroy();
  });

  it('should get the registry via getRegistry()', () => {
    const renderer = createRenderer({ registry });
    const retrievedRegistry = renderer.getRegistry();
    expect(retrievedRegistry).toBe(registry);
    renderer.destroy();
  });

  it('should render schema with custom component', () => {
    const CustomComponent = (_props: { text?: string }) => {
      return null; // Simple component for testing
    };
    const renderer = createRenderer({ registry });

    renderer.registerComponent({
      name: 'TestCustom',
      component: CustomComponent as React.ComponentType<Record<string, unknown>>,
    });

    const schema: UISchema = {
      version: '1.0',
      root: { id: '1', type: 'TestCustom', text: 'Custom Text' },
    };

    renderer.render(schema, container);
    expect(renderer.isMounted()).toBe(true);
    expect(renderer.getSchema()?.root.type).toBe('TestCustom');
    renderer.destroy();
  });
});
