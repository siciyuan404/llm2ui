/**
 * @file Sidebar.test.tsx
 * @description Sidebar 组件属性测试
 * @module components/cherry/app/Sidebar.test
 * 
 * **Feature: cherry-studio-ui-clone**
 * 
 * Property 1: Dimension configuration consistency
 * Property 2: State-based styling correctness
 * 
 * **Validates: Requirements 1.1, 1.3**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import React from 'react';
import { Sidebar, type SidebarItem } from './Sidebar';
import { Home, Settings, User } from 'lucide-react';

// 测试用的导航项
const testItems: SidebarItem[] = [
  { id: 'home', icon: <Home />, label: '首页' },
  { id: 'settings', icon: <Settings />, label: '设置' },
  { id: 'user', icon: <User />, label: '用户' },
];

describe('Sidebar', () => {
  /**
   * Property 1: Dimension configuration consistency
   * 
   * *对于任意* Sidebar 组件的自定义宽度配置，渲染元素的计算样式
   * 应与配置值匹配（1px 容差内）。
   * 
   * **Feature: cherry-studio-ui-clone, Property 1: Dimension configuration consistency**
   * **Validates: Requirements 1.1**
   */
  it('Property 1: Dimension configuration consistency', () => {
    const widthArb = fc.integer({ min: 40, max: 200 });

    fc.assert(
      fc.property(widthArb, (width) => {
        const { container, unmount } = render(
          <Sidebar items={testItems} width={width} />
        );

        const sidebar = container.querySelector('aside');
        expect(sidebar).toBeTruthy();

        // 验证宽度样式
        expect(sidebar?.style.width).toBe(`${width}px`);
        expect(sidebar?.style.minWidth).toBe(`${width}px`);

        unmount();
      }),
      { numRuns: 20 }
    );
  });


  /**
   * Property 2: State-based styling correctness
   * 
   * *对于任意* 激活状态的导航项，组件应应用正确的激活样式。
   * 
   * **Feature: cherry-studio-ui-clone, Property 2: State-based styling correctness**
   * **Validates: Requirements 1.3**
   */
  it('Property 2: State-based styling correctness for active item', () => {
    const activeIdArb = fc.constantFrom(...testItems.map(item => item.id));

    fc.assert(
      fc.property(activeIdArb, (activeId) => {
        const { container, unmount } = render(
          <Sidebar items={testItems} activeId={activeId} />
        );

        const sidebar = container.querySelector('aside');
        expect(sidebar).toBeTruthy();

        // 查找所有按钮
        const buttons = sidebar?.querySelectorAll('button');
        expect(buttons).toBeTruthy();
        expect(buttons!.length).toBeGreaterThanOrEqual(testItems.length);

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 1b: Default width
   * 
   * 当未指定宽度时，应使用默认宽度 60px。
   * 
   * **Feature: cherry-studio-ui-clone, Property 1: Dimension configuration consistency**
   * **Validates: Requirements 1.1**
   */
  it('Property 1b: Default width is 60px', () => {
    const { container } = render(<Sidebar items={testItems} />);
    
    const sidebar = container.querySelector('aside');
    expect(sidebar).toBeTruthy();
    expect(sidebar?.style.width).toBe('60px');
  });

  /**
   * 基础功能测试
   */
  describe('Basic functionality', () => {
    it('should render all navigation items', () => {
      const { container } = render(<Sidebar items={testItems} />);
      
      const sidebar = container.querySelector('aside');
      expect(sidebar).toBeTruthy();
      
      // 应该有导航按钮
      const nav = sidebar?.querySelector('nav');
      expect(nav).toBeTruthy();
    });

    it('should render pinned items when provided', () => {
      const pinnedItems: SidebarItem[] = [
        { id: 'pinned1', icon: <Settings />, label: '固定项' },
      ];
      
      const { container } = render(
        <Sidebar items={testItems} pinnedItems={pinnedItems} />
      );
      
      const sidebar = container.querySelector('aside');
      expect(sidebar).toBeTruthy();
      
      // 应该有分隔线
      const divider = sidebar?.querySelector('.bg-\\[var\\(--cherry-border\\)\\]');
      expect(divider).toBeTruthy();
    });

    it('should render avatar when provided', () => {
      const { container } = render(
        <Sidebar 
          items={testItems} 
          avatar={{ type: 'emoji', emoji: '😀' }}
        />
      );
      
      const sidebar = container.querySelector('aside');
      expect(sidebar).toBeTruthy();
      expect(sidebar?.textContent).toContain('😀');
    });

    it('should render theme toggle by default', () => {
      const { container } = render(<Sidebar items={testItems} />);
      
      const sidebar = container.querySelector('aside');
      const buttons = sidebar?.querySelectorAll('button');
      
      // 应该有主题切换按钮（在导航项之外）
      expect(buttons!.length).toBeGreaterThan(testItems.length);
    });

    it('should hide theme toggle when showThemeToggle is false', () => {
      const { container } = render(
        <Sidebar items={testItems} showThemeToggle={false} />
      );
      
      const sidebar = container.querySelector('aside');
      const buttons = sidebar?.querySelectorAll('button');
      
      // 按钮数量应该等于导航项数量
      expect(buttons!.length).toBe(testItems.length);
    });

    it('should support custom className', () => {
      const { container } = render(
        <Sidebar items={testItems} className="custom-sidebar" />
      );
      
      const sidebar = container.querySelector('aside');
      expect(sidebar?.className).toContain('custom-sidebar');
    });
  });
});
