# Requirements Document

## Introduction

本功能为 LLM2UI 系统添加完整的 LLM 对话集成能力，使用户能够通过自然语言与 AI 对话来生成 UI。系统将支持多种 LLM 提供商（包括 OpenAI、Anthropic、iFlow 心流平台等），提供可视化的 LLM 设置界面，并将生成的 UI Schema 自动同步到 JSON 编辑器和数据绑定编辑器。

核心设计参考 Google A2UI 协议，采用声明式 JSON 格式而非可执行代码，确保安全性和跨平台兼容性。

## Glossary

- **LLM_Engine**: 大语言模型引擎，负责与 LLM API 通信并处理响应
- **LLM_Provider**: LLM 提供商，提供大语言模型 API 服务的平台（如 OpenAI、Anthropic、iFlow 等）
- **LLM_Settings**: LLM 设置界面，用户配置 LLM 提供商、API 密钥、模型参数等的可视化界面
- **iFlow_Platform**: 心流开放平台，提供兼容 OpenAI API 格式的国产 LLM 服务（https://apis.iflow.cn）
- **Schema_Sync**: Schema 同步机制，将 LLM 生成的 UI Schema 自动同步到编辑器
- **Chat_Interface**: 聊天界面，用户与 LLM 进行对话的 UI 组件
- **Streaming_Response**: 流式响应，LLM 逐步返回生成内容的机制
- **API_Endpoint**: API 端点，LLM 服务的 HTTP 接口地址
- **System_Prompt**: 系统提示词，指导 LLM 生成符合 A2UI 规范输出的预设指令

## Requirements

### Requirement 1: LLM 设置界面

**User Story:** 作为用户，我希望通过设置界面配置 LLM 提供商和参数，以便使用不同的 AI 服务生成 UI。

#### Acceptance Criteria

1. THE LLM_Settings SHALL 提供可视化设置界面，允许用户配置 LLM 参数
2. THE LLM_Settings SHALL 支持选择预定义的 LLM 提供商（OpenAI、Anthropic、iFlow、自定义）
3. WHEN 用户选择 LLM 提供商时，THE System SHALL 自动填充该提供商的默认配置（API 端点、默认模型等）
4. THE LLM_Settings SHALL 允许用户输入 API 密钥，并安全存储到本地存储
5. THE LLM_Settings SHALL 支持配置模型名称、温度（temperature）、最大 token 数等参数
6. THE LLM_Settings SHALL 支持配置自定义 API 端点，以便接入私有部署的 LLM 服务
7. WHEN 用户保存设置时，THE System SHALL 验证配置的有效性（必填字段、参数范围等）
8. THE LLM_Settings SHALL 支持测试连接功能，验证 API 密钥和端点是否可用
9. THE LLM_Settings SHALL 将配置持久化到本地存储，下次打开时自动加载
10. IF 配置验证失败，THEN THE System SHALL 显示具体的错误信息和修复建议

### Requirement 2: 多 LLM 提供商支持

**User Story:** 作为开发者，我希望系统支持多种 LLM 提供商，以便根据需求选择最合适的 AI 服务。

#### Acceptance Criteria

1. THE LLM_Engine SHALL 支持 OpenAI API 格式（GPT-4、GPT-3.5 等模型）
2. THE LLM_Engine SHALL 支持 Anthropic API 格式（Claude 系列模型）
3. THE LLM_Engine SHALL 支持 iFlow 心流平台 API（端点：https://apis.iflow.cn/v1/chat/completions）
4. THE LLM_Engine SHALL 支持任何兼容 OpenAI API 格式的自定义端点
5. WHEN 切换 LLM 提供商时，THE System SHALL 自动适配不同的请求格式和认证方式
6. THE LLM_Engine SHALL 为每个提供商提供合理的默认配置
7. THE LLM_Engine SHALL 支持流式响应（streaming）以提供实时反馈
8. IF LLM 请求失败，THEN THE System SHALL 提供详细的错误信息和重试选项

### Requirement 3: 聊天对话功能

**User Story:** 作为用户，我希望通过自然语言与 AI 对话来描述我想要的 UI，系统能够理解并生成相应的界面。

#### Acceptance Criteria

1. THE Chat_Interface SHALL 提供消息输入框和发送按钮
2. THE Chat_Interface SHALL 显示用户消息和 AI 回复的对话历史
3. WHEN 用户发送消息时，THE System SHALL 将消息发送到配置的 LLM 提供商
4. THE Chat_Interface SHALL 支持流式显示 AI 回复，提供实时反馈
5. THE Chat_Interface SHALL 支持上下文对话，允许用户迭代修改已生成的 UI
6. WHEN AI 回复包含 JSON 代码块时，THE System SHALL 自动识别并高亮显示
7. IF LLM 请求失败，THEN THE Chat_Interface SHALL 显示错误信息和重试按钮
8. THE Chat_Interface SHALL 支持清空对话历史功能
9. THE Chat_Interface SHALL 提供 LLM 模型快速切换下拉菜单
10. WHEN 用户在对话界面切换 LLM 模型时，THE System SHALL 立即使用新模型处理后续消息
11. THE Chat_Interface SHALL 显示当前使用的 LLM 提供商和模型名称

### Requirement 7: 对话内容渲染器

**User Story:** 作为用户，我希望 AI 生成的 UI Schema 能够直接在对话界面中渲染显示，而不仅仅是 JSON 代码，这样我可以直接看到生成的 UI 效果。

#### Acceptance Criteria

1. WHEN AI 回复包含有效的 UI Schema 时，THE Chat_Interface SHALL 在对话中直接渲染该 UI 组件
2. THE Chat_Renderer SHALL 使用与预览面板相同的组件注册表渲染 UI
3. THE Chat_Renderer SHALL 在渲染的 UI 上方显示"AI 生成的 UI"标签
4. THE Chat_Renderer SHALL 提供"全屏预览"按钮，点击后在模态框中全屏显示渲染的 UI
5. THE Chat_Renderer SHALL 提供"复制 JSON"按钮，允许用户复制原始 UI Schema
6. THE Chat_Renderer SHALL 提供"应用到编辑器"按钮，将 Schema 同步到 JSON 编辑器
7. WHEN 渲染的 UI 包含交互组件时，THE Chat_Renderer SHALL 支持用户交互（点击按钮、输入文本等）
8. IF UI Schema 渲染失败，THEN THE Chat_Renderer SHALL 显示错误信息和原始 JSON 代码
9. THE Chat_Renderer SHALL 支持响应式布局，在对话气泡中合理显示 UI
10. THE Chat_Renderer SHALL 为渲染的 UI 提供边框和背景，与普通文本消息区分

### Requirement 4: Schema 同步到编辑器

**User Story:** 作为用户，我希望 LLM 生成的 UI Schema 能自动同步到 JSON 编辑器和数据绑定编辑器，以便查看和修改。

#### Acceptance Criteria

1. WHEN LLM 生成 UI Schema 时，THE System SHALL 自动将 Schema 同步到 JSON Schema 编辑器
2. WHEN LLM 生成 UI Schema 时，THE System SHALL 自动提取数据绑定字段并同步到 Data Binding 编辑器
3. THE Schema_Sync SHALL 保持编辑器内容与最新生成的 Schema 一致
4. WHEN 用户在编辑器中修改 Schema 时，THE System SHALL 实时更新预览面板
5. THE Schema_Sync SHALL 支持增量更新，避免不必要的全量刷新
6. IF Schema 解析失败，THEN THE System SHALL 在编辑器中显示错误标记和提示
7. THE Schema_Sync SHALL 在同步时保留用户在 Data Binding 编辑器中的自定义数据值

### Requirement 5: UI Schema 提取与验证

**User Story:** 作为系统，我需要从 LLM 响应中提取 UI Schema 并验证其有效性。

#### Acceptance Criteria

1. THE System SHALL 从 LLM 响应文本中提取 JSON 代码块
2. THE System SHALL 支持提取 ```json ... ``` 和 ``` ... ``` 格式的代码块
3. WHEN 提取到 JSON 时，THE System SHALL 验证其是否符合 UI Schema 结构
4. IF JSON 不符合 UI Schema 结构，THEN THE System SHALL 返回详细的验证错误
5. THE System SHALL 支持从响应中提取多个 JSON 块，并选择有效的 UI Schema
6. FOR ALL 有效的 UI Schema，序列化后再解析 SHALL 产生等价的结构（往返一致性）

### Requirement 6: 系统提示词管理

**User Story:** 作为开发者，我希望能够配置系统提示词，指导 LLM 生成符合规范的 UI Schema。

#### Acceptance Criteria

1. THE System SHALL 提供默认的系统提示词，指导 LLM 生成 A2UI 格式的 UI Schema
2. THE LLM_Settings SHALL 允许用户自定义系统提示词
3. WHEN 发送消息到 LLM 时，THE System SHALL 自动在对话开头添加系统提示词
4. THE System_Prompt SHALL 包含可用组件类型和属性的说明
5. THE System_Prompt SHALL 包含 UI Schema 格式的示例
