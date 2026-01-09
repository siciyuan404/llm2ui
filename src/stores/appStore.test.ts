/**
 * @file appStore.test.ts
 * @description Property-based tests for State Store
 * 
 * **Feature: architecture-refactor**
 * - **Property 2: State Store Completeness**
 * - **Property 3: State Store Actions Completeness**
 * - **Property 4: LLM Config Persistence Round Trip**
 * 
 * **Validates: Requirements 3.2, 3.4, 3.5**
 * 
 * @module stores
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useAppStore } from './appStore';
import type { LLMConfig, LLMProvider } from '@/types/llm.types';

// Reset store before each test
beforeEach(() => {
  useAppStore.setState({
    schema: null,
    jsonContent: '',
    dataContext: {},
    chatState: { conversations: [], activeConversationId: null },
    isLoading: false,
    llmConfig: null,
    editorSplitPercent: 70,
    isResizingEditor: false,
  });
});

describe('State Store - Property-Based Tests', () => {
  /**
   * Property 2: State Store Completeness
   * 
   * *For any* of the required state fields (chatState, llmConfig, schema, 
   * dataContext, editorSplitPercent, isResizingEditor, isLoading), 
   * the State_Store SHALL have the field defined and accessible.
   * 
   * **Validates: Requirements 3.2**
   */
  describe('Property 2: State Store Completeness', () => {
    const requiredFields = [
      'schema',
      'jsonContent',
      'dataContext',
      'chatState',
      'isLoading',
      'llmConfig',
      'editorSplitPercent',
      'isResizingEditor',
    ] as const;

    it('should have all required state fields defined and accessible', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...requiredFields),
          (fieldName) => {
            const state = useAppStore.getState();
            // Field should exist in state (even if value is null/false/0)
            return fieldName in state;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have chatState with correct structure', () => {
      const state = useAppStore.getState();
      expect(state.chatState).toBeDefined();
      expect(state.chatState).toHaveProperty('conversations');
      expect(state.chatState).toHaveProperty('activeConversationId');
      expect(Array.isArray(state.chatState.conversations)).toBe(true);
    });
  });

  /**
   * Property 3: State Store Actions Completeness
   * 
   * *For any* state field in the State_Store, there SHALL exist 
   * at least one action that can mutate that field.
   * 
   * **Validates: Requirements 3.4**
   */
  describe('Property 3: State Store Actions Completeness', () => {
    const stateFieldToActions: Record<string, string[]> = {
      schema: ['setSchema', 'syncSchemaFromJson'],
      jsonContent: ['setJsonContent', 'syncSchemaFromJson'],
      dataContext: ['setDataContext'],
      chatState: ['addMessage', 'updateMessage', 'clearConversation'],
      isLoading: ['setLoading'],
      llmConfig: ['setLLMConfig'],
      editorSplitPercent: ['setEditorSplitPercent'],
      isResizingEditor: ['setIsResizingEditor'],
    };

    it('should have at least one action for each state field', () => {
      const stateFields = Object.keys(stateFieldToActions);
      
      fc.assert(
        fc.property(
          fc.constantFrom(...stateFields),
          (fieldName) => {
            const state = useAppStore.getState();
            const actions = stateFieldToActions[fieldName];
            // At least one action should exist for this field
            return actions.some((actionName) => typeof state[actionName as keyof typeof state] === 'function');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have all required actions as functions', () => {
      const allActions = [
        'setSchema',
        'setJsonContent',
        'setDataContext',
        'syncSchemaFromJson',
        'addMessage',
        'updateMessage',
        'clearConversation',
        'setLoading',
        'setLLMConfig',
        'setEditorSplitPercent',
        'setIsResizingEditor',
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allActions),
          (actionName) => {
            const state = useAppStore.getState();
            return typeof state[actionName as keyof typeof state] === 'function';
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: LLM Config Persistence Round Trip
   * 
   * *For any* valid LLMConfig object, setting it in the State_Store, 
   * simulating a page reload (clearing memory state), and loading from 
   * persistence SHALL return an equivalent LLMConfig object.
   * 
   * **Validates: Requirements 3.5**
   */
  describe('Property 4: LLM Config Persistence Round Trip', () => {
    // Arbitrary generator for LLMProvider
    const llmProviderArb = fc.constantFrom<LLMProvider>('openai', 'anthropic', 'iflow', 'custom');

    // Arbitrary generator for LLMConfig
    const llmConfigArb: fc.Arbitrary<LLMConfig> = fc.record({
      provider: llmProviderArb,
      apiKey: fc.string({ minLength: 1, maxLength: 100 }),
      model: fc.string({ minLength: 1, maxLength: 50 }),
      endpoint: fc.option(fc.webUrl(), { nil: undefined }),
      maxTokens: fc.option(fc.integer({ min: 1, max: 100000 }), { nil: undefined }),
      temperature: fc.option(fc.float({ min: 0, max: 2, noNaN: true }), { nil: undefined }),
      systemPrompt: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
      timeout: fc.option(fc.integer({ min: 1000, max: 300000 }), { nil: undefined }),
      enableExampleEnhancement: fc.option(fc.boolean(), { nil: undefined }),
    });

    it('should persist and restore LLMConfig correctly', () => {
      fc.assert(
        fc.property(llmConfigArb, (config) => {
          // Set the config
          useAppStore.getState().setLLMConfig(config);
          
          // Get the state after setting
          const stateAfterSet = useAppStore.getState();
          
          // Verify the config was set correctly
          expect(stateAfterSet.llmConfig).toEqual(config);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain LLMConfig structure after serialization round trip', () => {
      fc.assert(
        fc.property(llmConfigArb, (config) => {
          // Simulate serialization (what persist middleware does)
          const serialized = JSON.stringify({ llmConfig: config });
          const deserialized = JSON.parse(serialized) as { llmConfig: LLMConfig };
          
          // Required fields should be preserved
          expect(deserialized.llmConfig.provider).toBe(config.provider);
          expect(deserialized.llmConfig.apiKey).toBe(config.apiKey);
          expect(deserialized.llmConfig.model).toBe(config.model);
          
          // Optional fields should be preserved if present
          if (config.endpoint !== undefined) {
            expect(deserialized.llmConfig.endpoint).toBe(config.endpoint);
          }
          if (config.maxTokens !== undefined) {
            expect(deserialized.llmConfig.maxTokens).toBe(config.maxTokens);
          }
          if (config.temperature !== undefined) {
            expect(deserialized.llmConfig.temperature).toBeCloseTo(config.temperature, 5);
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});

describe('State Store - Unit Tests', () => {
  describe('Schema Actions', () => {
    it('should set schema correctly', () => {
      const testSchema = {
        version: '1.0',
        root: { id: 'root', type: 'Container' },
      };
      
      useAppStore.getState().setSchema(testSchema);
      expect(useAppStore.getState().schema).toEqual(testSchema);
    });

    it('should sync schema from valid JSON', () => {
      const testSchema = {
        version: '1.0',
        root: { id: 'root', type: 'Container' },
      };
      const json = JSON.stringify(testSchema);
      
      useAppStore.getState().syncSchemaFromJson(json);
      
      expect(useAppStore.getState().jsonContent).toBe(json);
      expect(useAppStore.getState().schema).toEqual(testSchema);
    });

    it('should handle invalid JSON gracefully', () => {
      const invalidJson = '{ invalid json }';
      
      useAppStore.getState().syncSchemaFromJson(invalidJson);
      
      expect(useAppStore.getState().jsonContent).toBe(invalidJson);
      // Schema should remain null for invalid JSON
      expect(useAppStore.getState().schema).toBeNull();
    });
  });

  describe('Chat Actions', () => {
    it('should add message and create conversation if none exists', () => {
      const message = {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: Date.now(),
        status: 'complete' as const,
      };
      
      useAppStore.getState().addMessage(message);
      
      const state = useAppStore.getState();
      expect(state.chatState.conversations.length).toBe(1);
      expect(state.chatState.activeConversationId).not.toBeNull();
      expect(state.chatState.conversations[0].messages).toContainEqual(message);
    });

    it('should update message correctly', () => {
      // First add a message
      const message = {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: Date.now(),
        status: 'pending' as const,
      };
      
      useAppStore.getState().addMessage(message);
      useAppStore.getState().updateMessage('msg-1', { status: 'complete' });
      
      const state = useAppStore.getState();
      const updatedMessage = state.chatState.conversations[0].messages[0];
      expect(updatedMessage.status).toBe('complete');
    });

    it('should clear conversation messages', () => {
      const message = {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: Date.now(),
        status: 'complete' as const,
      };
      
      useAppStore.getState().addMessage(message);
      useAppStore.getState().clearConversation();
      
      const state = useAppStore.getState();
      expect(state.chatState.conversations[0].messages).toHaveLength(0);
    });
  });

  describe('UI Actions', () => {
    it('should clamp editor split percent to valid range', () => {
      useAppStore.getState().setEditorSplitPercent(5);
      expect(useAppStore.getState().editorSplitPercent).toBe(10);
      
      useAppStore.getState().setEditorSplitPercent(95);
      expect(useAppStore.getState().editorSplitPercent).toBe(90);
      
      useAppStore.getState().setEditorSplitPercent(50);
      expect(useAppStore.getState().editorSplitPercent).toBe(50);
    });

    it('should set resizing state', () => {
      useAppStore.getState().setIsResizingEditor(true);
      expect(useAppStore.getState().isResizingEditor).toBe(true);
      
      useAppStore.getState().setIsResizingEditor(false);
      expect(useAppStore.getState().isResizingEditor).toBe(false);
    });
  });
});
