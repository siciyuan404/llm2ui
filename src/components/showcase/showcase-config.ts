/**
 * @file showcase-config.ts
 * @description Showcase 模块的配置文件，包含组件分类、案例分类等配置
 * @module components/showcase/config
 */

import * as React from 'react';
import {
  LayoutGrid,
  Type,
  FormInput,
  Navigation,
  Sparkles,
  MessageSquare,
  BarChart3,
  Layers,
  Package,
  LayoutDashboard,
  Image,
} from 'lucide-react';
import type { ComponentCategoryConfig } from './components-module';

// ============================================================================
// Component Categories
// ============================================================================

/**
 * 默认组件分类配置
 * 按照 Requirements 3.1 定义的分类，使用 lucide-react 图标
 */
export const DEFAULT_COMPONENT_CATEGORIES: ComponentCategoryConfig[] = [
  {
    id: 'layout',
    label: 'Layout',
    icon: React.createElement(LayoutGrid, { className: 'w-4 h-4' }),
    components: ['Row', 'Column', 'List', 'Card', 'Content', 'Container', 'Grid', 'Stack', 'Flex'],
  },
  {
    id: 'text',
    label: 'Text & Media',
    icon: React.createElement(Type, { className: 'w-4 h-4' }),
    components: ['Text', 'Image', 'Icon', 'Video', 'Audio', 'Player', 'Avatar', 'Label', 'Heading'],
  },
  {
    id: 'input',
    label: 'Form & Input',
    icon: React.createElement(FormInput, { className: 'w-4 h-4' }),
    components: ['Input', 'TextField', 'CheckBox', 'Slider', 'DateTimeInput', 'MultipleChoice', 'Textarea', 'Select', 'Switch', 'RadioGroup', 'Form', 'DatePicker', 'TimePicker', 'ColorPicker', 'FileUpload'],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    icon: React.createElement(Navigation, { className: 'w-4 h-4' }),
    components: ['Button', 'Tabs', 'Modal', 'Link', 'Menu', 'Breadcrumb', 'Pagination', 'Stepper', 'Sidebar', 'Navbar', 'Dropdown'],
  },
  {
    id: 'decoration',
    label: 'Decoration',
    icon: React.createElement(Sparkles, { className: 'w-4 h-4' }),
    components: ['Divider', 'Badge', 'Separator', 'Tooltip', 'Tag', 'Chip', 'Progress', 'Skeleton'],
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }),
    components: ['Alert', 'Toast', 'Dialog', 'Popover', 'Notification', 'Spinner', 'Loading', 'Empty', 'Result'],
  },
  {
    id: 'data',
    label: 'Data Display',
    icon: React.createElement(BarChart3, { className: 'w-4 h-4' }),
    components: ['Table', 'DataGrid', 'Chart', 'Statistic', 'Timeline', 'Tree', 'Calendar', 'Carousel'],
  },
  {
    id: 'overlay',
    label: 'Overlay',
    icon: React.createElement(Layers, { className: 'w-4 h-4' }),
    components: ['Sheet', 'Drawer', 'Popconfirm', 'ContextMenu', 'Command', 'HoverCard'],
  },
];

/**
 * 未分类组件的默认配置
 */
export const UNCATEGORIZED_CONFIG = {
  id: 'other',
  label: 'Other',
  icon: React.createElement(Package, { className: 'w-4 h-4' }),
};

// ============================================================================
// Example Categories
// ============================================================================

/**
 * 案例分类配置
 */
export interface ExampleCategoryConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * 默认案例分类配置
 */
export const DEFAULT_EXAMPLE_CATEGORIES: ExampleCategoryConfig[] = [
  { id: 'layout', label: 'Layout', icon: React.createElement(LayoutGrid, { className: 'w-4 h-4' }) },
  { id: 'form', label: 'Form', icon: React.createElement(FormInput, { className: 'w-4 h-4' }) },
  { id: 'navigation', label: 'Navigation', icon: React.createElement(Navigation, { className: 'w-4 h-4' }) },
  { id: 'dashboard', label: 'Dashboard', icon: React.createElement(LayoutDashboard, { className: 'w-4 h-4' }) },
  { id: 'display', label: 'Display', icon: React.createElement(Image, { className: 'w-4 h-4' }) },
  { id: 'feedback', label: 'Feedback', icon: React.createElement(MessageSquare, { className: 'w-4 h-4' }) },
];

// ============================================================================
// Screen Size Config
// ============================================================================

/**
 * 屏幕尺寸配置（已移至 ScreenSizeSwitcher.tsx）
 * @see ScreenSizeSwitcher
 */

// ============================================================================
// Token Category Colors
// ============================================================================

/**
 * Token 类别徽章颜色映射
 */
export const TOKEN_CATEGORY_COLORS: Record<string, string> = {
  colors: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  spacing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  typography: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  shadows: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  radius: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

/**
 * 类型徽章颜色映射
 */
export const TYPE_BADGE_COLORS: Record<string, string> = {
  string: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  number: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  boolean: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  object: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  array: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  function: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
};
