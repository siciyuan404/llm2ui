/**
 * @file ThemeSwitcher.tsx
 * @description 主题切换器组件 - 显示当前主题并提供切换功能，支持 CSS 变量应用
 * @module components/showcase
 * @requirements 11.1, 11.2, 11.3, 11.4, 11.5
 */

import * as React from 'react';
import { Check, ChevronDown, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getInitializedThemeManager,
  applyThemeColorScheme,
  type ThemePack,
  type ThemeMetadata,
} from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface ThemeSwitcherProps {
  /** 当前选中的主题 ID */
  value?: string;
  /** 主题变更回调 */
  onChange?: (themeId: string) => void;
  /** 是否显示主题图标 */
  showIcon?: boolean;
  /** 是否显示主题描述 */
  showDescription?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
  /** 触发器变体 */
  variant?: 'default' | 'outline' | 'ghost';
  /** 触发器大小 */
  size?: 'default' | 'sm' | 'lg';
  /** 是否自动应用 CSS 变量，默认 true */
  applyCssVariables?: boolean;
  /** 默认配色方案 ID */
  defaultColorSchemeId?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ThemeSwitcher - 主题切换器组件
 * 
 * 功能：
 * - 显示当前主题名称和图标
 * - 下拉菜单展示所有可用主题
 * - 支持主题切换
 * - 自动应用主题的 CSS 变量
 * 
 * @requirements 11.1, 11.2, 11.3, 11.4, 11.5
 */
export function ThemeSwitcher({
  value,
  onChange,
  showIcon = true,
  showDescription = false,
  disabled = false,
  className,
  variant = 'outline',
  size = 'default',
  applyCssVariables: shouldApplyCss = true,
  defaultColorSchemeId,
}: ThemeSwitcherProps) {
  const themeManager = getInitializedThemeManager();
  
  // 获取所有可用主题
  const [themes, setThemes] = React.useState<ThemeMetadata[]>([]);
  const [activeThemeId, setActiveThemeId] = React.useState<string>(() => {
    if (value) return value;
    try {
      return themeManager.getActiveThemeId();
    } catch {
      return 'shadcn-ui';
    }
  });

  // 应用主题的 CSS 变量
  const applyThemeCss = React.useCallback((themeId: string, colorSchemeId?: string) => {
    if (!shouldApplyCss) return;
    
    const theme = themeManager.getTheme(themeId);
    if (theme) {
      applyThemeColorScheme(theme, colorSchemeId || defaultColorSchemeId);
    }
  }, [themeManager, shouldApplyCss, defaultColorSchemeId]);

  // 初始化和监听主题变化
  React.useEffect(() => {
    // 获取所有主题元数据
    const allThemes = themeManager.getAllThemes();
    const metadata: ThemeMetadata[] = allThemes.map((theme) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      version: theme.version,
      author: theme.author,
      repository: theme.repository,
      previewImage: theme.previewImage,
      category: 'builtin' as const,
      installed: true,
    }));
    setThemes(metadata);

    // 初始应用当前主题的 CSS 变量
    applyThemeCss(activeThemeId);

    // 订阅主题变化
    const unsubscribe = themeManager.subscribe((event) => {
      setActiveThemeId(event.newThemeId);
      // 主题变化时自动应用 CSS 变量
      applyThemeCss(event.newThemeId);
    });

    return () => {
      unsubscribe();
    };
  }, [themeManager, activeThemeId, applyThemeCss]);

  // 同步外部 value
  React.useEffect(() => {
    if (value && value !== activeThemeId) {
      setActiveThemeId(value);
      applyThemeCss(value);
    }
  }, [value, activeThemeId, applyThemeCss]);

  // 获取当前主题
  const currentTheme = React.useMemo(() => {
    return themes.find((t) => t.id === activeThemeId);
  }, [themes, activeThemeId]);

  // 处理主题选择
  const handleThemeSelect = React.useCallback((themeId: string) => {
    if (themeId === activeThemeId) return;
    
    // 切换主题
    themeManager.setActiveTheme(themeId);
    setActiveThemeId(themeId);
    
    // 应用 CSS 变量
    applyThemeCss(themeId);
    
    onChange?.(themeId);
  }, [activeThemeId, themeManager, onChange, applyThemeCss]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          className={cn('gap-2', className)}
        >
          {showIcon && <Palette className="h-4 w-4" />}
          <span className="truncate max-w-[120px]">
            {currentTheme?.name ?? '选择主题'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        {themes.map((theme, index) => (
          <React.Fragment key={theme.id}>
            {index > 0 && theme.category !== themes[index - 1].category && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem
              onClick={() => handleThemeSelect(theme.id)}
              className="flex items-start gap-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{theme.name}</span>
                  {theme.id === activeThemeId && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                {showDescription && theme.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {theme.description}
                  </p>
                )}
              </div>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSwitcher;
