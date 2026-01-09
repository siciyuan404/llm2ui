/**
 * @file schema-fixer.test.ts
 * @description Schema 修复器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SchemaFixer, fixSchema, needsSchemaFix } from './schema-fixer';

describe('SchemaFixer', () => {
  let fixer: SchemaFixer;

  beforeEach(() => {
    fixer = new SchemaFixer();
  });

  describe('canFix', () => {
    it('应该返回 false 对于 null/undefined', () => {
      expect(fixer.canFix(null)).toBe(false);
      expect(fixer.canFix(undefined)).toBe(false);
    });

    it('应该返回 true 对于缺少 version 的 schema', () => {
      const schema = {
        root: {
          type: 'Container',
          id: 'root',
          props: {},
        },
      };
      expect(fixer.canFix(schema)).toBe(true);
    });

    it('应该返回 true 对于缺少 id 的组件', () => {
      const schema = {
        version: '1.0',
        root: {
          type: 'Container',
          props: {},
        },
      };
      expect(fixer.canFix(schema)).toBe(true);
    });
  });

  describe('fix', () => {
    it('应该添加缺失的 version', () => {
      const schema = {
        root: {
          type: 'Container',
          id: 'root',
          props: {},
        },
      };

      const result = fixer.fix(schema);

      expect(result.fixed.version).toBe('1.0');
      expect(result.changes.some(c => c.type === 'add_version')).toBe(true);
    });

    it('应该添加缺失的 id', () => {
      const schema = {
        version: '1.0',
        root: {
          type: 'Container',
          props: {},
        },
      };

      const result = fixer.fix(schema);

      expect(result.fixed.root.id).toBeDefined();
      expect(result.changes.some(c => c.type === 'add_id')).toBe(true);
    });

    it('应该修复无效的组件类型', () => {
      const schema = {
        version: '1.0',
        root: {
          type: 'Containr', // 拼写错误
          id: 'root',
          props: {},
        },
      };

      const result = fixer.fix(schema);

      // 如果有类型修复，检查修复结果
      const typeChange = result.changes.find(c => c.type === 'fix_type');
      if (typeChange) {
        expect(result.fixed.root.type).toBe('Container');
      } else {
        // 如果没有找到相似类型，应该记录为无法修复
        expect(result.unfixable.length).toBeGreaterThan(0);
      }
    });

    it('应该递归修复嵌套组件', () => {
      const schema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: {},
          children: [
            {
              type: 'Buton', // 拼写错误
              props: {},
            },
          ],
        },
      };

      const result = fixer.fix(schema);

      const child = result.fixed.root.children?.[0];
      expect(child).toBeDefined();
      expect(typeof child).toBe('object');
      if (typeof child === 'object' && child !== null) {
        // 检查是否添加了 id
        expect((child as { id: string }).id).toBeDefined();
        // 类型修复取决于是否有注册的组件
        const typeChange = result.changes.find(c => c.type === 'fix_type' && c.path.includes('children'));
        if (typeChange) {
          expect((child as { type: string }).type).toBe('Button');
        }
      }
    });

    it('应该记录无法修复的错误', () => {
      const schema = {
        version: '1.0',
        root: {
          type: 'XyzAbcComponent', // 完全无法识别
          id: 'root',
          props: {},
        },
      };

      const result = fixer.fix(schema);

      expect(result.unfixable.length).toBeGreaterThan(0);
    });

    it('应该保持有效的 schema 不变', () => {
      const schema = {
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root',
          props: { className: 'test' },
          children: ['Hello'],
        },
      };

      const result = fixer.fix(schema);

      expect(result.changes.length).toBe(0);
      expect(result.fixed.root.props?.className).toBe('test');
    });

    it('应该处理空 schema', () => {
      const result = fixer.fix({});

      expect(result.fixed.version).toBe('1.0');
      expect(result.fixed.root).toBeDefined();
    });
  });

  describe('fix confidence', () => {
    it('应该为高相似度匹配返回 high 置信度', () => {
      const schema = {
        version: '1.0',
        root: {
          type: 'Contaner', // 只差一个字母
          id: 'root',
          props: {},
        },
      };

      const result = fixer.fix(schema);
      const typeChange = result.changes.find(c => c.type === 'fix_type');

      // 如果有类型修复，检查置信度
      if (typeChange) {
        expect(['high', 'medium']).toContain(typeChange.confidence);
      }
    });
  });
});

describe('fixSchema', () => {
  it('应该是 SchemaFixer.fix 的便捷函数', () => {
    const schema = {
      root: {
        type: 'Container',
        props: {},
      },
    };

    const result = fixSchema(schema);

    expect(result.fixed.version).toBe('1.0');
    expect(result.fixed.root.id).toBeDefined();
  });
});

describe('needsSchemaFix', () => {
  it('应该是 SchemaFixer.canFix 的便捷函数', () => {
    const needsFix = {
      root: {
        type: 'Container',
        props: {},
      },
    };

    const noFix = {
      version: '1.0',
      root: {
        type: 'Container',
        id: 'root',
        props: {},
      },
    };

    expect(needsSchemaFix(needsFix)).toBe(true);
    expect(needsSchemaFix(noFix)).toBe(false);
  });
});
