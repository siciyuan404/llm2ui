/**
 * @file Inputbar 组件
 * @description 聊天输入栏，支持自动调整高度、附件、@提及、Token 计数
 * @module components/cherry/chat/Inputbar
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Send, Square, Paperclip, X } from 'lucide-react';
import { ActionIconButton } from '../buttons';
import { InputbarTools, type InputbarTool } from './InputbarTools';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface MentionedModel {
  id: string;
  name: string;
}

export interface InputbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 输入值 */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string) => void;
  /** 发送回调 */
  onSend?: () => void;
  /** 暂停回调 */
  onPause?: () => void;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 附件列表 */
  attachments?: Attachment[];
  /** 附件变化回调 */
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  /** @提及的模型 */
  mentionedModels?: MentionedModel[];
  /** @提及变化回调 */
  onMentionedModelsChange?: (models: MentionedModel[]) => void;
  /** 是否显示 Token 计数 */
  showTokenCount?: boolean;
  /** Token 数量 */
  tokenCount?: number;
  /** 工具栏配置 */
  tools?: InputbarTool[];
  /** 最小高度 */
  minHeight?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 是否禁用 */
  disabled?: boolean;
}

export const Inputbar = React.forwardRef<HTMLDivElement, InputbarProps>(
  (
    {
      value = '',
      onChange,
      onSend,
      onPause,
      isLoading = false,
      placeholder = '输入消息...',
      attachments = [],
      onAttachmentsChange,
      mentionedModels = [],
      showTokenCount = false,
      tokenCount = 0,
      tools = [],
      minHeight = 30,
      maxHeight = 500,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // 自动调整高度
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [minHeight, maxHeight]);

    React.useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isLoading && value.trim()) {
          onSend?.();
        }
      }
    };

    const handleRemoveAttachment = (id: string) => {
      onAttachmentsChange?.(attachments.filter((a) => a.id !== id));
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border border-[var(--cherry-border)] rounded-xl',
          'bg-[var(--cherry-background)]',
          'focus-within:ring-2 focus-within:ring-[var(--cherry-primary)] focus-within:ring-offset-1',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {/* 附件预览 */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border-b border-[var(--cherry-border)]">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--cherry-background-soft)] text-sm"
              >
                <Paperclip className="h-3 w-3 text-[var(--cherry-icon)]" />
                <span className="max-w-[120px] truncate">{attachment.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="ml-1 text-[var(--cherry-icon)] hover:text-[var(--cherry-text-1)]"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* @提及的模型 */}
        {mentionedModels.length > 0 && (
          <div className="flex flex-wrap gap-1 px-3 pt-2">
            {mentionedModels.map((model) => (
              <span
                key={model.id}
                className="px-2 py-0.5 rounded-full bg-[var(--cherry-primary-soft)] text-xs text-[var(--cherry-primary)]"
              >
                @{model.name}
              </span>
            ))}
          </div>
        )}

        {/* 输入区域 */}
        <div className="flex items-end gap-2 p-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent',
              'text-[var(--cherry-text-1)] placeholder:text-[var(--cherry-text-2)]',
              'focus:outline-none',
              'px-2 py-1'
            )}
            style={{ minHeight, maxHeight }}
          />

          {/* 发送/暂停按钮 */}
          {isLoading ? (
            <ActionIconButton
              icon={<Square className="h-4 w-4" />}
              onClick={onPause}
              aria-label="暂停"
              className="bg-[var(--cherry-primary)] text-white hover:bg-[var(--cherry-primary)]/90"
            />
          ) : (
            <ActionIconButton
              icon={<Send className="h-4 w-4" />}
              onClick={onSend}
              disabled={disabled || !value.trim()}
              aria-label="发送"
              className={cn(
                value.trim() && 'bg-[var(--cherry-primary)] text-white hover:bg-[var(--cherry-primary)]/90'
              )}
            />
          )}
        </div>

        {/* 底部工具栏 */}
        {(tools.length > 0 || showTokenCount) && (
          <div className="flex items-center justify-between px-2 pb-2">
            {tools.length > 0 && <InputbarTools tools={tools} />}
            {showTokenCount && (
              <span className="text-xs text-[var(--cherry-text-2)] ml-auto">
                {tokenCount} tokens
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Inputbar.displayName = 'Inputbar';
