/**
 * @file MessageHeader 组件
 * @description 消息头部，显示头像、名称、时间戳
 * @module components/cherry/chat/MessageHeader
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AssistantAvatar, type AvatarSize } from '../avatar';

export interface MessageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
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
  /** 头像尺寸 */
  avatarSize?: AvatarSize;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MessageHeader = React.forwardRef<HTMLDivElement, MessageHeaderProps>(
  ({ avatar, name, timestamp, avatarSize = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 mb-2', className)}
        {...props}
      >
        {avatar && (
          <AssistantAvatar
            type={avatar.type}
            src={avatar.src}
            emoji={avatar.emoji}
            size={avatarSize}
          />
        )}
        <div className="flex items-center gap-2">
          {name && (
            <span className="font-medium text-[var(--cherry-text-1)]">
              {name}
            </span>
          )}
          {timestamp && (
            <span className="text-xs text-[var(--cherry-text-2)]">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }
);

MessageHeader.displayName = 'MessageHeader';
