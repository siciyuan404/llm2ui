# Design Document: LLM Chat Integration

## Overview

本设计文档描述 LLM 对话集成功能的技术架构和实现方案。该功能使用户能够通过自然语言与多种 LLM 提供商对话，生成 UI Schema，并在对话界面中直接渲染预览。

核心设计原则：
1. **多提供商支持**：统一的 LLM 服务接口，支持 OpenAI、Anthropic、iFlow 等多种提供商
2. **实时渲染**：对话中的 UI Schema 直接渲染为可交互组件
3. **无缝同步**：生成的 Schema 自动同步到编辑器和预览面板
4. **配置灵活**：可视化设置界面，支持快速切换模型

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LLM Chat Integration                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Chat Interface Layer                            │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │    │
│  │  │ ModelSwitcher│  │ MessageList  │  │    ChatRenderer            │ │    │
│  │  │  (Dropdown)  │  │              │  │  ┌──────────────────────┐  │ │    │
│  │  └──────────────┘  │  ┌────────┐  │  │  │  Rendered UI Card    │  │ │    │
│  │                    │  │UserMsg │  │  │  │  ┌────────────────┐  │  │ │    │
│  │  ┌──────────────┐  │  └────────┘  │  │  │  │ Live Preview   │  │  │ │    │
│  │  │SettingsBtn   │  │  ┌────────┐  │  │  │  └────────────────┘  │  │ │    │
│  │  │  (Modal)     │  │  │ AIMsg  │──┼──┼──│  [Fullscreen][Copy]  │  │ │    │
│  │  └──────────────┘  │  └────────┘  │  │  │  [Apply to Editor]   │  │ │    │
│  │                    └──────────────┘  │  └──────────────────────┘  │ │    │
│  │                                      └────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      LLM Service Layer                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │ LLMConfig    │  │ LLMService   │  │ ProviderAdapters         │   │    │
│  │  │ Manager      │  │              │  │  ┌─────────┐ ┌─────────┐ │   │    │
│  │  │              │  │ sendMessage()│  │  │ OpenAI  │ │Anthropic│ │   │    │
│  │  │ save/load    │  │ stream()     │  │  └─────────┘ └─────────┘ │   │    │
│  │  │ validate     │  │              │  │  ┌─────────┐ ┌─────────┐ │   │    │
│  │  │ testConn     │  │              │  │  │ iFlow   │ │ Custom  │ │   │    │
│  │  └──────────────┘  └──────────────┘  │  └─────────┘ └─────────┘ │   │    │
│  │                                      └──────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Schema Processing Layer                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │ JSONExtractor│  │ SchemaValidator│ │ SchemaSync               │   │    │
│  │  │              │  │              │  │                          │   │    │
│  │  │ extractJSON()│  │ validate()   │  │ syncToEditor()           │   │    │
│  │  │ parseBlocks()│  │ checkStruct()│  │ syncToDataBinding()      │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. LLM 配置接口

```typescript
/**
 * 支持的 LLM 提供商类型
 */
type LLMProviderType = 'openai' | 'anthropic' | 'iflow' | 'custom';

/**
 * LLM 配置接口
 */
interface LLMConfig {
  /** 提供商类型 */
  provider: LLMProviderType;
  /** 显示名称（用于 UI 显示） */
  displayName: string;
  /** API 密钥 */
  apiKey: string;
  /** API 端点 URL */
  endpoint: string;
  /** 模型名称 */
  model: string;
  /** 温度参数 (0-1) */
  temperature: number;
  /** 最大 token 数 */
  maxTokens: number;
  /** 系统提示词 */
  systemPrompt?: string;
  /** 请求超时时间（毫秒） */
  timeout: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
}

/**
 * 预定义的提供商配置
 */
interface ProviderPreset {
  provider: LLMProviderType;
  displayName: string;
  endpoint: string;
  defaultModel: string;
  availableModels: string[];
  description: string;
}
```

### 2. LLM 服务接口

```typescript
/**
 * 聊天消息
 */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * 流式响应块
 */
interface StreamChunk {
  content: string;
  done: boolean;
  error?: string;
}

/**
 * LLM 服务接口
 */
interface ILLMService {
  /** 发送消息并获取流式响应 */
  sendMessage(
    messages: ChatMessage[],
    config: LLMConfig
  ): AsyncGenerator<StreamChunk>;
  
  /** 测试连接 */
  testConnection(config: LLMConfig): Promise<{ success: boolean; error?: string }>;
  
  /** 验证配置 */
  validateConfig(config: LLMConfig): { valid: boolean; errors: string[] };
}
```

### 3. 配置管理接口

```typescript
/**
 * 配置存储键
 */
const LLM_CONFIG_STORAGE_KEY = 'llm2ui_llm_config';
const LLM_CONFIGS_LIST_KEY = 'llm2ui_llm_configs_list';

/**
 * 配置管理器接口
 */
interface ILLMConfigManager {
  /** 获取当前配置 */
  getCurrentConfig(): LLMConfig | null;
  
  /** 设置当前配置 */
  setCurrentConfig(config: LLMConfig): void;
  
  /** 获取所有保存的配置 */
  getSavedConfigs(): LLMConfig[];
  
  /** 保存配置 */
  saveConfig(config: LLMConfig): void;
  
  /** 删除配置 */
  deleteConfig(configId: string): void;
  
  /** 从本地存储加载 */
  loadFromStorage(): void;
  
  /** 保存到本地存储 */
  saveToStorage(): void;
  
  /** 获取提供商预设 */
  getProviderPresets(): ProviderPreset[];
}
```

### 4. Schema 同步接口

```typescript
/**
 * Schema 同步事件
 */
interface SchemaSyncEvent {
  type: 'schema_updated' | 'data_updated' | 'sync_error';
  schema?: UISchema;
  data?: DataContext;
  error?: string;
}

/**
 * Schema 同步器接口
 */
interface ISchemaSyncer {
  /** 同步 Schema 到 JSON 编辑器 */
  syncToJsonEditor(schema: UISchema): void;
  
  /** 同步数据绑定字段到 Data Binding 编辑器 */
  syncToDataBindingEditor(schema: UISchema): void;
  
  /** 从 LLM 响应提取并同步 Schema */
  extractAndSync(response: string): UISchema | null;
  
  /** 订阅同步事件 */
  onSync(callback: (event: SchemaSyncEvent) => void): () => void;
}
```

### 5. 对话渲染器接口

```typescript
/**
 * 渲染的 UI 卡片属性
 */
interface RenderedUICardProps {
  /** UI Schema */
  schema: UISchema;
  /** 数据上下文 */
  data?: DataContext;
  /** 全屏预览回调 */
  onFullscreen?: () => void;
  /** 复制 JSON 回调 */
  onCopyJson?: () => void;
  /** 应用到编辑器回调 */
  onApplyToEditor?: () => void;
  /** 事件处理回调 */
  onEvent?: (componentId: string, event: string, payload: any) => void;
}

/**
 * 消息气泡扩展属性
 */
interface EnhancedMessageBubbleProps {
  message: ConversationMessage;
  /** 是否渲染 UI Schema */
  renderSchema?: boolean;
  /** Schema 同步器 */
  schemaSyncer?: ISchemaSyncer;
}
```

### 6. 设置界面组件接口

```typescript
/**
 * LLM 设置对话框属性
 */
interface LLMSettingsDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 当前配置 */
  currentConfig?: LLMConfig;
  /** 保存配置回调 */
  onSave: (config: LLMConfig) => void;
  /** 测试连接回调 */
  onTestConnection?: (config: LLMConfig) => Promise<{ success: boolean; error?: string }>;
}

/**
 * 模型切换器属性
 */
interface ModelSwitcherProps {
  /** 当前配置 */
  currentConfig?: LLMConfig;
  /** 可用配置列表 */
  availableConfigs: LLMConfig[];
  /** 切换配置回调 */
  onConfigChange: (config: LLMConfig) => void;
  /** 打开设置回调 */
  onOpenSettings?: () => void;
}
```

## Data Models

### 1. 提供商预设数据

```typescript
/**
 * 预定义的 LLM 提供商配置
 */
const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    provider: 'openai',
    displayName: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4',
    availableModels: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    description: 'OpenAI GPT 系列模型',
  },
  {
    provider: 'anthropic',
    displayName: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-opus-20240229',
    availableModels: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
    description: 'Anthropic Claude 系列模型',
  },
  {
    provider: 'iflow',
    displayName: 'iFlow 心流',
    endpoint: 'https://apis.iflow.cn/v1/chat/completions',
    defaultModel: 'tstars2.0',
    availableModels: ['tstars2.0'],
    description: '心流开放平台，兼容 OpenAI API 格式',
  },
  {
    provider: 'custom',
    displayName: '自定义',
    endpoint: '',
    defaultModel: '',
    availableModels: [],
    description: '自定义 OpenAI 兼容端点',
  },
];
```

### 2. 默认系统提示词

```typescript
/**
 * 默认系统提示词，指导 LLM 生成 UI Schema
 */
const DEFAULT_SYSTEM_PROMPT = `你是一个 UI 生成助手，专门帮助用户通过自然语言描述生成用户界面。

当用户描述他们想要的 UI 时，你需要生成符合以下格式的 JSON Schema：

\`\`\`json
{
  "version": "1.0",
  "root": {
    "id": "root",
    "type": "container",
    "props": {},
    "children": [...]
  }
}
\`\`\`

可用的组件类型：
- container: 容器布局
- card: 卡片
- button: 按钮
- input: 输入框
- text: 文本
- heading: 标题
- image: 图片
- list: 列表
- table: 表格
- form: 表单
- select: 下拉选择
- checkbox: 复选框
- switch: 开关
- badge: 徽章
- alert: 提示
- separator: 分隔线

每个组件都有以下基本属性：
- id: 唯一标识符
- type: 组件类型
- props: 组件属性
- children: 子组件数组（可选）
- style: 样式属性（可选）

请始终将 UI Schema 放在 \`\`\`json 代码块中。`;
```

### 3. 对话消息扩展模型

```typescript
/**
 * 扩展的对话消息，包含渲染信息
 */
interface EnhancedConversationMessage extends ConversationMessage {
  /** 提取的 UI Schema */
  extractedSchema?: UISchema;
  /** Schema 是否已应用到编辑器 */
  schemaApplied?: boolean;
  /** 渲染错误 */
  renderError?: string;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 配置验证正确性

*For any* LLM 配置对象，验证函数应正确识别有效和无效的配置，并为无效配置返回具体的错误信息。

- 有效配置：包含必填字段（provider、apiKey、model、endpoint）且参数在有效范围内
- 无效配置：缺少必填字段或参数超出范围（如 temperature < 0 或 > 1）

**Validates: Requirements 1.7, 1.10**

### Property 2: 配置持久化往返一致性

*For any* 有效的 LLM 配置，保存到本地存储后再加载，应产生等价的配置对象。

**Validates: Requirements 1.9**

### Property 3: 提供商默认配置完整性

*For any* 预定义的 LLM 提供商，获取默认配置应返回包含所有必填字段的有效配置对象。

**Validates: Requirements 1.3, 2.6**

### Property 4: 请求格式适配正确性

*For any* LLM 提供商和消息列表，构建的请求体应符合该提供商的 API 格式规范，请求头应包含正确的认证信息。

**Validates: Requirements 2.5**

### Property 5: JSON 代码块提取完整性

*For any* 包含 JSON 代码块的文本，提取函数应找到所有 ```json ... ``` 和 ``` ... ``` 格式的代码块。

**Validates: Requirements 5.1, 5.2, 5.5**

### Property 6: UI Schema 验证正确性

*For any* JSON 对象，验证函数应正确识别其是否符合 UI Schema 结构，并为无效 Schema 返回具体的验证错误。

**Validates: Requirements 5.3, 5.4**

### Property 7: UI Schema 序列化往返一致性

*For any* 有效的 UI Schema，序列化为 JSON 字符串后再解析，应产生等价的 Schema 对象。

**Validates: Requirements 5.6**

### Property 8: Schema 同步完整性

*For any* 有效的 UI Schema，同步操作应将 Schema 内容更新到 JSON 编辑器，并提取所有数据绑定字段到 Data Binding 编辑器。

**Validates: Requirements 4.1, 4.2**

### Property 9: 数据绑定字段保留

*For any* Schema 同步操作，用户在 Data Binding 编辑器中的自定义数据值应被保留。

**Validates: Requirements 4.7**

### Property 10: 系统提示词注入

*For any* 发送到 LLM 的消息，如果配置了系统提示词，则消息列表的第一条应为系统角色的提示词消息。

**Validates: Requirements 6.3**

### Property 11: Schema 渲染正确性

*For any* 包含有效 UI Schema 的 AI 回复，对话渲染器应成功渲染 UI 组件；对于无效 Schema，应显示错误信息和原始 JSON。

**Validates: Requirements 7.1, 7.8**

## Error Handling

### 1. 配置错误处理

```typescript
/**
 * 配置验证错误类型
 */
interface ConfigValidationError {
  field: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_RANGE' | 'INVALID_FORMAT';
}

/**
 * 配置验证结果
 */
interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigValidationError[];
}
```

错误处理策略：
- 缺少必填字段：显示"[字段名] 是必填项"
- 参数超出范围：显示"[字段名] 必须在 [范围] 之间"
- 格式错误：显示"[字段名] 格式不正确"

### 2. 网络错误处理

```typescript
/**
 * LLM 请求错误类型
 */
type LLMErrorType = 
  | 'NETWORK_ERROR'      // 网络连接失败
  | 'AUTH_ERROR'         // 认证失败（API 密钥无效）
  | 'RATE_LIMIT'         // 请求频率限制
  | 'TIMEOUT'            // 请求超时
  | 'SERVER_ERROR'       // 服务器错误
  | 'INVALID_RESPONSE';  // 响应格式错误

/**
 * LLM 请求错误
 */
interface LLMRequestError {
  type: LLMErrorType;
  message: string;
  statusCode?: number;
  retryable: boolean;
}
```

错误处理策略：
- 网络错误：显示"网络连接失败，请检查网络设置"，提供重试按钮
- 认证错误：显示"API 密钥无效，请检查设置"，提供打开设置按钮
- 频率限制：显示"请求过于频繁，请稍后重试"，自动延迟重试
- 超时：显示"请求超时，请重试"，提供重试按钮
- 服务器错误：显示"服务器错误，请稍后重试"

### 3. Schema 解析错误处理

```typescript
/**
 * Schema 解析错误
 */
interface SchemaParseError {
  type: 'JSON_SYNTAX' | 'SCHEMA_INVALID' | 'MISSING_FIELD';
  message: string;
  position?: { line: number; column: number };
}
```

错误处理策略：
- JSON 语法错误：在编辑器中标记错误位置，显示具体错误信息
- Schema 结构无效：显示缺少的必填字段或无效的组件类型
- 渲染失败：显示原始 JSON 代码和错误信息

## Testing Strategy

### 单元测试

使用 Vitest 进行单元测试，覆盖以下模块：

1. **配置管理模块**
   - 配置验证函数
   - 配置序列化/反序列化
   - 本地存储操作

2. **LLM 服务模块**
   - 请求体构建（各提供商格式）
   - 请求头构建
   - SSE 响应解析

3. **Schema 处理模块**
   - JSON 代码块提取
   - UI Schema 验证
   - 数据绑定字段提取

### 属性测试

使用 fast-check 进行属性测试，每个测试至少运行 100 次迭代：

1. **Property 1**: 配置验证正确性
   - 生成随机配置对象，验证有效/无效判断正确性

2. **Property 2**: 配置持久化往返一致性
   - 生成随机有效配置，验证保存后加载等价

3. **Property 5**: JSON 代码块提取完整性
   - 生成包含随机 JSON 块的文本，验证提取完整性

4. **Property 6**: UI Schema 验证正确性
   - 生成随机 JSON 对象，验证 Schema 验证正确性

5. **Property 7**: UI Schema 序列化往返一致性
   - 生成随机有效 Schema，验证序列化往返一致性

### 测试标注格式

每个属性测试必须包含以下注释：

```typescript
/**
 * Feature: llm-chat-integration, Property 1: 配置验证正确性
 * Validates: Requirements 1.7, 1.10
 */
```
