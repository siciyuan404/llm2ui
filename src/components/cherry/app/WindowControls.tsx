/**
 * @file WindowControls 组件
 * @description 窗口控制按钮（最小化、最大化、关闭）
 * @module components/cherry/app/WindowControls
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Minus, Square, X } from 'lucide-react';

export interface WindowControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 最小化回调 */
  onMinimize?: () => void;
  /** 最大化/还原回调 */
  onMaximize?: () => void;
  /** 关闭回调 */
  onClose?: () => void;
  /** 是否为 macOS 风格 */
  macStyle?: boolean;
}

export const WindowControls = React.forwardRef<HTMLDivElement, WindowControlsProps>(
  ({ onMinimize, onMaximize, onClose, macStyle = false, className, ...props }, ref) => {
    if (macStyle) {
      // macOS 风格的交通灯按钮
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-2', className)}
          {...props}
        >
          <button
            type="button"
            onClick={onClose}
            className="h-3 w-3 rounded-full bg-[#ff5f57] hover:brightness-90 transition-all"
            aria-label="关闭"
          />
          <button
            type="button"
            onClick={onMinimize}
            className="h-3 w-3 rounded-full bg-[#febc2e] hover:brightness-90 transition-all"
            aria-label="最小化"
          />
          <button
            type="button"
            onClick={onMaximize}
            className="h-3 w-3 rounded-full bg-[#28c840] hover:brightness-90 transition-all"
            aria-label="最大化"
          />
        </div>
      );
    }

    // Windows 风格的按钮
    return (
      <div
        ref={ref}
        className={cn('flex items-center', className)}
        {...props}
      >
        <button
          type="button"
          onClick={onMinimize}
          className={cn(
            'h-8 w-11 flex items-center justify-center',
            'hover:bg-[var(--cherry-hover)] transition-colors',
            'text-[var(--cherry-icon)]'
          )}
          aria-label="最小化"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onMaximize}
          className={cn(
            'h-8 w-11 flex items-center justify-center',
            'hover:bg-[var(--cherry-hover)] transition-colors',
            'text-[var(--cherry-icon)]'
          )}
          aria-label="最大化"
        >
          <Square className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'h-8 w-11 flex items-center justify-center',
            'hover:bg-red-500 hover:text-white transition-colors',
            'text-[var(--cherry-icon)]'
          )}
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

WindowControls.displayName = 'WindowControls';
