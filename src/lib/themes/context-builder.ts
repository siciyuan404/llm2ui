/**
 * @file context-builder.ts
 * @description LLM 上下文构建器 - 根据设置构建提示词
 * @module lib/themes
 * @requirements 23.7, 27.1
 */

import { ThemeManager, getThemeManager } from './theme-manager';
import type {
  ContextSettings,
  TokenEstimate,
  ContextBuildResult,
  ThemePack,
  COMPONENT_PRESETS,
} from './types';
import { DEFAULT_CONTEXT_SETTINGS } from './types';

// ============================================================================
// Types
// ============================================================================

export interface ContextBuilderOptions {
  /** 语言 */
  language?: 'zh' | 'en';
  /** 是否包含负面案例 */
  includeNegativeExamples?: boolean;
  /** ThemeManager 实例（可选，默认使用全局实例） */
  themeManager?: ThemeManager;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * 估算每个字符的 Token 数（中文约 0.5-1，英文约 0.25）
 */
const CHARS_PER_TOKEN_ZH = 0.7;
const CHARS_PER_TOKEN_EN = 0.25;

/**
 * 基础提示词的估算 Token 数
 */
const BASE_PROMPT_TOKENS = 500;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 估算文本的 Token 数
 */
function estimateTokens(text: string, language: 'zh' | 'en' = 'zh'): number {
  const ratio = language === 'zh' ? CHARS_PER_TOKEN_ZH : CHARS_PER_TOKEN_EN;
  return Math.ceil(text.length * ratio);
}

/**
 * 获取组件文档
 */
function getComponentDocs(
  theme: ThemePack,
  settings: ContextSettings,
  language: 'zh' | 'en'
): string {
  const registry = theme.components.registry;
  let componentIds: string[] = [];

  switch (settings.components.mode) {
    case 'all':
      componentIds = registry.getAllComponentIds();
      break;
    case 'selected':
      componentIds = settings.components.selectedIds ?? [];
      break;
    case 'preset':
      // 从预设获取组件 ID
      const presetName = settings.components.presetName ?? 'all';
      // 简化处理，实际应从 COMPONENT_PRESETS 获取
      componentIds = registry.getAllComponentIds();
      break;
  }

  // 生成组件文档
  const docs = componentIds.map((id) => {
    const component = registry.getComponent(id);
    if (!component) return '';
    return `- ${component.type}: ${component.description || ''}`;
  }).filter(Boolean);

  return docs.join('\n');
}

/**
 * 获取案例文档
 */
function getExampleDocs(
  theme: ThemePack,
  settings: ContextSettings
): string {
  const examples = theme.examples.presets;
  let selectedExamples = examples;

  switch (settings.examples.mode) {
    case 'none':
      return '';
    case 'selected':
      const selectedIds = new Set(settings.examples.selectedIds ?? []);
      selectedExamples = examples.filter((e) => selectedIds.has(e.id));
      break;
    case 'auto':
      // 自动选择，限制数量
      const maxCount = settings.examples.maxCount ?? 5;
      selectedExamples = examples.slice(0, maxCount);
      break;
  }

  // 生成案例文档
  return selectedExamples.map((example) => {
    return `### ${example.name}\n${example.description}\n\`\`\`json\n${JSON.stringify(example.schema, null, 2)}\n\`\`\``;
  }).join('\n\n');
}

/**
 * 获取配色信息
 */
function getColorInfo(
  theme: ThemePack,
  settings: ContextSettings
): string {
  if (!settings.colorScheme.includeInPrompt) {
    return '';
  }

  const scheme = theme.colorSchemes.find((s) => s.id === settings.colorScheme.id);
  if (!scheme) {
    return '';
  }

  const colorLines = Object.entries(scheme.colors).map(
    ([key, value]) => `- ${key}: ${value}`
  );

  return `## 配色方案: ${scheme.name}\n${colorLines.join('\n')}`;
}

// ============================================================================
// ContextBuilder Class
// ============================================================================

/**
 * LLM 上下文构建器
 * 
 * 功能：
 * - 根据设置构建提示词
 * - 估算 Token 数量
 * - 支持自动优化
 * 
 * @requirements 23.7, 27.1
 */
export class ContextBuilder {
  private themeManager: ThemeManager;
  private language: 'zh' | 'en';
  private includeNegativeExamples: boolean;

  constructor(options: ContextBuilderOptions = {}) {
    this.themeManager = options.themeManager ?? getThemeManager();
    this.language = options.language ?? 'zh';
    this.includeNegativeExamples = options.includeNegativeExamples ?? true;
  }

  /**
   * 估算 Token 数量
   */
  estimate(settings: ContextSettings = DEFAULT_CONTEXT_SETTINGS): TokenEstimate {
    const theme = this.themeManager.getTheme(settings.themeId);
    if (!theme) {
      return {
        componentDocs: 0,
        examples: 0,
        colorInfo: 0,
        base: BASE_PROMPT_TOKENS,
        total: BASE_PROMPT_TOKENS,
      };
    }

    const componentDocs = getComponentDocs(theme, settings, this.language);
    const exampleDocs = getExampleDocs(theme, settings);
    const colorInfo = getColorInfo(theme, settings);

    const componentTokens = estimateTokens(componentDocs, this.language);
    const exampleTokens = estimateTokens(exampleDocs, this.language);
    const colorTokens = estimateTokens(colorInfo, this.language);

    return {
      componentDocs: componentTokens,
      examples: exampleTokens,
      colorInfo: colorTokens,
      base: BASE_PROMPT_TOKENS,
      total: componentTokens + exampleTokens + colorTokens + BASE_PROMPT_TOKENS,
    };
  }

  /**
   * 构建上下文
   */
  build(settings: ContextSettings = DEFAULT_CONTEXT_SETTINGS): ContextBuildResult {
    const theme = this.themeManager.getTheme(settings.themeId);
    if (!theme) {
      return {
        prompt: '',
        tokenCount: 0,
        breakdown: {
          componentDocs: 0,
          examples: 0,
          colorInfo: 0,
          other: 0,
        },
      };
    }

    // 获取提示词模板
    const templates = theme.prompts.templates[this.language];

    // 构建各部分内容
    const componentDocs = getComponentDocs(theme, settings, this.language);
    const exampleDocs = getExampleDocs(theme, settings);
    const colorInfo = getColorInfo(theme, settings);

    // 组装提示词
    const parts: string[] = [
      templates.systemIntro,
      '',
      '## 可用组件',
      componentDocs,
      '',
      templates.iconGuidelines,
      '',
    ];

    if (colorInfo) {
      parts.push(colorInfo, '');
    }

    if (exampleDocs) {
      parts.push('## 示例', exampleDocs, '');
    }

    if (this.includeNegativeExamples && templates.negativeExamples) {
      parts.push('## 错误示例（避免）', templates.negativeExamples, '');
    }

    parts.push(templates.closing);

    const prompt = parts.join('\n');

    // 估算 Token
    const estimate = this.estimate(settings);

    // 自动优化（如果超出预算）
    if (settings.tokenBudget.autoOptimize && estimate.total > settings.tokenBudget.max) {
      return this.buildOptimized(settings, estimate);
    }

    return {
      prompt,
      tokenCount: estimate.total,
      breakdown: {
        componentDocs: estimate.componentDocs,
        examples: estimate.examples,
        colorInfo: estimate.colorInfo,
        other: estimate.base,
      },
    };
  }

  /**
   * 构建优化后的上下文（减少内容以符合预算）
   */
  private buildOptimized(
    settings: ContextSettings,
    estimate: TokenEstimate
  ): ContextBuildResult {
    const budget = settings.tokenBudget.max;
    const overBudget = estimate.total - budget;

    // 优化策略：优先减少案例数量
    const optimizedSettings = { ...settings };

    if (estimate.examples > overBudget) {
      // 减少案例数量
      const currentMax = settings.examples.maxCount ?? 5;
      const reduction = Math.ceil(overBudget / (estimate.examples / currentMax));
      optimizedSettings.examples = {
        ...settings.examples,
        maxCount: Math.max(1, currentMax - reduction),
      };
    } else {
      // 移除配色信息
      optimizedSettings.colorScheme = {
        ...settings.colorScheme,
        includeInPrompt: false,
      };
    }

    // 重新构建
    return this.build(optimizedSettings);
  }

  /**
   * 设置语言
   */
  setLanguage(language: 'zh' | 'en'): void {
    this.language = language;
  }

  /**
   * 设置是否包含负面案例
   */
  setIncludeNegativeExamples(include: boolean): void {
    this.includeNegativeExamples = include;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * 创建上下文构建器
 */
export function createContextBuilder(options?: ContextBuilderOptions): ContextBuilder {
  return new ContextBuilder(options);
}

export default ContextBuilder;
