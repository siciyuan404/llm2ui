/**
 * @file FreeTag 组件
 * @description 免费标签，显示 Gift 图标 + "Free" 标签
 * @module components/cherry/tags/FreeTag
 */

import * as React from 'react';
import { Gift } from 'lucide-react';
import { BaseTag, type TagSize } from './BaseTag';
import { cn } from '@/lib/utils';

export interface FreeTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: TagSize;
}

export const FreeTag = React.forwardRef<HTMLSpanElement, FreeTagProps>(
  ({ size = 'sm', className, ...props }, ref) => {
    return (
      <BaseTag
        ref={ref}
        icon={<Gift />}
        label="Free"
        size={size}
        colorClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        className={cn(className)}
        {...props}
      />
    );
  }
);

FreeTag.displayName = 'FreeTag';
