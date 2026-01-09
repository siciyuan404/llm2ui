/**
 * @file example-retriever.ts
 * @description 案例检索器模块，根据用户输入检索相关案例
 * @module lib/examples/example-retriever
 * @requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.4
 */

import type { ExampleCategory } from './example-tags';
// ExampleMetadata 从 shadcn 主题目录导入
import type { ExampleMetadata } from '../themes/builtin/shadcn/examples/presets';
import { ExampleLibrary } from './example-library';
import type { ExampleWithScore } from './example-registry';
import { ExampleRegistry } from './example-registry';
import { DiversityFilter } from './diversity-filter';

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
  /** 多样性阈值，0-1，默认 0.3。阈值为 0 时禁用多样性过滤 */
  diversityThreshold?: number;
  /** 是否使用 ExampleRegistry，默认 false（向后兼容） */
  useRegistry?: boolean;
  /** 质量评分权重，0-1，默认 0.2 */
  qualityWeight?: number;
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
  /** 质量评分（如果使用 Registry） */
  qualityScore?: number;
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

const DEFAULT_OPTIONS: Required<RetrievalOptions> = {
  maxResults: 3,
  category: undefined as unknown as ExampleCategory,
  minScore: 0.1,
  diversityThreshold: 0.3,
  useRegistry: false,
  qualityWeight: 0.2,
};

const DEFAULT_KEYWORD_MAPPINGS: KeywordMapping[] = [
  // Cherry Studio 风格关键词
  {
    keywords: ['cherry', 'cherry studio', 'cherry风格', 'cherry 风格', 'cherry样式', 'cherry 样式'],
    tags: ['cherry'],
    boost: 2.0,
  },
  {
    keywords: ['聊天', 'chat', '对话', 'conversation', '消息', 'message', 'ai对话', 'ai 对话'],
    tags: ['chat', 'cherry'],
    boost: 1.5,
  },
  {
    keywords: ['模型选择', 'model selector', '模型切换', '选择模型', 'llm', 'ai模型'],
    tags: ['model', 'cherry'],
    boost: 1.4,
  },
  {
    keywords: ['助手', 'assistant', 'agent', '智能助手', 'ai助手'],
    tags: ['assistant', 'cherry'],
    boost: 1.4,
  },
  {
    keywords: ['知识库', 'knowledge', 'knowledge base', '文档库', 'rag'],
    tags: ['knowledge', 'cherry'],
    boost: 1.4,
  },
  {
    keywords: ['提示词', 'prompt', 'prompts', '提示词库', 'prompt library'],
    tags: ['prompt', 'cherry'],
    boost: 1.4,
  },
  {
    keywords: ['翻译', 'translate', 'translation', '翻译面板'],
    tags: ['translation', 'cherry'],
    boost: 1.3,
  },
  {
    keywords: ['图片生成', 'image generation', '生成图片', 'ai绘画', 'ai画图'],
    tags: ['image', 'cherry'],
    boost: 1.3,
  },
  {
    keywords: ['mcp', 'mcp服务', 'mcp server', '插件'],
    tags: ['mcp', 'cherry'],
    boost: 1.3,
  },
  // 原有关键词映射
  {
    keywords: ['侧边栏', 'sidebar', '侧栏', '左侧导航', '侧边导航'],
    tags: ['sidebar', 'navigation'],
    boost: 1.5,
  },
  {
    keywords: ['后台', 'admin', '管理', '管理系统', '管理后台', '控制台', 'console', 'dashboard'],
    tags: ['admin', 'dashboard'],
    category: 'dashboard',
    boost: 1.3,
  },
  {
    keywords: ['导航', 'navigation', 'nav', '菜单', 'menu', '导航栏'],
    tags: ['navigation', 'navbar'],
    category: 'navigation',
    boost: 1.2,
  },
  {
    keywords: ['表单', 'form', '输入', 'input', '提交'],
    tags: ['form'],
    category: 'form',
    boost: 1.2,
  },
  {
    keywords: ['登录', 'login', '登陆', '签到', 'signin', 'sign in'],
    tags: ['login', 'form'],
    category: 'form',
    boost: 1.4,
  },
  {
    keywords: ['注册', 'register', '注册表单', 'signup', 'sign up'],
    tags: ['register', 'form'],
    category: 'form',
    boost: 1.4,
  },
  {
    keywords: ['搜索', 'search', '查找', '查询'],
    tags: ['search'],
    boost: 1.3,
  },
  {
    keywords: ['卡片', 'card', '卡片组', '数据卡片'],
    tags: ['card'],
    boost: 1.1,
  },
  {
    keywords: ['表格', 'table', '列表', 'list', '数据表'],
    tags: ['table', 'list'],
    boost: 1.1,
  },
  {
    keywords: ['头部', 'header', '顶部', '顶部导航', '顶栏'],
    tags: ['header', 'navbar'],
    boost: 1.2,
  },
  {
    keywords: ['底部', 'footer', '页脚'],
    tags: ['footer'],
    boost: 1.1,
  },
  {
    keywords: ['面包屑', 'breadcrumb', '路径导航'],
    tags: ['breadcrumb'],
    category: 'navigation',
    boost: 1.3,
  },
  {
    keywords: ['标签页', 'tabs', 'tab', '选项卡'],
    tags: ['tabs'],
    category: 'navigation',
    boost: 1.3,
  },
  {
    keywords: ['步骤', 'steps', 'step', '向导', 'wizard', '流程'],
    tags: ['steps'],
    category: 'navigation',
    boost: 1.3,
  },
  {
    keywords: ['设置', 'settings', '配置', 'config', '偏好'],
    tags: ['settings'],
    boost: 1.2,
  },
  {
    keywords: ['响应式', 'responsive', '自适应', '移动端', 'mobile'],
    tags: ['responsive', 'mobile'],
    boost: 1.1,
  },
  {
    keywords: ['弹窗', 'modal', '对话框', 'dialog', '弹出框'],
    tags: ['modal'],
    category: 'feedback',
    boost: 1.2,
  },
];


/**
 * 案例检索器选项
 */
export interface ExampleRetrieverOptions {
  /** 案例库实例 */
  library?: ExampleLibrary;
  /** 是否使用 ThemeManager 获取关键词映射，默认 true */
  useThemeManager?: boolean;
}

// 缓存 ThemeManager 类引用
let ThemeManagerClass: typeof import('../themes/theme-manager').ThemeManager | null = null;

/**
 * 设置 ThemeManager 类引用（用于延迟初始化）
 */
export function setThemeManagerClass(cls: typeof import('../themes/theme-manager').ThemeManager): void {
  ThemeManagerClass = cls;
}

/**
 * 获取 ThemeManager 类（如果已设置）
 */
function getThemeManagerClass(): typeof import('../themes/theme-manager').ThemeManager | null {
  return ThemeManagerClass;
}

/**
 * 案例检索器类
 * 支持从 ExampleLibrary 或 ExampleRegistry 获取案例
 * 支持从 ThemeManager 获取当前主题的关键词映射
 */
export class ExampleRetriever {
  private library: ExampleLibrary | null;
  private keywordMappings: KeywordMapping[];
  private diversityFilter: DiversityFilter;
  private useThemeManager: boolean;

  constructor(libraryOrOptions?: ExampleLibrary | ExampleRetrieverOptions) {
    // 兼容旧的构造函数签名
    if (libraryOrOptions instanceof ExampleLibrary) {
      this.library = libraryOrOptions;
      this.useThemeManager = true;
    } else if (libraryOrOptions) {
      this.library = libraryOrOptions.library || null;
      this.useThemeManager = libraryOrOptions.useThemeManager ?? true;
    } else {
      this.library = null;
      this.useThemeManager = true;
    }
    
    // 初始使用默认映射，稍后可以通过 refreshKeywordMappings 更新
    this.keywordMappings = [...DEFAULT_KEYWORD_MAPPINGS];
    this.diversityFilter = new DiversityFilter();
    
    // 尝试从 ThemeManager 加载映射（如果可用）
    this.tryLoadThemeMappings();
  }

  /**
   * 尝试从 ThemeManager 加载关键词映射
   */
  private tryLoadThemeMappings(): void {
    if (!this.useThemeManager) {
      return;
    }
    
    try {
      const ThemeManager = getThemeManagerClass();
      if (!ThemeManager) {
        return;
      }
      
      const themeManager = ThemeManager.getInstance();
      if (themeManager.getThemeCount() > 0) {
        const theme = themeManager.getActiveTheme();
        const themeKeywordMappings = theme.examples.keywordMappings;
        
        if (themeKeywordMappings && themeKeywordMappings.length > 0) {
          // 转换主题的关键词映射格式并合并
          const themeMappings = themeKeywordMappings.map((mapping: { keywords: string[]; exampleIds: string[] }) => ({
            keywords: mapping.keywords,
            tags: mapping.exampleIds,
            boost: 1.5,
          }));
          this.keywordMappings = [...themeMappings, ...DEFAULT_KEYWORD_MAPPINGS];
        }
      }
    } catch {
      // ThemeManager 未初始化或没有主题，使用默认映射
    }
  }

  /**
   * 刷新关键词映射（当主题切换时调用）
   */
  refreshKeywordMappings(): void {
    this.keywordMappings = [...DEFAULT_KEYWORD_MAPPINGS];
    this.tryLoadThemeMappings();
  }

  /**
   * 检索相关案例
   * @param userInput 用户输入
   * @param options 检索选项
   */
  retrieve(userInput: string, options?: RetrievalOptions): RetrievalResult[] {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const normalizedInput = userInput.toLowerCase().trim();

    if (!normalizedInput) {
      return [];
    }

    // 获取案例列表
    let examples: (ExampleMetadata | ExampleWithScore)[];
    if (opts.useRegistry) {
      examples = this.getExamplesFromRegistry(opts.category);
    } else if (this.library) {
      examples = this.library.getAll();
      if (opts.category) {
        examples = examples.filter(e => e.category === opts.category);
      }
    } else {
      return [];
    }

    const results: RetrievalResult[] = [];

    for (const example of examples) {
      const { score: relevanceScore, matchedKeywords } = this.calculateScore(normalizedInput, example);

      if (relevanceScore >= opts.minScore) {
        // 计算最终分数（结合相关度和质量评分）
        let finalScore = relevanceScore;
        let qualityScore: number | undefined;

        if (opts.useRegistry && 'qualityScore' in example) {
          qualityScore = example.qualityScore;
          // 质量评分归一化到 0-1 范围
          const normalizedQuality = qualityScore / 100;
          // 加权组合：(1 - qualityWeight) * relevance + qualityWeight * quality
          finalScore = (1 - opts.qualityWeight) * relevanceScore + opts.qualityWeight * normalizedQuality;
        }

        results.push({
          example,
          score: finalScore,
          matchedKeywords,
          qualityScore,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);

    // 应用多样性过滤
    this.diversityFilter.setOptions({ diversityThreshold: opts.diversityThreshold });
    const scoredExamples = results.map(r => ({ example: r.example, score: r.score }));
    const filteredExamples = this.diversityFilter.filter(scoredExamples, opts.maxResults);
    
    // 重新构建结果，保留 matchedKeywords
    const filteredIds = new Set(filteredExamples.map(e => e.example.id));
    const finalResults = results.filter(r => filteredIds.has(r.example.id));
    
    return finalResults.slice(0, opts.maxResults);
  }

  /**
   * 从 ExampleRegistry 获取案例
   */
  private getExamplesFromRegistry(category?: ExampleCategory): ExampleWithScore[] {
    const registry = ExampleRegistry.getInstance();
    if (category) {
      return registry.getByCategory(category);
    }
    return registry.getAll();
  }

  /**
   * 使用 ExampleRegistry 检索高质量案例
   * 结合相关度和质量评分进行排名
   */
  retrieveWithQuality(
    userInput: string,
    options?: Omit<RetrievalOptions, 'useRegistry'>
  ): RetrievalResult[] {
    return this.retrieve(userInput, { ...options, useRegistry: true });
  }

  addKeywordMapping(mapping: KeywordMapping): void {
    this.keywordMappings.push(mapping);
  }

  getKeywordMappings(): KeywordMapping[] {
    return [...this.keywordMappings];
  }

  /**
   * 重新加载关键词映射
   */
  reloadMappings(mappings: KeywordMapping[]): void {
    this.keywordMappings = [...mappings];
  }

  /**
   * 重置为默认关键词映射
   */
  resetToDefaultMappings(): void {
    this.keywordMappings = [...DEFAULT_KEYWORD_MAPPINGS];
  }


  private calculateScore(
    normalizedInput: string,
    example: ExampleMetadata | ExampleWithScore
  ): { score: number; matchedKeywords: string[] } {
    let score = 0;
    const matchedKeywords: string[] = [];

    const titleLower = example.title.toLowerCase();
    const descLower = example.description.toLowerCase();
    const tagsLower = example.tags.map(t => t.toLowerCase());

    if (titleLower.includes(normalizedInput) || normalizedInput.includes(titleLower)) {
      score += 0.4;
      matchedKeywords.push(example.title);
    }

    if (descLower.includes(normalizedInput)) {
      score += 0.2;
      matchedKeywords.push('description');
    }

    for (const tag of tagsLower) {
      if (normalizedInput.includes(tag) || tag.includes(normalizedInput)) {
        score += 0.15;
        matchedKeywords.push(tag);
      }
    }

    for (const mapping of this.keywordMappings) {
      const matchedMappingKeywords = mapping.keywords.filter(
        kw => normalizedInput.includes(kw.toLowerCase())
      );

      if (matchedMappingKeywords.length > 0) {
        if (mapping.tags) {
          const tagMatches = mapping.tags.filter(t => tagsLower.includes(t.toLowerCase()));
          if (tagMatches.length > 0) {
            score += 0.2 * mapping.boost;
            matchedKeywords.push(...matchedMappingKeywords);
          }
        }

        if (mapping.category && mapping.category === example.category) {
          score += 0.15 * mapping.boost;
          if (!matchedKeywords.some(k => matchedMappingKeywords.includes(k))) {
            matchedKeywords.push(...matchedMappingKeywords);
          }
        }
      }
    }

    const inputWords = this.tokenize(normalizedInput);
    const titleWords = this.tokenize(titleLower);
    const descWords = this.tokenize(descLower);

    for (const word of inputWords) {
      if (word.length < 2) continue;

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

    score = Math.min(1, score);

    return { score, matchedKeywords: [...new Set(matchedKeywords)] };
  }

  private tokenize(text: string): string[] {
    const englishWords = text.split(/[\s,.\-_]+/).filter(w => w.length > 0);

    const chinesePattern = /[\u4e00-\u9fa5]+/g;
    const chineseMatches = text.match(chinesePattern) || [];
    const chineseWords: string[] = [];

    for (const match of chineseMatches) {
      chineseWords.push(match);
      for (let i = 0; i < match.length - 1; i++) {
        chineseWords.push(match.slice(i, i + 2));
      }
    }

    return [...englishWords, ...chineseWords];
  }
}

/**
 * 创建案例检索器实例
 */
export function createExampleRetriever(library?: ExampleLibrary): ExampleRetriever {
  return new ExampleRetriever(library);
}

/**
 * 创建使用 ExampleRegistry 的检索器
 */
export function createRegistryRetriever(): ExampleRetriever {
  return new ExampleRetriever();
}
