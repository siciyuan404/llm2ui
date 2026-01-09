/**
 * @file quality-metrics.test.ts
 * @description 质量指标计算器单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  QualityMetricsCalculator,
  calculateSchemaComplexity,
  calculateComponentCoverage,
  calculateTokenComplianceRate,
  calculateIconComplianceRate,
  calculateQualityScores,
} from './quality-metrics';
import type { UISchema } from '@/types/ui-schema';

describe('QualityMetricsCalculator', () => {
  const calculator = new QualityMetricsCalculator();

  describe('calculateSchemaComplexity', () => {
    it('应该返回 0 对于空 schema', () => {
      expect(calculator.calculateSchemaComplexity(null as unknown as UISchema)).toBe(0);
      expect(calculator.calculateSchemaComplexity({} as UISchema)).toBe(0);
    });

    it('应该计算简单 schema 的复杂度', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
        },
      };

      const complexity = calculator.calculateSchemaComplexity(schema);
      // 1 component * 2 + 0 depth * 10 + 1 type * 5 = 7
      expect(complexity).toBe(7);
    });

    it('应该计算嵌套 schema 的复杂度', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: [
            {
              type: 'Button',
              id: 'btn',
              props: {},
            },
            {
              type: 'Text',
              id: 'text',
              props: {},
            },
          ],
        },
      };

      const complexity = calculator.calculateSchemaComplexity(schema);
      // 3 components * 2 + 1 depth * 10 + 3 types * 5 = 6 + 10 + 15 = 31
      expect(complexity).toBe(31);
    });

    it('应该限制最大复杂度为 100', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: Array(50).fill(null).map((_, i) => ({
            type: `Component${i}`,
            id: `comp-${i}`,
            props: {},
          })),
        },
      };

      const complexity = calculator.calculateSchemaComplexity(schema);
      expect(complexity).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateComponentCoverage', () => {
    it('应该返回 0 对于空 schema', () => {
      expect(calculator.calculateComponentCoverage(null as unknown as UISchema)).toBe(0);
    });

    it('应该计算组件覆盖率', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: [
            { type: 'Button', id: 'btn', props: {} },
            { type: 'Text', id: 'text', props: {} },
          ],
        },
      };

      const coverage = calculator.calculateComponentCoverage(schema);
      // 覆盖率应该在 0-100 之间（具体值取决于注册的组件数量）
      expect(coverage).toBeGreaterThanOrEqual(0);
      expect(coverage).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateTokenComplianceRate', () => {
    it('应该返回 100 对于没有样式的 schema', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
        },
      };

      expect(calculator.calculateTokenComplianceRate(schema)).toBe(100);
    });

    it('应该计算使用 Token 的合规率', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {
            className: 'bg-blue-500 text-white p-4 custom-class',
          },
        },
      };

      const rate = calculator.calculateTokenComplianceRate(schema);
      // 合规率应该在 0-100 之间
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });

    it('应该处理内联样式', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {
            style: {
              color: 'red',
              fontSize: '16px',
            },
          },
        },
      };

      const rate = calculator.calculateTokenComplianceRate(schema);
      // 内联样式不是 Token
      expect(rate).toBe(0);
    });
  });

  describe('calculateIconComplianceRate', () => {
    it('应该返回 100 对于没有图标的 schema', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: ['Hello World'],
        },
      };

      expect(calculator.calculateIconComplianceRate(schema)).toBe(100);
    });

    it('应该计算 Icon 组件的合规率', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: [
            { type: 'Icon', id: 'icon1', props: { name: 'search' } },
            { type: 'Icon', id: 'icon2', props: { name: 'home' } },
          ],
        },
      };

      expect(calculator.calculateIconComplianceRate(schema)).toBe(100);
    });

    it('应该检测 emoji 并降低合规率', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: [
            { type: 'Icon', id: 'icon1', props: { name: 'search' } },
            '🔍 Search',
          ],
        },
      };

      const rate = calculator.calculateIconComplianceRate(schema);
      // 1 Icon, 1 emoji = 50%
      expect(rate).toBe(50);
    });
  });

  describe('calculateAll', () => {
    it('应该计算所有指标', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: { className: 'bg-white p-4' },
          children: [
            { type: 'Button', id: 'btn', props: {} },
          ],
        },
      };

      const scores = calculator.calculateAll(schema);

      expect(scores.schemaComplexity).toBeGreaterThanOrEqual(0);
      expect(scores.schemaComplexity).toBeLessThanOrEqual(100);
      expect(scores.componentCoverage).toBeGreaterThanOrEqual(0);
      expect(scores.componentCoverage).toBeLessThanOrEqual(100);
      expect(scores.tokenComplianceRate).toBeGreaterThanOrEqual(0);
      expect(scores.tokenComplianceRate).toBeLessThanOrEqual(100);
      expect(scores.iconComplianceRate).toBeGreaterThanOrEqual(0);
      expect(scores.iconComplianceRate).toBeLessThanOrEqual(100);
    });
  });
});

describe('便捷函数', () => {
  const schema: UISchema = {
    version: '1.0',
    root: {
      type: 'Container',
      id: 'root',
      props: {},
    },
  };

  it('calculateSchemaComplexity 应该工作', () => {
    expect(calculateSchemaComplexity(schema)).toBeGreaterThanOrEqual(0);
  });

  it('calculateComponentCoverage 应该工作', () => {
    expect(calculateComponentCoverage(schema)).toBeGreaterThanOrEqual(0);
  });

  it('calculateTokenComplianceRate 应该工作', () => {
    expect(calculateTokenComplianceRate(schema)).toBeGreaterThanOrEqual(0);
  });

  it('calculateIconComplianceRate 应该工作', () => {
    expect(calculateIconComplianceRate(schema)).toBeGreaterThanOrEqual(0);
  });

  it('calculateQualityScores 应该工作', () => {
    const scores = calculateQualityScores(schema);
    expect(scores).toHaveProperty('schemaComplexity');
    expect(scores).toHaveProperty('componentCoverage');
    expect(scores).toHaveProperty('tokenComplianceRate');
    expect(scores).toHaveProperty('iconComplianceRate');
  });
});
