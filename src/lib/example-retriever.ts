/**
 * @file example-retriever.ts
 * @description 案例检索器模块，根据用户输入检索相关案例
 * @module lib/example-retriever
 * @requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import type { ExampleCategory } from './example-tags';
import type { ExampleMetadata } from './preset-examples';
import type { ExampleLibrary } from './example-library';

/**
 * 检索选项接口
 */
export interface RetrievalOptions {
  /** 最大返回数量，默认 3 */
  maxResults?: number;
  /** 分类过滤 */
  category?: ExampleCategory;
  /** 最低相关度阈值，0-1，默认 0.1 */
  minScore?: number;
}

/**
 * 检索结果接口
 */
export interface RetrievalResult {
  /** 案例元数据 */
  example: ExampleMetadata;
  /** 相关度分数，0-1 */
  score: number;
  /** 匹配的关键词 */
  matchedKeywords: string[];
}

/**
 * 关键词映射配置接口
 */
export interface KeywordMapping {
  /** 关键词列表 */
  keywords: string[];
  /** 映射到的标签 */
  tags?: string[];
  /** 映射到的分类 */
  category?: ExampleCategory;
  /** 权重加成 */
  boost: number;
}

/**
 * 默认检索选项
 */
const DEFAULT_OPTIONS: Required<RetrievalOptions> = {
  maxResults: 3,
  category: undefined as unknown as ExampleCategory,
  minScore: 0.1,
};

/**
 * 默认关键词映射
 * 
 * 包含常见的中英文关键词到标签/分类的映射
 */
const DEFAULT_KEYWORD_MAPPINGS: KeywordMapping[] = [
  // 侧边栏相关
  {
    keywords: ['侧边栏', 'sidebar', '侧栏', '左侧导航', '侧边导航'],
    tags: ['sidebar', 'navigation'],
    boost: 1.5,
  },
  // 后台/管理相关
  {
    keywords: ['后台', 'admin', '管理', '管理系统', '管理后台', '控制台', 'console', 'dashboard'],
    tags: ['admin', 'dashboard'],
    category: 'dashboard',
    boost: 1.3,
  },
  // 导航相关
  {
    keywords: ['导航', 'navigation', 'nav', '菜单', 'menu', '导航栏'],
    tags: ['navigation', 'navbar'],
    category: 'navigation',
    boost: 1.2,
  },
  // 表单相关
  {
    keywords: ['表单', 'form', '输入', 'input', '提交'],
    tags: ['form'],
    category: 'form',
    boost: 1.2,
  },
  // 登录相关
  {
    keywords: ['登录', 'login', '登陆', '签到', 'signin', 'sign in'],
    tags: ['login', 'form'],
    category: 'form',
    boost: 1.4,
  },
  // 注册相关
  {
    keywords: ['注册', 'register', '注册表单', 'signup', 'sign up'],
    tags: ['register', 'form'],
    category: 'form',
    boost: 1.4,
  },
  // 搜索相关
  {
    keywords: ['搜索', 'search', '查找', '查询'],
    tags: ['search'],
    boost: 1.3,
  },
  // 卡片相关
  {
    keywords: ['卡片', 'card', '卡片组', '数据卡片'],
    tags: ['card'],
    boost: 1.1,
  },
  // 表格相关
  {
    keywords: ['表格', 'table', '列表', 'list', '数据表'],
    tags: ['table', 'list'],
    boost: 1.1,
  },
  // 头部/顶部相关
  {
    keywords: ['头部', 'header', '顶部', '顶部导航', '顶栏'],
    tags: ['header', 'navbar'],
    boost: 1.2,
  },
  // 底部相关
  {
    keywords: ['底部', 'footer', '页脚'],
    tags: ['footer'],
    boost: 1.1,
  },
  // 面包屑相关
  {
    keywords: ['面包屑', 'breadcrumb', '路径导航'],
    tags: ['breadcrumb'],
    category: 'navigation',
    boost: 1.3,
  },
  // 标签页相关
  {
    keywords: ['标签页', 'tabs', 'tab', '选项卡'],
    tags: ['tabs'],
    category: 'navigation',
    boost: 1.3,
  },
  // 步骤相关
  {
    keywords: ['步骤', 'steps', 'step', '向导', 'wizard', '流程'],
    tags: ['steps'],
    category: 'navigation',
    boost: 1.3,
  },
  // 设置相关
  {
    keywords: ['设置', 'settings', '配置', 'config', '偏好'],
    tags: ['settings'],
    boost: 1.2,
  },
  // 响应式相关
  {
    keywords: ['响应式', 'responsive', '自适应', '移动端', 'mobile'],
    tags: ['responsive', 'mobile'],
    boost: 1.1,
  },
  // 弹窗相关
  {
    keywords: ['弹窗', 'modal', '对话框', 'dialog', '弹出框'],
    tags: ['modal'],
    category: 'feedback',
    boost: 1.2,
  },
];

/**
 * 案例检索器类
 * 
 * 根据用户输入检索相关案例，支持关键词匹配和相关度排序
 */
export class ExampleRetriever {
  private library: ExampleLibrary;
  private keywordMappings: KeywordMapping[];

  /**
   * 创建案例检索器实例
   * @param library - 案例库实例
   */
  constructor(library: ExampleLibrary) {
    this.library = library;
    this.keywordMappings = [...DEFAULT_KEYWORD_MAPPINGS];
  }

  /**
   * 检索相关案例
   * @param userInput - 用户输入文本
   * @param options - 检索选项
   * @returns 按相关度排序的案例列表
   */
  retrieve(userInput: string, options?: RetrievalOptions): RetrievalResult[] {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const normalizedInput = userInput.toLowerCase().trim();

    if (!normalizedInput) {
      return [];
    }

    // 获取所有案例
    let examples = this.library.getAll();

    // 按分类过滤
    if (opts.category) {
      examples = examples.filter(e => e.category === opts.category);
    }

    // 计算每个案例的相关度分数
    const results: RetrievalResult[] = [];

    for (const example of examples) {
      const { score, matchedKeywords } = this.calculateScore(normalizedInput, example);

      if (score >= opts.minScore) {
        results.push({
          example,
          score,
          matchedKeywords,
        });
      }
    }

    // 按分数降序排序
    results.sort((a, b) => b.score - a.score);

    // 限制返回数量
    return results.slice(0, opts.maxResults);
  }

  /**
   * 添加关键词映射
   * @param mapping - 关键词映射配置
   */
  addKeywordMapping(mapping: KeywordMapping): void {
    this.keywordMappings.push(mapping);
  }

  /**
   * 获取所有关键词映射
   * @returns 关键词映射数组
   */
  getKeywordMappings(): KeywordMapping[] {
    return [...this.keywordMappings];
  }

  /**
   * 计算案例的相关度分数
   * @param normalizedInput - 标准化的用户输入
   * @param example - 案例元数据
   * @returns 分数和匹配的关键词
   */
  private calculateScore(
    normalizedInput: string,
    example: ExampleMetadata
  ): { score: number; matchedKeywords: string[] } {
    let score = 0;
    const matchedKeywords: string[] = [];

    const titleLower = example.title.toLowerCase();
    const descLower = example.description.toLowerCase();
    const tagsLower = example.tags.map(t => t.toLowerCase());

    // 1. 直接匹配标题
    if (titleLower.includes(normalizedInput) || normalizedInput.includes(titleLower)) {
      score += 0.4;
      matchedKeywords.push(example.title);
    }

    // 2. 直接匹配描述
    if (descLower.includes(normalizedInput)) {
      score += 0.2;
      matchedKeywords.push('description');
    }

    // 3. 匹配标签
    for (const tag of tagsLower) {
      if (normalizedInput.includes(tag) || tag.includes(normalizedInput)) {
        score += 0.15;
        matchedKeywords.push(tag);
      }
    }

    // 4. 关键词映射匹配
    for (const mapping of this.keywordMappings) {
      const matchedMappingKeywords = mapping.keywords.filter(
        kw => normalizedInput.includes(kw.toLowerCase())
      );

      if (matchedMappingKeywords.length > 0) {
        // 检查映射的标签是否与案例标签匹配
        if (mapping.tags) {
          const tagMatches = mapping.tags.filter(t => tagsLower.includes(t.toLowerCase()));
          if (tagMatches.length > 0) {
            score += 0.2 * mapping.boost;
            matchedKeywords.push(...matchedMappingKeywords);
          }
        }

        // 检查映射的分类是否与案例分类匹配
        if (mapping.category && mapping.category === example.category) {
          score += 0.15 * mapping.boost;
          if (!matchedKeywords.some(k => matchedMappingKeywords.includes(k))) {
            matchedKeywords.push(...matchedMappingKeywords);
          }
        }
      }
    }

    // 5. 分词匹配（将输入拆分为词进行匹配）
    const inputWords = this.tokenize(normalizedInput);
    const titleWords = this.tokenize(titleLower);
    const descWords = this.tokenize(descLower);

    for (const word of inputWords) {
      if (word.length < 2) continue; // 忽略太短的词

      if (titleWords.includes(word)) {
        score += 0.1;
        if (!matchedKeywords.includes(word)) {
          matchedKeywords.push(word);
        }
      }

      if (descWords.includes(word)) {
        score += 0.05;
        if (!matchedKeywords.includes(word)) {
          matchedKeywords.push(word);
        }
      }
    }

    // 归一化分数到 0-1 范围
    score = Math.min(1, score);

    return { score, matchedKeywords: [...new Set(matchedKeywords)] };
  }

  /**
   * 分词函数
   * 支持中英文分词
   * @param text - 输入文本
   * @returns 词数组
   */
  private tokenize(text: string): string[] {
    // 英文按空格和标点分词
    const englishWords = text.split(/[\s,.\-_]+/).filter(w => w.length > 0);

    // 中文按字符分词（简单实现，每2-3个字符为一个词）
    const chinesePattern = /[\u4e00-\u9fa5]+/g;
    const chineseMatches = text.match(chinesePattern) || [];
    const chineseWords: string[] = [];

    for (const match of chineseMatches) {
      // 添加完整的中文词
      chineseWords.push(match);
      // 添加2字词
      for (let i = 0; i < match.length - 1; i++) {
        chineseWords.push(match.slice(i, i + 2));
      }
    }

    return [...englishWords, ...chineseWords];
  }
}

/**
 * 创建案例检索器实例
 * @param library - 案例库实例
 * @returns 案例检索器实例
 */
export function createExampleRetriever(library: ExampleLibrary): ExampleRetriever {
  return new ExampleRetriever(library);
}
