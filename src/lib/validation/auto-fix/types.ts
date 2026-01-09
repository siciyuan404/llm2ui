/**
 * @file types.ts
 * @description 自动修复模块类型定义
 * @module lib/validation/auto-fix/types
 */

import type { UISchema, UIComponent } from '@/types/ui-schema';

// ============================================================================
// Icon Fixer 类型
// ============================================================================

/**
 * Icon 修复置信度
 */
export type FixConfidence = 'high' | 'medium' | 'low';

/**
 * Icon 修复变更
 */
export interface IconFixChange {
  /** 变更路径 */
  path: string;
  /** 原始 emoji */
  emoji: string;
  /** 替换的组件 */
  replacement: UIComponent;
  /** 置信度 */
  confidence: FixConfidence;
  /** 变更描述 */
  description: string;
}

/**
 * Icon 修复结果
 */
export interface IconFixResult {
  /** 修复后的 Schema */
  fixed: UISchema;
  /** 修复变更列表 */
  changes: IconFixChange[];
  /** 是否有无法修复的 emoji */
  hasUnmapped: boolean;
  /** 无法映射的 emoji 列表 */
  unmappedEmojis: string[];
}

// ============================================================================
// Schema Fixer 类型
// ============================================================================

/**
 * Schema 修复类型
 */
export type SchemaFixType = 
  | 'add_version'
  | 'add_id'
  | 'fix_type'
  | 'fix_enum'
  | 'fix_prop_type'
  | 'remove_invalid';

/**
 * Schema 修复变更
 */
export interface SchemaFixChange {
  /** 修复类型 */
  type: SchemaFixType;
  /** 变更路径 */
  path: string;
  /** 原始值 */
  oldValue?: unknown;
  /** 新值 */
  newValue: unknown;
  /** 置信度 */
  confidence: FixConfidence;
  /** 变更描述 */
  description: string;
}

/**
 * Schema 错误（无法修复）
 */
export interface SchemaError {
  /** 错误路径 */
  path: string;
  /** 错误消息 */
  message: string;
  /** 原因 */
  reason: string;
}

/**
 * Schema 修复结果
 */
export interface SchemaFixResult {
  /** 修复后的 Schema */
  fixed: UISchema;
  /** 修复变更列表 */
  changes: SchemaFixChange[];
  /** 无法修复的错误 */
  unfixable: SchemaError[];
}

// ============================================================================
// 通用类型
// ============================================================================

/**
 * 修复器选项
 */
export interface FixerOptions {
  /** 是否启用自动修复 */
  enabled?: boolean;
  /** 最小置信度阈值 */
  minConfidence?: FixConfidence;
  /** 是否记录变更 */
  logChanges?: boolean;
}
