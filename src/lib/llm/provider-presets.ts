/**
 * Provider Presets Module
 * 
 * Contains predefined LLM provider configurations.
 * This module is separated to avoid circular dependencies.
 * 
 * @module lib/llm/provider-presets
 * @see Requirements 1.4 (LLM 子目录)
 */

import type { LLMProvider } from './llm-service';

/**
 * Provider preset configuration
 */
export interface ProviderPreset {
  /** Provider type identifier */
  provider: LLMProvider;
  /** Display name for UI */
  displayName: string;
  /** API endpoint URL */
  endpoint: string;
  /** Default model for this provider */
  defaultModel: string;
  /** List of available models */
  availableModels: string[];
  /** Provider description */
  description: string;
}

/**
 * Predefined LLM provider configurations
 * 
 * Includes OpenAI, Anthropic, iFlow, and custom provider options.
 * Each preset contains default endpoint, models, and descriptions.
 */
export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    provider: 'openai',
    displayName: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4',
    availableModels: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    description: 'OpenAI GPT 系列模型',
  },
  {
    provider: 'anthropic',
    displayName: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-opus-20240229',
    availableModels: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022',
    ],
    description: 'Anthropic Claude 系列模型',
  },
  {
    provider: 'iflow',
    displayName: 'iFlow 心流',
    endpoint: 'https://apis.iflow.cn/v1/chat/completions',
    defaultModel: 'Qwen3-Max',
    availableModels: [
      // 🔥 新模型
      'TStars-2.0',
      'Qwen3-Coder-Plus',
      'Qwen3-Max',
      'Qwen3-VL-Plus',
      'Qwen3-Max-Preview',
      'Kimi-K2-Instruct-0905',
      'GLM-4.6',
      'Kimi-K2',
      'DeepSeek-V3.2-Exp',
      'DeepSeek-R1',
      'DeepSeek-V3-671B',
      // Qwen3 系列
      'Qwen3-32B',
      'Qwen3-235B-A22B-Thinking',
      'Qwen3-235B-A22B-Instruct',
      'Qwen3-235B-A22B',
    ],
    description: '心流开放平台，兼容 OpenAI API 格式',
  },
  {
    provider: 'custom',
    displayName: '自定义',
    endpoint: '',
    defaultModel: '',
    availableModels: [],
    description: '自定义 OpenAI 兼容端点',
  },
];

/**
 * Gets the provider preset by provider type
 * 
 * @param provider - The provider type to look up
 * @returns The provider preset or undefined if not found
 */
export function getProviderPreset(provider: LLMProvider): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((preset) => preset.provider === provider);
}
