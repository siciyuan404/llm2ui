/**
 * Component Catalog Module
 * 
 * 组件目录模块，整合现有 ComponentRegistry 的组件定义，
 * 作为验证和提示词生成的单一数据源。
 * 
 * 支持多主题系统：当 ThemeManager 可用时，使用当前主题的组件注册表；
 * 否则回退到默认注册表以保持向后兼容。
 * 
 * 类型别名支持：
 * - HTML 元素别名: div, span, img, a
 * - 布局容器别名: box, wrapper, section, view, flex, grid, stack, row, column
 * - 缩写别名: btn, txt, lbl, inp, sel, chk, tbl
 * - 语义化别名: heading, title, paragraph, h1-h6
 * 
 * @module lib/core/component-catalog
 * @see Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 4.2, 8.3
 */

import type { ComponentDefinition, PropSchema, ComponentExample } from './component-registry';
import { defaultRegistry } from './component-registry';

/**
 * 通用组件注册表接口
 * 用于兼容不同模块的 ComponentRegistry 实现
 */
interface IComponentRegistry {
  getAll(): ComponentDefinition[];
  get(name: string): ComponentDefinition | undefined;
}

/**
 * 类型别名映射
 * 将常见的别名映射到规范的组件类型名称
 */
export const TYPE_ALIAS_MAP: Record<string, string> = {
  // HTML 元素别名
  'div': 'Container',
  'span': 'Text',
  'img': 'Image',
  'a': 'Link',
  
  // 布局容器别名（LLM 常用）
  'box': 'Container',
  'wrapper': 'Container',
  'section': 'Container',
  'view': 'Container',
  'flex': 'Container',
  'grid': 'Container',
  'stack': 'Container',
  'row': 'Container',
  'column': 'Container',
  
  // 缩写别名
  'btn': 'Button',
  'txt': 'Text',
  'lbl': 'Label',
  'inp': 'Input',
  'sel': 'Select',
  'chk': 'Checkbox',
  'tbl': 'Table',
  
  // 常见拼写变体
  'textfield': 'Input',
  'textbox': 'Input',
  'dropdown': 'Select',
  'checkbox': 'Checkbox',
  
  // 语义化组件别名（LLM 常用）
  'heading': 'Text',
  'title': 'Text',
  'paragraph': 'Text',
  'h1': 'Text',
  'h2': 'Text',
  'h3': 'Text',
  'h4': 'Text',
  'h5': 'Text',
  'h6': 'Text',
};

/**
 * 组件元数据（从 ComponentDefinition 派生）
 */
export interface ComponentMetadata {
  /** 组件名称 */
  name: string;
  /** 组件类别 */
  category: string;
  /** 组件描述 */
  description: string;
  /** 属性 Schema */
  propsSchema: Record<string, PropSchema>;
  /** 使用示例 */
  examples?: ComponentExample[];
  /** 是否已弃用 */
  deprecated?: boolean;
  /** 弃用消息 */
  deprecationMessage?: string;
}

// 延迟导入 ThemeManager 以避免循环依赖
let _ThemeManager: { getInstance: () => { getThemeCount: () => number; getActiveTheme: () => { components: { registry: IComponentRegistry; aliases?: Record<string, string> } } } } | null = null;

/**
 * 获取 ThemeManager（延迟加载）
 * @private
 */
function getThemeManager() {
  if (_ThemeManager === null) {
    try {
      // 动态导入以避免循环依赖
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const themes = require('../themes/theme-manager');
      _ThemeManager = themes.ThemeManager;
    } catch {
      _ThemeManager = undefined as unknown as null;
    }
  }
  return _ThemeManager;
}

/**
 * Component_Catalog 类
 * 
 * 组件目录，整合 ComponentRegistry 的组件定义，
 * 提供类型验证、别名解析和元数据导出功能。
 * 
 * 支持多主题系统：可以使用 ThemeManager 获取当前主题的组件注册表。
 */
export class ComponentCatalog {
  private registry: IComponentRegistry;
  private validTypes: Set<string>;
  private typeAliases: Map<string, string>;
  private useThemeManager: boolean;

  /**
   * 创建组件目录实例
   * @param registry - 组件注册表实例（可选，如果不提供则尝试使用 ThemeManager）
   * @param useThemeManager - 是否使用 ThemeManager 获取组件注册表（默认 true）
   */
  constructor(registry?: IComponentRegistry, useThemeManager: boolean = true) {
    this.useThemeManager = useThemeManager;
    this.registry = registry || this.getRegistryFromThemeManager() || defaultRegistry;
    this.validTypes = new Set<string>();
    this.typeAliases = new Map<string, string>();
    
    // 初始化类型别名映射
    for (const [alias, canonical] of Object.entries(TYPE_ALIAS_MAP)) {
      this.typeAliases.set(alias.toLowerCase(), canonical);
    }
    
    // 从注册表同步有效类型
    this.syncValidTypes();
  }

  /**
   * 从 ThemeManager 获取当前主题的组件注册表
   * @private
   */
  private getRegistryFromThemeManager(): IComponentRegistry | null {
    if (!this.useThemeManager) {
      return null;
    }
    
    try {
      const ThemeManager = getThemeManager();
      if (ThemeManager) {
        const themeManager = ThemeManager.getInstance();
        // 检查是否有注册的主题
        if (themeManager.getThemeCount() > 0) {
          const theme = themeManager.getActiveTheme();
          return theme.components.registry as IComponentRegistry;
        }
      }
    } catch {
      // ThemeManager 未初始化或没有主题，回退到默认注册表
    }
    return null;
  }

  /**
   * 获取当前使用的组件注册表
   * 如果启用了 ThemeManager，会尝试获取当前主题的注册表
   */
  getRegistry(): IComponentRegistry {
    if (this.useThemeManager) {
      const themeRegistry = this.getRegistryFromThemeManager();
      if (themeRegistry) {
        this.registry = themeRegistry;
      }
    }
    return this.registry;
  }

  /**
   * 设置是否使用 ThemeManager
   */
  setUseThemeManager(use: boolean): void {
    this.useThemeManager = use;
    if (use) {
      const themeRegistry = this.getRegistryFromThemeManager();
      if (themeRegistry) {
        this.registry = themeRegistry;
        this.syncValidTypes();
      }
    }
  }

  /**
   * 从注册表同步有效类型列表
   * @private
   */
  private syncValidTypes(): void {
    this.validTypes.clear();
    const registry = this.getRegistry();
    const components = registry.getAll();
    for (const component of components) {
      this.validTypes.add(component.name);
    }
  }

  /**
   * 获取有效类型列表
   * @returns 有效组件类型名称数组
   */
  getValidTypes(): string[] {
    // 每次调用时同步，确保与注册表保持一致
    this.syncValidTypes();
    return Array.from(this.validTypes).sort();
  }

  /**
   * 检查类型是否有效（包括别名）
   * @param type - 要检查的类型名称
   * @returns 如果类型有效或有已知别名则返回 true
   */
  isValidType(type: string): boolean {
    // 同步有效类型
    this.syncValidTypes();
    
    // 直接匹配
    if (this.validTypes.has(type)) {
      return true;
    }
    
    // 检查别名
    const resolved = this.resolveAlias(type);
    if (resolved && this.validTypes.has(resolved)) {
      return true;
    }
    
    // 检查主题特定的别名
    const themeAliases = this.getThemeAliases();
    if (themeAliases && themeAliases[type]) {
      const aliasTarget = themeAliases[type];
      if (this.validTypes.has(aliasTarget)) {
        return true;
      }
    }
    
    // 检查大小写不敏感匹配
    const lowerType = type.toLowerCase();
    for (const validType of this.validTypes) {
      if (validType.toLowerCase() === lowerType) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 获取当前主题的组件别名
   * @private
   */
  private getThemeAliases(): Record<string, string> | undefined {
    if (!this.useThemeManager) {
      return undefined;
    }
    
    try {
      const ThemeManager = getThemeManager();
      if (ThemeManager) {
        const themeManager = ThemeManager.getInstance();
        if (themeManager.getThemeCount() > 0) {
          const theme = themeManager.getActiveTheme();
          return theme.components.aliases;
        }
      }
    } catch {
      // 忽略错误
    }
    return undefined;
  }

  /**
   * 解析类型别名，返回规范名称
   * @param type - 要解析的类型名称或别名
   * @returns 规范类型名称，如果没有别名则返回 undefined
   */
  resolveAlias(type: string): string | undefined {
    const lowerType = type.toLowerCase();
    
    // 检查别名映射
    if (this.typeAliases.has(lowerType)) {
      return this.typeAliases.get(lowerType);
    }
    
    return undefined;
  }

  /**
   * 获取所有组件元数据
   * @returns 组件元数据数组
   */
  getAllMetadata(): ComponentMetadata[] {
    const registry = this.getRegistry();
    const components = registry.getAll();
    return components.map(this.toMetadata);
  }

  /**
   * 获取按类别分组的组件
   * @returns 按类别分组的组件元数据映射
   */
  getByCategory(): Record<string, ComponentMetadata[]> {
    const registry = this.getRegistry();
    const components = registry.getAll();
    const grouped: Record<string, ComponentMetadata[]> = {};
    
    for (const component of components) {
      const category = component.category || 'uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(this.toMetadata(component));
    }
    
    return grouped;
  }

  /**
   * 获取组件的 propsSchema
   * @param type - 组件类型名称
   * @returns 属性 Schema，如果组件不存在则返回 undefined
   */
  getPropsSchema(type: string): Record<string, PropSchema> | undefined {
    const registry = this.getRegistry();
    
    // 尝试直接获取
    let definition = registry.get(type);
    
    // 如果没找到，尝试解析别名
    if (!definition) {
      const resolved = this.resolveAlias(type);
      if (resolved) {
        definition = registry.get(resolved);
      }
    }
    
    // 如果还没找到，尝试主题别名
    if (!definition) {
      const themeAliases = this.getThemeAliases();
      if (themeAliases && themeAliases[type]) {
        definition = registry.get(themeAliases[type]);
      }
    }
    
    // 如果还没找到，尝试大小写不敏感匹配
    if (!definition) {
      const lowerType = type.toLowerCase();
      const components = registry.getAll();
      definition = components.find(c => c.name.toLowerCase() === lowerType);
    }
    
    return definition?.propsSchema;
  }

  /**
   * 将 ComponentDefinition 转换为 ComponentMetadata
   * @param definition - 组件定义
   * @returns 组件元数据
   * @private
   */
  private toMetadata(definition: ComponentDefinition): ComponentMetadata {
    return {
      name: definition.name,
      category: definition.category || 'uncategorized',
      description: definition.description || '',
      propsSchema: definition.propsSchema || {},
      examples: definition.examples,
      deprecated: definition.deprecated,
      deprecationMessage: definition.deprecationMessage,
    };
  }
}

/**
 * 默认目录实例
 * 使用默认的组件注册表创建，支持 ThemeManager
 */
export const defaultCatalog = new ComponentCatalog(defaultRegistry, true);

/**
 * 创建使用当前主题的组件目录
 * 这是推荐的方式，会自动使用 ThemeManager 中的当前主题
 */
export function createThemedCatalog(): ComponentCatalog {
  return new ComponentCatalog(undefined, true);
}

/**
 * 创建使用指定注册表的组件目录（不使用 ThemeManager）
 * 用于需要固定注册表的场景
 */
export function createStaticCatalog(registry: IComponentRegistry): ComponentCatalog {
  return new ComponentCatalog(registry, false);
}

// 注册默认目录到验证模块，避免循环依赖
import { setDefaultCatalog } from './validation';
setDefaultCatalog(defaultCatalog);
