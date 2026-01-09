/**
 * @file ToolsCallingTag 组件
 * @description 工具调用能力标签，显示 Wrench 图标 + "Tools" 标签
 * @module components/cherry/tags/ToolsCallingTag
 */

import * as React from 'react';
import { Wrench } from 'lucide-react';
import { BaseTag, type TagSize } from './BaseTag';
import { cn } from '@/lib/utils';

export interface ToolsCallingTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: TagSize;
}

export const ToolsCallingTag = React.forwardRef<HTMLSpanElement, ToolsCallingTagProps>(
  ({ size = 'sm', className, ...props }, ref) => {
    return (
      <BaseTag
        ref={ref}
        icon={<Wrench />}
        label="Tools"
        size={size}
        colorClass="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
        className={cn(className)}
        {...props}
      />
    );
  }
);

ToolsCallingTag.displayName = 'ToolsCallingTag';
