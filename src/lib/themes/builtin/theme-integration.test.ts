/**
 * @file theme-integration.test.ts
 * @description 内置主题集成测试 - 验证 shadcn-ui 和 cherry 主题的切换和隔离
 * @module lib/themes/builtin
 * @requirements 8 - Checkpoint: 确保内置主题正常工作
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeManager } from '../theme-manager';
import { shadcnThemePack } from './shadcn';
import { cherryThemePack } from './cherry';

describe('Theme Integration Tests - Checkpoint 8', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    // 重置单例并创建新实例
    ThemeManager.resetInstance();
    themeManager = ThemeManager.getInstance();
    
    // 注册内置主题
    themeManager.register(shadcnThemePack);
    themeManager.register(cherryThemePack);
    
    // 设置默认主题
    themeManager.setActiveTheme('shadcn-ui');
  });

  afterEach(() => {
    ThemeManager.resetInstance();
  });

  describe('Theme Registration', () => {
    it('should have both shadcn-ui and cherry themes registered', () => {
      expect(themeManager.hasTheme('shadcn-ui')).toBe(true);
      expect(themeManager.hasTheme('cherry')).toBe(true);
      expect(themeManager.getThemeCount()).toBe(2);
    });

    it('should have correct metadata for shadcn-ui theme', () => {
      const theme = themeManager.getTheme('shadcn-ui');
      expect(theme).toBeDefined();
      expect(theme?.id).toBe('shadcn-ui');
      expect(theme?.name).toBe('shadcn/ui');
      expect(theme?.version).toBe('1.0.0');
    });

    it('should have correct metadata for cherry theme', () => {
      const theme = themeManager.getTheme('cherry');
      expect(theme).toBeDefined();
      expect(theme?.id).toBe('cherry');
      expect(theme?.name).toBe('Cherry Studio');
      expect(theme?.version).toBe('1.0.0');
    });
  });

  describe('Theme Switching', () => {
    it('should switch from shadcn-ui to cherry theme', () => {
      expect(themeManager.getActiveThemeId()).toBe('shadcn-ui');
      
      themeManager.setActiveTheme('cherry');
      
      expect(themeManager.getActiveThemeId()).toBe('cherry');
      expect(themeManager.getActiveTheme().id).toBe('cherry');
    });

    it('should switch from cherry to shadcn-ui theme', () => {
      themeManager.setActiveTheme('cherry');
      expect(themeManager.getActiveThemeId()).toBe('cherry');
      
      themeManager.setActiveTheme('shadcn-ui');
      
      expect(themeManager.getActiveThemeId()).toBe('shadcn-ui');
      expect(themeManager.getActiveTheme().id).toBe('shadcn-ui');
    });

    it('should emit theme change event when switching', () => {
      const events: Array<{ oldThemeId: string; newThemeId: string }> = [];
      
      themeManager.subscribe((event) => {
        events.push({ oldThemeId: event.oldThemeId, newThemeId: event.newThemeId });
      });
      
      themeManager.setActiveTheme('cherry');
      
      expect(events).toHaveLength(1);
      expect(events[0].oldThemeId).toBe('shadcn-ui');
      expect(events[0].newThemeId).toBe('cherry');
    });
  });

  describe('Component Isolation', () => {
    it('should have different component registries for each theme', () => {
      const shadcnComponents = themeManager.getTheme('shadcn-ui')?.components;
      const cherryComponents = themeManager.getTheme('cherry')?.components;
      
      expect(shadcnComponents).toBeDefined();
      expect(cherryComponents).toBeDefined();
      expect(shadcnComponents?.registry).not.toBe(cherryComponents?.registry);
    });

    it('should have Cherry-specific components only in cherry theme', () => {
      const cherryComponents = themeManager.getTheme('cherry')?.components;
      const shadcnComponents = themeManager.getTheme('shadcn-ui')?.components;
      
      // Cherry 专属组件
      const cherrySpecificComponents = [
        'CherryMessage',
        'CherryInputbar',
        'CherrySidebar',
        'CherryNavbar',
        'CherryModelSelector',
        'CherryCodeBlock',
      ];
      
      for (const componentName of cherrySpecificComponents) {
        expect(cherryComponents?.registry.has(componentName)).toBe(true);
        expect(shadcnComponents?.registry.has(componentName)).toBe(false);
      }
    });

    it('should have common components in both themes', () => {
      const cherryComponents = themeManager.getTheme('cherry')?.components;
      const shadcnComponents = themeManager.getTheme('shadcn-ui')?.components;
      
      // 通用组件
      const commonComponents = ['Button', 'Input', 'Card', 'Text', 'Icon', 'Container'];
      
      for (const componentName of commonComponents) {
        expect(cherryComponents?.registry.has(componentName)).toBe(true);
        expect(shadcnComponents?.registry.has(componentName)).toBe(true);
      }
    });

    it('should return correct components when switching themes', () => {
      // 初始为 shadcn-ui
      let components = themeManager.getComponents();
      expect(components.registry.has('CherryMessage')).toBe(false);
      expect(components.registry.has('Button')).toBe(true);
      
      // 切换到 cherry
      themeManager.setActiveTheme('cherry');
      components = themeManager.getComponents();
      expect(components.registry.has('CherryMessage')).toBe(true);
      expect(components.registry.has('Button')).toBe(true);
    });
  });

  describe('Example Isolation', () => {
    it('should have different example collections for each theme', () => {
      const shadcnExamples = themeManager.getTheme('shadcn-ui')?.examples;
      const cherryExamples = themeManager.getTheme('cherry')?.examples;
      
      expect(shadcnExamples).toBeDefined();
      expect(cherryExamples).toBeDefined();
      expect(shadcnExamples?.presets).not.toBe(cherryExamples?.presets);
    });

    it('should have Cherry-specific examples only in cherry theme', () => {
      const cherryExamples = themeManager.getTheme('cherry')?.examples;
      const shadcnExamples = themeManager.getTheme('shadcn-ui')?.examples;
      
      // Cherry 专属案例 ID 前缀
      const cherryExampleIds = cherryExamples?.presets.map(e => e.id) || [];
      const shadcnExampleIds = shadcnExamples?.presets.map(e => e.id) || [];
      
      // Cherry 案例应该包含 'cherry' 关键字
      const cherrySpecificExamples = cherryExampleIds.filter(id => id.includes('cherry'));
      expect(cherrySpecificExamples.length).toBeGreaterThan(0);
      
      // shadcn 案例不应该包含 'cherry' 关键字
      const shadcnCherryExamples = shadcnExampleIds.filter(id => id.includes('cherry'));
      expect(shadcnCherryExamples.length).toBe(0);
    });

    it('should return correct examples when switching themes', () => {
      // 初始为 shadcn-ui
      let examples = themeManager.getExamples();
      let exampleIds = examples.presets.map(e => e.id);
      expect(exampleIds.some(id => id.includes('cherry'))).toBe(false);
      
      // 切换到 cherry
      themeManager.setActiveTheme('cherry');
      examples = themeManager.getExamples();
      exampleIds = examples.presets.map(e => e.id);
      expect(exampleIds.some(id => id.includes('cherry'))).toBe(true);
    });

    it('should have keyword mappings for both themes', () => {
      const shadcnExamples = themeManager.getTheme('shadcn-ui')?.examples;
      const cherryExamples = themeManager.getTheme('cherry')?.examples;
      
      expect(shadcnExamples?.keywordMappings).toBeDefined();
      expect(shadcnExamples?.keywordMappings?.length).toBeGreaterThan(0);
      
      expect(cherryExamples?.keywordMappings).toBeDefined();
      expect(cherryExamples?.keywordMappings?.length).toBeGreaterThan(0);
    });
  });

  describe('Prompt Template Isolation', () => {
    it('should have different prompt templates for each theme', () => {
      const shadcnPrompts = themeManager.getTheme('shadcn-ui')?.prompts;
      const cherryPrompts = themeManager.getTheme('cherry')?.prompts;
      
      expect(shadcnPrompts).toBeDefined();
      expect(cherryPrompts).toBeDefined();
      expect(shadcnPrompts?.templates).not.toBe(cherryPrompts?.templates);
    });

    it('should have both zh and en templates for shadcn-ui', () => {
      const prompts = themeManager.getTheme('shadcn-ui')?.prompts;
      
      expect(prompts?.templates.zh).toBeDefined();
      expect(prompts?.templates.en).toBeDefined();
      expect(prompts?.templates.zh.systemIntro).toBeDefined();
      expect(prompts?.templates.en.systemIntro).toBeDefined();
    });

    it('should have both zh and en templates for cherry', () => {
      const prompts = themeManager.getTheme('cherry')?.prompts;
      
      expect(prompts?.templates.zh).toBeDefined();
      expect(prompts?.templates.en).toBeDefined();
      expect(prompts?.templates.zh.systemIntro).toBeDefined();
      expect(prompts?.templates.en.systemIntro).toBeDefined();
    });

    it('should return correct prompts when switching themes', () => {
      // 初始为 shadcn-ui
      let prompts = themeManager.getPrompts();
      expect(prompts.templates.zh.systemIntro).toContain('shadcn');
      
      // 切换到 cherry
      themeManager.setActiveTheme('cherry');
      prompts = themeManager.getPrompts();
      expect(prompts.templates.zh.systemIntro).toContain('Cherry');
    });
  });

  describe('Token Isolation', () => {
    it('should have different tokens for each theme', () => {
      const shadcnTokens = themeManager.getTheme('shadcn-ui')?.tokens;
      const cherryTokens = themeManager.getTheme('cherry')?.tokens;
      
      expect(shadcnTokens).toBeDefined();
      expect(cherryTokens).toBeDefined();
      expect(shadcnTokens).not.toBe(cherryTokens);
    });

    it('should have all required token categories', () => {
      const shadcnTokens = themeManager.getTheme('shadcn-ui')?.tokens;
      const cherryTokens = themeManager.getTheme('cherry')?.tokens;
      
      const requiredCategories = ['colors', 'spacing', 'typography', 'shadows', 'radius'];
      
      for (const category of requiredCategories) {
        expect(shadcnTokens?.[category as keyof typeof shadcnTokens]).toBeDefined();
        expect(cherryTokens?.[category as keyof typeof cherryTokens]).toBeDefined();
      }
    });

    it('should return correct tokens when switching themes', () => {
      // 初始为 shadcn-ui
      let tokens = themeManager.getTokens();
      const shadcnPrimary = tokens.colors.primary;
      
      // 切换到 cherry
      themeManager.setActiveTheme('cherry');
      tokens = themeManager.getTokens();
      const cherryPrimary = tokens.colors.primary;
      
      // 两个主题的主色应该不同
      expect(shadcnPrimary).not.toBe(cherryPrimary);
    });
  });

  describe('Color Scheme Isolation', () => {
    it('should have color schemes for both themes', () => {
      const shadcnSchemes = themeManager.getTheme('shadcn-ui')?.colorSchemes;
      const cherrySchemes = themeManager.getTheme('cherry')?.colorSchemes;
      
      expect(shadcnSchemes).toBeDefined();
      expect(shadcnSchemes?.length).toBeGreaterThan(0);
      
      expect(cherrySchemes).toBeDefined();
      expect(cherrySchemes?.length).toBeGreaterThan(0);
    });

    it('should have light and dark schemes for shadcn-ui', () => {
      const schemes = themeManager.getTheme('shadcn-ui')?.colorSchemes;
      const schemeIds = schemes?.map(s => s.id) || [];
      
      expect(schemeIds).toContain('light');
      expect(schemeIds).toContain('dark');
    });

    it('should have light and dark schemes for cherry', () => {
      const schemes = themeManager.getTheme('cherry')?.colorSchemes;
      const schemeIds = schemes?.map(s => s.id) || [];
      
      expect(schemeIds).toContain('light');
      expect(schemeIds).toContain('dark');
    });

    it('should return correct color schemes when switching themes', () => {
      // 初始为 shadcn-ui
      let schemes = themeManager.getColorSchemes();
      expect(schemes.length).toBeGreaterThan(0);
      
      // 切换到 cherry
      themeManager.setActiveTheme('cherry');
      schemes = themeManager.getColorSchemes();
      expect(schemes.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Isolation', () => {
    it('should have layouts for both themes', () => {
      const shadcnLayouts = themeManager.getTheme('shadcn-ui')?.layouts;
      const cherryLayouts = themeManager.getTheme('cherry')?.layouts;
      
      expect(shadcnLayouts).toBeDefined();
      expect(shadcnLayouts?.length).toBeGreaterThan(0);
      
      expect(cherryLayouts).toBeDefined();
      expect(cherryLayouts?.length).toBeGreaterThan(0);
    });

    it('should have Cherry-specific layouts in cherry theme', () => {
      const layouts = themeManager.getTheme('cherry')?.layouts;
      const layoutIds = layouts?.map(l => l.id) || [];
      
      // Cherry 专属布局
      expect(layoutIds.some(id => id.includes('cherry'))).toBe(true);
    });

    it('should return correct layouts when switching themes', () => {
      // 初始为 shadcn-ui
      let layouts = themeManager.getLayouts();
      let layoutIds = layouts.map(l => l.id);
      expect(layoutIds.some(id => id.includes('cherry'))).toBe(false);
      
      // 切换到 cherry
      themeManager.setActiveTheme('cherry');
      layouts = themeManager.getLayouts();
      layoutIds = layouts.map(l => l.id);
      expect(layoutIds.some(id => id.includes('cherry'))).toBe(true);
    });
  });

  describe('Theme Pack Structure Validation', () => {
    it('should have valid structure for shadcn-ui theme pack', () => {
      const theme = shadcnThemePack;
      
      // 基础信息
      expect(theme.id).toBe('shadcn-ui');
      expect(theme.name).toBeTruthy();
      expect(theme.description).toBeTruthy();
      expect(theme.version).toMatch(/^\d+\.\d+\.\d+$/);
      
      // 核心配置
      expect(theme.tokens).toBeDefined();
      expect(theme.components).toBeDefined();
      expect(theme.examples).toBeDefined();
      expect(theme.prompts).toBeDefined();
      
      // 外观配置
      expect(theme.colorSchemes).toBeDefined();
      expect(theme.colorSchemes.length).toBeGreaterThan(0);
      expect(theme.layouts).toBeDefined();
      expect(theme.layouts.length).toBeGreaterThan(0);
    });

    it('should have valid structure for cherry theme pack', () => {
      const theme = cherryThemePack;
      
      // 基础信息
      expect(theme.id).toBe('cherry');
      expect(theme.name).toBeTruthy();
      expect(theme.description).toBeTruthy();
      expect(theme.version).toMatch(/^\d+\.\d+\.\d+$/);
      
      // 核心配置
      expect(theme.tokens).toBeDefined();
      expect(theme.components).toBeDefined();
      expect(theme.examples).toBeDefined();
      expect(theme.prompts).toBeDefined();
      
      // 外观配置
      expect(theme.colorSchemes).toBeDefined();
      expect(theme.colorSchemes.length).toBeGreaterThan(0);
      expect(theme.layouts).toBeDefined();
      expect(theme.layouts.length).toBeGreaterThan(0);
    });
  });
});
