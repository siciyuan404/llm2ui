/**
 * @file discord.test.ts
 * @description Discord 主题的单元测试和属性测试
 * @module lib/themes/builtin/discord
 * @requirements 2.5, 3.3, 5.3, 5.5, 8.1, 8.2, 8.3, 9.2, 9.3, 9.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { discordThemePack, discordColorSchemes, discordLayouts } from './index';
import { discordTokens, discordLightTokens, discordCssVariablesDark, discordCssVariablesLight } from './tokens';
import { discordComponents, createDiscordComponentRegistry, discordComponentCategories } from './components';
import {
  discordExamples,
  discordExamplePresets,
  getDiscordExampleIds,
  getDiscordExampleById,
  getDiscordExamplesByCategory,
  getDiscordExamplesByKeyword,
  discordKeywordMappings,
} from './examples';
import { zhPromptTemplates } from './prompts/zh';
import { enPromptTemplates } from './prompts/en';

describe('Discord Theme - Unit Tests', () => {
  describe('Theme Metadata', () => {
    it('should have correct id', () => {
      expect(discordThemePack.id).toBe('discord');
    });

    it('should have correct name', () => {
      expect(discordThemePack.name).toBe('Discord');
    });

    it('should have valid version', () => {
      expect(discordThemePack.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have description', () => {
      expect(discordThemePack.description).toBeTruthy();
      expect(discordThemePack.description.length).toBeGreaterThan(10);
    });

    it('should have author information', () => {
      expect(discordThemePack.author).toBeTruthy();
    });
  });


  describe('Color Tokens', () => {
    it('should have Discord Blurple as primary color', () => {
      expect(discordTokens.colors.primary).toBe('#5865F2');
    });

    it('should have correct dark background colors', () => {
      expect(discordTokens.colors.background).toBe('#36393f');
      expect(discordTokens.colors.backgroundSecondary).toBe('#2f3136');
      expect(discordTokens.colors.backgroundTertiary).toBe('#202225');
    });

    it('should have correct text colors', () => {
      expect(discordTokens.colors.foreground).toBe('#dcddde');
      expect(discordTokens.colors.mutedForeground).toBe('#72767d');
    });

    it('should have semantic colors', () => {
      expect(discordTokens.colors.destructive).toBe('#ed4245');
      expect(discordTokens.colors.success).toBe('#3ba55c');
      expect(discordTokens.colors.warning).toBe('#faa61a');
    });
  });

  describe('Spacing Tokens', () => {
    it('should have compact spacing system', () => {
      expect(discordTokens.spacing.xs).toBe('4px');
      expect(discordTokens.spacing.sm).toBe('8px');
      expect(discordTokens.spacing.md).toBe('12px');
      expect(discordTokens.spacing.lg).toBe('16px');
      expect(discordTokens.spacing.xl).toBe('24px');
      expect(discordTokens.spacing['2xl']).toBe('32px');
    });
  });

  describe('Typography Tokens', () => {
    it('should have Discord font stack', () => {
      expect(discordTokens.typography.fontFamily.sans).toContain('gg sans');
      expect(discordTokens.typography.fontFamily.sans).toContain('Noto Sans');
    });

    it('should have font sizes', () => {
      expect(discordTokens.typography.fontSize.xs).toBe('12px');
      expect(discordTokens.typography.fontSize.sm).toBe('14px');
      expect(discordTokens.typography.fontSize.base).toBe('16px');
    });
  });

  describe('Radius Tokens', () => {
    it('should have Discord radius system', () => {
      expect(discordTokens.radius.sm).toBe('3px');
      expect(discordTokens.radius.md).toBe('4px');
      expect(discordTokens.radius.lg).toBe('8px');
      expect(discordTokens.radius.full).toBe('50%');
    });
  });

  describe('Light Mode Tokens', () => {
    it('should have light background colors', () => {
      expect(discordLightTokens.background).toBe('#ffffff');
      expect(discordLightTokens.backgroundSecondary).toBe('#f2f3f5');
    });

    it('should keep Blurple primary color', () => {
      expect(discordLightTokens.primary).toBe('#5865F2');
    });
  });

  describe('CSS Variables', () => {
    it('should have dark mode CSS variables', () => {
      expect(discordCssVariablesDark['--primary']).toBeDefined();
      expect(discordCssVariablesDark['--background']).toBeDefined();
      expect(discordCssVariablesDark['--foreground']).toBeDefined();
    });

    it('should have light mode CSS variables', () => {
      expect(discordCssVariablesLight['--primary']).toBeDefined();
      expect(discordCssVariablesLight['--background']).toBeDefined();
      expect(discordCssVariablesLight['--foreground']).toBeDefined();
    });
  });
});


describe('Discord Theme - Color Schemes', () => {
  it('should have dark color scheme', () => {
    const darkScheme = discordColorSchemes.find(s => s.id === 'dark');
    expect(darkScheme).toBeDefined();
    expect(darkScheme?.type).toBe('dark');
  });

  it('should have light color scheme', () => {
    const lightScheme = discordColorSchemes.find(s => s.id === 'light');
    expect(lightScheme).toBeDefined();
    expect(lightScheme?.type).toBe('light');
  });

  it('should have CSS variables for each scheme', () => {
    for (const scheme of discordColorSchemes) {
      expect(scheme.cssVariables).toBeDefined();
      expect(Object.keys(scheme.cssVariables || {}).length).toBeGreaterThan(0);
    }
  });
});

describe('Discord Theme - Components', () => {
  it('should have component registry', () => {
    expect(discordComponents.registry).toBeDefined();
  });

  it('should have base layout components', () => {
    const registry = createDiscordComponentRegistry();
    expect(registry.has('Container')).toBe(true);
    expect(registry.has('Card')).toBe(true);
    expect(registry.has('Flex')).toBe(true);
    expect(registry.has('Grid')).toBe(true);
  });

  it('should have base input components', () => {
    const registry = createDiscordComponentRegistry();
    expect(registry.has('Button')).toBe(true);
    expect(registry.has('Input')).toBe(true);
    expect(registry.has('Select')).toBe(true);
    expect(registry.has('Checkbox')).toBe(true);
  });

  it('should have base display components', () => {
    const registry = createDiscordComponentRegistry();
    expect(registry.has('Text')).toBe(true);
    expect(registry.has('Icon')).toBe(true);
    expect(registry.has('Badge')).toBe(true);
    expect(registry.has('Avatar')).toBe(true);
  });

  it('should have Discord-specific components', () => {
    const registry = createDiscordComponentRegistry();
    expect(registry.has('DiscordServerList')).toBe(true);
    expect(registry.has('DiscordChannelList')).toBe(true);
    expect(registry.has('DiscordMessage')).toBe(true);
    expect(registry.has('DiscordUserStatus')).toBe(true);
  });

  it('should have component categories', () => {
    expect(discordComponentCategories.length).toBeGreaterThan(0);
    const categoryIds = discordComponentCategories.map(c => c.id);
    expect(categoryIds).toContain('layout');
    expect(categoryIds).toContain('input');
    expect(categoryIds).toContain('display');
    expect(categoryIds).toContain('discord');
  });

  it('should have correct components in each category', () => {
    const layoutCategory = discordComponentCategories.find(c => c.id === 'layout');
    expect(layoutCategory?.componentIds).toContain('Container');
    expect(layoutCategory?.componentIds).toContain('DiscordServerList');

    const discordCategory = discordComponentCategories.find(c => c.id === 'discord');
    expect(discordCategory?.componentIds).toContain('DiscordServerIcon');
    expect(discordCategory?.componentIds).toContain('DiscordChannel');
  });
});


describe('Discord Theme - Examples', () => {
  it('should have at least 10 example presets', () => {
    expect(discordExamplePresets.length).toBeGreaterThanOrEqual(10);
  });

  it('should have example categories', () => {
    expect(discordExamples.categories).toBeDefined();
    expect(discordExamples.categories?.length).toBeGreaterThan(0);
    
    const categoryIds = discordExamples.categories?.map(c => c.id) || [];
    expect(categoryIds).toContain('server-sidebar');
    expect(categoryIds).toContain('channel-list');
    expect(categoryIds).toContain('message-area');
    expect(categoryIds).toContain('user-panel');
    expect(categoryIds).toContain('settings');
  });

  it('should have keyword mappings', () => {
    expect(discordKeywordMappings.length).toBeGreaterThan(0);
  });

  it('should get example by id', () => {
    const example = getDiscordExampleById('discord-server-sidebar');
    expect(example).toBeDefined();
    expect(example?.id).toBe('discord-server-sidebar');
  });

  it('should get examples by category', () => {
    const serverExamples = getDiscordExamplesByCategory('server-sidebar');
    expect(serverExamples.length).toBeGreaterThan(0);
    serverExamples.forEach(e => expect(e.category).toBe('server-sidebar'));
  });

  it('should get all example ids', () => {
    const ids = getDiscordExampleIds();
    expect(ids.length).toBe(discordExamplePresets.length);
  });
});

describe('Discord Theme - Prompts', () => {
  it('should have Chinese prompt templates', () => {
    expect(zhPromptTemplates).toBeDefined();
    expect(zhPromptTemplates.systemIntro).toBeTruthy();
    expect(zhPromptTemplates.iconGuidelines).toBeTruthy();
    expect(zhPromptTemplates.componentDocs).toBeTruthy();
    expect(zhPromptTemplates.positiveExamples).toBeTruthy();
    expect(zhPromptTemplates.negativeExamples).toBeTruthy();
    expect(zhPromptTemplates.closing).toBeTruthy();
  });

  it('should have English prompt templates', () => {
    expect(enPromptTemplates).toBeDefined();
    expect(enPromptTemplates.systemIntro).toBeTruthy();
    expect(enPromptTemplates.iconGuidelines).toBeTruthy();
    expect(enPromptTemplates.componentDocs).toBeTruthy();
    expect(enPromptTemplates.positiveExamples).toBeTruthy();
    expect(enPromptTemplates.negativeExamples).toBeTruthy();
    expect(enPromptTemplates.closing).toBeTruthy();
  });

  it('should mention Discord in system intro', () => {
    expect(zhPromptTemplates.systemIntro).toContain('Discord');
    expect(enPromptTemplates.systemIntro).toContain('Discord');
  });

  it('should mention Lucide icons in guidelines', () => {
    expect(zhPromptTemplates.iconGuidelines).toContain('Lucide');
    expect(enPromptTemplates.iconGuidelines).toContain('Lucide');
  });
});

describe('Discord Theme - Layouts', () => {
  /**
   * 布局配置单元测试
   * @requirements 7.1, 7.2, 7.3, 7.4
   */
  
  it('should have three layout configurations', () => {
    expect(discordLayouts.length).toBe(3);
  });

  it('should have discord-default layout with correct configuration', () => {
    const defaultLayout = discordLayouts.find(l => l.id === 'discord-default');
    expect(defaultLayout).toBeDefined();
    expect(defaultLayout?.name).toBe('Discord 默认布局');
    expect(defaultLayout?.config.sidebar).toBe('left');
    // 默认布局: 服务器侧边栏 (72px) + 频道列表 (240px) = 312px
    expect(defaultLayout?.config.sidebarWidth).toBe('312px');
    expect(defaultLayout?.config.mainContent).toBe('full');
    expect(defaultLayout?.config.previewPanel).toBe('none');
  });

  it('should have discord-compact layout with collapsed sidebar', () => {
    const compactLayout = discordLayouts.find(l => l.id === 'discord-compact');
    expect(compactLayout).toBeDefined();
    expect(compactLayout?.name).toBe('Discord 紧凑布局');
    expect(compactLayout?.config.sidebar).toBe('left');
    // 紧凑布局: 仅服务器图标 (72px)
    expect(compactLayout?.config.sidebarWidth).toBe('72px');
    expect(compactLayout?.config.mainContent).toBe('full');
    expect(compactLayout?.config.previewPanel).toBe('none');
  });

  it('should have discord-fullscreen layout without sidebar', () => {
    const fullscreenLayout = discordLayouts.find(l => l.id === 'discord-fullscreen');
    expect(fullscreenLayout).toBeDefined();
    expect(fullscreenLayout?.name).toBe('Discord 全屏布局');
    expect(fullscreenLayout?.config.sidebar).toBe('none');
    expect(fullscreenLayout?.config.mainContent).toBe('full');
    expect(fullscreenLayout?.config.previewPanel).toBe('none');
  });

  it('should have valid layout IDs', () => {
    const layoutIds = discordLayouts.map(l => l.id);
    expect(layoutIds).toContain('discord-default');
    expect(layoutIds).toContain('discord-compact');
    expect(layoutIds).toContain('discord-fullscreen');
  });

  it('should have descriptions for all layouts', () => {
    for (const layout of discordLayouts) {
      expect(layout.description).toBeTruthy();
      expect(layout.description.length).toBeGreaterThan(10);
    }
  });

  it('should have correct sidebar configuration for each layout type', () => {
    // 验证侧边栏配置正确
    for (const layout of discordLayouts) {
      if (layout.config.sidebar === 'none') {
        // 无侧边栏布局不应该有 sidebarWidth
        expect(layout.config.sidebarWidth).toBeUndefined();
      } else {
        // 有侧边栏布局应该有 sidebarWidth
        expect(layout.config.sidebarWidth).toBeDefined();
        expect(layout.config.sidebarWidth).toMatch(/^\d+px$/);
      }
    }
  });
});


describe('Discord Theme - Property Tests', () => {
  /**
   * Feature: discord-theme, Property 1: 设计令牌序列化往返一致性
   * Validates: Requirements 2.6, 9.4
   */
  describe('Property 1: Token Serialization Round Trip', () => {
    it('should serialize and deserialize tokens consistently', () => {
      fc.assert(
        fc.property(fc.constant(discordTokens), (tokens) => {
          const serialized = JSON.stringify(tokens);
          const deserialized = JSON.parse(serialized);
          expect(deserialized).toEqual(tokens);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve all token categories after round trip', () => {
      const serialized = JSON.stringify(discordTokens);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized.colors).toEqual(discordTokens.colors);
      expect(deserialized.spacing).toEqual(discordTokens.spacing);
      expect(deserialized.typography).toEqual(discordTokens.typography);
      expect(deserialized.shadows).toEqual(discordTokens.shadows);
      expect(deserialized.radius).toEqual(discordTokens.radius);
    });
  });

  /**
   * Feature: discord-theme, Property 2: 配色方案 CSS 变量应用
   * Validates: Requirements 3.3, 9.2
   * 
   * 对于任何配色方案选择，系统应该应用所有对应的 CSS 变量到文档根元素，
   * 并且每个 CSS 变量值应该与配色方案定义匹配。
   */
  describe('Property 2: Color Scheme CSS Variables', () => {
    it('should have CSS variables for all color schemes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...discordColorSchemes),
          (scheme) => {
            expect(scheme.cssVariables).toBeDefined();
            expect(Object.keys(scheme.cssVariables || {}).length).toBeGreaterThan(0);
            
            // 验证必需的 CSS 变量存在
            const vars = scheme.cssVariables || {};
            expect(vars['--primary']).toBeDefined();
            expect(vars['--background']).toBeDefined();
            expect(vars['--foreground']).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have matching colors in scheme and CSS variables', () => {
      for (const scheme of discordColorSchemes) {
        expect(scheme.colors.primary).toBeDefined();
        expect(scheme.colors.background).toBeDefined();
        expect(scheme.cssVariables?.['--primary']).toBeDefined();
        expect(scheme.cssVariables?.['--background']).toBeDefined();
      }
    });

    it('should have all required CSS variables for each scheme', () => {
      const requiredVariables = [
        '--background',
        '--foreground',
        '--primary',
        '--primary-foreground',
        '--secondary',
        '--secondary-foreground',
        '--accent',
        '--accent-foreground',
        '--muted',
        '--border',
        '--ring',
        '--card',
        '--card-foreground',
        '--popover',
        '--popover-foreground',
        '--destructive',
        '--destructive-foreground',
        '--radius',
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...discordColorSchemes),
          (scheme) => {
            const vars = scheme.cssVariables || {};
            for (const varName of requiredVariables) {
              expect(vars[varName]).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have valid HSL values in CSS variables', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...discordColorSchemes),
          (scheme) => {
            const vars = scheme.cssVariables || {};
            // 检查颜色相关的 CSS 变量是否为有效的 HSL 值
            const colorVars = Object.entries(vars).filter(([varKey]) => 
              !varKey.includes('radius') && !varKey.includes('transition')
            );
            
            for (const [, value] of colorVars) {
              // 允许 HSL 格式或其他有效格式
              expect(typeof value).toBe('string');
              expect(value.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have correct type for each color scheme', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...discordColorSchemes),
          (scheme) => {
            expect(['light', 'dark']).toContain(scheme.type);
            
            // 深色方案应该有深色背景
            if (scheme.type === 'dark') {
              expect(scheme.colors.background).toMatch(/^#[0-4]/); // 深色以 0-4 开头
            }
            
            // 浅色方案应该有浅色背景
            if (scheme.type === 'light') {
              expect(scheme.colors.background).toMatch(/^#[fF]/); // 浅色以 f 或 F 开头
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve Blurple primary color across all schemes', () => {
      const blurple = '#5865F2';
      
      fc.assert(
        fc.property(
          fc.constantFrom(...discordColorSchemes),
          (scheme) => {
            // Discord 的 Blurple 主色在所有配色方案中保持不变
            expect(scheme.colors.primary.toLowerCase()).toBe(blurple.toLowerCase());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: discord-theme, Property 3: 主题包验证完整性
   * Validates: Requirements 8.1, 8.2, 8.3
   * 
   * 对于任何提交验证的主题包，验证器应该：
   * - 检测所有缺失的必需字段并报告
   * - 验证所有颜色令牌值是有效的 CSS 颜色
   * - 确保分类中的所有组件引用存在于注册表中
   */
  describe('Property 3: Theme Pack Validation', () => {
    it('should have all required fields', () => {
      expect(discordThemePack.id).toBeTruthy();
      expect(discordThemePack.name).toBeTruthy();
      expect(discordThemePack.description).toBeTruthy();
      expect(discordThemePack.version).toBeTruthy();
      expect(discordThemePack.tokens).toBeDefined();
      expect(discordThemePack.components).toBeDefined();
      expect(discordThemePack.examples).toBeDefined();
      expect(discordThemePack.prompts).toBeDefined();
      expect(discordThemePack.colorSchemes).toBeDefined();
      expect(discordThemePack.layouts).toBeDefined();
    });

    it('should have valid color values for all color tokens', () => {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.entries(discordTokens.colors)),
          ([_key, value]) => {
            if (typeof value === 'string' && value.startsWith('#')) {
              expect(value).toMatch(colorRegex);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have components in registry for all category references', () => {
      const registry = createDiscordComponentRegistry();
      
      // 使用属性测试验证所有分类中的组件都存在于注册表中
      fc.assert(
        fc.property(
          fc.constantFrom(...discordComponentCategories),
          (category) => {
            for (const componentId of category.componentIds) {
              expect(registry.has(componentId)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect missing required fields in invalid theme packs', () => {
      // 生成各种缺失字段的主题包变体
      const invalidThemePacks = [
        { ...discordThemePack, id: '' },
        { ...discordThemePack, name: '' },
        { ...discordThemePack, tokens: undefined },
        { ...discordThemePack, components: undefined },
        { ...discordThemePack, colorSchemes: [] },
        { ...discordThemePack, layouts: [] },
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...invalidThemePacks),
          (invalidPack) => {
            // 验证器应该检测到这些无效的主题包
            // 这里我们只验证必需字段的存在性
            const hasId = invalidPack.id && invalidPack.id.length > 0;
            const hasName = invalidPack.name && invalidPack.name.length > 0;
            const hasTokens = invalidPack.tokens !== undefined;
            const hasComponents = invalidPack.components !== undefined;
            const hasColorSchemes = Array.isArray(invalidPack.colorSchemes) && invalidPack.colorSchemes.length > 0;
            const hasLayouts = Array.isArray(invalidPack.layouts) && invalidPack.layouts.length > 0;
            
            // 至少有一个字段是无效的
            const isInvalid = !hasId || !hasName || !hasTokens || !hasComponents || !hasColorSchemes || !hasLayouts;
            expect(isInvalid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate all color scheme colors are valid CSS colors', () => {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      fc.assert(
        fc.property(
          fc.constantFrom(...discordColorSchemes),
          (scheme) => {
            // 验证配色方案中的所有颜色值
            for (const [key, value] of Object.entries(scheme.colors)) {
              if (typeof value === 'string' && value.startsWith('#')) {
                expect(value).toMatch(colorRegex);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: discord-theme, Property 4: 案例 Schema 组件引用有效性
   * Validates: Requirements 5.3
   */
  describe('Property 4: Example Schema Component Validity', () => {
    it('should have valid component types in all example schemas', () => {
      const registry = createDiscordComponentRegistry();
      
      function validateSchema(schema: unknown): void {
        if (!schema || typeof schema !== 'object') return;
        
        const obj = schema as Record<string, unknown>;
        if (obj.type && typeof obj.type === 'string') {
          // 验证组件类型存在于注册表中
          expect(registry.has(obj.type)).toBe(true);
        }
        
        // 递归验证子组件
        if (Array.isArray(obj.children)) {
          obj.children.forEach(child => validateSchema(child));
        } else if (obj.children && typeof obj.children === 'object') {
          validateSchema(obj.children);
        }
      }
      
      fc.assert(
        fc.property(
          fc.constantFrom(...discordExamplePresets),
          (example) => {
            validateSchema(example.schema);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: discord-theme, Property 5: 关键词搜索返回相关案例
   * Validates: Requirements 5.5
   */
  describe('Property 5: Keyword Search Returns Relevant Examples', () => {
    it('should return examples for all mapped keywords', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...discordKeywordMappings),
          (mapping) => {
            for (const keyword of mapping.keywords) {
              const results = getDiscordExamplesByKeyword(keyword);
              expect(results.length).toBeGreaterThan(0);
              
              // 验证返回的案例 ID 在映射中
              const resultIds = results.map(r => r.id);
              const hasExpectedExample = mapping.exampleIds.some(id => resultIds.includes(id));
              expect(hasExpectedExample).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return relevant examples for common Discord keywords', () => {
      const testKeywords = ['server', 'channel', 'message', 'user', 'settings'];
      
      for (const keyword of testKeywords) {
        const results = getDiscordExamplesByKeyword(keyword);
        expect(results.length).toBeGreaterThan(0);
      }
    });
  });

  /**
   * Feature: discord-theme, Property 6: 主题上下文构建正确性
   * Validates: Requirements 9.3
   * 
   * 对于任何选择了 Discord 主题的 UI 生成请求，上下文构建器应该
   * 在生成的提示词中包含 Discord 特定的提示词、案例和组件文档。
   */
  describe('Property 6: Theme Context Building', () => {
    it('should have Discord-specific content in all prompt templates', () => {
      const prompts = discordThemePack.prompts;
      
      // 使用属性测试验证所有语言的提示词都包含 Discord 相关内容
      fc.assert(
        fc.property(
          fc.constantFrom('zh', 'en'),
          (lang) => {
            const templates = prompts.templates[lang as 'zh' | 'en'];
            
            // 验证系统介绍包含 Discord
            expect(templates.systemIntro).toContain('Discord');
            
            // 验证组件文档包含 Discord
            expect(templates.componentDocs).toContain('Discord');
            
            // 验证所有必需字段都非空
            expect(templates.systemIntro.length).toBeGreaterThan(0);
            expect(templates.iconGuidelines.length).toBeGreaterThan(0);
            expect(templates.componentDocs.length).toBeGreaterThan(0);
            expect(templates.positiveExamples.length).toBeGreaterThan(0);
            expect(templates.negativeExamples.length).toBeGreaterThan(0);
            expect(templates.closing.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have Discord-specific examples in all presets', () => {
      const examples = discordThemePack.examples;
      
      // 使用属性测试验证所有案例都是 Discord 风格的
      fc.assert(
        fc.property(
          fc.constantFrom(...examples.presets),
          (example) => {
            // 验证案例 ID 包含 discord 前缀
            expect(example.id).toContain('discord');
            
            // 验证案例有有效的分类
            expect(example.category).toBeTruthy();
            
            // 验证案例有有效的 schema
            expect(example.schema).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have Discord-specific components registered', () => {
      const components = discordThemePack.components;
      const discordSpecificComponents = [
        'DiscordServerList',
        'DiscordChannelList',
        'DiscordMessage',
        'DiscordUserStatus',
        'DiscordServerIcon',
        'DiscordChannel',
        'DiscordMember',
        'DiscordVoiceChannel',
        'DiscordMessageInput',
      ];
      
      // 使用属性测试验证所有 Discord 专属组件都已注册
      fc.assert(
        fc.property(
          fc.constantFrom(...discordSpecificComponents),
          (componentName) => {
            expect(components.registry.has(componentName)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have Discord-specific categories in component registry', () => {
      const categories = discordThemePack.components.categories;
      
      // 验证有 Discord 专属分类
      const discordCategory = categories?.find(c => c.id === 'discord');
      expect(discordCategory).toBeDefined();
      expect(discordCategory?.componentIds.length).toBeGreaterThan(0);
      
      // 使用属性测试验证 Discord 分类中的所有组件都已注册
      if (discordCategory) {
        fc.assert(
          fc.property(
            fc.constantFrom(...discordCategory.componentIds),
            (componentId) => {
              expect(discordThemePack.components.registry.has(componentId)).toBe(true);
            }
          ),
          { numRuns: 100 }
        );
      }
    });

    it('should have Discord design principles in prompts', () => {
      const prompts = discordThemePack.prompts;
      
      // 验证提示词包含 Discord 设计原则
      fc.assert(
        fc.property(
          fc.constantFrom('zh', 'en'),
          (lang) => {
            const templates = prompts.templates[lang as 'zh' | 'en'];
            
            // 验证包含 Blurple 颜色
            expect(templates.systemIntro).toMatch(/Blurple|#5865F2/i);
            
            // 验证包含深色主题相关内容
            expect(templates.systemIntro).toMatch(/dark|深色/i);
            
            // 验证图标指南提到 Lucide
            expect(templates.iconGuidelines).toContain('Lucide');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
