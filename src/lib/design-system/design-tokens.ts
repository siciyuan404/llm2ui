/**
 * @file design-tokens.ts
 * @description Design Tokens 模块，定义全局样式变量的标准化配置
 * @module lib/design-system/design-tokens
 * @requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.1, 7.2
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 屏幕尺寸类型
 */
export type ScreenSize = 'desktop' | 'tablet' | 'mobile';

/**
 * 屏幕断点配置
 */
export interface Breakpoints {
  /** 移动端断点 (< 768px) */
  mobile: number;
  /** 平板断点 (768-1023px) */
  tablet: number;
  /** 桌面断点 (>= 1024px) */
  desktop: number;
}

/**
 * 颜色刻度 (50-950)
 */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // 主色
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/**
 * 颜色令牌 - 语义化颜色定义
 */
export interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
}

/**
 * 间距令牌
 */
export interface SpacingTokens {
  xs: string;     // 4px
  sm: string;     // 8px
  md: string;     // 16px
  lg: string;     // 24px
  xl: string;     // 32px
  '2xl': string;  // 48px
  '3xl': string;  // 64px
}


/**
 * 字体令牌
 */
export interface TypographyTokens {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: string;     // 12px
    sm: string;     // 14px
    base: string;   // 16px
    lg: string;     // 18px
    xl: string;     // 20px
    '2xl': string;  // 24px
    '3xl': string;  // 30px
    '4xl': string;  // 36px
  };
  fontWeight: {
    normal: number;    // 400
    medium: number;    // 500
    semibold: number;  // 600
    bold: number;      // 700
  };
  lineHeight: {
    tight: string;    // 1.25
    normal: string;   // 1.5
    relaxed: string;  // 1.75
  };
}

/**
 * 阴影令牌
 */
export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * 圆角令牌
 */
export interface RadiusTokens {
  none: string;   // 0
  sm: string;     // 4px
  md: string;     // 8px
  lg: string;     // 12px
  xl: string;     // 16px
  full: string;   // 9999px
}

/**
 * 完整的设计令牌配置
 */
export interface DesignTokens {
  breakpoints: Breakpoints;
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  radius: RadiusTokens;
}

// ============================================================================
// 默认值
// ============================================================================


/**
 * 默认设计令牌配置
 * 基于 Tailwind CSS 默认主题
 */
const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  typography: {
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
};


// ============================================================================
// 公共函数
// ============================================================================

/**
 * 获取默认设计令牌
 * @returns 默认的设计令牌配置
 */
export function getDefaultDesignTokens(): DesignTokens {
  return structuredClone(DEFAULT_DESIGN_TOKENS);
}

/**
 * 格式化颜色令牌为 LLM 可读格式
 */
function formatColorsForLLM(colors: ColorTokens): string {
  const colorNames = Object.keys(colors) as (keyof ColorTokens)[];
  return colorNames
    .map(name => `  ${name}: ${colors[name][500]} (主色)`)
    .join('\n');
}

/**
 * 格式化间距令牌为 LLM 可读格式
 */
function formatSpacingForLLM(spacing: SpacingTokens): string {
  const spacingEntries = Object.entries(spacing);
  return spacingEntries
    .map(([key, value]) => `  ${key}=${value}`)
    .join(', ');
}

/**
 * 格式化字体令牌为 LLM 可读格式
 */
function formatTypographyForLLM(typography: TypographyTokens): string {
  const fontSizes = Object.entries(typography.fontSize)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
  const fontWeights = Object.entries(typography.fontWeight)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
  return `  Font Sizes: ${fontSizes}\n  Font Weights: ${fontWeights}`;
}

/**
 * 格式化阴影令牌为 LLM 可读格式
 */
function formatShadowsForLLM(shadows: ShadowTokens): string {
  return Object.entries(shadows)
    .map(([key, value]) => `  ${key}: ${value}`)
    .join('\n');
}

/**
 * 格式化圆角令牌为 LLM 可读格式
 */
function formatRadiusForLLM(radius: RadiusTokens): string {
  return Object.entries(radius)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
}

/**
 * 格式化令牌为 LLM 可读格式
 * 
 * 生成格式：
 * ```
 * ## Design Tokens (MUST USE)
 * 
 * ### Colors (use semantic names)
 *   primary: #3b82f6 (主色)
 *   secondary: #8b5cf6 (主色)
 *   ...
 * 
 * ### Spacing
 *   xs=4px, sm=8px, md=16px, lg=24px, xl=32px, 2xl=48px, 3xl=64px
 * 
 * ### Typography
 *   Font Sizes: xs=12px, sm=14px, base=16px, ...
 *   Font Weights: normal=400, medium=500, semibold=600, bold=700
 * 
 * ### Shadows
 *   sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
 *   ...
 * 
 * ### Border Radius
 *   none=0, sm=4px, md=8px, lg=12px, xl=16px, full=9999px
 * 
 * ### Breakpoints
 *   mobile: <768px, tablet: 768-1023px, desktop: >=1024px
 * ```
 * 
 * @param tokens 设计令牌配置
 * @returns LLM 可读的格式化字符串
 */
export function formatTokensForLLM(tokens: DesignTokens): string {
  const sections: string[] = [
    '## Design Tokens (MUST USE)',
    '',
    '### Colors (use semantic names)',
    formatColorsForLLM(tokens.colors),
    '',
    '### Spacing',
    `  ${formatSpacingForLLM(tokens.spacing)}`,
    '',
    '### Typography',
    formatTypographyForLLM(tokens.typography),
    '',
    '### Shadows',
    formatShadowsForLLM(tokens.shadows),
    '',
    '### Border Radius',
    `  ${formatRadiusForLLM(tokens.radius)}`,
    '',
    '### Breakpoints',
    `  mobile: <${tokens.breakpoints.mobile}px, tablet: ${tokens.breakpoints.mobile}-${tokens.breakpoints.tablet - 1}px, desktop: >=${tokens.breakpoints.tablet}px`,
    '',
    '**Instructions**: Use Design Tokens instead of hardcoded values. Reference colors by semantic name (e.g., "primary", "error"), spacing by size (e.g., "md", "lg"), etc.',
  ];

  return sections.join('\n');
}

/**
 * 获取所有颜色令牌名称
 * @param tokens 设计令牌配置
 * @returns 颜色令牌名称数组
 */
export function getColorTokenNames(tokens: DesignTokens): string[] {
  return Object.keys(tokens.colors);
}

/**
 * 获取所有间距令牌名称
 * @param tokens 设计令牌配置
 * @returns 间距令牌名称数组
 */
export function getSpacingTokenNames(tokens: DesignTokens): string[] {
  return Object.keys(tokens.spacing);
}

/**
 * 验证颜色值是否为有效的 Design Token
 * @param value 颜色值
 * @param tokens 设计令牌配置
 * @returns 是否为有效的 Design Token 颜色
 */
export function isValidColorToken(value: string, tokens: DesignTokens): boolean {
  const colorNames = Object.keys(tokens.colors) as (keyof ColorTokens)[];
  for (const colorName of colorNames) {
    const scale = tokens.colors[colorName];
    const scaleValues = Object.values(scale);
    if (scaleValues.includes(value)) {
      return true;
    }
  }
  return false;
}

/**
 * 根据硬编码颜色值建议 Design Token 替代
 * @param hardcodedColor 硬编码的颜色值
 * @param tokens 设计令牌配置
 * @returns 建议的 Design Token 名称，如果没有匹配则返回 null
 */
export function suggestColorToken(
  hardcodedColor: string,
  tokens: DesignTokens
): string | null {
  const normalizedColor = hardcodedColor.toLowerCase();
  const colorNames = Object.keys(tokens.colors) as (keyof ColorTokens)[];
  
  for (const colorName of colorNames) {
    const scale = tokens.colors[colorName];
    const scaleEntries = Object.entries(scale);
    for (const [shade, value] of scaleEntries) {
      if (value.toLowerCase() === normalizedColor) {
        return `colors.${colorName}.${shade}`;
      }
    }
  }
  
  return null;
}


// ============================================================================
// 简化主题令牌类型（用于向后兼容）
// ============================================================================

/**
 * 简化的颜色令牌（用于主题系统）
 * 与 ColorTokens 不同，这里使用简单的字符串值而非 ColorScale
 */
export interface SimpleColorTokens {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
  destructive?: string;
  destructiveForeground?: string;
  [key: string]: string | undefined;
}

/**
 * 令牌类别接口（用于扩展）
 */
export interface TokenCategory {
  name: string;
  description: string;
  values: Record<string, string | number>;
}

/**
 * 简化的主题令牌配置（用于主题系统）
 * 
 * @deprecated 建议使用 DesignTokens 类型，它提供更完整的颜色刻度支持
 */
export interface SimpleThemeTokens {
  colors: SimpleColorTokens;
  spacing: SpacingTokens;
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
      [key: string]: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      [key: string]: string;
    };
    fontWeight: {
      normal: string | number;
      medium: string | number;
      semibold: string | number;
      bold: string | number;
      [key: string]: string | number;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
      [key: string]: string;
    };
  };
  shadows: ShadowTokens;
  radius: RadiusTokens;
  extensions?: Record<string, TokenCategory>;
}

/**
 * 格式化简化主题令牌为 LLM 可读格式
 * @param tokens 简化主题令牌配置
 * @returns LLM 可读的格式化字符串
 */
export function formatSimpleThemeTokensForLLM(tokens: SimpleThemeTokens): string {
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

/**
 * 将 SimpleThemeTokens 转换为 DesignTokens 格式
 * 注意：这是一个简化转换，可能会丢失一些信息
 * 
 * @param themeTokens 简化主题令牌
 * @returns 设计令牌配置
 */
export function simpleThemeTokensToDesignTokens(themeTokens: SimpleThemeTokens): DesignTokens {
  const defaultTokens = getDefaultDesignTokens();
  
  return {
    breakpoints: defaultTokens.breakpoints,
    colors: {
      primary: createColorScaleFromSingle(themeTokens.colors.primary || '#3b82f6'),
      secondary: createColorScaleFromSingle(themeTokens.colors.secondary || '#8b5cf6'),
      neutral: createColorScaleFromSingle(themeTokens.colors.muted || '#71717a'),
      success: defaultTokens.colors.success,
      warning: defaultTokens.colors.warning,
      error: createColorScaleFromSingle(themeTokens.colors.destructive || '#ef4444'),
    },
    spacing: {
      xs: themeTokens.spacing.xs,
      sm: themeTokens.spacing.sm,
      md: themeTokens.spacing.md,
      lg: themeTokens.spacing.lg,
      xl: themeTokens.spacing.xl,
      '2xl': themeTokens.spacing['2xl'],
      '3xl': defaultTokens.spacing['3xl'],
    },
    typography: {
      fontFamily: {
        sans: themeTokens.typography.fontFamily.sans,
        serif: defaultTokens.typography.fontFamily.serif,
        mono: themeTokens.typography.fontFamily.mono,
      },
      fontSize: {
        xs: themeTokens.typography.fontSize.xs,
        sm: themeTokens.typography.fontSize.sm,
        base: themeTokens.typography.fontSize.base,
        lg: themeTokens.typography.fontSize.lg,
        xl: themeTokens.typography.fontSize.xl,
        '2xl': themeTokens.typography.fontSize['2xl'],
        '3xl': themeTokens.typography.fontSize['3xl'],
        '4xl': defaultTokens.typography.fontSize['4xl'],
      },
      fontWeight: {
        normal: Number(themeTokens.typography.fontWeight.normal),
        medium: Number(themeTokens.typography.fontWeight.medium),
        semibold: Number(themeTokens.typography.fontWeight.semibold),
        bold: Number(themeTokens.typography.fontWeight.bold),
      },
      lineHeight: {
        tight: themeTokens.typography.lineHeight.tight,
        normal: themeTokens.typography.lineHeight.normal,
        relaxed: themeTokens.typography.lineHeight.relaxed,
      },
    },
    shadows: {
      sm: themeTokens.shadows.sm,
      md: themeTokens.shadows.md,
      lg: themeTokens.shadows.lg,
      xl: themeTokens.shadows.xl,
    },
    radius: {
      none: themeTokens.radius.none,
      sm: themeTokens.radius.sm,
      md: themeTokens.radius.md,
      lg: themeTokens.radius.lg,
      xl: themeTokens.radius.xl,
      full: themeTokens.radius.full,
    },
  };
}

/**
 * 从单个颜色值创建颜色刻度
 * 这是一个简化实现，实际应用中可能需要更复杂的颜色计算
 */
function createColorScaleFromSingle(baseColor: string): ColorScale {
  // 简化实现：使用基础颜色作为 500，其他刻度使用默认值
  const defaultTokens = getDefaultDesignTokens();
  return {
    ...defaultTokens.colors.primary,
    500: baseColor,
  };
}
