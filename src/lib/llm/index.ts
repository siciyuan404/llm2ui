/**
 * LLM Module Index
 * 
 * 统一导出 LLM 相关模块，包括服务、配置管理、提供商预设等。
 * 
 * @module lib/llm
 * @see Requirements 1.4 (LLM 子目录)
 */

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
  injectSystemPrompt,
  buildOpenAIRequest,
  buildAnthropicRequest,
  buildHeaders,
  getEnhancedSystemPrompt,
  clearSystemPromptCache,
} from './llm-service';
export type {
  LLMProvider,
  LLMConfig,
  ChatMessage,
  StreamChunk,
  JSONExtractionResult,
  ExtractedJSONBlock,
  TestConnectionResult,
  ExtractUISchemaOptions,
  ExtractUISchemaResult,
} from './llm-service';

// Provider Presets
export {
  PROVIDER_PRESETS,
  getProviderPreset,
} from './provider-presets';
export type {
  ProviderPreset,
} from './provider-presets';

// LLM Providers
export {
  getAvailableModels,
  getAllModelsWithInfo,
  getAllProviderPresets,
  createConfigFromPreset,
  DEFAULT_SYSTEM_PROMPT,
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

// Prompt Generator
export {
  generateSystemPrompt,
  generateComponentDocs,
  generatePositiveExamples,
  generateNegativeExamples,
  generateIconGuidelines,
  generateRelevantExamplesSection,
} from './prompt-generator';
export type {
  PromptGeneratorOptions,
} from './prompt-generator';

// Streaming Validator
export {
  StreamingValidator,
  createStreamingValidator,
} from './streaming-validator';
export type {
  StreamingValidatorCatalog,
  StreamingWarning,
  StreamingValidationResult,
} from './streaming-validator';

// Retry Mechanism
export {
  executeWithRetry,
  compareErrors,
  buildRetryPrompt,
  withTimeout,
  calculateFixRate,
  DEFAULT_LLM_RETRY_CONFIG,
} from './retry-mechanism';
export type {
  RetryStatus,
  RetryProgressEvent,
  RetryConfig,
  AttemptResult,
  RetryResult,
  LLMGenerateFunction,
} from './retry-mechanism';

// Token Counter
export {
  TokenCounter,
  tokenCounter,
} from './token-counter';
export type {
  TokenCountResult,
  ITokenCounter,
} from './token-counter';

// Template Loader
export {
  TemplateLoader,
  templateLoader,
} from './template-loader';
export type {
  TemplateVariables,
  LoadedTemplate,
  ITemplateLoader,
} from './template-loader';

// Prompt Builder
export {
  PromptBuilder,
  createPromptBuilder,
} from './prompt-builder';
export type {
  PromptBuilderOptions,
  PromptBuildResult,
} from './prompt-builder';

// Prompt Optimizer
export {
  PromptOptimizer,
  promptOptimizer,
  DEFAULT_TRIM_PRIORITIES,
} from './prompt-optimizer';
export type {
  OptimizeOptions,
  OptimizeResult,
  SectionData,
} from './prompt-optimizer';

// Prompt Cache
export {
  PromptCache,
  promptCache,
  generateCacheKey,
} from './prompt-cache';
export type {
  CacheEntry,
  PromptCacheOptions,
  IPromptCache,
} from './prompt-cache';
