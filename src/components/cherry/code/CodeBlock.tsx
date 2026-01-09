/**
 * @file CodeBlock 组件
 * @description 语法高亮代码块，支持行号、换行、展开/折叠
 * @module components/cherry/code/CodeBlock
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CodeToolbar } from './CodeToolbar';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 代码内容 */
  code: string;
  /** 语言 */
  language?: string;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 是否显示头部工具栏 */
  showHeader?: boolean;
  /** 是否显示复制按钮 */
  showCopyButton?: boolean;
  /** 是否显示运行按钮 */
  showRunButton?: boolean;
  /** 是否换行 */
  isWrapped?: boolean;
  /** 是否展开 */
  isExpanded?: boolean;
  /** 最大高度（折叠时） */
  maxHeight?: number;
  /** 复制回调 */
  onCopy?: () => void;
  /** 运行回调 */
  onRun?: () => void;
  /** 换行切换回调 */
  onToggleWrap?: () => void;
  /** 展开切换回调 */
  onToggleExpand?: () => void;
}

// 可运行的语言
const runnableLanguages = ['html', 'javascript', 'js', 'jsx', 'tsx'];

export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language,
      showLineNumbers = false,
      showHeader = true,
      showCopyButton = true,
      showRunButton,
      isWrapped: controlledIsWrapped,
      isExpanded: controlledIsExpanded,
      maxHeight = 300,
      onCopy,
      onRun,
      onToggleWrap,
      onToggleExpand,
      className,
      ...props
    },
    ref
  ) => {
    // 内部状态（如果没有受控）
    const [internalIsWrapped, setInternalIsWrapped] = React.useState(false);
    const [internalIsExpanded, setInternalIsExpanded] = React.useState(true);

    const isWrapped = controlledIsWrapped ?? internalIsWrapped;
    const isExpanded = controlledIsExpanded ?? internalIsExpanded;

    const handleToggleWrap = () => {
      if (onToggleWrap) {
        onToggleWrap();
      } else {
        setInternalIsWrapped(!internalIsWrapped);
      }
    };

    const handleToggleExpand = () => {
      if (onToggleExpand) {
        onToggleExpand();
      } else {
        setInternalIsExpanded(!internalIsExpanded);
      }
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(code);
      onCopy?.();
    };

    const lines = code.split('\n');
    const canRun = showRunButton ?? (language && runnableLanguages.includes(language.toLowerCase()));

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
        {showHeader && (
          <CodeToolbar
            language={language}
            onCopy={showCopyButton ? handleCopy : undefined}
            onRun={canRun ? onRun : undefined}
            onToggleWrap={handleToggleWrap}
            onToggleExpand={handleToggleExpand}
            isWrapped={isWrapped}
            isExpanded={isExpanded}
            showRunButton={canRun}
          />
        )}
        <div
          className={cn(
            'overflow-auto bg-[var(--cherry-background-soft)]',
            !isExpanded && 'relative'
          )}
          style={{
            maxHeight: isExpanded ? undefined : maxHeight,
          }}
        >
          <pre
            className={cn(
              'p-3 text-sm font-mono',
              isWrapped ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
            )}
          >
            {showLineNumbers ? (
              <table className="w-full border-collapse">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="pr-4 text-right text-[var(--cherry-text-2)] select-none w-8">
                        {index + 1}
                      </td>
                      <td className="text-[var(--cherry-text-1)]">
                        {line || ' '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <code className="text-[var(--cherry-text-1)]">{code}</code>
            )}
          </pre>
          {/* 折叠时的渐变遮罩 */}
          {!isExpanded && (
            <div
              className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
              style={{
                background: 'linear-gradient(transparent, var(--cherry-background-soft))',
              }}
            />
          )}
        </div>
      </div>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';
