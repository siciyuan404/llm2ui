/**
 * @file icon-compliance-validator.test.ts
 * @description Icon 合规验证器的单元测试和属性测试
 * @module lib/design-system
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  detectEmojis,
  getIconSuggestion,
  validateIconCompliance,
} from './emoji-validator';
import type { UISchema, UIComponent } from '@/types/ui-schema';

// ============================================================================
// 辅助函数
// ============================================================================

function extractAllEmojisFromSchema(schema: UISchema): string[] {
  const emojis: string[] = [];
  
  function traverse(component: UIComponent): void {
    if (component.props) {
      for (const value of Object.values(component.props)) {
        if (typeof value === 'string') {
          emojis.push(...detectEmojis(value));
        }
      }
    }
    if (component.children && Array.isArray(component.children)) {
      for (const child of component.children) {
        if (typeof child === 'string') {
          emojis.push(...detectEmojis(child));
        } else if (typeof child === 'object' && child !== null) {
          traverse(child as UIComponent);
        }
      }
    }
  }
  
  if (schema.root) {
    traverse(schema.root);
  }
  
  return [...new Set(emojis)];
}

// ============================================================================
// 单元测试
// ============================================================================

describe('detectEmojis', () => {
  it('should detect common UI emojis', () => {
    expect(detectEmojis('🔍 搜索')).toContain('🔍');
    expect(detectEmojis('🏠 首页')).toContain('🏠');
  });

  it('should detect multiple emojis in one string', () => {
    const result = detectEmojis('🔍 搜索 🏠 首页');
    expect(result).toContain('🔍');
    expect(result).toContain('🏠');
  });

  it('should return empty array for text without emojis', () => {
    expect(detectEmojis('Hello World')).toEqual([]);
    expect(detectEmojis('搜索')).toEqual([]);
  });

  it('should handle empty or invalid input', () => {
    expect(detectEmojis('')).toEqual([]);
    expect(detectEmojis(null as unknown as string)).toEqual([]);
    expect(detectEmojis(undefined as unknown as string)).toEqual([]);
  });

  it('should deduplicate emojis', () => {
    const result = detectEmojis('🔍 搜索 🔍 再搜索');
    expect(result).toEqual(['🔍']);
  });
});

describe('getIconSuggestion', () => {
  it('should return correct icon name for known emojis', () => {
    expect(getIconSuggestion('🔍')).toBe('search');
    expect(getIconSuggestion('🏠')).toBe('home');
    expect(getIconSuggestion('📦')).toBe('package');
  });

  it('should return undefined for unknown emojis', () => {
    expect(getIconSuggestion('😀')).toBeUndefined();
    expect(getIconSuggestion('🎉')).toBeUndefined();
  });
});

describe('validateIconCompliance', () => {
  it('should return valid for schema without emojis', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Box',
        props: { label: 'Hello' },
        children: [],
      },
    };
    const result = validateIconCompliance(schema);
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('should detect emoji in props', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Button',
        props: { label: '🔍 搜索' },
        children: [],
      },
    };
    const result = validateIconCompliance(schema);
    expect(result.valid).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].emoji).toBe('🔍');
    expect(result.warnings[0].suggestedIcon).toBe('search');
  });

  it('should detect emoji in nested children', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Box',
        children: [
          {
            id: 'child',
            type: 'Card',
            props: { title: '📁 文件管理' },
            children: [],
          },
        ],
      },
    };
    const result = validateIconCompliance(schema);
    expect(result.valid).toBe(false);
    expect(result.warnings[0].emoji).toBe('📁');
    expect(result.warnings[0].suggestedIcon).toBe('folder');
  });

  it('should handle empty schema', () => {
    const result = validateIconCompliance({} as UISchema);
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('should provide generic suggestion for unknown emojis', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Button',
        props: { label: '🎉 庆祝' },
        children: [],
      },
    };
    const result = validateIconCompliance(schema);
    expect(result.valid).toBe(false);
    expect(result.warnings[0].suggestedIcon).toBeUndefined();
    expect(result.warnings[0].suggestion).toContain('Icon 组件');
  });

  it('should provide correct path in warnings', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        id: 'root',
        type: 'Box',
        props: { label: '🔍' },
        children: [
          {
            id: 'child',
            type: 'Button',
            props: { title: '🏠' },
            children: [],
          },
        ],
      },
    };
    
    const result = validateIconCompliance(schema);
    const paths = result.warnings.map(w => w.path);
    
    expect(paths).toContain('root.props.label');
    expect(paths).toContain('root.children[0].props.title');
  });
});


// ============================================================================
// 属性测试
// ============================================================================

describe('Icon Compliance Validator Properties', () => {
  const knownEmojis = ['🔍', '🏠', '📦', '📁', '📄', '➕', '💬', '🔔', '❌', '✅'];
  const unknownEmojis = ['😀', '🎉', '🚀', '💡', '🔥'];
  const allEmojis = [...knownEmojis, ...unknownEmojis];

  const arbitraryTextWithEmoji = fc.tuple(
    fc.string({ minLength: 0, maxLength: 20 }),
    fc.constantFrom(...allEmojis),
    fc.string({ minLength: 0, maxLength: 20 })
  ).map(([prefix, emoji, suffix]) => `${prefix}${emoji}${suffix}`);

  const arbitraryUISchemaWithEmojis = fc.record({
    version: fc.constant('1.0'),
    root: fc.record({
      id: fc.constant('root'),
      type: fc.constant('Box'),
      props: fc.record({
        label: arbitraryTextWithEmoji,
      }),
      children: fc.array(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 10 }).map(s => `comp-${s}`),
          type: fc.constantFrom('Button', 'Card', 'Text'),
          props: fc.record({
            title: fc.oneof(fc.string(), arbitraryTextWithEmoji),
          }),
          children: fc.constant([]),
        }),
        { minLength: 0, maxLength: 3 }
      ),
    }),
  }) as fc.Arbitrary<UISchema>;

  /**
   * Property 1: Emoji 检测完整性
   * Feature: ui-generation-quality-improvement, Property 1: Emoji detection completeness
   * **Validates: Requirements 1.1, 1.2**
   */
  it('Property 1: should detect all emojis in any UISchema', () => {
    fc.assert(
      fc.property(
        arbitraryUISchemaWithEmojis,
        (schema) => {
          const result = validateIconCompliance(schema);
          const embeddedEmojis = extractAllEmojisFromSchema(schema);
          const detectedEmojis = result.warnings.map(w => w.emoji);
          return embeddedEmojis.every(e => detectedEmojis.includes(e));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Emoji 到 Icon 映射正确性
   * Feature: ui-generation-quality-improvement, Property 2: Emoji to Icon mapping correctness
   * **Validates: Requirements 1.3, 1.4**
   */
  it('Property 2: should correctly map known emojis to icon names', () => {
    const expectedMappings: Record<string, string> = {
      '🔍': 'search',
      '🏠': 'home',
      '📦': 'package',
      '📁': 'folder',
      '📄': 'file',
      '➕': 'plus',
      '💬': 'message-circle',
      '🔔': 'bell',
      '❌': 'x',
      '✅': 'check',
    };
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(expectedMappings)),
        (emoji) => {
          const suggestion = getIconSuggestion(emoji);
          return suggestion === expectedMappings[emoji];
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2b: 未知 emoji 应返回 undefined
   */
  it('Property 2b: should return undefined for unknown emojis', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...unknownEmojis),
        (emoji) => {
          const suggestion = getIconSuggestion(emoji);
          return suggestion === undefined;
        }
      ),
      { numRuns: 50 }
    );
  });
});
