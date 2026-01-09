/**
 * @file schema-fixer.ts
 * @description Schema 自动修复器，修复常见的 Schema 错误
 * @module lib/validation/auto-fix/schema-fixer
 * @requirements REQ-5.1, REQ-5.2, REQ-5.3, REQ-5.4, REQ-5.5, REQ-5.6
 */

import type { UISchema, UIComponent } from '@/types/ui-schema';
import type { SchemaFixResult, SchemaFixChange, SchemaError, FixConfidence } from './types';
import { defaultCatalog } from '../../core/component-catalog';

// ============================================================================
// 常量
// ============================================================================

/** 默认 Schema 版本 */
const DEFAULT_VERSION = '1.0';

/** Levenshtein 距离阈值 */
const LEVENSHTEIN_THRESHOLD_HIGH = 0.8;
const LEVENSHTEIN_THRESHOLD_MEDIUM = 0.6;

/** 生成唯一 ID 的计数器 */
let idCounter = 0;

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 计算 Levenshtein 距离
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * 计算相似度（0-1）
 */
function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * 获取置信度
 */
function getConfidence(similarity: number): FixConfidence {
  if (similarity >= LEVENSHTEIN_THRESHOLD_HIGH) return 'high';
  if (similarity >= LEVENSHTEIN_THRESHOLD_MEDIUM) return 'medium';
  return 'low';
}

/**
 * 生成唯一组件 ID
 */
function generateId(type: string, index: number): string {
  return `${type.toLowerCase()}-${index}-${++idCounter}`;
}

/**
 * 深拷贝对象
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 查找最相似的组件类型
 */
function findClosestComponentType(type: string): { type: string; similarity: number } | null {
  const validTypes = defaultCatalog.getValidTypes();
  let bestMatch: { type: string; similarity: number } | null = null;

  for (const validType of validTypes) {
    const similarity = calculateSimilarity(type, validType);
    if (similarity >= LEVENSHTEIN_THRESHOLD_MEDIUM) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { type: validType, similarity };
      }
    }
  }

  return bestMatch;
}

/**
 * 查找最相似的枚举值
 */
function findClosestEnumValue(
  value: string,
  validValues: string[]
): { value: string; similarity: number } | null {
  let bestMatch: { value: string; similarity: number } | null = null;

  for (const validValue of validValues) {
    const similarity = calculateSimilarity(value, validValue);
    if (similarity >= LEVENSHTEIN_THRESHOLD_MEDIUM) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { value: validValue, similarity };
      }
    }
  }

  return bestMatch;
}

// ============================================================================
// Schema Fixer 类
// ============================================================================

/**
 * Schema 修复器
 */
export class SchemaFixer {
  private changes: SchemaFixChange[] = [];
  private unfixable: SchemaError[] = [];
  private componentIndex = 0;

  /**
   * 检查 Schema 是否可以修复
   */
  canFix(schema: unknown): boolean {
    if (!schema || typeof schema !== 'object') {
      return false;
    }

    const obj = schema as Record<string, unknown>;

    // 检查是否有可修复的问题
    if (!('version' in obj)) return true;
    if (!('root' in obj)) return false;

    return this.hasFixableIssues(obj.root);
  }

  /**
   * 修复 Schema
   */
  fix(schema: unknown): SchemaFixResult {
    // 重置状态
    this.changes = [];
    this.unfixable = [];
    this.componentIndex = 0;

    if (!schema || typeof schema !== 'object') {
      return {
        fixed: { version: DEFAULT_VERSION, root: { type: 'Container', id: 'root', props: {} } },
        changes: [],
        unfixable: [{ path: '', message: 'Invalid schema', reason: 'Schema is not an object' }],
      };
    }

    // 深拷贝 Schema
    const fixed = deepClone(schema) as Record<string, unknown>;

    // 修复 version
    if (!('version' in fixed) || typeof fixed.version !== 'string') {
      const oldValue = fixed.version;
      fixed.version = DEFAULT_VERSION;
      this.changes.push({
        type: 'add_version',
        path: 'version',
        oldValue,
        newValue: DEFAULT_VERSION,
        confidence: 'high',
        description: `添加缺失的 version 字段，设置为 "${DEFAULT_VERSION}"`,
      });
    }

    // 修复 root
    if ('root' in fixed && fixed.root && typeof fixed.root === 'object') {
      fixed.root = this.fixComponent(fixed.root as Record<string, unknown>, 'root');
    } else {
      // 创建默认 root
      fixed.root = { type: 'Container', id: 'root', props: {} };
      this.changes.push({
        type: 'add_id',
        path: 'root',
        oldValue: undefined,
        newValue: fixed.root,
        confidence: 'high',
        description: '创建默认 root 组件',
      });
    }

    return {
      fixed: fixed as UISchema,
      changes: this.changes,
      unfixable: this.unfixable,
    };
  }

  /**
   * 检查组件是否有可修复的问题
   */
  private hasFixableIssues(component: unknown): boolean {
    if (!component || typeof component !== 'object') return false;

    const obj = component as Record<string, unknown>;

    // 检查 id
    if (!('id' in obj)) return true;

    // 检查 type
    if ('type' in obj && typeof obj.type === 'string') {
      if (!defaultCatalog.isValidType(obj.type)) {
        const closest = findClosestComponentType(obj.type);
        if (closest) return true;
      }
    }

    // 递归检查 children
    if ('children' in obj && Array.isArray(obj.children)) {
      for (const child of obj.children) {
        if (typeof child === 'object' && child !== null) {
          if (this.hasFixableIssues(child)) return true;
        }
      }
    }

    return false;
  }

  /**
   * 修复单个组件
   */
  private fixComponent(component: Record<string, unknown>, path: string): UIComponent {
    const fixed: Record<string, unknown> = { ...component };
    this.componentIndex++;

    // 修复 type
    if ('type' in fixed && typeof fixed.type === 'string') {
      if (!defaultCatalog.isValidType(fixed.type)) {
        const closest = findClosestComponentType(fixed.type);
        if (closest) {
          const oldType = fixed.type;
          fixed.type = closest.type;
          this.changes.push({
            type: 'fix_type',
            path: `${path}.type`,
            oldValue: oldType,
            newValue: closest.type,
            confidence: getConfidence(closest.similarity),
            description: `将无效组件类型 "${oldType}" 修复为 "${closest.type}" (相似度: ${(closest.similarity * 100).toFixed(0)}%)`,
          });
        } else {
          this.unfixable.push({
            path: `${path}.type`,
            message: `无法识别的组件类型 "${fixed.type}"`,
            reason: '没有找到相似的有效组件类型',
          });
        }
      }
    }

    // 修复 id
    if (!('id' in fixed) || typeof fixed.id !== 'string' || !fixed.id) {
      const type = typeof fixed.type === 'string' ? fixed.type : 'component';
      const newId = generateId(type, this.componentIndex);
      fixed.id = newId;
      this.changes.push({
        type: 'add_id',
        path: `${path}.id`,
        oldValue: fixed.id,
        newValue: newId,
        confidence: 'high',
        description: `为组件添加缺失的 id: "${newId}"`,
      });
    }

    // 确保 props 存在
    if (!('props' in fixed) || typeof fixed.props !== 'object' || fixed.props === null) {
      fixed.props = {};
    }

    // 修复 props 中的枚举值
    if (fixed.type && typeof fixed.type === 'string') {
      const propsSchema = defaultCatalog.getPropsSchema(fixed.type as string);
      if (propsSchema && fixed.props && typeof fixed.props === 'object') {
        fixed.props = this.fixProps(
          fixed.props as Record<string, unknown>,
          propsSchema,
          `${path}.props`
        );
      }
    }

    // 递归修复 children
    if ('children' in fixed && Array.isArray(fixed.children)) {
      fixed.children = fixed.children.map((child, index) => {
        if (typeof child === 'object' && child !== null) {
          return this.fixComponent(child as Record<string, unknown>, `${path}.children[${index}]`);
        }
        return child;
      });
    }

    return fixed as UIComponent;
  }

  /**
   * 修复 props 中的枚举值
   */
  private fixProps(
    props: Record<string, unknown>,
    propsSchema: Record<string, { type: string; enum?: string[] }>,
    path: string
  ): Record<string, unknown> {
    const fixed: Record<string, unknown> = { ...props };

    for (const [key, value] of Object.entries(fixed)) {
      const schema = propsSchema[key];
      if (!schema) continue;

      // 修复枚举值
      if (schema.enum && typeof value === 'string') {
        if (!schema.enum.includes(value)) {
          const closest = findClosestEnumValue(value, schema.enum);
          if (closest) {
            fixed[key] = closest.value;
            this.changes.push({
              type: 'fix_enum',
              path: `${path}.${key}`,
              oldValue: value,
              newValue: closest.value,
              confidence: getConfidence(closest.similarity),
              description: `将无效枚举值 "${value}" 修复为 "${closest.value}" (相似度: ${(closest.similarity * 100).toFixed(0)}%)`,
            });
          }
        }
      }
    }

    return fixed;
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建 Schema 修复器实例
 */
export function createSchemaFixer(): SchemaFixer {
  return new SchemaFixer();
}

/**
 * 修复 Schema（便捷函数）
 */
export function fixSchema(schema: unknown): SchemaFixResult {
  const fixer = new SchemaFixer();
  return fixer.fix(schema);
}

/**
 * 检查 Schema 是否需要修复（便捷函数）
 */
export function needsSchemaFix(schema: unknown): boolean {
  const fixer = new SchemaFixer();
  return fixer.canFix(schema);
}
