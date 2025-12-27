/**
 * LLM Service Module
 * 
 * Provides configuration management, streaming response handling,
 * and JSON extraction for LLM interactions.
 */

import type { UISchema } from '../types';

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
 * 
 * If the config has a systemPrompt and the messages don't already start
 * with a system message, prepends a system message with the prompt.
 * 
 * @param messages - Original messages array
 * @param config - LLM configuration with optional systemPrompt
 * @returns Messages array with system prompt injected if applicable
 * 
 * @see Requirements 6.3
 */
export function injectSystemPrompt(
  messages: ChatMessage[],
  config: LLMConfig
): ChatMessage[] {
  // If no system prompt configured, return original messages
  if (!config.systemPrompt) {
    return messages;
  }

  // If messages already start with a system message, don't inject
  if (messages.length > 0 && messages[0].role === 'system') {
    return messages;
  }

  // Prepend system prompt as first message
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
 * Handles both "data: {...}" and "data:{...}" formats
 * Also handles multiple data blocks concatenated together (e.g., iFlow API)
 * 
 * @param text - Raw SSE text that may contain multiple data blocks
 * @returns Object with parsed JSON strings and whether [DONE] was found
 */
function parseSSEData(text: string): { jsonBlocks: string[]; done: boolean } {
  const jsonBlocks: string[] = [];
  let done = false;
  
  // Check for [DONE] signal
  if (text.includes('[DONE]')) {
    done = true;
  }
  
  // Find all data: blocks and extract JSON content
  // This regex handles nested braces in JSON objects
  let remaining = text;
  
  while (remaining.length > 0) {
    // Find next "data:" prefix
    const dataIndex = remaining.indexOf('data:');
    if (dataIndex === -1) break;
    
    // Skip past "data:" and optional whitespace
    let jsonStart = dataIndex + 5;
    while (jsonStart < remaining.length && remaining[jsonStart] === ' ') {
      jsonStart++;
    }
    
    // Check if it's [DONE]
    if (remaining.slice(jsonStart).startsWith('[DONE]')) {
      done = true;
      remaining = remaining.slice(jsonStart + 6);
      continue;
    }
    
    // Find the JSON object by counting braces
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
        // Incomplete JSON, break and wait for more data
        break;
      }
    } else {
      // Not a JSON object, skip this data block
      remaining = remaining.slice(jsonStart);
    }
  }
  
  return { jsonBlocks, done };
}

/**
 * Extracts content from OpenAI streaming response chunk
 * Also handles GLM models that have reasoning_content field
 */
function extractOpenAIContent(data: string): string {
  try {
    const parsed = JSON.parse(data);
    const delta = parsed.choices?.[0]?.delta;
    if (!delta) return '';
    
    // GLM models may have content in reasoning_content during thinking phase
    // We prioritize content over reasoning_content for display
    const content = delta.content || '';
    
    return content;
  } catch {
    return '';
  }
}

/**
 * Extracts content from Anthropic streaming response chunk
 */
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

/**
 * Sends a message to the LLM and returns an async iterator for streaming response
 * 
 * Automatically injects system prompt if configured in the LLM config.
 * 
 * @param messages - Array of chat messages
 * @param config - LLM configuration
 * @yields StreamChunk - Streaming chunks of the response
 * 
 * @see Requirements 6.3
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

  // Inject system prompt if configured
  const messagesWithPrompt = injectSystemPrompt(messages, fullConfig);

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
        // Process any remaining buffer before finishing
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
      
      // Parse SSE data - handles both newline-separated and concatenated formats
      const { jsonBlocks, done: sseDone } = parseSSEData(buffer);
      
      // Process all complete JSON blocks
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
      
      // Check if we received [DONE] signal
      if (sseDone) {
        yield { content: '', done: true };
        return;
      }
      
      // Keep only the unparsed remainder in buffer
      // Find the last complete data block and keep everything after it
      const lastDataIndex = buffer.lastIndexOf('data:');
      if (lastDataIndex !== -1 && jsonBlocks.length > 0) {
        // Check if there's incomplete data after the last parsed block
        const afterLastBlock = buffer.slice(lastDataIndex);
        const { jsonBlocks: checkBlocks } = parseSSEData(afterLastBlock);
        if (checkBlocks.length === 0) {
          // There's incomplete data, keep it in buffer
          buffer = afterLastBlock;
        } else {
          // All data was parsed, clear buffer
          buffer = '';
        }
      } else if (jsonBlocks.length > 0) {
        // All data was parsed, clear buffer
        buffer = '';
      }
      // If no blocks were parsed, keep accumulating in buffer
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
  /** Whether extraction was successful */
  success: boolean;
  /** Extracted JSON string (if successful) */
  json?: string;
  /** Parsed JSON object (if successful) */
  parsed?: unknown;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Extracted JSON block with metadata
 */
export interface ExtractedJSONBlock {
  /** The raw JSON string content */
  content: string;
  /** The format of the code block */
  format: 'json' | 'generic' | 'raw';
  /** Start position in the original text */
  startIndex: number;
  /** End position in the original text */
  endIndex: number;
}

/**
 * Extracts JSON code blocks from text with metadata
 * Supports ```json ... ```, ``` ... ```, and raw JSON formats
 * 
 * @param text - Text containing JSON code blocks
 * @returns Array of extracted JSON blocks with metadata
 */
export function extractJSONBlocksWithMetadata(text: string): ExtractedJSONBlock[] {
  const blocks: ExtractedJSONBlock[] = [];
  
  if (!text || typeof text !== 'string') {
    return blocks;
  }

  // Match ```json ... ``` blocks (case-insensitive)
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

  // Also try generic code blocks (``` ... ```) that contain JSON
  const genericBlockRegex = /```(?!json\s)(\w*)\s*([\s\S]*?)```/gi;
  while ((match = genericBlockRegex.exec(text)) !== null) {
    const content = match[2].trim();
    // Check if it looks like JSON (starts with { or [)
    if (content && (content.startsWith('{') || content.startsWith('['))) {
      // Avoid duplicates - check if this position overlaps with existing blocks
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

  // If no code blocks found, try to find raw JSON objects
  if (blocks.length === 0) {
    // Try to find JSON objects with balanced braces
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

  // Sort blocks by their position in the text
  blocks.sort((a, b) => a.startIndex - b.startIndex);

  return blocks;
}

/**
 * Finds balanced JSON objects in text
 * Uses brace counting to find complete JSON objects
 * 
 * @param text - Text to search for JSON objects
 * @returns Array of found JSON objects with positions
 */
function findBalancedJSON(text: string): Array<{ content: string; startIndex: number; endIndex: number }> {
  const results: Array<{ content: string; startIndex: number; endIndex: number }> = [];
  
  let i = 0;
  while (i < text.length) {
    // Look for start of JSON object or array
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
        // Validate it looks like JSON (has at least one key-value pair or is an array)
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

/**
 * Checks if a string looks like valid JSON
 * Quick heuristic check before attempting full parse
 * 
 * @param str - String to check
 * @returns true if the string looks like JSON
 */
function isLikelyJSON(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  
  // Must start with { or [
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return false;
  }
  
  // For objects, check for at least one colon (key-value separator)
  if (trimmed.startsWith('{')) {
    return trimmed.includes(':');
  }
  
  // For arrays, just check it ends with ]
  return trimmed.endsWith(']');
}

/**
 * Extracts JSON code blocks from text
 * Supports ```json ... ``` and ``` ... ``` formats
 * 
 * @param text - Text containing JSON code blocks
 * @returns Array of extracted JSON strings
 */
export function extractJSONBlocks(text: string): string[] {
  const blocksWithMetadata = extractJSONBlocksWithMetadata(text);
  return blocksWithMetadata.map(block => block.content);
}

/**
 * Extracts and parses JSON from LLM response text
 * 
 * @param text - LLM response text
 * @returns JSONExtractionResult
 */
export function extractJSON(text: string): JSONExtractionResult {
  if (!text || typeof text !== 'string') {
    return { success: false, error: 'Invalid input: text is required' };
  }

  const blocksWithMetadata = extractJSONBlocksWithMetadata(text);

  if (blocksWithMetadata.length === 0) {
    return { success: false, error: 'No JSON blocks found in text' };
  }

  // Try to parse each block, return first successful parse
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

/**
 * Extracts all valid JSON objects from LLM response text
 * Returns all successfully parsed JSON blocks
 * 
 * @param text - LLM response text
 * @returns Array of parsed JSON objects
 */
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

/**
 * Extracts UISchema from LLM response text
 * 
 * @param text - LLM response text
 * @returns UISchema if found and valid, null otherwise
 */
export function extractUISchema(text: string): UISchema | null {
  const result = extractJSON(text);

  if (!result.success || !result.parsed) {
    return null;
  }

  const parsed = result.parsed as Record<string, unknown>;

  // Validate basic UISchema structure
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'root' in parsed &&
    typeof parsed.root === 'object' &&
    parsed.root !== null
  ) {
    const root = parsed.root as Record<string, unknown>;
    if ('id' in root && 'type' in root) {
      // Add default version if missing
      if (!('version' in parsed)) {
        parsed.version = '1.0';
      }
      return parsed as unknown as UISchema;
    }
  }

  return null;
}

/**
 * Collects all streaming chunks into a complete response
 * 
 * @param stream - Async generator of stream chunks
 * @returns Complete response text
 */
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

/**
 * Test connection result
 */
export interface TestConnectionResult {
  /** Whether the connection was successful */
  success: boolean;
  /** Error message if connection failed */
  error?: string;
}

/**
 * Tests the connection to an LLM provider
 * 
 * Sends a simple test message to verify the API key and endpoint are working.
 * Uses a minimal request to reduce latency and cost.
 * 
 * @param config - LLM configuration to test
 * @returns TestConnectionResult indicating success or failure
 */
export async function testConnection(config: LLMConfig): Promise<TestConnectionResult> {
  const fullConfig = createLLMConfig(config);
  const validation = validateLLMConfig(fullConfig);

  if (!validation.valid) {
    return { success: false, error: validation.errors.join(', ') };
  }

  const endpoint = fullConfig.endpoint!;
  const headers = buildHeaders(fullConfig);

  // Create a minimal test message
  const testMessages: ChatMessage[] = [
    { role: 'user', content: 'Hi' }
  ];

  // Build request with minimal tokens for quick test
  const testConfig = { ...fullConfig, maxTokens: 5 };
  let body: Record<string, unknown>;
  
  switch (fullConfig.provider) {
    case 'openai':
    case 'iflow':
      body = buildOpenAIRequest(testMessages, testConfig);
      // Disable streaming for test
      body.stream = false;
      break;
    case 'anthropic':
      body = buildAnthropicRequest(testMessages, testConfig);
      // Disable streaming for test
      body.stream = false;
      break;
    default:
      body = buildOpenAIRequest(testMessages, testConfig);
      body.stream = false;
  }

  const controller = new AbortController();
  // Use shorter timeout for connection test (15 seconds)
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
      
      // Parse common error responses
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // Use raw error text if not JSON
        if (errorText) {
          errorMessage = `${errorMessage} - ${errorText.substring(0, 200)}`;
        }
      }

      // Provide user-friendly error messages
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

    // Connection successful
    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { success: false, error: '连接超时，请检查网络或端点地址' };
      }
      
      // Handle network errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, error: '网络连接失败，请检查网络设置或端点地址' };
      }
      
      return { success: false, error: error.message };
    }
    
    return { success: false, error: '未知错误' };
  }
}
