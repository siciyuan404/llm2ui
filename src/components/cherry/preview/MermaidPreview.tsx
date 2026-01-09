/**
 * @file MermaidPreview 组件
 * @description Mermaid 图表渲染预览
 * @module components/cherry/preview/MermaidPreview
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PreviewToolbar } from './PreviewToolbar';

export interface MermaidPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mermaid 代码 */
  content: string;
  /** 下载回调 */
  onDownload?: () => void;
  /** 复制回调 */
  onCopy?: () => void;
}

export const MermaidPreview = React.forwardRef<HTMLDivElement, MermaidPreviewProps>(
  ({ content, onDownload, onCopy, className, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [svg, setSvg] = React.useState<string>('');

    // 防抖渲染
    React.useEffect(() => {
      const timer = setTimeout(async () => {
        try {
          // 动态导入 mermaid（如果可用）
          const mermaid = await import('mermaid').catch(() => null);
          if (mermaid) {
            mermaid.default.initialize({
              startOnLoad: false,
              theme: 'default',
            });
            const { svg: renderedSvg } = await mermaid.default.render(
              `mermaid-${Date.now()}`,
              content
            );
            setSvg(renderedSvg);
            setError(null);
          } else {
            // Mermaid 不可用，显示代码
            setError('Mermaid 库未安装');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : '渲染失败');
        }
      }, 300);

      return () => clearTimeout(timer);
    }, [content]);

    const handleCopy = () => {
      if (svg) {
        navigator.clipboard.writeText(svg);
      } else {
        navigator.clipboard.writeText(content);
      }
      onCopy?.();
    };

    const handleDownload = () => {
      if (svg) {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mermaid-diagram.svg';
        a.click();
        URL.revokeObjectURL(url);
      }
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
          title="Mermaid"
          onCopy={handleCopy}
          onDownload={svg ? handleDownload : undefined}
        />
        <div
          ref={containerRef}
          className="p-4 bg-[var(--cherry-background)] overflow-auto"
        >
          {error ? (
            <div className="text-sm text-destructive">
              <p className="font-medium">渲染错误</p>
              <p className="mt-1 text-[var(--cherry-text-2)]">{error}</p>
              <pre className="mt-2 p-2 bg-[var(--cherry-background-soft)] rounded text-xs overflow-auto">
                {content}
              </pre>
            </div>
          ) : svg ? (
            <div
              className="flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="flex items-center justify-center h-32 text-[var(--cherry-text-2)]">
              加载中...
            </div>
          )}
        </div>
      </div>
    );
  }
);

MermaidPreview.displayName = 'MermaidPreview';
