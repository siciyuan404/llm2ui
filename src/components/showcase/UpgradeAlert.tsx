/**
 * UpgradeAlert - Component upgrade suggestion alert
 * 
 * Displays upgrade suggestions when:
 * - Using an older version of a component (newer version available)
 * - Component is deprecated (shows deprecationMessage)
 * 
 * @module UpgradeAlert
 * @see Requirements 10.4
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentDefinition, ComponentRegistry } from '@/lib';
import { defaultRegistry } from '@/lib';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for UpgradeAlert component
 */
export interface UpgradeAlertProps {
  /** Component definition to check for upgrades */
  component: ComponentDefinition;
  /** Component registry for version lookup */
  registry?: ComponentRegistry;
  /** Callback when upgrade button is clicked */
  onUpgrade?: (latestVersion: string) => void;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Upgrade info returned by version check
 */
export interface UpgradeInfo {
  /** Whether an upgrade is available */
  hasUpgrade: boolean;
  /** Current version */
  currentVersion: string;
  /** Latest available version */
  latestVersion: string;
  /** Whether component is deprecated */
  isDeprecated: boolean;
  /** Deprecation message if deprecated */
  deprecationMessage?: string;
}


// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Compare two semver-like version strings
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }
  return 0;
}

/**
 * Check if component has an available upgrade
 */
export function checkUpgradeAvailable(
  component: ComponentDefinition,
  registry: ComponentRegistry = defaultRegistry
): UpgradeInfo {
  const currentVersion = component.version || '1.0.0';
  const versions = registry.getVersions(component.name);
  const latestVersion = versions.length > 0 ? versions[0] : currentVersion;
  
  // Check if current version is older than latest
  const hasUpgrade = compareVersions(currentVersion, latestVersion) < 0;
  
  return {
    hasUpgrade,
    currentVersion,
    latestVersion,
    isDeprecated: component.deprecated ?? false,
    deprecationMessage: component.deprecationMessage,
  };
}

// ============================================================================
// Icons
// ============================================================================

/**
 * Arrow up icon for upgrade
 */
function ArrowUpIcon({ className }: { className?: string }) {
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
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
  );
}


/**
 * Warning triangle icon for deprecation
 */
function WarningIcon({ className }: { className?: string }) {
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
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

/**
 * Info icon for upgrade suggestion
 */
function InfoIcon({ className }: { className?: string }) {
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
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Deprecation warning alert
 */
function DeprecationAlert({
  message,
  compact = false,
  className,
}: {
  message?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-md',
        compact ? 'p-2' : 'p-3',
        className
      )}
      role="alert"
    >
      <WarningIcon className="flex-shrink-0 text-destructive mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-destructive',
          compact ? 'text-xs' : 'text-sm'
        )}>
          此组件已废弃
        </p>
        {message && (
          <p className={cn(
            'text-destructive/80 mt-0.5',
            compact ? 'text-[10px]' : 'text-xs'
          )}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}


/**
 * Version upgrade suggestion alert
 */
function VersionUpgradeAlert({
  currentVersion,
  latestVersion,
  onUpgrade,
  compact = false,
  className,
}: {
  currentVersion: string;
  latestVersion: string;
  onUpgrade?: (version: string) => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md',
        compact ? 'p-2' : 'p-3',
        className
      )}
      role="alert"
    >
      <InfoIcon className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-blue-800 dark:text-blue-200',
          compact ? 'text-xs' : 'text-sm'
        )}>
          有新版本可用
        </p>
        <p className={cn(
          'text-blue-600 dark:text-blue-400 mt-0.5',
          compact ? 'text-[10px]' : 'text-xs'
        )}>
          当前版本: v{currentVersion} → 最新版本: v{latestVersion}
        </p>
        {onUpgrade && (
          <button
            onClick={() => onUpgrade(latestVersion)}
            className={cn(
              'inline-flex items-center gap-1 mt-2 font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors',
              compact ? 'text-[10px]' : 'text-xs'
            )}
          >
            <ArrowUpIcon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            升级到 v{latestVersion}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * UpgradeAlert - Displays upgrade suggestions and deprecation warnings
 * 
 * Features:
 * - Shows deprecation warning with custom message
 * - Shows version upgrade suggestion when newer version available
 * - Supports compact mode for space-constrained layouts
 * - Provides upgrade callback for version switching
 * 
 * @see Requirements 10.4
 */
export function UpgradeAlert({
  component,
  registry = defaultRegistry,
  onUpgrade,
  compact = false,
  className,
}: UpgradeAlertProps) {
  // Check for upgrade availability
  const upgradeInfo = React.useMemo(
    () => checkUpgradeAvailable(component, registry),
    [component, registry]
  );

  // Don't render if no alerts needed
  if (!upgradeInfo.isDeprecated && !upgradeInfo.hasUpgrade) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Deprecation warning (higher priority) */}
      {upgradeInfo.isDeprecated && (
        <DeprecationAlert
          message={upgradeInfo.deprecationMessage}
          compact={compact}
        />
      )}
      
      {/* Version upgrade suggestion */}
      {upgradeInfo.hasUpgrade && (
        <VersionUpgradeAlert
          currentVersion={upgradeInfo.currentVersion}
          latestVersion={upgradeInfo.latestVersion}
          onUpgrade={onUpgrade}
          compact={compact}
        />
      )}
    </div>
  );
}

export default UpgradeAlert;
