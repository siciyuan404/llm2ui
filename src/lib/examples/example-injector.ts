/**
 * @file example-injector.ts
 * @description 案例注入器模块，将检索到的案例格式化并注入到 LLM 提示词中
 * @module lib/examples/example-injector
 * @requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

// ExampleMetadata 和 PRESET_EXAMPLES 从 shadcn 主题目录导入
import type { ExampleMetadata } from '../themes/builtin/shadcn/examples/presets';
import { PRESET_EXAMPLES } from '../themes/builtin/shadcn/examples/presets';

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

const DEFAULT_OPTIONS: Required<InjectionOptions> = {
  enabled: true,
  language: 'zh',
  includeSchema: true,
};

const GUIDANCE_ZH = `以下是一些参考案例，展示了如何构建常见的 UI 组件和布局。
请参考这些案例的结构和组件使用方式，但根据用户的具体需求进行调整。
不要直接复制案例，而是理解其设计模式并灵活应用。

**重要规范**：
- 禁止使用 emoji 作为图标，必须使用 Icon 组件
- Icon 组件格式：{ "type": "Icon", "props": { "name": "图标名", "size": 16 } }
- 常用图标：home, search, settings, user, menu, plus, edit, copy, trash, download, upload, refresh, message-circle, folder, file, check, x`;

const GUIDANCE_EN = `Below are some reference examples showing how to build common UI components and layouts.
Please refer to the structure and component usage in these examples, but adjust according to the user's specific needs.
Do not copy the examples directly, but understand the design patterns and apply them flexibly.

**Important Guidelines**:
- Do NOT use emoji as icons, use the Icon component instead
- Icon component format: { "type": "Icon", "props": { "name": "icon-name", "size": 16 } }
- Common icons: home, search, settings, user, menu, plus, edit, copy, trash, download, upload, refresh, message-circle, folder, file, check, x`;

/**
 * 案例注入器类
 */
export class ExampleInjector {
  /**
   * 格式化案例为 LLM 可理解的文本
   */
  format(examples: ExampleMetadata[], options?: InjectionOptions): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    if (!opts.enabled) {
      return '';
    }
    
    const effectiveExamples = examples.length > 0 ? examples : this.getDefaultExamples();
    
    if (effectiveExamples.length === 0) {
      return '';
    }
    
    const parts: string[] = [];
    
    const title = opts.language === 'zh' ? '## 参考案例' : '## Reference Examples';
    parts.push(title);
    parts.push('');
    
    parts.push(this.generateGuidance(opts.language));
    parts.push('');
    
    for (let i = 0; i < effectiveExamples.length; i++) {
      const example = effectiveExamples[i];
      parts.push(this.formatSingleExample(example, i + 1, opts));
      parts.push('');
    }
    
    return parts.join('\n');
  }
  
  private formatSingleExample(
    example: ExampleMetadata,
    index: number,
    options: Required<InjectionOptions>
  ): string {
    const parts: string[] = [];
    
    const exampleLabel = options.language === 'zh' ? '案例' : 'Example';
    parts.push(`### ${exampleLabel} ${index}: ${example.title}`);
    parts.push('');
    
    parts.push(example.description);
    parts.push('');
    
    if (options.includeSchema) {
      parts.push('```json');
      parts.push(JSON.stringify(example.schema, null, 2));
      parts.push('```');
    }
    
    return parts.join('\n');
  }
  
  /**
   * 获取默认案例
   */
  getDefaultExamples(): ExampleMetadata[] {
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
   */
  generateGuidance(language: 'zh' | 'en'): string {
    return language === 'zh' ? GUIDANCE_ZH : GUIDANCE_EN;
  }
}

/**
 * 创建案例注入器实例
 */
export function createExampleInjector(): ExampleInjector {
  return new ExampleInjector();
}
