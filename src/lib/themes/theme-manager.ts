/**
 * @file theme-manager.ts
 * @description 主题管理器 - 管理多主题系统的核心类
 * @module lib/themes
 */

import type {
  ThemePack,
  ThemeMetadata,
  ThemeChangeEvent,
  ThemeChangeListener,
  ThemeTokens,
  ThemeComponents,
  ThemeExamples,
  ThemePrompts,
  ThemeValidation,
  ColorScheme,
  LayoutConfig,
  TokenCategory,
  ComponentDefinitionData,
} from './types';
import { ThemeError, ThemeErrorCode, DEFAULT_THEME_ID } from './types';
import { defaultRegistry, type ComponentDefinition, type IComponentRegistry } from '../core/component-registry';

/**
 * 主题组件命名空间前缀
 */
const THEME_COMPONENT_PREFIX = '__theme__';

/**
 * 创建带命名空间的组件名称
 */
function createNamespacedComponentName(themeId: string, componentName: string): string {
  return `${THEME_COMPONENT_PREFIX}${themeId}__${componentName}`;
}

/**
 * 解析命名空间组件名称
 */
function parseNamespacedComponentName(namespacedName: string): { themeId: string; componentName: string } | null {
  if (!namespacedName.startsWith(THEME_COMPONENT_PREFIX)) {
    return null;
  }
  const withoutPrefix = namespacedName.substring(THEME_COMPONENT_PREFIX.length);
  const separatorIndex = withoutPrefix.indexOf('__');
  if (separatorIndex === -1) {
    return null;
  }
  return {
    themeId: withoutPrefix.substring(0, separatorIndex),
    componentName: withoutPrefix.substring(separatorIndex + 2),
  };
}

/**
 * 主题管理器 - 单例模式
 * 负责注册、切换和获取当前主题
 */
export class ThemeManager {
  private static instance: ThemeManager | null = null;
  private themes: Map<string, ThemePack>;
  private activeThemeId: string;
  private listeners: Set<ThemeChangeListener>;
  private defaultThemeId: string;
  private componentRegistry: IComponentRegistry;
  private loadedThemeComponents: Map<string, string[]>; // themeId -> componentNames[]

  private constructor() {
    this.themes = new Map();
    this.activeThemeId = DEFAULT_THEME_ID;
    this.defaultThemeId = DEFAULT_THEME_ID;
    this.listeners = new Set();
    this.componentRegistry = defaultRegistry;
    this.loadedThemeComponents = new Map();
  }

  /**
   * 获取 ThemeManager 单例实例
   */
  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * 重置单例实例（仅用于测试）
   */
  static resetInstance(): void {
    ThemeManager.instance = null;
  }

  /**
   * 设置组件注册表（用于依赖注入）
   */
  setComponentRegistry(registry: IComponentRegistry): void {
    this.componentRegistry = registry;
  }

  /**
   * 获取组件注册表
   */
  getComponentRegistry(): IComponentRegistry {
    return this.componentRegistry;
  }

  // ============================================================================
  // 主题注册
  // ============================================================================

  /**
   * 注册新主题
   * @param theme 主题包
   * @throws ThemeError 如果主题 ID 已存在
   */
  register(theme: ThemePack): void {
    if (this.themes.has(theme.id)) {
      throw new ThemeError(
        ThemeErrorCode.THEME_ALREADY_EXISTS,
        `Theme with id "${theme.id}" already exists`,
        { themeId: theme.id }
      );
    }
    this.themes.set(theme.id, theme);
  }

  /**
   * 注销主题
   * @param themeId 主题 ID
   * @throws ThemeError 如果主题不存在
   */
  unregister(themeId: string): void {
    if (!this.themes.has(themeId)) {
      throw new ThemeError(
        ThemeErrorCode.THEME_NOT_FOUND,
        `Theme with id "${themeId}" not found`,
        { themeId }
      );
    }

    // 如果要注销的是当前激活的主题，先切换到默认主题
    if (this.activeThemeId === themeId) {
      if (themeId === this.defaultThemeId) {
        throw new ThemeError(
          ThemeErrorCode.CANNOT_UNINSTALL_BUILTIN,
          `Cannot unregister the default theme "${themeId}"`,
          { themeId }
        );
      }
      this.setActiveTheme(this.defaultThemeId);
    }

    // 卸载主题组件
    this.unloadThemeComponents(themeId);

    this.themes.delete(themeId);
  }

  // ============================================================================
  // 组件动态加载/卸载
  // ============================================================================

  /**
   * 加载主题组件到注册表
   * @param themeId 主题 ID
   * @param components 组件配置
   */
  loadThemeComponents(themeId: string, components: ThemeComponents): void {
    // 如果使用传统的 registry 模式，不需要动态加载
    if (components.registry && !components.definitions) {
      return;
    }

    // 如果使用 definitions 模式，动态注册组件
    if (components.definitions && components.componentFactory) {
      const loadedNames: string[] = [];

      for (const defData of components.definitions) {
        const component = components.componentFactory(defData.name);
        if (component) {
          const namespacedName = createNamespacedComponentName(themeId, defData.name);
          const fullDefinition: ComponentDefinition = {
            ...defData,
            name: namespacedName,
            component,
          };
          
          try {
            this.componentRegistry.register(fullDefinition);
            loadedNames.push(namespacedName);
          } catch (error) {
            console.warn(`Failed to register component ${defData.name} for theme ${themeId}:`, error);
          }
        }
      }

      this.loadedThemeComponents.set(themeId, loadedNames);
    }
  }

  /**
   * 卸载主题组件从注册表
   * @param themeId 主题 ID
   */
  unloadThemeComponents(themeId: string): void {
    const loadedNames = this.loadedThemeComponents.get(themeId);
    if (loadedNames) {
      for (const name of loadedNames) {
        this.componentRegistry.unregister(name);
      }
      this.loadedThemeComponents.delete(themeId);
    }
  }

  /**
   * 获取主题的组件定义数据
   * @param themeId 主题 ID
   * @returns 组件定义数据数组
   */
  getThemeComponentDefinitions(themeId: string): ComponentDefinitionData[] {
    const theme = this.themes.get(themeId);
    if (!theme) {
      return [];
    }

    // 如果使用 definitions 模式
    if (theme.components.definitions) {
      return theme.components.definitions;
    }

    // 如果使用传统 registry 模式，从 registry 中提取定义数据
    if (theme.components.registry) {
      return theme.components.registry.getAll().map(def => ({
        name: def.name,
        version: def.version,
        platforms: def.platforms,
        propsSchema: def.propsSchema,
        description: def.description,
        category: def.category,
        examples: def.examples,
        icon: def.icon,
        tags: def.tags,
        deprecated: def.deprecated,
        deprecationMessage: def.deprecationMessage,
      }));
    }

    return [];
  }

  /**
   * 检查主题是否已加载组件
   * @param themeId 主题 ID
   */
  hasLoadedComponents(themeId: string): boolean {
    return this.loadedThemeComponents.has(themeId);
  }

  /**
   * 获取已加载的主题组件名称
   * @param themeId 主题 ID
   */
  getLoadedComponentNames(themeId: string): string[] {
    return this.loadedThemeComponents.get(themeId) || [];
  }


  // ============================================================================
  // 主题切换
  // ============================================================================

  /**
   * 设置当前激活的主题
   * @param themeId 主题 ID
   * @throws ThemeError 如果主题不存在
   */
  setActiveTheme(themeId: string): void {
    const newTheme = this.themes.get(themeId);
    if (!newTheme) {
      throw new ThemeError(
        ThemeErrorCode.THEME_NOT_FOUND,
        `Theme with id "${themeId}" not found`,
        { themeId }
      );
    }

    const oldThemeId = this.activeThemeId;
    const oldTheme = this.themes.get(oldThemeId);

    // 如果主题没有变化，不触发事件
    if (oldThemeId === themeId) {
      return;
    }

    // 卸载旧主题的组件
    if (oldTheme) {
      this.unloadThemeComponents(oldThemeId);
    }

    // 加载新主题的组件
    this.loadThemeComponents(themeId, newTheme.components);

    this.activeThemeId = themeId;

    // 触发主题变更事件
    if (oldTheme) {
      const event: ThemeChangeEvent = {
        oldThemeId,
        newThemeId: themeId,
        oldTheme,
        newTheme,
      };
      this.notifyListeners(event);
    }
  }

  /**
   * 获取当前激活的主题
   * @returns 当前激活的主题包
   * @throws ThemeError 如果没有激活的主题
   */
  getActiveTheme(): ThemePack {
    const theme = this.themes.get(this.activeThemeId);
    if (!theme) {
      throw new ThemeError(
        ThemeErrorCode.THEME_NOT_FOUND,
        `Active theme "${this.activeThemeId}" not found`,
        { themeId: this.activeThemeId }
      );
    }
    return theme;
  }

  /**
   * 获取当前激活的主题 ID
   */
  getActiveThemeId(): string {
    return this.activeThemeId;
  }

  // ============================================================================
  // 主题查询
  // ============================================================================

  /**
   * 获取指定主题
   * @param themeId 主题 ID
   * @returns 主题包，如果不存在则返回 undefined
   */
  getTheme(themeId: string): ThemePack | undefined {
    return this.themes.get(themeId);
  }

  /**
   * 获取所有已注册的主题
   */
  getAllThemes(): ThemePack[] {
    return Array.from(this.themes.values());
  }

  /**
   * 获取所有主题的元数据
   */
  getThemeMetadata(): ThemeMetadata[] {
    return Array.from(this.themes.values()).map((theme) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      version: theme.version,
      author: theme.author,
      repository: theme.repository,
      previewImage: theme.previewImage,
      category: theme.id === 'shadcn-ui' || theme.id === 'cherry' ? 'builtin' : 'community',
      installed: true,
    }));
  }

  /**
   * 检查主题是否已注册
   */
  hasTheme(themeId: string): boolean {
    return this.themes.has(themeId);
  }

  /**
   * 获取已注册主题的数量
   */
  getThemeCount(): number {
    return this.themes.size;
  }


  // ============================================================================
  // 事件订阅
  // ============================================================================

  /**
   * 订阅主题变更事件
   * @param listener 监听器函数
   * @returns 取消订阅的函数
   */
  subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(event: ThemeChangeEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    }
  }

  /**
   * 获取监听器数量（用于测试）
   */
  getListenerCount(): number {
    return this.listeners.size;
  }

  // ============================================================================
  // 便捷方法 - 获取当前主题的各部分配置
  // ============================================================================

  /**
   * 获取当前主题的设计令牌
   */
  getTokens(): ThemeTokens {
    return this.getActiveTheme().tokens;
  }

  /**
   * 获取当前主题的组件配置
   */
  getComponents(): ThemeComponents {
    return this.getActiveTheme().components;
  }

  /**
   * 获取当前主题的案例配置
   */
  getExamples(): ThemeExamples {
    return this.getActiveTheme().examples;
  }

  /**
   * 获取当前主题的提示词模板
   */
  getPrompts(): ThemePrompts {
    return this.getActiveTheme().prompts;
  }

  /**
   * 获取当前主题的验证规则
   */
  getValidation(): ThemeValidation | undefined {
    return this.getActiveTheme().validation;
  }

  /**
   * 获取当前主题的配色方案列表
   */
  getColorSchemes(): ColorScheme[] {
    return this.getActiveTheme().colorSchemes;
  }

  /**
   * 获取当前主题的布局配置列表
   */
  getLayouts(): LayoutConfig[] {
    return this.getActiveTheme().layouts;
  }

  /**
   * 获取指定配色方案
   */
  getColorScheme(schemeId: string): ColorScheme | undefined {
    return this.getActiveTheme().colorSchemes.find((s) => s.id === schemeId);
  }

  /**
   * 获取指定布局配置
   */
  getLayout(layoutId: string): LayoutConfig | undefined {
    return this.getActiveTheme().layouts.find((l) => l.id === layoutId);
  }

  // ============================================================================
  // 令牌扩展
  // ============================================================================

  /**
   * 注册自定义令牌类别到当前主题
   * @param category 令牌类别
   */
  registerTokenCategory(category: TokenCategory): void {
    const theme = this.getActiveTheme();
    if (!theme.tokens.extensions) {
      theme.tokens.extensions = {};
    }
    theme.tokens.extensions[category.name] = category;
  }

  // ============================================================================
  // 默认主题管理
  // ============================================================================

  /**
   * 设置默认主题 ID
   */
  setDefaultThemeId(themeId: string): void {
    if (!this.themes.has(themeId)) {
      throw new ThemeError(
        ThemeErrorCode.THEME_NOT_FOUND,
        `Theme with id "${themeId}" not found`,
        { themeId }
      );
    }
    this.defaultThemeId = themeId;
  }

  /**
   * 获取默认主题 ID
   */
  getDefaultThemeId(): string {
    return this.defaultThemeId;
  }
}

// 导出单例获取函数
export const getThemeManager = (): ThemeManager => ThemeManager.getInstance();


// 导出辅助函数
export { createNamespacedComponentName, parseNamespacedComponentName };
