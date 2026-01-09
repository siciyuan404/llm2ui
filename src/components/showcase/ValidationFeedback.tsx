/**
 * ValidationFeedback - Validation result feedback UI component
 * 
 * Displays validation status, errors, and retry progress during LLM generation.
 * Provides visual feedback for generation states, error categorization, and
 * auto-fix suggestions.
 * 
 * @module ValidationFeedback
 * @see Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { 
  ValidationChainResult, 
  ChainValidationError 
} from '@/lib';
import type { RetryProgressEvent } from '@/lib';

// ============================================================================
// Types
// ============================================================================

/**
 * Generation status type
 */
export type GenerationStatus = 
  | 'idle'
  | 'generating'
  | 'validating'
  | 'retrying'
  | 'success'
  | 'error';

/**
 * Error category for grouping
 */
export type ErrorCategory = 
  | 'json'
  | 'schema'
  | 'component'
  | 'props'
  | 'style';

/**
 * Categorized error with metadata
 */
export interface CategorizedError extends ChainValidationError {
  /** Error category */
  category: ErrorCategory;
  /** Whether this error was fixed in a retry */
  isFixed?: boolean;
  /** Auto-fix suggestion if available */
  autoFix?: {
    description: string;
    apply: () => void;
  };
}

/**
 * Props for ValidationFeedback component
 */
export interface ValidationFeedbackProps {
  /** Current generation status */
  status: GenerationStatus;
  /** Validation result (when available) */
  validationResult?: ValidationChainResult;
  /** Retry progress event (when retrying) */
  retryProgress?: RetryProgressEvent;
  /** Generation time in milliseconds (when successful) */
  generationTime?: number;
  /** Errors from previous attempts (for showing fixed errors) */
  previousErrors?: ChainValidationError[];
  /** Callback when user clicks "Apply Suggestion" */
  onApplySuggestion?: (error: CategorizedError) => void;
  /** Callback when user clicks "Copy Error Report" */
  onCopyErrorReport?: () => void;
  /** Generated JSON for error highlighting */
  generatedJson?: string;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Categorize an error based on its layer
 */
export function categorizeError(error: ChainValidationError): ErrorCategory {
  switch (error.layer) {
    case 'json-syntax':
      return 'json';
    case 'schema-structure':
      return 'schema';
    case 'component-existence':
      return 'component';
    case 'props-validation':
      return 'props';
    case 'style-compliance':
      return 'style';
    default:
      return 'json';
  }
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: ErrorCategory): string {
  switch (category) {
    case 'json':
      return 'JSON Syntax';
    case 'schema':
      return 'Schema Structure';
    case 'component':
      return 'Component';
    case 'props':
      return 'Props';
    case 'style':
      return 'Style Compliance';
    default:
      return 'Unknown';
  }
}

/**
 * Get category icon
 */
function getCategoryIcon(category: ErrorCategory): React.ReactNode {
  switch (category) {
    case 'json':
      return <CodeIcon className="w-4 h-4" />;
    case 'schema':
      return <StructureIcon className="w-4 h-4" />;
    case 'component':
      return <ComponentIcon className="w-4 h-4" />;
    case 'props':
      return <PropsIcon className="w-4 h-4" />;
    case 'style':
      return <StyleIcon className="w-4 h-4" />;
    default:
      return <AlertIcon className="w-4 h-4" />;
  }
}

/**
 * Group errors by category
 */
export function groupErrorsByCategory(
  errors: ChainValidationError[]
): Map<ErrorCategory, CategorizedError[]> {
  const grouped = new Map<ErrorCategory, CategorizedError[]>();
  
  for (const error of errors) {
    const category = categorizeError(error);
    const categorizedError: CategorizedError = {
      ...error,
      category,
    };
    
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(categorizedError);
  }
  
  return grouped;
}

/**
 * Format error report as text
 */
export function formatErrorReport(
  errors: ChainValidationError[],
  warnings: ChainValidationError[] = []
): string {
  const lines: string[] = ['=== Validation Error Report ===', ''];
  
  if (errors.length > 0) {
    lines.push(`Errors (${errors.length}):`);
    lines.push('-'.repeat(40));
    
    const grouped = groupErrorsByCategory(errors);
    for (const [category, categoryErrors] of grouped) {
      lines.push(`\n[${getCategoryDisplayName(category)}]`);
      for (const error of categoryErrors) {
        lines.push(`  • ${error.message}`);
        if (error.path) {
          lines.push(`    Path: ${error.path}`);
        }
        if (error.suggestion) {
          lines.push(`    Suggestion: ${error.suggestion}`);
        }
      }
    }
  }
  
  if (warnings.length > 0) {
    lines.push('', `Warnings (${warnings.length}):`);
    lines.push('-'.repeat(40));
    for (const warning of warnings) {
      lines.push(`  ⚠ ${warning.message}`);
      if (warning.path) {
        lines.push(`    Path: ${warning.path}`);
      }
    }
  }
  
  lines.push('', '='.repeat(40));
  return lines.join('\n');
}

// ============================================================================
// Icons
// ============================================================================

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function StructureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function ComponentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function PropsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
}

function StyleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * LoadingState - Displays loading state during generation
 * @see Requirements 10.1
 */
interface LoadingStateProps {
  status: 'generating' | 'validating' | 'retrying';
  className?: string;
}

function LoadingState({ status, className }: LoadingStateProps) {
  const getMessage = () => {
    switch (status) {
      case 'generating':
        return 'Generating...';
      case 'validating':
        return 'Validating...';
      case 'retrying':
        return 'Retrying...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
      <LoadingSpinner className="w-4 h-4" />
      <span>{getMessage()}</span>
    </div>
  );
}

/**
 * SuccessState - Displays success state after successful generation
 * @see Requirements 10.2
 */
interface SuccessStateProps {
  generationTime?: number;
  className?: string;
}

function SuccessState({ generationTime, className }: SuccessStateProps) {
  const timeDisplay = generationTime 
    ? `Generated in ${(generationTime / 1000).toFixed(1)}s`
    : 'Generated successfully';

  return (
    <div className={cn('flex items-center gap-2 text-green-600 dark:text-green-400', className)}>
      <CheckIcon className="w-4 h-4" />
      <span>{timeDisplay}</span>
    </div>
  );
}

/**
 * ErrorState - Displays error state header
 * @see Requirements 10.5
 */
interface ErrorStateProps {
  errorCount: number;
  warningCount: number;
  className?: string;
}

function ErrorState({ errorCount, warningCount, className }: ErrorStateProps) {
  return (
    <div className={cn('flex items-center gap-2 text-red-600 dark:text-red-400', className)}>
      <AlertIcon className="w-4 h-4" />
      <span>
        {errorCount} error{errorCount !== 1 ? 's' : ''}
        {warningCount > 0 && `, ${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
      </span>
    </div>
  );
}

/**
 * RetryProgress - Displays retry progress during retries
 * @see Requirements 10.3, 10.4
 */
interface RetryProgressProps {
  progress: RetryProgressEvent;
  className?: string;
}

function RetryProgress({ progress, className }: RetryProgressProps) {
  const { attempt, totalAttempts, errorsFixed, errorsRemaining } = progress;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <LoadingSpinner className="w-4 h-4" />
        <span>
          Fixing issues... (Attempt {attempt}/{totalAttempts}, {errorsRemaining} error{errorsRemaining !== 1 ? 's' : ''} remaining)
        </span>
      </div>
      
      {errorsFixed > 0 && (
        <div className="text-sm text-green-600 dark:text-green-400">
          ✓ {errorsFixed} error{errorsFixed !== 1 ? 's' : ''} fixed
        </div>
      )}
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div 
          className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(attempt / totalAttempts) * 100}%` }}
        />
      </div>
    </div>
  );
}

/**
 * ErrorItem - Single error item with optional strikethrough for fixed errors
 * @see Requirements 10.4, 10.7
 */
interface ErrorItemProps {
  error: CategorizedError;
  isFixed?: boolean;
  onApplySuggestion?: (error: CategorizedError) => void;
}

function ErrorItem({ error, isFixed, onApplySuggestion }: ErrorItemProps) {
  const hasSuggestion = error.suggestion || error.autoFix;

  return (
    <div 
      className={cn(
        'py-2 px-3 rounded-md text-sm',
        isFixed 
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 line-through opacity-60'
          : error.severity === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium">{error.message}</p>
          {error.path && (
            <p className="text-xs opacity-75 mt-0.5 font-mono">
              Path: {error.path}
            </p>
          )}
          {error.line !== undefined && error.column !== undefined && (
            <p className="text-xs opacity-75 mt-0.5">
              Line {error.line}, Column {error.column}
            </p>
          )}
          {error.suggestion && !isFixed && (
            <p className="text-xs mt-1 italic">
              💡 {error.suggestion}
            </p>
          )}
        </div>
        
        {hasSuggestion && !isFixed && onApplySuggestion && (
          <button
            onClick={() => onApplySuggestion(error)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-xs rounded',
              'bg-white dark:bg-gray-800 border border-current',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              'transition-colors'
            )}
            title="Apply Suggestion"
          >
            <WandIcon className="w-3 h-3" />
            <span>Fix</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * ErrorCategory - Collapsible error category group
 * @see Requirements 10.5
 */
interface ErrorCategoryProps {
  category: ErrorCategory;
  errors: CategorizedError[];
  fixedErrors?: ChainValidationError[];
  defaultExpanded?: boolean;
  onApplySuggestion?: (error: CategorizedError) => void;
}

function ErrorCategoryGroup({ 
  category, 
  errors, 
  fixedErrors = [],
  defaultExpanded = true,
  onApplySuggestion 
}: ErrorCategoryProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  
  // Check which errors are fixed
  const fixedPaths = new Set(fixedErrors.map(e => e.path));
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2',
          'bg-gray-50 dark:bg-gray-800/50',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors'
        )}
      >
        <div className="flex items-center gap-2">
          {getCategoryIcon(category)}
          <span className="font-medium">{getCategoryDisplayName(category)}</span>
          <span className="text-xs text-muted-foreground">
            ({errors.length})
          </span>
        </div>
        <ChevronDownIcon 
          className={cn(
            'w-4 h-4 transition-transform',
            isExpanded ? 'rotate-180' : ''
          )} 
        />
      </button>
      
      {isExpanded && (
        <div className="p-2 space-y-2">
          {errors.map((error, index) => (
            <ErrorItem
              key={`${error.path}-${index}`}
              error={error}
              isFixed={fixedPaths.has(error.path)}
              onApplySuggestion={onApplySuggestion}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ErrorList - Full error list with categories
 * @see Requirements 10.5
 */
interface ErrorListProps {
  errors: ChainValidationError[];
  warnings?: ChainValidationError[];
  fixedErrors?: ChainValidationError[];
  onApplySuggestion?: (error: CategorizedError) => void;
  onCopyErrorReport?: () => void;
  className?: string;
}

function ErrorList({ 
  errors, 
  warnings = [], 
  fixedErrors = [],
  onApplySuggestion,
  onCopyErrorReport,
  className 
}: ErrorListProps) {
  const groupedErrors = groupErrorsByCategory(errors);
  const groupedWarnings = groupErrorsByCategory(warnings);
  
  const categoryOrder: ErrorCategory[] = ['json', 'schema', 'component', 'props', 'style'];
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">
            Errors ({errors.length})
          </h4>
          {categoryOrder.map(category => {
            const categoryErrors = groupedErrors.get(category);
            if (!categoryErrors || categoryErrors.length === 0) return null;
            return (
              <ErrorCategoryGroup
                key={category}
                category={category}
                errors={categoryErrors}
                fixedErrors={fixedErrors}
                onApplySuggestion={onApplySuggestion}
              />
            );
          })}
        </div>
      )}
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            Warnings ({warnings.length})
          </h4>
          {categoryOrder.map(category => {
            const categoryWarnings = groupedWarnings.get(category);
            if (!categoryWarnings || categoryWarnings.length === 0) return null;
            return (
              <ErrorCategoryGroup
                key={category}
                category={category}
                errors={categoryWarnings}
                defaultExpanded={false}
              />
            );
          })}
        </div>
      )}
      
      {/* Copy Error Report Button */}
      {onCopyErrorReport && (errors.length > 0 || warnings.length > 0) && (
        <button
          onClick={onCopyErrorReport}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm rounded-md',
            'border border-gray-300 dark:border-gray-600',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            'transition-colors'
          )}
        >
          <CopyIcon className="w-4 h-4" />
          <span>Copy Error Report</span>
        </button>
      )}
    </div>
  );
}

/**
 * JsonErrorHighlight - Highlights error locations in JSON
 * @see Requirements 10.6
 */
interface JsonErrorHighlightProps {
  json: string;
  errors: ChainValidationError[];
  className?: string;
}

function JsonErrorHighlight({ json, errors, className }: JsonErrorHighlightProps) {
  const lines = json.split('\n');
  
  // Build a map of line numbers to errors
  const lineErrors = new Map<number, ChainValidationError[]>();
  for (const error of errors) {
    if (error.line !== undefined) {
      if (!lineErrors.has(error.line)) {
        lineErrors.set(error.line, []);
      }
      lineErrors.get(error.line)!.push(error);
    }
  }
  
  return (
    <div className={cn('font-mono text-sm overflow-x-auto', className)}>
      <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const hasError = lineErrors.has(lineNumber);
          const lineErrorList = lineErrors.get(lineNumber) || [];
          
          return (
            <div 
              key={index}
              className={cn(
                'flex',
                hasError && 'bg-red-100 dark:bg-red-900/30'
              )}
            >
              {/* Line number */}
              <span className="w-10 text-right pr-4 text-gray-400 select-none">
                {lineNumber}
              </span>
              
              {/* Line content */}
              <span className="flex-1">
                {line || ' '}
                
                {/* Error marker */}
                {hasError && (
                  <span 
                    className="ml-2 text-red-500 cursor-help"
                    title={lineErrorList.map(e => e.message).join('\n')}
                  >
                    ← {lineErrorList.length > 1 
                      ? `${lineErrorList.length} errors` 
                      : lineErrorList[0].message}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ValidationFeedback - Main validation feedback component
 * 
 * Displays validation status, errors, and retry progress during LLM generation.
 * 
 * @see Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8
 */
export function ValidationFeedback({
  status,
  validationResult,
  retryProgress,
  generationTime,
  previousErrors = [],
  onApplySuggestion,
  onCopyErrorReport,
  generatedJson,
  className,
}: ValidationFeedbackProps) {
  const [showJsonHighlight, setShowJsonHighlight] = React.useState(false);
  
  // Handle copy error report
  const handleCopyErrorReport = React.useCallback(() => {
    if (validationResult) {
      const report = formatErrorReport(
        validationResult.errors,
        validationResult.warnings
      );
      navigator.clipboard.writeText(report);
      onCopyErrorReport?.();
    }
  }, [validationResult, onCopyErrorReport]);
  
  // Determine which errors were fixed (present in previous but not in current)
  const fixedErrors = React.useMemo(() => {
    if (!validationResult || previousErrors.length === 0) return [];
    
    const currentPaths = new Set(validationResult.errors.map(e => e.path));
    return previousErrors.filter(e => !currentPaths.has(e.path));
  }, [validationResult, previousErrors]);
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        {/* Loading states */}
        {(status === 'generating' || status === 'validating') && (
          <LoadingState status={status} />
        )}
        
        {/* Retrying state */}
        {status === 'retrying' && retryProgress && (
          <RetryProgress progress={retryProgress} />
        )}
        
        {/* Success state */}
        {status === 'success' && (
          <SuccessState generationTime={generationTime} />
        )}
        
        {/* Error state */}
        {status === 'error' && validationResult && (
          <ErrorState 
            errorCount={validationResult.errors.length}
            warningCount={validationResult.warnings.length}
          />
        )}
        
        {/* Idle state - show nothing */}
        {status === 'idle' && null}
      </div>
      
      {/* Fixed errors summary (during retry) */}
      {status === 'retrying' && retryProgress && retryProgress.fixedErrors.length > 0 && (
        <div className="text-sm">
          <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
            Fixed Errors:
          </h4>
          <div className="space-y-1">
            {retryProgress.fixedErrors.map((error, index) => (
              <div 
                key={index}
                className="text-green-600 dark:text-green-400 line-through opacity-60"
              >
                {error.message}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error List (when there are errors) */}
      {status === 'error' && validationResult && (
        <>
          <ErrorList
            errors={validationResult.errors}
            warnings={validationResult.warnings}
            fixedErrors={fixedErrors}
            onApplySuggestion={onApplySuggestion}
            onCopyErrorReport={handleCopyErrorReport}
          />
          
          {/* JSON Error Highlight Toggle */}
          {generatedJson && validationResult.errors.some(e => e.line !== undefined) && (
            <div className="space-y-2">
              <button
                onClick={() => setShowJsonHighlight(!showJsonHighlight)}
                className={cn(
                  'flex items-center gap-2 text-sm text-muted-foreground',
                  'hover:text-foreground transition-colors'
                )}
              >
                <ChevronDownIcon 
                  className={cn(
                    'w-4 h-4 transition-transform',
                    showJsonHighlight ? 'rotate-180' : ''
                  )} 
                />
                <span>{showJsonHighlight ? 'Hide' : 'Show'} JSON with error highlights</span>
              </button>
              
              {showJsonHighlight && (
                <JsonErrorHighlight
                  json={generatedJson}
                  errors={validationResult.errors}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  LoadingState,
  SuccessState,
  ErrorState,
  RetryProgress,
  ErrorItem,
  ErrorCategoryGroup,
  ErrorList,
  JsonErrorHighlight,
};
