/**
 * @file VisionTag 组件
 * @description 视觉能力标签，显示 Eye 图标 + "Vision" 标签
 * @module components/cherry/tags/VisionTag
 */

import * as React from 'react';
import { Eye } from 'lucide-react';
import { BaseTag, type TagSize } from './BaseTag';
import { cn } from '@/lib/utils';

export interface VisionTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: TagSize;
}

export const VisionTag = React.forwardRef<HTMLSpanElement, VisionTagProps>(
  ({ size = 'sm', className, ...props }, ref) => {
    return (
      <BaseTag
        ref={ref}
        icon={<Eye />}
        label="Vision"
        size={size}
        colorClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        className={cn(className)}
        {...props}
      />
    );
  }
);

VisionTag.displayName = 'VisionTag';
