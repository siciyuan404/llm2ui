/**
 * @file preset-examples.test.ts
 * @description 系统预设案例模块属性测试
 * @module lib/preset-examples.test
 * 
 * **Feature: example-driven-generation**
 * 
 * Property 11: 预设案例完整性
 * 
 * **Validates: Requirements 4.5, 4.6**
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import {
  PRESET_EXAMPLES,
  getPresetExamplesByCategory,
  getPresetExampleById,
  getPresetExampleIds,
  validatePresetExampleTypes,
  type ExampleMetadata,
} from './preset-examples';
import { isStandardCategory } from './example-tags';
import { ComponentCatalog } from './component-catalog';
import { ComponentRegistry } from './component-registry';
import { registerShadcnComponents } from './shadcn-components';

describe('preset-examples', () => {
  let catalog: ComponentCatalog;
  let validTypes: string[];

  beforeAll(() => {
    // Initialize registry with shadcn components
    const registry = new ComponentRegistry();
    registerShadcnComponents(registry);
    catalog = new ComponentCatalog(registry);
    validTypes = catalog.getValidTypes();
  });

  /**
   * Property 11: 预设案例完整性 (Preset Example Completeness)
   * 
   * *对于任意* 预设案例，其 schema 中使用的所有组件类型都应当是 
   * ComponentCatalog 中的有效类型。
   * 
   * **Feature: example-driven-generation, Property 11: 预设案例完整性**
   * **Validates: Requirements 4.5, 4.6**
   */
  it('Property 11: all preset examples use valid component types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PRESET_EXAMPLES),
        (example: ExampleMetadata) => {
          const result = validatePresetExampleTypes(example, validTypes);
          
          // All component types should be valid
          expect(result.valid).toBe(true);
          expect(result.invalidTypes).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11b: 预设案例元数据完整性
   * 
   * *对于任意* 预设案例，应当包含完整的元数据：id、title、description、
   * category、tags、schema、source。
   * 
   * **Feature: example-driven-generation, Property 11: 预设案例完整性**
   * **Validates: Requirements 4.5**
   */
  it('Property 11b: all preset examples have complete metadata', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PRESET_EXAMPLES),
        (example: ExampleMetadata) => {
          // Check required fields exist and are non-empty
          expect(example.id).toBeDefined();
          expect(example.id.length).toBeGreaterThan(0);
          
          expect(example.title).toBeDefined();
          expect(example.title.length).toBeGreaterThan(0);
          
          expect(example.description).toBeDefined();
          expect(example.description.length).toBeGreaterThan(0);
          
          expect(example.category).toBeDefined();
          expect(isStandardCategory(example.category)).toBe(true);
          
          expect(example.tags).toBeDefined();
          expect(Array.isArray(example.tags)).toBe(true);
          expect(example.tags.length).toBeGreaterThan(0);
          
          expect(example.schema).toBeDefined();
          expect(example.schema.version).toBeDefined();
          expect(example.schema.root).toBeDefined();
          
          expect(example.source).toBe('system');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11c: 预设案例 ID 唯一性
   * 
   * *对于任意* 两个不同的预设案例，它们的 ID 应当不同。
   * 
   * **Feature: example-driven-generation, Property 11: 预设案例完整性**
   * **Validates: Requirements 4.5**
   */
  it('Property 11c: all preset example IDs are unique', () => {
    const ids = getPresetExampleIds();
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  /**
   * Property 11d: 预设案例 ID 格式正确
   * 
   * *对于任意* 预设案例，其 ID 应当以 "system-" 开头。
   * 
   * **Feature: example-driven-generation, Property 11: 预设案例完整性**
   * **Validates: Requirements 4.5**
   */
  it('Property 11d: all preset example IDs follow system format', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PRESET_EXAMPLES),
        (example: ExampleMetadata) => {
          expect(example.id.startsWith('system-')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 测试按分类获取预设案例
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
   */
  describe('getPresetExamplesByCategory', () => {
    it('should return layout examples', () => {
      const layoutExamples = getPresetExamplesByCategory('layout');
      expect(layoutExamples.length).toBe(4);
      
      const titles = layoutExamples.map(e => e.title);
      expect(titles).toContain('Admin 侧边栏');
      expect(titles).toContain('顶部导航栏');
      expect(titles).toContain('三栏布局');
      expect(titles).toContain('响应式容器');
    });

    it('should return form examples', () => {
      const formExamples = getPresetExamplesByCategory('form');
      expect(formExamples.length).toBe(4);
      
      const titles = formExamples.map(e => e.title);
      expect(titles).toContain('登录表单');
      expect(titles).toContain('注册表单');
      expect(titles).toContain('搜索表单');
      expect(titles).toContain('设置表单');
    });

    it('should return navigation examples', () => {
      const navExamples = getPresetExamplesByCategory('navigation');
      expect(navExamples.length).toBe(3);
      
      const titles = navExamples.map(e => e.title);
      expect(titles).toContain('面包屑导航');
      expect(titles).toContain('标签页导航');
      expect(titles).toContain('步骤导航');
    });

    it('should return dashboard examples', () => {
      const dashboardExamples = getPresetExamplesByCategory('dashboard');
      expect(dashboardExamples.length).toBe(3);
      
      const titles = dashboardExamples.map(e => e.title);
      expect(titles).toContain('数据卡片组');
      expect(titles).toContain('统计面板');
      expect(titles).toContain('列表页面');
    });

    it('should return empty array for categories without examples', () => {
      const displayExamples = getPresetExamplesByCategory('display');
      expect(displayExamples).toHaveLength(0);
      
      const feedbackExamples = getPresetExamplesByCategory('feedback');
      expect(feedbackExamples).toHaveLength(0);
    });
  });

  /**
   * 测试按 ID 获取预设案例
   */
  describe('getPresetExampleById', () => {
    it('should return example for valid ID', () => {
      const example = getPresetExampleById('system-layout-admin-sidebar');
      expect(example).toBeDefined();
      expect(example!.title).toBe('Admin 侧边栏');
    });

    it('should return undefined for invalid ID', () => {
      const example = getPresetExampleById('non-existent-id');
      expect(example).toBeUndefined();
    });

    it('should return correct example for all preset IDs', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRESET_EXAMPLES),
          (example: ExampleMetadata) => {
            const retrieved = getPresetExampleById(example.id);
            expect(retrieved).toBeDefined();
            expect(retrieved!.id).toBe(example.id);
            expect(retrieved!.title).toBe(example.title);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 测试预设案例总数
   */
  describe('PRESET_EXAMPLES', () => {
    it('should have correct total count', () => {
      // 4 layout + 4 form + 3 navigation + 3 dashboard = 14
      expect(PRESET_EXAMPLES.length).toBe(14);
    });

    it('should cover all required categories', () => {
      const categories = new Set(PRESET_EXAMPLES.map(e => e.category));
      expect(categories.has('layout')).toBe(true);
      expect(categories.has('form')).toBe(true);
      expect(categories.has('navigation')).toBe(true);
      expect(categories.has('dashboard')).toBe(true);
    });
  });

  /**
   * 测试 validatePresetExampleTypes 函数
   */
  describe('validatePresetExampleTypes', () => {
    it('should return valid for examples with valid types', () => {
      const example = getPresetExampleById('system-form-login')!;
      const result = validatePresetExampleTypes(example, validTypes);
      expect(result.valid).toBe(true);
      expect(result.invalidTypes).toHaveLength(0);
    });

    it('should return invalid types for examples with unknown types', () => {
      const invalidExample: ExampleMetadata = {
        id: 'test-invalid',
        title: 'Test',
        description: 'Test',
        category: 'form',
        tags: ['test'],
        source: 'system',
        schema: {
          version: '1.0',
          root: {
            id: 'test',
            type: 'UnknownComponent',
            children: [
              {
                id: 'child',
                type: 'AnotherUnknown',
              },
            ],
          },
        },
      };
      
      const result = validatePresetExampleTypes(invalidExample, validTypes);
      expect(result.valid).toBe(false);
      expect(result.invalidTypes).toContain('UnknownComponent');
      expect(result.invalidTypes).toContain('AnotherUnknown');
    });
  });
});
