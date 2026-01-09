/**
 * @file Message 组件
 * @description 完整的消息组件，组合 Header/Content/Footer
 * @module components/cherry/chat/Message
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { MessageHeader } from './MessageHeader';
import { MessageContent, type MessageBlock } from './MessageContent';
import { MessageFooter } from './MessageFooter';

export type MessageRole = 'user' | 'assistant';

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 消息 ID */
  id: string;
  /** 消息角色 */
  role: MessageRole;
  /** 消息内容 */
  content: string | MessageBlock[];
  /** 头像配置 */
  avatar?: {
    type: 'image' | 'emoji';
    src?: string;
    emoji?: string;
  };
  /** 发送者名称 */
  name?: string;
  /** 时间戳 */
  timestamp?: Date;
  /** 是否正在编辑 */
  isEditing?: boolean;
  /** 是否正在流式输出 */
  isStreaming?: boolean;
  /** 编辑回调 */
  onEdit?: () => void;
  /** 复制回调 */
  onCopy?: () => void;
  /** 重新生成回调 */
  onRegenerate?: () => void;
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  (
    {
      id,
      role,
      content,
      avatar,
      name,
      timestamp,
      isEditing,
      isStreaming,
      onEdit,
      onCopy,
      onRegenerate,
      className,
      ...props
    },
    ref
  ) => {
    const isUser = role === 'user';

    // 默认头像
    const defaultAvatar = isUser
      ? { type: 'emoji' as const, emoji: '👤' }
      : { type: 'emoji' as const, emoji: '🤖' };

    // 默认名称
    const defaultName = isUser ? '用户' : '助手';

    return (
      <div
        ref={ref}
        data-message-id={id}
        className={cn(
          'group px-4 py-3',
          isUser
            ? 'bg-[var(--cherry-chat-background-user)]'
            : 'bg-[var(--cherry-chat-background-assistant)]',
          className
        )}
        {...props}
      >
        <div className="max-w-3xl mx-auto">
          <MessageHeader
            avatar={avatar || defaultAvatar}
            name={name || defaultName}
            timestamp={timestamp}
          />
          <div className="pl-10">
            <MessageContent
              content={content}
              isStreaming={isStreaming}
            />
            <MessageFooter
              onCopy={onCopy}
              onEdit={onEdit}
              onRegenerate={onRegenerate}
              showCopy={true}
              showEdit={isUser}
              showRegenerate={!isUser}
            />
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = 'Message';
