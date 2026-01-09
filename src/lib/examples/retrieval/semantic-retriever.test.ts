/**
 * @file semantic-retriever.test.ts
 * @description 语义检索器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SemanticRetriever, createSemanticRetriever } from './semantic-retriever';
import type { ExampleData } from './semantic-retriever';

describe('SemanticRetriever', () => {
  let retriever: SemanticRetriever;

  const sampleExamples: ExampleData[] = [
    {
      id: 'example-1',
      title: 'Login Form',
      description: 'A user authentication form with email and password fields',
      keywords: ['login', 'auth', 'form', 'user'],
    },
    {
      id: 'example-2',
      title: 'Dashboard Layout',
      description: 'A main dashboard with sidebar navigation and content area',
      keywords: ['dashboard', 'layout', 'sidebar', 'navigation'],
    },
    {
      id: 'example-3',
      title: 'Chat Interface',
      description: 'A messaging interface with message list and input bar',
      keywords: ['chat', 'message', 'conversation', 'input'],
    },
    {
      id: 'example-4',
      title: 'Settings Page',
      description: 'User settings and preferences configuration page',
      keywords: ['settings', 'preferences', 'config', 'user'],
    },
  ];

  beforeEach(() => {
    retriever = new SemanticRetriever();
    retriever.registerExamples(sampleExamples);
  });

  describe('registerExample', () => {
    it('应该注册单个案例', () => {
      const newRetriever = new SemanticRetriever();
      newRetriever.registerExample(sampleExamples[0]);
      
      const stats = newRetriever.getCacheStats();
      expect(stats.examples).toBe(1);
    });

    it('应该批量注册案例', () => {
      const newRetriever = new SemanticRetriever();
      newRetriever.registerExamples(sampleExamples);
      
      const stats = newRetriever.getCacheStats();
      expect(stats.examples).toBe(4);
    });
  });

  describe('retrieve', () => {
    it('应该返回相关案例', async () => {
      const results = await retriever.retrieve('login authentication');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('example-1');
    });

    it('应该按分数排序结果', async () => {
      const results = await retriever.retrieve('dashboard navigation');
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('应该限制返回结果数量', async () => {
      const results = await retriever.retrieve('user interface', { limit: 2 });
      
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('应该过滤低分结果', async () => {
      const results = await retriever.retrieve('xyz random query', { minScore: 0.5 });
      
      for (const result of results) {
        expect(result.score).toBeGreaterThanOrEqual(0.5);
      }
    });

    it('应该返回空数组当没有案例时', async () => {
      const emptyRetriever = new SemanticRetriever();
      const results = await emptyRetriever.retrieve('test query');
      
      expect(results).toEqual([]);
    });

    it('应该支持纯语义模式', async () => {
      const results = await retriever.retrieve('chat message', { hybrid: false });
      
      expect(results.length).toBeGreaterThan(0);
      // 在纯语义模式下，score 应该等于 semanticScore
      for (const result of results) {
        expect(Math.abs(result.score - result.semanticScore)).toBeLessThan(0.01);
      }
    });

    it('应该支持自定义权重', async () => {
      const results = await retriever.retrieve('settings config', {
        keywordWeight: 0.8,
        semanticWeight: 0.2,
      });
      
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('precomputeEmbeddings', () => {
    it('应该预计算所有案例的 embedding', async () => {
      const newRetriever = new SemanticRetriever();
      newRetriever.registerExamples(sampleExamples);
      
      await newRetriever.precomputeEmbeddings();
      
      const stats = newRetriever.getCacheStats();
      expect(stats.size).toBe(4);
    });
  });

  describe('clearCache', () => {
    it('应该清除 embedding 缓存', async () => {
      await retriever.precomputeEmbeddings();
      
      let stats = retriever.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      
      retriever.clearCache();
      
      stats = retriever.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('removeExample', () => {
    it('应该移除案例', () => {
      retriever.removeExample('example-1');
      
      const stats = retriever.getCacheStats();
      expect(stats.examples).toBe(3);
    });
  });

  describe('clearExamples', () => {
    it('应该清除所有案例', () => {
      retriever.clearExamples();
      
      const stats = retriever.getCacheStats();
      expect(stats.examples).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe('score bounds', () => {
    it('分数应该在 0-1 范围内', async () => {
      const results = await retriever.retrieve('test query');
      
      for (const result of results) {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
        expect(result.keywordScore).toBeGreaterThanOrEqual(0);
        expect(result.keywordScore).toBeLessThanOrEqual(1);
        expect(result.semanticScore).toBeGreaterThanOrEqual(-1); // 余弦相似度可能为负
        expect(result.semanticScore).toBeLessThanOrEqual(1);
      }
    });
  });
});

describe('createSemanticRetriever', () => {
  it('应该创建语义检索器实例', () => {
    const retriever = createSemanticRetriever();
    expect(retriever).toBeInstanceOf(SemanticRetriever);
  });

  it('应该支持自定义选项', () => {
    const retriever = createSemanticRetriever({
      keywordWeight: 0.3,
      semanticWeight: 0.7,
      cacheEmbeddings: false,
    });
    expect(retriever).toBeInstanceOf(SemanticRetriever);
  });
});
