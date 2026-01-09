/**
 * @file PreviewToolbar 组件
 * @description 预览组件通用工具栏
 * @module components/cherry/preview/PreviewToolbar
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Download, Copy, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ActionIconButton } from '../buttons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface PreviewToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 标题 */
  title?: string;
  /** 下载回调 */
  onDownload?: () => void;
  /** 复制回调 */
  onCopy?: () => void;
  /** 放大回调 */
  onZoomIn?: () => void;
  /** 缩小回调 */
  onZoomOut?: () => void;
  /** 重置缩放回调 */
  onResetZoom?: () => void;
  /** 当前缩放比例 */
  zoom?: number;
  /** 是否显示缩放控制 */
  showZoomControls?: boolean;
}

export const PreviewToolbar = React.forwardRef<HTMLDivElement, PreviewToolbarProps>(
  (
    {
      title,
      onDownload,
      onCopy,
      onZoomIn,
      onZoomOut,
      onResetZoom,
      zoom = 100,
      showZoomControls = false,
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
          <span className="text-xs text-[var(--cherry-text-2)]">
            {title || 'Preview'}
          </span>

          <div className="flex items-center gap-1">
            {showZoomControls && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ActionIconButton
                      icon={<ZoomOut className="h-3.5 w-3.5" />}
                      size="sm"
                      onClick={onZoomOut}
                      aria-label="缩小"
                    />
                  </TooltipTrigger>
                  <TooltipContent>缩小</TooltipContent>
                </Tooltip>
                <span className="text-xs text-[var(--cherry-text-2)] min-w-[40px] text-center">
                  {zoom}%
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ActionIconButton
                      icon={<ZoomIn className="h-3.5 w-3.5" />}
                      size="sm"
                      onClick={onZoomIn}
                      aria-label="放大"
                    />
                  </TooltipTrigger>
                  <TooltipContent>放大</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ActionIconButton
                      icon={<RotateCcw className="h-3.5 w-3.5" />}
                      size="sm"
                      onClick={onResetZoom}
                      aria-label="重置缩放"
                    />
                  </TooltipTrigger>
                  <TooltipContent>重置缩放</TooltipContent>
                </Tooltip>
                <div className="w-px h-4 bg-[var(--cherry-border)] mx-1" />
              </>
            )}
            {onCopy && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ActionIconButton
                    icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    size="sm"
                    onClick={handleCopy}
                    aria-label="复制"
                  />
                </TooltipTrigger>
                <TooltipContent>{copied ? '已复制' : '复制'}</TooltipContent>
              </Tooltip>
            )}
            {onDownload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ActionIconButton
                    icon={<Download className="h-3.5 w-3.5" />}
                    size="sm"
                    onClick={onDownload}
                    aria-label="下载"
                  />
                </TooltipTrigger>
                <TooltipContent>下载</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }
);

PreviewToolbar.displayName = 'PreviewToolbar';
