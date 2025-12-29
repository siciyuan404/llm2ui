/**
 * Prompt Generator Module
 * 
 * 提示词生成器，从 Component_Catalog 动态生成系统提示词，
 * 替代硬编码的 DEFAULT_SYSTEM_PROMPT。
 * 支持案例驱动生成，根据用户输入智能检索和注入相关案例。
 * 
 * @module prompt-generator
 * @see Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 * @see Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 (案例驱动生成)
 */

import type { ComponentCatalog, ComponentMetadata } from './component-catalog';
import type { PropSchema } from './component-registry';
import { defaultCatalog } from './component-catalog';
import type { RetrievalOptions } from './example-retriever';
import { ExampleRetriever } from './example-retriever';
import { ExampleInjector } from './example-injector';
import { ExampleLibrary } from './example-library';

/**
 * 提示词生成选项
 */
export interface PromptGeneratorOptions {
  /** 使用的组件目录 */
  catalog?: ComponentCatalog;
  /** 是否包含示例 */
  includeExamples?: boolean;
  /** 是否包含负面示例 */
  includeNegativeExamples?: boolean;
  /** 输出语言 */
  language?: 'zh' | 'en';
  /** 是否包含相关案例，默认 true */
  includeRelevantExamples?: boolean;
  /** 用户输入，用于检索相关案例 */
  userInput?: string;
  /** 案例检索选项 */
  retrievalOptions?: RetrievalOptions;
}


/**
 * 类别名称映射（中文）
 */
const CATEGORY_NAMES_ZH: Record<string, string> = {
  'layout': '布局组件',
  'input': '表单组件',
  'display': '展示组件',
  'feedback': '反馈组件',
  'navigation': '导航组件',
  'uncategorized': '其他组件',
};

/**
 * 类别名称映射（英文）
 */
const CATEGORY_NAMES_EN: Record<string, string> = {
  'layout': 'Layout Components',
  'input': 'Form Components',
  'display': 'Display Components',
  'feedback': 'Feedback Components',
  'navigation': 'Navigation Components',
  'uncategorized': 'Other Components',
};

/**
 * 格式化属性类型为可读字符串
 * @param schema - 属性 Schema
 * @returns 格式化的类型字符串
 */
function formatPropType(schema: PropSchema): string {
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum.map(v => `"${v}"`).join(' | ');
  }
  return schema.type;
}

/**
 * 格式化单个属性的文档
 * @param name - 属性名称
 * @param schema - 属性 Schema
 * @returns 格式化的属性文档字符串
 */
function formatPropDoc(name: string, schema: PropSchema): string {
  const parts: string[] = [];
  parts.push(name);
  
  if (schema.required) {
    parts.push('(必填)');
  }
  
  parts.push(`: ${formatPropType(schema)}`);
  
  if (schema.description) {
    parts.push(` - ${schema.description}`);
  }
  
  if (schema.default !== undefined) {
    parts.push(` (默认: ${JSON.stringify(schema.default)})`);
  }
  
  return parts.join('');
}

/**
 * 生成单个组件的文档
 * @param metadata - 组件元数据
 * @returns 组件文档字符串
 */
function formatComponentDoc(metadata: ComponentMetadata): string {
  const lines: string[] = [];
  
  // 组件名称和描述
  lines.push(`- **${metadata.name}**: ${metadata.description || '无描述'}`);
  
  // 属性列表
  const propsSchema = metadata.propsSchema;
  if (propsSchema && Object.keys(propsSchema).length > 0) {
    const propDocs = Object.entries(propsSchema)
      .map(([name, schema]) => formatPropDoc(name, schema))
      .join(', ');
    lines.push(`  - props: { ${propDocs} }`);
  }
  
  return lines.join('\n');
}

/**
 * 生成组件文档部分
 * 按类别分组生成组件文档
 * 
 * @param catalog - 组件目录
 * @param language - 输出语言
 * @returns 组件文档字符串
 * 
 * @see Requirements 3.1, 3.3
 */
export function generateComponentDocs(
  catalog: ComponentCatalog = defaultCatalog,
  language: 'zh' | 'en' = 'zh'
): string {
  const categoryNames = language === 'zh' ? CATEGORY_NAMES_ZH : CATEGORY_NAMES_EN;
  const byCategory = catalog.getByCategory();
  const lines: string[] = [];
  
  // 按类别顺序输出
  const categoryOrder = ['layout', 'input', 'display', 'feedback', 'navigation', 'uncategorized'];
  
  for (const category of categoryOrder) {
    const components = byCategory[category];
    if (!components || components.length === 0) continue;
    
    const categoryName = categoryNames[category] || category;
    lines.push(`### ${categoryName}`);
    
    for (const component of components) {
      lines.push(formatComponentDoc(component));
    }
    
    lines.push(''); // 空行分隔
  }
  
  // 处理未在预定义顺序中的类别
  for (const [category, components] of Object.entries(byCategory)) {
    if (categoryOrder.includes(category)) continue;
    if (!components || components.length === 0) continue;
    
    const categoryName = categoryNames[category] || category;
    lines.push(`### ${categoryName}`);
    
    for (const component of components) {
      lines.push(formatComponentDoc(component));
    }
    
    lines.push('');
  }
  
  return lines.join('\n').trim();
}


/**
 * 正面示例 - 展示正确的 UISchema 格式
 */
const POSITIVE_EXAMPLE_ZH = `## 完整示例

\`\`\`json
{
  "version": "1.0",
  "root": {
    "id": "login-form",
    "type": "Card",
    "props": {
      "title": "用户登录",
      "description": "请输入您的账号信息"
    },
    "children": [
      {
        "id": "username-input",
        "type": "Input",
        "props": {
          "label": "用户名",
          "placeholder": "请输入用户名"
        }
      },
      {
        "id": "password-input",
        "type": "Input",
        "props": {
          "label": "密码",
          "placeholder": "请输入密码",
          "type": "password"
        }
      },
      {
        "id": "submit-btn",
        "type": "Button",
        "props": {
          "label": "登录",
          "variant": "default"
        }
      }
    ]
  }
}
\`\`\``;

const POSITIVE_EXAMPLE_EN = `## Complete Example

\`\`\`json
{
  "version": "1.0",
  "root": {
    "id": "login-form",
    "type": "Card",
    "props": {
      "title": "User Login",
      "description": "Please enter your credentials"
    },
    "children": [
      {
        "id": "username-input",
        "type": "Input",
        "props": {
          "label": "Username",
          "placeholder": "Enter username"
        }
      },
      {
        "id": "password-input",
        "type": "Input",
        "props": {
          "label": "Password",
          "placeholder": "Enter password",
          "type": "password"
        }
      },
      {
        "id": "submit-btn",
        "type": "Button",
        "props": {
          "label": "Login",
          "variant": "default"
        }
      }
    ]
  }
}
\`\`\``;

/**
 * 负面示例 - 展示常见错误
 */
const NEGATIVE_EXAMPLES_ZH = `## 常见错误示例（请避免）

### ❌ 错误 1: 使用未知的组件类型
\`\`\`json
{
  "id": "my-btn",
  "type": "btn",  // 错误！应该使用 "Button"
  "props": { "label": "点击" }
}
\`\`\`

### ❌ 错误 2: 缺少必填属性
\`\`\`json
{
  "id": "my-button",
  "type": "Button",
  "props": {}  // 错误！Button 需要 label 属性
}
\`\`\`

### ❌ 错误 3: 使用无效的枚举值
\`\`\`json
{
  "id": "my-button",
  "type": "Button",
  "props": {
    "label": "点击",
    "variant": "primary"  // 错误！应该使用 "default" | "secondary" | "outline" | "ghost" | "destructive"
  }
}
\`\`\`

### ❌ 错误 4: 缺少 version 字段
\`\`\`json
{
  "root": {  // 错误！缺少 "version": "1.0"
    "id": "root",
    "type": "Container"
  }
}
\`\`\``;

const NEGATIVE_EXAMPLES_EN = `## Common Mistakes (Avoid These)

### ❌ Error 1: Using unknown component type
\`\`\`json
{
  "id": "my-btn",
  "type": "btn",  // Wrong! Should use "Button"
  "props": { "label": "Click" }
}
\`\`\`

### ❌ Error 2: Missing required property
\`\`\`json
{
  "id": "my-button",
  "type": "Button",
  "props": {}  // Wrong! Button requires label property
}
\`\`\`

### ❌ Error 3: Using invalid enum value
\`\`\`json
{
  "id": "my-button",
  "type": "Button",
  "props": {
    "label": "Click",
    "variant": "primary"  // Wrong! Should use "default" | "secondary" | "outline" | "ghost" | "destructive"
  }
}
\`\`\`

### ❌ Error 4: Missing version field
\`\`\`json
{
  "root": {  // Wrong! Missing "version": "1.0"
    "id": "root",
    "type": "Container"
  }
}
\`\`\``;

/**
 * 生成正面示例
 * 展示正确的 UISchema 格式
 * 
 * @param language - 输出语言
 * @returns 正面示例字符串
 * 
 * @see Requirements 3.4
 */
export function generatePositiveExamples(language: 'zh' | 'en' = 'zh'): string {
  return language === 'zh' ? POSITIVE_EXAMPLE_ZH : POSITIVE_EXAMPLE_EN;
}

/**
 * 生成负面示例
 * 展示常见错误（未知组件类型、缺少必填属性、无效枚举值）
 * 
 * @param language - 输出语言
 * @returns 负面示例字符串
 * 
 * @see Requirements 3.5
 */
export function generateNegativeExamples(language: 'zh' | 'en' = 'zh'): string {
  return language === 'zh' ? NEGATIVE_EXAMPLES_ZH : NEGATIVE_EXAMPLES_EN;
}


/**
 * 生成有效类型列表约束
 * @param catalog - 组件目录
 * @param language - 输出语言
 * @returns 类型约束字符串
 */
function generateTypeConstraints(
  catalog: ComponentCatalog,
  language: 'zh' | 'en'
): string {
  const validTypes = catalog.getValidTypes();
  const typeList = validTypes.map(t => `"${t}"`).join(', ');
  
  if (language === 'zh') {
    return `## 有效组件类型

**重要**: 只能使用以下组件类型，使用其他类型将导致验证失败：

${typeList}`;
  } else {
    return `## Valid Component Types

**Important**: Only the following component types are allowed. Using other types will cause validation failure:

${typeList}`;
  }
}

/**
 * 生成通用属性说明
 * @param language - 输出语言
 * @returns 通用属性说明字符串
 */
function generateCommonPropsDoc(language: 'zh' | 'en'): string {
  if (language === 'zh') {
    return `## 组件通用属性

每个组件都有以下基本属性：
- **id**: 唯一标识符（必填）
- **type**: 组件类型（必填）
- **props**: 组件属性对象
- **children**: 子组件数组（可选，仅容器类组件支持）
- **style**: 自定义样式对象（可选）
- **data**: 数据绑定配置（可选）`;
  } else {
    return `## Common Component Properties

Every component has the following basic properties:
- **id**: Unique identifier (required)
- **type**: Component type (required)
- **props**: Component properties object
- **children**: Child components array (optional, only for container components)
- **style**: Custom style object (optional)
- **data**: Data binding configuration (optional)`;
  }
}

/**
 * 生成数据绑定示例
 * @param language - 输出语言
 * @returns 数据绑定示例字符串
 */
function generateDataBindingDoc(language: 'zh' | 'en'): string {
  if (language === 'zh') {
    return `## 数据绑定示例

\`\`\`json
{
  "id": "greeting",
  "type": "Text",
  "props": {
    "content": "Hello, {{user.name}}!"
  },
  "data": {
    "user": {
      "name": "string"
    }
  }
}
\`\`\``;
  } else {
    return `## Data Binding Example

\`\`\`json
{
  "id": "greeting",
  "type": "Text",
  "props": {
    "content": "Hello, {{user.name}}!"
  },
  "data": {
    "user": {
      "name": "string"
    }
  }
}
\`\`\``;
  }
}

/**
 * 生成系统提示词
 * 整合组件文档、类型列表、示例，生成完整的系统提示词
 * 
 * 生成的提示词结构：
 * 1. 系统介绍
 * 2. 有效类型约束
 * 3. 组件文档
 * 4. 通用属性说明
 * 5. 数据绑定示例
 * 6. 参考案例（当 includeRelevantExamples 为 true 时）
 * 7. 正面示例
 * 8. 负面示例
 * 9. 结尾提示
 * 
 * @param options - 生成选项
 * @returns 完整的系统提示词
 * 
 * @see Requirements 3.2, 3.6, 3.7
 * @see Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 (案例驱动生成)
 */
export function generateSystemPrompt(options: PromptGeneratorOptions = {}): string {
  const {
    catalog = defaultCatalog,
    includeExamples = true,
    includeNegativeExamples = true,
    language = 'zh',
    includeRelevantExamples = true,
    userInput,
    retrievalOptions,
  } = options;
  
  const sections: string[] = [];
  
  // 开头介绍
  if (language === 'zh') {
    sections.push(`你是一个 UI 生成助手，专门帮助用户通过自然语言描述生成用户界面。

当用户描述他们想要的 UI 时，你需要生成符合以下格式的 JSON Schema：

\`\`\`json
{
  "version": "1.0",
  "root": {
    "id": "root",
    "type": "Container",
    "props": {
      "direction": "column",
      "gap": "md"
    },
    "children": [...]
  }
}
\`\`\``);
  } else {
    sections.push(`You are a UI generation assistant that helps users create user interfaces through natural language descriptions.

When users describe the UI they want, you need to generate JSON Schema in the following format:

\`\`\`json
{
  "version": "1.0",
  "root": {
    "id": "root",
    "type": "Container",
    "props": {
      "direction": "column",
      "gap": "md"
    },
    "children": [...]
  }
}
\`\`\``);
  }
  
  // 有效类型约束
  sections.push(generateTypeConstraints(catalog, language));
  
  // 组件文档
  if (language === 'zh') {
    sections.push('## 可用的组件类型及其属性\n');
  } else {
    sections.push('## Available Component Types and Properties\n');
  }
  sections.push(generateComponentDocs(catalog, language));
  
  // 通用属性
  sections.push(generateCommonPropsDoc(language));
  
  // 数据绑定
  sections.push(generateDataBindingDoc(language));
  
  // 参考案例（新增：案例驱动生成）
  if (includeRelevantExamples) {
    const relevantExamplesSection = generateRelevantExamplesSection(userInput, language, retrievalOptions);
    if (relevantExamplesSection) {
      sections.push(relevantExamplesSection);
    }
  }
  
  // 正面示例
  if (includeExamples) {
    sections.push(generatePositiveExamples(language));
  }
  
  // 负面示例
  if (includeNegativeExamples) {
    sections.push(generateNegativeExamples(language));
  }
  
  // 结尾提示
  if (language === 'zh') {
    sections.push('请始终将 UI Schema 放在 ```json 代码块中。根据用户的描述生成合适的 UI 组件组合。');
  } else {
    sections.push('Always place the UI Schema in a ```json code block. Generate appropriate UI component combinations based on user descriptions.');
  }
  
  return sections.join('\n\n');
}


/**
 * 生成相关案例部分
 * 根据用户输入检索相关案例并格式化为提示词
 * 
 * @param userInput - 用户输入文本
 * @param language - 输出语言
 * @param retrievalOptions - 检索选项
 * @returns 格式化的案例部分，如果没有相关案例则返回空字符串
 * 
 * @see Requirements 5.2, 5.3, 5.4
 */
export function generateRelevantExamplesSection(
  userInput: string | undefined,
  language: 'zh' | 'en',
  retrievalOptions?: RetrievalOptions
): string {
  // 创建案例库和检索器
  const library = new ExampleLibrary();
  const retriever = new ExampleRetriever(library);
  const injector = new ExampleInjector();
  
  // 如果有用户输入，检索相关案例
  let examples;
  if (userInput && userInput.trim()) {
    const results = retriever.retrieve(userInput, retrievalOptions);
    examples = results.map(r => r.example);
  } else {
    // 没有用户输入时使用默认案例
    examples = injector.getDefaultExamples();
  }
  
  // 格式化案例
  return injector.format(examples, {
    enabled: true,
    language,
    includeSchema: true,
  });
}
