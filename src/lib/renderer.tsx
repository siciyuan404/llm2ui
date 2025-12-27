/**
 * Renderer Module
 * 
 * Core rendering logic for the llm2ui system.
 * Renders UISchema to React components with data binding and event handling.
 * 
 * Requirements: 7.1, 4.4
 */

import React, { createElement, Fragment, useMemo, useCallback } from 'react';
import type { UIComponent, UISchema, DataContext, EventBinding, EventAction, StyleProps } from '../types';
import { ComponentRegistry, defaultRegistry } from './component-registry';
import { resolveBindings, resolveBinding, parsePath, resolvePath } from './data-binding';

/**
 * Event handler callback type
 */
export type EventHandler = (
  action: EventAction,
  event: React.SyntheticEvent,
  componentId: string
) => void;

/**
 * Render options for customizing rendering behavior
 */
export interface RenderOptions {
  /** Component registry to use (defaults to defaultRegistry) */
  registry?: ComponentRegistry;
  /** Event handler callback */
  onEvent?: EventHandler;
  /** Custom component for unknown types */
  unknownComponent?: React.ComponentType<{ type: string; id: string }>;
  /** Whether to show error boundaries */
  showErrors?: boolean;
}

/**
 * Render context passed down through the component tree
 */
interface RenderContext {
  registry: ComponentRegistry;
  data: DataContext;
  onEvent?: EventHandler;
  unknownComponent?: React.ComponentType<{ type: string; id: string }>;
  showErrors: boolean;
  /** Loop item context for nested loops */
  loopContext?: Record<string, unknown>;
}

/**
 * Default unknown component placeholder
 */
const DefaultUnknownComponent: React.FC<{ type: string; id: string }> = ({ type, id }) => (
  <div
    style={{
      padding: '8px',
      border: '1px dashed #ccc',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9',
      color: '#666',
      fontSize: '12px',
    }}
  >
    Unknown component: {type} (id: {id})
  </div>
);

/**
 * Convert StyleProps to React CSSProperties
 */
function stylePropsToCSS(styleProps?: StyleProps): React.CSSProperties | undefined {
  if (!styleProps) return undefined;

  const css: React.CSSProperties = {};

  if (styleProps.style) {
    Object.assign(css, styleProps.style);
  }
  if (styleProps.width !== undefined) css.width = styleProps.width;
  if (styleProps.height !== undefined) css.height = styleProps.height;
  if (styleProps.margin !== undefined) css.margin = styleProps.margin;
  if (styleProps.padding !== undefined) css.padding = styleProps.padding;
  if (styleProps.display) css.display = styleProps.display;
  if (styleProps.flexDirection) css.flexDirection = styleProps.flexDirection;
  if (styleProps.justifyContent) css.justifyContent = styleProps.justifyContent;
  if (styleProps.alignItems) css.alignItems = styleProps.alignItems;
  if (styleProps.gap !== undefined) css.gap = styleProps.gap;
  if (styleProps.backgroundColor) css.backgroundColor = styleProps.backgroundColor;
  if (styleProps.color) css.color = styleProps.color;
  if (styleProps.fontSize !== undefined) css.fontSize = styleProps.fontSize;
  if (styleProps.fontWeight !== undefined) css.fontWeight = styleProps.fontWeight;
  if (styleProps.borderRadius !== undefined) css.borderRadius = styleProps.borderRadius;
  if (styleProps.border) css.border = styleProps.border;

  return Object.keys(css).length > 0 ? css : undefined;
}


/**
 * Resolve props with data bindings
 */
function resolveProps(
  props: Record<string, unknown> | undefined,
  data: DataContext
): Record<string, unknown> {
  if (!props) return {};

  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      // Resolve binding expressions in string values
      resolved[key] = resolveBindings(value, data);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively resolve nested objects
      resolved[key] = resolveProps(value as Record<string, unknown>, data);
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}

/**
 * Create event handlers for a component
 */
function createEventHandlers(
  events: EventBinding[] | undefined,
  componentId: string,
  onEvent?: EventHandler
): Record<string, (e: React.SyntheticEvent) => void> {
  if (!events || !onEvent) return {};

  const handlers: Record<string, (e: React.SyntheticEvent) => void> = {};

  for (const binding of events) {
    const eventName = `on${binding.event.charAt(0).toUpperCase()}${binding.event.slice(1)}`;
    handlers[eventName] = (e: React.SyntheticEvent) => {
      onEvent(binding.action, e, componentId);
    };
  }

  return handlers;
}

/**
 * Evaluate a condition expression against data context
 */
function evaluateCondition(condition: string, data: DataContext): boolean {
  // Simple binding resolution - if it's a binding expression, resolve it
  if (condition.startsWith('{{') && condition.endsWith('}}')) {
    const result = resolveBinding(condition, data);
    if (result.success) {
      return Boolean(result.value);
    }
    return false;
  }

  // For simple truthy check on a path
  const parseResult = parsePath(condition);
  if (parseResult.success && parseResult.segments) {
    const result = resolvePath(parseResult.segments, data);
    if (result.success) {
      return Boolean(result.value);
    }
  }

  return false;
}

/**
 * Get loop items from data context
 */
function getLoopItems(source: string, data: DataContext): unknown[] {
  const parseResult = parsePath(source);
  if (!parseResult.success || !parseResult.segments) {
    return [];
  }

  const result = resolvePath(parseResult.segments, data);
  if (!result.success || !Array.isArray(result.value)) {
    return [];
  }

  return result.value;
}


/**
 * Render a single UIComponent
 */
function renderComponent(
  component: UIComponent,
  context: RenderContext,
  key?: string | number
): React.ReactNode {
  const { registry, data, onEvent, unknownComponent, loopContext } = context;

  // Merge loop context with data
  const mergedData: DataContext = loopContext ? { ...data, ...loopContext } : data;

  // Check condition
  if (component.condition) {
    const shouldRender = evaluateCondition(component.condition, mergedData);
    if (!shouldRender) {
      return null;
    }
  }

  // Handle loop rendering
  if (component.loop) {
    const items = getLoopItems(component.loop.source, mergedData);
    const itemName = component.loop.itemName || 'item';
    const indexName = component.loop.indexName || 'index';

    return createElement(
      Fragment,
      { key },
      items.map((item, index) => {
        // Create a component without the loop property to avoid infinite recursion
        const { loop, ...componentWithoutLoop } = component;
        const newContext: RenderContext = {
          ...context,
          loopContext: {
            ...loopContext,
            [itemName]: item,
            [indexName]: index,
          },
        };
        return renderComponent(
          { ...componentWithoutLoop, id: `${component.id}-${index}` },
          newContext,
          `${component.id}-${index}`
        );
      })
    );
  }

  // Get component definition from registry
  const componentDef = registry.get(component.type);

  if (!componentDef) {
    // Unknown component
    const UnknownComp = unknownComponent || DefaultUnknownComponent;
    return createElement(UnknownComp, { key, type: component.type, id: component.id });
  }

  // Resolve props with data bindings
  const resolvedProps = resolveProps(component.props, mergedData);

  // Add style props
  const style = stylePropsToCSS(component.style);
  if (style) {
    resolvedProps.style = { ...(resolvedProps.style as React.CSSProperties || {}), ...style };
  }

  // Add className if present
  if (component.style?.className) {
    resolvedProps.className = component.style.className;
  }

  // Create event handlers
  const eventHandlers = createEventHandlers(component.events, component.id, onEvent);

  // Merge all props
  const finalProps = {
    ...resolvedProps,
    ...eventHandlers,
    key,
  };

  // Resolve text content with bindings
  let textContent: string | undefined;
  if (component.text) {
    textContent = resolveBindings(component.text, mergedData);
  }

  // Resolve binding value
  let bindingValue: unknown;
  if (component.binding) {
    const bindingResult = resolveBinding(component.binding, mergedData);
    if (bindingResult.success) {
      bindingValue = bindingResult.value;
    }
  }

  // Render children
  let children: React.ReactNode = null;

  if (component.children && component.children.length > 0) {
    children = component.children.map((child, index) =>
      renderComponent(child, context, `${child.id}-${index}`)
    );
  } else if (textContent !== undefined) {
    children = textContent;
  } else if (bindingValue !== undefined) {
    // Convert binding value to displayable content
    if (typeof bindingValue === 'string' || typeof bindingValue === 'number') {
      children = String(bindingValue);
    } else if (bindingValue !== null && typeof bindingValue === 'object') {
      children = JSON.stringify(bindingValue);
    }
  }

  return createElement(componentDef.component, finalProps, children);
}


/**
 * Render a UISchema to React elements
 * 
 * @param schema - The UISchema to render
 * @param options - Render options
 * @returns React element tree
 */
export function render(
  schema: UISchema,
  options: RenderOptions = {}
): React.ReactNode {
  const {
    registry = defaultRegistry,
    onEvent,
    unknownComponent,
    showErrors = false,
  } = options;

  const context: RenderContext = {
    registry,
    data: schema.data || {},
    onEvent,
    unknownComponent,
    showErrors,
  };

  return renderComponent(schema.root, context);
}

/**
 * React component wrapper for rendering UISchema
 */
export interface UIRendererProps {
  /** The UISchema to render */
  schema: UISchema;
  /** Component registry to use */
  registry?: ComponentRegistry;
  /** Event handler callback */
  onEvent?: EventHandler;
  /** Custom component for unknown types */
  unknownComponent?: React.ComponentType<{ type: string; id: string }>;
  /** Whether to show error boundaries */
  showErrors?: boolean;
}

/**
 * UIRenderer component - renders a UISchema as React components
 */
export const UIRenderer: React.FC<UIRendererProps> = ({
  schema,
  registry = defaultRegistry,
  onEvent,
  unknownComponent,
  showErrors = false,
}) => {
  // Memoize the render context
  const context = useMemo<RenderContext>(
    () => ({
      registry,
      data: schema.data || {},
      onEvent,
      unknownComponent,
      showErrors,
    }),
    [registry, schema.data, onEvent, unknownComponent, showErrors]
  );

  // Memoize the rendered output
  const rendered = useMemo(
    () => renderComponent(schema.root, context),
    [schema.root, context]
  );

  return createElement(Fragment, null, rendered);
};

/**
 * Hook for using the renderer with state management
 */
export function useRenderer(
  schema: UISchema,
  options: RenderOptions = {}
): {
  rendered: React.ReactNode;
  handleEvent: EventHandler;
} {
  const handleEvent = useCallback<EventHandler>(
    (action, event, componentId) => {
      if (options.onEvent) {
        options.onEvent(action, event, componentId);
      }
    },
    [options.onEvent]
  );

  const rendered = useMemo(
    () => render(schema, { ...options, onEvent: handleEvent }),
    [schema, options.registry, options.unknownComponent, options.showErrors, handleEvent]
  );

  return { rendered, handleEvent };
}

/**
 * Extract the pure schema structure without framework-specific code
 * This demonstrates that the schema is framework-agnostic
 * 
 * @param schema - The UISchema
 * @returns A plain object representation of the schema
 */
export function extractPureSchema(schema: UISchema): object {
  return JSON.parse(JSON.stringify(schema));
}
