/**
 * @file index.ts
 * @description Library exports for llm2ui - 统一导出入口
 * 
 * 该文件从各子目录 re-export 所有公共 API，确保现有 @/lib 导入路径继续工作。
 * 
 * @module lib
 * @see Requirements 1.2, 1.9 (向后兼容)
 */

// =============================================================================
// Namespace Exports (Task 11.1)
// 命名空间导出，支持 import { Core, DesignSystem, ... } from '@/lib'
// =============================================================================
export * as Core from './core';
export * as DesignSystem from './design-system';
export * as Themes from './themes';
export * as Examples from './examples';
export * as LLM from './llm';
export * as Utils from './utils';

// =============================================================================
// Core Module (lib/core)
// 核心渲染模块：组件注册、渲染、验证、数据绑定等
// =============================================================================
export {
  // Component Registry
  ComponentRegistry,
  defaultRegistry,
  validateComponentDefinition,
  parseStorageKey,
  // Component Catalog
  ComponentCatalog,
  defaultCatalog,
  TYPE_ALIAS_MAP,
  // Renderer
  render,
  UIRenderer,
  useRenderer,
  extractPureSchema,
  // Validation
  validateJSON,
  validateUISchema,
  validateUISchemaEnhanced,
  validateComponentType,
  validateComponentProps,
  checkDeprecatedComponent,
  levenshteinDistance,
  getSimilarTypes,
  setDefaultCatalog,
  getDefaultCatalog,
  // Schema Fixer
  fixUISchema,
  generateComponentId,
  // Data Binding
  parsePath,
  parseBindingExpression,
  resolvePath,
  resolveBinding,
  resolveBindings,
  extractDataFields,
  getUniquePaths,
  // Event Handler
  createEventCallback,
  defaultNavigateHandler,
  createStateUpdateHandler,
  createStateToggleHandler,
  extractEventType,
  toReactEventName,
  // Serialization
  serialize,
  deserialize,
  schemasEqual,
  // shadcn Components Registration
  registerShadcnComponents,
  initializeDefaultRegistry,
  getRegisteredComponentNames,
} from './core';
export type {
  // Component Registry types
  PlatformType,
  ComponentCategory,
  PropSchema,
  ComponentExample,
  ComponentDefinition,
  ComponentValidationResult,
  // Component Catalog types
  ComponentMetadata,
  // Renderer types
  EventHandler,
  RenderOptions,
  UIRendererProps,
  // Validation types
  ValidationSeverity,
  ValidationErrorCode,
  EnhancedValidationError,
  EnhancedValidationResult,
  ValidationOptions,
  JSONValidationResult,
  JSONValidationError,
  UISchemaValidationResult,
  // Schema Fixer types
  FixResult,
  FixOptions,
  // Data Binding types
  BindingResult,
  PathSegment,
  ParseResult,
  DataField,
  // Event Handler types
  EventCallback,
  CustomActionHandler,
  NavigateHandler,
  SubmitHandler,
  UpdateHandler,
  ToggleHandler,
  EventHandlerConfig,
  // Serialization types
  SerializeOptions,
  DeserializeResult,
} from './core';

// =============================================================================
// LLM Module (lib/llm)
// LLM 相关模块：服务、配置管理、提供商预设等
// =============================================================================
export {
  // LLM Service
  validateLLMConfig,
  createLLMConfig,
  sendMessage,
  extractJSONBlocks,
  extractJSONBlocksWithMetadata,
  extractJSON,
  extractAllJSON,
  extractUISchema,
  collectStreamResponse,
  testConnection,
  DEFAULT_CONFIGS,
  injectSystemPrompt,
  buildOpenAIRequest,
  buildAnthropicRequest,
  buildHeaders,
  getEnhancedSystemPrompt,
  clearSystemPromptCache,
  // Provider Presets
  PROVIDER_PRESETS,
  getProviderPreset,
  // LLM Providers
  getAvailableModels,
  getAllModelsWithInfo,
  getAllProviderPresets,
  createConfigFromPreset,
  DEFAULT_SYSTEM_PROMPT,
  addModel,
  updateModel,
  deleteModel,
  getCustomModels,
  getCustomModelById,
  searchModels,
  isPresetModel,
  validateModel,
  loadFromStorage,
  saveToStorage,
  clearAllCustomModels,
  clearInMemoryModels,
  generateModelId,
  ModelOperationError,
  CUSTOM_MODELS_STORAGE_KEY,
  // LLM Config Manager
  LLM_CONFIG_STORAGE_KEY,
  LLM_CONFIGS_LIST_KEY,
  validateLLMConfigDetailed,
  saveLLMConfig,
  updateLLMConfig,
  loadAllLLMConfigs,
  loadLLMConfigById,
  deleteLLMConfig,
  saveCurrentLLMConfig,
  loadCurrentLLMConfig,
  clearCurrentLLMConfig,
  clearAllLLMConfigs,
  // Prompt Generator
  generateSystemPrompt,
  generateComponentDocs,
  generatePositiveExamples,
  generateNegativeExamples,
  generateIconGuidelines,
  generateRelevantExamplesSection,
  // Streaming Validator
  StreamingValidator,
  createStreamingValidator,
  // Retry Mechanism
  executeWithRetry,
  compareErrors,
  buildRetryPrompt,
  withTimeout,
  calculateFixRate,
  DEFAULT_LLM_RETRY_CONFIG,
} from './llm';
export type {
  // LLM Service types
  LLMProvider,
  LLMConfig,
  ChatMessage,
  StreamChunk,
  JSONExtractionResult,
  ExtractedJSONBlock,
  TestConnectionResult,
  ExtractUISchemaOptions,
  ExtractUISchemaResult,
  // Provider Presets types
  ProviderPreset,
  // LLM Providers types
  ModelInfo,
  CustomModel,
  ModelValidationResult,
  ModelValidationError,
  ModelOperationErrorCode,
  // LLM Config Manager types
  ConfigValidationError,
  ConfigValidationResult,
  SavedLLMConfig,
  // Prompt Generator types
  PromptGeneratorOptions,
  // Streaming Validator types
  StreamingValidatorCatalog,
  StreamingWarning,
  StreamingValidationResult,
  // Retry Mechanism types
  RetryStatus,
  RetryProgressEvent,
  RetryConfig as LLMRetryConfig,
  AttemptResult,
  RetryResult,
  LLMGenerateFunction,
} from './llm';

// =============================================================================
// Design System Module (lib/design-system)
// 设计系统模块：Design Tokens、Token 合规验证、约束注入等
// =============================================================================
export {
  // Design Tokens
  getDefaultDesignTokens,
  formatTokensForLLM,
  getColorTokenNames,
  getSpacingTokenNames,
  isValidColorToken,
  suggestColorToken,
  // Token Usage Registry
  TokenUsageRegistry,
  defaultTokenUsageRegistry,
  initializeDefaultTokenUsageRegistry,
  COLOR_TOKEN_USAGES,
  SPACING_TOKEN_USAGES,
  TYPOGRAPHY_TOKEN_USAGES,
  // Component Mapping Registry
  ComponentMappingRegistry,
  defaultComponentMappingRegistry,
  initializeDefaultComponentMappingRegistry,
  BUTTON_TOKEN_MAPPING,
  CONTAINER_TOKEN_MAPPING,
  ROW_TOKEN_MAPPING,
  COLUMN_TOKEN_MAPPING,
  TEXT_TOKEN_MAPPING,
  LABEL_TOKEN_MAPPING,
  INPUT_TOKEN_MAPPING,
  CARD_TOKEN_MAPPING,
  CARD_HEADER_TOKEN_MAPPING,
  CARD_TITLE_TOKEN_MAPPING,
  CARD_DESCRIPTION_TOKEN_MAPPING,
  CARD_CONTENT_TOKEN_MAPPING,
  CARD_FOOTER_TOKEN_MAPPING,
  BADGE_TOKEN_MAPPING,
  LINK_TOKEN_MAPPING,
  TEXTAREA_TOKEN_MAPPING,
  TABLE_TOKEN_MAPPING,
  TABLE_HEADER_TOKEN_MAPPING,
  TABLE_BODY_TOKEN_MAPPING,
  TABLE_ROW_TOKEN_MAPPING,
  TABLE_HEAD_TOKEN_MAPPING,
  TABLE_CELL_TOKEN_MAPPING,
  TABLE_FOOTER_TOKEN_MAPPING,
  TABLE_CAPTION_TOKEN_MAPPING,
  HEADING_TOKEN_MAPPING,
  IMAGE_TOKEN_MAPPING,
  ALL_COMPONENT_TOKEN_MAPPINGS,
  // Token Compliance Validator
  validateTokenCompliance,
  formatComplianceErrorsForLLM,
  detectHardcodedColors,
  detectHardcodedSpacing,
  usesTokenizedClasses,
  countTokenUsage,
  suggestColorReplacement,
  suggestSpacingReplacement,
  calculateComplianceScore,
  // Constraint Injector
  injectConstraints,
  getCachedConstraints,
  clearConstraintCache,
  getAllComponentNames,
  validateConstraintInjection,
  // Validation Chain
  executeValidationChain,
  formatErrorsForLLM,
  getValidationLayerOrder,
} from './design-system';
export type {
  // Design Tokens types
  ScreenSize,
  Breakpoints,
  ColorScale,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
  ShadowTokens,
  RadiusTokens,
  DesignTokens,
  // Token Usage Registry types
  TokenCategory,
  TokenUsage,
  TokenUsageMap,
  // Component Mapping Registry types
  PropTokenMapping,
  ComponentTokenMapping,
  // Token Compliance Validator types
  TokenComplianceErrorType,
  TokenComplianceWarningType,
  TokenComplianceError,
  TokenComplianceWarning,
  TokenComplianceResult,
  TokenComplianceConfig,
  // Constraint Injector types
  ConstraintInjectionConfig,
  // Validation Chain types
  ValidationLayer,
  ErrorSeverity,
  ChainValidationError,
  ValidationChainResult,
  ValidationChainConfig,
} from './design-system';

// =============================================================================
// Examples Module (lib/examples)
// 案例系统模块：案例库、检索器、注入器等
// =============================================================================
export {
  // Example Tags (Tag System)
  STANDARD_TAGS,
  getStandardCategories,
  getStandardTags,
  isStandardCategory,
  isStandardTag,
  validateCategory,
  getCategoryLabel,
  getCategoryDescription,
  // Custom Examples Storage
  generateExampleId,
  getAllExamples,
  getExamplesByComponent,
  getExampleById,
  createExample,
  updateExample,
  deleteExample,
  deleteExamplesByComponent,
  clearAllExamples,
  getExampleCount,
  exampleExists,
  searchExamples,
  // Preset Examples
  PRESET_EXAMPLES,
  getPresetExamplesByCategory,
  getPresetExampleById,
  getPresetExampleIds,
  validatePresetExampleTypes,
  // Example Composition Analyzer
  ExampleCompositionAnalyzer,
  defaultExampleCompositionAnalyzer,
  analyzeExampleComposition,
  formatCompositionForLLM,
  getPresetComposition,
  getAllPresetCompositions,
  isPresetCompositionsInitialized,
  initializePresetCompositions,
  clearPresetCompositions,
  // Example Library
  ExampleLibrary,
  createExampleLibrary,
  // Example Retriever
  ExampleRetriever,
  createExampleRetriever,
  // Example Injector
  ExampleInjector,
  createExampleInjector,
} from './examples';
export type {
  // Example Tags types
  ExampleCategory,
  StandardTag,
  CategoryValidationResult,
  // Custom Examples Storage types
  CustomExample,
  CreateExampleInput,
  UpdateExampleInput,
  StorageResult,
  // Preset Examples types
  ExampleMetadata,
  // Example Composition Analyzer types
  TokenReference,
  ExampleComposition,
  // Example Library types
  ExampleLibraryOptions,
  // Example Retriever types
  RetrievalOptions,
  RetrievalResult,
  KeywordMapping,
  // Example Injector types
  InjectionOptions,
} from './examples';

// =============================================================================
// Storage Module (lib/storage)
// 持久化模块：自定义模型管理器等
// =============================================================================
export {
  getAllModels,
} from './storage';
// Note: Most storage exports are already re-exported via llm module

// =============================================================================
// Utils Module (lib/utils)
// 工具函数模块：通用工具、错误处理、平台适配等
// =============================================================================
export {
  // Core utilities
  cn,
  generateId,
  // Monaco Editor - export monaco instance
  monaco,
  // Platform adapter
  PlatformAdapter,
  createPlatformAdapter,
  // Template manager
  TemplateManager,
  // Icon registry
  IconRegistry,
  defaultIconRegistry,
  validateIconDefinition,
  lucideIcons,
  initializeDefaultIcons,
  // Schema generator
  SchemaGenerator,
  createSchemaGenerator,
  // Schema sync
  SchemaSyncer,
  createSchemaSyncer,
  syncToJsonEditor,
  syncToDataBindingEditor,
  extractAndSync,
  buildDataContextFromFields,
  mergeDataContexts,
  extractBindingPaths,
  // Export utilities
  exportToJSON,
  exportToVue3,
  exportToReact,
  downloadExport,
  getVue3Dependencies,
  getReactDependencies,
} from './utils';
export type {
  // Platform adapter types
  PlatformMapping,
  // Template manager types
  ComponentTemplate,
  TemplateLayer,
  // Icon registry types
  IconDefinition,
  IconCategory,
  IconValidationResult,
  // Schema generator types
  SchemaGeneratorOptions,
  PropSchemaDefinition,
  EventDefinition,
  SlotDefinition,
  GeneratedSchema,
  // Schema sync types
  SchemaSyncEventType,
  SchemaSyncEvent,
  SchemaSyncCallback,
  SyncResult,
  DataBindingSyncOptions,
  // Export types
  JSONExportOptions,
  Vue3ExportOptions,
  ReactExportOptions,
  ExportResult,
  DependencyInfo,
} from './utils';

// =============================================================================
// State Management (still at root level, will be moved to stores in Task 4)
// 状态管理模块：聊天状态、编辑器状态、布局状态
// =============================================================================
export {
  // Chat state
  generateId as generateStateId,
  createInitialChatState,
  createMessage,
  createConversation,
  addMessageToConversation,
  updateMessageInConversation,
  addConversationToState,
  updateConversationInState,
  removeConversationFromState,
  setActiveConversation,
  getActiveConversation,
  getConversationsInOrder,
  getMessageCount,
  getMessages,
  // Editor state
  createInitialEditorState,
  updateEditorContent,
  setEditorSchema,
  markEditorSaved,
  updateCursorPosition,
  // Layout state
  DEFAULT_LAYOUT_STATE,
  LAYOUT_STORAGE_KEY,
  createInitialLayoutState,
  updatePanelWidth,
  togglePanelCollapsed,
  setPanelCollapsed,
  setActiveTab,
  setNarrowMode,
  setTheme,
  saveLayoutState,
  loadLayoutState,
  clearLayoutState,
  getOrCreateLayoutState,
} from './state-management';
export type {
  MessageRole,
  MessageStatus,
  ConversationMessage,
  Conversation,
  ChatState,
  ParseStatus,
  EditorState,
  PanelId,
  LayoutState,
} from './state-management';

// =============================================================================
// Error Handling (re-exported from utils module for backward compatibility)
// 错误处理模块：网络错误、Schema 错误、未知组件处理
// =============================================================================
export {
  // Error classes
  LLM2UIError,
  NetworkError,
  SchemaError,
  UnknownComponentError,
  // Network error handling
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  isRetryableError,
  fetchWithRetry,
  createNetworkErrorState,
  setNetworkError,
  clearNetworkError,
  getNetworkErrorMessage,
  // Schema error handling
  getSchemaErrorSuggestions,
  createSchemaErrorState,
} from './utils';
export type {
  RetryConfig,
  NetworkErrorState,
  SchemaErrorWithSuggestion,
  SchemaErrorState,
} from './utils';
