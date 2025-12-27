/**
 * PlatformSwitcher - Platform switcher component for component showcase
 * 
 * Provides platform selection options for filtering components by target platform.
 * Supports four platform types: PC Web, Mobile Web, Mobile Native, PC Desktop.
 * 
 * @module PlatformSwitcher
 * @see Requirements 7.1, 7.2, 7.5
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { PlatformType } from '@/lib/component-registry';

// ============================================================================
// Types
// ============================================================================

/**
 * Platform option definition
 */
export interface PlatformOption {
  /** Platform type value */
  value: PlatformType;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
}

/**
 * Props for PlatformSwitcher
 */
export interface PlatformSwitcherProps {
  /** Currently selected platform (null for all) */
  selectedPlatform: PlatformType | null;
  /** Callback when platform selection changes */
  onPlatformChange: (platform: PlatformType | null) => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

function DesktopIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function AllPlatformsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default platform options
 */
export const DEFAULT_PLATFORM_OPTIONS: PlatformOption[] = [
  { value: 'pc-web', label: 'PC Web', icon: <DesktopIcon /> },
  { value: 'mobile-web', label: 'Mobile Web', icon: <TabletIcon /> },
  { value: 'mobile-native', label: 'Mobile Native', icon: <MobileIcon /> },
  { value: 'pc-desktop', label: 'PC Desktop', icon: <DesktopIcon /> },
];

// ============================================================================
// Main Component
// ============================================================================

/**
 * PlatformSwitcher - Switch between platform filters
 * 
 * Features:
 * - "All platforms" option
 * - Platform-specific icons
 * - Visual indication of selected platform
 * - Keyboard navigation support
 */
export function PlatformSwitcher({
  selectedPlatform,
  onPlatformChange,
  className,
}: PlatformSwitcherProps) {
  return (
    <div className={cn('space-y-1', className)} role="listbox" aria-label="平台筛选">
      {/* All platforms option */}
      <button
        onClick={() => onPlatformChange(null)}
        role="option"
        aria-selected={selectedPlatform === null}
        className={cn(
          'w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors',
          'flex items-center gap-2',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
          selectedPlatform === null
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        )}
      >
        <AllPlatformsIcon />
        <span>全部平台</span>
      </button>

      {/* Platform options */}
      {DEFAULT_PLATFORM_OPTIONS.map((platform) => (
        <button
          key={platform.value}
          onClick={() => onPlatformChange(platform.value)}
          role="option"
          aria-selected={selectedPlatform === platform.value}
          className={cn(
            'w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors',
            'flex items-center gap-2',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            selectedPlatform === platform.value
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
        >
          {platform.icon}
          <span>{platform.label}</span>
        </button>
      ))}
    </div>
  );
}

export default PlatformSwitcher;
