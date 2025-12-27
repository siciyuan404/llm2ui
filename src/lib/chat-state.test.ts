/**
 * State Management Property-Based Tests
 * 
 * **Feature: llm2ui, Property 7: Message History Completeness**
 * **Validates: Requirements 1.1, 1.6, 8.6**
 * 
 * Tests that for any sequence of messages added to a conversation,
 * all messages are preserved in chronological order and can be retrieved.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import {
  createInitialChatState,
  createConversation,
  createMessage,
  addMessageToConversation,
  addConversationToState,
  updateConversationInState,
  getMessages,
  getMessageCount,
  getActiveConversation,
  getConversationsInOrder,
  removeConversationFromState,
  setActiveConversation,
  updateMessageInConversation,
  type MessageRole,
  type MessageStatus,
  type ConversationMessage,
} from './state-management';

// Generator for valid message roles
const messageRoleArb: fc.Arbitrary<MessageRole> = fc.constantFrom('system', 'user', 'assistant');

// Generator for valid message statuses
const messageStatusArb: fc.Arbitrary<MessageStatus> = fc.constantFrom('pending', 'streaming', 'complete', 'error');

// Generator for message content (non-empty strings)
const messageContentArb = fc.string({ minLength: 1, maxLength: 200 });

// Generator for a single message creation parameters
const messageParamsArb = fc.record({
  role: messageRoleArb,
  content: messageContentArb,
  status: messageStatusArb,
});

// Generator for a sequence of message parameters
const messageSequenceArb = fc.array(messageParamsArb, { minLength: 1, maxLength: 20 });

describe('Message History Completeness', () => {
  /**
   * Property 7: Message History Completeness
   * 
   * For any sequence of messages added to a conversation,
   * all messages should be preserved and retrievable in the order they were added.
   * 
   * **Validates: Requirements 1.1, 1.6, 8.6**
   */
  it('Property 7: all messages added to conversation are preserved in order', () => {
    fc.assert(
      fc.property(messageSequenceArb, (messageParams) => {
        let conversation = createConversation('Test Conversation');
        const addedMessages: ConversationMessage[] = [];
        
        for (const params of messageParams) {
          const message = createMessage(params.role, params.content, { status: params.status });
          addedMessages.push(message);
          conversation = addMessageToConversation(conversation, message);
        }
        
        const retrievedMessages = getMessages(conversation);
        
        expect(getMessageCount(conversation)).toBe(messageParams.length);
        expect(retrievedMessages.length).toBe(addedMessages.length);
        
        for (let i = 0; i < addedMessages.length; i++) {
          expect(retrievedMessages[i].id).toBe(addedMessages[i].id);
          expect(retrievedMessages[i].role).toBe(addedMessages[i].role);
          expect(retrievedMessages[i].content).toBe(addedMessages[i].content);
          expect(retrievedMessages[i].status).toBe(addedMessages[i].status);
        }
      }),
      { numRuns: 100 }
    );
  });


  it('Property 7b: existing messages are not modified when new messages are added', () => {
    fc.assert(
      fc.property(
        messageSequenceArb,
        messageParamsArb,
        (initialMessages, newMessageParams) => {
          let conversation = createConversation('Test');
          const originalMessages: ConversationMessage[] = [];
          
          for (const params of initialMessages) {
            const msg = createMessage(params.role, params.content, { status: params.status });
            originalMessages.push(msg);
            conversation = addMessageToConversation(conversation, msg);
          }
          
          const messagesBefore = getMessages(conversation);
          const contentsBefore = messagesBefore.map(m => ({ id: m.id, content: m.content, role: m.role }));
          
          const newMessage = createMessage(newMessageParams.role, newMessageParams.content, { status: newMessageParams.status });
          conversation = addMessageToConversation(conversation, newMessage);
          
          const messagesAfter = getMessages(conversation);
          
          for (let i = 0; i < contentsBefore.length; i++) {
            expect(messagesAfter[i].id).toBe(contentsBefore[i].id);
            expect(messagesAfter[i].content).toBe(contentsBefore[i].content);
            expect(messagesAfter[i].role).toBe(contentsBefore[i].role);
          }
          
          expect(messagesAfter[messagesAfter.length - 1].id).toBe(newMessage.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 7c: messages preserved through chat state operations', () => {
    fc.assert(
      fc.property(messageSequenceArb, (messageParams) => {
        let state = createInitialChatState();
        let conversation = createConversation('Test');
        const addedMessages: ConversationMessage[] = [];
        
        for (const params of messageParams) {
          const msg = createMessage(params.role, params.content, { status: params.status });
          addedMessages.push(msg);
          conversation = addMessageToConversation(conversation, msg);
        }
        
        state = addConversationToState(state, conversation);
        
        const retrieved = getActiveConversation(state);
        expect(retrieved).not.toBeNull();
        
        const retrievedMessages = getMessages(retrieved!);
        expect(retrievedMessages.length).toBe(addedMessages.length);
        
        for (let i = 0; i < addedMessages.length; i++) {
          expect(retrievedMessages[i].id).toBe(addedMessages[i].id);
          expect(retrievedMessages[i].content).toBe(addedMessages[i].content);
        }
      }),
      { numRuns: 100 }
    );
  });
});


describe('Conversation State Management - Unit Tests', () => {
  it('should create initial empty chat state', () => {
    const state = createInitialChatState();
    expect(state.conversations).toEqual({});
    expect(state.activeConversationId).toBeNull();
    expect(state.conversationOrder).toEqual([]);
  });

  it('should create a new conversation', () => {
    const conversation = createConversation('My Chat');
    expect(conversation.title).toBe('My Chat');
    expect(conversation.messages).toEqual([]);
    expect(conversation.id).toBeTruthy();
    expect(conversation.createdAt).toBeTruthy();
    expect(conversation.updatedAt).toBeTruthy();
  });

  it('should create a message with default status', () => {
    const message = createMessage('user', 'Hello');
    expect(message.role).toBe('user');
    expect(message.content).toBe('Hello');
    expect(message.status).toBe('complete');
    expect(message.id).toBeTruthy();
    expect(message.timestamp).toBeTruthy();
  });

  it('should create a message with custom status', () => {
    const message = createMessage('assistant', 'Response', { status: 'streaming' });
    expect(message.status).toBe('streaming');
  });

  it('should add message to conversation', () => {
    let conversation = createConversation('Test');
    const message = createMessage('user', 'Hello');
    
    conversation = addMessageToConversation(conversation, message);
    
    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0]).toBe(message);
  });

  it('should update conversation title from first user message', () => {
    let conversation = createConversation();
    expect(conversation.title).toBe('New Conversation');
    
    const message = createMessage('user', 'Create a login form');
    conversation = addMessageToConversation(conversation, message);
    
    expect(conversation.title).toBe('Create a login form');
  });

  it('should truncate long titles', () => {
    let conversation = createConversation();
    const longContent = 'A'.repeat(100);
    const message = createMessage('user', longContent);
    conversation = addMessageToConversation(conversation, message);
    
    expect(conversation.title.length).toBeLessThanOrEqual(53);
    expect(conversation.title.endsWith('...')).toBe(true);
  });

  it('should update message in conversation', () => {
    let conversation = createConversation('Test');
    const message = createMessage('assistant', 'Initial', { status: 'streaming' });
    conversation = addMessageToConversation(conversation, message);
    
    conversation = updateMessageInConversation(conversation, message.id, {
      content: 'Updated content',
      status: 'complete',
    });
    
    expect(conversation.messages[0].content).toBe('Updated content');
    expect(conversation.messages[0].status).toBe('complete');
  });

  it('should not modify conversation when updating non-existent message', () => {
    let conversation = createConversation('Test');
    const message = createMessage('user', 'Hello');
    conversation = addMessageToConversation(conversation, message);
    
    const result = updateMessageInConversation(conversation, 'non-existent-id', {
      content: 'New content',
    });
    
    expect(result).toBe(conversation);
  });

  it('should add conversation to state and set as active', () => {
    let state = createInitialChatState();
    const conversation = createConversation('Test');
    
    state = addConversationToState(state, conversation);
    
    expect(state.conversations[conversation.id]).toBe(conversation);
    expect(state.activeConversationId).toBe(conversation.id);
    expect(state.conversationOrder).toContain(conversation.id);
  });

  it('should update conversation in state', () => {
    let state = createInitialChatState();
    let conversation = createConversation('Test');
    state = addConversationToState(state, conversation);
    
    const message = createMessage('user', 'Hello');
    conversation = addMessageToConversation(conversation, message);
    state = updateConversationInState(state, conversation);
    
    expect(state.conversations[conversation.id].messages).toHaveLength(1);
  });

  it('should remove conversation from state', () => {
    let state = createInitialChatState();
    const conv1 = createConversation('Test 1');
    const conv2 = createConversation('Test 2');
    
    state = addConversationToState(state, conv1);
    state = addConversationToState(state, conv2);
    
    state = removeConversationFromState(state, conv2.id);
    
    expect(state.conversations[conv2.id]).toBeUndefined();
    expect(state.conversationOrder).not.toContain(conv2.id);
    expect(state.activeConversationId).toBe(conv1.id);
  });

  it('should set active conversation', () => {
    let state = createInitialChatState();
    const conv1 = createConversation('Test 1');
    const conv2 = createConversation('Test 2');
    
    state = addConversationToState(state, conv1);
    state = addConversationToState(state, conv2);
    
    state = setActiveConversation(state, conv1.id);
    
    expect(state.activeConversationId).toBe(conv1.id);
  });

  it('should not set active conversation to non-existent id', () => {
    let state = createInitialChatState();
    const conversation = createConversation('Test');
    state = addConversationToState(state, conversation);
    
    state = setActiveConversation(state, 'non-existent');
    
    expect(state.activeConversationId).toBe(conversation.id);
  });

  it('should get conversations in order', () => {
    let state = createInitialChatState();
    const conv1 = createConversation('Test 1');
    const conv2 = createConversation('Test 2');
    const conv3 = createConversation('Test 3');
    
    state = addConversationToState(state, conv1);
    state = addConversationToState(state, conv2);
    state = addConversationToState(state, conv3);
    
    const ordered = getConversationsInOrder(state);
    
    expect(ordered[0].id).toBe(conv3.id);
    expect(ordered[1].id).toBe(conv2.id);
    expect(ordered[2].id).toBe(conv1.id);
  });
});


// Import layout state functions for Property 9 tests
import {
  createInitialLayoutState,
  saveLayoutState,
  loadLayoutState,
  clearLayoutState,
  updatePanelWidth,
  togglePanelCollapsed,
  setActiveTab,
  setTheme,
  setNarrowMode,
  type LayoutState,
  type PanelId,
} from './state-management';

// Generator for panel IDs
const panelIdArb: fc.Arbitrary<PanelId> = fc.constantFrom('chat', 'editor', 'preview');

// Generator for theme values
const themeArb = fc.constantFrom('light' as const, 'dark' as const, 'system' as const);

// Generator for panel widths (10-80 range)
const panelWidthArb = fc.integer({ min: 10, max: 80 });

// Generator for LayoutState
const layoutStateArb: fc.Arbitrary<LayoutState> = fc.record({
  panelWidths: fc.record({
    chat: panelWidthArb,
    editor: panelWidthArb,
    preview: panelWidthArb,
  }),
  collapsedPanels: fc.record({
    chat: fc.boolean(),
    editor: fc.boolean(),
    preview: fc.boolean(),
  }),
  activeTab: panelIdArb,
  isNarrowMode: fc.boolean(),
  theme: themeArb,
});

describe('Layout State Persistence', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    clearLayoutState();
  });

  afterEach(() => {
    clearLayoutState();
  });

  /**
   * Property 9: Layout State Persistence
   * 
   * For any valid LayoutState, saving then loading should produce
   * an equivalent state (round-trip consistency).
   * 
   * **Validates: Requirements 10.5**
   */
  it('Property 9: save then load produces equivalent layout state (round-trip)', () => {
    fc.assert(
      fc.property(layoutStateArb, (state) => {
        // Save the state
        const saveResult = saveLayoutState(state);
        expect(saveResult).toBe(true);
        
        // Load the state back
        const loaded = loadLayoutState();
        expect(loaded).not.toBeNull();
        
        // Verify all properties are preserved
        expect(loaded!.panelWidths.chat).toBe(state.panelWidths.chat);
        expect(loaded!.panelWidths.editor).toBe(state.panelWidths.editor);
        expect(loaded!.panelWidths.preview).toBe(state.panelWidths.preview);
        expect(loaded!.collapsedPanels.chat).toBe(state.collapsedPanels.chat);
        expect(loaded!.collapsedPanels.editor).toBe(state.collapsedPanels.editor);
        expect(loaded!.collapsedPanels.preview).toBe(state.collapsedPanels.preview);
        expect(loaded!.activeTab).toBe(state.activeTab);
        expect(loaded!.isNarrowMode).toBe(state.isNarrowMode);
        expect(loaded!.theme).toBe(state.theme);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 9b: state modifications are preserved through save/load cycle', () => {
    fc.assert(
      fc.property(
        panelIdArb,
        panelWidthArb,
        themeArb,
        fc.boolean(),
        (panelId, width, theme, isNarrow) => {
          // Start with default state
          let state = createInitialLayoutState();
          
          // Apply modifications
          state = updatePanelWidth(state, panelId, width);
          state = setTheme(state, theme);
          state = setNarrowMode(state, isNarrow);
          state = togglePanelCollapsed(state, panelId);
          
          // Save and load
          saveLayoutState(state);
          const loaded = loadLayoutState();
          
          expect(loaded).not.toBeNull();
          expect(loaded!.theme).toBe(theme);
          expect(loaded!.isNarrowMode).toBe(isNarrow);
          expect(loaded!.collapsedPanels[panelId]).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Layout State Management - Unit Tests', () => {
  beforeEach(() => {
    clearLayoutState();
  });

  afterEach(() => {
    clearLayoutState();
  });

  it('should create initial layout state with defaults', () => {
    const state = createInitialLayoutState();
    expect(state.panelWidths.chat).toBe(30);
    expect(state.panelWidths.editor).toBe(35);
    expect(state.panelWidths.preview).toBe(35);
    expect(state.collapsedPanels.chat).toBe(false);
    expect(state.collapsedPanels.editor).toBe(false);
    expect(state.collapsedPanels.preview).toBe(false);
    expect(state.activeTab).toBe('chat');
    expect(state.isNarrowMode).toBe(false);
    expect(state.theme).toBe('system');
  });

  it('should update panel width within bounds', () => {
    let state = createInitialLayoutState();
    state = updatePanelWidth(state, 'chat', 50);
    
    expect(state.panelWidths.chat).toBe(50);
    // Other panels should adjust
    const total = state.panelWidths.chat + state.panelWidths.editor + state.panelWidths.preview;
    expect(Math.abs(total - 100)).toBeLessThan(0.1);
  });

  it('should clamp panel width to minimum 10', () => {
    let state = createInitialLayoutState();
    state = updatePanelWidth(state, 'chat', 5);
    
    expect(state.panelWidths.chat).toBe(10);
  });

  it('should clamp panel width to maximum 80', () => {
    let state = createInitialLayoutState();
    state = updatePanelWidth(state, 'chat', 90);
    
    expect(state.panelWidths.chat).toBe(80);
  });

  it('should toggle panel collapsed state', () => {
    let state = createInitialLayoutState();
    expect(state.collapsedPanels.chat).toBe(false);
    
    state = togglePanelCollapsed(state, 'chat');
    expect(state.collapsedPanels.chat).toBe(true);
    
    state = togglePanelCollapsed(state, 'chat');
    expect(state.collapsedPanels.chat).toBe(false);
  });

  it('should set active tab', () => {
    let state = createInitialLayoutState();
    state = setActiveTab(state, 'editor');
    
    expect(state.activeTab).toBe('editor');
  });

  it('should set theme', () => {
    let state = createInitialLayoutState();
    state = setTheme(state, 'dark');
    
    expect(state.theme).toBe('dark');
  });

  it('should set narrow mode', () => {
    let state = createInitialLayoutState();
    state = setNarrowMode(state, true);
    
    expect(state.isNarrowMode).toBe(true);
  });

  it('should return null when loading from empty storage', () => {
    const loaded = loadLayoutState();
    expect(loaded).toBeNull();
  });

  it('should clear layout state from storage', () => {
    const state = createInitialLayoutState();
    saveLayoutState(state);
    
    clearLayoutState();
    
    const loaded = loadLayoutState();
    expect(loaded).toBeNull();
  });
});
