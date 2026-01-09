/**
 * @file 案例注册中心
 * @description 单例模式管理所有 UI 案例
 * @module lib/examples/example-registry
 */

import type { Example, ExampleCategory } from '../../types/example.types';
import type { ValidationResult } from './example-validator';
import { ExampleValidator } from './example-validator';

/**
 * 带质量评分的案例元数据
 */
export interface ExampleWithScore extends Example {
  /** 质量评分 */
  qualityScore: number;
}

/**
 * 案例集合接口
 */
export interface ExampleCollection {
  /** 集合名称 */
  name: string;
  /** 集合描述 */
  description: string;
  /** 案例列表 */
  examples: Example[];
}

/**
 * 注册错误
 */
export class RegistrationError extends Error {
  readonly validationResult: ValidationResult;
  
  constructor(
    message: string,
    validationResult: ValidationResult
  ) {
    super(message);
    this.name = 'RegistrationError';
    this.validationResult = validationResult;
  }
}

/**
 * 案例注册中心
 * 
 * 单例模式管理所有 UI 案例
 */
export class ExampleRegistry {
  private static instance: ExampleRegistry | null = null;
  private examples: Map<string, ExampleWithScore> = new Map();
  private validator: ExampleValidator;

  private constructor() {
    this.validator = new ExampleValidator();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ExampleRegistry {
    if (!ExampleRegistry.instance) {
      ExampleRegistry.instance = new ExampleRegistry();
    }
    return ExampleRegistry.instance;
  }

  /**
   * 重置单例（仅用于测试）
   */
  static resetInstance(): void {
    ExampleRegistry.instance = null;
  }

  /**
   * 注册单个案例
   * @throws RegistrationError 如果验证失败
   */
  register(example: Example): void {
    const result = this.validator.validate(example);
    
    if (!result.valid) {
      const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join('; ');
      throw new RegistrationError(
        `Validation failed for example "${example.id}": ${errorMessages}`,
        result
      );
    }

    // 检查重复 ID
    if (this.examples.has(example.id)) {
      throw new RegistrationError(
        `Example with ID "${example.id}" already exists`,
        {
          valid: false,
          errors: [{
            field: 'id',
            message: `Duplicate ID: ${example.id}`,
            code: 'DUPLICATE_ID',
          }],
        }
      );
    }

    const exampleWithScore: ExampleWithScore = {
      ...example,
      qualityScore: result.qualityScore!,
    };

    this.examples.set(example.id, exampleWithScore);
  }

  /**
   * 批量注册案例集合
   * @throws RegistrationError 如果任何案例验证失败
   */
  registerCollection(collection: ExampleCollection): void {
    // 先验证所有案例
    const validationResults: { example: Example; result: ValidationResult }[] = [];
    
    for (const example of collection.examples) {
      const result = this.validator.validate(example);
      validationResults.push({ example, result });
    }

    // 检查是否有验证失败
    const failures = validationResults.filter(v => !v.result.valid);
    if (failures.length > 0) {
      const firstFailure = failures[0];
      const errorMessages = firstFailure.result.errors.map(e => `${e.field}: ${e.message}`).join('; ');
      throw new RegistrationError(
        `Validation failed for example "${firstFailure.example.id}" in collection "${collection.name}": ${errorMessages}`,
        firstFailure.result
      );
    }

    // 注册所有案例
    for (const { example, result } of validationResults) {
      if (!this.examples.has(example.id)) {
        const exampleWithScore: ExampleWithScore = {
          ...example,
          qualityScore: result.qualityScore!,
        };
        this.examples.set(example.id, exampleWithScore);
      }
    }
  }

  /**
   * 获取所有案例
   */
  getAll(): ExampleWithScore[] {
    return Array.from(this.examples.values());
  }

  /**
   * 根据 ID 获取案例
   */
  getById(id: string): ExampleWithScore | undefined {
    return this.examples.get(id);
  }

  /**
   * 根据分类获取案例
   */
  getByCategory(category: ExampleCategory): ExampleWithScore[] {
    return this.getAll().filter(e => e.category === category);
  }

  /**
   * 根据标签获取案例
   */
  getByTags(tags: string[]): ExampleWithScore[] {
    if (tags.length === 0) return [];
    
    return this.getAll().filter(example => 
      tags.some(tag => example.tags.includes(tag))
    );
  }

  /**
   * 获取质量评分最高的 N 个案例
   */
  getTopExamples(n: number): ExampleWithScore[] {
    return this.getAll()
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, n);
  }

  /**
   * 根据来源获取案例
   */
  getBySource(source: 'system' | 'custom'): ExampleWithScore[] {
    return this.getAll().filter(e => e.source === source);
  }

  /**
   * 搜索案例
   */
  search(query: string): ExampleWithScore[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(example => 
      example.title.toLowerCase().includes(lowerQuery) ||
      example.description.toLowerCase().includes(lowerQuery) ||
      example.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 检查案例是否存在
   */
  has(id: string): boolean {
    return this.examples.has(id);
  }

  /**
   * 获取案例数量
   */
  size(): number {
    return this.examples.size;
  }

  /**
   * 清空注册表（用于测试）
   */
  clear(): void {
    this.examples.clear();
  }

  /**
   * 删除案例
   */
  remove(id: string): boolean {
    return this.examples.delete(id);
  }

  /**
   * 获取所有分类
   */
  getCategories(): ExampleCategory[] {
    const categories = new Set<ExampleCategory>();
    for (const example of this.examples.values()) {
      categories.add(example.category);
    }
    return Array.from(categories);
  }

  /**
   * 获取所有标签
   */
  getAllTags(): string[] {
    const tags = new Set<string>();
    for (const example of this.examples.values()) {
      for (const tag of example.tags) {
        tags.add(tag);
      }
    }
    return Array.from(tags);
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    byCategory: Record<ExampleCategory, number>;
    bySource: Record<'system' | 'custom', number>;
    averageQualityScore: number;
  } {
    const all = this.getAll();
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = { system: 0, custom: 0 };
    let totalScore = 0;

    for (const example of all) {
      byCategory[example.category] = (byCategory[example.category] || 0) + 1;
      bySource[example.source] = (bySource[example.source] || 0) + 1;
      totalScore += example.qualityScore;
    }

    return {
      total: all.length,
      byCategory: byCategory as Record<ExampleCategory, number>,
      bySource: bySource as Record<'system' | 'custom', number>,
      averageQualityScore: all.length > 0 ? totalScore / all.length : 0,
    };
  }
}

// 导出单例获取函数
export function getExampleRegistry(): ExampleRegistry {
  return ExampleRegistry.getInstance();
}
