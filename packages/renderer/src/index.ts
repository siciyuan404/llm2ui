/**
 * LLM2UI SDK Entry Point
 * 
 * Main entry point for the LLM2UI JSON Renderer SDK.
 * Provides a simple API for rendering UI from JSON schemas,
 * similar to amis low-code framework.
 * 
 * @module @llm2ui/renderer
 * @see Requirements 14.1, 14.2, 14.4
 * 
 * @example
 * ```typescript
 * import { render, createRenderer, LLM2UI } from '@llm2ui/renderer';
 * 
 * // Simple render
 * render(schema, document.getElementById('app'));
 * 
 * // With options
 * const renderer = createRenderer({ theme: 'dark' });
 * renderer.render(schema, container);
 * 
 * // React component
 * <LLM2UI schema={schema} onEvent={handleEvent} />
 * ```
 */

// Re-export core types from main project
export type {
  UISchema,
  UIComponent,
  DataContext,
  EventBinding,
  EventAction,
  StyleProps,
  ValidationResult,
  ValidationError,
} from '@/types';

// Re-export component registry types
export type {
  PlatformType,
  ComponentCategory,
  ComponentDefinition,
  PropSchema,
  ComponentExample,
} from '@/lib/component-registry';

// Re-export renderer types
export type {
  EventHandler,
  RenderOptions,
  UIRendererProps,
} from '@/lib/renderer';

// Re-export core functionality
export {
  // Renderer
  render as renderToReact,
  UIRenderer,
  useRenderer,
} from '@/lib/renderer';

export {
  // Component Registry
  ComponentRegistry,
  defaultRegistry,
  validateComponentDefinition,
} from '@/lib/component-registry';

export {
  // Schema Generator
  SchemaGenerator,
  createSchemaGenerator,
} from '@/lib/schema-generator';

export type {
  SchemaGeneratorOptions,
  GeneratedSchema,
} from '@/lib/schema-generator';

export {
  // Template Manager
  TemplateManager,
  defaultTemplateManager,
} from '@/lib/template-manager';

export type {
  TemplateLayer,
  ComponentTemplate,
} from '@/lib/template-manager';

export {
  // Platform Adapter
  PlatformAdapter,
  createPlatformAdapter,
} from '@/lib/platform-adapter';

export type {
  PlatformMapping,
} from '@/lib/platform-adapter';

export {
  // Validation
  validateJSON,
  validateUISchema,
} from '@/lib/validation';

export {
  // Data Binding
  parseBindingExpression,
  resolveBindings,
  extractDataFields,
} from '@/lib/data-binding';

export {
  // Serialization
  serialize,
  deserialize,
  schemasEqual,
} from '@/lib/serialization';

export {
  // shadcn Components
  registerShadcnComponents,
  initializeDefaultRegistry,
} from '@/lib/shadcn-components';


// SDK-specific types and interfaces

import type { ComponentType } from 'react';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { UISchema } from '@/types';
import type { PlatformType } from '@/lib/component-registry';
import { UIRenderer, type EventHandler } from '@/lib/renderer';
import { defaultRegistry, ComponentRegistry } from '@/lib/component-registry';
import { initializeDefaultRegistry } from '@/lib/shadcn-components';

/**
 * Custom component definition for SDK registration
 * Simplified version of ComponentDefinition for external use
 */
export interface CustomComponentDefinition {
  /** Component name/type identifier */
  name: string;
  /** The actual React component */
  component: ComponentType<Record<string, unknown>>;
  /** Component description */
  description?: string;
  /** Component category for organization */
  category?: 'input' | 'layout' | 'display' | 'feedback' | 'navigation' | string;
  /** Props schema for validation */
  propsSchema?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
    required?: boolean;
    default?: unknown;
    description?: string;
    enum?: string[];
  }>;
  /** Searchable tags */
  tags?: string[];
  /** Icon name */
  icon?: string;
}

/**
 * SDK Renderer Options
 * Configuration options for creating a renderer instance
 */
export interface RendererOptions {
  /** Target platform for rendering */
  platform?: PlatformType;
  /** Theme mode */
  theme?: 'light' | 'dark';
  /** Locale for internationalization */
  locale?: string;
  /** Global event handler callback */
  onEvent?: EventHandler;
  /** Custom components to register (simple format) */
  customComponents?: Record<string, ComponentType<Record<string, unknown>>>;
  /** Custom component definitions with full metadata */
  customComponentDefinitions?: CustomComponentDefinition[];
  /** Component registry to use (defaults to defaultRegistry) */
  registry?: ComponentRegistry;
  /** Whether to show error boundaries */
  showErrors?: boolean;
}

/**
 * UI Event emitted by the renderer
 */
export interface UIEvent {
  /** Event type */
  type: string;
  /** Component ID that triggered the event */
  componentId: string;
  /** Event payload */
  payload?: unknown;
  /** Original DOM event */
  originalEvent?: Event;
}

/**
 * Event listener function type
 */
export type EventListener = (event: UIEvent) => void;


/**
 * LLM2UI Renderer Instance
 * Main renderer class for managing UI lifecycle
 */
export class LLM2UIRenderer {
  private root: Root | null = null;
  private container: HTMLElement | null = null;
  private currentSchema: UISchema | null = null;
  private options: RendererOptions;
  private eventListeners: Map<string, Set<EventListener>> = new Map();
  private registry: ComponentRegistry;
  private initialized: boolean = false;
  private registeredCustomComponents: Set<string> = new Set();

  constructor(options: RendererOptions = {}) {
    this.options = options;
    this.registry = options.registry || defaultRegistry;
  }

  /**
   * Initialize the renderer (register default components)
   */
  private ensureInitialized(): void {
    if (this.initialized) return;
    
    // Initialize default shadcn components if using default registry
    if (this.registry === defaultRegistry) {
      initializeDefaultRegistry();
    }

    // Register custom components if provided (simple format)
    if (this.options.customComponents) {
      for (const [name, component] of Object.entries(this.options.customComponents)) {
        this.registerComponent({
          name,
          component,
          description: `Custom component: ${name}`,
        });
      }
    }

    // Register custom component definitions if provided (full format)
    if (this.options.customComponentDefinitions) {
      for (const definition of this.options.customComponentDefinitions) {
        this.registerComponent(definition);
      }
    }

    this.initialized = true;
  }

  /**
   * Register a custom component
   * @param definition - The custom component definition
   * @throws Error if the component name is invalid
   */
  registerComponent(definition: CustomComponentDefinition): void {
    if (!definition.name || typeof definition.name !== 'string') {
      throw new Error('Component name is required and must be a string');
    }

    if (!definition.component) {
      throw new Error('Component is required');
    }

    try {
      this.registry.register({
        name: definition.name,
        component: definition.component,
        description: definition.description || `Custom component: ${definition.name}`,
        category: definition.category,
        propsSchema: definition.propsSchema,
        tags: definition.tags,
        icon: definition.icon,
      });
      this.registeredCustomComponents.add(definition.name);
    } catch (error) {
      throw new Error(`Failed to register component "${definition.name}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Register multiple custom components at once
   * @param definitions - Array of custom component definitions
   */
  registerComponents(definitions: CustomComponentDefinition[]): void {
    for (const definition of definitions) {
      this.registerComponent(definition);
    }
  }

  /**
   * Unregister a custom component
   * @param name - The component name to unregister
   * @returns True if the component was unregistered
   */
  unregisterComponent(name: string): boolean {
    if (!this.registeredCustomComponents.has(name)) {
      return false;
    }

    const result = this.registry.unregister(name);
    if (result) {
      this.registeredCustomComponents.delete(name);
    }
    return result;
  }

  /**
   * Check if a custom component is registered
   * @param name - The component name to check
   * @returns True if the component is registered
   */
  hasComponent(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Get all registered custom component names
   * @returns Array of custom component names registered via this renderer
   */
  getCustomComponentNames(): string[] {
    return Array.from(this.registeredCustomComponents);
  }

  /**
   * Get the component registry
   * @returns The component registry instance
   */
  getRegistry(): ComponentRegistry {
    return this.registry;
  }


  /**
   * Render a UISchema to a container element
   * @param schema - The UISchema to render
   * @param container - Target DOM container
   */
  render(schema: UISchema, container: HTMLElement): void {
    this.ensureInitialized();
    
    // Clean up existing render if different container
    if (this.container && this.container !== container) {
      this.destroy();
    }

    this.container = container;
    this.currentSchema = schema;

    // Create React root if needed
    if (!this.root) {
      this.root = createRoot(container);
    }

    // Create event handler that emits to listeners
    const handleEvent: EventHandler = (action, event, componentId) => {
      // Call global onEvent handler
      if (this.options.onEvent) {
        this.options.onEvent(action, event, componentId);
      }

      // Emit to registered listeners
      const uiEvent: UIEvent = {
        type: action.type,
        componentId,
        payload: action,
        originalEvent: event.nativeEvent,
      };

      this.emit(action.type, uiEvent);
      this.emit('*', uiEvent); // Wildcard listener
    };

    // Render the UIRenderer component
    this.root.render(
      createElement(UIRenderer, {
        schema,
        registry: this.registry,
        onEvent: handleEvent,
        showErrors: this.options.showErrors ?? false,
      })
    );
  }

  /**
   * Update the rendered UI with a new schema
   * @param schema - New UISchema to render
   */
  update(schema: UISchema): void {
    if (!this.container) {
      throw new Error('Renderer not initialized. Call render() first.');
    }
    this.render(schema, this.container);
  }

  /**
   * Destroy the renderer and clean up resources
   */
  destroy(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.container = null;
    this.currentSchema = null;
    this.eventListeners.clear();
  }

  /**
   * Register an event listener
   * @param event - Event type to listen for (or '*' for all events)
   * @param handler - Event handler function
   */
  on(event: string, handler: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
  }

  /**
   * Remove an event listener
   * @param event - Event type
   * @param handler - Handler to remove (if omitted, removes all handlers for event)
   */
  off(event: string, handler?: EventListener): void {
    if (!handler) {
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to registered listeners
   */
  private emit(event: string, uiEvent: UIEvent): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(uiEvent);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      }
    }
  }

  /**
   * Get the current schema
   */
  getSchema(): UISchema | null {
    return this.currentSchema;
  }

  /**
   * Get the container element
   */
  getContainer(): HTMLElement | null {
    return this.container;
  }

  /**
   * Check if renderer is mounted
   */
  isMounted(): boolean {
    return this.root !== null && this.container !== null;
  }
}


/**
 * Create a new renderer instance with options
 * @param options - Renderer configuration options
 * @returns LLM2UIRenderer instance
 */
export function createRenderer(options: RendererOptions = {}): LLM2UIRenderer {
  return new LLM2UIRenderer(options);
}

/**
 * Register a custom component globally to the default registry
 * @param definition - The custom component definition
 */
export function registerCustomComponent(definition: CustomComponentDefinition): void {
  if (!definition.name || typeof definition.name !== 'string') {
    throw new Error('Component name is required and must be a string');
  }

  if (!definition.component) {
    throw new Error('Component is required');
  }

  defaultRegistry.register({
    name: definition.name,
    component: definition.component,
    description: definition.description || `Custom component: ${definition.name}`,
    category: definition.category,
    propsSchema: definition.propsSchema,
    tags: definition.tags,
    icon: definition.icon,
  });
}

/**
 * Register multiple custom components globally to the default registry
 * @param definitions - Array of custom component definitions
 */
export function registerCustomComponents(definitions: CustomComponentDefinition[]): void {
  for (const definition of definitions) {
    registerCustomComponent(definition);
  }
}

/**
 * Unregister a custom component from the default registry
 * @param name - The component name to unregister
 * @returns True if the component was unregistered
 */
export function unregisterCustomComponent(name: string): boolean {
  return defaultRegistry.unregister(name);
}

/**
 * Render a UISchema to a container element (convenience function)
 * Creates a renderer instance and renders immediately
 * 
 * @param schema - The UISchema to render
 * @param container - Target DOM container
 * @param options - Optional renderer options
 * @returns LLM2UIRenderer instance for further control
 */
export function render(
  schema: UISchema,
  container: HTMLElement,
  options: RendererOptions = {}
): LLM2UIRenderer {
  const renderer = createRenderer(options);
  renderer.render(schema, container);
  return renderer;
}

// Re-export React component wrapper
export { LLM2UI } from './react/LLM2UI';
export type { LLM2UIProps, LLM2UIEvent, LLM2UIEventCallback } from './react/LLM2UI';

// Re-export Vue component wrapper (requires Vue 3 as peer dependency)
export {
  LLM2UI as LLM2UIVue,
  createLLM2UIComponent,
  useLLM2UI,
  isVueAvailable,
} from './vue/LLM2UI';
export type {
  LLM2UIProps as LLM2UIVueProps,
  LLM2UIEmits as LLM2UIVueEmits,
  LLM2UIEvent as LLM2UIVueEvent,
} from './vue/LLM2UI';
