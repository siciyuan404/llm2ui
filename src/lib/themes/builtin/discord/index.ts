/**
 * @file index.ts
 * @description Discord 风格主题包的主入口
 * @module lib/themes/builtin/discord
 * @requirements 1.1, 1.2, 1.3, 1.4
 */

import type { ThemePack, ColorScheme } from '../../types';
import { discordTokens, discordLightTokens, discordCssVariablesDark, discordCssVariablesLight } from './tokens';
import { discordComponents } from './components';
import { discordExamples } from './examples';
import { zhPromptTemplates } from './prompts/zh';
import { enPromptTemplates } from './prompts/en';
import { discordLayouts } from './layouts';

/**
 * Discord 深色配色方案
 * @requirements 3.1, 3.4
 * 
 * Discord 的标志性深色主题，使用深灰色背景层级和 Blurple 主色调
 */
export const discordDarkColorScheme: ColorScheme = {
  id: 'dark',
  name: '深色模式',
  type: 'dark',
  colors: {
    // 背景层级 - Discord 特有的三层深色背景
    background: discordTokens.colors.background,           // #36393f - 主背景（聊天区域）
    backgroundSecondary: discordTokens.colors.backgroundSecondary ?? '#2f3136', // 频道列表
    backgroundTertiary: discordTokens.colors.backgroundTertiary ?? '#202225',   // 服务器列表
    
    // 文字颜色
    foreground: discordTokens.colors.foreground,           // #dcddde - 主文字
    mutedForeground: discordTokens.colors.mutedForeground, // #72767d - 次要文字
    
    // 主色调 - Discord Blurple
    primary: discordTokens.colors.primary,                 // #5865F2
    primaryForeground: discordTokens.colors.primaryForeground, // #ffffff
    
    // 次要颜色
    secondary: discordTokens.colors.secondary,             // #4f545c
    secondaryForeground: discordTokens.colors.secondaryForeground, // #ffffff
    
    // 强调色
    accent: discordTokens.colors.accent,                   // #5865F2
    accentForeground: discordTokens.colors.accentForeground, // #ffffff
    
    // 静音/禁用状态
    muted: discordTokens.colors.muted,                     // #40444b
    
    // 边框
    border: discordTokens.colors.border,                   // #202225
    ring: discordTokens.colors.ring,                       // #5865F2
    
    // 卡片和弹出层
    card: discordTokens.colors.card ?? '#36393f',          // #36393f
    cardForeground: discordTokens.colors.cardForeground ?? '#dcddde', // #dcddde
    popover: discordTokens.colors.popover ?? '#18191c',    // #18191c
    popoverForeground: discordTokens.colors.popoverForeground ?? '#dcddde', // #dcddde
    
    // 语义颜色
    destructive: discordTokens.colors.destructive ?? '#ed4245', // #ed4245 - 错误/危险
    destructiveForeground: discordTokens.colors.destructiveForeground ?? '#ffffff', // #ffffff
    success: discordTokens.colors.success ?? '#3ba55c',    // #3ba55c - 成功/在线
    warning: discordTokens.colors.warning ?? '#faa61a',    // #faa61a - 警告/离开
    info: discordTokens.colors.info ?? '#5865F2',          // #5865F2 - 信息
    
    // 交互状态
    hover: discordTokens.colors.hover ?? '#4f545c',        // #4f545c
    active: discordTokens.colors.active ?? '#5865F2',      // #5865F2
  },
  cssVariables: discordCssVariablesDark,
};

/**
 * Discord 浅色配色方案
 * @requirements 3.2, 3.5
 * 
 * Discord 的浅色主题，保持 Blurple 主色调不变
 */
export const discordLightColorScheme: ColorScheme = {
  id: 'light',
  name: '浅色模式',
  type: 'light',
  colors: {
    // 背景层级 - 浅色版本
    background: discordLightTokens.background,             // #ffffff - 主背景
    backgroundSecondary: discordLightTokens.backgroundSecondary ?? '#f2f3f5', // 频道列表
    backgroundTertiary: discordLightTokens.backgroundTertiary ?? '#e3e5e8',   // 服务器列表
    
    // 文字颜色
    foreground: discordLightTokens.foreground,             // #2e3338 - 主文字
    mutedForeground: discordLightTokens.mutedForeground ?? '#747f8d', // 次要文字
    
    // 主色调 - Discord Blurple（保持不变）
    primary: discordLightTokens.primary,                   // #5865F2
    primaryForeground: '#ffffff',
    
    // 次要颜色
    secondary: discordLightTokens.secondary,               // #ebedef
    secondaryForeground: discordLightTokens.foreground,    // #2e3338
    
    // 强调色
    accent: discordLightTokens.accent,                     // #5865F2
    accentForeground: '#ffffff',
    
    // 静音/禁用状态
    muted: discordLightTokens.muted,                       // #ebedef
    
    // 边框
    border: discordLightTokens.border,                     // #e3e5e8
    ring: discordLightTokens.primary,                      // #5865F2
    
    // 卡片和弹出层
    card: discordLightTokens.card ?? '#ffffff',            // #ffffff
    cardForeground: discordLightTokens.cardForeground ?? discordLightTokens.foreground, // #2e3338
    popover: discordLightTokens.popover ?? '#ffffff',      // #ffffff
    popoverForeground: discordLightTokens.popoverForeground ?? discordLightTokens.foreground, // #2e3338
    
    // 语义颜色（保持不变）
    destructive: discordLightTokens.destructive ?? '#ed4245', // #ed4245
    destructiveForeground: discordLightTokens.destructiveForeground ?? '#ffffff',
    success: discordLightTokens.success ?? '#3ba55c',      // #3ba55c
    warning: discordLightTokens.warning ?? '#faa61a',      // #faa61a
    info: discordLightTokens.info ?? '#5865F2',
    
    // 交互状态
    hover: discordLightTokens.hover ?? '#d4d7dc',          // #d4d7dc
    active: discordLightTokens.active ?? '#5865F2',
  },
  cssVariables: discordCssVariablesLight,
};

/**
 * Discord 主题的配色方案集合
 * @requirements 3.1, 3.2, 3.3
 */
export const discordColorSchemes: ColorScheme[] = [
  discordDarkColorScheme,
  discordLightColorScheme,
];

/**
 * Discord 主题包
 */
export const discordThemePack: ThemePack = {
  // 基础信息
  id: 'discord',
  name: 'Discord',
  description: '深色游戏风主题，紫蓝主色调，模仿 Discord 聊天应用界面',
  version: '1.0.0',
  author: 'LLM2UI Team',
  repository: 'https://github.com/discord',
  homepage: 'https://discord.com',

  // 核心配置
  tokens: discordTokens,
  components: discordComponents,
  examples: discordExamples,
  prompts: {
    templates: {
      zh: zhPromptTemplates,
      en: enPromptTemplates,
    },
  },

  // 外观配置
  colorSchemes: discordColorSchemes,
  layouts: discordLayouts,

  // 扩展
  extensions: {
    // Discord 特有配置
    discordConfig: {
      defaultColorScheme: 'dark',
      serverIconSize: 48,
      channelListWidth: 240,
      memberListWidth: 240,
      messageSpacing: 16,
      avatarSize: 40,
    },
    // Tailwind 配置
    tailwindConfig: {
      darkMode: 'class',
      prefix: '',
    },
  },
};

// 导出所有子模块
export { discordTokens, discordLightTokens, discordCssVariablesDark, discordCssVariablesLight } from './tokens';
export { discordComponents, createDiscordComponentRegistry, discordComponentCategories } from './components';
export {
  discordExamples,
  discordExamplePresets,
  getDiscordExampleIds,
  getDiscordExampleById,
  getDiscordExamplesByCategory,
  getDiscordExamplesByKeyword,
} from './examples';
export { zhPromptTemplates } from './prompts/zh';
export { enPromptTemplates } from './prompts/en';
export {
  discordLayouts,
  discordDefaultLayout,
  discordCompactLayout,
  discordFullscreenLayout,
  getDiscordLayoutById,
  getDiscordLayoutIds,
  DISCORD_LAYOUT_CONSTANTS,
} from './layouts';

// 默认导出主题包
export default discordThemePack;
