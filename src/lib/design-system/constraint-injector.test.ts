/**
 * @file constraint-injector.test.ts
 * @description 约束注入器属性测试
 * 
 * **Feature: showcase-design-system**
 * 
 * Property 8: Design Tokens 约束注入完整性
 * 
 * @module lib/design-system/constraint-injector.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import {
  injectConstraints,
  validateConstraintInjection,
  clearConstraintCache,
  getCachedConstraints,
  type ConstraintInjectionConfig,
} from './constraint-injector';
import {
  getDefaultDesignTokens,
  type DesignTokens,
  type ColorScale,
  type ColorTokens,
  type SpacingTokens,
} from './design-tokens';
import { ComponentRegistry } from '../core/component-registry';
import { ComponentCatalog } from '../core/component-catalog';
import type { ComponentDefinition } from '../core/component-registry';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a mock React component for testing
 */
const createMockComponent = (name: string): React.ComponentType<Record<string, unknown>> => {
  const MockComponent: React.FC<Record<string, unknown>> = () => null;
  MockComponent.displayName = name;
  return MockComponent;
};

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

/**
 * Generator for base prompt strings
 */
const basePromptArb = fc.string({ minLength: 10, maxLength: 200 });

// ============================================================================
// Property Tests
// ============================================================================

describe('Constraint Injector', () => {
  let registry: ComponentRegistry;
  let catalog: ComponentCatalog;

  beforeEach(() => {
    clearConstraintCache();
    registry = new ComponentRegistry();
    catalog = new ComponentCatalog(registry);
  });

  /**
   * Property 8: Design Tokens 约束注入完整性
   * 
   * *For any* ConstraintInjectionConfig with designTokens and catalog, the generated
   * prompt string SHALL contain all color token names, all spacing token names, and
   * all registered component names.
   * 
   * **Feature: showcase-design-system, Property 8: Design Tokens 约束注入完整性**
   * **Validates: Requirements 7.1, 7.2**
   */
  describe('Property 8: Design Tokens 约束注入完整性', () => {
    it('injected prompt contains all color token names', () => {
      fc.assert(
        fc.property(designTokensArb, basePromptArb, (tokens, basePrompt) => {
          const testRegistry = new ComponentRegistry();
          testRegistry.register({
            name: 'Button',
            component: createMockComponent('Button'),
            category: 'input',
          });
          const testCatalog = new ComponentCatalog(testRegistry);

          const config: ConstraintInjectionConfig = {
            designTokens: tokens,
            catalog: testCatalog,
          };

          const injectedPrompt = injectConstraints(basePrompt, config);
          const colorNames = Object.keys(tokens.colors);

          for (const colorName of colorNames) {
            expect(injectedPrompt).toContain(colorName);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('injected prompt contains all spacing token names', () => {
      fc.assert(
        fc.property(designTokensArb, basePromptArb, (tokens, basePrompt) => {
          const testRegistry = new ComponentRegistry();
          testRegistry.register({
            name: 'Button',
            component: createMockComponent('Button'),
            category: 'input',
          });
          const testCatalog = new ComponentCatalog(testRegistry);

          const config: ConstraintInjectionConfig = {
            designTokens: tokens,
            catalog: testCatalog,
          };

          const injectedPrompt = injectConstraints(basePrompt, config);
          const spacingNames = Object.keys(tokens.spacing);

          for (const spacingName of spacingNames) {
            expect(injectedPrompt).toContain(spacingName);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('injected prompt contains all registered component names', () => {
      fc.assert(
        fc.property(
          designTokensArb,
          basePromptArb,
          fc.array(
            fc.constantFrom('Button', 'Input', 'Card', 'Container', 'Text'),
            { minLength: 1, maxLength: 5 }
          ),
          (tokens, basePrompt, componentNames) => {
            clearConstraintCache();
            const testRegistry = new ComponentRegistry();
            const uniqueNames = [...new Set(componentNames)];
            
            for (const name of uniqueNames) {
              testRegistry.register({
                name,
                component: createMockComponent(name),
                category: 'input',
              });
            }
            
            const testCatalog = new ComponentCatalog(testRegistry);

            const config: ConstraintInjectionConfig = {
              designTokens: tokens,
              catalog: testCatalog,
            };

            const injectedPrompt = injectConstraints(basePrompt, config);

            for (const name of uniqueNames) {
              expect(injectedPrompt).toContain(name);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('injected prompt contains Design Tokens header', () => {
      fc.assert(
        fc.property(designTokensArb, basePromptArb, (tokens, basePrompt) => {
          const testRegistry = new ComponentRegistry();
          testRegistry.register({
            name: 'Button',
            component: createMockComponent('Button'),
          });
          const testCatalog = new ComponentCatalog(testRegistry);

          const config: ConstraintInjectionConfig = {
            designTokens: tokens,
            catalog: testCatalog,
          };

          const injectedPrompt = injectConstraints(basePrompt, config);

          expect(injectedPrompt).toContain('## Design Tokens (MUST USE)');
        }),
        { numRuns: 100 }
      );
    });

    it('injected prompt preserves the base prompt', () => {
      fc.assert(
        fc.property(designTokensArb, basePromptArb, (tokens, basePrompt) => {
          const testRegistry = new ComponentRegistry();
          testRegistry.register({
            name: 'Button',
            component: createMockComponent('Button'),
          });
          const testCatalog = new ComponentCatalog(testRegistry);

          const config: ConstraintInjectionConfig = {
            designTokens: tokens,
            catalog: testCatalog,
          };

          const injectedPrompt = injectConstraints(basePrompt, config);

          expect(injectedPrompt).toContain(basePrompt);
        }),
        { numRuns: 100 }
      );
    });
  });
});

describe('Constraint Injector Caching', () => {
  beforeEach(() => {
    clearConstraintCache();
  });

  it('getCachedConstraints returns undefined before injection', () => {
    const registry = new ComponentRegistry();
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
    });
    const catalog = new ComponentCatalog(registry);

    const config: ConstraintInjectionConfig = {
      designTokens: getDefaultDesignTokens(),
      catalog,
    };

    expect(getCachedConstraints(config)).toBeUndefined();
  });

  it('getCachedConstraints returns cached value after injection', () => {
    const registry = new ComponentRegistry();
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
    });
    const catalog = new ComponentCatalog(registry);

    const config: ConstraintInjectionConfig = {
      designTokens: getDefaultDesignTokens(),
      catalog,
    };

    injectConstraints('test prompt', config);

    const cached = getCachedConstraints(config);
    expect(cached).toBeDefined();
    expect(cached).toContain('## Design Tokens');
  });

  it('clearConstraintCache clears the cache', () => {
    const registry = new ComponentRegistry();
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
    });
    const catalog = new ComponentCatalog(registry);

    const config: ConstraintInjectionConfig = {
      designTokens: getDefaultDesignTokens(),
      catalog,
    };

    injectConstraints('test prompt', config);
    expect(getCachedConstraints(config)).toBeDefined();

    clearConstraintCache();
    expect(getCachedConstraints(config)).toBeUndefined();
  });
});

describe('Constraint Injector with Screen Size', () => {
  beforeEach(() => {
    clearConstraintCache();
  });

  it('includes responsive guidelines when targetScreenSize is specified', () => {
    const registry = new ComponentRegistry();
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
    });
    const catalog = new ComponentCatalog(registry);

    const config: ConstraintInjectionConfig = {
      designTokens: getDefaultDesignTokens(),
      catalog,
      targetScreenSize: 'mobile',
    };

    const injectedPrompt = injectConstraints('test prompt', config);

    expect(injectedPrompt).toContain('## Responsive Guidelines');
    expect(injectedPrompt).toContain('mobile');
  });

  it('does not include responsive guidelines when targetScreenSize is not specified', () => {
    const registry = new ComponentRegistry();
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
    });
    const catalog = new ComponentCatalog(registry);

    const config: ConstraintInjectionConfig = {
      designTokens: getDefaultDesignTokens(),
      catalog,
    };

    const injectedPrompt = injectConstraints('test prompt', config);

    expect(injectedPrompt).not.toContain('## Responsive Guidelines');
  });
});
