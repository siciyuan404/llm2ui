/**
 * @file token-compliance-validator.test.ts
 * @description Token 合规验证器属性测试
 * 
 * **Feature: token-component-example-mapping**
 * 
 * Property 17: Hardcoded Value Detection
 * Property 18: Validation Suggestion Generation
 * Property 19: Compliance Score Calculation
 * 
 * @module lib/design-system/token-compliance-validator.test
 * @requirements 5.1, 5.2, 5.3, 5.4, 5.6
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { UISchema, UIComponent } from '../../types';
import {
  validateTokenCompliance,
  detectHardcodedColors,
  detectHardcodedSpacing,
  suggestColorReplacement,
  suggestSpacingReplacement,
  calculateComplianceScore,
  countTokenUsage,
  formatComplianceErrorsForLLM,
} from './token-compliance-validator';
import { getDefaultDesignTokens } from './design-tokens';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid hex color codes
 */
const hexColorArb = fc.oneof(
  // 3-digit hex
  fc.tuple(
    fc.integer({ min: 0, max: 15 }),
    fc.integer({ min: 0, max: 15 }),
    fc.integer({ min: 0, max: 15 })
  ).map(([r, g, b]) => `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`),
  // 6-digit hex
  fc.tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  ).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
);

/**
 * Generator for RGB color values
 */
const rgbColorArb = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 })
).map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);

/**
 * Generator for RGBA color values
 */
const rgbaColorArb = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.float({ min: 0, max: 1, noNaN: true })
).map(([r, g, b, a]) => `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`);

/**
 * Generator for hardcoded pixel spacing values
 */
const pxSpacingArb = fc.integer({ min: 1, max: 100 }).map(n => `${n}px`);

/**
 * Generator for Tailwind color classes
 */
const tailwindColorClassArb = fc.constantFrom(
  'bg-primary-500',
  'text-neutral-700',
  'border-error-500',
  'bg-success-100',
  'text-warning-600'
);

/**
 * Generator for Tailwind spacing classes
 */
const tailwindSpacingClassArb = fc.constantFrom(
  'p-4',
  'px-2',
  'py-6',
  'm-4',
  'mx-auto',
  'gap-2',
  'gap-4',
  'space-x-2'
);

/**
 * Generator for component type
 */
const componentTypeArb = fc.constantFrom(
  'Button',
  'Container',
  'Row',
  'Column',
  'Card',
  'Text',
  'Input',
  'Label'
);

/**
 * Generator for valid UIComponent with tokenized classes
 */
const tokenizedComponentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: fc.uuid(),
  type: componentTypeArb,
  props: fc.record({
    className: fc.array(tailwindSpacingClassArb, { minLength: 1, maxLength: 3 })
      .map(classes => classes.join(' ')),
  }),
});

/**
 * Generator for valid UISchema with tokenized values
 */
const tokenizedSchemaArb: fc.Arbitrary<UISchema> = tokenizedComponentArb.map(root => ({
  version: '1.0',
  root,
}));

// ============================================================================
// Property Tests
// ============================================================================

describe('Token Compliance Validator', () => {
  describe('Basic Detection Functions', () => {
    it('detectHardcodedColors detects hex colors', () => {
      fc.assert(
        fc.property(hexColorArb, (color) => {
          const detected = detectHardcodedColors(color);
          expect(detected.length).toBeGreaterThan(0);
          expect(detected).toContain(color);
        }),
        { numRuns: 100 }
      );
    });

    it('detectHardcodedColors detects RGB colors', () => {
      fc.assert(
        fc.property(rgbColorArb, (color) => {
          const detected = detectHardcodedColors(color);
          expect(detected.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('detectHardcodedColors detects RGBA colors', () => {
      fc.assert(
        fc.property(rgbaColorArb, (color) => {
          const detected = detectHardcodedColors(color);
          expect(detected.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('detectHardcodedSpacing detects px values', () => {
      fc.assert(
        fc.property(pxSpacingArb, (spacing) => {
          const detected = detectHardcodedSpacing(spacing);
          expect(detected.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('detectHardcodedColors returns empty for Tailwind classes', () => {
      fc.assert(
        fc.property(tailwindColorClassArb, (className) => {
          const detected = detectHardcodedColors(className);
          expect(detected.length).toBe(0);
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 17: Hardcoded Value Detection
   * 
   * *For any* UISchema containing hardcoded color values (hex codes) or
   * hardcoded spacing values (px values) in className props, the token
   * compliance validator SHALL detect and report them as errors.
   * 
   * **Feature: token-component-example-mapping, Property 17: Hardcoded Value Detection**
   * **Validates: Requirements 5.2, 5.3**
   */
  describe('Property 17: Hardcoded Value Detection', () => {
    it('detects hardcoded hex colors in className', () => {
      fc.assert(
        fc.property(hexColorArb, (color) => {
          const schema: UISchema = {
            version: '1.0',
            root: {
              id: 'test-1',
              type: 'Container',
              props: {
                className: `bg-[${color}] p-4`,
              },
            },
          };
          
          const result = validateTokenCompliance(schema);
          
          // Should detect the hardcoded color
          const colorErrors = result.errors.filter(e => e.type === 'hardcoded-color');
          expect(colorErrors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('detects hardcoded RGB colors in style', () => {
      fc.assert(
        fc.property(rgbColorArb, (color) => {
          const schema: UISchema = {
            version: '1.0',
            root: {
              id: 'test-1',
              type: 'Container',
              style: {
                backgroundColor: color,
              },
            },
          };
          
          const result = validateTokenCompliance(schema);
          
          // Should detect the hardcoded color
          const colorErrors = result.errors.filter(e => e.type === 'hardcoded-color');
          expect(colorErrors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('detects hardcoded px spacing in style', () => {
      fc.assert(
        fc.property(pxSpacingArb, (spacing) => {
          const schema: UISchema = {
            version: '1.0',
            root: {
              id: 'test-1',
              type: 'Container',
              style: {
                padding: spacing,
              },
            },
          };
          
          const result = validateTokenCompliance(schema);
          
          // Should detect the hardcoded spacing
          const spacingErrors = result.errors.filter(e => e.type === 'hardcoded-spacing');
          expect(spacingErrors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('does not report errors for tokenized Tailwind classes', () => {
      fc.assert(
        fc.property(tokenizedSchemaArb, (schema) => {
          const result = validateTokenCompliance(schema);
          
          // Should not have hardcoded color or spacing errors
          const hardcodedErrors = result.errors.filter(
            e => e.type === 'hardcoded-color' || e.type === 'hardcoded-spacing'
          );
          expect(hardcodedErrors.length).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    it('detects hardcoded values in nested children', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'root',
          type: 'Container',
          children: [
            {
              id: 'child-1',
              type: 'Card',
              children: [
                {
                  id: 'nested',
                  type: 'Text',
                  style: {
                    color: '#ff0000',
                  },
                },
              ],
            },
          ],
        },
      };
      
      const result = validateTokenCompliance(schema);
      
      // Should detect the hardcoded color in nested component
      const colorErrors = result.errors.filter(e => e.type === 'hardcoded-color');
      expect(colorErrors.length).toBeGreaterThan(0);
      expect(colorErrors[0].path).toContain('children');
    });
  });

  /**
   * Property 18: Validation Suggestion Generation
   * 
   * *For any* detected hardcoded value in validation, the error object SHALL
   * include a non-empty suggestion field recommending the appropriate token
   * replacement.
   * 
   * **Feature: token-component-example-mapping, Property 18: Validation Suggestion Generation**
   * **Validates: Requirements 5.4**
   */
  describe('Property 18: Validation Suggestion Generation', () => {
    it('generates non-empty suggestions for hardcoded colors', () => {
      fc.assert(
        fc.property(hexColorArb, (color) => {
          const tokens = getDefaultDesignTokens();
          const suggestion = suggestColorReplacement(color, tokens);
          
          expect(suggestion).toBeTruthy();
          expect(suggestion.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('generates non-empty suggestions for hardcoded spacing', () => {
      fc.assert(
        fc.property(pxSpacingArb, (spacing) => {
          const suggestion = suggestSpacingReplacement(spacing);
          
          expect(suggestion).toBeTruthy();
          expect(suggestion.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('all validation errors have non-empty suggestions', () => {
      fc.assert(
        fc.property(hexColorArb, (color) => {
          const schema: UISchema = {
            version: '1.0',
            root: {
              id: 'test-1',
              type: 'Container',
              style: {
                backgroundColor: color,
              },
            },
          };
          
          const result = validateTokenCompliance(schema);
          
          // All errors should have non-empty suggestions
          for (const error of result.errors) {
            expect(error.suggestion).toBeTruthy();
            expect(error.suggestion.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('suggestions mention the detected value', () => {
      fc.assert(
        fc.property(pxSpacingArb, (spacing) => {
          const suggestion = suggestSpacingReplacement(spacing);
          
          // Suggestion should mention the original value
          expect(suggestion).toContain(spacing);
        }),
        { numRuns: 100 }
      );
    });

    it('color suggestions recommend Tailwind classes', () => {
      fc.assert(
        fc.property(hexColorArb, (color) => {
          const tokens = getDefaultDesignTokens();
          const suggestion = suggestColorReplacement(color, tokens);
          
          // Suggestion should mention bg- or text- classes
          expect(suggestion).toMatch(/bg-|text-/);
        }),
        { numRuns: 100 }
      );
    });

    it('spacing suggestions recommend Tailwind classes', () => {
      fc.assert(
        fc.property(pxSpacingArb, (spacing) => {
          const suggestion = suggestSpacingReplacement(spacing);
          
          // Suggestion should mention gap- or p- classes
          expect(suggestion).toMatch(/gap-|p-/);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 19: Compliance Score Calculation
   * 
   * *For any* validation result, the complianceScore SHALL equal
   * (tokenizedValues / (tokenizedValues + hardcodedValues)) * 100,
   * rounded to the nearest integer.
   * 
   * **Feature: token-component-example-mapping, Property 19: Compliance Score Calculation**
   * **Validates: Requirements 5.6**
   */
  describe('Property 19: Compliance Score Calculation', () => {
    it('calculates correct compliance score', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          (tokenized, hardcoded) => {
            const score = calculateComplianceScore(tokenized, hardcoded);
            const total = tokenized + hardcoded;
            
            if (total === 0) {
              expect(score).toBe(100);
            } else {
              const expected = Math.round((tokenized / total) * 100);
              expect(score).toBe(expected);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('returns 100 when no values present', () => {
      const score = calculateComplianceScore(0, 0);
      expect(score).toBe(100);
    });

    it('returns 100 when all values are tokenized', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (tokenized) => {
          const score = calculateComplianceScore(tokenized, 0);
          expect(score).toBe(100);
        }),
        { numRuns: 50 }
      );
    });

    it('returns 0 when all values are hardcoded', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (hardcoded) => {
          const score = calculateComplianceScore(0, hardcoded);
          expect(score).toBe(0);
        }),
        { numRuns: 50 }
      );
    });

    it('score is between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 0, max: 1000 }),
          (tokenized, hardcoded) => {
            const score = calculateComplianceScore(tokenized, hardcoded);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('validation result contains correct compliance score', () => {
      // Schema with mix of tokenized and hardcoded values
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'root',
          type: 'Container',
          props: {
            className: 'p-4 m-2', // 2 tokenized
          },
          style: {
            backgroundColor: '#ff0000', // 1 hardcoded
          },
        },
      };
      
      const result = validateTokenCompliance(schema);
      
      // Score should be calculated correctly
      const expectedScore = calculateComplianceScore(
        result.tokenizedValues,
        result.hardcodedValues
      );
      expect(result.complianceScore).toBe(expectedScore);
    });
  });

  describe('countTokenUsage', () => {
    it('counts tokenized Tailwind classes correctly', () => {
      fc.assert(
        fc.property(
          fc.array(tailwindSpacingClassArb, { minLength: 1, maxLength: 5 }),
          (classes) => {
            const className = classes.join(' ');
            const usage = countTokenUsage(className);
            
            expect(usage.tokenized).toBe(classes.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('counts hardcoded values in className', () => {
      fc.assert(
        fc.property(hexColorArb, (color) => {
          const className = `bg-[${color}]`;
          const usage = countTokenUsage(className);
          
          expect(usage.hardcoded).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('formatComplianceErrorsForLLM', () => {
    it('returns empty string for valid result', () => {
      const result = validateTokenCompliance({
        version: '1.0',
        root: {
          id: 'test',
          type: 'Container',
          props: { className: 'p-4' },
        },
      });
      
      const formatted = formatComplianceErrorsForLLM(result);
      expect(formatted).toBe('');
    });

    it('includes compliance score in output', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'test',
          type: 'Container',
          style: { backgroundColor: '#ff0000' },
        },
      };
      
      const result = validateTokenCompliance(schema);
      const formatted = formatComplianceErrorsForLLM(result);
      
      expect(formatted).toContain('Compliance Score');
      expect(formatted).toContain('%');
    });

    it('includes error details in output', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'test',
          type: 'Container',
          style: { backgroundColor: '#ff0000' },
        },
      };
      
      const result = validateTokenCompliance(schema);
      const formatted = formatComplianceErrorsForLLM(result);
      
      expect(formatted).toContain('hardcoded-color');
      expect(formatted).toContain('Suggestion');
    });
  });

  describe('Integration with ValidationChain', () => {
    it('validateTokenCompliance returns valid result structure', () => {
      fc.assert(
        fc.property(tokenizedSchemaArb, (schema) => {
          const result = validateTokenCompliance(schema);
          
          // Result should have all required fields
          expect(typeof result.valid).toBe('boolean');
          expect(typeof result.complianceScore).toBe('number');
          expect(typeof result.tokenizedValues).toBe('number');
          expect(typeof result.hardcodedValues).toBe('number');
          expect(Array.isArray(result.errors)).toBe(true);
          expect(Array.isArray(result.warnings)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('errors have required fields', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'test',
          type: 'Container',
          style: { backgroundColor: '#ff0000' },
        },
      };
      
      const result = validateTokenCompliance(schema);
      
      for (const error of result.errors) {
        expect(error.path).toBeTruthy();
        expect(error.type).toBeTruthy();
        expect(error.message).toBeTruthy();
        expect(error.suggestion).toBeTruthy();
      }
    });
  });
});
