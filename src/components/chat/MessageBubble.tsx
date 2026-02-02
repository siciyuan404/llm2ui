/**
 * MessageBubble Component
 * 
 * Individual message bubble for chat interface.
 * Implements Requirements 1.2, 1.4, 7.1, 7.9
 * - User message styles
 * - AI message styles (with JSON highlighting)
 * - Loading state indicator
 * - UI Schema rendering with RenderedUICard
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/lib';
import type { UISchema, DataContext } from '@/types';
import { extractUISchema } from '@/lib';
import { RenderedUICard } from './RenderedUICard';

// ============================================================================
// Types
// ============================================================================

export interface MessageBubbleProps {
  /** The message to display */
  message: ConversationMessage;
  /** Additional class name */
  className?: string;
  /** Callback when copy JSON is clicked */
  onCopyJson?: (schema: UISchema) => void;
  /** Callback when apply to editor is clicked */
  onApplyToEditor?: (schema: UISchema) => void;
  /** Event handler for UI interactions */
  onEvent?: (componentId: string, event: string, payload: unknown) => void;
  /** Data context for data binding */
  data?: DataContext;
}

export interface LoadingIndicatorProps {
  /** Additional class name */
  className?: string;
}

// ============================================================================
// JSON Syntax Highlighting
// ============================================================================

/**
 * Token types for JSON syntax highlighting
 */
type JsonTokenType = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation';

interface JsonToken {
  type: JsonTokenType;
  value: string;
}

/**
 * Tokenizes a JSON string for syntax highlighting
 */
function tokenizeJson(json: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;
  
  while (i < json.length) {
    const char = json[i];
    
    // Skip whitespace but preserve it
    if (/\s/.test(char)) {
      let whitespace = '';
      while (i < json.length && /\s/.test(json[i])) {
        whitespace += json[i];
        i++;
      }
      tokens.push({ type: 'punctuation', value: whitespace });
      continue;
    }
    
    // Punctuation: { } [ ] , :
    if (/[{}\[\],:]/u.test(char)) {
      tokens.push({ type: 'punctuation', value: char });
      i++;
      continue;
    }
    
    // String (key or value)
    if (char === '"') {
      let str = '"';
      i++;
      while (i < json.length && json[i] !== '"') {
        if (json[i] === '\\' && i + 1 < json.length) {
          str += json[i] + json[i + 1];
          i += 2;
        } else {
          str += json[i];
          i++;
        }
      }
      if (i < json.length) {
        str += '"';
        i++;
      }
      
      // Check if this is a key (followed by :)
      let j = i;
      while (j < json.length && /\s/.test(json[j])) j++;
      const isKey = json[j] === ':';
      
      tokens.push({ type: isKey ? 'key' : 'string', value: str });
      continue;
    }
    
    // Number
    if (/[-\d]/.test(char)) {
      let num = '';
      while (i < json.length && /[-\d.eE+]/.test(json[i])) {
        num += json[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    
    // Boolean or null
    if (json.slice(i, i + 4) === 'true') {
      tokens.push({ type: 'boolean', value: 'true' });
      i += 4;
      continue;
    }
    if (json.slice(i, i + 5) === 'false') {
      tokens.push({ type: 'boolean', value: 'false' });
      i += 5;
      continue;
    }
    if (json.slice(i, i + 4) === 'null') {
      tokens.push({ type: 'null', value: 'null' });
      i += 4;
      continue;
    }
    
    // Unknown character
    tokens.push({ type: 'punctuation', value: char });
    i++;
  }
  
  return tokens;
}

/**
 * Gets the CSS class for a token type
 */
function getTokenClass(type: JsonTokenType): string {
  switch (type) {
    case 'key':
      return 'text-blue-600 dark:text-blue-400';
    case 'string':
      return 'text-green-600 dark:text-green-400';
    case 'number':
      return 'text-orange-600 dark:text-orange-400';
    case 'boolean':
      return 'text-purple-600 dark:text-purple-400';
    case 'null':
      return 'text-gray-500 dark:text-gray-400';
    case 'punctuation':
    default:
      return 'text-foreground';
  }
}

// ============================================================================
// Content Parsing
// ============================================================================

interface ContentPart {
  type: 'text' | 'json' | 'uischema';
  content: string;
  /** Parsed UI Schema if type is 'uischema' */
  schema?: UISchema;
}

/**
 * Extracts JSON code blocks from message content
 * Supports ```json ... ``` and standalone JSON objects
 * Detects UI Schemas and marks them for rendering
 */
function parseMessageContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  
  // Match ```json ... ``` code blocks
  const codeBlockRegex = /```(?:json)?\s*\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index).trim();
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }
    }
    
    // Add the JSON code block
    const jsonContent = match[1].trim();
    if (jsonContent) {
      // Try to detect if this is a UI Schema (with autoFix to resolve type aliases)
      const result = extractUISchema('```json\n' + jsonContent + '\n```', { autoFix: true });
      const schema = result && 'schema' in result ? result.schema : result;
      if (schema) {
        parts.push({ type: 'uischema', content: jsonContent, schema });
      } else {
        parts.push({ type: 'json', content: jsonContent });
      }
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex).trim();
    if (remaining) {
      parts.push({ type: 'text', content: remaining });
    }
  }
  
  // If no code blocks found, return original content as text
  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }
  
  return parts;
}

// ============================================================================
// Sub-components
// ============================================================================

interface JsonHighlightProps {
  content: string;
  className?: string;
}

/**
 * Renders JSON with syntax highlighting
 */
function JsonHighlight({ content, className }: JsonHighlightProps) {
  const tokens = React.useMemo(() => tokenizeJson(content), [content]);
  
  return (
    <pre className={cn(
      'bg-muted/50 rounded-md p-3 overflow-x-auto text-xs font-mono',
      className
    )}>
      <code>
        {tokens.map((token, index) => (
          <span key={index} className={getTokenClass(token.type)}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats a timestamp for display
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ============================================================================


function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2-2v8a2 2 0 002-2z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-3.5 h-3.5', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4 animate-spin', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357 2m15.357 2H15"
      />
    </svg>
  );
}

// Main Components
// ============================================================================

/**
 * Loading indicator component with animated dots
 * Shows when waiting for AI response
 */
export function LoadingIndicator({ className }: LoadingIndicatorProps) {
  return (
    <div className={cn('flex justify-start', className)}>
      <div className="bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span 
            className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" 
            style={{ animationDelay: '0ms', animationDuration: '600ms' }} 
          />
          <span 
            className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" 
            style={{ animationDelay: '150ms', animationDuration: '600ms' }} 
          />
          <span 
            className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" 
            style={{ animationDelay: '300ms', animationDuration: '600ms' }} 
          />
        </div>
      </div>
    </div>
  );
}


/**
 * Message bubble component for displaying chat messages
 * Supports user and AI messages with different styles
 * AI messages support JSON syntax highlighting and UI Schema rendering
 */
export function MessageBubble({ 
  message, 
  className,
  onCopyJson,
  onApplyToEditor,
  onEvent,
  data,
}: MessageBubbleProps) {
    const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [message.content]);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';
  
  // Parse content for AI messages to extract JSON blocks and UI Schemas
  const contentParts = React.useMemo(() => {
    if (isAssistant && message.content) {
      return parseMessageContent(message.content);
    }
    return [{ type: 'text' as const, content: message.content }];
  }, [isAssistant, message.content]);

  // Check if message contains any UI Schema
  const hasUISchema = contentParts.some(part => part.type === 'uischema');

  // Handle copy JSON for a specific schema
  const handleCopyJson = React.useCallback((schema: UISchema) => {
    onCopyJson?.(schema);
  }, [onCopyJson]);

  // Handle apply to editor for a specific schema
  const handleApplyToEditor = React.useCallback((schema: UISchema) => {
    onApplyToEditor?.(schema);
  }, [onApplyToEditor]);

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
      role="article"
      aria-label={isUser ? '用户消息' : 'AI 消息'}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-lg',
          // User message styles
          isUser && 'bg-primary text-primary-foreground px-4 py-2',
          // AI message styles - use different style if contains UI Schema
          isAssistant && !hasUISchema && 'bg-muted text-foreground px-4 py-2',
          isAssistant && hasUISchema && 'bg-transparent text-foreground space-y-3',
          // Error state
          isError && 'border border-destructive bg-destructive/10'
        )}
      >
        {/* Message content */}
        <div className={cn('text-sm', hasUISchema && 'space-y-3')}>
          {isStreaming && !isUser ? (
            <div className="flex items-center gap-2 text-sm">
              <LoadingSpinner />
              <span className="text-muted-foreground">正在生成回复...</span>
            </div>
          ) : (
            <>
              {contentParts.map((part, index) => (
                <React.Fragment key={index}>
                  {part.type === 'uischema' && part.schema ? (
                    <RenderedUICard
                      schema={part.schema}
                      data={data}
                      onCopyJson={() => handleCopyJson(part.schema!)}
                      onApplyToEditor={onApplyToEditor ? () => handleApplyToEditor(part.schema!) : undefined}
                      onEvent={onEvent}
                      className="my-2"
                    />
                  ) : part.type === 'json' ? (
                    <div className={cn(
                      !hasUISchema && 'my-2',
                      hasUISchema && 'bg-muted rounded-lg px-4 py-2'
                    )}>
                      <JsonHighlight content={part.content} />
                    </div>
                  ) : (
                    <span className={cn(
                      'whitespace-pre-wrap break-words',
                      hasUISchema && 'bg-muted rounded-lg px-4 py-2 block'
                    )}>
                      {part.content}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        {/* Error message */}
        {isError && message.error && (
          <div className="mt-2 text-xs text-destructive flex items-center gap-1">
            <svg 
              className="w-3 h-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            {message.error}
          </div>
        )}

        {/* Timestamp - only show for non-UI Schema messages or at the end */}
        <div className={cn(
          'flex items-center gap-2 text-xs text-muted-foreground mt-2',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span>{formatTimestamp(message.timestamp)}</span>
          {!isStreaming && (
            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded hover:bg-muted-foreground/10 transition-colors',
                copied && 'text-green-600 dark:text-green-400'
              )}
              title={copied ? '已复制' : '复制'}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? '已复制' : '复制'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
