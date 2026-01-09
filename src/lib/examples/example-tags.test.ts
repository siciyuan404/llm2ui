/**
 * @file example-tags.test.ts
 * @description 案例标签体系模块单元测试
 * @module lib/examples/example-tags.test
 * 
 * **Feature: example-driven-generation**
 * 
 * 测试标准分类和标签的获取、验证逻辑
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
 */

import { describe, it, expect } from 'vitest';
import type { ExampleCategory } from './example-tags';
import {
  STANDARD_TAGS,
  getStandardCategories,
  getStandardTags,
  isStandardCategory,
  isStandardTag,
  validateCategory,
  getCategoryLabel,
  getCategoryDescription,
} from './example-tags';

describe('example-tags', () => {
  /**
   * 测试标准分类获取
   * **Validates: Requirements 7.1**
   */
  describe('getStandardCategories', () => {
    it('should return all 6 standard categories', () => {
      const categories = getStandardCategories();
      expect(categories).toHaveLength(6);
    });

    it('should include all required categories', () => {
      const categories = getStandardCategories();
      const expectedCategories: ExampleCategory[] = [
        'layout',
        'form',
        'navigation',
        'dashboard',
        'display',
        'feedback',
      ];
      
      for (const expected of expectedCategories) {
        expect(categories).toContain(expected);
      }
    });

    it('should return a new array each time (immutability)', () => {
      const categories1 = getStandardCategories();
      const categories2 = getStandardCategories();
      expect(categories1).not.toBe(categories2);
      expect(categories1).toEqual(categories2);
    });
  });

  /**
   * 测试标准标签获取
   * **Validates: Requirements 7.2**
   */
  describe('getStandardTags', () => {
    it('should return all standard tags', () => {
      const tags = getStandardTags();
      expect(tags.length).toBeGreaterThan(0);
      expect(tags.length).toBe(STANDARD_TAGS.length);
    });

    it('should include layout-related tags', () => {
      const tags = getStandardTags();
      const layoutTags = ['sidebar', 'header', 'footer', 'navbar', 'responsive'];
      for (const tag of layoutTags) {
        expect(tags).toContain(tag);
      }
    });

    it('should include component-related tags', () => {
      const tags = getStandardTags();
      const componentTags = ['card', 'table', 'list', 'modal', 'drawer', 'carousel'];
      for (const tag of componentTags) {
        expect(tags).toContain(tag);
      }
    });

    it('should include navigation-related tags', () => {
      const tags = getStandardTags();
      const navTags = ['breadcrumb', 'tabs', 'steps'];
      for (const tag of navTags) {
        expect(tags).toContain(tag);
      }
    });

    it('should include function-related tags', () => {
      const tags = getStandardTags();
      const funcTags = ['search', 'login', 'register', 'settings', 'profile'];
      for (const tag of funcTags) {
        expect(tags).toContain(tag);
      }
    });

    it('should include scenario-related tags', () => {
      const tags = getStandardTags();
      const scenarioTags = ['admin', 'mobile'];
      for (const tag of scenarioTags) {
        expect(tags).toContain(tag);
      }
    });

    it('should return a new array each time (immutability)', () => {
      const tags1 = getStandardTags();
      const tags2 = getStandardTags();
      expect(tags1).not.toBe(tags2);
      expect(tags1).toEqual(tags2);
    });
  });

  /**
   * 测试标准分类检查
   * **Validates: Requirements 7.1, 7.3**
   */
  describe('isStandardCategory', () => {
    it('should return true for all standard categories', () => {
      const standardCategories: ExampleCategory[] = [
        'layout',
        'form',
        'navigation',
        'dashboard',
        'display',
        'feedback',
      ];
      
      for (const category of standardCategories) {
        expect(isStandardCategory(category)).toBe(true);
      }
    });

    it('should return false for non-standard categories', () => {
      const nonStandardCategories = ['custom', 'other', 'unknown', '', 'Layout', 'FORM'];
      
      for (const category of nonStandardCategories) {
        expect(isStandardCategory(category)).toBe(false);
      }
    });
  });

  /**
   * 测试标准标签检查
   * **Validates: Requirements 7.2, 7.4**
   */
  describe('isStandardTag', () => {
    it('should return true for all standard tags', () => {
      for (const tag of STANDARD_TAGS) {
        expect(isStandardTag(tag)).toBe(true);
      }
    });

    it('should return false for non-standard tags', () => {
      const nonStandardTags = ['custom-tag', 'unknown', '', 'Sidebar', 'HEADER'];
      
      for (const tag of nonStandardTags) {
        expect(isStandardTag(tag)).toBe(false);
      }
    });
  });

  /**
   * 测试分类验证逻辑
   * **Validates: Requirements 7.3, 7.4 (Property 14)**
   */
  describe('validateCategory', () => {
    it('should return valid: true without warning for standard categories', () => {
      const standardCategories: ExampleCategory[] = [
        'layout',
        'form',
        'navigation',
        'dashboard',
        'display',
        'feedback',
      ];
      
      for (const category of standardCategories) {
        const result = validateCategory(category);
        expect(result.valid).toBe(true);
        expect(result.warning).toBeUndefined();
      }
    });

    it('should return valid: true with warning for non-standard categories', () => {
      const nonStandardCategories = ['custom', 'other', 'my-category'];
      
      for (const category of nonStandardCategories) {
        const result = validateCategory(category);
        expect(result.valid).toBe(true);
        expect(result.warning).toBeDefined();
        expect(result.warning).toContain(category);
        expect(result.warning).toContain('不是标准分类');
      }
    });

    it('should include standard categories in warning message', () => {
      const result = validateCategory('custom');
      expect(result.warning).toContain('layout');
      expect(result.warning).toContain('form');
      expect(result.warning).toContain('navigation');
    });
  });

  /**
   * 测试分类标签获取
   */
  describe('getCategoryLabel', () => {
    it('should return Chinese labels for all standard categories', () => {
      const expectedLabels: Record<ExampleCategory, string> = {
        layout: '布局',
        form: '表单',
        navigation: '导航',
        dashboard: '仪表盘',
        display: '展示',
        feedback: '反馈',
      };
      
      for (const [category, label] of Object.entries(expectedLabels)) {
        expect(getCategoryLabel(category as ExampleCategory)).toBe(label);
      }
    });
  });

  /**
   * 测试分类描述获取
   */
  describe('getCategoryDescription', () => {
    it('should return English descriptions for all standard categories', () => {
      const categories = getStandardCategories();
      
      for (const category of categories) {
        const description = getCategoryDescription(category);
        expect(description).toBeDefined();
        expect(description.length).toBeGreaterThan(0);
      }
    });

    it('should return meaningful descriptions', () => {
      expect(getCategoryDescription('layout')).toContain('Layout');
      expect(getCategoryDescription('form')).toContain('Form');
      expect(getCategoryDescription('navigation')).toContain('Navigation');
      expect(getCategoryDescription('dashboard')).toContain('Dashboard');
      expect(getCategoryDescription('display')).toContain('Display');
      expect(getCategoryDescription('feedback')).toContain('Feedback');
    });
  });

  /**
   * 测试 STANDARD_TAGS 常量
   * **Validates: Requirements 7.2**
   */
  describe('STANDARD_TAGS constant', () => {
    it('should be a readonly array', () => {
      // TypeScript ensures this at compile time, but we can verify the values are correct
      expect(Array.isArray(STANDARD_TAGS)).toBe(true);
      expect(STANDARD_TAGS.length).toBe(21); // Total count of all standard tags
    });

    it('should contain exactly 21 standard tags', () => {
      // 5 layout + 6 component + 3 navigation + 5 function + 2 scenario = 21
      expect(STANDARD_TAGS).toHaveLength(21);
    });
  });
});
