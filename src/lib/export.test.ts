/**
 * Code Export Property-Based Tests
 * 
 * **Feature: llm2ui, Property 8: 代码导出语法正确性**
 * **Validates: Requirements 9.2, 9.3, 9.4**
 * 
 * Tests that for any valid UISchema:
 * - JSON export produces valid JSON that can be parsed back
 * - Vue3 export produces syntactically valid Vue SFC structure
 * - React export produces syntactically valid JSX/TSX structure
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  exportToJSON,
  exportToVue3,
  exportToReact,
  getVue3Dependencies,
  getReactDependencies,
} from './export';
import { deserialize } from './serialization';
import type { UISchema, UIComponent, StyleProps, EventBinding } from '../types';

// Arbitrary generators for UISchema types (reused from serialization.test.ts)

/**
 * Generator for StyleProps
 */
const stylePropsArb: fc.Arbitrary<StyleProps> = fc.record({
  className: fc.option(fc.stringMatching(/^[a-z][a-z0-9-]*$/), { nil: undefined }),
  width: fc.option(fc.oneof(fc.constant('100%'), fc.integer({ min: 0, max: 500 }).map(n => `${n}px`)), { nil: undefined }),
  height: fc.option(fc.oneof(fc.constant('auto'), fc.integer({ min: 0, max: 500 }).map(n => `${n}px`)), { nil: undefined }),
  display: fc.option(fc.constantFrom('block', 'inline', 'flex', 'grid', 'none'), { nil: undefined }),
  flexDirection: fc.option(fc.constantFrom('row', 'column'), { nil: undefined }),
  gap: fc.option(fc.integer({ min: 0, max: 32 }).map(n => `${n}px`), { nil: undefined }),
}, { requiredKeys: [] });

/**
 * Generator for EventBinding
 */
const eventBindingArb: fc.Arbitrary<EventBinding> = fc.record({
  event: fc.constantFrom('click', 'change', 'submit', 'focus', 'blur'),
  action: fc.oneof(
    fc.record({ type: fc.constant('navigate' as const), url: fc.constant('/page') }),
    fc.record({ type: fc.constant('submit' as const), endpoint: fc.option(fc.constant('/api/submit'), { nil: undefined }) }),
    fc.record({ type: fc.constant('toggle' as const), path: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/) })
  ),
});

/**
 * Generator for valid identifier (for component IDs)
 */
const identifierArb = fc.stringMatching(/^[a-z][a-zA-Z0-9]{0,15}$/);

/**
 * Generator for UIComponent (recursive structure with limited depth)
 */
const uiComponentArb: fc.Arbitrary<UIComponent> = fc.letrec<{ component: UIComponent }>(tie => ({
  component: fc.record({
    id: identifierArb,
    type: fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container', 'Form'),
    props: fc.option(
      fc.record({
        placeholder: fc.option(fc.stringMatching(/^[a-zA-Z0-9 ]{0,20}$/), { nil: undefined }),
        disabled: fc.option(fc.boolean(), { nil: undefined }),
        variant: fc.option(fc.constantFrom('default', 'primary', 'secondary'), { nil: undefined }),
      }, { requiredKeys: [] }),
      { nil: undefined }
    ),
    style: fc.option(stylePropsArb, { nil: undefined }),
    children: fc.option(
      fc.array(tie('component'), { minLength: 0, maxLength: 2 }),
      { nil: undefined }
    ),
    text: fc.option(fc.stringMatching(/^[a-zA-Z0-9 ]{0,30}$/), { nil: undefined }),
    binding: fc.option(
      identifierArb.map(s => `{{${s}}}`),
      { nil: undefined }
    ),
    events: fc.option(fc.array(eventBindingArb, { minLength: 0, maxLength: 2 }), { nil: undefined }),
  }, { requiredKeys: ['id', 'type'] }),
})).component;

/**
 * Generator for UISchema
 */
const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constantFrom('1.0', '1.1', '2.0'),
  root: uiComponentArb,
  data: fc.option(
    fc.record({
      title: fc.option(fc.stringMatching(/^[a-zA-Z0-9 ]{0,20}$/), { nil: undefined }),
      count: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
      items: fc.option(fc.array(fc.stringMatching(/^[a-zA-Z0-9]{1,10}$/), { minLength: 0, maxLength: 3 }), { nil: undefined }),
    }, { requiredKeys: [] }),
    { nil: undefined }
  ),
  meta: fc.option(
    fc.record({
      title: fc.option(fc.stringMatching(/^[a-zA-Z0-9 ]{0,20}$/), { nil: undefined }),
      description: fc.option(fc.stringMatching(/^[a-zA-Z0-9 ]{0,50}$/), { nil: undefined }),
    }, { requiredKeys: [] }),
    { nil: undefined }
  ),
}, { requiredKeys: ['version', 'root'] });

describe('Code Export Property Tests', () => {
  /**
   * Property 8: 代码导出语法正确性 - JSON Export
   * 
   * For any valid UISchema, JSON export should produce valid JSON
   * that can be parsed back to an equivalent schema.
   * 
   * **Validates: Requirements 9.1, 7.2, 7.3**
   */
  it('Property 8a: JSON export produces valid parseable JSON (round-trip)', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const result = exportToJSON(schema);
        
        // Export should succeed
        expect(result.success).toBe(true);
        expect(result.content).toBeDefined();
        expect(result.filename).toMatch(/\.json$/);
        expect(result.mimeType).toBe('application/json');
        
        // Content should be valid JSON
        const parsed = JSON.parse(result.content!);
        expect(parsed).toBeDefined();
        expect(parsed.version).toBe(schema.version);
        expect(parsed.root).toBeDefined();
        expect(parsed.root.id).toBe(schema.root.id);
        expect(parsed.root.type).toBe(schema.root.type);
        
        // Should be deserializable back to UISchema
        const deserializeResult = deserialize(result.content!);
        expect(deserializeResult.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8b: Vue3 export produces syntactically valid SFC structure
   * 
   * For any valid UISchema, Vue3 export should produce code with:
   * - Valid <template> section
   * - Valid <script> section
   * - Valid <style> section
   * 
   * **Validates: Requirements 9.2**
   */
  it('Property 8b: Vue3 export produces valid SFC structure', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const result = exportToVue3(schema);
        
        // Export should succeed
        expect(result.success).toBe(true);
        expect(result.content).toBeDefined();
        expect(result.filename).toMatch(/\.vue$/);
        
        const content = result.content!;
        
        // Should have template section
        expect(content).toMatch(/<template>/);
        expect(content).toMatch(/<\/template>/);
        
        // Should have script section
        expect(content).toMatch(/<script.*>/);
        expect(content).toMatch(/<\/script>/);
        
        // Should have style section
        expect(content).toMatch(/<style.*>/);
        expect(content).toMatch(/<\/style>/);
        
        // Template should contain valid HTML-like structure
        const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
        expect(templateMatch).toBeTruthy();
        const templateContent = templateMatch![1];
        
        // Should have balanced tags (basic check)
        const openTags = (templateContent.match(/<[a-z][a-z0-9]*[^/>]*>/gi) || []).length;
        const closeTags = (templateContent.match(/<\/[a-z][a-z0-9]*>/gi) || []).length;
        // Open tags should equal close tags (self-closing don't need closing)
        expect(openTags).toBe(closeTags);
        
        // Script should have Vue imports
        expect(content).toMatch(/import.*from\s+['"]vue['"]/);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8c: React export produces syntactically valid JSX/TSX structure
   * 
   * For any valid UISchema, React export should produce code with:
   * - Valid React imports
   * - Valid function component
   * - Valid JSX return statement
   * 
   * **Validates: Requirements 9.3**
   */
  it('Property 8c: React export produces valid JSX/TSX structure', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const result = exportToReact(schema);
        
        // Export should succeed
        expect(result.success).toBe(true);
        expect(result.content).toBeDefined();
        expect(result.filename).toMatch(/\.(tsx|jsx)$/);
        
        const content = result.content!;
        
        // Should have React import
        expect(content).toMatch(/import\s+React/);
        
        // Should have function component
        expect(content).toMatch(/function\s+\w+\s*\(/);
        
        // Should have return statement with JSX
        expect(content).toMatch(/return\s*\(/);
        
        // Should have default export
        expect(content).toMatch(/export\s+default/);
        
        // JSX should have balanced tags (basic check)
        const jsxMatch = content.match(/return\s*\(([\s\S]*?)\);[\s\n]*\}/);
        if (jsxMatch) {
          const jsxContent = jsxMatch[1];
          const openTags = (jsxContent.match(/<[a-z][a-z0-9]*[^/>]*>/gi) || []).length;
          const closeTags = (jsxContent.match(/<\/[a-z][a-z0-9]*>/gi) || []).length;
          expect(openTags).toBe(closeTags);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8d: Export options are respected
   * 
   * Export functions should respect the options passed to them.
   * 
   * **Validates: Requirements 9.4**
   */
  it('Property 8d: Export options are respected', () => {
    fc.assert(
      fc.property(
        uiSchemaArb,
        fc.boolean(),
        fc.stringMatching(/^[A-Z][a-zA-Z]{2,15}$/),
        (schema, typescript, componentName) => {
          // Test Vue3 options
          const vueResult = exportToVue3(schema, {
            componentName,
            typescript,
            scopedStyles: true,
          });
          expect(vueResult.success).toBe(true);
          expect(vueResult.filename).toBe(`${componentName}.vue`);
          if (typescript) {
            expect(vueResult.content).toMatch(/lang="ts"/);
          }
          expect(vueResult.content).toMatch(/scoped/);
          
          // Test React options
          const reactResult = exportToReact(schema, {
            componentName,
            typescript,
          });
          expect(reactResult.success).toBe(true);
          expect(reactResult.filename).toBe(`${componentName}.${typescript ? 'tsx' : 'jsx'}`);
          expect(reactResult.content).toMatch(new RegExp(`function\\s+${componentName}`));
          expect(reactResult.content).toMatch(new RegExp(`export\\s+default\\s+${componentName}`));
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Export Dependencies', () => {
  it('should return correct Vue3 dependencies', () => {
    const deps = getVue3Dependencies();
    expect(deps).toContainEqual(expect.objectContaining({ name: 'vue' }));
    expect(deps.some(d => d.name === 'vue' && d.version.startsWith('^3'))).toBe(true);
  });

  it('should return correct React dependencies', () => {
    const deps = getReactDependencies();
    expect(deps).toContainEqual(expect.objectContaining({ name: 'react' }));
    expect(deps).toContainEqual(expect.objectContaining({ name: 'react-dom' }));
    expect(deps.some(d => d.name === 'react' && d.version.startsWith('^18'))).toBe(true);
  });
});

describe('Export Edge Cases', () => {
  it('should handle minimal schema', () => {
    const minimalSchema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
      },
    };
    
    const jsonResult = exportToJSON(minimalSchema);
    expect(jsonResult.success).toBe(true);
    
    const vueResult = exportToVue3(minimalSchema);
    expect(vueResult.success).toBe(true);
    
    const reactResult = exportToReact(minimalSchema);
    expect(reactResult.success).toBe(true);
  });

  it('should handle schema with nested children', () => {
    const nestedSchema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          {
            id: 'card1',
            type: 'Card',
            children: [
              { id: 'text1', type: 'Text', text: 'Hello' },
              { id: 'btn1', type: 'Button', text: 'Click me' },
            ],
          },
        ],
      },
    };
    
    const jsonResult = exportToJSON(nestedSchema);
    expect(jsonResult.success).toBe(true);
    
    const vueResult = exportToVue3(nestedSchema);
    expect(vueResult.success).toBe(true);
    expect(vueResult.content).toContain('Hello');
    expect(vueResult.content).toContain('Click me');
    
    const reactResult = exportToReact(nestedSchema);
    expect(reactResult.success).toBe(true);
    expect(reactResult.content).toContain('Hello');
    expect(reactResult.content).toContain('Click me');
  });

  it('should handle schema with data bindings', () => {
    const bindingSchema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          { id: 'title', type: 'Text', binding: '{{title}}' },
        ],
      },
      data: {
        title: 'Hello World',
      },
    };
    
    const vueResult = exportToVue3(bindingSchema);
    expect(vueResult.success).toBe(true);
    expect(vueResult.content).toMatch(/data\.title/);
    
    const reactResult = exportToReact(bindingSchema);
    expect(reactResult.success).toBe(true);
    expect(reactResult.content).toMatch(/data\.title/);
  });

  it('should handle schema with events', () => {
    const eventSchema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          {
            id: 'submitBtn',
            type: 'Button',
            text: 'Submit',
            events: [
              { event: 'click', action: { type: 'submit' } },
            ],
          },
        ],
      },
    };
    
    const vueResult = exportToVue3(eventSchema);
    expect(vueResult.success).toBe(true);
    expect(vueResult.content).toMatch(/@click/);
    expect(vueResult.content).toMatch(/handleClickSubmitBtn/);
    
    const reactResult = exportToReact(eventSchema);
    expect(reactResult.success).toBe(true);
    expect(reactResult.content).toMatch(/onClick/);
    expect(reactResult.content).toMatch(/handleClickSubmitBtn/);
  });
});
