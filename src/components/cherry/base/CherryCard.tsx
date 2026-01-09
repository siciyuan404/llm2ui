/**
 * @file CherryCard.tsx
 * @description Cherry Studio 风格卡片组件
 * @module components/cherry/base
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CherryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 卡片变体 */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** 是否可点击 */
  clickable?: boolean;
  /** 是否选中 */
  selected?: boolean;
}

/**
 * Cherry Studio 风格卡片
 */
export const CherryCard = React.forwardRef<HTMLDivElement, CherryCardProps>(
  ({ className, variant = 'default', clickable, selected, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-[var(--cherry-background)] border border-[var(--cherry-border)]',
      elevated: 'bg-[var(--cherry-background)] shadow-lg',
      outlined: 'bg-transparent border border-[var(--cherry-border)]',
      filled: 'bg-[var(--cherry-background-soft)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variantStyles[variant],
          clickable && 'cursor-pointer hover:bg-[var(--cherry-hover)] transition-colors',
          selected && 'ring-2 ring-[var(--cherry-primary)] border-transparent',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CherryCard.displayName = 'CherryCard';

/**
 * 卡片头部
 */
export const CherryCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 border-b border-[var(--cherry-border)]', className)} {...props} />
  )
);
CherryCardHeader.displayName = 'CherryCardHeader';

/**
 * 卡片标题
 */
export const CherryCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-[var(--cherry-text)]', className)} {...props} />
  )
);
CherryCardTitle.displayName = 'CherryCardTitle';

/**
 * 卡片描述
 */
export const CherryCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-[var(--cherry-text-2)]', className)} {...props} />
  )
);
CherryCardDescription.displayName = 'CherryCardDescription';

/**
 * 卡片内容
 */
export const CherryCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4', className)} {...props} />
  )
);
CherryCardContent.displayName = 'CherryCardContent';

/**
 * 卡片底部
 */
export const CherryCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 border-t border-[var(--cherry-border)] flex items-center gap-2', className)} {...props} />
  )
);
CherryCardFooter.displayName = 'CherryCardFooter';
