/**
 * ErrorBoundary Component
 * 
 * React error boundary for catching rendering errors in the preview panel.
 * Provides graceful error handling and recovery.
 * 
 * Requirements: 4.5
 */

import * as React from 'react';

// ============================================================================
// Types
// ============================================================================

export interface FallbackProps {
  /** The error that was caught */
  error: Error;
  /** Function to reset the error boundary */
  resetErrorBoundary: () => void;
}

export interface ErrorBoundaryProps {
  /** Children to render */
  children: React.ReactNode;
  /** Fallback component to render on error */
  fallback: React.ComponentType<FallbackProps>;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Callback when error boundary is reset */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// Error Boundary Class Component
// ============================================================================

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      return (
        <Fallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

// ============================================================================
// Default Error Fallback
// ============================================================================

export function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-destructive font-semibold mb-2">渲染错误</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || '组件渲染时发生未知错误'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Unknown Component Placeholder
// ============================================================================

import {
  unknownComponentLogger,
  getUnknownComponentSuggestions,
} from '@/lib/error-handling';

export interface UnknownComponentProps {
  /** The unknown component type */
  type: string;
  /** The component ID */
  id: string;
  /** Whether to show suggestions */
  showSuggestions?: boolean;
  /** Context information for logging */
  context?: string;
}

export function UnknownComponentPlaceholder({
  type,
  id,
  showSuggestions = true,
  context,
}: UnknownComponentProps) {
  // Log the unknown component
  React.useEffect(() => {
    unknownComponentLogger.log(type, id, context);
  }, [type, id, context]);

  const suggestions = showSuggestions ? getUnknownComponentSuggestions(type) : [];

  return (
    <div className="inline-flex flex-col gap-1 px-3 py-2 bg-muted border border-dashed border-muted-foreground/30 rounded-md text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          未知组件: <code className="font-mono">{type}</code>
          <span className="opacity-50 ml-1">(id: {id})</span>
        </span>
      </div>
      {suggestions.length > 0 && (
        <div className="text-xs opacity-75 pl-6">
          建议使用: {suggestions.map((s, i) => (
            <code key={s} className="font-mono bg-background/50 px-1 rounded">
              {s}
              {i < suggestions.length - 1 ? ', ' : ''}
            </code>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Unknown Component List Panel
// ============================================================================

export interface UnknownComponentListProps {
  /** Additional class name */
  className?: string;
}

export function UnknownComponentList({ className }: UnknownComponentListProps) {
  const [logs, setLogs] = React.useState(unknownComponentLogger.getLogs());

  React.useEffect(() => {
    const unsubscribe = unknownComponentLogger.addListener(() => {
      setLogs(unknownComponentLogger.getLogs());
    });
    return unsubscribe;
  }, []);

  const uniqueTypes = React.useMemo(() => {
    const typeMap = new Map<string, { count: number; suggestions: string[] }>();
    for (const log of logs) {
      const existing = typeMap.get(log.type);
      if (existing) {
        existing.count++;
      } else {
        typeMap.set(log.type, {
          count: 1,
          suggestions: getUnknownComponentSuggestions(log.type),
        });
      }
    }
    return typeMap;
  }, [logs]);

  if (uniqueTypes.size === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="text-sm font-medium mb-2 text-muted-foreground">
        未知组件 ({uniqueTypes.size})
      </div>
      <div className="space-y-1">
        {Array.from(uniqueTypes.entries()).map(([type, info]) => (
          <div
            key={type}
            className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1"
          >
            <code className="font-mono">{type}</code>
            <span className="text-muted-foreground">×{info.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ErrorBoundary;
