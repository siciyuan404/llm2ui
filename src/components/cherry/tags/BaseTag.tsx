/**
 * @file BaseTag 组件
 * @description 模型能力标签的基础组件
 * @module components/cherry/tags/BaseTag
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export type TagSize = 'sm' | 'md';

export interface BaseTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 图标元素 */
  icon: React.ReactNode;
  /** 标签文本 */
  label: string;
  /** 标签尺寸 */
  size?: TagSize;
  /** 标签颜色类名 */
  colorClass?: string;
}

const sizeClasses: Record<TagSize, string> = {
  sm: 'text-xs px-1.5 py-0.5 gap-1',
  md: 'text-sm px-2 py-1 gap-1.5',
};

const iconSizeClasses: Record<TagSize, string> = {
  sm: '[&>svg]:h-3 [&>svg]:w-3',
  md: '[&>svg]:h-3.5 [&>svg]:w-3.5',
};

export const BaseTag = React.forwardRef<HTMLSpanElement, BaseTagProps>(
  ({ icon, label, size = 'sm', colorClass, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full',
          'font-medium',
          sizeClasses[size],
          iconSizeClasses[size],
          colorClass,
          className
        )}
        {...props}
      >
        {icon}
        <span>{label}</span>
      </span>
    );
  }
);

BaseTag.displayName = 'BaseTag';
