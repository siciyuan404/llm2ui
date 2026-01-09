/**
 * Event Handler Module
 * 
 * Provides event handling utilities for the llm2ui system.
 * Handles component events and action dispatching.
 * 
 * @module lib/core/event-handler
 * @see Requirements 4.4
 */

import type { EventAction, DataContext } from '../../types';

/**
 * Event callback function type
 */
export type EventCallback = (
  action: EventAction,
  event: React.SyntheticEvent,
  componentId: string
) => void;

/**
 * Custom action handler type
 */
export type CustomActionHandler = (
  handler: string,
  params: Record<string, unknown> | undefined,
  event: React.SyntheticEvent,
  componentId: string
) => void;

/**
 * Navigate action handler type
 */
export type NavigateHandler = (url: string) => void;

/**
 * Submit action handler type
 */
export type SubmitHandler = (endpoint: string | undefined, event: React.SyntheticEvent) => void;

/**
 * Update action handler type
 */
export type UpdateHandler = (path: string, value: unknown) => void;

/**
 * Toggle action handler type
 */
export type ToggleHandler = (path: string) => void;

/**
 * Event handler configuration
 */
export interface EventHandlerConfig {
  /** Handler for navigate actions */
  onNavigate?: NavigateHandler;
  /** Handler for submit actions */
  onSubmit?: SubmitHandler;
  /** Handler for update actions */
  onUpdate?: UpdateHandler;
  /** Handler for toggle actions */
  onToggle?: ToggleHandler;
  /** Handler for custom actions */
  onCustom?: CustomActionHandler;
}

/**
 * Create an event callback from configuration
 * 
 * @param config - Event handler configuration
 * @returns Event callback function
 */
export function createEventCallback(config: EventHandlerConfig): EventCallback {
  return (action: EventAction, event: React.SyntheticEvent, componentId: string) => {
    switch (action.type) {
      case 'navigate':
        if (config.onNavigate) {
          config.onNavigate(action.url);
        }
        break;

      case 'submit':
        if (config.onSubmit) {
          event.preventDefault();
          config.onSubmit(action.endpoint, event);
        }
        break;

      case 'update':
        if (config.onUpdate) {
          config.onUpdate(action.path, action.value);
        }
        break;

      case 'toggle':
        if (config.onToggle) {
          config.onToggle(action.path);
        }
        break;

      case 'custom':
        if (config.onCustom) {
          config.onCustom(action.handler, action.params, event, componentId);
        }
        break;
    }
  };
}

/**
 * Default navigate handler using window.location
 */
export const defaultNavigateHandler: NavigateHandler = (url: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
};

/**
 * Create a state update handler for React state
 * 
 * @param setState - React setState function
 * @returns Update handler function
 */
export function createStateUpdateHandler(
  setState: React.Dispatch<React.SetStateAction<DataContext>>
): UpdateHandler {
  return (path: string, value: unknown) => {
    setState((prevState) => {
      const newState = { ...prevState };
      setNestedValue(newState, path, value);
      return newState;
    });
  };
}

/**
 * Create a state toggle handler for React state
 * 
 * @param setState - React setState function
 * @returns Toggle handler function
 */
export function createStateToggleHandler(
  setState: React.Dispatch<React.SetStateAction<DataContext>>
): ToggleHandler {
  return (path: string) => {
    setState((prevState) => {
      const newState = { ...prevState };
      const currentValue = getNestedValue(newState, path);
      setNestedValue(newState, path, !currentValue);
      return newState;
    });
  };
}

/**
 * Get a nested value from an object using dot notation path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Set a nested value in an object using dot notation path
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Extract event type from React event name
 * e.g., 'onClick' -> 'click', 'onChange' -> 'change'
 */
export function extractEventType(eventName: string): string {
  if (eventName.startsWith('on')) {
    const type = eventName.slice(2);
    return type.charAt(0).toLowerCase() + type.slice(1);
  }
  return eventName;
}

/**
 * Convert event type to React event handler name
 * e.g., 'click' -> 'onClick', 'change' -> 'onChange'
 */
export function toReactEventName(eventType: string): string {
  return `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
}
