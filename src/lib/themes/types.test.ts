/**
 * @file types.test.ts
 * @description 主题类型定义的属性测试
 * @module lib/themes
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type {
  ThemeTokens,
  ThemePrompts,
  ColorScheme,
  LayoutConfig,
  ThemeExamples,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
} from './types';
import { DEFAULT_CONTEXT_SETTINGS, DEFAULT_THEME_ID, ThemeErrorCode } from './types';

// ============================================================================
// Arbitraries (生成器)
// ============================================================================

/**
 * 生成有效的十六进制颜色
 */
const hexColorArb = fc.integer({ min: 0, max: 0xFFFFFF })
  .map(n => `#${n.toString(16).padStart(6, '0')}`);

/**
 * 生成有效的颜色令牌
 */
const colorTokensArb: fc.Arbitrary<ColorTokens> = fc.record({
  background: hexColorArb,
  foreground: hexColorArb,
  primary: hexColorArb,
  primaryForeground: hexColorArb,
  secondary: hexColorArb,
  secondaryForeground: hexColorArb,
  accent: hexColorArb,
  accentForeground: hexColorArb,
  muted: hexColorArb,
  mutedForeground: hexColorArb,
  border: hexColorArb,
  ring: hexColorArb,
});

/**
 * 生成有效的间距令牌
 */
const spacingTokensArb: fc.Arbitrary<SpacingTokens> = fc.record({
  xs: fc.constant('0.25rem'),
  sm: fc.constant('0.5rem'),
  md: fc.constant('1rem'),
  lg: fc.constant('1.5rem'),
  xl: fc.constant('2rem'),
  '2xl': fc.constant('3rem'),
});

/**
 * 生成有效的字体令牌
 */
const typographyTokensArb: fc.Arbitrary<TypographyTokens> = fc.record({
  fontFamily: fc.record({
    sans: fc.constant('ui-sans-serif, system-ui, sans-serif'),
    mono: fc.constant('ui-monospace, monospace'),
  }),
  fontSize: fc.record({
    xs: fc.constant('0.75rem'),
    sm: fc.constant('0.875rem'),
    base: fc.constant('1rem'),
    lg: fc.constant('1.125rem'),
    xl: fc.constant('1.25rem'),
    '2xl': fc.constant('1.5rem'),
    '3xl': fc.constant('1.875rem'),
  }),
  fontWeight: fc.record({
    normal: fc.constant('400'),
    medium: fc.constant('500'),
    semibold: fc.constant('600'),
    bold: fc.constant('700'),
  }),
  lineHeight: fc.record({
    tight: fc.constant('1.25'),
    normal: fc.constant('1.5'),
    relaxed: fc.constant('1.75'),
  }),
});

/**
 * 生成有效的阴影令牌
 */
const shadowTokensArb = fc.record({
  sm: fc.constant('0 1px 2px 0 rgb(0 0 0 / 0.05)'),
  md: fc.constant('0 4px 6px -1px rgb(0 0 0 / 0.1)'),
  lg: fc.constant('0 10px 15px -3px rgb(0 0 0 / 0.1)'),
  xl: fc.constant('0 20px 25px -5px rgb(0 0 0 / 0.1)'),
});

/**
 * 生成有效的圆角令牌
 */
const radiusTokensArb = fc.record({
  none: fc.constant('0'),
  sm: fc.constant('0.125rem'),
  md: fc.constant('0.375rem'),
  lg: fc.constant('0.5rem'),
  xl: fc.constant('0.75rem'),
  full: fc.constant('9999px'),
});

/**
 * 生成有效的主题令牌
 */
const themeTokensArb: fc.Arbitrary<ThemeTokens> = fc.record({
  colors: colorTokensArb,
  spacing: spacingTokensArb,
  typography: typographyTokensArb,
  shadows: shadowTokensArb,
  radius: radiusTokensArb,
});


/**
 * 生成有效的配色方案
 */
const colorSchemeArb: fc.Arbitrary<ColorScheme> = fc.record({
  id: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  type: fc.constantFrom('light' as const, 'dark' as const),
  colors: fc.record({
    background: hexColorArb,
    foreground: hexColorArb,
    primary: hexColorArb,
    secondary: hexColorArb,
    accent: hexColorArb,
    muted: hexColorArb,
    border: hexColorArb,
  }),
});

/**
 * 生成有效的布局配置
 */
const layoutConfigArb: fc.Arbitrary<LayoutConfig> = fc.record({
  id: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  config: fc.record({
    sidebar: fc.constantFrom('left' as const, 'right' as const, 'none' as const),
    mainContent: fc.constantFrom('full' as const, 'centered' as const),
    previewPanel: fc.constantFrom('right' as const, 'bottom' as const, 'none' as const),
  }),
});

/**
 * 生成有效的提示词模板
 */
const promptTemplatesArb = fc.record({
  systemIntro: fc.string({ minLength: 10, maxLength: 500 }),
  iconGuidelines: fc.string({ minLength: 10, maxLength: 500 }),
  componentDocs: fc.string({ minLength: 10, maxLength: 500 }),
  positiveExamples: fc.string({ minLength: 10, maxLength: 500 }),
  negativeExamples: fc.string({ minLength: 10, maxLength: 500 }),
  closing: fc.string({ minLength: 10, maxLength: 500 }),
});

/**
 * 生成有效的主题提示词配置
 */
const themePromptsArb: fc.Arbitrary<ThemePrompts> = fc.record({
  templates: fc.record({
    zh: promptTemplatesArb,
    en: promptTemplatesArb,
  }),
});

/**
 * 生成有效的案例元数据
 */
const exampleMetadataArb = fc.record({
  id: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  category: fc.string({ minLength: 1, maxLength: 50 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 10 }),
  schema: fc.constant({}),
});

/**
 * 生成有效的主题案例配置
 */
const themeExamplesArb: fc.Arbitrary<ThemeExamples> = fc.record({
  presets: fc.array(exampleMetadataArb, { minLength: 0, maxLength: 20 }),
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Theme Types - Property Tests', () => {
  /**
   * Property 5: ThemePack 可序列化
   * For any valid ThemePack object (不包含 componentFactory), 
   * JSON.stringify 然后 JSON.parse 应该产生等价的对象。
   * 
   * **Feature: codebase-refactor, Property 5: ThemePack 可序列化**
   * **Validates: Requirements 3.3**
   */
  describe('Property 5: ThemePack Serialization Round-Trip', () => {
    it('should produce equivalent object after JSON stringify and parse', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 0, maxLength: 500 }),
            version: fc.stringMatching(/^\d+\.\d+\.\d+$/),
            tokens: themeTokensArb,
            examples: themeExamplesArb,
            prompts: themePromptsArb,
            colorSchemes: fc.array(colorSchemeArb, { minLength: 1, maxLength: 5 }),
            layouts: fc.array(layoutConfigArb, { minLength: 1, maxLength: 5 }),
          }),
          (themePack) => {
            // 序列化
            const serialized = JSON.stringify(themePack);
            
            // 反序列化
            const deserialized = JSON.parse(serialized);
            
            // 验证等价性
            expect(deserialized).toEqual(themePack);
            
            // 验证所有字段都被正确保留
            expect(deserialized.id).toBe(themePack.id);
            expect(deserialized.name).toBe(themePack.name);
            expect(deserialized.description).toBe(themePack.description);
            expect(deserialized.version).toBe(themePack.version);
            expect(deserialized.tokens).toEqual(themePack.tokens);
            expect(deserialized.examples).toEqual(themePack.examples);
            expect(deserialized.prompts).toEqual(themePack.prompts);
            expect(deserialized.colorSchemes).toEqual(themePack.colorSchemes);
            expect(deserialized.layouts).toEqual(themePack.layouts);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve nested token structures after serialization', () => {
      fc.assert(
        fc.property(themeTokensArb, (tokens) => {
          const serialized = JSON.stringify(tokens);
          const deserialized = JSON.parse(serialized);
          
          // 验证颜色令牌
          expect(deserialized.colors).toEqual(tokens.colors);
          
          // 验证间距令牌
          expect(deserialized.spacing).toEqual(tokens.spacing);
          
          // 验证字体令牌
          expect(deserialized.typography).toEqual(tokens.typography);
          expect(deserialized.typography.fontFamily).toEqual(tokens.typography.fontFamily);
          expect(deserialized.typography.fontSize).toEqual(tokens.typography.fontSize);
          expect(deserialized.typography.fontWeight).toEqual(tokens.typography.fontWeight);
          expect(deserialized.typography.lineHeight).toEqual(tokens.typography.lineHeight);
          
          // 验证阴影令牌
          expect(deserialized.shadows).toEqual(tokens.shadows);
          
          // 验证圆角令牌
          expect(deserialized.radius).toEqual(tokens.radius);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve color scheme structures after serialization', () => {
      fc.assert(
        fc.property(
          fc.array(colorSchemeArb, { minLength: 1, maxLength: 5 }),
          (colorSchemes) => {
            const serialized = JSON.stringify(colorSchemes);
            const deserialized = JSON.parse(serialized);
            
            expect(deserialized).toEqual(colorSchemes);
            expect(deserialized.length).toBe(colorSchemes.length);
            
            for (let i = 0; i < colorSchemes.length; i++) {
              expect(deserialized[i].id).toBe(colorSchemes[i].id);
              expect(deserialized[i].name).toBe(colorSchemes[i].name);
              expect(deserialized[i].type).toBe(colorSchemes[i].type);
              expect(deserialized[i].colors).toEqual(colorSchemes[i].colors);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 1: Theme Pack Structure Validation
   * For any valid ThemePack object, it SHALL contain all required fields
   * with correct types.
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**
   */
  describe('Property 1: Theme Pack Structure Validation', () => {
    it('should have all required fields with correct types', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 0, maxLength: 500 }),
            version: fc.stringMatching(/^\d+\.\d+\.\d+$/),
            tokens: themeTokensArb,
            examples: themeExamplesArb,
            prompts: themePromptsArb,
            colorSchemes: fc.array(colorSchemeArb, { minLength: 1, maxLength: 5 }),
            layouts: fc.array(layoutConfigArb, { minLength: 1, maxLength: 5 }),
          }),
          (partialPack) => {
            // 验证必需字段存在
            expect(partialPack.id).toBeDefined();
            expect(typeof partialPack.id).toBe('string');
            expect(partialPack.id.length).toBeGreaterThan(0);

            expect(partialPack.name).toBeDefined();
            expect(typeof partialPack.name).toBe('string');

            expect(partialPack.description).toBeDefined();
            expect(typeof partialPack.description).toBe('string');

            expect(partialPack.version).toBeDefined();
            expect(typeof partialPack.version).toBe('string');
            expect(partialPack.version).toMatch(/^\d+\.\d+\.\d+$/);

            // 验证 tokens 结构
            expect(partialPack.tokens).toBeDefined();
            expect(partialPack.tokens.colors).toBeDefined();
            expect(partialPack.tokens.spacing).toBeDefined();
            expect(partialPack.tokens.typography).toBeDefined();
            expect(partialPack.tokens.shadows).toBeDefined();
            expect(partialPack.tokens.radius).toBeDefined();

            // 验证 examples 结构
            expect(partialPack.examples).toBeDefined();
            expect(Array.isArray(partialPack.examples.presets)).toBe(true);

            // 验证 prompts 结构
            expect(partialPack.prompts).toBeDefined();
            expect(partialPack.prompts.templates).toBeDefined();
            expect(partialPack.prompts.templates.zh).toBeDefined();
            expect(partialPack.prompts.templates.en).toBeDefined();

            // 验证 colorSchemes 结构
            expect(Array.isArray(partialPack.colorSchemes)).toBe(true);
            expect(partialPack.colorSchemes.length).toBeGreaterThan(0);

            // 验证 layouts 结构
            expect(Array.isArray(partialPack.layouts)).toBe(true);
            expect(partialPack.layouts.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate color tokens have all required color fields', () => {
      fc.assert(
        fc.property(colorTokensArb, (colors) => {
          const requiredFields: (keyof ColorTokens)[] = [
            'background', 'foreground', 'primary', 'primaryForeground',
            'secondary', 'secondaryForeground', 'accent', 'accentForeground',
            'muted', 'mutedForeground', 'border', 'ring'
          ];
          
          for (const field of requiredFields) {
            expect(colors[field]).toBeDefined();
            expect(typeof colors[field]).toBe('string');
            // 验证是有效的颜色格式（以 # 开头）
            expect(colors[field]).toMatch(/^#[0-9a-fA-F]{6}$/);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should validate spacing tokens have all required size fields', () => {
      fc.assert(
        fc.property(spacingTokensArb, (spacing) => {
          const requiredFields: (keyof SpacingTokens)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
          
          for (const field of requiredFields) {
            expect(spacing[field]).toBeDefined();
            expect(typeof spacing[field]).toBe('string');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should validate typography tokens have all required fields', () => {
      fc.assert(
        fc.property(typographyTokensArb, (typography) => {
          // fontFamily
          expect(typography.fontFamily).toBeDefined();
          expect(typography.fontFamily.sans).toBeDefined();
          expect(typography.fontFamily.mono).toBeDefined();

          // fontSize
          expect(typography.fontSize).toBeDefined();
          expect(typography.fontSize.xs).toBeDefined();
          expect(typography.fontSize.base).toBeDefined();

          // fontWeight
          expect(typography.fontWeight).toBeDefined();
          expect(typography.fontWeight.normal).toBeDefined();
          expect(typography.fontWeight.bold).toBeDefined();

          // lineHeight
          expect(typography.lineHeight).toBeDefined();
          expect(typography.lineHeight.normal).toBeDefined();
        }),
        { numRuns: 100 }
      );
    });
  });


  describe('ColorScheme validation', () => {
    it('should have valid id, name, type and colors', () => {
      fc.assert(
        fc.property(colorSchemeArb, (scheme) => {
          // id 应该是有效的标识符
          expect(scheme.id).toBeDefined();
          expect(typeof scheme.id).toBe('string');
          expect(scheme.id.length).toBeGreaterThan(0);

          // name 应该是非空字符串
          expect(scheme.name).toBeDefined();
          expect(typeof scheme.name).toBe('string');

          // type 应该是 'light' 或 'dark'
          expect(['light', 'dark']).toContain(scheme.type);

          // colors 应该包含所有必需的颜色
          expect(scheme.colors.background).toBeDefined();
          expect(scheme.colors.foreground).toBeDefined();
          expect(scheme.colors.primary).toBeDefined();
          expect(scheme.colors.secondary).toBeDefined();
          expect(scheme.colors.accent).toBeDefined();
          expect(scheme.colors.muted).toBeDefined();
          expect(scheme.colors.border).toBeDefined();
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('LayoutConfig validation', () => {
    it('should have valid id, name, description and config', () => {
      fc.assert(
        fc.property(layoutConfigArb, (layout) => {
          // id 应该是有效的标识符
          expect(layout.id).toBeDefined();
          expect(typeof layout.id).toBe('string');

          // name 应该是非空字符串
          expect(layout.name).toBeDefined();
          expect(typeof layout.name).toBe('string');

          // description 应该是字符串
          expect(typeof layout.description).toBe('string');

          // config 应该包含所有必需的配置
          expect(['left', 'right', 'none']).toContain(layout.config.sidebar);
          expect(['full', 'centered']).toContain(layout.config.mainContent);
          expect(['right', 'bottom', 'none']).toContain(layout.config.previewPanel);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('PromptTemplates validation', () => {
    it('should have all required template fields', () => {
      fc.assert(
        fc.property(promptTemplatesArb, (templates) => {
          const requiredFields = [
            'systemIntro', 'iconGuidelines', 'componentDocs',
            'positiveExamples', 'negativeExamples', 'closing'
          ] as const;

          for (const field of requiredFields) {
            expect(templates[field]).toBeDefined();
            expect(typeof templates[field]).toBe('string');
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('ExampleMetadata validation', () => {
    it('should have valid id, name, description, category and tags', () => {
      fc.assert(
        fc.property(exampleMetadataArb, (example) => {
          expect(example.id).toBeDefined();
          expect(typeof example.id).toBe('string');

          expect(example.name).toBeDefined();
          expect(typeof example.name).toBe('string');

          expect(typeof example.description).toBe('string');

          expect(example.category).toBeDefined();
          expect(typeof example.category).toBe('string');

          expect(Array.isArray(example.tags)).toBe(true);
          for (const tag of example.tags) {
            expect(typeof tag).toBe('string');
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Theme Types - Unit Tests', () => {
  describe('DEFAULT_THEME_ID', () => {
    it('should be shadcn-ui', () => {
      expect(DEFAULT_THEME_ID).toBe('shadcn-ui');
    });
  });

  describe('DEFAULT_CONTEXT_SETTINGS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_CONTEXT_SETTINGS.themeId).toBe('shadcn-ui');
      expect(DEFAULT_CONTEXT_SETTINGS.components.mode).toBe('all');
      expect(DEFAULT_CONTEXT_SETTINGS.examples.mode).toBe('auto');
      expect(DEFAULT_CONTEXT_SETTINGS.examples.maxCount).toBe(5);
      expect(DEFAULT_CONTEXT_SETTINGS.colorScheme.id).toBe('light');
      expect(DEFAULT_CONTEXT_SETTINGS.colorScheme.includeInPrompt).toBe(true);
      expect(DEFAULT_CONTEXT_SETTINGS.tokenBudget.max).toBe(4000);
      expect(DEFAULT_CONTEXT_SETTINGS.tokenBudget.autoOptimize).toBe(true);
    });
  });

  describe('ThemeErrorCode', () => {
    it('should have all error codes defined', () => {
      expect(ThemeErrorCode.THEME_NOT_FOUND).toBe('THEME_NOT_FOUND');
      expect(ThemeErrorCode.THEME_ALREADY_EXISTS).toBe('THEME_ALREADY_EXISTS');
      expect(ThemeErrorCode.INVALID_THEME_PACK).toBe('INVALID_THEME_PACK');
      expect(ThemeErrorCode.CANNOT_UNINSTALL_BUILTIN).toBe('CANNOT_UNINSTALL_BUILTIN');
      expect(ThemeErrorCode.CANNOT_UNINSTALL_ACTIVE).toBe('CANNOT_UNINSTALL_ACTIVE');
      expect(ThemeErrorCode.DOWNLOAD_FAILED).toBe('DOWNLOAD_FAILED');
      expect(ThemeErrorCode.IMPORT_FAILED).toBe('IMPORT_FAILED');
      expect(ThemeErrorCode.EXPORT_FAILED).toBe('EXPORT_FAILED');
    });
  });
});
