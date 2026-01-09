/**
 * @file merge-tokens.ts
 * @description 令牌合并工具 - 合并基础令牌和扩展令牌
 * @module lib/themes/utils
 */

import type { ThemeTokens, TokenCategory } from '../types';

/**
 * 合并两个令牌对象
 * @param base 基础令牌
 * @param override 覆盖令牌
 * @returns 合并后的令牌
 */
export function mergeTokens(base: ThemeTokens, override: Partial<ThemeTokens>): ThemeTokens {
  const result: ThemeTokens = {
    colors: { ...base.colors, ...override.colors },
    spacing: { ...base.spacing, ...override.spacing },
    typography: {
      fontFamily: { ...base.typography.fontFamily, ...override.typography?.fontFamily },
      fontSize: { ...base.typography.fontSize, ...override.typography?.fontSize },
      fontWeight: { ...base.typography.fontWeight, ...override.typography?.fontWeight },
      lineHeight: { ...base.typography.lineHeight, ...override.typography?.lineHeight },
    },
    shadows: { ...base.shadows, ...override.shadows },
    radius: { ...base.radius, ...override.radius },
  };

  // 合并扩展令牌
  if (base.extensions || override.extensions) {
    result.extensions = {
      ...base.extensions,
      ...override.extensions,
    };
  }

  // 合并令牌 Schema
  if (base.tokenSchema || override.tokenSchema) {
    result.tokenSchema = override.tokenSchema || base.tokenSchema;
  }

  return result;
}

/**
 * 添加扩展令牌类别到现有令牌
 * @param tokens 现有令牌
 * @param category 要添加的令牌类别
 * @returns 更新后的令牌
 */
export function addTokenCategory(tokens: ThemeTokens, category: TokenCategory): ThemeTokens {
  return {
    ...tokens,
    extensions: {
      ...tokens.extensions,
      [category.name]: category,
    },
  };
}

/**
 * 移除扩展令牌类别
 * @param tokens 现有令牌
 * @param categoryName 要移除的类别名称
 * @returns 更新后的令牌
 */
export function removeTokenCategory(tokens: ThemeTokens, categoryName: string): ThemeTokens {
  if (!tokens.extensions) {
    return tokens;
  }

  const { [categoryName]: _, ...remainingExtensions } = tokens.extensions;
  
  return {
    ...tokens,
    extensions: Object.keys(remainingExtensions).length > 0 ? remainingExtensions : undefined,
  };
}

/**
 * 获取所有令牌类别名称（包括基础和扩展）
 * @param tokens 令牌对象
 * @returns 类别名称数组
 */
export function getTokenCategories(tokens: ThemeTokens): string[] {
  const baseCategories = ['colors', 'spacing', 'typography', 'shadows', 'radius'];
  const extensionCategories = tokens.extensions ? Object.keys(tokens.extensions) : [];
  return [...baseCategories, ...extensionCategories];
}

/**
 * 获取指定类别的令牌值
 * @param tokens 令牌对象
 * @param category 类别名称
 * @returns 令牌值对象，如果类别不存在则返回 undefined
 */
export function getTokensByCategory(
  tokens: ThemeTokens,
  category: string
): Record<string, string | number> | undefined {
  switch (category) {
    case 'colors':
      return tokens.colors as Record<string, string>;
    case 'spacing':
      return tokens.spacing;
    case 'typography':
      // 扁平化 typography
      return {
        ...Object.entries(tokens.typography.fontFamily).reduce(
          (acc, [k, v]) => ({ ...acc, [`fontFamily-${k}`]: v }),
          {}
        ),
        ...Object.entries(tokens.typography.fontSize).reduce(
          (acc, [k, v]) => ({ ...acc, [`fontSize-${k}`]: v }),
          {}
        ),
        ...Object.entries(tokens.typography.fontWeight).reduce(
          (acc, [k, v]) => ({ ...acc, [`fontWeight-${k}`]: v }),
          {}
        ),
        ...Object.entries(tokens.typography.lineHeight).reduce(
          (acc, [k, v]) => ({ ...acc, [`lineHeight-${k}`]: v }),
          {}
        ),
      };
    case 'shadows':
      return tokens.shadows;
    case 'radius':
      return tokens.radius;
    default:
      // 检查扩展类别
      return tokens.extensions?.[category]?.values;
  }
}

/**
 * 格式化令牌为 LLM 可读的字符串
 * @param tokens 令牌对象
 * @returns 格式化的字符串
 */
export function formatTokensForLLM(tokens: ThemeTokens): string {
  const sections: string[] = [];

  // 颜色令牌
  sections.push('## Colors');
  for (const [key, value] of Object.entries(tokens.colors)) {
    if (value) {
      sections.push(`- ${key}: ${value}`);
    }
  }

  // 间距令牌
  sections.push('\n## Spacing');
  for (const [key, value] of Object.entries(tokens.spacing)) {
    sections.push(`- ${key}: ${value}`);
  }

  // 字体令牌
  sections.push('\n## Typography');
  sections.push('### Font Family');
  for (const [key, value] of Object.entries(tokens.typography.fontFamily)) {
    sections.push(`- ${key}: ${value}`);
  }
  sections.push('### Font Size');
  for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
    sections.push(`- ${key}: ${value}`);
  }
  sections.push('### Font Weight');
  for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
    sections.push(`- ${key}: ${value}`);
  }
  sections.push('### Line Height');
  for (const [key, value] of Object.entries(tokens.typography.lineHeight)) {
    sections.push(`- ${key}: ${value}`);
  }

  // 阴影令牌
  sections.push('\n## Shadows');
  for (const [key, value] of Object.entries(tokens.shadows)) {
    sections.push(`- ${key}: ${value}`);
  }

  // 圆角令牌
  sections.push('\n## Border Radius');
  for (const [key, value] of Object.entries(tokens.radius)) {
    sections.push(`- ${key}: ${value}`);
  }

  // 扩展令牌
  if (tokens.extensions) {
    for (const [, category] of Object.entries(tokens.extensions)) {
      sections.push(`\n## ${category.name} (${category.description})`);
      for (const [key, value] of Object.entries(category.values)) {
        sections.push(`- ${key}: ${value}`);
      }
    }
  }

  return sections.join('\n');
}
