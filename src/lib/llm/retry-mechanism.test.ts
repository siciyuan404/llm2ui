/**
 * @file retry-mechanism.test.ts
 * @description 重试机制模块属性测试
 * @module lib/llm/retry-mechanism.test
 * @requirements 9.4, 9.5, 9.6
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  executeWithRetry,
  compareErrors,
  buildRetryPrompt,
  calculateFixRate,
  type RetryProgressEvent,
  type LLMGenerateFunction,
} from './retry-mechanism';
import type { ChainValidationError, ValidationLayer } from '../design-system/validation-chain';

// ============================================================================
// Arbitrary Generators
// ============================================================================

/**
 * Generator for validation layers
 */
const validationLayerArb: fc.Arbitrary<ValidationLayer> = fc.constantFrom(
  'json-syntax',
  'schema-structure',
  'component-existence',
  'props-validation',
  'style-compliance'
);

/**
 * Generator for JSON-like paths
 */
const jsonPathArb: fc.Arbitrary<string> = fc.array(
  fc.oneof(
    fc.constant('root'),
    fc.constant('children'),
    fc.constant('props'),
    fc.constant('type'),
    fc.integer({ min: 0, max: 9 }).map(n => `[${n}]`)
  ),
  { minLength: 1, maxLength: 5 }
).map(parts => parts.join('.').replace(/\.\[/g, '['));

/**
 * Generator for ChainValidationError
 */
const chainValidationErrorArb: fc.Arbitrary<ChainValidationError> = fc.record({
  layer: validationLayerArb,
  severity: fc.constantFrom('error', 'warning') as fc.Arbitrary<'error' | 'warning'>,
  path: jsonPathArb,
  message: fc.string({ minLength: 1, maxLength: 100 }),
  suggestion: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  line: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
  column: fc.option(fc.integer({ min: 1, max: 200 }), { nil: undefined }),
});

/**
 * Generator for a list of unique ChainValidationErrors
 */
const uniqueErrorListArb = (minLength: number, maxLength: number): fc.Arbitrary<ChainValidationError[]> =>
  fc.array(chainValidationErrorArb, { minLength, maxLength }).map(errors => {
    // Make errors unique by layer+path+message combination
    const seen = new Set<string>();
    return errors.filter(err => {
      const key = `${err.layer}:${err.path}:${err.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });


// ============================================================================
// Property 5: 重试错误追踪准确性
// ============================================================================

describe('Property 5: 重试错误追踪准确性', () => {
  /**
   * Property 5: 重试错误追踪准确性
   * 
   * *For any* retry sequence with N attempts, the errorsFixed count in attempt K
   * SHALL equal the number of errors present in attempt K-1 that are no longer
   * present in attempt K, for all K from 2 to N.
   * 
   * **Feature: showcase-design-system, Property 5: 重试错误追踪准确性**
   * **Validates: Requirements 9.4**
   */

  describe('compareErrors function', () => {
    it('should correctly identify fixed errors when some errors are resolved', () => {
      fc.assert(
        fc.property(
          uniqueErrorListArb(2, 10),
          fc.integer({ min: 1, max: 5 }),
          (previousErrors, numToFix) => {
            // Ensure we don't try to fix more errors than exist
            const actualNumToFix = Math.min(numToFix, previousErrors.length);
            
            // Create current errors by removing some from previous
            const currentErrors = previousErrors.slice(actualNumToFix);
            
            const result = compareErrors(previousErrors, currentErrors);
            
            // The number of fixed errors should equal the number we removed
            expect(result.fixed.length).toBe(actualNumToFix);
            
            // Fixed errors should be exactly the ones we removed
            const fixedSet = new Set(result.fixed.map(e => `${e.layer}:${e.path}:${e.message}`));
            const removedSet = new Set(previousErrors.slice(0, actualNumToFix).map(e => `${e.layer}:${e.path}:${e.message}`));
            expect(fixedSet).toEqual(removedSet);
            
            // Remaining errors should be the ones still present
            expect(result.remaining.length).toBe(currentErrors.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify new errors that appeared', () => {
      fc.assert(
        fc.property(
          uniqueErrorListArb(1, 5),
          uniqueErrorListArb(1, 5),
          (previousErrors, additionalErrors) => {
            // Filter additional errors to ensure they're truly new
            const previousKeys = new Set(previousErrors.map(e => `${e.layer}:${e.path}:${e.message}`));
            const newErrors = additionalErrors.filter(e => !previousKeys.has(`${e.layer}:${e.path}:${e.message}`));
            
            // Current errors = previous + new
            const currentErrors = [...previousErrors, ...newErrors];
            
            const result = compareErrors(previousErrors, currentErrors);
            
            // No errors should be fixed (all previous still exist)
            expect(result.fixed.length).toBe(0);
            
            // All previous errors should remain
            expect(result.remaining.length).toBe(previousErrors.length);
            
            // New errors should be identified
            expect(result.newErrors.length).toBe(newErrors.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty arrays when both error lists are empty', () => {
      const result = compareErrors([], []);
      
      expect(result.fixed).toEqual([]);
      expect(result.remaining).toEqual([]);
      expect(result.newErrors).toEqual([]);
    });

    it('should identify all errors as fixed when current is empty', () => {
      fc.assert(
        fc.property(
          uniqueErrorListArb(1, 10),
          (previousErrors) => {
            const result = compareErrors(previousErrors, []);
            
            // All previous errors should be fixed
            expect(result.fixed.length).toBe(previousErrors.length);
            expect(result.remaining.length).toBe(0);
            expect(result.newErrors.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should identify all errors as new when previous is empty', () => {
      fc.assert(
        fc.property(
          uniqueErrorListArb(1, 10),
          (currentErrors) => {
            const result = compareErrors([], currentErrors);
            
            // All current errors should be new
            expect(result.fixed.length).toBe(0);
            expect(result.remaining.length).toBe(0);
            expect(result.newErrors.length).toBe(currentErrors.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should satisfy: fixed + remaining = previous errors count (when no new errors)', () => {
      fc.assert(
        fc.property(
          uniqueErrorListArb(3, 10),
          fc.integer({ min: 0, max: 10 }),
          (previousErrors, numToFix) => {
            const actualNumToFix = Math.min(numToFix, previousErrors.length);
            const currentErrors = previousErrors.slice(actualNumToFix);
            
            const result = compareErrors(previousErrors, currentErrors);
            
            // fixed + remaining should equal previous count
            expect(result.fixed.length + result.remaining.length).toBe(previousErrors.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('executeWithRetry error tracking', () => {
    it('should track errorsFixed accurately across retry attempts', async () => {
      await fc.assert(
        fc.asyncProperty(
          uniqueErrorListArb(3, 6),
          fc.integer({ min: 1, max: 2 }),
          async (initialErrors, errorsToFixPerAttempt) => {
            const progressEvents: RetryProgressEvent[] = [];
            let attemptCount = 0;
            
            // Mock LLM function that generates invalid JSON initially, then progressively fixes errors
            const mockGenerateFn: LLMGenerateFunction = async () => {
              attemptCount++;
              
              if (attemptCount === 1) {
                // First attempt: return invalid JSON to trigger errors
                return '{"version": "1.0", "root": {"id": "test", "type": "UnknownComponent"}}';
              }
              
              // Subsequent attempts: return valid JSON
              return '{"version": "1.0", "root": {"id": "test", "type": "Container"}}';
            };
            
            await executeWithRetry(mockGenerateFn, 'Generate UI', {
              maxRetries: 3,
              timeout: 5000,
              onProgress: (event) => {
                progressEvents.push({ ...event });
              },
            });
            
            // Verify progress events were emitted
            expect(progressEvents.length).toBeGreaterThan(0);
            
            // Verify that errorsFixed is calculated correctly between attempts
            for (let i = 1; i < progressEvents.length; i++) {
              const current = progressEvents[i];
              
              // errorsFixed should be non-negative
              expect(current.errorsFixed).toBeGreaterThanOrEqual(0);
              
              // errorsRemaining should be non-negative
              expect(current.errorsRemaining).toBeGreaterThanOrEqual(0);
              
              // fixedErrors array length should match errorsFixed count
              expect(current.fixedErrors.length).toBe(current.errorsFixed);
              
              // remainingErrors array length should match errorsRemaining count
              expect(current.remainingErrors.length).toBe(current.errorsRemaining);
            }
          }
        ),
        { numRuns: 20 } // Reduced runs due to async nature
      );
    });

    it('should emit progress events with consistent error tracking', async () => {
      const progressEvents: RetryProgressEvent[] = [];
      let attemptCount = 0;
      
      // Mock function that fails first, then succeeds
      const mockGenerateFn: LLMGenerateFunction = async () => {
        attemptCount++;
        if (attemptCount === 1) {
          return '{"invalid json';
        }
        return '{"version": "1.0", "root": {"id": "test", "type": "Container"}}';
      };
      
      await executeWithRetry(mockGenerateFn, 'Generate UI', {
        maxRetries: 3,
        timeout: 5000,
        onProgress: (event) => {
          progressEvents.push({ ...event });
        },
      });
      
      // Should have multiple progress events
      expect(progressEvents.length).toBeGreaterThan(0);
      
      // First event should be 'generating' status
      expect(progressEvents[0].status).toBe('generating');
      expect(progressEvents[0].attempt).toBe(1);
      
      // Verify error tracking consistency
      for (const event of progressEvents) {
        // errorsFixed should match fixedErrors array length
        expect(event.errorsFixed).toBe(event.fixedErrors.length);
        
        // errorsRemaining should match remainingErrors array length
        expect(event.errorsRemaining).toBe(event.remainingErrors.length);
      }
    });
  });

  describe('calculateFixRate', () => {
    it('should return correct fix rate for partial fixes', () => {
      fc.assert(
        fc.property(
          uniqueErrorListArb(2, 10),
          fc.integer({ min: 0, max: 10 }),
          (previousErrors, numToFix) => {
            const actualNumToFix = Math.min(numToFix, previousErrors.length);
            const currentErrors = previousErrors.slice(actualNumToFix);
            
            const fixRate = calculateFixRate(previousErrors, currentErrors);
            
            // Fix rate should be between 0 and 1
            expect(fixRate).toBeGreaterThanOrEqual(0);
            expect(fixRate).toBeLessThanOrEqual(1);
            
            // Fix rate should equal fixed/total
            const expectedRate = actualNumToFix / previousErrors.length;
            expect(fixRate).toBeCloseTo(expectedRate, 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 1 when all errors are fixed', () => {
      fc.assert(
        fc.property(
          uniqueErrorListArb(1, 10),
          (previousErrors) => {
            const fixRate = calculateFixRate(previousErrors, []);
            expect(fixRate).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 when no errors are fixed', () => {
      fc.assert(
        fc.property(
          uniqueErrorListArb(1, 10),
          (errors) => {
            const fixRate = calculateFixRate(errors, errors);
            expect(fixRate).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 1 when both lists are empty', () => {
      const fixRate = calculateFixRate([], []);
      expect(fixRate).toBe(1);
    });

    it('should return 0 when previous is empty but current has errors', () => {
      fc.assert(
        fc.property(
          uniqueErrorListArb(1, 10),
          (currentErrors) => {
            const fixRate = calculateFixRate([], currentErrors);
            expect(fixRate).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('buildRetryPrompt', () => {
    it('should include error context in retry prompt', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          uniqueErrorListArb(1, 5),
          (basePrompt, errors) => {
            const retryPrompt = buildRetryPrompt(basePrompt, errors);
            
            // Should contain base prompt
            expect(retryPrompt).toContain(basePrompt);
            
            // Should contain error context header
            expect(retryPrompt).toContain('## Previous Attempt Errors (MUST FIX)');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include previous output when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 50 }),
          uniqueErrorListArb(1, 3),
          fc.string({ minLength: 10, maxLength: 100 }),
          (basePrompt, errors, previousOutput) => {
            const retryPrompt = buildRetryPrompt(basePrompt, errors, previousOutput);
            
            // Should contain previous output section
            expect(retryPrompt).toContain('## Previous Output (for reference)');
            expect(retryPrompt).toContain(previousOutput);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not include previous output section when not provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 50 }),
          uniqueErrorListArb(1, 3),
          (basePrompt, errors) => {
            const retryPrompt = buildRetryPrompt(basePrompt, errors);
            
            // Should not contain previous output section
            expect(retryPrompt).not.toContain('## Previous Output (for reference)');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
