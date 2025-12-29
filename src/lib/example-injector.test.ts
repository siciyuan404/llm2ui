/**
 * @file example-injector.test.ts
 * @description 案例注入器模块属性测试
 * @module lib/example-injector.test
 * 
 * **Feature: example-driven-generation**
 * 
 * Property 9: 案例注入格式完整性
 * Property 10: 注入开关有效性
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ExampleInjector, createExampleInjector, type InjectionOptions } from './example-injector';
import { PRESET_EXAMPLES, type ExampleMetadata } from './preset-examples';
import type { UISchema } from '../types';

/**
 * 生成任意 ExampleMetadata 的 arbitrary
 */
const exampleMetadataArb = fc.record({
  id: fc.string({ minLength: 5, maxLength: 30 }).map(s => `test-${s.replace(/[^a-z0-9]/gi, '')}`),
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  category: fc.constantFrom('layout', 'form', 'navigation', 'dashboard', 'display', 'feedback') as fc.Arbitrary<ExampleMetadata['category']>,
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
  schema: fc.constant({
    version: '1.0',
    root: { id: 'test-root', type: 'Container' },
  } as UISchema),
  source: fc.constantFrom('system', 'custom') as fc.Arbitrary<'system' | 'custom'>,
});

describe('example-injector', () => {
  /**
   * Property 9: 案例注入格式完整性 (Example Injection Format Completeness)
   * 
   * *对于任意* 非空案例列表，ExampleInjector.format 返回的文本应当包含：
   * (1) "参考案例" 标题，(2) 引导说明，(3) 每个案例的标题、描述和 JSON schema。
   * 
   * **Feature: example-driven-generation, Property 9: 案例注入格式完整性**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
   */
  describe('Property 9: Example Injection Format Completeness', () => {
    it('should include title, guidance, and all example details in formatted output (Chinese)', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(exampleMetadataArb, { minLength: 1, maxLength: 5 }),
          (examples: ExampleMetadata[]) => {
            const result = injector.format(examples, { language: 'zh' });
            
            // Should contain title "参考案例"
            expect(result).toContain('## 参考案例');
            
            // Should contain guidance text
            expect(result).toContain('以下是一些参考案例');
            
            // Should contain each example's title, description, and schema
            for (const example of examples) {
              expect(result).toContain(example.title);
              expect(result).toContain(example.description);
              expect(result).toContain(JSON.stringify(example.schema, null, 2));
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include title, guidance, and all example details in formatted output (English)', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(exampleMetadataArb, { minLength: 1, maxLength: 5 }),
          (examples: ExampleMetadata[]) => {
            const result = injector.format(examples, { language: 'en' });
            
            // Should contain title "Reference Examples"
            expect(result).toContain('## Reference Examples');
            
            // Should contain guidance text
            expect(result).toContain('Below are some reference examples');
            
            // Should contain each example's title, description, and schema
            for (const example of examples) {
              expect(result).toContain(example.title);
              expect(result).toContain(example.description);
              expect(result).toContain(JSON.stringify(example.schema, null, 2));
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format preset examples correctly', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...PRESET_EXAMPLES), { minLength: 1, maxLength: 3 }),
          (examples: ExampleMetadata[]) => {
            const result = injector.format(examples);
            
            // Should contain title
            expect(result).toContain('## 参考案例');
            
            // Should contain each example
            for (const example of examples) {
              expect(result).toContain(example.title);
              expect(result).toContain(example.description);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include numbered example labels', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(exampleMetadataArb, { minLength: 1, maxLength: 5 }),
          (examples: ExampleMetadata[]) => {
            const resultZh = injector.format(examples, { language: 'zh' });
            const resultEn = injector.format(examples, { language: 'en' });
            
            // Should contain numbered labels for each example
            for (let i = 0; i < examples.length; i++) {
              expect(resultZh).toContain(`### 案例 ${i + 1}:`);
              expect(resultEn).toContain(`### Example ${i + 1}:`);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include JSON code blocks when includeSchema is true', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(exampleMetadataArb, { minLength: 1, maxLength: 3 }),
          (examples: ExampleMetadata[]) => {
            const result = injector.format(examples, { includeSchema: true });
            
            // Should contain JSON code blocks
            expect(result).toContain('```json');
            expect(result).toContain('```');
            
            // Should contain schema content
            for (const example of examples) {
              expect(result).toContain('"version"');
              expect(result).toContain('"root"');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not include JSON code blocks when includeSchema is false', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(exampleMetadataArb, { minLength: 1, maxLength: 3 }),
          (examples: ExampleMetadata[]) => {
            const result = injector.format(examples, { includeSchema: false });
            
            // Should not contain JSON code blocks
            expect(result).not.toContain('```json');
            
            // Should still contain title and description
            for (const example of examples) {
              expect(result).toContain(example.title);
              expect(result).toContain(example.description);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 10: 注入开关有效性 (Injection Switch Effectiveness)
   * 
   * *对于任意* 案例列表，当 InjectionOptions.enabled 为 false 时，
   * ExampleInjector.format 应当返回空字符串。
   * 
   * **Feature: example-driven-generation, Property 10: 注入开关有效性**
   * **Validates: Requirements 3.6**
   */
  describe('Property 10: Injection Switch Effectiveness', () => {
    it('should return empty string when enabled is false', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(exampleMetadataArb, { minLength: 0, maxLength: 5 }),
          (examples: ExampleMetadata[]) => {
            const result = injector.format(examples, { enabled: false });
            
            // Should return empty string
            expect(result).toBe('');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty string when enabled is false regardless of other options', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(exampleMetadataArb, { minLength: 1, maxLength: 5 }),
          fc.constantFrom('zh', 'en') as fc.Arbitrary<'zh' | 'en'>,
          fc.boolean(),
          (examples: ExampleMetadata[], language: 'zh' | 'en', includeSchema: boolean) => {
            const result = injector.format(examples, {
              enabled: false,
              language,
              includeSchema,
            });
            
            // Should return empty string regardless of other options
            expect(result).toBe('');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return non-empty string when enabled is true with non-empty examples', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(exampleMetadataArb, { minLength: 1, maxLength: 5 }),
          (examples: ExampleMetadata[]) => {
            const result = injector.format(examples, { enabled: true });
            
            // Should return non-empty string
            expect(result.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use default enabled=true when not specified', () => {
      const injector = new ExampleInjector();
      
      fc.assert(
        fc.property(
          fc.array(exampleMetadataArb, { minLength: 1, maxLength: 3 }),
          (examples: ExampleMetadata[]) => {
            const resultWithoutOption = injector.format(examples);
            const resultWithEnabled = injector.format(examples, { enabled: true });
            
            // Both should return non-empty strings
            expect(resultWithoutOption.length).toBeGreaterThan(0);
            expect(resultWithEnabled.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Unit tests for default examples (Requirements 3.5)
   */
  describe('Default Examples', () => {
    it('should use default examples when empty array is provided', () => {
      const injector = new ExampleInjector();
      const result = injector.format([]);
      
      // Should return non-empty string with default examples
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('## 参考案例');
    });

    it('should return default examples containing layout and form categories', () => {
      const injector = new ExampleInjector();
      const defaults = injector.getDefaultExamples();
      
      // Should have at least one example
      expect(defaults.length).toBeGreaterThan(0);
      
      // Should contain layout and form examples
      const categories = defaults.map(e => e.category);
      expect(categories).toContain('layout');
      expect(categories).toContain('form');
    });

    it('should return complete metadata for default examples', () => {
      const injector = new ExampleInjector();
      const defaults = injector.getDefaultExamples();
      
      for (const example of defaults) {
        expect(example.id).toBeDefined();
        expect(example.title).toBeDefined();
        expect(example.description).toBeDefined();
        expect(example.category).toBeDefined();
        expect(example.tags).toBeDefined();
        expect(example.schema).toBeDefined();
        expect(example.source).toBeDefined();
      }
    });
  });

  /**
   * Unit tests for guidance generation
   */
  describe('Guidance Generation', () => {
    it('should generate Chinese guidance', () => {
      const injector = new ExampleInjector();
      const guidance = injector.generateGuidance('zh');
      
      expect(guidance).toContain('参考案例');
      expect(guidance).toContain('不要直接复制');
    });

    it('should generate English guidance', () => {
      const injector = new ExampleInjector();
      const guidance = injector.generateGuidance('en');
      
      expect(guidance).toContain('reference examples');
      expect(guidance).toContain('Do not copy');
    });
  });

  /**
   * Unit tests for createExampleInjector factory
   */
  describe('createExampleInjector', () => {
    it('should create a working ExampleInjector instance', () => {
      const injector = createExampleInjector();
      
      expect(injector).toBeInstanceOf(ExampleInjector);
      expect(typeof injector.format).toBe('function');
      expect(typeof injector.getDefaultExamples).toBe('function');
      expect(typeof injector.generateGuidance).toBe('function');
    });
  });
});
