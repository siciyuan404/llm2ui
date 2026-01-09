/**
 * @file useTheme.ts
 * @description 主题管理钩子 - 统一管理主题切换时的所有同步操作
 * @module hooks/useTheme
 * @requirements 11.4, 11.5, 11.6
 */

import * as React from 'react';
import {
  getInitializedThemeManager,
  applyThemeColorScheme,
  clearPromptCache,
  type ThemePack,
  type ThemeMetadata,
  type ColorScheme,
  type LayoutConfig,
  type ThemeChangeEvent,
} from '@/lib/themes';
import { useAppStore } from '@/stores/appStore';

/**
 * 主题钩子返回值
 */
export interface UseThemeReturn {
  /** 当前主题 ID */
  themeId: string;
  /** 当前主题包 */
  theme: ThemePack | null;
  /** 所有可用主题 */
  themes: ThemeMetadata[];
  /** 当前配色方案 ID */
  colorSchemeId: string;
  /** 当前配色方案 */
  colorScheme: ColorScheme | null;
  /** 所有配色方案 */
  colorSchemes: ColorScheme[];
  /** 当前布局 ID */
  layoutId: string;
  /** 当前布局配置 */
  layout: LayoutConfig | null;
  /** 所有布局配置 */
  layouts: LayoutConfig[];
  /** 切换主题 */
  setTheme: (themeId: string) => void;
  /** 切换配色方案 */
  setColorScheme: (schemeId: string) => void;
  /** 切换布局 */
  setLayout: (layoutId: string) => void;
  /** 是否正在加载 */
  isLoading: boolean;
}

/**
 * 主题管理钩子
 * 
 * 功能：
 * - 管理当前主题、配色方案、布局
 * - 切换主题时自动同步：
 *   - CSS 变量
 *   - 提示词缓存清除
 *   - 案例库刷新
 *   - 关键词映射刷新
 * - 持久化用户偏好
 */
export function useTheme(): UseThemeReturn {
  const themeManager = getInitializedThemeManager();
  
  // 从 appStore 获取持久化的偏好设置
  const themePreferences = useAppStore((state) => state.themePreferences);
  const setThemePreferences = useAppStore((state) => state.setThemePreferences);
  const setContextSettings = useAppStore((state) => state.setContextSettings);
  
  // 本地状态
  const [themes, setThemes] = React.useState<ThemeMetadata[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // 当前主题
  const [currentTheme, setCurrentTheme] = React.useState<ThemePack | null>(() => {
    try {
      return themeManager.getTheme(themePreferences.activeThemeId) || null;
    } catch {
      return null;
    }
  });

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

    // 初始化当前主题
    const initialTheme = themeManager.getTheme(themePreferences.activeThemeId);
    if (initialTheme) {
      setCurrentTheme(initialTheme);
      // 应用初始 CSS 变量
      applyThemeColorScheme(initialTheme, themePreferences.colorSchemeId);
    }

    // 订阅主题变化
    const unsubscribe = themeManager.subscribe((event: ThemeChangeEvent) => {
      setCurrentTheme(event.newTheme);
      
      // 清除提示词缓存（因为主题的提示词模板可能不同）
      clearPromptCache();
      
      // 应用新主题的 CSS 变量
      applyThemeColorScheme(event.newTheme, themePreferences.colorSchemeId);
    });

    return () => {
      unsubscribe();
    };
  }, [themeManager, themePreferences.activeThemeId, themePreferences.colorSchemeId]);

  // 切换主题
  const setTheme = React.useCallback((themeId: string) => {
    if (themeId === themePreferences.activeThemeId) return;
    
    setIsLoading(true);
    
    try {
      // 切换主题
      themeManager.setActiveTheme(themeId);
      
      // 更新偏好设置
      setThemePreferences({ activeThemeId: themeId });
      
      // 同步更新上下文设置
      setContextSettings({ themeId });
      
      // 清除提示词缓存
      clearPromptCache();
      
      // 获取新主题并应用 CSS 变量
      const newTheme = themeManager.getTheme(themeId);
      if (newTheme) {
        setCurrentTheme(newTheme);
        
        // 检查当前配色方案是否在新主题中存在
        const schemeExists = newTheme.colorSchemes.some(
          (s) => s.id === themePreferences.colorSchemeId
        );
        const schemeId = schemeExists
          ? themePreferences.colorSchemeId
          : newTheme.colorSchemes[0]?.id || 'light';
        
        applyThemeColorScheme(newTheme, schemeId);
        
        // 如果配色方案不存在，更新偏好
        if (!schemeExists) {
          setThemePreferences({ colorSchemeId: schemeId });
          setContextSettings({ colorSchemeId: schemeId });
        }
        
        // 检查布局是否在新主题中存在
        const layoutExists = newTheme.layouts.some(
          (l) => l.id === themePreferences.layoutId
        );
        if (!layoutExists && newTheme.layouts.length > 0) {
          setThemePreferences({ layoutId: newTheme.layouts[0].id });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [themeManager, themePreferences, setThemePreferences, setContextSettings]);

  // 切换配色方案
  const setColorScheme = React.useCallback((schemeId: string) => {
    if (schemeId === themePreferences.colorSchemeId) return;
    
    setThemePreferences({ colorSchemeId: schemeId });
    setContextSettings({ colorSchemeId: schemeId });
    
    // 应用 CSS 变量
    if (currentTheme) {
      applyThemeColorScheme(currentTheme, schemeId);
    }
  }, [currentTheme, themePreferences.colorSchemeId, setThemePreferences, setContextSettings]);

  // 切换布局
  const setLayout = React.useCallback((layoutId: string) => {
    if (layoutId === themePreferences.layoutId) return;
    setThemePreferences({ layoutId });
  }, [themePreferences.layoutId, setThemePreferences]);

  // 获取当前配色方案
  const colorScheme = React.useMemo(() => {
    if (!currentTheme) return null;
    return currentTheme.colorSchemes.find(
      (s) => s.id === themePreferences.colorSchemeId
    ) || currentTheme.colorSchemes[0] || null;
  }, [currentTheme, themePreferences.colorSchemeId]);

  // 获取当前布局
  const layout = React.useMemo(() => {
    if (!currentTheme) return null;
    return currentTheme.layouts.find(
      (l) => l.id === themePreferences.layoutId
    ) || currentTheme.layouts[0] || null;
  }, [currentTheme, themePreferences.layoutId]);

  return {
    themeId: themePreferences.activeThemeId,
    theme: currentTheme,
    themes,
    colorSchemeId: themePreferences.colorSchemeId,
    colorScheme,
    colorSchemes: currentTheme?.colorSchemes || [],
    layoutId: themePreferences.layoutId,
    layout,
    layouts: currentTheme?.layouts || [],
    setTheme,
    setColorScheme,
    setLayout,
    isLoading,
  };
}

export default useTheme;
