/**
 * @file MessageContent 组件
 * @description 消息内容渲染，支持文本、代码、思考块等类型
 * @module components/cherry/chat/MessageContent
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';

export interface MessageBlock {
  type: 'text' | 'code' | 'thinking' | 'image' | 'tool';
  content: string;
  language?: string;
  isCollapsed?: boolean;
}

export interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 消息内容（字符串或块数组） */
  content: string | MessageBlock[];
  /** 是否正在流式输出 */
  isStreaming?: boolean;
}

interface ThinkingBlockProps {
  content: string;
  defaultCollapsed?: boolean;
}

function ThinkingBlock({ content, defaultCollapsed = true }: ThinkingBlockProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className="my-2 rounded-lg border border-[var(--cherry-border)] bg-[var(--cherry-background-soft)]">
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2',
          'text-sm text-[var(--cherry-text-2)]',
          'hover:bg-[var(--cherry-hover)] transition-colors',
          'rounded-t-lg',
          !isCollapsed && 'border-b border-[var(--cherry-border)]'
        )}
      >
        <Brain className="h-4 w-4" />
        <span>思考过程</span>
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto" />
        )}
      </button>
      {!isCollapsed && (
        <div className="px-3 py-2 text-sm text-[var(--cherry-text-2)] whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}

interface CodeBlockSimpleProps {
  code: string;
  language?: string;
}

function CodeBlockSimple({ code, language }: CodeBlockSimpleProps) {
  return (
    <div className="my-2 rounded-lg overflow-hidden border border-[var(--cherry-border)]">
      {language && (
        <div className="px-3 py-1.5 bg-[var(--cherry-background-soft)] border-b border-[var(--cherry-border)] text-xs text-[var(--cherry-text-2)]">
          {language}
        </div>
      )}
      <pre className="p-3 overflow-x-auto bg-[var(--cherry-background-soft)]">
        <code className="text-sm font-mono text-[var(--cherry-text-1)]">
          {code}
        </code>
      </pre>
    </div>
  );
}

export const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  ({ content, isStreaming, className, ...props }, ref) => {
    // 如果是字符串，直接渲染
    if (typeof content === 'string') {
      return (
        <div
          ref={ref}
          className={cn(
            'text-[var(--cherry-text-1)] whitespace-pre-wrap',
            isStreaming && 'animate-pulse',
            className
          )}
          {...props}
        >
          {content}
          {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-[var(--cherry-primary)] animate-blink" />}
        </div>
      );
    }

    // 渲染块数组
    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        {content.map((block, index) => {
          switch (block.type) {
            case 'text':
              return (
                <p key={index} className="text-[var(--cherry-text-1)] whitespace-pre-wrap">
                  {block.content}
                </p>
              );
            case 'code':
              return (
                <CodeBlockSimple
                  key={index}
                  code={block.content}
                  language={block.language}
                />
              );
            case 'thinking':
              return (
                <ThinkingBlock
                  key={index}
                  content={block.content}
                  defaultCollapsed={block.isCollapsed}
                />
              );
            case 'image':
              return (
                <img
                  key={index}
                  src={block.content}
                  alt="Message image"
                  className="max-w-full rounded-lg"
                />
              );
            case 'tool':
              return (
                <div
                  key={index}
                  className="my-2 p-3 rounded-lg bg-[var(--cherry-background-soft)] border border-[var(--cherry-border)]"
                >
                  <span className="text-xs text-[var(--cherry-text-2)]">工具调用</span>
                  <pre className="mt-1 text-sm font-mono text-[var(--cherry-text-1)]">
                    {block.content}
                  </pre>
                </div>
              );
            default:
              return null;
          }
        })}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-[var(--cherry-primary)] animate-blink" />
        )}
      </div>
    );
  }
);

MessageContent.displayName = 'MessageContent';
