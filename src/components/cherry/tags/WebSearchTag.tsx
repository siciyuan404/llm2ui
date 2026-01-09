/**
 * @file WebSearchTag 组件
 * @description 网络搜索能力标签，显示 Globe 图标 + "Web Search" 标签
 * @module components/cherry/tags/WebSearchTag
 */

import * as React from 'react';
import { Globe } from 'lucide-react';
import { BaseTag, type TagSize } from './BaseTag';
import { cn } from '@/lib/utils';

export interface WebSearchTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: TagSize;
}

export const WebSearchTag = React.forwardRef<HTMLSpanElement, WebSearchTagProps>(
  ({ size = 'sm', className, ...props }, ref) => {
    return (
      <BaseTag
        ref={ref}
        icon={<Globe />}
        label="Web Search"
        size={size}
        colorClass="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        className={cn(className)}
        {...props}
      />
    );
  }
);

WebSearchTag.displayName = 'WebSearchTag';
