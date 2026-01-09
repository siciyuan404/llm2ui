/**
 * @file theme-validator.test.ts
 * @description 主题验证工具的属性测试和单元测试
 * @module lib/themes
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateThemePack, createThemePack, isValidThemePack } from './theme-validator';
import { ThemeErrorCode } from './types';
import { ComponentRegistry } from '../core/component-registry';

// ============================================================================
// 测试辅助函数
// ============================================================================

/**
 * 创建一个有效的 ThemePack 输入
 */
function createValidThemePackInput(id: string = 'test-theme') {
  return {
    id,
    name: `Theme ${id}`,
    description: `Description for ${id}`,
    version: '1.0.0',
    tokens: {
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
    },
    components: {
      registry: new ComponentRegistry(),
    },
    examples: {
      presets: [],
    },
    prompts: {
      templates: {
        zh: {
          systemIntro: '系统介绍',
          iconGuidelines: '图标指南',
          componentDocs: '组件文档',
          positiveExamples: '正面案例',
          negativeExamples: '负面案例',
          closing: '结束语',
        },
        en: {
          systemIntro: 'System intro',
          iconGuidelines: 'Icon guidelines',
          componentDocs: 'Component docs',
          positiveExamples: 'Positive examples',
          negativeExamples: 'Negative examples',
          closing: 'Closing',
        },
      },
    },
    colorSchemes: [
      {
        id: 'light',
        name: 'Light',
        type: 'light' as const,
        colors: {
          background: '#ffffff',
          foreground: '#000000',
          primary: '#0066cc',
          secondary: '#666666',
          accent: '#ff6600',
          muted: '#f5f5f5',
          border: '#e0e0e0',
        },
      },
    ],
    layouts: [
      {
        id: 'default',
        name: 'Default',
        description: 'Default layout',
        config: {
          sidebar: 'left' as const,
          mainContent: 'full' as const,
          previewPanel: 'right' as const,
        },
      },
    ],
  };
}


// ============================================================================
// Property Tests
// ============================================================================

describe('Theme Validator - Property Tests', () => {
  /**
   * Property 12: Third-Party Theme Validation
   * For any ThemePack created via createThemePack factory,
   * if the input is invalid, the factory SHALL throw a descriptive error.
   * 
   * **Validates: Requirements 12.2, 12.6, 12.7**
   */
  describe('Property 12: Third-Party Theme Validation', () => {
    it('should throw error with descriptive message for invalid theme pack', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // 缺少 id
            fc.constant({ ...createValidThemePackInput(), id: '' }),
            // 无效的 id 格式
            fc.constant({ ...createValidThemePackInput(), id: '123invalid' }),
            fc.constant({ ...createValidThemePackInput(), id: 'Invalid' }),
            // 缺少 name
            fc.constant({ ...createValidThemePackInput(), name: '' }),
            // 缺少 tokens
            fc.constant({ ...createValidThemePackInput(), tokens: null }),
            // 缺少 colorSchemes
            fc.constant({ ...createValidThemePackInput(), colorSchemes: [] }),
            // 缺少 layouts
            fc.constant({ ...createValidThemePackInput(), layouts: [] })
          ),
          (invalidInput) => {
            expect(() => createThemePack(invalidInput as any)).toThrow();
            
            try {
              createThemePack(invalidInput as any);
            } catch (error: any) {
              // 验证错误是 ThemeError
              expect(error.code).toBe(ThemeErrorCode.INVALID_THEME_PACK);
              // 验证错误消息是描述性的
              expect(error.message).toContain('Invalid theme pack');
              // 验证错误详情包含具体错误
              expect(error.details).toBeDefined();
              expect(error.details.errors).toBeDefined();
              expect(Array.isArray(error.details.errors)).toBe(true);
              expect(error.details.errors.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should accept valid theme pack and return ThemePack', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
          (themeId) => {
            const input = createValidThemePackInput(themeId);
            const result = createThemePack(input);
            
            expect(result).toBeDefined();
            expect(result.id).toBe(themeId);
            expect(result.name).toBe(input.name);
            expect(result.version).toBe(input.version);
            expect(result.tokens).toBe(input.tokens);
            expect(result.components).toBe(input.components);
            expect(result.examples).toBe(input.examples);
            expect(result.prompts).toBe(input.prompts);
            expect(result.colorSchemes).toBe(input.colorSchemes);
            expect(result.layouts).toBe(input.layouts);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate all required fields are present', () => {
      const requiredFields = [
        'id', 'name', 'description', 'version',
        'tokens', 'components', 'examples', 'prompts',
        'colorSchemes', 'layouts'
      ];

      for (const field of requiredFields) {
        const input = createValidThemePackInput();
        delete (input as any)[field];
        
        const result = validateThemePack(input);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Theme Validator - Unit Tests', () => {
  describe('validateThemePack', () => {
    it('should return valid for a complete theme pack', () => {
      const input = createValidThemePackInput();
      const result = validateThemePack(input);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for null input', () => {
      const result = validateThemePack(null);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme pack must be an object');
    });

    it('should return invalid for non-object input', () => {
      const result = validateThemePack('not an object');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme pack must be an object');
    });

    it('should validate id format', () => {
      const input = createValidThemePackInput();
      input.id = 'Invalid-ID';
      
      const result = validateThemePack(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
    });

    it('should warn about non-semver version', () => {
      const input = createValidThemePackInput();
      input.version = 'v1';
      
      const result = validateThemePack(input);
      
      expect(result.warnings.some(w => w.includes('semver'))).toBe(true);
    });

    it('should validate color tokens', () => {
      const input = createValidThemePackInput();
      delete (input.tokens.colors as any).background;
      
      const result = validateThemePack(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('colors.background'))).toBe(true);
    });

    it('should validate spacing tokens', () => {
      const input = createValidThemePackInput();
      delete (input.tokens.spacing as any).md;
      
      const result = validateThemePack(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('spacing.md'))).toBe(true);
    });

    it('should validate typography tokens', () => {
      const input = createValidThemePackInput();
      delete (input.tokens.typography as any).fontFamily;
      
      const result = validateThemePack(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('typography.fontFamily'))).toBe(true);
    });

    it('should validate color schemes', () => {
      const input = createValidThemePackInput();
      input.colorSchemes = [];
      
      const result = validateThemePack(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('colorSchemes'))).toBe(true);
    });

    it('should validate layouts', () => {
      const input = createValidThemePackInput();
      input.layouts = [];
      
      const result = validateThemePack(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('layouts'))).toBe(true);
    });

    it('should validate prompt templates', () => {
      const input = createValidThemePackInput();
      delete (input.prompts.templates.zh as any).systemIntro;
      
      const result = validateThemePack(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('systemIntro'))).toBe(true);
    });
  });

  describe('createThemePack', () => {
    it('should create a valid theme pack', () => {
      const input = createValidThemePackInput();
      const result = createThemePack(input);
      
      expect(result.id).toBe(input.id);
      expect(result.name).toBe(input.name);
    });

    it('should throw ThemeError for invalid input', () => {
      const input = createValidThemePackInput();
      input.id = '';
      
      expect(() => createThemePack(input)).toThrow();
      
      try {
        createThemePack(input);
      } catch (error: any) {
        expect(error.code).toBe(ThemeErrorCode.INVALID_THEME_PACK);
      }
    });
  });

  describe('isValidThemePack', () => {
    it('should return true for valid theme pack', () => {
      const input = createValidThemePackInput();
      expect(isValidThemePack(input)).toBe(true);
    });

    it('should return false for invalid theme pack', () => {
      expect(isValidThemePack(null)).toBe(false);
      expect(isValidThemePack({})).toBe(false);
      expect(isValidThemePack({ id: '' })).toBe(false);
    });
  });
});
