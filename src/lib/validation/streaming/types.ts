/**
 * @file types.ts
 * @description 流式验证相关类型定义
 * @module lib/validation/streaming/types
 */

// ============================================================================
// 解析器类型
// ============================================================================

/**
 * 栈帧类型
 */
export type StackFrameType = 'object' | 'array' | 'string' | 'value';

/**
 * 解析栈帧
 */
export interface StackFrame {
  /** 帧类型 */
  type: StackFrameType;
  /** 对象键名（仅 object 类型） */
  key?: string;
  /** 数组索引（仅 array 类型） */
  index?: number;
  /** 当前值 */
  value?: unknown;
  /** 是否等待值 */
  expectingValue?: boolean;
  /** 是否等待键 */
  expectingKey?: boolean;
}

/**
 * 解析器状态
 */
export interface ParserState {
  /** 解析栈 */
  stack: StackFrame[];
  /** 当前位置 */
  position: number;
  /** 已解析的字符数 */
  consumed: number;
  /** 当前行号 */
  line: number;
  /** 当前列号 */
  column: number;
  /** 累积的输入 */
  buffer: string;
}

/**
 * 解析错误
 */
export interface ParseError {
  /** 错误消息 */
  message: string;
  /** 行号 */
  line: number;
  /** 列号 */
  column: number;
  /** JSON 路径 */
  path: string;
  /** 错误位置 */
  position: number;
}

/**
 * 增量解析结果
 */
export interface IncrementalParseResult {
  /** 是否为部分解析结果 */
  partial: boolean;
  /** 解析出的值（可能不完整） */
  value: unknown;
  /** 当前解析路径 */
  pendingPath: string;
  /** 解析状态 */
  state: ParserState;
  /** 错误信息（如果有） */
  error?: ParseError;
}

// ============================================================================
// 验证器类型
// ============================================================================

/**
 * 验证错误
 */
export interface ValidationError {
  /** 错误码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** JSON 路径 */
  path: string;
  /** 行号 */
  line?: number;
  /** 列号 */
  column?: number;
  /** 严重程度 */
  severity: 'error' | 'warning';
  /** 修复建议 */
  suggestion?: string;
}

/**
 * 验证警告（与 ValidationError 相同结构，语义不同）
 */
export type ValidationWarning = ValidationError;

/**
 * 部分组件信息
 */
export interface PartialComponent {
  /** 组件路径 */
  path: string;
  /** 组件类型（如果已解析） */
  type?: string;
  /** 组件 ID（如果已解析） */
  id?: string;
  /** 是否完整 */
  complete: boolean;
}

/**
 * 验证器状态
 */
export interface ValidatorState {
  /** 解析器状态 */
  parserState: ParserState;
  /** 已发现的组件 */
  components: PartialComponent[];
  /** 累积的错误 */
  errors: ValidationError[];
  /** 累积的警告 */
  warnings: ValidationWarning[];
}

/**
 * 流式验证器选项
 */
export interface StreamingValidatorOptions {
  /** 错误回调 */
  onError?: (error: ValidationError) => void;
  /** 警告回调 */
  onWarning?: (warning: ValidationWarning) => void;
  /** 组件发现回调 */
  onComponent?: (component: PartialComponent) => void;
  /** 最大嵌套深度 */
  maxDepth?: number;
}

/**
 * 流式验证结果
 */
export interface StreamingValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误列表 */
  errors: ValidationError[];
  /** 警告列表 */
  warnings: ValidationWarning[];
  /** 部分 Schema（如果有） */
  partialSchema?: unknown;
  /** 是否完整 */
  complete: boolean;
}
