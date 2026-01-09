/**
 * @file index.ts
 * @description shadcn-ui 主题包的主入口
 * @module lib/themes/builtin/shadcn
 * @requirements 1.1, 21.1, 22.1
 */

import type { ThemePack, ColorScheme, LayoutConfig } from '../../types';
import { shadcnTokens, shadcnDarkTokens } from './tokens';
import { shadcnComponents } from './components';
import { shadcnExamples } from './examples';
import { zhPromptTemplates } from './prompts/zh';
import { enPromptTemplates } from './prompts/en';

/**
 * shadcn-ui 主题的配色方案
 */
export const shadcnColorSchemes: ColorScheme[] = [
  {
    id: 'light',
    name: '浅色模式',
    type: 'light',
    colors: {
      background: shadcnTokens.colors.background,
      foreground: shadcnTokens.colors.foreground,
      primary: shadcnTokens.colors.primary,
      secondary: shadcnTokens.colors.secondary,
      accent: shadcnTokens.colors.accent,
      muted: shadcnTokens.colors.muted,
      border: shadcnTokens.colors.border,
      card: shadcnTokens.colors.card || shadcnTokens.colors.background,
      popover: shadcnTokens.colors.popover || shadcnTokens.colors.background,
      destructive: shadcnTokens.colors.destructive || 'hsl(0 84.2% 60.2%)',
    },
    cssVariables: {
      '--background': '0 0% 100%',
      '--foreground': '222.2 84% 4.9%',
      '--primary': '222.2 47.4% 11.2%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96.1%',
      '--secondary-foreground': '222.2 47.4% 11.2%',
      '--accent': '210 40% 96.1%',
      '--accent-foreground': '222.2 47.4% 11.2%',
      '--muted': '210 40% 96.1%',
      '--muted-foreground': '215.4 16.3% 46.9%',
      '--border': '214.3 31.8% 91.4%',
      '--ring': '222.2 84% 4.9%',
      '--radius': '0.5rem',
    },
  },
  {
    id: 'dark',
    name: '深色模式',
    type: 'dark',
    colors: {
      background: shadcnDarkTokens.background || 'hsl(222.2 84% 4.9%)',
      foreground: shadcnDarkTokens.foreground || 'hsl(210 40% 98%)',
      primary: shadcnDarkTokens.primary || 'hsl(210 40% 98%)',
      secondary: shadcnDarkTokens.secondary || 'hsl(217.2 32.6% 17.5%)',
      accent: shadcnDarkTokens.accent || 'hsl(217.2 32.6% 17.5%)',
      muted: shadcnDarkTokens.muted || 'hsl(217.2 32.6% 17.5%)',
      border: shadcnDarkTokens.border || 'hsl(217.2 32.6% 17.5%)',
      card: shadcnDarkTokens.card || 'hsl(222.2 84% 4.9%)',
      popover: shadcnDarkTokens.popover || 'hsl(222.2 84% 4.9%)',
      destructive: shadcnDarkTokens.destructive || 'hsl(0 62.8% 30.6%)',
    },
    cssVariables: {
      '--background': '222.2 84% 4.9%',
      '--foreground': '210 40% 98%',
      '--primary': '210 40% 98%',
      '--primary-foreground': '222.2 47.4% 11.2%',
      '--secondary': '217.2 32.6% 17.5%',
      '--secondary-foreground': '210 40% 98%',
      '--accent': '217.2 32.6% 17.5%',
      '--accent-foreground': '210 40% 98%',
      '--muted': '217.2 32.6% 17.5%',
      '--muted-foreground': '215 20.2% 65.1%',
      '--border': '217.2 32.6% 17.5%',
      '--ring': '212.7 26.8% 83.9%',
      '--radius': '0.5rem',
    },
  },
];

/**
 * shadcn-ui 主题的布局配置
 */
export const shadcnLayouts: LayoutConfig[] = [
  {
    id: 'sidebar-left',
    name: '左侧边栏',
    description: '左侧导航栏 + 主内容区',
    config: {
      sidebar: 'left',
      sidebarWidth: '256px',
      mainContent: 'full',
      previewPanel: 'none',
    },
  },
  {
    id: 'sidebar-right',
    name: '右侧边栏',
    description: '主内容区 + 右侧信息栏',
    config: {
      sidebar: 'right',
      sidebarWidth: '320px',
      mainContent: 'full',
      previewPanel: 'none',
    },
  },
  {
    id: 'full-width',
    name: '全宽布局',
    description: '无侧边栏的全宽内容区',
    config: {
      sidebar: 'none',
      mainContent: 'full',
      previewPanel: 'none',
    },
  },
  {
    id: 'centered',
    name: '居中布局',
    description: '内容居中显示，适合阅读',
    config: {
      sidebar: 'none',
      mainContent: 'centered',
      previewPanel: 'none',
    },
  },
  {
    id: 'with-preview',
    name: '带预览面板',
    description: '左侧边栏 + 主内容 + 右侧预览',
    config: {
      sidebar: 'left',
      sidebarWidth: '200px',
      mainContent: 'full',
      previewPanel: 'right',
    },
  },
];

/**
 * shadcn-ui 主题包
 */
export const shadcnThemePack: ThemePack = {
  // 基础信息
  id: 'shadcn-ui',
  name: 'shadcn/ui',
  description: '基于 Radix UI 和 Tailwind CSS 的现代 UI 组件库主题',
  version: '1.0.0',
  author: 'LLM2UI Team',
  repository: 'https://github.com/shadcn/ui',
  homepage: 'https://ui.shadcn.com',

  // 核心配置
  tokens: shadcnTokens,
  components: shadcnComponents,
  examples: shadcnExamples,
  prompts: {
    templates: {
      zh: zhPromptTemplates,
      en: enPromptTemplates,
    },
  },

  // 外观配置
  colorSchemes: shadcnColorSchemes,
  layouts: shadcnLayouts,

  // 扩展
  extensions: {
    tailwindConfig: {
      darkMode: 'class',
      prefix: '',
    },
  },
};

// 导出所有子模块
export { shadcnTokens, shadcnDarkTokens, shadcnDarkChartColors } from './tokens';
export { shadcnComponents, createShadcnComponentRegistry } from './components';
export { shadcnExamples, getShadcnExampleIds, getShadcnExampleById, getShadcnExamplesByCategory, getShadcnExamplesByKeyword } from './examples';
export { zhPromptTemplates } from './prompts/zh';
export { enPromptTemplates } from './prompts/en';

// 默认导出主题包
export default shadcnThemePack;
