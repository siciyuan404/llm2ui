/**
 * @file SvgPreview 组件
 * @description SVG 内容渲染预览，支持缩放控制
 * @module components/cherry/preview/SvgPreview
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PreviewToolbar } from './PreviewToolbar';

export interface SvgPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** SVG 内容 */
  content: string;
  /** 下载回调 */
  onDownload?: () => void;
  /** 复制回调 */
  onCopy?: () => void;
}

export const SvgPreview = React.forwardRef<HTMLDivElement, SvgPreviewProps>(
  ({ content, onDownload, onCopy, className, ...props }, ref) => {
    const [zoom, setZoom] = React.useState(100);
    const [error, setError] = React.useState<string | null>(null);

    // 验证 SVG 内容
    React.useEffect(() => {
      if (!content.trim().startsWith('<svg') && !content.trim().startsWith('<?xml')) {
        setError('无效的 SVG 内容');
      } else {
        setError(null);
      }
    }, [content]);

    const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 25));
    const handleResetZoom = () => setZoom(100);

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      onCopy?.();
    };

    const handleDownload = () => {
      const blob = new Blob([content], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'image.svg';
      a.click();
      URL.revokeObjectURL(url);
      onDownload?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg overflow-hidden',
          'border border-[var(--cherry-border)]',
          className
        )}
        {...props}
      >
        <PreviewToolbar
          title="SVG"
          onCopy={handleCopy}
          onDownload={handleDownload}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          zoom={zoom}
          showZoomControls
        />
        <div className="p-4 bg-[var(--cherry-background)] overflow-auto">
          {error ? (
            <div className="text-sm text-destructive">
              <p className="font-medium">渲染错误</p>
              <p className="mt-1 text-[var(--cherry-text-2)]">{error}</p>
            </div>
          ) : (
            <div
              className="flex items-center justify-center transition-transform"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    );
  }
);

SvgPreview.displayName = 'SvgPreview';
