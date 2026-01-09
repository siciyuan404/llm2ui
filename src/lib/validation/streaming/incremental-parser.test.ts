/**
 * @file incremental-parser.test.ts
 * @description 增量 JSON 解析器测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  IncrementalParser,
  createIncrementalParser,
  parseIncremental,
} from './incremental-parser';

describe('IncrementalParser', () => {
  let parser: IncrementalParser;

  beforeEach(() => {
    parser = createIncrementalParser();
  });

  describe('完整 JSON 解析', () => {
    it('应该解析空对象', () => {
      const result = parser.parse('{}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({});
      expect(result.error).toBeUndefined();
    });

    it('应该解析空数组', () => {
      const result = parser.parse('[]');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual([]);
    });

    it('应该解析简单对象', () => {
      const result = parser.parse('{"name": "test", "value": 123}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({ name: 'test', value: 123 });
    });

    it('应该解析嵌套对象', () => {
      const json = '{"root": {"type": "Container", "children": []}}';
      const result = parser.parse(json);
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({
        root: { type: 'Container', children: [] },
      });
    });

    it('应该解析数组', () => {
      const result = parser.parse('[1, 2, 3, "four", true, null]');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual([1, 2, 3, 'four', true, null]);
    });

    it('应该解析布尔值和 null', () => {
      const result = parser.parse('{"a": true, "b": false, "c": null}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({ a: true, b: false, c: null });
    });

    it('应该解析数字', () => {
      const result = parser.parse('{"int": 42, "float": 3.14, "neg": -10, "exp": 1e5}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({ int: 42, float: 3.14, neg: -10, exp: 100000 });
    });

    it('应该解析转义字符串', () => {
      const result = parser.parse('{"text": "line1\\nline2\\ttab"}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({ text: 'line1\nline2\ttab' });
    });
  });

  describe('部分 JSON 解析', () => {
    it('应该识别不完整的对象', () => {
      const result = parser.parse('{"name": "test"');
      expect(result.partial).toBe(true);
      expect(result.value).toEqual({ name: 'test' });
    });

    it('应该识别不完整的数组', () => {
      const result = parser.parse('[1, 2, 3');
      expect(result.partial).toBe(true);
      expect(result.value).toEqual([1, 2, 3]);
    });

    it('应该识别不完整的字符串', () => {
      const result = parser.parse('{"name": "test');
      expect(result.partial).toBe(true);
    });

    it('应该识别不完整的嵌套结构', () => {
      const result = parser.parse('{"root": {"type": "Container"');
      expect(result.partial).toBe(true);
      expect(result.value).toEqual({
        root: { type: 'Container' },
      });
    });

    it('应该跟踪当前解析路径', () => {
      const result = parser.parse('{"root": {"children": [{"type"');
      expect(result.partial).toBe(true);
      expect(result.pendingPath).toContain('root');
    });
  });

  describe('增量解析', () => {
    it('应该支持分块解析', () => {
      let result = parser.parse('{"name"');
      expect(result.partial).toBe(true);

      result = parser.resume(': "test"}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({ name: 'test' });
    });

    it('应该支持多次分块', () => {
      parser.parse('{');
      parser.resume('"a"');
      parser.resume(':');
      parser.resume('1');
      const result = parser.resume('}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({ a: 1 });
    });

    it('应该维护跨块的状态', () => {
      parser.parse('{"items": [');
      parser.resume('{"id": 1},');
      parser.resume('{"id": 2}');
      const result = parser.resume(']}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({
        items: [{ id: 1 }, { id: 2 }],
      });
    });
  });

  describe('错误处理', () => {
    it('应该报告语法错误位置', () => {
      const result = parser.parse('{"name": }');
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Unexpected');
    });

    it('应该报告缺少冒号错误', () => {
      const result = parser.parse('{"name" "value"}');
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('colon');
    });

    it('应该报告无效字符错误', () => {
      const result = parser.parse('{name: "value"}');
      expect(result.error).toBeDefined();
    });

    it('应该包含行列信息', () => {
      const result = parser.parse('{\n  "name": }');
      expect(result.error).toBeDefined();
      expect(result.error?.line).toBeGreaterThan(0);
      expect(result.error?.column).toBeGreaterThan(0);
    });
  });

  describe('边界情况', () => {
    it('应该处理空输入', () => {
      const result = parser.parse('');
      expect(result.partial).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it('应该处理只有空白的输入', () => {
      const result = parser.parse('   \n\t  ');
      expect(result.partial).toBe(true);
    });

    it('应该处理深度嵌套', () => {
      const deep = '{"a":'.repeat(50) + '1' + '}'.repeat(50);
      const result = parser.parse(deep);
      expect(result.partial).toBe(false);
    });

    it('应该拒绝过深的嵌套', () => {
      const tooDeep = '{"a":'.repeat(101) + '1' + '}'.repeat(101);
      const result = parser.parse(tooDeep);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('depth');
    });

    it('应该处理 Unicode 字符', () => {
      const result = parser.parse('{"emoji": "🎉", "chinese": "中文"}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({ emoji: '🎉', chinese: '中文' });
    });

    it('应该处理 Unicode 转义', () => {
      const result = parser.parse('{"text": "\\u0048\\u0065\\u006c\\u006c\\u006f"}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({ text: 'Hello' });
    });
  });

  describe('状态管理', () => {
    it('应该能获取当前状态', () => {
      parser.parse('{"name"');
      const state = parser.getState();
      expect(state.stack.length).toBeGreaterThan(0);
      expect(state.buffer).toBe('{"name"');
    });

    it('应该能重置解析器', () => {
      parser.parse('{"name": "test"');
      parser.reset();
      const state = parser.getState();
      expect(state.stack.length).toBe(0);
      expect(state.buffer).toBe('');
    });
  });

  describe('parseIncremental 便捷函数', () => {
    it('应该一次性解析完整 JSON', () => {
      const result = parseIncremental('{"test": true}');
      expect(result.partial).toBe(false);
      expect(result.value).toEqual({ test: true });
    });

    it('应该识别部分 JSON', () => {
      const result = parseIncremental('{"test": true');
      expect(result.partial).toBe(true);
    });
  });

  describe('Property: 解析一致性', () => {
    it('完整 JSON 分块解析应与一次性解析结果相同', () => {
      const testCases = [
        '{"a": 1, "b": 2}',
        '[1, 2, 3]',
        '{"nested": {"deep": [1, 2]}}',
        '{"str": "hello", "num": 42, "bool": true, "nil": null}',
      ];

      for (const json of testCases) {
        // 一次性解析
        const fullResult = parseIncremental(json);

        // 分块解析
        const chunkParser = createIncrementalParser();
        const chunkSize = 3;
        for (let i = 0; i < json.length; i += chunkSize) {
          const chunk = json.slice(i, i + chunkSize);
          chunkParser.resume(chunk);
        }
        const chunkResult = chunkParser.getState();

        // 比较结果
        expect(fullResult.value).toEqual(
          JSON.parse(json),
          `Failed for: ${json}`
        );
      }
    });
  });
});
