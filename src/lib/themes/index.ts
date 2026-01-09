/**
 * @file index.ts
 * @description 多主题系统主入口 - 统一导出所有主题相关模块
 * @module lib/themes
 * @requirements 8.1, 8.2, 12.1
 */

// ============================================================================
// 类型导出
// ============================================================================

export type {
  // 基础类型
  TokenCategory,
  TokenSchema,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
  ShadowTokens,
  RadiusTokens,
  ThemeTokens,
  
  // 组件配置
  ComponentCategory,
  ThemeComponents,
  
  // 案例配置
  ExampleMetadata,
  ExampleCategory,
  KeywordMapping,
  ThemeExamples,
  
  // 提示词配置
  PromptTemplates,
  ThemePrompts,
  
  // 验证配置
  ValidationRule,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ThemeValidation,
  
  // 配色和布局
  ColorScheme,
  LayoutConfig,
  
  // 主题包
  ThemePack,
  ThemeMetadata,
  
  // 事件
  ThemeChangeEvent,
  ThemeChangeListener,
  
  // LLM 上下文
  ContextSettings,
  TokenEstimate,
  ContextBuildResult,
  
  // 注册表
  ThemeRegistryEntry,
  ThemeRegistryConfig,
  ThemeUpdateInfo,
  
  // 存储
  SerializedThemePack,
  StoredThemeData,
} from './types';

// ============================================================================
// 常量导出
// ============================================================================

export {
  ThemeErrorCode,
  ThemeError,
  COMPONENT_PRESETS,
  DEFAULT_THEME_ID,
  DEFAULT_CONTEXT_SETTINGS,
} from './types';

// ============================================================================
// 核心类导出
// ============================================================================

export { ThemeManager, getThemeManager } from './theme-manager';
export { ThemeRegistry, getThemeRegistry } from './theme-registry';
export { ThemeStorage, getThemeStorage, serializeThemePack } from './theme-storage';

// ============================================================================
// 工具函数导出
// ============================================================================

export { validateThemePack, createThemePack } from './theme-validator';
export { mergeTokens, getTokenCategories } from './utils/merge-tokens';
export { exportTheme, importTheme } from './utils/serialize-theme';
export {
  applyCssVariables,
  applyThemeColorScheme,
  clearCssVariables,
  getCurrentColorSchemeType,
  watchSystemColorScheme,
} from './utils/css-variables';
export type { ApplyCssVariablesOptions } from './utils/css-variables';
export { ContextBuilder, createContextBuilder } from './context-builder';
export type { ContextBuilderOptions } from './context-builder';

// 重新导出提示词缓存清除函数（用于主题切换时清除缓存）
export { clearPromptCache } from '../llm/prompt-generator';

// ============================================================================
// 内置主题导出
// ============================================================================

export { shadcnThemePack } from './builtin/shadcn';
export { cherryThemePack } from './builtin/cherry';

// ============================================================================
// 初始化函数
// ============================================================================

import { ThemeManager } from './theme-manager';
import { shadcnThemePack } from './builtin/shadcn';
import { cherryThemePack } from './builtin/cherry';
import { setThemeManagerClass } from '../examples/example-retriever';
import { setExampleLibraryThemeManager } from '../examples/example-library';

/**
 * 初始化主题系统
 * 注册内置主题并设置默认主题
 * 
 * @param defaultThemeId - 默认主题 ID，默认为 'shadcn-ui'
 * @returns ThemeManager 实例
 */
export function initializeThemeSystem(defaultThemeId: string = 'shadcn-ui'): ThemeManager {
  const themeManager = ThemeManager.getInstance();
  
  // 设置 ThemeManager 类引用，供 ExampleRetriever 和 ExampleLibrary 使用
  setThemeManagerClass(ThemeManager);
  setExampleLibraryThemeManager(ThemeManager);
  
  // 注册内置主题（如果尚未注册）
  if (!themeManager.hasTheme('shadcn-ui')) {
    themeManager.register(shadcnThemePack);
  }
  
  if (!themeManager.hasTheme('cherry')) {
    themeManager.register(cherryThemePack);
  }
  
  // 设置默认主题
  if (themeManager.hasTheme(defaultThemeId)) {
    themeManager.setDefaultThemeId(defaultThemeId);
    themeManager.setActiveTheme(defaultThemeId);
  }
  
  return themeManager;
}

/**
 * 获取已初始化的主题管理器
 * 如果尚未初始化，会自动初始化
 */
export function getInitializedThemeManager(): ThemeManager {
  const themeManager = ThemeManager.getInstance();
  
  // 如果没有注册任何主题，自动初始化
  if (themeManager.getThemeCount() === 0) {
    initializeThemeSystem();
  }
  
  return themeManager;
}
