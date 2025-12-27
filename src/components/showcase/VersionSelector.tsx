/**
 * VersionSelector - Component version selection dropdown
 * 
 * Displays the current version of a component and provides a dropdown
 * to select from all available versions. Integrates with the Component Registry
 * to fetch version information.
 * 
 * @module VersionSelector
 * @see Requirements 10.3
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { defaultRegistry, type ComponentRegistry } from '@/lib/component-registry';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for VersionSelector component
 */
export interface VersionSelectorProps {
  /** Component name to show versions for */
  componentName: string;
  /** Currently selected version */
  currentVersion?: string;
  /** Callback when version is changed */
  onVersionChange?: (version: string) => void;
  /** Component registry to use (defaults to defaultRegistry) */
  registry?: ComponentRegistry;
  /** Additional class name */
  className?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

// ============================================================================
// Icons
// ============================================================================

/**
 * Chevron down icon for dropdown
 */
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

/**
 * Check icon for selected version
 */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
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

/**
 * Tag icon for version badge
 */
function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-3.5 h-3.5', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format version for display
 */
function formatVersion(version: string): string {
  return version.startsWith('v') ? version : `v${version}`;
}

/**
 * Check if version is latest
 */
function isLatestVersion(version: string, versions: string[]): boolean {
  return versions.length > 0 && versions[0] === version;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Version option item in dropdown
 */
function VersionOption({
  version,
  isSelected,
  isLatest,
  onClick,
}: {
  version: string;
  isSelected: boolean;
  isLatest: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
        'hover:bg-muted focus:bg-muted focus:outline-none',
        isSelected && 'bg-primary/10 text-primary'
      )}
      role="option"
      aria-selected={isSelected}
    >
      <span className="flex items-center gap-2">
        <span className="font-mono">{formatVersion(version)}</span>
        {isLatest && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
            最新
          </span>
        )}
      </span>
      {isSelected && <CheckIcon className="text-primary" />}
    </button>
  );
}

/**
 * Empty state when no versions available
 */
function NoVersionsState() {
  return (
    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
      暂无版本信息
    </div>
  );
}

/**
 * Single version display (non-interactive)
 */
function SingleVersionBadge({
  version,
  size = 'md',
  className,
}: {
  version: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono bg-muted rounded',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm',
        className
      )}
    >
      <TagIcon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {formatVersion(version)}
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * VersionSelector - Dropdown for selecting component versions
 * 
 * Features:
 * - Displays current version with tag icon
 * - Dropdown with all available versions
 * - Highlights latest version
 * - Shows check mark for selected version
 * - Keyboard navigation support
 * - Falls back to badge display when only one version exists
 * 
 * @see Requirements 10.3
 */
export function VersionSelector({
  componentName,
  currentVersion,
  onVersionChange,
  registry = defaultRegistry,
  className,
  disabled = false,
  size = 'md',
}: VersionSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Get available versions from registry
  const versions = React.useMemo(() => {
    return registry.getVersions(componentName);
  }, [registry, componentName]);

  // Determine the display version
  const displayVersion = currentVersion || versions[0] || '1.0.0';

  // Check if current version is latest
  const isLatest = isLatestVersion(displayVersion, versions);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Enter':
      case ' ':
        if (!isOpen) {
          event.preventDefault();
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        if (!isOpen) {
          event.preventDefault();
          setIsOpen(true);
        }
        break;
    }
  }, [isOpen]);

  // Handle version selection
  const handleVersionSelect = React.useCallback((version: string) => {
    onVersionChange?.(version);
    setIsOpen(false);
    buttonRef.current?.focus();
  }, [onVersionChange]);

  // If no versions or only one version, show simple badge
  if (versions.length <= 1) {
    return (
      <SingleVersionBadge
        version={displayVersion}
        size={size}
        className={className}
      />
    );
  }

  return (
    <div
      ref={dropdownRef}
      className={cn('relative inline-block', className)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 font-mono border border-border rounded transition-colors',
          'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'bg-muted'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`当前版本 ${formatVersion(displayVersion)}，点击选择其他版本`}
      >
        <TagIcon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{formatVersion(displayVersion)}</span>
        {isLatest && (
          <span className="px-1 py-0.5 text-[9px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
            最新
          </span>
        )}
        <ChevronDownIcon
          className={cn(
            'transition-transform',
            size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full min-w-[140px] bg-popover border border-border rounded-md shadow-lg',
            'animate-in fade-in-0 zoom-in-95'
          )}
          role="listbox"
          aria-label="可用版本列表"
        >
          <div className="py-1 max-h-48 overflow-auto">
            {versions.length === 0 ? (
              <NoVersionsState />
            ) : (
              versions.map((version) => (
                <VersionOption
                  key={version}
                  version={version}
                  isSelected={version === displayVersion}
                  isLatest={isLatestVersion(version, versions)}
                  onClick={() => handleVersionSelect(version)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VersionSelector;
