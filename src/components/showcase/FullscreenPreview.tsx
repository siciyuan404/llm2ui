/**
 * FullscreenPreview - Fullscreen component preview modal
 * 
 * Displays a component in fullscreen mode with theme and responsive size controls.
 * Uses a portal to render outside the normal DOM hierarchy.
 * Supports keyboard navigation (Escape to close).
 * 
 * @module FullscreenPreview
 * @see Requirements 15.4
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { ComponentDefinition } from '@/lib/component-registry';
import { LivePreview, type PreviewTheme, type PreviewSizeType } from './LivePreview';
import { ResponsivePreviewSelector } from './ResponsivePreviewSelector';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for FullscreenPreview component
 */
export interface FullscreenPreviewProps {
  /** Component definition to preview */
  component: ComponentDefinition;
  /** Whether the fullscreen modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Initial preview theme */
  initialTheme?: PreviewTheme;
  /** Initial preview size */
  initialSize?: PreviewSizeType;
  /** Additional class name for the modal content */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function MaximizeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * FullscreenPreview - Renders a component in fullscreen modal
 * 
 * Features:
 * - Portal-based rendering for proper z-index stacking
 * - Theme toggle (light/dark)
 * - Responsive size selector (desktop/tablet/mobile)
 * - Keyboard navigation (Escape to close)
 * - Click outside to close
 * - Component info header
 * - State controls for component variants
 * 
 * @see Requirements 15.4
 */
export function FullscreenPreview({
  component,
  isOpen,
  onClose,
  initialTheme = 'light',
  initialSize = 'desktop',
  className,
}: FullscreenPreviewProps) {
  const [theme, setTheme] = React.useState<PreviewTheme>(initialTheme);
  const [previewSize, setPreviewSize] = React.useState<PreviewSizeType>(initialSize);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Sync initial values when they change
  React.useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  React.useEffect(() => {
    setPreviewSize(initialSize);
  }, [initialSize]);

  // Handle escape key to close
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Focus trap - focus modal when opened
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Toggle theme
  const toggleTheme = React.useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fullscreen-preview-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative flex flex-col w-[95vw] h-[95vh] max-w-[1600px] rounded-lg overflow-hidden shadow-2xl',
          theme === 'dark' ? 'bg-slate-900' : 'bg-white',
          className
        )}
      >
        {/* Header */}
        <header
          className={cn(
            'flex items-center justify-between px-4 py-3 border-b',
            theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-border bg-card'
          )}
        >
          {/* Component Info */}
          <div className="flex items-center gap-3">
            <MaximizeIcon />
            <div>
              <h2
                id="fullscreen-preview-title"
                className={cn(
                  'text-lg font-semibold',
                  theme === 'dark' ? 'text-slate-100' : 'text-foreground'
                )}
              >
                {component.name}
              </h2>
              {component.description && (
                <p
                  className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                  )}
                >
                  {component.description}
                </p>
              )}
            </div>
            {component.version && (
              <span
                className={cn(
                  'px-2 py-0.5 text-xs rounded',
                  theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-muted'
                )}
              >
                v{component.version}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Responsive Size Selector */}
            <ResponsivePreviewSelector
              value={previewSize}
              onChange={setPreviewSize}
            />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'px-3 py-1.5 text-sm border rounded-md transition-colors',
                theme === 'dark'
                  ? 'border-slate-600 hover:bg-slate-700 text-slate-300'
                  : 'border-border hover:bg-muted'
              )}
              title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
              aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-md transition-colors',
                theme === 'dark'
                  ? 'hover:bg-slate-700 text-slate-300'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
              title="关闭全屏预览 (Esc)"
              aria-label="关闭全屏预览"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        {/* Preview Area */}
        <main
          className={cn(
            'flex-1 overflow-auto p-8',
            theme === 'dark' ? 'bg-slate-900' : 'bg-background'
          )}
        >
          <div className="h-full flex items-center justify-center">
            <LivePreview
              component={component}
              theme={theme}
              previewSize={previewSize}
              showStateControls={true}
              className="w-full h-full"
            />
          </div>
        </main>

        {/* Footer with keyboard hint */}
        <footer
          className={cn(
            'px-4 py-2 text-center text-xs border-t',
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800 text-slate-500'
              : 'border-border bg-card text-muted-foreground'
          )}
        >
          按 <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Esc</kbd> 退出全屏预览
        </footer>
      </div>
    </div>
  );

  // Render using portal to ensure proper z-index stacking
  return createPortal(modalContent, document.body);
}

export default FullscreenPreview;
