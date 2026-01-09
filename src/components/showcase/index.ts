/**
 * Showcase Components
 * 
 * Component showcase and management module exports.
 * 
 * @module showcase
 */

export {
  ComponentShowcase,
  type ShowcaseState,
  type ShowcaseModule,
  type ComponentShowcaseProps,
} from './ComponentShowcase';

export {
  ComponentList,
  EmptyState,
  type ComponentListProps,
  type EmptyStateProps,
  type EmptyStateType,
} from './ComponentList';

export {
  ComponentCard,
  type ComponentCardProps,
} from './ComponentCard';

export {
  CategoryFilter,
  type CategoryFilterProps,
} from './CategoryFilter';

export {
  SearchInput,
  type SearchInputProps,
} from './SearchInput';

export {
  PlatformSwitcher,
  DEFAULT_PLATFORM_OPTIONS,
  type PlatformSwitcherProps,
  type PlatformOption,
} from './PlatformSwitcher';

export {
  LivePreview,
  VariantPreview,
  ExamplePreview,
  type LivePreviewProps,
  type VariantPreviewProps,
  type ExamplePreviewProps,
  type PreviewState,
  type PreviewTheme,
  type PreviewSizeType,
} from './LivePreview';

export {
  ResponsivePreviewSelector,
  DEVICE_CONFIGS,
  getPreviewDimensions,
  type ResponsivePreviewSelectorProps,
  type DeviceConfig,
} from './ResponsivePreviewSelector';

export {
  PropsPanel,
  type PropsPanelProps,
} from './PropsPanel';

export {
  ExamplesTab,
  copyToClipboard,
  generateMigrationGuide,
  type ExamplesTabProps,
  type VersionChangeEntry,
  type MigrationGuide,
} from './ExamplesTab';

export {
  IconLibrary,
  generateIconCode,
  copyToClipboard as copyIconToClipboard,
  type IconLibraryProps,
  type IconGridProps,
  type IconCardProps,
  type CategoryTabsProps,
  type SizeSelectorProps,
  type ColorSelectorProps,
  type IconSize,
} from './IconLibrary';

export {
  FullscreenPreview,
  type FullscreenPreviewProps,
} from './FullscreenPreview';

export {
  VersionSelector,
  type VersionSelectorProps,
} from './VersionSelector';

export {
  UpgradeAlert,
  checkUpgradeAvailable,
  type UpgradeAlertProps,
  type UpgradeInfo,
} from './UpgradeAlert';

export {
  CustomExampleForm,
  validateFormData,
  parseSchemaJson,
  type CustomExample,
  type CustomExampleFormData,
  type FormErrors,
  type CustomExampleFormProps,
} from './CustomExampleForm';

export {
  PlatformComparison,
  MultiPlatformDifferencePanel,
  compareMultiplePlatforms,
  PLATFORM_INFO,
  ALL_PLATFORMS,
  type PlatformComparisonProps,
  type PlatformInfo,
  type PropertyDifference,
  type PlatformComparisonResult,
} from './PlatformComparison';

export {
  SidebarNav,
  filterCategories,
  type SidebarNavProps,
  type SidebarNavItem,
  type SidebarNavCategory,
} from './SidebarNav';

export {
  TokensModule,
  type TokensModuleProps,
  type TokenCategory,
} from './TokensModule';

export {
  ComponentsModule,
  ComponentDoc,
  type ComponentsModuleProps,
  type ComponentDocProps,
  type ComponentCategoryConfig,
  type PropTableRow,
} from './ComponentsModule';

export {
  ExamplesModule,
  ExampleDoc,
  type ExamplesModuleProps,
  type ExampleDocProps,
  type ExampleCategoryConfig,
} from './ExamplesModule';

export {
  ScreenSizeSwitcher,
  useScreenSize,
  getScreenSizeConfig,
  getScreenSizeDimensions,
  isValidScreenSize,
  parseScreenSizeFromUrl,
  SCREEN_SIZE_CONFIGS,
  type ScreenSizeSwitcherProps,
  type ScreenSize,
  type ScreenSizeConfig,
} from './ScreenSizeSwitcher';

export {
  ValidationFeedback,
  LoadingState,
  SuccessState,
  ErrorState,
  RetryProgress,
  ErrorItem,
  ErrorCategoryGroup,
  ErrorList,
  JsonErrorHighlight,
  categorizeError,
  getCategoryDisplayName,
  groupErrorsByCategory,
  formatErrorReport,
  type ValidationFeedbackProps,
  type GenerationStatus,
  type ErrorCategory,
  type CategorizedError,
} from './ValidationFeedback';

// 主题相关组件
export {
  ThemeSwitcher,
  type ThemeSwitcherProps,
} from './ThemeSwitcher';

export {
  ThemeCard,
  type ThemeCardProps,
} from './ThemeCard';

export {
  ThemePreview,
  type ThemePreviewProps,
} from './ThemePreview';

export {
  ThemeMarketplace,
  type ThemeMarketplaceProps,
  type ThemeCategory,
} from './ThemeMarketplace';
