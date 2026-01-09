/**
 * @file storage-keys.ts
 * @description localStorage 存储键常量定义
 * @module constants/storage-keys
 * @requirements 6.1, 6.2
 */

/**
 * localStorage 存储键常量
 * 
 * 所有 localStorage 键都应该使用这些常量，避免硬编码字符串
 */
export const STORAGE_KEYS = {
  /** LLM 当前配置 */
  LLM_CONFIG: 'llm2ui_llm_config',
  
  /** LLM 配置列表 */
  LLM_CONFIGS_LIST: 'llm2ui_llm_configs_list',
  
  /** 自定义案例 */
  CUSTOM_EXAMPLES: 'llm2ui-custom-examples',
  
  /** 自定义模型 */
  CUSTOM_MODELS: 'llm2ui_custom_models',
  
  /** 应用状态 */
  APP_STATE: 'llm2ui-app-state',
  
  /** Schema 缓存 */
  SCHEMA_CACHE: 'llm2ui-schema',
  
  /** 布局状态 */
  LAYOUT_STATE: 'llm2ui-layout-state',
} as const;

/**
 * 存储键类型
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * 获取存储键
 * @param key - 存储键名称
 * @returns 存储键值
 */
export function getStorageKey(key: keyof typeof STORAGE_KEYS): StorageKey {
  return STORAGE_KEYS[key];
}
