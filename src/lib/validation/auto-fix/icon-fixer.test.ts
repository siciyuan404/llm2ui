/**
 * @file icon-fixer.test.ts
 * @description Icon 修复器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IconFixer, fixIcons, needsIconFix } from './icon-fixer';
import type { UISchema } from '@/types/ui-schema';

describe('IconFixer', () => {
  let fixer: IconFixer;

  beforeEach(() => {
    fixer = new IconFixer();
  });

  describe('canFix', () => {
    it('应该返回 false 对于空 schema', () => {
      expect(fixer.canFix(null as unknown as UISchema)).toBe(false);
      expect(fixer.canFix({} as UISchema)).toBe(false);
    });

    it('应该返回 false 对于没有 emoji 的 schema', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: ['Hello World'],
        },
      };
      expect(fixer.canFix(schema)).toBe(false);
    });

    it('应该返回 true 对于包含 emoji 的 schema', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: ['🔍 Search'],
        },
      };
      expect(fixer.canFix(schema)).toBe(true);
    });
  });

  describe('fix', () => {
    it('应该修复 children 中的 emoji', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: ['🔍 Search'],
        },
      };

      const result = fixer.fix(schema);

      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.changes[0].emoji).toBe('🔍');
      expect(result.changes[0].confidence).toBe('high');
      expect(result.hasUnmapped).toBe(false);
    });

    it('应该修复 props 中的 emoji', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Button',
          id: 'btn',
          props: {
            label: '🏠 Home',
          },
        },
      };

      const result = fixer.fix(schema);

      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.fixed.root.props?.label).toContain('[home]');
    });

    it('应该处理未知 emoji 使用默认图标', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: ['🦄 Unicorn'], // 未映射的 emoji
        },
      };

      const result = fixer.fix(schema);

      expect(result.hasUnmapped).toBe(true);
      expect(result.unmappedEmojis).toContain('🦄');
      expect(result.changes[0].confidence).toBe('low');
    });

    it('应该递归修复嵌套组件', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: [
            {
              type: 'Container',
              id: 'nested',
              props: {},
              children: ['⭐ Star'],
            },
          ],
        },
      };

      const result = fixer.fix(schema);

      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.changes[0].emoji).toBe('⭐');
    });

    it('应该保持没有 emoji 的内容不变', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: { className: 'test' },
          children: ['Hello World'],
        },
      };

      const result = fixer.fix(schema);

      expect(result.changes.length).toBe(0);
      expect(result.fixed.root.props?.className).toBe('test');
    });

    it('应该处理多个 emoji', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: ['🔍 Search 🏠 Home'],
        },
      };

      const result = fixer.fix(schema);

      expect(result.changes.length).toBe(2);
    });
  });
});

describe('fixIcons', () => {
  it('应该是 IconFixer.fix 的便捷函数', () => {
    const schema: UISchema = {
      version: '1.0',
      root: {
        type: 'Container',
        id: 'root',
        props: {},
        children: ['🔍 Search'],
      },
    };

    const result = fixIcons(schema);

    expect(result.changes.length).toBeGreaterThan(0);
  });
});

describe('needsIconFix', () => {
  it('应该是 IconFixer.canFix 的便捷函数', () => {
    const schemaWithEmoji: UISchema = {
      version: '1.0',
      root: {
        type: 'Container',
        id: 'root',
        props: {},
        children: ['🔍 Search'],
      },
    };

    const schemaWithoutEmoji: UISchema = {
      version: '1.0',
      root: {
        type: 'Container',
        id: 'root',
        props: {},
        children: ['Search'],
      },
    };

    expect(needsIconFix(schemaWithEmoji)).toBe(true);
    expect(needsIconFix(schemaWithoutEmoji)).toBe(false);
  });
});
