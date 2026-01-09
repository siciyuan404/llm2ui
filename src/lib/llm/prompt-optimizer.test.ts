/**
 * @file 提示词优化器测试
 * @description PromptOptimizer 的单元测试和属性测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { PromptOptimizer, promptOptimizer, DEFAULT_TRIM_PRIORITIES } from './prompt-optimizer';

describe('PromptOptimizer', () => {
  let optimizer: PromptOptimizer;

  beforeEach(() => {
    optimizer = new PromptOptimizer();
  });

  describe('Unit Tests', () => {
    it('should not trim when under limit', () => {
      const sections = new Map([
        ['system-intro', 'Short intro'],
        ['closing', 'Short closing'],
      ]);

      const result = optimizer.optimize(sections, { targetTokens: 1000 });
      expect(result.trimmedSections).toEqual([]);
      expect(result.remainingSections).toEqual(['system-intro', 'closing']);
    });

    it('should trim high priority sections first', () => {
      const sections = new Map([
        ['system-intro', 'A'.repeat(100)],
        ['relevant-examples', 'B'.repeat(100)],
        ['negative-examples', 'C'.repeat(100)],
      ]);

      const result = optimizer.optimize(sections, { targetTokens: 60 });
      // relevant-examples 优先级最高，应该先被裁剪
      expect(result.trimmedSections[0]).toBe('relevant-examples');
    });

    it('should respect custom priorities', () => {
      const sections = new Map([
        ['section-a', 'A'.repeat(100)],
        ['section-b', 'B'.repeat(100)],
      ]);

      const customPriorities = {
        'section-a': 10,
        'section-b': 1,
      };

      const result = optimizer.optimize(sections, {
        targetTokens: 30,
        priorities: customPriorities,
      });

      // section-a 优先级更高，应该先被裁剪
      expect(result.trimmedSections[0]).toBe('section-a');
    });

    it('should return empty content when all sections trimmed', () => {
      const sections = new Map([
        ['system-intro', 'A'.repeat(1000)],
      ]);

      const result = optimizer.optimize(sections, { targetTokens: 1 });
      expect(result.content).toBe('');
      expect(result.tokenCount).toBe(0);
      expect(result.trimmedSections).toContain('system-intro');
    });

    it('should calculate trim plan', () => {
      const sections = new Map([
        ['system-intro', 'A'.repeat(100)],
        ['relevant-examples', 'B'.repeat(100)],
      ]);

      const plan = optimizer.calculateTrimPlan(sections, 30);
      expect(plan.length).toBeGreaterThan(0);
    });

    it('should estimate tokens after trim', () => {
      const sections = new Map([
        ['system-intro', 'Hello'],
        ['closing', 'World'],
      ]);

      const tokens = optimizer.estimateTokensAfterTrim(sections, ['closing']);
      expect(tokens).toBeGreaterThan(0);
    });

    it('should get priority for section', () => {
      expect(optimizer.getPriority('relevant-examples')).toBe(7);
      expect(optimizer.getPriority('system-intro')).toBe(1);
      expect(optimizer.getPriority('unknown')).toBe(0);
    });

    it('should sort by priority', () => {
      const sections = ['system-intro', 'relevant-examples', 'closing'];
      const sorted = optimizer.sortByPriority(sections);
      expect(sorted[0]).toBe('relevant-examples');
      expect(sorted[sorted.length - 1]).toBe('system-intro');
    });

    it('should export singleton instance', () => {
      expect(promptOptimizer).toBeInstanceOf(PromptOptimizer);
    });

    it('should export default priorities', () => {
      expect(DEFAULT_TRIM_PRIORITIES['relevant-examples']).toBe(7);
      expect(DEFAULT_TRIM_PRIORITIES['system-intro']).toBe(1);
    });
  });

  /**
   * Property 4: Token Limit Trimming Behavior
   * Feature: prompt-template-and-example-registry, Property 4: Token limit trimming behavior
   * Validates: Requirements 3.3, 3.4
   */
  describe('Property Tests', () => {
    it('optimized result never exceeds target tokens', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }),
          fc.array(
            fc.record({
              name: fc.constantFrom('system-intro', 'icon-guidelines', 'component-docs', 'positive-examples', 'negative-examples', 'relevant-examples', 'closing'),
              content: fc.string({ minLength: 10, maxLength: 200 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (targetTokens, sectionData) => {
            const sections = new Map(sectionData.map(s => [s.name, s.content]));
            const result = optimizer.optimize(sections, { targetTokens });
            return result.tokenCount <= targetTokens;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('trimmed sections are removed from remaining sections', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }),
          fc.array(
            fc.record({
              name: fc.constantFrom('system-intro', 'icon-guidelines', 'component-docs'),
              content: fc.string({ minLength: 50, maxLength: 200 }),
            }),
            { minLength: 2, maxLength: 4 }
          ),
          (targetTokens, sectionData) => {
            const sections = new Map(sectionData.map(s => [s.name, s.content]));
            const result = optimizer.optimize(sections, { targetTokens });
            
            // 裁剪的部分不应该在剩余部分中
            const intersection = result.trimmedSections.filter(s => 
              result.remainingSections.includes(s)
            );
            return intersection.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('higher priority sections are trimmed first', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 50 }),
          (targetTokens) => {
            const sections = new Map([
              ['system-intro', 'A'.repeat(100)],      // priority 1
              ['icon-guidelines', 'B'.repeat(100)],  // priority 3
              ['relevant-examples', 'C'.repeat(100)], // priority 7
            ]);

            const result = optimizer.optimize(sections, { targetTokens });
            
            if (result.trimmedSections.length === 0) return true;
            
            // 第一个被裁剪的应该是 relevant-examples（优先级最高）
            return result.trimmedSections[0] === 'relevant-examples';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all sections accounted for in result', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }),
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 10 }),
              content: fc.string({ minLength: 10, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (targetTokens, sectionData) => {
            // 确保名称唯一
            const uniqueSections = new Map(sectionData.map(s => [s.name, s.content]));
            const result = optimizer.optimize(uniqueSections, { targetTokens });
            
            const allSections = new Set([...result.trimmedSections, ...result.remainingSections]);
            return allSections.size === uniqueSections.size;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('empty sections map returns empty result', () => {
      const sections = new Map<string, string>();
      const result = optimizer.optimize(sections, { targetTokens: 100 });
      
      expect(result.content).toBe('');
      expect(result.tokenCount).toBe(0);
      expect(result.trimmedSections).toEqual([]);
      expect(result.remainingSections).toEqual([]);
    });
  });
});
