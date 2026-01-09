/**
 * @file diversity-filter.test.ts
 * @description 多样性过滤器的单元测试和属性测试
 * @module lib/examples/diversity-filter
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DiversityFilter, createDiversityFilter } from './diversity-filter';
import type { ScoredExample } from './diversity-filter';
// ExampleMetadata 从 shadcn 主题目录导入
import type { ExampleMetadata } from '../themes/builtin/shadcn/examples/presets';
import type { ExampleCategory } from './example-tags';

// ============================================================================
// 测试辅助函数
// ============================================================================

function createMockExample(
  id: string,
  category: ExampleCategory,
  tags: string[],
  componentTypes: string[] = ['Box']
): ExampleMetadata {
  return {
    id,
    title: `Example ${id}`,
    description: `Description for ${id}`,
    category,
    tags,
    schema: {
      version: '1.0',
      root: {
        id: 'root',
        type: componentTypes[0] || 'Box',
        children: componentTypes.slice(1).map((type, i) => ({
          id: `child-${i}`,
          type,
          children: [],
        })),
      },
    },
    source: 'system',
  };
}

function createScoredExample(
  example: ExampleMetadata,
  score: number
): ScoredExample {
  return { example, score };
}

// ============================================================================
// 单元测试
// ============================================================================

describe('DiversityFilter', () => {
  describe('calculateTagOverlap', () => {
    it('should return 0 for empty tags', () => {
      const filter = createDiversityFilter();
      expect(filter.calculateTagOverlap([], [])).toBe(0);
    });

    it('should return 1 for identical tags', () => {
      const filter = createDiversityFilter();
      expect(filter.calculateTagOverlap(['a', 'b'], ['a', 'b'])).toBe(1);
    });

    it('should return 0 for completely different tags', () => {
      const filter = createDiversityFilter();
      expect(filter.calculateTagOverlap(['a', 'b'], ['c', 'd'])).toBe(0);
    });

    it('should calculate correct overlap for partial match', () => {
      const filter = createDiversityFilter();
      // Jaccard: intersection=1, union=3, result=1/3
      expect(filter.calculateTagOverlap(['a', 'b'], ['b', 'c'])).toBeCloseTo(1 / 3);
    });

    it('should be case insensitive', () => {
      const filter = createDiversityFilter();
      expect(filter.calculateTagOverlap(['A', 'B'], ['a', 'b'])).toBe(1);
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1 for identical examples', () => {
      const filter = createDiversityFilter();
      const example = createMockExample('1', 'layout', ['sidebar', 'navigation']);
      expect(filter.calculateSimilarity(example, example)).toBe(1);
    });

    it('should return 0 for completely different examples', () => {
      const filter = createDiversityFilter();
      const a = createMockExample('1', 'layout', ['sidebar'], ['Box']);
      const b = createMockExample('2', 'form', ['input'], ['Form']);
      expect(filter.calculateSimilarity(a, b)).toBe(0);
    });

    it('should return partial similarity for partially similar examples', () => {
      const filter = createDiversityFilter();
      const a = createMockExample('1', 'layout', ['sidebar', 'navigation'], ['Box', 'Button']);
      const b = createMockExample('2', 'layout', ['sidebar', 'header'], ['Box', 'Text']);
      const similarity = filter.calculateSimilarity(a, b);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });
  });

  describe('filter', () => {
    it('should return empty array for empty input', () => {
      const filter = createDiversityFilter();
      expect(filter.filter([], 5)).toEqual([]);
    });

    it('should return all examples if less than maxResults', () => {
      const filter = createDiversityFilter();
      const examples = [
        createScoredExample(createMockExample('1', 'layout', ['a']), 0.9),
        createScoredExample(createMockExample('2', 'form', ['b']), 0.8),
      ];
      const result = filter.filter(examples, 5);
      expect(result).toHaveLength(2);
    });

    it('should limit results to maxResults', () => {
      const filter = createDiversityFilter();
      const examples = [
        createScoredExample(createMockExample('1', 'layout', ['a']), 0.9),
        createScoredExample(createMockExample('2', 'form', ['b']), 0.8),
        createScoredExample(createMockExample('3', 'navigation', ['c']), 0.7),
      ];
      const result = filter.filter(examples, 2);
      expect(result).toHaveLength(2);
    });

    it('should disable filtering when threshold is 0', () => {
      const filter = createDiversityFilter({ diversityThreshold: 0 });
      const examples = [
        createScoredExample(createMockExample('1', 'layout', ['a', 'b']), 0.9),
        createScoredExample(createMockExample('2', 'layout', ['a', 'b']), 0.8),
        createScoredExample(createMockExample('3', 'layout', ['a', 'b']), 0.7),
      ];
      const result = filter.filter(examples, 3);
      expect(result).toHaveLength(3);
      // 应该按原始顺序返回
      expect(result[0].example.id).toBe('1');
      expect(result[1].example.id).toBe('2');
      expect(result[2].example.id).toBe('3');
    });

    it('should prefer diverse examples over similar ones', () => {
      const filter = createDiversityFilter({ diversityThreshold: 0.3 });
      const examples = [
        createScoredExample(createMockExample('1', 'layout', ['sidebar']), 0.9),
        createScoredExample(createMockExample('2', 'layout', ['sidebar']), 0.85),
        createScoredExample(createMockExample('3', 'form', ['input']), 0.8),
      ];
      const result = filter.filter(examples, 2);
      // 应该选择 1 和 3（更多样化），而不是 1 和 2（太相似）
      const ids = result.map(r => r.example.id);
      expect(ids).toContain('1');
      expect(ids).toContain('3');
    });

    it('should not return examples with 70%+ tag overlap in same category', () => {
      const filter = createDiversityFilter({ diversityThreshold: 0.3 });
      // 两个案例：相同分类 + 70% 标签重叠
      const examples = [
        createScoredExample(
          createMockExample('1', 'layout', ['sidebar', 'navigation', 'menu']),
          0.9
        ),
        createScoredExample(
          createMockExample('2', 'layout', ['sidebar', 'navigation', 'header']),
          0.85
        ),
        createScoredExample(
          createMockExample('3', 'form', ['input', 'validation']),
          0.7
        ),
      ];
      const result = filter.filter(examples, 2);
      const ids = result.map(r => r.example.id);
      // 不应该同时包含 1 和 2
      expect(!(ids.includes('1') && ids.includes('2')) || ids.includes('3')).toBe(true);
    });
  });

  describe('setOptions', () => {
    it('should update options', () => {
      const filter = createDiversityFilter();
      filter.setOptions({ diversityThreshold: 0.5 });
      expect(filter.getOptions().diversityThreshold).toBe(0.5);
    });

    it('should preserve unset options', () => {
      const filter = createDiversityFilter({ categoryWeight: 0.5 });
      filter.setOptions({ diversityThreshold: 0.5 });
      expect(filter.getOptions().categoryWeight).toBe(0.5);
    });
  });
});

// ============================================================================
// 属性测试
// ============================================================================

describe('DiversityFilter Properties', () => {
  const categories: ExampleCategory[] = ['layout', 'form', 'navigation', 'dashboard', 'display', 'feedback'];
  const allTags = ['sidebar', 'navigation', 'form', 'input', 'button', 'card', 'table', 'modal', 'header', 'footer'];

  const arbitraryExample = fc.record({
    id: fc.string({ minLength: 1, maxLength: 10 }),
    title: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.string({ minLength: 1, maxLength: 100 }),
    category: fc.constantFrom(...categories),
    tags: fc.array(fc.constantFrom(...allTags), { minLength: 1, maxLength: 5 }),
    schema: fc.constant({ version: '1.0', root: { id: 'root', type: 'Box', children: [] } }),
    source: fc.constant('system' as const),
  }) as fc.Arbitrary<ExampleMetadata>;

  const arbitraryScoredExample = fc.record({
    example: arbitraryExample,
    score: fc.float({ min: 0, max: 1, noNaN: true }),
  }) as fc.Arbitrary<ScoredExample>;

  /**
   * Property 5: 多样性过滤约束
   * 过滤后的结果数量不应超过 maxResults
   */
  it('Property 5: should never exceed maxResults', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryScoredExample, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (examples, maxResults) => {
          const filter = createDiversityFilter();
          const result = filter.filter(examples, maxResults);
          return result.length <= maxResults;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5b: 过滤后的结果应该是输入的子集
   */
  it('Property 5b: should return subset of input', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryScoredExample, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (examples, maxResults) => {
          const filter = createDiversityFilter();
          const result = filter.filter(examples, maxResults);
          const inputIds = new Set(examples.map(e => e.example.id));
          return result.every(r => inputIds.has(r.example.id));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: 多样性阈值行为
   * 阈值为 0 时应该禁用过滤
   */
  it('Property 6: should disable filtering when threshold is 0', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryScoredExample, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (examples, maxResults) => {
          const filter = createDiversityFilter({ diversityThreshold: 0 });
          const result = filter.filter(examples, maxResults);
          const expected = examples.slice(0, maxResults);
          // 阈值为 0 时，应该按原始顺序返回
          return result.length === expected.length;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 7: 多样性分数计算
   * 相似度应该在 0-1 范围内
   */
  it('Property 7: similarity should be in [0, 1] range', () => {
    fc.assert(
      fc.property(
        arbitraryExample,
        arbitraryExample,
        (a, b) => {
          const filter = createDiversityFilter();
          const similarity = filter.calculateSimilarity(a, b);
          return similarity >= 0 && similarity <= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7b: 标签重叠率应该在 0-1 范围内
   */
  it('Property 7b: tag overlap should be in [0, 1] range', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 0, maxLength: 10 }),
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 0, maxLength: 10 }),
        (tagsA, tagsB) => {
          const filter = createDiversityFilter();
          const overlap = filter.calculateTagOverlap(tagsA, tagsB);
          return overlap >= 0 && overlap <= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7c: 相同案例的相似度应该为 1
   */
  it('Property 7c: similarity of same example should be 1', () => {
    fc.assert(
      fc.property(arbitraryExample, (example) => {
        const filter = createDiversityFilter();
        const similarity = filter.calculateSimilarity(example, example);
        return similarity === 1;
      }),
      { numRuns: 50 }
    );
  });
});
