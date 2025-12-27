/**
 * RenderedUICard Component
 * 
 * Renders UI Schema directly in the chat interface with action buttons.
 * Provides fullscreen preview, copy JSON, and apply to editor functionality.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.10
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UIRenderer, type EventHandler } from '@/lib/renderer';
import { defaultRegistry } from '@/lib/component-registry';
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
  onCopyJson?: () => void;
  /** Callback when apply to editor is clicked */
  onApplyToEditor?: () => void;
  /** Event handler for UI interactions */
  onEvent?: (componentId: string, event: string, payload: unknown) => void;
  /** Additional class name */
  className?: string;
}

export interface RenderedUICardState {
  /** Whether fullscreen dialog is open */
  isFullscreenOpen: boolean;
  /** Render error if any */
  renderError: string | null;
  /** Whether JSON was copied */
  copied: boolean;
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

function AlertIcon({ className }: { className?: string }) {
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
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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
  onCopyJson: () => void;
  onApplyToEditor?: () => void;
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
        <AlertIcon />
        <span>渲染失败: {error}</span>
      </div>
      <pre className="bg-muted/50 rounded-md p-3 overflow-x-auto text-xs font-mono max-h-48">
        <code>{JSON.stringify(schema, null, 2)}</code>
      </pre>
    </div>
  );
}

interface FullscreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: UISchema;
  data?: DataContext;
  onEvent?: EventHandler;
}

function FullscreenDialog({
  open,
  onOpenChange,
  schema,
  data,
  onEvent,
}: FullscreenDialogProps) {
  const schemaWithData = React.useMemo(() => {
    if (data) {
      return { ...schema, data: { ...schema.data, ...data } };
    }
    return schema;
  }, [schema, data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>UI 预览</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <RenderErrorBoundary
            fallback={(err) => (
              <ErrorDisplay error={err.message} schema={schema} />
            )}
          >
            <UIRenderer
              schema={schemaWithData}
              registry={defaultRegistry}
              onEvent={onEvent}
              showErrors
            />
          </RenderErrorBoundary>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * RenderedUICard - Renders UI Schema in chat with action buttons
 * 
 * Features:
 * - Renders UI Schema using the same renderer as preview panel
 * - Shows "AI 生成的 UI" label
 * - Provides fullscreen preview, copy JSON, apply to editor buttons
 * - Handles render errors gracefully with fallback to raw JSON
 * - Supports UI interactions (button clicks, input, etc.)
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
  const [renderError, setRenderError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Merge schema data with provided data
  const schemaWithData = React.useMemo(() => {
    if (data) {
      return { ...schema, data: { ...schema.data, ...data } };
    }
    return schema;
  }, [schema, data]);

  // Handle event from rendered UI
  const handleEvent: EventHandler = React.useCallback(
    (action: EventAction, event: React.SyntheticEvent, componentId: string) => {
      if (onEvent) {
        onEvent(componentId, action.type, { action, event });
      }
    },
    [onEvent]
  );

  // Handle fullscreen click
  const handleFullscreen = React.useCallback(() => {
    setIsFullscreenOpen(true);
    onFullscreen?.();
  }, [onFullscreen]);

  // Handle copy JSON click
  const handleCopyJson = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyJson?.();
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  }, [schema, onCopyJson]);

  // Handle apply to editor click
  const handleApplyToEditor = React.useCallback(() => {
    onApplyToEditor?.();
  }, [onApplyToEditor]);

  // Handle render error
  const handleRenderError = React.useCallback((error: Error) => {
    setRenderError(error.message);
  }, []);

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-primary/20 bg-primary/5',
        'overflow-hidden',
        className
      )}
      role="article"
      aria-label="AI 生成的 UI"
    >
      {/* Header */}
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

      {/* Content */}
      <div className="p-4">
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
              onEvent={handleEvent}
              showErrors
            />
          </RenderErrorBoundary>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <FullscreenDialog
        open={isFullscreenOpen}
        onOpenChange={setIsFullscreenOpen}
        schema={schema}
        data={data}
        onEvent={handleEvent}
      />
    </div>
  );
}

export default RenderedUICard;
