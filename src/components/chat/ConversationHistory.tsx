/**
 * ConversationHistory Component
 * 
 * Displays a list of past conversations for navigation.
 * Allows users to switch between conversations, create new ones, and delete existing ones.
 * Implements Requirements 1.6, 1.7:
 * - Historical conversation list display
 * - Click to load historical Schema
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Conversation, ChatState } from '@/lib/state-management';
import { getConversationsInOrder } from '@/lib/state-management';
import type { UISchema } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface ConversationHistoryProps {
  /** Chat state containing all conversations */
  chatState: ChatState;
  /** Callback when a conversation is selected */
  onSelectConversation?: (conversationId: string) => void;
  /** Callback when creating a new conversation */
  onNewConversation?: () => void;
  /** Callback when deleting a conversation */
  onDeleteConversation?: (conversationId: string) => void;
  /** Callback when a historical schema should be loaded */
  onLoadSchema?: (schema: UISchema) => void;
  /** Additional class name */
  className?: string;
}

export interface ConversationItemProps {
  /** The conversation to display */
  conversation: Conversation;
  /** Whether this conversation is active */
  isActive: boolean;
  /** Callback when clicked */
  onSelect: () => void;
  /** Callback when delete is clicked */
  onDelete: () => void;
  /** Whether this conversation has a schema */
  hasSchema: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats a timestamp for display
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return date.toLocaleDateString();
  }
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Individual conversation item in the list
 */
function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  hasSchema,
}: ConversationItemProps) {
  const [showDelete, setShowDelete] = React.useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted'
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-selected={isActive}
    >
      {/* Chat icon */}
      <svg
        className="w-4 h-4 flex-shrink-0 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Title and date */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">
            {conversation.title}
          </span>
          {/* Schema indicator */}
          {hasSchema && (
            <span title="包含 UI Schema">
              <svg
                className="w-3 h-3 flex-shrink-0 text-green-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(conversation.updatedAt)}
        </div>
      </div>

      {/* Delete button */}
      {showDelete && (
        <button
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          onClick={handleDelete}
          aria-label="删除对话"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ConversationHistory({
  chatState,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onLoadSchema,
  className,
}: ConversationHistoryProps) {
  const conversations = React.useMemo(
    () => getConversationsInOrder(chatState),
    [chatState]
  );

  /**
   * Handles conversation selection
   * Also loads the schema if the conversation has one
   */
  const handleSelectConversation = React.useCallback(
    (conversationId: string) => {
      onSelectConversation?.(conversationId);
      
      // Load the schema if the conversation has one
      const conversation = chatState.conversations[conversationId];
      if (conversation?.latestSchema && onLoadSchema) {
        onLoadSchema(conversation.latestSchema);
      }
    },
    [chatState.conversations, onSelectConversation, onLoadSchema]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with new conversation button */}
      <div className="p-3 border-b">
        <Button
          onClick={onNewConversation}
          className="w-full"
          variant="outline"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新建对话
        </Button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-4 text-center">
            <svg
              className="w-12 h-12 mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            暂无对话记录
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === chatState.activeConversationId}
              onSelect={() => handleSelectConversation(conversation.id)}
              onDelete={() => onDeleteConversation?.(conversation.id)}
              hasSchema={!!conversation.latestSchema}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ConversationHistory;
