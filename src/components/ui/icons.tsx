/**
 * Custom Icons
 *
 * Reusable SVG icon components for the application.
 *
 * @module components/ui/icons
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for icon components
 */
export interface IconProps {
  /** Additional class name */
  className?: string;
  /** Accessible label for the icon */
  'aria-label'?: string;
}

/**
 * Chevron Right Icon
 * Used for expandable/collapsible sections
 */
export function ChevronIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

/**
 * Chevron Down Icon
 * Used for dropdown indicators
 */
export function ChevronDownIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * Chevron Up Icon
 */
export function ChevronUpIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

/**
 * Chevron Left Icon
 */
export function ChevronLeftIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
