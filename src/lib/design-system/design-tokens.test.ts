/**
 * @file design-tokens.test.ts
 * @description Design Tokens 属性测试
 * 
 * **Feature: showcase-design-system**
 * 
 * Property 8: Design Tokens 约束注入完整性
 * 
 * @module lib/design-system/design-tokens.test
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  getDefaultDesignTokens,
  formatTokensForLLM,
  getColorTokenNames,
  getSpacingTokenNames,
  isValidColorToken,
  suggestColorToken,
  type DesignTokens,
  type ColorScale,
  type ColorTokens,
  type SpacingTokens,
} from './design-tokens';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid hex color values
 */
const hexColorArb = fc.stringMatching(/^#[0-9a-fA-F]{6}$/);

/**
 * Generator for color scale
 */
const colorScaleArb: fc.Arbitrary<ColorScale> = fc.record({
  50: hexColorArb,
  100: hexColorArb,
  200: hexColorArb,
  300: hexColorArb,
  400: hexColorArb,
  500: hexColorArb,
  600: hexColorArb,
  700: hexColorArb,
  800: hexColorArb,
  900: hexColorArb,
  950: hexColorArb,
});

/**
 * Generator for color tokens
 */
const colorTokensArb: fc.Arbitrary<ColorTokens> = fc.record({
  primary: colorScaleArb,
  secondary: colorScaleArb,
  neutral: colorScaleArb,
  success: colorScaleArb,
  warning: colorScaleArb,
  error: colorScaleArb,
});

/**
 * Generator for spacing value (e.g., "4px", "8px")
 */
const spacingValueArb = fc.integer({ min: 1, max: 100 }).map(n => `${n}px`);

/**
 * Generator for spacing tokens
 */
const spacingTokensArb: fc.Arbitrary<SpacingTokens> = fc.record({
  xs: spacingValueArb,
  sm: spacingValueArb,
  md: spacingValueArb,
  lg: spacingValueArb,
  xl: spacingValueArb,
  '2xl': spacingValueArb,
  '3xl': spacingValueArb,
});

/**
 * Generator for design tokens
 */
const designTokensArb: fc.Arbitrary<DesignTokens> = fc.record({
  breakpoints: fc.record({
    mobile: fc.integer({ min: 320, max: 768 }),
    tablet: fc.integer({ min: 768, max: 1280 }),
    desktop: fc.integer({ min: 1024, max: 1920 }),
  }),
  colors: colorTokensArb,
  spacing: spacingTokensArb,
  typography: fc.record({
    fontFamily: fc.record({
      sans: fc.constant('ui-sans-serif, system-ui, sans-serif'),
      serif: fc.constant('ui-serif, Georgia, serif'),
      mono: fc.constant('ui-monospace, monospace'),
    }),
    fontSize: fc.record({
      xs: fc.constant('12px'),
      sm: fc.constant('14px'),
      base: fc.constant('16px'),
      lg: fc.constant('18px'),
      xl: fc.constant('20px'),
      '2xl': fc.constant('24px'),
      '3xl': fc.constant('30px'),
      '4xl': fc.constant('36px'),
    }),
    fontWeight: fc.record({
      normal: fc.constant(400),
      medium: fc.constant(500),
      semibold: fc.constant(600),
      bold: fc.constant(700),
    }),
    lineHeight: fc.record({
      tight: fc.constant('1.25'),
      normal: fc.constant('1.5'),
      relaxed: fc.constant('1.75'),
    }),
  }),
  shadows: fc.record({
    sm: fc.constant('0 1px 2px 0 rgb(0 0 0 / 0.05)'),
    md: fc.constant('0 4px 6px -1px rgb(0 0 0 / 0.1)'),
    lg: fc.constant('0 10px 15px -3px rgb(0 0 0 / 0.1)'),
    xl: fc.constant('0 20px 25px -5px rgb(0 0 0 / 0.1)'),
  }),
  radius: fc.record({
    none: fc.constant('0'),
    sm: fc.constant('4px'),
    md: fc.constant('8px'),
    lg: fc.constant('12px'),
    xl: fc.constant('16px'),
    full: fc.constant('9999px'),
  }),
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Design Tokens', () => {
  describe('getDefaultDesignTokens', () => {
    it('returns a valid DesignTokens object', () => {
      const tokens = getDefaultDesignTokens();
      
      expect(tokens).toBeDefined();
      expect(tokens.breakpoints).toBeDefined();
      expect(tokens.colors).toBeDefined();
      expect(tokens.spacing).toBeDefined();
      expect(tokens.typography).toBeDefined();
      expect(tokens.shadows).toBeDefined();
      expect(tokens.radius).toBeDefined();
    });

    it('returns a deep clone (mutations do not affect original)', () => {
      const tokens1 = getDefaultDesignTokens();
      const tokens2 = getDefaultDesignTokens();
      
      tokens1.colors.primary[500] = '#000000';
      
      expect(tokens2.colors.primary[500]).not.toBe('#000000');
    });
  });


  /**
   * Property 8: Design Tokens 约束注入完整性
   * 
   * *For any* DesignTokens configuration, the formatted LLM string SHALL contain
   * all color token names and all spacing token names.
   * 
   * **Feature: showcase-design-system, Property 8: Design Tokens 约束注入完整性**
   * **Validates: Requirements 7.1, 7.2**
   */
  describe('Property 8: Design Tokens 约束注入完整性', () => {
    it('formatTokensForLLM contains all color token names', () => {
      fc.assert(
        fc.property(designTokensArb, (tokens) => {
          const formatted = formatTokensForLLM(tokens);
          const colorNames = getColorTokenNames(tokens);
          
          // All color token names should appear in the formatted string
          for (const colorName of colorNames) {
            expect(formatted).toContain(colorName);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('formatTokensForLLM contains all spacing token names', () => {
      fc.assert(
        fc.property(designTokensArb, (tokens) => {
          const formatted = formatTokensForLLM(tokens);
          const spacingNames = getSpacingTokenNames(tokens);
          
          // All spacing token names should appear in the formatted string
          for (const spacingName of spacingNames) {
            expect(formatted).toContain(spacingName);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('formatTokensForLLM contains Design Tokens header', () => {
      fc.assert(
        fc.property(designTokensArb, (tokens) => {
          const formatted = formatTokensForLLM(tokens);
          
          // Should contain the required header
          expect(formatted).toContain('## Design Tokens (MUST USE)');
        }),
        { numRuns: 100 }
      );
    });

    it('formatTokensForLLM contains instruction to use tokens', () => {
      fc.assert(
        fc.property(designTokensArb, (tokens) => {
          const formatted = formatTokensForLLM(tokens);
          
          // Should contain instruction about using Design Tokens
          expect(formatted).toContain('Use Design Tokens instead of hardcoded values');
        }),
        { numRuns: 100 }
      );
    });

    it('formatTokensForLLM contains all section headers', () => {
      const tokens = getDefaultDesignTokens();
      const formatted = formatTokensForLLM(tokens);
      
      // Should contain all section headers
      expect(formatted).toContain('### Colors');
      expect(formatted).toContain('### Spacing');
      expect(formatted).toContain('### Typography');
      expect(formatted).toContain('### Shadows');
      expect(formatted).toContain('### Border Radius');
      expect(formatted).toContain('### Breakpoints');
    });
  });
});

describe('Color Token Validation', () => {
  /**
   * Property 8b: Color token validation correctness
   * 
   * *For any* color value that exists in the design tokens, isValidColorToken
   * should return true.
   * 
   * **Feature: showcase-design-system, Property 8: Design Tokens 约束注入完整性**
   * **Validates: Requirements 7.1, 7.2**
   */
  it('isValidColorToken returns true for colors in tokens', () => {
    fc.assert(
      fc.property(
        colorTokensArb,
        fc.constantFrom('primary', 'secondary', 'neutral', 'success', 'warning', 'error') as fc.Arbitrary<keyof ColorTokens>,
        fc.constantFrom(50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950) as fc.Arbitrary<keyof ColorScale>,
        (colors, colorName, shade) => {
          const tokens = getDefaultDesignTokens();
          tokens.colors = colors;
          
          const colorValue = colors[colorName][shade];
          expect(isValidColorToken(colorValue, tokens)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isValidColorToken returns false for random colors not in tokens', () => {
    fc.assert(
      fc.property(hexColorArb, (randomColor) => {
        const tokens = getDefaultDesignTokens();
        
        // Check if this random color happens to be in the tokens
        const isInTokens = Object.values(tokens.colors).some((scale: ColorScale) =>
          Object.values(scale).some((value: string) => 
            value.toLowerCase() === randomColor.toLowerCase()
          )
        );
        
        // If not in tokens, should return false
        if (!isInTokens) {
          expect(isValidColorToken(randomColor, tokens)).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Color Token Suggestion', () => {
  /**
   * Property 8c: Color token suggestion correctness
   * 
   * *For any* color value that exists in the design tokens, suggestColorToken
   * should return a valid token path.
   * 
   * **Feature: showcase-design-system, Property 8: Design Tokens 约束注入完整性**
   * **Validates: Requirements 7.1, 7.2**
   */
  it('suggestColorToken returns valid path for colors in tokens', () => {
    const tokens = getDefaultDesignTokens();
    
    // Test with actual token values
    const primaryColor = tokens.colors.primary[500];
    const suggestion = suggestColorToken(primaryColor, tokens);
    
    expect(suggestion).toBe('colors.primary.500');
  });

  it('suggestColorToken returns null for colors not in tokens', () => {
    fc.assert(
      fc.property(hexColorArb, (randomColor) => {
        const tokens = getDefaultDesignTokens();
        
        // Check if this random color happens to be in the tokens
        const isInTokens = Object.values(tokens.colors).some((scale: ColorScale) =>
          Object.values(scale).some((value: string) => 
            value.toLowerCase() === randomColor.toLowerCase()
          )
        );
        
        // If not in tokens, should return null
        if (!isInTokens) {
          expect(suggestColorToken(randomColor, tokens)).toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('suggestColorToken is case-insensitive', () => {
    const tokens = getDefaultDesignTokens();
    const primaryColor = tokens.colors.primary[500];
    
    // Test with different cases
    expect(suggestColorToken(primaryColor.toLowerCase(), tokens)).toBe('colors.primary.500');
    expect(suggestColorToken(primaryColor.toUpperCase(), tokens)).toBe('colors.primary.500');
  });
});

describe('Token Name Extraction', () => {
  it('getColorTokenNames returns all semantic color names', () => {
    const tokens = getDefaultDesignTokens();
    const colorNames = getColorTokenNames(tokens);
    
    expect(colorNames).toContain('primary');
    expect(colorNames).toContain('secondary');
    expect(colorNames).toContain('neutral');
    expect(colorNames).toContain('success');
    expect(colorNames).toContain('warning');
    expect(colorNames).toContain('error');
    expect(colorNames).toHaveLength(6);
  });

  it('getSpacingTokenNames returns all spacing names', () => {
    const tokens = getDefaultDesignTokens();
    const spacingNames = getSpacingTokenNames(tokens);
    
    expect(spacingNames).toContain('xs');
    expect(spacingNames).toContain('sm');
    expect(spacingNames).toContain('md');
    expect(spacingNames).toContain('lg');
    expect(spacingNames).toContain('xl');
    expect(spacingNames).toContain('2xl');
    expect(spacingNames).toContain('3xl');
    expect(spacingNames).toHaveLength(7);
  });
});
