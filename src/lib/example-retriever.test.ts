/**
 * @file example-retriever.test.ts
 * @description 案例检索器模块属性测试
 * @module lib/example-retriever.test
 * 
 * **Feature: example-driven-generation**
 * 
 * Property 5: 检索结果排序
 * Property 6: 关键词匹配正确性
 * Property 7: 结果数量限制
 * Property 8: 分类过滤正确性
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { ExampleRetriever, createExampleRetriever } from './example-retriever';
import { ExampleLibrary } from './example-library';
import { ComponentRegistry } from './component-registry';
import { registerShadcnComponents } from './shadcn-components';
import { getStandardCategories, type ExampleCategory } from './example-tags';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

// Setup localStorage mock
vi.stubGlobal('localStorage', localStorageMock);

describe('example-retriever', () => {
  let registry: ComponentRegistry;
  let library: ExampleLibrary;
  let retriever: ExampleRetriever;

  beforeEach(() => {
    localStorageMock.clear();
    registry = new ComponentRegistry();
    registerShadcnComponents(registry);
    library = new ExampleLibrary({ registry });
    retriever = new ExampleRetriever(library);
  });

  /**
   * Property 5: 检索结果排序 (Retrieval Result Ordering)
   * 
   * *对于任意* 用户输入和检索选项，ExampleRetriever.retrieve 返回的
   * 结果列表应当按 score 降序排列。
   * 
   * **Feature: example-driven-generation, Property 5: 检索结果排序**
   * **Validates: Requirements 2.1**
   */
  describe('Property 5: Retrieval Result Ordering', () => {
    it('should return results sorted by score descending', () => {
      // Generate search queries from existing example data
      const allExamples = library.getAll();
      const searchTerms = allExamples.flatMap(e => [
        ...e.title.split(/\s+/).filter(s => s.length > 1),
        ...e.description.split(/\s+/).filter(s => s.length > 1),
        ...e.tags,
      ]);

      // Add common keywords
      const commonKeywords = [
        '侧边栏', 'sidebar', '后台', 'admin', '登录', 'login',
        '表单', 'form', '导航', 'navigation', '卡片', 'card',
        '管理', '搜索', 'search', '设置', 'settings',
      ];
      
      const allSearchTerms = [...new Set([...searchTerms, ...commonKeywords])];

      fc.assert(
        fc.property(
          fc.constantFrom(...allSearchTerms),
          (userInput: string) => {
            const results = retriever.retrieve(userInput);
            
            // Check that results are sorted by score descending
            for (let i = 1; i < results.length; i++) {
              expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return results sorted by score with various maxResults', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (maxResults: number) => {
            const results = retriever.retrieve('后台管理', { maxResults });
            
            // Check that results are sorted by score descending
            for (let i = 1; i < results.length; i++) {
              expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Property 6: 关键词匹配正确性 (Keyword Matching Correctness)
   * 
   * *对于任意* 用户输入中包含的关键词，如果该关键词出现在某案例的 
   * title、description 或 tags 中，该案例应当出现在检索结果中。
   * 
   * **Feature: example-driven-generation, Property 6: 关键词匹配正确性**
   * **Validates: Requirements 2.2**
   */
  describe('Property 6: Keyword Matching Correctness', () => {
    it('should include examples when keyword matches title, description, or tags', () => {
      const allExamples = library.getAll();
      
      // Generate test cases from actual example data
      const testCases = allExamples.flatMap(example => {
        const keywords: string[] = [];
        
        // Extract keywords from title
        const titleWords = example.title.split(/\s+/).filter(w => w.length > 1);
        keywords.push(...titleWords);
        
        // Add tags
        keywords.push(...example.tags);
        
        return keywords.map(keyword => ({ keyword, exampleId: example.id }));
      });

      // Skip if no test cases
      if (testCases.length === 0) return;

      fc.assert(
        fc.property(
          fc.constantFrom(...testCases),
          ({ keyword, exampleId }) => {
            // Search with high maxResults to ensure we don't miss matches
            const results = retriever.retrieve(keyword, { maxResults: 50, minScore: 0 });
            
            // The example should appear in results (with some tolerance for scoring)
            const found = results.find(r => r.example.id === exampleId);
            
            // If keyword is very short or common, it might not match
            // We only assert for keywords that are meaningful
            if (keyword.length >= 2) {
              // Check if the keyword actually appears in the example
              const example = library.getById(exampleId);
              if (example) {
                const lowerKeyword = keyword.toLowerCase();
                const inTitle = example.title.toLowerCase().includes(lowerKeyword);
                const inDesc = example.description.toLowerCase().includes(lowerKeyword);
                const inTags = example.tags.some(t => t.toLowerCase() === lowerKeyword);
                
                if (inTitle || inDesc || inTags) {
                  // Should find the example
                  expect(found).toBeDefined();
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return matched keywords in results', () => {
      const results = retriever.retrieve('侧边栏');
      
      // Results should have matchedKeywords
      for (const result of results) {
        expect(result.matchedKeywords).toBeDefined();
        expect(Array.isArray(result.matchedKeywords)).toBe(true);
      }
    });
  });

  /**
   * Property 7: 结果数量限制 (Result Count Limit)
   * 
   * *对于任意* maxResults 配置值 n，ExampleRetriever.retrieve 返回的
   * 结果数量应当不超过 n。
   * 
   * **Feature: example-driven-generation, Property 7: 结果数量限制**
   * **Validates: Requirements 2.3**
   */
  describe('Property 7: Result Count Limit', () => {
    it('should not return more results than maxResults', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          fc.constantFrom('侧边栏', '后台', '登录', '表单', '导航', 'admin', 'sidebar', 'form'),
          (maxResults: number, query: string) => {
            const results = retriever.retrieve(query, { maxResults });
            
            expect(results.length).toBeLessThanOrEqual(maxResults);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use default maxResults of 3 when not specified', () => {
      const results = retriever.retrieve('后台管理');
      
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  /**
   * Property 8: 分类过滤正确性 (Category Filtering Correctness)
   * 
   * *对于任意* category 过滤选项，ExampleRetriever.retrieve 返回的
   * 所有案例的 category 都应当等于指定的分类。
   * 
   * **Feature: example-driven-generation, Property 8: 分类过滤正确性**
   * **Validates: Requirements 2.4**
   */
  describe('Property 8: Category Filtering Correctness', () => {
    it('should return only examples matching the specified category', () => {
      const categories = getStandardCategories();
      
      fc.assert(
        fc.property(
          fc.constantFrom(...categories),
          fc.constantFrom('侧边栏', '后台', '登录', '表单', '导航', 'admin', 'sidebar', 'form', '管理'),
          (category: ExampleCategory, query: string) => {
            const results = retriever.retrieve(query, { category, maxResults: 50 });
            
            // All results should have the specified category
            for (const result of results) {
              expect(result.example.category).toBe(category);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return results from all categories when category is not specified', () => {
      const results = retriever.retrieve('管理', { maxResults: 50 });
      
      // At least verify results exist and have valid categories
      for (const result of results) {
        expect(getStandardCategories()).toContain(result.example.category);
      }
    });
  });


  /**
   * Unit tests for keyword mappings
   * 
   * **Validates: Requirements 2.5, 2.6**
   */
  describe('Keyword Mapping Unit Tests', () => {
    it('should prioritize sidebar-related examples when input contains "侧边栏"', () => {
      const results = retriever.retrieve('侧边栏');
      
      // Should have results
      expect(results.length).toBeGreaterThan(0);
      
      // Top results should have sidebar-related tags
      const topResult = results[0];
      const hasSidebarTag = topResult.example.tags.some(
        t => t.toLowerCase().includes('sidebar') || t.toLowerCase().includes('navigation')
      );
      const hasSidebarInTitle = topResult.example.title.toLowerCase().includes('侧边栏') ||
                                topResult.example.title.toLowerCase().includes('sidebar');
      
      expect(hasSidebarTag || hasSidebarInTitle).toBe(true);
    });

    it('should prioritize sidebar-related examples when input contains "sidebar"', () => {
      const results = retriever.retrieve('sidebar');
      
      // Should have results
      expect(results.length).toBeGreaterThan(0);
      
      // Top results should have sidebar-related content
      const topResult = results[0];
      const hasSidebarTag = topResult.example.tags.some(t => t.toLowerCase().includes('sidebar'));
      const hasSidebarInTitle = topResult.example.title.toLowerCase().includes('sidebar') ||
                                topResult.example.title.toLowerCase().includes('侧边栏');
      
      expect(hasSidebarTag || hasSidebarInTitle).toBe(true);
    });

    it('should prioritize dashboard examples when input contains "后台"', () => {
      const results = retriever.retrieve('后台');
      
      // Should have results
      expect(results.length).toBeGreaterThan(0);
      
      // Results should include dashboard or admin-related examples
      const hasRelevantResults = results.some(r => 
        r.example.category === 'dashboard' ||
        r.example.tags.some(t => t.toLowerCase().includes('admin')) ||
        r.example.title.toLowerCase().includes('admin') ||
        r.example.description.toLowerCase().includes('后台')
      );
      
      expect(hasRelevantResults).toBe(true);
    });

    it('should prioritize dashboard examples when input contains "admin"', () => {
      const results = retriever.retrieve('admin');
      
      // Should have results
      expect(results.length).toBeGreaterThan(0);
      
      // Results should include admin-related examples
      const hasRelevantResults = results.some(r => 
        r.example.category === 'dashboard' ||
        r.example.tags.some(t => t.toLowerCase().includes('admin')) ||
        r.example.title.toLowerCase().includes('admin')
      );
      
      expect(hasRelevantResults).toBe(true);
    });

    it('should prioritize dashboard examples when input contains "管理"', () => {
      const results = retriever.retrieve('管理系统');
      
      // Should have results
      expect(results.length).toBeGreaterThan(0);
      
      // Results should include admin/dashboard-related examples
      const hasRelevantResults = results.some(r => 
        r.example.category === 'dashboard' ||
        r.example.tags.some(t => t.toLowerCase().includes('admin')) ||
        r.example.description.toLowerCase().includes('管理')
      );
      
      expect(hasRelevantResults).toBe(true);
    });
  });

  /**
   * Additional unit tests for ExampleRetriever
   */
  describe('ExampleRetriever unit tests', () => {
    it('should create retriever with createExampleRetriever helper', () => {
      const newRetriever = createExampleRetriever(library);
      expect(newRetriever).toBeInstanceOf(ExampleRetriever);
    });

    it('should return empty array for empty input', () => {
      const results = retriever.retrieve('');
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace-only input', () => {
      const results = retriever.retrieve('   ');
      expect(results).toEqual([]);
    });

    it('should allow adding custom keyword mappings', () => {
      retriever.addKeywordMapping({
        keywords: ['自定义', 'custom'],
        tags: ['card'],
        boost: 2.0,
      });
      
      const mappings = retriever.getKeywordMappings();
      const customMapping = mappings.find(m => m.keywords.includes('自定义'));
      
      expect(customMapping).toBeDefined();
      expect(customMapping!.boost).toBe(2.0);
    });

    it('should return default keyword mappings', () => {
      const mappings = retriever.getKeywordMappings();
      
      // Should have default mappings
      expect(mappings.length).toBeGreaterThan(0);
      
      // Should include sidebar mapping
      const sidebarMapping = mappings.find(m => m.keywords.includes('侧边栏'));
      expect(sidebarMapping).toBeDefined();
      
      // Should include admin mapping
      const adminMapping = mappings.find(m => m.keywords.includes('后台'));
      expect(adminMapping).toBeDefined();
    });

    it('should respect minScore option', () => {
      const resultsLowThreshold = retriever.retrieve('管理', { minScore: 0.01, maxResults: 50 });
      const resultsHighThreshold = retriever.retrieve('管理', { minScore: 0.5, maxResults: 50 });
      
      // Higher threshold should return fewer or equal results
      expect(resultsHighThreshold.length).toBeLessThanOrEqual(resultsLowThreshold.length);
      
      // All results should meet the threshold
      for (const result of resultsHighThreshold) {
        expect(result.score).toBeGreaterThanOrEqual(0.5);
      }
    });

    it('should have scores between 0 and 1', () => {
      const results = retriever.retrieve('后台管理侧边栏', { maxResults: 50 });
      
      for (const result of results) {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
      }
    });

    it('should handle Chinese and English mixed input', () => {
      const results = retriever.retrieve('admin 后台 sidebar');
      
      // Should return results
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle special characters in input', () => {
      // Should not throw
      expect(() => retriever.retrieve('test@#$%')).not.toThrow();
      expect(() => retriever.retrieve('测试！@#')).not.toThrow();
    });
  });
});
