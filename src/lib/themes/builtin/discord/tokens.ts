/**
 * @file tokens.ts
 * @description Discord 主题的设计令牌定义
 * @module lib/themes/builtin/discord
 * @requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.3, 3.4, 3.5
 */

import type { ThemeTokens } from '../../types';

/**
 * Discord 深色模式设计令牌
 */
export const discordTokens: ThemeTokens = {
  colors: {
    // Discord Blurple 主色
    primary: '#5865F2',
    primaryForeground: '#ffffff',

    // 深色背景层级
    background: '#36393f',           // 主背景（聊天区域）
    backgroundSecondary: '#2f3136',  // 次级背景（频道列表）
    backgroundTertiary: '#202225',   // 三级背景（服务器列表）

    // 文字颜色
    foreground: '#dcddde',           // 主文字
    mutedForeground: '#72767d',      // 次要文字

    // 交互状态
    secondary: '#4f545c',            // 次要/悬停背景
    secondaryForeground: '#ffffff',
    accent: '#5865F2',               // 强调色（同主色）
    accentForeground: '#ffffff',
    muted: '#40444b',                // 静音/禁用背景
    hover: '#4f545c',                // 悬停状态
    active: '#5865F2',               // 激活状态

    // 边框和环
    border: '#202225',
    ring: '#5865F2',

    // 卡片和弹出层
    card: '#36393f',
    cardForeground: '#dcddde',
    popover: '#18191c',
    popoverForeground: '#dcddde',

    // 语义颜色
    destructive: '#ed4245',          // 错误/危险
    destructiveForeground: '#ffffff',
    success: '#3ba55c',              // 成功/在线
    warning: '#faa61a',              // 警告/离开
    info: '#5865F2',                 // 信息
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },

  typography: {
    fontFamily: {
      sans: '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
      mono: 'Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.375',
      relaxed: '1.625',
    },
  },

  shadows: {
    sm: '0 1px 0 rgba(4, 4, 5, 0.2), 0 1.5px 0 rgba(6, 6, 7, 0.05), 0 2px 0 rgba(4, 4, 5, 0.05)',
    md: '0 4px 4px rgba(0, 0, 0, 0.16)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.24)',
    xl: '0 16px 24px rgba(0, 0, 0, 0.32)',
  },

  radius: {
    none: '0',
    sm: '3px',
    md: '4px',
    lg: '8px',
    xl: '16px',
    full: '50%',
  },

  extensions: {
    discord: {
      name: 'Discord 扩展',
      description: 'Discord 特有的设计令牌',
      values: {
        serverIconSize: '48px',
        channelHeight: '34px',
        messageSpacing: '16px',
        avatarSize: '40px',
        memberListWidth: '240px',
        channelListWidth: '240px',
        serverListWidth: '72px',
      },
    },
  },
};

/**
 * Discord 浅色模式令牌覆盖
 * @requirements 3.5
 */
export const discordLightTokens: Record<string, string> = {
  // 浅色背景层级
  background: '#ffffff',
  backgroundSecondary: '#f2f3f5',
  backgroundTertiary: '#e3e5e8',

  // 浅色文字
  foreground: '#2e3338',
  mutedForeground: '#747f8d',

  // 交互状态
  secondary: '#ebedef',
  hover: '#d4d7dc',
  muted: '#ebedef',

  // 边框
  border: '#e3e5e8',

  // 卡片和弹出层
  card: '#ffffff',
  cardForeground: '#2e3338',
  popover: '#ffffff',
  popoverForeground: '#2e3338',

  // 保持主色不变（Discord Blurple）
  primary: '#5865F2',
  primaryForeground: '#ffffff',
  accent: '#5865F2',
  accentForeground: '#ffffff',
  ring: '#5865F2',
  
  // 语义颜色保持不变
  destructive: '#ed4245',
  destructiveForeground: '#ffffff',
  success: '#3ba55c',
  warning: '#faa61a',
  info: '#5865F2',
};

/**
 * Discord 深色模式 CSS 变量
 */
export const discordCssVariablesDark: Record<string, string> = {
  '--background': '223 6.7% 20.6%',           // #36393f
  '--background-secondary': '223 6.7% 17.6%', // #2f3136
  '--background-tertiary': '220 6.5% 13.1%',  // #202225
  '--foreground': '210 2.9% 86.3%',           // #dcddde
  '--muted-foreground': '214 4.3% 46.5%',     // #72767d
  '--primary': '235 85.6% 64.7%',             // #5865F2
  '--primary-foreground': '0 0% 100%',        // #ffffff
  '--secondary': '220 6.8% 31.4%',            // #4f545c
  '--secondary-foreground': '0 0% 100%',
  '--accent': '235 85.6% 64.7%',              // #5865F2
  '--accent-foreground': '0 0% 100%',
  '--muted': '220 7.7% 26.7%',                // #40444b
  '--border': '220 6.5% 13.1%',               // #202225
  '--ring': '235 85.6% 64.7%',                // #5865F2
  '--card': '223 6.7% 20.6%',                 // #36393f
  '--card-foreground': '210 2.9% 86.3%',
  '--popover': '225 6.3% 10.2%',              // #18191c
  '--popover-foreground': '210 2.9% 86.3%',
  '--destructive': '359 82.6% 59.4%',         // #ed4245
  '--destructive-foreground': '0 0% 100%',
  '--radius': '4px',
};

/**
 * Discord 浅色模式 CSS 变量
 */
export const discordCssVariablesLight: Record<string, string> = {
  '--background': '0 0% 100%',                // #ffffff
  '--background-secondary': '220 13% 95.3%',  // #f2f3f5
  '--background-tertiary': '220 9.1% 89.8%',  // #e3e5e8
  '--foreground': '210 10.8% 17.6%',          // #2e3338
  '--muted-foreground': '214 9.9% 50.4%',     // #747f8d
  '--primary': '235 85.6% 64.7%',             // #5865F2
  '--primary-foreground': '0 0% 100%',
  '--secondary': '220 14.3% 92.9%',           // #ebedef
  '--secondary-foreground': '210 10.8% 17.6%',
  '--accent': '235 85.6% 64.7%',              // #5865F2
  '--accent-foreground': '0 0% 100%',
  '--muted': '220 14.3% 92.9%',               // #ebedef
  '--border': '220 9.1% 89.8%',               // #e3e5e8
  '--ring': '235 85.6% 64.7%',                // #5865F2
  '--card': '0 0% 100%',                      // #ffffff
  '--card-foreground': '210 10.8% 17.6%',
  '--popover': '0 0% 100%',                   // #ffffff
  '--popover-foreground': '210 10.8% 17.6%',
  '--destructive': '359 82.6% 59.4%',         // #ed4245
  '--destructive-foreground': '0 0% 100%',
  '--radius': '4px',
};
