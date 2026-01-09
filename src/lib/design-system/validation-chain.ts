/**
 * @file validation-chain.ts
 * @description 验证链模块，按顺序执行多层验证流程
 * @module lib/design-system/validation-chain
 * @requirements 5.1, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
 */

import type { UISchema } from '../../types';
import type { ComponentCatalog } from '../core/component-catalog';
import type { DesignTokens } from './design-tokens';
import { validateJSON } from '../core/validation';
import { validateUISchema, validateUISchemaEnhanced } from '../core/validation';
import { defaultCatalog } from '../core/component-catalog';
import { getDefaultDesignTokens, suggestColorToken } from './design-tokens';
import { validateTokenCompliance } from './token-compliance-validator';
import { validateIconCompliance } from './emoji-validator';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 验证层类型
 * 按执行顺序定义
 */
export type ValidationLayer =
  | 'json-syntax'
  | 'schema-structure'
  | 'component-existence'
  | 'props-validation'
  | 'style-compliance'
  | 'token-usage-compliance'
  | 'icon-compliance';

/**
 * 验证错误严重程度
 */
export type ErrorSeverity = 'error' | 'warning';

/**
 * 验证链错误
 * @see Requirements 8.2, 8.3, 8.4, 8.5, 8.6
 */
export interface ChainValidationError {
  /** 错误所属层 */
  layer: ValidationLayer;
  /** 严重程度 */
  severity: ErrorSeverity;
  /** 错误路径 (如 "root.children[0].props.variant") */
  path: string;
  /** 错误消息 */
  message: string;
  /** 修复建议 */
  suggestion?: string;
  /** 行号 (仅 JSON 语法错误) */
  line?: number;
  /** 列号 (仅 JSON 语法错误) */
  column?: number;
}


/**
 * 验证链结果
 * @see Requirements 8.7, 8.8
 */
export interface ValidationChainResult {
  /** 是否通过验证 (无 error 级别错误) */
  valid: boolean;
  /** 错误列表 */
  errors: ChainValidationError[];
  /** 警告列表 */
  warnings: ChainValidationError[];
  /** 验证后的 Schema (如果通过) */
  schema?: UISchema;
  /** 各层验证耗时 (ms) */
  timing: Record<ValidationLayer, number>;
}

/**
 * 验证链配置
 */
export interface ValidationChainConfig {
  /** 设计令牌 (用于样式合规验证) */
  designTokens?: DesignTokens;
  /** 组件目录 (用于组件存在性验证) */
  catalog?: ComponentCatalog;
  /** 是否启用样式合规验证 */
  validateStyleCompliance?: boolean;
  /** 是否启用 Token 使用合规验证 */
  validateTokenUsageCompliance?: boolean;
  /** 是否启用 Icon 合规验证 */
  validateIconCompliance?: boolean;
}

// ============================================================================
// 内部辅助函数
// ============================================================================

/**
 * 验证层执行顺序
 */
const VALIDATION_LAYER_ORDER: ValidationLayer[] = [
  'json-syntax',
  'schema-structure',
  'component-existence',
  'props-validation',
  'style-compliance',
  'token-usage-compliance',
  'icon-compliance',
];

/**
 * 初始化计时记录
 */
function initTiming(): Record<ValidationLayer, number> {
  return {
    'json-syntax': 0,
    'schema-structure': 0,
    'component-existence': 0,
    'props-validation': 0,
    'style-compliance': 0,
    'token-usage-compliance': 0,
    'icon-compliance': 0,
  };
}

/**
 * 检查是否为硬编码颜色值
 */
function isHardcodedColor(value: string): boolean {
  // Hex 颜色
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) {
    return true;
  }
  // RGB/RGBA
  if (/^rgba?\s*\(/.test(value)) {
    return true;
  }
  // HSL/HSLA
  if (/^hsla?\s*\(/.test(value)) {
    return true;
  }
  return false;
}

/**
 * 递归收集组件的样式合规错误
 */
function collectStyleComplianceErrors(
  component: Record<string, unknown>,
  path: string,
  tokens: DesignTokens,
  errors: ChainValidationError[],
  warnings: ChainValidationError[]
): void {
  // 检查 style 字段
  if (component.style && typeof component.style === 'object') {
    const style = component.style as Record<string, unknown>;
    const colorProps = ['color', 'backgroundColor', 'borderColor', 'background'];
    
    for (const prop of colorProps) {
      const value = style[prop];
      if (typeof value === 'string' && isHardcodedColor(value)) {
        const suggestion = suggestColorToken(value, tokens);
        warnings.push({
          layer: 'style-compliance',
          severity: 'warning',
          path: `${path}.style.${prop}`,
          message: `Hardcoded color value "${value}" found`,
          suggestion: suggestion 
            ? `Use Design Token: ${suggestion}` 
            : 'Consider using a Design Token color instead of hardcoded values',
        });
      }
    }
  }

  // 递归检查子组件
  if (Array.isArray(component.children)) {
    component.children.forEach((child, index) => {
      if (child && typeof child === 'object') {
        collectStyleComplianceErrors(
          child as Record<string, unknown>,
          `${path}.children[${index}]`,
          tokens,
          errors,
          warnings
        );
      }
    });
  }
}


// ============================================================================
// 主要导出函数
// ============================================================================

/**
 * 执行验证链
 * 
 * 验证顺序：
 * 1. JSON 语法验证
 * 2. Schema 结构验证
 * 3. 组件存在性验证
 * 4. Props 验证
 * 5. 样式合规验证
 * 6. Token 使用合规验证
 * 
 * @param input - 要验证的 JSON 字符串
 * @param config - 验证链配置
 * @returns 验证链结果
 * 
 * @see Requirements 5.1, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
 */
export function executeValidationChain(
  input: string,
  config?: ValidationChainConfig
): ValidationChainResult {
  const timing = initTiming();
  const errors: ChainValidationError[] = [];
  const warnings: ChainValidationError[] = [];
  
  const catalog = config?.catalog ?? defaultCatalog;
  const tokens = config?.designTokens ?? getDefaultDesignTokens();
  const validateStyle = config?.validateStyleCompliance ?? true;

  // ========================================
  // Layer 1: JSON 语法验证
  // ========================================
  const jsonStart = performance.now();
  const jsonResult = validateJSON(input);
  timing['json-syntax'] = performance.now() - jsonStart;

  if (!jsonResult.valid) {
    errors.push({
      layer: 'json-syntax',
      severity: 'error',
      path: '',
      message: jsonResult.error?.message ?? 'Invalid JSON syntax',
      line: jsonResult.error?.line,
      column: jsonResult.error?.column,
      suggestion: 'Check for missing brackets, quotes, or commas',
    });

    // JSON 语法错误时，后续验证无法进行
    return {
      valid: false,
      errors,
      warnings,
      timing,
    };
  }

  const parsedValue = jsonResult.value;

  // ========================================
  // Layer 2: Schema 结构验证
  // ========================================
  const structureStart = performance.now();
  const structureResult = validateUISchema(parsedValue);
  timing['schema-structure'] = performance.now() - structureStart;

  if (!structureResult.valid) {
    for (const err of structureResult.errors) {
      errors.push({
        layer: 'schema-structure',
        severity: 'error',
        path: err.path,
        message: err.message,
        suggestion: getStructureSuggestion(err.code, err.path),
      });
    }

    // 结构错误时，后续验证可能不准确，但继续收集更多错误
    // 如果缺少 root，则无法继续
    if (structureResult.errors.some(e => e.path === 'root' && e.code === 'MISSING_FIELD')) {
      return {
        valid: false,
        errors,
        warnings,
        timing,
      };
    }
  }

  // ========================================
  // Layer 3 & 4: 组件存在性和 Props 验证
  // 使用 validateUISchemaEnhanced 一次性完成
  // ========================================
  const componentStart = performance.now();
  const enhancedResult = validateUISchemaEnhanced(parsedValue, {
    catalog,
    validateComponentTypes: true,
    validateProps: true,
  });
  const componentEnd = performance.now();
  
  // 分配时间到两个层
  const componentTime = componentEnd - componentStart;
  timing['component-existence'] = componentTime * 0.5;
  timing['props-validation'] = componentTime * 0.5;

  // 分类错误到对应的层
  for (const err of enhancedResult.errors) {
    const layer = categorizeErrorToLayer(err.code);
    errors.push({
      layer,
      severity: 'error',
      path: err.path,
      message: err.message,
      suggestion: err.suggestion,
    });
  }

  for (const warn of enhancedResult.warnings) {
    const layer = categorizeErrorToLayer(warn.code);
    warnings.push({
      layer,
      severity: 'warning',
      path: warn.path,
      message: warn.message,
      suggestion: warn.suggestion,
    });
  }

  // ========================================
  // Layer 5: 样式合规验证
  // ========================================
  if (validateStyle && parsedValue && typeof parsedValue === 'object') {
    const styleStart = performance.now();
    const obj = parsedValue as Record<string, unknown>;
    
    if (obj.root && typeof obj.root === 'object') {
      collectStyleComplianceErrors(
        obj.root as Record<string, unknown>,
        'root',
        tokens,
        errors,
        warnings
      );
    }
    
    timing['style-compliance'] = performance.now() - styleStart;
  }

  // ========================================
  // Layer 6: Token 使用合规验证
  // ========================================
  const validateTokenUsage = config?.validateTokenUsageCompliance ?? true;
  if (validateTokenUsage && parsedValue && typeof parsedValue === 'object') {
    const tokenStart = performance.now();
    
    // 只有当 schema 结构有效时才进行 Token 合规验证
    const obj = parsedValue as Record<string, unknown>;
    if (obj.root && obj.version) {
      const tokenComplianceResult = validateTokenCompliance(
        parsedValue as UISchema,
        { designTokens: tokens }
      );
      
      // 将 Token 合规错误添加到验证链错误中
      for (const tokenError of tokenComplianceResult.errors) {
        errors.push({
          layer: 'token-usage-compliance',
          severity: 'error',
          path: tokenError.path,
          message: tokenError.message,
          suggestion: tokenError.suggestion,
        });
      }
      
      // 将 Token 合规警告添加到验证链警告中
      for (const tokenWarning of tokenComplianceResult.warnings) {
        warnings.push({
          layer: 'token-usage-compliance',
          severity: 'warning',
          path: tokenWarning.path,
          message: tokenWarning.message,
          suggestion: tokenWarning.suggestion,
        });
      }
    }
    
    timing['token-usage-compliance'] = performance.now() - tokenStart;
  }

  // ========================================
  // Layer 7: Icon 合规验证
  // ========================================
  const validateIcon = config?.validateIconCompliance ?? true;
  if (validateIcon && parsedValue && typeof parsedValue === 'object') {
    const iconStart = performance.now();
    
    const obj = parsedValue as Record<string, unknown>;
    if (obj.root && obj.version) {
      const iconComplianceResult = validateIconCompliance(parsedValue as UISchema);
      
      // 将 Icon 合规警告添加到验证链警告中
      for (const iconWarning of iconComplianceResult.warnings) {
        warnings.push({
          layer: 'icon-compliance',
          severity: 'warning',
          path: iconWarning.path,
          message: `Emoji "${iconWarning.emoji}" found in UI`,
          suggestion: iconWarning.suggestedIcon
            ? `Use Icon component: { "type": "Icon", "props": { "name": "${iconWarning.suggestedIcon}" } }`
            : 'Replace emoji with Icon component, see ui-generation-guide.md for available icons',
        });
      }
    }
    
    timing['icon-compliance'] = performance.now() - iconStart;
  }

  // 计算最终结果
  const hasErrors = errors.some(e => e.severity === 'error');
  
  return {
    valid: !hasErrors,
    errors,
    warnings,
    schema: !hasErrors ? (parsedValue as UISchema) : undefined,
    timing,
  };
}


/**
 * 根据错误码分类到对应的验证层
 */
function categorizeErrorToLayer(code: string | undefined): ValidationLayer {
  switch (code) {
    case 'UNKNOWN_COMPONENT':
    case 'DEPRECATED_COMPONENT':
      return 'component-existence';
    case 'MISSING_REQUIRED_PROP':
    case 'INVALID_PROP_TYPE':
    case 'INVALID_ENUM_VALUE':
      return 'props-validation';
    default:
      return 'schema-structure';
  }
}

/**
 * 获取结构错误的修复建议
 */
function getStructureSuggestion(code: string | undefined, path: string): string {
  switch (code) {
    case 'MISSING_FIELD':
      if (path === 'version') {
        return 'Add "version": "1.0" to your schema';
      }
      if (path === 'root') {
        return 'Add a "root" object with "id" and "type" fields';
      }
      if (path.includes('.id')) {
        return 'Each component must have a unique "id" string';
      }
      if (path.includes('.type')) {
        return 'Each component must have a "type" string';
      }
      return `Add the missing field at "${path}"`;
    case 'INVALID_TYPE':
      return `Check the type of the value at "${path}"`;
    case 'INVALID_VALUE':
      return `The value at "${path}" is invalid`;
    case 'DUPLICATE_ID':
      return 'Each component must have a unique ID';
    default:
      return `Fix the error at "${path}"`;
  }
}

/**
 * 格式化验证错误为 LLM 可读格式
 * 
 * 生成格式：
 * ```
 * ## Previous Attempt Errors (MUST FIX)
 * 1. [JSON Syntax] Line 5: Unexpected token...
 * 2. [Component] Unknown component "Btn", did you mean "Button"?
 * 3. [Props] Invalid prop "colour" on Button, did you mean "color"?
 * ```
 * 
 * @param errors - 验证错误数组
 * @returns LLM 可读的格式化字符串
 */
export function formatErrorsForLLM(errors: ChainValidationError[]): string {
  if (errors.length === 0) {
    return '';
  }

  const lines: string[] = ['## Previous Attempt Errors (MUST FIX)', ''];

  errors.forEach((error, index) => {
    const layerLabel = getLayerLabel(error.layer);
    let errorLine = `${index + 1}. [${layerLabel}]`;

    // 添加位置信息
    if (error.line !== undefined) {
      errorLine += ` Line ${error.line}`;
      if (error.column !== undefined) {
        errorLine += `:${error.column}`;
      }
      errorLine += ':';
    } else if (error.path) {
      errorLine += ` at "${error.path}":`;
    }

    errorLine += ` ${error.message}`;

    // 添加建议
    if (error.suggestion) {
      errorLine += ` (${error.suggestion})`;
    }

    lines.push(errorLine);
  });

  return lines.join('\n');
}

/**
 * 获取验证层的显示标签
 */
function getLayerLabel(layer: ValidationLayer): string {
  switch (layer) {
    case 'json-syntax':
      return 'JSON Syntax';
    case 'schema-structure':
      return 'Schema Structure';
    case 'component-existence':
      return 'Component';
    case 'props-validation':
      return 'Props';
    case 'style-compliance':
      return 'Style';
    case 'token-usage-compliance':
      return 'Token Usage';
    case 'icon-compliance':
      return 'Icon';
    default:
      return 'Validation';
  }
}

/**
 * 获取验证层执行顺序
 * 用于测试验证层顺序执行
 */
export function getValidationLayerOrder(): ValidationLayer[] {
  return [...VALIDATION_LAYER_ORDER];
}