/**
 * Component Catalog Module
 * 
 * 组件目录模块，整合现有 ComponentRegistry 的组件定义，
 * 作为验证和提示词生成的单一数据源。
 * 
 * @module component-catalog
 * @see Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import type { ComponentRegistry, ComponentDefinition, PropSchema, ComponentExample } from './component-registry';
import { defaultRegistry } from './component-registry';

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


/**
 * Component_Catalog 类
 * 
 * 组件目录，整合 ComponentRegistry 的组件定义，
 * 提供类型验证、别名解析和元数据导出功能。
 */
export class ComponentCatalog {
  private registry: ComponentRegistry;
  private validTypes: Set<string>;
  private typeAliases: Map<string, string>;

  /**
   * 创建组件目录实例
   * @param registry - 组件注册表实例
   */
  constructor(registry: ComponentRegistry) {
    this.registry = registry;
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
   * 从注册表同步有效类型列表
   * @private
   */
  private syncValidTypes(): void {
    this.validTypes.clear();
    const components = this.registry.getAll();
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
    const components = this.registry.getAll();
    return components.map(this.toMetadata);
  }

  /**
   * 获取按类别分组的组件
   * @returns 按类别分组的组件元数据映射
   */
  getByCategory(): Record<string, ComponentMetadata[]> {
    const components = this.registry.getAll();
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
    // 尝试直接获取
    let definition = this.registry.get(type);
    
    // 如果没找到，尝试解析别名
    if (!definition) {
      const resolved = this.resolveAlias(type);
      if (resolved) {
        definition = this.registry.get(resolved);
      }
    }
    
    // 如果还没找到，尝试大小写不敏感匹配
    if (!definition) {
      const lowerType = type.toLowerCase();
      const components = this.registry.getAll();
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
 * 使用默认的组件注册表创建
 */
export const defaultCatalog = new ComponentCatalog(defaultRegistry);

// 注册默认目录到验证模块，避免循环依赖
import { setDefaultCatalog } from './validation';
setDefaultCatalog(defaultCatalog);
