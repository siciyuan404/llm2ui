/**
 * @file streaming-validator.ts
 * @description 流式验证器，在 LLM 生成过程中实时验证 JSON 片段
 * @module lib/validation/streaming/streaming-validator
 * @requirements REQ-1.1, REQ-1.2, REQ-1.3, REQ-1.4, REQ-1.5, REQ-1.6
 */

import type {
  StreamingValidatorOptions,
  StreamingValidationResult,
  ValidatorState,
  ValidationError,
  ValidationWarning,
  PartialComponent,
} from './types';
import { IncrementalParser } from './incremental-parser';
import { defaultCatalog } from '../../core/component-catalog';

// ============================================================================
// 常量
// ============================================================================

const DEFAULT_MAX_DEPTH = 100;

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 检查组件类型是否有效
 */
function isValidComponentType(type: string): boolean {
  return defaultCatalog.has(type);
}

/**
 * 获取相似的组件类型建议
 */
function getSimilarComponentTypes(type: string): string[] {
  const allTypes = defaultCatalog.getAll().map(c => c.name);
  const typeLower = type.toLowerCase();
  
  return allTypes
    .filter(t => {
      const tLower = t.toLowerCase();
      return tLower.includes(typeLower) || typeLower.includes(tLower) ||
        levenshteinDistance(tLower, typeLower) <= 3;
    })
    .slice(0, 3);
}

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
 * 从部分对象中提取组件信息
 */
function extractComponents(
  value: unknown,
  path: string,
  components: PartialComponent[]
): void {
  if (!value || typeof value !== 'object') return;
  
  const obj = value as Record<string, unknown>;
  
  // 检查是否是组件
  if ('type' in obj) {
    components.push({
      path,
      type: typeof obj.type === 'string' ? obj.type : undefined,
      id: typeof obj.id === 'string' ? obj.id : undefined,
      complete: 'type' in obj && 'id' in obj,
    });
  }
  
  // 递归检查 children
  if (Array.isArray(obj.children)) {
    obj.children.forEach((child, index) => {
      extractComponents(child, `${path}.children[${index}]`, components);
    });
  }
  
  // 检查 root
  if ('root' in obj && obj.root && typeof obj.root === 'object') {
    extractComponents(obj.root, `${path}.root`, components);
  }
}

// ============================================================================
// 流式验证器类
// ============================================================================

/**
 * 流式验证器
 */
export class StreamingValidator {
  private parser: IncrementalParser;
  private options: StreamingValidatorOptions;
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];
  private components: PartialComponent[] = [];
  private seenComponentPaths: Set<string> = new Set();
  private maxDepth: number;
  
  constructor(options: StreamingValidatorOptions = {}) {
    this.parser = new IncrementalParser();
    this.options = options;
    this.maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  }
  
  /**
   * 处理新的 JSON 片段
   */
  feed(chunk: string): void {
    const result = this.parser.resume(chunk);
    
    // 检查解析错误
    if (result.error) {
      const error: ValidationError = {
        code: 'JSON_SYNTAX_ERROR',
        message: result.error.message,
        path: result.error.path,
        line: result.error.line,
        column: result.error.column,
        severity: 'error',
        suggestion: 'Check for missing brackets, quotes, or commas',
      };
      this.addError(error);
      return;
    }
    
    // 验证部分结果
    if (result.value !== undefined) {
      this.validatePartialSchema(result.value, result.pendingPath);
    }
  }
  
  /**
   * 获取当前验证状态
   */
  getState(): ValidatorState {
    return {
      parserState: this.parser.getState(),
      components: [...this.components],
      errors: [...this.errors],
      warnings: [...this.warnings],
    };
  }
  
  /**
   * 重置验证器
   */
  reset(): void {
    this.parser.reset();
    this.errors = [];
    this.warnings = [];
    this.components = [];
    this.seenComponentPaths.clear();
  }
  
  /**
   * 完成验证
   */
  finalize(): StreamingValidationResult {
    const state = this.parser.getState();
    const parserResult = this.parser.parse('');
    
    // 检查是否完整
    const complete = !parserResult.partial;
    
    // 如果不完整，添加警告
    if (!complete) {
      this.addWarning({
        code: 'INCOMPLETE_JSON',
        message: 'JSON is incomplete',
        path: parserResult.pendingPath,
        severity: 'warning',
        suggestion: 'The JSON structure is not complete',
      });
    }
    
    return {
      valid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
      partialSchema: parserResult.value,
      complete,
    };
  }
  
  /**
   * 验证部分 Schema
   */
  private validatePartialSchema(value: unknown, pendingPath: string): void {
    if (!value || typeof value !== 'object') return;
    
    const obj = value as Record<string, unknown>;
    
    // 提取并验证组件
    const newComponents: PartialComponent[] = [];
    extractComponents(value, 'root', newComponents);
    
    for (const component of newComponents) {
      // 跳过已验证的组件
      if (this.seenComponentPaths.has(component.path)) continue;
      this.seenComponentPaths.add(component.path);
      
      // 验证组件类型
      if (component.type) {
        this.validateComponentType(component.type, component.path);
      }
      
      // 添加到组件列表
      this.components.push(component);
      
      // 触发回调
      if (this.options.onComponent) {
        this.options.onComponent(component);
      }
    }
    
    // 验证 Schema 结构
    this.validateSchemaStructure(obj);
  }
  
  /**
   * 验证组件类型
   */
  private validateComponentType(type: string, path: string): void {
    if (!isValidComponentType(type)) {
      const similar = getSimilarComponentTypes(type);
      const suggestion = similar.length > 0
        ? `Did you mean: ${similar.join(', ')}?`
        : 'Check the component type name';
      
      this.addError({
        code: 'UNKNOWN_COMPONENT',
        message: `Unknown component type "${type}"`,
        path,
        severity: 'error',
        suggestion,
      });
    }
  }
  
  /**
   * 验证 Schema 结构
   */
  private validateSchemaStructure(obj: Record<string, unknown>): void {
    // 检查 version 字段
    if ('version' in obj && typeof obj.version !== 'string') {
      this.addWarning({
        code: 'INVALID_VERSION',
        message: 'Version should be a string',
        path: 'version',
        severity: 'warning',
        suggestion: 'Use "version": "1.0"',
      });
    }
    
    // 检查 root 字段
    if ('root' in obj) {
      const root = obj.root;
      if (root && typeof root === 'object') {
        const rootObj = root as Record<string, unknown>;
        
        // 检查 root.type
        if (!('type' in rootObj)) {
          this.addWarning({
            code: 'MISSING_ROOT_TYPE',
            message: 'Root component is missing "type" field',
            path: 'root',
            severity: 'warning',
            suggestion: 'Add "type" field to root component',
          });
        }
        
        // 检查 root.id
        if (!('id' in rootObj)) {
          this.addWarning({
            code: 'MISSING_ROOT_ID',
            message: 'Root component is missing "id" field',
            path: 'root',
            severity: 'warning',
            suggestion: 'Add "id" field to root component',
          });
        }
      }
    }
  }
  
  /**
   * 添加错误
   */
  private addError(error: ValidationError): void {
    // 避免重复错误
    const exists = this.errors.some(
      e => e.code === error.code && e.path === error.path
    );
    if (exists) return;
    
    this.errors.push(error);
    
    if (this.options.onError) {
      this.options.onError(error);
    }
  }
  
  /**
   * 添加警告
   */
  private addWarning(warning: ValidationWarning): void {
    // 避免重复警告
    const exists = this.warnings.some(
      w => w.code === warning.code && w.path === warning.path
    );
    if (exists) return;
    
    this.warnings.push(warning);
    
    if (this.options.onWarning) {
      this.options.onWarning(warning);
    }
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建流式验证器实例
 */
export function createStreamingValidator(
  options?: StreamingValidatorOptions
): StreamingValidator {
  return new StreamingValidator(options);
}

/**
 * 流式验证 JSON 字符串
 */
export function streamValidate(
  input: string,
  options?: StreamingValidatorOptions
): StreamingValidationResult {
  const validator = new StreamingValidator(options);
  validator.feed(input);
  return validator.finalize();
}
