/**
 * @file 提示词构建器测试
 * @description PromptBuilder 的单元测试和属性测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { PromptBuilder, createPromptBuilder } from './prompt-builder';

describe('PromptBuilder', () => {
  let builder: PromptBuilder;

  beforeEach(() => {
    builder = new PromptBuilder();
  });

  describe('Unit Tests', () => {
    it('should create empty builder', () => {
      const result = builder.build();
      expect(result.prompt).toBe('');
      expect(result.tokenCount).toBe(0);
      expect(result.sections).toEqual([]);
      expect(result.trimmed).toBe(false);
    });

    it('should add system intro', () => {
      const result = builder.withSystemIntro().build();
      expect(result.sections).toContain('system-intro');
      expect(result.prompt).toContain('UI');
      expect(result.tokenCount).toBeGreaterThan(0);
    });

    it('should add icon guidelines', () => {
      const result = builder.withIconGuidelines().build();
      expect(result.sections).toContain('icon-guidelines');
      expect(result.prompt).toContain('Icon');
    });

    it('should add component docs', () => {
      const result = builder.withComponentDocs().build();
      expect(result.sections).toContain('component-docs');
      expect(result.prompt).toContain('Box');
    });

    it('should add positive examples', () => {
      const result = builder.withExamples('Custom example').build();
      expect(result.sections).toContain('positive-examples');
      expect(result.prompt).toContain('Custom example');
    });

    it('should add negative examples', () => {
      const result = builder.withNegativeExamples().build();
      expect(result.sections).toContain('negative-examples');
      expect(result.prompt).toContain('Emoji');
    });

    it('should add closing with user input', () => {
      const result = builder.withClosing('Create a login form').build();
      expect(result.sections).toContain('closing');
      expect(result.prompt).toContain('Create a login form');
    });

    it('should support method chaining', () => {
      const result = builder
        .withSystemIntro()
        .withIconGuidelines()
        .withComponentDocs()
        .withExamples()
        .withNegativeExamples()
        .withClosing('Test')
        .build();

      expect(result.sections).toHaveLength(6);
      expect(result.sections).toEqual([
        'system-intro',
        'icon-guidelines',
        'component-docs',
        'positive-examples',
        'negative-examples',
        'closing',
      ]);
    });

    it('should support English language', () => {
      const builder = new PromptBuilder({ language: 'en' });
      const result = builder.withSystemIntro().build();
      expect(result.prompt).toContain('UI Generation System');
    });

    it('should support Chinese language', () => {
      const builder = new PromptBuilder({ language: 'zh' });
      const result = builder.withSystemIntro().build();
      expect(result.prompt).toContain('UI 生成系统');
    });

    it('should trim sections when exceeding maxTokens', () => {
      const builder = new PromptBuilder({ maxTokens: 50 });
      const result = builder
        .withSystemIntro()
        .withIconGuidelines()
        .withComponentDocs()
        .build();

      expect(result.trimmed).toBe(true);
      expect(result.trimmedSections).toBeDefined();
      expect(result.tokenCount).toBeLessThanOrEqual(50);
    });

    it('should reset builder', () => {
      builder.withSystemIntro().withIconGuidelines();
      expect(builder.getCurrentSections()).toHaveLength(2);
      
      builder.reset();
      expect(builder.getCurrentSections()).toHaveLength(0);
    });

    it('should get current token count', () => {
      builder.withSystemIntro();
      const tokenCount = builder.getCurrentTokenCount();
      expect(tokenCount).toBeGreaterThan(0);
    });

    it('should add custom section', () => {
      const result = builder
        .withCustomSection('custom', 'Custom content', 3)
        .build();
      expect(result.sections).toContain('custom');
      expect(result.prompt).toContain('Custom content');
    });

    it('should add relevant examples', () => {
      const result = builder
        .withRelevantExamples('Relevant example content')
        .build();
      expect(result.sections).toContain('relevant-examples');
      expect(result.prompt).toContain('Relevant example content');
    });

    it('should use factory function', () => {
      const builder = createPromptBuilder({ language: 'en' });
      expect(builder).toBeInstanceOf(PromptBuilder);
    });
  });

  /**
   * Property 3: Prompt Building Order Preservation
   * Feature: prompt-template-and-example-registry, Property 3: Prompt building order preservation
   * Validates: Requirements 3.1, 3.2, 3.6
   */
  describe('Property Tests', () => {
    it('sections appear in order added', () => {
      fc.assert(
        fc.property(
          fc.shuffledSubarray(
            ['systemIntro', 'iconGuidelines', 'componentDocs', 'examples', 'negativeExamples', 'closing'],
            { minLength: 1 }
          ),
          (methods) => {
            const builder = new PromptBuilder();
            const expectedSections: string[] = [];

            for (const method of methods) {
              switch (method) {
                case 'systemIntro':
                  builder.withSystemIntro();
                  expectedSections.push('system-intro');
                  break;
                case 'iconGuidelines':
                  builder.withIconGuidelines();
                  expectedSections.push('icon-guidelines');
                  break;
                case 'componentDocs':
                  builder.withComponentDocs();
                  expectedSections.push('component-docs');
                  break;
                case 'examples':
                  builder.withExamples();
                  expectedSections.push('positive-examples');
                  break;
                case 'negativeExamples':
                  builder.withNegativeExamples();
                  expectedSections.push('negative-examples');
                  break;
                case 'closing':
                  builder.withClosing('test');
                  expectedSections.push('closing');
                  break;
              }
            }

            const result = builder.build();
            // 验证顺序一致
            return JSON.stringify(result.sections) === JSON.stringify(expectedSections);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('build result contains all added sections', () => {
      fc.assert(
        fc.property(
          fc.subarray(['system-intro', 'icon-guidelines', 'component-docs']),
          (sectionNames) => {
            const builder = new PromptBuilder();
            
            for (const name of sectionNames) {
              switch (name) {
                case 'system-intro':
                  builder.withSystemIntro();
                  break;
                case 'icon-guidelines':
                  builder.withIconGuidelines();
                  break;
                case 'component-docs':
                  builder.withComponentDocs();
                  break;
              }
            }

            const result = builder.build();
            // 所有添加的部分都应该在结果中
            return sectionNames.every(s => result.sections.includes(s));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('token count is consistent with prompt length', () => {
      fc.assert(
        fc.property(
          fc.subarray(['system-intro', 'icon-guidelines', 'component-docs']),
          (sectionNames) => {
            const builder = new PromptBuilder();
            
            for (const name of sectionNames) {
              switch (name) {
                case 'system-intro':
                  builder.withSystemIntro();
                  break;
                case 'icon-guidelines':
                  builder.withIconGuidelines();
                  break;
                case 'component-docs':
                  builder.withComponentDocs();
                  break;
              }
            }

            const result = builder.build();
            // Token 数应该与 prompt 长度正相关
            if (result.prompt.length === 0) {
              return result.tokenCount === 0;
            }
            return result.tokenCount > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('trimmed result has fewer or equal tokens than maxTokens', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }),
          (maxTokens) => {
            const builder = new PromptBuilder({ maxTokens });
            const result = builder
              .withSystemIntro()
              .withIconGuidelines()
              .withComponentDocs()
              .withExamples()
              .withNegativeExamples()
              .withClosing('test')
              .build();

            return result.tokenCount <= maxTokens;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('reset clears all sections', () => {
      fc.assert(
        fc.property(
          fc.subarray(['system-intro', 'icon-guidelines', 'component-docs']),
          (sectionNames) => {
            const builder = new PromptBuilder();
            
            for (const name of sectionNames) {
              switch (name) {
                case 'system-intro':
                  builder.withSystemIntro();
                  break;
                case 'icon-guidelines':
                  builder.withIconGuidelines();
                  break;
                case 'component-docs':
                  builder.withComponentDocs();
                  break;
              }
            }

            builder.reset();
            const result = builder.build();
            return result.sections.length === 0 && result.prompt === '';
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
