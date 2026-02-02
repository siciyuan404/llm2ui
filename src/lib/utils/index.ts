/**
 * Utils Module Index
 * 
 * Exports all utility modules for the llm2ui system.
 * 
 * @module lib/utils
 */

// Core utilities
export { cn, generateId } from './utils';

// Error handling - re-export from error-handling module
// Note: handleNetworkError, handleSchemaError, logUnknownComponent are legacy names
// The actual exports are the error classes and utility functions
export {
  LLM2UIError,
  NetworkError,
  SchemaError,
  UnknownComponentError,
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  isRetryableError,
  fetchWithRetry,
  createNetworkErrorState,
  setNetworkError,
  clearNetworkError,
  getNetworkErrorMessage,
  getSchemaErrorSuggestions,
  createSchemaErrorState,
  unknownComponentLogger,
  getUnknownComponentSuggestions,
  type RetryConfig,
  type NetworkErrorState,
  type SchemaErrorWithSuggestion,
  type SchemaErrorState,
  type UnknownComponentLog,
} from './error-handling';

// Monaco Editor configuration
export { monaco } from './monaco-config';

// Platform adapter
export {
  PlatformAdapter,
  createPlatformAdapter,
  type PlatformMapping,
} from './platform-adapter';

// Template manager
export {
  TemplateManager,
  type ComponentTemplate,
  type TemplateLayer,
} from './template-manager';

// Icon registry
export {
  IconRegistry,
  defaultIconRegistry,
  validateIconDefinition,
  lucideIcons,
  initializeDefaultIcons,
  type IconDefinition,
  type IconCategory,
  type IconValidationResult,
} from './icon-registry';

// Schema generator
export {
  SchemaGenerator,
  createSchemaGenerator,
  type SchemaGeneratorOptions,
  type PropSchemaDefinition,
  type EventDefinition,
  type SlotDefinition,
  type GeneratedSchema,
} from './schema-generator';

// Schema sync
export {
  SchemaSyncer,
  createSchemaSyncer,
  syncToJsonEditor,
  syncToDataBindingEditor,
  extractAndSync,
  buildDataContextFromFields,
  mergeDataContexts,
  extractBindingPaths,
  type SchemaSyncEventType,
  type SchemaSyncEvent,
  type SchemaSyncCallback,
  type SyncResult,
  type DataBindingSyncOptions,
} from './schema-sync';

// Export utilities
export {
  exportToJSON,
  exportToVue3,
  exportToReact,
  downloadExport,
  getVue3Dependencies,
  getReactDependencies,
  type JSONExportOptions,
  type Vue3ExportOptions,
  type ReactExportOptions,
  type ExportResult,
  type DependencyInfo,
} from './export';

// Clipboard utilities
export { copyToClipboard } from './clipboard';
