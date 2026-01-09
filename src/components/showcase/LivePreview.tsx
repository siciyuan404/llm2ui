/**
 * LivePreview - Real-time component preview renderer
 * 
 * Renders a component definition as a live interactive preview.
 * Supports different states (default, hover, disabled), themes (light/dark), 
 * responsive sizes (desktop/tablet/mobile), and error handling.
 * 
 * @module LivePreview
 * @see Requirements 2.1, 2.2, 2.3, 2.4, 15.2, 15.3
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentDefinition } from '@/lib';
import type { UISchema } from '@/types';
import { UIRenderer, defaultRegistry } from '@/lib';
import { ErrorBoundary, DefaultErrorFallback } from '@/components/preview/ErrorBoundary';

// ============================================================================
// Types
// ============================================================================

/**
 * Preview state for component display
 */
export type PreviewState = 'default' | 'hover' | 'disabled' | 'focus' | 'active';

/**
 * Preview theme for component display
 */
export type PreviewTheme = 'light' | 'dark';

/**
 * Preview size for responsive preview
 */
export type PreviewSizeType = 'desktop' | 'tablet' | 'mobile';

/**
 * Props for LivePreview component
 */
export interface LivePreviewProps {
  /** Component definition to preview */
  component: ComponentDefinition;
  /** Current preview state */
  state?: PreviewState;
  /** Preview theme (light or dark) */
  theme?: PreviewTheme;
  /** Preview size for responsive preview */
  previewSize?: PreviewSizeType;
  /** Whether to show state controls */
  showStateControls?: boolean;
  /** Callback when state changes */
  onStateChange?: (state: PreviewState) => void;
  /** Additional class name */
  className?: string;
  /** Preview container style */
  containerStyle?: React.CSSProperties;
}

/**
 * Props for PreviewStateControls
 */
interface PreviewStateControlsProps {
  currentState: PreviewState;
  onStateChange: (state: PreviewState) => void;
  availableStates: PreviewState[];
}

/**
 * Props for PreviewErrorFallback
 */
interface PreviewErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentName: string;
}

// ============================================================================
// Constants
// ============================================================================

const STATE_LABELS: Record<PreviewState, string> = {
  default: '默认',
  hover: '悬停',
  disabled: '禁用',
  focus: '聚焦',
  active: '激活',
};

const DEFAULT_STATES: PreviewState[] = ['default', 'hover', 'disabled'];

// ============================================================================
// Responsive Preview Dimensions
// ============================================================================

/**
 * Get container dimensions for responsive preview
 */
function getResponsiveDimensions(size: PreviewSizeType): React.CSSProperties {
  switch (size) {
    case 'mobile':
      return { width: '375px', maxWidth: '375px' };
    case 'tablet':
      return { width: '768px', maxWidth: '768px' };
    case 'desktop':
    default:
      return { width: '100%', maxWidth: '100%' };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a preview schema from component definition
 */
function generatePreviewSchema(
  component: ComponentDefinition,
  state: PreviewState
): UISchema {
  const baseProps: Record<string, unknown> = {};
  
  // Apply state-specific props
  if (state === 'disabled') {
    baseProps.disabled = true;
  }
  
  // Get default props from schema
  if (component.propsSchema) {
    for (const [key, schema] of Object.entries(component.propsSchema)) {
      if (schema.default !== undefined) {
        baseProps[key] = schema.default;
      }
    }
  }

  // Add common preview props based on component type
  const previewProps = getPreviewPropsForComponent(component.name, baseProps);

  return {
    version: '1.0',
    root: {
      id: `preview-${component.name}`,
      type: component.name,
      props: previewProps,
    },
  };
}

/**
 * Get preview-specific props for common component types
 */
function getPreviewPropsForComponent(
  componentName: string,
  baseProps: Record<string, unknown>
): Record<string, unknown> {
  const props = { ...baseProps };
  const lowerName = componentName.toLowerCase();

  // Add sensible defaults for common component types
  if (lowerName.includes('button')) {
    props.children = props.children ?? '按钮';
  } else if (lowerName.includes('input')) {
    props.placeholder = props.placeholder ?? '请输入...';
  } else if (lowerName.includes('card')) {
    props.children = props.children ?? '卡片内容';
  } else if (lowerName.includes('label')) {
    props.children = props.children ?? '标签';
  } else if (lowerName.includes('alert')) {
    props.children = props.children ?? '提示信息';
  } else if (lowerName.includes('table')) {
    // Tables need special handling
  }

  return props;
}

/**
 * Get available states for a component
 */
function getAvailableStates(component: ComponentDefinition): PreviewState[] {
  const states: PreviewState[] = ['default'];
  
  // Check if component supports disabled state
  if (component.propsSchema?.disabled) {
    states.push('disabled');
  }
  
  // Most interactive components support hover
  const interactiveCategories = ['input', 'navigation', 'feedback'];
  if (component.category && interactiveCategories.includes(component.category)) {
    states.push('hover');
  }
  
  // Input components typically support focus
  if (component.category === 'input') {
    states.push('focus');
  }

  return states.length > 1 ? states : DEFAULT_STATES;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Preview state control buttons
 */
function PreviewStateControls({
  currentState,
  onStateChange,
  availableStates,
}: PreviewStateControlsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-md">
      {availableStates.map((state) => (
        <button
          key={state}
          onClick={() => onStateChange(state)}
          className={cn(
            'px-2 py-1 text-xs rounded transition-colors',
            currentState === state
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground'
          )}
          aria-pressed={currentState === state}
        >
          {STATE_LABELS[state]}
        </button>
      ))}
    </div>
  );
}

/**
 * Custom error fallback for preview errors
 */
function PreviewErrorFallback({
  error,
  resetErrorBoundary,
  componentName,
}: PreviewErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-full">
        <svg
          className="w-8 h-8 mx-auto mb-2 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h4 className="text-destructive font-medium text-sm mb-1">
          {componentName} 渲染失败
        </h4>
        <p className="text-xs text-muted-foreground mb-3 break-all">
          {error.message || '未知错误'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}

/**
 * Placeholder when no preview is available
 */
function NoPreviewPlaceholder({ componentName }: { componentName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <svg
        className="w-8 h-8 opacity-30 mb-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <span className="text-xs opacity-50">{componentName}</span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * LivePreview - Renders a component definition as a live preview
 * 
 * Features:
 * - Real-time component rendering using UIRenderer
 * - State controls for different component states
 * - Theme support for light/dark mode preview
 * - Responsive preview sizes (desktop/tablet/mobile)
 * - Error boundary for graceful error handling
 * - Support for component examples
 * 
 * @see Requirements 2.1, 2.2, 2.3, 2.4, 15.2, 15.3
 */
export function LivePreview({
  component,
  state = 'default',
  theme = 'light',
  previewSize = 'desktop',
  showStateControls = false,
  onStateChange,
  className,
  containerStyle,
}: LivePreviewProps) {
  const [currentState, setCurrentState] = React.useState<PreviewState>(state);
  const [errorKey, setErrorKey] = React.useState(0);

  // Sync external state changes
  React.useEffect(() => {
    setCurrentState(state);
  }, [state]);

  // Get available states for this component
  const availableStates = React.useMemo(
    () => getAvailableStates(component),
    [component]
  );

  // Generate preview schema
  const previewSchema = React.useMemo(
    () => generatePreviewSchema(component, currentState),
    [component, currentState]
  );

  // Handle state change
  const handleStateChange = React.useCallback(
    (newState: PreviewState) => {
      setCurrentState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // Handle error reset
  const handleErrorReset = React.useCallback(() => {
    setErrorKey((k) => k + 1);
  }, []);

  // Check if component is registered
  const isRegistered = defaultRegistry.has(component.name);

  // Custom error fallback with component name
  const ErrorFallbackWithName = React.useCallback(
    (props: { error: Error; resetErrorBoundary: () => void }) => (
      <PreviewErrorFallback
        {...props}
        componentName={component.name}
      />
    ),
    [component.name]
  );

  // Get responsive dimensions
  const responsiveDimensions = React.useMemo(
    () => getResponsiveDimensions(previewSize),
    [previewSize]
  );

  // Merge container styles with responsive dimensions
  const mergedContainerStyle = React.useMemo(
    () => ({
      ...responsiveDimensions,
      ...containerStyle,
    }),
    [responsiveDimensions, containerStyle]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* State Controls */}
      {showStateControls && availableStates.length > 1 && (
        <div className="flex justify-center pb-2">
          <PreviewStateControls
            currentState={currentState}
            onStateChange={handleStateChange}
            availableStates={availableStates}
          />
        </div>
      )}

      {/* Preview Container with Theme and Responsive Support */}
      <div
        className={cn(
          'flex-1 flex items-center justify-center overflow-auto rounded-md transition-colors',
          currentState === 'hover' && 'bg-muted/20',
          // Apply theme-specific styles
          theme === 'dark' ? 'dark bg-slate-900' : 'bg-white'
        )}
        data-state={currentState}
        data-theme={theme}
        data-preview-size={previewSize}
      >
        {/* Responsive wrapper */}
        <div
          className={cn(
            'transition-all duration-200 mx-auto',
            previewSize !== 'desktop' && 'border border-dashed border-border rounded-md p-2'
          )}
          style={mergedContainerStyle}
        >
          {isRegistered ? (
            <ErrorBoundary
              key={errorKey}
              fallback={ErrorFallbackWithName}
              onReset={handleErrorReset}
            >
              <div
                className={cn(
                  'preview-wrapper',
                  currentState === 'hover' && '[&>*]:hover',
                  currentState === 'focus' && '[&>*]:focus',
                  currentState === 'active' && '[&>*]:active',
                  // Theme text color
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                )}
              >
                <UIRenderer
                  schema={previewSchema}
                  registry={defaultRegistry}
                />
              </div>
            </ErrorBoundary>
          ) : (
            <NoPreviewPlaceholder componentName={component.name} />
          )}
        </div>
      </div>

      {/* Size indicator for non-desktop sizes */}
      {previewSize !== 'desktop' && (
        <div className="text-center mt-2">
          <span className="text-xs text-muted-foreground">
            {previewSize === 'tablet' ? '768px' : '375px'}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Variant Preview Component
// ============================================================================

/**
 * Props for VariantPreview
 */
export interface VariantPreviewProps {
  /** Component definition */
  component: ComponentDefinition;
  /** Preview theme (light or dark) */
  theme?: PreviewTheme;
  /** Additional class name */
  className?: string;
}

/**
 * VariantPreview - Shows all variants of a component
 * 
 * Displays multiple states side by side for comparison.
 */
export function VariantPreview({ component, theme = 'light', className }: VariantPreviewProps) {
  const availableStates = React.useMemo(
    () => getAvailableStates(component),
    [component]
  );

  return (
    <div className={cn('grid gap-4', className)}>
      {availableStates.map((state) => (
        <div key={state} className="flex flex-col">
          <span className="text-xs text-muted-foreground mb-2">
            {STATE_LABELS[state]}
          </span>
          <div className={cn(
            'flex-1 p-4 border border-border rounded-md',
            theme === 'dark' ? 'bg-slate-900' : 'bg-background'
          )}>
            <LivePreview
              component={component}
              state={state}
              theme={theme}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example Preview Component
// ============================================================================

/**
 * Props for ExamplePreview
 */
export interface ExamplePreviewProps {
  /** Example schema to render */
  schema: UISchema;
  /** Example title */
  title?: string;
  /** Preview theme (light or dark) */
  theme?: PreviewTheme;
  /** Additional class name */
  className?: string;
}

/**
 * ExamplePreview - Renders a component example
 */
export function ExamplePreview({ schema, title, theme = 'light', className }: ExamplePreviewProps) {
  const [errorKey, setErrorKey] = React.useState(0);

  const handleErrorReset = React.useCallback(() => {
    setErrorKey((k) => k + 1);
  }, []);

  return (
    <div className={cn('flex flex-col', className)}>
      {title && (
        <span className="text-sm font-medium mb-2">{title}</span>
      )}
      <div className={cn(
        'flex-1 p-4 border border-border rounded-md transition-colors',
        theme === 'dark' ? 'dark bg-slate-900 text-slate-100' : 'bg-background'
      )}>
        <ErrorBoundary
          key={errorKey}
          fallback={DefaultErrorFallback}
          onReset={handleErrorReset}
        >
          <UIRenderer
            schema={schema}
            registry={defaultRegistry}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default LivePreview;
