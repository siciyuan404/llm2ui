/**
 * @file ModelAvatar 组件
 * @description 模型提供商 Logo 头像，支持 fallback 图标
 * @module components/cherry/avatar/ModelAvatar
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';
import type { AvatarSize } from './EmojiAvatar';

export interface Model {
  id: string;
  name: string;
  provider?: string;
}

export interface ModelAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 模型信息 */
  model: Model;
  /** 头像尺寸 */
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-6 w-6', // 24px
  md: 'h-8 w-8', // 32px
  lg: 'h-12 w-12', // 48px
};

const iconSizeClasses: Record<AvatarSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

// 提供商 Logo 映射（可扩展）
const providerLogos: Record<string, string> = {
  openai: '/logos/openai.svg',
  anthropic: '/logos/anthropic.svg',
  google: '/logos/google.svg',
  meta: '/logos/meta.svg',
};

export const ModelAvatar = React.forwardRef<HTMLDivElement, ModelAvatarProps>(
  ({ model, size = 'md', className, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const logoUrl = model.provider ? providerLogos[model.provider.toLowerCase()] : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'bg-[var(--cherry-background-soft)]',
          'overflow-hidden',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {logoUrl && !hasError ? (
          <img
            src={logoUrl}
            alt={model.provider || model.name}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <Bot className={cn('text-[var(--cherry-icon)]', iconSizeClasses[size])} />
        )}
      </div>
    );
  }
);

ModelAvatar.displayName = 'ModelAvatar';
