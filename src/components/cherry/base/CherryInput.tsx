/**
 * @file CherryInput.tsx
 * @description Cherry Studio 风格输入框组件
 * @module components/cherry/base
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CherryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 输入框尺寸 */
  inputSize?: 'sm' | 'md' | 'lg';
  /** 是否有错误 */
  error?: boolean;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
}

/**
 * Cherry Studio 风格输入框
 */
export const CherryInput = React.forwardRef<HTMLInputElement, CherryInputProps>(
  ({ className, inputSize = 'md', error, leftIcon, rightIcon, ...props }, ref) => {
    const sizeStyles = {
      sm: 'h-8 text-xs px-2',
      md: 'h-9 text-sm px-3',
      lg: 'h-10 text-base px-4',
    };

    const baseStyles = cn(
      'w-full rounded-lg border bg-[var(--cherry-background)] text-[var(--cherry-text)]',
      'placeholder:text-[var(--cherry-text-2)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--cherry-primary)] focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-colors',
      error ? 'border-red-500 focus:ring-red-500' : 'border-[var(--cherry-border)]',
      sizeStyles[inputSize],
      leftIcon && 'pl-9',
      rightIcon && 'pr-9'
    );

    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cherry-text-2)]">
              {leftIcon}
            </span>
          )}
          <input ref={ref} className={cn(baseStyles, className)} {...props} />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cherry-text-2)]">
              {rightIcon}
            </span>
          )}
        </div>
      );
    }

    return <input ref={ref} className={cn(baseStyles, className)} {...props} />;
  }
);

CherryInput.displayName = 'CherryInput';
