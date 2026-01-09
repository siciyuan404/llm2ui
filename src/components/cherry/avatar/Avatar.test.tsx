/**
 * @file Avatar.test.tsx
 * @description Avatar 系列组件属性测试
 * @module components/cherry/avatar/Avatar.test
 * 
 * **Feature: cherry-studio-ui-clone**
 * 
 * Property 3: Size variant consistency
 * Property 12: Avatar fallback behavior
 * 
 * **Validates: Requirements 5.2, 5.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import React from 'react';
import { EmojiAvatar, type AvatarSize } from './EmojiAvatar';
import { ModelAvatar } from './ModelAvatar';
import { AssistantAvatar } from './AssistantAvatar';

describe('Avatar Components', () => {
  /**
   * Property 3: Size variant consistency
   * 
   * *对于任意* 尺寸变体 (sm, md, lg)，渲染的尺寸应匹配定义的尺寸映射
   * (sm: 24px, md: 32px, lg: 48px)。
   * 
   * **Feature: cherry-studio-ui-clone, Property 3: Size variant consistency**
   * **Validates: Requirements 5.5**
   */
  describe('EmojiAvatar', () => {
    it('Property 3: Size variant consistency for EmojiAvatar', () => {
      const sizeArb = fc.constantFrom<AvatarSize>('sm', 'md', 'lg');
      const emojiArb = fc.constantFrom('😀', '🤖', '👤', '🎉', '💡');
      
      const expectedSizeClasses: Record<AvatarSize, string> = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
      };

      fc.assert(
        fc.property(sizeArb, emojiArb, (size, emoji) => {
          const { container, unmount } = render(
            <EmojiAvatar emoji={emoji} size={size} />
          );

          const avatar = container.firstChild as HTMLElement;
          expect(avatar).toBeTruthy();

          // 验证尺寸类
          const expectedClass = expectedSizeClasses[size];
          const [heightClass, widthClass] = expectedClass.split(' ');
          expect(avatar.className).toContain(heightClass);
          expect(avatar.className).toContain(widthClass);

          // 验证 emoji 内容
          expect(avatar.textContent).toContain(emoji);

          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should be circular (rounded-full)', () => {
      const { container } = render(<EmojiAvatar emoji="😀" />);
      const avatar = container.firstChild as HTMLElement;
      expect(avatar.className).toContain('rounded-full');
    });
  });


  describe('ModelAvatar', () => {
    /**
     * Property 12: Avatar fallback behavior
     * 
     * *对于任意* ModelAvatar 组件，当模型提供商 logo 加载失败时，
     * 组件应显示 fallback 图标而不抛出错误。
     * 
     * **Feature: cherry-studio-ui-clone, Property 12: Avatar fallback behavior**
     * **Validates: Requirements 5.2**
     */
    it('Property 12: Avatar fallback behavior', () => {
      const modelArb = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        provider: fc.option(fc.constantFrom('unknown', 'invalid', 'nonexistent'), { nil: undefined }),
      });

      fc.assert(
        fc.property(modelArb, (model) => {
          // 不应抛出错误
          expect(() => {
            const { container, unmount } = render(
              <ModelAvatar model={model} />
            );
            
            const avatar = container.firstChild as HTMLElement;
            expect(avatar).toBeTruthy();
            
            // 应该显示 fallback 图标 (Bot icon)
            const svg = avatar.querySelector('svg');
            expect(svg).toBeTruthy();
            
            unmount();
          }).not.toThrow();
        }),
        { numRuns: 20 }
      );
    });

    it('Property 3: Size variant consistency for ModelAvatar', () => {
      const sizeArb = fc.constantFrom<AvatarSize>('sm', 'md', 'lg');
      
      const expectedSizeClasses: Record<AvatarSize, string> = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
      };

      fc.assert(
        fc.property(sizeArb, (size) => {
          const { container, unmount } = render(
            <ModelAvatar 
              model={{ id: 'test', name: 'Test Model' }} 
              size={size} 
            />
          );

          const avatar = container.firstChild as HTMLElement;
          expect(avatar).toBeTruthy();

          const expectedClass = expectedSizeClasses[size];
          const [heightClass, widthClass] = expectedClass.split(' ');
          expect(avatar.className).toContain(heightClass);
          expect(avatar.className).toContain(widthClass);

          unmount();
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('AssistantAvatar', () => {
    it('Property 3: Size variant consistency for AssistantAvatar', () => {
      const sizeArb = fc.constantFrom<AvatarSize>('sm', 'md', 'lg');
      const typeArb = fc.constantFrom<'image' | 'emoji'>('image', 'emoji');
      
      const expectedSizeClasses: Record<AvatarSize, string> = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
      };

      fc.assert(
        fc.property(sizeArb, typeArb, (size, type) => {
          const { container, unmount } = render(
            <AssistantAvatar 
              type={type}
              emoji={type === 'emoji' ? '🤖' : undefined}
              src={type === 'image' ? '/test.png' : undefined}
              size={size} 
            />
          );

          const avatar = container.firstChild as HTMLElement;
          expect(avatar).toBeTruthy();

          const expectedClass = expectedSizeClasses[size];
          const [heightClass, widthClass] = expectedClass.split(' ');
          expect(avatar.className).toContain(heightClass);
          expect(avatar.className).toContain(widthClass);

          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should render emoji when type is emoji', () => {
      const { container } = render(
        <AssistantAvatar type="emoji" emoji="🤖" />
      );
      expect(container.textContent).toContain('🤖');
    });

    it('should render image when type is image', () => {
      const { container } = render(
        <AssistantAvatar type="image" src="/test.png" />
      );
      const img = container.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.src).toContain('/test.png');
    });
  });
});
