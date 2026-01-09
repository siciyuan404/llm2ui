/**
 * @file duplicate-cleanup-pbt.test.ts
 * @description Property-based test for duplicate file cleanup
 * 
 * **Feature: codebase-refactor, Property 1: 重复文件清理往返**
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * 验证根目录重复文件删除后，通过 index.ts re-export，
 * 原有的导入路径仍然可用，且导出的 API 签名保持不变。
 * 
 * @module lib
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// =============================================================================
// 导入所有应该从子目录 re-export 的模块
// 这些模块原本在根目录有重复文件，现在应该从子目录导出
// =============================================================================

// Core 模块 - 原 src/lib/*.ts 现在从 src/lib/core/*.ts re-export
import {
  ComponentRegistry,
  defaultRegistry,
  ComponentCatalog,
  defaultCatalog,
  render,
  validateUISchema,
  fixUISchema,
  parsePath,
  resolveBinding,
  serialize,
  deserialize,
} from './core';

// Design System 模块 - 原 src/lib/*.ts 现在从 src/lib/design-system/*.ts re-export
import {
  getDefaultDesignTokens,
  formatTokensForLLM,
  TokenUsageRegistry,
  ComponentMappingRegistry,
  validateTokenCompliance,
  executeValidationChain,
} from './design-system';

// Utils 模块 - 原 src/lib/*.ts 现在从 src/lib/utils/*.ts re-export
import {
  IconRegistry,
  PlatformAdapter,
  SchemaGenerator,
  exportToJSON,
  exportToReact,
} from './utils';

// LLM 模块 - 原 src/lib/*.ts 现在从 src/lib/llm/*.ts re-export
import {
  validateLLMConfig,
  sendMessage,
  PROVIDER_PRESETS,
  generateSystemPrompt,
  StreamingValidator,
  executeWithRetry,
} from './llm';

describe('Duplicate File Cleanup - Property-Based Tests', () => {
  describe('Property 1: 重复文件清理往返 (Duplicate File Cleanup Round-Trip)', () => {
    
    describe('1.1 Core 模块 Re-export 验证', () => {
      const coreExports = [
        { name: 'ComponentRegistry', value: ComponentRegistry, type: 'function' },
        { name: 'defaultRegistry', value: defaultRegistry, type: 'object' },
        { name: 'ComponentCatalog', value: ComponentCatalog, type: 'function' },
        { name: 'defaultCatalog', value: defaultCatalog, type: 'object' },
        { name: 'render', value: render, type: 'function' },
        { name: 'validateUISchema', value: validateUISchema, type: 'function' },
        { name: 'fixUISchema', value: fixUISchema, type: 'function' },
        { name: 'parsePath', value: parsePath, type: 'function' },
        { name: 'resolveBinding', value: resolveBinding, type: 'function' },
        { name: 'serialize', value: serialize, type: 'function' },
        { name: 'deserialize', value: deserialize, type: 'function' },
      ];

      it('should export all Core APIs from submodule', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...coreExports),
            ({ name, value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: coreExports.length }
        );
      });

      it('should have ComponentRegistry with correct interface after cleanup', () => {
        const registry = new ComponentRegistry();
        
        // 验证接口签名不变
        expect(typeof registry.register).toBe('function');
        expect(typeof registry.get).toBe('function');
        expect(typeof registry.getAll).toBe('function');
        expect(typeof registry.has).toBe('function');
        expect(typeof registry.unregister).toBe('function');
        expect(typeof registry.size).toBe('number');
        expect(typeof registry.clear).toBe('function');
        expect(typeof registry.search).toBe('function');
        expect(typeof registry.getByCategory).toBe('function');
      });

      it('should have validateUISchema return consistent result structure', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              fc.constant({ type: 'Container', children: [] }),
              fc.constant({ type: 'Text', props: { children: 'test' } }),
              fc.constant({ type: 'Button', props: { children: 'Click' } }),
              fc.constant({ type: 'Invalid' }), // 无效类型
              fc.constant({}), // 空对象
            ),
            (schema) => {
              const result = validateUISchema(schema);
              
              // 验证返回结构不变
              expect(result).toBeDefined();
              expect(typeof result.valid).toBe('boolean');
              expect(Array.isArray(result.errors)).toBe(true);
              
              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('1.2 Design System 模块 Re-export 验证', () => {
      const designSystemExports = [
        { name: 'getDefaultDesignTokens', value: getDefaultDesignTokens, type: 'function' },
        { name: 'formatTokensForLLM', value: formatTokensForLLM, type: 'function' },
        { name: 'TokenUsageRegistry', value: TokenUsageRegistry, type: 'function' },
        { name: 'ComponentMappingRegistry', value: ComponentMappingRegistry, type: 'function' },
        { name: 'validateTokenCompliance', value: validateTokenCompliance, type: 'function' },
        { name: 'executeValidationChain', value: executeValidationChain, type: 'function' },
      ];

      it('should export all Design System APIs from submodule', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...designSystemExports),
            ({ name, value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: designSystemExports.length }
        );
      });

      it('should have getDefaultDesignTokens return valid token structure', () => {
        const tokens = getDefaultDesignTokens();
        
        // 验证返回结构不变
        expect(tokens).toBeDefined();
        expect(tokens.colors).toBeDefined();
        expect(tokens.spacing).toBeDefined();
        expect(tokens.typography).toBeDefined();
        expect(tokens.shadows).toBeDefined();
        expect(tokens.radius).toBeDefined();
        expect(tokens.breakpoints).toBeDefined();
      });

      it('should have formatTokensForLLM return string', () => {
        const tokens = getDefaultDesignTokens();
        const formatted = formatTokensForLLM(tokens);
        
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      });
    });

    describe('1.3 Utils 模块 Re-export 验证', () => {
      const utilsExports = [
        { name: 'IconRegistry', value: IconRegistry, type: 'function' },
        { name: 'PlatformAdapter', value: PlatformAdapter, type: 'function' },
        { name: 'SchemaGenerator', value: SchemaGenerator, type: 'function' },
        { name: 'exportToJSON', value: exportToJSON, type: 'function' },
        { name: 'exportToReact', value: exportToReact, type: 'function' },
      ];

      it('should export all Utils APIs from submodule', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...utilsExports),
            ({ name, value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: utilsExports.length }
        );
      });

      it('should have IconRegistry with correct interface', () => {
        const registry = new IconRegistry();
        
        expect(typeof registry.register).toBe('function');
        expect(typeof registry.get).toBe('function');
        expect(typeof registry.getAll).toBe('function');
        expect(typeof registry.has).toBe('function');
      });

      it('should have PlatformAdapter with correct interface', () => {
        const adapter = new PlatformAdapter();
        
        // 验证实际的 PlatformAdapter 接口
        expect(typeof adapter.adapt).toBe('function');
        expect(typeof adapter.getMapping).toBe('function');
        expect(typeof adapter.isSupported).toBe('function');
        expect(typeof adapter.registerMapping).toBe('function');
        expect(typeof adapter.getUnsupportedComponents).toBe('function');
      });
    });

    describe('1.4 LLM 模块 Re-export 验证', () => {
      const llmExports = [
        { name: 'validateLLMConfig', value: validateLLMConfig, type: 'function' },
        { name: 'sendMessage', value: sendMessage, type: 'function' },
        { name: 'PROVIDER_PRESETS', value: PROVIDER_PRESETS, type: 'object' },
        { name: 'generateSystemPrompt', value: generateSystemPrompt, type: 'function' },
        { name: 'StreamingValidator', value: StreamingValidator, type: 'function' },
        { name: 'executeWithRetry', value: executeWithRetry, type: 'function' },
      ];

      it('should export all LLM APIs from submodule', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...llmExports),
            ({ name, value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: llmExports.length }
        );
      });

      it('should have PROVIDER_PRESETS contain expected providers', () => {
        expect(PROVIDER_PRESETS).toBeDefined();
        expect(typeof PROVIDER_PRESETS).toBe('object');
        
        // 验证预设结构
        const presetKeys = Object.keys(PROVIDER_PRESETS);
        expect(presetKeys.length).toBeGreaterThan(0);
      });

      it('should have validateLLMConfig return consistent result', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              fc.constant({ provider: 'openai', apiKey: 'test', model: 'gpt-4' }),
              fc.constant({ provider: 'anthropic', apiKey: 'test', model: 'claude-3' }),
              fc.constant({}), // 无效配置
              fc.constant({ provider: 'invalid' }), // 无效 provider
            ),
            (config) => {
              const result = validateLLMConfig(config as any);
              
              // 验证返回结构一致 - validateLLMConfig 返回 { valid: boolean; errors: string[] }
              expect(result).toBeDefined();
              expect(typeof result).toBe('object');
              expect(typeof result.valid).toBe('boolean');
              expect(Array.isArray(result.errors)).toBe(true);
              
              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('1.5 序列化往返一致性', () => {
      it('should have serialize/deserialize maintain round-trip consistency', () => {
        const validSchemas = [
          { version: '1.0', root: { id: 'root-1', type: 'Container', children: [] } },
          { version: '1.0', root: { id: 'root-2', type: 'Text', props: { children: 'hello' } } },
          { version: '1.0', root: { id: 'root-3', type: 'Button', props: { children: 'click' } } },
          { 
            version: '1.0', 
            root: { 
              id: 'root-4', 
              type: 'Container', 
              children: [
                { id: 'child-1', type: 'Text', props: { children: 'nested' } }
              ] 
            } 
          },
        ];
        
        for (const schema of validSchemas) {
          const serialized = serialize(schema as any);
          const deserialized = deserialize(serialized);
          
          expect(deserialized.success).toBe(true);
          if (deserialized.success && deserialized.schema) {
            expect(deserialized.schema).toEqual(schema);
          }
        }
      });
    });

    describe('1.6 数据绑定函数签名一致性', () => {
      it('should have parsePath return consistent structure', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              fc.constant('user.name'),
              fc.constant('items[0].value'),
              fc.constant('data.nested.deep.value'),
              fc.constant('simple'),
              fc.constant('array[0][1][2]'),
            ),
            (path) => {
              const result = parsePath(path);
              
              // 验证返回结构 - parsePath 返回 ParseResult 对象
              expect(result).toBeDefined();
              expect(typeof result).toBe('object');
              expect(typeof result.success).toBe('boolean');
              
              // 如果成功，应该有 segments 数组
              if (result.success) {
                expect(Array.isArray(result.segments)).toBe(true);
                expect(typeof result.expression).toBe('string');
              }
              
              return true;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should have resolveBinding return value or undefined', () => {
        const testData = {
          user: { name: 'John', age: 30 },
          items: [{ value: 1 }, { value: 2 }],
        };
        
        fc.assert(
          fc.property(
            fc.oneof(
              fc.constant('user.name'),
              fc.constant('user.age'),
              fc.constant('items[0].value'),
              fc.constant('nonexistent.path'),
            ),
            (path) => {
              const result = resolveBinding(path, testData);
              
              // 结果应该是值或 undefined
              // 不应该抛出异常
              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
