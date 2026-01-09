/**
 * @file WarnTooltip 组件
 * @description 警告提示图标，显示警告图标和警告内容
 * @module components/cherry/tooltip/WarnTooltip
 */

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WarnTooltipProps {
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

export function WarnTooltip({
  content,
  size = 'md',
  delayDuration = 200,
  side = 'top',
  className,
}: WarnTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center justify-center cursor-help text-amber-500 hover:text-amber-600 transition-colors',
              className
            )}
          >
            <AlertTriangle className={sizeMap[size]} />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

WarnTooltip.displayName = 'WarnTooltip';
