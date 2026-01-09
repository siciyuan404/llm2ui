/**
 * @file CherryButton.tsx
 * @description Cherry Studio 风格按钮组件
 * @module components/cherry/base
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CherryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'link';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * Cherry Studio 风格按钮
 */
export const CherryButton = React.forwardRef<HTMLButtonElement, CherryButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cherry-primary)] disabled:pointer-events-none disabled:opacity-50';
    
    const variantStyles = {
      default: 'bg-[var(--cherry-background-soft)] text-[var(--cherry-text)] hover:bg-[var(--cherry-hover)] border border-[var(--cherry-border)]',
      primary: 'bg-[var(--cherry-primary)] text-white hover:bg-[var(--cherry-primary-soft)]',
      secondary: 'bg-[var(--cherry-secondary)] text-[var(--cherry-text)] hover:bg-[var(--cherry-hover)]',
      ghost: 'hover:bg-[var(--cherry-hover)] text-[var(--cherry-text)]',
      outline: 'border border-[var(--cherry-border)] bg-transparent hover:bg-[var(--cherry-hover)] text-[var(--cherry-text)]',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
      link: 'text-[var(--cherry-primary)] underline-offset-4 hover:underline',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

CherryButton.displayName = 'CherryButton';
