/**
 * Error Handling Module
 * 
 * Provides centralized error handling utilities including:
 * - Network error handling with retry mechanism
 * - Schema error handling with fix suggestions
 * - Unknown component handling with logging
 * 
 * @module lib/utils/error-handling
 * @see Requirements 1.5, 2.6, 6.5
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
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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

import type { ValidationError } from '../../types';

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
  /** The unknown component type */
  type: string;
  /** The component ID */
  id: string;
  /** Context information */
  context?: string;
  /** Timestamp */
  timestamp: number;
}

/**
 * Unknown component logger for tracking and reporting unknown components
 */
class UnknownComponentLoggerClass {
  private logs: UnknownComponentLog[] = [];
  private listeners: Set<() => void> = new Set();

  /**
   * Log an unknown component
   */
  log(type: string, id: string, context?: string): void {
    this.logs.push({
      type,
      id,
      context,
      timestamp: Date.now(),
    });
    this.notifyListeners();
  }

  /**
   * Get all logs
   */
  getLogs(): UnknownComponentLog[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.notifyListeners();
  }

  /**
   * Add a listener for log changes
   */
  addListener(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }
}

/**
 * Singleton instance of the unknown component logger
 */
export const unknownComponentLogger = new UnknownComponentLoggerClass();

/**
 * Known component types for suggestions
 */
const KNOWN_COMPONENT_TYPES = [
  'container', 'row', 'column', 'card', 'button', 'text', 'input',
  'label', 'image', 'link', 'badge', 'textarea', 'select', 'checkbox',
  'radio', 'switch', 'slider', 'progress', 'avatar', 'icon', 'divider',
  'spacer', 'heading', 'paragraph', 'list', 'table', 'form', 'dialog',
  'alert', 'toast', 'tooltip', 'popover', 'dropdown', 'menu', 'tabs',
  'accordion', 'carousel', 'modal', 'drawer', 'sheet', 'skeleton',
];

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshtein(a: string, b: string): number {
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
 * Get suggestions for an unknown component type
 */
export function getUnknownComponentSuggestions(unknownType: string): string[] {
  const normalizedType = unknownType.toLowerCase();
  
  // Find similar types using Levenshtein distance
  const suggestions = KNOWN_COMPONENT_TYPES
    .map(type => ({
      type,
      distance: levenshtein(normalizedType, type),
    }))
    .filter(({ distance }) => distance <= 3) // Only suggest if distance is small
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(({ type }) => type);

  return suggestions;
}
