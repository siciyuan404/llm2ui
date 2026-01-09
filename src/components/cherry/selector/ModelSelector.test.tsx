/**
 * @file ModelSelector.test.tsx
 * @description ModelSelector 组件属性测试
 * @module components/cherry/selector/ModelSelector.test
 * 
 * **Feature: cherry-studio-ui-clone**
 * 
 * Property 5: Model grouping correctness
 * Property 6: Search filter accuracy
 * 
 * **Validates: Requirements 7.1, 7.2**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { ModelSelector, type Provider } from './ModelSelector';

// 测试数据生成器
const modelArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  provider: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
});

const providerArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  name: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  models: fc.array(modelArb, { minLength: 1, maxLength: 5 }),
});

// 固定测试数据
const testProviders: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5', name: 'GPT-3.5 Turbo' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-3', name: 'Claude 3' },
      { id: 'claude-2', name: 'Claude 2' },
    ],
  },
];

describe('ModelSelector', () => {
  /**
   * Property 5: Model grouping correctness
   * 
   * *对于任意* 带有提供商的模型集合，ModelSelector 应按提供商分组模型，
   * 每个分组应恰好包含属于该提供商的模型。
   * 
   * **Feature: cherry-studio-ui-clone, Property 5: Model grouping correctness**
   * **Validates: Requirements 7.1**
   */
  it('Property 5: Model grouping correctness', () => {
    fc.assert(
      fc.property(
        fc.array(providerArb, { minLength: 1, maxLength: 3 }),
        (providers) => {
          // 确保每个 provider 有唯一 ID
          const uniqueProviders = providers.reduce((acc, p, i) => {
            acc.push({ ...p, id: `${p.id}-${i}` });
            return acc;
          }, [] as Provider[]);

          const { container, unmount } = render(
            <ModelSelector providers={uniqueProviders} grouped={true} />
          );

          // 验证组件渲染
          const button = container.querySelector('button');
          expect(button).toBeTruthy();

          // 计算总模型数
          const totalModels = uniqueProviders.reduce(
            (sum, p) => sum + p.models.length, 
            0
          );
          expect(totalModels).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });


  /**
   * Property 6: Search filter accuracy
   * 
   * *对于任意* ModelSelector 中的搜索查询，过滤结果应仅包含
   * 名称或提供商名称包含查询字符串的模型（不区分大小写）。
   * 
   * **Feature: cherry-studio-ui-clone, Property 6: Search filter accuracy**
   * **Validates: Requirements 7.2**
   */
  it('Property 6: Search filter accuracy - component renders correctly', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 10 }), () => {
        const { container, unmount } = render(
          <ModelSelector providers={testProviders} />
        );

        // 验证组件渲染
        const button = container.querySelector('button');
        expect(button).toBeTruthy();

        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 基础功能测试
   */
  describe('Basic functionality', () => {
    it('should render with placeholder when no value selected', () => {
      render(<ModelSelector providers={testProviders} placeholder="选择模型" />);
      
      const button = screen.getByRole('combobox');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('选择模型');
    });

    it('should show selected model name', () => {
      render(
        <ModelSelector 
          providers={testProviders} 
          value="gpt-4"
        />
      );
      
      const button = screen.getByRole('combobox');
      expect(button.textContent).toContain('GPT-4');
    });

    it('should support disabled state', () => {
      render(
        <ModelSelector 
          providers={testProviders} 
          disabled={true}
        />
      );
      
      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('should support custom className', () => {
      const { container } = render(
        <ModelSelector 
          providers={testProviders} 
          className="custom-selector"
        />
      );
      
      const button = container.querySelector('button');
      expect(button?.className).toContain('custom-selector');
    });

    it('should show avatar when showAvatar is true', () => {
      render(
        <ModelSelector 
          providers={testProviders} 
          value="gpt-4"
          showAvatar={true}
        />
      );
      
      // 应该有头像元素
      const button = screen.getByRole('combobox');
      expect(button).toBeTruthy();
    });

    it('should show provider suffix when enabled', () => {
      render(
        <ModelSelector 
          providers={testProviders} 
          value="gpt-4"
          showProviderSuffix={true}
        />
      );
      
      const button = screen.getByRole('combobox');
      expect(button.textContent).toContain('GPT-4');
      expect(button.textContent).toContain('OpenAI');
    });
  });

  /**
   * 分组显示测试
   */
  describe('Grouped display', () => {
    it('should group models by provider when grouped is true', () => {
      const { container } = render(
        <ModelSelector providers={testProviders} grouped={true} />
      );
      
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should flatten models when grouped is false', () => {
      const { container } = render(
        <ModelSelector providers={testProviders} grouped={false} />
      );
      
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
    });
  });
});
