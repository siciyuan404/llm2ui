/**
 * @file simple-embedding.ts
 * @description 简单词向量实现（基于词频和 TF-IDF）
 * @module lib/examples/retrieval/simple-embedding
 * @requirements REQ-6.6
 */

import type { EmbeddingVector } from './types';
import { BaseEmbeddingProvider, normalizeVector } from './embedding-provider';

// ============================================================================
// 常量
// ============================================================================

/** 默认向量维度 */
const DEFAULT_DIMENSION = 128;

/** 常用停用词（中英文） */
const STOP_WORDS = new Set([
  // 英文停用词
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under',
  'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just',
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  // 中文停用词
  '的', '了', '和', '是', '就', '都', '而', '及', '与', '着',
  '或', '一个', '没有', '我们', '你们', '他们', '它们', '这个', '那个',
  '这些', '那些', '什么', '怎么', '如何', '为什么', '哪个', '哪些',
]);

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 分词（简单实现）
 */
function tokenize(text: string): string[] {
  // 转小写
  const lower = text.toLowerCase();
  
  // 分词：按空格、标点符号分割，同时处理中文
  const tokens: string[] = [];
  
  // 英文分词
  const englishTokens = lower.match(/[a-z]+/g) || [];
  tokens.push(...englishTokens);
  
  // 中文分词（简单按字符分割，实际应用中可使用分词库）
  const chineseChars = lower.match(/[\u4e00-\u9fa5]+/g) || [];
  for (const chars of chineseChars) {
    // 简单的 bigram 分词
    for (let i = 0; i < chars.length - 1; i++) {
      tokens.push(chars.slice(i, i + 2));
    }
    // 也添加单字
    for (const char of chars) {
      tokens.push(char);
    }
  }
  
  // 过滤停用词和短词
  return tokens.filter(token => 
    token.length > 1 && !STOP_WORDS.has(token)
  );
}

/**
 * 计算词频
 */
function computeTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // 归一化
  const maxFreq = Math.max(...tf.values());
  if (maxFreq > 0) {
    for (const [term, freq] of tf) {
      tf.set(term, freq / maxFreq);
    }
  }
  return tf;
}

/**
 * 简单哈希函数（用于将词映射到向量维度）
 */
function hashString(str: string, dimension: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % dimension;
}

/**
 * 获取词的多个哈希位置（用于减少冲突）
 */
function getHashPositions(term: string, dimension: number, numHashes: number = 3): number[] {
  const positions: number[] = [];
  for (let i = 0; i < numHashes; i++) {
    positions.push(hashString(term + i.toString(), dimension));
  }
  return positions;
}

// ============================================================================
// Simple Embedding Provider
// ============================================================================

/**
 * 简单词向量提供者
 * 使用词频哈希方法生成固定维度的向量
 */
export class SimpleEmbeddingProvider extends BaseEmbeddingProvider {
  private idfCache: Map<string, number> = new Map();
  private documentCount = 0;
  private documentFrequency: Map<string, number> = new Map();

  constructor(dimension: number = DEFAULT_DIMENSION) {
    super(dimension);
  }

  /**
   * 计算文本 embedding
   */
  async embed(text: string): Promise<EmbeddingVector> {
    const tokens = tokenize(text);
    const tf = computeTermFrequency(tokens);
    
    // 初始化向量
    const vector = new Array(this.dimension).fill(0);
    
    // 使用词频哈希方法填充向量
    for (const [term, freq] of tf) {
      const positions = getHashPositions(term, this.dimension);
      const idf = this.getIDF(term);
      const weight = freq * idf;
      
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        // 使用交替正负值减少冲突
        const sign = i % 2 === 0 ? 1 : -1;
        vector[pos] += sign * weight;
      }
    }
    
    // 归一化
    return normalizeVector(vector);
  }

  /**
   * 更新 IDF 统计（用于语料库）
   */
  updateCorpus(documents: string[]): void {
    this.documentCount = documents.length;
    this.documentFrequency.clear();
    
    for (const doc of documents) {
      const tokens = new Set(tokenize(doc));
      for (const token of tokens) {
        this.documentFrequency.set(
          token,
          (this.documentFrequency.get(token) || 0) + 1
        );
      }
    }
    
    // 清除 IDF 缓存
    this.idfCache.clear();
  }

  /**
   * 获取词的 IDF 值
   */
  private getIDF(term: string): number {
    if (this.idfCache.has(term)) {
      return this.idfCache.get(term)!;
    }
    
    const df = this.documentFrequency.get(term) || 0;
    const idf = df > 0
      ? Math.log((this.documentCount + 1) / (df + 1)) + 1
      : 1;
    
    this.idfCache.set(term, idf);
    return idf;
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建简单 embedding 提供者
 */
export function createSimpleEmbeddingProvider(
  dimension: number = DEFAULT_DIMENSION
): SimpleEmbeddingProvider {
  return new SimpleEmbeddingProvider(dimension);
}
