/**
 * @file custom-examples-storage.test.ts
 * @description Custom Examples Storage Tests
 * @module lib/examples/custom-examples-storage.test
 * 
 * Tests for localStorage-based custom examples CRUD operations
 * 
 * @see Requirements 11.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateExampleId,
  getAllExamples,
  getExamplesByComponent,
  getExampleById,
  createExample,
  updateExample,
  deleteExample,
  deleteExamplesByComponent,
  clearAllExamples,
  getExampleCount,
  exampleExists,
  searchExamples,
} from './custom-examples-storage';
import type { CreateExampleInput } from './custom-examples-storage';
import type { UISchema } from '../../types';

// ============================================================================
// Test Helpers
// ============================================================================

const createTestSchema = (type: string = 'Button'): UISchema => ({
  version: '1.0',
  root: {
    id: 'test-root',
    type,
    props: { variant: 'default' },
    text: 'Test',
  },
});

const createTestInput = (overrides?: Partial<CreateExampleInput>): CreateExampleInput => ({
  title: 'Test Example',
  description: 'A test example description',
  schema: createTestSchema(),
  componentName: 'Button',
  ...overrides,
});

// ============================================================================
// Tests
// ============================================================================

describe('Custom Examples Storage', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    clearAllExamples();
  });

  describe('generateExampleId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateExampleId();
      const id2 = generateExampleId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^example-[a-z0-9]+-[a-z0-9]+$/);
      expect(id2).toMatch(/^example-[a-z0-9]+-[a-z0-9]+$/);
    });
  });

  describe('createExample', () => {
    it('should create a new example with generated ID and timestamps', () => {
      const input = createTestInput();
      const result = createExample(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toMatch(/^example-/);
      expect(result.data!.title).toBe(input.title);
      expect(result.data!.description).toBe(input.description);
      expect(result.data!.componentName).toBe(input.componentName);
      expect(result.data!.createdAt).toBeDefined();
      expect(result.data!.updatedAt).toBeDefined();
    });

    it('should persist example to localStorage', () => {
      const input = createTestInput();
      createExample(input);
      
      const examples = getAllExamples();
      expect(examples).toHaveLength(1);
      expect(examples[0].title).toBe(input.title);
    });
  });

  describe('getAllExamples', () => {
    it('should return empty array when no examples exist', () => {
      const examples = getAllExamples();
      expect(examples).toEqual([]);
    });

    it('should return all created examples', () => {
      createExample(createTestInput({ title: 'Example 1' }));
      createExample(createTestInput({ title: 'Example 2' }));
      createExample(createTestInput({ title: 'Example 3' }));
      
      const examples = getAllExamples();
      expect(examples).toHaveLength(3);
    });
  });

  describe('getExamplesByComponent', () => {
    it('should filter examples by component name', () => {
      createExample(createTestInput({ componentName: 'Button' }));
      createExample(createTestInput({ componentName: 'Input' }));
      createExample(createTestInput({ componentName: 'Button' }));
      
      const buttonExamples = getExamplesByComponent('Button');
      const inputExamples = getExamplesByComponent('Input');
      
      expect(buttonExamples).toHaveLength(2);
      expect(inputExamples).toHaveLength(1);
    });

    it('should return empty array for non-existent component', () => {
      createExample(createTestInput({ componentName: 'Button' }));
      
      const examples = getExamplesByComponent('NonExistent');
      expect(examples).toEqual([]);
    });
  });

  describe('getExampleById', () => {
    it('should return example by ID', () => {
      const result = createExample(createTestInput({ title: 'Find Me' }));
      const id = result.data!.id;
      
      const found = getExampleById(id);
      expect(found).toBeDefined();
      expect(found!.title).toBe('Find Me');
    });

    it('should return undefined for non-existent ID', () => {
      const found = getExampleById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('updateExample', () => {
    it('should update example fields', () => {
      const result = createExample(createTestInput({ title: 'Original' }));
      const id = result.data!.id;
      
      const updateResult = updateExample(id, { title: 'Updated' });
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.data!.title).toBe('Updated');
    });

    it('should update updatedAt timestamp', () => {
      const result = createExample(createTestInput());
      const id = result.data!.id;
      const originalUpdatedAt = result.data!.updatedAt;
      
      // Wait a bit to ensure different timestamp
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      
      const updateResult = updateExample(id, { title: 'Updated' });
      
      vi.useRealTimers();
      
      expect(updateResult.data!.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should preserve unchanged fields', () => {
      const result = createExample(createTestInput({ 
        title: 'Original Title',
        description: 'Original Description',
      }));
      const id = result.data!.id;
      
      const updateResult = updateExample(id, { title: 'New Title' });
      
      expect(updateResult.data!.title).toBe('New Title');
      expect(updateResult.data!.description).toBe('Original Description');
    });

    it('should return error for non-existent ID', () => {
      const result = updateExample('non-existent', { title: 'Updated' });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('案例不存在');
    });
  });

  describe('deleteExample', () => {
    it('should delete example by ID', () => {
      const result = createExample(createTestInput());
      const id = result.data!.id;
      
      const deleteResult = deleteExample(id);
      
      expect(deleteResult.success).toBe(true);
      expect(getExampleById(id)).toBeUndefined();
    });

    it('should return error for non-existent ID', () => {
      const result = deleteExample('non-existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('案例不存在');
    });
  });

  describe('deleteExamplesByComponent', () => {
    it('should delete all examples for a component', () => {
      createExample(createTestInput({ componentName: 'Button' }));
      createExample(createTestInput({ componentName: 'Button' }));
      createExample(createTestInput({ componentName: 'Input' }));
      
      const result = deleteExamplesByComponent('Button');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(2);
      expect(getExamplesByComponent('Button')).toHaveLength(0);
      expect(getExamplesByComponent('Input')).toHaveLength(1);
    });

    it('should return 0 when no examples match', () => {
      createExample(createTestInput({ componentName: 'Button' }));
      
      const result = deleteExamplesByComponent('NonExistent');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(0);
    });
  });

  describe('clearAllExamples', () => {
    it('should remove all examples', () => {
      createExample(createTestInput());
      createExample(createTestInput());
      
      const result = clearAllExamples();
      
      expect(result.success).toBe(true);
      expect(getAllExamples()).toHaveLength(0);
    });
  });

  describe('getExampleCount', () => {
    it('should return total count', () => {
      createExample(createTestInput());
      createExample(createTestInput());
      createExample(createTestInput());
      
      expect(getExampleCount()).toBe(3);
    });

    it('should return count for specific component', () => {
      createExample(createTestInput({ componentName: 'Button' }));
      createExample(createTestInput({ componentName: 'Button' }));
      createExample(createTestInput({ componentName: 'Input' }));
      
      expect(getExampleCount('Button')).toBe(2);
      expect(getExampleCount('Input')).toBe(1);
    });
  });

  describe('exampleExists', () => {
    it('should return true for existing example', () => {
      const result = createExample(createTestInput());
      
      expect(exampleExists(result.data!.id)).toBe(true);
    });

    it('should return false for non-existent example', () => {
      expect(exampleExists('non-existent')).toBe(false);
    });
  });

  describe('searchExamples', () => {
    beforeEach(() => {
      createExample(createTestInput({ 
        title: 'Primary Button',
        description: 'A primary styled button',
        componentName: 'Button',
      }));
      createExample(createTestInput({ 
        title: 'Secondary Button',
        description: 'A secondary styled button',
        componentName: 'Button',
      }));
      createExample(createTestInput({ 
        title: 'Text Input',
        description: 'Basic text input field',
        componentName: 'Input',
      }));
    });

    it('should search by title', () => {
      const results = searchExamples('Primary');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Primary Button');
    });

    it('should search by description', () => {
      const results = searchExamples('styled');
      
      expect(results).toHaveLength(2);
    });

    it('should be case-insensitive', () => {
      const results = searchExamples('BUTTON');
      
      expect(results).toHaveLength(2);
    });

    it('should filter by component name', () => {
      const results = searchExamples('', 'Button');
      
      expect(results).toHaveLength(2);
      results.forEach(r => expect(r.componentName).toBe('Button'));
    });

    it('should combine search and component filter', () => {
      const results = searchExamples('Primary', 'Button');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Primary Button');
    });

    it('should return empty array for no matches', () => {
      const results = searchExamples('NonExistent');
      
      expect(results).toHaveLength(0);
    });
  });
});
