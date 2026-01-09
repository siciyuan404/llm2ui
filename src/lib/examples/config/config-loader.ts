/**
 * @file config-loader.ts
 * @description 配置加载器模块，支持异步加载和验证关键词映射配置
 * @module lib/examples/config/config-loader
 * @requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import type { ExampleCategory } from '../example-tags';
import type { KeywordMapping } from '../example-retriever';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 关键词映射配置文件结构
 */
export interface KeywordMappingsConfig {
  /** 配置版本 */
  version: string;
  /** 配置描述 */
  description?: string;
  /** 映射列表 */
  mappings: KeywordMappingEntry[];
}

/**
 * 配置文件中的映射条目
 */
export interface KeywordMappingEntry {
  /** 关键词列表 */
  keywords: string[];
  /** 映射到的标签 */
  tags?: string[];
  /** 映射到的分类 */
  category?: string;
  /** 权重加成 */
  boost: number;
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误列表 */
  errors: string[];
  /** 警告列表 */
  warnings: string[];
}

/**
 * 配置加载结果
 */
export interface ConfigLoadResult {
  /** 是否成功 */
  success: boolean;
  /** 加载的映射 */
  mappings: KeywordMapping[];
  /** 配置版本 */
  version?: string;
  /** 错误信息 */
  error?: string;
  /** 是否使用了默认配置 */
  usedDefault: boolean;
}

// ============================================================================
// 默认配置
// ============================================================================

/**
 * 默认关键词映射（作为回退）
 */
const DEFAULT_KEYWORD_MAPPINGS: KeywordMapping[] = [
  {
    keywords: ['cherry', 'cherry studio', 'cherry风格'],
    tags: ['cherry'],
    boost: 2.0,
  },
  {
    keywords: ['聊天', 'chat', '对话', 'conversation'],
    tags: ['chat', 'cherry'],
    boost: 1.5,
  },
  {
    keywords: ['侧边栏', 'sidebar', '侧栏'],
    tags: ['sidebar', 'navigation'],
    boost: 1.5,
  },
  {
    keywords: ['表单', 'form', '输入', 'input'],
    tags: ['form'],
    category: 'form' as ExampleCategory,
    boost: 1.2,
  },
  {
    keywords: ['导航', 'navigation', 'nav', '菜单'],
    tags: ['navigation', 'navbar'],
    category: 'navigation' as ExampleCategory,
    boost: 1.2,
  },
];

// ============================================================================
// 验证函数
// ============================================================================

/**
 * 验证关键词映射配置
 * @param config 配置对象
 * @returns 验证结果
 */
export function validateConfig(config: unknown): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查基本结构
  if (!config || typeof config !== 'object') {
    errors.push('配置必须是一个对象');
    return { valid: false, errors, warnings };
  }

  const cfg = config as Record<string, unknown>;

  // 检查版本字段
  if (!cfg.version || typeof cfg.version !== 'string') {
    errors.push('缺少必需的 version 字段');
  }

  // 检查 mappings 数组
  if (!cfg.mappings || !Array.isArray(cfg.mappings)) {
    errors.push('缺少必需的 mappings 数组');
    return { valid: false, errors, warnings };
  }

  // 验证每个映射条目
  const mappings = cfg.mappings as unknown[];
  mappings.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      errors.push(`mappings[${index}]: 必须是一个对象`);
      return;
    }

    const e = entry as Record<string, unknown>;

    // 检查 keywords
    if (!e.keywords || !Array.isArray(e.keywords)) {
      errors.push(`mappings[${index}]: 缺少必需的 keywords 数组`);
    } else if (e.keywords.length === 0) {
      warnings.push(`mappings[${index}]: keywords 数组为空`);
    } else if (!e.keywords.every(k => typeof k === 'string')) {
      errors.push(`mappings[${index}]: keywords 必须全部是字符串`);
    }

    // 检查 boost
    if (typeof e.boost !== 'number') {
      errors.push(`mappings[${index}]: 缺少必需的 boost 数值`);
    } else if (e.boost <= 0) {
      warnings.push(`mappings[${index}]: boost 值应该大于 0`);
    }

    // 检查可选的 tags
    if (e.tags !== undefined) {
      if (!Array.isArray(e.tags)) {
        errors.push(`mappings[${index}]: tags 必须是数组`);
      } else if (!e.tags.every(t => typeof t === 'string')) {
        errors.push(`mappings[${index}]: tags 必须全部是字符串`);
      }
    }

    // 检查可选的 category
    if (e.category !== undefined && typeof e.category !== 'string') {
      errors.push(`mappings[${index}]: category 必须是字符串`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 将配置条目转换为 KeywordMapping
 */
function convertToKeywordMapping(entry: KeywordMappingEntry): KeywordMapping {
  return {
    keywords: entry.keywords,
    tags: entry.tags,
    category: entry.category as ExampleCategory | undefined,
    boost: entry.boost,
  };
}

// ============================================================================
// 加载函数
// ============================================================================

/**
 * 从 JSON 字符串加载关键词映射
 * @param jsonString JSON 字符串
 * @returns 加载结果
 */
export function loadKeywordMappingsFromString(jsonString: string): ConfigLoadResult {
  try {
    const config = JSON.parse(jsonString) as unknown;
    const validation = validateConfig(config);

    if (!validation.valid) {
      return {
        success: false,
        mappings: DEFAULT_KEYWORD_MAPPINGS,
        error: validation.errors.join('; '),
        usedDefault: true,
      };
    }

    const cfg = config as KeywordMappingsConfig;
    const mappings = cfg.mappings.map(convertToKeywordMapping);

    return {
      success: true,
      mappings,
      version: cfg.version,
      usedDefault: false,
    };
  } catch (e) {
    return {
      success: false,
      mappings: DEFAULT_KEYWORD_MAPPINGS,
      error: e instanceof Error ? e.message : 'JSON 解析失败',
      usedDefault: true,
    };
  }
}

/**
 * 异步加载关键词映射配置
 * @param configPath 配置文件路径（可选，默认使用内置配置）
 * @returns 加载结果
 */
export async function loadKeywordMappings(
  configPath?: string
): Promise<ConfigLoadResult> {
  // 如果没有指定路径，尝试加载内置配置
  if (!configPath) {
    try {
      // 动态导入内置配置
      const config = await import('./keyword-mappings.json');
      const validation = validateConfig(config.default || config);

      if (!validation.valid) {
        console.warn('内置配置验证失败，使用默认配置:', validation.errors);
        return {
          success: false,
          mappings: DEFAULT_KEYWORD_MAPPINGS,
          error: validation.errors.join('; '),
          usedDefault: true,
        };
      }

      const cfg = (config.default || config) as KeywordMappingsConfig;
      const mappings = cfg.mappings.map(convertToKeywordMapping);

      return {
        success: true,
        mappings,
        version: cfg.version,
        usedDefault: false,
      };
    } catch (e) {
      console.warn('加载内置配置失败，使用默认配置:', e);
      return {
        success: false,
        mappings: DEFAULT_KEYWORD_MAPPINGS,
        error: e instanceof Error ? e.message : '加载失败',
        usedDefault: true,
      };
    }
  }

  // 如果指定了路径，尝试通过 fetch 加载
  try {
    const response = await fetch(configPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const jsonString = await response.text();
    return loadKeywordMappingsFromString(jsonString);
  } catch (e) {
    console.warn(`加载配置文件失败 (${configPath})，使用默认配置:`, e);
    return {
      success: false,
      mappings: DEFAULT_KEYWORD_MAPPINGS,
      error: e instanceof Error ? e.message : '加载失败',
      usedDefault: true,
    };
  }
}

/**
 * 获取默认关键词映射
 * @returns 默认映射列表
 */
export function getDefaultKeywordMappings(): KeywordMapping[] {
  return [...DEFAULT_KEYWORD_MAPPINGS];
}
