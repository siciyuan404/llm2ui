/**
 * Prompt Generator Property-Based Tests
 * 
 * **Feature: agent-output-optimization**
 * 
 * Property 6: 提示词生成完整性
 * 
 * @module prompt-generator.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import { ComponentRegistry } from './component-registry';
import { ComponentCatalog } from './component-catalog';
import { generateSystemPrompt, generateComponentDocs } from './prompt-generator';
import type { ComponentDefinition, PropSchema } from './component-registry';

/**
 * Create a mock React component for testing
 */
const createMockComponent = (name: string): React.ComponentType<Record<string, unknown>> => {
  const MockComponent: React.FC<Record<string, unknown>> = () => null;
  MockComponent.displayName = name;
  return MockComponent;
};

/**
 * Generator for valid component names (PascalCase style)
 */
const componentNameArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[A-Za-z][A-Za-z0-9]*$/.test(s))
  .map(s => s.charAt(0).toUpperCase() + s.slice(1));

/**
 * Generator for prop schema types
 */
const propTypeArb = fc.constantFrom('string', 'number', 'boolean', 'object', 'array');

/**
 * Generator for prop description
 */
const propDescriptionArb = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

/**
 * Generator for prop schema with description
 */
const propSchemaWithDescArb: fc.Arbitrary<PropSchema> = fc.record({
  type: propTypeArb,
  required: fc.option(fc.boolean(), { nil: undefined }),
  description: fc.option(propDescriptionArb, { nil: undefined }),
  enum: fc.option(
    fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
    { nil: undefined }
  ),
});

/**
 * Generator for props schema (dictionary of prop schemas)
 */
const propsSchemaArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
  propSchemaWithDescArb,
  { minKeys: 1, maxKeys: 5 }
);

/**
 * Generator for component category
 */
const categoryArb = fc.constantFrom('layout', 'input', 'display', 'navigation', 'feedback');

/**
 * Generator for component description
 */
const componentDescriptionArb = fc.string({ minLength: 5, maxLength: 100 })
  .filter(s => s.trim().length >= 5);

/**
 * Generator for component definitions with meaningful content
 */
const componentDefinitionArb = (): fc.Arbitrary<ComponentDefinition> =>
  fc.record({
    name: componentNameArb,
    component: fc.constant(createMockComponent('MockComponent')),
    propsSchema: propsSchemaArb,
    description: componentDescriptionArb,
    category: categoryArb,
  });

describe('Prompt Generator', () => {
  let registry: ComponentRegistry;
  let catalog: ComponentCatalog;

  beforeEach(() => {
    registry = new ComponentRegistry();
    catalog = new ComponentCatalog(registry);
  });

  /**
   * Property 6: 提示词生成完整性 (Prompt Generation Completeness)
   * 
   * *对于任意* Component_Catalog 中的组件，generateSystemPrompt 生成的提示词
   * 应当包含该组件的类型名称和属性描述。
   * 
   * **Feature: agent-output-optimization, Property 6: 提示词生成完整性**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.7**
   */
  it('Property 6: generated prompt contains all component type names', () => {
    fc.assert(
      fc.property(
        fc.array(componentDefinitionArb(), { minLength: 1, maxLength: 5 }),
        (definitions) => {
          // Ensure unique names
          const uniqueDefs = definitions.reduce((acc, def) => {
            if (!acc.find(d => d.name === def.name)) {
              acc.push(def);
            }
            return acc;
          }, [] as ComponentDefinition[]);

          // Register all components
          for (const def of uniqueDefs) {
            registry.register(def);
          }

          // Generate system prompt
          const prompt = generateSystemPrompt({ catalog });

          // Each component type name should appear in the prompt
          for (const def of uniqueDefs) {
            expect(prompt).toContain(def.name);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6b: Generated prompt contains component descriptions
   * 
   * **Feature: agent-output-optimization, Property 6: 提示词生成完整性**
   * **Validates: Requirements 3.1, 3.3**
   */
  it('Property 6b: generated prompt contains component descriptions', () => {
    fc.assert(
      fc.property(
        componentDefinitionArb(),
        (definition) => {
          // Register the component
          registry.register(definition);

          // Generate system prompt
          const prompt = generateSystemPrompt({ catalog });

          // Component description should appear in the prompt
          if (definition.description && definition.description.trim().length > 0) {
            expect(prompt).toContain(definition.description);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6c: Generated prompt contains property names for components
   * 
   * **Feature: agent-output-optimization, Property 6: 提示词生成完整性**
   * **Validates: Requirements 3.3**
   */
  it('Property 6c: generated prompt contains property names', () => {
    fc.assert(
      fc.property(
        componentDefinitionArb(),
        (definition) => {
          // Register the component
          registry.register(definition);

          // Generate component docs
          const docs = generateComponentDocs(catalog);

          // Each property name should appear in the docs
          if (definition.propsSchema) {
            for (const propName of Object.keys(definition.propsSchema)) {
              expect(docs).toContain(propName);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6d: Valid types list in prompt matches catalog
   * 
   * **Feature: agent-output-optimization, Property 6: 提示词生成完整性**
   * **Validates: Requirements 3.2**
   */
  it('Property 6d: valid types list in prompt matches catalog', () => {
    fc.assert(
      fc.property(
        fc.array(componentDefinitionArb(), { minLength: 1, maxLength: 5 }),
        (definitions) => {
          // Ensure unique names
          const uniqueDefs = definitions.reduce((acc, def) => {
            if (!acc.find(d => d.name === def.name)) {
              acc.push(def);
            }
            return acc;
          }, [] as ComponentDefinition[]);

          // Register all components
          for (const def of uniqueDefs) {
            registry.register(def);
          }

          // Generate system prompt
          const prompt = generateSystemPrompt({ catalog });

          // All valid types from catalog should be in the prompt
          const validTypes = catalog.getValidTypes();
          for (const type of validTypes) {
            expect(prompt).toContain(`"${type}"`);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6e: Prompt updates when catalog changes
   * 
   * **Feature: agent-output-optimization, Property 6: 提示词生成完整性**
   * **Validates: Requirements 3.7**
   */
  it('Property 6e: prompt updates when catalog changes', () => {
    fc.assert(
      fc.property(
        componentDefinitionArb(),
        componentDefinitionArb(),
        (def1, originalDef2) => {
          // Create fresh registry and catalog for each test iteration
          const testRegistry = new ComponentRegistry();
          const testCatalog = new ComponentCatalog(testRegistry);

          // Ensure different names by creating a new definition with modified name
          // Use a more unique suffix to avoid collisions with enum values
          const def2Name = def1.name === originalDef2.name 
            ? originalDef2.name + 'UniqueComponent' 
            : originalDef2.name;
          const def2 = { ...originalDef2, name: def2Name };

          // Register first component
          testRegistry.register(def1);
          // Disable relevant examples to avoid preset examples interfering with the test
          const prompt1 = generateSystemPrompt({ catalog: testCatalog, includeRelevantExamples: false });

          // Verify first component is in prompt
          expect(prompt1).toContain(def1.name);
          // Second component should not be in the valid types list yet
          // Check for the component name in the valid types section specifically
          const validTypesSection1 = prompt1.split('## 有效组件类型')[1]?.split('##')[0] || 
                                     prompt1.split('## Valid Component Types')[1]?.split('##')[0] || '';
          expect(validTypesSection1).not.toContain(`"${def2.name}"`);

          // Register second component
          testRegistry.register(def2);
          const prompt2 = generateSystemPrompt({ catalog: testCatalog, includeRelevantExamples: false });

          // Verify both components are now in prompt
          expect(prompt2).toContain(def1.name);
          expect(prompt2).toContain(def2.name);

          // Prompts should be different
          expect(prompt1).not.toBe(prompt2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Prompt Generator Component Docs', () => {
  let registry: ComponentRegistry;
  let catalog: ComponentCatalog;

  beforeEach(() => {
    registry = new ComponentRegistry();
    catalog = new ComponentCatalog(registry);
  });

  /**
   * Property 6f: Component docs are grouped by category
   * 
   * **Feature: agent-output-optimization, Property 6: 提示词生成完整性**
   * **Validates: Requirements 3.1**
   */
  it('Property 6f: component docs are grouped by category', () => {
    // Register components in different categories
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
      category: 'input',
      description: 'A button component',
    });
    registry.register({
      name: 'Card',
      component: createMockComponent('Card'),
      category: 'layout',
      description: 'A card component',
    });

    const docs = generateComponentDocs(catalog);

    // Should contain category headers
    expect(docs).toContain('布局组件');
    expect(docs).toContain('表单组件');

    // Components should be under their categories
    expect(docs).toContain('Button');
    expect(docs).toContain('Card');
  });

  /**
   * Property 6g: Enum values are included in prop documentation
   * 
   * **Feature: agent-output-optimization, Property 6: 提示词生成完整性**
   * **Validates: Requirements 3.3**
   */
  it('Property 6g: enum values are included in prop documentation', () => {
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
      propsSchema: {
        variant: {
          type: 'string',
          enum: ['default', 'outline', 'ghost'],
        },
      },
    });

    const docs = generateComponentDocs(catalog);

    // Enum values should be in the docs
    expect(docs).toContain('"default"');
    expect(docs).toContain('"outline"');
    expect(docs).toContain('"ghost"');
  });

  /**
   * Property 6h: Required props are marked in documentation
   * 
   * **Feature: agent-output-optimization, Property 6: 提示词生成完整性**
   * **Validates: Requirements 3.3**
   */
  it('Property 6h: required props are marked in documentation', () => {
    registry.register({
      name: 'Input',
      component: createMockComponent('Input'),
      propsSchema: {
        label: {
          type: 'string',
          required: true,
          description: 'Input label',
        },
        placeholder: {
          type: 'string',
          required: false,
        },
      },
    });

    const docs = generateComponentDocs(catalog);

    // Required marker should appear for required props
    expect(docs).toContain('label');
    expect(docs).toContain('(必填)');
  });
});


describe('Prompt Generator Example Integration', () => {
  let registry: ComponentRegistry;
  let catalog: ComponentCatalog;

  beforeEach(() => {
    registry = new ComponentRegistry();
    catalog = new ComponentCatalog(registry);
    
    // Register a basic component for testing
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
      category: 'input',
      description: 'A button component',
      propsSchema: {
        label: { type: 'string', required: true },
      },
    });
  });

  /**
   * Property 12: 提示词结构正确性
   * 
   * *对于任意* 启用 includeRelevantExamples 且提供 userInput 的 PromptGeneratorOptions，
   * 生成的提示词应当按以下顺序包含各部分：系统介绍 → 组件文档 → 参考案例 → 格式要求 → 负面示例。
   * 
   * **Feature: example-driven-generation, Property 12: 提示词结构正确性**
   * **Validates: Requirements 5.3, 5.4, 5.5**
   */
  it('Property 12: prompt structure is correct when includeRelevantExamples is enabled with userInput', () => {
    // Generator for non-empty user input strings
    const userInputArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        userInputArb,
        fc.constantFrom('zh', 'en') as fc.Arbitrary<'zh' | 'en'>,
        (userInput, language) => {
          const prompt = generateSystemPrompt({
            catalog,
            includeRelevantExamples: true,
            userInput,
            language,
            includeExamples: true,
            includeNegativeExamples: true,
          });

          // Define section markers based on language
          const systemIntroMarker = language === 'zh' 
            ? '你是一个 UI 生成助手' 
            : 'You are a UI generation assistant';
          const componentDocsMarker = language === 'zh'
            ? '## 可用的组件类型及其属性'
            : '## Available Component Types and Properties';
          const referenceExamplesMarker = language === 'zh'
            ? '## 参考案例'
            : '## Reference Examples';
          const positiveExampleMarker = language === 'zh'
            ? '## 完整示例'
            : '## Complete Example';
          const negativeExampleMarker = language === 'zh'
            ? '## 常见错误示例'
            : '## Common Mistakes';

          // Find positions of each section
          const systemIntroPos = prompt.indexOf(systemIntroMarker);
          const componentDocsPos = prompt.indexOf(componentDocsMarker);
          const referenceExamplesPos = prompt.indexOf(referenceExamplesMarker);
          const positiveExamplePos = prompt.indexOf(positiveExampleMarker);
          const negativeExamplePos = prompt.indexOf(negativeExampleMarker);

          // All sections should exist
          expect(systemIntroPos).toBeGreaterThanOrEqual(0);
          expect(componentDocsPos).toBeGreaterThan(0);
          expect(referenceExamplesPos).toBeGreaterThan(0);
          expect(positiveExamplePos).toBeGreaterThan(0);
          expect(negativeExamplePos).toBeGreaterThan(0);

          // Verify order: 系统介绍 → 组件文档 → 参考案例 → 格式要求(正面示例) → 负面示例
          expect(systemIntroPos).toBeLessThan(componentDocsPos);
          expect(componentDocsPos).toBeLessThan(referenceExamplesPos);
          expect(referenceExamplesPos).toBeLessThan(positiveExamplePos);
          expect(positiveExamplePos).toBeLessThan(negativeExamplePos);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12b: Reference examples section contains required elements
   * 
   * **Feature: example-driven-generation, Property 12: 提示词结构正确性**
   * **Validates: Requirements 5.3, 5.4**
   */
  it('Property 12b: reference examples section contains title, guidance, and examples', () => {
    const userInputArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        userInputArb,
        fc.constantFrom('zh', 'en') as fc.Arbitrary<'zh' | 'en'>,
        (userInput, language) => {
          const prompt = generateSystemPrompt({
            catalog,
            includeRelevantExamples: true,
            userInput,
            language,
          });

          // Reference examples section should contain:
          // 1. Title
          const titleMarker = language === 'zh' ? '## 参考案例' : '## Reference Examples';
          expect(prompt).toContain(titleMarker);

          // 2. Guidance text
          const guidanceMarker = language === 'zh' 
            ? '以下是一些参考案例' 
            : 'Below are some reference examples';
          expect(prompt).toContain(guidanceMarker);

          // 3. At least one example with JSON schema
          expect(prompt).toContain('```json');
          expect(prompt).toContain('"version"');
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('Prompt Generator Backward Compatibility', () => {
  let registry: ComponentRegistry;
  let catalog: ComponentCatalog;

  beforeEach(() => {
    registry = new ComponentRegistry();
    catalog = new ComponentCatalog(registry);
    
    // Register a basic component for testing
    registry.register({
      name: 'Button',
      component: createMockComponent('Button'),
      category: 'input',
      description: 'A button component',
      propsSchema: {
        label: { type: 'string', required: true },
      },
    });
  });

  /**
   * Property 13: 向后兼容性
   * 
   * *对于任意* includeRelevantExamples 为 false 的 PromptGeneratorOptions，
   * 生成的提示词应当与原有 generateSystemPrompt 的输出结构一致（不包含参考案例部分）。
   * 
   * **Feature: example-driven-generation, Property 13: 向后兼容性**
   * **Validates: Requirements 5.6**
   */
  it('Property 13: prompt does not contain reference examples when includeRelevantExamples is false', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('zh', 'en') as fc.Arbitrary<'zh' | 'en'>,
        fc.boolean(),
        fc.boolean(),
        (language, includeExamples, includeNegativeExamples) => {
          const prompt = generateSystemPrompt({
            catalog,
            includeRelevantExamples: false,
            language,
            includeExamples,
            includeNegativeExamples,
          });

          // Reference examples section should NOT be present
          const referenceExamplesMarkerZh = '## 参考案例';
          const referenceExamplesMarkerEn = '## Reference Examples';
          
          expect(prompt).not.toContain(referenceExamplesMarkerZh);
          expect(prompt).not.toContain(referenceExamplesMarkerEn);

          // But other sections should still be present
          const systemIntroMarker = language === 'zh' 
            ? '你是一个 UI 生成助手' 
            : 'You are a UI generation assistant';
          const componentDocsMarker = language === 'zh'
            ? '## 可用的组件类型及其属性'
            : '## Available Component Types and Properties';

          expect(prompt).toContain(systemIntroMarker);
          expect(prompt).toContain(componentDocsMarker);

          // Positive examples should be present if enabled
          if (includeExamples) {
            const positiveExampleMarker = language === 'zh'
              ? '## 完整示例'
              : '## Complete Example';
            expect(prompt).toContain(positiveExampleMarker);
          }

          // Negative examples should be present if enabled
          if (includeNegativeExamples) {
            const negativeExampleMarker = language === 'zh'
              ? '## 常见错误示例'
              : '## Common Mistakes';
            expect(prompt).toContain(negativeExampleMarker);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13b: Backward compatibility - prompt structure without examples matches original
   * 
   * **Feature: example-driven-generation, Property 13: 向后兼容性**
   * **Validates: Requirements 5.6**
   */
  it('Property 13b: prompt without relevant examples has same structure as original', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('zh', 'en') as fc.Arbitrary<'zh' | 'en'>,
        (language) => {
          // Generate prompt with includeRelevantExamples = false (backward compatible mode)
          const promptWithoutExamples = generateSystemPrompt({
            catalog,
            includeRelevantExamples: false,
            language,
            includeExamples: true,
            includeNegativeExamples: true,
          });

          // Define expected section order for backward compatible mode
          const systemIntroMarker = language === 'zh' 
            ? '你是一个 UI 生成助手' 
            : 'You are a UI generation assistant';
          const componentDocsMarker = language === 'zh'
            ? '## 可用的组件类型及其属性'
            : '## Available Component Types and Properties';
          const positiveExampleMarker = language === 'zh'
            ? '## 完整示例'
            : '## Complete Example';
          const negativeExampleMarker = language === 'zh'
            ? '## 常见错误示例'
            : '## Common Mistakes';

          // Find positions
          const systemIntroPos = promptWithoutExamples.indexOf(systemIntroMarker);
          const componentDocsPos = promptWithoutExamples.indexOf(componentDocsMarker);
          const positiveExamplePos = promptWithoutExamples.indexOf(positiveExampleMarker);
          const negativeExamplePos = promptWithoutExamples.indexOf(negativeExampleMarker);

          // All sections should exist
          expect(systemIntroPos).toBeGreaterThanOrEqual(0);
          expect(componentDocsPos).toBeGreaterThan(0);
          expect(positiveExamplePos).toBeGreaterThan(0);
          expect(negativeExamplePos).toBeGreaterThan(0);

          // Verify original order: 系统介绍 → 组件文档 → 正面示例 → 负面示例
          // (without reference examples in between)
          expect(systemIntroPos).toBeLessThan(componentDocsPos);
          expect(componentDocsPos).toBeLessThan(positiveExamplePos);
          expect(positiveExamplePos).toBeLessThan(negativeExamplePos);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13c: userInput is ignored when includeRelevantExamples is false
   * 
   * **Feature: example-driven-generation, Property 13: 向后兼容性**
   * **Validates: Requirements 5.6**
   */
  it('Property 13c: userInput is ignored when includeRelevantExamples is false', () => {
    const userInputArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        userInputArb,
        fc.constantFrom('zh', 'en') as fc.Arbitrary<'zh' | 'en'>,
        (userInput, language) => {
          // Generate prompt with userInput but includeRelevantExamples = false
          const promptWithUserInput = generateSystemPrompt({
            catalog,
            includeRelevantExamples: false,
            userInput,
            language,
          });

          // Generate prompt without userInput and includeRelevantExamples = false
          const promptWithoutUserInput = generateSystemPrompt({
            catalog,
            includeRelevantExamples: false,
            language,
          });

          // Both prompts should be identical (userInput should be ignored)
          expect(promptWithUserInput).toBe(promptWithoutUserInput);
        }
      ),
      { numRuns: 100 }
    );
  });
});
