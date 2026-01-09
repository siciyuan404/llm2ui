/**
 * LLM Configuration Manager Module
 * 
 * Provides configuration validation, persistence, and management
 * for LLM settings using localStorage.
 * 
 * @module lib/llm/llm-config-manager
 * @see Requirements 1.4 (LLM 子目录)
 */

import type { LLMConfig, LLMProvider } from './llm-service';

/**
 * Storage keys for LLM configuration
 */
export const LLM_CONFIG_STORAGE_KEY = 'llm2ui_llm_config';
export const LLM_CONFIGS_LIST_KEY = 'llm2ui_llm_configs_list';

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  field: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_RANGE' | 'INVALID_FORMAT';
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigValidationError[];
}

/**
 * Extended LLM configuration with display name for saved configs
 */
export interface SavedLLMConfig extends LLMConfig {
  id: string;
  displayName: string;
  createdAt: number;
  updatedAt: number;
}

const VALID_PROVIDERS: LLMProvider[] = ['openai', 'anthropic', 'iflow', 'custom'];

/**
 * Validates an LLM configuration object
 */
export function validateLLMConfig(config: Partial<LLMConfig>): ConfigValidationResult {
  const errors: ConfigValidationError[] = [];

  if (!config.provider) {
    errors.push({
      field: 'provider',
      message: 'Provider is required',
      code: 'REQUIRED',
    });
  } else if (!VALID_PROVIDERS.includes(config.provider)) {
    errors.push({
      field: 'provider',
      message: `Provider must be one of: ${VALID_PROVIDERS.join(', ')}`,
      code: 'INVALID_FORMAT',
    });
  }

  if (!config.apiKey || (typeof config.apiKey === 'string' && config.apiKey.trim() === '')) {
    errors.push({
      field: 'apiKey',
      message: 'API key is required',
      code: 'REQUIRED',
    });
  }

  if (!config.model || (typeof config.model === 'string' && config.model.trim() === '')) {
    errors.push({
      field: 'model',
      message: 'Model is required',
      code: 'REQUIRED',
    });
  }

  if (config.provider === 'custom') {
    if (!config.endpoint || (typeof config.endpoint === 'string' && config.endpoint.trim() === '')) {
      errors.push({
        field: 'endpoint',
        message: 'Endpoint is required for custom provider',
        code: 'REQUIRED',
      });
    }
  }

  if (config.temperature !== undefined && config.temperature !== null) {
    if (typeof config.temperature !== 'number' || isNaN(config.temperature)) {
      errors.push({
        field: 'temperature',
        message: 'Temperature must be a number',
        code: 'INVALID_FORMAT',
      });
    } else if (config.temperature < 0 || config.temperature > 1) {
      errors.push({
        field: 'temperature',
        message: 'Temperature must be between 0 and 1',
        code: 'INVALID_RANGE',
      });
    }
  }

  if (config.maxTokens !== undefined && config.maxTokens !== null) {
    if (typeof config.maxTokens !== 'number' || isNaN(config.maxTokens)) {
      errors.push({
        field: 'maxTokens',
        message: 'Max tokens must be a number',
        code: 'INVALID_FORMAT',
      });
    } else if (config.maxTokens <= 0) {
      errors.push({
        field: 'maxTokens',
        message: 'Max tokens must be positive',
        code: 'INVALID_RANGE',
      });
    }
  }

  if (config.timeout !== undefined && config.timeout !== null) {
    if (typeof config.timeout !== 'number' || isNaN(config.timeout)) {
      errors.push({
        field: 'timeout',
        message: 'Timeout must be a number',
        code: 'INVALID_FORMAT',
      });
    } else if (config.timeout <= 0) {
      errors.push({
        field: 'timeout',
        message: 'Timeout must be positive',
        code: 'INVALID_RANGE',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function generateConfigId(): string {
  return `config_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function saveLLMConfig(
  config: LLMConfig,
  displayName?: string
): SavedLLMConfig {
  const validation = validateLLMConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const now = Date.now();
  const savedConfig: SavedLLMConfig = {
    ...config,
    id: generateConfigId(),
    displayName: displayName || `${config.provider} - ${config.model}`,
    createdAt: now,
    updatedAt: now,
  };

  const existingConfigs = loadAllLLMConfigs();
  existingConfigs.push(savedConfig);

  try {
    localStorage.setItem(LLM_CONFIGS_LIST_KEY, JSON.stringify(existingConfigs));
  } catch (error) {
    throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return savedConfig;
}

export function updateLLMConfig(
  id: string,
  config: LLMConfig,
  displayName?: string
): SavedLLMConfig {
  const validation = validateLLMConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const existingConfigs = loadAllLLMConfigs();
  const index = existingConfigs.findIndex(c => c.id === id);

  if (index === -1) {
    throw new Error(`Configuration with ID ${id} not found`);
  }

  const updatedConfig: SavedLLMConfig = {
    ...config,
    id,
    displayName: displayName || existingConfigs[index].displayName,
    createdAt: existingConfigs[index].createdAt,
    updatedAt: Date.now(),
  };

  existingConfigs[index] = updatedConfig;

  try {
    localStorage.setItem(LLM_CONFIGS_LIST_KEY, JSON.stringify(existingConfigs));
  } catch (error) {
    throw new Error(`Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return updatedConfig;
}

export function loadAllLLMConfigs(): SavedLLMConfig[] {
  try {
    const stored = localStorage.getItem(LLM_CONFIGS_LIST_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function loadLLMConfigById(id: string): SavedLLMConfig | null {
  const configs = loadAllLLMConfigs();
  return configs.find(c => c.id === id) || null;
}

export function deleteLLMConfig(id: string): boolean {
  const existingConfigs = loadAllLLMConfigs();
  const index = existingConfigs.findIndex(c => c.id === id);

  if (index === -1) {
    return false;
  }

  existingConfigs.splice(index, 1);

  try {
    localStorage.setItem(LLM_CONFIGS_LIST_KEY, JSON.stringify(existingConfigs));
    return true;
  } catch {
    return false;
  }
}

export function saveCurrentLLMConfig(config: LLMConfig): void {
  const validation = validateLLMConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  try {
    localStorage.setItem(LLM_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    throw new Error(`Failed to save current configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function loadCurrentLLMConfig(): LLMConfig | null {
  try {
    const stored = localStorage.getItem(LLM_CONFIG_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearCurrentLLMConfig(): void {
  try {
    localStorage.removeItem(LLM_CONFIG_STORAGE_KEY);
  } catch {
    // Ignore errors when clearing
  }
}

export function clearAllLLMConfigs(): void {
  try {
    localStorage.removeItem(LLM_CONFIGS_LIST_KEY);
    localStorage.removeItem(LLM_CONFIG_STORAGE_KEY);
  } catch {
    // Ignore errors when clearing
  }
}
