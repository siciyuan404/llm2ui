/**
 * Schema Sync Property-Based Tests
 * 
 * Tests for Schema synchronization completeness and data binding preservation.
 * 
 * @module schema-sync.test
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
import { extractDataFields } from './data-binding';
import type { UISchema, UIComponent, DataContext } from '../types';

/**
 * Generator for valid component IDs
 */
const componentIdArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s));

/**
 * Generator for valid component types
 */
const componentTypeArb = fc.constantFrom(
  'container',
  'card',
  'button',
  'input',
  'text',
  'heading',
  'image',
  'list',
  'form',
  'select',
  'checkbox',
  'switch',
  'badge',
  'alert',
  'separator'
);

/**
 * Generator for safe property names (avoiding JavaScript reserved properties)
 */
const safePropertyNameArb = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s))
  .filter(s => !['valueOf', 'toString', 'constructor', 'prototype', '__proto__', 'hasOwnProperty'].includes(s));

/**
 * Generator for simple binding paths (e.g., "user", "user.name", "items[0]")
 */
const simpleBindingPathArb = fc.oneof(
  // Simple property: "user"
  safePropertyNameArb,
  // Nested property: "user.name"
  fc.tuple(
    safePropertyNameArb,
    safePropertyNameArb
  ).map(([a, b]) => `${a}.${b}`),
  // Array access: "items[0]"
  fc.tuple(
    safePropertyNameArb,
    fc.integer({ min: 0, max: 5 })
  ).map(([name, idx]) => `${name}[${idx}]`)
);

/**
 * Generator for binding expressions (e.g., "{{user.name}}")
 */
const bindingExpressionArb = simpleBindingPathArb.map(path => `{{${path}}}`);

/**
 * Generator for a leaf component (no children)
 */
const leafComponentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: componentIdArb,
  type: componentTypeArb,
  text: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  binding: fc.option(bindingExpressionArb, { nil: undefined }),
  props: fc.option(
    fc.record({
      label: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
      placeholder: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
    }),
    { nil: undefined }
  ),
});

/**
 * Generator for a component with optional children (max depth 2)
 */
const componentWithChildrenArb: fc.Arbitrary<UIComponent> = fc.record({
  id: componentIdArb,
  type: componentTypeArb,
  text: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  binding: fc.option(bindingExpressionArb, { nil: undefined }),
  props: fc.option(
    fc.record({
      label: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
    }),
    { nil: undefined }
  ),
  children: fc.option(
    fc.array(leafComponentArb, { minLength: 0, maxLength: 3 }),
    { nil: undefined }
  ),
});

/**
 * Ensure unique IDs in a component tree
 */
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

/**
 * Generator for valid UI Schema
 */
const validUISchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: componentWithChildrenArb,
  data: fc.option(
    fc.dictionary(
      fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
      fc.oneof(
        fc.string({ maxLength: 20 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.boolean()
      )
    ),
    { nil: undefined }
  ),
}).map(schema => ({
  ...schema,
  root: ensureUniqueIds(schema.root),
}));

/**
 * Generator for UI Schema with bindings
 */
const schemaWithBindingsArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: fc.record({
    id: fc.constant('root'),
    type: fc.constant('container'),
    children: fc.array(
      fc.record({
        id: componentIdArb,
        type: componentTypeArb,
        binding: bindingExpressionArb,
        text: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
      }),
      { minLength: 1, maxLength: 5 }
    ),
  }),
}).map(schema => ({
  ...schema,
  root: ensureUniqueIds(schema.root),
}));

/**
 * Generator for data context with various value types
 */
const dataContextArb: fc.Arbitrary<DataContext> = fc.dictionary(
  safePropertyNameArb,
  fc.oneof(
    fc.string({ maxLength: 50 }),
    fc.integer({ min: -1000, max: 1000 }),
    fc.boolean(),
    fc.constant(null),
    fc.array(fc.string({ maxLength: 10 }), { maxLength: 3 })
  )
);

/**
 * Generator for LLM response text containing UI Schema
 */
const llmResponseWithSchemaArb: fc.Arbitrary<string> = validUISchemaArb.map(schema => {
  const jsonStr = JSON.stringify(schema, null, 2);
  return `Here is the UI I generated for you:\n\n\`\`\`json\n${jsonStr}\n\`\`\`\n\nLet me know if you need any changes!`;
});

describe('Schema Sync', () => {
  let syncer: SchemaSyncer;

  beforeEach(() => {
    syncer = new SchemaSyncer();
  });

  /**
   * Feature: llm-chat-integration, Property 8: Schema 同步完整性
   * 
   * For any valid UI Schema, the sync operation should update the Schema content
   * to the JSON Editor, and extract all data binding fields to the Data Binding Editor.
   * 
   * **Validates: Requirements 4.1, 4.2**
   */
  describe('Property 8: Schema 同步完整性', () => {
    it('should successfully sync valid schemas to JSON editor', () => {
      fc.assert(
        fc.property(validUISchemaArb, (schema) => {
          const result = syncToJsonEditor(schema);
          
          expect(result.success).toBe(true);
          expect(result.schema).toBeDefined();
          expect(result.schema!.version).toBe(schema.version);
          expect(result.schema!.root.id).toBe(schema.root.id);
          expect(result.schema!.root.type).toBe(schema.root.type);
        }),
        { numRuns: 100 }
      );
    });

    it('should extract all binding fields when syncing to data binding editor', () => {
      fc.assert(
        fc.property(schemaWithBindingsArb, (schema) => {
          // Get expected bindings from schema
          const expectedFields = extractDataFields(schema);
          const expectedPaths = new Set(expectedFields.map(f => f.path));
          
          // Sync to data binding editor
          const result = syncToDataBindingEditor(schema);
          
          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();
          
          // Verify all binding paths are represented in the data context
          // Each path should have a corresponding key structure in the data
          for (const path of expectedPaths) {
            const topLevelKey = path.split('.')[0].split('[')[0];
            expect(topLevelKey in result.data!).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should sync schema using SchemaSyncer class and emit events', () => {
      fc.assert(
        fc.property(validUISchemaArb, (schema) => {
          const events: string[] = [];
          
          syncer.onSync((event) => {
            events.push(event.type);
          });
          
          const result = syncer.syncToJsonEditor(schema);
          
          expect(result.success).toBe(true);
          expect(events).toContain('schema_updated');
          expect(syncer.getCurrentSchema()).toEqual(schema);
        }),
        { numRuns: 100 }
      );
    });

    it('should extract and sync from LLM response text', () => {
      fc.assert(
        fc.property(llmResponseWithSchemaArb, (response) => {
          const result = extractAndSync(response);
          
          expect(result.success).toBe(true);
          expect(result.schema).toBeDefined();
          expect(result.schema!.version).toBe('1.0');
          expect(result.schema!.root).toBeDefined();
          expect(result.schema!.root.id).toBeDefined();
          expect(result.schema!.root.type).toBeDefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should return error for invalid schema', () => {
      const invalidSchemas = [
        { version: '1.0' }, // missing root
        { root: { id: 'test' } }, // missing version and type
        { version: '1.0', root: { type: 'button' } }, // missing id
        { version: '1.0', root: { id: 'test' } }, // missing type
      ];

      for (const invalidSchema of invalidSchemas) {
        const result = syncToJsonEditor(invalidSchema as unknown as UISchema);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('should return error when no schema found in response', () => {
      const responsesWithoutSchema = [
        'Hello, how can I help you?',
        'Here is some text without any JSON.',
        '```python\nprint("hello")\n```',
      ];

      for (const response of responsesWithoutSchema) {
        const result = extractAndSync(response);
        expect(result.success).toBe(false);
        expect(result.error).toContain('No valid UI Schema found');
      }
    });

    it('should extract binding paths correctly', () => {
      fc.assert(
        fc.property(schemaWithBindingsArb, (schema) => {
          const paths = extractBindingPaths(schema);
          const fields = extractDataFields(schema);
          
          // All extracted paths should be unique
          expect(paths.length).toBe(new Set(paths).size);
          
          // Number of unique paths should match
          const uniqueFieldPaths = new Set(fields.map(f => f.path));
          expect(paths.length).toBe(uniqueFieldPaths.size);
        }),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: llm-chat-integration, Property 9: 数据绑定字段保留
   * 
   * For any Schema sync operation, user-customized data values in the
   * Data Binding Editor should be preserved.
   * 
   * **Validates: Requirements 4.7**
   */
  describe('Property 9: 数据绑定字段保留', () => {
    it('should preserve existing data values when syncing new schema', () => {
      fc.assert(
        fc.property(
          schemaWithBindingsArb,
          dataContextArb,
          (schema, existingData) => {
            // Sync with existing data
            const result = syncToDataBindingEditor(schema, {
              preserveExistingData: true,
              existingData,
            });
            
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            
            // All existing data keys should be preserved
            for (const key of Object.keys(existingData)) {
              if (existingData[key] !== undefined) {
                expect(key in result.data!).toBe(true);
                // Value should be preserved (not overwritten with undefined)
                expect(result.data![key]).toEqual(existingData[key]);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should merge data contexts correctly with existing values taking precedence', () => {
      fc.assert(
        fc.property(
          dataContextArb,
          dataContextArb,
          (existingData, newData) => {
            const merged = mergeDataContexts(existingData, newData);
            
            // All keys from both contexts should be present
            const allKeys = new Set([
              ...Object.keys(existingData),
              ...Object.keys(newData),
            ]);
            
            for (const key of allKeys) {
              expect(key in merged).toBe(true);
            }
            
            // Existing values should take precedence
            for (const key of Object.keys(existingData)) {
              if (existingData[key] !== undefined) {
                expect(merged[key]).toEqual(existingData[key]);
              }
            }
            
            // New values should be used for keys not in existing
            for (const key of Object.keys(newData)) {
              if (!(key in existingData) || existingData[key] === undefined) {
                expect(merged[key]).toEqual(newData[key]);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not preserve data when preserveExistingData is false', () => {
      fc.assert(
        fc.property(
          schemaWithBindingsArb,
          dataContextArb,
          (schema, existingData) => {
            // Sync without preserving existing data
            const result = syncToDataBindingEditor(schema, {
              preserveExistingData: false,
              existingData,
            });
            
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            
            // Get schema binding fields
            const schemaFields = extractDataFields(schema);
            const schemaTopKeys = new Set(
              schemaFields.map(f => f.path.split('.')[0].split('[')[0])
            );
            
            // When not preserving, existing data keys that are NOT in schema should be absent
            for (const key of Object.keys(existingData)) {
              if (!schemaTopKeys.has(key) && !(schema.data && key in schema.data)) {
                // This key should NOT be in the result
                expect(key in result.data!).toBe(false);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve data through multiple sync operations', () => {
      fc.assert(
        fc.property(
          fc.array(schemaWithBindingsArb, { minLength: 2, maxLength: 4 }),
          dataContextArb,
          (schemas, initialData) => {
            let currentData = initialData;
            
            // Sync multiple schemas sequentially
            for (const schema of schemas) {
              const result = syncToDataBindingEditor(schema, {
                preserveExistingData: true,
                existingData: currentData,
              });
              
              expect(result.success).toBe(true);
              
              // Verify initial data is still preserved
              for (const key of Object.keys(initialData)) {
                if (initialData[key] !== undefined) {
                  expect(result.data![key]).toEqual(initialData[key]);
                }
              }
              
              currentData = result.data!;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use SchemaSyncer class to preserve data across syncs', () => {
      fc.assert(
        fc.property(
          schemaWithBindingsArb,
          schemaWithBindingsArb,
          dataContextArb,
          (schema1, schema2, initialData) => {
            // First sync with initial data
            syncer.syncToDataBindingEditor(schema1, {
              preserveExistingData: true,
              existingData: initialData,
            });
            
            // Second sync should preserve data from first sync
            const result = syncer.syncToDataBindingEditor(schema2, {
              preserveExistingData: true,
            });
            
            expect(result.success).toBe(true);
            
            // Initial data should still be preserved
            for (const key of Object.keys(initialData)) {
              if (initialData[key] !== undefined) {
                expect(syncer.getCurrentData()[key]).toEqual(initialData[key]);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include schema.data in merged result', () => {
      // Create a schema with data that doesn't conflict with bindings
      const schemaWithNonConflictingData: UISchema = {
        version: '1.0',
        root: {
          id: 'root',
          type: 'container',
          children: [
            { id: 'child1', type: 'text', binding: '{{user.name}}' }
          ]
        },
        data: {
          title: 'Test Title',
          count: 42,
          enabled: true
        }
      };

      const existingData: DataContext = {
        other: 'existing value'
      };

      const result = syncToDataBindingEditor(schemaWithNonConflictingData, {
        preserveExistingData: true,
        existingData,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      // Schema's data should be included
      expect(result.data!.title).toBe('Test Title');
      expect(result.data!.count).toBe(42);
      expect(result.data!.enabled).toBe(true);
      
      // Existing data should be preserved
      expect(result.data!.other).toBe('existing value');
      
      // Binding-derived structure should be present
      expect('user' in result.data!).toBe(true);
    });

    it('should build data context from fields correctly', () => {
      fc.assert(
        fc.property(schemaWithBindingsArb, (schema) => {
          const fields = extractDataFields(schema);
          const context = buildDataContextFromFields(fields);
          
          // Context should have structure for all binding paths
          for (const field of fields) {
            const topKey = field.path.split('.')[0].split('[')[0];
            expect(topKey in context).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('SchemaSyncer Event System', () => {
    it('should emit events and allow unsubscription', () => {
      fc.assert(
        fc.property(validUISchemaArb, (schema) => {
          const events: string[] = [];
          
          const unsubscribe = syncer.onSync((event) => {
            events.push(event.type);
          });
          
          // First sync should emit event
          syncer.syncToJsonEditor(schema);
          expect(events).toContain('schema_updated');
          
          // Unsubscribe
          unsubscribe();
          events.length = 0;
          
          // Second sync should not emit to unsubscribed listener
          syncer.syncToJsonEditor(schema);
          expect(events).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should emit error events for invalid operations', () => {
      const events: string[] = [];
      
      syncer.onSync((event) => {
        events.push(event.type);
      });
      
      // Try to extract from invalid response
      syncer.extractAndSync('no schema here');
      
      expect(events).toContain('sync_error');
    });

    it('should clear state correctly', () => {
      fc.assert(
        fc.property(validUISchemaArb, (schema) => {
          // Sync a schema
          syncer.syncToJsonEditor(schema);
          syncer.syncToDataBindingEditor(schema);
          
          expect(syncer.getCurrentSchema()).not.toBeNull();
          
          // Clear state
          syncer.clear();
          
          expect(syncer.getCurrentSchema()).toBeNull();
          expect(Object.keys(syncer.getCurrentData())).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });
  });
});
