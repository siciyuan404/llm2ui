/**
 * @file Cherry Studio 主题提供者组件
 * @description 提供主题切换功能，支持 light/dark/system 三种模式
 * @module components/cherry/context/ThemeProvider
 */

import * as React from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: ResolvedTheme;
  settedTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'cherry-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage 不可用
  }
  return 'system';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme,
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [settedTheme, setSettedTheme] = React.useState<Theme>(() => {
    return defaultTheme ?? getStoredTheme();
  });
  
  const [theme, setResolvedTheme] = React.useState<ResolvedTheme>(() => {
    return resolveTheme(defaultTheme ?? getStoredTheme());
  });

  // 监听系统主题变化
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (settedTheme === 'system') {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settedTheme]);

  // 应用主题到 document
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setSettedTheme(newTheme);
    setResolvedTheme(resolveTheme(newTheme));
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      // localStorage 不可用
    }
  }, [storageKey]);

  const toggleTheme = React.useCallback(() => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const value = React.useMemo(
    () => ({ theme, settedTheme, setTheme, toggleTheme }),
    [theme, settedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
