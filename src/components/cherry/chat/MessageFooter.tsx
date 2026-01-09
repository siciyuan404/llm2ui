/**
 * @file MessageFooter 组件
 * @description 消息底部操作按钮（复制、编辑、重新生成）
 * @module components/cherry/chat/MessageFooter
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Copy, Pencil, RefreshCw, Check } from 'lucide-react';
import { ActionIconButton } from '../buttons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface MessageFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 复制回调 */
  onCopy?: () => void;
  /** 编辑回调 */
  onEdit?: () => void;
  /** 重新生成回调 */
  onRegenerate?: () => void;
  /** 是否显示复制按钮 */
  showCopy?: boolean;
  /** 是否显示编辑按钮 */
  showEdit?: boolean;
  /** 是否显示重新生成按钮 */
  showRegenerate?: boolean;
}

export const MessageFooter = React.forwardRef<HTMLDivElement, MessageFooterProps>(
  (
    {
      onCopy,
      onEdit,
      onRegenerate,
      showCopy = true,
      showEdit = false,
      showRegenerate = false,
      className,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
      onCopy?.();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <TooltipProvider delayDuration={300}>
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-1 mt-2',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            className
          )}
          {...props}
        >
          {showCopy && (
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionIconButton
                  icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  size="sm"
                  onClick={handleCopy}
                  aria-label="复制"
                />
              </TooltipTrigger>
              <TooltipContent>
                {copied ? '已复制' : '复制'}
              </TooltipContent>
            </Tooltip>
          )}
          {showEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionIconButton
                  icon={<Pencil className="h-3.5 w-3.5" />}
                  size="sm"
                  onClick={onEdit}
                  aria-label="编辑"
                />
              </TooltipTrigger>
              <TooltipContent>编辑</TooltipContent>
            </Tooltip>
          )}
          {showRegenerate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionIconButton
                  icon={<RefreshCw className="h-3.5 w-3.5" />}
                  size="sm"
                  onClick={onRegenerate}
                  aria-label="重新生成"
                />
              </TooltipTrigger>
              <TooltipContent>重新生成</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }
);

MessageFooter.displayName = 'MessageFooter';
