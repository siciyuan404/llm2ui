/**
 * @file quality-metrics.ts
 * @description 质量指标计算器
 * @module lib/quality/quality-metrics
 * @requirements REQ-8.1, REQ-8.2, REQ-8.3, REQ-8.4, REQ-8.5
 */

import type { UISchema, UIComponent } from '@/types/ui-schema';
import type { QualityScores } from './types';
import { detectEmojis } from '../design-system/emoji-validator';
import { defaultCatalog } from '../core/component-catalog';

// ============================================================================
// 常量
// ============================================================================

/** 设计 Token 模式 */
const TOKEN_PATTERNS = [
  // Tailwind 颜色 Token
  /^(bg|text|border|ring|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-\d+)?$/,
  // Tailwind 间距 Token
  /^(p|m|gap|space)-(x|y|t|r|b|l)?-?\d+$/,
  // Tailwind 尺寸 Token
  /^(w|h|min-w|min-h|max-w|max-h)-(full|screen|auto|\d+|px)$/,
  // Tailwind 字体 Token
  /^(text|font)-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
  // Tailwind 圆角 Token
  /^rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/,
  // Tailwind flex/grid Token
  /^(flex|grid|items|justify|content|self)-(start|end|center|between|around|evenly|stretch)$/,
];

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 遍历组件树
 */
function traverseComponents(
  component: UIComponent,
  callback: (component: UIComponent, depth: number) => void,
  depth: number = 0
): void {
  callback(component, depth);
  
  if (component.children) {
    for (const child of component.children) {
      if (typeof child === 'object' && child !== null) {
        traverseComponents(child as UIComponent, callback, depth + 1);
      }
    }
  }
}

/**
 * 检查值是否是 Token
 */
function isToken(value: string): boolean {
  // 检查是否匹配任何 Token 模式
  return TOKEN_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * 从 className 中提取类名
 */
function extractClassNames(className: string): string[] {
  return className.split(/\s+/).filter(c => c.length > 0);
}

// ============================================================================
// Quality Metrics Calculator 类
// ============================================================================

/**
 * 质量指标计算器
 */
export class QualityMetricsCalculator {
  /**
   * 计算 Schema 复杂度 (0-100)
   * 公式: min(100, componentCount * 2 + nestingDepth * 10 + uniqueTypes * 5)
   */
  calculateSchemaComplexity(schema: UISchema): number {
    if (!schema || !schema.root) {
      return 0;
    }

    let componentCount = 0;
    let maxDepth = 0;
    const uniqueTypes = new Set<string>();

    traverseComponents(schema.root, (component, depth) => {
      componentCount++;
      maxDepth = Math.max(maxDepth, depth);
      if (component.type) {
        uniqueTypes.add(component.type);
      }
    });

    const complexity = componentCount * 2 + maxDepth * 10 + uniqueTypes.size * 5;
    return Math.min(100, complexity);
  }

  /**
   * 计算组件覆盖率 (0-100)
   * 公式: (usedTypes / availableTypes) * 100
   */
  calculateComponentCoverage(schema: UISchema): number {
    if (!schema || !schema.root) {
      return 0;
    }

    const usedTypes = new Set<string>();
    traverseComponents(schema.root, (component) => {
      if (component.type) {
        usedTypes.add(component.type);
      }
    });

    const availableTypes = defaultCatalog.getValidTypes();
    if (availableTypes.length === 0) {
      return 0;
    }

    const coverage = (usedTypes.size / availableTypes.length) * 100;
    return Math.min(100, coverage);
  }

  /**
   * 计算 Token 合规率 (0-100)
   * 公式: (tokenValues / totalStyleValues) * 100
   */
  calculateTokenComplianceRate(schema: UISchema): number {
    if (!schema || !schema.root) {
      return 100; // 没有样式值时默认 100%
    }

    let totalStyleValues = 0;
    let tokenValues = 0;

    traverseComponents(schema.root, (component) => {
      if (component.props) {
        // 检查 className
        if (typeof component.props.className === 'string') {
          const classNames = extractClassNames(component.props.className);
          for (const className of classNames) {
            totalStyleValues++;
            if (isToken(className)) {
              tokenValues++;
            }
          }
        }

        // 检查 style 对象
        if (typeof component.props.style === 'object' && component.props.style !== null) {
          const style = component.props.style as Record<string, unknown>;
          for (const value of Object.values(style)) {
            if (typeof value === 'string') {
              totalStyleValues++;
              // 内联样式通常不是 Token
            }
          }
        }
      }
    });

    if (totalStyleValues === 0) {
      return 100;
    }

    return (tokenValues / totalStyleValues) * 100;
  }

  /**
   * 计算 Icon 合规率 (0-100)
   * 公式: (iconComponents / (iconComponents + emojiCount)) * 100
   */
  calculateIconComplianceRate(schema: UISchema): number {
    if (!schema || !schema.root) {
      return 100;
    }

    let iconComponents = 0;
    let emojiCount = 0;

    traverseComponents(schema.root, (component) => {
      // 统计 Icon 组件
      if (component.type === 'Icon') {
        iconComponents++;
      }

      // 统计 emoji
      if (component.props) {
        for (const value of Object.values(component.props)) {
          if (typeof value === 'string') {
            emojiCount += detectEmojis(value).length;
          }
        }
      }

      if (component.children) {
        for (const child of component.children) {
          if (typeof child === 'string') {
            emojiCount += detectEmojis(child).length;
          }
        }
      }
    });

    const total = iconComponents + emojiCount;
    if (total === 0) {
      return 100;
    }

    return (iconComponents / total) * 100;
  }

  /**
   * 计算所有质量指标
   */
  calculateAll(schema: UISchema): QualityScores {
    return {
      schemaComplexity: this.calculateSchemaComplexity(schema),
      componentCoverage: this.calculateComponentCoverage(schema),
      tokenComplianceRate: this.calculateTokenComplianceRate(schema),
      iconComplianceRate: this.calculateIconComplianceRate(schema),
    };
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建质量指标计算器实例
 */
export function createQualityMetricsCalculator(): QualityMetricsCalculator {
  return new QualityMetricsCalculator();
}

/** 默认计算器实例 */
const defaultCalculator = new QualityMetricsCalculator();

/**
 * 计算 Schema 复杂度（便捷函数）
 */
export function calculateSchemaComplexity(schema: UISchema): number {
  return defaultCalculator.calculateSchemaComplexity(schema);
}

/**
 * 计算组件覆盖率（便捷函数）
 */
export function calculateComponentCoverage(schema: UISchema): number {
  return defaultCalculator.calculateComponentCoverage(schema);
}

/**
 * 计算 Token 合规率（便捷函数）
 */
export function calculateTokenComplianceRate(schema: UISchema): number {
  return defaultCalculator.calculateTokenComplianceRate(schema);
}

/**
 * 计算 Icon 合规率（便捷函数）
 */
export function calculateIconComplianceRate(schema: UISchema): number {
  return defaultCalculator.calculateIconComplianceRate(schema);
}

/**
 * 计算所有质量指标（便捷函数）
 */
export function calculateQualityScores(schema: UISchema): QualityScores {
  return defaultCalculator.calculateAll(schema);
}
