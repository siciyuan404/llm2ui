/**
 * @file error-formatter.ts
 * @description 多语言错误格式化器
 * @module lib/validation/i18n/error-formatter
 * @requirements REQ-3.1, REQ-3.2, REQ-3.3, REQ-3.4, REQ-3.5, REQ-3.6
 */

import type { ValidationError } from '../streaming/types';
import enMessages from './en.json';
import zhMessages from './zh.json';

// ============================================================================
// 类型定义
// ============================================================================

export type SupportedLanguage = 'zh' | 'en';

export interface ErrorFormatterOptions {
  /** 语言 */
  language?: SupportedLanguage;
  /** 是否包含位置信息 */
  includeLocation?: boolean;
  /** 是否包含修复建议 */
  includeSuggestion?: boolean;
}

export interface FormattedError {
  /** 错误码 */
  code: string;
  /** 格式化后的消息 */
  message: string;
  /** 位置信息 */
  location?: string;
  /** 修复建议 */
  suggestion?: string;
  /** 严重程度 */
  severity: 'error' | 'warning';
}

interface MessageTemplate {
  message: string;
  suggestion?: string;
}

type MessageMap = Record<string, MessageTemplate>;

// ============================================================================
// 消息映射
// ============================================================================

const messages: Record<SupportedLanguage, MessageMap> = {
  en: enMessages as MessageMap,
  zh: zhMessages as MessageMap,
};

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 替换模板中的占位符
 * 支持 {{placeholder}} 格式
 */
function replacePlaceholders(
  template: string,
  values: Record<string, unknown>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = values[key];
    if (value === undefined) return match;
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  });
}

/**
 * 从错误中提取占位符值
 */
function extractPlaceholderValues(error: ValidationError): Record<string, unknown> {
  const values: Record<string, unknown> = {
    path: error.path,
    line: error.line,
    column: error.column,
  };

  // 从消息中提取信息
  const typeMatch = error.message.match(/type "([^"]+)"/);
  if (typeMatch) {
    values.componentType = typeMatch[1];
  }

  const propMatch = error.message.match(/property "([^"]+)"/);
  if (propMatch) {
    values.propName = propMatch[1];
  }

  const valueMatch = error.message.match(/value "([^"]+)"/);
  if (valueMatch) {
    values.actualValue = valueMatch[1];
  }

  // 从建议中提取信息
  if (error.suggestion) {
    const meanMatch = error.suggestion.match(/Did you mean: (.+)\?/);
    if (meanMatch) {
      values.availableTypes = meanMatch[1];
    }
  }

  return values;
}

/**
 * 格式化位置信息
 */
function formatLocation(error: ValidationError, language: SupportedLanguage): string {
  const parts: string[] = [];

  if (error.path) {
    parts.push(language === 'zh' ? `路径: ${error.path}` : `Path: ${error.path}`);
  }

  if (error.line !== undefined && error.column !== undefined) {
    parts.push(
      language === 'zh'
        ? `行 ${error.line}, 列 ${error.column}`
        : `Line ${error.line}, Column ${error.column}`
    );
  }

  return parts.join(' | ');
}

// ============================================================================
// 错误格式化器类
// ============================================================================

/**
 * 错误格式化器
 */
export class ErrorFormatter {
  private language: SupportedLanguage;
  private includeLocation: boolean;
  private includeSuggestion: boolean;

  constructor(options: ErrorFormatterOptions = {}) {
    this.language = options.language ?? 'en';
    this.includeLocation = options.includeLocation ?? true;
    this.includeSuggestion = options.includeSuggestion ?? true;
  }

  /**
   * 设置语言
   */
  setLanguage(language: SupportedLanguage): void {
    this.language = language;
  }

  /**
   * 获取当前语言
   */
  getLanguage(): SupportedLanguage {
    return this.language;
  }

  /**
   * 格式化单个错误
   */
  format(
    error: ValidationError,
    options?: Partial<ErrorFormatterOptions>
  ): FormattedError {
    const lang = options?.language ?? this.language;
    const includeLocation = options?.includeLocation ?? this.includeLocation;
    const includeSuggestion = options?.includeSuggestion ?? this.includeSuggestion;

    // 获取消息模板
    const template = this.getTemplate(error.code, lang);
    const values = extractPlaceholderValues(error);

    // 格式化消息
    const message = template
      ? replacePlaceholders(template.message, values)
      : error.message;

    // 格式化建议
    let suggestion: string | undefined;
    if (includeSuggestion) {
      if (template?.suggestion) {
        suggestion = replacePlaceholders(template.suggestion, values);
      } else if (error.suggestion) {
        suggestion = error.suggestion;
      }
    }

    // 格式化位置
    let location: string | undefined;
    if (includeLocation) {
      location = formatLocation(error, lang);
    }

    return {
      code: error.code,
      message,
      location: location || undefined,
      suggestion: suggestion || undefined,
      severity: error.severity,
    };
  }

  /**
   * 格式化多个错误
   */
  formatAll(
    errors: ValidationError[],
    options?: Partial<ErrorFormatterOptions>
  ): FormattedError[] {
    return errors.map((error) => this.format(error, options));
  }

  /**
   * 获取消息模板
   */
  private getTemplate(
    code: string,
    language: SupportedLanguage
  ): MessageTemplate | undefined {
    // 尝试获取指定语言的模板
    const langMessages = messages[language];
    if (langMessages && langMessages[code]) {
      return langMessages[code];
    }

    // 回退到英文
    if (language !== 'en') {
      const enMsgs = messages.en;
      if (enMsgs && enMsgs[code]) {
        return enMsgs[code];
      }
    }

    return undefined;
  }

  /**
   * 检查是否有指定错误码的翻译
   */
  hasTranslation(code: string, language?: SupportedLanguage): boolean {
    const lang = language ?? this.language;
    const langMessages = messages[lang];
    return !!(langMessages && langMessages[code]);
  }

  /**
   * 获取所有支持的错误码
   */
  getSupportedCodes(): string[] {
    return Object.keys(messages.en);
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建错误格式化器实例
 */
export function createErrorFormatter(
  options?: ErrorFormatterOptions
): ErrorFormatter {
  return new ErrorFormatter(options);
}

/**
 * 格式化单个错误（便捷函数）
 */
export function formatError(
  error: ValidationError,
  options?: ErrorFormatterOptions
): FormattedError {
  const formatter = new ErrorFormatter(options);
  return formatter.format(error);
}

/**
 * 格式化多个错误（便捷函数）
 */
export function formatErrors(
  errors: ValidationError[],
  options?: ErrorFormatterOptions
): FormattedError[] {
  const formatter = new ErrorFormatter(options);
  return formatter.formatAll(errors);
}
