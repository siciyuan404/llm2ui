/**
 * @file EmojiAvatar 组件
 * @description Emoji 字符圆形头像，支持多种尺寸
 * @module components/cherry/avatar/EmojiAvatar
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface EmojiAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Emoji 字符 */
  emoji: string;
  /** 头像尺寸 */
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-sm', // 24px
  md: 'h-8 w-8 text-base', // 32px
  lg: 'h-12 w-12 text-2xl', // 48px
};

export const EmojiAvatar = React.forwardRef<HTMLDivElement, EmojiAvatarProps>(
  ({ emoji, size = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'bg-[var(--cherry-background-soft)]',
          'select-none',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span role="img" aria-label="avatar">
          {emoji}
        </span>
      </div>
    );
  }
);

EmojiAvatar.displayName = 'EmojiAvatar';
