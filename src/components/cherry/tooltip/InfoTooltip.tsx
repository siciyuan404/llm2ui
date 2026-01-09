/**
 * @file InfoTooltip 组件
 * @description 信息提示图标，显示信息图标和说明内容
 * @module components/cherry/tooltip/InfoTooltip
 */

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InfoTooltipProps {
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

export function InfoTooltip({
  content,
  size = 'md',
  delayDuration = 200,
  side = 'top',
  className,
}: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center justify-center cursor-help text-[var(--cherry-primary)] hover:text-[var(--cherry-primary-soft)] transition-colors',
              className
            )}
          >
            <Info className={sizeMap[size]} />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

InfoTooltip.displayName = 'InfoTooltip';
