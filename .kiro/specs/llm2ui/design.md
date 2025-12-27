# Design Document: llm2ui

## Overview

llm2ui 是一个基于 LLM 的声明式 UI 生成系统，采用类似 Google A2UI 的设计理念，让 AI 能够"说 UI 语言"。系统通过三栏布局提供完整的 UI 开发体验：聊天交互、代码编辑、实时预览。

核心设计原则：
1. **安全优先**：使用声明式 JSON 而非可执行代码
2. **LLM 友好**：扁平化组件结构，支持增量更新
3. **框架无关**：UI Schema 与具体实现解耦
4. **可扩展性**：开放的组件注册机制

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           llm2ui Application                             │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────┐  ┌───────────────────────┐  │
│  │              │  │    Code Editor       │  │                       │  │
│  │    Chat      │  │  ┌────────────────┐  │  │    Preview Panel      │  │
│  │  Interface   │  │  │  JSON Schema   │  │  │                       │  │
│  │              │  │  │    Editor      │  │  │  ┌─────────────────┐  │  │
│  │  ┌────────┐  │  │  └────────────────┘  │  │  │                 │  │  │
│  │  │Messages│  │  │  ┌────────────────┐  │  │  │   Rendered UI   │  │  │
│  │  │  List  │  │  │  │  Data Binding  │  │  │  │   (shadcn-ui)   │  │  │
│  │  └────────┘  │  │  │    Editor      │  │  │  │                 │  │  │
│  │  ┌────────┐  │  │  └────────────────┘  │  │  └─────────────────┘  │  │
│  │  │ Input  │  │  │                      │  │                       │  │
│  │  └────────┘  │  │                      │  │                       │  │
│  └──────────────┘  └──────────────────────┘  └───────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│                              Core Services                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ LLM Service │  │   Schema    │  │  Component  │  │    Renderer     │ │
│  │             │  │  Validator  │  │  Registry   │  │                 │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                              Data Layer                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   UI Schema     │  │  Data Context   │  │   Conversation Store    │  │
│  │     Store       │  │     Store       │  │                         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. UI Schema 核心结构

```typescript
// UI Schema 根结构
interface UISchema {
  version: string;           // Schema 版本号
  components: UIComponent[]; // 扁平化组件列表
  rootId: string;           // 根组件 ID
}

// 组件定义
interface UIComponent {
  id: string;               // 唯一标识符
  type: string;             // 组件类型 (button, card, input, etc.)
  props: Record<string, any>; // 组件属性
  children?: string[];      // 子组件 ID 列表
  events?: EventBinding[];  // 事件绑定
  style?: StyleProps;       // 样式属性
}

// 事件绑定
interface EventBinding {
  event: string;            // 事件名 (click, change, submit)
  action: string;           // 动作类型
  payload?: any;            // 动作参数
}

// 样式属性
interface StyleProps {
  className?: string;       // Tailwind CSS 类名
  style?: Record<string, string>; // 内联样式
}
```

### 2. 数据绑定表达式

```typescript
// 数据上下文
interface DataContext {
  [key: string]: any;       // 动态数据键值对
}

// 数据绑定表达式格式: {{path.to.value}}
// 示例:
// - {{user.name}} -> 访问 user.name
// - {{items[0].title}} -> 访问数组元素
// - {{imageUrl}} -> 访问顶层字段
```

### 3. 组件注册表接口

```typescript
interface ComponentDefinition {
  type: string;             // 组件类型标识
  displayName: string;      // 显示名称
  category: string;         // 分类 (layout, form, display, etc.)
  propsSchema: JSONSchema;  // Props 的 JSON Schema 定义
  defaultProps: Record<string, any>; // 默认属性值
  render: (props: any, children: ReactNode[]) => ReactNode; // 渲染函数
}

interface ComponentRegistry {
  register(definition: ComponentDefinition): void;
  get(type: string): ComponentDefinition | undefined;
  getAll(): ComponentDefinition[];
  getByCategory(category: string): ComponentDefinition[];
  has(type: string): boolean;
}
```

### 4. LLM 服务接口

```typescript
interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'local' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMService {
  configure(config: LLMConfig): void;
  sendMessage(messages: LLMMessage[]): AsyncIterable<string>;
  extractUISchema(response: string): UISchema | null;
}
```

### 5. Schema 验证器接口

```typescript
interface ValidationError {
  path: string;             // 错误位置路径
  message: string;          // 错误描述
  code: string;             // 错误代码
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface SchemaValidator {
  validateJSON(json: string): ValidationResult;
  validateUISchema(schema: UISchema): ValidationResult;
  validateComponent(component: UIComponent): ValidationResult;
}
```

### 6. 渲染器接口

```typescript
interface RenderContext {
  schema: UISchema;
  data: DataContext;
  registry: ComponentRegistry;
  onEvent?: (componentId: string, event: string, payload: any) => void;
}

interface Renderer {
  render(context: RenderContext): ReactNode;
  resolveBindings(value: any, data: DataContext): any;
}
```

## Data Models

### 1. 对话消息模型

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  uiSchema?: UISchema;      // AI 回复中提取的 UI Schema
  status: 'pending' | 'streaming' | 'complete' | 'error';
  error?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. 编辑器状态模型

```typescript
interface EditorState {
  jsonContent: string;      // JSON 编辑器内容
  dataContent: string;      // 数据绑定编辑器内容
  parsedSchema: UISchema | null;
  parsedData: DataContext | null;
  jsonErrors: ValidationError[];
  schemaErrors: ValidationError[];
  dataErrors: ValidationError[];
}
```

### 3. 布局状态模型

```typescript
interface LayoutState {
  chatWidth: number;        // 聊天栏宽度百分比
  editorWidth: number;      // 编辑器栏宽度百分比
  previewWidth: number;     // 预览栏宽度百分比
  chatCollapsed: boolean;
  editorCollapsed: boolean;
  previewCollapsed: boolean;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  theme: 'light' | 'dark';
}
```

### 4. 预置组件类型

```typescript
// shadcn-ui 风格基础组件
type BaseComponentType = 
  | 'container'    // 容器布局
  | 'card'         // 卡片
  | 'button'       // 按钮
  | 'input'        // 输入框
  | 'textarea'     // 多行文本
  | 'select'       // 下拉选择
  | 'checkbox'     // 复选框
  | 'radio'        // 单选框
  | 'switch'       // 开关
  | 'slider'       // 滑块
  | 'table'        // 表格
  | 'list'         // 列表
  | 'image'        // 图片
  | 'text'         // 文本
  | 'heading'      // 标题
  | 'badge'        // 徽章
  | 'avatar'       // 头像
  | 'alert'        // 提示
  | 'dialog'       // 对话框
  | 'tabs'         // 标签页
  | 'accordion'    // 手风琴
  | 'form'         // 表单
  | 'separator';   // 分隔线
```

