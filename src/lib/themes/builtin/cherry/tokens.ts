/**
 * @file tokens.ts
 * @description Cherry Studio 主题的设计令牌定义
 * @module lib/themes/builtin/cherry
 * @requirements 3.2
 */

import type { ThemeTokens } from '../../types';

/**
 * Cherry Studio 主题的设计令牌
 * 基于 Cherry Studio 的深色主题设计规范
 */
export const cherryTokens: ThemeTokens = {
  colors: {
    // 基础颜色 - Cherry 深色主题
    background: 'var(--cherry-background, #1a1a1a)',
    foreground: 'var(--cherry-foreground, #e5e5e5)',
    
    // 主色 - Cherry 紫色调
    primary: 'var(--cherry-primary, #7c3aed)',
    primaryForeground: 'var(--cherry-primary-foreground, #ffffff)',
    
    // 次要色
    secondary: 'var(--cherry-secondary, #27272a)',
    secondaryForeground: 'var(--cherry-secondary-foreground, #e5e5e5)',
    
    // 强调色
    accent: 'var(--cherry-accent, #7c3aed)',
    accentForeground: 'var(--cherry-accent-foreground, #ffffff)',
    
    // 静音色
    muted: 'var(--cherry-muted, #27272a)',
    mutedForeground: 'var(--cherry-muted-foreground, #a1a1aa)',
    
    // 边框和环
    border: 'var(--cherry-border, #3f3f46)',
    ring: 'var(--cherry-ring, #7c3aed)',
    
    // 破坏性操作
    destructive: 'var(--cherry-destructive, #ef4444)',
    destructiveForeground: 'var(--cherry-destructive-foreground, #ffffff)',
    
    // 卡片
    card: 'var(--cherry-card, #27272a)',
    cardForeground: 'var(--cherry-card-foreground, #e5e5e5)',
    
    // 弹出层
    popover: 'var(--cherry-popover, #27272a)',
    popoverForeground: 'var(--cherry-popover-foreground, #e5e5e5)',
    
    // 输入框
    input: 'var(--cherry-input, #3f3f46)',
    
    // Cherry 特有颜色
    backgroundSoft: 'var(--cherry-background-soft, #27272a)',
    hover: 'var(--cherry-hover, #3f3f46)',
    active: 'var(--cherry-active, #52525b)',
    text2: 'var(--cherry-text-2, #a1a1aa)',
    chatUser: 'var(--cherry-chat-user, #7c3aed)',
    primarySoft: 'var(--cherry-primary-soft, #6d28d9)',
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },
  
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
  },
  
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },
  
  // Cherry 特有的扩展令牌
  extensions: {
    cherry: {
      name: 'Cherry 专属令牌',
      description: 'Cherry Studio 风格的专属设计令牌',
      values: {
        sidebarWidth: '60px',
        conversationListWidth: '256px',
        headerHeight: '48px',
        inputBarMinHeight: '40px',
        inputBarMaxHeight: '200px',
        avatarSize: '32px',
        avatarSizeLg: '40px',
        messageMaxWidth: '70%',
        transitionDuration: '150ms',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
};

/**
 * Cherry Studio 浅色模式令牌覆盖
 */
export const cherryLightTokens: Partial<ThemeTokens['colors']> = {
  background: 'var(--cherry-background, #ffffff)',
  foreground: 'var(--cherry-foreground, #18181b)',
  
  primary: 'var(--cherry-primary, #7c3aed)',
  primaryForeground: 'var(--cherry-primary-foreground, #ffffff)',
  
  secondary: 'var(--cherry-secondary, #f4f4f5)',
  secondaryForeground: 'var(--cherry-secondary-foreground, #18181b)',
  
  accent: 'var(--cherry-accent, #7c3aed)',
  accentForeground: 'var(--cherry-accent-foreground, #ffffff)',
  
  muted: 'var(--cherry-muted, #f4f4f5)',
  mutedForeground: 'var(--cherry-muted-foreground, #71717a)',
  
  border: 'var(--cherry-border, #e4e4e7)',
  ring: 'var(--cherry-ring, #7c3aed)',
  
  destructive: 'var(--cherry-destructive, #ef4444)',
  destructiveForeground: 'var(--cherry-destructive-foreground, #ffffff)',
  
  card: 'var(--cherry-card, #ffffff)',
  cardForeground: 'var(--cherry-card-foreground, #18181b)',
  
  popover: 'var(--cherry-popover, #ffffff)',
  popoverForeground: 'var(--cherry-popover-foreground, #18181b)',
  
  input: 'var(--cherry-input, #e4e4e7)',
  
  // Cherry 特有颜色 - 浅色模式
  backgroundSoft: 'var(--cherry-background-soft, #f4f4f5)',
  hover: 'var(--cherry-hover, #e4e4e7)',
  active: 'var(--cherry-active, #d4d4d8)',
  text2: 'var(--cherry-text-2, #71717a)',
  chatUser: 'var(--cherry-chat-user, #7c3aed)',
  primarySoft: 'var(--cherry-primary-soft, #8b5cf6)',
};

/**
 * Cherry CSS 变量定义 - 深色模式
 */
export const cherryCssVariablesDark: Record<string, string> = {
  '--cherry-background': '#1a1a1a',
  '--cherry-foreground': '#e5e5e5',
  '--cherry-primary': '#7c3aed',
  '--cherry-primary-foreground': '#ffffff',
  '--cherry-primary-soft': '#6d28d9',
  '--cherry-secondary': '#27272a',
  '--cherry-secondary-foreground': '#e5e5e5',
  '--cherry-accent': '#7c3aed',
  '--cherry-accent-foreground': '#ffffff',
  '--cherry-muted': '#27272a',
  '--cherry-muted-foreground': '#a1a1aa',
  '--cherry-border': '#3f3f46',
  '--cherry-ring': '#7c3aed',
  '--cherry-destructive': '#ef4444',
  '--cherry-destructive-foreground': '#ffffff',
  '--cherry-card': '#27272a',
  '--cherry-card-foreground': '#e5e5e5',
  '--cherry-popover': '#27272a',
  '--cherry-popover-foreground': '#e5e5e5',
  '--cherry-input': '#3f3f46',
  '--cherry-background-soft': '#27272a',
  '--cherry-hover': '#3f3f46',
  '--cherry-active': '#52525b',
  '--cherry-text-2': '#a1a1aa',
  '--cherry-chat-user': '#7c3aed',
};

/**
 * Cherry CSS 变量定义 - 浅色模式
 */
export const cherryCssVariablesLight: Record<string, string> = {
  '--cherry-background': '#ffffff',
  '--cherry-foreground': '#18181b',
  '--cherry-primary': '#7c3aed',
  '--cherry-primary-foreground': '#ffffff',
  '--cherry-primary-soft': '#8b5cf6',
  '--cherry-secondary': '#f4f4f5',
  '--cherry-secondary-foreground': '#18181b',
  '--cherry-accent': '#7c3aed',
  '--cherry-accent-foreground': '#ffffff',
  '--cherry-muted': '#f4f4f5',
  '--cherry-muted-foreground': '#71717a',
  '--cherry-border': '#e4e4e7',
  '--cherry-ring': '#7c3aed',
  '--cherry-destructive': '#ef4444',
  '--cherry-destructive-foreground': '#ffffff',
  '--cherry-card': '#ffffff',
  '--cherry-card-foreground': '#18181b',
  '--cherry-popover': '#ffffff',
  '--cherry-popover-foreground': '#18181b',
  '--cherry-input': '#e4e4e7',
  '--cherry-background-soft': '#f4f4f5',
  '--cherry-hover': '#e4e4e7',
  '--cherry-active': '#d4d4d8',
  '--cherry-text-2': '#71717a',
  '--cherry-chat-user': '#7c3aed',
};
