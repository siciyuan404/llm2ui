/**
 * @file index.ts
 * @description shadcn-ui 主题的案例配置（自包含）
 * @module lib/themes/builtin/shadcn/examples
 * @requirements 1.1, 1.2, 1.3, 1.4, 5.2
 */

import type { ThemeExamples, ExampleMetadata } from '../../../types';
import { PRESET_EXAMPLES } from './presets';

// 重新导出类型
export type { ExampleMetadata } from './presets';

/**
 * 转换预设案例为主题案例格式
 */
function convertToThemeExamples(): ExampleMetadata[] {
  return PRESET_EXAMPLES.map(example => ({
    id: example.id,
    name: example.title,
    description: example.description,
    category: example.category,
    tags: example.tags,
    tokenCount: estimateTokenCount(example.schema),
    schema: example.schema,
  }));
}

/**
 * 估算案例的 Token 数量
 */
function estimateTokenCount(schema: unknown): number {
  const jsonStr = JSON.stringify(schema);
  // 粗略估算：每 4 个字符约 1 个 token
  return Math.ceil(jsonStr.length / 4);
}

/**
 * shadcn-ui 主题的案例元数据
 */
export const shadcnExamplePresets: ExampleMetadata[] = convertToThemeExamples();

/**
 * shadcn-ui 主题的案例配置
 */
export const shadcnExamples: ThemeExamples = {
  presets: shadcnExamplePresets,
  categories: [
    {
      id: 'layout',
      name: '布局',
      description: '页面布局和结构案例',
    },
    {
      id: 'form',
      name: '表单',
      description: '表单和输入案例',
    },
    {
      id: 'navigation',
      name: '导航',
      description: '导航和菜单案例',
    },
    {
      id: 'dashboard',
      name: '仪表盘',
      description: '数据展示和仪表盘案例',
    },
    {
      id: 'display',
      name: '展示',
      description: '数据展示组件案例',
    },
  ],
  keywordMappings: [
    {
      keywords: ['sidebar', '侧边栏', '导航栏'],
      exampleIds: ['system-layout-admin-sidebar', 'system-layout-three-column'],
    },
    {
      keywords: ['header', '顶部', '导航'],
      exampleIds: ['system-layout-top-navbar', 'system-layout-pc-web-header'],
    },
    {
      keywords: ['login', '登录', '表单'],
      exampleIds: ['system-form-login', 'system-form-register'],
    },
    {
      keywords: ['search', '搜索'],
      exampleIds: ['system-form-search'],
    },
    {
      keywords: ['settings', '设置', '配置'],
      exampleIds: ['system-form-settings'],
    },
    {
      keywords: ['dashboard', '仪表盘', '数据'],
      exampleIds: ['system-dashboard-data-cards', 'system-dashboard-stats-panel', 'system-dashboard-list-page'],
    },
    {
      keywords: ['table', '表格', '列表'],
      exampleIds: ['system-dashboard-list-page'],
    },
    {
      keywords: ['card', '卡片'],
      exampleIds: ['system-dashboard-data-cards'],
    },
    {
      keywords: ['breadcrumb', '面包屑'],
      exampleIds: ['system-navigation-breadcrumb'],
    },
    {
      keywords: ['tabs', '标签页'],
      exampleIds: ['system-navigation-tabs'],
    },
    {
      keywords: ['steps', '步骤', '向导'],
      exampleIds: ['system-navigation-steps'],
    },
    {
      keywords: ['responsive', '响应式', '自适应'],
      exampleIds: ['system-layout-responsive-container'],
    },
  ],
};

/**
 * 获取 shadcn-ui 主题的所有案例 ID
 */
export function getShadcnExampleIds(): string[] {
  return shadcnExamplePresets.map(example => example.id);
}

/**
 * 根据 ID 获取案例
 */
export function getShadcnExampleById(id: string): ExampleMetadata | undefined {
  return shadcnExamplePresets.find(example => example.id === id);
}

/**
 * 根据分类获取案例
 */
export function getShadcnExamplesByCategory(category: string): ExampleMetadata[] {
  return shadcnExamplePresets.filter(example => example.category === category);
}

/**
 * 根据关键词获取相关案例
 */
export function getShadcnExamplesByKeyword(keyword: string): ExampleMetadata[] {
  const lowerKeyword = keyword.toLowerCase();
  const matchingIds = new Set<string>();

  // 从关键词映射中查找
  for (const mapping of shadcnExamples.keywordMappings || []) {
    if (mapping.keywords.some(k => k.toLowerCase().includes(lowerKeyword))) {
      mapping.exampleIds.forEach(id => matchingIds.add(id));
    }
  }

  // 从标签中查找
  for (const example of shadcnExamplePresets) {
    if (example.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))) {
      matchingIds.add(example.id);
    }
  }

  return shadcnExamplePresets.filter(example => matchingIds.has(example.id));
}
