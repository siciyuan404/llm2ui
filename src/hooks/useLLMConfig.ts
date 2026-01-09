/**
 * @file useLLMConfig.ts
 * @description LLM 配置管理 Hook，封装 LLM 配置加载和保存逻辑
 * @module hooks/useLLMConfig
 * @requirements 4.3
 */

import { useCallback } from 'react';
import { useAppStore, selectIsLLMConfigured } from '@/stores';
import type { LLMConfig } from '@/types/llm.types';

/**
 * useLLMConfig Hook 返回类型
 */
export interface UseLLMConfig {
  /** 当前 LLM 配置 */
  config: LLMConfig | null;
  /** 设置 LLM 配置 */
  setConfig: (config: LLMConfig) => void;
  /** LLM 是否已配置 */
  isConfigured: boolean;
  /** 清除配置 */
  clearConfig: () => void;
}

/**
 * LLM 配置管理 Hook
 * 
 * 封装 LLM 配置的加载、保存和管理逻辑。
 * 集成 appStore 的 llmConfig 状态，提供统一的配置管理接口。
 * 
 * 注意：配置的持久化由 Zustand 的 persist 中间件自动处理，
 * 无需手动从 localStorage 加载或保存。
 * 
 * @returns UseLLMConfig 接口
 * 
 * @example
 * ```tsx
 * function SettingsPanel() {
 *   const { config, setConfig, isConfigured } = useLLMConfig();
 *   
 *   const handleSave = (newConfig: LLMConfig) => {
 *     setConfig(newConfig);
 *   };
 *   
 *   return (
 *     <div>
 *       {isConfigured ? 'LLM 已配置' : 'LLM 未配置'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLLMConfig(): UseLLMConfig {
  // 从 store 获取状态和 actions
  // Zustand 的 persist 中间件会自动从 localStorage 加载配置
  const config = useAppStore((state) => state.llmConfig);
  const setLLMConfig = useAppStore((state) => state.setLLMConfig);
  const isConfigured = useAppStore(selectIsLLMConfigured);

  // 设置配置（persist 中间件会自动持久化）
  const setConfig = useCallback(
    (newConfig: LLMConfig) => {
      setLLMConfig(newConfig);
    },
    [setLLMConfig]
  );

  // 清除配置
  const clearConfig = useCallback(() => {
    // 创建一个空配置
    const emptyConfig: LLMConfig = {
      provider: 'openai',
      apiKey: '',
      endpoint: '',
      model: '',
    };
    setLLMConfig(emptyConfig);
  }, [setLLMConfig]);

  return {
    config,
    setConfig,
    isConfigured,
    clearConfig,
  };
}

export default useLLMConfig;
