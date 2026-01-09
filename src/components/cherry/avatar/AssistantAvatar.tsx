/**
 * @file AssistantAvatar 组件
 * @description 助手头像，支持 image 和 emoji 两种模式
 * @module components/cherry/avatar/AssistantAvatar
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { EmojiAvatar, type AvatarSize } from './EmojiAvatar';

export interface AssistantAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 头像类型 */
  type: 'image' | 'emoji';
  /** 图片 URL（type 为 image 时使用） */
  src?: string;
  /** Emoji 字符（type 为 emoji 时使用） */
  emoji?: string;
  /** 头像尺寸 */
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-6 w-6', // 24px
  md: 'h-8 w-8', // 32px
  lg: 'h-12 w-12', // 48px
};

export const AssistantAvatar = React.forwardRef<HTMLDivElement, AssistantAvatarProps>(
  ({ type, src, emoji, size = 'md', className, onClick, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    if (type === 'emoji' && emoji) {
      return (
        <EmojiAvatar
          ref={ref}
          emoji={emoji}
          size={size}
          className={cn(onClick && 'cursor-pointer', className)}
          onClick={onClick}
          {...props}
        />
      );
    }

    // Image mode
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'bg-[var(--cherry-background-soft)]',
          'overflow-hidden',
          onClick && 'cursor-pointer',
          sizeClasses[size],
          className
        )}
        onClick={onClick}
        {...props}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt="Assistant"
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <EmojiAvatar emoji="🤖" size={size} />
        )}
      </div>
    );
  }
);

AssistantAvatar.displayName = 'AssistantAvatar';
