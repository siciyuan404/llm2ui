/**
 * @file 提示词优化器
 * @description 当 Token 超限时智能裁剪内容
 * @module lib/llm/prompt-optimizer
 */

import { TokenCounter, tokenCounter } from './token-counter';

/**
 * 优化选项
 */
export interface OptimizeOptions {
  /** 目标 Token 数 */
  targetTokens: number;
  /** 裁剪优先级（数字越大越先被裁剪） */
  priorities?: Record<string, number>;
}

/**
 * 优化结果
 */
export interface OptimizeResult {
  /** 优化后的内容 */
  content: string;
  /** 优化后的 Token 数 */
  tokenCount: number;
  /** 被裁剪的部分 */
  trimmedSections: string[];
  /** 保留的部分 */
  remainingSections: string[];
}

/**
 * 部分内容
 */
export interface SectionData {
  name: string;
  content: string;
}

/**
 * 默认裁剪优先级
 * 数字越大越先被裁剪
 */
export const DEFAULT_TRIM_PRIORITIES: Record<string, number> = {
  'relevant-examples': 7,
  'negative-examples': 6,
  'positive-examples': 5,
  'component-docs': 4,
  'icon-guidelines': 3,
  'closing': 2,
  'system-intro': 1,
};

/**
 * 提示词优化器
 * 
 * 当 Token 超限时按优先级智能裁剪内容
 */
export class PromptOptimizer {
  private counter: TokenCounter;

  constructor(counter?: TokenCounter) {
    this.counter = counter || tokenCounter;
  }

  /**
   * 优化提示词，裁剪超出部分
   * 裁剪顺序: relevant-examples > negative-examples > positive-examples > component-docs > icon-guidelines > closing > system-intro
   */
  optimize(sections: Map<string, string>, options: OptimizeOptions): OptimizeResult {
    const priorities = options.priorities || DEFAULT_TRIM_PRIORITIES;
    
    // 转换为数组并计算初始内容
    const sectionArray: SectionData[] = Array.from(sections.entries()).map(([name, content]) => ({
      name,
      content,
    }));

    // 计算初始 Token 数
    const initialContent = sectionArray.map(s => s.content).join('\n\n');
    const initialTokens = this.counter.countTokens(initialContent);

    // 如果不超限，直接返回
    if (initialTokens <= options.targetTokens) {
      return {
        content: initialContent,
        tokenCount: initialTokens,
        trimmedSections: [],
        remainingSections: sectionArray.map(s => s.name),
      };
    }

    // 按优先级排序（优先级高的先裁剪）
    const sortedByPriority = [...sectionArray].sort((a, b) => {
      const priorityA = priorities[a.name] ?? 0;
      const priorityB = priorities[b.name] ?? 0;
      return priorityB - priorityA;
    });

    const trimmedSections: string[] = [];
    let remainingSections = [...sectionArray];

    // 逐个移除高优先级部分直到满足限制
    for (const section of sortedByPriority) {
      const content = remainingSections.map(s => s.content).join('\n\n');
      const tokenCount = this.counter.countTokens(content);

      if (tokenCount <= options.targetTokens) {
        return {
          content,
          tokenCount,
          trimmedSections,
          remainingSections: remainingSections.map(s => s.name),
        };
      }

      // 移除当前部分
      remainingSections = remainingSections.filter(s => s.name !== section.name);
      trimmedSections.push(section.name);
    }

    // 所有部分都被移除
    return {
      content: '',
      tokenCount: 0,
      trimmedSections,
      remainingSections: [],
    };
  }

  /**
   * 计算需要裁剪的部分以达到目标 Token 数
   */
  calculateTrimPlan(
    sections: Map<string, string>,
    targetTokens: number,
    priorities?: Record<string, number>
  ): string[] {
    const result = this.optimize(sections, { targetTokens, priorities });
    return result.trimmedSections;
  }

  /**
   * 估算裁剪后的 Token 数
   */
  estimateTokensAfterTrim(
    sections: Map<string, string>,
    sectionsToTrim: string[]
  ): number {
    const remainingContent = Array.from(sections.entries())
      .filter(([name]) => !sectionsToTrim.includes(name))
      .map(([, content]) => content)
      .join('\n\n');
    
    return this.counter.countTokens(remainingContent);
  }

  /**
   * 获取部分的优先级
   */
  getPriority(sectionName: string, customPriorities?: Record<string, number>): number {
    const priorities = customPriorities || DEFAULT_TRIM_PRIORITIES;
    return priorities[sectionName] ?? 0;
  }

  /**
   * 按优先级排序部分名称
   */
  sortByPriority(sectionNames: string[], customPriorities?: Record<string, number>): string[] {
    const priorities = customPriorities || DEFAULT_TRIM_PRIORITIES;
    return [...sectionNames].sort((a, b) => {
      const priorityA = priorities[a] ?? 0;
      const priorityB = priorities[b] ?? 0;
      return priorityB - priorityA;
    });
  }
}

// 默认导出单例实例
export const promptOptimizer = new PromptOptimizer();
