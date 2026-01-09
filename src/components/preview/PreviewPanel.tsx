/**
 * PreviewPanel Component
 * 
 * Main preview panel for rendering UISchema in real-time.
 * Integrates with the Renderer and provides live updates.
 * 
 * Requirements: 4.1
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { UISchema, DataContext } from '@/types';
import { UIRenderer, defaultRegistry, initializeDefaultRegistry } from '@/lib';
import type { EventHandler, ComponentRegistry } from '@/lib';
import { ErrorBoundary, UnknownComponentPlaceholder, type FallbackProps } from './ErrorBoundary';

// ============================================================================
// Types
// ============================================================================

export interface PreviewPanelProps {
  /** The UISchema to render */
  schema: UISchema | null;
  /** Additional data context to merge with schema data */
  dataContext?: DataContext;
  /** Component registry to use (defaults to defaultRegistry) */
  registry?: ComponentRegistry;
  /** Event handler callback */
  onEvent?: EventHandler;
  /** Whether to show error boundaries */
  showErrors?: boolean;
  /** Additional class name */
  className?: string;
  /** Device preview mode */
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
  /** Theme mode */
  theme?: 'light' | 'dark';
}

// ============================================================================
// Device Dimensions
// ============================================================================

const DEVICE_DIMENSIONS = {
  desktop: { width: '100%', maxWidth: '100%' },
  tablet: { width: '768px', maxWidth: '768px' },
  mobile: { width: '375px', maxWidth: '375px' },
} as const;

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
      <svg
        className="w-16 h-16 mb-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      <p className="text-center text-sm">
        暂无预览内容
        <br />
        <span className="text-xs opacity-75">
          在编辑器中输入有效的 UI Schema 或通过聊天生成
        </span>
      </p>
    </div>
  );
}

// ============================================================================
// Error Fallback Component
// ============================================================================

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
        <h3 className="text-destructive font-semibold mb-2">渲染错误</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || '渲染 UI Schema 时发生错误'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="text-sm text-primary hover:underline"
        >
          重试
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

// Initialize registry on module load
let registryInitialized = false;

export function PreviewPanel({
  schema,
  dataContext,
  registry = defaultRegistry,
  onEvent,
  showErrors = true,
  className,
  deviceMode = 'desktop',
  theme = 'light',
}: PreviewPanelProps) {
  const [errorKey, setErrorKey] = React.useState(0);

  // Initialize registry once
  React.useEffect(() => {
    if (!registryInitialized) {
      initializeDefaultRegistry();
      registryInitialized = true;
    }
  }, []);

  // Merge data context with schema data
  const mergedSchema = React.useMemo<UISchema | null>(() => {
    if (!schema) return null;
    
    if (!dataContext) return schema;
    
    return {
      ...schema,
      data: {
        ...schema.data,
        ...dataContext,
      },
    };
  }, [schema, dataContext]);

  // Reset error boundary when schema changes
  React.useEffect(() => {
    setErrorKey(prev => prev + 1);
  }, [schema]);

  // Get device dimensions
  const deviceStyle = DEVICE_DIMENSIONS[deviceMode];

  // Handle error boundary reset
  const handleReset = React.useCallback(() => {
    setErrorKey(prev => prev + 1);
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden',
        theme === 'dark' ? 'dark bg-background' : 'bg-background',
        className
      )}
    >
      {/* Preview container */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className={cn(
            'mx-auto min-h-full transition-all duration-300',
            deviceMode !== 'desktop' && 'border rounded-lg shadow-sm bg-card'
          )}
          style={{
            width: deviceStyle.width,
            maxWidth: deviceStyle.maxWidth,
          }}
        >
          {!mergedSchema ? (
            <EmptyState />
          ) : (
            <ErrorBoundary
              key={errorKey}
              fallback={ErrorFallback}
              onReset={handleReset}
            >
              <div className="p-4">
                <UIRenderer
                  schema={mergedSchema}
                  registry={registry}
                  onEvent={onEvent}
                  showErrors={showErrors}
                  unknownComponent={UnknownComponentPlaceholder}
                />
              </div>
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewPanel;
