/**
 * LLM Providers Module
 * 
 * Provides predefined LLM provider configurations and utility functions
 * for managing provider presets and available models.
 * 
 * @module lib/llm/llm-providers
 * @see Requirements 1.4 (LLM 子目录)
 * @see Requirements 7.2
 */

import type { LLMProvider, LLMConfig } from './llm-service';
import { generateSystemPrompt } from './prompt-generator';
import {
  getAllModels as getAllModelsFromManager,
  type ModelInfo,
  type CustomModel,
  type ModelValidationResult,
  type ModelValidationError,
  type ModelOperationErrorCode,
  ModelOperationError,
  addModel,
  updateModel,
  deleteModel,
  getCustomModels,
  getCustomModelById,
  searchModels,
  isPresetModel,
  validateModel,
  loadFromStorage,
  saveToStorage,
  clearAllCustomModels,
  clearInMemoryModels,
  generateModelId,
  CUSTOM_MODELS_STORAGE_KEY,
} from '../storage/custom-model-manager';

// Re-export from provider-presets to maintain backward compatibility
export {
  PROVIDER_PRESETS,
  getProviderPreset,
  type ProviderPreset,
} from './provider-presets';

// Re-export custom model manager types and functions
export {
  type ModelInfo,
  type CustomModel,
  type ModelValidationResult,
  type ModelValidationError,
  type ModelOperationErrorCode,
  ModelOperationError,
  addModel,
  updateModel,
  deleteModel,
  getCustomModels,
  getCustomModelById,
  searchModels,
  isPresetModel,
  validateModel,
  loadFromStorage,
  saveToStorage,
  clearAllCustomModels,
  clearInMemoryModels,
  generateModelId,
  CUSTOM_MODELS_STORAGE_KEY,
};

// Import PROVIDER_PRESETS for local use
import { PROVIDER_PRESETS, getProviderPreset, type ProviderPreset } from './provider-presets';

/**
 * Gets available models for a provider
 * 
 * Returns both preset and custom models for the specified provider.
 * Custom models are appended after preset models.
 * 
 * @param provider - The provider type
 * @returns Array of available model names, empty array if provider not found
 * 
 * @see Requirements 6.3
 */
export function getAvailableModels(provider: LLMProvider): string[] {
  const allModels = getAllModelsFromManager(provider);
  return allModels.map(model => model.name);
}

/**
 * Gets all models (preset + custom) for a provider with full model info
 * 
 * @param provider - Optional provider filter
 * @returns Array of ModelInfo objects
 * 
 * @see Requirements 6.3
 */
export function getAllModelsWithInfo(provider?: LLMProvider): ModelInfo[] {
  return getAllModelsFromManager(provider);
}

/**
 * Gets all provider presets
 * 
 * @returns Array of all provider presets
 */
export function getAllProviderPresets(): ProviderPreset[] {
  return [...PROVIDER_PRESETS];
}

/**
 * Creates a default LLM config from a provider preset
 * 
 * @param provider - The provider type
 * @param apiKey - Optional API key to include
 * @returns Partial LLM config with preset defaults
 */
export function createConfigFromPreset(
  provider: LLMProvider,
  apiKey?: string
): Partial<LLMConfig> {
  const preset = getProviderPreset(provider);
  
  if (!preset) {
    return {
      provider,
      apiKey: apiKey ?? '',
    };
  }

  return {
    provider: preset.provider,
    apiKey: apiKey ?? '',
    endpoint: preset.endpoint,
    model: preset.defaultModel,
  };
}

/**
 * Default system prompt for UI generation
 * 
 * Dynamically generated from Component_Catalog using Prompt_Generator.
 * Includes available component types, their properties, and format examples.
 * 
 * @see Requirements 6.1, 6.4, 6.5, 7.2
 */
export const DEFAULT_SYSTEM_PROMPT = generateSystemPrompt();
