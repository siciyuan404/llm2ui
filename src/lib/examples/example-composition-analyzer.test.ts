/**
 * @file example-composition-analyzer.test.ts
 * @description 案例组成分析器属性测试
 * @module lib/examples/example-composition-analyzer.test
 * 
 * Property Tests:
 * - Property 9: ExampleComposition Completeness
 * - Property 10: ExampleComposition Field Validity
 * - Property 11: ExampleComposition Auto-Generation Round Trip
 * - Property 12: ExampleComposition Content Completeness
 * 
 * @requirements 3.1, 3.2, 3.3, 3.5, 3.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  ExampleCompositionAnalyzer,
  analyzeExampleComposition,
  formatCompositionForLLM,
  getPresetComposition,
  getAllPresetCompositions,
  isPresetCompositionsInitialized,
  initializePresetCompositions,
  clearPresetCompositions,
  type ExampleComposition,
} from './example-composition-analyzer';
// PRESET_EXAMPLES 和 ExampleMetadata 从 shadcn 主题目录导入
import { PRESET_EXAMPLES, type ExampleMetadata } from '../themes/builtin/shadcn/examples/presets';
import type { UISchema, UIComponent } from '../../types';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Generate a valid UIComponent for testing
 */
const validUIComponentArb = fc.letrec((tie) => ({
  component: fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(s)),
    type: fc.constantFrom('Container', 'Button', 'Text', 'Card', 'Input', 'Label', 'Row', 'Column'),
    props: fc.option(
      fc.record({
        className: fc.option(
          fc.constantFrom(
            'p-4 bg-primary text-white',
            'flex gap-2 text-lg font-bold',
            'm-2 rounded-lg shadow-md',
            'text-sm text-muted-foreground',
            'w-full h-screen bg-slate-900'
          )
        ),
        variant: fc.option(fc.constantFrom('default', 'destructive', 'outline', 'secondary', 'ghost')),
        gap: fc.option(fc.constantFrom('xs', 'sm', 'md', 'lg', 'xl')),
      }),
      { nil: undefined }
    ),
    text: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
    children: fc.option(
      fc.array(tie('component') as fc.Arbitrary<UIComponent>, { minLength: 0, maxLength: 3 }),
      { nil: undefined }
    ),
  }) as fc.Arbitrary<UIComponent>,
})).component;

/**
 * Generate a valid UISchema for testing
 */
const validUISchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: validUIComponentArb,
});

/**
 * Count total components in a UIComponent tree
 */
function countComponents(node: UIComponent): number {
  let count = 1;
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countComponents(child);
    }
  }
  return count;
}

/**
 * Extract all component types from a UIComponent tree
 */
function extractAllTypes(node: UIComponent): Set<string> {
  const types = new Set<string>();
  if (node.type) {
    types.add(node.type);
  }
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      for (const type of extractAllTypes(child)) {
        types.add(type);
      }
    }
  }
  return types;
}

// ============================================================================
// Property 9: ExampleComposition Completeness
// ============================================================================

describe('Property 9: ExampleComposition Completeness', () => {
  /**
   * **Property 9: ExampleComposition Completeness**
   * *For any* preset example in the ExampleLibrary, there SHALL exist a corresponding ExampleComposition analysis.
   * **Validates: Requirements 3.1**
   */
  it('Property 9a: All preset examples have corresponding composition analysis', () => {
    // Ensure compositions are initialized
    initializePresetCompositions(PRESET_EXAMPLES);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...PRESET_EXAMPLES),
        (example: ExampleMetadata) => {
          const composition = getPresetComposition(example.id);
          
          // Every preset example should have a composition
          expect(composition).toBeDefined();
          expect(composition?.exampleId).toBe(example.id);
        }
      ),
      { numRuns: PRESET_EXAMPLES.length }
    );
  });

  it('Property 9b: getAllPresetCompositions returns compositions for all preset examples', () => {
    initializePresetCompositions(PRESET_EXAMPLES);
    
    const allCompositions = getAllPresetCompositions();
    
    // Should have same count as preset examples
    expect(allCompositions.length).toBe(PRESET_EXAMPLES.length);
    
    // Each composition should have a valid exampleId
    for (const composition of allCompositions) {
      expect(composition.exampleId).toBeTruthy();
      expect(PRESET_EXAMPLES.some(e => e.id === composition.exampleId)).toBe(true);
    }
  });

  it('Property 9c: isPresetCompositionsInitialized returns correct state', () => {
    clearPresetCompositions();
    expect(isPresetCompositionsInitialized()).toBe(false);
    
    initializePresetCompositions(PRESET_EXAMPLES);
    expect(isPresetCompositionsInitialized()).toBe(true);
    
    clearPresetCompositions();
    expect(isPresetCompositionsInitialized()).toBe(false);
  });
});

// ============================================================================
// Property 10: ExampleComposition Field Validity
// ============================================================================

describe('Property 10: ExampleComposition Field Validity', () => {
  let analyzer: ExampleCompositionAnalyzer;

  beforeEach(() => {
    analyzer = new ExampleCompositionAnalyzer();
  });

  /**
   * **Property 10: ExampleComposition Field Validity**
   * *For any* ExampleComposition object, it SHALL contain: a non-empty exampleId, at least one usedComponent, and non-empty compositionNotes.
   * **Validates: Requirements 3.2**
   */
  it('Property 10a: Analyzed compositions have valid required fields', () => {
    fc.assert(
      fc.property(
        validUISchemaArb,
        fc.string({ minLength: 1, maxLength: 50 }),
        (schema: UISchema, exampleId: string) => {
          const composition = analyzer.analyze(schema, exampleId);
          
          // exampleId should match input
          expect(composition.exampleId).toBe(exampleId);
          
          // usedComponents should have at least one component (the root)
          expect(composition.usedComponents.length).toBeGreaterThanOrEqual(1);
          
          // compositionNotes should be non-empty
          expect(composition.compositionNotes).toBeTruthy();
          expect(composition.compositionNotes.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10b: Preset example compositions have valid fields', () => {
    initializePresetCompositions(PRESET_EXAMPLES);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...PRESET_EXAMPLES),
        (example: ExampleMetadata) => {
          const composition = getPresetComposition(example.id);
          
          expect(composition).toBeDefined();
          if (composition) {
            // exampleId should be non-empty
            expect(composition.exampleId).toBeTruthy();
            
            // usedComponents should have at least one
            expect(composition.usedComponents.length).toBeGreaterThanOrEqual(1);
            
            // compositionNotes should be non-empty
            expect(composition.compositionNotes).toBeTruthy();
          }
        }
      ),
      { numRuns: PRESET_EXAMPLES.length }
    );
  });

  it('Property 10c: Invalid schema returns valid composition with empty arrays', () => {
    const invalidSchema = {} as UISchema;
    const composition = analyzer.analyze(invalidSchema, 'test-invalid');
    
    expect(composition.exampleId).toBe('test-invalid');
    expect(composition.usedComponents).toEqual([]);
    expect(composition.usedTokens).toEqual([]);
    expect(composition.layoutHierarchy).toBe('');
    expect(composition.compositionNotes).toBe('Invalid or empty schema');
  });
});

// ============================================================================
// Property 11: ExampleComposition Auto-Generation Round Trip
// ============================================================================

describe('Property 11: ExampleComposition Auto-Generation Round Trip', () => {
  let analyzer: ExampleCompositionAnalyzer;

  beforeEach(() => {
    analyzer = new ExampleCompositionAnalyzer();
  });

  /**
   * **Property 11: ExampleComposition Auto-Generation Round Trip**
   * *For any* valid UISchema, analyzing it with ExampleCompositionAnalyzer SHALL produce an ExampleComposition where usedComponents contains exactly the component types present in the schema.
   * **Validates: Requirements 3.3**
   */
  it('Property 11a: usedComponents contains exactly the component types in schema', () => {
    fc.assert(
      fc.property(
        validUISchemaArb,
        (schema: UISchema) => {
          const composition = analyzer.analyze(schema, 'test');
          
          // Extract all types from the schema
          const expectedTypes = extractAllTypes(schema.root);
          const actualTypes = new Set(composition.usedComponents);
          
          // The sets should be equal
          expect(actualTypes.size).toBe(expectedTypes.size);
          for (const type of expectedTypes) {
            expect(actualTypes.has(type)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11b: usedComponents are sorted alphabetically', () => {
    fc.assert(
      fc.property(
        validUISchemaArb,
        (schema: UISchema) => {
          const composition = analyzer.analyze(schema, 'test');
          
          // Check that usedComponents is sorted
          const sorted = [...composition.usedComponents].sort();
          expect(composition.usedComponents).toEqual(sorted);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11c: usedComponents has no duplicates', () => {
    fc.assert(
      fc.property(
        validUISchemaArb,
        (schema: UISchema) => {
          const composition = analyzer.analyze(schema, 'test');
          
          // Check for duplicates
          const uniqueComponents = new Set(composition.usedComponents);
          expect(composition.usedComponents.length).toBe(uniqueComponents.size);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 12: ExampleComposition Content Completeness
// ============================================================================

describe('Property 12: ExampleComposition Content Completeness', () => {
  let analyzer: ExampleCompositionAnalyzer;

  beforeEach(() => {
    analyzer = new ExampleCompositionAnalyzer();
  });

  /**
   * **Property 12: ExampleComposition Content Completeness**
   * *For any* ExampleComposition, the layoutHierarchy SHALL be non-empty and describe the nesting structure, AND the usedTokens array SHALL contain entries for any token-like values found in the schema.
   * **Validates: Requirements 3.5, 3.6**
   */
  it('Property 12a: layoutHierarchy is non-empty for valid schemas', () => {
    fc.assert(
      fc.property(
        validUISchemaArb,
        (schema: UISchema) => {
          const composition = analyzer.analyze(schema, 'test');
          
          // layoutHierarchy should be non-empty
          expect(composition.layoutHierarchy).toBeTruthy();
          expect(composition.layoutHierarchy.length).toBeGreaterThan(0);
          
          // layoutHierarchy should contain the root component type
          expect(composition.layoutHierarchy).toContain(schema.root.type);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 12b: layoutHierarchy describes nesting structure', () => {
    // Create a schema with known nesting
    const nestedSchema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          {
            id: 'child1',
            type: 'Card',
            children: [
              { id: 'grandchild', type: 'Button' }
            ]
          }
        ]
      }
    };
    
    const composition = analyzer.analyze(nestedSchema, 'test-nested');
    
    // Should contain parent > child notation
    expect(composition.layoutHierarchy).toContain('Container');
    expect(composition.layoutHierarchy).toContain('>');
  });

  it('Property 12c: usedTokens contains entries for className token values', () => {
    // Create a schema with known token values
    const schemaWithTokens: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        props: {
          className: 'p-4 bg-primary text-white gap-2'
        },
        children: [
          {
            id: 'button',
            type: 'Button',
            props: {
              variant: 'default',
              className: 'text-lg font-bold'
            }
          }
        ]
      }
    };
    
    const composition = analyzer.analyze(schemaWithTokens, 'test-tokens');
    
    // Should have detected tokens
    expect(composition.usedTokens.length).toBeGreaterThan(0);
    
    // Should have spacing tokens (p-4, gap-2)
    const spacingTokens = composition.usedTokens.filter(t => t.path.startsWith('spacing.'));
    expect(spacingTokens.length).toBeGreaterThan(0);
    
    // Should have color tokens (bg-primary)
    const colorTokens = composition.usedTokens.filter(t => t.path.startsWith('colors.'));
    expect(colorTokens.length).toBeGreaterThan(0);
    
    // Should have typography tokens (text-lg, font-bold)
    const typographyTokens = composition.usedTokens.filter(t => t.path.startsWith('typography.'));
    expect(typographyTokens.length).toBeGreaterThan(0);
  });

  it('Property 12d: usedTokens includes variant-based tokens', () => {
    const schemaWithVariant: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Button',
        props: {
          variant: 'destructive'
        }
      }
    };
    
    const composition = analyzer.analyze(schemaWithVariant, 'test-variant');
    
    // Should have detected the variant token
    const variantToken = composition.usedTokens.find(t => 
      t.path === 'colors.error' && t.usedIn.includes('variant')
    );
    expect(variantToken).toBeDefined();
  });

  it('Property 12e: usedTokens includes gap prop tokens', () => {
    const schemaWithGap: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Row',
        props: {
          gap: 'md'
        }
      }
    };
    
    const composition = analyzer.analyze(schemaWithGap, 'test-gap');
    
    // Should have detected the gap token
    const gapToken = composition.usedTokens.find(t => 
      t.path === 'spacing.md' && t.usedIn.includes('gap')
    );
    expect(gapToken).toBeDefined();
  });
});

// ============================================================================
// formatForLLM Tests
// ============================================================================

describe('formatForLLM', () => {
  let analyzer: ExampleCompositionAnalyzer;

  beforeEach(() => {
    analyzer = new ExampleCompositionAnalyzer();
  });

  it('should format composition with all sections', () => {
    const composition: ExampleComposition = {
      exampleId: 'test-example',
      usedComponents: ['Button', 'Card', 'Container'],
      usedTokens: [
        { path: 'colors.primary', usedIn: 'Button variant' },
        { path: 'spacing.md', usedIn: 'Container className' },
      ],
      layoutHierarchy: 'Container > [Card > Button]',
      compositionNotes: 'Root component: Container. Uses 3 component types.',
    };
    
    const formatted = analyzer.formatForLLM(composition);
    
    // Should contain example ID
    expect(formatted).toContain('test-example');
    
    // Should contain components section
    expect(formatted).toContain('Components Used');
    expect(formatted).toContain('Button');
    expect(formatted).toContain('Card');
    expect(formatted).toContain('Container');
    
    // Should contain tokens section
    expect(formatted).toContain('Tokens Used');
    expect(formatted).toContain('colors.primary');
    expect(formatted).toContain('spacing.md');
    
    // Should contain layout hierarchy
    expect(formatted).toContain('Layout Hierarchy');
    expect(formatted).toContain('Container > [Card > Button]');
    
    // Should contain composition notes
    expect(formatted).toContain('Composition Notes');
  });

  it('should handle empty composition gracefully', () => {
    const emptyComposition: ExampleComposition = {
      exampleId: '',
      usedComponents: [],
      usedTokens: [],
      layoutHierarchy: '',
      compositionNotes: '',
    };
    
    const formatted = analyzer.formatForLLM(emptyComposition);
    
    // Should still produce valid output
    expect(formatted).toBeTruthy();
    expect(formatted).toContain('Components Used');
    expect(formatted).toContain('None');
  });

  it('should use convenience function formatCompositionForLLM', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        props: { className: 'p-4' }
      }
    };
    
    const composition = analyzeExampleComposition(schema, 'test');
    const formatted = formatCompositionForLLM(composition);
    
    expect(formatted).toContain('Container');
    expect(formatted).toContain('test');
  });
});

// ============================================================================
// analyzeMultiple Tests
// ============================================================================

describe('analyzeMultiple', () => {
  let analyzer: ExampleCompositionAnalyzer;

  beforeEach(() => {
    analyzer = new ExampleCompositionAnalyzer();
  });

  it('should analyze multiple examples at once', () => {
    const examples = PRESET_EXAMPLES.slice(0, 3).map(e => ({
      id: e.id,
      schema: e.schema,
    }));
    
    const compositions = analyzer.analyzeMultiple(examples);
    
    expect(compositions.length).toBe(3);
    
    for (let i = 0; i < examples.length; i++) {
      expect(compositions[i].exampleId).toBe(examples[i].id);
      expect(compositions[i].usedComponents.length).toBeGreaterThan(0);
    }
  });

  it('should handle empty array', () => {
    const compositions = analyzer.analyzeMultiple([]);
    expect(compositions).toEqual([]);
  });
});
