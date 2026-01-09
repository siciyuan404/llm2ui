/**
 * @file 提示词缓存测试
 * @description PromptCache 的单元测试和属性测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { PromptCache, promptCache, generateCacheKey } from './prompt-cache';
import type { CacheEntry } from './prompt-cache';

describe('PromptCache', () => {
  let cache: PromptCache;

  const createMockEntry = (prompt: string = 'test'): CacheEntry => ({
    result: {
      prompt,
      tokenCount: prompt.length,
      sections: ['system-intro'],
      trimmed: false,
    },
    createdAt: Date.now(),
    templateMtimes: { 'system-intro': Date.now() },
  });

  beforeEach(() => {
    cache = new PromptCache({ maxSize: 5 });
  });

  describe('Unit Tests', () => {
    it('should set and get cache entry', () => {
      const entry = createMockEntry();
      cache.set('key1', entry);
      
      const retrieved = cache.get('key1');
      expect(retrieved).toEqual(entry);
    });

    it('should return undefined for missing key', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should delete cache entry', () => {
      const entry = createMockEntry();
      cache.set('key1', entry);
      
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should return false when deleting nonexistent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('key1', createMockEntry());
      cache.set('key2', createMockEntry());
      
      cache.clear();
      
      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should return correct size', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', createMockEntry());
      expect(cache.size()).toBe(1);
      
      cache.set('key2', createMockEntry());
      expect(cache.size()).toBe(2);
    });

    it('should check if key exists', () => {
      cache.set('key1', createMockEntry());
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should return all keys', () => {
      cache.set('key1', createMockEntry());
      cache.set('key2', createMockEntry());
      
      const keys = cache.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should get stats', () => {
      cache.set('key1', createMockEntry());
      
      const stats = cache.getStats();
      expect(stats.size).toBe(1);
      expect(stats.maxSize).toBe(5);
      expect(stats.keys).toContain('key1');
    });

    it('should invalidate entry when template mtime changes', () => {
      const entry = createMockEntry();
      entry.templateMtimes = { 'system-intro': 1000 };
      
      cache.set('key1', entry);
      cache.updateTemplateMtime('system-intro', 2000);
      
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should keep entry valid when template mtime unchanged', () => {
      const entry = createMockEntry();
      entry.templateMtimes = { 'system-intro': 1000 };
      
      cache.set('key1', entry);
      cache.updateTemplateMtime('system-intro', 1000);
      
      expect(cache.get('key1')).toBeDefined();
    });

    it('should export singleton instance', () => {
      expect(promptCache).toBeInstanceOf(PromptCache);
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used when exceeding maxSize', () => {
      // 填满缓存
      for (let i = 1; i <= 5; i++) {
        cache.set(`key${i}`, createMockEntry(`entry${i}`));
      }
      expect(cache.size()).toBe(5);

      // 添加第 6 个，应该驱逐 key1
      cache.set('key6', createMockEntry('entry6'));
      
      expect(cache.size()).toBe(5);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key6')).toBeDefined();
    });

    it('should update LRU order on get', () => {
      cache.set('key1', createMockEntry('entry1'));
      cache.set('key2', createMockEntry('entry2'));
      cache.set('key3', createMockEntry('entry3'));
      cache.set('key4', createMockEntry('entry4'));
      cache.set('key5', createMockEntry('entry5'));

      // 访问 key1，使其成为最近使用
      cache.get('key1');

      // 添加新条目，应该驱逐 key2（现在是最旧的）
      cache.set('key6', createMockEntry('entry6'));

      expect(cache.get('key1')).toBeDefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should update LRU order on set existing key', () => {
      cache.set('key1', createMockEntry('entry1'));
      cache.set('key2', createMockEntry('entry2'));
      cache.set('key3', createMockEntry('entry3'));
      cache.set('key4', createMockEntry('entry4'));
      cache.set('key5', createMockEntry('entry5'));

      // 更新 key1，使其成为最近使用
      cache.set('key1', createMockEntry('updated1'));

      // 添加新条目，应该驱逐 key2
      cache.set('key6', createMockEntry('entry6'));

      expect(cache.get('key1')).toBeDefined();
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent key for same config', () => {
      const config = {
        language: 'zh',
        sections: ['system-intro', 'closing'],
        maxTokens: 1000,
      };

      const key1 = generateCacheKey(config);
      const key2 = generateCacheKey(config);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different configs', () => {
      const key1 = generateCacheKey({ language: 'zh', sections: ['a'] });
      const key2 = generateCacheKey({ language: 'en', sections: ['a'] });

      expect(key1).not.toBe(key2);
    });

    it('should sort sections for consistent key', () => {
      const key1 = generateCacheKey({ language: 'zh', sections: ['a', 'b'] });
      const key2 = generateCacheKey({ language: 'zh', sections: ['b', 'a'] });

      expect(key1).toBe(key2);
    });
  });

  /**
   * Property 5: Cache Consistency
   * Feature: prompt-template-and-example-registry, Property 5: Cache consistency
   * Validates: Requirements 4.1, 4.2
   */
  describe('Property Tests - Cache Consistency', () => {
    it('get after set returns same entry', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (key, prompt) => {
            const cache = new PromptCache();
            const entry = createMockEntry(prompt);
            
            cache.set(key, entry);
            const retrieved = cache.get(key);
            
            return retrieved !== undefined && 
                   retrieved.result.prompt === entry.result.prompt;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('multiple gets return same result', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (key, prompt) => {
            const cache = new PromptCache();
            const entry = createMockEntry(prompt);
            
            cache.set(key, entry);
            const result1 = cache.get(key);
            const result2 = cache.get(key);
            
            return result1 !== undefined && 
                   result2 !== undefined &&
                   result1.result.prompt === result2.result.prompt;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('cache key generation is deterministic', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('zh', 'en'),
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          fc.option(fc.integer({ min: 100, max: 10000 })),
          (language, sections, maxTokens) => {
            const config = { language, sections, maxTokens: maxTokens ?? undefined };
            const key1 = generateCacheKey(config);
            const key2 = generateCacheKey(config);
            return key1 === key2;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 7: LRU Cache Eviction
   * Feature: prompt-template-and-example-registry, Property 7: LRU cache eviction
   * Validates: Requirements 4.5
   */
  describe('Property Tests - LRU Eviction', () => {
    it('cache size never exceeds maxSize', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 20 }),
          (maxSize, keys) => {
            const cache = new PromptCache({ maxSize });
            
            for (const key of keys) {
              cache.set(key, createMockEntry(key));
            }
            
            return cache.size() <= maxSize;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('most recently used items are preserved', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          (maxSize) => {
            const cache = new PromptCache({ maxSize });
            
            // 填满缓存
            for (let i = 0; i < maxSize; i++) {
              cache.set(`key${i}`, createMockEntry(`entry${i}`));
            }
            
            // 访问第一个条目使其成为最近使用
            cache.get('key0');
            
            // 添加新条目
            cache.set('newKey', createMockEntry('newEntry'));
            
            // key0 应该仍然存在（因为最近被访问）
            return cache.has('key0') && cache.has('newKey');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('after N+1 unique inserts, size is N', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (maxSize) => {
            const cache = new PromptCache({ maxSize });
            
            // 插入 maxSize + 1 个唯一条目
            for (let i = 0; i <= maxSize; i++) {
              cache.set(`unique_key_${i}`, createMockEntry(`entry${i}`));
            }
            
            return cache.size() === maxSize;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
