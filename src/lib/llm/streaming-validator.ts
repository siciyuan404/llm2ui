/**
 * Streaming Validator Module
 * 
 * 流式验证器，在流式响应过程中进行实时验证。
 * 检测未知组件类型并累积警告，完成时返回完整验证结果。
 * 
 * @module lib/llm/streaming-validator
 * @see Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

/**
 * 组件目录接口
 * 定义 StreamingValidator 所需的最小接口
 */
export interface StreamingValidatorCatalog {
  /** 检查类型是否有效 */
  isValidType(type: string): boolean;
}

/**
 * 流式验证警告
 * 在流式传输过程中检测到的问题
 * 
 * @see Requirements 5.3
 */
export interface StreamingWarning {
  /** 警告类型 */
  type: 'unknown_component' | 'invalid_structure';
  /** 警告消息 */
  message: string;
  /** 检测到的值 */
  value?: string;
  /** 在流中的位置（字符偏移量） */
  position?: number;
}

/**
 * 流式验证结果
 * finalize() 方法返回的结果类型
 */
export interface StreamingValidationResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 解析后的对象（如果 JSON 有效） */
  parsed?: unknown;
  /** 错误列表 */
  errors: Array<{
    path: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
    suggestion?: string;
  }>;
  /** 警告列表 */
  warnings: Array<{
    path: string;
    message: string;
    code: string;
    severity: 'warning';
    suggestion?: string;
  }>;
}


/**
 * 流式验证器
 * 
 * 在流式响应过程中进行实时验证，检测未知组件类型。
 * 
 * @example
 * ```typescript
 * import { defaultCatalog } from '../component-catalog';
 * 
 * const validator = new StreamingValidator(defaultCatalog);
 * 
 * // 接收流式数据块
 * validator.feed('{"version": "1.0", "root": {"id": "1", "type": "');
 * validator.feed('UnknownType"}}');
 * 
 * // 获取警告
 * const warnings = validator.getWarnings();
 * // warnings: [{ type: 'unknown_component', message: '...', value: 'UnknownType' }]
 * 
 * // 完成验证
 * const result = validator.finalize();
 * ```
 * 
 * @see Requirements 5.1, 5.2, 5.4, 5.5, 5.6
 */
export class StreamingValidator {
  /** 累积的数据缓冲区 */
  private buffer: string;
  /** 检测到的警告列表 */
  private warnings: StreamingWarning[];
  /** 组件目录 */
  private catalog: StreamingValidatorCatalog;
  /** 已检测过的类型（避免重复警告） */
  private detectedTypes: Set<string>;
  /** 当前处理位置 */
  private processedPosition: number;

  /**
   * 创建流式验证器实例
   * @param catalog - 组件目录（必须提供）
   */
  constructor(catalog: StreamingValidatorCatalog) {
    this.buffer = '';
    this.warnings = [];
    this.catalog = catalog;
    this.detectedTypes = new Set<string>();
    this.processedPosition = 0;
  }

  /**
   * 接收流式数据块
   * 将数据块添加到缓冲区并检测组件类型
   * 
   * @param chunk - 流式数据块
   * @see Requirements 5.1, 5.2
   */
  feed(chunk: string): void {
    this.buffer += chunk;
    
    // 检测新添加内容中的组件类型
    this.detectComponentTypes();
  }

  /**
   * 检测缓冲区中的组件类型
   * 使用正则表达式匹配 "type": "xxx" 模式
   * 
   * @private
   */
  private detectComponentTypes(): void {
    // 正则匹配 "type": "xxx" 或 "type":"xxx" 模式
    // 支持单引号和双引号，以及可选的空格
    const typePattern = /["']type["']\s*:\s*["']([^"']+)["']/g;
    
    // 从上次处理位置开始搜索，但需要一些回溯以处理跨块的匹配
    const searchStart = Math.max(0, this.processedPosition - 20);
    const searchText = this.buffer.substring(searchStart);
    
    let match: RegExpExecArray | null;
    while ((match = typePattern.exec(searchText)) !== null) {
      const componentType = match[1];
      const absolutePosition = searchStart + match.index;
      
      // 跳过已处理的位置
      if (absolutePosition < this.processedPosition) {
        continue;
      }
      
      // 避免重复检测同一类型
      const typeKey = `${componentType}@${absolutePosition}`;
      if (this.detectedTypes.has(typeKey)) {
        continue;
      }
      this.detectedTypes.add(typeKey);
      
      // 检查类型是否有效
      if (!this.catalog.isValidType(componentType)) {
        this.warnings.push({
          type: 'unknown_component',
          message: `Unknown component type "${componentType}" detected in stream`,
          value: componentType,
          position: absolutePosition,
        });
      }
    }
    
    // 更新处理位置（保留一些缓冲以处理跨块匹配）
    this.processedPosition = Math.max(0, this.buffer.length - 50);
  }

  /**
   * 获取当前警告列表
   * 
   * @returns 警告数组
   * @see Requirements 5.4
   */
  getWarnings(): StreamingWarning[] {
    return [...this.warnings];
  }

  /**
   * 重置验证器状态
   * 清除缓冲区和警告，准备处理新的流
   * 
   * @see Requirements 5.5
   */
  reset(): void {
    this.buffer = '';
    this.warnings = [];
    this.detectedTypes.clear();
    this.processedPosition = 0;
  }


  /**
   * 完成流式传输，返回完整验证结果
   * 尝试解析完整 JSON 并验证组件类型
   * 
   * @returns 流式验证结果
   * @see Requirements 5.6
   */
  finalize(): StreamingValidationResult {
    const errors: StreamingValidationResult['errors'] = [];
    const warnings: StreamingValidationResult['warnings'] = [];
    
    // 尝试解析完整 JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(this.buffer);
    } catch (e) {
      // JSON 解析失败
      const error = e as SyntaxError;
      return {
        valid: false,
        errors: [{
          path: '',
          message: `Invalid JSON: ${error.message}`,
          code: 'INVALID_JSON',
          severity: 'error',
        }],
        warnings: this.warnings.map(w => ({
          path: '',
          message: w.message,
          code: w.type === 'unknown_component' ? 'UNKNOWN_COMPONENT' : 'INVALID_STRUCTURE',
          severity: 'warning' as const,
          suggestion: w.value ? `Check component type "${w.value}"` : undefined,
        })),
      };
    }

    // 验证基本结构
    if (typeof parsed !== 'object' || parsed === null) {
      errors.push({
        path: '',
        message: 'Schema must be an object',
        code: 'INVALID_TYPE',
        severity: 'error',
      });
      return { valid: false, parsed, errors, warnings };
    }

    const obj = parsed as Record<string, unknown>;

    // 验证 version 字段
    if (!('version' in obj)) {
      warnings.push({
        path: 'version',
        message: 'Missing field: version',
        code: 'MISSING_VERSION',
        severity: 'warning',
        suggestion: 'Add "version": "1.0" to your schema',
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
    } else {
      // 递归验证组件
      this.validateComponent(obj.root, 'root', errors, warnings);
    }

    // 添加流式警告
    for (const w of this.warnings) {
      const existingWarning = warnings.find(ew => ew.message === w.message);
      if (!existingWarning) {
        warnings.push({
          path: '',
          message: w.message,
          code: w.type === 'unknown_component' ? 'UNKNOWN_COMPONENT' : 'INVALID_STRUCTURE',
          severity: 'warning',
          suggestion: w.value ? `Check component type "${w.value}"` : undefined,
        });
      }
    }

    return {
      valid: errors.length === 0,
      parsed,
      errors,
      warnings,
    };
  }

  /**
   * 递归验证组件
   * @private
   */
  private validateComponent(
    obj: unknown,
    path: string,
    errors: StreamingValidationResult['errors'],
    warnings: StreamingValidationResult['warnings']
  ): void {
    if (typeof obj !== 'object' || obj === null) {
      errors.push({
        path,
        message: `Component at "${path}" must be an object`,
        code: 'INVALID_TYPE',
        severity: 'error',
      });
      return;
    }

    const component = obj as Record<string, unknown>;

    // 验证 id 字段
    if (!('id' in component) || typeof component.id !== 'string') {
      errors.push({
        path: `${path}.id`,
        message: `Missing or invalid id at "${path}"`,
        code: 'MISSING_ID',
        severity: 'error',
      });
    }

    // 验证 type 字段
    if (!('type' in component) || typeof component.type !== 'string') {
      errors.push({
        path: `${path}.type`,
        message: `Missing or invalid type at "${path}"`,
        code: 'MISSING_TYPE',
        severity: 'error',
      });
    } else {
      // 检查组件类型是否有效
      if (!this.catalog.isValidType(component.type)) {
        errors.push({
          path: `${path}.type`,
          message: `Unknown component type "${component.type}" at "${path}"`,
          code: 'UNKNOWN_COMPONENT',
          severity: 'error',
          suggestion: `Check if "${component.type}" is a valid component type`,
        });
      }
    }

    // 递归验证子组件
    if ('children' in component && Array.isArray(component.children)) {
      component.children.forEach((child, index) => {
        this.validateComponent(child, `${path}.children[${index}]`, errors, warnings);
      });
    }
  }

  /**
   * 获取当前缓冲区内容
   * 用于调试和测试
   * 
   * @returns 缓冲区内容
   */
  getBuffer(): string {
    return this.buffer;
  }
}

/**
 * 创建流式验证器实例的工厂函数
 * @param catalog - 组件目录
 * @returns StreamingValidator 实例
 */
export function createStreamingValidator(catalog: StreamingValidatorCatalog): StreamingValidator {
  return new StreamingValidator(catalog);
}
