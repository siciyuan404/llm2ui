/**
 * @file quality-report.ts
 * @description 质量报告生成器
 * @module lib/quality/quality-report
 * @requirements REQ-8.6
 */

import type { QualityReport, QualityScores, QualityTrend } from './types';

// ============================================================================
// 报告格式化
// ============================================================================

/**
 * 格式化质量报告为文本
 */
export function formatReportAsText(report: QualityReport): string {
  const lines: string[] = [];

  // 标题
  lines.push('='.repeat(60));
  lines.push('质量报告');
  lines.push('='.repeat(60));
  lines.push('');

  // 时间范围
  const startDate = new Date(report.timeRange.start).toLocaleDateString();
  const endDate = new Date(report.timeRange.end).toLocaleDateString();
  lines.push(`时间范围: ${startDate} - ${endDate}`);
  lines.push('');

  // 概览
  lines.push('## 概览');
  lines.push(`- 总生成次数: ${report.totalGenerations}`);
  lines.push(`- 成功率: ${(report.successRate * 100).toFixed(1)}%`);
  lines.push(`- 平均 Token 使用: ${report.averageTokenUsage.toFixed(0)}`);
  lines.push(`- 平均生成时间: ${report.averageGenerationTime.toFixed(0)}ms`);
  lines.push('');

  // 质量分数
  lines.push('## 平均质量分数');
  lines.push(`- Schema 复杂度: ${report.averageQualityScores.schemaComplexity.toFixed(1)}`);
  lines.push(`- 组件覆盖率: ${report.averageQualityScores.componentCoverage.toFixed(1)}%`);
  lines.push(`- Token 合规率: ${report.averageQualityScores.tokenComplianceRate.toFixed(1)}%`);
  lines.push(`- Icon 合规率: ${report.averageQualityScores.iconComplianceRate.toFixed(1)}%`);
  lines.push('');

  // 错误分布
  if (Object.keys(report.errorDistribution).length > 0) {
    lines.push('## 错误分布');
    const sortedErrors = Object.entries(report.errorDistribution)
      .sort((a, b) => b[1] - a[1]);
    for (const [errorType, count] of sortedErrors) {
      lines.push(`- ${errorType}: ${count} 次`);
    }
    lines.push('');
  }

  // 建议
  if (report.recommendations.length > 0) {
    lines.push('## 改进建议');
    for (const recommendation of report.recommendations) {
      lines.push(`- ${recommendation}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 格式化质量报告为 Markdown
 */
export function formatReportAsMarkdown(report: QualityReport): string {
  const lines: string[] = [];

  // 标题
  lines.push('# 质量报告');
  lines.push('');

  // 时间范围
  const startDate = new Date(report.timeRange.start).toLocaleDateString();
  const endDate = new Date(report.timeRange.end).toLocaleDateString();
  lines.push(`**时间范围:** ${startDate} - ${endDate}`);
  lines.push('');

  // 概览表格
  lines.push('## 概览');
  lines.push('');
  lines.push('| 指标 | 值 |');
  lines.push('|------|-----|');
  lines.push(`| 总生成次数 | ${report.totalGenerations} |`);
  lines.push(`| 成功率 | ${(report.successRate * 100).toFixed(1)}% |`);
  lines.push(`| 平均 Token 使用 | ${report.averageTokenUsage.toFixed(0)} |`);
  lines.push(`| 平均生成时间 | ${report.averageGenerationTime.toFixed(0)}ms |`);
  lines.push('');

  // 质量分数表格
  lines.push('## 质量分数');
  lines.push('');
  lines.push('| 指标 | 分数 |');
  lines.push('|------|------|');
  lines.push(`| Schema 复杂度 | ${report.averageQualityScores.schemaComplexity.toFixed(1)} |`);
  lines.push(`| 组件覆盖率 | ${report.averageQualityScores.componentCoverage.toFixed(1)}% |`);
  lines.push(`| Token 合规率 | ${report.averageQualityScores.tokenComplianceRate.toFixed(1)}% |`);
  lines.push(`| Icon 合规率 | ${report.averageQualityScores.iconComplianceRate.toFixed(1)}% |`);
  lines.push('');

  // 错误分布
  if (Object.keys(report.errorDistribution).length > 0) {
    lines.push('## 错误分布');
    lines.push('');
    lines.push('| 错误类型 | 次数 |');
    lines.push('|----------|------|');
    const sortedErrors = Object.entries(report.errorDistribution)
      .sort((a, b) => b[1] - a[1]);
    for (const [errorType, count] of sortedErrors) {
      lines.push(`| ${errorType} | ${count} |`);
    }
    lines.push('');
  }

  // 趋势
  if (report.qualityTrends.length > 0) {
    lines.push('## 质量趋势');
    lines.push('');
    lines.push('| 日期 | 成功率 | 平均质量 | 生成次数 |');
    lines.push('|------|--------|----------|----------|');
    for (const trend of report.qualityTrends.slice(-7)) { // 最近 7 天
      lines.push(`| ${trend.date} | ${(trend.successRate * 100).toFixed(0)}% | ${trend.averageQuality.toFixed(1)} | ${trend.count} |`);
    }
    lines.push('');
  }

  // 建议
  if (report.recommendations.length > 0) {
    lines.push('## 改进建议');
    lines.push('');
    for (const recommendation of report.recommendations) {
      lines.push(`- ${recommendation}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 格式化质量分数为简短摘要
 */
export function formatScoresSummary(scores: QualityScores): string {
  const avgScore = (
    scores.schemaComplexity +
    scores.componentCoverage +
    scores.tokenComplianceRate +
    scores.iconComplianceRate
  ) / 4;

  let grade: string;
  if (avgScore >= 90) grade = 'A';
  else if (avgScore >= 80) grade = 'B';
  else if (avgScore >= 70) grade = 'C';
  else if (avgScore >= 60) grade = 'D';
  else grade = 'F';

  return `质量评分: ${grade} (${avgScore.toFixed(1)}/100)`;
}

/**
 * 获取质量趋势方向
 */
export function getTrendDirection(trends: QualityTrend[]): 'up' | 'down' | 'stable' {
  if (trends.length < 2) return 'stable';

  const recent = trends.slice(-3);
  if (recent.length < 2) return 'stable';

  const first = recent[0].averageQuality;
  const last = recent[recent.length - 1].averageQuality;
  const diff = last - first;

  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}

/**
 * 生成质量徽章
 */
export function generateQualityBadge(scores: QualityScores): string {
  const avgScore = (
    scores.schemaComplexity +
    scores.componentCoverage +
    scores.tokenComplianceRate +
    scores.iconComplianceRate
  ) / 4;

  let color: string;
  if (avgScore >= 90) color = 'brightgreen';
  else if (avgScore >= 80) color = 'green';
  else if (avgScore >= 70) color = 'yellow';
  else if (avgScore >= 60) color = 'orange';
  else color = 'red';

  return `![Quality](https://img.shields.io/badge/quality-${avgScore.toFixed(0)}%25-${color})`;
}
