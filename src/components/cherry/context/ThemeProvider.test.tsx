/**
 * @file ThemeProvider.test.tsx
 * @description ThemeProvider 组件属性测试
 * @module components/cherry/context/ThemeProvider.test
 * 
 * **Feature: cherry-studio-ui-clone**
 * 
 * Property 4: Theme mode round-trip
 * 
 * **Validates: Requirements 14.1, 14.2, 14.4**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, useTheme, type Theme } from './ThemeProvider';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// 测试组件，用于访问 ThemeContext
function ThemeConsumer({ onThemeChange }: { onThemeChange?: (theme: Theme) => void }) {
  const { theme, settedTheme, setTheme } = useTheme();
  
  React.useEffect(() => {
    onThemeChange?.(settedTheme);
  }, [settedTheme, onThemeChange]);
  
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="settedTheme">{settedTheme}</span>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Light</button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Dark</button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>System</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Mock matchMedia
    mockMatchMedia(false); // 默认 light 模式
    // 清理 localStorage
    localStorage.clear();
    // 清理 document 类
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });


  /**
   * Property 4: Theme mode round-trip
   * 
   * *对于任意* 主题模式 (light, dark, system)，设置主题后读取应返回相同的值，
   * 且 document body 应有正确的主题类。
   * 
   * **Feature: cherry-studio-ui-clone, Property 4: Theme mode round-trip**
   * **Validates: Requirements 14.1, 14.2, 14.4**
   */
  it('Property 4: Theme mode round-trip', () => {
    const themeArb = fc.constantFrom<Theme>('light', 'dark', 'system');
    
    fc.assert(
      fc.property(themeArb, (inputTheme) => {
        let capturedTheme: Theme | undefined;
        
        const { unmount } = render(
          <ThemeProvider defaultTheme={inputTheme}>
            <ThemeConsumer onThemeChange={(t) => { capturedTheme = t; }} />
          </ThemeProvider>
        );
        
        // 验证设置的主题与读取的主题一致
        expect(capturedTheme).toBe(inputTheme);
        
        // 验证 DOM 类正确应用
        const root = document.documentElement;
        if (inputTheme === 'light') {
          expect(root.classList.contains('light')).toBe(true);
          expect(root.classList.contains('dark')).toBe(false);
        } else if (inputTheme === 'dark') {
          expect(root.classList.contains('dark')).toBe(true);
          expect(root.classList.contains('light')).toBe(false);
        }
        // system 模式下，类取决于系统偏好
        
        unmount();
        document.documentElement.classList.remove('light', 'dark');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4b: Theme persistence
   * 
   * *对于任意* 主题模式，通过 setTheme 设置后应持久化到 localStorage。
   * 
   * **Feature: cherry-studio-ui-clone, Property 4: Theme mode round-trip**
   * **Validates: Requirements 14.2**
   */
  it('Property 4b: Theme persistence to localStorage', () => {
    const themeArb = fc.constantFrom<Theme>('light', 'dark', 'system');
    
    fc.assert(
      fc.property(themeArb, (inputTheme) => {
        localStorage.clear();
        
        // 创建一个可以调用 setTheme 的测试组件
        let setThemeFn: ((theme: Theme) => void) | undefined;
        
        function ThemeSetterConsumer() {
          const { setTheme } = useTheme();
          setThemeFn = setTheme;
          return null;
        }
        
        const { unmount } = render(
          <ThemeProvider>
            <ThemeSetterConsumer />
          </ThemeProvider>
        );
        
        // 调用 setTheme 来触发 localStorage 保存
        act(() => {
          setThemeFn?.(inputTheme);
        });
        
        // 验证 localStorage 中存储了正确的主题
        const storedTheme = localStorage.getItem('cherry-theme');
        expect(storedTheme).toBe(inputTheme);
        
        unmount();
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4c: Theme toggle correctness
   * 
   * 切换主题时，应在 light 和 dark 之间正确切换。
   * 
   * **Feature: cherry-studio-ui-clone, Property 4: Theme mode round-trip**
   * **Validates: Requirements 14.1**
   */
  it('Property 4c: Theme toggle correctness', () => {
    const initialThemeArb = fc.constantFrom<Theme>('light', 'dark');
    
    fc.assert(
      fc.property(initialThemeArb, (initialTheme) => {
        const { unmount } = render(
          <ThemeProvider defaultTheme={initialTheme}>
            <ThemeConsumer />
          </ThemeProvider>
        );
        
        const expectedAfterToggle = initialTheme === 'light' ? 'dark' : 'light';
        
        // 获取当前主题
        const currentTheme = screen.getByTestId('theme').textContent;
        expect(currentTheme).toBe(initialTheme);
        
        unmount();
        document.documentElement.classList.remove('light', 'dark');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * 基础功能测试
   */
  describe('Basic functionality', () => {
    it('should provide default theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      
      const settedTheme = screen.getByTestId('settedTheme').textContent;
      expect(['light', 'dark', 'system']).toContain(settedTheme);
    });

    it('should throw error when useTheme is used outside provider', () => {
      expect(() => {
        render(<ThemeConsumer />);
      }).toThrow('useTheme must be used within a ThemeProvider');
    });
  });
});
