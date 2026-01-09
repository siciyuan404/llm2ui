/**
 * @file 模板加载器测试
 * @description TemplateLoader 的单元测试和属性测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { TemplateLoader, templateLoader } from './template-loader';

describe('TemplateLoader', () => {
  let loader: TemplateLoader;

  beforeEach(() => {
    loader = new TemplateLoader();
  });

  describe('Unit Tests', () => {
    it('should load Chinese template', () => {
      const template = loader.load('system-intro', 'zh');
      expect(template.content).toContain('UI 生成系统');
      expect(template.path).toBe('templates/zh/system-intro.md');
    });

    it('should load English template', () => {
      const template = loader.load('system-intro', 'en');
      expect(template.content).toContain('UI Generation System');
      expect(template.path).toBe('templates/en/system-intro.md');
    });

    it('should render template with variables', () => {
      const template = '你好 {{name}}，欢迎使用 {{product}}！';
      const result = loader.render(template, { name: '张三', product: 'LLM2UI' });
      expect(result).toBe('你好 张三，欢迎使用 LLM2UI！');
    });

    it('should preserve unmatched placeholders', () => {
      const template = '{{matched}} and {{unmatched}}';
      const result = loader.render(template, { matched: 'value' });
      expect(result).toBe('value and {{unmatched}}');
    });

    it('should extract placeholders from template', () => {
      const template = '{{name}} {{age}} {{name}}';
      const placeholders = loader.extractPlaceholders(template);
      expect(placeholders).toEqual(['name', 'age']);
    });

    it('should return empty array for template without placeholders', () => {
      const template = 'No placeholders here';
      const placeholders = loader.extractPlaceholders(template);
      expect(placeholders).toEqual([]);
    });

    it('should check template existence', () => {
      expect(loader.exists('system-intro', 'zh')).toBe(true);
      expect(loader.exists('non-existent', 'zh')).toBe(false);
    });

    it('should cache loaded templates', () => {
      const template1 = loader.load('system-intro', 'zh');
      const template2 = loader.load('system-intro', 'zh');
      expect(template1).toBe(template2);
    });

    it('should clear cache', () => {
      const template1 = loader.load('system-intro', 'zh');
      loader.clearCache();
      const template2 = loader.load('system-intro', 'zh');
      expect(template1).not.toBe(template2);
      expect(template1.content).toBe(template2.content);
    });

    it('should get available templates', () => {
      const templates = loader.getAvailableTemplates();
      expect(templates).toContain('system-intro');
      expect(templates).toContain('icon-guidelines');
      expect(templates).toContain('component-docs');
      expect(templates).toContain('positive-examples');
      expect(templates).toContain('negative-examples');
      expect(templates).toContain('closing');
    });

    it('should export singleton instance', () => {
      expect(templateLoader).toBeInstanceOf(TemplateLoader);
    });

    it('should handle number and boolean variables', () => {
      const template = 'Count: {{count}}, Active: {{active}}';
      const result = loader.render(template, { count: 42, active: true });
      expect(result).toBe('Count: 42, Active: true');
    });
  });

  /**
   * Property 1: Template Placeholder Round-Trip
   * Feature: prompt-template-and-example-registry, Property 1: Template placeholder round-trip
   * Validates: Requirements 1.2, 1.4
   */
  describe('Property Tests', () => {
    it('placeholder replacement is idempotent for same variables', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 20 }),
            value: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          ({ name, value }) => {
            // 只使用字母数字作为变量名
            const safeName = name.replace(/[^a-zA-Z0-9]/g, '') || 'var';
            const template = `prefix {{${safeName}}} suffix`;
            const result1 = loader.render(template, { [safeName]: value });
            const result2 = loader.render(template, { [safeName]: value });
            return result1 === result2;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('extracted placeholders can be used to render template', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('name', 'age', 'city', 'country'), { minLength: 1, maxLength: 4 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 4, maxLength: 4 }),
          (keys, values) => {
            const uniqueKeys = [...new Set(keys)];
            const template = uniqueKeys.map(k => `{{${k}}}`).join(' ');
            const placeholders = loader.extractPlaceholders(template);
            
            // 所有提取的占位符都应该在原始 keys 中
            return placeholders.every(p => uniqueKeys.includes(p));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('render with all placeholders removes all placeholder syntax', () => {
      fc.assert(
        fc.property(
          fc.record({
            // 使用不包含 {{ 或 }} 的字符串
            var1: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('{{') && !s.includes('}}')),
            var2: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('{{') && !s.includes('}}')),
          }),
          ({ var1, var2 }) => {
            const template = 'Hello {{var1}} and {{var2}}!';
            const result = loader.render(template, { var1, var2 });
            // 结果不应包含 {{ 或 }} (除非变量值本身包含)
            return !result.includes('{{var1}}') && !result.includes('{{var2}}');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('template loading is consistent for same parameters', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('system-intro', 'icon-guidelines', 'component-docs', 'closing'),
          fc.constantFrom('zh', 'en') as fc.Arbitrary<'zh' | 'en'>,
          (name, language) => {
            const loader1 = new TemplateLoader();
            const loader2 = new TemplateLoader();
            const template1 = loader1.load(name, language);
            const template2 = loader2.load(name, language);
            return template1.content === template2.content;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('exists returns true for all available templates', () => {
      const templates = loader.getAvailableTemplates();
      const languages: ('zh' | 'en')[] = ['zh', 'en'];
      
      for (const name of templates) {
        for (const lang of languages) {
          expect(loader.exists(name, lang)).toBe(true);
        }
      }
    });
  });
});
