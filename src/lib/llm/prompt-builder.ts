/**
 * @file 提示词构建器
 * @description 使用 Builder 模式灵活组合提示词各部分
 * @module lib/llm/prompt-builder
 */

import { TokenCounter, tokenCounter } from './token-counter';
import { TemplateLoader, templateLoader } from './template-loader';
import type { TemplateVariables } from './template-loader';

/**
 * 提示词构建器选项
 */
export interface PromptBuilderOptions {
  /** 最大 Token 数限制 */
  maxTokens?: number;
  /** 语言 */
  language?: 'zh' | 'en';
  /** 模板变量 */
  variables?: TemplateVariables;
}

/**
 * 提示词构建结果
 */
export interface PromptBuildResult {
  /** 构建的提示词 */
  prompt: string;
  /** Token 数量 */
  tokenCount: number;
  /** 包含的部分 */
  sections: string[];
  /** 是否被裁剪 */
  trimmed: boolean;
  /** 裁剪的部分 */
  trimmedSections?: string[];
}

/**
 * 部分内容
 */
interface SectionContent {
  name: string;
  content: string;
  priority: number; // 数字越大越先被裁剪
}

/**
 * 默认裁剪优先级
 */
const DEFAULT_PRIORITIES: Record<string, number> = {
  'relevant-examples': 7,
  'negative-examples': 6,
  'positive-examples': 5,
  'component-docs': 4,
  'icon-guidelines': 3,
  'closing': 2,
  'system-intro': 1,
};

/**
 * 提示词构建器
 * 
 * 使用 Builder 模式灵活组合提示词各部分
 */
export class PromptBuilder {
  private sections: SectionContent[] = [];
  private options: PromptBuilderOptions;
  private loader: TemplateLoader;
  private counter: TokenCounter;

  constructor(options: PromptBuilderOptions = {}) {
    this.options = {
      language: options.language || 'zh',
      maxTokens: options.maxTokens,
      variables: options.variables || {},
    };
    this.loader = templateLoader;
    this.counter = tokenCounter;
  }

  /**
   * 添加系统介绍
   */
  withSystemIntro(): PromptBuilder {
    const template = this.loader.load('system-intro', this.options.language!);
    const content = this.loader.render(template.content, this.options.variables || {});
    this.sections.push({
      name: 'system-intro',
      content,
      priority: DEFAULT_PRIORITIES['system-intro'],
    });
    return this;
  }

  /**
   * 添加 Icon 指南
   */
  withIconGuidelines(): PromptBuilder {
    const template = this.loader.load('icon-guidelines', this.options.language!);
    const content = this.loader.render(template.content, this.options.variables || {});
    this.sections.push({
      name: 'icon-guidelines',
      content,
      priority: DEFAULT_PRIORITIES['icon-guidelines'],
    });
    return this;
  }

  /**
   * 添加组件文档
   */
  withComponentDocs(): PromptBuilder {
    const template = this.loader.load('component-docs', this.options.language!);
    const content = this.loader.render(template.content, this.options.variables || {});
    this.sections.push({
      name: 'component-docs',
      content,
      priority: DEFAULT_PRIORITIES['component-docs'],
    });
    return this;
  }

  /**
   * 添加正面示例
   */
  withExamples(additionalExamples: string = ''): PromptBuilder {
    const template = this.loader.load('positive-examples', this.options.language!);
    const variables = { ...this.options.variables, additionalExamples };
    const content = this.loader.render(template.content, variables);
    this.sections.push({
      name: 'positive-examples',
      content,
      priority: DEFAULT_PRIORITIES['positive-examples'],
    });
    return this;
  }

  /**
   * 添加负面示例
   */
  withNegativeExamples(): PromptBuilder {
    const template = this.loader.load('negative-examples', this.options.language!);
    const content = this.loader.render(template.content, this.options.variables || {});
    this.sections.push({
      name: 'negative-examples',
      content,
      priority: DEFAULT_PRIORITIES['negative-examples'],
    });
    return this;
  }

  /**
   * 添加相关案例
   */
  withRelevantExamples(examples: string): PromptBuilder {
    this.sections.push({
      name: 'relevant-examples',
      content: examples,
      priority: DEFAULT_PRIORITIES['relevant-examples'],
    });
    return this;
  }

  /**
   * 添加结尾
   */
  withClosing(userInput: string = ''): PromptBuilder {
    const template = this.loader.load('closing', this.options.language!);
    const variables = { ...this.options.variables, userInput };
    const content = this.loader.render(template.content, variables);
    this.sections.push({
      name: 'closing',
      content,
      priority: DEFAULT_PRIORITIES['closing'],
    });
    return this;
  }

  /**
   * 添加自定义部分
   */
  withCustomSection(name: string, content: string, priority: number = 5): PromptBuilder {
    this.sections.push({ name, content, priority });
    return this;
  }

  /**
   * 添加部分（别名方法，用于主题模板）
   * @param name 部分名称
   * @param content 部分内容
   * @param priority 优先级（可选）
   */
  addSection(name: string, content: string, priority?: number): PromptBuilder {
    const defaultPriority = DEFAULT_PRIORITIES[name] ?? 5;
    this.sections.push({
      name,
      content,
      priority: priority ?? defaultPriority,
    });
    return this;
  }

  /**
   * 构建提示词
   */
  build(): PromptBuildResult {
    const sectionNames = this.sections.map(s => s.name);
    let prompt = this.sections.map(s => s.content).join('\n\n');
    let tokenCount = this.counter.countTokens(prompt);
    let trimmed = false;
    const trimmedSections: string[] = [];

    // 如果超过 maxTokens，按优先级裁剪
    if (this.options.maxTokens && tokenCount > this.options.maxTokens) {
      const result = this.trimToFit(this.options.maxTokens);
      prompt = result.prompt;
      tokenCount = result.tokenCount;
      trimmed = result.trimmedSections.length > 0;
      trimmedSections.push(...result.trimmedSections);
    }

    return {
      prompt,
      tokenCount,
      sections: sectionNames.filter(s => !trimmedSections.includes(s)),
      trimmed,
      trimmedSections: trimmed ? trimmedSections : undefined,
    };
  }

  /**
   * 裁剪内容以适应 Token 限制
   */
  private trimToFit(maxTokens: number): { prompt: string; tokenCount: number; trimmedSections: string[] } {
    // 按优先级排序（优先级高的先裁剪）
    const sortedSections = [...this.sections].sort((a, b) => b.priority - a.priority);
    const trimmedSections: string[] = [];
    let remainingSections = [...this.sections];

    // 逐个移除高优先级部分直到满足限制
    for (const section of sortedSections) {
      const prompt = remainingSections.map(s => s.content).join('\n\n');
      const tokenCount = this.counter.countTokens(prompt);

      if (tokenCount <= maxTokens) {
        return {
          prompt,
          tokenCount,
          trimmedSections,
        };
      }

      // 移除当前部分
      remainingSections = remainingSections.filter(s => s.name !== section.name);
      trimmedSections.push(section.name);
    }

    // 所有部分都被移除
    return {
      prompt: '',
      tokenCount: 0,
      trimmedSections,
    };
  }

  /**
   * 重置构建器
   */
  reset(): PromptBuilder {
    this.sections = [];
    return this;
  }

  /**
   * 获取当前 Token 数
   */
  getCurrentTokenCount(): number {
    const prompt = this.sections.map(s => s.content).join('\n\n');
    return this.counter.countTokens(prompt);
  }

  /**
   * 获取当前部分列表
   */
  getCurrentSections(): string[] {
    return this.sections.map(s => s.name);
  }
}

/**
 * 创建提示词构建器的工厂函数
 */
export function createPromptBuilder(options?: PromptBuilderOptions): PromptBuilder {
  return new PromptBuilder(options);
}
