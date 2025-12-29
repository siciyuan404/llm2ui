/**
 * @file example-library.ts
 * @description 案例库模块，统一管理所有 UI 案例，包括系统预设案例、用户自定义案例和组件注册表中的案例
 * @module lib/example-library
 * @requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import type { ExampleCategory } from './example-tags';
import type { ExampleMetadata } from './preset-examples';
import { PRESET_EXAMPLES } from './preset-examples';
import { getAllExamples as getCustomExamples, type CustomExample } from './custom-examples-storage';
import { type ComponentRegistry, type ComponentDefinition, type ComponentExample } from './component-registry';

// Re-export ExampleMetadata for convenience
export type { ExampleMetadata } from './preset-examples';

/**
 * 案例库配置选项
 */
export interface ExampleLibraryOptions {
  /** 组件注册表实例（可选） */
  registry?: ComponentRegistry;
  /** 是否包含系统预设案例，默认 true */
  includePresets?: boolean;
  /** 是否包含用户自定义案例，默认 true */
  includeCustom?: boolean;
  /** 是否包含组件注册表中的案例，默认 true */
  includeRegistryExamples?: boolean;
}

/**
 * 将 CustomExample 转换为 ExampleMetadata
 * @param customExample - 用户自定义案例
 * @returns 转换后的案例元数据
 */
function convertCustomExampleToMetadata(customExample: CustomExample): ExampleMetadata {
  return {
    id: customExample.id,
    title: customExample.title,
    description: customExample.description,
    // 用户自定义案例默认分类为 display，可以根据 componentName 推断
    category: inferCategoryFromComponentName(customExample.componentName),
    tags: inferTagsFromCustomExample(customExample),
    schema: customExample.schema,
    source: 'custom',
    componentName: customExample.componentName,
  };
}

/**
 * 根据组件名称推断分类
 * @param componentName - 组件名称
 * @returns 推断的分类
 */
function inferCategoryFromComponentName(componentName: string): ExampleCategory {
  const lowerName = componentName.toLowerCase();
  
  if (['input', 'textarea', 'select', 'checkbox', 'radio', 'form', 'label'].some(k => lowerName.includes(k))) {
    return 'form';
  }
  if (['container', 'card', 'grid', 'flex', 'layout', 'sidebar', 'header', 'footer'].some(k => lowerName.includes(k))) {
    return 'layout';
  }
  if (['nav', 'menu', 'breadcrumb', 'tabs', 'steps', 'link'].some(k => lowerName.includes(k))) {
    return 'navigation';
  }
  if (['alert', 'dialog', 'modal', 'toast', 'notification', 'loading', 'spinner'].some(k => lowerName.includes(k))) {
    return 'feedback';
  }
  if (['dashboard', 'chart', 'stats', 'metric'].some(k => lowerName.includes(k))) {
    return 'dashboard';
  }
  
  return 'display';
}

/**
 * 根据自定义案例推断标签
 * @param customExample - 用户自定义案例
 * @returns 推断的标签数组
 */
function inferTagsFromCustomExample(customExample: CustomExample): string[] {
  const tags: string[] = [];
  const lowerTitle = customExample.title.toLowerCase();
  const lowerDesc = customExample.description.toLowerCase();
  const lowerComponent = customExample.componentName.toLowerCase();
  
  // 根据标题和描述推断标签
  const tagKeywords: Record<string, string[]> = {
    sidebar: ['sidebar', '侧边栏', '侧栏'],
    header: ['header', '头部', '顶部'],
    footer: ['footer', '底部', '页脚'],
    navbar: ['navbar', '导航栏'],
    card: ['card', '卡片'],
    table: ['table', '表格'],
    list: ['list', '列表'],
    modal: ['modal', '弹窗', '对话框'],
    form: ['form', '表单'],
    login: ['login', '登录'],
    register: ['register', '注册'],
    search: ['search', '搜索'],
    admin: ['admin', '后台', '管理'],
  };
  
  const combinedText = `${lowerTitle} ${lowerDesc} ${lowerComponent}`;
  
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      tags.push(tag);
    }
  }
  
  return tags;
}

/**
 * 将 ComponentExample 转换为 ExampleMetadata
 * @param example - 组件案例
 * @param componentDef - 组件定义
 * @param index - 案例索引
 * @returns 转换后的案例元数据
 */
function convertComponentExampleToMetadata(
  example: ComponentExample,
  componentDef: ComponentDefinition,
  index: number
): ExampleMetadata {
  return {
    id: `registry-${componentDef.name.toLowerCase()}-${index}`,
    title: example.title,
    description: example.description,
    category: mapComponentCategoryToExampleCategory(componentDef.category),
    tags: componentDef.tags || [],
    schema: example.schema,
    source: 'system',
    componentName: componentDef.name,
  };
}

/**
 * 将组件分类映射到案例分类
 * @param componentCategory - 组件分类
 * @returns 案例分类
 */
function mapComponentCategoryToExampleCategory(componentCategory?: string): ExampleCategory {
  if (!componentCategory) return 'display';
  
  const mapping: Record<string, ExampleCategory> = {
    input: 'form',
    layout: 'layout',
    display: 'display',
    feedback: 'feedback',
    navigation: 'navigation',
  };
  
  return mapping[componentCategory] || 'display';
}

/**
 * 案例库类
 * 
 * 统一管理所有 UI 案例，提供查询、筛选和搜索功能
 */
export class ExampleLibrary {
  private examples: Map<string, ExampleMetadata> = new Map();
  private options: Required<ExampleLibraryOptions>;
  
  /**
   * 创建案例库实例
   * @param options - 配置选项
   */
  constructor(options: ExampleLibraryOptions = {}) {
    this.options = {
      registry: options.registry as ComponentRegistry,
      includePresets: options.includePresets ?? true,
      includeCustom: options.includeCustom ?? true,
      includeRegistryExamples: options.includeRegistryExamples ?? true,
    };
    
    this.loadExamples();
  }
  
  /**
   * 从各数据源加载案例
   */
  private loadExamples(): void {
    this.examples.clear();
    
    // 1. 加载系统预设案例
    if (this.options.includePresets) {
      for (const example of PRESET_EXAMPLES) {
        this.examples.set(example.id, example);
      }
    }
    
    // 2. 加载用户自定义案例
    if (this.options.includeCustom) {
      try {
        const customExamples = getCustomExamples();
        for (const customExample of customExamples) {
          const metadata = convertCustomExampleToMetadata(customExample);
          this.examples.set(metadata.id, metadata);
        }
      } catch {
        // 忽略 localStorage 读取错误（如在 SSR 环境中）
        console.warn('Failed to load custom examples from localStorage');
      }
    }
    
    // 3. 加载组件注册表中的案例
    if (this.options.includeRegistryExamples && this.options.registry) {
      const components = this.options.registry.getAll();
      for (const componentDef of components) {
        if (componentDef.examples && componentDef.examples.length > 0) {
          for (let i = 0; i < componentDef.examples.length; i++) {
            const example = componentDef.examples[i];
            const metadata = convertComponentExampleToMetadata(example, componentDef, i);
            this.examples.set(metadata.id, metadata);
          }
        }
      }
    }
  }
  
  /**
   * 获取所有案例
   * @returns 所有案例的数组
   */
  getAll(): ExampleMetadata[] {
    return Array.from(this.examples.values());
  }
  
  /**
   * 按 ID 获取案例
   * @param id - 案例 ID
   * @returns 匹配的案例，如果不存在则返回 undefined
   */
  getById(id: string): ExampleMetadata | undefined {
    return this.examples.get(id);
  }
  
  /**
   * 按分类获取案例
   * @param category - 案例分类
   * @returns 该分类下的所有案例
   */
  getByCategory(category: ExampleCategory): ExampleMetadata[] {
    return this.getAll().filter(example => example.category === category);
  }
  
  /**
   * 按分类分组获取所有案例
   * @returns 按分类分组的案例对象
   */
  getAllByCategory(): Record<ExampleCategory, ExampleMetadata[]> {
    const result: Record<ExampleCategory, ExampleMetadata[]> = {
      layout: [],
      form: [],
      navigation: [],
      dashboard: [],
      display: [],
      feedback: [],
    };
    
    for (const example of this.getAll()) {
      if (result[example.category]) {
        result[example.category].push(example);
      } else {
        // 如果分类不在标准分类中，放入 display
        result.display.push(example);
      }
    }
    
    return result;
  }
  
  /**
   * 按标签筛选案例
   * 返回至少包含一个指定标签的案例
   * @param tags - 标签数组
   * @returns 匹配的案例数组
   */
  filterByTags(tags: string[]): ExampleMetadata[] {
    if (tags.length === 0) {
      return this.getAll();
    }
    
    const lowerTags = tags.map(t => t.toLowerCase());
    
    return this.getAll().filter(example => {
      const exampleTags = example.tags.map(t => t.toLowerCase());
      return lowerTags.some(tag => exampleTags.includes(tag));
    });
  }
  
  /**
   * 全文搜索案例
   * 搜索 title 和 description 字段（不区分大小写）
   * @param query - 搜索查询字符串
   * @returns 匹配的案例数组
   */
  search(query: string): ExampleMetadata[] {
    const trimmedQuery = query.trim().toLowerCase();
    
    if (!trimmedQuery) {
      return this.getAll();
    }
    
    return this.getAll().filter(example => {
      const titleMatch = example.title.toLowerCase().includes(trimmedQuery);
      const descMatch = example.description.toLowerCase().includes(trimmedQuery);
      return titleMatch || descMatch;
    });
  }
  
  /**
   * 刷新案例库
   * 从数据源重新加载所有案例
   */
  refresh(): void {
    this.loadExamples();
  }
  
  /**
   * 获取案例数量
   * @returns 案例总数
   */
  get size(): number {
    return this.examples.size;
  }
  
  /**
   * 按来源获取案例
   * @param source - 案例来源（system 或 custom）
   * @returns 该来源的所有案例
   */
  getBySource(source: 'system' | 'custom'): ExampleMetadata[] {
    return this.getAll().filter(example => example.source === source);
  }
  
  /**
   * 检查案例是否存在
   * @param id - 案例 ID
   * @returns 是否存在
   */
  has(id: string): boolean {
    return this.examples.has(id);
  }
  
  /**
   * 获取所有分类及其案例数量
   * @returns 分类到数量的映射
   */
  getCategoryCounts(): Record<ExampleCategory, number> {
    const counts: Record<ExampleCategory, number> = {
      layout: 0,
      form: 0,
      navigation: 0,
      dashboard: 0,
      display: 0,
      feedback: 0,
    };
    
    for (const example of this.getAll()) {
      if (counts[example.category] !== undefined) {
        counts[example.category]++;
      } else {
        counts.display++;
      }
    }
    
    return counts;
  }
  
  /**
   * 获取所有唯一标签
   * @returns 标签数组
   */
  getAllTags(): string[] {
    const tagsSet = new Set<string>();
    
    for (const example of this.getAll()) {
      for (const tag of example.tags) {
        tagsSet.add(tag);
      }
    }
    
    return Array.from(tagsSet).sort();
  }
}

/**
 * 创建默认案例库实例
 * @param registry - 可选的组件注册表
 * @returns 案例库实例
 */
export function createExampleLibrary(registry?: ComponentRegistry): ExampleLibrary {
  return new ExampleLibrary({ registry });
}
