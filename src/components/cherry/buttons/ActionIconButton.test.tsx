/**
 * @file ActionIconButton.test.tsx
 * @description ActionIconButton 组件属性测试
 * @module components/cherry/buttons/ActionIconButton.test
 * 
 * **Feature: cherry-studio-ui-clone**
 * 
 * Property 2: State-based styling correctness
 * Property 3: Size variant consistency
 * 
 * **Validates: Requirements 6.2, 6.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ActionIconButton, type ActionIconButtonSize } from './ActionIconButton';
import { Plus } from 'lucide-react';

describe('ActionIconButton', () => {
  /**
   * Property 2: State-based styling correctness
   * 
   * *对于任意* 组件状态 (active, disabled)，组件应应用正确的 CSS 类。
   * 
   * **Feature: cherry-studio-ui-clone, Property 2: State-based styling correctness**
   * **Validates: Requirements 6.2**
   */
  it('Property 2: State-based styling correctness', () => {
    const stateArb = fc.record({
      active: fc.boolean(),
      disabled: fc.boolean(),
    });

    fc.assert(
      fc.property(stateArb, ({ active, disabled }) => {
        const { container, unmount } = render(
          <ActionIconButton
            icon={<Plus data-testid="icon" />}
            active={active}
            disabled={disabled}
            data-testid="button"
          />
        );

        const button = container.querySelector('button');
        expect(button).toBeTruthy();

        // 验证 active 状态样式
        if (active) {
          expect(button?.className).toContain('bg-[var(--cherry-primary)]');
          expect(button?.className).toContain('text-white');
        } else {
          expect(button?.className).toContain('text-[var(--cherry-icon)]');
        }

        // 验证 disabled 状态
        if (disabled) {
          expect(button?.disabled).toBe(true);
          expect(button?.className).toContain('opacity-50');
          expect(button?.className).toContain('cursor-not-allowed');
        }

        unmount();
      }),
      { numRuns: 20 }
    );
  });


  /**
   * Property 3: Size variant consistency
   * 
   * *对于任意* 尺寸变体 (sm, md, lg)，渲染的尺寸应匹配定义的尺寸映射
   * (sm: 24px, md: 30px, lg: 36px)。
   * 
   * **Feature: cherry-studio-ui-clone, Property 3: Size variant consistency**
   * **Validates: Requirements 6.5**
   */
  it('Property 3: Size variant consistency', () => {
    const sizeArb = fc.constantFrom<ActionIconButtonSize>('sm', 'md', 'lg');
    
    const expectedSizeClasses: Record<ActionIconButtonSize, string> = {
      sm: 'h-6 w-6',
      md: 'h-[30px] w-[30px]',
      lg: 'h-9 w-9',
    };

    fc.assert(
      fc.property(sizeArb, (size) => {
        const { container, unmount } = render(
          <ActionIconButton
            icon={<Plus />}
            size={size}
          />
        );

        const button = container.querySelector('button');
        expect(button).toBeTruthy();

        // 验证尺寸类
        const expectedClass = expectedSizeClasses[size];
        const [heightClass, widthClass] = expectedClass.split(' ');
        expect(button?.className).toContain(heightClass);
        expect(button?.className).toContain(widthClass);

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3b: Icon size scales with button size
   * 
   * *对于任意* 尺寸变体，图标尺寸应与按钮尺寸匹配。
   * 
   * **Feature: cherry-studio-ui-clone, Property 3: Size variant consistency**
   * **Validates: Requirements 6.5**
   */
  it('Property 3b: Icon size scales with button size', () => {
    const sizeArb = fc.constantFrom<ActionIconButtonSize>('sm', 'md', 'lg');
    
    const expectedIconSizeClasses: Record<ActionIconButtonSize, string> = {
      sm: '[&>svg]:h-3.5',
      md: '[&>svg]:h-4',
      lg: '[&>svg]:h-5',
    };

    fc.assert(
      fc.property(sizeArb, (size) => {
        const { container, unmount } = render(
          <ActionIconButton
            icon={<Plus />}
            size={size}
          />
        );

        const button = container.querySelector('button');
        expect(button).toBeTruthy();

        // 验证图标尺寸类
        const expectedClass = expectedIconSizeClasses[size];
        expect(button?.className).toContain(expectedClass);

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * 基础功能测试
   */
  describe('Basic functionality', () => {
    it('should render with default props', () => {
      render(<ActionIconButton icon={<Plus />} />);
      const button = document.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should be circular (rounded-full)', () => {
      const { container } = render(<ActionIconButton icon={<Plus />} />);
      const button = container.querySelector('button');
      expect(button?.className).toContain('rounded-full');
    });

    it('should support custom className', () => {
      const { container } = render(
        <ActionIconButton icon={<Plus />} className="custom-class" />
      );
      const button = container.querySelector('button');
      expect(button?.className).toContain('custom-class');
    });
  });
});
