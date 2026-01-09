/**
 * @file index.ts
 * @description Cherry Studio 主题包的主入口
 * @module lib/themes/builtin/cherry
 * @requirements 1.1
 */

import type { ThemePack, ColorScheme, LayoutConfig } from '../../types';
import { cherryTokens, cherryLightTokens, cherryCssVariablesDark, cherryCssVariablesLight } from './tokens';
import { cherryComponents } from './components';
import { cherryExamples } from './examples';
import { zhPromptTemplates } from './prompts/zh';
import { enPromptTemplates } from './prompts/en';

/**
 * Cherry Studio 主题的配色方案
 */
export const cherryColorSchemes: ColorScheme[] = [
  {
    id: 'dark',
    name: '深色模式',
    type: 'dark',
    colors: {
      background: cherryTokens.colors.background,
      foreground: cherryTokens.colors.foreground,
      primary: cherryTokens.colors.primary,
      secondary: cherryTokens.colors.secondary,
      accent: cherryTokens.colors.accent,
      muted: cherryTokens.colors.muted,
      border: cherryTokens.colors.border,
      card: cherryTokens.colors.card || cherryTokens.colors.background,
      popover: cherryTokens.colors.popover || cherryTokens.colors.background,
      destructive: cherryTokens.colors.destructive || '#ef4444',
    },
    cssVariables: cherryCssVariablesDark,
  },
  {
    id: 'light',
    name: '浅色模式',
    type: 'light',
    colors: {
      background: cherryLightTokens.background || '#ffffff',
      foreground: cherryLightTokens.foreground || '#18181b',
      primary: cherryLightTokens.primary || '#7c3aed',
      secondary: cherryLightTokens.secondary || '#f4f4f5',
      accent: cherryLightTokens.accent || '#7c3aed',
      muted: cherryLightTokens.muted || '#f4f4f5',
      border: cherryLightTokens.border || '#e4e4e7',
      card: cherryLightTokens.card || '#ffffff',
      popover: cherryLightTokens.popover || '#ffffff',
      destructive: cherryLightTokens.destructive || '#ef4444',
    },
    cssVariables: cherryCssVariablesLight,
  },
];

/**
 * Cherry Studio 主题的布局配置
 */
export const cherryLayouts: LayoutConfig[] = [
  {
    id: 'cherry-default',
    name: 'Cherry 默认布局',
    description: '图标侧边栏 (60px) + 对话列表 (256px) + 主内容区',
    config: {
      sidebar: 'left',
      sidebarWidth: '60px',
      mainContent: 'full',
      previewPanel: 'none',
    },
  },
  {
    id: 'cherry-compact',
    name: 'Cherry 紧凑布局',
    description: '仅图标侧边栏 + 主内容区',
    config: {
      sidebar: 'left',
      sidebarWidth: '60px',
      mainContent: 'full',
      previewPanel: 'none',
    },
  },
  {
    id: 'cherry-full',
    name: 'Cherry 完整布局',
    description: '图标侧边栏 + 对话列表 + 主内容 + 右侧面板',
    config: {
      sidebar: 'left',
      sidebarWidth: '60px',
      mainContent: 'full',
      previewPanel: 'right',
    },
  },
  {
    id: 'cherry-centered',
    name: 'Cherry 居中布局',
    description: '无侧边栏的居中内容区',
    config: {
      sidebar: 'none',
      mainContent: 'centered',
      previewPanel: 'none',
    },
  },
];

/**
 * Cherry Studio 主题包
 */
export const cherryThemePack: ThemePack = {
  // 基础信息
  id: 'cherry',
  name: 'Cherry Studio',
  description: '现代化 AI 聊天客户端风格主题，深色主题为主，紫色主色调',
  version: '1.0.0',
  author: 'LLM2UI Team',
  repository: 'https://github.com/kangfenmao/cherry-studio',
  homepage: 'https://cherry-ai.com',

  // 核心配置
  tokens: cherryTokens,
  components: cherryComponents,
  examples: cherryExamples,
  prompts: {
    templates: {
      zh: zhPromptTemplates,
      en: enPromptTemplates,
    },
  },

  // 外观配置
  colorSchemes: cherryColorSchemes,
  layouts: cherryLayouts,

  // 扩展
  extensions: {
    // Cherry 特有配置
    cherryConfig: {
      defaultColorScheme: 'dark',
      sidebarIconSize: 24,
      conversationListWidth: 256,
      headerHeight: 48,
      inputBarMinHeight: 40,
      inputBarMaxHeight: 200,
    },
    // Tailwind 配置
    tailwindConfig: {
      darkMode: 'class',
      prefix: '',
    },
  },
};

// 导出所有子模块
export { cherryTokens, cherryLightTokens, cherryCssVariablesDark, cherryCssVariablesLight } from './tokens';
export { cherryComponents, createCherryComponentRegistry } from './components';
export { 
  cherryExamples, 
  cherryExamplePresets,
  getCherryExampleIds, 
  getCherryExampleById, 
  getCherryExamplesByCategory, 
  getCherryExamplesByKeyword 
} from './examples';
export { zhPromptTemplates } from './prompts/zh';
export { enPromptTemplates } from './prompts/en';

// 默认导出主题包
export default cherryThemePack;
