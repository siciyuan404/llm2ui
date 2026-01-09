/**
 * @file diversity-filter.ts
 * @description 多样性过滤器模块，确保检索结果的多样性
 * @module lib/examples/diversity-filter
 * @requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */

// ExampleMetadata 从 shadcn 主题目录导入
import type { ExampleMetadata } from '../themes/builtin/shadcn/examples/presets';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 多样性过滤选项
 */
export interface DiversityFilterOptions {
  /** 多样性阈值，0-1，默认 0.3。阈值为 0 时禁用过滤 */
  diversityThreshold?: number;
  /** 分类权重，默认 0.4 */
  categoryWeight?: number;
  /** 标签权重，默认 0.4 */
  tagsWeight?: number;
  /** 结构权重，默认 0.2 */
  structureWeight?: number;
}

/**
 * 带分数的案例
 */
export interface ScoredExample {
  /** 案例元数据 */
  example: ExampleMetadata;
  /** 相关度分数 */
  score: number;
}

// ============================================================================
// 默认配置
// ============================================================================

const DEFAULT_OPTIONS: Required<DiversityFilterOptions> = {
  diversityThreshold: 0.3,
  categoryWeight: 0.4,
  tagsWeight: 0.4,
  structureWeight: 0.2,
};

// ============================================================================
// 多样性过滤器类
// ============================================================================

/**
 * 多样性过滤器
 * 使用贪心算法确保检索结果的多样性
 */
export class DiversityFilter {
  private options: Required<DiversityFilterOptions>;

  constructor(options?: DiversityFilterOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 过滤案例列表，确保多样性
   * @param examples 带分数的案例列表（已按相关度排序）
   * @param maxResults 最大返回数量
   * @returns 过滤后的案例列表
   */
  filter(examples: ScoredExample[], maxResults: number): ScoredExample[] {
    // 阈值为 0 时禁用过滤
    if (this.options.diversityThreshold === 0) {
      return examples.slice(0, maxResults);
    }

    if (examples.length <= 1) {
      return examples.slice(0, maxResults);
    }

    const result: ScoredExample[] = [];
    const remaining = [...examples];

    // 贪心算法：每次选择与已选案例相似度最低的案例
    while (result.length < maxResults && remaining.length > 0) {
      if (result.length === 0) {
        // 第一个案例直接选择分数最高的
        result.push(remaining.shift()!);
        continue;
      }

      // 找到与已选案例相似度最低的案例
      let bestIndex = 0;
      let bestDiversityScore = -1;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const maxSimilarity = this.getMaxSimilarityToSelected(candidate.example, result);
        
        // 多样性分数 = 1 - 最大相似度
        const diversityScore = 1 - maxSimilarity;
        
        // 如果相似度超过阈值（即多样性不足），跳过
        if (maxSimilarity > (1 - this.options.diversityThreshold)) {
          continue;
        }

        // 综合考虑相关度和多样性
        const combinedScore = candidate.score * 0.7 + diversityScore * 0.3;
        
        if (combinedScore > bestDiversityScore) {
          bestDiversityScore = combinedScore;
          bestIndex = i;
        }
      }

      // 如果找不到满足多样性要求的案例，选择剩余中分数最高的
      if (bestDiversityScore === -1) {
        result.push(remaining.shift()!);
      } else {
        result.push(remaining.splice(bestIndex, 1)[0]);
      }
    }

    return result;
  }

  /**
   * 计算两个案例之间的相似度
   * @param a 案例 A
   * @param b 案例 B
   * @returns 相似度分数，0-1
   */
  calculateSimilarity(a: ExampleMetadata, b: ExampleMetadata): number {
    const categorySimilarity = this.calculateCategorySimilarity(a, b);
    const tagsSimilarity = this.calculateTagOverlap(a.tags, b.tags);
    const structureSimilarity = this.calculateStructureSimilarity(a, b);

    return (
      categorySimilarity * this.options.categoryWeight +
      tagsSimilarity * this.options.tagsWeight +
      structureSimilarity * this.options.structureWeight
    );
  }

  /**
   * 计算标签重叠率
   * @param tagsA 标签列表 A
   * @param tagsB 标签列表 B
   * @returns 重叠率，0-1
   */
  calculateTagOverlap(tagsA: string[], tagsB: string[]): number {
    if (tagsA.length === 0 && tagsB.length === 0) {
      return 0;
    }

    const setA = new Set(tagsA.map(t => t.toLowerCase()));
    const setB = new Set(tagsB.map(t => t.toLowerCase()));

    let intersection = 0;
    for (const tag of setA) {
      if (setB.has(tag)) {
        intersection++;
      }
    }

    // Jaccard 相似度
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * 更新过滤选项
   */
  setOptions(options: DiversityFilterOptions): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 获取当前选项
   */
  getOptions(): Required<DiversityFilterOptions> {
    return { ...this.options };
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 计算分类相似度
   */
  private calculateCategorySimilarity(a: ExampleMetadata, b: ExampleMetadata): number {
    return a.category === b.category ? 1 : 0;
  }

  /**
   * 计算结构相似度（基于组件类型）
   */
  private calculateStructureSimilarity(a: ExampleMetadata, b: ExampleMetadata): number {
    const typesA = this.extractComponentTypes(a.schema);
    const typesB = this.extractComponentTypes(b.schema);

    if (typesA.size === 0 && typesB.size === 0) {
      return 0;
    }

    let intersection = 0;
    for (const type of typesA) {
      if (typesB.has(type)) {
        intersection++;
      }
    }

    const union = typesA.size + typesB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * 从 schema 中提取组件类型
   */
  private extractComponentTypes(schema: unknown): Set<string> {
    const types = new Set<string>();

    function traverse(node: unknown): void {
      if (!node || typeof node !== 'object') return;

      const obj = node as Record<string, unknown>;
      if (typeof obj.type === 'string') {
        types.add(obj.type);
      }

      if (Array.isArray(obj.children)) {
        for (const child of obj.children) {
          traverse(child);
        }
      }
    }

    if (schema && typeof schema === 'object') {
      const s = schema as Record<string, unknown>;
      if (s.root) {
        traverse(s.root);
      }
    }

    return types;
  }

  /**
   * 获取候选案例与已选案例的最大相似度
   */
  private getMaxSimilarityToSelected(
    candidate: ExampleMetadata,
    selected: ScoredExample[]
  ): number {
    let maxSimilarity = 0;

    for (const item of selected) {
      const similarity = this.calculateSimilarity(candidate, item.example);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }
    }

    return maxSimilarity;
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建多样性过滤器实例
 */
export function createDiversityFilter(options?: DiversityFilterOptions): DiversityFilter {
  return new DiversityFilter(options);
}
