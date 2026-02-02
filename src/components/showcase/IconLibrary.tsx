/**
 * IconLibrary - Icon library showcase component
 * 
 * Displays all available icons in a grid layout with search and category filtering.
 * Supports click-to-copy icon code, size and color preview.
 * 
 * @module IconLibrary
 * @see Requirements 12.1, 12.2, 12.3, 12.4, 12.5
 */

import * as React from 'react';
import { cn, copyToClipboard } from '@/lib/utils';
import {
  defaultIconRegistry,
  initializeDefaultIcons,
} from '@/lib';
import type {
  IconCategory,
  IconDefinition,
} from '@/lib';
import { SearchInput } from './SearchInput';

// ============================================================================
// Types
// ============================================================================

/**
 * Icon size options for preview
 */
export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for IconLibrary
 */
export interface IconLibraryProps {
  /** Callback when an icon is selected/copied */
  onIconSelect?: (icon: IconDefinition, code: string) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Props for IconGrid
 */
export interface IconGridProps {
  /** Icons to display */
  icons: IconDefinition[];
  /** Current preview size */
  previewSize: IconSize;
  /** Current preview color */
  previewColor: string;
  /** Callback when icon is clicked */
  onIconClick: (icon: IconDefinition) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Props for IconCard
 */
export interface IconCardProps {
  /** Icon definition */
  icon: IconDefinition;
  /** Preview size */
  size: IconSize;
  /** Preview color */
  color: string;
  /** Click handler */
  onClick: () => void;
  /** Whether the icon was recently copied */
  copied?: boolean;
}

/**
 * Props for CategoryTabs
 */
export interface CategoryTabsProps {
  /** Available categories */
  categories: IconCategory[];
  /** Currently selected category (null for all) */
  selectedCategory: IconCategory | null;
  /** Category counts */
  categoryCounts: Record<IconCategory, number>;
  /** Callback when category changes */
  onCategoryChange: (category: IconCategory | null) => void;
}

/**
 * Props for SizeSelector
 */
export interface SizeSelectorProps {
  /** Current size */
  size: IconSize;
  /** Callback when size changes */
  onSizeChange: (size: IconSize) => void;
}

/**
 * Props for ColorSelector
 */
export interface ColorSelectorProps {
  /** Current color */
  color: string;
  /** Callback when color changes */
  onColorChange: (color: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Size options with pixel values
 */
const SIZE_OPTIONS: Record<IconSize, { label: string; pixels: number }> = {
  sm: { label: '16px', pixels: 16 },
  md: { label: '24px', pixels: 24 },
  lg: { label: '32px', pixels: 32 },
  xl: { label: '48px', pixels: 48 },
};

/**
 * Preset color options
 */
const COLOR_PRESETS = [
  { value: 'currentColor', label: '默认' },
  { value: '#000000', label: '黑色' },
  { value: '#ffffff', label: '白色' },
  { value: '#3b82f6', label: '蓝色' },
  { value: '#22c55e', label: '绿色' },
  { value: '#ef4444', label: '红色' },
  { value: '#f59e0b', label: '橙色' },
  { value: '#8b5cf6', label: '紫色' },
];

/**
 * Category labels in Chinese
 */
const CATEGORY_LABELS: Record<IconCategory, string> = {
  general: '通用',
  arrow: '箭头',
  social: '社交',
  file: '文件',
  media: '媒体',
  action: '操作',
  navigation: '导航',
  communication: '通讯',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate icon usage code
 */
export function generateIconCode(icon: IconDefinition, size: IconSize, color: string): string {
  const pixels = SIZE_OPTIONS[size].pixels;
  const colorAttr = color === 'currentColor' ? '' : ` color="${color}"`;
  return `<Icon name="${icon.name}" size={${pixels}}${colorAttr} />`;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Category tabs for filtering icons
 */
function CategoryTabs({
  categories,
  selectedCategory,
  categoryCounts,
  onCategoryChange,
}: CategoryTabsProps) {
  const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap gap-2">
      {/* All category button */}
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          'px-3 py-1.5 text-sm rounded-md transition-colors',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
        )}
      >
        全部
        <span className="ml-1.5 text-xs opacity-70">({totalCount})</span>
      </button>

      {/* Category buttons */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            selectedCategory === category
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
          )}
        >
          {CATEGORY_LABELS[category] || category}
          <span className="ml-1.5 text-xs opacity-70">
            ({categoryCounts[category] || 0})
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * Size selector for icon preview
 */
function SizeSelector({ size, onSizeChange }: SizeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">大小:</span>
      <div className="flex border border-border rounded-md overflow-hidden">
        {(Object.keys(SIZE_OPTIONS) as IconSize[]).map((sizeKey) => (
          <button
            key={sizeKey}
            onClick={() => onSizeChange(sizeKey)}
            className={cn(
              'px-2 py-1 text-xs transition-colors',
              size === sizeKey
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            {SIZE_OPTIONS[sizeKey].label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Color selector for icon preview
 */
function ColorSelector({ color, onColorChange }: ColorSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">颜色:</span>
      <div className="flex items-center gap-1">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onColorChange(preset.value)}
            title={preset.label}
            className={cn(
              'w-6 h-6 rounded-full border-2 transition-all',
              color === preset.value
                ? 'border-primary scale-110'
                : 'border-transparent hover:border-muted-foreground/50'
            )}
            style={{
              backgroundColor: preset.value === 'currentColor' ? 'transparent' : preset.value,
              backgroundImage: preset.value === 'currentColor'
                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                : undefined,
              backgroundSize: preset.value === 'currentColor' ? '8px 8px' : undefined,
              backgroundPosition: preset.value === 'currentColor' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Single icon card in the grid
 */
function IconCard({ icon, size, color, onClick, copied }: IconCardProps) {
  const pixels = SIZE_OPTIONS[size].pixels;

  // Parse and render SVG with custom size and color
  const renderSvg = () => {
    // Replace width/height and add color
    let svg = icon.svg;
    svg = svg.replace(/width="[^"]*"/, `width="${pixels}"`);
    svg = svg.replace(/height="[^"]*"/, `height="${pixels}"`);
    if (color !== 'currentColor') {
      svg = svg.replace(/stroke="currentColor"/, `stroke="${color}"`);
      svg = svg.replace(/fill="currentColor"/, `fill="${color}"`);
    }
    return { __html: svg };
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4',
        'border border-border rounded-lg',
        'hover:bg-muted hover:border-primary/50 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        'group relative',
        copied && 'bg-green-50 border-green-500 dark:bg-green-950'
      )}
      title={`点击复制 ${icon.name}`}
    >
      {/* Icon preview */}
      <div
        className="flex items-center justify-center"
        style={{ minHeight: pixels, minWidth: pixels }}
        dangerouslySetInnerHTML={renderSvg()}
      />

      {/* Icon name */}
      <span className="text-xs text-muted-foreground group-hover:text-foreground truncate max-w-full">
        {icon.name}
      </span>

      {/* Copied indicator */}
      {copied && (
        <span className="absolute top-1 right-1 text-xs text-green-600 dark:text-green-400">
          ✓
        </span>
      )}

      {/* Hover tooltip with tags */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {icon.tags.slice(0, 3).join(', ')}
      </div>
    </button>
  );
}

/**
 * Icon grid display
 */
function IconGrid({
  icons,
  previewSize,
  previewColor,
  onIconClick,
  className,
}: IconGridProps) {
  const [copiedIcon, setCopiedIcon] = React.useState<string | null>(null);

  const handleIconClick = React.useCallback(
    async (icon: IconDefinition) => {
      onIconClick(icon);
      setCopiedIcon(icon.name);
      setTimeout(() => setCopiedIcon(null), 2000);
    },
    [onIconClick]
  );

  if (icons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <svg
          className="w-12 h-12 mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm">未找到匹配的图标</p>
        <p className="text-xs mt-1">尝试其他搜索词或分类</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-3',
        'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10',
        className
      )}
    >
      {icons.map((icon) => (
        <IconCard
          key={icon.name}
          icon={icon}
          size={previewSize}
          color={previewColor}
          onClick={() => handleIconClick(icon)}
          copied={copiedIcon === icon.name}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

// Initialize icons flag
let iconsInitialized = false;

/**
 * IconLibrary - Main icon library component
 * 
 * Features:
 * - Grid display of all icons
 * - Search by name and tags
 * - Category filtering
 * - Size and color preview controls
 * - Click to copy icon code
 */
export function IconLibrary({ onIconSelect, className }: IconLibraryProps) {
  // Initialize icons once
  React.useEffect(() => {
    if (!iconsInitialized) {
      initializeDefaultIcons();
      iconsInitialized = true;
    }
  }, []);

  // State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<IconCategory | null>(null);
  const [previewSize, setPreviewSize] = React.useState<IconSize>('md');
  const [previewColor, setPreviewColor] = React.useState('currentColor');

  // Get filtered icons
  const filteredIcons = React.useMemo(() => {
    let icons = defaultIconRegistry.getAll();

    // Filter by category
    if (selectedCategory) {
      icons = icons.filter((icon) => icon.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      icons = defaultIconRegistry.search(searchQuery);
      // Re-apply category filter after search
      if (selectedCategory) {
        icons = icons.filter((icon) => icon.category === selectedCategory);
      }
    }

    return icons;
  }, [searchQuery, selectedCategory]);

  // Get categories and counts
  const categories = defaultIconRegistry.getCategories();
  const categoryCounts = defaultIconRegistry.getCategoryCounts();

  // Handle icon click - copy code to clipboard
  const handleIconClick = React.useCallback(
    async (icon: IconDefinition) => {
      const code = generateIconCode(icon, previewSize, previewColor);
      await copyToClipboard(code);
      onIconSelect?.(icon, code);
    },
    [previewSize, previewColor, onIconSelect]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索图标名称或标签..."
        />

        {/* Category tabs */}
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          categoryCounts={categoryCounts}
          onCategoryChange={setSelectedCategory}
        />

        {/* Preview controls */}
        <div className="flex flex-wrap items-center gap-4">
          <SizeSelector size={previewSize} onSizeChange={setPreviewSize} />
          <ColorSelector color={previewColor} onColorChange={setPreviewColor} />
          <span className="text-sm text-muted-foreground ml-auto">
            共 {filteredIcons.length} 个图标
          </span>
        </div>
      </div>

      {/* Icon grid */}
      <div className="flex-1 overflow-auto p-4">
        <IconGrid
          icons={filteredIcons}
          previewSize={previewSize}
          previewColor={previewColor}
          onIconClick={handleIconClick}
        />
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-border bg-muted/50 text-center">
        <p className="text-xs text-muted-foreground">
          点击图标复制使用代码
        </p>
      </div>
    </div>
  );
}

export default IconLibrary;


export { copyToClipboard } from '@/lib/utils';
