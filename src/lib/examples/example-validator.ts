/**
 * @file 案例验证器
 * @description 验证案例的有效性和质量
 * @module lib/examples/example-validator
 */

import type { Example, ExampleCategory, ExampleSource } from '../../types/example.types';
import type { UISchema, UIComponent } from '../../types/ui-schema';

/**
 * 验证错误
 */
export interface ValidationError {
  /** 错误字段 */
  field: string;
  /** 错误消息 */
  message: string;
  /** 错误代码 */
  code: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误列表 */
  errors: ValidationError[];
  /** 质量评分 (0-100) */
  qualityScore?: number;
}

/**
 * 质量评分分解
 */
export interface QualityScoreBreakdown {
  /** Schema 复杂度得分 (0-30) */
  schemaComplexity: number;
  /** 文档完整度得分 (0-30) */
  documentationCompleteness: number;
  /** 标签覆盖度得分 (0-20) */
  tagCoverage: number;
  /** 命名规范得分 (0-20) */
  namingConvention: number;
  /** 总分 (0-100) */
  total: number;
}

/**
 * 有效的分类列表
 */
const VALID_CATEGORIES: ExampleCategory[] = [
  'layout', 'form', 'navigation', 'dashboard', 'display', 'feedback'
];

/**
 * 有效的来源列表
 */
const VALID_SOURCES: ExampleSource[] = ['system', 'custom'];

/**
 * ID 格式正则表达式: {source}-{category}-{name}
 */
const ID_PATTERN = /^(system|custom)-[a-z]+-[a-z0-9-]+$/;

/**
 * 案例验证器
 * 
 * 验证案例的有效性和计算质量评分
 */
export class ExampleValidator {
  /**
   * 验证案例
   */
  validate(example: Example): ValidationResult {
    const errors: ValidationError[] = [];

    // 验证 ID
    if (!example.id) {
      errors.push({
        field: 'id',
        message: 'ID is required',
        code: 'MISSING_REQUIRED_FIELD',
      });
    } else if (!this.validateId(example.id)) {
      errors.push({
        field: 'id',
        message: 'ID must follow format: {source}-{category}-{name}',
        code: 'INVALID_ID_FORMAT',
      });
    }

    // 验证必填字段
    if (!example.title) {
      errors.push({
        field: 'title',
        message: 'Title is required',
        code: 'MISSING_REQUIRED_FIELD',
      });
    }

    if (!example.description) {
      errors.push({
        field: 'description',
        message: 'Description is required',
        code: 'MISSING_REQUIRED_FIELD',
      });
    }

    if (!example.category) {
      errors.push({
        field: 'category',
        message: 'Category is required',
        code: 'MISSING_REQUIRED_FIELD',
      });
    } else if (!VALID_CATEGORIES.includes(example.category)) {
      errors.push({
        field: 'category',
        message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        code: 'INVALID_CATEGORY',
      });
    }

    if (!example.source) {
      errors.push({
        field: 'source',
        message: 'Source is required',
        code: 'MISSING_REQUIRED_FIELD',
      });
    } else if (!VALID_SOURCES.includes(example.source)) {
      errors.push({
        field: 'source',
        message: `Source must be one of: ${VALID_SOURCES.join(', ')}`,
        code: 'INVALID_SOURCE',
      });
    }

    // 验证标签
    if (!example.tags || !Array.isArray(example.tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array',
        code: 'INVALID_TAGS',
      });
    } else if (example.tags.length === 0) {
      errors.push({
        field: 'tags',
        message: 'Tags array must not be empty',
        code: 'EMPTY_TAGS',
      });
    } else {
      const invalidTags = example.tags.filter(tag => typeof tag !== 'string' || tag.trim() === '');
      if (invalidTags.length > 0) {
        errors.push({
          field: 'tags',
          message: 'All tags must be non-empty strings',
          code: 'INVALID_TAG_VALUE',
        });
      }
    }

    // 验证 Schema
    if (!example.schema) {
      errors.push({
        field: 'schema',
        message: 'Schema is required',
        code: 'MISSING_REQUIRED_FIELD',
      });
    } else {
      const schemaErrors = this.validateSchema(example.schema);
      errors.push(...schemaErrors);
    }

    const valid = errors.length === 0;
    const qualityScore = valid ? this.calculateQualityScore(example).total : undefined;

    return { valid, errors, qualityScore };
  }

  /**
   * 验证 ID 格式: {source}-{category}-{name}
   */
  validateId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    
    // 更宽松的验证：检查基本格式
    const parts = id.split('-');
    if (parts.length < 3) return false;
    
    const source = parts[0];
    if (!VALID_SOURCES.includes(source as ExampleSource)) return false;
    
    return true;
  }

  /**
   * 验证 Schema 结构
   */
  validateSchema(schema: UISchema): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!schema.version) {
      errors.push({
        field: 'schema.version',
        message: 'Schema version is required',
        code: 'INVALID_SCHEMA',
      });
    }

    if (!schema.root) {
      errors.push({
        field: 'schema.root',
        message: 'Schema root is required',
        code: 'INVALID_SCHEMA',
      });
    } else {
      // 验证 root 组件
      if (!schema.root.id) {
        errors.push({
          field: 'schema.root.id',
          message: 'Root component id is required',
          code: 'INVALID_SCHEMA',
        });
      }

      if (!schema.root.type) {
        errors.push({
          field: 'schema.root.type',
          message: 'Root component type is required',
          code: 'INVALID_SCHEMA',
        });
      }
    }

    return errors;
  }

  /**
   * 计算质量评分
   */
  calculateQualityScore(example: Example): QualityScoreBreakdown {
    const schemaComplexity = this.calculateSchemaComplexityScore(example.schema);
    const documentationCompleteness = this.calculateDocumentationScore(example);
    const tagCoverage = this.calculateTagCoverageScore(example.tags);
    const namingConvention = this.calculateNamingScore(example);

    const total = schemaComplexity + documentationCompleteness + tagCoverage + namingConvention;

    return {
      schemaComplexity,
      documentationCompleteness,
      tagCoverage,
      namingConvention,
      total,
    };
  }

  /**
   * 计算 Schema 复杂度得分 (0-30)
   */
  private calculateSchemaComplexityScore(schema: UISchema): number {
    if (!schema || !schema.root) return 0;

    const componentCount = this.countComponents(schema.root);
    const depth = this.calculateDepth(schema.root);
    const hasDataBinding = this.hasDataBinding(schema.root);
    const hasEvents = this.hasEvents(schema.root);

    let score = 0;

    // 组件数量得分 (0-10)
    if (componentCount >= 10) score += 10;
    else if (componentCount >= 5) score += 7;
    else if (componentCount >= 3) score += 5;
    else if (componentCount >= 1) score += 3;

    // 深度得分 (0-10)
    if (depth >= 4) score += 10;
    else if (depth >= 3) score += 7;
    else if (depth >= 2) score += 5;
    else score += 3;

    // 功能得分 (0-10)
    if (hasDataBinding) score += 5;
    if (hasEvents) score += 5;

    return Math.min(30, score);
  }

  /**
   * 计算文档完整度得分 (0-30)
   */
  private calculateDocumentationScore(example: Example): number {
    let score = 0;

    // 标题长度 (0-10)
    if (example.title) {
      if (example.title.length >= 10) score += 10;
      else if (example.title.length >= 5) score += 7;
      else score += 3;
    }

    // 描述长度 (0-15)
    if (example.description) {
      if (example.description.length >= 50) score += 15;
      else if (example.description.length >= 20) score += 10;
      else if (example.description.length >= 10) score += 5;
      else score += 2;
    }

    // 组件名称 (0-5)
    if (example.componentName) score += 5;

    return Math.min(30, score);
  }

  /**
   * 计算标签覆盖度得分 (0-20)
   */
  private calculateTagCoverageScore(tags: string[]): number {
    if (!tags || tags.length === 0) return 0;

    // 标签数量得分
    if (tags.length >= 5) return 20;
    if (tags.length >= 3) return 15;
    if (tags.length >= 2) return 10;
    return 5;
  }

  /**
   * 计算命名规范得分 (0-20)
   */
  private calculateNamingScore(example: Example): number {
    let score = 0;

    // ID 格式 (0-10)
    if (example.id && this.validateId(example.id)) {
      score += 10;
    }

    // ID 使用 kebab-case (0-5)
    if (example.id && /^[a-z0-9-]+$/.test(example.id)) {
      score += 5;
    }

    // 分类正确 (0-5)
    if (example.category && VALID_CATEGORIES.includes(example.category)) {
      score += 5;
    }

    return Math.min(20, score);
  }

  /**
   * 计算组件数量
   */
  private countComponents(component: UIComponent): number {
    let count = 1;
    if (component.children) {
      for (const child of component.children) {
        count += this.countComponents(child);
      }
    }
    return count;
  }

  /**
   * 计算组件树深度
   */
  private calculateDepth(component: UIComponent): number {
    if (!component.children || component.children.length === 0) {
      return 1;
    }
    const childDepths = component.children.map(c => this.calculateDepth(c));
    return 1 + Math.max(...childDepths);
  }

  /**
   * 检查是否有数据绑定
   */
  private hasDataBinding(component: UIComponent): boolean {
    if (component.binding) return true;
    if (component.children) {
      return component.children.some(c => this.hasDataBinding(c));
    }
    return false;
  }

  /**
   * 检查是否有事件绑定
   */
  private hasEvents(component: UIComponent): boolean {
    if (component.events && component.events.length > 0) return true;
    if (component.children) {
      return component.children.some(c => this.hasEvents(c));
    }
    return false;
  }
}

// 默认导出单例实例
export const exampleValidator = new ExampleValidator();
