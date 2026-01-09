/**
 * @file 提示词缓存
 * @description 缓存构建的提示词，避免重复计算
 * @module lib/llm/prompt-cache
 */

import type { PromptBuildResult } from './prompt-builder';

/**
 * 缓存条目
 */
export interface CacheEntry {
  /** 缓存的结果 */
  result: PromptBuildResult;
  /** 创建时间 */
  createdAt: number;
  /** 模板文件修改时间 */
  templateMtimes: Record<string, number>;
}

/**
 * 缓存选项
 */
export interface PromptCacheOptions {
  /** 最大缓存条目数，默认 100 */
  maxSize?: number;
}

/**
 * 缓存接口
 */
export interface IPromptCache {
  get(key: string): CacheEntry | undefined;
  set(key: string, entry: CacheEntry): void;
  clear(): void;
  isValid(entry: CacheEntry): boolean;
  size(): number;
}

/**
 * LRU 缓存节点
 */
interface LRUNode {
  key: string;
  entry: CacheEntry;
  prev: LRUNode | null;
  next: LRUNode | null;
}

/**
 * 提示词缓存
 * 
 * 使用 LRU 策略管理缓存，支持基于模板修改时间的失效
 */
export class PromptCache implements IPromptCache {
  private cache: Map<string, LRUNode> = new Map();
  private head: LRUNode | null = null;
  private tail: LRUNode | null = null;
  private maxSize: number;
  private currentTemplateMtimes: Record<string, number> = {};

  constructor(options: PromptCacheOptions = {}) {
    this.maxSize = options.maxSize ?? 100;
  }

  /**
   * 获取缓存条目
   */
  get(key: string): CacheEntry | undefined {
    const node = this.cache.get(key);
    if (!node) {
      return undefined;
    }

    // 检查缓存是否有效
    if (!this.isValid(node.entry)) {
      this.delete(key);
      return undefined;
    }

    // 移动到头部（最近使用）
    this.moveToHead(node);
    return node.entry;
  }

  /**
   * 设置缓存条目
   */
  set(key: string, entry: CacheEntry): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      // 更新现有条目
      existingNode.entry = entry;
      this.moveToHead(existingNode);
    } else {
      // 创建新条目
      const newNode: LRUNode = {
        key,
        entry,
        prev: null,
        next: null,
      };

      this.cache.set(key, newNode);
      this.addToHead(newNode);

      // 如果超过最大大小，移除最旧的条目
      if (this.cache.size > this.maxSize) {
        this.removeTail();
      }
    }
  }

  /**
   * 删除缓存条目
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }

    this.removeNode(node);
    this.cache.delete(key);
    return true;
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }

  /**
   * 检查缓存条目是否有效
   * 基于模板文件修改时间判断
   */
  isValid(entry: CacheEntry): boolean {
    // 检查模板修改时间
    for (const [template, mtime] of Object.entries(entry.templateMtimes)) {
      const currentMtime = this.currentTemplateMtimes[template];
      if (currentMtime !== undefined && currentMtime > mtime) {
        return false;
      }
    }
    return true;
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 更新模板修改时间
   */
  updateTemplateMtime(template: string, mtime: number): void {
    this.currentTemplateMtimes[template] = mtime;
  }

  /**
   * 批量更新模板修改时间
   */
  updateTemplateMtimes(mtimes: Record<string, number>): void {
    this.currentTemplateMtimes = { ...this.currentTemplateMtimes, ...mtimes };
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 检查是否存在缓存
   */
  has(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;
    if (!this.isValid(node.entry)) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; maxSize: number; keys: string[] } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: this.keys(),
    };
  }

  // LRU 辅助方法

  private addToHead(node: LRUNode): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: LRUNode): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private moveToHead(node: LRUNode): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): void {
    if (!this.tail) return;

    const tailKey = this.tail.key;
    this.removeNode(this.tail);
    this.cache.delete(tailKey);
  }
}

/**
 * 生成缓存键
 */
export function generateCacheKey(config: {
  language: string;
  sections: string[];
  maxTokens?: number;
  variables?: Record<string, unknown>;
}): string {
  const parts = [
    config.language,
    config.sections.sort().join(','),
    config.maxTokens?.toString() ?? 'unlimited',
    config.variables ? JSON.stringify(config.variables) : '',
  ];
  return parts.join('|');
}

// 默认导出单例实例
export const promptCache = new PromptCache();
