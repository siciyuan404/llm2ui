/**
 * @file example-library.test.ts
 * @description 案例库模块属性测试
 * @module lib/examples/example-library.test
 * 
 * **Feature: example-driven-generation**
 * 
 * Property 1: 数据聚合完整性
 * Property 2: 分类分组正确性
 * Property 3: 标签筛选正确性
 * Property 4: 全文搜索正确性
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { ExampleLibrary, createExampleLibrary, type ExampleMetadata } from './example-library';
// PRESET_EXAMPLES 从 shadcn 主题目录导入
import { PRESET_EXAMPLES } from '../themes/builtin/shadcn/examples/presets';
import { ComponentRegistry, type ComponentExample } from '../core/component-registry';
import { registerShadcnComponents } from '../core/shadcn-components';
import { getStandardCategories, type ExampleCategory } from './example-tags';
import type { UISchema } from '../../types';

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

describe('example-library', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    localStorageMock.clear();
    registry = new ComponentRegistry();
    registerShadcnComponents(registry);
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  /**
   * Property 1: 数据聚合完整性 (Data Aggregation Completeness)
   * 
   * *对于任意* ComponentRegistry 中带有 examples 的组件，以及 
   * CustomExamplesStorage 中的任意自定义案例，这些案例都应当出现在 
   * ExampleLibrary 中，且元数据完整（包含 id、title、description、
   * category、tags、schema、source）。
   * 
   * **Feature: example-driven-generation, Property 1: 数据聚合完整性**
   * **Validates: Requirements 1.1, 1.2, 1.3**
   */
  describe('Property 1: Data Aggregation Completeness', () => {
    it('should include all preset examples with complete metadata', () => {
      const library = new ExampleLibrary({ registry });
      
      fc.assert(
        fc.property(
          fc.constantFrom(...PRESET_EXAMPLES),
          (presetExample: ExampleMetadata) => {
            const found = library.getById(presetExample.id);
            
            // Should exist in library
            expect(found).toBeDefined();
            
            // Should have complete metadata
            expect(found!.id).toBe(presetExample.id);
            expect(found!.title).toBeDefined();
            expect(found!.title.length).toBeGreaterThan(0);
            expect(found!.description).toBeDefined();
            expect(found!.description.length).toBeGreaterThan(0);
            expect(found!.category).toBeDefined();
            expect(found!.tags).toBeDefined();
            expect(Array.isArray(found!.tags)).toBe(true);
            expect(found!.schema).toBeDefined();
            expect(found!.source).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include custom examples from localStorage with complete metadata', () => {
      // Create arbitrary custom examples
      const customExampleArb = fc.record({
        id: fc.string({ minLength: 5, maxLength: 20 }).map(s => `example-${s.replace(/[^a-z0-9]/gi, '')}`),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 200 }),
        componentName: fc.constantFrom('Button', 'Card', 'Input', 'Container'),
        createdAt: fc.constant(new Date().toISOString()),
        updatedAt: fc.constant(new Date().toISOString()),
        schema: fc.constant({
          version: '1.0',
          root: { id: 'test', type: 'Container' },
        } as UISchema),
      });

      fc.assert(
        fc.property(
          fc.array(customExampleArb, { minLength: 1, maxLength: 5 }),
          (customExamples) => {
            // Store custom examples in localStorage
            localStorageMock.setItem('llm2ui-custom-examples', JSON.stringify(customExamples));
            
            // Create library
            const library = new ExampleLibrary({ registry });
            
            // Each custom example should be in the library
            for (const customExample of customExamples) {
              const found = library.getById(customExample.id);
              
              expect(found).toBeDefined();
              expect(found!.id).toBe(customExample.id);
              expect(found!.title).toBe(customExample.title);
              expect(found!.description).toBe(customExample.description);
              expect(found!.category).toBeDefined();
              expect(found!.tags).toBeDefined();
              expect(found!.schema).toBeDefined();
              expect(found!.source).toBe('custom');
            }
            
            // Clean up
            localStorageMock.clear();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include component registry examples with complete metadata', () => {
      // Register a component with examples
      const testSchema: UISchema = {
        version: '1.0',
        root: { id: 'test', type: 'Button', text: 'Test' },
      };
      
      const testExample: ComponentExample = {
        title: 'Test Button Example',
        description: 'A test button example',
        schema: testSchema,
      };
      
      registry.register({
        name: 'TestComponent',
        component: () => null,
        category: 'input',
        examples: [testExample],
      });
      
      const library = new ExampleLibrary({ registry });
      
      // Find the registry example
      const allExamples = library.getAll();
      const registryExample = allExamples.find(e => e.id.includes('testcomponent'));
      
      expect(registryExample).toBeDefined();
      expect(registryExample!.title).toBe('Test Button Example');
      expect(registryExample!.description).toBe('A test button example');
      expect(registryExample!.category).toBeDefined();
      expect(registryExample!.tags).toBeDefined();
      expect(registryExample!.schema).toBeDefined();
      expect(registryExample!.source).toBe('system');
    });
  });


  /**
   * Property 2: 分类分组正确性 (Category Grouping Correctness)
   * 
   * *对于任意* ExampleLibrary 中的案例集合，按 category 分组后，
   * 每个分组中的所有案例的 category 字段都应当等于该分组的键。
   * 
   * **Feature: example-driven-generation, Property 2: 分类分组正确性**
   * **Validates: Requirements 1.4**
   */
  describe('Property 2: Category Grouping Correctness', () => {
    it('should group examples correctly by category', () => {
      const library = new ExampleLibrary({ registry });
      const grouped = library.getAllByCategory();
      const categories = getStandardCategories();
      
      fc.assert(
        fc.property(
          fc.constantFrom(...categories),
          (category: ExampleCategory) => {
            const examplesInCategory = grouped[category];
            
            // All examples in this category should have matching category field
            for (const example of examplesInCategory) {
              expect(example.category).toBe(category);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return same examples via getByCategory and getAllByCategory', () => {
      const library = new ExampleLibrary({ registry });
      const grouped = library.getAllByCategory();
      const categories = getStandardCategories();
      
      fc.assert(
        fc.property(
          fc.constantFrom(...categories),
          (category: ExampleCategory) => {
            const fromGrouped = grouped[category];
            const fromMethod = library.getByCategory(category);
            
            // Should have same length
            expect(fromGrouped.length).toBe(fromMethod.length);
            
            // Should contain same IDs
            const groupedIds = new Set(fromGrouped.map(e => e.id));
            const methodIds = new Set(fromMethod.map(e => e.id));
            
            for (const id of groupedIds) {
              expect(methodIds.has(id)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: 标签筛选正确性 (Tag Filtering Correctness)
   * 
   * *对于任意* 标签列表和 ExampleLibrary，filterByTags 返回的所有案例
   * 都应当至少包含一个指定的标签。
   * 
   * **Feature: example-driven-generation, Property 3: 标签筛选正确性**
   * **Validates: Requirements 1.5**
   */
  describe('Property 3: Tag Filtering Correctness', () => {
    it('should return only examples containing at least one specified tag', () => {
      const library = new ExampleLibrary({ registry });
      const allTags = library.getAllTags();
      
      // Skip if no tags available
      if (allTags.length === 0) return;
      
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...allTags), { minLength: 1, maxLength: 3 }),
          (tags: string[]) => {
            const filtered = library.filterByTags(tags);
            const lowerTags = tags.map(t => t.toLowerCase());
            
            // Each filtered example should have at least one matching tag
            for (const example of filtered) {
              const exampleLowerTags = example.tags.map(t => t.toLowerCase());
              const hasMatchingTag = lowerTags.some(tag => exampleLowerTags.includes(tag));
              expect(hasMatchingTag).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all examples when filtering with empty tags array', () => {
      const library = new ExampleLibrary({ registry });
      const all = library.getAll();
      const filtered = library.filterByTags([]);
      
      expect(filtered.length).toBe(all.length);
    });
  });

  /**
   * Property 4: 全文搜索正确性 (Full-text Search Correctness)
   * 
   * *对于任意* 搜索查询和 ExampleLibrary，search 返回的所有案例的 
   * title 或 description 都应当包含该查询字符串（不区分大小写）。
   * 
   * **Feature: example-driven-generation, Property 4: 全文搜索正确性**
   * **Validates: Requirements 1.6**
   */
  describe('Property 4: Full-text Search Correctness', () => {
    it('should return only examples where title or description contains query', () => {
      const library = new ExampleLibrary({ registry });
      
      // Generate search queries from existing example titles/descriptions
      const allExamples = library.getAll();
      const searchTerms = allExamples.flatMap(e => [
        ...e.title.split(/\s+/).filter(s => s.length > 2),
        ...e.description.split(/\s+/).filter(s => s.length > 2),
      ]);
      
      // Skip if no search terms available
      if (searchTerms.length === 0) return;
      
      fc.assert(
        fc.property(
          fc.constantFrom(...searchTerms),
          (query: string) => {
            const results = library.search(query);
            const lowerQuery = query.toLowerCase();
            
            // Each result should contain the query in title or description
            for (const example of results) {
              const titleMatch = example.title.toLowerCase().includes(lowerQuery);
              const descMatch = example.description.toLowerCase().includes(lowerQuery);
              expect(titleMatch || descMatch).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all examples when searching with empty query', () => {
      const library = new ExampleLibrary({ registry });
      const all = library.getAll();
      const results = library.search('');
      
      expect(results.length).toBe(all.length);
    });

    it('should return all examples when searching with whitespace-only query', () => {
      const library = new ExampleLibrary({ registry });
      const all = library.getAll();
      const results = library.search('   ');
      
      expect(results.length).toBe(all.length);
    });

    it('should be case-insensitive', () => {
      const library = new ExampleLibrary({ registry });
      
      // Search for "登录" which should match "登录表单"
      const lowerResults = library.search('登录');
      const upperResults = library.search('登录');
      
      expect(lowerResults.length).toBe(upperResults.length);
      
      // Search for English terms
      const adminLower = library.search('admin');
      const adminUpper = library.search('ADMIN');
      const adminMixed = library.search('Admin');
      
      expect(adminLower.length).toBe(adminUpper.length);
      expect(adminLower.length).toBe(adminMixed.length);
    });
  });

  /**
   * Additional unit tests for ExampleLibrary
   */
  describe('ExampleLibrary unit tests', () => {
    it('should create library with default options', () => {
      const library = createExampleLibrary();
      expect(library.size).toBeGreaterThan(0);
    });

    it('should create library with registry', () => {
      const library = createExampleLibrary(registry);
      expect(library.size).toBeGreaterThan(0);
    });

    it('should exclude presets when includePresets is false', () => {
      const libraryWithPresets = new ExampleLibrary({ registry, includePresets: true });
      const libraryWithoutPresets = new ExampleLibrary({ registry, includePresets: false });
      
      expect(libraryWithPresets.size).toBeGreaterThan(libraryWithoutPresets.size);
    });

    it('should refresh examples from data sources', () => {
      const library = new ExampleLibrary({ registry });
      const initialSize = library.size;
      
      // Add custom example to localStorage
      const customExample = {
        id: 'test-refresh-example',
        title: 'Test Refresh',
        description: 'Test refresh functionality',
        componentName: 'Button',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schema: { version: '1.0', root: { id: 'test', type: 'Button' } },
      };
      localStorageMock.setItem('llm2ui-custom-examples', JSON.stringify([customExample]));
      
      // Refresh library
      library.refresh();
      
      expect(library.size).toBe(initialSize + 1);
      expect(library.has('test-refresh-example')).toBe(true);
    });

    it('should return correct category counts', () => {
      const library = new ExampleLibrary({ registry });
      const counts = library.getCategoryCounts();
      
      // Should have counts for all standard categories
      expect(counts.layout).toBeDefined();
      expect(counts.form).toBeDefined();
      expect(counts.navigation).toBeDefined();
      expect(counts.dashboard).toBeDefined();
      expect(counts.display).toBeDefined();
      expect(counts.feedback).toBeDefined();
      
      // Total should match library size
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(library.size);
    });

    it('should return examples by source', () => {
      const library = new ExampleLibrary({ registry });
      
      const systemExamples = library.getBySource('system');
      const customExamples = library.getBySource('custom');
      
      // All system examples should have source = 'system'
      for (const example of systemExamples) {
        expect(example.source).toBe('system');
      }
      
      // All custom examples should have source = 'custom'
      for (const example of customExamples) {
        expect(example.source).toBe('custom');
      }
    });

    it('should return all unique tags', () => {
      const library = new ExampleLibrary({ registry });
      const tags = library.getAllTags();
      
      // Should be an array
      expect(Array.isArray(tags)).toBe(true);
      
      // Should be sorted
      const sorted = [...tags].sort();
      expect(tags).toEqual(sorted);
      
      // Should have no duplicates
      const uniqueTags = new Set(tags);
      expect(uniqueTags.size).toBe(tags.length);
    });

    it('should check if example exists', () => {
      const library = new ExampleLibrary({ registry });
      
      // Should find preset example
      expect(library.has('system-layout-admin-sidebar')).toBe(true);
      
      // Should not find non-existent example
      expect(library.has('non-existent-id')).toBe(false);
    });
  });
});


describe('ExampleLibrary Theme Isolation', () => {
  /**
   * Property 7: Example Retrieval Theme Isolation
   * 
   * *For any* example retrieval operation, the returned examples SHALL only 
   * come from the active theme's example collection.
   * 
   * **Feature: multi-theme-system, Property 7: Example Retrieval Theme Isolation**
   * **Validates: Requirements 5.2, 5.3**
   */
  it('Property 7: library uses active theme examples when ThemeManager is available', async () => {
    // 动态导入以避免循环依赖
    const { ThemeManager } = await import('../themes/theme-manager');
    const { ComponentRegistry } = await import('../core/component-registry');
    
    // 重置 ThemeManager
    ThemeManager.resetInstance();
    const themeManager = ThemeManager.getInstance();
    
    // 创建两个不同的组件注册表
    const registry1 = new ComponentRegistry();
    const registry2 = new ComponentRegistry();
    
    // 创建两个主题，每个有不同的案例
    const themeAExamples = [
      {
        id: 'theme-a-example-1',
        name: 'Theme A Example 1',
        description: 'Example from Theme A',
        category: 'layout',
        tags: ['theme-a'],
        schema: { version: '1.0', root: { id: 'test', type: 'Container' } },
      },
      {
        id: 'theme-a-example-2',
        name: 'Theme A Example 2',
        description: 'Another example from Theme A',
        category: 'form',
        tags: ['theme-a', 'form'],
        schema: { version: '1.0', root: { id: 'test', type: 'Input' } },
      },
    ];
    
    const themeBExamples = [
      {
        id: 'theme-b-example-1',
        name: 'Theme B Example 1',
        description: 'Example from Theme B',
        category: 'display',
        tags: ['theme-b'],
        schema: { version: '1.0', root: { id: 'test', type: 'Card' } },
      },
    ];
    
    const baseTokens = {
      colors: { background: '#fff', foreground: '#000', primary: '#007bff', primaryForeground: '#fff', secondary: '#6c757d', secondaryForeground: '#fff', accent: '#17a2b8', accentForeground: '#fff', muted: '#f8f9fa', mutedForeground: '#6c757d', border: '#dee2e6', ring: '#007bff' },
      spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem' },
      typography: { fontFamily: { sans: 'system-ui', mono: 'monospace' }, fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' }, fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 }, lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' } },
      shadows: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 15px rgba(0,0,0,0.1)', xl: '0 20px 25px rgba(0,0,0,0.1)' },
      radius: { none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
    };
    
    const basePrompts = { templates: { zh: { systemIntro: '', iconGuidelines: '', componentDocs: '', positiveExamples: '', negativeExamples: '', closing: '' }, en: { systemIntro: '', iconGuidelines: '', componentDocs: '', positiveExamples: '', negativeExamples: '', closing: '' } } };
    const baseColorSchemes = [{ id: 'light', name: 'Light', type: 'light' as const, colors: { background: '#fff', foreground: '#000', primary: '#007bff', secondary: '#6c757d', accent: '#17a2b8', muted: '#f8f9fa', border: '#dee2e6' } }];
    const baseLayouts = [{ id: 'default', name: 'Default', description: 'Default layout', config: { sidebar: 'left' as const, mainContent: 'full' as const, previewPanel: 'none' as const } }];
    
    const themeA = {
      id: 'theme-a',
      name: 'Theme A',
      description: 'Test theme A',
      version: '1.0.0',
      tokens: baseTokens,
      components: { registry: registry1 },
      examples: { presets: themeAExamples },
      prompts: basePrompts,
      colorSchemes: baseColorSchemes,
      layouts: baseLayouts,
    };
    
    const themeB = {
      id: 'theme-b',
      name: 'Theme B',
      description: 'Test theme B',
      version: '1.0.0',
      tokens: baseTokens,
      components: { registry: registry2 },
      examples: { presets: themeBExamples },
      prompts: basePrompts,
      colorSchemes: baseColorSchemes,
      layouts: baseLayouts,
    };
    
    // 注册主题
    themeManager.register(themeA);
    themeManager.register(themeB);
    themeManager.setActiveTheme('theme-a');
    
    // 创建使用 ThemeManager 的 library
    const { createThemedExampleLibrary } = await import('./example-library');
    const themedLibrary = createThemedExampleLibrary();
    
    // 验证 Theme A 的案例可用
    const themeAResults = themedLibrary.getAll();
    expect(themeAResults.some(e => e.id === 'theme-a-example-1')).toBe(true);
    expect(themeAResults.some(e => e.id === 'theme-a-example-2')).toBe(true);
    expect(themeAResults.some(e => e.id === 'theme-b-example-1')).toBe(false);
    
    // 切换到 Theme B
    themeManager.setActiveTheme('theme-b');
    
    // 刷新 library
    themedLibrary.refresh();
    
    // 验证 Theme B 的案例可用
    const themeBResults = themedLibrary.getAll();
    expect(themeBResults.some(e => e.id === 'theme-b-example-1')).toBe(true);
    expect(themeBResults.some(e => e.id === 'theme-a-example-1')).toBe(false);
    expect(themeBResults.some(e => e.id === 'theme-a-example-2')).toBe(false);
    
    // 清理
    ThemeManager.resetInstance();
  });

  it('Property 7b: library falls back to preset examples when ThemeManager has no themes', async () => {
    const { createStaticExampleLibrary } = await import('./example-library');
    
    // 创建不使用 ThemeManager 的 library
    const staticLibrary = createStaticExampleLibrary();
    
    // 应该包含默认预设案例
    expect(staticLibrary.size).toBeGreaterThan(0);
    expect(staticLibrary.has('system-layout-admin-sidebar')).toBe(true);
  });
});
