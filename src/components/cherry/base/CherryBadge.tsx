/**
 * @file CherryBadge.tsx
 * @description Cherry Studio 风格徽章组件
 * @module components/cherry/base
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CherryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 徽章变体 */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  /** 徽章尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Cherry Studio 风格徽章
 */
export const CherryBadge = React.forwardRef<HTMLSpanElement, CherryBadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-[var(--cherry-background-soft)] text-[var(--cherry-text)]',
      primary: 'bg-[var(--cherry-primary)] text-white',
      secondary: 'bg-[var(--cherry-secondary)] text-[var(--cherry-text)]',
      success: 'bg-green-500/20 text-green-500',
      warning: 'bg-yellow-500/20 text-yellow-500',
      error: 'bg-red-500/20 text-red-500',
      outline: 'border border-[var(--cherry-border)] bg-transparent text-[var(--cherry-text)]',
    };

    const sizeStyles = {
      sm: 'px-1.5 py-0.5 text-xs',
      md: 'px-2 py-0.5 text-xs',
      lg: 'px-2.5 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

CherryBadge.displayName = 'CherryBadge';
