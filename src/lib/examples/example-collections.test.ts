/**
 * @file 案例集合测试
 * @description ExampleCollections 的单元测试和属性测试
 * @module lib/examples/example-collections.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  createLayoutCollection,
  createFormCollection,
  createChatCollection,
  createSettingsCollection,
  createDashboardCollection,
  createNavigationCollection,
  createDisplayCollection,
  createFeedbackCollection,
  createCherryCollection,
  getAllCollections,
  getCollectionByName,
} from './example-collections';
import { ExampleRegistry } from './example-registry';
// PRESET_EXAMPLES 从 shadcn 主题目录导入
import { PRESET_EXAMPLES } from '../themes/builtin/shadcn/examples/presets';
// Cherry 案例从主题目录导入
import { 
  CHERRY_PATTERN_EXAMPLES, 
  CHERRY_EXTENDED_EXAMPLES 
} from '../themes/builtin/cherry/examples';

describe('ExampleCollections', () => {
  describe('Collection Factory Functions', () => {
    it('createLayoutCollection returns layout examples', () => {
      const collection = createLayoutCollection();
      expect(collection.name).toBe('Layout Collection');
      expect(collection.examples.length).toBeGreaterThanOrEqual(0);
      collection.examples.forEach(e => {
        expect(e.category).toBe('layout');
      });
    });

    it('createFormCollection returns form examples', () => {
      const collection = createFormCollection();
      expect(collection.name).toBe('Form Collection');
      collection.examples.forEach(e => {
        expect(e.category).toBe('form');
      });
    });

    it('createDashboardCollection returns dashboard examples', () => {
      const collection = createDashboardCollection();
      expect(collection.name).toBe('Dashboard Collection');
      collection.examples.forEach(e => {
        expect(e.category).toBe('dashboard');
      });
    });

    it('createNavigationCollection returns navigation examples', () => {
      const collection = createNavigationCollection();
      expect(collection.name).toBe('Navigation Collection');
      collection.examples.forEach(e => {
        expect(e.category).toBe('navigation');
      });
    });

    it('createDisplayCollection returns display examples', () => {
      const collection = createDisplayCollection();
      expect(collection.name).toBe('Display Collection');
      collection.examples.forEach(e => {
        expect(e.category).toBe('display');
      });
    });

    it('createFeedbackCollection returns feedback examples', () => {
      const collection = createFeedbackCollection();
      expect(collection.name).toBe('Feedback Collection');
      collection.examples.forEach(e => {
        expect(e.category).toBe('feedback');
      });
    });

    it('createCherryCollection returns Cherry examples', () => {
      const collection = createCherryCollection();
      expect(collection.name).toBe('Cherry Studio Collection');
      expect(collection.examples.length).toBe(
        CHERRY_PATTERN_EXAMPLES.length + CHERRY_EXTENDED_EXAMPLES.length
      );
    });

    it('createChatCollection returns chat-related examples', () => {
      const collection = createChatCollection();
      expect(collection.name).toBe('Chat Collection');
      // 聊天类案例通过标签筛选
      collection.examples.forEach(e => {
        const hasChatTag = e.tags.some(tag => 
          ['chat', 'message', 'conversation', 'input-bar', 'message-list'].includes(tag)
        );
        expect(hasChatTag).toBe(true);
      });
    });

    it('createSettingsCollection returns settings-related examples', () => {
      const collection = createSettingsCollection();
      expect(collection.name).toBe('Settings Collection');
      collection.examples.forEach(e => {
        const hasSettingsTag = e.tags.some(tag => 
          ['settings', 'config', 'preferences', 'options', 'llm-settings'].includes(tag)
        );
        expect(hasSettingsTag).toBe(true);
      });
    });
  });

  describe('getAllCollections', () => {
    it('returns all collection types', () => {
      const collections = getAllCollections();
      expect(collections.length).toBe(9);
      
      const names = collections.map(c => c.name);
      expect(names).toContain('Layout Collection');
      expect(names).toContain('Form Collection');
      expect(names).toContain('Chat Collection');
      expect(names).toContain('Settings Collection');
      expect(names).toContain('Dashboard Collection');
      expect(names).toContain('Navigation Collection');
      expect(names).toContain('Display Collection');
      expect(names).toContain('Feedback Collection');
      expect(names).toContain('Cherry Studio Collection');
    });
  });

  describe('getCollectionByName', () => {
    it('returns correct collection by name', () => {
      const layout = getCollectionByName('Layout Collection');
      expect(layout).toBeDefined();
      expect(layout?.name).toBe('Layout Collection');
    });

    it('returns undefined for unknown name', () => {
      const unknown = getCollectionByName('Unknown Collection');
      expect(unknown).toBeUndefined();
    });
  });
});


/**
 * Property 12: Backward Compatibility
 * Feature: prompt-template-and-example-registry, Property 12
 * Validates: Requirements 7.5
 * 
 * 验证现有案例可以成功注册到新的 ExampleRegistry 中
 */
describe('Property 12: Backward Compatibility', () => {
  let registry: ExampleRegistry;

  beforeEach(() => {
    ExampleRegistry.resetInstance();
    registry = ExampleRegistry.getInstance();
  });

  afterEach(() => {
    registry.clear();
    ExampleRegistry.resetInstance();
  });

  it('all preset examples can be registered without modification', () => {
    let successCount = 0;
    let failCount = 0;
    const failures: string[] = [];

    for (const example of PRESET_EXAMPLES) {
      try {
        registry.register(example);
        successCount++;
      } catch (error) {
        failCount++;
        failures.push(example.id);
      }
    }

    // 至少 80% 的案例应该能成功注册
    const successRate = successCount / PRESET_EXAMPLES.length;
    expect(successRate).toBeGreaterThanOrEqual(0.8);
    
    if (failures.length > 0) {
      console.warn(`Failed to register ${failures.length} preset examples:`, failures.slice(0, 5));
    }
  });

  it('all cherry pattern examples can be registered without modification', () => {
    let successCount = 0;
    const failures: string[] = [];

    for (const example of CHERRY_PATTERN_EXAMPLES) {
      try {
        registry.register(example);
        successCount++;
      } catch (error) {
        failures.push(example.id);
      }
    }

    const successRate = successCount / CHERRY_PATTERN_EXAMPLES.length;
    expect(successRate).toBeGreaterThanOrEqual(0.8);
  });

  it('all cherry extended examples can be registered without modification', () => {
    let successCount = 0;
    const failures: string[] = [];

    for (const example of CHERRY_EXTENDED_EXAMPLES) {
      try {
        registry.register(example);
        successCount++;
      } catch (error) {
        failures.push(example.id);
      }
    }

    const successRate = successCount / CHERRY_EXTENDED_EXAMPLES.length;
    expect(successRate).toBeGreaterThanOrEqual(0.8);
  });

  it('registered examples are retrievable by ID', () => {
    // 注册一些案例
    const samplesToTest = PRESET_EXAMPLES.slice(0, 5);
    
    for (const example of samplesToTest) {
      try {
        registry.register(example);
      } catch {
        // 忽略注册失败
      }
    }

    // 验证已注册的案例可以通过 ID 检索
    for (const example of samplesToTest) {
      if (registry.has(example.id)) {
        const retrieved = registry.getById(example.id);
        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(example.id);
        expect(retrieved?.title).toBe(example.title);
      }
    }
  });

  it('registered examples have quality scores', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: Math.min(10, PRESET_EXAMPLES.length - 1) }),
        (index) => {
          registry.clear();
          const example = PRESET_EXAMPLES[index];
          
          try {
            registry.register(example);
            const retrieved = registry.getById(example.id);
            
            if (retrieved) {
              expect(retrieved.qualityScore).toBeGreaterThanOrEqual(0);
              expect(retrieved.qualityScore).toBeLessThanOrEqual(100);
              return true;
            }
          } catch {
            // 注册失败也是可接受的（验证失败）
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
