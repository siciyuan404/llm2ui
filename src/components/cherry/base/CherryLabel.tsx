/**
 * @file CherryLabel.tsx
 * @description Cherry Studio 风格标签组件
 * @module components/cherry/base
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CherryLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * Cherry Studio 风格标签
 */
export const CherryLabel = React.forwardRef<HTMLLabelElement, CherryLabelProps>(
  ({ className, required, disabled, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium text-[var(--cherry-text)]',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);

CherryLabel.displayName = 'CherryLabel';
