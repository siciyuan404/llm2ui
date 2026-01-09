/**
 * @file quality-tracker.ts
 * @description 质量追踪器，记录和分析生成质量指标
 * @module lib/quality/quality-tracker
 * @requirements REQ-7.1, REQ-7.2, REQ-7.3, REQ-7.4, REQ-7.5, REQ-7.6
 */

import type {
  GenerationMetrics,
  QualityReport,
  QualityScores,
  QualityTrend,
  TimeRange,
  StoredMetrics,
  QualityTrackerOptions,
} from './types';

// ============================================================================
// 常量
// ============================================================================

/** 默认存储键名 */
const DEFAULT_STORAGE_KEY = 'llm2ui_quality_metrics';

/** 默认保留天数 */
const DEFAULT_RETENTION_DAYS = 30;

/** 默认最大记录数 */
const DEFAULT_MAX_RECORDS = 1000;

/** 一天的毫秒数 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

/**
 * 计算平均值
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * 检查 localStorage 是否可用
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Quality Tracker 类
// ============================================================================

/**
 * 质量追踪器
 */
export class QualityTracker {
  private storageKey: string;
  private retentionDays: number;
  private maxRecords: number;
  private enablePersistence: boolean;
  private memoryStorage: GenerationMetrics[] = [];

  constructor(options: QualityTrackerOptions = {}) {
    this.storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
    this.retentionDays = options.retentionDays ?? DEFAULT_RETENTION_DAYS;
    this.maxRecords = options.maxRecords ?? DEFAULT_MAX_RECORDS;
    this.enablePersistence = options.enablePersistence ?? isLocalStorageAvailable();

    // 初始化时清理过期数据
    this.cleanup();
  }

  /**
   * 记录生成指标
   */
  record(metrics: Omit<GenerationMetrics, 'id' | 'timestamp'>): GenerationMetrics {
    const fullMetrics: GenerationMetrics = {
      ...metrics,
      id: generateId(),
      timestamp: Date.now(),
    };

    const allMetrics = this.loadMetrics();
    allMetrics.push(fullMetrics);

    // 限制记录数量
    if (allMetrics.length > this.maxRecords) {
      allMetrics.splice(0, allMetrics.length - this.maxRecords);
    }

    this.saveMetrics(allMetrics);
    return fullMetrics;
  }

  /**
   * 获取质量报告
   */
  getReport(timeRange?: TimeRange): QualityReport {
    const allMetrics = this.loadMetrics();
    
    // 过滤时间范围
    const now = Date.now();
    const range: TimeRange = timeRange ?? {
      start: now - this.retentionDays * MS_PER_DAY,
      end: now,
    };

    const filteredMetrics = allMetrics.filter(
      m => m.timestamp >= range.start && m.timestamp <= range.end
    );

    // 计算统计数据
    const totalGenerations = filteredMetrics.length;
    const successCount = filteredMetrics.filter(m => m.success).length;
    const successRate = totalGenerations > 0 ? successCount / totalGenerations : 0;

    // 错误分布
    const errorDistribution: Record<string, number> = {};
    for (const metrics of filteredMetrics) {
      for (const errorType of metrics.errorTypes) {
        errorDistribution[errorType] = (errorDistribution[errorType] || 0) + 1;
      }
    }

    // 平均值计算
    const averageTokenUsage = average(filteredMetrics.map(m => m.tokenCount));
    const averageGenerationTime = average(filteredMetrics.map(m => m.generationTimeMs));

    // 平均质量分数
    const averageQualityScores: QualityScores = {
      schemaComplexity: average(filteredMetrics.map(m => m.qualityScores.schemaComplexity)),
      componentCoverage: average(filteredMetrics.map(m => m.qualityScores.componentCoverage)),
      tokenComplianceRate: average(filteredMetrics.map(m => m.qualityScores.tokenComplianceRate)),
      iconComplianceRate: average(filteredMetrics.map(m => m.qualityScores.iconComplianceRate)),
    };

    // 质量趋势（按天分组）
    const qualityTrends = this.calculateTrends(filteredMetrics);

    // 生成建议
    const recommendations = this.generateRecommendations(
      filteredMetrics,
      errorDistribution,
      averageQualityScores
    );

    return {
      timeRange: range,
      totalGenerations,
      successRate,
      errorDistribution,
      averageTokenUsage,
      averageGenerationTime,
      averageQualityScores,
      qualityTrends,
      recommendations,
    };
  }

  /**
   * 获取改进建议
   */
  getRecommendations(): string[] {
    const report = this.getReport();
    return report.recommendations;
  }

  /**
   * 导出指标为 JSON
   */
  export(): string {
    const metrics = this.loadMetrics();
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      metrics,
    }, null, 2);
  }

  /**
   * 清除所有数据
   */
  clear(): void {
    this.memoryStorage = [];
    if (this.enablePersistence) {
      try {
        localStorage.removeItem(this.storageKey);
      } catch {
        // 忽略错误
      }
    }
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): GenerationMetrics[] {
    return this.loadMetrics();
  }

  /**
   * 清理过期数据
   */
  private cleanup(): void {
    const allMetrics = this.loadMetrics();
    const cutoff = Date.now() - this.retentionDays * MS_PER_DAY;
    const validMetrics = allMetrics.filter(m => m.timestamp >= cutoff);

    if (validMetrics.length !== allMetrics.length) {
      this.saveMetrics(validMetrics);
    }
  }

  /**
   * 加载指标
   */
  private loadMetrics(): GenerationMetrics[] {
    if (!this.enablePersistence) {
      return [...this.memoryStorage];
    }

    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const stored: StoredMetrics = JSON.parse(data);
      return stored.metrics || [];
    } catch {
      return [...this.memoryStorage];
    }
  }

  /**
   * 保存指标
   */
  private saveMetrics(metrics: GenerationMetrics[]): void {
    this.memoryStorage = [...metrics];

    if (!this.enablePersistence) return;

    try {
      const stored: StoredMetrics = {
        version: '1.0',
        metrics,
        lastCleanup: Date.now(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(stored));
    } catch {
      // 存储失败，降级为内存存储
      this.enablePersistence = false;
    }
  }

  /**
   * 计算质量趋势
   */
  private calculateTrends(metrics: GenerationMetrics[]): QualityTrend[] {
    // 按天分组
    const byDate = new Map<string, GenerationMetrics[]>();
    for (const m of metrics) {
      const date = formatDate(m.timestamp);
      if (!byDate.has(date)) {
        byDate.set(date, []);
      }
      byDate.get(date)!.push(m);
    }

    // 计算每天的趋势
    const trends: QualityTrend[] = [];
    for (const [date, dayMetrics] of byDate) {
      const successCount = dayMetrics.filter(m => m.success).length;
      const successRate = dayMetrics.length > 0 ? successCount / dayMetrics.length : 0;
      
      // 计算平均质量分数
      const avgQuality = average(
        dayMetrics.map(m => 
          (m.qualityScores.schemaComplexity +
           m.qualityScores.componentCoverage +
           m.qualityScores.tokenComplianceRate +
           m.qualityScores.iconComplianceRate) / 4
        )
      );

      trends.push({
        date,
        successRate,
        averageQuality: avgQuality,
        count: dayMetrics.length,
      });
    }

    // 按日期排序
    trends.sort((a, b) => a.date.localeCompare(b.date));
    return trends;
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(
    metrics: GenerationMetrics[],
    errorDistribution: Record<string, number>,
    avgScores: QualityScores
  ): string[] {
    const recommendations: string[] = [];

    // 基于成功率
    const successRate = metrics.length > 0
      ? metrics.filter(m => m.success).length / metrics.length
      : 1;
    
    if (successRate < 0.8) {
      recommendations.push('成功率低于 80%，建议检查常见错误类型并优化提示词');
    }

    // 基于错误分布
    const sortedErrors = Object.entries(errorDistribution)
      .sort((a, b) => b[1] - a[1]);
    
    if (sortedErrors.length > 0) {
      const topError = sortedErrors[0];
      recommendations.push(`最常见错误类型是 "${topError[0]}"（${topError[1]} 次），建议针对性优化`);
    }

    // 基于质量分数
    if (avgScores.iconComplianceRate < 80) {
      recommendations.push('Icon 合规率较低，建议在提示词中强调使用 Icon 组件而非 emoji');
    }

    if (avgScores.tokenComplianceRate < 70) {
      recommendations.push('Token 合规率较低，建议使用设计系统的 Token 值');
    }

    if (avgScores.componentCoverage < 50) {
      recommendations.push('组件覆盖率较低，建议在案例中展示更多组件类型');
    }

    // 基于 Token 使用
    const avgTokens = average(metrics.map(m => m.tokenCount));
    if (avgTokens > 2000) {
      recommendations.push('平均 Token 使用量较高，建议优化提示词长度');
    }

    return recommendations;
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建质量追踪器实例
 */
export function createQualityTracker(
  options?: QualityTrackerOptions
): QualityTracker {
  return new QualityTracker(options);
}

/** 默认质量追踪器实例 */
let defaultTracker: QualityTracker | null = null;

/**
 * 获取默认质量追踪器
 */
export function getDefaultQualityTracker(): QualityTracker {
  if (!defaultTracker) {
    defaultTracker = new QualityTracker();
  }
  return defaultTracker;
}
