/**
 * Library exports for llm2ui
 */

// Component Registry
export {
  ComponentRegistry,
  defaultRegistry,
  validateComponentDefinition,
} from './component-registry';
export type {
  ComponentDefinition,
  PropSchema,
  ComponentValidationResult,
} from './component-registry';

// shadcn-ui Components
export {
  registerShadcnComponents,
  initializeDefaultRegistry,
  getRegisteredComponentNames,
} from './shadcn-components';

// Serialization
export { serialize, deserialize, schemasEqual } from './serialization';

// Validation
export { validateJSON, validateUISchema } from './validation';

// Data Binding
export {
  parseBindingExpression,
  resolveBindings,
  extractDataFields,
} from './data-binding';

// Renderer
export {
  render,
  UIRenderer,
  useRenderer,
  extractPureSchema,
} from './renderer';
export type {
  EventHandler,
  RenderOptions,
  UIRendererProps,
} from './renderer';

// Event Handler
export {
  createEventCallback,
  createStateUpdateHandler,
  createStateToggleHandler,
  defaultNavigateHandler,
  extractEventType,
  toReactEventName,
} from './event-handler';
export type {
  EventCallback,
  EventHandlerConfig,
  CustomActionHandler,
  NavigateHandler,
  SubmitHandler,
  UpdateHandler,
  ToggleHandler,
} from './event-handler';

// Utils
export { cn } from './utils';

// State Management
export {
  // Chat state
  generateId,
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

// LLM Service
export {
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
} from './llm-service';
export type {
  LLMProvider,
  LLMConfig,
  ChatMessage,
  StreamChunk,
  JSONExtractionResult,
  ExtractedJSONBlock,
  TestConnectionResult,
} from './llm-service';

// LLM Providers
export {
  PROVIDER_PRESETS,
  getProviderPreset,
  getAvailableModels,
  getAllProviderPresets,
  createConfigFromPreset,
  DEFAULT_SYSTEM_PROMPT,
  getAllModelsWithInfo,
  // Re-exported from custom-model-manager
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
} from './llm-providers';
export type {
  ProviderPreset,
  ModelInfo,
  CustomModel,
  ModelValidationResult,
  ModelValidationError,
  ModelOperationErrorCode,
} from './llm-providers';

// LLM Config Manager
export {
  LLM_CONFIG_STORAGE_KEY,
  LLM_CONFIGS_LIST_KEY,
  validateLLMConfig as validateLLMConfigDetailed,
  saveLLMConfig,
  updateLLMConfig,
  loadAllLLMConfigs,
  loadLLMConfigById,
  deleteLLMConfig,
  saveCurrentLLMConfig,
  loadCurrentLLMConfig,
  clearCurrentLLMConfig,
  clearAllLLMConfigs,
} from './llm-config-manager';
export type {
  ConfigValidationError,
  ConfigValidationResult,
  SavedLLMConfig,
} from './llm-config-manager';

// Export
export {
  exportToJSON,
  exportToVue3,
  exportToReact,
  getVue3Dependencies,
  getReactDependencies,
  downloadExport,
} from './export';
export type {
  JSONExportOptions,
  Vue3ExportOptions,
  ReactExportOptions,
  ExportResult,
  DependencyInfo,
} from './export';

// Schema Generator
export {
  SchemaGenerator,
  createSchemaGenerator,
} from './schema-generator';
export type {
  SchemaGeneratorOptions,
  PropSchemaDefinition,
  EventDefinition,
  SlotDefinition,
  GeneratedSchema,
} from './schema-generator';

// Error Handling
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
  // Unknown component handling
  unknownComponentLogger,
  getUnknownComponentSuggestions,
  AVAILABLE_COMPONENT_TYPES,
} from './error-handling';
export type {
  RetryConfig,
  NetworkErrorState,
  SchemaErrorWithSuggestion,
  SchemaErrorState,
  UnknownComponentLog,
  AvailableComponentType,
} from './error-handling';

// Custom Examples Storage
export {
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
} from './custom-examples-storage';
export type {
  CustomExample,
  CreateExampleInput,
  UpdateExampleInput,
  StorageResult,
} from './custom-examples-storage';

// Schema Sync
export {
  SchemaSyncer,
  createSchemaSyncer,
  syncToJsonEditor,
  syncToDataBindingEditor,
  extractAndSync,
  buildDataContextFromFields,
  mergeDataContexts,
  extractBindingPaths,
} from './schema-sync';
export type {
  SchemaSyncEventType,
  SchemaSyncEvent,
  SchemaSyncCallback,
  SyncResult,
  DataBindingSyncOptions,
} from './schema-sync';
