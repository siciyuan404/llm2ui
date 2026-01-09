/**
 * @file design-tokens.types.ts
 * @description 设计令牌类型定义，包括颜色、间距、排版等设计系统类型
 * @module types/design-tokens
 * @requirements 5.1, 5.4
 */

/**
 * 令牌分类类型
 */
export type TokenCategory = 
  | 'colors'
  | 'spacing'
  | 'typography'
  | 'shadows'
  | 'radius'
  | 'breakpoints';

/**
 * 颜色语义分类
 */
export type ColorSemanticCategory = 
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error';

/**
 * 颜色刻度键 (50-950)
 */
export type ColorScaleKey = 
  | '50' | '100' | '200' | '300' | '400' 
  | '500' | '600' | '700' | '800' | '900' | '950';

/**
 * 颜色令牌接口
 */
export interface ColorToken {
  /** 颜色值 (如 '#3b82f6') */
  value: string;
  /** 颜色描述 */
  description?: string;
  /** 语义分类 */
  category?: ColorSemanticCategory;
}

/**
 * 颜色刻度接口
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
 * 间距令牌接口
 */
export interface SpacingToken {
  /** 间距值 (如 '16px') */
  value: string;
  /** 间距描述 */
  description?: string;
}

/**
 * 间距令牌集合
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
 * 排版令牌接口
 */
export interface TypographyToken {
  /** 字体大小 */
  fontSize: string;
  /** 行高 */
  lineHeight: string;
  /** 字重 */
  fontWeight?: number;
  /** 字体族 */
  fontFamily?: string;
}

/**
 * 排版令牌集合
 */
export interface TypographyTokens {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

/**
 * 阴影令牌集合
 */
export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * 圆角令牌集合
 */
export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

/**
 * 断点配置
 */
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

/**
 * 颜色令牌集合
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
 * 完整的设计令牌配置
 */
export interface DesignTokens {
  /** 断点配置 */
  breakpoints: Breakpoints;
  /** 颜色令牌 */
  colors: ColorTokens;
  /** 间距令牌 */
  spacing: SpacingTokens;
  /** 排版令牌 */
  typography: TypographyTokens;
  /** 阴影令牌 */
  shadows: ShadowTokens;
  /** 圆角令牌 */
  radius: RadiusTokens;
}

/**
 * 令牌验证结果
 */
export interface TokenValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 建议的替代令牌 */
  suggestions?: string[];
}
