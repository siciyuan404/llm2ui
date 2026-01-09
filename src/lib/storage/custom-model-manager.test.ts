/**
 * Custom Model Manager Property-Based Tests
 * 
 * Tests for custom model management including validation, CRUD operations,
 * persistence, and search functionality.
 * 
 * @module custom-model-manager.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import type { LLMProvider } from '../llm/llm-service';
import {
  validateModel,
  addModel,
  updateModel,
  deleteModel,
  getCustomModels,
  getAllModels,
  searchModels,
  saveToStorage,
  loadFromStorage,
  clearAllCustomModels,
  clearInMemoryModels,
  CUSTOM_MODELS_STORAGE_KEY,
  ModelOperationError,
} from './custom-model-manager';
import type { CustomModel } from './custom-model-manager';
import { PROVIDER_PRESETS } from '../llm/llm-providers';

/**
 * Generator for valid LLM provider types
 */
const providerArb: fc.Arbitrary<LLMProvider> = fc.constantFrom(
  'openai',
  'anthropic',
  'iflow',
  'custom'
);

/**
 * Generator for non-empty strings (for required fields)
 */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

/**
 * Generator for valid model names (non-empty, not matching preset models)
 */
const validModelNameArb = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => {
    const trimmed = s.trim();
    if (trimmed.length === 0) return false;
    // Exclude preset model names
    const allPresetNames = PROVIDER_PRESETS.flatMap(p => p.availableModels);
    return !allPresetNames.includes(trimmed);
  });

/**
 * Generator for valid custom model input (without id, createdAt, updatedAt)
 */
const validCustomModelInputArb: fc.Arbitrary<Omit<CustomModel, 'id' | 'createdAt' | 'updatedAt'>> = fc.record({
  name: validModelNameArb,
  displayName: fc.option(nonEmptyStringArb, { nil: undefined }),
  provider: providerArb,
  endpoint: fc.option(fc.webUrl(), { nil: undefined }),
  description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
});

/**
 * Generator for preset model names
 */
const presetModelNameArb = fc.constantFrom(
  ...PROVIDER_PRESETS.flatMap(p => p.availableModels)
);

describe('Custom Model Manager', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAllCustomModels();
  });

  afterEach(() => {
    localStorage.clear();
    clearAllCustomModels();
  });

  /**
   * Feature: custom-model-management, Property 2: 模型验证正确性
   * 
   * For any model configuration, the validation function should correctly identify:
   * - Empty model names as invalid
   * - Duplicate names with existing models (preset or custom) as invalid
   * - Valid configurations return valid: true
   * 
   * **Validates: Requirements 1.2, 1.5**
   */
  describe('Property 2: 模型验证正确性', () => {
    it('should reject empty model names', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n'),
          providerArb,
          (emptyName, provider) => {
            const result = validateModel({ name: emptyName, provider });
            
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            
            const nameError = result.errors.find(e => e.field === 'name');
            expect(nameError).toBeDefined();
            expect(nameError!.message).toContain('不能为空');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject model names that duplicate preset models', () => {
      fc.assert(
        fc.property(
          presetModelNameArb,
          providerArb,
          (presetName, provider) => {
            const result = validateModel({ name: presetName, provider });
            
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            
            const nameError = result.errors.find(e => e.field === 'name');
            expect(nameError).toBeDefined();
            expect(nameError!.message).toContain('预设模型重复');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject model names that duplicate existing custom models', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          (modelInput) => {
            // First add a model
            const addedModel = addModel(modelInput);
            
            // Try to validate a model with the same name
            const result = validateModel({ name: modelInput.name, provider: modelInput.provider });
            
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            
            const nameError = result.errors.find(e => e.field === 'name');
            expect(nameError).toBeDefined();
            expect(nameError!.message).toContain('自定义模型重复');
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid model configurations', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          (modelInput) => {
            const result = validateModel(modelInput);
            
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


  /**
   * Feature: custom-model-management, Property 1: 模型添加后可检索
   * 
   * For any valid custom model configuration, after adding it to the manager,
   * it should be retrievable via getAllModels or getCustomModels.
   * 
   * **Validates: Requirements 1.1, 1.6, 6.3**
   */
  describe('Property 1: 模型添加后可检索', () => {
    it('should be retrievable via getCustomModels after adding', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          (modelInput) => {
            // Add the model
            const addedModel = addModel(modelInput);
            
            // Should be retrievable via getCustomModels
            const customModels = getCustomModels();
            const found = customModels.find(m => m.id === addedModel.id);
            
            expect(found).toBeDefined();
            expect(found!.name).toBe(modelInput.name);
            expect(found!.provider).toBe(modelInput.provider);
            expect(found!.displayName).toBe(modelInput.displayName);
            expect(found!.endpoint).toBe(modelInput.endpoint);
            expect(found!.description).toBe(modelInput.description);
            
            // Should have generated fields
            expect(found!.id).toBeDefined();
            expect(found!.createdAt).toBeDefined();
            expect(found!.updatedAt).toBeDefined();
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be retrievable via getAllModels after adding', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          (modelInput) => {
            // Add the model
            const addedModel = addModel(modelInput);
            
            // Should be retrievable via getAllModels
            const allModels = getAllModels();
            const found = allModels.find(m => m.customModelId === addedModel.id);
            
            expect(found).toBeDefined();
            expect(found!.name).toBe(modelInput.name);
            expect(found!.provider).toBe(modelInput.provider);
            expect(found!.isPreset).toBe(false);
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be retrievable via getAllModels with provider filter', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          (modelInput) => {
            // Add the model
            const addedModel = addModel(modelInput);
            
            // Should be retrievable via getAllModels with provider filter
            const providerModels = getAllModels(modelInput.provider);
            const found = providerModels.find(m => m.customModelId === addedModel.id);
            
            expect(found).toBeDefined();
            expect(found!.provider).toBe(modelInput.provider);
            
            // Should NOT be in other providers
            const otherProviders: LLMProvider[] = ['openai', 'anthropic', 'iflow', 'custom']
              .filter(p => p !== modelInput.provider) as LLMProvider[];
            
            for (const otherProvider of otherProviders) {
              const otherModels = getAllModels(otherProvider);
              const notFound = otherModels.find(m => m.customModelId === addedModel.id);
              expect(notFound).toBeUndefined();
            }
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw error when adding model with duplicate name', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          (modelInput) => {
            // Add the first model
            const addedModel = addModel(modelInput);
            
            // Try to add another model with the same name
            expect(() => addModel(modelInput)).toThrow(ModelOperationError);
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: custom-model-management, Property 3: 模型编辑正确性
   * 
   * For any added custom model, edit operations should successfully update
   * the model configuration, and the updated model should be retrievable by ID.
   * 
   * **Validates: Requirements 2.1, 2.4**
   */
  describe('Property 3: 模型编辑正确性', () => {
    it('should update model and be retrievable after edit', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          fc.option(nonEmptyStringArb, { nil: undefined }),
          fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
          (modelInput, newDisplayName, newDescription) => {
            // Add the model
            const addedModel = addModel(modelInput);
            
            // Update the model
            const updates = {
              displayName: newDisplayName,
              description: newDescription,
            };
            const updatedModel = updateModel(addedModel.id, updates);
            
            // Verify updates
            expect(updatedModel.id).toBe(addedModel.id);
            expect(updatedModel.name).toBe(modelInput.name);
            expect(updatedModel.displayName).toBe(newDisplayName);
            expect(updatedModel.description).toBe(newDescription);
            expect(updatedModel.createdAt).toBe(addedModel.createdAt);
            expect(updatedModel.updatedAt).toBeGreaterThanOrEqual(addedModel.updatedAt);
            
            // Verify retrievable via getCustomModels
            const customModels = getCustomModels();
            const found = customModels.find(m => m.id === addedModel.id);
            expect(found).toBeDefined();
            expect(found!.displayName).toBe(newDisplayName);
            expect(found!.description).toBe(newDescription);
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw error when updating non-existent model', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 30 }),
          (fakeId) => {
            expect(() => updateModel(fakeId, { displayName: 'test' }))
              .toThrow(ModelOperationError);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve original fields when updating partial fields', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
          (modelInput, newDescription) => {
            // Add the model
            const addedModel = addModel(modelInput);
            
            // Update only description
            const updatedModel = updateModel(addedModel.id, { description: newDescription });
            
            // Original fields should be preserved
            expect(updatedModel.name).toBe(modelInput.name);
            expect(updatedModel.provider).toBe(modelInput.provider);
            expect(updatedModel.endpoint).toBe(modelInput.endpoint);
            expect(updatedModel.displayName).toBe(modelInput.displayName);
            
            // Only description should change
            expect(updatedModel.description).toBe(newDescription);
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: custom-model-management, Property 4: 模型删除正确性
   * 
   * For any added custom model, after deletion, the model should not appear
   * in any model list.
   * 
   * **Validates: Requirements 3.1**
   */
  describe('Property 4: 模型删除正确性', () => {
    it('should not appear in any model list after deletion', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          (modelInput) => {
            // Add the model
            const addedModel = addModel(modelInput);
            
            // Verify it exists
            expect(getCustomModels().find(m => m.id === addedModel.id)).toBeDefined();
            expect(getAllModels().find(m => m.customModelId === addedModel.id)).toBeDefined();
            
            // Delete the model
            deleteModel(addedModel.id);
            
            // Verify it's gone from all lists
            expect(getCustomModels().find(m => m.id === addedModel.id)).toBeUndefined();
            expect(getAllModels().find(m => m.customModelId === addedModel.id)).toBeUndefined();
            expect(getAllModels(modelInput.provider).find(m => m.customModelId === addedModel.id)).toBeUndefined();
            expect(searchModels(modelInput.name).find(m => m.customModelId === addedModel.id)).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw error when deleting non-existent model', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 30 }),
          (fakeId) => {
            expect(() => deleteModel(fakeId)).toThrow(ModelOperationError);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not affect other models when deleting one', () => {
      fc.assert(
        fc.property(
          fc.array(validCustomModelInputArb, { minLength: 2, maxLength: 5 })
            .filter(arr => {
              // Ensure all names are unique
              const names = arr.map(m => m.name);
              return new Set(names).size === names.length;
            }),
          (modelInputs) => {
            // Add all models
            const addedModels = modelInputs.map(input => addModel(input));
            
            // Delete the first model
            const deletedModel = addedModels[0];
            deleteModel(deletedModel.id);
            
            // Verify deleted model is gone
            expect(getCustomModels().find(m => m.id === deletedModel.id)).toBeUndefined();
            
            // Verify other models still exist
            for (let i = 1; i < addedModels.length; i++) {
              const model = addedModels[i];
              expect(getCustomModels().find(m => m.id === model.id)).toBeDefined();
            }
            
            // Clean up remaining models
            for (let i = 1; i < addedModels.length; i++) {
              deleteModel(addedModels[i].id);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: custom-model-management, Property 6: 搜索过滤正确性
   * 
   * For any search query, all returned models should have names or display names
   * that contain the query string (case-insensitive).
   * 
   * **Validates: Requirements 5.5**
   */
  describe('Property 6: 搜索过滤正确性', () => {
    it('should return models matching query in name or displayName (case-insensitive)', () => {
      fc.assert(
        fc.property(
          fc.array(validCustomModelInputArb, { minLength: 1, maxLength: 5 })
            .filter(arr => {
              // Ensure all names are unique
              const names = arr.map(m => m.name);
              return new Set(names).size === names.length;
            }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (modelInputs, searchQuery) => {
            // Add all models
            const addedModels = modelInputs.map(input => addModel(input));
            
            // Search for models
            const results = searchModels(searchQuery);
            const lowerQuery = searchQuery.toLowerCase().trim();
            
            // All results should match the query
            for (const result of results) {
              const nameMatches = result.name.toLowerCase().includes(lowerQuery);
              const displayNameMatches = result.displayName.toLowerCase().includes(lowerQuery);
              expect(nameMatches || displayNameMatches).toBe(true);
            }
            
            // Clean up
            for (const model of addedModels) {
              deleteModel(model.id);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all models when query is empty', () => {
      fc.assert(
        fc.property(
          fc.array(validCustomModelInputArb, { minLength: 1, maxLength: 3 })
            .filter(arr => {
              const names = arr.map(m => m.name);
              return new Set(names).size === names.length;
            }),
          fc.constantFrom('', '   ', '\t'),
          (modelInputs, emptyQuery) => {
            // Add all models
            const addedModels = modelInputs.map(input => addModel(input));
            
            // Search with empty query
            const results = searchModels(emptyQuery);
            const allModels = getAllModels();
            
            // Should return all models
            expect(results.length).toBe(allModels.length);
            
            // Clean up
            for (const model of addedModels) {
              deleteModel(model.id);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be case-insensitive', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          (modelInput) => {
            // Add the model
            const addedModel = addModel(modelInput);
            
            // Search with different cases
            const lowerResults = searchModels(modelInput.name.toLowerCase());
            const upperResults = searchModels(modelInput.name.toUpperCase());
            const mixedResults = searchModels(modelInput.name);
            
            // All should find the model
            const findInLower = lowerResults.find(m => m.customModelId === addedModel.id);
            const findInUpper = upperResults.find(m => m.customModelId === addedModel.id);
            const findInMixed = mixedResults.find(m => m.customModelId === addedModel.id);
            
            expect(findInLower).toBeDefined();
            expect(findInUpper).toBeDefined();
            expect(findInMixed).toBeDefined();
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should search by displayName as well', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb.filter(m => m.displayName !== undefined && m.displayName.trim().length > 0),
          (modelInput) => {
            // Add the model
            const addedModel = addModel(modelInput);
            
            // Search by displayName
            const results = searchModels(modelInput.displayName!);
            
            // Should find the model
            const found = results.find(m => m.customModelId === addedModel.id);
            expect(found).toBeDefined();
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });
  });



  /**
   * Feature: custom-model-management, Property 7: 端点继承正确性
   * 
   * For any custom model added to an existing provider without specifying an endpoint,
   * the model info should return the provider's default endpoint.
   * 
   * **Validates: Requirements 6.2**
   */
  describe('Property 7: 端点继承正确性', () => {
    it('should inherit provider endpoint when custom model has no endpoint', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb.map(m => ({ ...m, endpoint: undefined })),
          (modelInput) => {
            // Add model without endpoint
            const addedModel = addModel(modelInput);
            
            // Get model info via getAllModels
            const allModels = getAllModels();
            const modelInfo = allModels.find(m => m.customModelId === addedModel.id);
            
            expect(modelInfo).toBeDefined();
            
            // Get provider's default endpoint
            const providerPreset = PROVIDER_PRESETS.find(p => p.provider === modelInput.provider);
            
            // Model should have inherited the provider's endpoint
            expect(modelInfo!.endpoint).toBe(providerPreset?.endpoint);
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use custom endpoint when specified', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb.filter(m => m.endpoint !== undefined && m.endpoint.length > 0),
          (modelInput) => {
            // Add model with custom endpoint
            const addedModel = addModel(modelInput);
            
            // Get model info via getAllModels
            const allModels = getAllModels();
            const modelInfo = allModels.find(m => m.customModelId === addedModel.id);
            
            expect(modelInfo).toBeDefined();
            
            // Model should use its own endpoint, not provider's
            expect(modelInfo!.endpoint).toBe(modelInput.endpoint);
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should inherit endpoint correctly for each provider type', () => {
      fc.assert(
        fc.property(
          providerArb.filter(p => p !== 'custom'), // custom provider has empty endpoint
          validModelNameArb,
          (provider, modelName) => {
            // Add model without endpoint for specific provider
            const addedModel = addModel({
              name: modelName,
              provider,
              endpoint: undefined,
            });
            
            // Get model info
            const modelInfo = getAllModels(provider).find(m => m.customModelId === addedModel.id);
            
            expect(modelInfo).toBeDefined();
            
            // Get expected endpoint from provider preset
            const providerPreset = PROVIDER_PRESETS.find(p => p.provider === provider);
            expect(modelInfo!.endpoint).toBe(providerPreset?.endpoint);
            
            // Clean up
            deleteModel(addedModel.id);
          }
        ),
        { numRuns: 100 }
      );
    });
  });



  /**
   * Feature: custom-model-management, Property 5: 持久化往返一致性
   * 
   * For any valid list of custom models, saving to storage and then loading
   * should produce an equivalent list of models.
   * 
   * **Validates: Requirements 4.1, 4.2, 4.3**
   */
  describe('Property 5: 持久化往返一致性', () => {
    it('should produce equivalent models after save and load round-trip', () => {
      fc.assert(
        fc.property(
          fc.array(validCustomModelInputArb, { minLength: 1, maxLength: 5 })
            .filter(arr => {
              // Ensure all names are unique
              const names = arr.map(m => m.name);
              return new Set(names).size === names.length;
            }),
          (modelInputs) => {
            // Clear any existing models
            clearAllCustomModels();
            
            // Add all models
            modelInputs.forEach(input => addModel(input));
            
            // Get models before save
            const modelsBeforeSave = getCustomModels();
            
            // Save to storage (already called by addModel, but call explicitly)
            saveToStorage();
            
            // Clear in-memory models only (not storage)
            clearInMemoryModels();
            
            // Verify models are cleared from memory
            expect(getCustomModels()).toHaveLength(0);
            
            // Load from storage
            loadFromStorage();
            
            // Get models after load
            const modelsAfterLoad = getCustomModels();
            
            // Should have same number of models
            expect(modelsAfterLoad.length).toBe(modelsBeforeSave.length);
            
            // Each model should be equivalent
            for (const originalModel of modelsBeforeSave) {
              const loadedModel = modelsAfterLoad.find(m => m.id === originalModel.id);
              expect(loadedModel).toBeDefined();
              expect(loadedModel!.name).toBe(originalModel.name);
              expect(loadedModel!.displayName).toBe(originalModel.displayName);
              expect(loadedModel!.provider).toBe(originalModel.provider);
              expect(loadedModel!.endpoint).toBe(originalModel.endpoint);
              expect(loadedModel!.description).toBe(originalModel.description);
              expect(loadedModel!.createdAt).toBe(originalModel.createdAt);
              expect(loadedModel!.updatedAt).toBe(originalModel.updatedAt);
            }
            
            // Clean up
            clearAllCustomModels();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist models across multiple save/load cycles', () => {
      fc.assert(
        fc.property(
          validCustomModelInputArb,
          fc.integer({ min: 2, max: 5 }),
          (modelInput, cycles) => {
            // Clear any existing models
            clearAllCustomModels();
            
            // Add the model
            const addedModel = addModel(modelInput);
            
            // Perform multiple save/load cycles
            for (let i = 0; i < cycles; i++) {
              saveToStorage();
              clearInMemoryModels();
              loadFromStorage();
            }
            
            // Model should still be retrievable
            const models = getCustomModels();
            expect(models.length).toBe(1);
            
            const loadedModel = models[0];
            expect(loadedModel.id).toBe(addedModel.id);
            expect(loadedModel.name).toBe(addedModel.name);
            
            // Clean up
            clearAllCustomModels();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty model list correctly', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Clear all models
            clearAllCustomModels();
            
            // Save empty list
            saveToStorage();
            
            // Load from storage
            loadFromStorage();
            
            // Should still be empty
            expect(getCustomModels()).toHaveLength(0);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should correctly store and retrieve from localStorage', () => {
      fc.assert(
        fc.property(
          fc.array(validCustomModelInputArb, { minLength: 1, maxLength: 3 })
            .filter(arr => {
              const names = arr.map(m => m.name);
              return new Set(names).size === names.length;
            }),
          (modelInputs) => {
            // Clear any existing models
            clearAllCustomModels();
            
            // Add all models
            const addedModels = modelInputs.map(input => addModel(input));
            
            // Verify localStorage has the data
            const storedData = localStorage.getItem(CUSTOM_MODELS_STORAGE_KEY);
            expect(storedData).not.toBeNull();
            
            const parsedData = JSON.parse(storedData!);
            expect(Array.isArray(parsedData)).toBe(true);
            expect(parsedData.length).toBe(addedModels.length);
            
            // Clean up
            clearAllCustomModels();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
