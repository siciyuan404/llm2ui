/**
 * @file serialize-theme.ts
 * @description 主题序列化工具 - 导入导出主题包
 * @module lib/themes/utils
 */

import type { ThemePack, SerializedThemePack } from '../types';
import { ThemeError, ThemeErrorCode } from '../types';
import { validateThemePack } from '../theme-validator';
import { ComponentRegistry } from '../../core/component-registry';

/**
 * 导出主题包为 JSON 字符串
 * 注意：组件注册表不会被序列化，需要在导入时重新注册
 * 
 * @param theme 主题包
 * @returns JSON 字符串
 */
export function exportTheme(theme: ThemePack): string {
  const serialized: SerializedThemePack = {
    id: theme.id,
    name: theme.name,
    description: theme.description,
    version: theme.version,
    author: theme.author,
    repository: theme.repository,
    homepage: theme.homepage,
    previewImage: theme.previewImage,
    tokens: theme.tokens,
    examples: theme.examples,
    prompts: theme.prompts,
    validation: theme.validation,
    colorSchemes: theme.colorSchemes,
    layouts: theme.layouts,
    extensions: theme.extensions,
  };

  try {
    return JSON.stringify(serialized, null, 2);
  } catch (error) {
    throw new ThemeError(
      ThemeErrorCode.EXPORT_FAILED,
      `Failed to export theme "${theme.id}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      { themeId: theme.id, error }
    );
  }
}

/**
 * 从 JSON 字符串导入主题包
 * 注意：导入的主题包会有一个空的组件注册表，需要手动注册组件
 * 
 * @param json JSON 字符串
 * @returns 主题包
 * @throws ThemeError 如果 JSON 无效或主题包结构无效
 */
export function importTheme(json: string): ThemePack {
  let parsed: unknown;
  
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new ThemeError(
      ThemeErrorCode.IMPORT_FAILED,
      `Failed to parse theme JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
      { error }
    );
  }

  // 添加空的组件注册表
  const themeWithComponents = {
    ...parsed as object,
    components: {
      registry: new ComponentRegistry(),
    },
  };

  // 验证主题包结构
  const validation = validateThemePack(themeWithComponents);
  if (!validation.valid) {
    throw new ThemeError(
      ThemeErrorCode.IMPORT_FAILED,
      `Invalid theme pack structure: ${validation.errors.join('; ')}`,
      { errors: validation.errors, warnings: validation.warnings }
    );
  }

  return themeWithComponents as ThemePack;
}

/**
 * 克隆主题包（深拷贝，但组件注册表是新实例）
 * 
 * @param theme 原主题包
 * @param newId 可选的新 ID
 * @returns 克隆的主题包
 */
export function cloneTheme(theme: ThemePack, newId?: string): ThemePack {
  const json = exportTheme(theme);
  const cloned = importTheme(json);
  
  if (newId) {
    cloned.id = newId;
    cloned.name = `${theme.name} (Copy)`;
  }
  
  return cloned;
}

/**
 * 合并两个主题包
 * base 的值会被 override 覆盖
 * 
 * @param base 基础主题包
 * @param override 覆盖主题包
 * @returns 合并后的主题包
 */
export function mergeThemes(base: ThemePack, override: Partial<ThemePack>): ThemePack {
  return {
    ...base,
    ...override,
    tokens: {
      ...base.tokens,
      ...override.tokens,
      colors: { ...base.tokens.colors, ...override.tokens?.colors },
      spacing: { ...base.tokens.spacing, ...override.tokens?.spacing },
      typography: {
        ...base.tokens.typography,
        ...override.tokens?.typography,
        fontFamily: { ...base.tokens.typography.fontFamily, ...override.tokens?.typography?.fontFamily },
        fontSize: { ...base.tokens.typography.fontSize, ...override.tokens?.typography?.fontSize },
        fontWeight: { ...base.tokens.typography.fontWeight, ...override.tokens?.typography?.fontWeight },
        lineHeight: { ...base.tokens.typography.lineHeight, ...override.tokens?.typography?.lineHeight },
      },
      shadows: { ...base.tokens.shadows, ...override.tokens?.shadows },
      radius: { ...base.tokens.radius, ...override.tokens?.radius },
    },
    colorSchemes: override.colorSchemes || base.colorSchemes,
    layouts: override.layouts || base.layouts,
    components: override.components || base.components,
    examples: override.examples || base.examples,
    prompts: override.prompts || base.prompts,
  };
}

/**
 * 验证导出的 JSON 是否可以被重新导入
 * 
 * @param json JSON 字符串
 * @returns 验证结果
 */
export function validateExportedJson(json: string): { valid: boolean; errors: string[] } {
  try {
    const theme = importTheme(json);
    const validation = validateThemePack(theme);
    return {
      valid: validation.valid,
      errors: validation.errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
