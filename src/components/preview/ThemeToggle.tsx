// input: ThemeToggleProps - 主题模式、onChange 回调、样式配置
// output: React.ReactElement - 主题切换按钮组件
// pos: src/components/preview - 预览面板的主题切换功能
// 一旦我被更新，务必更新我的开头注释，以及所属的文件夹的 README.md

/**
 * ThemeToggle Component
 * 
 * Provides theme switching between light and dark modes.
 * Persists theme preference to localStorage.
 * 
 * Requirements: 4.6
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeToggleProps {
  /** Current theme mode */
  value: ThemeMode;
  /** Callback when theme changes */
  onChange: (theme: ThemeMode) => void;
  /** Additional class name */
  className?: string;
  /** Whether to show system option */
  showSystemOption?: boolean;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

// ============================================================================
// Theme Icons
// ============================================================================

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function SystemIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

// ============================================================================
// Theme Storage
// ============================================================================

const THEME_STORAGE_KEY = 'llm2ui-theme';

/**
 * Save theme preference to localStorage
 */
export function saveThemePreference(theme: ThemeMode): boolean {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load theme preference from localStorage
 */
export function loadThemePreference(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get the effective theme based on system preference
 */
export function getEffectiveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  }
  return theme;
}

// ============================================================================
// Theme Configuration
// ============================================================================

const THEMES: Array<{
  mode: ThemeMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { mode: 'light', label: '浅色', icon: SunIcon },
  { mode: 'dark', label: '深色', icon: MoonIcon },
  { mode: 'system', label: '系统', icon: SystemIcon },
];

// ============================================================================
// Simple Toggle Component (Light/Dark only)
// ============================================================================

export function ThemeToggleSimple({
  value,
  onChange,
  className,
  disabled = false,
}: Omit<ThemeToggleProps, 'showSystemOption'>) {
  const effectiveTheme = getEffectiveTheme(value);
  
  const handleToggle = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    onChange(newTheme);
    saveThemePreference(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={disabled}
      className={cn('h-9 w-9', className)}
      aria-label={effectiveTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
      title={effectiveTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      {effectiveTheme === 'light' ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </Button>
  );
}

// ============================================================================
// Full Theme Toggle Component
// ============================================================================

export function ThemeToggle({
  value,
  onChange,
  className,
  showSystemOption = true,
  disabled = false,
}: ThemeToggleProps) {
  const themes = showSystemOption
    ? THEMES
    : THEMES.filter((t) => t.mode !== 'system');

  const handleChange = (mode: ThemeMode) => {
    onChange(mode);
    saveThemePreference(mode);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-muted rounded-lg',
        className
      )}
      role="radiogroup"
      aria-label="主题模式"
    >
      {themes.map(({ mode, label, icon: Icon }) => (
        <Button
          key={mode}
          variant={value === mode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleChange(mode)}
          disabled={disabled}
          className={cn(
            'h-8 px-3 gap-1.5',
            value === mode && 'shadow-sm'
          )}
          role="radio"
          aria-checked={value === mode}
          aria-label={label}
          title={label}
        >
          <Icon className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}

// ============================================================================
// Theme Provider Hook
// ============================================================================

/**
 * Hook for managing theme state with persistence
 */
export function useTheme(defaultTheme: ThemeMode = 'system') {
  const [theme, setTheme] = React.useState<ThemeMode>(() => {
    const stored = loadThemePreference();
    return stored ?? defaultTheme;
  });

  const effectiveTheme = getEffectiveTheme(theme);

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  }, [effectiveTheme]);

  // Listen for system theme changes
  React.useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = React.useCallback((newTheme: ThemeMode) => {
    setTheme(newTheme);
    saveThemePreference(newTheme);
  }, []);

  return {
    theme,
    effectiveTheme,
    setTheme: handleSetTheme,
  };
}

export default ThemeToggle;
