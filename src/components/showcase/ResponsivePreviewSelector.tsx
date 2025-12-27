/**
 * ResponsivePreviewSelector - Device size selector for responsive preview
 * 
 * Provides device view switching for responsive preview in the component showcase.
 * Supports desktop, tablet, and mobile views with visual indicators.
 * 
 * @module ResponsivePreviewSelector
 * @see Requirements 15.3
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { PreviewSize } from './ComponentShowcase';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for ResponsivePreviewSelector component
 */
export interface ResponsivePreviewSelectorProps {
  /** Current preview size */
  value: PreviewSize;
  /** Callback when preview size changes */
  onChange: (size: PreviewSize) => void;
  /** Additional class name */
  className?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
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
// Device Configuration
// ============================================================================

/**
 * Device configuration for responsive preview
 */
export interface DeviceConfig {
  /** Device size identifier */
  size: PreviewSize;
  /** Display label */
  label: string;
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Width in pixels (for display) */
  width: number;
  /** Description for tooltip */
  description: string;
}

/**
 * Available device configurations
 */
export const DEVICE_CONFIGS: DeviceConfig[] = [
  {
    size: 'desktop',
    label: '桌面',
    icon: DesktopIcon,
    width: 1280,
    description: '桌面视图 (1280px)',
  },
  {
    size: 'tablet',
    label: '平板',
    icon: TabletIcon,
    width: 768,
    description: '平板视图 (768px)',
  },
  {
    size: 'mobile',
    label: '手机',
    icon: MobileIcon,
    width: 375,
    description: '手机视图 (375px)',
  },
];

/**
 * Get device dimensions for a given preview size
 */
export function getPreviewDimensions(size: PreviewSize): { width: string; maxWidth: string } {
  switch (size) {
    case 'desktop':
      return { width: '100%', maxWidth: '100%' };
    case 'tablet':
      return { width: '768px', maxWidth: '768px' };
    case 'mobile':
      return { width: '375px', maxWidth: '375px' };
    default:
      return { width: '100%', maxWidth: '100%' };
  }
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ResponsivePreviewSelector - Device size selector for responsive preview
 * 
 * @see Requirements 15.3
 */
export function ResponsivePreviewSelector({
  value,
  onChange,
  className,
  disabled = false,
}: ResponsivePreviewSelectorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center border border-border rounded-md',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      role="radiogroup"
      aria-label="响应式预览尺寸"
    >
      {DEVICE_CONFIGS.map(({ size, label, icon: Icon, description }) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          disabled={disabled}
          className={cn(
            'px-2 py-1.5 text-sm transition-colors flex items-center gap-1',
            'first:rounded-l-md last:rounded-r-md',
            value === size
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          )}
          role="radio"
          aria-checked={value === size}
          aria-label={description}
          title={description}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default ResponsivePreviewSelector;
