/**
 * @file streaming-validator.test.ts
 * @description 流式验证器测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  StreamingValidator,
  createStreamingValidator,
  streamValidate,
} from './streaming-validator';
import type { ValidationError, ValidationWarning, PartialComponent } from './types';

describe('StreamingValidator', () => {
  let validator: StreamingValidator;

  beforeEach(() => {
    validator = createStreamingValidator();
  });

  describe('基本验证', () => {
    it('应该验证有效的完整 Schema', () => {
      const schema = JSON.stringify({
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root-1',
          children: [],
        },
      });

      validator.feed(schema);
      const result = validator.finalize();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.complete).toBe(true);
    });

    it('应该检测无效的组件类型', () => {
      const schema = JSON.stringify({
        version: '1.0',
        root: {
          type: 'InvalidComponent',
          id: 'root-1',
        },
      });

      validator.feed(schema);
      const result = validator.finalize();

      expect(result.errors.some(e => e.code === 'UNKNOWN_COMPONENT')).toBe(true);
    });

    it('应该检测缺少 root type', () => {
      const schema = JSON.stringify({
        version: '1.0',
        root: {
          id: 'root-1',
        },
      });

      validator.feed(schema);
      const result = validator.finalize();

      expect(result.warnings.some(w => w.code === 'MISSING_ROOT_TYPE')).toBe(true);
    });

    it('应该检测缺少 root id', () => {
      const schema = JSON.stringify({
        version: '1.0',
        root: {
          type: 'Container',
        },
      });

      validator.feed(schema);
      const result = validator.finalize();

      expect(result.warnings.some(w => w.code === 'MISSING_ROOT_ID')).toBe(true);
    });
  });

  describe('流式验证', () => {
    it('应该支持分块输入', () => {
      validator.feed('{"version": "1.0", ');
      validator.feed('"root": {"type": "Container", ');
      validator.feed('"id": "root-1", "children": []}}');

      const result = validator.finalize();
      expect(result.valid).toBe(true);
      expect(result.complete).toBe(true);
    });

    it('应该在发现组件类型时立即验证', () => {
      const errors: ValidationError[] = [];
      validator = createStreamingValidator({
        onError: (error) => errors.push(error),
      });

      validator.feed('{"root": {"type": "BadType"');
      
      // 应该已经检测到无效类型
      expect(errors.some(e => e.code === 'UNKNOWN_COMPONENT')).toBe(true);
    });

    it('应该处理不完整的 JSON', () => {
      validator.feed('{"version": "1.0", "root": {"type": "Container"');
      const result = validator.finalize();

      expect(result.complete).toBe(false);
      expect(result.warnings.some(w => w.code === 'INCOMPLETE_JSON')).toBe(true);
    });
  });

  describe('回调函数', () => {
    it('应该触发 onError 回调', () => {
      const onError = vi.fn();
      validator = createStreamingValidator({ onError });

      validator.feed('{"root": {"type": "UnknownType"}}');
      validator.finalize();

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].code).toBe('UNKNOWN_COMPONENT');
    });

    it('应该触发 onWarning 回调', () => {
      const onWarning = vi.fn();
      validator = createStreamingValidator({ onWarning });

      validator.feed('{"root": {"type": "Container"}}');
      validator.finalize();

      expect(onWarning).toHaveBeenCalled();
    });

    it('应该触发 onComponent 回调', () => {
      const onComponent = vi.fn();
      validator = createStreamingValidator({ onComponent });

      validator.feed('{"root": {"type": "Container", "id": "c1"}}');
      validator.finalize();

      expect(onComponent).toHaveBeenCalled();
      const component = onComponent.mock.calls[0][0] as PartialComponent;
      expect(component.type).toBe('Container');
    });
  });

  describe('状态管理', () => {
    it('应该能获取当前状态', () => {
      validator.feed('{"root": {"type": "Container"');
      const state = validator.getState();

      expect(state.components.length).toBeGreaterThan(0);
      expect(state.parserState).toBeDefined();
    });

    it('应该能重置验证器', () => {
      validator.feed('{"root": {"type": "BadType"}}');
      validator.reset();

      validator.feed('{"root": {"type": "Container", "id": "c1"}}');
      const result = validator.finalize();

      expect(result.valid).toBe(true);
    });
  });

  describe('JSON 语法错误', () => {
    it('应该检测语法错误', () => {
      validator.feed('{"root": }');
      const result = validator.finalize();

      expect(result.errors.some(e => e.code === 'JSON_SYNTAX_ERROR')).toBe(true);
    });

    it('应该报告错误位置', () => {
      validator.feed('{\n  "root": }');
      const result = validator.finalize();

      const syntaxError = result.errors.find(e => e.code === 'JSON_SYNTAX_ERROR');
      expect(syntaxError?.line).toBeDefined();
      expect(syntaxError?.column).toBeDefined();
    });
  });

  describe('嵌套组件验证', () => {
    it('应该验证嵌套的子组件', () => {
      const schema = JSON.stringify({
        version: '1.0',
        root: {
          type: 'Container',
          id: 'root-1',
          children: [
            { type: 'InvalidChild', id: 'child-1' },
            { type: 'Text', id: 'child-2' },
          ],
        },
      });

      validator.feed(schema);
      const result = validator.finalize();

      expect(result.errors.some(e => 
        e.code === 'UNKNOWN_COMPONENT' && e.path.includes('children')
      )).toBe(true);
    });

    it('应该发现所有组件', () => {
      const components: PartialComponent[] = [];
      validator = createStreamingValidator({
        onComponent: (c) => components.push(c),
      });

      const schema = JSON.stringify({
        root: {
          type: 'Container',
          id: 'root',
          children: [
            { type: 'Text', id: 'text-1' },
            { type: 'Button', id: 'btn-1' },
          ],
        },
      });

      validator.feed(schema);
      validator.finalize();

      expect(components.length).toBe(3);
    });
  });

  describe('streamValidate 便捷函数', () => {
    it('应该一次性验证完整 Schema', () => {
      const schema = JSON.stringify({
        version: '1.0',
        root: { type: 'Container', id: 'root' },
      });

      const result = streamValidate(schema);
      expect(result.valid).toBe(true);
    });

    it('应该检测错误', () => {
      const schema = JSON.stringify({
        root: { type: 'BadType' },
      });

      const result = streamValidate(schema);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Property: 验证完整性', () => {
    it('流式验证应发现所有组件类型错误', () => {
      const testCases = [
        { root: { type: 'Bad1', id: '1' } },
        { root: { type: 'Container', id: '1', children: [{ type: 'Bad2', id: '2' }] } },
        { root: { type: 'Bad3', id: '1', children: [{ type: 'Bad4', id: '2' }] } },
      ];

      for (const schema of testCases) {
        const result = streamValidate(JSON.stringify(schema));
        const badTypes = JSON.stringify(schema).match(/Bad\d/g) || [];
        const errorCount = result.errors.filter(e => e.code === 'UNKNOWN_COMPONENT').length;
        
        expect(errorCount).toBe(badTypes.length);
      }
    });
  });
});
