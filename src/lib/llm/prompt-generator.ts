/**
 * Prompt Generator Module
 * 
 * 提示词生成器，使用 PromptBuilder 和 TokenCounter 构建系统提示词。
 * 支持案例驱动生成，根据用户输入智能检索和注入相关案例。
 * 
 * 支持多主题系统：当 ThemeManager 可用时，使用当前主题的提示词模板；
 * 否则回退到默认模板以保持向后兼容。
 * 
 * @module lib/llm/prompt-generator
 * @see Requirements 2.5, 3.6, 6.2, 6.3, 6.4
 */

import type { ComponentCatalog, ComponentMetadata } from '../core/component-catalog';
import type { PropSchema } from '../core/component-registry';
import { defaultCatalog } from '../core/component-catalog';
import type { RetrievalOptions } from '../examples/example-retriever';
import { ExampleRetriever } from '../examples/example-retriever';
import { ExampleInjector } from '../examples/example-injector';
import { ExampleLibrary } from '../examples/example-library';
import { PromptBuilder } from './prompt-builder';
import type { PromptBuildResult } from './prompt-builder';
import { tokenCounter } from './token-counter';
import { promptCache, generateCacheKey } from './prompt-cache';
import type { CacheEntry } from './prompt-cache';
import { ThemeManager } from '../themes/theme-manager';
import type { PromptTemplates } from '../themes/types';

/**
 * 提示词生成选项
 */
export interface PromptGeneratorOptions {
  /** 使用的组件目录 */
  catalog?: ComponentCatalog;
  /** 是否包含示例 */
  includeExamples?: boolean;
  /** 是否包含负面示例 */
  includeNegativeExamples?: boolean;
  /** 输出语言 */
  language?: 'zh' | 'en';
  /** 是否包含相关案例，默认 true */
  includeRelevantExamples?: boolean;
  /** 用户输入，用于检索相关案例 */
  userInput?: string;
  /** 案例检索选项 */
  retrievalOptions?: RetrievalOptions;
  /** 最大 Token 数限制 */
  maxTokens?: number;
  /** 是否使用缓存，默认 true */
  useCache?: boolean;
  /** 是否使用 ThemeManager 获取模板，默认 true */
  useThemeManager?: boolean;
}

/**
 * 从 ThemeManager 获取当前主题的提示词模板
 */
function getThemePromptTemplates(language: 'zh' | 'en'): PromptTemplates | null {
  try {
    const themeManager = ThemeManager.getInstance();
    if (themeManager.getThemeCount() > 0) {
      const theme = themeManager.getActiveTheme();
      return theme.prompts.templates[language];
    }
  } catch {
    // ThemeManager 未初始化或没有主题
  }
  return null;
}


/**
 * 类别名称映射（中文）
 */
const CATEGORY_NAMES_ZH: Record<string, string> = {
  'layout': '布局组件',
  'input': '表单组件',
  'display': '展示组件',
  'feedback': '反馈组件',
  'navigation': '导航组件',
  'uncategorized': '其他组件',
};

/**
 * 类别名称映射（英文）
 */
const CATEGORY_NAMES_EN: Record<string, string> = {
  'layout': 'Layout Components',
  'input': 'Form Components',
  'display': 'Display Components',
  'feedback': 'Feedback Components',
  'navigation': 'Navigation Components',
  'uncategorized': 'Other Components',
};

/**
 * 格式化属性类型为可读字符串
 */
function formatPropType(schema: PropSchema): string {
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum.map(v => `"${v}"`).join(' | ');
  }
  return schema.type;
}

/**
 * 格式化单个属性的文档
 */
function formatPropDoc(name: string, schema: PropSchema): string {
  const parts: string[] = [];
  parts.push(name);
  
  if (schema.required) {
    parts.push('(必填)');
  }
  
  parts.push(`: ${formatPropType(schema)}`);
  
  if (schema.description) {
    parts.push(` - ${schema.description}`);
  }
  
  if (schema.default !== undefined) {
    parts.push(` (默认: ${JSON.stringify(schema.default)})`);
  }
  
  return parts.join('');
}

/**
 * 生成单个组件的文档
 */
function formatComponentDoc(metadata: ComponentMetadata): string {
  const lines: string[] = [];
  
  lines.push(`- **${metadata.name}**: ${metadata.description || '无描述'}`);
  
  const propsSchema = metadata.propsSchema;
  if (propsSchema && Object.keys(propsSchema).length > 0) {
    const propDocs = Object.entries(propsSchema)
      .map(([name, schema]) => formatPropDoc(name, schema))
      .join(', ');
    lines.push(`  - props: { ${propDocs} }`);
  }
  
  return lines.join('\n');
}


/**
 * 生成组件文档部分
 * 按类别分组生成组件文档
 */
export function generateComponentDocs(
  catalog: ComponentCatalog = defaultCatalog,
  language: 'zh' | 'en' = 'zh'
): string {
  const categoryNames = language === 'zh' ? CATEGORY_NAMES_ZH : CATEGORY_NAMES_EN;
  const byCategory = catalog.getByCategory();
  const lines: string[] = [];
  
  const categoryOrder = ['layout', 'input', 'display', 'feedback', 'navigation', 'uncategorized'];
  
  for (const category of categoryOrder) {
    const components = byCategory[category];
    if (!components || components.length === 0) continue;
    
    const categoryName = categoryNames[category] || category;
    lines.push(`### ${categoryName}`);
    
    for (const component of components) {
      lines.push(formatComponentDoc(component));
    }
    
    lines.push('');
  }
  
  for (const [category, components] of Object.entries(byCategory)) {
    if (categoryOrder.includes(category)) continue;
    if (!components || components.length === 0) continue;
    
    const categoryName = categoryNames[category] || category;
    lines.push(`### ${categoryName}`);
    
    for (const component of components) {
      lines.push(formatComponentDoc(component));
    }
    
    lines.push('');
  }
  
  return lines.join('\n').trim();
}

/**
 * 生成正面示例（兼容旧 API）
 */
export function generatePositiveExamples(language: 'zh' | 'en' = 'zh'): string {
  const builder = new PromptBuilder({ language });
  builder.withExamples();
  const result = builder.build();
  return result.prompt;
}

/**
 * 生成负面示例（兼容旧 API）
 */
export function generateNegativeExamples(language: 'zh' | 'en' = 'zh'): string {
  const builder = new PromptBuilder({ language });
  builder.withNegativeExamples();
  const result = builder.build();
  return result.prompt;
}

/**
 * 生成 Icon 组件使用指南（兼容旧 API）
 */
export function generateIconGuidelines(language: 'zh' | 'en' = 'zh'): string {
  const builder = new PromptBuilder({ language });
  builder.withIconGuidelines();
  const result = builder.build();
  return result.prompt;
}


/**
 * 生成相关案例部分
 * 根据用户输入检索相关案例并格式化为提示词
 * 支持从 ThemeManager 获取当前主题的案例
 */
export function generateRelevantExamplesSection(
  userInput: string | undefined,
  language: 'zh' | 'en',
  retrievalOptions?: RetrievalOptions,
  useThemeManager: boolean = true
): string {
  const library = new ExampleLibrary({ useThemeManager });
  const retriever = new ExampleRetriever(library);
  const injector = new ExampleInjector();
  
  let examples;
  if (userInput && userInput.trim()) {
    const results = retriever.retrieve(userInput, retrievalOptions);
    examples = results.map(r => r.example);
  } else {
    examples = injector.getDefaultExamples();
  }
  
  return injector.format(examples, {
    enabled: true,
    language,
    includeSchema: true,
  });
}

/**
 * 生成系统提示词
 * 使用 PromptBuilder 构建完整的系统提示词
 * 支持从 ThemeManager 获取当前主题的模板
 */
export function generateSystemPrompt(options: PromptGeneratorOptions = {}): string {
  const {
    catalog = defaultCatalog,
    includeExamples = true,
    includeNegativeExamples = true,
    language = 'zh',
    includeRelevantExamples = true,
    userInput,
    retrievalOptions,
    maxTokens,
    useCache = true,
    useThemeManager = true,
  } = options;

  // 获取当前主题 ID（用于缓存键）
  let themeId = 'default';
  try {
    const themeManager = ThemeManager.getInstance();
    if (themeManager.getThemeCount() > 0) {
      themeId = themeManager.getActiveThemeId();
    }
  } catch {
    // 忽略
  }

  // 生成缓存键（包含主题 ID）
  const cacheKey = generateCacheKey({
    language,
    sections: [
      'system-intro',
      'icon-guidelines',
      'component-docs',
      includeExamples ? 'positive-examples' : '',
      includeNegativeExamples ? 'negative-examples' : '',
      includeRelevantExamples ? 'relevant-examples' : '',
      'closing',
    ].filter(Boolean),
    maxTokens,
    variables: { userInput: userInput || '', themeId },
  });

  // 尝试从缓存获取
  if (useCache) {
    const cached = promptCache.get(cacheKey);
    if (cached) {
      return cached.result.prompt;
    }
  }

  // 尝试从 ThemeManager 获取模板
  const themeTemplates = useThemeManager ? getThemePromptTemplates(language) : null;

  // 使用 PromptBuilder 构建提示词
  const builder = new PromptBuilder({
    language,
    maxTokens,
    variables: {
      componentDocs: generateComponentDocs(catalog, language),
    },
  });

  // 如果有主题模板，使用主题模板
  if (themeTemplates) {
    // 使用主题的系统介绍
    if (themeTemplates.systemIntro) {
      builder.addSection('system-intro', themeTemplates.systemIntro);
    } else {
      builder.withSystemIntro();
    }

    // 使用主题的图标指南
    if (themeTemplates.iconGuidelines) {
      builder.addSection('icon-guidelines', themeTemplates.iconGuidelines);
    } else {
      builder.withIconGuidelines();
    }

    // 使用主题的组件文档
    if (themeTemplates.componentDocs) {
      builder.addSection('component-docs', themeTemplates.componentDocs);
    } else {
      builder.withComponentDocs();
    }
  } else {
    // 使用默认模板
    builder.withSystemIntro();
    builder.withIconGuidelines();
    builder.withComponentDocs();
  }

  // 添加相关案例
  if (includeRelevantExamples) {
    const relevantExamples = generateRelevantExamplesSection(userInput, language, retrievalOptions, useThemeManager);
    if (relevantExamples) {
      builder.withRelevantExamples(relevantExamples);
    }
  }

  // 添加正面示例
  if (includeExamples) {
    if (themeTemplates?.positiveExamples) {
      builder.addSection('positive-examples', themeTemplates.positiveExamples);
    } else {
      builder.withExamples();
    }
  }

  // 添加负面示例
  if (includeNegativeExamples) {
    if (themeTemplates?.negativeExamples) {
      builder.addSection('negative-examples', themeTemplates.negativeExamples);
    } else {
      builder.withNegativeExamples();
    }
  }

  // 添加结尾
  if (themeTemplates?.closing) {
    builder.addSection('closing', themeTemplates.closing.replace('{{userInput}}', userInput || ''));
  } else {
    builder.withClosing(userInput || '');
  }

  // 构建结果
  const result = builder.build();

  // 缓存结果
  if (useCache) {
    const cacheEntry: CacheEntry = {
      result,
      createdAt: Date.now(),
      templateMtimes: {},
    };
    promptCache.set(cacheKey, cacheEntry);
  }

  return result.prompt;
}


/**
 * 生成系统提示词（带详细结果）
 * 返回包含 Token 计数和部分信息的完整结果
 * 支持从 ThemeManager 获取当前主题的模板
 */
export function generateSystemPromptWithDetails(
  options: PromptGeneratorOptions = {}
): PromptBuildResult {
  const {
    catalog = defaultCatalog,
    includeExamples = true,
    includeNegativeExamples = true,
    language = 'zh',
    includeRelevantExamples = true,
    userInput,
    retrievalOptions,
    maxTokens,
    useThemeManager = true,
  } = options;

  // 尝试从 ThemeManager 获取模板
  const themeTemplates = useThemeManager ? getThemePromptTemplates(language) : null;

  const builder = new PromptBuilder({
    language,
    maxTokens,
    variables: {
      componentDocs: generateComponentDocs(catalog, language),
    },
  });

  // 如果有主题模板，使用主题模板
  if (themeTemplates) {
    if (themeTemplates.systemIntro) {
      builder.addSection('system-intro', themeTemplates.systemIntro);
    } else {
      builder.withSystemIntro();
    }

    if (themeTemplates.iconGuidelines) {
      builder.addSection('icon-guidelines', themeTemplates.iconGuidelines);
    } else {
      builder.withIconGuidelines();
    }

    if (themeTemplates.componentDocs) {
      builder.addSection('component-docs', themeTemplates.componentDocs);
    } else {
      builder.withComponentDocs();
    }
  } else {
    builder.withSystemIntro();
    builder.withIconGuidelines();
    builder.withComponentDocs();
  }

  if (includeRelevantExamples) {
    const relevantExamples = generateRelevantExamplesSection(userInput, language, retrievalOptions, useThemeManager);
    if (relevantExamples) {
      builder.withRelevantExamples(relevantExamples);
    }
  }

  if (includeExamples) {
    if (themeTemplates?.positiveExamples) {
      builder.addSection('positive-examples', themeTemplates.positiveExamples);
    } else {
      builder.withExamples();
    }
  }

  if (includeNegativeExamples) {
    if (themeTemplates?.negativeExamples) {
      builder.addSection('negative-examples', themeTemplates.negativeExamples);
    } else {
      builder.withNegativeExamples();
    }
  }

  if (themeTemplates?.closing) {
    builder.addSection('closing', themeTemplates.closing.replace('{{userInput}}', userInput || ''));
  } else {
    builder.withClosing(userInput || '');
  }

  return builder.build();
}

/**
 * 获取提示词的 Token 计数
 */
export function getPromptTokenCount(prompt: string): number {
  return tokenCounter.countTokens(prompt);
}

/**
 * 清除提示词缓存
 */
export function clearPromptCache(): void {
  promptCache.clear();
}

/**
 * 获取缓存统计信息
 */
export function getPromptCacheStats(): { size: number; maxSize: number; keys: string[] } {
  return promptCache.getStats();
}

// 导出 TokenCounter 和 PromptBuilder 供外部使用
export { TokenCounter, tokenCounter } from './token-counter';
export { PromptBuilder, createPromptBuilder } from './prompt-builder';
export type { PromptBuildResult } from './prompt-builder';
