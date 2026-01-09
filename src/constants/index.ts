/**
 * @file index.ts
 * @description 常量导出入口，统一导出所有常量定义
 * @module constants
 * @requirements 6.1, 6.2, 6.3, 6.4
 */

// 存储键常量
export {
  STORAGE_KEYS,
  getStorageKey,
  type StorageKey,
} from './storage-keys';

// 默认配置常量
export {
  DEFAULT_LLM_CONFIG,
  DEFAULT_PROVIDER_CONFIGS,
  DEFAULT_EDITOR_SPLIT_PERCENT,
  DEFAULT_PANEL_WIDTHS,
  DEFAULT_SCHEMA_VERSION,
  SYSTEM_PROMPT_CACHE_TTL,
  MIN_PANEL_WIDTH_PERCENT,
  MAX_PANEL_WIDTH_PERCENT,
} from './defaults';

// 平台类型常量
export {
  PLATFORMS,
  PLATFORM_DISPLAY_NAMES,
  SCREEN_SIZES,
  DEFAULT_BREAKPOINTS,
  isMobilePlatform,
  isWebPlatform,
  getPlatformDisplayName,
  type PlatformType,
  type ScreenSizeType,
} from './platforms';
