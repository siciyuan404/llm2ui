/**
 * @file example.types.ts
 * @description 案例系统类型定义，包括案例、分类、标签和搜索结果类型
 * @module types/example
 * @requirements 5.1, 5.3
 */

import type { UISchema } from './ui-schema';

/**
 * 案例分类类型
 */
export type ExampleCategory = 
  | 'layout'      // 布局类
  | 'form'        // 表单类
  | 'navigation'  // 导航类
  | 'dashboard'   // 仪表盘类
  | 'display'     // 展示类
  | 'feedback';   // 反馈类

/**
 * 案例标签类型
 * 用于更细粒度的案例分类和检索
 */
export type ExampleTag = string;

/**
 * 案例来源类型
 */
export type ExampleSource = 'system' | 'custom';

/**
 * 案例元数据接口
 */
export interface Example {
  /** 案例唯一标识 */
  id: string;
  /** 案例标题 */
  title: string;
  /** 案例描述 */
  description: string;
  /** 案例分类 */
  category: ExampleCategory;
  /** 案例标签 */
  tags: ExampleTag[];
  /** UI Schema 定义 */
  schema: UISchema;
  /** 案例来源 */
  source: ExampleSource;
  /** 关联的组件名称 */
  componentName?: string;
  /** 缩略图 URL */
  thumbnail?: string;
  /** 创建时间戳 */
  createdAt?: number;
  /** 更新时间戳 */
  updatedAt?: number;
}

/**
 * 案例搜索结果
 */
export interface ExampleSearchResult {
  /** 匹配的案例 */
  example: Example;
  /** 相关性得分 (0-1) */
  score: number;
  /** 匹配的关键词 */
  matchedKeywords: string[];
}

/**
 * 案例筛选选项
 */
export interface ExampleFilterOptions {
  /** 按分类筛选 */
  category?: ExampleCategory;
  /** 按标签筛选 */
  tags?: ExampleTag[];
  /** 按来源筛选 */
  source?: ExampleSource;
  /** 搜索关键词 */
  query?: string;
}

/**
 * 案例库统计信息
 */
export interface ExampleLibraryStats {
  /** 总案例数 */
  total: number;
  /** 按分类统计 */
  byCategory: Record<ExampleCategory, number>;
  /** 按来源统计 */
  bySource: Record<ExampleSource, number>;
  /** 所有标签 */
  allTags: ExampleTag[];
}
