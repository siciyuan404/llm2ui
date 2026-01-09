/**
 * LLM2UI Vue Component Wrapper
 * 
 * Vue 3 component wrapper for the LLM2UI JSON Renderer SDK.
 * Provides a declarative way to render UISchema in Vue applications.
 * 
 * Note: This module requires Vue 3 as a peer dependency.
 * 
 * @module @llm2ui/renderer/vue
 * @see Requirements 14.3, 14.5
 */

import type { UISchema, DataContext, EventAction } from '@/types';
import type { PlatformType } from '@/lib/component-registry';
import { LLM2UIRenderer, createRenderer, type RendererOptions } from '../index';

/**
 * UI Event emitted by the LLM2UI Vue component
 */
export interface LLM2UIEvent {
  /** Event type */
  type: string;
  /** Component ID that triggered the event */
  componentId: string;
  /** Event action payload */
  action: EventAction;
  /** Original DOM event */
  originalEvent?: Event;
}

/**
 * Custom component definition for SDK registration
 */
export interface CustomComponentDefinition {
  /** Component name/type identifier */
  name: string;
  /** The actual React component */
  component: unknown;
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
 * LLM2UI Vue Component Props
 */
export interface LLM2UIProps {
  /** The UISchema to render */
  schema: UISchema;
  /** Additional data context to merge with schema.data */
  data?: DataContext;
  /** Target platform for rendering */
  platform?: PlatformType;
  /** Theme mode */
  theme?: 'light' | 'dark';
  /** Custom CSS class name */
  class?: string;
  /** Whether to show error boundaries for component errors */
  showErrors?: boolean;
  /** Custom component definitions with full metadata */
  customComponentDefinitions?: CustomComponentDefinition[];
}

/**
 * LLM2UI Vue Component Emits
 */
export interface LLM2UIEmits {
  /** Emitted when a UI event occurs */
  (e: 'event', event: LLM2UIEvent): void;
  /** Emitted when rendering is complete */
  (e: 'render'): void;
  /** Emitted when an error occurs */
  (e: 'error', error: Error): void;
}


/**
 * Check if Vue is available at runtime
 */
function checkVueAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'Vue' in window;
  } catch {
    return false;
  }
}

/**
 * Vue 3 Component Definition Interface
 */
interface VueComponentDefinition {
  name: string;
  props: Record<string, unknown>;
  emits: string[];
  setup: (props: LLM2UIProps, context: { emit: (event: string, ...args: unknown[]) => void }) => VueSetupReturn;
}

/**
 * Vue setup function return type
 */
interface VueSetupReturn {
  containerRef: HTMLElement | null;
  renderSchema: () => void;
  cleanup: () => void;
  onMounted: () => void;
  onUpdated: () => void;
  onBeforeUnmount: () => void;
  setContainerRef: (el: HTMLElement | null) => void;
}

/**
 * Create the LLM2UI Vue component definition
 */
export function createLLM2UIComponent(): VueComponentDefinition {
  return {
    name: 'LLM2UI',
    
    props: {
      schema: {
        type: Object as unknown as () => UISchema,
        required: true,
      },
      data: {
        type: Object as unknown as () => DataContext,
        default: undefined,
      },
      platform: {
        type: String as unknown as () => PlatformType,
        default: undefined,
      },
      theme: {
        type: String as unknown as () => 'light' | 'dark',
        default: undefined,
      },
      showErrors: {
        type: Boolean,
        default: false,
      },
      customComponentDefinitions: {
        type: Array as unknown as () => CustomComponentDefinition[],
        default: undefined,
      },
    },
    
    emits: ['event', 'render', 'error'],
    
    setup(props: LLM2UIProps, { emit }: { emit: (event: string, ...args: unknown[]) => void }): VueSetupReturn {
      let renderer: LLM2UIRenderer | null = null;
      let containerRef: HTMLElement | null = null;
      
      function getMergedSchema(): UISchema {
        if (!props.data) return props.schema;
        
        return {
          ...props.schema,
          data: {
            ...props.schema.data,
            ...props.data,
          },
        };
      }
      
      function getRendererOptions(): RendererOptions {
        return {
          platform: props.platform,
          theme: props.theme,
          showErrors: props.showErrors,
          onEvent: (action, event, componentId) => {
            const llm2uiEvent: LLM2UIEvent = {
              type: action.type,
              componentId,
              action,
              originalEvent: event.nativeEvent,
            };
            
            try {
              emit('event', llm2uiEvent);
            } catch (error) {
              console.error('Error in LLM2UI event handler:', error);
              if (error instanceof Error) {
                emit('error', error);
              }
            }
          },
        };
      }
      
      function renderSchema(): void {
        if (!containerRef) return;
        
        try {
          const mergedSchema = getMergedSchema();
          
          if (!renderer) {
            renderer = createRenderer(getRendererOptions());
            renderer.render(mergedSchema, containerRef);
          } else {
            renderer.update(mergedSchema);
          }
          
          emit('render');
        } catch (error) {
          console.error('LLM2UI render error:', error);
          if (error instanceof Error) {
            emit('error', error);
          }
        }
      }
      
      function cleanup(): void {
        if (renderer) {
          renderer.destroy();
          renderer = null;
        }
      }
      
      return {
        containerRef,
        renderSchema,
        cleanup,
        onMounted: () => renderSchema(),
        onUpdated: () => renderSchema(),
        onBeforeUnmount: () => cleanup(),
        setContainerRef: (el: HTMLElement | null) => {
          containerRef = el;
        },
      };
    },
  };
}

/**
 * Pre-created LLM2UI Vue component
 */
export const LLM2UI = createLLM2UIComponent();

/**
 * Default export for convenience
 */
export default LLM2UI;


/**
 * Vue 3 Composable for LLM2UI
 */
export function useLLM2UI(options: RendererOptions = {}) {
  let renderer: LLM2UIRenderer | null = null;
  
  function render(schema: UISchema, container: HTMLElement): void {
    if (renderer) {
      renderer.destroy();
    }
    renderer = createRenderer(options);
    renderer.render(schema, container);
  }
  
  function update(schema: UISchema): void {
    if (!renderer) {
      throw new Error('Renderer not initialized. Call render() first.');
    }
    renderer.update(schema);
  }
  
  function destroy(): void {
    if (renderer) {
      renderer.destroy();
      renderer = null;
    }
  }
  
  function on(event: string, handler: (event: LLM2UIEvent) => void): void {
    if (renderer) {
      renderer.on(event, handler as unknown as (event: { type: string; componentId: string; payload?: unknown; originalEvent?: Event }) => void);
    }
  }
  
  function off(event: string, handler?: (event: LLM2UIEvent) => void): void {
    if (renderer) {
      renderer.off(event, handler as unknown as (event: { type: string; componentId: string; payload?: unknown; originalEvent?: Event }) => void);
    }
  }
  
  function isMounted(): boolean {
    return renderer?.isMounted() ?? false;
  }
  
  function getSchema(): UISchema | null {
    return renderer?.getSchema() ?? null;
  }
  
  return {
    render,
    update,
    destroy,
    on,
    off,
    isMounted,
    getSchema,
  };
}

/**
 * Type guard to check if Vue is available at runtime
 */
export function isVueAvailable(): boolean {
  return checkVueAvailable();
}
