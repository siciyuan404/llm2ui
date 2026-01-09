/**
 * @file CherrySwitch.tsx
 * @description Cherry Studio 风格开关组件
 * @module components/cherry/base
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CherrySwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** 是否选中 */
  checked?: boolean;
  /** 默认选中状态 */
  defaultChecked?: boolean;
  /** 变更回调 */
  onCheckedChange?: (checked: boolean) => void;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Cherry Studio 风格开关
 */
export const CherrySwitch = React.forwardRef<HTMLButtonElement, CherrySwitchProps>(
  ({ className, checked, defaultChecked = false, onCheckedChange, size = 'md', disabled, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isChecked = checked !== undefined ? checked : internalChecked;

    const handleClick = () => {
      if (disabled) return;
      const newValue = !isChecked;
      if (checked === undefined) {
        setInternalChecked(newValue);
      }
      onCheckedChange?.(newValue);
    };

    const sizeStyles = {
      sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
      md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
      lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
    };

    const { track, thumb, translate } = sizeStyles[size];

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cherry-primary)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          track,
          isChecked ? 'bg-[var(--cherry-primary)]' : 'bg-[var(--cherry-border)]',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block rounded-full bg-white shadow-sm transition-transform',
            'absolute top-1/2 -translate-y-1/2 left-0.5',
            thumb,
            isChecked && translate
          )}
        />
      </button>
    );
  }
);

CherrySwitch.displayName = 'CherrySwitch';
