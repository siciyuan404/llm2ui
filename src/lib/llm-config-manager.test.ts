/**
 * LLM Config Manager Property-Based Tests
 * 
 * Tests for configuration validation and persistence.
 * 
 * @module llm-config-manager.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import {
  validateLLMConfig,
  saveLLMConfig,
  loadAllLLMConfigs,
  loadLLMConfigById,
  deleteLLMConfig,
  saveCurrentLLMConfig,
  loadCurrentLLMConfig,
  clearAllLLMConfigs,
} from './llm-config-manager';
import type { LLMConfig, LLMProvider } from './llm-service';

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
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

/**
 * Generator for valid temperature (0-1)
 */
const validTemperatureArb = fc.float({ min: 0, max: 1, noNaN: true });

/**
 * Generator for invalid temperature (outside 0-1)
 */
const invalidTemperatureArb = fc.oneof(
  fc.float({ min: Math.fround(-100), max: Math.fround(-0.001), noNaN: true }),
  fc.float({ min: Math.fround(1.001), max: Math.fround(100), noNaN: true })
);

/**
 * Generator for valid maxTokens (positive)
 */
const validMaxTokensArb = fc.integer({ min: 1, max: 100000 });

/**
 * Generator for invalid maxTokens (non-positive)
 */
const invalidMaxTokensArb = fc.integer({ min: -10000, max: 0 });

/**
 * Generator for valid timeout (positive)
 */
const validTimeoutArb = fc.integer({ min: 1, max: 300000 });

/**
 * Generator for invalid timeout (non-positive)
 */
const invalidTimeoutArb = fc.integer({ min: -10000, max: 0 });

/**
 * Generator for valid LLM config (all required fields present, valid ranges)
 */
const validLLMConfigArb: fc.Arbitrary<LLMConfig> = fc.record({
  provider: providerArb,
  apiKey: nonEmptyStringArb,
  model: nonEmptyStringArb,
  endpoint: fc.option(fc.webUrl(), { nil: undefined }),
  maxTokens: fc.option(validMaxTokensArb, { nil: undefined }),
  temperature: fc.option(validTemperatureArb, { nil: undefined }),
  timeout: fc.option(validTimeoutArb, { nil: undefined }),
  systemPrompt: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
}).map(config => {
  // For custom provider, ensure endpoint is set
  if (config.provider === 'custom' && !config.endpoint) {
    return { ...config, endpoint: 'https://custom.api.example.com/v1/chat' };
  }
  return config;
});

/**
 * Generator for invalid LLM config (missing required fields)
 */
const invalidLLMConfigMissingFieldsArb: fc.Arbitrary<Partial<LLMConfig>> = fc.oneof(
  // Missing provider
  fc.record({
    apiKey: nonEmptyStringArb,
    model: nonEmptyStringArb,
  }),
  // Missing apiKey
  fc.record({
    provider: providerArb,
    model: nonEmptyStringArb,
  }),
  // Missing model
  fc.record({
    provider: providerArb,
    apiKey: nonEmptyStringArb,
  }),
  // Custom provider without endpoint
  fc.record({
    provider: fc.constant('custom' as LLMProvider),
    apiKey: nonEmptyStringArb,
    model: nonEmptyStringArb,
  })
);

describe('LLM Config Manager', () => {
  // Clean up localStorage before and after each test
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Feature: llm-chat-integration, Property 1: 配置验证正确性
   * 
   * For any LLM configuration object, the validation function should correctly
   * identify valid and invalid configurations, and return specific error messages
   * for invalid configurations.
   * 
   * - Valid config: contains required fields (provider, apiKey, model, endpoint for custom)
   *   and parameters within valid ranges
   * - Invalid config: missing required fields or parameters out of range
   *   (e.g., temperature < 0 or > 1)
   * 
   * **Validates: Requirements 1.7, 1.10**
   */
  describe('Property 1: 配置验证正确性', () => {
    it('should validate valid configurations as valid', () => {
      fc.assert(
        fc.property(validLLMConfigArb, (config) => {
          const result = validateLLMConfig(config);
          
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject configurations with missing required fields', () => {
      fc.assert(
        fc.property(invalidLLMConfigMissingFieldsArb, (config) => {
          const result = validateLLMConfig(config);
          
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          
          // Each error should have required fields
          result.errors.forEach(error => {
            expect(error.field).toBeDefined();
            expect(error.message).toBeDefined();
            expect(error.code).toBeDefined();
            expect(['REQUIRED', 'INVALID_RANGE', 'INVALID_FORMAT']).toContain(error.code);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should reject configurations with invalid temperature range', () => {
      fc.assert(
        fc.property(
          validLLMConfigArb,
          invalidTemperatureArb,
          (config, invalidTemp) => {
            const invalidConfig = { ...config, temperature: invalidTemp };
            const result = validateLLMConfig(invalidConfig);
            
            expect(result.valid).toBe(false);
            
            const tempError = result.errors.find(e => e.field === 'temperature');
            expect(tempError).toBeDefined();
            expect(tempError!.code).toBe('INVALID_RANGE');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject configurations with invalid maxTokens', () => {
      fc.assert(
        fc.property(
          validLLMConfigArb,
          invalidMaxTokensArb,
          (config, invalidTokens) => {
            const invalidConfig = { ...config, maxTokens: invalidTokens };
            const result = validateLLMConfig(invalidConfig);
            
            expect(result.valid).toBe(false);
            
            const tokensError = result.errors.find(e => e.field === 'maxTokens');
            expect(tokensError).toBeDefined();
            expect(tokensError!.code).toBe('INVALID_RANGE');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject configurations with invalid timeout', () => {
      fc.assert(
        fc.property(
          validLLMConfigArb,
          invalidTimeoutArb,
          (config, invalidTimeout) => {
            const invalidConfig = { ...config, timeout: invalidTimeout };
            const result = validateLLMConfig(invalidConfig);
            
            expect(result.valid).toBe(false);
            
            const timeoutError = result.errors.find(e => e.field === 'timeout');
            expect(timeoutError).toBeDefined();
            expect(timeoutError!.code).toBe('INVALID_RANGE');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should require endpoint for custom provider', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArb,
          nonEmptyStringArb,
          (apiKey, model) => {
            const config: Partial<LLMConfig> = {
              provider: 'custom',
              apiKey,
              model,
              // endpoint intentionally missing
            };
            
            const result = validateLLMConfig(config);
            
            expect(result.valid).toBe(false);
            
            const endpointError = result.errors.find(e => e.field === 'endpoint');
            expect(endpointError).toBeDefined();
            expect(endpointError!.code).toBe('REQUIRED');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not require endpoint for non-custom providers', () => {
      const nonCustomProviders: LLMProvider[] = ['openai', 'anthropic', 'iflow'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...nonCustomProviders),
          nonEmptyStringArb,
          nonEmptyStringArb,
          (provider, apiKey, model) => {
            const config: LLMConfig = {
              provider,
              apiKey,
              model,
              // endpoint not provided
            };
            
            const result = validateLLMConfig(config);
            
            // Should be valid without endpoint for non-custom providers
            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: llm-chat-integration, Property 2: 配置持久化往返一致性
   * 
   * For any valid LLM configuration, saving to localStorage and then loading
   * should produce an equivalent configuration object.
   * 
   * **Validates: Requirements 1.9**
   */
  describe('Property 2: 配置持久化往返一致性', () => {
    it('should preserve configuration through save/load cycle for saved configs', () => {
      fc.assert(
        fc.property(
          validLLMConfigArb,
          fc.option(nonEmptyStringArb, { nil: undefined }),
          (config, displayName) => {
            // Clear any existing configs
            clearAllLLMConfigs();
            
            // Save the config
            const savedConfig = saveLLMConfig(config, displayName);
            
            // Load all configs
            const loadedConfigs = loadAllLLMConfigs();
            
            // Should have exactly one config
            expect(loadedConfigs).toHaveLength(1);
            
            const loadedConfig = loadedConfigs[0];
            
            // Core config fields should match
            expect(loadedConfig.provider).toBe(config.provider);
            expect(loadedConfig.apiKey).toBe(config.apiKey);
            expect(loadedConfig.model).toBe(config.model);
            expect(loadedConfig.endpoint).toBe(config.endpoint);
            expect(loadedConfig.maxTokens).toBe(config.maxTokens);
            expect(loadedConfig.temperature).toBe(config.temperature);
            expect(loadedConfig.timeout).toBe(config.timeout);
            expect(loadedConfig.systemPrompt).toBe(config.systemPrompt);
            
            // Saved config metadata should be present
            expect(loadedConfig.id).toBe(savedConfig.id);
            expect(loadedConfig.displayName).toBeDefined();
            expect(loadedConfig.createdAt).toBeDefined();
            expect(loadedConfig.updatedAt).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve configuration through save/load cycle for current config', () => {
      fc.assert(
        fc.property(validLLMConfigArb, (config) => {
          // Clear any existing config
          clearAllLLMConfigs();
          
          // Save as current config
          saveCurrentLLMConfig(config);
          
          // Load current config
          const loadedConfig = loadCurrentLLMConfig();
          
          // Should not be null
          expect(loadedConfig).not.toBeNull();
          
          // All fields should match
          expect(loadedConfig!.provider).toBe(config.provider);
          expect(loadedConfig!.apiKey).toBe(config.apiKey);
          expect(loadedConfig!.model).toBe(config.model);
          expect(loadedConfig!.endpoint).toBe(config.endpoint);
          expect(loadedConfig!.maxTokens).toBe(config.maxTokens);
          expect(loadedConfig!.temperature).toBe(config.temperature);
          expect(loadedConfig!.timeout).toBe(config.timeout);
          expect(loadedConfig!.systemPrompt).toBe(config.systemPrompt);
        }),
        { numRuns: 100 }
      );
    });

    it('should load config by ID after saving', () => {
      fc.assert(
        fc.property(validLLMConfigArb, (config) => {
          // Clear any existing configs
          clearAllLLMConfigs();
          
          // Save the config
          const savedConfig = saveLLMConfig(config);
          
          // Load by ID
          const loadedConfig = loadLLMConfigById(savedConfig.id);
          
          // Should not be null
          expect(loadedConfig).not.toBeNull();
          
          // Should match saved config
          expect(loadedConfig!.id).toBe(savedConfig.id);
          expect(loadedConfig!.provider).toBe(config.provider);
          expect(loadedConfig!.apiKey).toBe(config.apiKey);
          expect(loadedConfig!.model).toBe(config.model);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle multiple configs correctly', () => {
      fc.assert(
        fc.property(
          fc.array(validLLMConfigArb, { minLength: 1, maxLength: 5 }),
          (configs) => {
            // Clear any existing configs
            clearAllLLMConfigs();
            
            // Save all configs
            const savedConfigs = configs.map(config => saveLLMConfig(config));
            
            // Load all configs
            const loadedConfigs = loadAllLLMConfigs();
            
            // Should have same number of configs
            expect(loadedConfigs).toHaveLength(configs.length);
            
            // Each saved config should be loadable by ID
            savedConfigs.forEach((savedConfig, index) => {
              const loaded = loadLLMConfigById(savedConfig.id);
              expect(loaded).not.toBeNull();
              expect(loaded!.provider).toBe(configs[index].provider);
              expect(loaded!.apiKey).toBe(configs[index].apiKey);
              expect(loaded!.model).toBe(configs[index].model);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should delete config correctly', () => {
      fc.assert(
        fc.property(validLLMConfigArb, (config) => {
          // Clear any existing configs
          clearAllLLMConfigs();
          
          // Save the config
          const savedConfig = saveLLMConfig(config);
          
          // Verify it exists
          expect(loadLLMConfigById(savedConfig.id)).not.toBeNull();
          
          // Delete it
          const deleted = deleteLLMConfig(savedConfig.id);
          expect(deleted).toBe(true);
          
          // Verify it's gone
          expect(loadLLMConfigById(savedConfig.id)).toBeNull();
          expect(loadAllLLMConfigs()).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false when deleting non-existent config', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 30 }), (fakeId) => {
          // Clear any existing configs
          clearAllLLMConfigs();
          
          // Try to delete non-existent config
          const deleted = deleteLLMConfig(fakeId);
          expect(deleted).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });
});
