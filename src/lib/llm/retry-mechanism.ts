/**
 * @file retry-mechanism.ts
 * @description 智能重试机制模块，在验证失败时带错误信息重新生成
 * @module lib/llm/retry-mechanism
 * @requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */

import type { UISchema } from '../../types';
import type { ChainValidationError, ValidationChainConfig } from '../design-system/validation-chain';
import { executeValidationChain, formatErrorsForLLM } from '../design-system/validation-chain';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 重试状态
 */
export type RetryStatus = 
  | 'generating' 
  | 'validating' 
  | 'retrying' 
  | 'completed' 
  | 'failed';

/**
 * 重试进度事件
 * @see Requirements 9.7
 */
export interface RetryProgressEvent {
  /** 当前尝试次数 (1-3) */
  attempt: number;
  /** 总尝试次数 */
  totalAttempts: number;
  /** 已修复的错误数 */
  errorsFixed: number;
  /** 剩余错误数 */
  errorsRemaining: number;
  /** 当前状态 */
  status: RetryStatus;
  /** 已修复的错误列表 */
  fixedErrors: ChainValidationError[];
  /** 剩余错误列表 */
  remainingErrors: ChainValidationError[];
}

/**
 * 重试配置
 */
export interface RetryConfig {
  /** 最大重试次数 (默认: 3) */
  maxRetries?: number;
  /** 总超时时间 (ms, 默认: 30000) */
  timeout?: number;
  /** 进度回调 */
  onProgress?: (event: RetryProgressEvent) => void;
  /** 验证链配置 */
  validationConfig?: ValidationChainConfig;
}

/**
 * 单次尝试结果
 */
export interface AttemptResult {
  /** 生成的原始输出 */
  rawOutput: string;
  /** 解析后的 Schema (如果有效) */
  schema?: UISchema;
  /** 错误列表 */
  errors: ChainValidationError[];
  /** 警告列表 */
  warnings: ChainValidationError[];
  /** 是否通过验证 */
  valid: boolean;
}


/**
 * 重试结果
 * @see Requirements 9.5, 9.6
 */
export interface RetryResult {
  /** 是否成功 */
  success: boolean;
  /** 最终 Schema (成功时) */
  schema?: UISchema;
  /** 最终错误列表 (失败时) */
  errors: ChainValidationError[];
  /** 最终警告列表 */
  warnings: ChainValidationError[];
  /** 尝试次数 */
  attempts: number;
  /** 总耗时 (ms) */
  totalTime: number;
  /** 最佳尝试 (错误最少的) */
  bestAttempt?: {
    schema: UISchema;
    errors: ChainValidationError[];
  };
  /** 是否因超时终止 */
  timedOut?: boolean;
}

/**
 * LLM 生成函数类型
 */
export type LLMGenerateFunction = (
  prompt: string,
  errorContext?: string
) => Promise<string>;

// ============================================================================
// 默认配置
// ============================================================================

/**
 * 默认 LLM 重试配置
 */
export const DEFAULT_LLM_RETRY_CONFIG: Required<Omit<RetryConfig, 'onProgress' | 'validationConfig'>> = {
  maxRetries: 3,
  timeout: 30000,
};

// ============================================================================
// 内部辅助函数
// ============================================================================

/**
 * 创建错误键用于比较
 * 使用 layer + path + message 作为唯一标识
 */
function createErrorKey(error: ChainValidationError): string {
  return `${error.layer}:${error.path}:${error.message}`;
}

/**
 * 比较两次尝试的错误，找出已修复和剩余的错误
 * @see Requirements 9.4
 */
export function compareErrors(
  previousErrors: ChainValidationError[],
  currentErrors: ChainValidationError[]
): {
  fixed: ChainValidationError[];
  remaining: ChainValidationError[];
  newErrors: ChainValidationError[];
} {
  const previousKeys = new Set(previousErrors.map(createErrorKey));
  const currentKeys = new Set(currentErrors.map(createErrorKey));

  // 已修复的错误：在上次存在但这次不存在
  const fixed = previousErrors.filter(
    err => !currentKeys.has(createErrorKey(err))
  );

  // 剩余的错误：在上次存在且这次也存在
  const remaining = currentErrors.filter(
    err => previousKeys.has(createErrorKey(err))
  );

  // 新出现的错误：这次存在但上次不存在
  const newErrors = currentErrors.filter(
    err => !previousKeys.has(createErrorKey(err))
  );

  return { fixed, remaining, newErrors };
}

/**
 * 构建带错误上下文的提示词
 * @see Requirements 9.2, 9.3
 */
export function buildRetryPrompt(
  basePrompt: string,
  errors: ChainValidationError[],
  previousOutput?: string
): string {
  const parts: string[] = [basePrompt];

  // 添加错误上下文
  const errorContext = formatErrorsForLLM(errors);
  if (errorContext) {
    parts.push('\n\n' + errorContext);
  }

  // 添加上次输出作为参考
  if (previousOutput) {
    parts.push('\n\n## Previous Output (for reference)\n```json\n' + previousOutput + '\n```');
  }

  return parts.join('');
}

/**
 * 选择最佳尝试（错误最少的）
 * @see Requirements 9.5
 */
function selectBestAttempt(
  attempts: AttemptResult[]
): { schema: UISchema; errors: ChainValidationError[] } | undefined {
  // 过滤出有 schema 的尝试
  const validAttempts = attempts.filter(
    (a): a is AttemptResult & { schema: UISchema } => a.schema !== undefined
  );

  if (validAttempts.length === 0) {
    return undefined;
  }

  // 按错误数量排序，选择最少的
  validAttempts.sort((a, b) => a.errors.length - b.errors.length);
  
  return {
    schema: validAttempts[0].schema,
    errors: validAttempts[0].errors,
  };
}


// ============================================================================
// 主要导出函数
// ============================================================================

/**
 * 执行带重试的 LLM 生成
 * 
 * 流程：
 * 1. 调用 LLM 生成
 * 2. 执行验证链
 * 3. 如果验证失败且未超过重试次数，带错误上下文重试
 * 4. 返回最终结果或最佳尝试
 * 
 * @param generateFn - LLM 生成函数
 * @param basePrompt - 基础提示词
 * @param config - 重试配置
 * @returns 重试结果
 * 
 * @see Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */
export async function executeWithRetry(
  generateFn: LLMGenerateFunction,
  basePrompt: string,
  config?: RetryConfig
): Promise<RetryResult> {
  const maxRetries = config?.maxRetries ?? DEFAULT_LLM_RETRY_CONFIG.maxRetries;
  const timeout = config?.timeout ?? DEFAULT_LLM_RETRY_CONFIG.timeout;
  const onProgress = config?.onProgress;
  const validationConfig = config?.validationConfig;

  const startTime = performance.now();
  const attempts: AttemptResult[] = [];
  let previousErrors: ChainValidationError[] = [];
  let previousOutput: string | undefined;
  let timedOut = false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // 检查超时
    const elapsed = performance.now() - startTime;
    if (elapsed >= timeout) {
      timedOut = true;
      break;
    }

    // 计算剩余时间
    const remainingTime = timeout - elapsed;

    // 发送进度事件：开始生成
    if (onProgress) {
      const comparison = attempt > 1 
        ? compareErrors(previousErrors, [])
        : { fixed: [], remaining: [], newErrors: [] };
      
      onProgress({
        attempt,
        totalAttempts: maxRetries,
        errorsFixed: comparison.fixed.length,
        errorsRemaining: previousErrors.length,
        status: attempt === 1 ? 'generating' : 'retrying',
        fixedErrors: comparison.fixed,
        remainingErrors: previousErrors,
      });
    }

    try {
      // 构建提示词
      const prompt = attempt === 1
        ? basePrompt
        : buildRetryPrompt(basePrompt, previousErrors, previousOutput);

      // 调用 LLM 生成（带超时）
      const generatePromise = generateFn(prompt, attempt > 1 ? formatErrorsForLLM(previousErrors) : undefined);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Generation timeout')), remainingTime);
      });

      let rawOutput: string;
      try {
        rawOutput = await Promise.race([generatePromise, timeoutPromise]);
      } catch (err) {
        if (err instanceof Error && err.message === 'Generation timeout') {
          timedOut = true;
          break;
        }
        throw err;
      }

      // 发送进度事件：开始验证
      if (onProgress) {
        onProgress({
          attempt,
          totalAttempts: maxRetries,
          errorsFixed: 0,
          errorsRemaining: previousErrors.length,
          status: 'validating',
          fixedErrors: [],
          remainingErrors: previousErrors,
        });
      }

      // 执行验证链
      const validationResult = executeValidationChain(rawOutput, validationConfig);

      // 记录尝试结果
      const attemptResult: AttemptResult = {
        rawOutput,
        schema: validationResult.schema,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        valid: validationResult.valid,
      };
      attempts.push(attemptResult);

      // 如果验证通过，返回成功
      if (validationResult.valid && validationResult.schema) {
        const totalTime = performance.now() - startTime;
        
        if (onProgress) {
          const comparison = compareErrors(previousErrors, validationResult.errors);
          onProgress({
            attempt,
            totalAttempts: maxRetries,
            errorsFixed: comparison.fixed.length,
            errorsRemaining: 0,
            status: 'completed',
            fixedErrors: comparison.fixed,
            remainingErrors: [],
          });
        }

        return {
          success: true,
          schema: validationResult.schema,
          errors: [],
          warnings: validationResult.warnings,
          attempts: attempt,
          totalTime,
        };
      }

      // 计算错误变化
      const comparison = compareErrors(previousErrors, validationResult.errors);

      // 发送进度事件：验证失败
      if (onProgress) {
        onProgress({
          attempt,
          totalAttempts: maxRetries,
          errorsFixed: comparison.fixed.length,
          errorsRemaining: validationResult.errors.length,
          status: attempt < maxRetries ? 'retrying' : 'failed',
          fixedErrors: comparison.fixed,
          remainingErrors: validationResult.errors,
        });
      }

      // 更新状态用于下次重试
      previousErrors = validationResult.errors;
      previousOutput = rawOutput;

    } catch (error) {
      // 生成过程中的错误
      const errorMessage = error instanceof Error ? error.message : String(error);
      attempts.push({
        rawOutput: '',
        errors: [{
          layer: 'json-syntax',
          severity: 'error',
          path: '',
          message: `Generation failed: ${errorMessage}`,
        }],
        warnings: [],
        valid: false,
      });

      // 如果是超时错误，跳出循环
      if (errorMessage.includes('timeout')) {
        timedOut = true;
        break;
      }
    }
  }

  // 所有重试都失败，返回最佳尝试
  const totalTime = performance.now() - startTime;
  const bestAttempt = selectBestAttempt(attempts);
  const lastAttempt = attempts[attempts.length - 1];

  if (onProgress) {
    onProgress({
      attempt: attempts.length,
      totalAttempts: maxRetries,
      errorsFixed: 0,
      errorsRemaining: lastAttempt?.errors.length ?? 0,
      status: 'failed',
      fixedErrors: [],
      remainingErrors: lastAttempt?.errors ?? [],
    });
  }

  return {
    success: false,
    errors: lastAttempt?.errors ?? [],
    warnings: lastAttempt?.warnings ?? [],
    attempts: attempts.length,
    totalTime,
    bestAttempt,
    timedOut,
  };
}


/**
 * 创建带超时的 Promise
 * @param promise - 原始 Promise
 * @param timeoutMs - 超时时间（毫秒）
 * @returns 带超时的 Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * 计算错误修复率
 * @param previousErrors - 上次的错误列表
 * @param currentErrors - 当前的错误列表
 * @returns 修复率 (0-1)
 */
export function calculateFixRate(
  previousErrors: ChainValidationError[],
  currentErrors: ChainValidationError[]
): number {
  if (previousErrors.length === 0) {
    return currentErrors.length === 0 ? 1 : 0;
  }
  
  const { fixed } = compareErrors(previousErrors, currentErrors);
  return fixed.length / previousErrors.length;
}
