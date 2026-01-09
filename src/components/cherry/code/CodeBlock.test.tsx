/**
 * @file CodeBlock.test.tsx
 * @description CodeBlock 组件属性测试
 * @module components/cherry/code/CodeBlock.test
 * 
 * **Feature: cherry-studio-ui-clone**
 * 
 * Property 8: Code block feature toggles
 * 
 * **Validates: Requirements 9.4, 9.5, 9.6**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  /**
   * Property 8: Code block feature toggles
   * 
   * *对于任意* CodeBlock 组件，切换功能（行号、换行、展开）应正确更新渲染输出。
   * 
   * **Feature: cherry-studio-ui-clone, Property 8: Code block feature toggles**
   * **Validates: Requirements 9.4, 9.5, 9.6**
   */
  it('Property 8: Code block feature toggles - line numbers', () => {
    const showLineNumbersArb = fc.boolean();
    const codeArb = fc.string({ minLength: 1, maxLength: 200 });

    fc.assert(
      fc.property(showLineNumbersArb, codeArb, (showLineNumbers, code) => {
        const { container, unmount } = render(
          <CodeBlock
            code={code}
            showLineNumbers={showLineNumbers}
          />
        );

        const codeBlock = container.firstChild as HTMLElement;
        expect(codeBlock).toBeTruthy();

        if (showLineNumbers) {
          // 应该有表格结构显示行号
          const table = codeBlock.querySelector('table');
          expect(table).toBeTruthy();
        } else {
          // 应该直接显示代码
          const codeElement = codeBlock.querySelector('code');
          expect(codeElement).toBeTruthy();
        }

        unmount();
      }),
      { numRuns: 20 }
    );
  });


  /**
   * Property 8b: Code block wrap toggle
   * 
   * *对于任意* CodeBlock 组件，换行切换应正确更新渲染输出。
   * 
   * **Feature: cherry-studio-ui-clone, Property 8: Code block feature toggles**
   * **Validates: Requirements 9.5**
   */
  it('Property 8b: Code block wrap toggle', () => {
    const isWrappedArb = fc.boolean();
    const codeArb = fc.string({ minLength: 1, maxLength: 200 });

    fc.assert(
      fc.property(isWrappedArb, codeArb, (isWrapped, code) => {
        const { container, unmount } = render(
          <CodeBlock
            code={code}
            isWrapped={isWrapped}
          />
        );

        const pre = container.querySelector('pre');
        expect(pre).toBeTruthy();

        if (isWrapped) {
          expect(pre?.className).toContain('whitespace-pre-wrap');
        } else {
          expect(pre?.className).toContain('whitespace-pre');
        }

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 8c: Code block expand toggle
   * 
   * *对于任意* CodeBlock 组件，展开切换应正确更新渲染输出。
   * 
   * **Feature: cherry-studio-ui-clone, Property 8: Code block feature toggles**
   * **Validates: Requirements 9.6**
   */
  it('Property 8c: Code block expand toggle', () => {
    const isExpandedArb = fc.boolean();
    const maxHeightArb = fc.integer({ min: 100, max: 500 });

    fc.assert(
      fc.property(isExpandedArb, maxHeightArb, (isExpanded, maxHeight) => {
        const longCode = 'line\n'.repeat(50);
        
        const { container, unmount } = render(
          <CodeBlock
            code={longCode}
            isExpanded={isExpanded}
            maxHeight={maxHeight}
          />
        );

        const codeContainer = container.querySelector('.overflow-auto');
        expect(codeContainer).toBeTruthy();

        if (isExpanded) {
          // 展开时不应有 maxHeight 限制
          expect((codeContainer as HTMLElement).style.maxHeight).toBe('');
        } else {
          // 折叠时应有 maxHeight 限制
          expect((codeContainer as HTMLElement).style.maxHeight).toBe(`${maxHeight}px`);
        }

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * 基础功能测试
   */
  describe('Basic functionality', () => {
    it('should render code content', () => {
      const code = 'console.log("hello")';
      const { container } = render(<CodeBlock code={code} />);
      
      expect(container.textContent).toContain(code);
    });

    it('should render header by default', () => {
      const { container } = render(
        <CodeBlock code="test" showHeader={true} />
      );
      
      // 应该有工具栏
      const toolbar = container.querySelector('[class*="border-b"]');
      expect(toolbar).toBeTruthy();
    });

    it('should hide header when showHeader is false', () => {
      const { container } = render(
        <CodeBlock code="test" showHeader={false} />
      );
      
      // 不应该有工具栏
      const codeBlock = container.firstChild as HTMLElement;
      const firstChild = codeBlock.firstChild as HTMLElement;
      expect(firstChild.className).toContain('overflow-auto');
    });

    it('should display language label', () => {
      const { container } = render(
        <CodeBlock code="const x = 1" language="javascript" />
      );
      
      expect(container.textContent).toContain('javascript');
    });

    it('should support custom className', () => {
      const { container } = render(
        <CodeBlock code="test" className="custom-codeblock" />
      );
      
      const codeBlock = container.firstChild as HTMLElement;
      expect(codeBlock.className).toContain('custom-codeblock');
    });

    it('should be rounded', () => {
      const { container } = render(<CodeBlock code="test" />);
      
      const codeBlock = container.firstChild as HTMLElement;
      expect(codeBlock.className).toContain('rounded-lg');
    });
  });
});
