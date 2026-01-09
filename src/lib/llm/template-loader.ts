/**
 * @file 模板加载器
 * @description 从文件系统加载模板文件，支持占位符替换
 * @module lib/llm/template-loader
 */

/**
 * 模板变量映射
 */
export interface TemplateVariables {
  [key: string]: string | number | boolean;
}

/**
 * 加载的模板信息
 */
export interface LoadedTemplate {
  /** 模板内容 */
  content: string;
  /** 模板路径 */
  path: string;
  /** 文件修改时间 (模拟) */
  mtime: number;
}

/**
 * 模板加载器接口
 */
export interface ITemplateLoader {
  load(name: string, language: 'zh' | 'en'): LoadedTemplate;
  render(template: string, variables: TemplateVariables): string;
  exists(name: string, language: 'zh' | 'en'): boolean;
}

/**
 * 默认模板内容 (当文件不存在时使用)
 */
const DEFAULT_TEMPLATES: Record<string, Record<'zh' | 'en', string>> = {
  'system-intro': {
    zh: '# UI 生成系统\n\n你是一个专业的 UI 生成助手。',
    en: '# UI Generation System\n\nYou are a professional UI generation assistant.',
  },
  'icon-guidelines': {
    zh: '# Icon 使用规范\n\n请使用 Icon 组件而非 Emoji。',
    en: '# Icon Guidelines\n\nUse Icon component instead of Emoji.',
  },
  'component-docs': {
    zh: '# 组件文档\n\n可用组件: Box, Card, Button, Input, Text, Icon',
    en: '# Component Docs\n\nAvailable components: Box, Card, Button, Input, Text, Icon',
  },
  'positive-examples': {
    zh: '# 正面示例\n\n{{additionalExamples}}',
    en: '# Positive Examples\n\n{{additionalExamples}}',
  },
  'negative-examples': {
    zh: '# 负面示例\n\n请避免使用 Emoji 作为图标。',
    en: '# Negative Examples\n\nAvoid using Emoji as icons.',
  },
  'closing': {
    zh: '# 输出要求\n\n用户请求: {{userInput}}',
    en: '# Output Requirements\n\nUser request: {{userInput}}',
  },
};

/**
 * 内置模板内容 (从模板文件加载)
 */
const BUILTIN_TEMPLATES: Record<string, Record<'zh' | 'en', string>> = {
  'system-intro': {
    zh: `# UI 生成系统

你是一个专业的 UI 生成助手，能够根据用户的自然语言描述生成高质量的 UI Schema。

## 你的能力

- 理解用户的 UI 需求描述
- 生成符合规范的 UI Schema JSON
- 使用正确的组件类型和属性
- 遵循设计系统规范

## 输出格式

请始终以有效的 JSON 格式输出 UI Schema，包含以下结构：

\`\`\`json
{
  "version": "1.0",
  "root": {
    "id": "unique-id",
    "type": "ComponentType",
    "props": {},
    "children": []
  }
}
\`\`\``,
    en: `# UI Generation System

You are a professional UI generation assistant capable of generating high-quality UI Schema based on natural language descriptions.

## Your Capabilities

- Understand user's UI requirements
- Generate compliant UI Schema JSON
- Use correct component types and properties
- Follow design system specifications

## Output Format

Always output UI Schema in valid JSON format with the following structure:

\`\`\`json
{
  "version": "1.0",
  "root": {
    "id": "unique-id",
    "type": "ComponentType",
    "props": {},
    "children": []
  }
}
\`\`\``,
  },
  'icon-guidelines': {
    zh: `# Icon 使用规范

## 🚫 禁止使用 Emoji 作为图标

**绝对不要**在 UI Schema 中使用 emoji（如 🔍、🏠、📦）作为图标。

## ✅ 必须使用 Icon 组件

所有图标**必须**使用 Icon 组件：

\`\`\`json
{ "type": "Icon", "props": { "name": "search", "size": 16 } }
\`\`\`

## 常用图标名称

| 分类 | 图标名称 |
|------|----------|
| 通用 | \`home\`, \`settings\`, \`search\`, \`user\`, \`menu\`, \`check\`, \`x\`, \`plus\`, \`minus\` |
| 箭头 | \`arrow-up\`, \`arrow-down\`, \`arrow-left\`, \`arrow-right\`, \`chevron-up\`, \`chevron-down\` |
| 文件 | \`file\`, \`file-text\`, \`folder\`, \`folder-open\`, \`download\`, \`upload\`, \`trash\` |`,
    en: `# Icon Usage Guidelines

## 🚫 Never Use Emoji as Icons

**Never** use emoji (like 🔍, 🏠, 📦) as icons in UI Schema.

## ✅ Always Use Icon Component

All icons **must** use the Icon component:

\`\`\`json
{ "type": "Icon", "props": { "name": "search", "size": 16 } }
\`\`\`

## Common Icon Names

| Category | Icon Names |
|----------|------------|
| General | \`home\`, \`settings\`, \`search\`, \`user\`, \`menu\`, \`check\`, \`x\`, \`plus\`, \`minus\` |
| Arrows | \`arrow-up\`, \`arrow-down\`, \`arrow-left\`, \`arrow-right\`, \`chevron-up\`, \`chevron-down\` |
| Files | \`file\`, \`file-text\`, \`folder\`, \`folder-open\`, \`download\`, \`upload\`, \`trash\` |`,
  },
  'component-docs': {
    zh: `# 可用组件文档

## 布局组件

### Box
通用容器组件，用于布局和样式控制。

### Card
卡片容器，带有边框和阴影。

## 表单组件

### Input
文本输入框。

### Button
按钮组件。

### Select
下拉选择框。

## 展示组件

### Text
文本显示组件。

### Icon
图标组件。

### Badge
徽章组件。`,
    en: `# Available Components Documentation

## Layout Components

### Box
Generic container component for layout and styling.

### Card
Card container with border and shadow.

## Form Components

### Input
Text input field.

### Button
Button component.

### Select
Dropdown select component.

## Display Components

### Text
Text display component.

### Icon
Icon component.

### Badge
Badge component.`,
  },
  'positive-examples': {
    zh: `# 正面示例

以下是高质量 UI Schema 的示例，请参考这些模式：

{{additionalExamples}}`,
    en: `# Positive Examples

Here are high-quality UI Schema examples to follow:

{{additionalExamples}}`,
  },
  'negative-examples': {
    zh: `# 负面示例 - 请避免这些错误

## ❌ 错误 1: 使用 Emoji 作为图标

## ❌ 错误 2: 缺少必要的 id 字段

## ❌ 错误 3: 使用不存在的组件类型

## ❌ 错误 4: 缺少 version 字段`,
    en: `# Negative Examples - Avoid These Mistakes

## ❌ Mistake 1: Using Emoji as Icons

## ❌ Mistake 2: Missing Required id Field

## ❌ Mistake 3: Using Non-existent Component Types

## ❌ Mistake 4: Missing version Field`,
  },
  'closing': {
    zh: `# 输出要求

## 请确保你的输出：

1. **格式正确**: 输出有效的 JSON
2. **结构完整**: 包含 \`version\` 和 \`root\` 字段
3. **ID 唯一**: 每个组件都有唯一的 \`id\`
4. **类型正确**: 只使用文档中列出的组件类型
5. **图标规范**: 使用 Icon 组件而非 Emoji

## 用户请求

{{userInput}}`,
    en: `# Output Requirements

## Please ensure your output:

1. **Valid Format**: Output valid JSON
2. **Complete Structure**: Include \`version\` and \`root\` fields
3. **Unique IDs**: Each component has a unique \`id\`
4. **Correct Types**: Only use component types listed in documentation
5. **Icon Compliance**: Use Icon component instead of Emoji

## User Request

{{userInput}}`,
  },
};

/**
 * 模板加载器
 * 
 * 负责从内置模板加载内容，支持占位符替换
 */
export class TemplateLoader implements ITemplateLoader {
  /** 模板缓存 */
  private cache: Map<string, LoadedTemplate> = new Map();

  /**
   * 生成缓存键
   */
  private getCacheKey(name: string, language: 'zh' | 'en'): string {
    return `${language}/${name}`;
  }

  /**
   * 加载模板
   * @param name 模板名称（不含扩展名）
   * @param language 语言 'zh' | 'en'
   */
  load(name: string, language: 'zh' | 'en'): LoadedTemplate {
    const cacheKey = this.getCacheKey(name, language);
    
    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 从内置模板加载
    const content = this.getBuiltinTemplate(name, language);
    const template: LoadedTemplate = {
      content,
      path: `templates/${language}/${name}.md`,
      mtime: Date.now(),
    };

    // 缓存结果
    this.cache.set(cacheKey, template);
    return template;
  }

  /**
   * 获取内置模板内容
   */
  private getBuiltinTemplate(name: string, language: 'zh' | 'en'): string {
    const templates = BUILTIN_TEMPLATES[name];
    if (templates && templates[language]) {
      return templates[language];
    }

    // 回退到默认模板
    const defaults = DEFAULT_TEMPLATES[name];
    if (defaults && defaults[language]) {
      console.warn(`Template "${name}" not found, using default content`);
      return defaults[language];
    }

    // 最终回退
    console.warn(`Template "${name}" not found for language "${language}"`);
    return `# ${name}\n\nTemplate content not available.`;
  }

  /**
   * 渲染模板，替换占位符
   * 占位符格式: {{variableName}}
   */
  render(template: string, variables: TemplateVariables): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in variables) {
        return String(variables[key]);
      }
      // 保留未匹配的占位符
      return match;
    });
  }

  /**
   * 提取模板中的占位符
   */
  extractPlaceholders(template: string): string[] {
    const matches = template.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.slice(2, -2)))];
  }

  /**
   * 检查模板是否存在
   */
  exists(name: string, language: 'zh' | 'en'): boolean {
    return name in BUILTIN_TEMPLATES || name in DEFAULT_TEMPLATES;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取所有可用模板名称
   */
  getAvailableTemplates(): string[] {
    return Object.keys(BUILTIN_TEMPLATES);
  }
}

// 默认导出单例实例
export const templateLoader = new TemplateLoader();
