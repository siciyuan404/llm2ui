/**
 * PreviewPanelWithControls Component
 * 
 * Complete preview panel with device selector, theme toggle, and toolbar.
 * Combines PreviewPanel with all control components.
 * 
 * Requirements: 4.1, 4.3, 4.5, 4.6
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { UISchema, DataContext } from '@/types';
import type { EventHandler } from '@/lib/renderer';
import type { ComponentRegistry } from '@/lib/component-registry';
import { PreviewPanel } from './PreviewPanel';
import { DeviceSelector, type DeviceMode } from './DeviceSelector';
import { ThemeToggleSimple, useTheme, type ThemeMode } from './ThemeToggle';

// ============================================================================
// Types
// ============================================================================

export interface PreviewPanelWithControlsProps {
  /** The UISchema to render */
  schema: UISchema | null;
  /** Additional data context to merge with schema data */
  dataContext?: DataContext;
  /** Component registry to use */
  registry?: ComponentRegistry;
  /** Event handler callback */
  onEvent?: EventHandler;
  /** Whether to show error boundaries */
  showErrors?: boolean;
  /** Additional class name */
  className?: string;
  /** Initial device mode */
  initialDeviceMode?: DeviceMode;
  /** Initial theme mode */
  initialTheme?: ThemeMode;
  /** Callback when device mode changes */
  onDeviceModeChange?: (mode: DeviceMode) => void;
  /** Callback when theme changes */
  onThemeChange?: (theme: ThemeMode) => void;
  /** Whether to show the toolbar */
  showToolbar?: boolean;
  /** Custom toolbar content */
  toolbarContent?: React.ReactNode;
}

// ============================================================================
// Main Component
// ============================================================================

export function PreviewPanelWithControls({
  schema,
  dataContext,
  registry,
  onEvent,
  showErrors = true,
  className,
  initialDeviceMode = 'desktop',
  initialTheme,
  onDeviceModeChange,
  onThemeChange,
  showToolbar = true,
  toolbarContent,
}: PreviewPanelWithControlsProps) {
  const [deviceMode, setDeviceMode] = React.useState<DeviceMode>(initialDeviceMode);
  const { theme, effectiveTheme, setTheme } = useTheme(initialTheme);

  // Handle device mode change
  const handleDeviceModeChange = React.useCallback(
    (mode: DeviceMode) => {
      setDeviceMode(mode);
      onDeviceModeChange?.(mode);
    },
    [onDeviceModeChange]
  );

  // Handle theme change
  const handleThemeChange = React.useCallback(
    (newTheme: ThemeMode) => {
      setTheme(newTheme);
      onThemeChange?.(newTheme);
    },
    [setTheme, onThemeChange]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">预览</span>
            {schema?.meta?.title && (
              <span className="text-sm text-muted-foreground/70">
                - {schema.meta.title}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {toolbarContent}
            <DeviceSelector
              value={deviceMode}
              onChange={handleDeviceModeChange}
            />
            <div className="w-px h-6 bg-border" />
            <ThemeToggleSimple
              value={theme}
              onChange={handleThemeChange}
            />
          </div>
        </div>
      )}

      {/* Preview Panel */}
      <div className="flex-1 overflow-hidden">
        <PreviewPanel
          schema={schema}
          dataContext={dataContext}
          registry={registry}
          onEvent={onEvent}
          showErrors={showErrors}
          deviceMode={deviceMode}
          theme={effectiveTheme}
        />
      </div>
    </div>
  );
}

export default PreviewPanelWithControls;
