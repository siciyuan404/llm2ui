/**
 * @file CodeToolbar 组件
 * @description 代码块工具栏（复制、运行、换行、展开）
 * @module components/cherry/code/CodeToolbar
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Copy, Play, WrapText, Maximize2, Minimize2, Check } from 'lucide-react';
import { ActionIconButton } from '../buttons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface CodeToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 语言标签 */
  language?: string;
  /** 复制回调 */
  onCopy?: () => void;
  /** 运行回调 */
  onRun?: () => void;
  /** 换行切换回调 */
  onToggleWrap?: () => void;
  /** 展开/折叠回调 */
  onToggleExpand?: () => void;
  /** 是否换行 */
  isWrapped?: boolean;
  /** 是否展开 */
  isExpanded?: boolean;
  /** 是否显示运行按钮 */
  showRunButton?: boolean;
}

export const CodeToolbar = React.forwardRef<HTMLDivElement, CodeToolbarProps>(
  (
    {
      language,
      onCopy,
      onRun,
      onToggleWrap,
      onToggleExpand,
      isWrapped = false,
      isExpanded = true,
      showRunButton = false,
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
            'flex items-center justify-between px-3 py-1.5',
            'bg-[var(--cherry-background-soft)]',
            'border-b border-[var(--cherry-border)]',
            className
          )}
          {...props}
        >
          {/* 语言标签 */}
          <span className="text-xs text-[var(--cherry-text-2)] font-mono">
            {language || 'text'}
          </span>

          {/* 工具按钮 */}
          <div className="flex items-center gap-1">
            {showRunButton && onRun && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ActionIconButton
                    icon={<Play className="h-3.5 w-3.5" />}
                    size="sm"
                    onClick={onRun}
                    aria-label="运行"
                  />
                </TooltipTrigger>
                <TooltipContent>运行</TooltipContent>
              </Tooltip>
            )}
            {onToggleWrap && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ActionIconButton
                    icon={<WrapText className="h-3.5 w-3.5" />}
                    size="sm"
                    active={isWrapped}
                    onClick={onToggleWrap}
                    aria-label={isWrapped ? '取消换行' : '自动换行'}
                  />
                </TooltipTrigger>
                <TooltipContent>{isWrapped ? '取消换行' : '自动换行'}</TooltipContent>
              </Tooltip>
            )}
            {onToggleExpand && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ActionIconButton
                    icon={isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    size="sm"
                    onClick={onToggleExpand}
                    aria-label={isExpanded ? '折叠' : '展开'}
                  />
                </TooltipTrigger>
                <TooltipContent>{isExpanded ? '折叠' : '展开'}</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionIconButton
                  icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  size="sm"
                  onClick={handleCopy}
                  aria-label="复制代码"
                />
              </TooltipTrigger>
              <TooltipContent>{copied ? '已复制' : '复制代码'}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }
);

CodeToolbar.displayName = 'CodeToolbar';
