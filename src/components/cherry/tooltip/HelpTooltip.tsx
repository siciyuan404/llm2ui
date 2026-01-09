/**
 * @file HelpTooltip 组件
 * @description 帮助提示图标，显示问号图标和帮助内容
 * @module components/cherry/tooltip/HelpTooltip
 */

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HelpTooltipProps {
  /** 提示内容 */
  content: React.ReactNode;
  /** 图标尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 延迟显示时间（毫秒） */
  delayDuration?: number;
  /** 提示位置 */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** 自定义类名 */
  className?: string;
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function HelpTooltip({
  content,
  size = 'md',
  delayDuration = 200,
  side = 'top',
  className,
}: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center justify-center cursor-help text-[var(--cherry-text-2)] hover:text-[var(--cherry-text-1)] transition-colors',
              className
            )}
          >
            <HelpCircle className={sizeMap[size]} />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

HelpTooltip.displayName = 'HelpTooltip';
