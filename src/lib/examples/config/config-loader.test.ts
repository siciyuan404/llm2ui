/**
 * @file config-loader.test.ts
 * @description 配置加载器的单元测试和属性测试
 * @module lib/examples/config/config-loader
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateConfig,
  loadKeywordMappingsFromString,
  getDefaultKeywordMappings,
} from './config-loader';

// ============================================================================
// 单元测试
// ============================================================================

describe('validateConfig', () => {
  it('should validate a correct config', () => {
    const config = {
      version: '1.0.0',
      mappings: [
        { keywords: ['test'], boost: 1.0 },
        { keywords: ['hello', 'world'], tags: ['greeting'], boost: 1.5 },
      ],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject config without version', () => {
    const config = {
      mappings: [{ keywords: ['test'], boost: 1.0 }],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('version'))).toBe(true);
  });

  it('should reject config without mappings', () => {
    const config = { version: '1.0.0' };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('mappings'))).toBe(true);
  });

  it('should reject mapping without keywords', () => {
    const config = {
      version: '1.0.0',
      mappings: [{ boost: 1.0 }],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('keywords'))).toBe(true);
  });

  it('should reject mapping without boost', () => {
    const config = {
      version: '1.0.0',
      mappings: [{ keywords: ['test'] }],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('boost'))).toBe(true);
  });

  it('should warn about empty keywords array', () => {
    const config = {
      version: '1.0.0',
      mappings: [{ keywords: [], boost: 1.0 }],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.includes('空'))).toBe(true);
  });

  it('should reject non-string keywords', () => {
    const config = {
      version: '1.0.0',
      mappings: [{ keywords: [123, 'test'], boost: 1.0 }],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
  });

  it('should reject non-object config', () => {
    expect(validateConfig(null).valid).toBe(false);
    expect(validateConfig('string').valid).toBe(false);
    expect(validateConfig(123).valid).toBe(false);
  });
});

describe('loadKeywordMappingsFromString', () => {
  it('should load valid JSON config', () => {
    const json = JSON.stringify({
      version: '1.0.0',
      mappings: [
        { keywords: ['test'], boost: 1.0 },
        { keywords: ['hello'], tags: ['greeting'], boost: 1.5 },
      ],
    });
    const result = loadKeywordMappingsFromString(json);
    expect(result.success).toBe(true);
    expect(result.usedDefault).toBe(false);
    expect(result.mappings).toHaveLength(2);
    expect(result.version).toBe('1.0.0');
  });

  it('should return default mappings for invalid JSON', () => {
    const result = loadKeywordMappingsFromString('not valid json');
    expect(result.success).toBe(false);
    expect(result.usedDefault).toBe(true);
    expect(result.mappings.length).toBeGreaterThan(0);
  });

  it('should return default mappings for invalid config structure', () => {
    const json = JSON.stringify({ invalid: true });
    const result = loadKeywordMappingsFromString(json);
    expect(result.success).toBe(false);
    expect(result.usedDefault).toBe(true);
  });

  it('should preserve category in mappings', () => {
    const json = JSON.stringify({
      version: '1.0.0',
      mappings: [
        { keywords: ['form'], tags: ['form'], category: 'form', boost: 1.2 },
      ],
    });
    const result = loadKeywordMappingsFromString(json);
    expect(result.success).toBe(true);
    expect(result.mappings[0].category).toBe('form');
  });
});

describe('getDefaultKeywordMappings', () => {
  it('should return non-empty array', () => {
    const mappings = getDefaultKeywordMappings();
    expect(mappings.length).toBeGreaterThan(0);
  });

  it('should return a copy (not the original)', () => {
    const mappings1 = getDefaultKeywordMappings();
    const mappings2 = getDefaultKeywordMappings();
    expect(mappings1).not.toBe(mappings2);
    expect(mappings1).toEqual(mappings2);
  });

  it('should have valid structure for all mappings', () => {
    const mappings = getDefaultKeywordMappings();
    for (const mapping of mappings) {
      expect(Array.isArray(mapping.keywords)).toBe(true);
      expect(mapping.keywords.length).toBeGreaterThan(0);
      expect(typeof mapping.boost).toBe('number');
      expect(mapping.boost).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// 属性测试
// ============================================================================

describe('Config Loader Properties', () => {
  /**
   * Property 3: 配置加载健壮性
   * 任何有效的配置结构都应该成功加载
   */
  it('Property 3: should load any valid config structure', () => {
    const arbitraryValidConfig = fc.record({
      version: fc.string({ minLength: 1, maxLength: 10 }),
      mappings: fc.array(
        fc.record({
          keywords: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }), { nil: undefined }),
          boost: fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true }),
        }),
        { minLength: 1, maxLength: 10 }
      ),
    });

    fc.assert(
      fc.property(arbitraryValidConfig, (config) => {
        const json = JSON.stringify(config);
        const result = loadKeywordMappingsFromString(json);
        return result.success === true && result.usedDefault === false;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3b: 无效配置应该回退到默认值
   */
  it('Property 3b: should fallback to defaults for invalid configs', () => {
    const arbitraryInvalidConfig = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.string(),
      fc.integer(),
      fc.record({ version: fc.string() }), // missing mappings
      fc.record({ mappings: fc.array(fc.anything()) }), // missing version
    );

    fc.assert(
      fc.property(arbitraryInvalidConfig, (config) => {
        const json = JSON.stringify(config);
        const result = loadKeywordMappingsFromString(json);
        // 无效配置应该返回默认映射
        return result.usedDefault === true && result.mappings.length > 0;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4: 配置热重载一致性
   * 相同的配置字符串应该产生相同的映射结果
   */
  it('Property 4: should produce consistent results for same config', () => {
    const validConfig = {
      version: '1.0.0',
      mappings: [
        { keywords: ['test', 'hello'], tags: ['greeting'], boost: 1.5 },
        { keywords: ['form'], category: 'form', boost: 1.2 },
      ],
    };
    const json = JSON.stringify(validConfig);

    fc.assert(
      fc.property(fc.constant(json), (configJson) => {
        const result1 = loadKeywordMappingsFromString(configJson);
        const result2 = loadKeywordMappingsFromString(configJson);
        
        return (
          result1.success === result2.success &&
          result1.version === result2.version &&
          result1.mappings.length === result2.mappings.length &&
          JSON.stringify(result1.mappings) === JSON.stringify(result2.mappings)
        );
      }),
      { numRuns: 10 }
    );
  });
});
