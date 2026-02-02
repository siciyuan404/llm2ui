/**
 * RenderedUICard Component
 *
 * Displays UI Schema in chat with a compact preview.
 * No direct rendering in chat - only fullscreen preview, copy JSON, and apply to editor.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.10
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UIRenderer, defaultRegistry } from '@/lib';
import type { EventHandler } from '@/lib';
import type { UISchema, DataContext, EventAction } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface RenderedUICardProps {
  /** UI Schema to render */
  schema: UISchema;
  /** Data context for data binding */
  data?: DataContext;
  /** Callback when fullscreen preview is requested */
  onFullscreen?: () => void;
  /** Callback when copy JSON is clicked */
  onCopyJson?: (schema: UISchema) => void | Promise<void>;
  /** Callback when apply to editor is clicked */
  onApplyToEditor?: (schema: UISchema) => void | Promise<void>;
  /** Event handler for UI interactions */
  onEvent?: (componentId: string, event: string, payload: unknown) => void;
  /** Additional class name */
  className?: string;
}



// ============================================================================
// Icons
// ============================================================================

function MaximizeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="16"
      height="16"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="16"
      height="16"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="16"
      height="16"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function ApplyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="16"
      height="16"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}

function UIIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="20"
      height="20"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="20"
      height="20"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: (error: Error) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class RenderErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

// ============================================================================
// Sub-components
// ============================================================================

interface ActionButtonsProps {
  onFullscreen: () => void;
  onCopyJson: () => void | Promise<void>;
  onApplyToEditor?: () => void | Promise<void>;
  copied: boolean;
}

function ActionButtons({
  onFullscreen,
  onCopyJson,
  onApplyToEditor,
  copied,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onFullscreen}
        className="h-7 px-2 text-xs"
        title="全屏预览"
      >
        <MaximizeIcon className="mr-1" />
        全屏
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCopyJson}
        className="h-7 px-2 text-xs"
        title="复制 JSON"
      >
        {copied ? (
          <>
            <CheckIcon className="mr-1" />
            已复制
          </>
        ) : (
          <>
            <CopyIcon className="mr-1" />
            复制
          </>
        )}
      </Button>
      {onApplyToEditor && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onApplyToEditor}
          className="h-7 px-2 text-xs"
          title="应用到编辑器"
        >
          <ApplyIcon className="mr-1" />
          应用
        </Button>
      )}
    </div>
  );
}

interface ErrorDisplayProps {
  error: string;
  schema: UISchema;
}

function ErrorDisplay({ error, schema }: ErrorDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-destructive text-sm">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>渲染失败: {error}</span>
      </div>
      <pre className="bg-muted/50 rounded-md p-3 overflow-x-auto text-xs font-mono max-h-48">
        <code>{JSON.stringify(schema, null, 2)}</code>
      </pre>
    </div>
  );
}

function SchemaPreview({ schema }: { schema: UISchema }) {
  const componentType = schema.root?.type || 'Unknown';
  const componentId = schema.root?.id || '未命名';
  
  const childCount = React.useMemo(() => {
    if (schema.root?.children && Array.isArray(schema.root.children)) {
      return schema.root.children.length;
    }
    return 0;
  }, [schema.root]);

  const propsCount = React.useMemo(() => {
    let count = 0;
    if (schema.root?.props) {
      count += Object.keys(schema.root.props).length;
    }
    if (schema.root?.style) {
      count += Object.keys(schema.root.style).length;
    }
    return count;
  }, [schema.root]);

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <UIIcon className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-foreground">
            {componentType}
          </span>
          {schema.root?.id && (
            <span className="text-xs text-muted-foreground">
              #{componentId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{childCount} 个子组件</span>
          <span>•</span>
          <span>{propsCount} 个属性</span>
        </div>
      </div>
    </div>
  );
}

interface FullscreenPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: UISchema;
  data?: DataContext;
  onEvent?: EventHandler;
}

function FullscreenPreview({
  open,
  onOpenChange,
  schema,
  data,
  onEvent,
}: FullscreenPreviewProps) {
  const schemaWithData = React.useMemo(() => {
    if (data) {
      return { ...schema, data: { ...schema.data, ...data } };
    }
    return schema;
  }, [schema, data]);

  const [renderError, setRenderError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setRenderError(null);
    }
  }, [open]);

  const handleRenderError = React.useCallback((error: Error) => {
    setRenderError(error.message);
  }, []);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fullscreen-preview-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-[95vw] h-[95vh] max-w-[1600px] bg-background rounded-lg shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2
              id="fullscreen-preview-title"
              className="text-lg font-semibold"
            >
              UI 预览
            </h2>
            <p className="text-sm text-muted-foreground">
              {schema.root?.type} {schema.root?.id && `#${schema.root.id}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            title="关闭 (Esc)"
          >
            <CloseIcon />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {renderError ? (
            <ErrorDisplay error={renderError} schema={schema} />
          ) : (
            <RenderErrorBoundary
              fallback={(err) => {
                handleRenderError(err);
                return <ErrorDisplay error={err.message} schema={schema} />;
              }}
            >
              <UIRenderer
                schema={schemaWithData}
                registry={defaultRegistry}
                onEvent={onEvent}
                showErrors
              />
            </RenderErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * RenderedUICard - Displays UI Schema in chat without direct rendering
 * 
 * Features:
 * - Shows compact preview of UI Schema (type, id, child count, prop count)
 * - Provides fullscreen preview for full UI rendering
 * - Copy JSON and apply to editor functionality
 * - No direct rendering in chat - cleaner chat experience
 * - Supports UI interactions in fullscreen mode
 */
export function RenderedUICard({
  schema,
  data,
  onFullscreen,
  onCopyJson,
  onApplyToEditor,
  onEvent,
  className,
}: RenderedUICardProps) {
  const [isFullscreenOpen, setIsFullscreenOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleEvent: EventHandler = React.useCallback(
    (action: EventAction, event: React.SyntheticEvent, componentId: string) => {
      if (onEvent) {
        onEvent(componentId, action.type, { action, event });
      }
    },
    [onEvent]
  );

  const handleFullscreen = React.useCallback(() => {
    setIsFullscreenOpen(true);
    onFullscreen?.();
  }, [onFullscreen]);

  const handleCopyJson = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await onCopyJson?.(schema);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  }, [schema, onCopyJson]);

  const handleApplyToEditor = React.useCallback(async () => {
    await onApplyToEditor?.(schema);
  }, [schema, onApplyToEditor]);

  return (
    <>
      <div
        className={cn(
          'rounded-lg border border-primary/20 bg-primary/5',
          'overflow-hidden',
          className
        )}
        role="article"
        aria-label="AI 生成的 UI"
      >
        <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">
              ✨ AI 生成的 UI
            </span>
          </div>
          <ActionButtons
            onFullscreen={handleFullscreen}
            onCopyJson={handleCopyJson}
            onApplyToEditor={onApplyToEditor ? handleApplyToEditor : undefined}
            copied={copied}
          />
        </div>

        <div className="p-4">
          <SchemaPreview schema={schema} />
        </div>
      </div>

      <FullscreenPreview
        open={isFullscreenOpen}
        onOpenChange={setIsFullscreenOpen}
        schema={schema}
        data={data}
        onEvent={handleEvent}
      />
    </>
  );
}

export default RenderedUICard;
