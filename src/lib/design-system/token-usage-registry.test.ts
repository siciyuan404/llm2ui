/**
 * @file token-usage-registry.test.ts
 * @description TokenUsageRegistry 属性测试
 * 
 * **Feature: token-component-example-mapping**
 * 
 * Property 1: TokenUsage Category Completeness
 * Property 2: TokenUsage Field Validity
 * Property 3: TokenUsage Component Coverage
 * Property 4: TokenUsage LLM Format Inclusion
 * 
 * @module lib/design-system/token-usage-registry.test
 * @requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  TokenUsageRegistry,
  defaultTokenUsageRegistry,
  initializeDefaultTokenUsageRegistry,
  COLOR_TOKEN_USAGES,
  SPACING_TOKEN_USAGES,
  TYPOGRAPHY_TOKEN_USAGES,
  type TokenUsage,
  type TokenCategory,
} from './token-usage-registry';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid token categories
 */
const tokenCategoryArb: fc.Arbitrary<TokenCategory> = fc.constantFrom(
  'colors',
  'spacing',
  'typography',
  'shadows',
  'radius'
);

/**
 * Generator for non-empty string
 */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

/**
 * Generator for component name (PascalCase)
 */
const componentNameArb = fc.constantFrom(
  'Button', 'Input', 'Text', 'Label', 'Container', 'Row', 'Column', 
  'Card', 'Badge', 'Link', 'Heading', 'Select', 'Checkbox'
);

/**
 * Generator for prop name
 */
const propNameArb = fc.constantFrom(
  'variant', 'className', 'size', 'gap', 'type', 'placeholder'
);

/**
 * Generator for valid TokenUsage
 */
const tokenUsageArb: fc.Arbitrary<TokenUsage> = fc.record({
  tokenPath: nonEmptyStringArb.map(s => `category.${s}`),
  category: tokenCategoryArb,
  applicableComponents: fc.array(componentNameArb, { minLength: 1, maxLength: 5 }),
  applicableProps: fc.array(propNameArb, { minLength: 1, maxLength: 3 }),
  usageExample: nonEmptyStringArb,
  description: nonEmptyStringArb,
});

// ============================================================================
// Property Tests
// ============================================================================

describe('TokenUsageRegistry', () => {
  let registry: TokenUsageRegistry;

  beforeEach(() => {
    registry = new TokenUsageRegistry();
  });

  describe('Basic Operations', () => {
    it('should register and retrieve token usage', () => {
      fc.assert(
        fc.property(tokenUsageArb, (usage) => {
          registry.clear();
          registry.registerUsage(usage);
          
          const retrieved = registry.getUsage(usage.tokenPath);
          expect(retrieved).toBeDefined();
          expect(retrieved?.tokenPath).toBe(usage.tokenPath);
          expect(retrieved?.category).toBe(usage.category);
        }),
        { numRuns: 100 }
      );
    });

    it('should return undefined for non-existent token path', () => {
      const result = registry.getUsage('non.existent.path');
      expect(result).toBeUndefined();
    });
  });

  /**
   * Property 1: TokenUsage Category Completeness
   * 
   * *For any* token category (colors, spacing, typography, shadows, radius),
   * the TokenUsageRegistry SHALL contain at least one TokenUsage definition
   * for that category.
   * 
   * **Feature: token-component-example-mapping, Property 1: TokenUsage Category Completeness**
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: TokenUsage Category Completeness', () => {
    it('default registry has at least one usage for colors category', () => {
      initializeDefaultTokenUsageRegistry();
      const usages = defaultTokenUsageRegistry.getUsagesByCategory('colors');
      expect(usages.length).toBeGreaterThan(0);
    });

    it('default registry has at least one usage for spacing category', () => {
      initializeDefaultTokenUsageRegistry();
      const usages = defaultTokenUsageRegistry.getUsagesByCategory('spacing');
      expect(usages.length).toBeGreaterThan(0);
    });

    it('default registry has at least one usage for typography category', () => {
      initializeDefaultTokenUsageRegistry();
      const usages = defaultTokenUsageRegistry.getUsagesByCategory('typography');
      expect(usages.length).toBeGreaterThan(0);
    });

    it('hasCategory returns true for populated categories', () => {
      fc.assert(
        fc.property(tokenUsageArb, (usage) => {
          registry.clear();
          registry.registerUsage(usage);
          
          expect(registry.hasCategory(usage.category)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: TokenUsage Field Validity
   * 
   * *For any* TokenUsage object in the registry, it SHALL contain non-empty
   * values for: tokenPath, category, applicableComponents (at least one),
   * applicableProps (at least one), usageExample, and description.
   * 
   * **Feature: token-component-example-mapping, Property 2: TokenUsage Field Validity**
   * **Validates: Requirements 1.2**
   */
  describe('Property 2: TokenUsage Field Validity', () => {
    it('all preset color token usages have valid fields', () => {
      for (const usage of COLOR_TOKEN_USAGES) {
        expect(usage.tokenPath).toBeTruthy();
        expect(usage.category).toBe('colors');
        expect(usage.applicableComponents.length).toBeGreaterThan(0);
        expect(usage.applicableProps.length).toBeGreaterThan(0);
        expect(usage.usageExample).toBeTruthy();
        expect(usage.description).toBeTruthy();
      }
    });

    it('all preset spacing token usages have valid fields', () => {
      for (const usage of SPACING_TOKEN_USAGES) {
        expect(usage.tokenPath).toBeTruthy();
        expect(usage.category).toBe('spacing');
        expect(usage.applicableComponents.length).toBeGreaterThan(0);
        expect(usage.applicableProps.length).toBeGreaterThan(0);
        expect(usage.usageExample).toBeTruthy();
        expect(usage.description).toBeTruthy();
      }
    });

    it('all preset typography token usages have valid fields', () => {
      for (const usage of TYPOGRAPHY_TOKEN_USAGES) {
        expect(usage.tokenPath).toBeTruthy();
        expect(usage.category).toBe('typography');
        expect(usage.applicableComponents.length).toBeGreaterThan(0);
        expect(usage.applicableProps.length).toBeGreaterThan(0);
        expect(usage.usageExample).toBeTruthy();
        expect(usage.description).toBeTruthy();
      }
    });

    it('rejects token usage with empty applicableComponents', () => {
      const invalidUsage: TokenUsage = {
        tokenPath: 'test.path',
        category: 'colors',
        applicableComponents: [],
        applicableProps: ['className'],
        usageExample: 'example',
        description: 'description',
      };
      
      expect(() => registry.registerUsage(invalidUsage)).toThrow();
    });

    it('rejects token usage with empty applicableProps', () => {
      const invalidUsage: TokenUsage = {
        tokenPath: 'test.path',
        category: 'colors',
        applicableComponents: ['Button'],
        applicableProps: [],
        usageExample: 'example',
        description: 'description',
      };
      
      expect(() => registry.registerUsage(invalidUsage)).toThrow();
    });
  });


  /**
   * Property 3: TokenUsage Component Coverage
   * 
   * *For any* token category, the TokenUsage entries for that category SHALL
   * specify at least one applicable component that supports the corresponding
   * prop type (color props for colors, spacing props for spacing, text props
   * for typography).
   * 
   * **Feature: token-component-example-mapping, Property 3: TokenUsage Component Coverage**
   * **Validates: Requirements 1.3, 1.4, 1.5**
   */
  describe('Property 3: TokenUsage Component Coverage', () => {
    beforeEach(() => {
      initializeDefaultTokenUsageRegistry();
    });

    it('color tokens specify components that support color-related props', () => {
      const colorUsages = defaultTokenUsageRegistry.getUsagesByCategory('colors');
      
      // Color tokens should include variant or className props
      for (const usage of colorUsages) {
        const hasColorProp = usage.applicableProps.some(
          prop => prop === 'variant' || prop === 'className'
        );
        expect(hasColorProp).toBe(true);
      }
    });

    it('spacing tokens specify components that support spacing-related props', () => {
      const spacingUsages = defaultTokenUsageRegistry.getUsagesByCategory('spacing');
      
      // Spacing tokens should include gap or className props
      for (const usage of spacingUsages) {
        const hasSpacingProp = usage.applicableProps.some(
          prop => prop === 'gap' || prop === 'className'
        );
        expect(hasSpacingProp).toBe(true);
      }
    });

    it('typography tokens specify components that support text-related props', () => {
      const typographyUsages = defaultTokenUsageRegistry.getUsagesByCategory('typography');
      
      // Typography tokens should include className prop
      for (const usage of typographyUsages) {
        const hasTextProp = usage.applicableProps.includes('className');
        expect(hasTextProp).toBe(true);
      }
    });

    it('getTokensForComponent returns tokens applicable to that component', () => {
      fc.assert(
        fc.property(componentNameArb, (componentName) => {
          const tokens = defaultTokenUsageRegistry.getTokensForComponent(componentName);
          
          // All returned tokens should have this component in applicableComponents
          for (const token of tokens) {
            expect(token.applicableComponents).toContain(componentName);
          }
        }),
        { numRuns: 50 }
      );
    });

    it('getTokensForProp returns tokens applicable to that prop', () => {
      fc.assert(
        fc.property(propNameArb, (propName) => {
          const tokens = defaultTokenUsageRegistry.getTokensForProp(propName);
          
          // All returned tokens should have this prop in applicableProps
          for (const token of tokens) {
            expect(token.applicableProps).toContain(propName);
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 4: TokenUsage LLM Format Inclusion
   * 
   * *For any* TokenUsageRegistry, when formatted for LLM, the output string
   * SHALL contain all registered token paths and their applicable components.
   * 
   * **Feature: token-component-example-mapping, Property 4: TokenUsage LLM Format Inclusion**
   * **Validates: Requirements 1.6**
   */
  describe('Property 4: TokenUsage LLM Format Inclusion', () => {
    it('formatForLLM contains all registered token paths', () => {
      fc.assert(
        fc.property(
          fc.array(tokenUsageArb, { minLength: 1, maxLength: 5 }),
          (usages) => {
            registry.clear();
            registry.registerUsages(usages);
            
            const formatted = registry.formatForLLM();
            
            // All token paths should appear in the formatted string
            for (const usage of usages) {
              expect(formatted).toContain(usage.tokenPath);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('formatForLLM contains applicable components for each token', () => {
      fc.assert(
        fc.property(
          fc.array(tokenUsageArb, { minLength: 1, maxLength: 5 }),
          (usages) => {
            registry.clear();
            registry.registerUsages(usages);
            
            const formatted = registry.formatForLLM();
            
            // Each usage's components should appear in the formatted string
            for (const usage of usages) {
              for (const component of usage.applicableComponents) {
                expect(formatted).toContain(component);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('formatForLLM contains Token Usage Guide header', () => {
      initializeDefaultTokenUsageRegistry();
      const formatted = defaultTokenUsageRegistry.formatForLLM();
      
      expect(formatted).toContain('## Token Usage Guide');
    });

    it('formatForLLM contains category section headers', () => {
      initializeDefaultTokenUsageRegistry();
      const formatted = defaultTokenUsageRegistry.formatForLLM();
      
      expect(formatted).toContain('### Color Tokens');
      expect(formatted).toContain('### Spacing Tokens');
      expect(formatted).toContain('### Typography Tokens');
    });

    it('formatForLLM includes descriptions for all tokens', () => {
      fc.assert(
        fc.property(
          fc.array(tokenUsageArb, { minLength: 1, maxLength: 5 }),
          (usages) => {
            registry.clear();
            registry.registerUsages(usages);
            
            const formatted = registry.formatForLLM();
            
            // Each usage's description should appear in the formatted string
            for (const usage of usages) {
              expect(formatted).toContain(usage.description);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('default registry formatForLLM contains all preset token paths', () => {
      initializeDefaultTokenUsageRegistry();
      const formatted = defaultTokenUsageRegistry.formatForLLM();
      
      // Check color tokens
      for (const usage of COLOR_TOKEN_USAGES) {
        expect(formatted).toContain(usage.tokenPath);
      }
      
      // Check spacing tokens
      for (const usage of SPACING_TOKEN_USAGES) {
        expect(formatted).toContain(usage.tokenPath);
      }
      
      // Check typography tokens
      for (const usage of TYPOGRAPHY_TOKEN_USAGES) {
        expect(formatted).toContain(usage.tokenPath);
      }
    });
  });

  describe('Registry Operations', () => {
    it('clear removes all registered usages', () => {
      fc.assert(
        fc.property(
          fc.array(tokenUsageArb, { minLength: 1, maxLength: 5 }),
          (usages) => {
            registry.registerUsages(usages);
            registry.clear();
            
            expect(registry.getAllTokenPaths()).toHaveLength(0);
            
            for (const category of ['colors', 'spacing', 'typography', 'shadows', 'radius'] as TokenCategory[]) {
              expect(registry.getUsagesByCategory(category)).toHaveLength(0);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('getUsageMap returns a copy of the usage map', () => {
      initializeDefaultTokenUsageRegistry();
      const map1 = defaultTokenUsageRegistry.getUsageMap();
      const map2 = defaultTokenUsageRegistry.getUsageMap();
      
      // Should be different references
      expect(map1).not.toBe(map2);
      expect(map1.colors).not.toBe(map2.colors);
    });

    it('getAllTokenPaths returns all registered paths', () => {
      fc.assert(
        fc.property(
          fc.array(tokenUsageArb, { minLength: 1, maxLength: 5 }),
          (usages) => {
            registry.clear();
            registry.registerUsages(usages);
            
            const paths = registry.getAllTokenPaths();
            
            for (const usage of usages) {
              expect(paths).toContain(usage.tokenPath);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
