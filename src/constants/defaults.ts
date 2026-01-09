/**
 * @file defaults.ts
 * @description 默认配置值常量定义
 * @module constants/defaults
 * @requirements 6.1, 6.3
 */

import type { LLMProvider } from '../types/llm.types';

/**
 * 默认 LLM 配置
 */
export const DEFAULT_LLM_CONFIG = {
  /** 默认温度参数 */
  temperature: 0.7,
  /** 默认最大 token 数 */
  maxTokens: 4096,
  /** 默认请求超时时间（毫秒） */
  timeout: 60000,
  /** 默认启用案例增强 */
  enableExampleEnhancement: true,
} as const;

/**
 * 各提供商默认配置
 */
export const DEFAULT_PROVIDER_CONFIGS: Record<LLMProvider, {
  endpoint: string;
  model: string;
}> = {
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4',
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-opus-20240229',
  },
  iflow: {
    endpoint: 'https://apis.iflow.cn/v1/chat/completions',
    model: 'glm-4.6',
  },
  custom: {
    endpoint: '',
    model: '',
  },
} as const;

/**
 * 默认编辑器分割比例
 */
export const DEFAULT_EDITOR_SPLIT_PERCENT = 70;

/**
 * 默认面板宽度配置
 */
export const DEFAULT_PANEL_WIDTHS = {
  chat: 30,
  editor: 35,
  preview: 35,
} as const;

/**
 * 默认 UI Schema 版本
 */
export const DEFAULT_SCHEMA_VERSION = '1.0';

/**
 * 系统提示词缓存有效期（毫秒）
 */
export const SYSTEM_PROMPT_CACHE_TTL = 5 * 60 * 1000; // 5 分钟

/**
 * 最小面板宽度百分比
 */
export const MIN_PANEL_WIDTH_PERCENT = 10;

/**
 * 最大面板宽度百分比
 */
export const MAX_PANEL_WIDTH_PERCENT = 80;
