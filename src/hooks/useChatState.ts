/**
 * @file useChatState.ts
 * @description 聊天状态管理 Hook，封装聊天状态逻辑
 * @module hooks/useChatState
 * @requirements 4.5
 */

import { useCallback, useMemo } from 'react';
import { useAppStore, selectActiveConversation, selectActiveMessages } from '@/stores';
import type { ConversationMessage, Conversation } from '@/types/state.types';

/**
 * useChatState Hook 返回类型
 */
export interface UseChatState {
  /** 当前对话的消息列表 */
  messages: ConversationMessage[];
  /** 当前活动对话 */
  activeConversation: Conversation | null;
  /** 发送消息 */
  sendMessage: (message: ConversationMessage) => void;
  /** 更新消息 */
  updateMessage: (messageId: string, updates: Partial<ConversationMessage>) => void;
  /** 清空当前对话 */
  clearConversation: () => void;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 创建新消息 */
  createMessage: (role: ConversationMessage['role'], content: string) => ConversationMessage;
}

/**
 * 生成唯一 ID
 */
function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 聊天状态管理 Hook
 * 
 * 封装聊天状态的管理逻辑，包括消息的发送、更新和清空。
 * 集成 appStore 的 chatState，提供统一的聊天管理接口。
 * 
 * @returns UseChatState 接口
 * 
 * @example
 * ```tsx
 * function ChatPanel() {
 *   const { messages, sendMessage, updateMessage, clearConversation, isLoading } = useChatState();
 *   
 *   const handleSend = (content: string) => {
 *     const message = createMessage('user', content);
 *     sendMessage(message);
 *   };
 *   
 *   return (
 *     <div>
 *       {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
 *       {isLoading && <LoadingIndicator />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useChatState(): UseChatState {
  // 从 store 获取状态和 actions
  const isLoading = useAppStore((state) => state.isLoading);
  const addMessage = useAppStore((state) => state.addMessage);
  const updateMessageAction = useAppStore((state) => state.updateMessage);
  const clearConversationAction = useAppStore((state) => state.clearConversation);
  const setLoadingAction = useAppStore((state) => state.setLoading);

  // 使用选择器获取当前对话和消息
  const activeConversation = useAppStore(selectActiveConversation);
  const messages = useAppStore(selectActiveMessages);

  // 发送消息
  const sendMessage = useCallback(
    (message: ConversationMessage) => {
      addMessage(message);
    },
    [addMessage]
  );

  // 更新消息
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ConversationMessage>) => {
      updateMessageAction(messageId, updates);
    },
    [updateMessageAction]
  );

  // 清空当前对话
  const clearConversation = useCallback(() => {
    clearConversationAction();
  }, [clearConversationAction]);

  // 设置加载状态
  const setLoading = useCallback(
    (loading: boolean) => {
      setLoadingAction(loading);
    },
    [setLoadingAction]
  );

  // 创建新消息的辅助函数
  const createMessage = useCallback(
    (role: ConversationMessage['role'], content: string): ConversationMessage => {
      return {
        id: generateMessageId(),
        role,
        content,
        timestamp: Date.now(),
        status: role === 'user' ? 'complete' : 'pending',
      };
    },
    []
  );

  return useMemo(
    () => ({
      messages,
      activeConversation,
      sendMessage,
      updateMessage,
      clearConversation,
      isLoading,
      setLoading,
      createMessage,
    }),
    [
      messages,
      activeConversation,
      sendMessage,
      updateMessage,
      clearConversation,
      isLoading,
      setLoading,
      createMessage,
    ]
  );
}

export default useChatState;
