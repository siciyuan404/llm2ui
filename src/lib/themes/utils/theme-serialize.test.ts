/**
 * @file theme-serialize.test.ts
 * @description 主题序列化工具的属性测试和单元测试
 * @module lib/themes/utils
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  exportTheme,
  importTheme,
  cloneTheme,
  mergeThemes,
  validateExportedJson,
} from './serialize-theme';
import type { ThemePack } from '../types';
import { ComponentRegistry } from '../../core/component-registry';

// ============================================================================
// 测试辅助函数
// ============================================================================

/**
 * 创建一个最小的有效 ThemePack
 */
function createMockThemePack(id: string, name?: string): ThemePack {
  return {
    id,
    name: name || `Theme ${id}`,
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
        type: 'light',
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
          sidebar: 'left',
          mainContent: 'full',
          previewPanel: 'right',
        },
      },
    ],
  };
}

/**
 * 生成有效的主题 ID
 */
const themeIdArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/);

/**
 * 生成有效的版本号
 */
const versionArb = fc.tuple(
  fc.integer({ min: 0, max: 99 }),
  fc.integer({ min: 0, max: 99 }),
  fc.integer({ min: 0, max: 99 })
).map(([major, minor, patch]) => `${major}.${minor}.${patch}`);

// ============================================================================
// Property Tests
// ============================================================================

describe('Theme Serialize - Property Tests', () => {
  /**
   * Property 10: Theme Import/Export Round-Trip
   * For any valid ThemePack, exporting to JSON and importing back SHALL produce
   * a ThemePack with identical serializable properties.
   * 
   * **Validates: Requirements 14.1, 14.2, 14.3, 14.4**
   */
  describe('Property 10: Theme Import/Export Round-Trip', () => {
    it('should preserve theme id after round-trip', () => {
      fc.assert(
        fc.property(themeIdArb, (themeId) => {
          const original = createMockThemePack(themeId);
          const json = exportTheme(original);
          const imported = importTheme(json);
          
          expect(imported.id).toBe(original.id);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve theme name after round-trip', () => {
      fc.assert(
        fc.property(
          themeIdArb,
          fc.string({ minLength: 1, maxLength: 50 }),
          (themeId, themeName) => {
            const original = createMockThemePack(themeId, themeName);
            const json = exportTheme(original);
            const imported = importTheme(json);
            
            expect(imported.name).toBe(original.name);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve theme version after round-trip', () => {
      fc.assert(
        fc.property(themeIdArb, versionArb, (themeId, version) => {
          const original = createMockThemePack(themeId);
          original.version = version;
          
          const json = exportTheme(original);
          const imported = importTheme(json);
          
          expect(imported.version).toBe(original.version);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve tokens after round-trip', () => {
      fc.assert(
        fc.property(themeIdArb, (themeId) => {
          const original = createMockThemePack(themeId);
          const json = exportTheme(original);
          const imported = importTheme(json);
          
          // 验证颜色令牌
          expect(imported.tokens.colors.background).toBe(original.tokens.colors.background);
          expect(imported.tokens.colors.primary).toBe(original.tokens.colors.primary);
          
          // 验证间距令牌
          expect(imported.tokens.spacing.md).toBe(original.tokens.spacing.md);
          
          // 验证排版令牌
          expect(imported.tokens.typography.fontFamily.sans).toBe(original.tokens.typography.fontFamily.sans);
          expect(imported.tokens.typography.fontSize.base).toBe(original.tokens.typography.fontSize.base);
          
          // 验证阴影令牌
          expect(imported.tokens.shadows.md).toBe(original.tokens.shadows.md);
          
          // 验证圆角令牌
          expect(imported.tokens.radius.md).toBe(original.tokens.radius.md);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve color schemes after round-trip', () => {
      fc.assert(
        fc.property(themeIdArb, (themeId) => {
          const original = createMockThemePack(themeId);
          const json = exportTheme(original);
          const imported = importTheme(json);
          
          expect(imported.colorSchemes).toHaveLength(original.colorSchemes!.length);
          expect(imported.colorSchemes![0].id).toBe(original.colorSchemes![0].id);
          expect(imported.colorSchemes![0].name).toBe(original.colorSchemes![0].name);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve layouts after round-trip', () => {
      fc.assert(
        fc.property(themeIdArb, (themeId) => {
          const original = createMockThemePack(themeId);
          const json = exportTheme(original);
          const imported = importTheme(json);
          
          expect(imported.layouts).toHaveLength(original.layouts!.length);
          expect(imported.layouts![0].id).toBe(original.layouts![0].id);
          expect(imported.layouts![0].name).toBe(original.layouts![0].name);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve prompts after round-trip', () => {
      fc.assert(
        fc.property(themeIdArb, (themeId) => {
          const original = createMockThemePack(themeId);
          const json = exportTheme(original);
          const imported = importTheme(json);
          
          expect(imported.prompts.templates.zh.systemIntro).toBe(original.prompts.templates.zh.systemIntro);
          expect(imported.prompts.templates.en.systemIntro).toBe(original.prompts.templates.en.systemIntro);
        }),
        { numRuns: 100 }
      );
    });

    it('should create new component registry on import', () => {
      fc.assert(
        fc.property(themeIdArb, (themeId) => {
          const original = createMockThemePack(themeId);
          const json = exportTheme(original);
          const imported = importTheme(json);
          
          // 组件注册表应该是新实例
          expect(imported.components.registry).toBeDefined();
          expect(imported.components.registry).not.toBe(original.components.registry);
        }),
        { numRuns: 100 }
      );
    });
  });
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Theme Serialize - Unit Tests', () => {
  describe('exportTheme', () => {
    it('should export theme to valid JSON string', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should not include component registry in export', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      const parsed = JSON.parse(json);
      
      expect(parsed.components).toBeUndefined();
    });

    it('should include all serializable properties', () => {
      const theme = createMockThemePack('test-theme');
      theme.author = 'Test Author';
      theme.repository = 'https://github.com/test/repo';
      theme.homepage = 'https://example.com';
      
      const json = exportTheme(theme);
      const parsed = JSON.parse(json);
      
      expect(parsed.id).toBe('test-theme');
      expect(parsed.name).toBe('Theme test-theme');
      expect(parsed.author).toBe('Test Author');
      expect(parsed.repository).toBe('https://github.com/test/repo');
      expect(parsed.homepage).toBe('https://example.com');
    });

    it('should format JSON with indentation', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      
      // 检查是否有换行和缩进
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });
  });

  describe('importTheme', () => {
    it('should import valid JSON to ThemePack', () => {
      const original = createMockThemePack('test-theme');
      const json = exportTheme(original);
      const imported = importTheme(json);
      
      expect(imported.id).toBe('test-theme');
      expect(imported.name).toBe('Theme test-theme');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => importTheme('not valid json')).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidJson = JSON.stringify({ id: 'test' });
      
      expect(() => importTheme(invalidJson)).toThrow();
    });

    it('should create empty component registry', () => {
      const original = createMockThemePack('test-theme');
      const json = exportTheme(original);
      const imported = importTheme(json);
      
      expect(imported.components).toBeDefined();
      expect(imported.components.registry).toBeDefined();
    });
  });

  describe('cloneTheme', () => {
    it('should create a deep copy of theme', () => {
      const original = createMockThemePack('original-theme');
      const cloned = cloneTheme(original);
      
      // 修改克隆不应影响原始
      cloned.tokens.colors.primary = '#ff0000';
      
      expect(original.tokens.colors.primary).toBe('#0066cc');
      expect(cloned.tokens.colors.primary).toBe('#ff0000');
    });

    it('should use new id when provided', () => {
      const original = createMockThemePack('original-theme');
      const cloned = cloneTheme(original, 'cloned-theme');
      
      expect(cloned.id).toBe('cloned-theme');
      expect(cloned.name).toContain('Copy');
    });

    it('should preserve original id when not provided', () => {
      const original = createMockThemePack('original-theme');
      const cloned = cloneTheme(original);
      
      expect(cloned.id).toBe('original-theme');
    });
  });

  describe('mergeThemes', () => {
    it('should merge base with override', () => {
      const base = createMockThemePack('base-theme');
      const override: Partial<ThemePack> = {
        name: 'Merged Theme',
        tokens: {
          ...base.tokens,
          colors: {
            ...base.tokens.colors,
            primary: '#ff0000',
          },
        },
      };
      
      const merged = mergeThemes(base, override);
      
      expect(merged.name).toBe('Merged Theme');
      expect(merged.tokens.colors.primary).toBe('#ff0000');
      expect(merged.tokens.colors.background).toBe('#ffffff');
    });

    it('should preserve base properties not in override', () => {
      const base = createMockThemePack('base-theme');
      base.author = 'Original Author';
      
      const override: Partial<ThemePack> = {
        name: 'Merged Theme',
      };
      
      const merged = mergeThemes(base, override);
      
      expect(merged.author).toBe('Original Author');
    });

    it('should deep merge tokens', () => {
      const base = createMockThemePack('base-theme');
      const override: Partial<ThemePack> = {
        tokens: {
          ...base.tokens,
          colors: {
            ...base.tokens.colors,
            primary: '#ff0000',
          },
          spacing: {
            ...base.tokens.spacing,
            md: '2rem',
          },
        },
      };
      
      const merged = mergeThemes(base, override);
      
      expect(merged.tokens.colors.primary).toBe('#ff0000');
      expect(merged.tokens.colors.background).toBe('#ffffff');
      expect(merged.tokens.spacing.md).toBe('2rem');
      expect(merged.tokens.spacing.sm).toBe('0.5rem');
    });
  });

  describe('validateExportedJson', () => {
    it('should return valid for correct JSON', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      
      const result = validateExportedJson(json);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for malformed JSON', () => {
      const result = validateExportedJson('not valid json');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return invalid for incomplete theme', () => {
      const incompleteJson = JSON.stringify({ id: 'test' });
      
      const result = validateExportedJson(incompleteJson);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
