/**
 * @file index.ts
 * @description Examples 模块导出入口
 * @module lib/examples
 * 
 * 该模块提供案例驱动生成功能的核心组件：
 * - 案例标签体系 (example-tags)
 * - 自定义案例存储 (custom-examples-storage)
 * - 案例组成分析器 (example-composition-analyzer)
 * - 案例库 (example-library)
 * - 案例检索器 (example-retriever)
 * - 案例注入器 (example-injector)
 * 
 * 注意：主题特定的案例已迁移到各自的主题目录：
 * - shadcn 案例: src/lib/themes/builtin/shadcn/examples/
 * - Cherry 案例: src/lib/themes/builtin/cherry/examples/
 * 
 * 为保持向后兼容，本模块仍然重新导出这些案例。
 */

// Example Tags (Tag System)
export {
  STANDARD_TAGS,
  getStandardCategories,
  getStandardTags,
  isStandardCategory,
  isStandardTag,
  validateCategory,
  getCategoryLabel,
  getCategoryDescription,
} from './example-tags';
export type {
  ExampleCategory,
  StandardTag,
  CategoryValidationResult,
} from './example-tags';

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

// Preset Examples - 已迁移到 src/lib/themes/builtin/shadcn/examples/
// 从主题目录重新导出以保持向后兼容
export {
  PRESET_EXAMPLES,
  getPresetExamplesByCategory,
  getPresetExampleById,
  getPresetExampleIds,
  validatePresetExampleTypes,
} from '../themes/builtin/shadcn/examples/presets';
export type {
  ExampleMetadata,
} from '../themes/builtin/shadcn/examples/presets';

// Cherry Studio Patterns - 已迁移到 src/lib/themes/builtin/cherry/examples/
// 从主题目录重新导出以保持向后兼容
export {
  CHERRY_PATTERN_EXAMPLES,
  getCherryPatternExamples,
  cherryChatInterfaceExample,
  cherrySidebarNavigationExample,
  cherryModelSelectorExample,
  cherryMessageListExample,
  cherryInputBarExample,
  cherrySettingsPanelExample,
} from '../themes/builtin/cherry/examples';

// Example Composition Analyzer
export {
  ExampleCompositionAnalyzer,
  defaultExampleCompositionAnalyzer,
  analyzeExampleComposition,
  formatCompositionForLLM,
  getPresetComposition,
  getAllPresetCompositions,
  isPresetCompositionsInitialized,
  initializePresetCompositions,
  clearPresetCompositions,
} from './example-composition-analyzer';
export type {
  TokenReference,
  ExampleComposition,
} from './example-composition-analyzer';

// Example Library
export {
  ExampleLibrary,
  createExampleLibrary,
} from './example-library';
export type {
  ExampleLibraryOptions,
} from './example-library';

// Example Retriever
export {
  ExampleRetriever,
  createExampleRetriever,
} from './example-retriever';
export type {
  RetrievalOptions,
  RetrievalResult,
  KeywordMapping,
} from './example-retriever';

// Example Injector
export {
  ExampleInjector,
  createExampleInjector,
} from './example-injector';
export type {
  InjectionOptions,
} from './example-injector';

// Diversity Filter
export {
  DiversityFilter,
  createDiversityFilter,
} from './diversity-filter';
export type {
  DiversityFilterOptions,
  ScoredExample,
} from './diversity-filter';

// Config Loader
export {
  validateConfig,
  loadKeywordMappings,
  loadKeywordMappingsFromString,
  getDefaultKeywordMappings,
} from './config/config-loader';
export type {
  KeywordMappingsConfig,
  KeywordMappingEntry,
  ConfigValidationResult,
  ConfigLoadResult,
} from './config/config-loader';

// Example Validator
export {
  ExampleValidator,
  exampleValidator,
} from './example-validator';
export type {
  ValidationError,
  ValidationResult,
  QualityScoreBreakdown,
} from './example-validator';

// Example Registry
export {
  ExampleRegistry,
  RegistrationError,
  getExampleRegistry,
} from './example-registry';
export type {
  ExampleWithScore,
  ExampleCollection,
} from './example-registry';

// Example Collections
export {
  createLayoutCollection,
  createFormCollection,
  createChatCollection,
  createSettingsCollection,
  createDashboardCollection,
  createNavigationCollection,
  createDisplayCollection,
  createFeedbackCollection,
  createCherryCollection,
  getAllCollections,
  getCollectionByName,
  registerAllPresetExamples,
} from './example-collections';

// Cherry Extended Examples - 已迁移到 src/lib/themes/builtin/cherry/examples/
// 从主题目录重新导出以保持向后兼容
export {
  CHERRY_EXTENDED_EXAMPLES,
} from '../themes/builtin/cherry/examples';

// Semantic Retrieval
export {
  SemanticRetriever,
  createSemanticRetriever,
  SimpleEmbeddingProvider,
  createSimpleEmbeddingProvider,
  cosineSimilarity,
  normalizeVector,
  averageVectors,
} from './retrieval';
export type {
  EmbeddingVector,
  EmbeddingProvider,
  RetrievalOptions as SemanticRetrievalOptions,
  RetrievalResult as SemanticRetrievalResult,
  SemanticRetrieverOptions,
  CachedEmbedding,
} from './retrieval';
export type { ExampleData } from './retrieval/semantic-retriever';
