/**
 * LLM Providers Property-Based Tests
 * 
 * Tests for provider presets and configuration utilities.
 * 
 * @module llm-providers.test
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  PROVIDER_PRESETS,
  getProviderPreset,
  getAvailableModels,
  getAllProviderPresets,
  createConfigFromPreset,
} from './llm-providers';
import type { LLMProvider } from './llm-service';

/**
 * Generator for valid LLM provider types
 */
const providerArb: fc.Arbitrary<LLMProvider> = fc.constantFrom(
  'openai',
  'anthropic',
  'iflow',
  'custom'
);

describe('LLM Providers', () => {
  /**
   * Feature: llm-chat-integration, Property 3: 提供商默认配置完整性
   * 
   * For any predefined LLM provider, getting the default configuration
   * should return a valid configuration object with all required fields.
   * 
   * **Validates: Requirements 1.3, 2.6**
   */
  describe('Property 3: 提供商默认配置完整性', () => {
    it('should return complete preset for all predefined providers', () => {
      fc.assert(
        fc.property(providerArb, (provider) => {
          const preset = getProviderPreset(provider);
          
          // Preset should exist for all predefined providers
          expect(preset).toBeDefined();
          expect(preset).not.toBeNull();
          
          // Preset should have all required fields
          expect(preset!.provider).toBe(provider);
          expect(typeof preset!.displayName).toBe('string');
          expect(preset!.displayName.length).toBeGreaterThan(0);
          expect(typeof preset!.endpoint).toBe('string');
          expect(typeof preset!.defaultModel).toBe('string');
          expect(Array.isArray(preset!.availableModels)).toBe(true);
          expect(typeof preset!.description).toBe('string');
          
          // For non-custom providers, endpoint and defaultModel should be non-empty
          if (provider !== 'custom') {
            expect(preset!.endpoint.length).toBeGreaterThan(0);
            expect(preset!.defaultModel.length).toBeGreaterThan(0);
            expect(preset!.availableModels.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should have consistent provider types in PROVIDER_PRESETS', () => {
      // All presets should have unique provider types
      const providers = PROVIDER_PRESETS.map(p => p.provider);
      const uniqueProviders = new Set(providers);
      expect(uniqueProviders.size).toBe(providers.length);
      
      // All expected providers should be present
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
      expect(providers).toContain('iflow');
      expect(providers).toContain('custom');
    });

    it('should return available models for all providers', () => {
      fc.assert(
        fc.property(providerArb, (provider) => {
          const models = getAvailableModels(provider);
          
          // Should return an array
          expect(Array.isArray(models)).toBe(true);
          
          // For non-custom providers, should have at least one model
          if (provider !== 'custom') {
            expect(models.length).toBeGreaterThan(0);
            // All models should be non-empty strings
            models.forEach(model => {
              expect(typeof model).toBe('string');
              expect(model.length).toBeGreaterThan(0);
            });
          }
        }),
        { numRuns: 100 }
      );
    });
  });


  describe('createConfigFromPreset', () => {
    it('should create valid config from preset', () => {
      fc.assert(
        fc.property(
          providerArb,
          fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          (provider, apiKey) => {
            const config = createConfigFromPreset(provider, apiKey);
            
            // Should have provider set
            expect(config.provider).toBe(provider);
            
            // Should have apiKey if provided
            if (apiKey !== undefined) {
              expect(config.apiKey).toBe(apiKey);
            } else {
              expect(config.apiKey).toBe('');
            }
            
            // For non-custom providers, should have endpoint and model
            if (provider !== 'custom') {
              expect(config.endpoint).toBeDefined();
              expect(config.endpoint!.length).toBeGreaterThan(0);
              expect(config.model).toBeDefined();
              expect(config.model!.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('getAllProviderPresets', () => {
    it('should return a copy of all presets', () => {
      const presets1 = getAllProviderPresets();
      const presets2 = getAllProviderPresets();
      
      // Should return equal arrays
      expect(presets1).toEqual(presets2);
      
      // Should be different array instances (copy)
      expect(presets1).not.toBe(presets2);
      
      // Should have all expected providers
      expect(presets1.length).toBe(4);
    });
  });
});


/**
 * Import request building functions for Property 4 testing
 */
import {
  buildOpenAIRequest,
  buildAnthropicRequest,
  buildHeaders,
  createLLMConfig,
  DEFAULT_CONFIGS,
} from './llm-service';
import type { ChatMessage, LLMConfig } from './llm-service';

/**
 * Generator for chat messages
 */
const chatMessageArb: fc.Arbitrary<ChatMessage> = fc.record({
  role: fc.constantFrom('system', 'user', 'assistant') as fc.Arbitrary<'system' | 'user' | 'assistant'>,
  content: fc.string({ minLength: 1, maxLength: 100 }),
});

/**
 * Generator for valid LLM config
 */
const llmConfigArb: fc.Arbitrary<LLMConfig> = fc.record({
  provider: providerArb,
  apiKey: fc.string({ minLength: 1, maxLength: 50 }),
  model: fc.string({ minLength: 1, maxLength: 30 }),
  endpoint: fc.option(fc.webUrl(), { nil: undefined }),
  maxTokens: fc.option(fc.integer({ min: 1, max: 8192 }), { nil: undefined }),
  temperature: fc.option(fc.float({ min: 0, max: 1, noNaN: true }), { nil: undefined }),
  timeout: fc.option(fc.integer({ min: 1000, max: 120000 }), { nil: undefined }),
});

describe('Request Format Adaptation', () => {
  /**
   * Feature: llm-chat-integration, Property 4: 请求格式适配正确性
   * 
   * For any LLM provider and message list, the constructed request body
   * should conform to that provider's API format specification, and
   * request headers should contain correct authentication information.
   * 
   * **Validates: Requirements 2.5**
   */
  describe('Property 4: 请求格式适配正确性', () => {
    it('should build correct OpenAI request format', () => {
      fc.assert(
        fc.property(
          fc.array(chatMessageArb, { minLength: 1, maxLength: 5 }),
          llmConfigArb.filter(c => c.provider === 'openai' || c.provider === 'iflow'),
          (messages, config) => {
            const fullConfig = createLLMConfig(config);
            const request = buildOpenAIRequest(messages, fullConfig);
            
            // OpenAI format requirements
            expect(request.model).toBe(fullConfig.model);
            expect(request.stream).toBe(true);
            expect(request.max_tokens).toBe(fullConfig.maxTokens);
            expect(request.temperature).toBe(fullConfig.temperature);
            
            // Messages should be properly formatted
            expect(Array.isArray(request.messages)).toBe(true);
            const reqMessages = request.messages as Array<{ role: string; content: string }>;
            expect(reqMessages.length).toBe(messages.length);
            
            // Each message should have role and content
            reqMessages.forEach((msg, i) => {
              expect(msg.role).toBe(messages[i].role);
              expect(msg.content).toBe(messages[i].content);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should build correct Anthropic request format', () => {
      fc.assert(
        fc.property(
          fc.array(chatMessageArb, { minLength: 1, maxLength: 5 }),
          llmConfigArb.filter(c => c.provider === 'anthropic'),
          (messages, config) => {
            const fullConfig = createLLMConfig(config);
            const request = buildAnthropicRequest(messages, fullConfig);
            
            // Anthropic format requirements
            expect(request.model).toBe(fullConfig.model);
            expect(request.stream).toBe(true);
            expect(request.max_tokens).toBe(fullConfig.maxTokens);
            
            // System message should be extracted to top-level
            const systemMessage = messages.find(m => m.role === 'system');
            if (systemMessage) {
              expect(request.system).toBe(systemMessage.content);
            }
            
            // Non-system messages should be in messages array
            const nonSystemMessages = messages.filter(m => m.role !== 'system');
            const reqMessages = request.messages as Array<{ role: string; content: string }>;
            expect(reqMessages.length).toBe(nonSystemMessages.length);
            
            // Anthropic uses 'user' for non-assistant messages
            reqMessages.forEach((msg, i) => {
              const originalRole = nonSystemMessages[i].role;
              const expectedRole = originalRole === 'assistant' ? 'assistant' : 'user';
              expect(msg.role).toBe(expectedRole);
              expect(msg.content).toBe(nonSystemMessages[i].content);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should build correct headers for each provider', () => {
      fc.assert(
        fc.property(llmConfigArb, (config) => {
          const fullConfig = createLLMConfig(config);
          const headers = buildHeaders(fullConfig);
          
          // All providers should have Content-Type
          expect(headers['Content-Type']).toBe('application/json');
          
          // Check provider-specific headers
          switch (fullConfig.provider) {
            case 'openai':
            case 'iflow':
            case 'custom':
              expect(headers['Authorization']).toBe(`Bearer ${fullConfig.apiKey}`);
              break;
            case 'anthropic':
              expect(headers['x-api-key']).toBe(fullConfig.apiKey);
              expect(headers['anthropic-version']).toBe('2023-06-01');
              break;
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should use OpenAI format for iFlow provider', () => {
      fc.assert(
        fc.property(
          fc.array(chatMessageArb, { minLength: 1, maxLength: 5 }),
          llmConfigArb.filter(c => c.provider === 'iflow'),
          (messages, config) => {
            const fullConfig = createLLMConfig(config);
            
            // iFlow should use OpenAI request format
            const request = buildOpenAIRequest(messages, fullConfig);
            
            // Should have OpenAI-style structure
            expect(request.model).toBeDefined();
            expect(request.messages).toBeDefined();
            expect(request.stream).toBe(true);
            
            // Headers should use Bearer token
            const headers = buildHeaders(fullConfig);
            expect(headers['Authorization']).toBe(`Bearer ${fullConfig.apiKey}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve custom headers', () => {
      fc.assert(
        fc.property(
          llmConfigArb,
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== 'Content-Type' && s !== 'Authorization' && s !== 'x-api-key'),
            fc.string({ minLength: 1, maxLength: 50 })
          ),
          (config, customHeaders) => {
            const fullConfig = createLLMConfig({
              ...config,
              headers: customHeaders,
            });
            const headers = buildHeaders(fullConfig);
            
            // Custom headers should be preserved
            Object.entries(customHeaders).forEach(([key, value]) => {
              expect(headers[key]).toBe(value);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
