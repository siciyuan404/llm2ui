/**
 * @file tokens.ts
 * @description shadcn-ui 主题的设计令牌定义
 * @module lib/themes/builtin/shadcn
 * @requirements 3.2
 */

import type { ThemeTokens, TokenCategory } from '../../types';

/**
 * shadcn-ui 主题的设计令牌
 * 基于 Tailwind CSS 默认主题和 shadcn/ui 设计规范
 * 
 * 优化内容：
 * - 添加更多语义化颜色（success, warning, info）
 * - 添加侧边栏专用颜色
 * - 添加图表颜色
 * - 扩展间距和字体大小
 * - 添加动画和过渡令牌
 */
export const shadcnTokens: ThemeTokens = {
  colors: {
    // 基础颜色
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    
    // 主色
    primary: 'hsl(222.2 47.4% 11.2%)',
    primaryForeground: 'hsl(210 40% 98%)',
    
    // 次要色
    secondary: 'hsl(210 40% 96.1%)',
    secondaryForeground: 'hsl(222.2 47.4% 11.2%)',
    
    // 强调色
    accent: 'hsl(210 40% 96.1%)',
    accentForeground: 'hsl(222.2 47.4% 11.2%)',
    
    // 静音色
    muted: 'hsl(210 40% 96.1%)',
    mutedForeground: 'hsl(215.4 16.3% 46.9%)',
    
    // 边框和环
    border: 'hsl(214.3 31.8% 91.4%)',
    ring: 'hsl(222.2 84% 4.9%)',
    
    // 破坏性操作
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    
    // 成功状态
    success: 'hsl(142.1 76.2% 36.3%)',
    successForeground: 'hsl(355.7 100% 97.3%)',
    
    // 警告状态
    warning: 'hsl(47.9 95.8% 53.1%)',
    warningForeground: 'hsl(26 83.3% 14.1%)',
    
    // 信息状态
    info: 'hsl(199.4 95.5% 53.8%)',
    infoForeground: 'hsl(210 40% 98%)',
    
    // 卡片
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(222.2 84% 4.9%)',
    
    // 弹出层
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(222.2 84% 4.9%)',
    
    // 输入框
    input: 'hsl(214.3 31.8% 91.4%)',
    
    // 侧边栏专用颜色
    sidebar: 'hsl(0 0% 98%)',
    sidebarForeground: 'hsl(240 5.3% 26.1%)',
    sidebarPrimary: 'hsl(240 5.9% 10%)',
    sidebarPrimaryForeground: 'hsl(0 0% 98%)',
    sidebarAccent: 'hsl(240 4.8% 95.9%)',
    sidebarAccentForeground: 'hsl(240 5.9% 10%)',
    sidebarBorder: 'hsl(220 13% 91%)',
    sidebarRing: 'hsl(217.2 91.2% 59.8%)',
  },
  
  spacing: {
    '0': '0',
    px: '1px',
    '0.5': '0.125rem',  // 2px
    '1': '0.25rem',     // 4px
    '1.5': '0.375rem',  // 6px
    '2': '0.5rem',      // 8px
    '2.5': '0.625rem',  // 10px
    '3': '0.75rem',     // 12px
    '3.5': '0.875rem',  // 14px
    '4': '1rem',        // 16px
    '5': '1.25rem',     // 20px
    '6': '1.5rem',      // 24px
    '7': '1.75rem',     // 28px
    '8': '2rem',        // 32px
    '9': '2.25rem',     // 36px
    '10': '2.5rem',     // 40px
    '11': '2.75rem',    // 44px
    '12': '3rem',       // 48px
    '14': '3.5rem',     // 56px
    '16': '4rem',       // 64px
    '20': '5rem',       // 80px
    '24': '6rem',       // 96px
    // 语义化别名
    xs: '0.25rem',      // 4px
    sm: '0.5rem',       // 8px
    md: '1rem',         // 16px
    lg: '1.5rem',       // 24px
    xl: '2rem',         // 32px
    '2xl': '3rem',      // 48px
    '3xl': '4rem',      // 64px
  },
  
  typography: {
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
      '8xl': '6rem',      // 96px
      '9xl': '8rem',      // 128px
    },
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // 扩展令牌
  extensions: {
    animation: {
      name: '动画',
      description: '动画和过渡效果配置，基于 shadcn-ui 和 tailwindcss-animate',
      values: {
        // 持续时间
        durationFast: '150ms',
        durationNormal: '200ms',
        durationSlow: '300ms',
        durationSlower: '500ms',
        
        // 缓动函数
        easingDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easingIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easingOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easingInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easingSpring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        
        // 淡入淡出动画
        fadeIn: 'fade-in 0.2s ease-out',
        fadeOut: 'fade-out 0.2s ease-out',
        fadeInUp: 'fade-in-up 0.3s ease-out',
        fadeInDown: 'fade-in-down 0.3s ease-out',
        fadeInLeft: 'fade-in-left 0.3s ease-out',
        fadeInRight: 'fade-in-right 0.3s ease-out',
        
        // 缩放动画
        zoomIn: 'zoom-in 0.2s ease-out',
        zoomOut: 'zoom-out 0.2s ease-out',
        zoomIn95: 'zoom-in-95 0.2s ease-out',
        zoomOut95: 'zoom-out-95 0.2s ease-out',
        
        // 滑入动画
        slideInFromTop: 'slide-in-from-top 0.3s ease-out',
        slideInFromBottom: 'slide-in-from-bottom 0.3s ease-out',
        slideInFromLeft: 'slide-in-from-left 0.3s ease-out',
        slideInFromRight: 'slide-in-from-right 0.3s ease-out',
        slideOutToTop: 'slide-out-to-top 0.3s ease-out',
        slideOutToBottom: 'slide-out-to-bottom 0.3s ease-out',
        slideOutToLeft: 'slide-out-to-left 0.3s ease-out',
        slideOutToRight: 'slide-out-to-right 0.3s ease-out',
        
        // 手风琴动画
        accordionDown: 'accordion-down 0.2s ease-out',
        accordionUp: 'accordion-up 0.2s ease-out',
        
        // 弹跳动画
        bounce: 'bounce 1s infinite',
        bounceIn: 'bounce-in 0.5s ease-out',
        
        // 脉冲动画
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        
        // 旋转动画
        spin: 'spin 1s linear infinite',
        spinSlow: 'spin 3s linear infinite',
        
        // 摇晃动画
        shake: 'shake 0.5s ease-in-out',
        wiggle: 'wiggle 1s ease-in-out infinite',
        
        // 闪烁动画
        blink: 'blink 1s step-end infinite',
        caretBlink: 'caret-blink 1.25s ease-out infinite',
      },
    } as TokenCategory,
    
    keyframes: {
      name: '关键帧',
      description: 'CSS 动画关键帧定义',
      values: {
        // 淡入淡出
        'fade-in': '{ from { opacity: 0 } to { opacity: 1 } }',
        'fade-out': '{ from { opacity: 1 } to { opacity: 0 } }',
        'fade-in-up': '{ from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }',
        'fade-in-down': '{ from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } }',
        'fade-in-left': '{ from { opacity: 0; transform: translateX(-10px) } to { opacity: 1; transform: translateX(0) } }',
        'fade-in-right': '{ from { opacity: 0; transform: translateX(10px) } to { opacity: 1; transform: translateX(0) } }',
        
        // 缩放
        'zoom-in': '{ from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }',
        'zoom-out': '{ from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.95) } }',
        'zoom-in-95': '{ from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }',
        'zoom-out-95': '{ from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.95) } }',
        
        // 滑入滑出
        'slide-in-from-top': '{ from { transform: translateY(-100%) } to { transform: translateY(0) } }',
        'slide-in-from-bottom': '{ from { transform: translateY(100%) } to { transform: translateY(0) } }',
        'slide-in-from-left': '{ from { transform: translateX(-100%) } to { transform: translateX(0) } }',
        'slide-in-from-right': '{ from { transform: translateX(100%) } to { transform: translateX(0) } }',
        'slide-out-to-top': '{ from { transform: translateY(0) } to { transform: translateY(-100%) } }',
        'slide-out-to-bottom': '{ from { transform: translateY(0) } to { transform: translateY(100%) } }',
        'slide-out-to-left': '{ from { transform: translateX(0) } to { transform: translateX(-100%) } }',
        'slide-out-to-right': '{ from { transform: translateX(0) } to { transform: translateX(100%) } }',
        
        // 手风琴
        'accordion-down': '{ from { height: 0 } to { height: var(--radix-accordion-content-height) } }',
        'accordion-up': '{ from { height: var(--radix-accordion-content-height) } to { height: 0 } }',
        
        // 弹跳
        'bounce': '{ 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1) } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1) } }',
        'bounce-in': '{ 0% { transform: scale(0.3); opacity: 0 } 50% { transform: scale(1.05) } 70% { transform: scale(0.9) } 100% { transform: scale(1); opacity: 1 } }',
        
        // 脉冲
        'pulse': '{ 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }',
        'ping': '{ 75%, 100% { transform: scale(2); opacity: 0 } }',
        
        // 旋转
        'spin': '{ from { transform: rotate(0deg) } to { transform: rotate(360deg) } }',
        
        // 摇晃
        'shake': '{ 0%, 100% { transform: translateX(0) } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px) } 20%, 40%, 60%, 80% { transform: translateX(4px) } }',
        'wiggle': '{ 0%, 100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }',
        
        // 闪烁
        'blink': '{ 0%, 100% { opacity: 1 } 50% { opacity: 0 } }',
        'caret-blink': '{ 0%, 70%, 100% { opacity: 1 } 20%, 50% { opacity: 0 } }',
      },
    } as TokenCategory,
    
    transition: {
      name: '过渡',
      description: '过渡效果配置',
      values: {
        // 预设过渡
        none: 'none',
        all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        default: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        colors: 'color, background-color, border-color, text-decoration-color, fill, stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        
        // 组件专用过渡
        button: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        input: 'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        card: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        modal: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        dropdown: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        tooltip: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        accordion: 'height 200ms ease-out',
      },
    } as TokenCategory,
    chart: {
      name: '图表颜色',
      description: '数据可视化图表专用颜色',
      values: {
        chart1: 'hsl(12 76% 61%)',
        chart2: 'hsl(173 58% 39%)',
        chart3: 'hsl(197 37% 24%)',
        chart4: 'hsl(43 74% 66%)',
        chart5: 'hsl(27 87% 67%)',
      },
    } as TokenCategory,
    zIndex: {
      name: '层级',
      description: 'z-index 层级配置',
      values: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
      },
    } as TokenCategory,
    icon: {
      name: '图标',
      description: '图标样式配置，用于统一图标的尺寸、颜色和线条样式',
      values: {
        // 尺寸配置
        sizeXs: 12,
        sizeSm: 14,
        sizeDefault: 16,
        sizeMd: 20,
        sizeLg: 24,
        sizeXl: 32,
        size2xl: 48,
        // 线条宽度
        strokeWidth: 2,
        strokeWidthThin: 1.5,
        strokeWidthBold: 2.5,
        // 线条端点样式
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        // 颜色（引用 colors 令牌）
        colorDefault: 'currentColor',
        colorMuted: 'hsl(215.4 16.3% 46.9%)',
        colorPrimary: 'hsl(222.2 47.4% 11.2%)',
        colorSecondary: 'hsl(210 40% 96.1%)',
        colorDestructive: 'hsl(0 84.2% 60.2%)',
        colorSuccess: 'hsl(142.1 76.2% 36.3%)',
        colorWarning: 'hsl(47.9 95.8% 53.1%)',
        colorInfo: 'hsl(199.4 95.5% 53.8%)',
      },
    } as TokenCategory,
  },
};

/**
 * 图标令牌类型定义（供 LLM 和类型系统使用）
 */
export interface IconTokens {
  /** 超小尺寸 12px */
  sizeXs: number;
  /** 小尺寸 14px */
  sizeSm: number;
  /** 默认尺寸 16px */
  sizeDefault: number;
  /** 中等尺寸 20px */
  sizeMd: number;
  /** 大尺寸 24px */
  sizeLg: number;
  /** 超大尺寸 32px */
  sizeXl: number;
  /** 特大尺寸 48px */
  size2xl: number;
  /** 默认线条宽度 */
  strokeWidth: number;
  /** 细线条宽度 */
  strokeWidthThin: number;
  /** 粗线条宽度 */
  strokeWidthBold: number;
  /** 线条端点样式 */
  strokeLinecap: 'round' | 'butt' | 'square';
  /** 线条连接样式 */
  strokeLinejoin: 'round' | 'miter' | 'bevel';
  /** 默认颜色（继承当前文本颜色） */
  colorDefault: string;
  /** 静音颜色 */
  colorMuted: string;
  /** 主色 */
  colorPrimary: string;
  /** 次要色 */
  colorSecondary: string;
  /** 破坏性操作颜色 */
  colorDestructive: string;
  /** 成功状态颜色 */
  colorSuccess: string;
  /** 警告状态颜色 */
  colorWarning: string;
  /** 信息状态颜色 */
  colorInfo: string;
}

/**
 * 获取图标令牌的便捷方法
 */
export function getIconTokens(): IconTokens {
  return shadcnTokens.extensions?.icon?.values as unknown as IconTokens;
}

/**
 * 暗色模式令牌覆盖
 * 
 * 优化内容：
 * - 添加成功、警告、信息状态颜色
 * - 添加侧边栏专用颜色
 * - 添加图表颜色
 */
export const shadcnDarkTokens: Partial<ThemeTokens['colors']> = {
  background: 'hsl(222.2 84% 4.9%)',
  foreground: 'hsl(210 40% 98%)',
  
  primary: 'hsl(210 40% 98%)',
  primaryForeground: 'hsl(222.2 47.4% 11.2%)',
  
  secondary: 'hsl(217.2 32.6% 17.5%)',
  secondaryForeground: 'hsl(210 40% 98%)',
  
  accent: 'hsl(217.2 32.6% 17.5%)',
  accentForeground: 'hsl(210 40% 98%)',
  
  muted: 'hsl(217.2 32.6% 17.5%)',
  mutedForeground: 'hsl(215 20.2% 65.1%)',
  
  border: 'hsl(217.2 32.6% 17.5%)',
  ring: 'hsl(212.7 26.8% 83.9%)',
  
  destructive: 'hsl(0 62.8% 30.6%)',
  destructiveForeground: 'hsl(210 40% 98%)',
  
  // 成功状态（暗色）
  success: 'hsl(142.1 70.6% 45.3%)',
  successForeground: 'hsl(144.9 80.4% 10%)',
  
  // 警告状态（暗色）
  warning: 'hsl(47.9 95.8% 53.1%)',
  warningForeground: 'hsl(26 83.3% 14.1%)',
  
  // 信息状态（暗色）
  info: 'hsl(199.4 95.5% 53.8%)',
  infoForeground: 'hsl(210 40% 98%)',
  
  card: 'hsl(222.2 84% 4.9%)',
  cardForeground: 'hsl(210 40% 98%)',
  
  popover: 'hsl(222.2 84% 4.9%)',
  popoverForeground: 'hsl(210 40% 98%)',
  
  input: 'hsl(217.2 32.6% 17.5%)',
  
  // 侧边栏专用颜色（暗色）
  sidebar: 'hsl(240 5.9% 10%)',
  sidebarForeground: 'hsl(240 4.8% 95.9%)',
  sidebarPrimary: 'hsl(224.3 76.3% 48%)',
  sidebarPrimaryForeground: 'hsl(0 0% 100%)',
  sidebarAccent: 'hsl(240 3.7% 15.9%)',
  sidebarAccentForeground: 'hsl(240 4.8% 95.9%)',
  sidebarBorder: 'hsl(240 3.7% 15.9%)',
  sidebarRing: 'hsl(217.2 91.2% 59.8%)',
};

/**
 * 图表颜色（暗色模式）
 */
export const shadcnDarkChartColors = {
  chart1: 'hsl(220 70% 50%)',
  chart2: 'hsl(160 60% 45%)',
  chart3: 'hsl(30 80% 55%)',
  chart4: 'hsl(280 65% 60%)',
  chart5: 'hsl(340 75% 55%)',
};

/**
 * 图标令牌（暗色模式覆盖）
 */
export const shadcnDarkIconColors = {
  colorMuted: 'hsl(215 20.2% 65.1%)',
  colorPrimary: 'hsl(210 40% 98%)',
  colorSecondary: 'hsl(217.2 32.6% 17.5%)',
  colorDestructive: 'hsl(0 62.8% 30.6%)',
  colorSuccess: 'hsl(142.1 70.6% 45.3%)',
  colorWarning: 'hsl(47.9 95.8% 53.1%)',
  colorInfo: 'hsl(199.4 95.5% 53.8%)',
};
