/**
 * @file types.ts
 * @description Cherry 主题案例类型定义
 * @module lib/themes/builtin/cherry/examples/types
 */

import type { UISchema } from '../../../../types';

/**
 * 案例分类
 */
export type ExampleCategory = 
  | 'primitive'
  | 'layout'
  | 'form'
  | 'navigation'
  | 'display'
  | 'chat';

/**
 * 案例元数据接口
 */
export interface ExampleMetadata {
  /** 唯一标识符 */
  id: string;
  /** 案例标题 */
  title: string;
  /** 案例描述 */
  description: string;
  /** 案例分类 */
  category: ExampleCategory;
  /** 案例标签 */
  tags: string[];
  /** UI Schema */
  schema: UISchema;
  /** 来源：system（系统预设）或 custom（用户自定义） */
  source: 'system' | 'custom';
  /** 关联的组件名称（可选） */
  componentName?: string;
}
