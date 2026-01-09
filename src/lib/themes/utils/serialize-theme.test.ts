/**
 * @file serialize-theme.test.ts
 * @description 主题序列化工具的属性测试
 * @module lib/themes/utils
 *
 * **Property 10: Theme Import/Export Round-Trip**
 * **Validates: Requirements 14.1, 14.2, 14.3, 14.4**
 * 
 * @vitest-environment node
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
import type { ThemePack, ColorScheme } from '../types';
import { ThemeError, ThemeErrorCode } from '../types';
import { ComponentRegistry } from '../../core/component-registry';

function createMockThemePack(id: string, name?: string): ThemePack {
  return {
    id,
    name: name || `Theme ${id}`,
    description: `Description for ${id}`,
    version: '1.0.0',
    author: 'Test Author',
    repository: 'https://github.com/test/theme',
    homepage: 'https://example.com',
    previewImage: 'https://example.com/preview.png',
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
      presets: [
        {
          id: 'example-1',
          name: 'Example 1',
          description: 'Test example',
          category: 'layout',
          tags: ['test'],
          schema: { version: '1.0', root: { type: 'Container', props: {} } },
        },
      ],
    },
    prompts: {
      templates: {
        zh: {
          systemIntro: 'intro',
          iconGuidelines: 'icon',
          componentDocs: 'docs',
          positiveExamples: 'pos',
          negativeExamples: 'neg',
          closing: 'close',
        },
        en: {
          systemIntro: 'intro',
          iconGuidelines: 'icon',
          componentDocs: 'docs',
          positiveExamples: 'pos',
          negativeExamples: 'neg',
          closing: 'close',
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

const themeIdArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/);


const versionArb = fc
  .tuple(
    fc.integer({ min: 0, max: 99 }),
    fc.integer({ min: 0, max: 99 }),
    fc.integer({ min: 0, max: 99 })
  )
  .map(([major, minor, patch]) => `${major}.${minor}.${patch}`);

const themePackArb = fc
  .record({
    id: themeIdArb,
    name: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.string({ minLength: 0, maxLength: 200 }),
    version: versionArb,
  })
  .map((base) => ({
    ...createMockThemePack(base.id, base.name),
    ...base,
  }));

describe('Theme Serialization - Property Tests', () => {
  describe('Property 10: Theme Import/Export Round-Trip', () => {
    it('should preserve all serializable fields after export and import', () => {
      fc.assert(
        fc.property(themePackArb, (theme) => {
          const json = exportTheme(theme);
          const imported = importTheme(json);
          expect(imported.id).toBe(theme.id);
          expect(imported.name).toBe(theme.name);
          expect(imported.description).toBe(theme.description);
          expect(imported.version).toBe(theme.version);
          expect(imported.tokens.colors).toEqual(theme.tokens.colors);
          expect(imported.tokens.spacing).toEqual(theme.tokens.spacing);
          expect(imported.colorSchemes).toEqual(theme.colorSchemes);
          expect(imported.layouts).toEqual(theme.layouts);
        }),
        { numRuns: 100 }
      );
    });

    it('should produce valid JSON that can be parsed', () => {
      fc.assert(
        fc.property(themePackArb, (theme) => {
          const json = exportTheme(theme);
          expect(() => JSON.parse(json)).not.toThrow();
          const parsed = JSON.parse(json);
          expect(typeof parsed).toBe('object');
          expect(parsed).not.toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it('should validate exported JSON successfully', () => {
      fc.assert(
        fc.property(themePackArb, (theme) => {
          const json = exportTheme(theme);
          const validation = validateExportedJson(json);
          expect(validation.valid).toBe(true);
          expect(validation.errors).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should create new ComponentRegistry instance on import', () => {
      fc.assert(
        fc.property(themePackArb, (theme) => {
          const json = exportTheme(theme);
          const imported = importTheme(json);
          expect(imported.components.registry).not.toBe(theme.components.registry);
          expect(imported.components.registry).toBeInstanceOf(ComponentRegistry);
        }),
        { numRuns: 50 }
      );
    });
  });
});


describe('Theme Serialization - Unit Tests', () => {
  describe('exportTheme', () => {
    it('should export theme to valid JSON string', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include all required fields in export', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      const parsed = JSON.parse(json);
      expect(parsed.id).toBe('test-theme');
      expect(parsed.name).toBe('Theme test-theme');
      expect(parsed.description).toBeDefined();
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.tokens).toBeDefined();
      expect(parsed.examples).toBeDefined();
      expect(parsed.prompts).toBeDefined();
      expect(parsed.colorSchemes).toBeDefined();
      expect(parsed.layouts).toBeDefined();
    });

    it('should not include component registry in export', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      const parsed = JSON.parse(json);
      expect(parsed.components).toBeUndefined();
    });

    it('should include optional metadata fields', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      const parsed = JSON.parse(json);
      expect(parsed.author).toBe('Test Author');
      expect(parsed.repository).toBe('https://github.com/test/theme');
      expect(parsed.homepage).toBe('https://example.com');
      expect(parsed.previewImage).toBe('https://example.com/preview.png');
    });
  });

  describe('importTheme', () => {
    it('should import theme from valid JSON', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      const imported = importTheme(json);
      expect(imported.id).toBe('test-theme');
      expect(imported.name).toBe('Theme test-theme');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => importTheme('not valid json')).toThrow(ThemeError);
      try {
        importTheme('not valid json');
      } catch (error) {
        expect((error as ThemeError).code).toBe(ThemeErrorCode.IMPORT_FAILED);
      }
    });

    it('should throw error for missing required fields', () => {
      const invalidJson = JSON.stringify({ id: 'test' });
      expect(() => importTheme(invalidJson)).toThrow(ThemeError);
      try {
        importTheme(invalidJson);
      } catch (error) {
        expect((error as ThemeError).code).toBe(ThemeErrorCode.IMPORT_FAILED);
      }
    });

    it('should create new ComponentRegistry on import', () => {
      const theme = createMockThemePack('test-theme');
      const json = exportTheme(theme);
      const imported = importTheme(json);
      expect(imported.components).toBeDefined();
      expect(imported.components.registry).toBeInstanceOf(ComponentRegistry);
    });
  });

  describe('cloneTheme', () => {
    it('should create a deep copy of theme', () => {
      const theme = createMockThemePack('original');
      const cloned = cloneTheme(theme);
      expect(cloned.id).toBe('original');
      expect(cloned).not.toBe(theme);
      expect(cloned.tokens).not.toBe(theme.tokens);
    });

    it('should use new id when provided', () => {
      const theme = createMockThemePack('original');
      const cloned = cloneTheme(theme, 'cloned');
      expect(cloned.id).toBe('cloned');
      expect(cloned.name).toBe('Theme original (Copy)');
    });

    it('should create independent component registry', () => {
      const theme = createMockThemePack('original');
      const cloned = cloneTheme(theme);
      expect(cloned.components.registry).not.toBe(theme.components.registry);
    });
  });

  describe('mergeThemes', () => {
    it('should merge base and override themes', () => {
      const base = createMockThemePack('base');
      const override: Partial<ThemePack> = {
        name: 'Overridden Name',
        description: 'Overridden description',
      };
      const merged = mergeThemes(base, override);
      expect(merged.id).toBe('base');
      expect(merged.name).toBe('Overridden Name');
      expect(merged.description).toBe('Overridden description');
    });

    it('should deep merge tokens', () => {
      const base = createMockThemePack('base');
      const override: Partial<ThemePack> = {
        tokens: {
          ...base.tokens,
          colors: {
            ...base.tokens.colors,
            primary: '#ff0000',
          },
        },
      };
      const merged = mergeThemes(base, override);
      expect(merged.tokens.colors.primary).toBe('#ff0000');
      expect(merged.tokens.colors.background).toBe('#ffffff');
    });

    it('should replace colorSchemes entirely', () => {
      const base = createMockThemePack('base');
      const newSchemes: ColorScheme[] = [
        {
          id: 'custom',
          name: 'Custom',
          type: 'light',
          colors: {
            background: '#f0f0f0',
            foreground: '#111111',
            primary: '#0000ff',
            secondary: '#555555',
            accent: '#00ff00',
            muted: '#eeeeee',
            border: '#cccccc',
          },
        },
      ];
      const merged = mergeThemes(base, { colorSchemes: newSchemes });
      expect(merged.colorSchemes).toBe(newSchemes);
      expect(merged.colorSchemes).toHaveLength(1);
      expect(merged.colorSchemes[0].id).toBe('custom');
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
      const result = validateExportedJson('not json');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return invalid for incomplete theme', () => {
      const result = validateExportedJson(JSON.stringify({ id: 'test' }));
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
