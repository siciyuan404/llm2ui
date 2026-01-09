/**
 * @file component-mapping-registry.test.ts
 * @description ComponentMappingRegistry 属性测试
 * 
 * **Feature: token-component-example-mapping**
 * 
 * Property 5: ComponentTokenMapping Completeness
 * Property 6: ComponentTokenMapping Field Validity
 * Property 7: Enum Prop Token Mapping
 * Property 8: ComponentTokenMapping LLM Format Inclusion
 * 
 * @module lib/design-system/component-mapping-registry.test
 * @requirements 2.1, 2.2, 2.6, 2.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  ComponentMappingRegistry,
  defaultComponentMappingRegistry,
  initializeDefaultComponentMappingRegistry,
  ALL_COMPONENT_TOKEN_MAPPINGS,
  type ComponentTokenMapping,
  type PropTokenMapping,
} from './component-mapping-registry';
import type { TokenCategory } from './token-usage-registry';
import { initializeDefaultRegistry } from '../core/shadcn-components';

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
  'Card', 'Badge', 'Link', 'Heading', 'Textarea', 'Table'
);

/**
 * Generator for prop name
 */
const propNameArb = fc.constantFrom(
  'variant', 'className', 'size', 'gap', 'type', 'placeholder'
);

/**
 * Generator for valid PropTokenMapping
 */
const propTokenMappingArb: fc.Arbitrary<PropTokenMapping> = fc.record({
  propName: propNameArb,
  tokenCategories: fc.array(tokenCategoryArb, { minLength: 1, maxLength: 3 }),
  enumTokenMap: fc.option(
    fc.dictionary(
      fc.constantFrom('default', 'primary', 'secondary', 'sm', 'md', 'lg'),
      nonEmptyStringArb.map(s => `colors.${s}`)
    ),
    { nil: undefined }
  ),
  description: nonEmptyStringArb,
});

/**
 * Generator for valid ComponentTokenMapping
 */
const componentTokenMappingArb: fc.Arbitrary<ComponentTokenMapping> = fc.record({
  componentName: componentNameArb,
  propMappings: fc.array(propTokenMappingArb, { minLength: 1, maxLength: 5 }),
  styleTokens: fc.option(
    fc.record({
      colors: fc.option(fc.array(nonEmptyStringArb.map(s => `colors.${s}`), { minLength: 1, maxLength: 3 }), { nil: undefined }),
      spacing: fc.option(fc.array(nonEmptyStringArb.map(s => `spacing.${s}`), { minLength: 1, maxLength: 3 }), { nil: undefined }),
    }),
    { nil: undefined }
  ),
});

// ============================================================================
// Property Tests
// ============================================================================

describe('ComponentMappingRegistry', () => {
  let registry: ComponentMappingRegistry;

  beforeEach(() => {
    registry = new ComponentMappingRegistry();
  });

  describe('Basic Operations', () => {
    it('should register and retrieve component mapping', () => {
      fc.assert(
        fc.property(componentTokenMappingArb, (mapping) => {
          registry.clear();
          registry.registerMapping(mapping);
          
          const retrieved = registry.getMapping(mapping.componentName);
          expect(retrieved).toBeDefined();
          expect(retrieved?.componentName).toBe(mapping.componentName);
          expect(retrieved?.propMappings.length).toBe(mapping.propMappings.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should return undefined for non-existent component', () => {
      const result = registry.getMapping('NonExistentComponent');
      expect(result).toBeUndefined();
    });
  });


  /**
   * Property 5: ComponentTokenMapping Completeness
   * 
   * *For any* registered component in the ComponentCatalog, there SHALL exist
   * a corresponding ComponentTokenMapping in the ComponentMappingRegistry.
   * 
   * **Feature: token-component-example-mapping, Property 5: ComponentTokenMapping Completeness**
   * **Validates: Requirements 2.1**
   */
  describe('Property 5: ComponentTokenMapping Completeness', () => {
    beforeEach(() => {
      initializeDefaultRegistry();
      initializeDefaultComponentMappingRegistry();
    });

    it('default registry has mappings for core components', () => {
      const coreComponents = [
        'Button', 'Input', 'Text', 'Label', 'Container',
        'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter',
        'Table', 'TableHeader', 'TableBody', 'TableRow', 'TableHead', 'TableCell',
        'Textarea', 'Badge', 'Link'
      ];
      
      for (const componentName of coreComponents) {
        const mapping = defaultComponentMappingRegistry.getMapping(componentName);
        expect(mapping).toBeDefined();
        expect(mapping?.componentName).toBe(componentName);
      }
    });

    it('getAllComponentNames returns all registered component names', () => {
      const names = defaultComponentMappingRegistry.getAllComponentNames();
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('Button');
      expect(names).toContain('Container');
      expect(names).toContain('Text');
    });

    it('getAllMappings returns all registered mappings', () => {
      const mappings = defaultComponentMappingRegistry.getAllMappings();
      expect(mappings.length).toBe(ALL_COMPONENT_TOKEN_MAPPINGS.length);
    });

    it('hasMapping returns true for registered components', () => {
      fc.assert(
        fc.property(componentNameArb, (componentName) => {
          const isInPreset = ALL_COMPONENT_TOKEN_MAPPINGS.some(
            m => m.componentName === componentName
          );
          
          if (isInPreset) {
            expect(defaultComponentMappingRegistry.hasMapping(componentName)).toBe(true);
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 6: ComponentTokenMapping Field Validity
   * 
   * *For any* ComponentTokenMapping object, it SHALL contain: a non-empty
   * componentName matching a registered component, at least one propMapping
   * with valid propName, tokenCategories, and description.
   * 
   * **Feature: token-component-example-mapping, Property 6: ComponentTokenMapping Field Validity**
   * **Validates: Requirements 2.2**
   */
  describe('Property 6: ComponentTokenMapping Field Validity', () => {
    it('all preset mappings have valid componentName', () => {
      for (const mapping of ALL_COMPONENT_TOKEN_MAPPINGS) {
        expect(mapping.componentName).toBeTruthy();
        expect(mapping.componentName.trim().length).toBeGreaterThan(0);
      }
    });

    it('all preset mappings have at least one propMapping', () => {
      for (const mapping of ALL_COMPONENT_TOKEN_MAPPINGS) {
        expect(mapping.propMappings.length).toBeGreaterThan(0);
      }
    });

    it('all propMappings have valid fields', () => {
      for (const mapping of ALL_COMPONENT_TOKEN_MAPPINGS) {
        for (const propMapping of mapping.propMappings) {
          expect(propMapping.propName).toBeTruthy();
          expect(propMapping.propName.trim().length).toBeGreaterThan(0);
          expect(propMapping.tokenCategories.length).toBeGreaterThan(0);
          expect(propMapping.description).toBeTruthy();
          expect(propMapping.description.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it('rejects mapping with empty componentName', () => {
      const invalidMapping: ComponentTokenMapping = {
        componentName: '',
        propMappings: [
          {
            propName: 'className',
            tokenCategories: ['colors'],
            description: 'test',
          },
        ],
      };
      
      expect(() => registry.registerMapping(invalidMapping)).toThrow();
    });

    it('rejects mapping with empty propMappings', () => {
      const invalidMapping: ComponentTokenMapping = {
        componentName: 'TestComponent',
        propMappings: [],
      };
      
      expect(() => registry.registerMapping(invalidMapping)).toThrow();
    });
  });


  /**
   * Property 7: Enum Prop Token Mapping
   * 
   * *For any* prop in a ComponentTokenMapping that has enum values defined
   * in the component's propsSchema, the propMapping SHALL include an
   * enumTokenMap that maps each enum value to a token reference.
   * 
   * **Feature: token-component-example-mapping, Property 7: Enum Prop Token Mapping**
   * **Validates: Requirements 2.6**
   */
  describe('Property 7: Enum Prop Token Mapping', () => {
    beforeEach(() => {
      initializeDefaultComponentMappingRegistry();
    });

    it('Button variant prop has enumTokenMap for all variant values', () => {
      const buttonMapping = defaultComponentMappingRegistry.getMapping('Button');
      expect(buttonMapping).toBeDefined();
      
      const variantProp = buttonMapping?.propMappings.find(p => p.propName === 'variant');
      expect(variantProp).toBeDefined();
      expect(variantProp?.enumTokenMap).toBeDefined();
      
      const enumMap = variantProp?.enumTokenMap || {};
      expect(enumMap['default']).toBeDefined();
      expect(enumMap['destructive']).toBeDefined();
      expect(enumMap['outline']).toBeDefined();
      expect(enumMap['secondary']).toBeDefined();
    });

    it('Button size prop has enumTokenMap for all size values', () => {
      const buttonMapping = defaultComponentMappingRegistry.getMapping('Button');
      expect(buttonMapping).toBeDefined();
      
      const sizeProp = buttonMapping?.propMappings.find(p => p.propName === 'size');
      expect(sizeProp).toBeDefined();
      expect(sizeProp?.enumTokenMap).toBeDefined();
      
      const enumMap = sizeProp?.enumTokenMap || {};
      expect(enumMap['sm']).toBeDefined();
      expect(enumMap['default']).toBeDefined();
      expect(enumMap['lg']).toBeDefined();
    });

    it('Badge variant prop has enumTokenMap', () => {
      const badgeMapping = defaultComponentMappingRegistry.getMapping('Badge');
      expect(badgeMapping).toBeDefined();
      
      const variantProp = badgeMapping?.propMappings.find(p => p.propName === 'variant');
      expect(variantProp).toBeDefined();
      expect(variantProp?.enumTokenMap).toBeDefined();
      
      const enumMap = variantProp?.enumTokenMap || {};
      expect(enumMap['default']).toBeDefined();
      expect(enumMap['destructive']).toBeDefined();
    });

    it('Row gap prop has enumTokenMap for spacing values', () => {
      const rowMapping = defaultComponentMappingRegistry.getMapping('Row');
      expect(rowMapping).toBeDefined();
      
      const gapProp = rowMapping?.propMappings.find(p => p.propName === 'gap');
      expect(gapProp).toBeDefined();
      expect(gapProp?.enumTokenMap).toBeDefined();
      
      const enumMap = gapProp?.enumTokenMap || {};
      expect(enumMap['xs']).toBeDefined();
      expect(enumMap['sm']).toBeDefined();
      expect(enumMap['md']).toBeDefined();
      expect(enumMap['lg']).toBeDefined();
      expect(enumMap['xl']).toBeDefined();
    });

    it('enumTokenMap values reference valid token paths', () => {
      for (const mapping of ALL_COMPONENT_TOKEN_MAPPINGS) {
        for (const propMapping of mapping.propMappings) {
          if (propMapping.enumTokenMap) {
            for (const tokenRef of Object.values(propMapping.enumTokenMap)) {
              expect(tokenRef).toBeTruthy();
              expect(typeof tokenRef).toBe('string');
              expect(tokenRef).toMatch(/^(colors|spacing|typography|shadows|radius)\./);
            }
          }
        }
      }
    });
  });

  /**
   * Property 8: ComponentTokenMapping LLM Format Inclusion
   * 
   * *For any* ComponentMappingRegistry, when formatted for LLM, the output
   * string SHALL contain all component names and their token mappings.
   * 
   * **Feature: token-component-example-mapping, Property 8: ComponentTokenMapping LLM Format Inclusion**
   * **Validates: Requirements 2.7**
   */
  describe('Property 8: ComponentTokenMapping LLM Format Inclusion', () => {
    it('formatForLLM contains all registered component names', () => {
      fc.assert(
        fc.property(
          fc.array(componentTokenMappingArb, { minLength: 1, maxLength: 5 }),
          (mappings) => {
            registry.clear();
            
            const uniqueMappings = mappings.reduce((acc, m) => {
              if (!acc.find(existing => existing.componentName === m.componentName)) {
                acc.push(m);
              }
              return acc;
            }, [] as ComponentTokenMapping[]);
            
            registry.registerMappings(uniqueMappings);
            
            const formatted = registry.formatForLLM();
            
            for (const mapping of uniqueMappings) {
              expect(formatted).toContain(mapping.componentName);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('formatForLLM contains Component Token Mappings header', () => {
      initializeDefaultComponentMappingRegistry();
      const formatted = defaultComponentMappingRegistry.formatForLLM();
      
      expect(formatted).toContain('## Component Token Mappings');
    });

    it('default registry formatForLLM contains all preset component names', () => {
      initializeDefaultComponentMappingRegistry();
      const formatted = defaultComponentMappingRegistry.formatForLLM();
      
      for (const mapping of ALL_COMPONENT_TOKEN_MAPPINGS) {
        expect(formatted).toContain(mapping.componentName);
      }
    });
  });

  describe('getComponentsUsingTokenCategory', () => {
    beforeEach(() => {
      initializeDefaultComponentMappingRegistry();
    });

    it('returns components using colors category', () => {
      const components = defaultComponentMappingRegistry.getComponentsUsingTokenCategory('colors');
      
      expect(components.length).toBeGreaterThan(0);
      expect(components).toContain('Button');
      expect(components).toContain('Text');
      expect(components).toContain('Badge');
    });

    it('returns components using spacing category', () => {
      const components = defaultComponentMappingRegistry.getComponentsUsingTokenCategory('spacing');
      
      expect(components.length).toBeGreaterThan(0);
      expect(components).toContain('Button');
      expect(components).toContain('Container');
      expect(components).toContain('Row');
      expect(components).toContain('Column');
    });
  });

  describe('Registry Operations', () => {
    it('clear removes all registered mappings', () => {
      fc.assert(
        fc.property(
          fc.array(componentTokenMappingArb, { minLength: 1, maxLength: 5 }),
          (mappings) => {
            const uniqueMappings = mappings.reduce((acc, m) => {
              if (!acc.find(existing => existing.componentName === m.componentName)) {
                acc.push(m);
              }
              return acc;
            }, [] as ComponentTokenMapping[]);
            
            registry.registerMappings(uniqueMappings);
            registry.clear();
            
            expect(registry.size).toBe(0);
            expect(registry.getAllComponentNames()).toHaveLength(0);
            expect(registry.getAllMappings()).toHaveLength(0);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
