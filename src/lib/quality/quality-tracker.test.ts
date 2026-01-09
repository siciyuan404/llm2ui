/**
 * @file quality-tracker.test.ts
 * @description 质量追踪器单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QualityTracker, createQualityTracker } from './quality-tracker';
import type { GenerationMetrics, QualityScores } from './types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('QualityTracker', () => {
  let tracker: QualityTracker;

  const sampleScores: QualityScores = {
    schemaComplexity: 50,
    componentCoverage: 60,
    tokenComplianceRate: 70,
    iconComplianceRate: 80,
  };

  const sampleMetrics: Omit<GenerationMetrics, 'id' | 'timestamp'> = {
    success: true,
    errorTypes: [],
    warningCount: 0,
    tokenCount: 500,
    generationTimeMs: 1000,
    qualityScores: sampleScores,
  };

  beforeEach(() => {
    localStorageMock.clear();
    tracker = new QualityTracker({ enablePersistence: false });
  });

  describe('record', () => {
    it('应该记录生成指标', () => {
      const recorded = tracker.record(sampleMetrics);

      expect(recorded.id).toBeDefined();
      expect(recorded.timestamp).toBeDefined();
      expect(recorded.success).toBe(true);
    });

    it('应该生成唯一 ID', () => {
      const first = tracker.record(sampleMetrics);
      const second = tracker.record(sampleMetrics);

      expect(first.id).not.toBe(second.id);
    });

    it('应该限制最大记录数', () => {
      const smallTracker = new QualityTracker({
        maxRecords: 5,
        enablePersistence: false,
      });

      for (let i = 0; i < 10; i++) {
        smallTracker.record(sampleMetrics);
      }

      const allMetrics = smallTracker.getAllMetrics();
      expect(allMetrics.length).toBe(5);
    });
  });

  describe('getReport', () => {
    it('应该返回空报告当没有数据时', () => {
      const report = tracker.getReport();

      expect(report.totalGenerations).toBe(0);
      expect(report.successRate).toBe(0);
    });

    it('应该计算正确的成功率', () => {
      tracker.record({ ...sampleMetrics, success: true });
      tracker.record({ ...sampleMetrics, success: true });
      tracker.record({ ...sampleMetrics, success: false, errorTypes: ['ERROR'] });

      const report = tracker.getReport();

      expect(report.totalGenerations).toBe(3);
      expect(report.successRate).toBeCloseTo(2 / 3);
    });

    it('应该计算错误分布', () => {
      tracker.record({ ...sampleMetrics, success: false, errorTypes: ['TYPE_A'] });
      tracker.record({ ...sampleMetrics, success: false, errorTypes: ['TYPE_A', 'TYPE_B'] });
      tracker.record({ ...sampleMetrics, success: false, errorTypes: ['TYPE_B'] });

      const report = tracker.getReport();

      expect(report.errorDistribution['TYPE_A']).toBe(2);
      expect(report.errorDistribution['TYPE_B']).toBe(2);
    });

    it('应该计算平均值', () => {
      tracker.record({ ...sampleMetrics, tokenCount: 100, generationTimeMs: 500 });
      tracker.record({ ...sampleMetrics, tokenCount: 200, generationTimeMs: 1000 });
      tracker.record({ ...sampleMetrics, tokenCount: 300, generationTimeMs: 1500 });

      const report = tracker.getReport();

      expect(report.averageTokenUsage).toBe(200);
      expect(report.averageGenerationTime).toBe(1000);
    });

    it('应该支持时间范围过滤', () => {
      const now = Date.now();
      
      // 记录一些数据
      tracker.record(sampleMetrics);
      tracker.record(sampleMetrics);

      const report = tracker.getReport({
        start: now - 1000,
        end: now + 1000,
      });

      expect(report.totalGenerations).toBe(2);
    });

    it('应该计算质量趋势', () => {
      tracker.record(sampleMetrics);
      tracker.record(sampleMetrics);

      const report = tracker.getReport();

      expect(report.qualityTrends.length).toBeGreaterThan(0);
      expect(report.qualityTrends[0].count).toBe(2);
    });
  });

  describe('getRecommendations', () => {
    it('应该返回建议列表', () => {
      // 记录一些低质量数据
      tracker.record({
        ...sampleMetrics,
        success: false,
        errorTypes: ['UNKNOWN_COMPONENT'],
        qualityScores: {
          schemaComplexity: 30,
          componentCoverage: 20,
          tokenComplianceRate: 40,
          iconComplianceRate: 50,
        },
      });

      const recommendations = tracker.getRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('export', () => {
    it('应该导出为 JSON 字符串', () => {
      tracker.record(sampleMetrics);

      const exported = tracker.export();
      const parsed = JSON.parse(exported);

      expect(parsed.version).toBe('1.0');
      expect(parsed.metrics.length).toBe(1);
    });
  });

  describe('clear', () => {
    it('应该清除所有数据', () => {
      tracker.record(sampleMetrics);
      tracker.record(sampleMetrics);

      tracker.clear();

      const allMetrics = tracker.getAllMetrics();
      expect(allMetrics.length).toBe(0);
    });
  });

  describe('persistence', () => {
    it('应该在 localStorage 可用时持久化数据', () => {
      const persistentTracker = new QualityTracker({
        storageKey: 'test_metrics',
        enablePersistence: true,
      });

      persistentTracker.record(sampleMetrics);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('应该在 localStorage 不可用时降级为内存存储', () => {
      const memoryTracker = new QualityTracker({
        enablePersistence: false,
      });

      memoryTracker.record(sampleMetrics);
      const allMetrics = memoryTracker.getAllMetrics();

      expect(allMetrics.length).toBe(1);
    });
  });
});

describe('createQualityTracker', () => {
  it('应该创建质量追踪器实例', () => {
    const tracker = createQualityTracker({ enablePersistence: false });
    expect(tracker).toBeInstanceOf(QualityTracker);
  });
});
