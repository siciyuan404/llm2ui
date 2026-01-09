/**
 * Core Module Index
 * 
 * 核心渲染模块，包含组件注册、渲染、验证、数据绑定等核心功能。
 * 
 * @module lib/core
 * @see Requirements 1.1, 1.3, 7.1, 7.2, 8.4
 */

// Component Registry
export {
  ComponentRegistry,
  defaultRegistry,
  validateComponentDefinition,
  parseStorageKey,
  type PlatformType,
  type ComponentCategory,
  type PropSchema,
  type ComponentExample,
  type ComponentDefinition,
  type ComponentDefinitionData,
  type ComponentValidationResult,
  type IComponentRegistry,
} from './component-registry';

// Component Catalog
export {
  ComponentCatalog,
  defaultCatalog,
  TYPE_ALIAS_MAP,
  createThemedCatalog,
  createStaticCatalog,
  type ComponentMetadata,
} from './component-catalog';

// Renderer
export {
  render,
  UIRenderer,
  useRenderer,
  extractPureSchema,
  type EventHandler,
  type RenderOptions,
  type UIRendererProps,
} from './renderer';

// Validation
export {
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
  type ValidationSeverity,
  type ValidationErrorCode,
  type EnhancedValidationError,
  type EnhancedValidationResult,
  type ValidationOptions,
  type JSONValidationResult,
  type JSONValidationError,
  type UISchemaValidationResult,
} from './validation';

// Schema Fixer
export {
  fixUISchema,
  generateComponentId,
  type FixResult,
  type FixOptions,
} from './schema-fixer';

// Data Binding
export {
  parsePath,
  parseBindingExpression,
  resolvePath,
  resolveBinding,
  resolveBindings,
  extractDataFields,
  getUniquePaths,
  type BindingResult,
  type PathSegment,
  type ParseResult,
  type DataField,
} from './data-binding';

// Event Handler
export {
  createEventCallback,
  defaultNavigateHandler,
  createStateUpdateHandler,
  createStateToggleHandler,
  extractEventType,
  toReactEventName,
  type EventCallback,
  type CustomActionHandler,
  type NavigateHandler,
  type SubmitHandler,
  type UpdateHandler,
  type ToggleHandler,
  type EventHandlerConfig,
} from './event-handler';

// Serialization
export {
  serialize,
  deserialize,
  schemasEqual,
  type SerializeOptions,
  type DeserializeResult,
} from './serialization';

// shadcn Components Registration
export {
  registerShadcnComponents,
  initializeDefaultRegistry,
  getRegisteredComponentNames,
} from './shadcn-components';
