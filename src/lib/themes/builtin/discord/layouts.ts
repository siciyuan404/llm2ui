/**
 * @file layouts.ts
 * @description Discord 主题的布局配置
 * @module lib/themes/builtin/discord
 * @requirements 7.1, 7.2, 7.3, 7.4
 */

import type { LayoutConfig } from '../../types';

/**
 * Discord 默认布局
 * @requirements 7.1
 * 
 * 经典的 Discord 三栏布局：
 * - 服务器侧边栏 (72px): 显示服务器图标列表
 * - 频道列表 (240px): 显示当前服务器的频道
 * - 主内容区: 聊天消息或其他内容
 * 
 * 总侧边栏宽度: 72px + 240px = 312px
 */
export const discordDefaultLayout: LayoutConfig = {
  id: 'discord-default',
  name: 'Discord 默认布局',
  description: '服务器侧边栏 (72px) + 频道列表 (240px) + 主内容区，经典的 Discord 三栏布局',
  preview: 'discord-default-preview',
  config: {
    sidebar: 'left',
    sidebarWidth: '312px', // 72px (服务器) + 240px (频道)
    mainContent: 'full',
    previewPanel: 'none',
  },
};

/**
 * Discord 紧凑布局
 * @requirements 7.2
 * 
 * 折叠的侧边栏布局：
 * - 仅显示服务器图标侧边栏 (72px)
 * - 频道列表隐藏或折叠
 * - 更多空间给主内容区
 * 
 * 适用于小屏幕或需要更多内容空间的场景
 */
export const discordCompactLayout: LayoutConfig = {
  id: 'discord-compact',
  name: 'Discord 紧凑布局',
  description: '仅服务器图标侧边栏 (72px)，频道列表折叠，适用于小屏幕',
  preview: 'discord-compact-preview',
  config: {
    sidebar: 'left',
    sidebarWidth: '72px', // 仅服务器图标
    mainContent: 'full',
    previewPanel: 'none',
  },
};

/**
 * Discord 全屏布局
 * @requirements 7.3
 * 
 * 无侧边栏的全屏内容视图：
 * - 隐藏所有侧边栏
 * - 主内容区占满整个屏幕
 * - 适用于专注模式、全屏聊天或演示
 */
export const discordFullscreenLayout: LayoutConfig = {
  id: 'discord-fullscreen',
  name: 'Discord 全屏布局',
  description: '无侧边栏的全屏内容视图，适用于专注模式',
  preview: 'discord-fullscreen-preview',
  config: {
    sidebar: 'none',
    mainContent: 'full',
    previewPanel: 'none',
  },
};

/**
 * Discord 主题的所有布局配置
 * @requirements 7.1, 7.2, 7.3, 7.4
 */
export const discordLayouts: LayoutConfig[] = [
  discordDefaultLayout,
  discordCompactLayout,
  discordFullscreenLayout,
];

/**
 * 获取 Discord 布局配置 by ID
 * @param layoutId 布局 ID
 * @returns 布局配置或 undefined
 */
export function getDiscordLayoutById(layoutId: string): LayoutConfig | undefined {
  return discordLayouts.find(layout => layout.id === layoutId);
}

/**
 * 获取所有 Discord 布局 ID
 * @returns 布局 ID 数组
 */
export function getDiscordLayoutIds(): string[] {
  return discordLayouts.map(layout => layout.id);
}

/**
 * Discord 布局常量
 */
export const DISCORD_LAYOUT_CONSTANTS = {
  /** 服务器图标侧边栏宽度 */
  SERVER_SIDEBAR_WIDTH: '72px',
  /** 频道列表宽度 */
  CHANNEL_LIST_WIDTH: '240px',
  /** 成员列表宽度 */
  MEMBER_LIST_WIDTH: '240px',
  /** 默认布局的总侧边栏宽度 */
  DEFAULT_SIDEBAR_WIDTH: '312px',
} as const;

export default discordLayouts;
