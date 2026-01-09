/**
 * Custom Model Manager Module
 * 
 * Provides functionality for managing custom LLM models including
 * add, edit, delete, validation, and persistence operations.
 * 
 * @module custom-model-manager
 * @see Requirements 1.1, 1.2, 2.1, 3.1, 4.1, 5.5, 6.2
 */

import type { LLMProvider } from '../llm/llm-service';
import { PROVIDER_PRESETS, getProviderPreset } from '../llm/provider-presets';

/**
 * Storage key for custom models in localStorage
 */
export const CUSTOM_MODELS_STORAGE_KEY = 'llm2ui_custom_models';

/**
 * Custom model configuration
 * Represents a user-defined LLM model
 */
export interface CustomModel {
  /** Unique identifier */
  id: string;
  /** Model name (used for API calls) */
  name: string;
  /** Display name (used for UI display, optional) */
  displayName?: string;
  /** Provider type */
  provider: LLMProvider;
  /** Custom API endpoint (optional, uses provider default if not set) */
  endpoint?: string;
  /** Model description (optional) */
  description?: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Unified model information for UI display
 * Combines preset and custom models into a single interface
 */
export interface ModelInfo {
  /** Model name */
  name: string;
  /** Display name */
  displayName: string;
  /** Provider type */
  provider: LLMProvider;
  /** Whether this is a preset model */
  isPreset: boolean;
  /** Custom model ID (only for custom models) */
  customModelId?: string;
  /** Custom endpoint (optional) */
  endpoint?: string;
  /** Description */
  description?: string;
}

/**
 * Model validation error
 */
export interface ModelValidationError {
  /** Field that failed validation */
  field: string;
  /** Error message */
  message: string;
}

/**
 * Model validation result
 */
export interface ModelValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** List of validation errors */
  errors: ModelValidationError[];
}

/**
 * Model operation error codes
 */
export type ModelOperationErrorCode = 'NOT_FOUND' | 'PRESET_MODEL' | 'VALIDATION_FAILED';

/**
 * Model operation error
 */
export class ModelOperationError extends Error {
  code: ModelOperationErrorCode;
  
  constructor(code: ModelOperationErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'ModelOperationError';
  }
}


/**
 * Internal storage for custom models
 */
let customModels: CustomModel[] = [];

/**
 * Generates a unique model ID
 * @returns Unique ID string
 */
export function generateModelId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gets all preset model names for a specific provider
 * @param provider - Provider type
 * @returns Array of preset model names
 */
function getPresetModelNames(provider: LLMProvider): string[] {
  const preset = getProviderPreset(provider);
  return preset?.availableModels ?? [];
}

/**
 * Gets all preset model names across all providers
 * @returns Array of all preset model names
 */
function getAllPresetModelNames(): string[] {
  return PROVIDER_PRESETS.flatMap(preset => preset.availableModels);
}

/**
 * Validates a custom model configuration
 * 
 * Checks:
 * - Model name is not empty
 * - Model name does not duplicate existing models (preset or custom)
 * 
 * @param model - Model configuration to validate
 * @param excludeId - Optional ID to exclude from duplicate check (for updates)
 * @returns Validation result with errors if any
 * 
 * @see Requirements 1.2, 1.5
 */
export function validateModel(
  model: Partial<CustomModel>,
  excludeId?: string
): ModelValidationResult {
  const errors: ModelValidationError[] = [];

  // Check model name is not empty
  if (!model.name || model.name.trim() === '') {
    errors.push({
      field: 'name',
      message: '模型名称不能为空',
    });
  } else {
    // Check for duplicate names in preset models
    const allPresetNames = getAllPresetModelNames();
    if (allPresetNames.includes(model.name)) {
      errors.push({
        field: 'name',
        message: '模型名称与预设模型重复',
      });
    }

    // Check for duplicate names in custom models
    const duplicateCustom = customModels.find(
      m => m.name === model.name && m.id !== excludeId
    );
    if (duplicateCustom) {
      errors.push({
        field: 'name',
        message: '模型名称与已有自定义模型重复',
      });
    }
  }

  // Validate provider if provided
  if (model.provider !== undefined) {
    const validProviders: LLMProvider[] = ['openai', 'anthropic', 'iflow', 'custom'];
    if (!validProviders.includes(model.provider)) {
      errors.push({
        field: 'provider',
        message: '请选择有效的提供商',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


/**
 * Adds a new custom model
 * 
 * Validates the model configuration and adds it to the internal storage.
 * Automatically generates ID and timestamps.
 * 
 * @param model - Model configuration (without id, createdAt, updatedAt)
 * @returns The created custom model with generated fields
 * @throws ModelOperationError if validation fails
 * 
 * @see Requirements 1.1, 1.6
 */
export function addModel(
  model: Omit<CustomModel, 'id' | 'createdAt' | 'updatedAt'>
): CustomModel {
  // Validate the model
  const validation = validateModel(model);
  if (!validation.valid) {
    throw new ModelOperationError(
      'VALIDATION_FAILED',
      validation.errors.map(e => e.message).join(', ')
    );
  }

  const now = Date.now();
  const newModel: CustomModel = {
    ...model,
    id: generateModelId(),
    createdAt: now,
    updatedAt: now,
  };

  customModels.push(newModel);
  saveToStorage();

  return newModel;
}


/**
 * Checks if a model name belongs to a preset model
 * 
 * @param modelName - Model name to check
 * @param provider - Provider type
 * @returns true if the model is a preset model
 */
export function isPresetModel(modelName: string, provider: LLMProvider): boolean {
  const presetNames = getPresetModelNames(provider);
  return presetNames.includes(modelName);
}

/**
 * Updates an existing custom model
 * 
 * @param id - ID of the model to update
 * @param updates - Partial model updates
 * @returns The updated custom model
 * @throws ModelOperationError if model not found or is a preset model
 * 
 * @see Requirements 2.1, 2.4
 */
export function updateModel(
  id: string,
  updates: Partial<Omit<CustomModel, 'id' | 'createdAt'>>
): CustomModel {
  const index = customModels.findIndex(m => m.id === id);
  
  if (index === -1) {
    throw new ModelOperationError('NOT_FOUND', '模型不存在');
  }

  const existingModel = customModels[index];

  // Validate updates if name is being changed
  if (updates.name !== undefined) {
    const validation = validateModel(
      { ...existingModel, ...updates },
      id
    );
    if (!validation.valid) {
      throw new ModelOperationError(
        'VALIDATION_FAILED',
        validation.errors.map(e => e.message).join(', ')
      );
    }
  }

  const updatedModel: CustomModel = {
    ...existingModel,
    ...updates,
    id: existingModel.id,
    createdAt: existingModel.createdAt,
    updatedAt: Date.now(),
  };

  customModels[index] = updatedModel;
  saveToStorage();

  return updatedModel;
}


/**
 * Deletes a custom model
 * 
 * @param id - ID of the model to delete
 * @throws ModelOperationError if model not found
 * 
 * @see Requirements 3.1
 */
export function deleteModel(id: string): void {
  const index = customModels.findIndex(m => m.id === id);
  
  if (index === -1) {
    throw new ModelOperationError('NOT_FOUND', '模型不存在');
  }

  customModels.splice(index, 1);
  saveToStorage();
}

/**
 * Gets all custom models
 * 
 * @returns Array of all custom models
 */
export function getCustomModels(): CustomModel[] {
  return [...customModels];
}

/**
 * Gets a custom model by ID
 * 
 * @param id - Model ID
 * @returns The custom model or undefined if not found
 */
export function getCustomModelById(id: string): CustomModel | undefined {
  return customModels.find(m => m.id === id);
}

/**
 * Gets all models (preset + custom) for a specific provider or all providers
 * 
 * For custom models without a specified endpoint, inherits the provider's default endpoint.
 * 
 * @param provider - Optional provider filter
 * @returns Array of ModelInfo objects
 * 
 * @see Requirements 6.2, 6.3
 */
export function getAllModels(provider?: LLMProvider): ModelInfo[] {
  const models: ModelInfo[] = [];

  // Add preset models
  const presets = provider 
    ? PROVIDER_PRESETS.filter(p => p.provider === provider)
    : PROVIDER_PRESETS;

  for (const preset of presets) {
    for (const modelName of preset.availableModels) {
      models.push({
        name: modelName,
        displayName: modelName,
        provider: preset.provider,
        isPreset: true,
        endpoint: preset.endpoint,
        description: preset.description,
      });
    }
  }

  // Add custom models
  const customs = provider
    ? customModels.filter(m => m.provider === provider)
    : customModels;

  for (const custom of customs) {
    // Inherit endpoint from provider if not specified
    let endpoint = custom.endpoint;
    if (!endpoint) {
      const providerPreset = getProviderPreset(custom.provider);
      endpoint = providerPreset?.endpoint;
    }

    models.push({
      name: custom.name,
      displayName: custom.displayName || custom.name,
      provider: custom.provider,
      isPreset: false,
      customModelId: custom.id,
      endpoint,
      description: custom.description,
    });
  }

  return models;
}

/**
 * Searches models by name or display name
 * 
 * @param query - Search query (case-insensitive)
 * @returns Array of matching ModelInfo objects
 * 
 * @see Requirements 5.5
 */
export function searchModels(query: string): ModelInfo[] {
  if (!query || query.trim() === '') {
    return getAllModels();
  }

  const lowerQuery = query.toLowerCase().trim();
  const allModels = getAllModels();

  return allModels.filter(model => 
    model.name.toLowerCase().includes(lowerQuery) ||
    model.displayName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Saves custom models to localStorage
 * 
 * @see Requirements 4.1
 */
export function saveToStorage(): void {
  try {
    localStorage.setItem(CUSTOM_MODELS_STORAGE_KEY, JSON.stringify(customModels));
  } catch (error) {
    console.error('Failed to save custom models to storage:', error);
  }
}

/**
 * Loads custom models from localStorage
 * 
 * @see Requirements 4.2
 */
export function loadFromStorage(): void {
  try {
    const stored = localStorage.getItem(CUSTOM_MODELS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        customModels = parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load custom models from storage:', error);
    customModels = [];
  }
}

/**
 * Clears all custom models (for testing purposes)
 */
export function clearAllCustomModels(): void {
  customModels = [];
  saveToStorage();
}

/**
 * Clears in-memory custom models without affecting storage (for testing purposes)
 * This allows testing the load functionality by clearing memory and reloading from storage
 */
export function clearInMemoryModels(): void {
  customModels = [];
}

// Initialize by loading from storage
loadFromStorage();
