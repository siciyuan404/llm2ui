/**
 * @file state.types.ts
 * @description 应用状态类型定义，包括聊天状态、编辑器状态、UI 状态和应用状态
 * @module types/state
 * @requirements 5.1, 5.5, 11.6, 11.7, 20.7, 20.8, 23.8
 */

import type { UISchema, DataContext } from './ui-schema';
import type { LLMConfig } from './llm.types';

// ============================================================================
// 主题状态类型
// ============================================================================

/**
 * 主题偏好设置
 */
export interface ThemePreferences {
  /** 当前激活的主题 ID */
  activeThemeId: string;
  /** 当前配色方案 ID */
  colorSchemeId: string;
  /** 当前布局 ID */
  layoutId: string;
}

/**
 * LLM 上下文设置（简化版，用于持久化）
 */
export interface PersistedContextSettings {
  /** 主题 ID */
  themeId: string;
  /** 组件选择模式 */
  componentsMode: 'all' | 'selected' | 'preset';
  /** 已选组件 ID */
  selectedComponentIds?: string[];
  /** 组件预设名称 */
  componentPresetName?: string;
  /** 案例选择模式 */
  examplesMode: 'auto' | 'selected' | 'none';
  /** 已选案例 ID */
  selectedExampleIds?: string[];
  /** 最大案例数 */
  maxExampleCount?: number;
  /** 配色方案 ID */
  colorSchemeId: string;
  /** 是否在提示词中包含配色 */
  includeColorInPrompt: boolean;
  /** Token 预算上限 */
  tokenBudgetMax: number;
  /** 是否自动优化 */
  tokenAutoOptimize: boolean;
}

// ============================================================================
// 聊天状态类型
// ============================================================================

/**
 * 消息角色类型
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * 消息状态类型
 */
export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

/**
 * 消息元数据
 */
export interface MessageMetadata {
  /** Token 使用统计 */
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 模型名称 */
  model?: string;
  /** 处理时间（毫秒） */
  processingTime?: number;
}

/**
 * 对话消息接口
 */
export interface ConversationMessage {
  /** 消息唯一标识 */
  id: string;
  /** 消息角色 */
  role: MessageRole;
  /** 消息内容 */
  content: string;
  /** 时间戳 */
  timestamp: number;
  /** 消息状态 */
  status: MessageStatus;
  /** 提取的 UISchema (仅 assistant 消息) */
  extractedSchema?: UISchema;
  /** 错误信息 */
  error?: string;
  /** 消息元数据 */
  metadata?: MessageMetadata;
}

/**
 * 对话接口
 */
export interface Conversation {
  /** 对话唯一标识 */
  id: string;
  /** 对话标题 */
  title: string;
  /** 消息列表 */
  messages: ConversationMessage[];
  /** 创建时间戳 */
  createdAt: number;
  /** 更新时间戳 */
  updatedAt: number;
  /** 最新生成的 UISchema */
  latestSchema?: UISchema;
}

/**
 * 聊天状态接口
 */
export interface ChatState {
  /** 所有对话 */
  conversations: Conversation[];
  /** 当前活动对话 ID */
  activeConversationId: string | null;
}

// ============================================================================
// 编辑器状态类型
// ============================================================================

/**
 * 解析状态类型
 */
export type ParseStatus = 'valid' | 'invalid' | 'empty';

/**
 * 光标位置
 */
export interface CursorPosition {
  /** 行号 */
  line: number;
  /** 列号 */
  column: number;
}

/**
 * 编辑器状态接口
 */
export interface EditorState {
  /** 编辑器内容 */
  content: string;
  /** 解析状态 */
  parseStatus: ParseStatus;
  /** 解析后的 UISchema */
  parsedSchema: UISchema | null;
  /** 解析错误信息 */
  parseError: string | null;
  /** 是否有未保存的更改 */
  isDirty: boolean;
  /** 光标位置 */
  cursorPosition?: CursorPosition;
}

// ============================================================================
// UI 状态类型
// ============================================================================

/**
 * 面板标识类型
 */
export type PanelId = 'chat' | 'editor' | 'preview';

/**
 * 主题类型
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * UI 状态接口
 */
export interface UIState {
  /** 编辑器分割比例 (0-100) */
  editorSplitPercent: number;
  /** 是否正在调整编辑器大小 */
  isResizingEditor: boolean;
  /** 面板宽度配置 */
  panelWidths: {
    chat: number;
    editor: number;
    preview: number;
  };
  /** 面板折叠状态 */
  collapsedPanels: {
    chat: boolean;
    editor: boolean;
    preview: boolean;
  };
  /** 活动标签页 (窄屏模式) */
  activeTab: PanelId;
  /** 是否为窄屏模式 */
  isNarrowMode: boolean;
  /** 主题设置 */
  theme: ThemeMode;
}

// ============================================================================
// 应用状态类型
// ============================================================================

/**
 * 应用状态接口
 * 整合所有子状态
 */
export interface AppState {
  // Schema 状态
  /** 当前 UISchema */
  schema: UISchema | null;
  /** JSON 编辑器内容 */
  jsonContent: string;
  /** 数据上下文 */
  dataContext: DataContext;
  
  // 聊天状态
  /** 聊天状态 */
  chatState: ChatState;
  /** 是否正在加载 */
  isLoading: boolean;
  
  // LLM 配置
  /** LLM 配置 */
  llmConfig: LLMConfig | null;
  
  // UI 状态
  /** 编辑器分割比例 */
  editorSplitPercent: number;
  /** 是否正在调整编辑器大小 */
  isResizingEditor: boolean;
  
  // 主题状态
  /** 主题偏好设置 */
  themePreferences: ThemePreferences;
  /** LLM 上下文设置 */
  contextSettings: PersistedContextSettings;
}

/**
 * 应用状态操作接口
 */
export interface AppActions {
  // Schema 操作
  setSchema: (schema: UISchema | null) => void;
  setJsonContent: (content: string) => void;
  setDataContext: (data: DataContext) => void;
  syncSchemaFromJson: (json: string) => void;
  
  // 聊天操作
  addMessage: (message: ConversationMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ConversationMessage>) => void;
  clearConversation: () => void;
  setLoading: (loading: boolean) => void;
  
  // LLM 配置操作
  setLLMConfig: (config: LLMConfig) => void;
  
  // UI 操作
  setEditorSplitPercent: (percent: number) => void;
  setIsResizingEditor: (resizing: boolean) => void;
  
  // 主题操作
  setThemePreferences: (preferences: Partial<ThemePreferences>) => void;
  setContextSettings: (settings: Partial<PersistedContextSettings>) => void;
}
