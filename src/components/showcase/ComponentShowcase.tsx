/**
 * ComponentShowcase - Main showcase page for component library
 * 
 * Displays all registered UI components with filtering, search, and preview capabilities.
 * Implements a sidebar + main content area + detail panel layout.
 * Shows component details including preview, props, and examples when a component is selected.
 * Supports light/dark theme switching for component previews.
 * 
 * @module ComponentShowcase
 * @see Requirements 6.1, 6.2, 6.3, 11.1, 11.2, 11.3, 11.4, 15.2
 */

import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  defaultRegistry, 
  type ComponentRegistry, 
  type PlatformType,
  type ComponentDefinition 
} from '@/lib/component-registry';
import { initializeDefaultRegistry } from '@/lib/shadcn-components';
import { ComponentList } from './ComponentList';
import { SearchInput } from './SearchInput';
import { PlatformSwitcher } from './PlatformSwitcher';
import { CategoryFilter } from './CategoryFilter';
import { LivePreview } from './LivePreview';
import { PropsPanel } from './PropsPanel';
import { ExamplesTab } from './ExamplesTab';
import { ResponsivePreviewSelector } from './ResponsivePreviewSelector';
import { FullscreenPreview } from './FullscreenPreview';
import { UpgradeAlert } from './UpgradeAlert';
import type { UISchema } from '@/types';

// ============================================================================
// Types
// ============================================================================

/**
 * View mode for component display
 */
export type ViewMode = 'grid' | 'list';

/**
 * Preview size for responsive preview
 */
export type PreviewSize = 'desktop' | 'tablet' | 'mobile';

/**
 * Tab options for component details
 */
export type ShowcaseTab = 'preview' | 'props' | 'examples' | 'code';

/**
 * Showcase state management interface
 * @see Design Document: ShowcaseState
 */
export interface ShowcaseState {
  /** Currently selected platform filter */
  selectedPlatform: PlatformType | null;
  /** Currently selected category filter */
  selectedCategory: string | null;
  /** Search query string */
  searchQuery: string;
  /** View mode (grid or list) */
  viewMode: ViewMode;
  /** Preview theme (light or dark) */
  previewTheme: 'light' | 'dark';
  /** Preview size for responsive preview */
  previewSize: PreviewSize;
  /** Currently selected component name */
  selectedComponent: string | null;
  /** Currently active tab */
  selectedTab: ShowcaseTab;
  /** Whether fullscreen preview is open */
  isFullscreenOpen: boolean;
}

/**
 * Filtered result interface
 */
export interface FilteredResult {
  /** Filtered components */
  components: ComponentDefinition[];
  /** Total count before filtering */
  totalCount: number;
  /** Count by category */
  categoryCount: Record<string, number>;
}

/**
 * Props for ComponentShowcase
 */
export interface ComponentShowcaseProps {
  /** Component registry to use (defaults to defaultRegistry) */
  registry?: ComponentRegistry;
  /** Initial state override */
  initialState?: Partial<ShowcaseState>;
  /** Callback when state changes */
  onStateChange?: (state: ShowcaseState) => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Initial State
// ============================================================================

/**
 * Create initial showcase state
 */
export function createInitialShowcaseState(
  overrides?: Partial<ShowcaseState>
): ShowcaseState {
  return {
    selectedPlatform: null,
    selectedCategory: null,
    searchQuery: '',
    viewMode: 'grid',
    previewTheme: 'light',
    previewSize: 'desktop',
    selectedComponent: null,
    selectedTab: 'preview',
    isFullscreenOpen: false,
    ...overrides,
  };
}

// ============================================================================
// State Reducers
// ============================================================================

type ShowcaseAction =
  | { type: 'SET_PLATFORM'; platform: PlatformType | null }
  | { type: 'SET_CATEGORY'; category: string | null }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'SET_PREVIEW_THEME'; theme: 'light' | 'dark' }
  | { type: 'SET_PREVIEW_SIZE'; size: PreviewSize }
  | { type: 'SET_SELECTED_COMPONENT'; component: string | null }
  | { type: 'SET_SELECTED_TAB'; tab: ShowcaseTab }
  | { type: 'SET_FULLSCREEN'; isOpen: boolean }
  | { type: 'RESET_FILTERS' };

function showcaseReducer(state: ShowcaseState, action: ShowcaseAction): ShowcaseState {
  switch (action.type) {
    case 'SET_PLATFORM':
      return { ...state, selectedPlatform: action.platform };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.category };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };
    case 'SET_PREVIEW_THEME':
      return { ...state, previewTheme: action.theme };
    case 'SET_PREVIEW_SIZE':
      return { ...state, previewSize: action.size };
    case 'SET_SELECTED_COMPONENT':
      return { ...state, selectedComponent: action.component };
    case 'SET_SELECTED_TAB':
      return { ...state, selectedTab: action.tab };
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreenOpen: action.isOpen };
    case 'RESET_FILTERS':
      return {
        ...state,
        selectedPlatform: null,
        selectedCategory: null,
        searchQuery: '',
      };
    default:
      return state;
  }
}

// ============================================================================
// Filter Logic
// ============================================================================

/**
 * Filter components based on current state
 */
export function filterComponents(
  registry: ComponentRegistry,
  state: ShowcaseState
): FilteredResult {
  const platform = state.selectedPlatform ?? undefined;
  
  // Get all components for the platform
  let components = registry.getAll(platform);
  const totalCount = components.length;
  
  // Calculate category counts before filtering
  const categoryCount: Record<string, number> = {};
  for (const comp of components) {
    const category = comp.category || 'uncategorized';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  }
  
  // Filter by category
  if (state.selectedCategory) {
    components = components.filter(c => c.category === state.selectedCategory);
  }
  
  // Filter by search query
  if (state.searchQuery.trim()) {
    components = registry.search(state.searchQuery, platform);
    // Re-apply category filter after search
    if (state.selectedCategory) {
      components = components.filter(c => c.category === state.selectedCategory);
    }
  }
  
  return {
    components,
    totalCount,
    categoryCount,
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Sidebar component for filters and navigation
 */
function Sidebar({
  state,
  dispatch,
  categories,
  categoryCount,
}: {
  state: ShowcaseState;
  dispatch: React.Dispatch<ShowcaseAction>;
  categories: string[];
  categoryCount: Record<string, number>;
}) {
  return (
    <aside className="w-64 h-full border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold">组件库</h1>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="返回主界面"
          >
            ← 返回
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">Component Showcase</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <SearchInput
          value={state.searchQuery}
          onChange={(query) => dispatch({ type: 'SET_SEARCH', query })}
          placeholder="搜索组件..."
        />
      </div>

      {/* Platform Filter */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium mb-2">平台</h3>
        <PlatformSwitcher
          selectedPlatform={state.selectedPlatform}
          onPlatformChange={(platform) => dispatch({ type: 'SET_PLATFORM', platform })}
        />
      </div>

      {/* Category Filter */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="text-sm font-medium mb-2">分类</h3>
        <CategoryFilter
          categories={categories}
          categoryCount={categoryCount}
          selectedCategory={state.selectedCategory}
          onCategoryChange={(category) => dispatch({ type: 'SET_CATEGORY', category })}
        />
      </div>

      {/* Reset Filters */}
      {(state.selectedPlatform || state.selectedCategory || state.searchQuery) && (
        <div className="p-4 border-t border-border">
          <button
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            清除筛选
          </button>
        </div>
      )}
    </aside>
  );
}

/**
 * Toolbar component for view controls
 */
function Toolbar({
  state,
  dispatch,
  componentCount,
}: {
  state: ShowcaseState;
  dispatch: React.Dispatch<ShowcaseAction>;
  componentCount: number;
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="text-sm text-muted-foreground">
        共 {componentCount} 个组件
      </div>
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex items-center border border-border rounded-md">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' })}
            className={cn(
              'px-3 py-1.5 text-sm transition-colors',
              state.viewMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
            title="网格视图"
          >
            <GridIcon />
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'list' })}
            className={cn(
              'px-3 py-1.5 text-sm transition-colors',
              state.viewMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
            title="列表视图"
          >
            <ListIcon />
          </button>
        </div>

        {/* Responsive Preview Selector */}
        <ResponsivePreviewSelector
          value={state.previewSize}
          onChange={(size) => dispatch({ type: 'SET_PREVIEW_SIZE', size })}
        />

        {/* Theme Toggle */}
        <button
          onClick={() =>
            dispatch({
              type: 'SET_PREVIEW_THEME',
              theme: state.previewTheme === 'light' ? 'dark' : 'light',
            })
          }
          className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          title={state.previewTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
        >
          {state.previewTheme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}

// ============================================================================
// Detail Panel Component
// ============================================================================

/**
 * Tab labels for detail panel
 */
const TAB_LABELS: Record<ShowcaseTab, string> = {
  preview: '预览',
  props: '属性',
  examples: '案例',
  code: '代码',
};

/**
 * Detail panel for selected component
 * Shows preview, props, and examples tabs
 * 
 * @see Requirements 11.1, 11.2, 11.3, 11.4, 15.2, 15.3, 15.4, 10.4
 */
function DetailPanel({
  component,
  selectedTab,
  previewTheme,
  previewSize,
  onTabChange,
  onClose,
  onOpenInEditor,
  onFullscreen,
  onVersionChange,
}: {
  component: ComponentDefinition;
  selectedTab: ShowcaseTab;
  previewTheme: 'light' | 'dark';
  previewSize: PreviewSize;
  onTabChange: (tab: ShowcaseTab) => void;
  onClose: () => void;
  onOpenInEditor?: (schema: UISchema) => void;
  onFullscreen?: () => void;
  onVersionChange?: (version: string) => void;
}) {
  const availableTabs: ShowcaseTab[] = ['preview', 'props', 'examples'];
  
  // Count examples for badge
  const examplesCount = component.examples?.length ?? 0;

  return (
    <aside className="w-96 h-full border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold truncate" title={component.name}>
            {component.name}
          </h2>
          <div className="flex items-center gap-1">
            {onFullscreen && (
              <button
                onClick={onFullscreen}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                title="全屏预览"
              >
                <FullscreenIcon />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
              title="关闭详情"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {component.description || '暂无描述'}
        </p>
        {component.version && (
          <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-muted rounded">
            v{component.version}
          </span>
        )}
        
        {/* Upgrade Alert */}
        <UpgradeAlert
          component={component}
          onUpgrade={onVersionChange}
          compact={true}
          className="mt-3"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium transition-colors relative',
              selectedTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {TAB_LABELS[tab]}
            {tab === 'examples' && examplesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full">
                {examplesCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {selectedTab === 'preview' && (
          <div className="p-4">
            <LivePreview
              component={component}
              theme={previewTheme}
              previewSize={previewSize}
              showStateControls={true}
              className="min-h-[200px]"
            />
          </div>
        )}
        {selectedTab === 'props' && (
          <PropsPanel component={component} />
        )}
        {selectedTab === 'examples' && (
          <ExamplesTab
            component={component}
            onOpenInEditor={onOpenInEditor}
          />
        )}
      </div>
    </aside>
  );
}

// ============================================================================
// Main Component
// ============================================================================

// Initialize registry flag
let registryInitialized = false;

/**
 * ComponentShowcase - Main showcase page component
 */
export function ComponentShowcase({
  registry = defaultRegistry,
  initialState,
  onStateChange,
  className,
}: ComponentShowcaseProps) {
  const navigate = useNavigate();
  
  // Initialize registry once
  React.useEffect(() => {
    if (!registryInitialized) {
      initializeDefaultRegistry();
      registryInitialized = true;
    }
  }, []);

  // State management
  const [state, dispatch] = React.useReducer(
    showcaseReducer,
    createInitialShowcaseState(initialState)
  );

  // Notify parent of state changes
  React.useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Filter components
  const { components, categoryCount } = filterComponents(registry, state);
  const categories = registry.getCategories(state.selectedPlatform ?? undefined);

  // Get selected component definition
  const selectedComponentDef = React.useMemo(() => {
    if (!state.selectedComponent) return null;
    return registry.get(state.selectedComponent);
  }, [registry, state.selectedComponent]);

  // Check if any filters are active
  const hasFilters = !!(state.selectedPlatform || state.selectedCategory || state.searchQuery);

  // Handle "Open in Editor" - navigate to main page with schema
  const handleOpenInEditor = React.useCallback((schema: UISchema) => {
    // Store schema in sessionStorage for the main page to pick up
    sessionStorage.setItem('llm2ui-schema', JSON.stringify(schema));
    navigate('/');
  }, [navigate]);

  // Handle close detail panel
  const handleCloseDetail = React.useCallback(() => {
    dispatch({ type: 'SET_SELECTED_COMPONENT', component: null });
  }, []);

  // Handle open fullscreen preview
  const handleOpenFullscreen = React.useCallback(() => {
    dispatch({ type: 'SET_FULLSCREEN', isOpen: true });
  }, []);

  // Handle close fullscreen preview
  const handleCloseFullscreen = React.useCallback(() => {
    dispatch({ type: 'SET_FULLSCREEN', isOpen: false });
  }, []);

  // Handle version change - reload component with new version
  const handleVersionChange = React.useCallback((version: string) => {
    // For now, just log the version change
    // In a full implementation, this would reload the component definition
    // with the specified version from the registry
    console.log(`Upgrade to version: ${version}`);
    // The component would be reloaded with the new version
    // This could trigger a re-fetch of the component definition
  }, []);

  return (
    <div className={cn('flex h-full bg-background', className)}>
      {/* Sidebar */}
      <Sidebar
        state={state}
        dispatch={dispatch}
        categories={categories}
        categoryCount={categoryCount}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          state={state}
          dispatch={dispatch}
          componentCount={components.length}
        />

        {/* Component Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          <ComponentList
            components={components}
            viewMode={state.viewMode}
            selectedComponent={state.selectedComponent}
            onSelectComponent={(name) =>
              dispatch({ type: 'SET_SELECTED_COMPONENT', component: name })
            }
            theme={state.previewTheme}
            hasFilters={hasFilters}
            searchQuery={state.searchQuery}
            selectedCategory={state.selectedCategory}
            selectedPlatform={state.selectedPlatform}
            onClearFilters={() => dispatch({ type: 'RESET_FILTERS' })}
          />
        </div>
      </main>

      {/* Detail Panel - shown when a component is selected */}
      {selectedComponentDef && (
        <DetailPanel
          component={selectedComponentDef}
          selectedTab={state.selectedTab}
          previewTheme={state.previewTheme}
          previewSize={state.previewSize}
          onTabChange={(tab) => dispatch({ type: 'SET_SELECTED_TAB', tab })}
          onClose={handleCloseDetail}
          onOpenInEditor={handleOpenInEditor}
          onFullscreen={handleOpenFullscreen}
          onVersionChange={handleVersionChange}
        />
      )}

      {/* Fullscreen Preview Modal */}
      {selectedComponentDef && (
        <FullscreenPreview
          component={selectedComponentDef}
          isOpen={state.isFullscreenOpen}
          onClose={handleCloseFullscreen}
          initialTheme={state.previewTheme}
          initialSize={state.previewSize}
        />
      )}
    </div>
  );
}

export default ComponentShowcase;
