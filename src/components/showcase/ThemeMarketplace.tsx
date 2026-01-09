/**
 * @file ThemeMarketplace.tsx
 * @description 主题市场页面 - 展示、搜索、安装主题
 * @module components/showcase
 * @requirements 19.1, 19.2, 19.4, 19.5, 19.6
 */

import * as React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ThemeCard } from './ThemeCard';
import { ThemePreview } from './ThemePreview';
import {
  getThemeManager,
  getThemeRegistry,
  type ThemePack,
  type ThemeMetadata,
  type ThemeRegistryEntry,
} from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export type ThemeCategory = 'all' | 'installed' | 'builtin' | 'community';

export interface ThemeMarketplaceProps {
  /** 初始分类 */
  initialCategory?: ThemeCategory;
  /** 主题激活回调 */
  onThemeActivate?: (themeId: string) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ThemeMarketplace - 主题市场页面
 * 
 * 功能：
 * - 展示所有可用主题
 * - 支持按类别筛选（内置/社区/已安装）
 * - 支持搜索
 * - 安装/卸载主题
 * 
 * @requirements 19.1, 19.2, 19.4, 19.5, 19.6
 */
export function ThemeMarketplace({
  initialCategory = 'all',
  onThemeActivate,
  className,
}: ThemeMarketplaceProps) {
  const themeManager = getThemeManager();
  const themeRegistry = getThemeRegistry();

  // 状态
  const [category, setCategory] = React.useState<ThemeCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [themes, setThemes] = React.useState<ThemeMetadata[]>([]);
  const [registryThemes, setRegistryThemes] = React.useState<ThemeRegistryEntry[]>([]);
  const [activeThemeId, setActiveThemeId] = React.useState<string>(
    themeManager.getActiveTheme()?.id ?? 'shadcn-ui'
  );
  const [selectedTheme, setSelectedTheme] = React.useState<ThemePack | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingThemeId, setLoadingThemeId] = React.useState<string | null>(null);

  // 加载主题列表
  const loadThemes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 获取已安装的主题
      const installedThemes = themeManager.getAllThemes();
      const installedMetadata: ThemeMetadata[] = installedThemes.map((theme) => ({
        id: theme.id,
        name: theme.name,
        description: theme.description,
        version: theme.version,
        author: theme.author,
        repository: theme.repository,
        previewImage: theme.previewImage,
        category: 'builtin' as const, // 简化处理，实际应从存储获取
        installed: true,
      }));
      setThemes(installedMetadata);

      // 获取注册表中的主题（fetchRegistry 返回 ThemeMetadata[]）
      const registryMetadata = await themeRegistry.fetchRegistry();
      // 转换为 ThemeRegistryEntry 格式
      const registryEntries: ThemeRegistryEntry[] = registryMetadata.map((meta) => ({
        id: meta.id,
        name: meta.name,
        description: meta.description,
        version: meta.version,
        author: meta.author ?? '',
        repository: meta.repository ?? '',
        previewImage: meta.previewImage ?? '',
        category: meta.category ?? 'community',
        downloadUrl: '', // 注册表条目需要从 registryConfig 获取
      }));
      setRegistryThemes(registryEntries);
    } catch (error) {
      console.error('Failed to load themes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [themeManager, themeRegistry]);

  // 初始化
  React.useEffect(() => {
    loadThemes();

    // 订阅主题变化
    const unsubscribe = themeManager.subscribe((event) => {
      setActiveThemeId(event.newThemeId);
    });

    return () => {
      unsubscribe();
    };
  }, [loadThemes, themeManager]);

  // 合并已安装和注册表主题
  const allThemes = React.useMemo(() => {
    const installedIds = new Set(themes.map((t) => t.id));
    const registryMetadata: ThemeMetadata[] = registryThemes
      .filter((t) => !installedIds.has(t.id))
      .map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        version: t.version,
        author: t.author,
        repository: t.repository,
        previewImage: t.previewImage,
        category: t.category,
        installed: false,
      }));
    return [...themes, ...registryMetadata];
  }, [themes, registryThemes]);

  // 过滤主题
  const filteredThemes = React.useMemo(() => {
    let result = allThemes;

    // 按类别过滤
    switch (category) {
      case 'installed':
        result = result.filter((t) => t.installed);
        break;
      case 'builtin':
        result = result.filter((t) => t.category === 'builtin');
        break;
      case 'community':
        result = result.filter((t) => t.category === 'community');
        break;
    }

    // 按搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.author?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allThemes, category, searchQuery]);

  // 处理主题激活
  const handleActivate = React.useCallback((themeId: string) => {
    themeManager.setActiveTheme(themeId);
    setActiveThemeId(themeId);
    onThemeActivate?.(themeId);
  }, [themeManager, onThemeActivate]);

  // 处理主题安装
  const handleInstall = React.useCallback(async (themeId: string) => {
    setLoadingThemeId(themeId);
    try {
      await themeRegistry.installTheme(themeId);
      await loadThemes();
    } catch (error) {
      console.error('Failed to install theme:', error);
    } finally {
      setLoadingThemeId(null);
    }
  }, [themeRegistry, loadThemes]);

  // 处理主题卸载
  const handleUninstall = React.useCallback(async (themeId: string) => {
    setLoadingThemeId(themeId);
    try {
      await themeRegistry.uninstallTheme(themeId);
      await loadThemes();
    } catch (error) {
      console.error('Failed to uninstall theme:', error);
    } finally {
      setLoadingThemeId(null);
    }
  }, [themeRegistry, loadThemes]);

  // 处理查看详情
  const handleViewDetails = React.useCallback((themeId: string) => {
    const theme = themeManager.getTheme(themeId);
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [themeManager]);

  // 处理打开仓库
  const handleOpenRepository = React.useCallback((theme: ThemeMetadata) => {
    if (theme.repository) {
      window.open(theme.repository, '_blank');
    }
  }, []);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 头部：搜索和刷新 */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索主题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadThemes}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>

        {/* 分类标签 */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as ThemeCategory)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="installed">已安装</TabsTrigger>
            <TabsTrigger value="builtin">内置</TabsTrigger>
            <TabsTrigger value="community">社区</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 主题列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredThemes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {searchQuery ? '没有找到匹配的主题' : '暂无主题'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={theme.id === activeThemeId}
                isLoading={loadingThemeId === theme.id}
                onClick={() => theme.installed && handleViewDetails(theme.id)}
                onInstall={!theme.installed ? () => handleInstall(theme.id) : undefined}
                onUninstall={
                  theme.installed && theme.category !== 'builtin' && theme.id !== activeThemeId
                    ? () => handleUninstall(theme.id)
                    : undefined
                }
                onActivate={
                  theme.installed && theme.id !== activeThemeId
                    ? () => handleActivate(theme.id)
                    : undefined
                }
                onViewDetails={() => handleOpenRepository(theme)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 主题详情侧边栏 */}
      <Sheet open={!!selectedTheme} onOpenChange={(open) => !open && setSelectedTheme(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>主题详情</SheetTitle>
          </SheetHeader>
          {selectedTheme && (
            <div className="mt-6">
              <ThemePreview theme={selectedTheme} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ThemeMarketplace;
