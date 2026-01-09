/**
 * @file Message.test.tsx
 * @description Message 组件属性测试
 * @module components/cherry/chat/Message.test
 * 
 * **Feature: cherry-studio-ui-clone**
 * 
 * Property 7: Message role styling
 * 
 * **Validates: Requirements 3.1, 3.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import React from 'react';
import { Message, type MessageRole } from './Message';

describe('Message', () => {
  /**
   * Property 7: Message role styling
   * 
   * *对于任意* Message 组件，当 role 为 'user' 时应有用户特定样式，
   * 当 role 为 'assistant' 时应有助手特定样式。
   * 
   * **Feature: cherry-studio-ui-clone, Property 7: Message role styling**
   * **Validates: Requirements 3.1, 3.5**
   */
  it('Property 7: Message role styling', () => {
    const roleArb = fc.constantFrom<MessageRole>('user', 'assistant');
    const contentArb = fc.string({ minLength: 1, maxLength: 200 });
    const idArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(roleArb, contentArb, idArb, (role, content, id) => {
        const { container, unmount } = render(
          <Message
            id={id}
            role={role}
            content={content}
          />
        );

        const message = container.firstChild as HTMLElement;
        expect(message).toBeTruthy();

        // 验证角色特定样式
        if (role === 'user') {
          expect(message.className).toContain('cherry-chat-background-user');
        } else {
          expect(message.className).toContain('cherry-chat-background-assistant');
        }

        unmount();
      }),
      { numRuns: 20 }
    );
  });


  /**
   * Property 7b: Message has correct data attribute
   * 
   * *对于任意* Message 组件，应有正确的 data-message-id 属性。
   * 
   * **Feature: cherry-studio-ui-clone, Property 7: Message role styling**
   * **Validates: Requirements 3.1**
   */
  it('Property 7b: Message has correct data attribute', () => {
    const idArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);
    const roleArb = fc.constantFrom<MessageRole>('user', 'assistant');

    fc.assert(
      fc.property(idArb, roleArb, (id, role) => {
        const { container, unmount } = render(
          <Message
            id={id}
            role={role}
            content="Test message"
          />
        );

        const message = container.firstChild as HTMLElement;
        expect(message).toBeTruthy();
        expect(message.getAttribute('data-message-id')).toBe(id);

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * 基础功能测试
   */
  describe('Basic functionality', () => {
    it('should render user message with default avatar', () => {
      const { container } = render(
        <Message id="1" role="user" content="Hello" />
      );
      
      const message = container.firstChild as HTMLElement;
      expect(message).toBeTruthy();
      expect(message.textContent).toContain('Hello');
      expect(message.textContent).toContain('用户');
    });

    it('should render assistant message with default avatar', () => {
      const { container } = render(
        <Message id="2" role="assistant" content="Hi there" />
      );
      
      const message = container.firstChild as HTMLElement;
      expect(message).toBeTruthy();
      expect(message.textContent).toContain('Hi there');
      expect(message.textContent).toContain('助手');
    });

    it('should render custom name', () => {
      const { container } = render(
        <Message id="3" role="assistant" content="Hello" name="GPT-4" />
      );
      
      expect(container.textContent).toContain('GPT-4');
    });

    it('should render custom avatar', () => {
      const { container } = render(
        <Message 
          id="4" 
          role="user" 
          content="Hello" 
          avatar={{ type: 'emoji', emoji: '🎉' }}
        />
      );
      
      expect(container.textContent).toContain('🎉');
    });

    it('should render timestamp when provided', () => {
      const timestamp = new Date('2024-01-01T10:30:00');
      const { container } = render(
        <Message 
          id="5" 
          role="user" 
          content="Hello" 
          timestamp={timestamp}
        />
      );
      
      // 应该显示时间
      expect(container.textContent).toContain('10:30');
    });

    it('should support custom className', () => {
      const { container } = render(
        <Message 
          id="6" 
          role="user" 
          content="Hello" 
          className="custom-message"
        />
      );
      
      const message = container.firstChild as HTMLElement;
      expect(message.className).toContain('custom-message');
    });

    it('should render message blocks', () => {
      const blocks = [
        { type: 'text' as const, content: 'Hello' },
        { type: 'code' as const, content: 'console.log("hi")', language: 'javascript' },
      ];
      
      const { container } = render(
        <Message id="7" role="assistant" content={blocks} />
      );
      
      expect(container.textContent).toContain('Hello');
      expect(container.textContent).toContain('console.log');
    });
  });
});
