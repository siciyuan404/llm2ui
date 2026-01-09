/**
 * @file ReasoningTag 组件
 * @description 推理能力标签，显示 Brain 图标 + "Reasoning" 标签
 * @module components/cherry/tags/ReasoningTag
 */

import * as React from 'react';
import { Brain } from 'lucide-react';
import { BaseTag, type TagSize } from './BaseTag';
import { cn } from '@/lib/utils';

export interface ReasoningTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: TagSize;
}

export const ReasoningTag = React.forwardRef<HTMLSpanElement, ReasoningTagProps>(
  ({ size = 'sm', className, ...props }, ref) => {
    return (
      <BaseTag
        ref={ref}
        icon={<Brain />}
        label="Reasoning"
        size={size}
        colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        className={cn(className)}
        {...props}
      />
    );
  }
);

ReasoningTag.displayName = 'ReasoningTag';
