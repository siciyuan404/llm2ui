/**
 * @file index.ts
 * @description 验证模块导出入口
 * @module lib/validation
 * 
 * 该模块提供 UI Schema 验证功能：
 * - 流式验证 (streaming)
 * - 多语言错误消息 (i18n)
 * - 自动修复 (auto-fix)
 */

// Streaming Validation
export * from './streaming';

// i18n Error Formatting
export * from './i18n/error-formatter';

// Auto-fix
export * from './auto-fix';

// Re-export types for convenience
export type {
  ValidationError,
  ValidationWarning,
  StreamingValidationResult,
  StreamingValidatorOptions,
  IncrementalParseResult,
  ParseError,
  ParserState,
} from './streaming/types';
