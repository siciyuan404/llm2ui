/**
 * SchemaErrorPanel Component
 * 
 * Displays schema validation errors with fix suggestions.
 * Implements Requirement 2.6 - Schema error handling UI
 */

import * as React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SchemaErrorWithSuggestion, SchemaErrorState } from '@/lib/error-handling';

// ============================================================================
// Types
// ============================================================================

export interface SchemaErrorPanelProps {
  /** Error state to display */
  errorState: SchemaErrorState | null;
  /** Callback when auto-fix is applied */
  onAutoFix?: (fixedSchema: string) => void;
  /** Callback when an error is clicked (for navigation) */
  onErrorClick?: (path: string) => void;
  /** Whether the panel is collapsible */
  collapsible?: boolean;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ============================================================================
// Error Item Component
// ============================================================================

interface ErrorItemProps {
  error: SchemaErrorWithSuggestion;
  onAutoFix?: (fixedSchema: string) => void;
  onErrorClick?: (path: string) => void;
}

function ErrorItem({ error, onAutoFix, onErrorClick }: ErrorItemProps) {
  const [expanded, setExpanded] = React.useState(false);

  const handleClick = () => {
    if (onErrorClick && error.error.path) {
      onErrorClick(error.error.path);
    }
  };

  const handleAutoFix = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (error.autoFix && onAutoFix) {
      const fixed = error.autoFix('');
      onAutoFix(fixed);
    }
  };

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <div
        className={cn(
          'flex items-start gap-2 p-2 hover:bg-muted/50 cursor-pointer transition-colors',
          onErrorClick && 'cursor-pointer'
        )}
        onClick={handleClick}
      >
        <button
          className="mt-0.5 p-0.5 hover:bg-muted rounded"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? (
            <ChevronDownIcon className="h-3 w-3" />
          ) : (
            <ChevronRightIcon className="h-3 w-3" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground truncate">
              {error.error.path || 'root'}
            </span>
            <span className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive rounded">
              {error.error.code}
            </span>
          </div>
          <p className="text-sm text-foreground mt-0.5 line-clamp-2">
            {error.error.message}
          </p>
        </div>
        {error.autoFix && onAutoFix && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs shrink-0"
            onClick={handleAutoFix}
          >
            <WrenchIcon className="h-3 w-3 mr-1" />
            修复
          </Button>
        )}
      </div>
      {expanded && (
        <div className="px-8 pb-2">
          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
            <span className="font-medium">建议：</span> {error.suggestion}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SchemaErrorPanel({
  errorState,
  onAutoFix,
  onErrorClick,
  collapsible = true,
  className,
}: SchemaErrorPanelProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  if (!errorState?.hasErrors) {
    return null;
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 bg-destructive/10 border-b',
          collapsible && 'cursor-pointer hover:bg-destructive/15'
        )}
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        <AlertTriangleIcon className="h-4 w-4 text-destructive" />
        <span className="text-sm font-medium text-destructive flex-1">
          {errorState.summary}
        </span>
        {collapsible && (
          <button className="p-0.5 hover:bg-destructive/20 rounded">
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4 text-destructive" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-destructive" />
            )}
          </button>
        )}
      </div>

      {/* Error List */}
      {!collapsed && (
        <div className="max-h-60 overflow-y-auto">
          {errorState.errors.map((error, index) => (
            <ErrorItem
              key={`${error.error.path}-${index}`}
              error={error}
              onAutoFix={onAutoFix}
              onErrorClick={onErrorClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Inline Error Display
// ============================================================================

export interface InlineSchemaErrorProps {
  /** Single error to display */
  error: SchemaErrorWithSuggestion;
  /** Additional class name */
  className?: string;
}

export function InlineSchemaError({ error, className }: InlineSchemaErrorProps) {
  return (
    <Alert variant="destructive" className={cn('py-2', className)}>
      <AlertTriangleIcon className="h-4 w-4" />
      <AlertTitle className="text-sm">{error.error.message}</AlertTitle>
      <AlertDescription className="text-xs mt-1">
        {error.suggestion}
      </AlertDescription>
    </Alert>
  );
}

export default SchemaErrorPanel;
