/**
 * @file merge-tokens.test.ts
 * @description 令牌合并工具的属性测试和单元测试
 * @module lib/themes/utils
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  mergeTokens,
  addTokenCategory,
  removeTokenCategory,
  getTokenCategories,
  getTokensByCategory,
  formatTokensForLLM,
} from './merge-tokens';
import type { ThemeTokens, TokenCategory } from '../types';

// ============================================================================
// 测试辅助函数
// ============================================================================

/**
 * 创建基础令牌
 */
function createBaseTokens(): ThemeTokens {
  return {
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#0066cc',
      primaryForeground: '#ffffff',
      secondary: '#666666',
      secondaryForeground: '#ffffff',
      accent: '#ff6600',
      accentForeground: '#ffffff',
      muted: '#f5f5f5',
      mutedForeground: '#666666',
      border: '#e0e0e0',
      ring: '#0066cc',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    typography: {
      fontFamily: {
        sans: 'ui-sans-serif, system-ui, sans-serif',
        mono: 'ui-monospace, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    radius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
  };
}

/**
 * 生成随机令牌类别
 */
const tokenCategoryArb: fc.Arbitrary<TokenCategory> = fc.record({
  name: fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  values: fc.dictionary(
    fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
    fc.oneof(fc.string({ minLength: 1, maxLength: 50 }), fc.integer({ min: 0, max: 1000 }))
  ),
});


// ============================================================================
// Property Tests
// ============================================================================

describe('Merge Tokens - Property Tests', () => {
  /**
   * Property 5: Design Tokens Extension Merging
   * For any ThemePack with custom token extensions, the merged tokens SHALL contain
   * both base categories (colors, spacing, typography, shadows, radius) and all extension categories.
   * 
   * **Validates: Requirements 3.1.1, 3.1.2, 3.1.3**
   */
  describe('Property 5: Design Tokens Extension Merging', () => {
    it('should preserve all base categories after adding extensions', () => {
      fc.assert(
        fc.property(
          fc.array(tokenCategoryArb, { minLength: 1, maxLength: 5 }),
          (extensions) => {
            let tokens = createBaseTokens();
            
            // 添加所有扩展
            for (const ext of extensions) {
              tokens = addTokenCategory(tokens, ext);
            }
            
            // 验证基础类别仍然存在
            expect(tokens.colors).toBeDefined();
            expect(tokens.spacing).toBeDefined();
            expect(tokens.typography).toBeDefined();
            expect(tokens.shadows).toBeDefined();
            expect(tokens.radius).toBeDefined();
            
            // 验证基础类别的值没有被修改
            const base = createBaseTokens();
            expect(tokens.colors.background).toBe(base.colors.background);
            expect(tokens.spacing.md).toBe(base.spacing.md);
            expect(tokens.typography.fontFamily.sans).toBe(base.typography.fontFamily.sans);
            expect(tokens.shadows.md).toBe(base.shadows.md);
            expect(tokens.radius.md).toBe(base.radius.md);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all extension categories after merging', () => {
      fc.assert(
        fc.property(
          fc.array(tokenCategoryArb, { minLength: 1, maxLength: 5 }).filter(
            // 确保所有扩展名称唯一
            (exts) => new Set(exts.map(e => e.name)).size === exts.length
          ),
          (extensions) => {
            let tokens = createBaseTokens();
            
            // 添加所有扩展
            for (const ext of extensions) {
              tokens = addTokenCategory(tokens, ext);
            }
            
            // 验证所有扩展都存在
            expect(tokens.extensions).toBeDefined();
            for (const ext of extensions) {
              expect(tokens.extensions![ext.name]).toBeDefined();
              expect(tokens.extensions![ext.name].name).toBe(ext.name);
              expect(tokens.extensions![ext.name].description).toBe(ext.description);
              expect(tokens.extensions![ext.name].values).toEqual(ext.values);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all categories (base + extensions) from getTokenCategories', () => {
      fc.assert(
        fc.property(
          fc.array(tokenCategoryArb, { minLength: 0, maxLength: 5 }).filter(
            (exts) => new Set(exts.map(e => e.name)).size === exts.length
          ),
          (extensions) => {
            let tokens = createBaseTokens();
            
            for (const ext of extensions) {
              tokens = addTokenCategory(tokens, ext);
            }
            
            const categories = getTokenCategories(tokens);
            
            // 验证基础类别
            expect(categories).toContain('colors');
            expect(categories).toContain('spacing');
            expect(categories).toContain('typography');
            expect(categories).toContain('shadows');
            expect(categories).toContain('radius');
            
            // 验证扩展类别
            for (const ext of extensions) {
              expect(categories).toContain(ext.name);
            }
            
            // 验证总数
            expect(categories.length).toBe(5 + extensions.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


// ============================================================================
// Unit Tests
// ============================================================================

describe('Merge Tokens - Unit Tests', () => {
  describe('mergeTokens', () => {
    it('should merge base tokens with override', () => {
      const base = createBaseTokens();
      const override: Partial<ThemeTokens> = {
        colors: {
          ...base.colors,
          primary: '#ff0000',
        },
      };
      
      const result = mergeTokens(base, override);
      
      expect(result.colors.primary).toBe('#ff0000');
      expect(result.colors.background).toBe(base.colors.background);
    });

    it('should merge extensions', () => {
      const base = createBaseTokens();
      base.extensions = {
        custom1: {
          name: 'custom1',
          description: 'Custom 1',
          values: { foo: 'bar' },
        },
      };
      
      const override: Partial<ThemeTokens> = {
        extensions: {
          custom2: {
            name: 'custom2',
            description: 'Custom 2',
            values: { baz: 'qux' },
          },
        },
      };
      
      const result = mergeTokens(base, override);
      
      expect(result.extensions?.custom1).toBeDefined();
      expect(result.extensions?.custom2).toBeDefined();
    });

    it('should preserve tokenSchema from override', () => {
      const base = createBaseTokens();
      const override: Partial<ThemeTokens> = {
        tokenSchema: {
          categories: [{ name: 'custom', type: 'string', required: true }],
        },
      };
      
      const result = mergeTokens(base, override);
      
      expect(result.tokenSchema).toBe(override.tokenSchema);
    });
  });

  describe('addTokenCategory', () => {
    it('should add a new token category', () => {
      const tokens = createBaseTokens();
      const category: TokenCategory = {
        name: 'animations',
        description: 'Animation tokens',
        values: { duration: '200ms', easing: 'ease-in-out' },
      };
      
      const result = addTokenCategory(tokens, category);
      
      expect(result.extensions?.animations).toBeDefined();
      expect(result.extensions?.animations.values.duration).toBe('200ms');
    });

    it('should preserve existing extensions', () => {
      let tokens = createBaseTokens();
      tokens = addTokenCategory(tokens, {
        name: 'first',
        description: 'First',
        values: { a: '1' },
      });
      tokens = addTokenCategory(tokens, {
        name: 'second',
        description: 'Second',
        values: { b: '2' },
      });
      
      expect(tokens.extensions?.first).toBeDefined();
      expect(tokens.extensions?.second).toBeDefined();
    });
  });

  describe('removeTokenCategory', () => {
    it('should remove an existing token category', () => {
      let tokens = createBaseTokens();
      tokens = addTokenCategory(tokens, {
        name: 'toRemove',
        description: 'To Remove',
        values: { x: 'y' },
      });
      
      const result = removeTokenCategory(tokens, 'toRemove');
      
      expect(result.extensions?.toRemove).toBeUndefined();
    });

    it('should preserve other extensions when removing one', () => {
      let tokens = createBaseTokens();
      tokens = addTokenCategory(tokens, {
        name: 'keep',
        description: 'Keep',
        values: { a: '1' },
      });
      tokens = addTokenCategory(tokens, {
        name: 'remove',
        description: 'Remove',
        values: { b: '2' },
      });
      
      const result = removeTokenCategory(tokens, 'remove');
      
      expect(result.extensions?.keep).toBeDefined();
      expect(result.extensions?.remove).toBeUndefined();
    });

    it('should set extensions to undefined when removing last category', () => {
      let tokens = createBaseTokens();
      tokens = addTokenCategory(tokens, {
        name: 'only',
        description: 'Only',
        values: { x: 'y' },
      });
      
      const result = removeTokenCategory(tokens, 'only');
      
      expect(result.extensions).toBeUndefined();
    });

    it('should handle removing non-existent category', () => {
      const tokens = createBaseTokens();
      const result = removeTokenCategory(tokens, 'nonExistent');
      
      expect(result).toEqual(tokens);
    });
  });

  describe('getTokenCategories', () => {
    it('should return base categories for tokens without extensions', () => {
      const tokens = createBaseTokens();
      const categories = getTokenCategories(tokens);
      
      expect(categories).toEqual(['colors', 'spacing', 'typography', 'shadows', 'radius']);
    });

    it('should include extension categories', () => {
      let tokens = createBaseTokens();
      tokens = addTokenCategory(tokens, {
        name: 'custom',
        description: 'Custom',
        values: {},
      });
      
      const categories = getTokenCategories(tokens);
      
      expect(categories).toContain('custom');
      expect(categories.length).toBe(6);
    });
  });

  describe('getTokensByCategory', () => {
    it('should return colors for colors category', () => {
      const tokens = createBaseTokens();
      const colors = getTokensByCategory(tokens, 'colors');
      
      expect(colors).toBeDefined();
      expect(colors!.background).toBe('#ffffff');
    });

    it('should return spacing for spacing category', () => {
      const tokens = createBaseTokens();
      const spacing = getTokensByCategory(tokens, 'spacing');
      
      expect(spacing).toBeDefined();
      expect(spacing!.md).toBe('1rem');
    });

    it('should return flattened typography', () => {
      const tokens = createBaseTokens();
      const typography = getTokensByCategory(tokens, 'typography');
      
      expect(typography).toBeDefined();
      expect(typography!['fontFamily-sans']).toBeDefined();
      expect(typography!['fontSize-base']).toBeDefined();
    });

    it('should return extension values', () => {
      let tokens = createBaseTokens();
      tokens = addTokenCategory(tokens, {
        name: 'custom',
        description: 'Custom',
        values: { foo: 'bar' },
      });
      
      const custom = getTokensByCategory(tokens, 'custom');
      
      expect(custom).toBeDefined();
      expect(custom!.foo).toBe('bar');
    });

    it('should return undefined for non-existent category', () => {
      const tokens = createBaseTokens();
      const result = getTokensByCategory(tokens, 'nonExistent');
      
      expect(result).toBeUndefined();
    });
  });

  describe('formatTokensForLLM', () => {
    it('should format tokens as readable string', () => {
      const tokens = createBaseTokens();
      const formatted = formatTokensForLLM(tokens);
      
      expect(formatted).toContain('## Colors');
      expect(formatted).toContain('background: #ffffff');
      expect(formatted).toContain('## Spacing');
      expect(formatted).toContain('md: 1rem');
      expect(formatted).toContain('## Typography');
      expect(formatted).toContain('## Shadows');
      expect(formatted).toContain('## Border Radius');
    });

    it('should include extension categories', () => {
      let tokens = createBaseTokens();
      tokens = addTokenCategory(tokens, {
        name: 'animations',
        description: 'Animation tokens',
        values: { duration: '200ms' },
      });
      
      const formatted = formatTokensForLLM(tokens);
      
      expect(formatted).toContain('## animations (Animation tokens)');
      expect(formatted).toContain('duration: 200ms');
    });
  });
});
