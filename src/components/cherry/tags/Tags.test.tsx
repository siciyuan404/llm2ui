/**
 * @file Tags.test.tsx
 * @description Model Tags 组件属性测试
 * @module components/cherry/tags/Tags.test
 * 
 * **Feature: cherry-studio-ui-clone**
 * 
 * Property 10: Tag component consistency
 * 
 * **Validates: Requirements 8.1-8.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import React from 'react';
import { VisionTag } from './VisionTag';
import { ReasoningTag } from './ReasoningTag';
import { WebSearchTag } from './WebSearchTag';
import { ToolsCallingTag } from './ToolsCallingTag';
import { FreeTag } from './FreeTag';
import type { TagSize } from './BaseTag';

// 标签配置
const tagConfigs = [
  { Component: VisionTag, label: 'Vision', name: 'VisionTag' },
  { Component: ReasoningTag, label: 'Reasoning', name: 'ReasoningTag' },
  { Component: WebSearchTag, label: 'Web Search', name: 'WebSearchTag' },
  { Component: ToolsCallingTag, label: 'Tools', name: 'ToolsCallingTag' },
  { Component: FreeTag, label: 'Free', name: 'FreeTag' },
];

describe('Model Tags', () => {
  /**
   * Property 10: Tag component consistency
   * 
   * *对于任意* Model Tag 组件 (Vision, Reasoning, WebSearch, Tools, Free)，
   * 渲染输出应包含正确的图标和标签文本。
   * 
   * **Feature: cherry-studio-ui-clone, Property 10: Tag component consistency**
   * **Validates: Requirements 8.1-8.5**
   */
  it('Property 10: Tag component consistency - correct label', () => {
    const tagArb = fc.constantFrom(...tagConfigs);
    const sizeArb = fc.constantFrom<TagSize>('sm', 'md');

    fc.assert(
      fc.property(tagArb, sizeArb, ({ Component, label }, size) => {
        const { container, unmount } = render(
          <Component size={size} />
        );

        const tag = container.firstChild as HTMLElement;
        expect(tag).toBeTruthy();

        // 验证标签文本
        expect(tag.textContent).toContain(label);

        unmount();
      }),
      { numRuns: 20 }
    );
  });


  /**
   * Property 10b: Tag component has icon
   * 
   * *对于任意* Model Tag 组件，渲染输出应包含 SVG 图标。
   * 
   * **Feature: cherry-studio-ui-clone, Property 10: Tag component consistency**
   * **Validates: Requirements 8.1-8.5**
   */
  it('Property 10b: Tag component has icon', () => {
    const tagArb = fc.constantFrom(...tagConfigs);
    const sizeArb = fc.constantFrom<TagSize>('sm', 'md');

    fc.assert(
      fc.property(tagArb, sizeArb, ({ Component }, size) => {
        const { container, unmount } = render(
          <Component size={size} />
        );

        const tag = container.firstChild as HTMLElement;
        expect(tag).toBeTruthy();

        // 验证包含图标
        const svg = tag.querySelector('svg');
        expect(svg).toBeTruthy();

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 10c: Tag size variants
   * 
   * *对于任意* Model Tag 组件和尺寸变体，应应用正确的尺寸类。
   * 
   * **Feature: cherry-studio-ui-clone, Property 10: Tag component consistency**
   * **Validates: Requirements 8.6**
   */
  it('Property 10c: Tag size variants', () => {
    const tagArb = fc.constantFrom(...tagConfigs);
    const sizeArb = fc.constantFrom<TagSize>('sm', 'md');

    const expectedSizeClasses: Record<TagSize, string> = {
      sm: 'text-xs',
      md: 'text-sm',
    };

    fc.assert(
      fc.property(tagArb, sizeArb, ({ Component }, size) => {
        const { container, unmount } = render(
          <Component size={size} />
        );

        const tag = container.firstChild as HTMLElement;
        expect(tag).toBeTruthy();

        // 验证尺寸类
        expect(tag.className).toContain(expectedSizeClasses[size]);

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * 基础功能测试
   */
  describe('Basic functionality', () => {
    it('VisionTag should have purple color scheme', () => {
      const { container } = render(<VisionTag />);
      const tag = container.firstChild as HTMLElement;
      expect(tag.className).toContain('purple');
    });

    it('ReasoningTag should have blue color scheme', () => {
      const { container } = render(<ReasoningTag />);
      const tag = container.firstChild as HTMLElement;
      expect(tag.className).toContain('blue');
    });

    it('WebSearchTag should have green color scheme', () => {
      const { container } = render(<WebSearchTag />);
      const tag = container.firstChild as HTMLElement;
      expect(tag.className).toContain('green');
    });

    it('ToolsCallingTag should have orange color scheme', () => {
      const { container } = render(<ToolsCallingTag />);
      const tag = container.firstChild as HTMLElement;
      expect(tag.className).toContain('orange');
    });

    it('FreeTag should have emerald color scheme', () => {
      const { container } = render(<FreeTag />);
      const tag = container.firstChild as HTMLElement;
      expect(tag.className).toContain('emerald');
    });

    it('all tags should be rounded-full', () => {
      tagConfigs.forEach(({ Component }) => {
        const { container, unmount } = render(<Component />);
        const tag = container.firstChild as HTMLElement;
        expect(tag.className).toContain('rounded-full');
        unmount();
      });
    });
  });
});
