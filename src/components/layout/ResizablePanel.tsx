/**
 * ResizablePanel Component
 * 
 * A resizable panel component with drag handle for adjusting width.
 * Implements Requirements 10.1, 10.2
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ResizablePanelProps {
  /** Panel identifier */
  id: string;
  /** Current width percentage (0-100) */
  width: number;
  /** Minimum width percentage */
  minWidth?: number;
  /** Maximum width percentage */
  maxWidth?: number;
  /** Whether the panel is collapsed */
  collapsed?: boolean;
  /** Whether to show resize handle on the right */
  showResizeHandle?: boolean;
  /** Callback when width changes during drag */
  onWidthChange?: (width: number) => void;
  /** Callback when resize starts */
  onResizeStart?: () => void;
  /** Callback when resize ends */
  onResizeEnd?: () => void;
  /** Panel content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * ResizablePanel - A panel that can be resized by dragging its edge
 */
export function ResizablePanel({
  id,
  width,
  minWidth = 10,
  maxWidth = 80,
  collapsed = false,
  showResizeHandle = true,
  onWidthChange,
  onResizeStart,
  onResizeEnd,
  children,
  className,
}: ResizablePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const containerWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    // Get container width for percentage calculation
    const container = panelRef.current?.parentElement;
    if (container) {
      containerWidthRef.current = container.getBoundingClientRect().width;
    }
    
    onResizeStart?.();
  }, [width, onResizeStart]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const deltaPercent = (deltaX / containerWidthRef.current) * 100;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaPercent));
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEnd?.();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth, onWidthChange, onResizeEnd]);

  // Collapsed state
  if (collapsed) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      data-panel-id={id}
      className={cn(
        'relative flex-shrink-0 overflow-hidden',
        isDragging && 'select-none',
        className
      )}
      style={{ width: `${width}%` }}
    >
      {/* Panel content */}
      <div className="h-full w-full overflow-auto">
        {children}
      </div>

      {/* Resize handle */}
      {showResizeHandle && (
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-1 cursor-col-resize',
            'bg-border hover:bg-primary/50 transition-colors',
            isDragging && 'bg-primary'
          )}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={width}
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
        />
      )}
    </div>
  );
}

export interface ResizeHandleProps {
  /** Callback when drag starts */
  onDragStart: (e: React.MouseEvent) => void;
  /** Whether currently dragging */
  isDragging?: boolean;
  /** Orientation of the resize handle */
  orientation?: 'horizontal' | 'vertical';
  /** Additional class names */
  className?: string;
}

/**
 * Standalone resize handle component
 * - horizontal: for resizing columns (left-right)
 * - vertical: for resizing rows (top-bottom)
 */
export function ResizeHandle({
  onDragStart,
  isDragging = false,
  orientation = 'horizontal',
  className,
}: ResizeHandleProps) {
  const isVertical = orientation === 'vertical';
  
  return (
    <div
      className={cn(
        'flex-shrink-0 transition-colors',
        isVertical
          ? 'h-1 w-full cursor-row-resize'
          : 'w-1 h-full cursor-col-resize',
        'bg-border hover:bg-primary/50',
        isDragging && 'bg-primary',
        className
      )}
      onMouseDown={onDragStart}
      role="separator"
      aria-orientation={isVertical ? 'horizontal' : 'vertical'}
    />
  );
}
