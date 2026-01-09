/**
 * @file css-variables.ts
 * @description CSS 变量应用工具 - 将主题配色方案应用到 DOM
 * @module lib/themes/utils
 * @requirements 11.4, 11.5
 */

import type { ColorScheme, ThemePack } from '../types';
import {
  applyCssVariables as applyVariables,
  clearCssVariables as clearVariables,
  getCommonCssVariableNames,
  getCurrentColorSchemeType as getSchemeType,
  watchSystemColorScheme as watchScheme,
  setColorSchemeType,
  type ApplyCssVariablesOptions as BaseApplyOptions,
} from '../../design-system/css-variables';

/**
 * CSS 变量应用选项
 */
export interface ApplyCssVariablesOptions extends BaseApplyOptions {}

/**
 * 将配色方案的 CSS 变量应用到 DOM
 * @param colorScheme 配色方案
 * @param options 应用选项
 */
export function applyCssVariables(
  colorScheme: ColorScheme,
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

  // 构建 CSS 变量映射
  const variables: Record<string, string> = {};

  // 应用 CSS 变量
  if (colorScheme.cssVariables) {
    Object.assign(variables, colorScheme.cssVariables);
  }

  // 应用颜色到基础变量（作为回退）
  const colorMappings: Record<string, string> = {
    '--background': colorScheme.colors.background,
    '--foreground': colorScheme.colors.foreground,
    '--primary': colorScheme.colors.primary,
    '--secondary': colorScheme.colors.secondary,
    '--accent': colorScheme.colors.accent,
    '--muted': colorScheme.colors.muted,
    '--border': colorScheme.colors.border,
  };

  for (const [key, value] of Object.entries(colorMappings)) {
    // 只在 cssVariables 中没有定义时才设置
    if (!colorScheme.cssVariables?.[key]) {
      variables[key] = value;
    }
  }

  // 使用统一的应用函数
  applyVariables(variables, { target, transition, transitionDuration });

  // 设置主题类型（light/dark）
  setColorSchemeType(colorScheme.type, target);
}

/**
 * 应用主题的默认配色方案
 * @param theme 主题包
 * @param schemeId 配色方案 ID，默认使用第一个
 * @param options 应用选项
 */
export function applyThemeColorScheme(
  theme: ThemePack,
  schemeId?: string,
  options?: ApplyCssVariablesOptions
): void {
  const colorScheme = schemeId
    ? theme.colorSchemes.find((s) => s.id === schemeId)
    : theme.colorSchemes[0];

  if (!colorScheme) {
    console.warn(`applyThemeColorScheme: Color scheme "${schemeId}" not found`);
    return;
  }

  applyCssVariables(colorScheme, options);
}

/**
 * 清除已应用的 CSS 变量
 * @param target 目标元素
 */
export function clearCssVariables(target?: HTMLElement): void {
  const el = target || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return;

  // 清除常见的 CSS 变量
  const variablesToClear = [
    ...getCommonCssVariableNames(),
    // Cherry 特有变量
    '--cherry-background', '--cherry-background-soft', '--cherry-primary',
    '--cherry-border', '--cherry-hover', '--cherry-active', '--cherry-text-2',
  ];

  clearVariables(variablesToClear, el);
  el.classList.remove('dark', 'light');
}

/**
 * 获取当前应用的配色方案类型
 */
export function getCurrentColorSchemeType(): 'light' | 'dark' | null {
  return getSchemeType();
}

/**
 * 监听系统配色方案变化
 * @param callback 回调函数
 * @returns 取消监听的函数
 */
export function watchSystemColorScheme(
  callback: (type: 'light' | 'dark') => void
): () => void {
  return watchScheme(callback);
}
