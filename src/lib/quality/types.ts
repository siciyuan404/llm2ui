/**
 * @file types.ts
 * @description 质量追踪系统类型定义
 * @module lib/quality/types
 */

// ============================================================================
// 质量分数类型
// ============================================================================

/**
 * 质量分数
 */
export interface QualityScores {
  /** Schema 复杂度 (0-100) */
  schemaComplexity: number;
  /** 组件覆盖率 (0-100) */
  componentCoverage: number;
  /** Token 合规率 (0-100) */
  tokenComplianceRate: number;
  /** Icon 合规率 (0-100) */
  iconComplianceRate: number;
}

// ============================================================================
// 生成指标类型
// ============================================================================

/**
 * 生成指标
 */
export interface GenerationMetrics {
  /** 唯一 ID */
  id: string;
  /** 时间戳 */
  timestamp: number;
  /** 是否成功 */
  success: boolean;
  /** 错误类型列表 */
  errorTypes: string[];
  /** 警告数量 */
  warningCount: number;
  /** Token 数量 */
  tokenCount: number;
  /** 生成时间（毫秒） */
  generationTimeMs: number;
  /** 质量分数 */
  qualityScores: QualityScores;
  /** 用户查询（可选） */
  query?: string;
  /** 模型名称（可选） */
  model?: string;
}

// ============================================================================
// 质量报告类型
// ============================================================================

/**
 * 时间范围
 */
export interface TimeRange {
  /** 开始时间戳 */
  start: number;
  /** 结束时间戳 */
  end: number;
}

/**
 * 质量趋势
 */
export interface QualityTrend {
  /** 日期 */
  date: string;
  /** 成功率 */
  successRate: number;
  /** 平均质量分数 */
  averageQuality: number;
  /** 生成次数 */
  count: number;
}

/**
 * 质量报告
 */
export interface QualityReport {
  /** 时间范围 */
  timeRange: TimeRange;
  /** 总生成次数 */
  totalGenerations: number;
  /** 成功率 */
  successRate: number;
  /** 错误分布 */
  errorDistribution: Record<string, number>;
  /** 平均 Token 使用量 */
  averageTokenUsage: number;
  /** 平均生成时间 */
  averageGenerationTime: number;
  /** 平均质量分数 */
  averageQualityScores: QualityScores;
  /** 质量趋势 */
  qualityTrends: QualityTrend[];
  /** 改进建议 */
  recommendations: string[];
}

// ============================================================================
// 存储类型
// ============================================================================

/**
 * 存储的指标数据
 */
export interface StoredMetrics {
  /** 版本 */
  version: '1.0';
  /** 指标列表 */
  metrics: GenerationMetrics[];
  /** 上次清理时间 */
  lastCleanup: number;
}

// ============================================================================
// 追踪器选项
// ============================================================================

/**
 * 质量追踪器选项
 */
export interface QualityTrackerOptions {
  /** 存储键名 */
  storageKey?: string;
  /** 保留天数 */
  retentionDays?: number;
  /** 最大记录数 */
  maxRecords?: number;
  /** 是否启用持久化 */
  enablePersistence?: boolean;
}
