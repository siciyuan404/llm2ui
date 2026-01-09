/**
 * @file theme-validator.ts
 * @description 主题验证工具 - 验证 ThemePack 结构和创建工厂函数
 * @module lib/themes
 */

import type {
  ThemePack,
  ThemeTokens,
  ThemeComponents,
  ThemeExamples,
  ThemePrompts,
  ColorScheme,
  LayoutConfig,
} from './types';
import { ThemeError, ThemeErrorCode } from './types';

/**
 * 验证结果
 */
export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 验证颜色令牌
 */
function validateColorTokens(colors: unknown): string[] {
  const errors: string[] = [];
  const requiredFields = [
    'background', 'foreground', 'primary', 'primaryForeground',
    'secondary', 'secondaryForeground', 'accent', 'accentForeground',
    'muted', 'mutedForeground', 'border', 'ring'
  ];

  if (!colors || typeof colors !== 'object') {
    errors.push('tokens.colors must be an object');
    return errors;
  }

  const colorObj = colors as Record<string, unknown>;
  for (const field of requiredFields) {
    if (typeof colorObj[field] !== 'string') {
      errors.push(`tokens.colors.${field} must be a string`);
    }
  }

  return errors;
}

/**
 * 验证间距令牌
 */
function validateSpacingTokens(spacing: unknown): string[] {
  const errors: string[] = [];
  const requiredFields = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

  if (!spacing || typeof spacing !== 'object') {
    errors.push('tokens.spacing must be an object');
    return errors;
  }

  const spacingObj = spacing as Record<string, unknown>;
  for (const field of requiredFields) {
    if (typeof spacingObj[field] !== 'string') {
      errors.push(`tokens.spacing.${field} must be a string`);
    }
  }

  return errors;
}

/**
 * 验证字体令牌
 */
function validateTypographyTokens(typography: unknown): string[] {
  const errors: string[] = [];

  if (!typography || typeof typography !== 'object') {
    errors.push('tokens.typography must be an object');
    return errors;
  }

  const typo = typography as Record<string, unknown>;

  // fontFamily
  if (!typo.fontFamily || typeof typo.fontFamily !== 'object') {
    errors.push('tokens.typography.fontFamily must be an object');
  } else {
    const fontFamily = typo.fontFamily as Record<string, unknown>;
    if (typeof fontFamily.sans !== 'string') {
      errors.push('tokens.typography.fontFamily.sans must be a string');
    }
    if (typeof fontFamily.mono !== 'string') {
      errors.push('tokens.typography.fontFamily.mono must be a string');
    }
  }

  // fontSize
  if (!typo.fontSize || typeof typo.fontSize !== 'object') {
    errors.push('tokens.typography.fontSize must be an object');
  }

  // fontWeight
  if (!typo.fontWeight || typeof typo.fontWeight !== 'object') {
    errors.push('tokens.typography.fontWeight must be an object');
  }

  // lineHeight
  if (!typo.lineHeight || typeof typo.lineHeight !== 'object') {
    errors.push('tokens.typography.lineHeight must be an object');
  }

  return errors;
}


/**
 * 验证阴影令牌
 */
function validateShadowTokens(shadows: unknown): string[] {
  const errors: string[] = [];
  const requiredFields = ['sm', 'md', 'lg', 'xl'];

  if (!shadows || typeof shadows !== 'object') {
    errors.push('tokens.shadows must be an object');
    return errors;
  }

  const shadowObj = shadows as Record<string, unknown>;
  for (const field of requiredFields) {
    if (typeof shadowObj[field] !== 'string') {
      errors.push(`tokens.shadows.${field} must be a string`);
    }
  }

  return errors;
}

/**
 * 验证圆角令牌
 */
function validateRadiusTokens(radius: unknown): string[] {
  const errors: string[] = [];
  const requiredFields = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

  if (!radius || typeof radius !== 'object') {
    errors.push('tokens.radius must be an object');
    return errors;
  }

  const radiusObj = radius as Record<string, unknown>;
  for (const field of requiredFields) {
    if (typeof radiusObj[field] !== 'string') {
      errors.push(`tokens.radius.${field} must be a string`);
    }
  }

  return errors;
}

/**
 * 验证设计令牌
 */
function validateTokens(tokens: unknown): string[] {
  const errors: string[] = [];

  if (!tokens || typeof tokens !== 'object') {
    errors.push('tokens must be an object');
    return errors;
  }

  const tokensObj = tokens as Record<string, unknown>;

  errors.push(...validateColorTokens(tokensObj.colors));
  errors.push(...validateSpacingTokens(tokensObj.spacing));
  errors.push(...validateTypographyTokens(tokensObj.typography));
  errors.push(...validateShadowTokens(tokensObj.shadows));
  errors.push(...validateRadiusTokens(tokensObj.radius));

  return errors;
}

/**
 * 验证组件配置
 */
function validateComponents(components: unknown): string[] {
  const errors: string[] = [];

  if (!components || typeof components !== 'object') {
    errors.push('components must be an object');
    return errors;
  }

  const comp = components as Record<string, unknown>;
  if (!comp.registry) {
    errors.push('components.registry is required');
  }

  return errors;
}

/**
 * 验证案例配置
 */
function validateExamples(examples: unknown): string[] {
  const errors: string[] = [];

  if (!examples || typeof examples !== 'object') {
    errors.push('examples must be an object');
    return errors;
  }

  const ex = examples as Record<string, unknown>;
  if (!Array.isArray(ex.presets)) {
    errors.push('examples.presets must be an array');
  }

  return errors;
}

/**
 * 验证提示词模板
 */
function validatePromptTemplates(templates: unknown): string[] {
  const errors: string[] = [];
  const requiredFields = [
    'systemIntro', 'iconGuidelines', 'componentDocs',
    'positiveExamples', 'negativeExamples', 'closing'
  ];

  if (!templates || typeof templates !== 'object') {
    errors.push('prompts.templates must be an object');
    return errors;
  }

  const tmpl = templates as Record<string, unknown>;
  for (const field of requiredFields) {
    if (typeof tmpl[field] !== 'string') {
      errors.push(`prompts.templates.${field} must be a string`);
    }
  }

  return errors;
}

/**
 * 验证提示词配置
 */
function validatePrompts(prompts: unknown): string[] {
  const errors: string[] = [];

  if (!prompts || typeof prompts !== 'object') {
    errors.push('prompts must be an object');
    return errors;
  }

  const pr = prompts as Record<string, unknown>;
  if (!pr.templates || typeof pr.templates !== 'object') {
    errors.push('prompts.templates must be an object');
    return errors;
  }

  const templates = pr.templates as Record<string, unknown>;
  if (templates.zh) {
    errors.push(...validatePromptTemplates(templates.zh).map(e => e.replace('prompts.templates', 'prompts.templates.zh')));
  } else {
    errors.push('prompts.templates.zh is required');
  }

  if (templates.en) {
    errors.push(...validatePromptTemplates(templates.en).map(e => e.replace('prompts.templates', 'prompts.templates.en')));
  } else {
    errors.push('prompts.templates.en is required');
  }

  return errors;
}


/**
 * 验证配色方案
 */
function validateColorScheme(scheme: unknown, index: number): string[] {
  const errors: string[] = [];
  const prefix = `colorSchemes[${index}]`;

  if (!scheme || typeof scheme !== 'object') {
    errors.push(`${prefix} must be an object`);
    return errors;
  }

  const s = scheme as Record<string, unknown>;

  if (typeof s.id !== 'string' || s.id.length === 0) {
    errors.push(`${prefix}.id must be a non-empty string`);
  }

  if (typeof s.name !== 'string') {
    errors.push(`${prefix}.name must be a string`);
  }

  if (s.type !== 'light' && s.type !== 'dark') {
    errors.push(`${prefix}.type must be 'light' or 'dark'`);
  }

  if (!s.colors || typeof s.colors !== 'object') {
    errors.push(`${prefix}.colors must be an object`);
  } else {
    const colors = s.colors as Record<string, unknown>;
    const requiredColors = ['background', 'foreground', 'primary', 'secondary', 'accent', 'muted', 'border'];
    for (const color of requiredColors) {
      if (typeof colors[color] !== 'string') {
        errors.push(`${prefix}.colors.${color} must be a string`);
      }
    }
  }

  return errors;
}

/**
 * 验证布局配置
 */
function validateLayoutConfig(layout: unknown, index: number): string[] {
  const errors: string[] = [];
  const prefix = `layouts[${index}]`;

  if (!layout || typeof layout !== 'object') {
    errors.push(`${prefix} must be an object`);
    return errors;
  }

  const l = layout as Record<string, unknown>;

  if (typeof l.id !== 'string' || l.id.length === 0) {
    errors.push(`${prefix}.id must be a non-empty string`);
  }

  if (typeof l.name !== 'string') {
    errors.push(`${prefix}.name must be a string`);
  }

  if (typeof l.description !== 'string') {
    errors.push(`${prefix}.description must be a string`);
  }

  if (!l.config || typeof l.config !== 'object') {
    errors.push(`${prefix}.config must be an object`);
  } else {
    const config = l.config as Record<string, unknown>;
    if (!['left', 'right', 'none'].includes(config.sidebar as string)) {
      errors.push(`${prefix}.config.sidebar must be 'left', 'right', or 'none'`);
    }
    if (!['full', 'centered'].includes(config.mainContent as string)) {
      errors.push(`${prefix}.config.mainContent must be 'full' or 'centered'`);
    }
    if (!['right', 'bottom', 'none'].includes(config.previewPanel as string)) {
      errors.push(`${prefix}.config.previewPanel must be 'right', 'bottom', or 'none'`);
    }
  }

  return errors;
}

/**
 * 验证 ThemePack 结构
 * @param theme 要验证的主题包
 * @returns 验证结果
 */
export function validateThemePack(theme: unknown): ThemeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!theme || typeof theme !== 'object') {
    return {
      valid: false,
      errors: ['Theme pack must be an object'],
      warnings: [],
    };
  }

  const t = theme as Record<string, unknown>;

  // 验证基础字段
  if (typeof t.id !== 'string' || t.id.length === 0) {
    errors.push('id must be a non-empty string');
  } else if (!/^[a-z][a-z0-9-]*$/.test(t.id as string)) {
    errors.push('id must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens');
  }

  if (typeof t.name !== 'string' || t.name.length === 0) {
    errors.push('name must be a non-empty string');
  }

  if (typeof t.description !== 'string') {
    errors.push('description must be a string');
  }

  if (typeof t.version !== 'string') {
    errors.push('version must be a string');
  } else if (!/^\d+\.\d+\.\d+/.test(t.version as string)) {
    warnings.push('version should follow semver format (e.g., 1.0.0)');
  }

  // 验证可选元数据
  if (t.author !== undefined && typeof t.author !== 'string') {
    errors.push('author must be a string if provided');
  }

  if (t.repository !== undefined && typeof t.repository !== 'string') {
    errors.push('repository must be a string if provided');
  }

  if (t.homepage !== undefined && typeof t.homepage !== 'string') {
    errors.push('homepage must be a string if provided');
  }

  // 验证核心配置
  errors.push(...validateTokens(t.tokens));
  errors.push(...validateComponents(t.components));
  errors.push(...validateExamples(t.examples));
  errors.push(...validatePrompts(t.prompts));

  // 验证配色方案
  if (!Array.isArray(t.colorSchemes)) {
    errors.push('colorSchemes must be an array');
  } else if (t.colorSchemes.length === 0) {
    errors.push('colorSchemes must have at least one color scheme');
  } else {
    for (let i = 0; i < t.colorSchemes.length; i++) {
      errors.push(...validateColorScheme(t.colorSchemes[i], i));
    }
  }

  // 验证布局配置
  if (!Array.isArray(t.layouts)) {
    errors.push('layouts must be an array');
  } else if (t.layouts.length === 0) {
    errors.push('layouts must have at least one layout');
  } else {
    for (let i = 0; i < t.layouts.length; i++) {
      errors.push(...validateLayoutConfig(t.layouts[i], i));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}


/**
 * 创建 ThemePack 的输入类型
 */
export interface CreateThemePackInput {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  repository?: string;
  homepage?: string;
  previewImage?: string;
  tokens: ThemeTokens;
  components: ThemeComponents;
  examples: ThemeExamples;
  prompts: ThemePrompts;
  colorSchemes: ColorScheme[];
  layouts: LayoutConfig[];
  extensions?: Record<string, unknown>;
}

/**
 * 创建并验证 ThemePack
 * @param input 主题包输入
 * @returns 验证后的主题包
 * @throws ThemeError 如果验证失败
 */
export function createThemePack(input: CreateThemePackInput): ThemePack {
  const result = validateThemePack(input);

  if (!result.valid) {
    throw new ThemeError(
      ThemeErrorCode.INVALID_THEME_PACK,
      `Invalid theme pack: ${result.errors.join('; ')}`,
      { errors: result.errors, warnings: result.warnings }
    );
  }

  // 返回类型安全的 ThemePack
  return {
    id: input.id,
    name: input.name,
    description: input.description,
    version: input.version,
    author: input.author,
    repository: input.repository,
    homepage: input.homepage,
    previewImage: input.previewImage,
    tokens: input.tokens,
    components: input.components,
    examples: input.examples,
    prompts: input.prompts,
    colorSchemes: input.colorSchemes,
    layouts: input.layouts,
    extensions: input.extensions,
  };
}

/**
 * 检查对象是否是有效的 ThemePack
 */
export function isValidThemePack(theme: unknown): theme is ThemePack {
  return validateThemePack(theme).valid;
}
