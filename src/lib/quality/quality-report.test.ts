/**
 * @file quality-report.test.ts
 * @description 质量报告生成器单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  formatReportAsText,
  formatReportAsMarkdown,
  formatScoresSummary,
  getTrendDirection,
  generateQualityBadge,
} from './quality-report';
import type { QualityReport, QualityScores, QualityTrend } from './types';

describe('formatReportAsText', () => {
  const sampleReport: QualityReport = {
    timeRange: {
      start: Date.now() - 7 * 24 * 60 * 60 * 1000,
      end: Date.now(),
    },
    totalGenerations: 100,
    successRate: 0.85,
    errorDistribution: {
      UNKNOWN_COMPONENT: 10,
      MISSING_PROP: 5,
    },
    averageTokenUsage: 500,
    averageGenerationTime: 1200,
    averageQualityScores: {
      schemaComplexity: 45,
      componentCoverage: 30,
      tokenComplianceRate: 75,
      iconComplianceRate: 90,
    },
    qualityTrends: [],
    recommendations: ['建议 1', '建议 2'],
  };

  it('应该生成文本格式报告', () => {
    const text = formatReportAsText(sampleReport);

    expect(text).toContain('质量报告');
    expect(text).toContain('总生成次数: 100');
    expect(text).toContain('成功率: 85.0%');
    expect(text).toContain('UNKNOWN_COMPONENT: 10 次');
    expect(text).toContain('建议 1');
  });
});

describe('formatReportAsMarkdown', () => {
  const sampleReport: QualityReport = {
    timeRange: {
      start: Date.now() - 7 * 24 * 60 * 60 * 1000,
      end: Date.now(),
    },
    totalGenerations: 50,
    successRate: 0.9,
    errorDistribution: {},
    averageTokenUsage: 400,
    averageGenerationTime: 1000,
    averageQualityScores: {
      schemaComplexity: 50,
      componentCoverage: 40,
      tokenComplianceRate: 80,
      iconComplianceRate: 95,
    },
    qualityTrends: [
      { date: '2024-01-01', successRate: 0.8, averageQuality: 60, count: 10 },
      { date: '2024-01-02', successRate: 0.9, averageQuality: 70, count: 15 },
    ],
    recommendations: [],
  };

  it('应该生成 Markdown 格式报告', () => {
    const markdown = formatReportAsMarkdown(sampleReport);

    expect(markdown).toContain('# 质量报告');
    expect(markdown).toContain('| 总生成次数 | 50 |');
    expect(markdown).toContain('| 成功率 | 90.0% |');
    expect(markdown).toContain('## 质量趋势');
  });

  it('应该包含表格格式', () => {
    const markdown = formatReportAsMarkdown(sampleReport);

    expect(markdown).toContain('|------|');
    expect(markdown).toContain('| 指标 | 值 |');
  });
});

describe('formatScoresSummary', () => {
  it('应该返回 A 级评分', () => {
    const scores: QualityScores = {
      schemaComplexity: 95,
      componentCoverage: 92,
      tokenComplianceRate: 90,
      iconComplianceRate: 93,
    };

    const summary = formatScoresSummary(scores);
    expect(summary).toContain('A');
  });

  it('应该返回 B 级评分', () => {
    const scores: QualityScores = {
      schemaComplexity: 85,
      componentCoverage: 82,
      tokenComplianceRate: 80,
      iconComplianceRate: 83,
    };

    const summary = formatScoresSummary(scores);
    expect(summary).toContain('B');
  });

  it('应该返回 F 级评分', () => {
    const scores: QualityScores = {
      schemaComplexity: 30,
      componentCoverage: 20,
      tokenComplianceRate: 40,
      iconComplianceRate: 35,
    };

    const summary = formatScoresSummary(scores);
    expect(summary).toContain('F');
  });
});

describe('getTrendDirection', () => {
  it('应该返回 stable 对于空趋势', () => {
    expect(getTrendDirection([])).toBe('stable');
  });

  it('应该返回 stable 对于单个趋势', () => {
    const trends: QualityTrend[] = [
      { date: '2024-01-01', successRate: 0.8, averageQuality: 70, count: 10 },
    ];
    expect(getTrendDirection(trends)).toBe('stable');
  });

  it('应该返回 up 对于上升趋势', () => {
    const trends: QualityTrend[] = [
      { date: '2024-01-01', successRate: 0.7, averageQuality: 60, count: 10 },
      { date: '2024-01-02', successRate: 0.8, averageQuality: 70, count: 10 },
      { date: '2024-01-03', successRate: 0.9, averageQuality: 80, count: 10 },
    ];
    expect(getTrendDirection(trends)).toBe('up');
  });

  it('应该返回 down 对于下降趋势', () => {
    const trends: QualityTrend[] = [
      { date: '2024-01-01', successRate: 0.9, averageQuality: 80, count: 10 },
      { date: '2024-01-02', successRate: 0.8, averageQuality: 70, count: 10 },
      { date: '2024-01-03', successRate: 0.7, averageQuality: 60, count: 10 },
    ];
    expect(getTrendDirection(trends)).toBe('down');
  });
});

describe('generateQualityBadge', () => {
  it('应该生成绿色徽章对于高分', () => {
    const scores: QualityScores = {
      schemaComplexity: 95,
      componentCoverage: 92,
      tokenComplianceRate: 90,
      iconComplianceRate: 93,
    };

    const badge = generateQualityBadge(scores);
    expect(badge).toContain('brightgreen');
  });

  it('应该生成红色徽章对于低分', () => {
    const scores: QualityScores = {
      schemaComplexity: 30,
      componentCoverage: 20,
      tokenComplianceRate: 40,
      iconComplianceRate: 35,
    };

    const badge = generateQualityBadge(scores);
    expect(badge).toContain('red');
  });

  it('应该包含 shields.io URL', () => {
    const scores: QualityScores = {
      schemaComplexity: 70,
      componentCoverage: 70,
      tokenComplianceRate: 70,
      iconComplianceRate: 70,
    };

    const badge = generateQualityBadge(scores);
    expect(badge).toContain('img.shields.io');
  });
});
