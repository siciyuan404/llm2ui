/**
 * LLM Configuration Manager Module
 * 
 * Provides configuration validation, persistence, and management
 * for LLM settings using localStorage.
 * 
 * @module llm-config-manager
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
  /** Field that failed validation */
  field: string;
  /** Error message */
  message: string;
  /** Error code */
  code: 'REQUIRED' | 'INVALID_RANGE' | 'INVALID_FORMAT';
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** List of validation errors */
  errors: ConfigValidationError[];
}

/**
 * Extended LLM configuration with display name for saved configs
 */
export interface SavedLLMConfig extends LLMConfig {
  /** Unique identifier for the saved config */
  id: string;
  /** Display name for the configuration */
  displayName: string;
  /** Timestamp when the config was created */
  createdAt: number;
  /** Timestamp when the config was last updated */
  updatedAt: number;
}

/**
 * Valid provider types for validation
 */
const VALID_PROVIDERS: LLMProvider[] = ['openai', 'anthropic', 'iflow', 'custom'];

/**
 * Validates an LLM configuration object
 * 
 * Checks for required fields and parameter ranges:
 * - provider: must be a valid provider type
 * - apiKey: required, non-empty string
 * - model: required, non-empty string
 * - endpoint: required for custom provider
 * - temperature: must be between 0 and 1 (if provided)
 * - maxTokens: must be positive (if provided)
 * - timeout: must be positive (if provided)
 * 
 * @param config - The LLM configuration to validate
 * @returns Validation result with errors if any
 */
export function validateLLMConfig(config: Partial<LLMConfig>): ConfigValidationResult {
  const errors: ConfigValidationError[] = [];

  // Validate provider
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

  // Validate apiKey
  if (!config.apiKey || (typeof config.apiKey === 'string' && config.apiKey.trim() === '')) {
    errors.push({
      field: 'apiKey',
      message: 'API key is required',
      code: 'REQUIRED',
    });
  }

  // Validate model
  if (!config.model || (typeof config.model === 'string' && config.model.trim() === '')) {
    errors.push({
      field: 'model',
      message: 'Model is required',
      code: 'REQUIRED',
    });
  }

  // Validate endpoint for custom provider
  if (config.provider === 'custom') {
    if (!config.endpoint || (typeof config.endpoint === 'string' && config.endpoint.trim() === '')) {
      errors.push({
        field: 'endpoint',
        message: 'Endpoint is required for custom provider',
        code: 'REQUIRED',
      });
    }
  }

  // Validate temperature range
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

  // Validate maxTokens
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

  // Validate timeout
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

/**
 * Generates a unique ID for saved configurations
 * 
 * @returns A unique string ID
 */
function generateConfigId(): string {
  return `config_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Saves an LLM configuration to localStorage
 * 
 * @param config - The configuration to save
 * @param displayName - Optional display name for the config
 * @returns The saved configuration with ID and timestamps
 * @throws Error if validation fails
 */
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

  // Get existing configs
  const existingConfigs = loadAllLLMConfigs();
  existingConfigs.push(savedConfig);

  // Save to localStorage
  try {
    localStorage.setItem(LLM_CONFIGS_LIST_KEY, JSON.stringify(existingConfigs));
  } catch (error) {
    throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return savedConfig;
}

/**
 * Updates an existing LLM configuration in localStorage
 * 
 * @param id - The ID of the configuration to update
 * @param config - The updated configuration
 * @param displayName - Optional new display name
 * @returns The updated configuration
 * @throws Error if config not found or validation fails
 */
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

/**
 * Loads all saved LLM configurations from localStorage
 * 
 * @returns Array of saved configurations
 */
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

/**
 * Loads a specific LLM configuration by ID
 * 
 * @param id - The ID of the configuration to load
 * @returns The configuration if found, null otherwise
 */
export function loadLLMConfigById(id: string): SavedLLMConfig | null {
  const configs = loadAllLLMConfigs();
  return configs.find(c => c.id === id) || null;
}

/**
 * Deletes an LLM configuration from localStorage
 * 
 * @param id - The ID of the configuration to delete
 * @returns true if deleted, false if not found
 */
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

/**
 * Saves the current active LLM configuration
 * 
 * @param config - The configuration to set as current
 */
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

/**
 * Loads the current active LLM configuration
 * 
 * @returns The current configuration if set, null otherwise
 */
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

/**
 * Clears the current active LLM configuration
 */
export function clearCurrentLLMConfig(): void {
  try {
    localStorage.removeItem(LLM_CONFIG_STORAGE_KEY);
  } catch {
    // Ignore errors when clearing
  }
}

/**
 * Clears all saved LLM configurations
 */
export function clearAllLLMConfigs(): void {
  try {
    localStorage.removeItem(LLM_CONFIGS_LIST_KEY);
    localStorage.removeItem(LLM_CONFIG_STORAGE_KEY);
  } catch {
    // Ignore errors when clearing
  }
}
