/**
 * @file platforms.ts
 * @description 平台类型常量定义
 * @module constants/platforms
 * @requirements 6.1, 6.4
 */

/**
 * 支持的平台类型
 */
export const PLATFORMS = {
  /** PC Web 端 */
  PC_WEB: 'pc-web',
  /** 移动 Web 端 */
  MOBILE_WEB: 'mobile-web',
  /** 移动原生端 */
  MOBILE_NATIVE: 'mobile-native',
  /** PC 桌面端 */
  PC_DESKTOP: 'pc-desktop',
} as const;

/**
 * 平台类型
 */
export type PlatformType = typeof PLATFORMS[keyof typeof PLATFORMS];

/**
 * 平台显示名称
 */
export const PLATFORM_DISPLAY_NAMES: Record<PlatformType, string> = {
  [PLATFORMS.PC_WEB]: 'PC Web',
  [PLATFORMS.MOBILE_WEB]: 'Mobile Web',
  [PLATFORMS.MOBILE_NATIVE]: 'Mobile Native',
  [PLATFORMS.PC_DESKTOP]: 'PC Desktop',
} as const;

/**
 * 屏幕尺寸类型
 */
export const SCREEN_SIZES = {
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  MOBILE: 'mobile',
} as const;

/**
 * 屏幕尺寸类型
 */
export type ScreenSizeType = typeof SCREEN_SIZES[keyof typeof SCREEN_SIZES];

/**
 * 默认断点配置（像素）
 */
export const DEFAULT_BREAKPOINTS = {
  /** 移动端断点 */
  mobile: 768,
  /** 平板断点 */
  tablet: 1024,
  /** 桌面断点 */
  desktop: 1280,
} as const;

/**
 * 判断是否为移动平台
 * @param platform - 平台类型
 * @returns 是否为移动平台
 */
export function isMobilePlatform(platform: PlatformType): boolean {
  return platform === PLATFORMS.MOBILE_WEB || platform === PLATFORMS.MOBILE_NATIVE;
}

/**
 * 判断是否为 Web 平台
 * @param platform - 平台类型
 * @returns 是否为 Web 平台
 */
export function isWebPlatform(platform: PlatformType): boolean {
  return platform === PLATFORMS.PC_WEB || platform === PLATFORMS.MOBILE_WEB;
}

/**
 * 获取平台显示名称
 * @param platform - 平台类型
 * @returns 平台显示名称
 */
export function getPlatformDisplayName(platform: PlatformType): string {
  return PLATFORM_DISPLAY_NAMES[platform] || platform;
}
