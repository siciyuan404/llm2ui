/**
 * @file token-compliance-validator.ts
 * @description Token 合规验证器，检查生成的 UI 是否正确使用 Token-Component 映射
 * @module lib/design-system/token-compliance-validator
 * @requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import type { UISchema, UIComponent } from '../../types';
import type { DesignTokens } from './design-tokens';
import { getDefaultDesignTokens } from './design-tokens';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Token 合规错误类型
 */
export type TokenComplianceErrorType = 
  | 'hardcoded-color' 
  | 'hardcoded-spacing' 
  | 'invalid-token-usage';

/**
 * Token 合规警告类型
 */
export type TokenComplianceWarningType = 
  | 'suboptimal-token' 
  | 'missing-token-opportunity';

/**
 * Token 合规错误
 * @requirements 5.2, 5.3, 5.4
 */
export interface TokenComplianceError {
  /** 错误位置 (节点路径) */
  path: string;
  /** 错误类型 */
  type: TokenComplianceErrorType;
  /** 错误消息 */
  message: string;
  /** 建议的修复 */
  suggestion: string;
  /** 检测到的硬编码值 */
  detectedValue?: string;
}

/**
 * Token 合规警告
 * @requirements 5.5
 */
export interface TokenComplianceWarning {
  /** 警告位置 */
  path: string;
  /** 警告类型 */
  type: TokenComplianceWarningType;
  /** 警告消息 */
  message: string;
  /** 建议 */
  suggestion: string;
}


/**
 * Token 合规验证结果
 * @requirements 5.1, 5.6
 */
export interface TokenComplianceResult {
  /** 是否通过验证 */
  valid: boolean;
  /** Token 合规分数 (0-100) */
  complianceScore: number;
  /** 使用 Token 的值数量 */
  tokenizedValues: number;
  /** 硬编码的值数量 */
  hardcodedValues: number;
  /** 验证错误列表 */
  errors: TokenComplianceError[];
  /** 验证警告列表 */
  warnings: TokenComplianceWarning[];
}

/**
 * Token 合规验证配置
 */
export interface TokenComplianceConfig {
  /** 设计令牌 */
  designTokens?: DesignTokens;
  /** 是否检测硬编码颜色 */
  detectHardcodedColors?: boolean;
  /** 是否检测硬编码间距 */
  detectHardcodedSpacing?: boolean;
  /** 是否生成建议 */
  generateSuggestions?: boolean;
}

// ============================================================================
// 硬编码值检测正则表达式
// ============================================================================

/**
 * 硬编码颜色值正则表达式
 * 匹配: #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba(), hsl(), hsla()
 */
const HARDCODED_COLOR_PATTERNS = {
  /** Hex 颜色 (#RGB, #RRGGBB, #RRGGBBAA) */
  hex: /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
  /** RGB/RGBA 颜色 */
  rgb: /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)/gi,
  /** HSL/HSLA 颜色 */
  hsl: /hsla?\s*\(\s*\d+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(,\s*[\d.]+\s*)?\)/gi,
};

/**
 * 硬编码间距值正则表达式
 * 匹配: Npx, Nem, Nrem (在 className 中)
 */
const HARDCODED_SPACING_PATTERNS = {
  /** 像素值 (如 16px, 24px) - 在 style 属性中 */
  px: /:\s*(\d+)px\b/g,
  /** 内联样式中的像素值 */
  inlineStylePx: /(\d+)px/g,
};

// ============================================================================
// Tailwind Token 映射
// ============================================================================

/**
 * 像素值到 Tailwind 类的映射
 */
const PX_TO_TAILWIND: Record<number, string> = {
  0: '0',
  4: '1',
  8: '2',
  16: '4',
  24: '6',
  32: '8',
  48: '12',
  64: '16',
};

/**
 * Tailwind 颜色类前缀
 */
const TAILWIND_COLOR_PREFIXES = [
  'bg-', 'text-', 'border-', 'ring-', 'fill-', 'stroke-',
  'from-', 'via-', 'to-', 'placeholder-', 'divide-',
];

/**
 * Tailwind 间距类前缀
 */
const TAILWIND_SPACING_PREFIXES = [
  'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-',
  'm-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-',
  'gap-', 'gap-x-', 'gap-y-',
  'space-x-', 'space-y-',
  'w-', 'h-', 'min-w-', 'min-h-', 'max-w-', 'max-h-',
];


// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 检查字符串是否包含硬编码颜色值
 * @param value 要检查的字符串
 * @returns 检测到的硬编码颜色值数组
 */
export function detectHardcodedColors(value: string): string[] {
  const detected: string[] = [];
  
  // 检测 Hex 颜色
  const hexMatches = value.match(HARDCODED_COLOR_PATTERNS.hex);
  if (hexMatches) {
    detected.push(...hexMatches);
  }
  
  // 检测 RGB/RGBA 颜色
  const rgbMatches = value.match(HARDCODED_COLOR_PATTERNS.rgb);
  if (rgbMatches) {
    detected.push(...rgbMatches);
  }
  
  // 检测 HSL/HSLA 颜色
  const hslMatches = value.match(HARDCODED_COLOR_PATTERNS.hsl);
  if (hslMatches) {
    detected.push(...hslMatches);
  }
  
  return detected;
}

/**
 * 检查字符串是否包含硬编码间距值
 * @param value 要检查的字符串
 * @returns 检测到的硬编码间距值数组
 */
export function detectHardcodedSpacing(value: string): string[] {
  const detected: string[] = [];
  
  // 检测像素值
  const pxMatches = value.match(HARDCODED_SPACING_PATTERNS.inlineStylePx);
  if (pxMatches) {
    detected.push(...pxMatches);
  }
  
  return detected;
}

/**
 * 检查 className 是否使用了 Tailwind Token 类
 * @param className CSS 类名字符串
 * @returns 是否使用了 Token 类
 */
export function usesTokenizedClasses(className: string): boolean {
  const classes = className.split(/\s+/);
  
  for (const cls of classes) {
    // 检查是否使用了 Tailwind 颜色类
    for (const prefix of TAILWIND_COLOR_PREFIXES) {
      if (cls.startsWith(prefix)) {
        return true;
      }
    }
    
    // 检查是否使用了 Tailwind 间距类
    for (const prefix of TAILWIND_SPACING_PREFIXES) {
      if (cls.startsWith(prefix)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * 统计 className 中的 Token 化值和硬编码值
 * @param className CSS 类名字符串
 * @returns { tokenized: number, hardcoded: number }
 */
export function countTokenUsage(className: string): { tokenized: number; hardcoded: number } {
  const classes = className.split(/\s+/).filter(c => c.length > 0);
  let tokenized = 0;
  let hardcoded = 0;
  
  for (const cls of classes) {
    let isTokenized = false;
    
    // 检查是否使用了 Tailwind 颜色类
    for (const prefix of TAILWIND_COLOR_PREFIXES) {
      if (cls.startsWith(prefix)) {
        isTokenized = true;
        break;
      }
    }
    
    // 检查是否使用了 Tailwind 间距类
    if (!isTokenized) {
      for (const prefix of TAILWIND_SPACING_PREFIXES) {
        if (cls.startsWith(prefix)) {
          isTokenized = true;
          break;
        }
      }
    }
    
    if (isTokenized) {
      tokenized++;
    }
  }
  
  // 检测硬编码值
  const hardcodedColors = detectHardcodedColors(className);
  const hardcodedSpacing = detectHardcodedSpacing(className);
  hardcoded = hardcodedColors.length + hardcodedSpacing.length;
  
  return { tokenized, hardcoded };
}

/**
 * 为硬编码颜色值生成 Token 替换建议
 * @param colorValue 硬编码颜色值
 * @param tokens 设计令牌
 * @returns 建议字符串
 */
export function suggestColorReplacement(colorValue: string, tokens: DesignTokens): string {
  const normalizedColor = colorValue.toLowerCase();
  
  // 尝试在 tokens 中找到匹配的颜色
  const colorNames = Object.keys(tokens.colors) as (keyof typeof tokens.colors)[];
  
  for (const colorName of colorNames) {
    const scale = tokens.colors[colorName];
    for (const [shade, value] of Object.entries(scale)) {
      if (value.toLowerCase() === normalizedColor) {
        return `Use 'bg-${colorName}-${shade}' or 'text-${colorName}-${shade}' instead of '${colorValue}'`;
      }
    }
  }
  
  // 如果没有精确匹配，提供通用建议
  return `Use a Design Token color class (e.g., 'bg-primary-500', 'text-neutral-700') instead of '${colorValue}'`;
}

/**
 * 为硬编码间距值生成 Token 替换建议
 * @param spacingValue 硬编码间距值 (如 "16px")
 * @returns 建议字符串
 */
export function suggestSpacingReplacement(spacingValue: string): string {
  // 提取数字
  const match = spacingValue.match(/(\d+)/);
  if (!match) {
    return `Use a Tailwind spacing class (e.g., 'p-4', 'gap-2') instead of '${spacingValue}'`;
  }
  
  const pxValue = parseInt(match[1], 10);
  const tailwindValue = PX_TO_TAILWIND[pxValue];
  
  if (tailwindValue) {
    return `Use 'gap-${tailwindValue}' or 'p-${tailwindValue}' instead of '${spacingValue}'`;
  }
  
  // 找到最接近的值
  const pxValues = Object.keys(PX_TO_TAILWIND).map(Number).sort((a, b) => a - b);
  let closest = pxValues[0];
  let minDiff = Math.abs(pxValue - closest);
  
  for (const px of pxValues) {
    const diff = Math.abs(pxValue - px);
    if (diff < minDiff) {
      minDiff = diff;
      closest = px;
    }
  }
  
  const closestTailwind = PX_TO_TAILWIND[closest];
  return `Use 'gap-${closestTailwind}' or 'p-${closestTailwind}' (${closest}px) instead of '${spacingValue}'`;
}

/**
 * 计算合规分数
 * @param tokenizedValues Token 化值数量
 * @param hardcodedValues 硬编码值数量
 * @returns 合规分数 (0-100)
 * @requirements 5.6
 */
export function calculateComplianceScore(tokenizedValues: number, hardcodedValues: number): number {
  const total = tokenizedValues + hardcodedValues;
  if (total === 0) {
    return 100; // 没有值时认为完全合规
  }
  return Math.round((tokenizedValues / total) * 100);
}


// ============================================================================
// 递归验证函数
// ============================================================================

/**
 * 递归验证组件的 Token 合规性
 * @param component UI 组件
 * @param path 当前路径
 * @param config 验证配置
 * @param result 验证结果 (会被修改)
 */
function validateComponentCompliance(
  component: UIComponent,
  path: string,
  config: TokenComplianceConfig,
  result: TokenComplianceResult
): void {
  const tokens = config.designTokens ?? getDefaultDesignTokens();
  const detectColors = config.detectHardcodedColors ?? true;
  const detectSpacing = config.detectHardcodedSpacing ?? true;
  const generateSuggestions = config.generateSuggestions ?? true;
  
  // 检查 props.className
  if (component.props && typeof component.props.className === 'string') {
    const className = component.props.className;
    const propPath = `${path}.props.className`;
    
    // 统计 Token 使用
    const usage = countTokenUsage(className);
    result.tokenizedValues += usage.tokenized;
    result.hardcodedValues += usage.hardcoded;
    
    // 检测硬编码颜色
    if (detectColors) {
      const hardcodedColors = detectHardcodedColors(className);
      for (const color of hardcodedColors) {
        const suggestion = generateSuggestions 
          ? suggestColorReplacement(color, tokens)
          : 'Use a Design Token color instead';
        
        result.errors.push({
          path: propPath,
          type: 'hardcoded-color',
          message: `Hardcoded color value "${color}" found in className`,
          suggestion,
          detectedValue: color,
        });
      }
    }
    
    // 检测硬编码间距
    if (detectSpacing) {
      const hardcodedSpacing = detectHardcodedSpacing(className);
      for (const spacing of hardcodedSpacing) {
        const suggestion = generateSuggestions
          ? suggestSpacingReplacement(spacing)
          : 'Use a Tailwind spacing class instead';
        
        result.errors.push({
          path: propPath,
          type: 'hardcoded-spacing',
          message: `Hardcoded spacing value "${spacing}" found in className`,
          suggestion,
          detectedValue: spacing,
        });
      }
    }
  }
  
  // 检查 style 属性
  if (component.style) {
    const stylePath = `${path}.style`;
    
    // 检查颜色相关的 style 属性
    const colorStyleProps = ['color', 'backgroundColor', 'borderColor', 'background'];
    for (const prop of colorStyleProps) {
      const value = component.style[prop as keyof typeof component.style];
      if (typeof value === 'string' && detectColors) {
        const hardcodedColors = detectHardcodedColors(value);
        for (const color of hardcodedColors) {
          result.hardcodedValues++;
          const suggestion = generateSuggestions
            ? suggestColorReplacement(color, tokens)
            : 'Use a Design Token color instead';
          
          result.errors.push({
            path: `${stylePath}.${prop}`,
            type: 'hardcoded-color',
            message: `Hardcoded color value "${color}" found in style.${prop}`,
            suggestion,
            detectedValue: color,
          });
        }
      }
    }
    
    // 检查间距相关的 style 属性
    const spacingStyleProps = ['padding', 'margin', 'gap', 'width', 'height'];
    for (const prop of spacingStyleProps) {
      const value = component.style[prop as keyof typeof component.style];
      if (typeof value === 'string' && detectSpacing) {
        const hardcodedSpacing = detectHardcodedSpacing(value);
        for (const spacing of hardcodedSpacing) {
          result.hardcodedValues++;
          const suggestion = generateSuggestions
            ? suggestSpacingReplacement(spacing)
            : 'Use a Tailwind spacing class instead';
          
          result.errors.push({
            path: `${stylePath}.${prop}`,
            type: 'hardcoded-spacing',
            message: `Hardcoded spacing value "${spacing}" found in style.${prop}`,
            suggestion,
            detectedValue: spacing,
          });
        }
      }
    }
  }
  
  // 递归检查子组件
  if (component.children && Array.isArray(component.children)) {
    component.children.forEach((child, index) => {
      validateComponentCompliance(child, `${path}.children[${index}]`, config, result);
    });
  }
}


// ============================================================================
// 主要导出函数
// ============================================================================

/**
 * 验证 UISchema 的 Token 合规性
 * 
 * 检查生成的 UI 是否正确使用 Design Tokens，而不是硬编码值。
 * 
 * @param schema UISchema 对象
 * @param config 验证配置
 * @returns Token 合规验证结果
 * 
 * @example
 * ```typescript
 * const result = validateTokenCompliance(schema);
 * if (!result.valid) {
 *   console.log('Token compliance errors:', result.errors);
 *   console.log('Compliance score:', result.complianceScore);
 * }
 * ```
 * 
 * @requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export function validateTokenCompliance(
  schema: UISchema,
  config?: TokenComplianceConfig
): TokenComplianceResult {
  const result: TokenComplianceResult = {
    valid: true,
    complianceScore: 100,
    tokenizedValues: 0,
    hardcodedValues: 0,
    errors: [],
    warnings: [],
  };
  
  const effectiveConfig: TokenComplianceConfig = {
    designTokens: config?.designTokens ?? getDefaultDesignTokens(),
    detectHardcodedColors: config?.detectHardcodedColors ?? true,
    detectHardcodedSpacing: config?.detectHardcodedSpacing ?? true,
    generateSuggestions: config?.generateSuggestions ?? true,
  };
  
  // 验证 root 组件
  if (schema.root) {
    validateComponentCompliance(schema.root, 'root', effectiveConfig, result);
  }
  
  // 计算合规分数
  result.complianceScore = calculateComplianceScore(
    result.tokenizedValues,
    result.hardcodedValues
  );
  
  // 如果有错误，标记为无效
  result.valid = result.errors.length === 0;
  
  return result;
}

/**
 * 格式化 Token 合规错误为 LLM 可读格式
 * 
 * @param result Token 合规验证结果
 * @returns LLM 可读的格式化字符串
 */
export function formatComplianceErrorsForLLM(result: TokenComplianceResult): string {
  if (result.errors.length === 0 && result.warnings.length === 0) {
    return '';
  }
  
  const lines: string[] = [
    '## Token Compliance Issues',
    '',
    `Compliance Score: ${result.complianceScore}% (${result.tokenizedValues} tokenized, ${result.hardcodedValues} hardcoded)`,
    '',
  ];
  
  if (result.errors.length > 0) {
    lines.push('### Errors (MUST FIX)');
    result.errors.forEach((error, index) => {
      lines.push(`${index + 1}. [${error.type}] at "${error.path}": ${error.message}`);
      lines.push(`   Suggestion: ${error.suggestion}`);
    });
    lines.push('');
  }
  
  if (result.warnings.length > 0) {
    lines.push('### Warnings');
    result.warnings.forEach((warning, index) => {
      lines.push(`${index + 1}. [${warning.type}] at "${warning.path}": ${warning.message}`);
      lines.push(`   Suggestion: ${warning.suggestion}`);
    });
  }
  
  return lines.join('\n');
}
