/**
 * ComponentList - Component list display with grid/list view support
 * 
 * Displays a list of components in either grid or list view mode.
 * Includes empty state handling, component selection, and theme support.
 * 
 * @module ComponentList
 * @see Requirements 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 15.2
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentDefinition } from '@/lib/component-registry';
import type { ViewMode } from './ComponentShowcase';
import { ComponentCard, type ComponentCardProps } from './ComponentCard';
import type { PreviewTheme } from './LivePreview';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for ComponentList
 */
export interface ComponentListProps {
  /** Array of components to display */
  components: ComponentDefinition[];
  /** View mode (grid or list) */
  viewMode: ViewMode;
  /** Currently selected component name */
  selectedComponent: string | null;
  /** Callback when a component is selected */
  onSelectComponent: (name: string) => void;
  /** Preview theme (light or dark) */
  theme?: PreviewTheme;
  /** Whether filters are currently active */
  hasFilters?: boolean;
  /** Search query (for search-specific messaging) */
  searchQuery?: string;
  /** Selected category (for category-specific messaging) */
  selectedCategory?: string | null;
  /** Selected platform (for platform-specific messaging) */
  selectedPlatform?: string | null;
  /** Callback to clear filters */
  onClearFilters?: () => void;
  /** Optional preview renderer for component cards */
  renderPreview?: (component: ComponentDefinition) => React.ReactNode;
  /** Whether to show state controls for variant switching */
  showStateControls?: boolean;
  /** Additional class name */
  className?: string;
}

// Re-export ComponentCardProps for backwards compatibility
export type { ComponentCardProps };

/**
 * Empty state type for different scenarios
 */
export type EmptyStateType = 'no-components' | 'no-results' | 'no-search-results' | 'no-category-results';

/**
 * Props for EmptyState
 */
export interface EmptyStateProps {
  /** Whether filters are currently active */
  hasFilters: boolean;
  /** Type of empty state to display */
  type?: EmptyStateType;
  /** Search query (for search-specific messaging) */
  searchQuery?: string;
  /** Selected category (for category-specific messaging) */
  selectedCategory?: string | null;
  /** Selected platform (for platform-specific messaging) */
  selectedPlatform?: string | null;
  /** Callback to clear filters */
  onClearFilters?: () => void;
}

// ============================================================================
// Icons
// ============================================================================

/**
 * Box icon for empty component state
 */
function BoxIcon() {
  return (
    <svg
      className="w-16 h-16 mb-4 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

/**
 * Search icon for no search results state
 */
function SearchEmptyIcon() {
  return (
    <svg
      className="w-16 h-16 mb-4 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 7v6m0 0v0m0 0h0"
      />
    </svg>
  );
}

/**
 * Filter icon for no filter results state
 */
function FilterEmptyIcon() {
  return (
    <svg
      className="w-16 h-16 mb-4 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Determine the empty state type based on current filters
 */
function getEmptyStateType(props: EmptyStateProps): EmptyStateType {
  if (!props.hasFilters) {
    return 'no-components';
  }
  if (props.searchQuery && props.searchQuery.trim()) {
    return 'no-search-results';
  }
  if (props.selectedCategory) {
    return 'no-category-results';
  }
  return 'no-results';
}

/**
 * Get the appropriate icon for the empty state type
 */
function getEmptyStateIcon(type: EmptyStateType) {
  switch (type) {
    case 'no-search-results':
      return <SearchEmptyIcon />;
    case 'no-category-results':
    case 'no-results':
      return <FilterEmptyIcon />;
    case 'no-components':
    default:
      return <BoxIcon />;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get platform display name
 */
function getPlatformDisplayName(platform: string | null | undefined): string {
  if (!platform) return '';
  const platformNames: Record<string, string> = {
    'pc-web': 'PC Web',
    'mobile-web': 'Mobile Web',
    'mobile-native': 'Mobile Native',
    'pc-desktop': 'PC Desktop',
  };
  return platformNames[platform] || platform;
}

/**
 * Get category display name
 */
function getCategoryDisplayName(category: string | null | undefined): string {
  if (!category) return '';
  const categoryNames: Record<string, string> = {
    'input': '输入组件',
    'layout': '布局组件',
    'display': '展示组件',
    'feedback': '反馈组件',
    'navigation': '导航组件',
  };
  return categoryNames[category] || category;
}

/**
 * Empty state component when no components match filters
 * 
 * Displays contextual messages based on:
 * - No registered components (initial state)
 * - No search results (search query active)
 * - No category results (category filter active)
 * - No filter results (other filters active)
 * 
 * @see Requirements 1.4, 4.4, 5.4
 */
export function EmptyState({
  hasFilters,
  searchQuery,
  selectedCategory,
  selectedPlatform,
  onClearFilters,
}: EmptyStateProps) {
  const type = getEmptyStateType({ hasFilters, searchQuery, selectedCategory, selectedPlatform });
  const icon = getEmptyStateIcon(type);

  // Build contextual message
  const renderMessage = () => {
    switch (type) {
      case 'no-search-results':
        return (
          <>
            <h3 className="text-base font-medium mb-2">未找到匹配的组件</h3>
            <p className="text-sm opacity-75 mb-1">
              搜索 "<span className="font-medium">{searchQuery}</span>" 没有找到结果
            </p>
            <p className="text-xs opacity-60">
              尝试使用不同的关键词，或检查拼写是否正确
            </p>
          </>
        );

      case 'no-category-results':
        return (
          <>
            <h3 className="text-base font-medium mb-2">该分类暂无组件</h3>
            <p className="text-sm opacity-75 mb-1">
              分类 "<span className="font-medium">{getCategoryDisplayName(selectedCategory)}</span>" 
              {selectedPlatform && (
                <> 在 <span className="font-medium">{getPlatformDisplayName(selectedPlatform)}</span> 平台</>
              )}
              下没有可用组件
            </p>
            <p className="text-xs opacity-60">
              尝试选择其他分类或切换平台
            </p>
          </>
        );

      case 'no-results':
        return (
          <>
            <h3 className="text-base font-medium mb-2">没有匹配的组件</h3>
            <p className="text-sm opacity-75 mb-1">
              当前筛选条件下没有找到组件
              {selectedPlatform && (
                <>（平台: <span className="font-medium">{getPlatformDisplayName(selectedPlatform)}</span>）</>
              )}
            </p>
            <p className="text-xs opacity-60">
              尝试调整筛选条件或清除筛选
            </p>
          </>
        );

      case 'no-components':
      default:
        return (
          <>
            <h3 className="text-base font-medium mb-2">暂无已注册组件</h3>
            <p className="text-sm opacity-75 mb-1">
              组件库中还没有注册任何组件
            </p>
            <p className="text-xs opacity-60">
              请先通过 Component Registry 注册组件
            </p>
          </>
        );
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground p-8"
      role="status"
      aria-live="polite"
    >
      {icon}
      <div className="text-center max-w-md">
        {renderMessage()}
      </div>
      
      {/* Clear filters button */}
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className={cn(
            'mt-6 px-4 py-2 text-sm rounded-md',
            'border border-border bg-background',
            'hover:bg-muted transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring'
          )}
        >
          清除所有筛选
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ComponentList - Displays components in grid or list view
 * 
 * Features:
 * - Grid view with cards
 * - List view with rows
 * - Theme support for light/dark mode preview
 * - Empty state handling with contextual messages
 * - Keyboard navigation support
 * - Component selection
 * - Variant/state switching controls
 * 
 * @see Requirements 1.4, 4.4, 5.4, 15.2
 */
export function ComponentList({
  components,
  viewMode,
  selectedComponent,
  onSelectComponent,
  theme = 'light',
  hasFilters = false,
  searchQuery,
  selectedCategory,
  selectedPlatform,
  onClearFilters,
  renderPreview,
  showStateControls = true,
  className,
}: ComponentListProps) {
  // Handle empty state
  if (components.length === 0) {
    return (
      <EmptyState
        hasFilters={hasFilters}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedPlatform={selectedPlatform}
        onClearFilters={onClearFilters}
      />
    );
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
          className
        )}
        role="listbox"
        aria-label="组件列表"
      >
        {components.map((component) => (
          <ComponentCard
            key={component.name}
            component={component}
            viewMode="grid"
            isSelected={selectedComponent === component.name}
            onClick={() => onSelectComponent(component.name)}
            theme={theme}
            renderPreview={renderPreview}
            showStateControls={showStateControls}
          />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div
      className={cn('border border-border rounded-lg overflow-hidden', className)}
      role="listbox"
      aria-label="组件列表"
    >
      {components.map((component) => (
        <ComponentCard
          key={component.name}
          component={component}
          viewMode="list"
          isSelected={selectedComponent === component.name}
          onClick={() => onSelectComponent(component.name)}
          theme={theme}
          renderPreview={renderPreview}
          showStateControls={showStateControls}
        />
      ))}
    </div>
  );
}

export default ComponentList;
