/**
 * @file index.ts
 * @description Design System 模块统一导出入口
 * @module lib/design-system
 * @requirements 1.1, 1.5, 7.1, 7.2, 8.4
 */

// Design Tokens
export {
  getDefaultDesignTokens,
  formatTokensForLLM,
  getColorTokenNames,
  getSpacingTokenNames,
  isValidColorToken,
  suggestColorToken,
  formatSimpleThemeTokensForLLM,
  simpleThemeTokensToDesignTokens,
} from './design-tokens';
export type {
  ScreenSize,
  Breakpoints,
  ColorScale,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
  ShadowTokens,
  RadiusTokens,
  DesignTokens,
  SimpleColorTokens,
  SimpleThemeTokens,
  TokenCategory as ExtensionTokenCategory,
} from './design-tokens';

// Token Usage Registry
export {
  TokenUsageRegistry,
  defaultTokenUsageRegistry,
  initializeDefaultTokenUsageRegistry,
  COLOR_TOKEN_USAGES,
  SPACING_TOKEN_USAGES,
  TYPOGRAPHY_TOKEN_USAGES,
} from './token-usage-registry';
export type {
  TokenCategory,
  TokenUsage,
  TokenUsageMap,
} from './token-usage-registry';

// Component Mapping Registry
export {
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
} from './component-mapping-registry';
export type {
  PropTokenMapping,
  ComponentTokenMapping,
} from './component-mapping-registry';

// Token Compliance Validator
export {
  validateTokenCompliance,
  formatComplianceErrorsForLLM,
  detectHardcodedColors,
  detectHardcodedSpacing,
  usesTokenizedClasses,
  countTokenUsage,
  suggestColorReplacement,
  suggestSpacingReplacement,
  calculateComplianceScore,
} from './token-compliance-validator';
export type {
  TokenComplianceErrorType,
  TokenComplianceWarningType,
  TokenComplianceError,
  TokenComplianceWarning,
  TokenComplianceResult,
  TokenComplianceConfig,
} from './token-compliance-validator';

// Constraint Injector
export {
  injectConstraints,
  getCachedConstraints,
  clearConstraintCache,
  getAllComponentNames,
  validateConstraintInjection,
} from './constraint-injector';
export type {
  ConstraintInjectionConfig,
} from './constraint-injector';

// Validation Chain
export {
  executeValidationChain,
  formatErrorsForLLM,
  getValidationLayerOrder,
} from './validation-chain';
export type {
  ValidationLayer,
  ErrorSeverity,
  ChainValidationError,
  ValidationChainResult,
  ValidationChainConfig,
} from './validation-chain';

// Icon Compliance Validator (Emoji Validator)
export {
  detectEmojis,
  getIconSuggestion,
  validateIconCompliance,
  formatIconComplianceForLLM,
  DEFAULT_EMOJI_ICON_MAPPINGS,
} from './emoji-validator';
export type {
  IconComplianceWarning,
  IconComplianceResult,
} from './emoji-validator';


// CSS Variables
export {
  generateCssVariablesFromDesignTokens,
  generateCssVariablesFromThemeTokens,
  cssVariablesToString,
  applyCssVariables,
  clearCssVariables,
  getCommonCssVariableNames,
  getCurrentColorSchemeType,
  setColorSchemeType,
  watchSystemColorScheme,
} from './css-variables';
export type {
  CssVariableMap,
  CssVariableGenerationOptions,
  ApplyCssVariablesOptions,
} from './css-variables';
