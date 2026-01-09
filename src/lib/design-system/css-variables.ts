/**
 * @file css-variables.ts
 * @description CSS 变量生成和应用工具 - 统一的 CSS 变量管理
 * @module lib/design-system/css-variables
 * @requirements 4.5
 */

import type { DesignTokens, SimpleThemeTokens } from './design-tokens';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * CSS 变量映射
 */
export type CssVariableMap = Record<string, string>;

/**
 * CSS 变量生成选项
 */
export interface CssVariableGenerationOptions {
  /** 变量前缀，默认为空 */
  prefix?: string;
  /** 是否包含颜色刻度，默认 true */
  includeColorScales?: boolean;
  /** 是否包含间距，默认 true */
  includeSpacing?: boolean;
  /** 是否包含字体，默认 true */
  includeTypography?: boolean;
  /** 是否包含阴影，默认 true */
  includeShadows?: boolean;
  /** 是否包含圆角，默认 true */
  includeRadius?: boolean;
}

/**
 * CSS 变量应用选项
 */
export interface ApplyCssVariablesOptions {
  /** 目标元素，默认为 document.documentElement */
  target?: HTMLElement;
  /** 是否添加过渡动画，默认 true */
  transition?: boolean;
  /** 过渡时长（毫秒），默认 150 */
  transitionDuration?: number;
}

// ============================================================================
// CSS 变量生成函数
// ============================================================================

/**
 * 从 DesignTokens 生成 CSS 变量映射
 * @param tokens 设计令牌
 * @param options 生成选项
 * @returns CSS 变量映射
 */
export function generateCssVariablesFromDesignTokens(
  tokens: DesignTokens,
  options: CssVariableGenerationOptions = {}
): CssVariableMap {
  const {
    prefix = '',
    includeColorScales = true,
    includeSpacing = true,
    includeTypography = true,
    includeShadows = true,
    includeRadius = true,
  } = options;

  const variables: CssVariableMap = {};
  const varPrefix = prefix ? `--${prefix}-` : '--';

  // 颜色刻度
  if (includeColorScales) {
    for (const [colorName, colorScale] of Object.entries(tokens.colors)) {
      for (const [shade, value] of Object.entries(colorScale as Record<string, string>)) {
        variables[`${varPrefix}color-${colorName}-${shade}`] = value;
      }
    }
  }

  // 间距
  if (includeSpacing) {
    for (const [key, value] of Object.entries(tokens.spacing)) {
      variables[`${varPrefix}spacing-${key}`] = value;
    }
  }

  // 字体
  if (includeTypography) {
    for (const [key, value] of Object.entries(tokens.typography.fontFamily)) {
      variables[`${varPrefix}font-family-${key}`] = value;
    }
    for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
      variables[`${varPrefix}font-size-${key}`] = value;
    }
    for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
      variables[`${varPrefix}font-weight-${key}`] = String(value);
    }
    for (const [key, value] of Object.entries(tokens.typography.lineHeight)) {
      variables[`${varPrefix}line-height-${key}`] = value;
    }
  }

  // 阴影
  if (includeShadows) {
    for (const [key, value] of Object.entries(tokens.shadows)) {
      variables[`${varPrefix}shadow-${key}`] = value;
    }
  }

  // 圆角
  if (includeRadius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      variables[`${varPrefix}radius-${key}`] = value;
    }
  }

  return variables;
}

/**
 * 从 SimpleThemeTokens 生成 CSS 变量映射
 * @param tokens 简化主题令牌
 * @param options 生成选项
 * @returns CSS 变量映射
 */
export function generateCssVariablesFromThemeTokens(
  tokens: SimpleThemeTokens,
  options: CssVariableGenerationOptions = {}
): CssVariableMap {
  const {
    prefix = '',
    includeSpacing = true,
    includeTypography = true,
    includeShadows = true,
    includeRadius = true,
  } = options;

  const variables: CssVariableMap = {};
  const varPrefix = prefix ? `--${prefix}-` : '--';

  // 颜色（简化版本，直接使用颜色值）
  for (const [key, value] of Object.entries(tokens.colors)) {
    if (value) {
      variables[`${varPrefix}${key}`] = value;
    }
  }

  // 间距
  if (includeSpacing) {
    for (const [key, value] of Object.entries(tokens.spacing)) {
      variables[`${varPrefix}spacing-${key}`] = value;
    }
  }

  // 字体
  if (includeTypography) {
    for (const [key, value] of Object.entries(tokens.typography.fontFamily)) {
      variables[`${varPrefix}font-family-${key}`] = value;
    }
    for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
      variables[`${varPrefix}font-size-${key}`] = value;
    }
    for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
      variables[`${varPrefix}font-weight-${key}`] = String(value);
    }
    for (const [key, value] of Object.entries(tokens.typography.lineHeight)) {
      variables[`${varPrefix}line-height-${key}`] = value;
    }
  }

  // 阴影
  if (includeShadows) {
    for (const [key, value] of Object.entries(tokens.shadows)) {
      variables[`${varPrefix}shadow-${key}`] = value;
    }
  }

  // 圆角
  if (includeRadius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      variables[`${varPrefix}radius-${key}`] = value;
    }
  }

  return variables;
}

/**
 * 将 CSS 变量映射转换为 CSS 字符串
 * @param variables CSS 变量映射
 * @param selector CSS 选择器，默认为 :root
 * @returns CSS 字符串
 */
export function cssVariablesToString(
  variables: CssVariableMap,
  selector: string = ':root'
): string {
  const entries = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  
  return `${selector} {\n${entries}\n}`;
}

// ============================================================================
// CSS 变量应用函数
// ============================================================================

/**
 * 将 CSS 变量应用到 DOM 元素
 * @param variables CSS 变量映射
 * @param options 应用选项
 */
export function applyCssVariables(
  variables: CssVariableMap,
  options: ApplyCssVariablesOptions = {}
): void {
  const {
    target = typeof document !== 'undefined' ? document.documentElement : null,
    transition = true,
    transitionDuration = 150,
  } = options;

  if (!target) {
    console.warn('applyCssVariables: No target element available');
    return;
  }

  // 添加过渡动画
  if (transition) {
    target.style.setProperty('--theme-transition', `${transitionDuration}ms`);
    target.style.transition = `background-color ${transitionDuration}ms, color ${transitionDuration}ms`;
  }

  // 应用 CSS 变量
  for (const [key, value] of Object.entries(variables)) {
    target.style.setProperty(key, value);
  }

  // 移除过渡动画（延迟执行）
  if (transition) {
    setTimeout(() => {
      target.style.transition = '';
    }, transitionDuration);
  }
}

/**
 * 清除已应用的 CSS 变量
 * @param variableNames 要清除的变量名列表
 * @param target 目标元素
 */
export function clearCssVariables(
  variableNames: string[],
  target?: HTMLElement
): void {
  const el = target || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return;

  for (const variable of variableNames) {
    el.style.removeProperty(variable);
  }
}

/**
 * 获取常见的 CSS 变量名列表（用于清除）
 */
export function getCommonCssVariableNames(): string[] {
  return [
    '--background', '--foreground', '--primary', '--primary-foreground',
    '--secondary', '--secondary-foreground', '--accent', '--accent-foreground',
    '--muted', '--muted-foreground', '--border', '--ring', '--radius',
    '--card', '--card-foreground', '--popover', '--popover-foreground',
    '--destructive', '--destructive-foreground',
  ];
}

// ============================================================================
// 配色方案工具
// ============================================================================

/**
 * 获取当前应用的配色方案类型
 */
export function getCurrentColorSchemeType(): 'light' | 'dark' | null {
  if (typeof document === 'undefined') return null;
  
  const root = document.documentElement;
  if (root.classList.contains('dark')) return 'dark';
  if (root.classList.contains('light')) return 'light';
  
  // 检查系统偏好
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return 'light';
}

/**
 * 设置配色方案类型
 * @param type 配色方案类型
 * @param target 目标元素
 */
export function setColorSchemeType(
  type: 'light' | 'dark',
  target?: HTMLElement
): void {
  const el = target || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return;

  if (type === 'dark') {
    el.classList.add('dark');
    el.classList.remove('light');
  } else {
    el.classList.add('light');
    el.classList.remove('dark');
  }
}

/**
 * 监听系统配色方案变化
 * @param callback 回调函数
 * @returns 取消监听的函数
 */
export function watchSystemColorScheme(
  callback: (type: 'light' | 'dark') => void
): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handler);
  
  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
}
