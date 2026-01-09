/**
 * @file ActionIconButton 组件
 * @description 圆形图标按钮，支持 active/disabled 状态和多种尺寸
 * @module components/cherry/buttons/ActionIconButton
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ActionIconButtonSize = 'sm' | 'md' | 'lg';

export interface ActionIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 图标元素 */
  icon: React.ReactNode;
  /** 是否激活状态 */
  active?: boolean;
  /** 按钮尺寸 */
  size?: ActionIconButtonSize;
}

const sizeClasses: Record<ActionIconButtonSize, string> = {
  sm: 'h-6 w-6', // 24px
  md: 'h-[30px] w-[30px]', // 30px
  lg: 'h-9 w-9', // 36px
};

const iconSizeClasses: Record<ActionIconButtonSize, string> = {
  sm: '[&>svg]:h-3.5 [&>svg]:w-3.5',
  md: '[&>svg]:h-4 [&>svg]:w-4',
  lg: '[&>svg]:h-5 [&>svg]:w-5',
};

export const ActionIconButton = React.forwardRef<
  HTMLButtonElement,
  ActionIconButtonProps
>(({ icon, active = false, size = 'md', className, disabled, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(
        // 基础样式
        'inline-flex items-center justify-center rounded-full',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cherry-primary)] focus-visible:ring-offset-2',
        // 尺寸
        sizeClasses[size],
        iconSizeClasses[size],
        // 状态样式
        active
          ? 'bg-[var(--cherry-primary)] text-white'
          : 'text-[var(--cherry-icon)] hover:bg-[var(--cherry-hover)]',
        // 禁用状态
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
});

ActionIconButton.displayName = 'ActionIconButton';
