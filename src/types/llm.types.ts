/**
 * @file llm.types.ts
 * @description LLM 相关类型定义，包括配置、提供商、响应和流式数据块类型
 * @module types/llm
 * @requirements 5.1, 5.2
 */

import type { RetrievalOptions } from '../lib/examples/example-retriever';

/**
 * 支持的 LLM 提供商类型
 */
export type LLMProvider = 'openai' | 'anthropic' | 'iflow' | 'custom';

/**
 * LLM 配置接口
 * 支持 OpenAI、Anthropic 和自定义提供商
 */
export interface LLMConfig {
  /** LLM 提供商类型 */
  provider: LLMProvider;
  /** API 密钥 */
  apiKey: string;
  /** 模型标识符 (如 'gpt-4', 'claude-3-opus') */
  model: string;
  /** API 端点 URL (自定义提供商必需) */
  endpoint?: string;
  /** 响应最大 token 数 */
  maxTokens?: number;
  /** 温度参数 (0-1) */
  temperature?: number;
  /** 系统提示词 */
  systemPrompt?: string;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** 是否启用案例增强，默认 true */
  enableExampleEnhancement?: boolean;
  /** 案例检索选项 */
  exampleRetrievalOptions?: RetrievalOptions;
}

/**
 * Token 使用统计
 */
export interface TokenUsage {
  /** 提示词 token 数 */
  promptTokens: number;
  /** 完成 token 数 */
  completionTokens: number;
  /** 总 token 数 */
  totalTokens: number;
}

/**
 * LLM 响应接口
 */
export interface LLMResponse {
  /** 响应内容 */
  content: string;
  /** Token 使用统计 */
  usage?: TokenUsage;
  /** 完成原因 */
  finishReason?: string;
}

/**
 * 流式响应数据块
 */
export interface StreamingChunk {
  /** 内容增量 */
  delta: string;
  /** 是否完成 */
  isComplete: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 聊天消息结构
 */
export interface ChatMessage {
  /** 消息角色 */
  role: 'system' | 'user' | 'assistant';
  /** 消息内容 */
  content: string;
}

/**
 * 连接测试结果
 */
export interface TestConnectionResult {
  /** 连接是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * JSON 提取结果
 */
export interface JSONExtractionResult {
  /** 提取是否成功 */
  success: boolean;
  /** 提取的 JSON 字符串 */
  json?: string;
  /** 解析后的 JSON 对象 */
  parsed?: unknown;
  /** 错误信息 */
  error?: string;
}
