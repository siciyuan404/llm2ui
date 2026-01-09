/**
 * @file Token 计数器测试
 * @description TokenCounter 的单元测试和属性测试
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { TokenCounter, tokenCounter } from './token-counter';

describe('TokenCounter', () => {
  describe('Unit Tests', () => {
    it('should return 0 for empty string', () => {
      const counter = new TokenCounter();
      expect(counter.countTokens('')).toBe(0);
      expect(counter.countTokensDetailed('')).toEqual({
        total: 0,
        english: 0,
        chinese: 0,
        other: 0,
      });
    });

    it('should count English text correctly', () => {
      const counter = new TokenCounter();
      // "Hello" = 5 chars, ceil(5/4) = 2 tokens
      const result = counter.countTokensDetailed('Hello');
      expect(result.english).toBe(2);
      expect(result.chinese).toBe(0);
      expect(result.total).toBe(2);
    });

    it('should count Chinese text correctly', () => {
      const counter = new TokenCounter();
      // "你好世界" = 4 chars, ceil(4/1.5) = 3 tokens
      const result = counter.countTokensDetailed('你好世界');
      expect(result.chinese).toBe(3);
      expect(result.english).toBe(0);
      expect(result.total).toBe(3);
    });

    it('should count mixed text correctly', () => {
      const counter = new TokenCounter();
      // "Hello你好" = 5 English + 2 Chinese
      // English: ceil(5/4) = 2, Chinese: ceil(2/1.5) = 2
      const result = counter.countTokensDetailed('Hello你好');
      expect(result.english).toBe(2);
      expect(result.chinese).toBe(2);
      expect(result.total).toBe(4);
    });

    it('should handle special characters', () => {
      const counter = new TokenCounter();
      // "!@#$" = 4 other chars, ceil(4/4) = 1 token
      const result = counter.countTokensDetailed('!@#$');
      expect(result.other).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should detect Chinese language', () => {
      const counter = new TokenCounter();
      expect(counter.detectLanguage('这是中文文本')).toBe('zh');
    });

    it('should detect English language', () => {
      const counter = new TokenCounter();
      expect(counter.detectLanguage('This is English text')).toBe('en');
    });

    it('should detect mixed language', () => {
      const counter = new TokenCounter();
      expect(counter.detectLanguage('Hello你好World世界')).toBe('mixed');
    });

    it('should export singleton instance', () => {
      expect(tokenCounter).toBeInstanceOf(TokenCounter);
    });
  });

  /**
   * Property 2: Token Counting Accuracy
   * Feature: prompt-template-and-example-registry, Property 2: Token counting accuracy
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4
   */
  describe('Property Tests', () => {
    it('countTokens equals sum of detailed breakdown', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const counter = new TokenCounter();
          const total = counter.countTokens(text);
          const detailed = counter.countTokensDetailed(text);
          return total === detailed.english + detailed.chinese + detailed.other;
        }),
        { numRuns: 100 }
      );
    });

    it('token count is non-negative', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const counter = new TokenCounter();
          const result = counter.countTokensDetailed(text);
          return (
            result.total >= 0 &&
            result.english >= 0 &&
            result.chinese >= 0 &&
            result.other >= 0
          );
        }),
        { numRuns: 100 }
      );
    });

    it('empty string always returns zero tokens', () => {
      const counter = new TokenCounter();
      const result = counter.countTokensDetailed('');
      expect(result.total).toBe(0);
    });

    it('English text follows 4-char ratio', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')), { minLength: 0, maxLength: 100 }),
          (chars) => {
            const text = chars.join('');
            if (text.length === 0) return true;
            const counter = new TokenCounter();
            const result = counter.countTokensDetailed(text);
            // English tokens should be ceil(length / 4)
            const expectedTokens = Math.ceil(text.length / 4);
            return result.english === expectedTokens;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Chinese text follows 1.5-char ratio', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...'你好世界中文测试字符串'.split('')), { minLength: 0, maxLength: 100 }),
          (chars) => {
            const text = chars.join('');
            if (text.length === 0) return true;
            const counter = new TokenCounter();
            const result = counter.countTokensDetailed(text);
            // Chinese tokens should be ceil(length / 1.5)
            const expectedTokens = Math.ceil(text.length / 1.5);
            return result.chinese === expectedTokens;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('language detection is consistent', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const counter = new TokenCounter();
          const lang = counter.detectLanguage(text);
          return lang === 'zh' || lang === 'en' || lang === 'mixed';
        }),
        { numRuns: 100 }
      );
    });
  });
});
