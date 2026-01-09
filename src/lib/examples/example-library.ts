/**
 * @file example-library.ts
 * @description 案例库模块，统一管理所有 UI 案例，包括系统预设案例、用户自定义案例和组件注册表中的案例
 * @module lib/examples/example-library
 * @requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.2, 5.3
 * 
 * 支持多主题系统：当 ThemeManager 可用时，使用当前主题的案例集合；
 * 否则回退到默认预设案例以保持向后兼容。
 */

import type { ExampleCategory } from './example-tags';
// ExampleMetadata 和 PRESET_EXAMPLES 从 shadcn 主题目录导入
import type { ExampleMetadata } from '../themes/builtin/shadcn/examples/presets';
import { PRESET_EXAMPLES } from '../themes/builtin/shadcn/examples/presets';
import { getAllExamples as getCustomExamples, type CustomExample } from './custom-examples-storage';
import { type ComponentRegistry, type ComponentDefinition, type ComponentExample } from '../core/component-registry';
import type { ExampleMetadata as ThemeExampleMetadata } from '../themes/types';

// Re-export ExampleMetadata for convenience
export type { ExampleMetadata } from '../themes/builtin/shadcn/examples/presets';

// 缓存 ThemeManager 类引用
let ThemeManagerClass: typeof import('../themes/theme-manager').ThemeManager | null = null;

/**
 * 设置 ThemeManager 类引用（用于延迟初始化）
 */
export function setExampleLibraryThemeManager(cls: typeof import('../themes/theme-manager').ThemeManager): void {
  ThemeManagerClass = cls;
}

/**
 * 获取 ThemeManager 类（如果已设置）
 */
function getThemeManagerClass(): typeof import('../themes/theme-manager').ThemeManager | null {
  return ThemeManagerClass;
}

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
  /** 是否使用 ThemeManager 获取案例，默认 true */
  useThemeManager?: boolean;
}

/**
 * 将 CustomExample 转换为 ExampleMetadata
 */
function convertCustomExampleToMetadata(customExample: CustomExample): ExampleMetadata {
  return {
    id: customExample.id,
    title: customExample.title,
    description: customExample.description,
    category: inferCategoryFromComponentName(customExample.componentName),
    tags: inferTagsFromCustomExample(customExample),
    schema: customExample.schema,
    source: 'custom',
    componentName: customExample.componentName,
  };
}

/**
 * 根据组件名称推断分类
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
 */
function inferTagsFromCustomExample(customExample: CustomExample): string[] {
  const tags: string[] = [];
  const lowerTitle = customExample.title.toLowerCase();
  const lowerDesc = customExample.description.toLowerCase();
  const lowerComponent = customExample.componentName.toLowerCase();
  
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
 * 支持多主题系统：当 useThemeManager 为 true 且 ThemeManager 有注册主题时，
 * 会从当前激活主题获取案例；否则回退到默认预设案例。
 */
export class ExampleLibrary {
  private examples: Map<string, ExampleMetadata> = new Map();
  private options: Required<ExampleLibraryOptions>;
  private useThemeManager: boolean;
  
  constructor(options: ExampleLibraryOptions = {}) {
    this.useThemeManager = options.useThemeManager ?? true;
    this.options = {
      registry: options.registry as ComponentRegistry,
      includePresets: options.includePresets ?? true,
      includeCustom: options.includeCustom ?? true,
      includeRegistryExamples: options.includeRegistryExamples ?? true,
      useThemeManager: this.useThemeManager,
    };
    
    this.loadExamples();
  }
  
  /**
   * 从 ThemeManager 获取当前主题的案例
   */
  private getThemeExamples(): ExampleMetadata[] {
    if (!this.useThemeManager) {
      return [];
    }
    
    try {
      const ThemeManager = getThemeManagerClass();
      if (!ThemeManager) {
        return [];
      }
      
      const themeManager = ThemeManager.getInstance();
      if (themeManager.getThemeCount() > 0) {
        const theme = themeManager.getActiveTheme();
        const themeExamples = theme.examples.presets;
        
        // 转换 ThemeExampleMetadata 为 ExampleMetadata
        return themeExamples.map((ex: ThemeExampleMetadata) => ({
          id: ex.id,
          title: ex.name,
          description: ex.description,
          category: this.mapThemeCategoryToExampleCategory(ex.category),
          tags: ex.tags,
          schema: ex.schema as ExampleMetadata['schema'],
          source: 'system' as const,
          componentName: undefined,
        }));
      }
    } catch {
      // ThemeManager 未初始化或没有主题，回退到默认案例
    }
    
    return [];
  }
  
  /**
   * 将主题案例分类映射到案例分类
   */
  private mapThemeCategoryToExampleCategory(category: string): ExampleCategory {
    const mapping: Record<string, ExampleCategory> = {
      layout: 'layout',
      form: 'form',
      navigation: 'navigation',
      dashboard: 'dashboard',
      display: 'display',
      feedback: 'feedback',
      chat: 'display',
    };
    
    return mapping[category] || 'display';
  }
  
  /**
   * 设置是否使用 ThemeManager
   */
  setUseThemeManager(use: boolean): void {
    this.useThemeManager = use;
    this.options.useThemeManager = use;
    this.loadExamples();
  }
  
  private loadExamples(): void {
    this.examples.clear();
    
    // 优先从 ThemeManager 获取案例
    const themeExamples = this.getThemeExamples();
    if (themeExamples.length > 0) {
      for (const example of themeExamples) {
        this.examples.set(example.id, example);
      }
    } else if (this.options.includePresets) {
      // 回退到默认预设案例
      for (const example of PRESET_EXAMPLES) {
        this.examples.set(example.id, example);
      }
    }
    
    if (this.options.includeCustom) {
      try {
        const customExamples = getCustomExamples();
        for (const customExample of customExamples) {
          const metadata = convertCustomExampleToMetadata(customExample);
          this.examples.set(metadata.id, metadata);
        }
      } catch {
        console.warn('Failed to load custom examples from localStorage');
      }
    }
    
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
  
  getAll(): ExampleMetadata[] {
    return Array.from(this.examples.values());
  }
  
  getById(id: string): ExampleMetadata | undefined {
    return this.examples.get(id);
  }
  
  getByCategory(category: ExampleCategory): ExampleMetadata[] {
    return this.getAll().filter(example => example.category === category);
  }
  
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
        result.display.push(example);
      }
    }
    
    return result;
  }
  
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
  
  refresh(): void {
    this.loadExamples();
  }
  
  get size(): number {
    return this.examples.size;
  }
  
  getBySource(source: 'system' | 'custom'): ExampleMetadata[] {
    return this.getAll().filter(example => example.source === source);
  }
  
  has(id: string): boolean {
    return this.examples.has(id);
  }
  
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
 */
export function createExampleLibrary(registry?: ComponentRegistry): ExampleLibrary {
  return new ExampleLibrary({ registry });
}

/**
 * 创建使用当前主题的案例库
 * 这是推荐的方式，会自动使用 ThemeManager 中的当前主题案例
 */
export function createThemedExampleLibrary(): ExampleLibrary {
  return new ExampleLibrary({ useThemeManager: true });
}

/**
 * 创建不使用 ThemeManager 的案例库（使用默认预设案例）
 */
export function createStaticExampleLibrary(registry?: ComponentRegistry): ExampleLibrary {
  return new ExampleLibrary({ registry, useThemeManager: false });
}
