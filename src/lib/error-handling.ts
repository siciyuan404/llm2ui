/**
 * Error Handling Module
 * 
 * Provides centralized error handling utilities including:
 * - Network error handling with retry mechanism
 * - Schema error handling with fix suggestions
 * - Unknown component handling with logging
 * 
 * Requirements: 1.5, 2.6, 6.5
 */

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base error class for llm2ui errors
 */
export class LLM2UIError extends Error {
  /** Error code for categorization */
  code: string;
  /** Whether the error is recoverable */
  recoverable: boolean;
  /** Original error if this wraps another error */
  cause?: Error;

  constructor(message: string, code: string, recoverable = false, cause?: Error) {
    super(message);
    this.name = 'LLM2UIError';
    this.code = code;
    this.recoverable = recoverable;
    this.cause = cause;
  }
}

/**
 * Network-related error
 */
export class NetworkError extends LLM2UIError {
  /** HTTP status code if available */
  statusCode?: number;
  /** Number of retry attempts made */
  retryCount: number;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      retryCount?: number;
      cause?: Error;
    }
  ) {
    super(message, 'NETWORK_ERROR', true, options?.cause);
    this.name = 'NetworkError';
    this.statusCode = options?.statusCode;
    this.retryCount = options?.retryCount ?? 0;
  }
}

/**
 * Schema validation error
 */
export class SchemaError extends LLM2UIError {
  /** Path to the error in the schema */
  path: string;
  /** Suggested fix for the error */
  suggestion?: string;

  constructor(
    message: string,
    path: string,
    options?: {
      suggestion?: string;
      cause?: Error;
    }
  ) {
    super(message, 'SCHEMA_ERROR', true, options?.cause);
    this.name = 'SchemaError';
    this.path = path;
    this.suggestion = options?.suggestion;
  }
}

/**
 * Unknown component error
 */
export class UnknownComponentError extends LLM2UIError {
  /** The unknown component type */
  componentType: string;
  /** The component ID */
  componentId: string;

  constructor(componentType: string, componentId: string) {
    super(
      `Unknown component type: ${componentType} (id: ${componentId})`,
      'UNKNOWN_COMPONENT',
      true
    );
    this.name = 'UnknownComponentError';
    this.componentType = componentType;
    this.componentId = componentId;
  }
}

// ============================================================================
// Network Error Handling (Requirement 1.5)
// ============================================================================

/**
 * Retry configuration options
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** HTTP status codes that should trigger a retry */
  retryableStatusCodes: number[];
  /** Callback for retry attempts */
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  onRetry: undefined,
};

/**
 * Calculates the delay for a retry attempt using exponential backoff
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  // Add jitter (±10%)
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, config.maxDelay);
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: unknown, config: RetryConfig): boolean {
  if (error instanceof NetworkError) {
    if (error.statusCode) {
      return config.retryableStatusCodes.includes(error.statusCode);
    }
    return true; // Network errors without status codes are generally retryable
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Common retryable error patterns
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnreset') ||
      message.includes('econnrefused') ||
      message.includes('socket hang up') ||
      message.includes('fetch failed')
    );
  }

  return false;
}

/**
 * Wraps a fetch call with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  config: Partial<RetryConfig> = {}
): Promise<Response> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Check if response status is retryable
      if (!response.ok && fullConfig.retryableStatusCodes.includes(response.status)) {
        if (attempt < fullConfig.maxRetries) {
          const delay = calculateRetryDelay(attempt, fullConfig);
          const error = new NetworkError(
            `HTTP ${response.status}: ${response.statusText}`,
            { statusCode: response.status, retryCount: attempt }
          );
          fullConfig.onRetry?.(attempt + 1, error, delay);
          await sleep(delay);
          continue;
        }
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < fullConfig.maxRetries && isRetryableError(error, fullConfig)) {
        const delay = calculateRetryDelay(attempt, fullConfig);
        fullConfig.onRetry?.(attempt + 1, lastError, delay);
        await sleep(delay);
        continue;
      }

      throw new NetworkError(lastError.message, {
        retryCount: attempt,
        cause: lastError,
      });
    }
  }

  throw new NetworkError(
    lastError?.message ?? 'Request failed after retries',
    { retryCount: fullConfig.maxRetries, cause: lastError }
  );
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Network error state for UI display
 */
export interface NetworkErrorState {
  /** Whether there's an active error */
  hasError: boolean;
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** Number of retries attempted */
  retryCount: number;
  /** Whether retry is in progress */
  isRetrying: boolean;
  /** Timestamp of the error */
  timestamp: number;
}

/**
 * Creates an initial network error state
 */
export function createNetworkErrorState(): NetworkErrorState {
  return {
    hasError: false,
    message: '',
    code: '',
    retryCount: 0,
    isRetrying: false,
    timestamp: 0,
  };
}

/**
 * Updates network error state from an error
 */
export function setNetworkError(
  error: Error,
  retryCount = 0
): NetworkErrorState {
  return {
    hasError: true,
    message: error.message,
    code: error instanceof NetworkError ? error.code : 'UNKNOWN_ERROR',
    retryCount,
    isRetrying: false,
    timestamp: Date.now(),
  };
}

/**
 * Clears network error state
 */
export function clearNetworkError(): NetworkErrorState {
  return createNetworkErrorState();
}

/**
 * Gets a user-friendly error message for network errors
 */
export function getNetworkErrorMessage(error: Error): string {
  if (error instanceof NetworkError) {
    if (error.statusCode) {
      switch (error.statusCode) {
        case 401:
          return '认证失败，请检查 API 密钥是否正确';
        case 403:
          return '访问被拒绝，请检查 API 权限';
        case 404:
          return 'API 端点不存在，请检查配置';
        case 429:
          return '请求过于频繁，请稍后重试';
        case 500:
        case 502:
        case 503:
        case 504:
          return '服务器暂时不可用，请稍后重试';
        default:
          return `请求失败 (${error.statusCode})`;
      }
    }
  }

  const message = error.message.toLowerCase();
  if (message.includes('timeout')) {
    return '请求超时，请检查网络连接';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return '网络连接失败，请检查网络设置';
  }

  return error.message || '发生未知错误';
}


// ============================================================================
// Schema Error Handling (Requirement 2.6)
// ============================================================================

import type { ValidationError } from '../types';

/**
 * Schema error with fix suggestion
 */
export interface SchemaErrorWithSuggestion {
  /** Original validation error */
  error: ValidationError;
  /** Suggested fix description */
  suggestion: string;
  /** Auto-fix function if available */
  autoFix?: (schema: string) => string;
}

/**
 * Common schema error patterns and their fix suggestions
 */
const SCHEMA_ERROR_SUGGESTIONS: Record<string, {
  pattern: RegExp;
  suggestion: string;
  autoFix?: (match: RegExpMatchArray, schema: string) => string;
}> = {
  MISSING_VERSION: {
    pattern: /missing required field: version/i,
    suggestion: '添加 "version" 字段，例如: "version": "1.0"',
    autoFix: (_match, schema) => {
      try {
        const obj = JSON.parse(schema);
        obj.version = '1.0';
        return JSON.stringify(obj, null, 2);
      } catch {
        return schema;
      }
    },
  },
  MISSING_ROOT: {
    pattern: /missing required field: root/i,
    suggestion: '添加 "root" 字段，包含根组件定义',
  },
  MISSING_ID: {
    pattern: /missing required field: id at "([^"]+)"/i,
    suggestion: '为组件添加唯一的 "id" 字段',
  },
  MISSING_TYPE: {
    pattern: /missing required field: type at "([^"]+)"/i,
    suggestion: '为组件添加 "type" 字段，指定组件类型（如 "container", "button", "text" 等）',
  },
  DUPLICATE_ID: {
    pattern: /duplicate component id "([^"]+)"/i,
    suggestion: '组件 ID 必须唯一，请修改重复的 ID',
  },
  INVALID_TYPE: {
    pattern: /must be a (string|object|array)/i,
    suggestion: '请检查字段类型是否正确',
  },
  EMPTY_VALUE: {
    pattern: /cannot be empty/i,
    suggestion: '该字段不能为空，请提供有效值',
  },
  INVALID_EVENT: {
    pattern: /event binding.*must be an object/i,
    suggestion: '事件绑定格式应为: { "event": "click", "action": { "type": "..." } }',
  },
  INVALID_LOOP: {
    pattern: /loop config.*must be an object/i,
    suggestion: '循环配置格式应为: { "source": "items", "itemName": "item" }',
  },
};

/**
 * Gets fix suggestions for validation errors
 */
export function getSchemaErrorSuggestions(
  errors: ValidationError[],
  schema: string
): SchemaErrorWithSuggestion[] {
  return errors.map(error => {
    for (const [, config] of Object.entries(SCHEMA_ERROR_SUGGESTIONS)) {
      const match = error.message.match(config.pattern);
      if (match) {
        return {
          error,
          suggestion: config.suggestion,
          autoFix: config.autoFix
            ? () => config.autoFix!(match, schema)
            : undefined,
        };
      }
    }

    // Default suggestion based on error code
    return {
      error,
      suggestion: getDefaultSuggestion(error.code),
    };
  });
}

/**
 * Gets a default suggestion based on error code
 */
function getDefaultSuggestion(code: string): string {
  switch (code) {
    case 'MISSING_FIELD':
      return '请添加缺失的必填字段';
    case 'INVALID_TYPE':
      return '请检查字段类型是否正确';
    case 'INVALID_VALUE':
      return '请提供有效的字段值';
    case 'DUPLICATE_ID':
      return '请确保所有组件 ID 唯一';
    case 'JSON_SYNTAX_ERROR':
      return '请检查 JSON 语法，确保括号、引号、逗号正确';
    default:
      return '请检查 Schema 格式是否正确';
  }
}

/**
 * Schema error display state
 */
export interface SchemaErrorState {
  /** List of errors with suggestions */
  errors: SchemaErrorWithSuggestion[];
  /** Whether there are any errors */
  hasErrors: boolean;
  /** Summary message */
  summary: string;
}

/**
 * Creates schema error state from validation errors
 */
export function createSchemaErrorState(
  errors: ValidationError[],
  schema: string
): SchemaErrorState {
  if (errors.length === 0) {
    return {
      errors: [],
      hasErrors: false,
      summary: '',
    };
  }

  const errorsWithSuggestions = getSchemaErrorSuggestions(errors, schema);

  return {
    errors: errorsWithSuggestions,
    hasErrors: true,
    summary: errors.length === 1
      ? '发现 1 个错误'
      : `发现 ${errors.length} 个错误`,
  };
}

// ============================================================================
// Unknown Component Handling (Requirement 6.5)
// ============================================================================

/**
 * Unknown component log entry
 */
export interface UnknownComponentLog {
  /** Component type that was not found */
  type: string;
  /** Component ID */
  id: string;
  /** Timestamp when the error occurred */
  timestamp: number;
  /** Context information */
  context?: string;
}

/**
 * Unknown component logger
 */
class UnknownComponentLogger {
  private logs: UnknownComponentLog[] = [];
  private maxLogs = 100;
  private listeners: Set<(log: UnknownComponentLog) => void> = new Set();

  /**
   * Logs an unknown component
   */
  log(type: string, id: string, context?: string): void {
    const entry: UnknownComponentLog = {
      type,
      id,
      timestamp: Date.now(),
      context,
    };

    this.logs.push(entry);

    // Trim old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(entry));

    // Console warning in development
    if (import.meta.env?.DEV) {
      console.warn(
        `[llm2ui] Unknown component type: "${type}" (id: ${id})`,
        context ? `Context: ${context}` : ''
      );
    }
  }

  /**
   * Gets all logged unknown components
   */
  getLogs(): UnknownComponentLog[] {
    return [...this.logs];
  }

  /**
   * Gets unique unknown component types
   */
  getUniqueTypes(): string[] {
    return [...new Set(this.logs.map(log => log.type))];
  }

  /**
   * Clears all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Adds a listener for new unknown component logs
   */
  addListener(listener: (log: UnknownComponentLog) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

/**
 * Global unknown component logger instance
 */
export const unknownComponentLogger = new UnknownComponentLogger();

/**
 * Gets suggestions for unknown component types
 */
export function getUnknownComponentSuggestions(type: string): string[] {
  const suggestions: string[] = [];

  // Common component type mappings
  const typeMap: Record<string, string[]> = {
    div: ['container'],
    span: ['text'],
    p: ['text'],
    h1: ['heading'],
    h2: ['heading'],
    h3: ['heading'],
    img: ['image'],
    btn: ['button'],
    input: ['input', 'textarea'],
    select: ['select'],
    checkbox: ['checkbox'],
    radio: ['radio'],
    toggle: ['switch'],
    list: ['list'],
    table: ['table'],
    card: ['card'],
    modal: ['dialog'],
    alert: ['alert'],
    badge: ['badge'],
    avatar: ['avatar'],
    tabs: ['tabs'],
    accordion: ['accordion'],
    form: ['form'],
    separator: ['separator'],
    hr: ['separator'],
  };

  const lowerType = type.toLowerCase();

  // Check direct mapping
  if (typeMap[lowerType]) {
    suggestions.push(...typeMap[lowerType]);
  }

  // Check partial matches
  for (const [key, values] of Object.entries(typeMap)) {
    if (lowerType.includes(key) || key.includes(lowerType)) {
      suggestions.push(...values);
    }
  }

  // Remove duplicates
  return [...new Set(suggestions)];
}

/**
 * Available component types for reference
 */
export const AVAILABLE_COMPONENT_TYPES = [
  'container',
  'card',
  'button',
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'switch',
  'slider',
  'table',
  'list',
  'image',
  'text',
  'heading',
  'badge',
  'avatar',
  'alert',
  'dialog',
  'tabs',
  'accordion',
  'form',
  'separator',
] as const;

export type AvailableComponentType = typeof AVAILABLE_COMPONENT_TYPES[number];
