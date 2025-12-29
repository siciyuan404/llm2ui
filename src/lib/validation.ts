/**
 * Schema Validation
 * 
 * Functions for validating JSON syntax and UI Schema structure.
 * Provides detailed error information including position and path.
 * 
 * Enhanced validation includes component type validation, property validation,
 * and suggestions for fixing errors.
 * 
 * @module validation
 * @see Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 6.1, 6.2, 6.4, 6.5
 */

import type { UISchema, ValidationResult, ValidationError } from '../types';
import type { ComponentCatalog } from './component-catalog';
import type { PropSchema } from './component-registry';

// 延迟导入 defaultCatalog 以避免循环依赖
let _defaultCatalog: ComponentCatalog | undefined;

/**
 * 设置默认的组件目录
 * 用于避免循环依赖
 * @internal
 */
export function setDefaultCatalog(catalog: ComponentCatalog): void {
  _defaultCatalog = catalog;
}

/**
 * 获取默认的组件目录
 * @internal
 */
export function getDefaultCatalog(): ComponentCatalog | undefined {
  return _defaultCatalog;
}

/**
 * 验证错误严重程度
 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * 验证错误码
 */
export type ValidationErrorCode =
  | 'INVALID_TYPE'
  | 'MISSING_FIELD'
  | 'INVALID_VALUE'
  | 'DUPLICATE_ID'
  | 'UNKNOWN_COMPONENT'
  | 'MISSING_REQUIRED_PROP'
  | 'INVALID_PROP_TYPE'
  | 'INVALID_ENUM_VALUE'
  | 'MISSING_ID'
  | 'MISSING_VERSION'
  | 'DEPRECATED_COMPONENT'
  | 'CASE_MISMATCH';

/**
 * 增强的验证错误
 * 扩展基础 ValidationError，添加严重程度和建议字段
 * 
 * @see Requirements 6.1
 */
export interface EnhancedValidationError extends ValidationError {
  /** 错误严重程度 */
  severity: ValidationSeverity;
  /** 修复建议 */
  suggestion?: string;
}

/**
 * 增强的验证结果
 * 分离 errors 和 warnings
 * 
 * @see Requirements 6.4
 */
export interface EnhancedValidationResult {
  /** 是否验证通过（无 error 级别错误） */
  valid: boolean;
  /** 阻塞性错误列表 */
  errors: EnhancedValidationError[];
  /** 非阻塞性警告列表 */
  warnings: EnhancedValidationError[];
  /** 验证后的 Schema（如果验证通过） */
  schema?: UISchema;
}

/**
 * 验证选项
 * 控制验证行为
 * 
 * @see Requirements 6.1, 7.1, 7.5
 */
export interface ValidationOptions {
  /** 是否启用组件类型验证（默认: true） */
  validateComponentTypes?: boolean;
  /** 是否启用属性验证（默认: true） */
  validateProps?: boolean;
  /** 使用的组件目录（默认: defaultCatalog） */
  catalog?: ComponentCatalog;
  /** 是否启用严格模式（将警告视为错误） */
  strict?: boolean;
  /** 
   * 是否仅进行结构验证（向后兼容模式）
   * 当设置为 true 时，行为与 validateUISchema 完全一致
   * @see Requirements 7.1, 7.5
   */
  structureOnly?: boolean;
}

/**
 * JSON validation result with detailed error information
 */
export interface JSONValidationResult {
  /** Whether the JSON is valid */
  valid: boolean;
  /** Parsed value if valid */
  value?: unknown;
  /** Error details if invalid */
  error?: JSONValidationError;
}

/**
 * Detailed JSON validation error
 */
export interface JSONValidationError {
  /** Error message */
  message: string;
  /** Character position in the input string (0-based) */
  position?: number;
  /** Line number (1-based) */
  line?: number;
  /** Column number (1-based) */
  column?: number;
}

/**
 * Calculate line and column from position in a string
 */
function getLineAndColumn(input: string, position: number): { line: number; column: number } {
  const lines = input.substring(0, position).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

/**
 * Extract position from JSON parse error message
 */
function extractPositionFromError(errorMessage: string): number | undefined {
  // Different JS engines format the error differently
  // V8: "... at position 5"
  // SpiderMonkey: "... at line 1 column 6"
  const positionMatch = errorMessage.match(/position\s+(\d+)/i);
  if (positionMatch) {
    return parseInt(positionMatch[1], 10);
  }
  return undefined;
}

/**
 * Validate JSON syntax
 * 
 * @param input - The JSON string to validate
 * @returns JSONValidationResult with parsed value or detailed error
 */
export function validateJSON(input: string): JSONValidationResult {
  // Handle empty or whitespace-only input
  if (!input || input.trim() === '') {
    return {
      valid: false,
      error: {
        message: 'Empty input: JSON string is empty or contains only whitespace',
        position: 0,
        line: 1,
        column: 1,
      },
    };
  }

  try {
    const value = JSON.parse(input);
    return {
      valid: true,
      value,
    };
  } catch (e) {
    const syntaxError = e as SyntaxError;
    const position = extractPositionFromError(syntaxError.message);
    
    let line: number | undefined;
    let column: number | undefined;
    
    if (position !== undefined) {
      const lineCol = getLineAndColumn(input, position);
      line = lineCol.line;
      column = lineCol.column;
    }

    return {
      valid: false,
      error: {
        message: syntaxError.message,
        position,
        line,
        column,
      },
    };
  }
}


/**
 * UI Schema validation result
 */
export interface UISchemaValidationResult extends ValidationResult {
  /** The validated schema if valid */
  schema?: UISchema;
}

/**
 * Validate UI Schema structure
 * 
 * Validates that a parsed object conforms to the UISchema structure:
 * - Required fields (version, root)
 * - Component structure (id, type required for each component)
 * - Component reference integrity (all children are valid components)
 * 
 * @param input - The object to validate (typically from JSON.parse)
 * @returns UISchemaValidationResult with validation errors or validated schema
 */
export function validateUISchema(input: unknown): UISchemaValidationResult {
  const errors: ValidationError[] = [];

  // Check if input is an object
  if (typeof input !== 'object' || input === null) {
    errors.push({
      path: '',
      message: 'Schema must be an object',
      code: 'INVALID_TYPE',
    });
    return { valid: false, errors };
  }

  const obj = input as Record<string, unknown>;

  // Validate version field
  if (!('version' in obj)) {
    errors.push({
      path: 'version',
      message: 'Missing required field: version',
      code: 'MISSING_FIELD',
    });
  } else if (typeof obj.version !== 'string') {
    errors.push({
      path: 'version',
      message: 'Field "version" must be a string',
      code: 'INVALID_TYPE',
    });
  } else if (obj.version.trim() === '') {
    errors.push({
      path: 'version',
      message: 'Field "version" cannot be empty',
      code: 'INVALID_VALUE',
    });
  }

  // Validate root field
  if (!('root' in obj)) {
    errors.push({
      path: 'root',
      message: 'Missing required field: root',
      code: 'MISSING_FIELD',
    });
  } else {
    const componentErrors = validateComponentRecursive(obj.root, 'root', new Set<string>());
    errors.push(...componentErrors);
  }

  // Validate data field if present
  if ('data' in obj && obj.data !== undefined && obj.data !== null) {
    if (typeof obj.data !== 'object') {
      errors.push({
        path: 'data',
        message: 'Field "data" must be an object',
        code: 'INVALID_TYPE',
      });
    }
  }

  // Validate meta field if present
  if ('meta' in obj && obj.meta !== undefined && obj.meta !== null) {
    if (typeof obj.meta !== 'object') {
      errors.push({
        path: 'meta',
        message: 'Field "meta" must be an object',
        code: 'INVALID_TYPE',
      });
    }
  }

  if (errors.length === 0) {
    return {
      valid: true,
      errors: [],
      schema: input as UISchema,
    };
  }

  return { valid: false, errors };
}

/**
 * Validate a UIComponent structure recursively
 * Also checks for duplicate component IDs
 */
function validateComponentRecursive(
  obj: unknown,
  path: string,
  seenIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if component is an object
  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      path,
      message: `Component at "${path}" must be an object`,
      code: 'INVALID_TYPE',
    });
    return errors;
  }

  const component = obj as Record<string, unknown>;

  // Validate id field
  if (!('id' in component)) {
    errors.push({
      path: `${path}.id`,
      message: `Missing required field: id at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof component.id !== 'string') {
    errors.push({
      path: `${path}.id`,
      message: `Field "id" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
    });
  } else if (component.id.trim() === '') {
    errors.push({
      path: `${path}.id`,
      message: `Field "id" cannot be empty at "${path}"`,
      code: 'INVALID_VALUE',
    });
  } else {
    // Check for duplicate IDs
    if (seenIds.has(component.id)) {
      errors.push({
        path: `${path}.id`,
        message: `Duplicate component id "${component.id}" at "${path}"`,
        code: 'DUPLICATE_ID',
      });
    } else {
      seenIds.add(component.id);
    }
  }

  // Validate type field
  if (!('type' in component)) {
    errors.push({
      path: `${path}.type`,
      message: `Missing required field: type at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof component.type !== 'string') {
    errors.push({
      path: `${path}.type`,
      message: `Field "type" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
    });
  } else if (component.type.trim() === '') {
    errors.push({
      path: `${path}.type`,
      message: `Field "type" cannot be empty at "${path}"`,
      code: 'INVALID_VALUE',
    });
  }

  // Validate props field if present
  if ('props' in component && component.props !== undefined && component.props !== null) {
    if (typeof component.props !== 'object' || Array.isArray(component.props)) {
      errors.push({
        path: `${path}.props`,
        message: `Field "props" must be an object at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  // Validate style field if present
  if ('style' in component && component.style !== undefined && component.style !== null) {
    if (typeof component.style !== 'object' || Array.isArray(component.style)) {
      errors.push({
        path: `${path}.style`,
        message: `Field "style" must be an object at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  // Validate events field if present
  if ('events' in component && component.events !== undefined && component.events !== null) {
    if (!Array.isArray(component.events)) {
      errors.push({
        path: `${path}.events`,
        message: `Field "events" must be an array at "${path}"`,
        code: 'INVALID_TYPE',
      });
    } else {
      component.events.forEach((event, index) => {
        const eventErrors = validateEventBinding(event, `${path}.events[${index}]`);
        errors.push(...eventErrors);
      });
    }
  }

  // Validate loop field if present
  if ('loop' in component && component.loop !== undefined && component.loop !== null) {
    const loopErrors = validateLoopConfig(component.loop, `${path}.loop`);
    errors.push(...loopErrors);
  }

  // Recursively validate children
  if ('children' in component && component.children !== undefined && component.children !== null) {
    if (!Array.isArray(component.children)) {
      errors.push({
        path: `${path}.children`,
        message: `Field "children" must be an array at "${path}"`,
        code: 'INVALID_TYPE',
      });
    } else {
      component.children.forEach((child, index) => {
        const childErrors = validateComponentRecursive(
          child,
          `${path}.children[${index}]`,
          seenIds
        );
        errors.push(...childErrors);
      });
    }
  }

  return errors;
}

/**
 * Validate an EventBinding structure
 */
function validateEventBinding(obj: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      path,
      message: `Event binding at "${path}" must be an object`,
      code: 'INVALID_TYPE',
    });
    return errors;
  }

  const event = obj as Record<string, unknown>;

  // Validate event field
  if (!('event' in event)) {
    errors.push({
      path: `${path}.event`,
      message: `Missing required field: event at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof event.event !== 'string') {
    errors.push({
      path: `${path}.event`,
      message: `Field "event" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
    });
  }

  // Validate action field
  if (!('action' in event)) {
    errors.push({
      path: `${path}.action`,
      message: `Missing required field: action at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof event.action !== 'object' || event.action === null) {
    errors.push({
      path: `${path}.action`,
      message: `Field "action" must be an object at "${path}"`,
      code: 'INVALID_TYPE',
    });
  } else {
    const action = event.action as Record<string, unknown>;
    if (!('type' in action)) {
      errors.push({
        path: `${path}.action.type`,
        message: `Missing required field: type in action at "${path}"`,
        code: 'MISSING_FIELD',
      });
    } else if (typeof action.type !== 'string') {
      errors.push({
        path: `${path}.action.type`,
        message: `Field "type" must be a string in action at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  return errors;
}

/**
 * Validate a loop configuration
 */
function validateLoopConfig(obj: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      path,
      message: `Loop config at "${path}" must be an object`,
      code: 'INVALID_TYPE',
    });
    return errors;
  }

  const loop = obj as Record<string, unknown>;

  // Validate source field (required)
  if (!('source' in loop)) {
    errors.push({
      path: `${path}.source`,
      message: `Missing required field: source at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof loop.source !== 'string') {
    errors.push({
      path: `${path}.source`,
      message: `Field "source" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
    });
  }

  // Validate itemName if present
  if ('itemName' in loop && loop.itemName !== undefined) {
    if (typeof loop.itemName !== 'string') {
      errors.push({
        path: `${path}.itemName`,
        message: `Field "itemName" must be a string at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  // Validate indexName if present
  if ('indexName' in loop && loop.indexName !== undefined) {
    if (typeof loop.indexName !== 'string') {
      errors.push({
        path: `${path}.indexName`,
        message: `Field "indexName" must be a string at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  return errors;
}


// ============================================================================
// Enhanced Validation Functions
// ============================================================================

/**
 * 计算两个字符串之间的 Levenshtein 距离
 * 用于查找相似的组件类型名称
 * 
 * @param a - 第一个字符串
 * @param b - 第二个字符串
 * @returns 编辑距离（插入、删除、替换操作的最小次数）
 * 
 * @see Requirements 6.2
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  if (aLower === bLower) return 0;
  if (aLower.length === 0) return bLower.length;
  if (bLower.length === 0) return aLower.length;

  // 使用两行数组优化空间复杂度
  let prevRow = Array.from({ length: bLower.length + 1 }, (_, i) => i);
  let currRow = new Array<number>(bLower.length + 1);

  for (let i = 1; i <= aLower.length; i++) {
    currRow[0] = i;
    
    for (let j = 1; j <= bLower.length; j++) {
      const cost = aLower[i - 1] === bLower[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,      // 删除
        currRow[j - 1] + 1,  // 插入
        prevRow[j - 1] + cost // 替换
      );
    }
    
    // 交换行
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[bLower.length];
}

/**
 * 获取与未知类型最相似的有效类型列表
 * 基于 Levenshtein 距离排序
 * 
 * @param unknownType - 未知的组件类型
 * @param validTypes - 有效类型列表
 * @param maxSuggestions - 最大建议数量（默认: 3）
 * @returns 相似类型数组，按相似度降序排列
 * 
 * @see Requirements 6.2
 */
export function getSimilarTypes(
  unknownType: string,
  validTypes: string[],
  maxSuggestions: number = 3
): string[] {
  if (!unknownType || validTypes.length === 0) {
    return [];
  }

  // 计算每个有效类型的距离
  const typesWithDistance = validTypes.map(type => ({
    type,
    distance: levenshteinDistance(unknownType, type),
  }));

  // 按距离排序
  typesWithDistance.sort((a, b) => a.distance - b.distance);

  // 过滤掉距离过大的建议（距离超过原字符串长度的一半）
  const maxDistance = Math.max(unknownType.length, 3);
  const filtered = typesWithDistance.filter(t => t.distance <= maxDistance);

  // 返回前 N 个建议
  return filtered.slice(0, maxSuggestions).map(t => t.type);
}


/**
 * 验证组件类型是否有效
 * 检查类型是否在 Catalog 中，如果无效则返回错误和建议
 * 
 * @param componentType - 组件类型名称
 * @param path - 组件在 Schema 中的路径
 * @param catalog - 组件目录
 * @returns 验证错误（如果类型无效）或 undefined
 * 
 * @see Requirements 2.1, 2.5
 */
export function validateComponentType(
  componentType: string,
  path: string,
  catalog: ComponentCatalog
): EnhancedValidationError | undefined {
  // 检查类型是否有效（包括别名和大小写不敏感匹配）
  if (catalog.isValidType(componentType)) {
    return undefined;
  }

  // 类型无效，生成错误和建议
  const validTypes = catalog.getValidTypes();
  const suggestions = getSimilarTypes(componentType, validTypes, 3);
  
  let suggestion: string | undefined;
  if (suggestions.length > 0) {
    suggestion = `Did you mean: ${suggestions.join(', ')}?`;
  } else {
    suggestion = `Valid types: ${validTypes.slice(0, 5).join(', ')}${validTypes.length > 5 ? '...' : ''}`;
  }

  return {
    path: `${path}.type`,
    message: `Unknown component type "${componentType}" at "${path}"`,
    code: 'UNKNOWN_COMPONENT',
    severity: 'error',
    suggestion,
  };
}


/**
 * 获取值的 JavaScript 类型名称
 * @param value - 要检查的值
 * @returns 类型名称
 */
function getValueType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * 检查值是否匹配期望的类型
 * @param value - 要检查的值
 * @param expectedType - 期望的类型
 * @returns 是否匹配
 */
function matchesType(value: unknown, expectedType: PropSchema['type']): boolean {
  const actualType = getValueType(value);
  
  switch (expectedType) {
    case 'string':
      return actualType === 'string';
    case 'number':
      return actualType === 'number';
    case 'boolean':
      return actualType === 'boolean';
    case 'object':
      return actualType === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return actualType === 'array';
    case 'function':
      return actualType === 'function';
    default:
      return false;
  }
}

/**
 * 验证组件属性
 * 检查必填属性、类型匹配和枚举值
 * 
 * @param props - 组件属性对象
 * @param propsSchema - 属性 Schema 定义
 * @param path - 组件在 Schema 中的路径
 * @returns 验证错误数组
 * 
 * @see Requirements 2.2, 2.3, 2.4, 2.6, 2.7, 2.8
 */
export function validateComponentProps(
  props: Record<string, unknown> | undefined,
  propsSchema: Record<string, PropSchema>,
  path: string
): EnhancedValidationError[] {
  const errors: EnhancedValidationError[] = [];
  const actualProps = props || {};

  // 遍历 Schema 中定义的属性
  for (const [propName, schema] of Object.entries(propsSchema)) {
    const propPath = `${path}.props.${propName}`;
    const propValue = actualProps[propName];

    // 检查必填属性
    if (schema.required && (propValue === undefined || propValue === null)) {
      errors.push({
        path: propPath,
        message: `Missing required property "${propName}" at "${path}"`,
        code: 'MISSING_REQUIRED_PROP',
        severity: 'error',
        suggestion: schema.description 
          ? `${propName}: ${schema.description}` 
          : `Property "${propName}" is required (type: ${schema.type})`,
      });
      continue;
    }

    // 如果属性不存在且非必填，跳过后续验证
    if (propValue === undefined || propValue === null) {
      continue;
    }

    // 检查类型匹配
    if (!matchesType(propValue, schema.type)) {
      const actualType = getValueType(propValue);
      errors.push({
        path: propPath,
        message: `Invalid type for property "${propName}" at "${path}": expected ${schema.type}, got ${actualType}`,
        code: 'INVALID_PROP_TYPE',
        severity: 'error',
        suggestion: `Expected type: ${schema.type}`,
      });
      continue;
    }

    // 检查枚举值（仅对字符串类型）
    if (schema.enum && schema.enum.length > 0 && schema.type === 'string') {
      const stringValue = propValue as string;
      if (!schema.enum.includes(stringValue)) {
        errors.push({
          path: propPath,
          message: `Invalid enum value "${stringValue}" for property "${propName}" at "${path}"`,
          code: 'INVALID_ENUM_VALUE',
          severity: 'error',
          suggestion: `Valid values: ${schema.enum.join(', ')}`,
        });
      }
    }
  }

  return errors;
}


/**
 * 验证组件结构（不验证组件类型和属性）
 * 用于没有 catalog 时的基础验证
 * 
 * @param obj - 组件对象
 * @param path - 组件路径
 * @param seenIds - 已见过的组件 ID 集合
 * @returns 验证错误数组
 */
function validateComponentStructure(
  obj: unknown,
  path: string,
  seenIds: Set<string>
): ValidationError[] {
  return validateComponentRecursive(obj, path, seenIds);
}


/**
 * 检查组件是否已弃用
 * 如果组件已弃用，返回警告信息
 * 
 * @param componentType - 组件类型名称
 * @param path - 组件在 Schema 中的路径
 * @param catalog - 组件目录
 * @returns 弃用警告（如果组件已弃用）或 undefined
 * 
 * @see Requirements 6.5
 */
export function checkDeprecatedComponent(
  componentType: string,
  path: string,
  catalog: ComponentCatalog
): EnhancedValidationError | undefined {
  const metadata = catalog.getAllMetadata().find(m => {
    // 直接匹配
    if (m.name === componentType) return true;
    // 大小写不敏感匹配
    if (m.name.toLowerCase() === componentType.toLowerCase()) return true;
    // 别名匹配
    const resolved = catalog.resolveAlias(componentType);
    if (resolved && m.name === resolved) return true;
    return false;
  });

  if (metadata?.deprecated) {
    return {
      path: `${path}.type`,
      message: `Component "${componentType}" is deprecated at "${path}"`,
      code: 'DEPRECATED_COMPONENT',
      severity: 'warning',
      suggestion: metadata.deprecationMessage || 'Consider using an alternative component',
    };
  }

  return undefined;
}


/**
 * 递归验证组件（增强版）
 * 验证组件类型、属性和子组件
 * 
 * @param obj - 组件对象
 * @param path - 组件路径
 * @param seenIds - 已见过的组件 ID 集合
 * @param catalog - 组件目录
 * @param options - 验证选项
 * @returns 错误和警告数组
 */
function validateComponentEnhanced(
  obj: unknown,
  path: string,
  seenIds: Set<string>,
  catalog: ComponentCatalog,
  options: ValidationOptions
): { errors: EnhancedValidationError[]; warnings: EnhancedValidationError[] } {
  const errors: EnhancedValidationError[] = [];
  const warnings: EnhancedValidationError[] = [];

  // 检查组件是否为对象
  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      path,
      message: `Component at "${path}" must be an object`,
      code: 'INVALID_TYPE',
      severity: 'error',
    });
    return { errors, warnings };
  }

  const component = obj as Record<string, unknown>;

  // 验证 id 字段
  if (!('id' in component)) {
    errors.push({
      path: `${path}.id`,
      message: `Missing required field: id at "${path}"`,
      code: 'MISSING_ID',
      severity: 'error',
      suggestion: 'Each component must have a unique id',
    });
  } else if (typeof component.id !== 'string') {
    errors.push({
      path: `${path}.id`,
      message: `Field "id" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
      severity: 'error',
    });
  } else if (component.id.trim() === '') {
    errors.push({
      path: `${path}.id`,
      message: `Field "id" cannot be empty at "${path}"`,
      code: 'INVALID_VALUE',
      severity: 'error',
    });
  } else {
    // 检查重复 ID
    if (seenIds.has(component.id)) {
      errors.push({
        path: `${path}.id`,
        message: `Duplicate component id "${component.id}" at "${path}"`,
        code: 'DUPLICATE_ID',
        severity: 'error',
      });
    } else {
      seenIds.add(component.id);
    }
  }

  // 验证 type 字段
  if (!('type' in component)) {
    errors.push({
      path: `${path}.type`,
      message: `Missing required field: type at "${path}"`,
      code: 'MISSING_FIELD',
      severity: 'error',
    });
  } else if (typeof component.type !== 'string') {
    errors.push({
      path: `${path}.type`,
      message: `Field "type" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
      severity: 'error',
    });
  } else if (component.type.trim() === '') {
    errors.push({
      path: `${path}.type`,
      message: `Field "type" cannot be empty at "${path}"`,
      code: 'INVALID_VALUE',
      severity: 'error',
    });
  } else if (options.validateComponentTypes !== false) {
    // 验证组件类型
    const typeError = validateComponentType(component.type, path, catalog);
    if (typeError) {
      errors.push(typeError);
    } else {
      // 检查已弃用组件
      const deprecationWarning = checkDeprecatedComponent(component.type, path, catalog);
      if (deprecationWarning) {
        warnings.push(deprecationWarning);
      }
    }
  }

  // 验证 props 字段结构
  if ('props' in component && component.props !== undefined && component.props !== null) {
    if (typeof component.props !== 'object' || Array.isArray(component.props)) {
      errors.push({
        path: `${path}.props`,
        message: `Field "props" must be an object at "${path}"`,
        code: 'INVALID_TYPE',
        severity: 'error',
      });
    } else if (options.validateProps !== false && typeof component.type === 'string') {
      // 验证属性
      const propsSchema = catalog.getPropsSchema(component.type);
      if (propsSchema) {
        const propErrors = validateComponentProps(
          component.props as Record<string, unknown>,
          propsSchema,
          path
        );
        errors.push(...propErrors);
      }
    }
  }

  // 验证 style 字段
  if ('style' in component && component.style !== undefined && component.style !== null) {
    if (typeof component.style !== 'object' || Array.isArray(component.style)) {
      errors.push({
        path: `${path}.style`,
        message: `Field "style" must be an object at "${path}"`,
        code: 'INVALID_TYPE',
        severity: 'error',
      });
    }
  }

  // 验证 events 字段
  if ('events' in component && component.events !== undefined && component.events !== null) {
    if (!Array.isArray(component.events)) {
      errors.push({
        path: `${path}.events`,
        message: `Field "events" must be an array at "${path}"`,
        code: 'INVALID_TYPE',
        severity: 'error',
      });
    } else {
      component.events.forEach((event, index) => {
        const eventErrors = validateEventBinding(event, `${path}.events[${index}]`);
        errors.push(...eventErrors.map(e => ({
          ...e,
          severity: 'error' as ValidationSeverity,
        })));
      });
    }
  }

  // 验证 loop 字段
  if ('loop' in component && component.loop !== undefined && component.loop !== null) {
    const loopErrors = validateLoopConfig(component.loop, `${path}.loop`);
    errors.push(...loopErrors.map(e => ({
      ...e,
      severity: 'error' as ValidationSeverity,
    })));
  }

  // 递归验证子组件
  if ('children' in component && component.children !== undefined && component.children !== null) {
    if (!Array.isArray(component.children)) {
      errors.push({
        path: `${path}.children`,
        message: `Field "children" must be an array at "${path}"`,
        code: 'INVALID_TYPE',
        severity: 'error',
      });
    } else {
      component.children.forEach((child, index) => {
        const childResult = validateComponentEnhanced(
          child,
          `${path}.children[${index}]`,
          seenIds,
          catalog,
          options
        );
        errors.push(...childResult.errors);
        warnings.push(...childResult.warnings);
      });
    }
  }

  return { errors, warnings };
}

/**
 * 增强的 UISchema 验证
 * 整合结构验证和组件验证，支持配置选项
 * 
 * @param input - 要验证的对象
 * @param options - 验证选项
 * @returns 增强的验证结果
 * 
 * @see Requirements 6.4, 7.1, 7.5
 */
export function validateUISchemaEnhanced(
  input: unknown,
  options?: ValidationOptions
): EnhancedValidationResult {
  const opts: ValidationOptions = {
    validateComponentTypes: true,
    validateProps: true,
    strict: false,
    structureOnly: false,
    ...options,
  };
  
  // 向后兼容模式：当 structureOnly 为 true 时，行为与 validateUISchema 完全一致
  // @see Requirements 7.1, 7.5
  if (opts.structureOnly) {
    const basicResult = validateUISchema(input);
    return {
      valid: basicResult.valid,
      errors: basicResult.errors.map(e => ({
        ...e,
        severity: 'error' as ValidationSeverity,
      })),
      warnings: [],
      schema: basicResult.schema,
    };
  }
  
  // 如果没有提供 catalog，使用默认的或禁用组件类型验证
  const catalog = opts.catalog || getDefaultCatalog();
  const shouldValidateTypes = opts.validateComponentTypes !== false && catalog !== undefined;
  const shouldValidateProps = opts.validateProps !== false && catalog !== undefined;
  
  const errors: EnhancedValidationError[] = [];
  const warnings: EnhancedValidationError[] = [];

  // 检查输入是否为对象
  if (typeof input !== 'object' || input === null) {
    errors.push({
      path: '',
      message: 'Schema must be an object',
      code: 'INVALID_TYPE',
      severity: 'error',
    });
    return { valid: false, errors, warnings };
  }

  const obj = input as Record<string, unknown>;

  // 验证 version 字段
  if (!('version' in obj)) {
    warnings.push({
      path: 'version',
      message: 'Missing field: version',
      code: 'MISSING_VERSION',
      severity: 'warning',
      suggestion: 'Add "version": "1.0" to your schema',
    });
  } else if (typeof obj.version !== 'string') {
    errors.push({
      path: 'version',
      message: 'Field "version" must be a string',
      code: 'INVALID_TYPE',
      severity: 'error',
    });
  } else if (obj.version.trim() === '') {
    errors.push({
      path: 'version',
      message: 'Field "version" cannot be empty',
      code: 'INVALID_VALUE',
      severity: 'error',
    });
  }

  // 验证 root 字段
  if (!('root' in obj)) {
    errors.push({
      path: 'root',
      message: 'Missing required field: root',
      code: 'MISSING_FIELD',
      severity: 'error',
    });
  } else if (shouldValidateTypes && catalog) {
    const componentResult = validateComponentEnhanced(
      obj.root,
      'root',
      new Set<string>(),
      catalog,
      { ...opts, validateComponentTypes: shouldValidateTypes, validateProps: shouldValidateProps }
    );
    errors.push(...componentResult.errors);
    warnings.push(...componentResult.warnings);
  } else {
    // 仅进行结构验证（不验证组件类型和属性）
    const componentResult = validateComponentStructure(
      obj.root,
      'root',
      new Set<string>()
    );
    errors.push(...componentResult.map(e => ({
      ...e,
      severity: 'error' as ValidationSeverity,
    })));
  }

  // 验证 data 字段
  if ('data' in obj && obj.data !== undefined && obj.data !== null) {
    if (typeof obj.data !== 'object') {
      errors.push({
        path: 'data',
        message: 'Field "data" must be an object',
        code: 'INVALID_TYPE',
        severity: 'error',
      });
    }
  }

  // 验证 meta 字段
  if ('meta' in obj && obj.meta !== undefined && obj.meta !== null) {
    if (typeof obj.meta !== 'object') {
      errors.push({
        path: 'meta',
        message: 'Field "meta" must be an object',
        code: 'INVALID_TYPE',
        severity: 'error',
      });
    }
  }

  // 严格模式下将警告视为错误
  if (opts.strict) {
    errors.push(...warnings);
    warnings.length = 0;
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    schema: valid ? (input as UISchema) : undefined,
  };
}
