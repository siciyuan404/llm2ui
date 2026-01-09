/**
 * ComponentShowcase - Main showcase page for design system documentation
 * 
 * Refactored as a design system documentation center with three main modules:
 * - Tokens: Design tokens (Icons, Typography, Colors, Spacing, Shadows, Border Radius)
 * - Components: Component library with documentation
 * - Examples: UI examples and patterns
 * 
 * Supports module switching via tabs and URL routing.
 * Now integrates with the multi-theme system to display theme-specific content.
 * 
 * @module ComponentShowcase
 * @see Requirements 1.1, 2.1, 3.1, 5.1
 */

import * as React from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Palette, Package, ClipboardList, Paintbrush } from 'lucide-react';
import { TokensModule, type TokenCategory } from './TokensModule';
import { ComponentsModule } from './ComponentsModule';
import { ExamplesModule } from './ExamplesModule';
import { ThemeMarketplace } from './ThemeMarketplace';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ScreenSizeSwitcher, parseScreenSizeFromUrl, type ScreenSize } from './ScreenSizeSwitcher';
import { getThemeManager, type ThemePack } from '@/lib/themes';
import type { UISchema } from '@/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Showcase module type
 */
export type ShowcaseModule = 'tokens' | 'components' | 'examples' | 'themes';

/**
 * Showcase state management interface
 */
export interface ShowcaseState {
  /** Currently active module */
  activeModule: ShowcaseModule;
  /** Currently selected item ID within the module */
  activeItemId: string | null;
  /** Screen size for preview */
  screenSize: ScreenSize;
  /** Theme (light or dark) */
  theme: 'light' | 'dark';
}

/**
 * Props for ComponentShowcase
 */
export interface ComponentShowcaseProps {
  /** Initial module to display */
  initialModule?: ShowcaseModule;
  /** Callback when state changes */
  onStateChange?: (state: ShowcaseState) => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Module tab configuration
 */
const MODULE_TABS: { id: ShowcaseModule; label: string; icon: React.ReactNode }[] = [
  { id: 'tokens', label: 'Tokens', icon: <Palette className="w-4 h-4" /> },
  { id: 'components', label: 'Components', icon: <Package className="w-4 h-4" /> },
  { id: 'examples', label: 'Examples', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'themes', label: 'Themes', icon: <Paintbrush className="w-4 h-4" /> },
];

/**
 * Default token category
 */
const DEFAULT_TOKEN_CATEGORY: TokenCategory = 'icons';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse module from URL path
 */
function parseModuleFromPath(pathname: string): ShowcaseModule {
  if (pathname.includes('/showcase/tokens')) return 'tokens';
  if (pathname.includes('/showcase/components')) return 'components';
  if (pathname.includes('/showcase/examples')) return 'examples';
  if (pathname.includes('/showcase/themes')) return 'themes';
  return 'tokens'; // Default to tokens
}

/**
 * Parse item ID from URL path
 */
function parseItemIdFromPath(pathname: string, module: ShowcaseModule): string | null {
  const basePath = `/showcase/${module}/`;
  if (pathname.startsWith(basePath)) {
    const itemId = pathname.slice(basePath.length);
    return itemId || null;
  }
  return null;
}

// ============================================================================
// Icons
// ============================================================================

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

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Header component with navigation and controls
 */
function Header({
  activeModule,
  onModuleChange,
  screenSize,
  onScreenSizeChange,
  theme,
  onThemeToggle,
}: {
  activeModule: ShowcaseModule;
  onModuleChange: (module: ShowcaseModule) => void;
  screenSize: ScreenSize;
  onScreenSizeChange: (size: ScreenSize) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}) {
  return (
    <header className="h-14 px-4 flex items-center justify-between border-b border-border bg-card">
      {/* Left: Title and Back Link */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          title="返回主界面"
        >
          ← 返回
        </Link>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-semibold">Design System</h1>
      </div>

      {/* Center: Module Tabs */}
      <nav className="flex items-center">
        <div className="flex items-center bg-muted/50 rounded-lg p-1">
          {MODULE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onModuleChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeModule === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <ThemeSwitcher size="sm" />

        {/* Screen Size Switcher */}
        <ScreenSizeSwitcher
          value={screenSize}
          onChange={onScreenSizeChange}
          syncWithUrl={true}
        />

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ComponentShowcase - Main showcase page component
 * 
 * Design system documentation center with three modules:
 * - Tokens: Design tokens display
 * - Components: Component library documentation
 * - Examples: UI examples and patterns
 * 
 * @see Requirements 1.1, 2.1, 3.1, 5.1
 */
export function ComponentShowcase({
  initialModule,
  onStateChange,
  className,
}: ComponentShowcaseProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Parse initial state from URL
  const initialScreenSize = React.useMemo(() => {
    return parseScreenSizeFromUrl(searchParams, 'size');
  }, []); // Only compute once on mount

  // State management
  const [activeModule, setActiveModule] = React.useState<ShowcaseModule>(() => {
    if (initialModule) return initialModule;
    return parseModuleFromPath(location.pathname);
  });

  const [activeItemId, setActiveItemId] = React.useState<string | null>(() => {
    return parseItemIdFromPath(location.pathname, activeModule);
  });

  const [screenSize, setScreenSize] = React.useState<ScreenSize>(initialScreenSize);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  // Token category state (for TokensModule)
  const [tokenCategory, setTokenCategory] = React.useState<TokenCategory>(DEFAULT_TOKEN_CATEGORY);

  // Theme system integration - subscribe to theme changes
  const themeManager = React.useMemo(() => getThemeManager(), []);
  const [activeTheme, setActiveTheme] = React.useState<ThemePack | null>(() => {
    try {
      return themeManager.getActiveTheme();
    } catch {
      return null;
    }
  });

  // Subscribe to theme changes
  React.useEffect(() => {
    const unsubscribe = themeManager.subscribe((event) => {
      setActiveTheme(event.newTheme);
    });
    return () => unsubscribe();
  }, [themeManager]);

  // Sync URL with state changes
  React.useEffect(() => {
    const currentPath = location.pathname;
    const expectedBasePath = `/showcase/${activeModule}`;
    
    // Only update URL if module changed
    if (!currentPath.startsWith(expectedBasePath)) {
      const sizeParam = searchParams.get('size');
      const newPath = sizeParam 
        ? `${expectedBasePath}?size=${sizeParam}`
        : expectedBasePath;
      navigate(newPath, { replace: true });
    }
  }, [activeModule, location.pathname, navigate, searchParams]);

  // Notify parent of state changes
  React.useEffect(() => {
    onStateChange?.({
      activeModule,
      activeItemId,
      screenSize,
      theme,
    });
  }, [activeModule, activeItemId, screenSize, theme, onStateChange]);

  // Handle module change
  const handleModuleChange = React.useCallback((module: ShowcaseModule) => {
    setActiveModule(module);
    setActiveItemId(null); // Reset item selection when switching modules
  }, []);

  // Handle screen size change
  const handleScreenSizeChange = React.useCallback((size: ScreenSize) => {
    setScreenSize(size);
  }, []);

  // Handle theme toggle
  const handleThemeToggle = React.useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Handle "Open in Editor" - navigate to main page with schema
  const handleOpenInEditor = React.useCallback((schema: UISchema) => {
    sessionStorage.setItem('llm2ui-schema', JSON.stringify(schema));
    navigate('/');
  }, [navigate]);

  // Convert theme tokens to DesignTokens format for TokensModule
  const themeDesignTokens = React.useMemo(() => {
    if (!activeTheme) return undefined;
    // ThemeTokens 和 DesignTokens 结构类似，可以直接使用
    return activeTheme.tokens as unknown as import('@/lib/design-tokens').DesignTokens;
  }, [activeTheme]);

  // Get component registry from active theme
  const themeRegistry = React.useMemo(() => {
    if (!activeTheme) return undefined;
    // 使用 unknown 作为中间类型来绕过两个 ComponentRegistry 类型不兼容的问题
    // 两个类的接口是兼容的，只是来自不同的模块
    return activeTheme.components.registry as unknown as import('@/lib/component-registry').ComponentRegistry;
  }, [activeTheme]);

  // Convert theme examples to ExampleMetadata format for ExamplesModule
  const themeExamples = React.useMemo(() => {
    if (!activeTheme) return undefined;
    return activeTheme.examples.presets.map((preset) => ({
      id: preset.id,
      title: preset.name,
      description: preset.description,
      category: (preset.category || 'layout') as import('@/lib/examples/example-tags').ExampleCategory,
      tags: preset.tags || [],
      schema: preset.schema as UISchema,
      source: 'system' as const,
    }));
  }, [activeTheme]);

  // Render active module content
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'tokens':
        return (
          <TokensModule
            activeCategory={tokenCategory}
            onCategoryChange={setTokenCategory}
            tokens={themeDesignTokens}
            className="h-full"
          />
        );
      case 'components':
        return (
          <ComponentsModule
            activeComponent={activeItemId}
            onComponentSelect={setActiveItemId}
            previewSize={screenSize}
            onPreviewSizeChange={handleScreenSizeChange}
            onOpenInEditor={handleOpenInEditor}
            registry={themeRegistry}
            className="h-full"
          />
        );
      case 'examples':
        return (
          <ExamplesModule
            activeExampleId={activeItemId}
            onExampleSelect={setActiveItemId}
            previewSize={screenSize}
            onPreviewSizeChange={handleScreenSizeChange}
            onOpenInEditor={handleOpenInEditor}
            examples={themeExamples}
            className="h-full"
          />
        );
      case 'themes':
        return (
          <ThemeMarketplace
            onThemeActivate={(themeId) => {
              console.log('Theme activated:', themeId);
            }}
            className="h-full"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header with tabs and controls */}
      <Header
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        screenSize={screenSize}
        onScreenSizeChange={handleScreenSizeChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      {/* Module Content */}
      <main className="flex-1 overflow-hidden">
        {renderModuleContent()}
      </main>
    </div>
  );
}

export default ComponentShowcase;
