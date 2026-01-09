/**
 * @file semantic-retriever.ts
 * @description 语义检索器，使用 Embedding 提升案例匹配准确度
 * @module lib/examples/retrieval/semantic-retriever
 * @requirements REQ-6.1, REQ-6.2, REQ-6.3, REQ-6.4, REQ-6.5, REQ-6.6
 */

import type {
  EmbeddingProvider,
  EmbeddingVector,
  RetrievalOptions,
  RetrievalResult,
  CachedEmbedding,
  SemanticRetrieverOptions,
} from './types';
import { cosineSimilarity } from './embedding-provider';
import { SimpleEmbeddingProvider } from './simple-embedding';

// ============================================================================
// 常量
// ============================================================================

/** 默认关键词权重 */
const DEFAULT_KEYWORD_WEIGHT = 0.4;

/** 默认语义权重 */
const DEFAULT_SEMANTIC_WEIGHT = 0.6;

/** 默认返回结果数量 */
const DEFAULT_LIMIT = 5;

/** 默认最小分数阈值 */
const DEFAULT_MIN_SCORE = 0.1;

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 计算关键词匹配分数
 */
function calculateKeywordScore(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // 分词
  const queryTokens = queryLower.split(/\s+/).filter(t => t.length > 0);
  const textTokens = new Set(textLower.split(/\s+/).filter(t => t.length > 0));
  
  if (queryTokens.length === 0) return 0;
  
  // 计算匹配的词数
  let matchCount = 0;
  for (const token of queryTokens) {
    // 精确匹配
    if (textTokens.has(token)) {
      matchCount += 1;
      continue;
    }
    // 部分匹配
    for (const textToken of textTokens) {
      if (textToken.includes(token) || token.includes(textToken)) {
        matchCount += 0.5;
        break;
      }
    }
  }
  
  return matchCount / queryTokens.length;
}

// ============================================================================
// 案例接口
// ============================================================================

/**
 * 案例数据接口
 */
export interface ExampleData {
  id: string;
  title: string;
  description?: string;
  keywords?: string[];
}

// ============================================================================
// Semantic Retriever 类
// ============================================================================

/**
 * 语义检索器
 */
export class SemanticRetriever {
  private embeddingProvider: EmbeddingProvider;
  private keywordWeight: number;
  private semanticWeight: number;
  private cacheEmbeddings: boolean;
  private embeddingCache: Map<string, CachedEmbedding> = new Map();
  private examples: Map<string, ExampleData> = new Map();

  constructor(options: SemanticRetrieverOptions = {}) {
    this.embeddingProvider = options.embeddingProvider || new SimpleEmbeddingProvider();
    this.keywordWeight = options.keywordWeight ?? DEFAULT_KEYWORD_WEIGHT;
    this.semanticWeight = options.semanticWeight ?? DEFAULT_SEMANTIC_WEIGHT;
    this.cacheEmbeddings = options.cacheEmbeddings ?? true;
  }

  /**
   * 注册案例
   */
  registerExample(example: ExampleData): void {
    this.examples.set(example.id, example);
    // 清除该案例的缓存
    this.embeddingCache.delete(example.id);
  }

  /**
   * 批量注册案例
   */
  registerExamples(examples: ExampleData[]): void {
    for (const example of examples) {
      this.registerExample(example);
    }
  }

  /**
   * 移除案例
   */
  removeExample(id: string): void {
    this.examples.delete(id);
    this.embeddingCache.delete(id);
  }

  /**
   * 清除所有案例
   */
  clearExamples(): void {
    this.examples.clear();
    this.embeddingCache.clear();
  }

  /**
   * 检索相关案例
   */
  async retrieve(
    query: string,
    options: RetrievalOptions = {}
  ): Promise<RetrievalResult[]> {
    const {
      limit = DEFAULT_LIMIT,
      minScore = DEFAULT_MIN_SCORE,
      hybrid = true,
      keywordWeight = this.keywordWeight,
      semanticWeight = this.semanticWeight,
    } = options;

    if (this.examples.size === 0) {
      return [];
    }

    // 计算查询 embedding
    const queryEmbedding = await this.embeddingProvider.embed(query);

    // 计算每个案例的分数
    const results: RetrievalResult[] = [];

    for (const [id, example] of this.examples) {
      // 获取或计算案例 embedding
      const exampleEmbedding = await this.getExampleEmbedding(example);

      // 计算语义分数
      const semanticScore = cosineSimilarity(queryEmbedding, exampleEmbedding);

      // 计算关键词分数
      const searchText = [
        example.title,
        example.description || '',
        ...(example.keywords || []),
      ].join(' ');
      const keywordScore = calculateKeywordScore(query, searchText);

      // 计算综合分数
      let score: number;
      if (hybrid) {
        score = keywordWeight * keywordScore + semanticWeight * semanticScore;
      } else {
        score = semanticScore;
      }

      // 归一化分数到 0-1
      score = Math.max(0, Math.min(1, score));

      if (score >= minScore) {
        results.push({
          id,
          title: example.title,
          score,
          keywordScore,
          semanticScore,
        });
      }
    }

    // 按分数排序
    results.sort((a, b) => b.score - a.score);

    // 返回前 N 个结果
    return results.slice(0, limit);
  }

  /**
   * 预计算所有案例的 embedding
   */
  async precomputeEmbeddings(): Promise<void> {
    const examples = Array.from(this.examples.values());
    
    // 更新 IDF 统计
    if (this.embeddingProvider instanceof SimpleEmbeddingProvider) {
      const documents = examples.map(e => 
        [e.title, e.description || '', ...(e.keywords || [])].join(' ')
      );
      this.embeddingProvider.updateCorpus(documents);
    }

    // 批量计算 embedding
    for (const example of examples) {
      await this.getExampleEmbedding(example);
    }
  }

  /**
   * 清除 embedding 缓存
   */
  clearCache(): void {
    this.embeddingCache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; examples: number } {
    return {
      size: this.embeddingCache.size,
      examples: this.examples.size,
    };
  }

  /**
   * 获取或计算案例 embedding
   */
  private async getExampleEmbedding(example: ExampleData): Promise<EmbeddingVector> {
    // 检查缓存
    if (this.cacheEmbeddings && this.embeddingCache.has(example.id)) {
      return this.embeddingCache.get(example.id)!.combinedEmbedding;
    }

    // 组合文本
    const combinedText = [
      example.title,
      example.description || '',
      ...(example.keywords || []),
    ].join(' ');

    // 计算 embedding
    const combinedEmbedding = await this.embeddingProvider.embed(combinedText);

    // 缓存
    if (this.cacheEmbeddings) {
      this.embeddingCache.set(example.id, {
        id: example.id,
        titleEmbedding: combinedEmbedding, // 简化：使用组合 embedding
        combinedEmbedding,
        cachedAt: Date.now(),
      });
    }

    return combinedEmbedding;
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建语义检索器实例
 */
export function createSemanticRetriever(
  options?: SemanticRetrieverOptions
): SemanticRetriever {
  return new SemanticRetriever(options);
}
