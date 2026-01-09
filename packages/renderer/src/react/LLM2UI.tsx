/**
 * LLM2UI React Component Wrapper
 * 
 * React component wrapper for the LLM2UI JSON Renderer SDK.
 * Provides a declarative way to render UISchema in React applications.
 * 
 * @module @llm2ui/renderer/react
 * @see Requirements 14.3, 14.5
 */

import React, { useEffect, useMemo, useCallback, useRef, type ComponentType } from 'react';
import type { UISchema, DataContext, EventAction } from '@/types';
import type { PlatformType } from '@/lib/component-registry';
import { UIRenderer, type EventHandler } from '@/lib/renderer';
import { defaultRegistry, ComponentRegistry } from '@/lib/component-registry';
import { initializeDefaultRegistry } from '@/lib/shadcn-components';

/**
 * UI Event emitted by the LLM2UI component
 */
export interface LLM2UIEvent {
  /** Event type */
  type: string;
  /** Component ID that triggered the event */
  componentId: string;
  /** Event action payload */
  action: EventAction;
  /** Original React synthetic event */
  originalEvent?: React.SyntheticEvent;
}

/**
 * Event callback function type
 */
export type LLM2UIEventCallback = (event: LLM2UIEvent) => void;

/**
 * Custom component definition for SDK registration
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
 * LLM2UI Component Props
 */
export interface LLM2UIProps {
  /** The UISchema to render */
  schema: UISchema;
  /** Additional data context to merge with schema.data */
  data?: DataContext;
  /** Event callback handler */
  onEvent?: LLM2UIEventCallback;
  /** Target platform for rendering */
  platform?: PlatformType;
  /** Theme mode */
  theme?: 'light' | 'dark';
  /** Custom CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Custom component registry */
  registry?: ComponentRegistry;
  /** Custom components to register (simple format: name -> component) */
  customComponents?: Record<string, ComponentType<Record<string, unknown>>>;
  /** Custom component definitions with full metadata */
  customComponentDefinitions?: CustomComponentDefinition[];
  /** Whether to show error boundaries for component errors */
  showErrors?: boolean;
  /** Custom component for unknown types */
  unknownComponent?: React.ComponentType<{ type: string; id: string }>;
  /** Callback when rendering is complete */
  onRender?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Initialize registry flag to prevent multiple initializations
 */
let defaultRegistryInitialized = false;

/**
 * Ensure default registry is initialized
 */
function ensureDefaultRegistryInitialized(): void {
  if (!defaultRegistryInitialized) {
    initializeDefaultRegistry();
    defaultRegistryInitialized = true;
  }
}

/**
 * LLM2UI React Component
 * 
 * A declarative React component for rendering UISchema.
 */
export const LLM2UI: React.FC<LLM2UIProps> = ({
  schema,
  data,
  onEvent,
  platform,
  theme,
  className,
  style,
  registry: customRegistry,
  customComponents,
  customComponentDefinitions,
  showErrors = false,
  unknownComponent,
  onRender,
  onError,
}) => {
  // Track if custom components have been registered
  const registeredComponentsRef = useRef<Set<string>>(new Set());
  
  // Get or create registry
  const registry = useMemo(() => {
    if (customRegistry) {
      return customRegistry;
    }
    ensureDefaultRegistryInitialized();
    return defaultRegistry;
  }, [customRegistry]);

  // Register custom components (simple format)
  useEffect(() => {
    if (!customComponents) return;

    for (const [name, component] of Object.entries(customComponents)) {
      if (!registeredComponentsRef.current.has(name)) {
        try {
          registry.register({
            name,
            component,
            description: `Custom component: ${name}`,
          });
          registeredComponentsRef.current.add(name);
        } catch (error) {
          console.warn(`Failed to register custom component "${name}":`, error);
        }
      }
    }
  }, [customComponents, registry]);

  // Register custom component definitions (full format)
  useEffect(() => {
    if (!customComponentDefinitions) return;

    for (const definition of customComponentDefinitions) {
      if (!registeredComponentsRef.current.has(definition.name)) {
        try {
          registry.register({
            name: definition.name,
            component: definition.component,
            description: definition.description || `Custom component: ${definition.name}`,
            category: definition.category,
            propsSchema: definition.propsSchema,
            tags: definition.tags,
            icon: definition.icon,
          });
          registeredComponentsRef.current.add(definition.name);
        } catch (error) {
          console.warn(`Failed to register custom component "${definition.name}":`, error);
        }
      }
    }
  }, [customComponentDefinitions, registry]);


  // Merge schema data with additional data prop
  const mergedSchema = useMemo<UISchema>(() => {
    if (!data) return schema;
    
    return {
      ...schema,
      data: {
        ...schema.data,
        ...data,
      },
    };
  }, [schema, data]);

  // Create event handler that wraps the callback
  const handleEvent = useCallback<EventHandler>(
    (action, event, componentId) => {
      if (onEvent) {
        const llm2uiEvent: LLM2UIEvent = {
          type: action.type,
          componentId,
          action,
          originalEvent: event,
        };
        
        try {
          onEvent(llm2uiEvent);
        } catch (error) {
          console.error('Error in LLM2UI event handler:', error);
          if (onError && error instanceof Error) {
            onError(error);
          }
        }
      }
    },
    [onEvent, onError]
  );

  // Call onRender callback after render
  useEffect(() => {
    if (onRender) {
      onRender();
    }
  }, [mergedSchema, onRender]);

  // Apply theme class
  const themeClass = theme === 'dark' ? 'dark' : '';
  const combinedClassName = [className, themeClass].filter(Boolean).join(' ') || undefined;

  // Wrap in container div for styling
  const containerStyle: React.CSSProperties = {
    ...style,
  };

  return (
    <div className={combinedClassName} style={containerStyle} data-llm2ui-root data-platform={platform}>
      <UIRenderer
        schema={mergedSchema}
        registry={registry}
        onEvent={handleEvent}
        unknownComponent={unknownComponent}
        showErrors={showErrors}
      />
    </div>
  );
};

/**
 * Default export for convenience
 */
export default LLM2UI;
