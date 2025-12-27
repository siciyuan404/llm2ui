/**
 * LLM Service Property-Based Tests
 * 
 * **Feature: llm-chat-integration**
 * 
 * Property tests for JSON extraction and LLM configuration.
 * 
 * Properties tested:
 * - Property 2: JSON 提取正确性 (Validates: Requirements 1.3, 8.4)
 * - Property 5: JSON 代码块提取完整性 (Validates: Requirements 5.1, 5.2, 5.5)
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  extractJSONBlocks,
  extractJSONBlocksWithMetadata,
  extractJSON,
  extractAllJSON,
  extractUISchema,
  validateLLMConfig,
  createLLMConfig,
  DEFAULT_CONFIGS,
  injectSystemPrompt,
} from './llm-service';
import { validateUISchema } from './validation';
import type { LLMConfig, ChatMessage } from './llm-service';
import type { UISchema, UIComponent } from '../types';

/**
 * Generator for valid UIComponent
 */
const uiComponentArb: fc.Arbitrary<UIComponent> = fc.letrec<{ component: UIComponent }>(tie => ({
  component: fc.record({
    id: fc.uuid(),
    type: fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container'),
    props: fc.option(
      fc.dictionary(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.oneof(fc.string(), fc.integer(), fc.boolean())
      ),
      { nil: undefined }
    ),
    children: fc.option(
      fc.array(tie('component'), { minLength: 0, maxLength: 2 }),
      { nil: undefined }
    ),
    text: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
  }, { requiredKeys: ['id', 'type'] }),
})).component;

/**
 * Generator for valid UISchema
 * Note: We exclude backticks from dictionary keys to avoid breaking markdown code block parsing
 */
const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constantFrom('1.0', '1.1', '2.0'),
  root: uiComponentArb,
  data: fc.option(
    fc.dictionary(
      fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('`')),
      fc.oneof(fc.string().filter(s => !s.includes('`')), fc.integer(), fc.boolean())
    ),
    { nil: undefined }
  ),
}, { requiredKeys: ['version', 'root'] });


describe('JSON Extraction', () => {
  /**
   * Property 2: JSON 提取正确性 (JSON Extraction Correctness)
   * 
   * For any valid JSON object wrapped in markdown code blocks,
   * extractJSON should correctly extract and parse it.
   * 
   * **Validates: Requirements 1.3, 8.4**
   */
  it('Property 2: extractJSON correctly extracts JSON from ```json blocks', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (jsonValue) => {
        // Wrap JSON in markdown code block
        const jsonString = JSON.stringify(jsonValue);
        const wrappedText = `Here is the JSON:\n\`\`\`json\n${jsonString}\n\`\`\`\nEnd of response.`;
        
        // Extract JSON
        const result = extractJSON(wrappedText);
        
        // Should succeed
        expect(result.success).toBe(true);
        expect(result.json).toBeDefined();
        expect(result.parsed).toBeDefined();
        
        // Parsed value should equal original
        expect(result.parsed).toEqual(jsonValue);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2b: extractJSON correctly extracts JSON from generic code blocks', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.jsonValue()),
          fc.array(fc.jsonValue())
        ),
        (jsonValue) => {
          // Wrap JSON in generic code block (starts with { or [)
          const jsonString = JSON.stringify(jsonValue);
          const wrappedText = `Response:\n\`\`\`\n${jsonString}\n\`\`\``;
          
          const result = extractJSON(wrappedText);
          
          expect(result.success).toBe(true);
          // Use JSON round-trip comparison to handle -0 vs 0 edge case
          // JSON.stringify(-0) === "0", so we compare via JSON serialization
          expect(JSON.stringify(result.parsed)).toBe(JSON.stringify(jsonValue));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2c: extractUISchema correctly extracts valid UISchema', () => {
    fc.assert(
      fc.property(uiSchemaArb, (schema) => {
        // Wrap UISchema in markdown code block
        const jsonString = JSON.stringify(schema);
        const wrappedText = `Generated UI:\n\`\`\`json\n${jsonString}\n\`\`\``;
        
        // Extract UISchema
        const extracted = extractUISchema(wrappedText);
        
        // Should succeed
        expect(extracted).not.toBeNull();
        expect(extracted!.version).toBe(schema.version);
        expect(extracted!.root.id).toBe(schema.root.id);
        expect(extracted!.root.type).toBe(schema.root.type);
      }),
      { numRuns: 100 }
    );
  });
});


describe('extractJSONBlocks', () => {
  it('should extract multiple JSON blocks', () => {
    const text = `
First block:
\`\`\`json
{"a": 1}
\`\`\`

Second block:
\`\`\`json
{"b": 2}
\`\`\`
`;
    const blocks = extractJSONBlocks(text);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toBe('{"a": 1}');
    expect(blocks[1]).toBe('{"b": 2}');
  });

  it('should return empty array for text without JSON', () => {
    const text = 'Just some plain text without any JSON.';
    const blocks = extractJSONBlocks(text);
    expect(blocks).toHaveLength(0);
  });

  it('should handle nested JSON objects', () => {
    const nested = { outer: { inner: { deep: [1, 2, 3] } } };
    const text = `\`\`\`json\n${JSON.stringify(nested)}\n\`\`\``;
    const blocks = extractJSONBlocks(text);
    expect(blocks).toHaveLength(1);
    expect(JSON.parse(blocks[0])).toEqual(nested);
  });
});


/**
 * Property 5: JSON 代码块提取完整性
 * 
 * **Feature: llm-chat-integration, Property 5: JSON 代码块提取完整性**
 * **Validates: Requirements 5.1, 5.2, 5.5**
 * 
 * For any text containing JSON code blocks in ```json ... ``` or ``` ... ``` format,
 * the extraction function should find all valid JSON blocks.
 */
describe('Property 5: JSON Code Block Extraction Completeness', () => {
  /**
   * Generator for valid JSON objects (excluding problematic -0 values)
   */
  const safeJsonObjectArb = fc.dictionary(
    fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('`')),
    fc.oneof(
      fc.string().filter(s => !s.includes('`')),
      fc.integer(),
      fc.boolean(),
      fc.constant(null)
    ),
    { minKeys: 1, maxKeys: 5 }
  );

  /**
   * Property 5a: All ```json blocks are extracted
   * For any number of JSON objects wrapped in ```json blocks,
   * extractJSONBlocks should find all of them.
   */
  it('Property 5a: extracts all ```json code blocks', () => {
    fc.assert(
      fc.property(
        fc.array(safeJsonObjectArb, { minLength: 1, maxLength: 5 }),
        (jsonObjects) => {
          // Create text with multiple ```json blocks
          const text = jsonObjects
            .map((obj, i) => `Block ${i}:\n\`\`\`json\n${JSON.stringify(obj)}\n\`\`\``)
            .join('\n\nSome text between blocks.\n\n');

          const blocks = extractJSONBlocks(text);

          // Should extract all blocks
          expect(blocks.length).toBe(jsonObjects.length);

          // Each extracted block should parse to the original object
          blocks.forEach((block, i) => {
            const parsed = JSON.parse(block);
            expect(parsed).toEqual(jsonObjects[i]);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5b: Generic code blocks with JSON content are extracted
   * When no ```json blocks exist, ``` blocks containing JSON should be extracted.
   */
  it('Property 5b: extracts JSON from generic ``` code blocks when no ```json blocks exist', () => {
    fc.assert(
      fc.property(safeJsonObjectArb, (jsonObject) => {
        // Create text with generic code block containing JSON
        const text = `Here is some data:\n\`\`\`\n${JSON.stringify(jsonObject)}\n\`\`\``;

        const blocks = extractJSONBlocks(text);

        // Should extract the block
        expect(blocks.length).toBe(1);
        expect(JSON.parse(blocks[0])).toEqual(jsonObject);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5c: Multiple JSON blocks preserve order
   * Extracted blocks should maintain their original order in the text.
   */
  it('Property 5c: extracted blocks preserve original order', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 2, maxLength: 5 }),
        (numbers) => {
          // Create text with numbered JSON blocks
          const text = numbers
            .map((n, i) => `\`\`\`json\n{"index": ${i}, "value": ${n}}\n\`\`\``)
            .join('\n');

          const blocks = extractJSONBlocks(text);
          
          expect(blocks.length).toBe(numbers.length);

          // Verify order is preserved
          blocks.forEach((block, i) => {
            const parsed = JSON.parse(block);
            expect(parsed.index).toBe(i);
            expect(parsed.value).toBe(numbers[i]);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5d: extractJSONBlocksWithMetadata provides correct positions
   * The metadata should include correct start and end positions.
   */
  it('Property 5d: metadata includes correct block positions', () => {
    fc.assert(
      fc.property(safeJsonObjectArb, (jsonObject) => {
        const jsonStr = JSON.stringify(jsonObject);
        const prefix = 'Some prefix text\n';
        const text = `${prefix}\`\`\`json\n${jsonStr}\n\`\`\`\nSuffix`;

        const blocksWithMeta = extractJSONBlocksWithMetadata(text);

        expect(blocksWithMeta.length).toBe(1);
        expect(blocksWithMeta[0].format).toBe('json');
        expect(blocksWithMeta[0].startIndex).toBe(prefix.length);
        expect(blocksWithMeta[0].content).toBe(jsonStr);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5e: extractAllJSON returns all valid parsed objects
   * For text with multiple JSON blocks, extractAllJSON should return all parsed objects.
   */
  it('Property 5e: extractAllJSON returns all valid parsed JSON objects', () => {
    fc.assert(
      fc.property(
        fc.array(safeJsonObjectArb, { minLength: 1, maxLength: 3 }),
        (jsonObjects) => {
          const text = jsonObjects
            .map(obj => `\`\`\`json\n${JSON.stringify(obj)}\n\`\`\``)
            .join('\n');

          const allParsed = extractAllJSON(text);

          expect(allParsed.length).toBe(jsonObjects.length);
          allParsed.forEach((parsed, i) => {
            expect(parsed).toEqual(jsonObjects[i]);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('extractJSON edge cases', () => {
  it('should return error for empty input', () => {
    const result = extractJSON('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid input');
  });

  it('should return error for text without JSON', () => {
    const result = extractJSON('No JSON here');
    expect(result.success).toBe(false);
    expect(result.error).toContain('No JSON blocks found');
  });

  it('should return error for invalid JSON in code block', () => {
    const result = extractJSON('```json\n{invalid}\n```');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse');
  });

  it('should extract first valid JSON when multiple blocks exist', () => {
    const text = `
\`\`\`json
{invalid}
\`\`\`

\`\`\`json
{"valid": true}
\`\`\`
`;
    const result = extractJSON(text);
    expect(result.success).toBe(true);
    expect(result.parsed).toEqual({ valid: true });
  });
});


/**
 * Property 6: UI Schema 验证正确性
 * 
 * **Feature: llm-chat-integration, Property 6: UI Schema 验证正确性**
 * **Validates: Requirements 5.3, 5.4**
 * 
 * For any JSON object, the validation function should correctly identify
 * whether it conforms to the UI Schema structure and return specific errors
 * for invalid schemas.
 */
describe('Property 6: UI Schema Validation Correctness', () => {
  /**
   * Generator for valid UIComponent (recursive with depth limit)
   */
  const validComponentArb: fc.Arbitrary<UIComponent> = fc.letrec<{ component: UIComponent }>(tie => ({
    component: fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container'),
      props: fc.option(
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 10 }),
          fc.oneof(fc.string(), fc.integer(), fc.boolean())
        ),
        { nil: undefined }
      ),
      children: fc.option(
        fc.array(tie('component'), { minLength: 0, maxLength: 2 }),
        { nil: undefined }
      ),
      text: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
    }, { requiredKeys: ['id', 'type'] }),
  })).component;

  /**
   * Generator for valid UISchema
   */
  const validSchemaArb: fc.Arbitrary<UISchema> = fc.record({
    version: fc.constantFrom('1.0', '1.1', '2.0'),
    root: validComponentArb,
    data: fc.option(
      fc.dictionary(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.oneof(fc.string(), fc.integer(), fc.boolean())
      ),
      { nil: undefined }
    ),
  }, { requiredKeys: ['version', 'root'] });

  /**
   * Property 6a: Valid schemas pass validation
   * For any valid UISchema, validateUISchema should return valid: true.
   */
  it('Property 6a: valid UISchema passes validation', () => {
    fc.assert(
      fc.property(validSchemaArb, (schema) => {
        const result = validateUISchema(schema);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6b: Missing version field is detected
   * For any object without version field, validation should fail with specific error.
   */
  it('Property 6b: missing version field is detected', () => {
    fc.assert(
      fc.property(validComponentArb, (root) => {
        const invalidSchema = { root };
        const result = validateUISchema(invalidSchema);
        
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'MISSING_FIELD')).toBe(true);
        expect(result.errors.some((e) => e.path === 'version')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6c: Missing root field is detected
   * For any object without root field, validation should fail with specific error.
   */
  it('Property 6c: missing root field is detected', () => {
    fc.assert(
      fc.property(fc.constantFrom('1.0', '1.1', '2.0'), (version) => {
        const invalidSchema = { version };
        const result = validateUISchema(invalidSchema);
        
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'MISSING_FIELD')).toBe(true);
        expect(result.errors.some((e) => e.path === 'root')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6d: Missing component id is detected
   * For any component without id field, validation should fail with specific error.
   */
  it('Property 6d: missing component id is detected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('1.0', '1.1', '2.0'),
        fc.constantFrom('Button', 'Input', 'Card'),
        (version, type) => {
          const invalidSchema = {
            version,
            root: { type }, // Missing id
          };
          const result = validateUISchema(invalidSchema);
          
          expect(result.valid).toBe(false);
          expect(result.errors.some((e) => e.code === 'MISSING_FIELD')).toBe(true);
          expect(result.errors.some((e) => e.path.includes('id'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6e: Missing component type is detected
   * For any component without type field, validation should fail with specific error.
   */
  it('Property 6e: missing component type is detected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('1.0', '1.1', '2.0'),
        fc.uuid(),
        (version, id) => {
          const invalidSchema = {
            version,
            root: { id }, // Missing type
          };
          const result = validateUISchema(invalidSchema);
          
          expect(result.valid).toBe(false);
          expect(result.errors.some((e) => e.code === 'MISSING_FIELD')).toBe(true);
          expect(result.errors.some((e) => e.path.includes('type'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6f: Non-object input is rejected
   * For any non-object input, validation should fail with INVALID_TYPE error.
   */
  it('Property 6f: non-object input is rejected', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)),
        (input) => {
          const result = validateUISchema(input);
          
          expect(result.valid).toBe(false);
          expect(result.errors.some((e) => e.code === 'INVALID_TYPE')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 7: UI Schema 序列化往返一致性
 * 
 * **Feature: llm-chat-integration, Property 7: UI Schema 序列化往返一致性**
 * **Validates: Requirements 5.6**
 * 
 * For any valid UI Schema, serializing to JSON string then parsing back
 * should produce an equivalent schema object.
 */
describe('Property 7: UI Schema Serialization Round-Trip Consistency', () => {
  /**
   * Generator for valid UIComponent (recursive with depth limit)
   */
  const validComponentArb: fc.Arbitrary<UIComponent> = fc.letrec<{ component: UIComponent }>(tie => ({
    component: fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container'),
      props: fc.option(
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 10 }),
          fc.oneof(fc.string(), fc.integer(), fc.boolean())
        ),
        { nil: undefined }
      ),
      children: fc.option(
        fc.array(tie('component'), { minLength: 0, maxLength: 2 }),
        { nil: undefined }
      ),
      text: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
    }, { requiredKeys: ['id', 'type'] }),
  })).component;

  /**
   * Generator for valid UISchema
   */
  const validSchemaArb: fc.Arbitrary<UISchema> = fc.record({
    version: fc.constantFrom('1.0', '1.1', '2.0'),
    root: validComponentArb,
    data: fc.option(
      fc.dictionary(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.oneof(fc.string(), fc.integer(), fc.boolean())
      ),
      { nil: undefined }
    ),
  }, { requiredKeys: ['version', 'root'] });

  /**
   * Property 7a: JSON.stringify then JSON.parse produces equivalent schema
   * For any valid UISchema, serializing then parsing should produce an equivalent object.
   */
  it('Property 7a: JSON.stringify then JSON.parse produces equivalent schema', () => {
    fc.assert(
      fc.property(validSchemaArb, (schema) => {
        // Serialize to JSON string
        const jsonString = JSON.stringify(schema);
        
        // Parse back to object
        const parsed = JSON.parse(jsonString);
        
        // Should be equivalent (using JSON comparison to handle edge cases)
        expect(JSON.stringify(parsed)).toBe(JSON.stringify(schema));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7b: Pretty-printed JSON maintains round-trip consistency
   * For any valid UISchema, pretty-printing then parsing should produce an equivalent object.
   */
  it('Property 7b: pretty-printed JSON maintains round-trip consistency', () => {
    fc.assert(
      fc.property(validSchemaArb, (schema) => {
        // Serialize with pretty printing
        const prettyJson = JSON.stringify(schema, null, 2);
        
        // Parse back
        const parsed = JSON.parse(prettyJson);
        
        // Should be equivalent
        expect(JSON.stringify(parsed)).toBe(JSON.stringify(schema));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7c: Extracted UISchema from LLM response maintains round-trip consistency
   * For any valid UISchema wrapped in code block, extracting and re-serializing should be consistent.
   */
  it('Property 7c: extracted UISchema from code block maintains round-trip consistency', () => {
    fc.assert(
      fc.property(validSchemaArb, (schema) => {
        // Wrap schema in code block (simulating LLM response)
        const llmResponse = `Here is the UI:\n\`\`\`json\n${JSON.stringify(schema)}\n\`\`\``;
        
        // Extract UISchema
        const extracted = extractUISchema(llmResponse);
        
        // Should successfully extract
        expect(extracted).not.toBeNull();
        
        // Re-serialize and compare
        const reSerializedOriginal = JSON.stringify(schema);
        const reSerializedExtracted = JSON.stringify(extracted);
        
        expect(reSerializedExtracted).toBe(reSerializedOriginal);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7d: Multiple serialization cycles maintain consistency
   * For any valid UISchema, multiple serialize/parse cycles should produce equivalent results.
   */
  it('Property 7d: multiple serialization cycles maintain consistency', () => {
    fc.assert(
      fc.property(validSchemaArb, (schema) => {
        // First cycle
        const json1 = JSON.stringify(schema);
        const parsed1 = JSON.parse(json1);
        
        // Second cycle
        const json2 = JSON.stringify(parsed1);
        const parsed2 = JSON.parse(json2);
        
        // Third cycle
        const json3 = JSON.stringify(parsed2);
        
        // All JSON strings should be identical
        expect(json2).toBe(json1);
        expect(json3).toBe(json1);
      }),
      { numRuns: 100 }
    );
  });
});

describe('extractUISchema edge cases', () => {
  it('should return null for non-UISchema JSON', () => {
    const text = '```json\n{"notASchema": true}\n```';
    const result = extractUISchema(text);
    expect(result).toBeNull();
  });

  it('should return null for UISchema without root.id', () => {
    const text = '```json\n{"version": "1.0", "root": {"type": "Button"}}\n```';
    const result = extractUISchema(text);
    expect(result).toBeNull();
  });

  it('should return null for UISchema without root.type', () => {
    const text = '```json\n{"version": "1.0", "root": {"id": "1"}}\n```';
    const result = extractUISchema(text);
    expect(result).toBeNull();
  });

  it('should add default version if missing', () => {
    const text = '```json\n{"root": {"id": "1", "type": "Button"}}\n```';
    const result = extractUISchema(text);
    expect(result).not.toBeNull();
    expect(result!.version).toBe('1.0');
  });
});


describe('LLM Configuration', () => {
  describe('validateLLMConfig', () => {
    it('should validate correct OpenAI config', () => {
      const config: LLMConfig = {
        provider: 'openai',
        apiKey: 'sk-test-key',
        model: 'gpt-4',
      };
      const result = validateLLMConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct Anthropic config', () => {
      const config: LLMConfig = {
        provider: 'anthropic',
        apiKey: 'sk-ant-test-key',
        model: 'claude-3-opus-20240229',
      };
      const result = validateLLMConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject config without apiKey', () => {
      const config = {
        provider: 'openai',
        model: 'gpt-4',
      } as LLMConfig;
      const result = validateLLMConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('API key is required');
    });

    it('should reject config without model', () => {
      const config = {
        provider: 'openai',
        apiKey: 'sk-test',
      } as LLMConfig;
      const result = validateLLMConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Model is required');
    });

    it('should reject custom provider without endpoint', () => {
      const config: LLMConfig = {
        provider: 'custom',
        apiKey: 'test-key',
        model: 'custom-model',
      };
      const result = validateLLMConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Endpoint is required for custom provider');
    });

    it('should reject invalid temperature', () => {
      const config: LLMConfig = {
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-4',
        temperature: 1.5,
      };
      const result = validateLLMConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Temperature must be between 0 and 1');
    });

    it('should reject negative maxTokens', () => {
      const config: LLMConfig = {
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-4',
        maxTokens: -100,
      };
      const result = validateLLMConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Max tokens must be positive');
    });
  });

  describe('createLLMConfig', () => {
    it('should merge with OpenAI defaults', () => {
      const config: LLMConfig = {
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-4-turbo',
      };
      const result = createLLMConfig(config);
      expect(result.endpoint).toBe(DEFAULT_CONFIGS.openai.endpoint);
      expect(result.maxTokens).toBe(DEFAULT_CONFIGS.openai.maxTokens);
      expect(result.model).toBe('gpt-4-turbo'); // User value preserved
    });

    it('should merge with Anthropic defaults', () => {
      const config: LLMConfig = {
        provider: 'anthropic',
        apiKey: 'sk-ant-test',
        model: 'claude-3-sonnet',
      };
      const result = createLLMConfig(config);
      expect(result.endpoint).toBe(DEFAULT_CONFIGS.anthropic.endpoint);
      expect(result.timeout).toBe(DEFAULT_CONFIGS.anthropic.timeout);
    });

    it('should allow overriding defaults', () => {
      const config: LLMConfig = {
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-4',
        maxTokens: 8192,
        temperature: 0.5,
      };
      const result = createLLMConfig(config);
      expect(result.maxTokens).toBe(8192);
      expect(result.temperature).toBe(0.5);
    });
  });
});


/**
 * Property 10: 系统提示词注入
 * 
 * **Feature: llm-chat-integration, Property 10: 系统提示词注入**
 * **Validates: Requirements 6.3**
 * 
 * For any messages sent to LLM, if a system prompt is configured,
 * the first message in the resulting array should be a system role message
 * containing the configured prompt.
 */
describe('Property 10: System Prompt Injection', () => {
  /**
   * Generator for valid chat messages (non-system role)
   */
  const userMessageArb: fc.Arbitrary<ChatMessage> = fc.record({
    role: fc.constant('user' as const),
    content: fc.string({ minLength: 1, maxLength: 200 }),
  });

  const assistantMessageArb: fc.Arbitrary<ChatMessage> = fc.record({
    role: fc.constant('assistant' as const),
    content: fc.string({ minLength: 1, maxLength: 200 }),
  });

  const nonSystemMessageArb: fc.Arbitrary<ChatMessage> = fc.oneof(
    userMessageArb,
    assistantMessageArb
  );

  const systemMessageArb: fc.Arbitrary<ChatMessage> = fc.record({
    role: fc.constant('system' as const),
    content: fc.string({ minLength: 1, maxLength: 200 }),
  });

  /**
   * Generator for LLM config with system prompt
   */
  const configWithPromptArb: fc.Arbitrary<LLMConfig> = fc.record({
    provider: fc.constantFrom('openai' as const, 'anthropic' as const, 'iflow' as const),
    apiKey: fc.string({ minLength: 10, maxLength: 50 }),
    model: fc.string({ minLength: 1, maxLength: 30 }),
    systemPrompt: fc.string({ minLength: 1, maxLength: 500 }),
  });

  /**
   * Generator for LLM config without system prompt
   */
  const configWithoutPromptArb: fc.Arbitrary<LLMConfig> = fc.record({
    provider: fc.constantFrom('openai' as const, 'anthropic' as const, 'iflow' as const),
    apiKey: fc.string({ minLength: 10, maxLength: 50 }),
    model: fc.string({ minLength: 1, maxLength: 30 }),
  });

  /**
   * Property 10a: System prompt is injected as first message
   * For any config with systemPrompt and messages without system role,
   * the first message should be a system message with the configured prompt.
   */
  it('Property 10a: system prompt is injected as first message when configured', () => {
    fc.assert(
      fc.property(
        fc.array(nonSystemMessageArb, { minLength: 1, maxLength: 5 }),
        configWithPromptArb,
        (messages, config) => {
          const result = injectSystemPrompt(messages, config);

          // Result should have one more message than original
          expect(result.length).toBe(messages.length + 1);

          // First message should be system role
          expect(result[0].role).toBe('system');

          // First message content should be the configured system prompt
          expect(result[0].content).toBe(config.systemPrompt);

          // Original messages should follow
          for (let i = 0; i < messages.length; i++) {
            expect(result[i + 1]).toEqual(messages[i]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10b: No injection when system prompt is not configured
   * For any config without systemPrompt, messages should remain unchanged.
   */
  it('Property 10b: no injection when system prompt is not configured', () => {
    fc.assert(
      fc.property(
        fc.array(nonSystemMessageArb, { minLength: 1, maxLength: 5 }),
        configWithoutPromptArb,
        (messages, config) => {
          const result = injectSystemPrompt(messages, config);

          // Result should be identical to original
          expect(result.length).toBe(messages.length);
          expect(result).toEqual(messages);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10c: No duplicate injection when messages already have system message
   * For any messages that already start with a system message,
   * no additional system message should be injected.
   */
  it('Property 10c: no duplicate injection when messages already have system message', () => {
    fc.assert(
      fc.property(
        systemMessageArb,
        fc.array(nonSystemMessageArb, { minLength: 0, maxLength: 5 }),
        configWithPromptArb,
        (systemMsg, otherMessages, config) => {
          const messages = [systemMsg, ...otherMessages];
          const result = injectSystemPrompt(messages, config);

          // Result should be identical to original (no injection)
          expect(result.length).toBe(messages.length);
          expect(result).toEqual(messages);

          // First message should still be the original system message
          expect(result[0].role).toBe('system');
          expect(result[0].content).toBe(systemMsg.content);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10d: Empty messages array with system prompt
   * For empty messages array with configured system prompt,
   * result should contain only the system message.
   */
  it('Property 10d: empty messages array with system prompt gets system message', () => {
    fc.assert(
      fc.property(configWithPromptArb, (config) => {
        const result = injectSystemPrompt([], config);

        // Result should have exactly one message
        expect(result.length).toBe(1);

        // That message should be the system prompt
        expect(result[0].role).toBe('system');
        expect(result[0].content).toBe(config.systemPrompt);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10e: Original messages are not mutated
   * For any messages and config, the original messages array should not be modified.
   */
  it('Property 10e: original messages array is not mutated', () => {
    fc.assert(
      fc.property(
        fc.array(nonSystemMessageArb, { minLength: 1, maxLength: 5 }),
        configWithPromptArb,
        (messages, config) => {
          // Create a deep copy of original messages
          const originalCopy = JSON.parse(JSON.stringify(messages));

          // Call injectSystemPrompt
          injectSystemPrompt(messages, config);

          // Original messages should be unchanged
          expect(messages).toEqual(originalCopy);
        }
      ),
      { numRuns: 100 }
    );
  });
});
