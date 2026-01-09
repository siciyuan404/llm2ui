/**
 * ScreenSizeSwitcher - Screen size selector with URL persistence
 * 
 * Provides screen size switching for responsive preview with URL query parameter
 * persistence. Wraps ResponsivePreviewSelector with URL sync functionality.
 * 
 * @module ScreenSizeSwitcher
 * @see Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Screen size type matching requirement breakpoints
 * - desktop: ≥1024px
 * - tablet: 768-1023px
 * - mobile: <768px
 */
export type ScreenSize = 'desktop' | 'tablet' | 'mobile';

/**
 * Props for ScreenSizeSwitcher component
 */
export interface ScreenSizeSwitcherProps {
  /** Current screen size (controlled mode) */
  value?: ScreenSize;
  /** Callback when screen size changes */
  onChange?: (size: ScreenSize) => void;
  /** URL query parameter name for persistence */
  queryParam?: string;
  /** Additional class name */
  className?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Whether to sync with URL (default: true) */
  syncWithUrl?: boolean;
}

// ============================================================================
// Device Icons
// ============================================================================

function DesktopIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function MobileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

// ============================================================================
// Screen Size Configuration
// ============================================================================

/**
 * Screen size configuration
 */
export interface ScreenSizeConfig {
  /** Size identifier */
  size: ScreenSize;
  /** Display label */
  label: string;
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Width in pixels */
  width: number;
  /** Min width breakpoint (for responsive detection) */
  minWidth: number;
  /** Max width breakpoint (for responsive detection) */
  maxWidth: number;
  /** Description for tooltip */
  description: string;
}

/**
 * Screen size configurations matching requirement breakpoints
 */
export const SCREEN_SIZE_CONFIGS: ScreenSizeConfig[] = [
  {
    size: 'desktop',
    label: 'Desktop',
    icon: DesktopIcon,
    width: 1280,
    minWidth: 1024,
    maxWidth: Infinity,
    description: 'Desktop (≥1024px)',
  },
  {
    size: 'tablet',
    label: 'Tablet',
    icon: TabletIcon,
    width: 768,
    minWidth: 768,
    maxWidth: 1023,
    description: 'Tablet (768-1023px)',
  },
  {
    size: 'mobile',
    label: 'Mobile',
    icon: MobileIcon,
    width: 375,
    minWidth: 0,
    maxWidth: 767,
    description: 'Mobile (<768px)',
  },
];

/**
 * Get screen size config by size
 */
export function getScreenSizeConfig(size: ScreenSize): ScreenSizeConfig {
  return SCREEN_SIZE_CONFIGS.find(c => c.size === size) ?? SCREEN_SIZE_CONFIGS[0];
}

/**
 * Get preview container dimensions for a given screen size
 */
export function getScreenSizeDimensions(size: ScreenSize): { 
  width: string; 
  maxWidth: string;
  containerClass: string;
} {
  switch (size) {
    case 'desktop':
      return { 
        width: '100%', 
        maxWidth: '100%',
        containerClass: 'w-full'
      };
    case 'tablet':
      return { 
        width: '768px', 
        maxWidth: '768px',
        containerClass: 'w-[768px] max-w-full mx-auto'
      };
    case 'mobile':
      return { 
        width: '375px', 
        maxWidth: '375px',
        containerClass: 'w-[375px] max-w-full mx-auto'
      };
    default:
      return { 
        width: '100%', 
        maxWidth: '100%',
        containerClass: 'w-full'
      };
  }
}

/**
 * Validate if a string is a valid screen size
 */
export function isValidScreenSize(value: string | null): value is ScreenSize {
  return value === 'desktop' || value === 'tablet' || value === 'mobile';
}

/**
 * Parse screen size from URL query parameter
 */
export function parseScreenSizeFromUrl(searchParams: URLSearchParams, paramName: string = 'size'): ScreenSize {
  const value = searchParams.get(paramName);
  return isValidScreenSize(value) ? value : 'desktop';
}

// ============================================================================
// Hook: useScreenSize
// ============================================================================

/**
 * Hook for managing screen size with URL persistence
 */
export function useScreenSize(options: {
  queryParam?: string;
  defaultSize?: ScreenSize;
  syncWithUrl?: boolean;
} = {}): [ScreenSize, (size: ScreenSize) => void] {
  const { 
    queryParam = 'size', 
    defaultSize = 'desktop',
    syncWithUrl = true 
  } = options;
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get current size from URL or default
  const currentSize = React.useMemo(() => {
    if (!syncWithUrl) return defaultSize;
    return parseScreenSizeFromUrl(searchParams, queryParam);
  }, [searchParams, queryParam, defaultSize, syncWithUrl]);
  
  // Update size and sync to URL
  const setSize = React.useCallback((size: ScreenSize) => {
    if (!syncWithUrl) return;
    
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (size === 'desktop') {
        // Remove param for default value to keep URL clean
        newParams.delete(queryParam);
      } else {
        newParams.set(queryParam, size);
      }
      return newParams;
    }, { replace: true });
  }, [setSearchParams, queryParam, syncWithUrl]);
  
  return [currentSize, setSize];
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ScreenSizeSwitcher - Screen size selector with URL persistence
 * 
 * Features:
 * - Three screen sizes: Desktop (≥1024px), Tablet (768-1023px), Mobile (<768px)
 * - Device icons for each option
 * - URL query parameter persistence (?size=tablet)
 * - Preserves selection when navigating between items
 * 
 * @see Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
export function ScreenSizeSwitcher({
  value: controlledValue,
  onChange,
  queryParam = 'size',
  className,
  disabled = false,
  syncWithUrl = true,
}: ScreenSizeSwitcherProps) {
  const [urlSize, setUrlSize] = useScreenSize({ 
    queryParam, 
    syncWithUrl 
  });
  
  // Use controlled value if provided, otherwise use URL-synced value
  const currentSize = controlledValue ?? urlSize;
  
  // Handle size change
  const handleChange = React.useCallback((size: ScreenSize) => {
    // Update URL if syncing
    if (syncWithUrl && !controlledValue) {
      setUrlSize(size);
    }
    // Call onChange callback
    onChange?.(size);
  }, [syncWithUrl, controlledValue, setUrlSize, onChange]);
  
  return (
    <div
      className={cn(
        'inline-flex items-center border border-border rounded-md bg-background',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      role="radiogroup"
      aria-label="Screen size preview"
    >
      {SCREEN_SIZE_CONFIGS.map(({ size, label, icon: Icon, description }) => (
        <button
          key={size}
          type="button"
          onClick={() => handleChange(size)}
          disabled={disabled}
          className={cn(
            'px-2.5 py-1.5 text-sm transition-colors flex items-center gap-1.5',
            'first:rounded-l-md last:rounded-r-md',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
            currentSize === size
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          )}
          role="radio"
          aria-checked={currentSize === size}
          aria-label={description}
          title={description}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default ScreenSizeSwitcher;
