/**
 * @file types.ts
 * @description 多主题系统的类型定义
 * @module lib/themes
 */

import type { ComponentRegistry } from '../core/component-registry';
import type { 
  TokenCategory,
  SpacingTokens as DesignSpacingTokens,
  ShadowTokens as DesignShadowTokens,
  RadiusTokens as DesignRadiusTokens,
  SimpleColorTokens,
} from '../design-system/design-tokens';

// Re-export design system types for backward compatibility
export type { DesignTokens, TokenCategory, SimpleThemeTokens } from '../design-system/design-tokens';

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 令牌 Schema（用于验证）
 */
export interface TokenSchema {
  categories: {
    name: string;
    type: 'string' | 'number' | 'color' | 'size';
    required: boolean;
  }[];
}

/**
 * 颜色令牌
 * @deprecated 建议使用 design-system/design-tokens 中的 ColorTokens（带颜色刻度）
 */
export type ColorTokens = SimpleColorTokens;

/**
 * 间距令牌
 */
export interface SpacingTokens extends DesignSpacingTokens {
  [key: string]: string;
}

/**
 * 字体令牌
 */
export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono: string;
    [key: string]: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    [key: string]: string;
  };
  fontWeight: {
    normal: string | number;
    medium: string | number;
    semibold: string | number;
    bold: string | number;
    [key: string]: string | number;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
    [key: string]: string;
  };
}

/**
 * 阴影令牌
 */
export interface ShadowTokens extends DesignShadowTokens {
  [key: string]: string;
}

/**
 * 圆角令牌
 */
export interface RadiusTokens extends DesignRadiusTokens {
  [key: string]: string;
}

/**
 * 设计令牌配置（主题系统使用）
 * 
 * 注意：这是简化版本的令牌配置，使用简单的颜色字符串。
 * 如需完整的颜色刻度支持，请使用 design-system/design-tokens 中的 DesignTokens。
 * 
 * @see DesignTokens 完整的设计令牌类型（带颜色刻度）
 */
export interface ThemeTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  radius: RadiusTokens;
  extensions?: Record<string, TokenCategory>;
  tokenSchema?: TokenSchema;
}


// ============================================================================
// 组件配置
// ============================================================================

import type { ComponentType } from 'react';
import type { ComponentDefinitionData } from '../core/component-registry';

// Re-export for convenience
export type { ComponentDefinitionData } from '../core/component-registry';

/**
 * 组件分类
 */
export interface ComponentCategory {
  id: string;
  name: string;
  description?: string;
  componentIds: string[];
}

/**
 * 组件工厂函数类型
 * 用于创建自定义组件
 */
export type ComponentFactory = (name: string) => ComponentType<Record<string, unknown>> | undefined;

/**
 * 组件配置（解耦后）
 * 
 * 支持两种模式：
 * 1. 传统模式：使用 registry 属性（向后兼容）
 * 2. 解耦模式：使用 definitions 属性（推荐）
 * 
 * @see Requirements 2.2, 2.4, 3.5
 */
export interface ThemeComponents {
  /** 
   * 组件注册表实例（传统模式，向后兼容）
   * @deprecated 建议使用 definitions 属性
   */
  registry?: ComponentRegistry;
  
  /** 
   * 组件定义数据列表（解耦模式，推荐）
   * 使用此属性时，组件将在主题加载时动态注册
   */
  definitions?: ComponentDefinitionData[];
  
  /** 组件别名映射 */
  aliases?: Record<string, string>;
  
  /** 组件分类 */
  categories?: ComponentCategory[];
  
  /** 
   * 组件工厂函数（用于创建自定义组件）
   * 当使用 definitions 模式时，此函数用于创建实际的 React 组件
   */
  componentFactory?: ComponentFactory;
}

// ============================================================================
// 案例配置
// ============================================================================

/**
 * 案例元数据
 */
export interface ExampleMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  tokenCount?: number;
  schema: unknown;
}

/**
 * 案例分类
 */
export interface ExampleCategory {
  id: string;
  name: string;
  description?: string;
}

/**
 * 关键词映射
 */
export interface KeywordMapping {
  keywords: string[];
  exampleIds: string[];
}

/**
 * 案例配置
 */
export interface ThemeExamples {
  presets: ExampleMetadata[];
  categories?: ExampleCategory[];
  keywordMappings?: KeywordMapping[];
}

// ============================================================================
// 提示词配置
// ============================================================================

/**
 * 提示词模板集合
 */
export interface PromptTemplates {
  systemIntro: string;
  iconGuidelines: string;
  componentDocs: string;
  positiveExamples: string;
  negativeExamples: string;
  closing: string;
}

/**
 * 提示词模板配置
 */
export interface ThemePrompts {
  templates: {
    zh: PromptTemplates;
    en: PromptTemplates;
  };
}

// ============================================================================
// 验证配置
// ============================================================================

/**
 * 验证规则
 */
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validate: (schema: unknown) => ValidationResult;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  suggestion?: string;
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
}

/**
 * 主题验证配置
 */
export interface ThemeValidation {
  rules: ValidationRule[];
  strictMode?: boolean;
}


// ============================================================================
// 配色方案和布局
// ============================================================================

/**
 * 配色方案
 */
export interface ColorScheme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
    [key: string]: string;
  };
  cssVariables?: Record<string, string>;
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  preview?: string;
  config: {
    sidebar: 'left' | 'right' | 'none';
    sidebarWidth?: string;
    mainContent: 'full' | 'centered';
    previewPanel: 'right' | 'bottom' | 'none';
  };
}

// ============================================================================
// 主题包
// ============================================================================

/**
 * 主题包接口 - 定义一个完整 UI 风格的所有配置
 */
export interface ThemePack {
  // 基础信息
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  repository?: string;
  homepage?: string;
  previewImage?: string;

  // 核心配置
  tokens: ThemeTokens;
  components: ThemeComponents;
  examples: ThemeExamples;
  prompts: ThemePrompts;
  validation?: ThemeValidation;

  // 外观配置
  colorSchemes: ColorScheme[];
  layouts: LayoutConfig[];

  // 扩展
  extensions?: Record<string, unknown>;
}

/**
 * 主题元数据（用于注册表列表）
 */
export interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  repository?: string;
  previewImage?: string;
  category: 'builtin' | 'community';
  installed: boolean;
}

// ============================================================================
// 主题事件
// ============================================================================

/**
 * 主题变更事件
 */
export interface ThemeChangeEvent {
  oldThemeId: string;
  newThemeId: string;
  oldTheme: ThemePack;
  newTheme: ThemePack;
}

/**
 * 主题变更监听器
 */
export type ThemeChangeListener = (event: ThemeChangeEvent) => void;


// ============================================================================
// LLM 上下文控制
// ============================================================================

/**
 * LLM 上下文设置
 */
export interface ContextSettings {
  // 主题选择
  themeId: string;

  // 组件选择
  components: {
    mode: 'all' | 'selected' | 'preset';
    selectedIds?: string[];
    presetName?: string;
  };

  // 案例选择
  examples: {
    mode: 'auto' | 'selected' | 'none';
    selectedIds?: string[];
    maxCount?: number;
  };

  // 配色选择
  colorScheme: {
    id: string;
    includeInPrompt: boolean;
  };

  // Token 预算
  tokenBudget: {
    max: number;
    autoOptimize: boolean;
  };
}

/**
 * Token 估算结果
 */
export interface TokenEstimate {
  componentDocs: number;
  examples: number;
  colorInfo: number;
  base: number;
  total: number;
}

/**
 * 上下文构建结果
 */
export interface ContextBuildResult {
  prompt: string;
  tokenCount: number;
  breakdown: {
    componentDocs: number;
    examples: number;
    colorInfo: number;
    other: number;
  };
}

// ============================================================================
// 组件选择预设
// ============================================================================

/**
 * 组件选择预设
 */
export const COMPONENT_PRESETS: Record<string, string[]> = {
  'layout-only': ['Container', 'Card', 'CardHeader', 'CardContent', 'CardFooter'],
  'forms-only': ['Input', 'Button', 'Label', 'Textarea', 'Select', 'Checkbox'],
  'display-only': ['Text', 'Icon', 'Badge', 'Table'],
  'all': [],
};

// ============================================================================
// 主题错误
// ============================================================================

/**
 * 主题系统错误类型
 */
export const ThemeErrorCode = {
  THEME_NOT_FOUND: 'THEME_NOT_FOUND',
  THEME_ALREADY_EXISTS: 'THEME_ALREADY_EXISTS',
  INVALID_THEME_PACK: 'INVALID_THEME_PACK',
  CANNOT_UNINSTALL_BUILTIN: 'CANNOT_UNINSTALL_BUILTIN',
  CANNOT_UNINSTALL_ACTIVE: 'CANNOT_UNINSTALL_ACTIVE',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
  IMPORT_FAILED: 'IMPORT_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
} as const;

export type ThemeErrorCode = typeof ThemeErrorCode[keyof typeof ThemeErrorCode];

/**
 * 主题错误类
 */
export class ThemeError extends Error {
  code: ThemeErrorCode;
  details?: unknown;

  constructor(code: ThemeErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ThemeError';
    this.code = code;
    this.details = details;
  }
}

// ============================================================================
// 主题注册表
// ============================================================================

/**
 * 主题注册表条目
 */
export interface ThemeRegistryEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  repository: string;
  previewImage: string;
  category: 'builtin' | 'community';
  downloadUrl: string;
}

/**
 * 主题注册表配置
 */
export interface ThemeRegistryConfig {
  version: string;
  lastUpdated: string;
  themes: ThemeRegistryEntry[];
}

/**
 * 主题更新信息
 */
export interface ThemeUpdateInfo {
  themeId: string;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
}

// ============================================================================
// 本地存储
// ============================================================================

/**
 * 序列化的主题包（用于存储）
 */
export interface SerializedThemePack {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  repository?: string;
  homepage?: string;
  previewImage?: string;
  tokens: ThemeTokens;
  examples: ThemeExamples;
  prompts: ThemePrompts;
  validation?: ThemeValidation;
  colorSchemes: ColorScheme[];
  layouts: LayoutConfig[];
  extensions?: Record<string, unknown>;
  // 注意：components.registry 需要特殊处理，不直接序列化
}

/**
 * 本地存储的主题数据
 */
export interface StoredThemeData {
  installedThemes: string[];
  activeThemeId: string;
  themePacks: Record<string, SerializedThemePack>;
  preferences: {
    colorScheme: string;
    layout: string;
  };
}

// ============================================================================
// 默认值
// ============================================================================

/**
 * 默认主题 ID
 */
export const DEFAULT_THEME_ID = 'shadcn-ui';

/**
 * 默认上下文设置
 */
export const DEFAULT_CONTEXT_SETTINGS: ContextSettings = {
  themeId: DEFAULT_THEME_ID,
  components: {
    mode: 'all',
  },
  examples: {
    mode: 'auto',
    maxCount: 5,
  },
  colorScheme: {
    id: 'light',
    includeInPrompt: true,
  },
  tokenBudget: {
    max: 4000,
    autoOptimize: true,
  },
};
