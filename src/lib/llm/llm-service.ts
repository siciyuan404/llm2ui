/**
 * LLM Service Module
 * 
 * Provides configuration management, streaming response handling,
 * and JSON extraction for LLM interactions.
 * Supports example-driven generation for enhanced UI generation quality.
 * 
 * @module lib/llm/llm-service
 * @see Requirements 1.4 (LLM 子目录)
 * @see Requirements 7.4
 * @see Requirements 6.1, 6.2, 6.3, 6.4, 6.5 (案例驱动生成)
 */

import type { UISchema } from '../../types';
import { fixUISchema, type FixResult } from '../core/schema-fixer';
import { generateSystemPrompt, type PromptGeneratorOptions } from './prompt-generator';
import type { RetrievalOptions } from '../examples/example-retriever';

/**
 * Supported LLM providers
 */
export type LLMProvider = 'openai' | 'anthropic' | 'iflow' | 'custom';

/**
 * LLM Configuration interface
 * Supports OpenAI, Anthropic, and custom providers
 */
export interface LLMConfig {
  /** LLM provider type */
  provider: LLMProvider;
  /** API key for authentication */
  apiKey: string;
  /** Model identifier (e.g., 'gpt-4', 'claude-3-opus') */
  model: string;
  /** API endpoint URL (required for custom provider) */
  endpoint?: string;
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Temperature for response randomness (0-1) */
  temperature?: number;
  /** System prompt to prepend to conversations */
  systemPrompt?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers for API requests */
  headers?: Record<string, string>;
  /** 是否启用案例增强，默认 true */
  enableExampleEnhancement?: boolean;
  /** 案例检索选项 */
  exampleRetrievalOptions?: RetrievalOptions;
}

/**
 * Default configurations for each provider
 */
export const DEFAULT_CONFIGS: Record<LLMProvider, Partial<LLMConfig>> = {
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 60000,
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-opus-20240229',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 60000,
  },
  iflow: {
    endpoint: 'https://apis.iflow.cn/v1/chat/completions',
    model: 'glm-4.6',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 60000,
  },
  custom: {
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 60000,
  },
};


/**
 * Validates LLM configuration
 */
export function validateLLMConfig(config: LLMConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.provider) {
    errors.push('Provider is required');
  }

  if (!config.apiKey) {
    errors.push('API key is required');
  }

  if (!config.model) {
    errors.push('Model is required');
  }

  if (config.provider === 'custom' && !config.endpoint) {
    errors.push('Endpoint is required for custom provider');
  }

  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 1)) {
    errors.push('Temperature must be between 0 and 1');
  }

  if (config.maxTokens !== undefined && config.maxTokens <= 0) {
    errors.push('Max tokens must be positive');
  }

  if (config.timeout !== undefined && config.timeout <= 0) {
    errors.push('Timeout must be positive');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Creates a complete LLM configuration by merging with defaults
 */
export function createLLMConfig(config: LLMConfig): LLMConfig {
  const defaults = DEFAULT_CONFIGS[config.provider] || DEFAULT_CONFIGS.custom;
  return {
    ...defaults,
    ...config,
  };
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  /** Message role */
  role: 'system' | 'user' | 'assistant';
  /** Message content */
  content: string;
}

/**
 * Streaming chunk from LLM response
 */
export interface StreamChunk {
  /** Content delta */
  content: string;
  /** Whether this is the final chunk */
  done: boolean;
  /** Error if any */
  error?: string;
}

/**
 * Injects system prompt into messages array if configured
 */
export function injectSystemPrompt(
  messages: ChatMessage[],
  config: LLMConfig
): ChatMessage[] {
  if (!config.systemPrompt) {
    return messages;
  }

  if (messages.length > 0 && messages[0].role === 'system') {
    return messages;
  }

  return [
    { role: 'system', content: config.systemPrompt },
    ...messages,
  ];
}

/**
 * Builds request body for OpenAI API
 * @internal Exported for testing purposes
 */
export function buildOpenAIRequest(
  messages: ChatMessage[],
  config: LLMConfig
): Record<string, unknown> {
  return {
    model: config.model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    stream: true,
  };
}

/**
 * Builds request body for Anthropic API
 * @internal Exported for testing purposes
 */
export function buildAnthropicRequest(
  messages: ChatMessage[],
  config: LLMConfig
): Record<string, unknown> {
  const systemMessage = messages.find((m) => m.role === 'system');
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');

  return {
    model: config.model,
    max_tokens: config.maxTokens,
    ...(systemMessage && { system: systemMessage.content }),
    messages: nonSystemMessages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    stream: true,
  };
}

/**
 * Builds request headers for the specified provider
 * @internal Exported for testing purposes
 */
export function buildHeaders(config: LLMConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  switch (config.provider) {
    case 'openai':
    case 'iflow':
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
    case 'anthropic':
      headers['x-api-key'] = config.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'custom':
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
  }

  return headers;
}


/**
 * Parses Server-Sent Events (SSE) data
 */
function parseSSEData(text: string): { jsonBlocks: string[]; done: boolean } {
  const jsonBlocks: string[] = [];
  let done = false;
  
  if (text.includes('[DONE]')) {
    done = true;
  }
  
  let remaining = text;
  
  while (remaining.length > 0) {
    const dataIndex = remaining.indexOf('data:');
    if (dataIndex === -1) break;
    
    let jsonStart = dataIndex + 5;
    while (jsonStart < remaining.length && remaining[jsonStart] === ' ') {
      jsonStart++;
    }
    
    if (remaining.slice(jsonStart).startsWith('[DONE]')) {
      done = true;
      remaining = remaining.slice(jsonStart + 6);
      continue;
    }
    
    if (remaining[jsonStart] === '{') {
      let depth = 0;
      let inString = false;
      let escaped = false;
      let jsonEnd = jsonStart;
      
      for (let i = jsonStart; i < remaining.length; i++) {
        const char = remaining[i];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\' && inString) {
          escaped = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') {
            depth++;
          } else if (char === '}') {
            depth--;
            if (depth === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }
      }
      
      if (depth === 0 && jsonEnd > jsonStart) {
        const jsonStr = remaining.slice(jsonStart, jsonEnd);
        jsonBlocks.push(jsonStr);
        remaining = remaining.slice(jsonEnd);
      } else {
        break;
      }
    } else {
      remaining = remaining.slice(jsonStart);
    }
  }
  
  return { jsonBlocks, done };
}

function extractOpenAIContent(data: string): string {
  try {
    const parsed = JSON.parse(data);
    const delta = parsed.choices?.[0]?.delta;
    if (!delta) return '';
    return delta.content || '';
  } catch {
    return '';
  }
}

function extractAnthropicContent(data: string): string {
  try {
    const parsed = JSON.parse(data);
    if (parsed.type === 'content_block_delta') {
      return parsed.delta?.text || '';
    }
    return '';
  } catch {
    return '';
  }
}

interface SystemPromptCache {
  prompt: string;
  userInput: string | undefined;
  retrievalOptions: RetrievalOptions | undefined;
  timestamp: number;
}

let systemPromptCache: SystemPromptCache | null = null;
const CACHE_TTL = 5 * 60 * 1000;

function generateCacheKey(
  userInput: string | undefined,
  retrievalOptions: RetrievalOptions | undefined
): string {
  return JSON.stringify({ userInput, retrievalOptions });
}

function isCacheValid(
  cache: SystemPromptCache | null,
  userInput: string | undefined,
  retrievalOptions: RetrievalOptions | undefined
): boolean {
  if (!cache) return false;
  if (Date.now() - cache.timestamp > CACHE_TTL) return false;
  const currentKey = generateCacheKey(userInput, retrievalOptions);
  const cachedKey = generateCacheKey(cache.userInput, cache.retrievalOptions);
  return currentKey === cachedKey;
}

export function getEnhancedSystemPrompt(
  userInput: string | undefined,
  retrievalOptions?: RetrievalOptions,
  language: 'zh' | 'en' = 'zh'
): string {
  if (isCacheValid(systemPromptCache, userInput, retrievalOptions)) {
    return systemPromptCache!.prompt;
  }
  
  const options: PromptGeneratorOptions = {
    includeRelevantExamples: true,
    userInput,
    retrievalOptions,
    language,
  };
  
  const prompt = generateSystemPrompt(options);
  
  systemPromptCache = {
    prompt,
    userInput,
    retrievalOptions,
    timestamp: Date.now(),
  };
  
  return prompt;
}

export function clearSystemPromptCache(): void {
  systemPromptCache = null;
}

function extractUserInput(messages: ChatMessage[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      return messages[i].content;
    }
  }
  return undefined;
}


/**
 * Sends a message to the LLM and returns an async iterator for streaming response
 */
export async function* sendMessage(
  messages: ChatMessage[],
  config: LLMConfig
): AsyncGenerator<StreamChunk> {
  const fullConfig = createLLMConfig(config);
  const validation = validateLLMConfig(fullConfig);

  if (!validation.valid) {
    yield { content: '', done: true, error: validation.errors.join(', ') };
    return;
  }

  let configWithEnhancedPrompt = fullConfig;
  const enableExampleEnhancement = fullConfig.enableExampleEnhancement !== false;
  
  if (enableExampleEnhancement && !fullConfig.systemPrompt) {
    const userInput = extractUserInput(messages);
    const enhancedPrompt = getEnhancedSystemPrompt(
      userInput,
      fullConfig.exampleRetrievalOptions,
      'zh'
    );
    configWithEnhancedPrompt = {
      ...fullConfig,
      systemPrompt: enhancedPrompt,
    };
  }

  const messagesWithPrompt = injectSystemPrompt(messages, configWithEnhancedPrompt);

  const endpoint = fullConfig.endpoint!;
  const headers = buildHeaders(fullConfig);

  let body: Record<string, unknown>;
  switch (fullConfig.provider) {
    case 'openai':
    case 'iflow':
      body = buildOpenAIRequest(messagesWithPrompt, fullConfig);
      break;
    case 'anthropic':
      body = buildAnthropicRequest(messagesWithPrompt, fullConfig);
      break;
    default:
      body = buildOpenAIRequest(messagesWithPrompt, fullConfig);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), fullConfig.timeout);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      yield { content: '', done: true, error: `API error: ${response.status} - ${errorText}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { content: '', done: true, error: 'No response body' };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done: readerDone, value } = await reader.read();

      if (readerDone) {
        if (buffer.trim()) {
          const { jsonBlocks } = parseSSEData(buffer);
          for (const jsonStr of jsonBlocks) {
            let content: string;
            switch (fullConfig.provider) {
              case 'openai':
              case 'iflow':
                content = extractOpenAIContent(jsonStr);
                break;
              case 'anthropic':
                content = extractAnthropicContent(jsonStr);
                break;
              default:
                content = extractOpenAIContent(jsonStr);
            }
            if (content) {
              yield { content, done: false };
            }
          }
        }
        yield { content: '', done: true };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      const { jsonBlocks, done: sseDone } = parseSSEData(buffer);
      
      for (const jsonStr of jsonBlocks) {
        let content: string;
        switch (fullConfig.provider) {
          case 'openai':
          case 'iflow':
            content = extractOpenAIContent(jsonStr);
            break;
          case 'anthropic':
            content = extractAnthropicContent(jsonStr);
            break;
          default:
            content = extractOpenAIContent(jsonStr);
        }
        if (content) {
          yield { content, done: false };
        }
      }
      
      if (sseDone) {
        yield { content: '', done: true };
        return;
      }
      
      const lastDataIndex = buffer.lastIndexOf('data:');
      if (lastDataIndex !== -1 && jsonBlocks.length > 0) {
        const afterLastBlock = buffer.slice(lastDataIndex);
        const { jsonBlocks: checkBlocks } = parseSSEData(afterLastBlock);
        if (checkBlocks.length === 0) {
          buffer = afterLastBlock;
        } else {
          buffer = '';
        }
      } else if (jsonBlocks.length > 0) {
        buffer = '';
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        yield { content: '', done: true, error: 'Request timeout' };
      } else {
        yield { content: '', done: true, error: error.message };
      }
    } else {
      yield { content: '', done: true, error: 'Unknown error' };
    }
  }
}


/**
 * Result of JSON extraction from LLM response
 */
export interface JSONExtractionResult {
  success: boolean;
  json?: string;
  parsed?: unknown;
  error?: string;
}

/**
 * Extracted JSON block with metadata
 */
export interface ExtractedJSONBlock {
  content: string;
  format: 'json' | 'generic' | 'raw';
  startIndex: number;
  endIndex: number;
}

/**
 * Extracts JSON code blocks from text with metadata
 */
export function extractJSONBlocksWithMetadata(text: string): ExtractedJSONBlock[] {
  const blocks: ExtractedJSONBlock[] = [];
  
  if (!text || typeof text !== 'string') {
    return blocks;
  }

  const jsonBlockRegex = /```json\s*([\s\S]*?)```/gi;
  let match;

  while ((match = jsonBlockRegex.exec(text)) !== null) {
    const content = match[1].trim();
    if (content) {
      blocks.push({
        content,
        format: 'json',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  const genericBlockRegex = /```(?!json\s)(\w*)\s*([\s\S]*?)```/gi;
  while ((match = genericBlockRegex.exec(text)) !== null) {
    const content = match[2].trim();
    if (content && (content.startsWith('{') || content.startsWith('['))) {
      const overlaps = blocks.some(
        b => (match!.index >= b.startIndex && match!.index < b.endIndex) ||
             (b.startIndex >= match!.index && b.startIndex < match!.index + match![0].length)
      );
      if (!overlaps) {
        blocks.push({
          content,
          format: 'generic',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  }

  if (blocks.length === 0) {
    const rawJsonMatches = findBalancedJSON(text);
    for (const rawMatch of rawJsonMatches) {
      blocks.push({
        content: rawMatch.content,
        format: 'raw',
        startIndex: rawMatch.startIndex,
        endIndex: rawMatch.endIndex,
      });
    }
  }

  blocks.sort((a, b) => a.startIndex - b.startIndex);

  return blocks;
}

function findBalancedJSON(text: string): Array<{ content: string; startIndex: number; endIndex: number }> {
  const results: Array<{ content: string; startIndex: number; endIndex: number }> = [];
  
  let i = 0;
  while (i < text.length) {
    if (text[i] === '{' || text[i] === '[') {
      const startChar = text[i];
      const endChar = startChar === '{' ? '}' : ']';
      const startIndex = i;
      let depth = 1;
      let inString = false;
      let escaped = false;
      
      i++;
      while (i < text.length && depth > 0) {
        const char = text[i];
        
        if (escaped) {
          escaped = false;
        } else if (char === '\\' && inString) {
          escaped = true;
        } else if (char === '"' && !escaped) {
          inString = !inString;
        } else if (!inString) {
          if (char === startChar || char === (startChar === '{' ? '[' : '{')) {
            depth++;
          } else if (char === endChar || char === (endChar === '}' ? ']' : '}')) {
            depth--;
          }
        }
        i++;
      }
      
      if (depth === 0) {
        const content = text.slice(startIndex, i);
        if (isLikelyJSON(content)) {
          results.push({
            content,
            startIndex,
            endIndex: i,
          });
        }
      }
    } else {
      i++;
    }
  }
  
  return results;
}

function isLikelyJSON(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return false;
  }
  
  if (trimmed.startsWith('{')) {
    return trimmed.includes(':');
  }
  
  return trimmed.endsWith(']');
}

export function extractJSONBlocks(text: string): string[] {
  const blocksWithMetadata = extractJSONBlocksWithMetadata(text);
  return blocksWithMetadata.map(block => block.content);
}

export function extractJSON(text: string): JSONExtractionResult {
  if (!text || typeof text !== 'string') {
    return { success: false, error: 'Invalid input: text is required' };
  }

  const blocksWithMetadata = extractJSONBlocksWithMetadata(text);

  if (blocksWithMetadata.length === 0) {
    return { success: false, error: 'No JSON blocks found in text' };
  }

  const parseErrors: string[] = [];
  for (const block of blocksWithMetadata) {
    try {
      const parsed = JSON.parse(block.content);
      return { success: true, json: block.content, parsed };
    } catch (e) {
      const error = e as SyntaxError;
      parseErrors.push(`Block at position ${block.startIndex}: ${error.message}`);
    }
  }

  return { 
    success: false, 
    error: `Failed to parse any JSON blocks. Errors: ${parseErrors.join('; ')}` 
  };
}

export function extractAllJSON(text: string): unknown[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const blocksWithMetadata = extractJSONBlocksWithMetadata(text);
  const results: unknown[] = [];

  for (const block of blocksWithMetadata) {
    try {
      const parsed = JSON.parse(block.content);
      results.push(parsed);
    } catch {
      // Skip invalid JSON blocks
    }
  }

  return results;
}


export interface ExtractUISchemaOptions {
  autoFix?: boolean;
}

export interface ExtractUISchemaResult {
  schema: UISchema | null;
  fixResult?: FixResult;
}

export function extractUISchema(text: string, options?: ExtractUISchemaOptions): UISchema | null;
export function extractUISchema(text: string, options: ExtractUISchemaOptions & { autoFix: true }): ExtractUISchemaResult;
export function extractUISchema(text: string, options?: ExtractUISchemaOptions): UISchema | null | ExtractUISchemaResult {
  const result = extractJSON(text);

  if (!result.success || !result.parsed) {
    if (options?.autoFix) {
      return { schema: null };
    }
    return null;
  }

  const parsed = result.parsed as Record<string, unknown>;

  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'root' in parsed &&
    typeof parsed.root === 'object' &&
    parsed.root !== null
  ) {
    const root = parsed.root as Record<string, unknown>;
    if ('id' in root && 'type' in root) {
      if (!('version' in parsed)) {
        parsed.version = '1.0';
      }
      
      if (options?.autoFix) {
        const fixResult = fixUISchema(parsed);
        return {
          schema: fixResult.fixed ? fixResult.schema! : (parsed as unknown as UISchema),
          fixResult,
        };
      }
      
      return parsed as unknown as UISchema;
    }
  }

  if (options?.autoFix) {
    const fixResult = fixUISchema(parsed);
    return {
      schema: fixResult.fixed ? fixResult.schema! : null,
      fixResult,
    };
  }

  return null;
}

export async function collectStreamResponse(
  stream: AsyncGenerator<StreamChunk>
): Promise<{ content: string; error?: string }> {
  let content = '';
  let error: string | undefined;

  for await (const chunk of stream) {
    if (chunk.error) {
      error = chunk.error;
      break;
    }
    content += chunk.content;
  }

  return { content, error };
}

export interface TestConnectionResult {
  success: boolean;
  error?: string;
}

export async function testConnection(config: LLMConfig): Promise<TestConnectionResult> {
  const fullConfig = createLLMConfig(config);
  const validation = validateLLMConfig(fullConfig);

  if (!validation.valid) {
    return { success: false, error: validation.errors.join(', ') };
  }

  const endpoint = fullConfig.endpoint!;
  const headers = buildHeaders(fullConfig);

  const testMessages: ChatMessage[] = [
    { role: 'user', content: 'Hi' }
  ];

  const testConfig = { ...fullConfig, maxTokens: 5 };
  let body: Record<string, unknown>;
  
  switch (fullConfig.provider) {
    case 'openai':
    case 'iflow':
      body = buildOpenAIRequest(testMessages, testConfig);
      body.stream = false;
      break;
    case 'anthropic':
      body = buildAnthropicRequest(testMessages, testConfig);
      body.stream = false;
      break;
    default:
      body = buildOpenAIRequest(testMessages, testConfig);
      body.stream = false;
  }

  const controller = new AbortController();
  const testTimeout = Math.min(fullConfig.timeout || 60000, 15000);
  const timeoutId = setTimeout(() => controller.abort(), testTimeout);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        if (errorText) {
          errorMessage = `${errorMessage} - ${errorText.substring(0, 200)}`;
        }
      }

      if (response.status === 401) {
        return { success: false, error: 'API 密钥无效或已过期' };
      } else if (response.status === 403) {
        return { success: false, error: '访问被拒绝，请检查 API 密钥权限' };
      } else if (response.status === 404) {
        return { success: false, error: 'API 端点不存在，请检查端点地址' };
      } else if (response.status === 429) {
        return { success: false, error: '请求频率超限，请稍后重试' };
      } else if (response.status >= 500) {
        return { success: false, error: '服务器错误，请稍后重试' };
      }

      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { success: false, error: '连接超时，请检查网络或端点地址' };
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, error: '网络连接失败，请检查网络设置或端点地址' };
      }
      
      return { success: false, error: error.message };
    }
    
    return { success: false, error: '未知错误' };
  }
}
