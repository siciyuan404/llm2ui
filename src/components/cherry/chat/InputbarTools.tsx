/**
 * @file InputbarTools 组件
 * @description 输入栏工具栏按钮组
 * @module components/cherry/chat/InputbarTools
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ActionIconButton } from '../buttons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface InputbarTool {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

export interface InputbarToolsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 工具列表 */
  tools: InputbarTool[];
}

export const InputbarTools = React.forwardRef<HTMLDivElement, InputbarToolsProps>(
  ({ tools, className, ...props }, ref) => {
    return (
      <TooltipProvider delayDuration={300}>
        <div
          ref={ref}
          className={cn('flex items-center gap-1', className)}
          {...props}
        >
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <ActionIconButton
                  icon={tool.icon}
                  size="sm"
                  active={tool.active}
                  disabled={tool.disabled}
                  onClick={tool.onClick}
                  aria-label={tool.label}
                />
              </TooltipTrigger>
              <TooltipContent>{tool.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  }
);

InputbarTools.displayName = 'InputbarTools';
