/**
 * @file example-tags.ts
 * @description 案例标签体系模块，定义标准分类和标签，提供验证和查询功能
 * @module lib/examples/example-tags
 * @requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

/**
 * 标准案例分类类型
 * 
 * - layout: 布局类组件（侧边栏、导航栏、容器等）
 * - form: 表单类组件（登录、注册、搜索等）
 * - navigation: 导航类组件（面包屑、标签页、步骤等）
 * - dashboard: 仪表盘类组件（数据卡片、统计面板等）
 * - display: 展示类组件（列表、表格、卡片等）
 * - feedback: 反馈类组件（提示、对话框、加载等）
 */
export type ExampleCategory =
  | 'layout'
  | 'form'
  | 'navigation'
  | 'dashboard'
  | 'display'
  | 'feedback';

/**
 * 标准分类列表
 */
const STANDARD_CATEGORIES: ExampleCategory[] = [
  'layout',
  'form',
  'navigation',
  'dashboard',
  'display',
  'feedback',
];

/**
 * 标准标签列表
 * 
 * 包含以下类别的标签：
 * - 布局相关: sidebar, header, footer, navbar, responsive
 * - 组件相关: card, table, list, modal, drawer, carousel
 * - 导航相关: breadcrumb, tabs, steps
 * - 功能相关: search, login, register, settings, profile
 * - 场景相关: admin, mobile
 */
export const STANDARD_TAGS = [
  // 布局相关
  'sidebar',
  'header',
  'footer',
  'navbar',
  'responsive',
  // 组件相关
  'card',
  'table',
  'list',
  'modal',
  'drawer',
  'carousel',
  // 导航相关
  'breadcrumb',
  'tabs',
  'steps',
  // 功能相关
  'search',
  'login',
  'register',
  'settings',
  'profile',
  // 场景相关
  'admin',
  'mobile',
] as const;

/**
 * 标准标签类型
 */
export type StandardTag = (typeof STANDARD_TAGS)[number];

/**
 * 分类验证结果接口
 */
export interface CategoryValidationResult {
  /** 是否有效（允许自定义分类，但会给出警告） */
  valid: boolean;
  /** 警告信息（当使用非标准分类时） */
  warning?: string;
}

/**
 * 获取所有标准分类
 * @returns 标准分类数组
 */
export function getStandardCategories(): ExampleCategory[] {
  return [...STANDARD_CATEGORIES];
}

/**
 * 获取所有标准标签
 * @returns 标准标签数组
 */
export function getStandardTags(): string[] {
  return [...STANDARD_TAGS];
}

/**
 * 检查是否为标准分类
 * @param category 要检查的分类
 * @returns 是否为标准分类
 */
export function isStandardCategory(category: string): category is ExampleCategory {
  return STANDARD_CATEGORIES.includes(category as ExampleCategory);
}

/**
 * 检查是否为标准标签
 * @param tag 要检查的标签
 * @returns 是否为标准标签
 */
export function isStandardTag(tag: string): tag is StandardTag {
  return (STANDARD_TAGS as readonly string[]).includes(tag);
}

/**
 * 验证分类
 * 
 * 根据 Property 14 的要求：
 * - 如果是标准分类，返回 valid: true，无警告
 * - 如果不是标准分类，返回 valid: true，但附带警告信息
 * - 允许自定义分类，但建议使用标准分类
 * 
 * @param category 要验证的分类
 * @returns 验证结果，包含 valid 和可选的 warning
 */
export function validateCategory(category: string): CategoryValidationResult {
  if (isStandardCategory(category)) {
    return { valid: true };
  }
  
  return {
    valid: true,
    warning: `"${category}" 不是标准分类。建议使用以下标准分类之一: ${STANDARD_CATEGORIES.join(', ')}`,
  };
}

/**
 * 获取分类的中文名称
 * @param category 分类
 * @returns 中文名称
 */
export function getCategoryLabel(category: ExampleCategory): string {
  const labels: Record<ExampleCategory, string> = {
    layout: '布局',
    form: '表单',
    navigation: '导航',
    dashboard: '仪表盘',
    display: '展示',
    feedback: '反馈',
  };
  return labels[category] || category;
}

/**
 * 获取分类的英文描述
 * @param category 分类
 * @returns 英文描述
 */
export function getCategoryDescription(category: ExampleCategory): string {
  const descriptions: Record<ExampleCategory, string> = {
    layout: 'Layout components like sidebars, headers, and containers',
    form: 'Form components like login, registration, and search forms',
    navigation: 'Navigation components like breadcrumbs, tabs, and steps',
    dashboard: 'Dashboard components like data cards and statistics panels',
    display: 'Display components like lists, tables, and cards',
    feedback: 'Feedback components like alerts, dialogs, and loaders',
  };
  return descriptions[category] || category;
}
