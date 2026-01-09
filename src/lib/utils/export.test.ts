/**
 * Code Export Property-Based Tests
 * 
 * **Feature: llm2ui, Property 8: 代码导出语法正确性**
 * **Validates: Requirements 9.2, 9.3, 9.4**
 * 
 * @module lib/utils/export.test
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
import { deserialize } from '../core/serialization';
import type { UISchema, UIComponent, StyleProps, EventBinding } from '../../types';

const identifierArb = fc.stringMatching(/^[a-z][a-zA-Z0-9]{0,15}$/);

const uiComponentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: identifierArb,
  type: fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container'),
  props: fc.option(
    fc.record({
      placeholder: fc.option(fc.stringMatching(/^[a-zA-Z0-9 ]{0,20}$/), { nil: undefined }),
      disabled: fc.option(fc.boolean(), { nil: undefined }),
    }, { requiredKeys: [] }),
    { nil: undefined }
  ),
  text: fc.option(fc.stringMatching(/^[a-zA-Z0-9 ]{0,30}$/), { nil: undefined }),
}, { requiredKeys: ['id', 'type'] });

const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constantFrom('1.0', '1.1', '2.0'),
  root: uiComponentArb,
  data: fc.option(
    fc.record({
      title: fc.option(fc.stringMatching(/^[a-zA-Z0-9 ]{0,20}$/), { nil: undefined }),
      count: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
    }, { requiredKeys: [] }),
    { nil: undefined }
  ),
}, { requiredKeys: ['version', 'root'] });

describe('Code Export Property Tests', () => {
  it('Property 8a: JSON export produces valid parseable JSON (round-trip)', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const result = exportToJSON(schema);
        
        expect(result.success).toBe(true);
        expect(result.content).toBeDefined();
        expect(result.filename).toMatch(/\.json$/);
        expect(result.mimeType).toBe('application/json');
        
        const parsed = JSON.parse(result.content!);
        expect(parsed.version).toBe(schema.version);
        expect(parsed.root.id).toBe(schema.root.id);
        
        const deserializeResult = deserialize(result.content!);
        expect(deserializeResult.success).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  it('Property 8b: Vue3 export produces valid SFC structure', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const result = exportToVue3(schema);
        
        expect(result.success).toBe(true);
        expect(result.content).toBeDefined();
        expect(result.filename).toMatch(/\.vue$/);
        
        const content = result.content!;
        expect(content).toMatch(/<template>/);
        expect(content).toMatch(/<\/template>/);
        expect(content).toMatch(/<script.*>/);
        expect(content).toMatch(/<\/script>/);
        expect(content).toMatch(/<style.*>/);
        expect(content).toMatch(/<\/style>/);
        expect(content).toMatch(/import.*from\s+['"]vue['"]/);
      }),
      { numRuns: 50 }
    );
  });

  it('Property 8c: React export produces valid JSX/TSX structure', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        const result = exportToReact(schema);
        
        expect(result.success).toBe(true);
        expect(result.content).toBeDefined();
        expect(result.filename).toMatch(/\.(tsx|jsx)$/);
        
        const content = result.content!;
        expect(content).toMatch(/import\s+React/);
        expect(content).toMatch(/function\s+\w+\s*\(/);
        expect(content).toMatch(/return\s*\(/);
        expect(content).toMatch(/export\s+default/);
      }),
      { numRuns: 50 }
    );
  });

  it('Property 8d: Export options are respected', () => {
    fc.assert(
      fc.property(
        uiSchemaArb,
        fc.boolean(),
        fc.stringMatching(/^[A-Z][a-zA-Z]{2,15}$/),
        (schema, typescript, componentName) => {
          const vueResult = exportToVue3(schema, { componentName, typescript, scopedStyles: true });
          expect(vueResult.success).toBe(true);
          expect(vueResult.filename).toBe(`${componentName}.vue`);
          if (typescript) {
            expect(vueResult.content).toMatch(/lang="ts"/);
          }
          
          const reactResult = exportToReact(schema, { componentName, typescript });
          expect(reactResult.success).toBe(true);
          expect(reactResult.filename).toBe(`${componentName}.${typescript ? 'tsx' : 'jsx'}`);
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Export Dependencies', () => {
  it('should return correct Vue3 dependencies', () => {
    const deps = getVue3Dependencies();
    expect(deps).toContainEqual(expect.objectContaining({ name: 'vue' }));
  });

  it('should return correct React dependencies', () => {
    const deps = getReactDependencies();
    expect(deps).toContainEqual(expect.objectContaining({ name: 'react' }));
    expect(deps).toContainEqual(expect.objectContaining({ name: 'react-dom' }));
  });
});

describe('Export Edge Cases', () => {
  it('should handle minimal schema', () => {
    const minimalSchema: UISchema = {
      version: '1.0',
      root: { id: 'root', type: 'Container' },
    };
    
    expect(exportToJSON(minimalSchema).success).toBe(true);
    expect(exportToVue3(minimalSchema).success).toBe(true);
    expect(exportToReact(minimalSchema).success).toBe(true);
  });

  it('should handle schema with nested children', () => {
    const nestedSchema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Container',
        children: [
          { id: 'text1', type: 'Text', text: 'Hello' },
          { id: 'btn1', type: 'Button', text: 'Click me' },
        ],
      },
    };
    
    const vueResult = exportToVue3(nestedSchema);
    expect(vueResult.success).toBe(true);
    expect(vueResult.content).toContain('Hello');
    
    const reactResult = exportToReact(nestedSchema);
    expect(reactResult.success).toBe(true);
    expect(reactResult.content).toContain('Hello');
  });
});
