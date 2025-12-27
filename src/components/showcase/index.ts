/**
 * Showcase Components
 * 
 * Component showcase and management module exports.
 * 
 * @module showcase
 */

export {
  ComponentShowcase,
  createInitialShowcaseState,
  filterComponents,
  type ShowcaseState,
  type ShowcaseTab,
  type ViewMode,
  type PreviewSize,
  type FilteredResult,
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
