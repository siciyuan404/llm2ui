/**
 * DeviceSelector Component
 * 
 * Provides device view switching for responsive preview.
 * Supports desktop, tablet, and mobile views.
 * 
 * Requirements: 4.3
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types
// ============================================================================

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface DeviceSelectorProps {
  /** Current device mode */
  value: DeviceMode;
  /** Callback when device mode changes */
  onChange: (mode: DeviceMode) => void;
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

const DEVICES: Array<{
  mode: DeviceMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dimensions: string;
}> = [
  {
    mode: 'desktop',
    label: '桌面',
    icon: DesktopIcon,
    dimensions: '100%',
  },
  {
    mode: 'tablet',
    label: '平板',
    icon: TabletIcon,
    dimensions: '768px',
  },
  {
    mode: 'mobile',
    label: '手机',
    icon: MobileIcon,
    dimensions: '375px',
  },
];

// ============================================================================
// Main Component
// ============================================================================

export function DeviceSelector({
  value,
  onChange,
  className,
  disabled = false,
}: DeviceSelectorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-muted rounded-lg',
        className
      )}
      role="radiogroup"
      aria-label="设备预览模式"
    >
      {DEVICES.map(({ mode, label, icon: Icon, dimensions }) => (
        <Button
          key={mode}
          variant={value === mode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange(mode)}
          disabled={disabled}
          className={cn(
            'h-8 px-3 gap-1.5',
            value === mode && 'shadow-sm'
          )}
          role="radio"
          aria-checked={value === mode}
          aria-label={`${label} (${dimensions})`}
          title={`${label} (${dimensions})`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}

// ============================================================================
// Device Dimensions Helper
// ============================================================================

export const DEVICE_DIMENSIONS: Record<DeviceMode, { width: string; maxWidth: string; height?: string }> = {
  desktop: { width: '100%', maxWidth: '100%' },
  tablet: { width: '768px', maxWidth: '768px' },
  mobile: { width: '375px', maxWidth: '375px' },
};

export function getDeviceDimensions(mode: DeviceMode) {
  return DEVICE_DIMENSIONS[mode];
}

export default DeviceSelector;
