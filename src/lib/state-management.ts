/**
 * State Management Module
 * 
 * Provides state management for conversations, editor, and layout.
 * Implements Requirements 1.6, 2.3, 8.6, 10.5
 */

import type { UISchema } from '../types';

// ============================================================================
// Chat Message & Conversation Types (Requirements 1.6, 8.6)
// ============================================================================

/**
 * Role of a chat message participant
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Status of a chat message
 */
export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

/**
 * A single chat message in a conversation (UI state)
 * Note: This extends the basic ChatMessage from llm-service with UI-specific fields
 */
export interface ConversationMessage {
  /** Unique identifier for the message */
  id: string;
  /** Role of the message sender */
  role: MessageRole;
  /** Message content */
  content: string;
  /** Timestamp when the message was created */
  timestamp: number;
  /** Message status */
  status: MessageStatus;
  /** Extracted UISchema from assistant messages (if any) */
  extractedSchema?: UISchema;
  /** Error message if status is 'error' */
  error?: string;
}

/**
 * A conversation containing multiple messages
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: string;
  /** Conversation title (usually derived from first user message) */
  title: string;
  /** Array of messages in chronological order */
  messages: ConversationMessage[];
  /** Timestamp when the conversation was created */
  createdAt: number;
  /** Timestamp when the conversation was last updated */
  updatedAt: number;
  /** The latest UISchema generated in this conversation */
  latestSchema?: UISchema;
}

/**
 * Chat state containing all conversations
 */
export interface ChatState {
  /** All conversations indexed by ID */
  conversations: Record<string, Conversation>;
  /** ID of the currently active conversation */
  activeConversationId: string | null;
  /** Order of conversation IDs (most recent first) */
  conversationOrder: string[];
}

// ============================================================================
// Chat State Management Functions
// ============================================================================

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Creates an initial empty chat state
 */
export function createInitialChatState(): ChatState {
  return {
    conversations: {},
    activeConversationId: null,
    conversationOrder: [],
  };
}

/**
 * Creates a new chat message
 */
export function createMessage(
  role: MessageRole,
  content: string,
  options?: {
    id?: string;
    status?: MessageStatus;
    extractedSchema?: UISchema;
  }
): ConversationMessage {
  return {
    id: options?.id ?? generateId(),
    role,
    content,
    timestamp: Date.now(),
    status: options?.status ?? 'complete',
    extractedSchema: options?.extractedSchema,
  };
}

/**
 * Creates a new conversation
 */
export function createConversation(
  title?: string,
  id?: string
): Conversation {
  const now = Date.now();
  return {
    id: id ?? generateId(),
    title: title ?? 'New Conversation',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Adds a message to a conversation
 */
export function addMessageToConversation(
  conversation: Conversation,
  message: ConversationMessage
): Conversation {
  const updatedMessages = [...conversation.messages, message];
  
  // Update title from first user message if still default
  let title = conversation.title;
  if (title === 'New Conversation' && message.role === 'user') {
    title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
  }
  
  // Update latest schema if message contains one
  const latestSchema = message.extractedSchema ?? conversation.latestSchema;
  
  return {
    ...conversation,
    title,
    messages: updatedMessages,
    updatedAt: Date.now(),
    latestSchema,
  };
}

/**
 * Updates a message in a conversation
 */
export function updateMessageInConversation(
  conversation: Conversation,
  messageId: string,
  updates: Partial<Omit<ConversationMessage, 'id'>>
): Conversation {
  const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
  if (messageIndex === -1) {
    return conversation;
  }
  
  const updatedMessage = {
    ...conversation.messages[messageIndex],
    ...updates,
  };
  
  const updatedMessages = [...conversation.messages];
  updatedMessages[messageIndex] = updatedMessage;
  
  // Update latest schema if message contains one
  const latestSchema = updatedMessage.extractedSchema ?? conversation.latestSchema;
  
  return {
    ...conversation,
    messages: updatedMessages,
    updatedAt: Date.now(),
    latestSchema,
  };
}

/**
 * Adds a conversation to the chat state
 */
export function addConversationToState(
  state: ChatState,
  conversation: Conversation
): ChatState {
  return {
    conversations: {
      ...state.conversations,
      [conversation.id]: conversation,
    },
    activeConversationId: conversation.id,
    conversationOrder: [conversation.id, ...state.conversationOrder],
  };
}

/**
 * Updates a conversation in the chat state
 */
export function updateConversationInState(
  state: ChatState,
  conversation: Conversation
): ChatState {
  if (!state.conversations[conversation.id]) {
    return state;
  }
  
  return {
    ...state,
    conversations: {
      ...state.conversations,
      [conversation.id]: conversation,
    },
  };
}

/**
 * Removes a conversation from the chat state
 */
export function removeConversationFromState(
  state: ChatState,
  conversationId: string
): ChatState {
  const { [conversationId]: removed, ...remainingConversations } = state.conversations;
  const newOrder = state.conversationOrder.filter(id => id !== conversationId);
  
  return {
    conversations: remainingConversations,
    activeConversationId: 
      state.activeConversationId === conversationId 
        ? (newOrder[0] ?? null) 
        : state.activeConversationId,
    conversationOrder: newOrder,
  };
}

/**
 * Sets the active conversation
 */
export function setActiveConversation(
  state: ChatState,
  conversationId: string | null
): ChatState {
  if (conversationId !== null && !state.conversations[conversationId]) {
    return state;
  }
  
  return {
    ...state,
    activeConversationId: conversationId,
  };
}

/**
 * Gets the active conversation
 */
export function getActiveConversation(state: ChatState): Conversation | null {
  if (!state.activeConversationId) {
    return null;
  }
  return state.conversations[state.activeConversationId] ?? null;
}

/**
 * Gets all conversations in order (most recent first)
 */
export function getConversationsInOrder(state: ChatState): Conversation[] {
  return state.conversationOrder
    .map(id => state.conversations[id])
    .filter((c): c is Conversation => c !== undefined);
}

/**
 * Gets the message count for a conversation
 */
export function getMessageCount(conversation: Conversation): number {
  return conversation.messages.length;
}

/**
 * Gets all messages from a conversation
 */
export function getMessages(conversation: Conversation): ConversationMessage[] {
  return [...conversation.messages];
}


// ============================================================================
// Editor State Types (Requirement 2.3)
// ============================================================================

/**
 * Parse status for JSON content
 */
export type ParseStatus = 'valid' | 'invalid' | 'empty';

/**
 * Editor state for JSON Schema editing
 */
export interface EditorState {
  /** Raw JSON content in the editor */
  content: string;
  /** Parse status of the content */
  parseStatus: ParseStatus;
  /** Parsed UISchema if content is valid */
  parsedSchema: UISchema | null;
  /** Parse error message if content is invalid */
  parseError: string | null;
  /** Whether the content has unsaved changes */
  isDirty: boolean;
  /** Cursor position in the editor */
  cursorPosition?: {
    line: number;
    column: number;
  };
}

// ============================================================================
// Editor State Management Functions
// ============================================================================

/**
 * Creates an initial empty editor state
 */
export function createInitialEditorState(): EditorState {
  return {
    content: '',
    parseStatus: 'empty',
    parsedSchema: null,
    parseError: null,
    isDirty: false,
  };
}

/**
 * Updates editor content and synchronizes parse state
 */
export function updateEditorContent(
  state: EditorState,
  content: string
): EditorState {
  if (content.trim() === '') {
    return {
      ...state,
      content,
      parseStatus: 'empty',
      parsedSchema: null,
      parseError: null,
      isDirty: true,
    };
  }
  
  try {
    const parsed = JSON.parse(content);
    
    // Basic UISchema validation
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      'root' in parsed &&
      typeof parsed.root === 'object' &&
      parsed.root !== null &&
      'id' in parsed.root &&
      'type' in parsed.root
    ) {
      return {
        ...state,
        content,
        parseStatus: 'valid',
        parsedSchema: parsed as UISchema,
        parseError: null,
        isDirty: true,
      };
    } else {
      return {
        ...state,
        content,
        parseStatus: 'invalid',
        parsedSchema: null,
        parseError: 'Invalid UISchema structure: missing required fields (version, root.id, root.type)',
        isDirty: true,
      };
    }
  } catch (e) {
    return {
      ...state,
      content,
      parseStatus: 'invalid',
      parsedSchema: null,
      parseError: e instanceof Error ? e.message : 'JSON parse error',
      isDirty: true,
    };
  }
}

/**
 * Sets editor content from a UISchema
 */
export function setEditorSchema(
  state: EditorState,
  schema: UISchema,
  pretty: boolean = true
): EditorState {
  const content = pretty 
    ? JSON.stringify(schema, null, 2) 
    : JSON.stringify(schema);
  
  return {
    ...state,
    content,
    parseStatus: 'valid',
    parsedSchema: schema,
    parseError: null,
    isDirty: false,
  };
}

/**
 * Marks editor content as saved
 */
export function markEditorSaved(state: EditorState): EditorState {
  return {
    ...state,
    isDirty: false,
  };
}

/**
 * Updates cursor position
 */
export function updateCursorPosition(
  state: EditorState,
  line: number,
  column: number
): EditorState {
  return {
    ...state,
    cursorPosition: { line, column },
  };
}

// ============================================================================
// Layout State Types (Requirement 10.5)
// ============================================================================

/**
 * Panel identifiers
 */
export type PanelId = 'chat' | 'editor' | 'preview';

/**
 * Layout state for the three-column layout
 */
export interface LayoutState {
  /** Width percentages for each panel (should sum to 100) */
  panelWidths: {
    chat: number;
    editor: number;
    preview: number;
  };
  /** Collapsed state for each panel */
  collapsedPanels: {
    chat: boolean;
    editor: boolean;
    preview: boolean;
  };
  /** Active tab in mobile/narrow view */
  activeTab: PanelId;
  /** Whether the layout is in narrow/mobile mode */
  isNarrowMode: boolean;
  /** Theme preference */
  theme: 'light' | 'dark' | 'system';
}

/**
 * Storage key for layout state persistence
 */
export const LAYOUT_STORAGE_KEY = 'llm2ui-layout-state';

// ============================================================================
// Layout State Management Functions
// ============================================================================

/**
 * Default layout state
 */
export const DEFAULT_LAYOUT_STATE: LayoutState = {
  panelWidths: {
    chat: 30,
    editor: 35,
    preview: 35,
  },
  collapsedPanels: {
    chat: false,
    editor: false,
    preview: false,
  },
  activeTab: 'chat',
  isNarrowMode: false,
  theme: 'system',
};

/**
 * Creates an initial layout state
 */
export function createInitialLayoutState(): LayoutState {
  return { ...DEFAULT_LAYOUT_STATE };
}

/**
 * Updates panel width
 */
export function updatePanelWidth(
  state: LayoutState,
  panelId: PanelId,
  width: number
): LayoutState {
  // Ensure width is within bounds
  const clampedWidth = Math.max(10, Math.min(80, width));
  
  // Calculate the difference
  const diff = clampedWidth - state.panelWidths[panelId];
  
  // Distribute the difference to other panels proportionally
  const otherPanels = (['chat', 'editor', 'preview'] as PanelId[]).filter(p => p !== panelId);
  const otherTotal = otherPanels.reduce((sum, p) => sum + state.panelWidths[p], 0);
  
  const newWidths = { ...state.panelWidths };
  newWidths[panelId] = clampedWidth;
  
  for (const panel of otherPanels) {
    const ratio = state.panelWidths[panel] / otherTotal;
    newWidths[panel] = Math.max(10, state.panelWidths[panel] - diff * ratio);
  }
  
  // Normalize to ensure sum is 100
  const total = newWidths.chat + newWidths.editor + newWidths.preview;
  if (Math.abs(total - 100) > 0.01) {
    const scale = 100 / total;
    newWidths.chat *= scale;
    newWidths.editor *= scale;
    newWidths.preview *= scale;
  }
  
  return {
    ...state,
    panelWidths: newWidths,
  };
}

/**
 * Toggles panel collapsed state
 */
export function togglePanelCollapsed(
  state: LayoutState,
  panelId: PanelId
): LayoutState {
  return {
    ...state,
    collapsedPanels: {
      ...state.collapsedPanels,
      [panelId]: !state.collapsedPanels[panelId],
    },
  };
}

/**
 * Sets panel collapsed state
 */
export function setPanelCollapsed(
  state: LayoutState,
  panelId: PanelId,
  collapsed: boolean
): LayoutState {
  return {
    ...state,
    collapsedPanels: {
      ...state.collapsedPanels,
      [panelId]: collapsed,
    },
  };
}

/**
 * Sets the active tab (for narrow mode)
 */
export function setActiveTab(
  state: LayoutState,
  tab: PanelId
): LayoutState {
  return {
    ...state,
    activeTab: tab,
  };
}

/**
 * Sets narrow mode
 */
export function setNarrowMode(
  state: LayoutState,
  isNarrow: boolean
): LayoutState {
  return {
    ...state,
    isNarrowMode: isNarrow,
  };
}

/**
 * Sets theme preference
 */
export function setTheme(
  state: LayoutState,
  theme: 'light' | 'dark' | 'system'
): LayoutState {
  return {
    ...state,
    theme,
  };
}

/**
 * Saves layout state to localStorage
 */
export function saveLayoutState(state: LayoutState): boolean {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads layout state from localStorage
 */
export function loadLayoutState(): LayoutState | null {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate the loaded state has required structure
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'panelWidths' in parsed &&
      'collapsedPanels' in parsed &&
      'activeTab' in parsed &&
      'theme' in parsed
    ) {
      return {
        ...DEFAULT_LAYOUT_STATE,
        ...parsed,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Clears layout state from localStorage
 */
export function clearLayoutState(): void {
  try {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * Gets layout state, loading from storage or returning default
 */
export function getOrCreateLayoutState(): LayoutState {
  const loaded = loadLayoutState();
  return loaded ?? createInitialLayoutState();
}
