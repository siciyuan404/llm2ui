/**
 * UI Schema Serialization Property-Based Tests
 * 
 * **Feature: llm2ui, Property 1: UI Schema 往返一致性**
 * **Validates: Requirements 5.5, 5.6, 5.7**
 * 
 * Tests that for any valid UISchema, serializing then deserializing
 * produces an equivalent schema (round-trip consistency).
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { serialize, deserialize, schemasEqual } from './serialization';
import type { UISchema, UIComponent, StyleProps, EventBinding } from '../types';

// Arbitrary generators for UISchema types

/**
 * Generator for StyleProps
 */
const stylePropsArb: fc.Arbitrary<StyleProps> = fc.record({
  className: fc.option(fc.string(), { nil: undefined }),
  width: fc.option(fc.oneof(fc.string(), fc.integer({ min: 0, max: 1000 })), { nil: undefined }),
  height: fc.option(fc.oneof(fc.string(), fc.integer({ min: 0, max: 1000 })), { nil: undefined }),
  margin: fc.option(fc.oneof(fc.string(), fc.integer({ min: 0, max: 100 })), { nil: undefined }),
  padding: fc.option(fc.oneof(fc.string(), fc.integer({ min: 0, max: 100 })), { nil: undefined }),
  display: fc.option(fc.constantFrom('block', 'inline', 'flex', 'grid', 'none'), { nil: undefined }),
  flexDirection: fc.option(fc.constantFrom('row', 'column', 'row-reverse', 'column-reverse'), { nil: undefined }),
  gap: fc.option(fc.oneof(fc.string(), fc.integer({ min: 0, max: 100 })), { nil: undefined }),
  backgroundColor: fc.option(fc.stringMatching(/^#[0-9a-fA-F]{6}$/), { nil: undefined }),
  color: fc.option(fc.stringMatching(/^#[0-9a-fA-F]{6}$/), { nil: undefined }),
}, { requiredKeys: [] });


/**
 * Generator for EventBinding
 */
const eventBindingArb: fc.Arbitrary<EventBinding> = fc.record({
  event: fc.constantFrom('click', 'change', 'submit', 'focus', 'blur'),
  action: fc.oneof(
    fc.record({ type: fc.constant('navigate' as const), url: fc.webUrl() }),
    fc.record({ type: fc.constant('submit' as const), endpoint: fc.option(fc.webUrl(), { nil: undefined }) }),
    fc.record({ type: fc.constant('toggle' as const), path: fc.string({ minLength: 1, maxLength: 20 }) }),
    fc.record({ 
      type: fc.constant('custom' as const), 
      handler: fc.string({ minLength: 1, maxLength: 20 }),
      params: fc.option(fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.jsonValue()), { nil: undefined })
    })
  ),
});

/**
 * Generator for UIComponent (recursive structure)
 * Uses letrec for recursive generation with depth control
 */
const uiComponentArb: fc.Arbitrary<UIComponent> = fc.letrec<{ component: UIComponent }>(tie => ({
  component: fc.record({
    id: fc.uuid(),
    type: fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container', 'Table', 'Form'),
    props: fc.option(
      fc.dictionary(
        fc.string({ minLength: 1, maxLength: 15 }),
        fc.jsonValue()
      ),
      { nil: undefined }
    ),
    style: fc.option(stylePropsArb, { nil: undefined }),
    children: fc.option(
      fc.array(tie('component'), { minLength: 0, maxLength: 3 }),
      { nil: undefined }
    ),
    text: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
    binding: fc.option(
      fc.string({ minLength: 1, maxLength: 30 }).map(s => `{{${s}}}`),
      { nil: undefined }
    ),
    events: fc.option(fc.array(eventBindingArb, { minLength: 0, maxLength: 2 }), { nil: undefined }),
    condition: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  }, { requiredKeys: ['id', 'type'] }),
})).component;


/**
 * Generator for UISchema
 */
const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constantFrom('1.0', '1.1', '2.0'),
  root: uiComponentArb,
  data: fc.option(
    fc.dictionary(
      fc.string({ minLength: 1, maxLength: 15 }),
      fc.jsonValue()
    ),
    { nil: undefined }
  ),
  meta: fc.option(
    fc.record({
      title: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
      description: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
      createdAt: fc.option(fc.date().map(d => d.toISOString()), { nil: undefined }),
      author: fc.option(fc.string({ minLength: 0, maxLength: 30 }), { nil: undefined }),
    }, { requiredKeys: [] }),
    { nil: undefined }
  ),
}, { requiredKeys: ['version', 'root'] });

describe('UI Schema Serialization', () => {
  /**
   * Property 1: UI Schema 往返一致性 (Round-trip Consistency)
   * 
   * For any valid UISchema, serializing then deserializing should produce
   * an equivalent schema.
   * 
   * **Validates: Requirements 5.5, 5.6, 5.7**
   */
  it('Property 1: serialize then deserialize produces equivalent schema (round-trip)', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        // Serialize the schema
        const json = serialize(schema);
        
        // Deserialize back
        const result = deserialize(json);
        
        // Should succeed
        expect(result.success).toBe(true);
        expect(result.schema).toBeDefined();
        
        // Should be equivalent to original
        expect(schemasEqual(schema, result.schema!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Pretty vs compact serialization round-trip
   */
  it('Property 1b: both pretty and compact serialization maintain round-trip consistency', () => {
    fc.assert(
      fc.property(uiSchemaArb, fc.boolean(), (schema, pretty) => {
        const json = serialize(schema, { pretty });
        const result = deserialize(json);
        
        expect(result.success).toBe(true);
        expect(schemasEqual(schema, result.schema!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});


describe('Deserialization Error Handling', () => {
  it('should reject empty input', () => {
    const result = deserialize('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Empty input');
  });

  it('should reject invalid JSON', () => {
    const result = deserialize('{ invalid json }');
    expect(result.success).toBe(false);
    expect(result.error).toContain('JSON parse error');
  });

  it('should reject schema without version', () => {
    const result = deserialize('{"root": {"id": "1", "type": "Button"}}');
    expect(result.success).toBe(false);
    expect(result.error).toContain('version');
  });

  it('should reject schema without root', () => {
    const result = deserialize('{"version": "1.0"}');
    expect(result.success).toBe(false);
    expect(result.error).toContain('root');
  });

  it('should reject root component without id', () => {
    const result = deserialize('{"version": "1.0", "root": {"type": "Button"}}');
    expect(result.success).toBe(false);
    expect(result.error).toContain('id');
  });

  it('should reject root component without type', () => {
    const result = deserialize('{"version": "1.0", "root": {"id": "1"}}');
    expect(result.success).toBe(false);
    expect(result.error).toContain('type');
  });
});
