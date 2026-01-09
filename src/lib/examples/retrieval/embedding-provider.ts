/**
 * @file embedding-provider.ts
 * @description Embedding 提供者接口和基础实现
 * @module lib/examples/retrieval/embedding-provider
 */

import type { EmbeddingProvider, EmbeddingVector } from './types';

/**
 * 抽象 Embedding 提供者基类
 */
export abstract class BaseEmbeddingProvider implements EmbeddingProvider {
  protected dimension: number;

  constructor(dimension: number) {
    this.dimension = dimension;
  }

  /**
   * 计算文本 embedding
   */
  abstract embed(text: string): Promise<EmbeddingVector>;

  /**
   * 批量计算 embedding
   */
  async embedBatch(texts: string[]): Promise<EmbeddingVector[]> {
    return Promise.all(texts.map(text => this.embed(text)));
  }

  /**
   * 获取 embedding 维度
   */
  getDimension(): number {
    return this.dimension;
  }
}

/**
 * 计算余弦相似度
 */
export function cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * 归一化向量
 */
export function normalizeVector(vector: EmbeddingVector): EmbeddingVector {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return vector;
  return vector.map(val => val / norm);
}

/**
 * 向量加法
 */
export function addVectors(a: EmbeddingVector, b: EmbeddingVector): EmbeddingVector {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }
  return a.map((val, i) => val + b[i]);
}

/**
 * 向量平均
 */
export function averageVectors(vectors: EmbeddingVector[]): EmbeddingVector {
  if (vectors.length === 0) {
    throw new Error('Cannot average empty vector array');
  }

  const dimension = vectors[0].length;
  const sum = new Array(dimension).fill(0);

  for (const vector of vectors) {
    for (let i = 0; i < dimension; i++) {
      sum[i] += vector[i];
    }
  }

  return sum.map(val => val / vectors.length);
}
