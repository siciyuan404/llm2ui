/**
 * Schema Sync Property-Based Tests
 * 
 * Tests for Schema synchronization completeness and data binding preservation.
 * 
 * @module lib/utils/schema-sync.test
 * @see Requirements 4.1, 4.2, 4.3, 4.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  SchemaSyncer,
  syncToJsonEditor,
  syncToDataBindingEditor,
  extractAndSync,
  buildDataContextFromFields,
  mergeDataContexts,
  extractBindingPaths,
} from './schema-sync';
import { extractDataFields } from '../core/data-binding';
import type { UISchema, UIComponent, DataContext } from '../../types';

const componentIdArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s));

const componentTypeArb = fc.constantFrom(
  'container', 'card', 'button', 'input', 'text', 'heading'
);

const safePropertyNameArb = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s))
  .filter(s => !['valueOf', 'toString', 'constructor', 'prototype', '__proto__'].includes(s));

const simpleBindingPathArb = fc.oneof(
  safePropertyNameArb,
  fc.tuple(safePropertyNameArb, safePropertyNameArb).map(([a, b]) => `${a}.${b}`)
);

const bindingExpressionArb = simpleBindingPathArb.map(path => `{{${path}}}`);

function ensureUniqueIds(component: UIComponent, usedIds: Set<string> = new Set(), prefix = ''): UIComponent {
  let newId = component.id;
  let counter = 0;
  while (usedIds.has(newId)) {
    counter++;
    newId = `${component.id}_${prefix}${counter}`;
  }
  usedIds.add(newId);
  const result: UIComponent = { ...component, id: newId };
  if (component.children) {
    result.children = component.children.map((child, idx) => 
      ensureUniqueIds(child, usedIds, `${prefix}${idx}_`)
    );
  }
  return result;
}

const leafComponentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: componentIdArb,
  type: componentTypeArb,
  text: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  binding: fc.option(bindingExpressionArb, { nil: undefined }),
});

const validUISchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: leafComponentArb,
}).map(schema => ({
  ...schema,
  root: ensureUniqueIds(schema.root),
}));

const dataContextArb: fc.Arbitrary<DataContext> = fc.dictionary(
  safePropertyNameArb,
  fc.oneof(fc.string({ maxLength: 50 }), fc.integer({ min: -1000, max: 1000 }), fc.boolean())
);

describe('Schema Sync', () => {
  let syncer: SchemaSyncer;

  beforeEach(() => {
    syncer = new SchemaSyncer();
  });

  describe('Property 8: Schema 同步完整性', () => {
    it('should successfully sync valid schemas to JSON editor', () => {
      fc.assert(
        fc.property(validUISchemaArb, (schema) => {
          const result = syncToJsonEditor(schema);
          
          expect(result.success).toBe(true);
          expect(result.schema).toBeDefined();
          expect(result.schema!.version).toBe(schema.version);
          expect(result.schema!.root.id).toBe(schema.root.id);
        }),
        { numRuns: 50 }
      );
    });

    it('should sync schema using SchemaSyncer class and emit events', () => {
      fc.assert(
        fc.property(validUISchemaArb, (schema) => {
          const events: string[] = [];
          syncer.onSync((event) => events.push(event.type));
          
          const result = syncer.syncToJsonEditor(schema);
          
          expect(result.success).toBe(true);
          expect(events).toContain('schema_updated');
          expect(syncer.getCurrentSchema()).toEqual(schema);
        }),
        { numRuns: 50 }
      );
    });

    it('should return error for invalid schema', () => {
      const invalidSchemas = [
        { version: '1.0' },
        { root: { id: 'test' } },
      ];

      for (const invalidSchema of invalidSchemas) {
        const result = syncToJsonEditor(invalidSchema as unknown as UISchema);
        expect(result.success).toBe(false);
      }
    });

    it('should return error when no schema found in response', () => {
      const result = extractAndSync('Hello, no schema here');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid UI Schema found');
    });
  });

  describe('Property 9: 数据绑定字段保留', () => {
    it('should preserve existing data values when syncing new schema', () => {
      fc.assert(
        fc.property(validUISchemaArb, dataContextArb, (schema, existingData) => {
          const result = syncToDataBindingEditor(schema, {
            preserveExistingData: true,
            existingData,
          });
          
          expect(result.success).toBe(true);
          
          for (const key of Object.keys(existingData)) {
            if (existingData[key] !== undefined) {
              expect(key in result.data!).toBe(true);
              expect(result.data![key]).toEqual(existingData[key]);
            }
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should merge data contexts correctly with existing values taking precedence', () => {
      fc.assert(
        fc.property(dataContextArb, dataContextArb, (existingData, newData) => {
          const merged = mergeDataContexts(existingData, newData);
          
          const allKeys = new Set([...Object.keys(existingData), ...Object.keys(newData)]);
          
          for (const key of allKeys) {
            expect(key in merged).toBe(true);
          }
          
          for (const key of Object.keys(existingData)) {
            if (existingData[key] !== undefined) {
              expect(merged[key]).toEqual(existingData[key]);
            }
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('SchemaSyncer Event System', () => {
    it('should emit events and allow unsubscription', () => {
      fc.assert(
        fc.property(validUISchemaArb, (schema) => {
          const events: string[] = [];
          const unsubscribe = syncer.onSync((event) => events.push(event.type));
          
          syncer.syncToJsonEditor(schema);
          expect(events).toContain('schema_updated');
          
          unsubscribe();
          events.length = 0;
          
          syncer.syncToJsonEditor(schema);
          expect(events).toHaveLength(0);
        }),
        { numRuns: 50 }
      );
    });

    it('should clear state correctly', () => {
      fc.assert(
        fc.property(validUISchemaArb, (schema) => {
          syncer.syncToJsonEditor(schema);
          expect(syncer.getCurrentSchema()).not.toBeNull();
          
          syncer.clear();
          expect(syncer.getCurrentSchema()).toBeNull();
        }),
        { numRuns: 50 }
      );
    });
  });
});
