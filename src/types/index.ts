/**
 * @file index.ts
 * @description 类型导出入口，统一导出所有类型定义
 * @module types
 * @requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

// UI Schema 核心类型
export type {
  StyleProps,
  EventBinding,
  EventAction,
  DataContext,
  UIComponent,
  UISchema,
  ValidationResult,
  ValidationError,
} from './ui-schema';

// LLM 相关类型
export type {
  LLMProvider,
  LLMConfig,
  TokenUsage,
  LLMResponse,
  StreamingChunk,
  ChatMessage,
  TestConnectionResult,
  JSONExtractionResult,
} from './llm.types';

// 案例系统类型
export type {
  ExampleCategory,
  ExampleTag,
  ExampleSource,
  Example,
  ExampleSearchResult,
  ExampleFilterOptions,
  ExampleLibraryStats,
} from './example.types';

// 设计令牌类型
export type {
  TokenCategory,
  ColorSemanticCategory,
  ColorScaleKey,
  ColorToken,
  ColorScale,
  SpacingToken,
  SpacingTokens,
  TypographyToken,
  TypographyTokens,
  ShadowTokens,
  RadiusTokens,
  Breakpoints,
  ColorTokens,
  DesignTokens,
  TokenValidationResult,
} from './design-tokens.types';

// 状态管理类型
export type {
  DevModeStatus,
  ComponentDebugInfo,
  MessageRole,
  MessageStatus,
  MessageMetadata,
  ConversationMessage,
  Conversation,
  ChatState,
  ParseStatus,
  CursorPosition,
  EditorState,
  PanelId,
  ThemeMode,
  UIState,
  AppState,
  AppActions,
} from './state.types';
