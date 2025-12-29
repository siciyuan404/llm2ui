/**
 * @file example-injector.ts
 * @description 案例注入器模块，将检索到的案例格式化并注入到 LLM 提示词中
 * @module lib/example-injector
 * @requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import type { ExampleMetadata } from './preset-examples';
import { PRESET_EXAMPLES } from './preset-examples';

/**
 * 注入选项接口
 */
export interface InjectionOptions {
  /** 是否启用案例注入，默认 true */
  enabled?: boolean;
  /** 输出语言，默认 'zh' */
  language?: 'zh' | 'en';
  /** 是否包含 schema JSON，默认 true */
  includeSchema?: boolean;
}

/**
 * 默认注入选项
 */
const DEFAULT_OPTIONS: Required<InjectionOptions> = {
  enabled: true,
  language: 'zh',
  includeSchema: true,
};

/**
 * 中文引导说明
 */
const GUIDANCE_ZH = `以下是一些参考案例，展示了如何构建常见的 UI 组件和布局。
请参考这些案例的结构和组件使用方式，但根据用户的具体需求进行调整。
不要直接复制案例，而是理解其设计模式并灵活应用。`;

/**
 * 英文引导说明
 */
const GUIDANCE_EN = `Below are some reference examples showing how to build common UI components and layouts.
Please refer to the structure and component usage in these examples, but adjust according to the user's specific needs.
Do not copy the examples directly, but understand the design patterns and apply them flexibly.`;

/**
 * 案例注入器类
 * 
 * 将检索到的案例格式化为 LLM 可理解的文本，并注入到提示词中
 */
export class ExampleInjector {
  /**
   * 格式化案例为 LLM 可理解的文本
   * 
   * @param examples - 案例列表
   * @param options - 注入选项
   * @returns 格式化的文本，如果 enabled 为 false 则返回空字符串
   */
  format(examples: ExampleMetadata[], options?: InjectionOptions): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // 如果禁用注入，返回空字符串
    if (!opts.enabled) {
      return '';
    }
    
    // 如果没有案例，使用默认案例
    const effectiveExamples = examples.length > 0 ? examples : this.getDefaultExamples();
    
    // 如果仍然没有案例，返回空字符串
    if (effectiveExamples.length === 0) {
      return '';
    }
    
    const parts: string[] = [];
    
    // 添加标题
    const title = opts.language === 'zh' ? '## 参考案例' : '## Reference Examples';
    parts.push(title);
    parts.push('');
    
    // 添加引导说明
    parts.push(this.generateGuidance(opts.language));
    parts.push('');
    
    // 格式化每个案例
    for (let i = 0; i < effectiveExamples.length; i++) {
      const example = effectiveExamples[i];
      parts.push(this.formatSingleExample(example, i + 1, opts));
      parts.push('');
    }
    
    return parts.join('\n');
  }
  
  /**
   * 格式化单个案例
   * 
   * @param example - 案例元数据
   * @param index - 案例序号
   * @param options - 注入选项
   * @returns 格式化的案例文本
   */
  private formatSingleExample(
    example: ExampleMetadata,
    index: number,
    options: Required<InjectionOptions>
  ): string {
    const parts: string[] = [];
    
    // 案例标题
    const exampleLabel = options.language === 'zh' ? '案例' : 'Example';
    parts.push(`### ${exampleLabel} ${index}: ${example.title}`);
    parts.push('');
    
    // 案例描述
    parts.push(example.description);
    parts.push('');
    
    // 案例 Schema（如果启用）
    if (options.includeSchema) {
      parts.push('```json');
      parts.push(JSON.stringify(example.schema, null, 2));
      parts.push('```');
    }
    
    return parts.join('\n');
  }
  
  /**
   * 获取默认案例
   * 
   * 当没有检索到相关案例时使用的通用案例
   * 返回一个布局案例和一个表单案例作为默认参考
   * 
   * @returns 默认案例数组
   */
  getDefaultExamples(): ExampleMetadata[] {
    // 选择一个布局案例和一个表单案例作为默认
    const layoutExample = PRESET_EXAMPLES.find(e => e.category === 'layout');
    const formExample = PRESET_EXAMPLES.find(e => e.category === 'form');
    
    const defaults: ExampleMetadata[] = [];
    
    if (layoutExample) {
      defaults.push(layoutExample);
    }
    
    if (formExample) {
      defaults.push(formExample);
    }
    
    return defaults;
  }
  
  /**
   * 生成案例引导说明
   * 
   * @param language - 输出语言
   * @returns 引导说明文本
   */
  generateGuidance(language: 'zh' | 'en'): string {
    return language === 'zh' ? GUIDANCE_ZH : GUIDANCE_EN;
  }
}

/**
 * 创建案例注入器实例
 * 
 * @returns 案例注入器实例
 */
export function createExampleInjector(): ExampleInjector {
  return new ExampleInjector();
}
