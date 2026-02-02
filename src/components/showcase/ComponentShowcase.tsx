/**
 * ComponentShowcase - Main showcase page for design system documentation
 *
 * Refactored as a design system documentation center with three main modules:
 * - Tokens: Design tokens (Icons, Typography, Colors, Spacing, Shadows, Border Radius)
 * - Components: Component library with documentation
 * - Examples: UI examples and patterns
 *
 * Supports module switching via tabs and URL routing.
 * Now integrates with multi-theme system to display theme-specific content.
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
import { DevModeToggle } from '@/components/dev-mode';
import { getThemeManager, type ThemePack } from '@/lib/themes';
import type { UISchema } from '@/types';

export type ShowcaseModule = 'tokens' | 'components' | 'examples' | 'themes';

export interface ShowcaseState {
  activeModule: ShowcaseModule;
  activeItemId: string | null;
  screenSize: ScreenSize;
  theme: 'light' | 'dark';
}

export interface ComponentShowcaseProps {
  initialModule?: ShowcaseModule;
  onStateChange?: (state: ShowcaseState) => void;
  className?: string;
}

const MODULE_TABS: { id: ShowcaseModule; label: string; icon: React.ReactNode }[] = [
  { id: 'tokens', label: 'Tokens', icon: <Palette className="w-4 h-4" /> },
  { id: 'components', label: 'Components', icon: <Package className="w-4 h-4" /> },
  { id: 'examples', label: 'Examples', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'themes', label: 'Themes', icon: <Paintbrush className="w-4 h-4" /> },
];

const DEFAULT_TOKEN_CATEGORY: TokenCategory = 'icons';

function parseModuleFromPath(pathname: string): ShowcaseModule {
  if (pathname.includes('/showcase/tokens')) return 'tokens';
  if (pathname.includes('/showcase/components')) return 'components';
  if (pathname.includes('/showcase/examples')) return 'examples';
  if (pathname.includes('/showcase/themes')) return 'themes';
  return 'tokens';
}

function parseItemIdFromPath(pathname: string, module: ShowcaseModule): string | null {
  const basePath = `/showcase/${module}/`;
  if (pathname.startsWith(basePath)) {
    const itemId = pathname.slice(basePath.length);
    return itemId || null;
  }
  return null;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="h-14 px-2 sm:px-4 flex items-center justify-between border-b border-border bg-card">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          to="/"
          className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          title="返回主界面"
        >
          ← 返回
        </Link>
        <div className="hidden sm:block h-4 w-px bg-border" />
        <h1 className="text-base sm:text-lg font-semibold truncate">Design System</h1>
      </div>

      <nav className="flex items-center flex-1 px-2 sm:px-4">
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5 overflow-x-auto no-scrollbar max-w-full sm:max-w-fit">
          {MODULE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onModuleChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0',
                activeModule === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="hidden sm:block">
          <DevModeToggle showLabel={false} />
        </div>
        <ThemeSwitcher size="sm" />
        <div className="hidden sm:block">
          <ScreenSizeSwitcher
            value={screenSize}
            onChange={onScreenSizeChange}
            syncWithUrl={true}
          />
        </div>
        <button
          onClick={onThemeToggle}
          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-border rounded-md hover:bg-muted transition-colors"
          title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden px-2 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          aria-label="更多选项"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-14 right-0 left-0 bg-card border-b border-border sm:hidden z-50">
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">开发模式</span>
              <DevModeToggle showLabel={false} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">预览尺寸</span>
              <ScreenSizeSwitcher
                value={screenSize}
                onChange={onScreenSizeChange}
                syncWithUrl={true}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function ComponentShowcase({
  initialModule,
  onStateChange,
  className,
}: ComponentShowcaseProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialScreenSize = React.useMemo(() => {
    return parseScreenSizeFromUrl(searchParams, 'size');
  }, []);

  const [activeModule, setActiveModule] = React.useState<ShowcaseModule>(() => {
    if (initialModule) return initialModule;
    return parseModuleFromPath(location.pathname);
  });

  const [activeItemId, setActiveItemId] = React.useState<string | null>(() => {
    return parseItemIdFromPath(location.pathname, activeModule);
  });

  const [screenSize, setScreenSize] = React.useState<ScreenSize>(initialScreenSize);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [tokenCategory, setTokenCategory] = React.useState<TokenCategory>(DEFAULT_TOKEN_CATEGORY);

  const themeManager = React.useMemo(() => getThemeManager(), []);
  const [activeTheme, setActiveTheme] = React.useState<ThemePack | null>(() => {
    try {
      return themeManager.getActiveTheme();
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    const unsubscribe = themeManager.subscribe((event) => {
      setActiveTheme(event.newTheme);
    });
    return () => unsubscribe();
  }, [themeManager]);

  React.useEffect(() => {
    const currentPath = location.pathname;
    const expectedBasePath = `/showcase/${activeModule}`;
    if (!currentPath.startsWith(expectedBasePath)) {
      const sizeParam = searchParams.get('size');
      const newPath = sizeParam 
        ? `${expectedBasePath}?size=${sizeParam}`
        : expectedBasePath;
      navigate(newPath, { replace: true });
    }
  }, [activeModule, location.pathname, navigate, searchParams]);

  React.useEffect(() => {
    onStateChange?.({
      activeModule,
      activeItemId,
      screenSize,
      theme,
    });
  }, [activeModule, activeItemId, screenSize, theme, onStateChange]);

  const handleModuleChange = React.useCallback((module: ShowcaseModule) => {
    setActiveModule(module);
    setActiveItemId(null);
  }, []);

  const handleScreenSizeChange = React.useCallback((size: ScreenSize) => {
    setScreenSize(size);
  }, []);

  const handleThemeToggle = React.useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const handleOpenInEditor = React.useCallback((schema: UISchema) => {
    sessionStorage.setItem('llm2ui-schema', JSON.stringify(schema));
    navigate('/');
  }, [navigate]);

  const themeDesignTokens = React.useMemo(() => {
    if (!activeTheme) return undefined;
    return activeTheme.tokens as unknown as import('@/lib/design-tokens').DesignTokens;
  }, [activeTheme]);

  const themeRegistry = React.useMemo(() => {
    if (!activeTheme) return undefined;
    return activeTheme.components.registry as unknown as import('@/lib/component-registry').ComponentRegistry;
  }, [activeTheme]);

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
      <Header
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        screenSize={screenSize}
        onScreenSizeChange={handleScreenSizeChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
      <main className="flex-1 overflow-hidden">
        {renderModuleContent()}
      </main>
    </div>
  );
}

export default ComponentShowcase;
