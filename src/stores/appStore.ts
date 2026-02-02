/**
 * @file appStore.ts
 * @description 应用状态管理 Store，使用 Zustand 实现集中式状态管理
 * @module stores/appStore
 * @requirements 3.1, 3.2, 3.4, 3.5, 11.6, 11.7, 20.7, 20.8, 23.8
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UISchema, DataContext } from '@/types';
import type { LLMConfig } from '@/types/llm.types';
import type {
  ChatState,
  ConversationMessage,
  Conversation,
  AppState,
  AppActions,
  ThemePreferences,
  PersistedContextSettings,
  DevModeStatus,
} from '@/types/state.types';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { DEFAULT_EDITOR_SPLIT_PERCENT } from '@/constants/defaults';

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 创建新对话
 */
function createNewConversation(): Conversation {
  const now = Date.now();
  return {
    id: generateId(),
    title: '新对话',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 初始聊天状态
 */
const initialChatState: ChatState = {
  conversations: [],
  activeConversationId: null,
};

/**
 * 默认主题偏好设置
 */
const defaultThemePreferences: ThemePreferences = {
  activeThemeId: 'shadcn-ui',
  colorSchemeId: 'light',
  layoutId: 'default',
};

/**
 * 默认 LLM 上下文设置
 */
const defaultContextSettings: PersistedContextSettings = {
  themeId: 'shadcn-ui',
  componentsMode: 'all',
  examplesMode: 'auto',
  maxExampleCount: 5,
  colorSchemeId: 'light',
  includeColorInPrompt: true,
  tokenBudgetMax: 4000,
  tokenAutoOptimize: true,
};

/**
 * 应用状态 Store
 * 
 * 使用 Zustand 实现集中式状态管理，支持：
 * - Schema 状态管理
 * - 聊天状态管理
 * - LLM 配置管理（带持久化）
 * - UI 状态管理
 */
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // ========================================
      // 初始状态
      // ========================================
      
      // Schema 状态
      schema: null,
      jsonContent: '',
      dataContext: {},
      
      // 聊天状态
      chatState: initialChatState,
      isLoading: false,
      
      // LLM 配置
      llmConfig: null,
      
      // UI 状态
      editorSplitPercent: DEFAULT_EDITOR_SPLIT_PERCENT,
      isResizingEditor: false,
      
      // 主题状态
      themePreferences: defaultThemePreferences,
      contextSettings: defaultContextSettings,
      
      // 开发者模式状态
      devMode: 'off' as DevModeStatus,

      // ========================================
      // Schema 操作
      // ========================================
      
      setSchema: (schema: UISchema | null) => {
        set({ schema });
      },

      setJsonContent: (content: string) => {
        set({ jsonContent: content });
      },

      setDataContext: (data: DataContext) => {
        set({ dataContext: data });
      },

      syncSchemaFromJson: (json: string) => {
        try {
          const parsed = JSON.parse(json) as UISchema;
          set({ schema: parsed, jsonContent: json });
        } catch {
          // JSON 解析失败，只更新内容不更新 schema
          set({ jsonContent: json });
        }
      },

      // ========================================
      // 聊天操作
      // ========================================
      
      addMessage: (message: ConversationMessage) => {
        const { chatState } = get();
        let { activeConversationId, conversations } = chatState;
        
        // 如果没有活动对话，创建一个新的
        if (!activeConversationId) {
          const newConversation = createNewConversation();
          activeConversationId = newConversation.id;
          conversations = [...conversations, newConversation];
        }
        
        // 更新对话消息
        const updatedConversations = conversations.map((conv) => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: Date.now(),
            };
          }
          return conv;
        });
        
        set({
          chatState: {
            conversations: updatedConversations,
            activeConversationId,
          },
        });
      },

      updateMessage: (messageId: string, updates: Partial<ConversationMessage>) => {
        const { chatState } = get();
        const { activeConversationId, conversations } = chatState;
        
        if (!activeConversationId) return;
        
        const updatedConversations = conversations.map((conv) => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
              updatedAt: Date.now(),
            };
          }
          return conv;
        });
        
        set({
          chatState: {
            ...chatState,
            conversations: updatedConversations,
          },
        });
      },

      clearConversation: () => {
        const { chatState } = get();
        const { activeConversationId, conversations } = chatState;
        
        if (!activeConversationId) return;
        
        const updatedConversations = conversations.map((conv) => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: [],
              updatedAt: Date.now(),
            };
          }
          return conv;
        });
        
        set({
          chatState: {
            ...chatState,
            conversations: updatedConversations,
          },
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // ========================================
      // LLM 配置操作
      // ========================================
      
      setLLMConfig: (config: LLMConfig) => {
        set({ llmConfig: config });
      },

      // ========================================
      // UI 操作
      // ========================================
      
      setEditorSplitPercent: (percent: number) => {
        // 限制在合理范围内
        const clampedPercent = Math.max(10, Math.min(90, percent));
        set({ editorSplitPercent: clampedPercent });
      },

      setIsResizingEditor: (resizing: boolean) => {
        set({ isResizingEditor: resizing });
      },

      // ========================================
      // 主题操作
      // ========================================
      
      setThemePreferences: (preferences: Partial<ThemePreferences>) => {
        const { themePreferences } = get();
        set({
          themePreferences: {
            ...themePreferences,
            ...preferences,
          },
        });
      },

      setContextSettings: (settings: Partial<PersistedContextSettings>) => {
        const { contextSettings } = get();
        set({
          contextSettings: {
            ...contextSettings,
            ...settings,
          },
        });
      },

      // ========================================
      // 开发者模式操作
      // ========================================
      
      setDevMode: (mode: DevModeStatus) => {
        set({ devMode: mode });
      },

      toggleDevMode: () => {
        const { devMode } = get();
        set({ devMode: devMode === 'on' ? 'off' : 'on' });
      },
    }),
    {
      name: STORAGE_KEYS.APP_STATE,
      // 持久化 llmConfig 和主题设置
      partialize: (state) => ({
        llmConfig: state.llmConfig,
        themePreferences: state.themePreferences,
        contextSettings: state.contextSettings,
      }),
    }
  )
);

// ========================================
// 选择器 (Selectors)
// ========================================

/**
 * 空消息数组常量，避免每次返回新引用导致无限循环
 */
const EMPTY_MESSAGES: ConversationMessage[] = [];

/**
 * 获取当前活动对话
 */
export const selectActiveConversation = (state: AppState): Conversation | null => {
  const { chatState } = state;
  if (!chatState.activeConversationId) return null;
  return chatState.conversations.find(
    (conv) => conv.id === chatState.activeConversationId
  ) || null;
};

/**
 * 获取当前活动对话的消息
 */
export const selectActiveMessages = (state: AppState): ConversationMessage[] => {
  const conversation = selectActiveConversation(state);
  return conversation?.messages || EMPTY_MESSAGES;
};

/**
 * 检查 LLM 是否已配置
 */
export const selectIsLLMConfigured = (state: AppState): boolean => {
  return state.llmConfig !== null && !!state.llmConfig.apiKey;
};
