/**
 * @file 案例集合模块
 * @description 按功能领域组织的案例分组，提供工厂函数创建各类案例集合
 * @module lib/examples/example-collections
 */

import type { Example, ExampleCategory } from '../../types/example.types';
import type { ExampleCollection } from './example-registry';
// PRESET_EXAMPLES 从 shadcn 主题目录导入
import { PRESET_EXAMPLES } from '../themes/builtin/shadcn/examples/presets';
// Cherry 案例从主题目录导入
import { 
  CHERRY_PATTERN_EXAMPLES, 
  CHERRY_EXTENDED_EXAMPLES 
} from '../themes/builtin/cherry/examples';

/**
 * 从现有案例中筛选指定分类的案例
 */
function filterByCategory(
  examples: Example[],
  category: ExampleCategory
): Example[] {
  return examples.filter(e => e.category === category);
}

/**
 * 从现有案例中筛选包含指定标签的案例
 */
function filterByTags(
  examples: Example[],
  tags: string[]
): Example[] {
  return examples.filter(e => 
    tags.some(tag => e.tags.includes(tag))
  );
}

/**
 * 获取所有预设案例（包括 shadcn-ui 和 Cherry Studio 风格）
 * 
 * 注意：此函数用于内部按分类/标签筛选案例
 * - PRESET_EXAMPLES: shadcn-ui 风格案例
 * - CHERRY_PATTERN_EXAMPLES + CHERRY_EXTENDED_EXAMPLES: Cherry Studio 风格案例
 */
function getAllPresetExamples(): Example[] {
  return [
    ...PRESET_EXAMPLES,
    ...CHERRY_PATTERN_EXAMPLES,
    ...CHERRY_EXTENDED_EXAMPLES,
  ] as Example[];
}

/**
 * 创建布局类案例集合
 * 包含侧边栏、页面布局、响应式布局等案例
 */
export function createLayoutCollection(): ExampleCollection {
  const allExamples = getAllPresetExamples();
  const layoutExamples = filterByCategory(allExamples, 'layout');
  
  return {
    name: 'Layout Collection',
    description: '布局类案例集合，包含侧边栏、页面布局、响应式布局、三栏布局等',
    examples: layoutExamples,
  };
}

/**
 * 创建表单类案例集合
 * 包含登录表单、注册表单、设置表单等案例
 */
export function createFormCollection(): ExampleCollection {
  const allExamples = getAllPresetExamples();
  const formExamples = filterByCategory(allExamples, 'form');
  
  return {
    name: 'Form Collection',
    description: '表单类案例集合，包含登录表单、注册表单、设置表单、搜索表单等',
    examples: formExamples,
  };
}

/**
 * 创建聊天类案例集合
 * 包含消息列表、输入栏、对话历史等案例
 */
export function createChatCollection(): ExampleCollection {
  const allExamples = getAllPresetExamples();
  // 聊天类案例可能在 display 或 layout 分类中，通过标签筛选
  const chatExamples = filterByTags(allExamples, [
    'chat', 'message', 'conversation', 'input-bar', 'message-list'
  ]);
  
  return {
    name: 'Chat Collection',
    description: '聊天类案例集合，包含消息列表、输入栏、对话历史、消息操作等',
    examples: chatExamples,
  };
}

/**
 * 创建设置类案例集合
 * 包含设置面板、配置表单、偏好设置等案例
 */
export function createSettingsCollection(): ExampleCollection {
  const allExamples = getAllPresetExamples();
  // 设置类案例通过标签筛选
  const settingsExamples = filterByTags(allExamples, [
    'settings', 'config', 'preferences', 'options', 'llm-settings'
  ]);
  
  return {
    name: 'Settings Collection',
    description: '设置类案例集合，包含设置面板、配置表单、偏好设置、快捷键设置等',
    examples: settingsExamples,
  };
}


/**
 * 创建仪表盘类案例集合
 * 包含数据展示、图表、统计卡片等案例
 */
export function createDashboardCollection(): ExampleCollection {
  const allExamples = getAllPresetExamples();
  const dashboardExamples = filterByCategory(allExamples, 'dashboard');
  
  return {
    name: 'Dashboard Collection',
    description: '仪表盘类案例集合，包含数据展示、图表、统计卡片、监控面板等',
    examples: dashboardExamples,
  };
}

/**
 * 创建导航类案例集合
 * 包含导航栏、菜单、面包屑等案例
 */
export function createNavigationCollection(): ExampleCollection {
  const allExamples = getAllPresetExamples();
  const navigationExamples = filterByCategory(allExamples, 'navigation');
  
  return {
    name: 'Navigation Collection',
    description: '导航类案例集合，包含导航栏、菜单、面包屑、标签页等',
    examples: navigationExamples,
  };
}

/**
 * 创建展示类案例集合
 * 包含卡片、列表、表格等案例
 */
export function createDisplayCollection(): ExampleCollection {
  const allExamples = getAllPresetExamples();
  const displayExamples = filterByCategory(allExamples, 'display');
  
  return {
    name: 'Display Collection',
    description: '展示类案例集合，包含卡片、列表、表格、详情页等',
    examples: displayExamples,
  };
}

/**
 * 创建反馈类案例集合
 * 包含提示、对话框、通知等案例
 */
export function createFeedbackCollection(): ExampleCollection {
  const allExamples = getAllPresetExamples();
  const feedbackExamples = filterByCategory(allExamples, 'feedback');
  
  return {
    name: 'Feedback Collection',
    description: '反馈类案例集合，包含提示、对话框、通知、加载状态等',
    examples: feedbackExamples,
  };
}

/**
 * 创建 Cherry Studio 风格案例集合
 * 包含所有 Cherry Studio 风格的案例
 */
export function createCherryCollection(): ExampleCollection {
  return {
    name: 'Cherry Studio Collection',
    description: 'Cherry Studio 风格案例集合，包含聊天界面、侧边栏、设置面板等高保真案例',
    examples: [...CHERRY_PATTERN_EXAMPLES, ...CHERRY_EXTENDED_EXAMPLES] as Example[],
  };
}

/**
 * 获取所有案例集合
 */
export function getAllCollections(): ExampleCollection[] {
  return [
    createLayoutCollection(),
    createFormCollection(),
    createChatCollection(),
    createSettingsCollection(),
    createDashboardCollection(),
    createNavigationCollection(),
    createDisplayCollection(),
    createFeedbackCollection(),
    createCherryCollection(),
  ];
}

/**
 * 根据名称获取案例集合
 */
export function getCollectionByName(name: string): ExampleCollection | undefined {
  const collections = getAllCollections();
  return collections.find(c => c.name === name);
}

/**
 * 注册所有预设案例到注册中心
 */
export async function registerAllPresetExamples(): Promise<void> {
  // 动态导入避免循环依赖
  const { ExampleRegistry } = await import('./example-registry');
  const registry = ExampleRegistry.getInstance();
  
  const allExamples = getAllPresetExamples();
  for (const example of allExamples) {
    try {
      if (!registry.has(example.id)) {
        registry.register(example);
      }
    } catch (error) {
      // 忽略验证失败的案例，记录警告
      console.warn(`Failed to register example ${example.id}:`, error);
    }
  }
}
