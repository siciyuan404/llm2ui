/**
 * Schema Fixer Module
 * 
 * 尝试自动修复常见的 UISchema 错误，包括：
 * - 缺失 version 字段
 * - 类型别名替换
 * - 缺失 id 生成
 * - 大小写规范化
 * 
 * @module lib/core/schema-fixer
 * @see Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import type { UISchema } from '../../types';
import type { EnhancedValidationError } from './validation';
import type { ComponentCatalog } from './component-catalog';
import { defaultCatalog } from './component-catalog';
import { validateUISchemaEnhanced } from './validation';

/**
 * 修复结果
 * 
 * @see Requirements 4.5
 */
export interface FixResult {
  /** 是否成功修复（修复后通过验证） */
  fixed: boolean;
  /** 修复后的 Schema（如果成功） */
  schema?: UISchema;
  /** 应用的修复列表 */
  fixes: string[];
  /** 剩余的验证错误（如果修复失败） */
  remainingErrors?: EnhancedValidationError[];
}

/**
 * 修复选项
 * 
 * @see Requirements 4.3, 4.5
 */
export interface FixOptions {
  /** 是否修复缺失的 version（默认: true） */
  fixMissingVersion?: boolean;
  /** 是否修复类型别名（默认: true） */
  fixTypeAliases?: boolean;
  /** 是否修复缺失的 id（默认: true） */
  fixMissingIds?: boolean;
  /** 是否修复大小写（默认: true） */
  fixCasing?: boolean;
  /** 使用的组件目录（默认: defaultCatalog） */
  catalog?: ComponentCatalog;
}

/**
 * 默认修复选项
 */
const DEFAULT_FIX_OPTIONS: Required<Omit<FixOptions, 'catalog'>> = {
  fixMissingVersion: true,
  fixTypeAliases: true,
  fixMissingIds: true,
  fixCasing: true,
};

/**
 * 生成唯一组件 ID
 * 使用模式 "{type}-{random}" 生成
 * 
 * @param type - 组件类型名称
 * @returns 唯一的组件 ID
 * 
 * @see Requirements 4.3
 */
export function generateComponentId(type: string): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const sanitizedType = type.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${sanitizedType}-${randomPart}`;
}

/**
 * 规范化组件类型大小写
 * 查找注册表中匹配的规范大小写形式
 * 
 * @param type - 组件类型名称
 * @param catalog - 组件目录
 * @returns 规范化后的类型名称，如果没有匹配则返回原值
 * 
 * @see Requirements 4.4
 */
function normalizeTypeCasing(type: string, catalog: ComponentCatalog): string {
  const validTypes = catalog.getValidTypes();
  const lowerType = type.toLowerCase();
  
  for (const validType of validTypes) {
    if (validType.toLowerCase() === lowerType) {
      return validType;
    }
  }
  
  return type;
}

/**
 * 修复单个组件
 * 
 * @param component - 组件对象
 * @param catalog - 组件目录
 * @param options - 修复选项
 * @param fixes - 修复描述数组（会被修改）
 * @returns 修复后的组件
 * 
 * @see Requirements 4.2, 4.3, 4.4
 */
function fixComponent(
  component: Record<string, unknown>,
  catalog: ComponentCatalog,
  options: Required<Omit<FixOptions, 'catalog'>>,
  fixes: string[]
): Record<string, unknown> {
  const fixed = { ...component };
  
  // 修复缺失的 id
  if (options.fixMissingIds && !('id' in fixed)) {
    const type = typeof fixed.type === 'string' ? fixed.type : 'component';
    const newId = generateComponentId(type);
    fixed.id = newId;
    fixes.push(`Added missing id "${newId}" to component of type "${type}"`);
  }
  
  // 修复类型
  if (typeof fixed.type === 'string') {
    const originalType = fixed.type;
    
    // 1. 尝试解析别名
    if (options.fixTypeAliases) {
      const resolved = catalog.resolveAlias(originalType);
      if (resolved) {
        fixed.type = resolved;
        fixes.push(`Replaced type alias "${originalType}" with canonical type "${resolved}"`);
      }
    }
    
    // 2. 修复大小写（如果别名解析没有改变类型）
    if (options.fixCasing && fixed.type === originalType) {
      const normalized = normalizeTypeCasing(originalType, catalog);
      if (normalized !== originalType) {
        fixed.type = normalized;
        fixes.push(`Normalized type casing from "${originalType}" to "${normalized}"`);
      }
    }
  }
  
  return fixed;
}


/**
 * 递归修复组件及其子组件
 * 
 * @param component - 组件对象
 * @param catalog - 组件目录
 * @param options - 修复选项
 * @param fixes - 修复描述数组（会被修改）
 * @returns 修复后的组件
 * 
 * @see Requirements 4.6
 */
function fixComponentRecursive(
  component: unknown,
  catalog: ComponentCatalog,
  options: Required<Omit<FixOptions, 'catalog'>>,
  fixes: string[]
): unknown {
  // 如果不是对象，直接返回
  if (typeof component !== 'object' || component === null) {
    return component;
  }
  
  const comp = component as Record<string, unknown>;
  
  // 修复当前组件
  const fixed = fixComponent(comp, catalog, options, fixes);
  
  // 递归修复子组件
  if ('children' in fixed && Array.isArray(fixed.children)) {
    fixed.children = fixed.children.map(child =>
      fixComponentRecursive(child, catalog, options, fixes)
    );
  }
  
  return fixed;
}

/**
 * 尝试修复 UISchema
 * 
 * 修复以下常见错误：
 * 1. 缺失 version 字段 - 添加默认版本 "1.0"
 * 2. 类型别名 - 替换为规范类型名称
 * 3. 缺失 id - 生成唯一 id
 * 4. 大小写错误 - 规范化为已注册的大小写形式
 * 
 * @param input - 要修复的对象
 * @param options - 修复选项
 * @returns 修复结果
 * 
 * @see Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
export function fixUISchema(
  input: unknown,
  options?: FixOptions
): FixResult {
  const fixes: string[] = [];
  
  // 合并选项
  const opts: Required<Omit<FixOptions, 'catalog'>> = {
    ...DEFAULT_FIX_OPTIONS,
    ...options,
  };
  const catalog = options?.catalog || defaultCatalog;
  
  // 检查输入是否为对象
  if (typeof input !== 'object' || input === null) {
    return {
      fixed: false,
      fixes: [],
      remainingErrors: [{
        path: '',
        message: 'Schema must be an object',
        code: 'INVALID_TYPE',
        severity: 'error',
      }],
    };
  }
  
  // 创建可修改的副本
  const schema = { ...input } as Record<string, unknown>;
  
  // 修复缺失的 version
  if (opts.fixMissingVersion && !('version' in schema)) {
    schema.version = '1.0';
    fixes.push('Added missing version field with default value "1.0"');
  }
  
  // 修复 root 组件
  if ('root' in schema && schema.root !== undefined) {
    schema.root = fixComponentRecursive(schema.root, catalog, opts, fixes);
  }
  
  // 如果没有进行任何修复，检查原始输入是否有效
  if (fixes.length === 0) {
    const validationResult = validateUISchemaEnhanced(input, { catalog });
    if (validationResult.valid) {
      return {
        fixed: true,
        schema: input as UISchema,
        fixes: [],
      };
    }
    return {
      fixed: false,
      fixes: [],
      remainingErrors: validationResult.errors,
    };
  }
  
  // 验证修复后的 Schema
  const validationResult = validateUISchemaEnhanced(schema, { catalog });
  
  if (validationResult.valid) {
    return {
      fixed: true,
      schema: schema as unknown as UISchema,
      fixes,
    };
  }
  
  // 修复后仍有错误
  return {
    fixed: false,
    schema: schema as unknown as UISchema,
    fixes,
    remainingErrors: validationResult.errors,
  };
}
