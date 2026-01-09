/**
 * @file Sidebar 组件
 * @description 垂直侧边栏导航，支持图标导航、用户头像、主题切换
 * @module components/cherry/app/Sidebar
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AssistantAvatar } from '../avatar';
import { ActionIconButton } from '../buttons';
import { useTheme } from '../context';

export interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** 侧边栏宽度 */
  width?: number;
  /** 导航项 */
  items: SidebarItem[];
  /** 固定项（显示在分隔线下方） */
  pinnedItems?: SidebarItem[];
  /** 当前激活项 ID */
  activeId?: string;
  /** 导航项点击回调 */
  onItemClick?: (id: string) => void;
  /** 用户头像配置 */
  avatar?: {
    type: 'image' | 'emoji';
    src?: string;
    emoji?: string;
  };
  /** 头像点击回调 */
  onAvatarClick?: () => void;
  /** 是否显示主题切换按钮 */
  showThemeToggle?: boolean;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      width = 60,
      items,
      pinnedItems,
      activeId,
      onItemClick,
      avatar,
      onAvatarClick,
      showThemeToggle = true,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const themeContext = React.useContext(
      React.createContext<ReturnType<typeof useTheme> | null>(null)
    );
    
    // 尝试使用 useTheme，如果不在 ThemeProvider 中则使用默认值
    let theme: 'light' | 'dark' = 'light';
    let settedTheme: 'light' | 'dark' | 'system' = 'system';
    let setTheme: (t: 'light' | 'dark' | 'system') => void = () => {};
    
    try {
      const ctx = useTheme();
      theme = ctx.theme;
      settedTheme = ctx.settedTheme;
      setTheme = ctx.setTheme;
    } catch {
      // 不在 ThemeProvider 中，使用默认值
    }

    const cycleTheme = () => {
      const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
      const currentIndex = modes.indexOf(settedTheme);
      const nextIndex = (currentIndex + 1) % modes.length;
      setTheme(modes[nextIndex]);
    };

    const ThemeIcon = settedTheme === 'light' ? Sun : settedTheme === 'dark' ? Moon : Monitor;

    return (
      <TooltipProvider delayDuration={300}>
        <aside
          ref={ref}
          className={cn(
            'flex flex-col items-center py-3 gap-2',
            'bg-[var(--cherry-background)]',
            'border-r border-[var(--cherry-border)]',
            className
          )}
          style={{
            width,
            minWidth: width,
            ...style,
          }}
          {...props}
        >
          {/* 用户头像 */}
          {avatar && (
            <div className="mb-2">
              <AssistantAvatar
                type={avatar.type}
                src={avatar.src}
                emoji={avatar.emoji}
                size="md"
                onClick={onAvatarClick}
                className={onAvatarClick ? 'cursor-pointer' : ''}
              />
            </div>
          )}

          {/* 主导航项 */}
          <nav className="flex flex-col items-center gap-1 flex-1">
            {items.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <ActionIconButton
                    icon={item.icon}
                    active={activeId === item.id}
                    onClick={() => onItemClick?.(item.id)}
                    aria-label={item.label}
                  />
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>

          {/* 固定项分隔线 */}
          {pinnedItems && pinnedItems.length > 0 && (
            <>
              <div className="w-6 h-px bg-[var(--cherry-border)] my-1" />
              <div className="flex flex-col items-center gap-1">
                {pinnedItems.map((item) => (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <ActionIconButton
                        icon={item.icon}
                        active={activeId === item.id}
                        onClick={() => onItemClick?.(item.id)}
                        aria-label={item.label}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </>
          )}

          {/* 主题切换按钮 */}
          {showThemeToggle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionIconButton
                  icon={<ThemeIcon className="h-4 w-4" />}
                  onClick={cycleTheme}
                  aria-label={`当前主题: ${settedTheme}`}
                />
              </TooltipTrigger>
              <TooltipContent side="right">
                主题: {settedTheme === 'light' ? '浅色' : settedTheme === 'dark' ? '深色' : '跟随系统'}
              </TooltipContent>
            </Tooltip>
          )}
        </aside>
      </TooltipProvider>
    );
  }
);

Sidebar.displayName = 'Sidebar';
