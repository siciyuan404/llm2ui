/**
 * @file 案例验证器测试
 * @description ExampleValidator 的单元测试和属性测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ExampleValidator, exampleValidator } from './example-validator';
import type { Example, ExampleCategory, ExampleSource } from '../../types/example.types';
import type { UISchema } from '../../types/ui-schema';

describe('ExampleValidator', () => {
  let validator: ExampleValidator;

  const createValidSchema = (): UISchema => ({
    version: '1.0',
    root: {
      id: 'root',
      type: 'Box',
      props: {},
      children: [],
    },
  });

  const createValidExample = (overrides: Partial<Example> = {}): Example => ({
    id: 'system-layout-test',
    title: 'Test Example',
    description: 'A test example for validation',
    category: 'layout',
    tags: ['test', 'example'],
    schema: createValidSchema(),
    source: 'system',
    ...overrides,
  });

  beforeEach(() => {
    validator = new ExampleValidator();
  });

  describe('Unit Tests', () => {
    it('should validate a valid example', () => {
      const example = createValidExample();
      const result = validator.validate(example);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.qualityScore).toBeGreaterThan(0);
    });

    it('should reject example without id', () => {
      const example = createValidExample({ id: '' });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'id')).toBe(true);
    });

    it('should reject example with invalid id format', () => {
      const example = createValidExample({ id: 'invalid-id' });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_ID_FORMAT')).toBe(true);
    });

    it('should reject example without title', () => {
      const example = createValidExample({ title: '' });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    it('should reject example without description', () => {
      const example = createValidExample({ description: '' });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'description')).toBe(true);
    });

    it('should reject example without category', () => {
      const example = createValidExample({ category: '' as ExampleCategory });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'category')).toBe(true);
    });

    it('should reject example with invalid category', () => {
      const example = createValidExample({ category: 'invalid' as ExampleCategory });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_CATEGORY')).toBe(true);
    });

    it('should reject example with empty tags', () => {
      const example = createValidExample({ tags: [] });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_TAGS')).toBe(true);
    });

    it('should reject example without schema', () => {
      const example = createValidExample({ schema: undefined as unknown as UISchema });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'schema')).toBe(true);
    });

    it('should reject schema without version', () => {
      const example = createValidExample({
        schema: { root: { id: 'root', type: 'Box' } } as UISchema,
      });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'schema.version')).toBe(true);
    });

    it('should reject schema without root', () => {
      const example = createValidExample({
        schema: { version: '1.0' } as UISchema,
      });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'schema.root')).toBe(true);
    });

    it('should reject schema root without id', () => {
      const example = createValidExample({
        schema: { version: '1.0', root: { type: 'Box' } } as UISchema,
      });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'schema.root.id')).toBe(true);
    });

    it('should reject schema root without type', () => {
      const example = createValidExample({
        schema: { version: '1.0', root: { id: 'root' } } as UISchema,
      });
      const result = validator.validate(example);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'schema.root.type')).toBe(true);
    });

    it('should validate id format correctly', () => {
      expect(validator.validateId('system-layout-test')).toBe(true);
      expect(validator.validateId('custom-form-login')).toBe(true);
      expect(validator.validateId('invalid')).toBe(false);
      expect(validator.validateId('unknown-layout-test')).toBe(false);
    });

    it('should calculate quality score', () => {
      const example = createValidExample();
      const score = validator.calculateQualityScore(example);
      
      expect(score.total).toBeGreaterThan(0);
      expect(score.total).toBeLessThanOrEqual(100);
      expect(score.schemaComplexity).toBeLessThanOrEqual(30);
      expect(score.documentationCompleteness).toBeLessThanOrEqual(30);
      expect(score.tagCoverage).toBeLessThanOrEqual(20);
      expect(score.namingConvention).toBeLessThanOrEqual(20);
    });

    it('should give higher score for complex schema', () => {
      const simpleExample = createValidExample();
      const complexExample = createValidExample({
        schema: {
          version: '1.0',
          root: {
            id: 'root',
            type: 'Box',
            children: [
              { id: 'child1', type: 'Text' },
              { id: 'child2', type: 'Button', children: [{ id: 'nested', type: 'Icon' }] },
              { id: 'child3', type: 'Input' },
              { id: 'child4', type: 'Card' },
              { id: 'child5', type: 'Badge' },
            ],
          },
        },
      });

      const simpleScore = validator.calculateQualityScore(simpleExample);
      const complexScore = validator.calculateQualityScore(complexExample);

      expect(complexScore.schemaComplexity).toBeGreaterThan(simpleScore.schemaComplexity);
    });

    it('should give higher score for more tags', () => {
      const fewTags = createValidExample({ tags: ['one'] });
      const manyTags = createValidExample({ tags: ['one', 'two', 'three', 'four', 'five'] });

      const fewScore = validator.calculateQualityScore(fewTags);
      const manyScore = validator.calculateQualityScore(manyTags);

      expect(manyScore.tagCoverage).toBeGreaterThan(fewScore.tagCoverage);
    });

    it('should export singleton instance', () => {
      expect(exampleValidator).toBeInstanceOf(ExampleValidator);
    });
  });

  /**
   * Property 9: Example Validation Completeness
   * Feature: prompt-template-and-example-registry, Property 9: Example validation completeness
   * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
   */
  describe('Property Tests - Validation Completeness', () => {
    it('valid examples always pass validation', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('system', 'custom') as fc.Arbitrary<ExampleSource>,
          fc.constantFrom('layout', 'form', 'navigation', 'dashboard', 'display', 'feedback') as fc.Arbitrary<ExampleCategory>,
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9-]+$/.test(s)),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          (source, category, name, title, description, tags) => {
            const example: Example = {
              id: `${source}-${category}-${name}`,
              title,
              description,
              category,
              tags,
              schema: createValidSchema(),
              source,
            };

            const result = validator.validate(example);
            return result.valid === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('missing required fields produce specific errors', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('id', 'title', 'description', 'category', 'tags', 'schema'),
          (missingField) => {
            const example = createValidExample();
            
            // 移除指定字段
            if (missingField === 'id') example.id = '';
            else if (missingField === 'title') example.title = '';
            else if (missingField === 'description') example.description = '';
            else if (missingField === 'category') example.category = '' as ExampleCategory;
            else if (missingField === 'tags') example.tags = [];
            else if (missingField === 'schema') example.schema = undefined as unknown as UISchema;

            const result = validator.validate(example);
            
            // 应该有错误
            return result.valid === false && result.errors.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('invalid id format produces INVALID_ID_FORMAT error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('-')),
          (invalidId) => {
            const example = createValidExample({ id: invalidId });
            const result = validator.validate(example);
            
            return result.errors.some(e => e.code === 'INVALID_ID_FORMAT');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 10: Quality Score Calculation
   * Feature: prompt-template-and-example-registry, Property 10: Quality score calculation
   * Validates: Requirements 8.1, 8.2
   */
  describe('Property Tests - Quality Score', () => {
    it('quality score is always in range 0-100', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('system', 'custom') as fc.Arbitrary<ExampleSource>,
          fc.constantFrom('layout', 'form', 'navigation') as fc.Arbitrary<ExampleCategory>,
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          (source, category, title, description, tags) => {
            const example: Example = {
              id: `${source}-${category}-test`,
              title,
              description,
              category,
              tags,
              schema: createValidSchema(),
              source,
            };

            const score = validator.calculateQualityScore(example);
            
            return score.total >= 0 && score.total <= 100;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('quality score breakdown sums to total', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('system', 'custom') as fc.Arbitrary<ExampleSource>,
          fc.constantFrom('layout', 'form') as fc.Arbitrary<ExampleCategory>,
          (source, category) => {
            const example = createValidExample({ source, category, id: `${source}-${category}-test` });
            const score = validator.calculateQualityScore(example);
            
            const sum = score.schemaComplexity + score.documentationCompleteness + 
                       score.tagCoverage + score.namingConvention;
            
            return score.total === sum;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('each score component is within its max range', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('system', 'custom') as fc.Arbitrary<ExampleSource>,
          fc.constantFrom('layout', 'form', 'navigation') as fc.Arbitrary<ExampleCategory>,
          (source, category) => {
            const example = createValidExample({ source, category, id: `${source}-${category}-test` });
            const score = validator.calculateQualityScore(example);
            
            return (
              score.schemaComplexity >= 0 && score.schemaComplexity <= 30 &&
              score.documentationCompleteness >= 0 && score.documentationCompleteness <= 30 &&
              score.tagCoverage >= 0 && score.tagCoverage <= 20 &&
              score.namingConvention >= 0 && score.namingConvention <= 20
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
