/**
 * NetworkErrorAlert Component
 * 
 * Displays network error messages with retry functionality.
 * Implements Requirement 1.5 - Network error handling UI
 */

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NetworkErrorState } from '@/lib/error-handling';
import { getNetworkErrorMessage } from '@/lib/error-handling';

// ============================================================================
// Types
// ============================================================================

export interface NetworkErrorAlertProps {
  /** Error state to display */
  error: NetworkErrorState | null;
  /** Callback when retry is clicked */
  onRetry?: () => void;
  /** Callback when dismiss is clicked */
  onDismiss?: () => void;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

function AlertCircleIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
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
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NetworkErrorAlert({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  className,
}: NetworkErrorAlertProps) {
  if (!error?.hasError) {
    return null;
  }

  const friendlyMessage = getNetworkErrorMessage(new Error(error.message));

  return (
    <Alert variant="destructive" className={cn('relative', className)}>
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>网络错误</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{friendlyMessage}</p>
        {error.retryCount > 0 && (
          <p className="text-xs opacity-75 mb-2">
            已重试 {error.retryCount} 次
          </p>
        )}
        <div className="flex gap-2 mt-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="h-7 text-xs"
            >
              {isRetrying ? (
                <>
                  <LoadingSpinner className="mr-1 h-3 w-3" />
                  重试中...
                </>
              ) : (
                <>
                  <RefreshIcon className="mr-1 h-3 w-3" />
                  重试
                </>
              )}
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-7 text-xs"
            >
              <XIcon className="mr-1 h-3 w-3" />
              关闭
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default NetworkErrorAlert;
