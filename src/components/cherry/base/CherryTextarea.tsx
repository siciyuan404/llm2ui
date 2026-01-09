/**
 * @file CherryTextarea.tsx
 * @description Cherry Studio 风格多行文本框组件
 * @module components/cherry/base
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CherryTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 是否有错误 */
  error?: boolean;
  /** 是否自动调整高度 */
  autoResize?: boolean;
}

/**
 * Cherry Studio 风格多行文本框
 */
export const CherryTextarea = React.forwardRef<HTMLTextAreaElement, CherryTextareaProps>(
  ({ className, error, autoResize, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <textarea
        ref={(node) => {
          textareaRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          'w-full rounded-lg border bg-[var(--cherry-background)] text-[var(--cherry-text)]',
          'placeholder:text-[var(--cherry-text-2)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--cherry-primary)] focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors resize-none',
          'min-h-[80px] p-3 text-sm',
          error ? 'border-red-500 focus:ring-red-500' : 'border-[var(--cherry-border)]',
          className
        )}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

CherryTextarea.displayName = 'CherryTextarea';
