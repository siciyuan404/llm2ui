/**
 * @file types.ts
 * @description 语义检索模块类型定义
 * @module lib/examples/retrieval/types
 */

// ============================================================================
// Embedding 类型
// ============================================================================

/**
 * Embedding 向量
 */
export type EmbeddingVector = number[];

/**
 * Embedding 提供者接口
 */
export interface EmbeddingProvider {
  /** 计算文本 embedding */
  embed(text: string): Promise<EmbeddingVector>;
  /** 批量计算 embedding */
  embedBatch(texts: string[]): Promise<EmbeddingVector[]>;
  /** 获取 embedding 维度 */
  getDimension(): number;
}

// ============================================================================
// 检索类型
// ============================================================================

/**
 * 检索选项
 */
export interface RetrievalOptions {
  /** 返回结果数量 */
  limit?: number;
  /** 最小相似度阈值 */
  minScore?: number;
  /** 是否使用混合模式 */
  hybrid?: boolean;
  /** 关键词权重（混合模式） */
  keywordWeight?: number;
  /** 语义权重（混合模式） */
  semanticWeight?: number;
}

/**
 * 检索结果
 */
export interface RetrievalResult {
  /** 案例 ID */
  id: string;
  /** 案例标题 */
  title: string;
  /** 综合分数 */
  score: number;
  /** 关键词分数 */
  keywordScore: number;
  /** 语义分数 */
  semanticScore: number;
}

/**
 * 缓存的案例 embedding
 */
export interface CachedEmbedding {
  /** 案例 ID */
  id: string;
  /** 标题 embedding */
  titleEmbedding: EmbeddingVector;
  /** 描述 embedding */
  descriptionEmbedding?: EmbeddingVector;
  /** 组合 embedding */
  combinedEmbedding: EmbeddingVector;
  /** 缓存时间 */
  cachedAt: number;
}

/**
 * 语义检索器选项
 */
export interface SemanticRetrieverOptions {
  /** 关键词权重 */
  keywordWeight?: number;
  /** 语义权重 */
  semanticWeight?: number;
  /** 是否缓存 embedding */
  cacheEmbeddings?: boolean;
  /** Embedding 提供者 */
  embeddingProvider?: EmbeddingProvider;
}
