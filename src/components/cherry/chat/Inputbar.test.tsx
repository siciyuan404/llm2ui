/**
 * @file Inputbar.test.tsx
 * @description Inputbar 组件属性测试
 * @module components/cherry/chat/Inputbar.test
 * 
 * **Feature: cherry-studio-ui-clone**
 * 
 * Property 11: Inputbar loading state
 * 
 * **Validates: Requirements 4.8**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Inputbar } from './Inputbar';

describe('Inputbar', () => {
  /**
   * Property 11: Inputbar loading state
   * 
   * *对于任意* Inputbar 组件，当 isLoading 为 true 时，发送按钮应被替换为暂停按钮，
   * 当 isLoading 为 false 时，暂停按钮应被替换为发送按钮。
   * 
   * **Feature: cherry-studio-ui-clone, Property 11: Inputbar loading state**
   * **Validates: Requirements 4.8**
   */
  it('Property 11: Inputbar loading state', () => {
    const isLoadingArb = fc.boolean();
    const valueArb = fc.string({ minLength: 0, maxLength: 100 });

    fc.assert(
      fc.property(isLoadingArb, valueArb, (isLoading, value) => {
        const { container, unmount } = render(
          <Inputbar
            value={value}
            isLoading={isLoading}
          />
        );

        // 查找按钮
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);

        // 查找发送/暂停按钮（最后一个按钮）
        const actionButton = Array.from(buttons).find(
          btn => btn.getAttribute('aria-label') === '发送' || 
                 btn.getAttribute('aria-label') === '暂停'
        );
        expect(actionButton).toBeTruthy();

        if (isLoading) {
          // 加载时应显示暂停按钮
          expect(actionButton?.getAttribute('aria-label')).toBe('暂停');
        } else {
          // 非加载时应显示发送按钮
          expect(actionButton?.getAttribute('aria-label')).toBe('发送');
        }

        unmount();
      }),
      { numRuns: 20 }
    );
  });


  /**
   * Property 11b: Send button disabled when empty
   * 
   * *对于任意* Inputbar 组件，当输入为空时发送按钮应被禁用。
   * 
   * **Feature: cherry-studio-ui-clone, Property 11: Inputbar loading state**
   * **Validates: Requirements 4.8**
   */
  it('Property 11b: Send button disabled when empty', () => {
    const emptyValueArb = fc.constantFrom('', '   ', '\n', '\t');

    fc.assert(
      fc.property(emptyValueArb, (value) => {
        const { container, unmount } = render(
          <Inputbar value={value} isLoading={false} />
        );

        const sendButton = container.querySelector('button[aria-label="发送"]');
        expect(sendButton).toBeTruthy();
        expect(sendButton?.disabled).toBe(true);

        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 基础功能测试
   */
  describe('Basic functionality', () => {
    it('should render textarea', () => {
      const { container } = render(<Inputbar />);
      
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeTruthy();
    });

    it('should render with placeholder', () => {
      const { container } = render(
        <Inputbar placeholder="输入消息..." />
      );
      
      const textarea = container.querySelector('textarea');
      expect(textarea?.placeholder).toBe('输入消息...');
    });

    it('should render send button when not loading', () => {
      const { container } = render(
        <Inputbar isLoading={false} />
      );
      
      const sendButton = container.querySelector('button[aria-label="发送"]');
      expect(sendButton).toBeTruthy();
    });

    it('should render pause button when loading', () => {
      const { container } = render(
        <Inputbar isLoading={true} />
      );
      
      const pauseButton = container.querySelector('button[aria-label="暂停"]');
      expect(pauseButton).toBeTruthy();
    });

    it('should render attachments when provided', () => {
      const attachments = [
        { id: '1', name: 'file.txt', type: 'text/plain', size: 100 },
      ];
      
      const { container } = render(
        <Inputbar attachments={attachments} />
      );
      
      expect(container.textContent).toContain('file.txt');
    });

    it('should render mentioned models when provided', () => {
      const mentionedModels = [
        { id: 'gpt-4', name: 'GPT-4' },
      ];
      
      const { container } = render(
        <Inputbar mentionedModels={mentionedModels} />
      );
      
      expect(container.textContent).toContain('@GPT-4');
    });

    it('should render token count when enabled', () => {
      const { container } = render(
        <Inputbar showTokenCount={true} tokenCount={150} />
      );
      
      expect(container.textContent).toContain('150 tokens');
    });

    it('should support disabled state', () => {
      const { container } = render(
        <Inputbar disabled={true} />
      );
      
      const textarea = container.querySelector('textarea');
      expect(textarea?.disabled).toBe(true);
    });

    it('should support custom className', () => {
      const { container } = render(
        <Inputbar className="custom-inputbar" />
      );
      
      const inputbar = container.firstChild as HTMLElement;
      expect(inputbar.className).toContain('custom-inputbar');
    });
  });
});
