/**
 * @file import-compat-pbt.test.ts
 * @description Property-based test for backward compatibility of imports
 * 
 * **Feature: codebase-refactor, Property 8: 向后兼容**
 * **Validates: Requirements 8.1, 8.2, 8.3**
 * 
 * 验证重构后所有公共 API 仍然可以通过 @/lib 导入，且类型签名保持不变。
 * 
 * Note: This test imports from submodules directly to avoid monaco-editor
 * initialization issues in the test environment. The actual index.ts
 * re-exports these same modules.
 * 
 * @module lib
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ============================================================================
// Import from submodules directly to avoid monaco-editor issues
// ============================================================================

// Core module exports
import {
  ComponentRegistry,
  defaultRegistry,
  ComponentCatalog,
  defaultCatalog,
  render,
  UIRenderer,
  validateJSON,
  validateUISchema,
  validateUISchemaEnhanced,
  fixUISchema,
  parsePath,
  resolveBinding,
  serialize,
  deserialize,
  registerShadcnComponents,
} from './core';

// LLM module exports
import {
  validateLLMConfig,
  sendMessage,
  extractJSON,
  extractUISchema,
  PROVIDER_PRESETS,
  getProviderPreset,
  generateSystemPrompt,
  StreamingValidator,
  executeWithRetry,
} from './llm';

// Design System module exports
import {
  getDefaultDesignTokens,
  formatTokensForLLM,
  TokenUsageRegistry,
  ComponentMappingRegistry,
  validateTokenCompliance,
  injectConstraints,
  executeValidationChain,
} from './design-system';

// Examples module exports
import {
  STANDARD_TAGS,
  PRESET_EXAMPLES,
  ExampleLibrary,
  ExampleRetriever,
  ExampleInjector,
} from './examples';

// Utils module exports (excluding monaco - import specific items)
import { cn, generateId } from './utils/utils';
import {
  LLM2UIError,
  NetworkError,
  SchemaError,
  fetchWithRetry,
} from './utils/error-handling';
import { PlatformAdapter } from './utils/platform-adapter';
import { IconRegistry } from './utils/icon-registry';
import { SchemaGenerator } from './utils/schema-generator';
import { exportToJSON, exportToReact } from './utils/export';

// State management exports
import {
  createInitialChatState,
  createMessage,
  createConversation,
  createInitialEditorState,
  createInitialLayoutState,
} from './state-management';

// Themes module exports
import * as Themes from './themes';

// Verify namespace structure by importing submodules
import * as Core from './core';
import * as DesignSystem from './design-system';
import * as Examples from './examples';
import * as LLM from './llm';


describe('Import Compatibility - Property-Based Tests', () => {
  describe('Property 8: 向后兼容 (Backward Compatibility)', () => {
    
    describe('8.1 命名空间导出可用', () => {
      it('should export all namespace modules', () => {
        expect(Core).toBeDefined();
        expect(DesignSystem).toBeDefined();
        expect(Themes).toBeDefined();
        expect(Examples).toBeDefined();
        expect(LLM).toBeDefined();
      });

      it('should have correct namespace structure', () => {
        const namespaces = [
          { name: 'Core', module: Core },
          { name: 'DesignSystem', module: DesignSystem },
          { name: 'Themes', module: Themes },
          { name: 'Examples', module: Examples },
          { name: 'LLM', module: LLM },
        ];

        fc.assert(
          fc.property(
            fc.constantFrom(...namespaces),
            ({ module }) => {
              expect(module).toBeDefined();
              expect(typeof module).toBe('object');
              return true;
            }
          ),
          { numRuns: namespaces.length }
        );
      });
    });

    describe('8.2 Core 模块导出', () => {
      const coreExports = [
        { name: 'ComponentRegistry', value: ComponentRegistry, type: 'function' },
        { name: 'defaultRegistry', value: defaultRegistry, type: 'object' },
        { name: 'ComponentCatalog', value: ComponentCatalog, type: 'function' },
        { name: 'defaultCatalog', value: defaultCatalog, type: 'object' },
        { name: 'render', value: render, type: 'function' },
        { name: 'UIRenderer', value: UIRenderer, type: 'function' },
        { name: 'validateJSON', value: validateJSON, type: 'function' },
        { name: 'validateUISchema', value: validateUISchema, type: 'function' },
        { name: 'validateUISchemaEnhanced', value: validateUISchemaEnhanced, type: 'function' },
        { name: 'fixUISchema', value: fixUISchema, type: 'function' },
        { name: 'parsePath', value: parsePath, type: 'function' },
        { name: 'resolveBinding', value: resolveBinding, type: 'function' },
        { name: 'serialize', value: serialize, type: 'function' },
        { name: 'deserialize', value: deserialize, type: 'function' },
        { name: 'registerShadcnComponents', value: registerShadcnComponents, type: 'function' },
      ];

      it('should export all core APIs', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...coreExports),
            ({ value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: coreExports.length }
        );
      });

      it('should have ComponentRegistry with correct interface', () => {
        const registry = new ComponentRegistry();
        expect(typeof registry.register).toBe('function');
        expect(typeof registry.get).toBe('function');
        expect(typeof registry.getAll).toBe('function');
        expect(typeof registry.has).toBe('function');
        expect(typeof registry.unregister).toBe('function');
        expect(typeof registry.size).toBe('number');
      });
    });


    describe('8.3 LLM 模块导出', () => {
      const llmExports = [
        { name: 'validateLLMConfig', value: validateLLMConfig, type: 'function' },
        { name: 'sendMessage', value: sendMessage, type: 'function' },
        { name: 'extractJSON', value: extractJSON, type: 'function' },
        { name: 'extractUISchema', value: extractUISchema, type: 'function' },
        { name: 'PROVIDER_PRESETS', value: PROVIDER_PRESETS, type: 'object' },
        { name: 'getProviderPreset', value: getProviderPreset, type: 'function' },
        { name: 'generateSystemPrompt', value: generateSystemPrompt, type: 'function' },
        { name: 'StreamingValidator', value: StreamingValidator, type: 'function' },
        { name: 'executeWithRetry', value: executeWithRetry, type: 'function' },
      ];

      it('should export all LLM APIs', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...llmExports),
            ({ value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: llmExports.length }
        );
      });
    });

    describe('8.4 Design System 模块导出', () => {
      const designSystemExports = [
        { name: 'getDefaultDesignTokens', value: getDefaultDesignTokens, type: 'function' },
        { name: 'formatTokensForLLM', value: formatTokensForLLM, type: 'function' },
        { name: 'TokenUsageRegistry', value: TokenUsageRegistry, type: 'function' },
        { name: 'ComponentMappingRegistry', value: ComponentMappingRegistry, type: 'function' },
        { name: 'validateTokenCompliance', value: validateTokenCompliance, type: 'function' },
        { name: 'injectConstraints', value: injectConstraints, type: 'function' },
        { name: 'executeValidationChain', value: executeValidationChain, type: 'function' },
      ];

      it('should export all Design System APIs', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...designSystemExports),
            ({ value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: designSystemExports.length }
        );
      });

      it('should have getDefaultDesignTokens return valid tokens', () => {
        const tokens = getDefaultDesignTokens();
        expect(tokens).toBeDefined();
        expect(tokens.colors).toBeDefined();
        expect(tokens.spacing).toBeDefined();
        expect(tokens.typography).toBeDefined();
      });
    });

    describe('8.5 Examples 模块导出', () => {
      const examplesExports = [
        { name: 'STANDARD_TAGS', value: STANDARD_TAGS, type: 'object' },
        { name: 'PRESET_EXAMPLES', value: PRESET_EXAMPLES, type: 'object' },
        { name: 'ExampleLibrary', value: ExampleLibrary, type: 'function' },
        { name: 'ExampleRetriever', value: ExampleRetriever, type: 'function' },
        { name: 'ExampleInjector', value: ExampleInjector, type: 'function' },
      ];

      it('should export all Examples APIs', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...examplesExports),
            ({ value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: examplesExports.length }
        );
      });
    });


    describe('8.6 Utils 模块导出', () => {
      const utilsExports = [
        { name: 'cn', value: cn, type: 'function' },
        { name: 'generateId', value: generateId, type: 'function' },
        { name: 'PlatformAdapter', value: PlatformAdapter, type: 'function' },
        { name: 'IconRegistry', value: IconRegistry, type: 'function' },
        { name: 'SchemaGenerator', value: SchemaGenerator, type: 'function' },
        { name: 'exportToJSON', value: exportToJSON, type: 'function' },
        { name: 'exportToReact', value: exportToReact, type: 'function' },
      ];

      it('should export all Utils APIs', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...utilsExports),
            ({ value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: utilsExports.length }
        );
      });

      it('should have cn function work correctly', () => {
        fc.assert(
          fc.property(
            fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
            (classNames) => {
              const result = cn(...classNames);
              expect(typeof result).toBe('string');
              return true;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should have generateId return unique strings', () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 1, max: 10 }),
            (count) => {
              const ids = Array.from({ length: count }, () => generateId());
              const uniqueIds = new Set(ids);
              return uniqueIds.size === count;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('8.7 State Management 导出', () => {
      const stateExports = [
        { name: 'createInitialChatState', value: createInitialChatState, type: 'function' },
        { name: 'createMessage', value: createMessage, type: 'function' },
        { name: 'createConversation', value: createConversation, type: 'function' },
        { name: 'createInitialEditorState', value: createInitialEditorState, type: 'function' },
        { name: 'createInitialLayoutState', value: createInitialLayoutState, type: 'function' },
      ];

      it('should export all State Management APIs', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...stateExports),
            ({ value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: stateExports.length }
        );
      });
    });


    describe('8.8 Error Handling 导出', () => {
      const errorExports = [
        { name: 'LLM2UIError', value: LLM2UIError, type: 'function' },
        { name: 'NetworkError', value: NetworkError, type: 'function' },
        { name: 'SchemaError', value: SchemaError, type: 'function' },
        { name: 'fetchWithRetry', value: fetchWithRetry, type: 'function' },
      ];

      it('should export all Error Handling APIs', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...errorExports),
            ({ value, type }) => {
              expect(value).toBeDefined();
              expect(typeof value).toBe(type);
              return true;
            }
          ),
          { numRuns: errorExports.length }
        );
      });

      it('should have error classes extend Error', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1 }),
            (message) => {
              const llm2uiError = new LLM2UIError(message, 'TEST_CODE');
              expect(llm2uiError instanceof Error).toBe(true);
              expect(llm2uiError.message).toBe(message);
              
              const networkError = new NetworkError(message, { statusCode: 500 });
              expect(networkError instanceof Error).toBe(true);
              expect(networkError.message).toBe(message);
              
              const schemaError = new SchemaError(message, '/test/path');
              expect(schemaError instanceof Error).toBe(true);
              expect(schemaError.message).toBe(message);
              
              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('8.9 API 签名不变性', () => {
      it('should have validateUISchema accept schema and return result', () => {
        const testSchemas = [
          { type: 'Container', children: [] },
          { type: 'Text', props: { children: 'test' } },
          { type: 'Button', props: { children: 'Click' } },
        ];
        
        for (const schema of testSchemas) {
          const result = validateUISchema(schema);
          expect(result).toBeDefined();
          expect(typeof result.valid).toBe('boolean');
          expect(Array.isArray(result.errors)).toBe(true);
        }
      });

      it('should have serialize/deserialize be inverse operations for valid UISchema', () => {
        const validSchemas = [
          { version: '1.0', root: { id: 'root-1', type: 'Container', children: [] } },
          { version: '1.0', root: { id: 'root-2', type: 'Text', props: { children: 'hello' } } },
          { version: '1.0', root: { id: 'root-3', type: 'Button', props: { children: 'click' } } },
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
  });
});
