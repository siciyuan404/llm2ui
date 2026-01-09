# Quality 模块

质量追踪和指标计算模块，用于记录和分析 UI 生成质量。

## 目录结构

```
quality/
├── index.ts              # 模块导出入口
├── README.md             # 本文档
├── types.ts              # 类型定义
├── quality-tracker.ts    # 质量追踪器
├── quality-metrics.ts    # 质量指标计算器
└── quality-report.ts     # 质量报告生成器
```

## 功能模块

### 1. 质量追踪器 (Quality Tracker)

记录每次生成的质量指标。

```typescript
import { QualityTracker, createQualityTracker, getDefaultQualityTracker } from '@/lib/quality';

// 使用默认追踪器
const tracker = getDefaultQualityTracker();

// 记录生成指标
tracker.record({
  success: true,
  errorTypes: [],
  warningCount: 2,
  tokenCount: 500,
  generationTimeMs: 1200,
  qualityScores: {
    schemaComplexity: 45,
    componentCoverage: 30,
    tokenComplianceRate: 75,
    iconComplianceRate: 90,
  },
});

// 获取报告
const report = tracker.getReport();
console.log('Success rate:', report.successRate);
console.log('Recommendations:', report.recommendations);

// 导出数据
const json = tracker.export();
```

### 2. 质量指标计算器 (Quality Metrics Calculator)

计算 Schema 的质量指标。

```typescript
import { 
  calculateQualityScores,
  calculateSchemaComplexity,
  calculateComponentCoverage,
  calculateTokenComplianceRate,
  calculateIconComplianceRate,
} from '@/lib/quality';

const schema = {
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

// 计算所有指标
const scores = calculateQualityScores(schema);
console.log('Complexity:', scores.schemaComplexity);
console.log('Coverage:', scores.componentCoverage);
console.log('Token compliance:', scores.tokenComplianceRate);
console.log('Icon compliance:', scores.iconComplianceRate);

// 单独计算
const complexity = calculateSchemaComplexity(schema);
```

### 3. 质量报告生成器 (Quality Report)

生成格式化的质量报告。

```typescript
import { 
  formatReportAsText,
  formatReportAsMarkdown,
  formatScoresSummary,
  getTrendDirection,
  generateQualityBadge,
} from '@/lib/quality';

const report = tracker.getReport();

// 文本格式
const text = formatReportAsText(report);

// Markdown 格式
const markdown = formatReportAsMarkdown(report);

// 简短摘要
const summary = formatScoresSummary(report.averageQualityScores);
// 输出: "质量评分: B (75.0/100)"

// 趋势方向
const trend = getTrendDirection(report.qualityTrends);
// 输出: 'up' | 'down' | 'stable'

// 质量徽章
const badge = generateQualityBadge(report.averageQualityScores);
// 输出: ![Quality](https://img.shields.io/badge/quality-75%25-green)
```

## 类型定义

### QualityScores

```typescript
interface QualityScores {
  schemaComplexity: number;      // 0-100
  componentCoverage: number;     // 0-100
  tokenComplianceRate: number;   // 0-100
  iconComplianceRate: number;    // 0-100
}
```

### GenerationMetrics

```typescript
interface GenerationMetrics {
  id: string;
  timestamp: number;
  success: boolean;
  errorTypes: string[];
  warningCount: number;
  tokenCount: number;
  generationTimeMs: number;
  qualityScores: QualityScores;
  query?: string;
  model?: string;
}
```

### QualityReport

```typescript
interface QualityReport {
  timeRange: TimeRange;
  totalGenerations: number;
  successRate: number;
  errorDistribution: Record<string, number>;
  averageTokenUsage: number;
  averageGenerationTime: number;
  averageQualityScores: QualityScores;
  qualityTrends: QualityTrend[];
  recommendations: string[];
}
```

## 指标计算公式

### Schema 复杂度

```
complexity = min(100, componentCount * 2 + nestingDepth * 10 + uniqueTypes * 5)
```

### 组件覆盖率

```
coverage = (usedTypes / availableTypes) * 100
```

### Token 合规率

```
rate = (tokenValues / totalStyleValues) * 100
```

### Icon 合规率

```
rate = (iconComponents / (iconComponents + emojiCount)) * 100
```

## 存储

- 默认使用 localStorage 存储
- 键名: `llm2ui_quality_metrics`
- 保留期: 30 天
- 最大记录数: 1000 条
- localStorage 不可用时自动降级为内存存储

## 使用建议

1. **集成到生成流程**: 每次生成完成后记录指标
2. **定期查看报告**: 了解质量趋势和改进方向
3. **关注建议**: 根据系统建议优化提示词和案例
