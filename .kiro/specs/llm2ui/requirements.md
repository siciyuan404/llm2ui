# Requirements Document

## Introduction

本项目是一个基于 LLM 的 UI 生成系统，采用 Google A2UI 协议的核心原理，使 AI Agent 能够通过声明式 JSON 格式生成丰富的交互式用户界面。系统将支持多种前端框架（React、Vue3、HTML+CSS、Flutter、Tauri），并采用 shadcn/ui 的设计风格——简洁、美观、可定制的组件设计。

系统提供完整的 LLM 对话功能，支持多种 LLM 提供商（包括 OpenAI、Anthropic、iFlow 心流平台等），并通过设置界面让用户灵活配置 LLM 参数。生成的 UI Schema 将自动同步到 JSON 编辑器和数据绑定编辑器。

## Glossary

- **A2UI_Protocol**: Agent-to-UI 协议，一种声明式 UI 协议，允许 AI Agent 生成可在多平台原生渲染的 UI 描述
- **Component_Schema**: 组件模式定义，描述 UI 组件的结构、属性和行为的 JSON Schema
- **LLM_Engine**: 大语言模型引擎，负责理解用户需求并生成 A2UI 格式的 UI 描述
- **LLM_Provider**: LLM 提供商，提供大语言模型 API 服务的平台（如 OpenAI、Anthropic、iFlow 等）
- **LLM_Settings**: LLM 设置，用户配置 LLM 提供商、API 密钥、模型参数等的界面和数据
- **iFlow_Platform**: 心流开放平台，提供兼容 OpenAI API 格式的国产 LLM 服务
- **Renderer**: 渲染器，将 A2UI JSON 描述转换为特定框架原生组件的模块
- **Component_Registry**: 组件注册表，管理可用组件类型及其映射关系的系统
- **Surface**: 渲染表面，A2UI 中用于组织和更新 UI 组件的容器概念
- **Data_Binding**: 数据绑定，将 UI 组件与应用状态连接的机制
- **Action_Handler**: 动作处理器，处理用户交互事件并将其传回 Agent 的模块
- **Theme_System**: 主题系统，管理 shadcn/ui 风格的设计令牌和样式变量
- **Code_Generator**: 代码生成器，将 A2UI 描述转换为目标框架源代码的模块
- **Schema_Sync**: Schema 同步，将 LLM 生成的 UI Schema 自动同步到编辑器的机制

## Requirements

### Requirement 1: A2UI 协议核心实现

**User Story:** 作为开发者，我希望系统实现 A2UI 协议的核心规范，以便 LLM 能够生成标准化的 UI 描述。

#### Acceptance Criteria

1. THE Component_Schema SHALL 定义所有基础 UI 组件类型（Text、Button、Input、Card、Layout 等）
2. WHEN LLM_Engine 生成 UI 描述时，THE System SHALL 输出符合 A2UI 规范的 JSON 格式
3. THE Component_Schema SHALL 支持组件 ID 引用机制，允许组件之间建立父子关系
4. WHEN 组件包含数据绑定路径时，THE System SHALL 正确解析 path 表达式并关联到应用状态
5. THE A2UI_Protocol SHALL 支持增量更新，允许 Agent 仅发送变更的组件而非完整 UI

### Requirement 2: LLM 提示工程与生成

**User Story:** 作为用户，我希望通过自然语言描述我想要的 UI，系统能够理解并生成相应的界面。

#### Acceptance Criteria

1. WHEN 用户输入自然语言 UI 需求时，THE LLM_Engine SHALL 解析需求并生成对应的 A2UI JSON
2. THE LLM_Engine SHALL 支持上下文对话，允许用户迭代修改已生成的 UI
3. WHEN 用户请求修改现有 UI 时，THE LLM_Engine SHALL 生成增量更新而非完整重建
4. THE System SHALL 提供预定义的组件提示模板，帮助 LLM 生成符合规范的输出
5. IF LLM 生成的 JSON 不符合 A2UI 规范，THEN THE System SHALL 进行自动修正或提示用户

### Requirement 3: React 渲染器

**User Story:** 作为 React 开发者，我希望能够将 A2UI 描述渲染为 React 组件。

#### Acceptance Criteria

1. THE React_Renderer SHALL 将 A2UI JSON 转换为 React 组件树
2. WHEN A2UI 描述包含事件处理时，THE React_Renderer SHALL 正确绑定 React 事件处理函数
3. THE React_Renderer SHALL 支持 shadcn/ui 风格的组件样式
4. WHEN 组件状态变化时，THE React_Renderer SHALL 触发 React 的响应式更新
5. THE React_Renderer SHALL 支持 TypeScript 类型定义

### Requirement 4: Vue3 渲染器

**User Story:** 作为 Vue3 开发者，我希望能够将 A2UI 描述渲染为 Vue3 组件。

#### Acceptance Criteria

1. THE Vue3_Renderer SHALL 将 A2UI JSON 转换为 Vue3 组件树
2. WHEN A2UI 描述包含数据绑定时，THE Vue3_Renderer SHALL 使用 Vue3 响应式系统（ref/reactive）
3. THE Vue3_Renderer SHALL 支持 shadcn/ui 风格的组件样式
4. WHEN 用户触发动作时，THE Vue3_Renderer SHALL 通过 emit 机制传递事件
5. THE Vue3_Renderer SHALL 支持 Composition API 和 TypeScript

### Requirement 5: HTML+CSS 渲染器

**User Story:** 作为前端开发者，我希望能够将 A2UI 描述渲染为纯 HTML+CSS 代码。

#### Acceptance Criteria

1. THE HTML_Renderer SHALL 将 A2UI JSON 转换为语义化 HTML 结构
2. THE HTML_Renderer SHALL 生成符合 shadcn/ui 设计风格的 CSS 样式
3. WHEN A2UI 描述包含交互组件时，THE HTML_Renderer SHALL 生成对应的 JavaScript 事件处理代码
4. THE HTML_Renderer SHALL 支持 CSS 变量以实现主题定制
5. THE HTML_Renderer SHALL 生成无障碍访问（a11y）兼容的 HTML 属性

### Requirement 6: Flutter 渲染器

**User Story:** 作为 Flutter 开发者，我希望能够将 A2UI 描述渲染为 Flutter Widget。

#### Acceptance Criteria

1. THE Flutter_Renderer SHALL 将 A2UI JSON 转换为 Flutter Widget 树
2. WHEN A2UI 描述包含布局组件时，THE Flutter_Renderer SHALL 映射到对应的 Flutter 布局 Widget
3. THE Flutter_Renderer SHALL 支持 shadcn/ui 风格的 Material/Cupertino 主题适配
4. WHEN 用户触发动作时，THE Flutter_Renderer SHALL 通过回调函数传递事件
5. THE Flutter_Renderer SHALL 生成符合 Dart 规范的代码

### Requirement 7: Tauri 渲染器

**User Story:** 作为桌面应用开发者，我希望能够将 A2UI 描述渲染为 Tauri 应用界面。

#### Acceptance Criteria

1. THE Tauri_Renderer SHALL 将 A2UI JSON 转换为 Tauri 前端组件（基于 Web 技术）
2. WHEN A2UI 描述包含系统级操作时，THE Tauri_Renderer SHALL 生成对应的 Tauri 命令调用
3. THE Tauri_Renderer SHALL 支持 shadcn/ui 风格的桌面应用样式
4. WHEN 需要与 Rust 后端通信时，THE Tauri_Renderer SHALL 生成正确的 invoke 调用代码
5. THE Tauri_Renderer SHALL 支持跨平台（Windows、macOS、Linux）的样式适配

### Requirement 8: shadcn/ui 风格主题系统

**User Story:** 作为设计师，我希望生成的 UI 具有 shadcn/ui 的设计风格，并支持主题定制。

#### Acceptance Criteria

1. THE Theme_System SHALL 定义 shadcn/ui 风格的设计令牌（颜色、间距、圆角、阴影等）
2. THE Theme_System SHALL 支持亮色和暗色主题切换
3. WHEN 渲染组件时，THE Renderer SHALL 应用 Theme_System 定义的样式变量
4. THE Theme_System SHALL 支持自定义主题配置
5. THE Theme_System SHALL 为每个目标框架生成对应格式的主题文件（CSS 变量、Tailwind 配置、Flutter ThemeData 等）

### Requirement 9: 组件注册与扩展

**User Story:** 作为开发者，我希望能够注册自定义组件，扩展系统的 UI 能力。

#### Acceptance Criteria

1. THE Component_Registry SHALL 提供组件注册 API，允许添加自定义组件类型
2. WHEN 注册自定义组件时，THE System SHALL 验证组件 Schema 的完整性
3. THE Component_Registry SHALL 支持为不同渲染器注册不同的组件实现
4. WHEN LLM 生成包含自定义组件的 UI 时，THE System SHALL 正确识别并渲染
5. THE Component_Registry SHALL 提供组件文档生成功能

### Requirement 10: 代码导出与预览

**User Story:** 作为开发者，我希望能够预览生成的 UI 并导出为可用的源代码。

#### Acceptance Criteria

1. THE System SHALL 提供实时预览功能，显示 A2UI 描述的渲染结果
2. WHEN 用户选择导出时，THE Code_Generator SHALL 生成目标框架的完整源代码文件
3. THE Code_Generator SHALL 生成包含依赖声明的项目配置文件（package.json、pubspec.yaml 等）
4. WHEN 导出 React/Vue3 代码时，THE Code_Generator SHALL 生成可直接运行的组件文件
5. THE System SHALL 支持批量导出多个框架的代码

### Requirement 11: A2UI JSON 解析与验证

**User Story:** 作为系统，我需要能够解析和验证 A2UI JSON 格式，确保数据完整性。

#### Acceptance Criteria

1. THE Parser SHALL 解析符合 A2UI 规范的 JSON 输入
2. WHEN 解析完成后，THE Parser SHALL 构建内部组件树表示
3. IF JSON 格式不符合 A2UI 规范，THEN THE Parser SHALL 返回详细的错误信息
4. THE Serializer SHALL 将内部组件树序列化为 A2UI JSON 格式
5. FOR ALL 有效的组件树，解析后序列化再解析 SHALL 产生等价的组件树（往返一致性）

### Requirement 12: 动作与事件处理

**User Story:** 作为用户，我希望生成的 UI 能够响应我的交互操作。

#### Acceptance Criteria

1. WHEN 用户点击按钮或触发其他动作时，THE Action_Handler SHALL 捕获事件并生成动作消息
2. THE Action_Handler SHALL 支持将动作消息发送回 LLM Agent 进行处理
3. WHEN Agent 返回 UI 更新时，THE System SHALL 应用增量更新到当前界面
4. THE Action_Handler SHALL 支持本地动作处理（不需要 Agent 参与的简单交互）
5. IF 动作处理失败，THEN THE System SHALL 显示友好的错误提示

### Requirement 13: LLM 设置界面

**User Story:** 作为用户，我希望通过设置界面配置 LLM 提供商和参数，以便使用不同的 AI 服务生成 UI。

#### Acceptance Criteria

1. THE LLM_Settings SHALL 提供可视化设置界面，允许用户配置 LLM 参数
2. THE LLM_Settings SHALL 支持选择预定义的 LLM 提供商（OpenAI、Anthropic、iFlow、自定义）
3. WHEN 用户选择 LLM 提供商时，THE System SHALL 自动填充该提供商的默认配置（API 端点、默认模型等）
4. THE LLM_Settings SHALL 允许用户输入 API 密钥，并安全存储（本地加密或仅存于内存）
5. THE LLM_Settings SHALL 支持配置模型名称、温度（temperature）、最大 token 数等参数
6. THE LLM_Settings SHALL 支持配置自定义 API 端点，以便接入私有部署的 LLM 服务
7. WHEN 用户保存设置时，THE System SHALL 验证配置的有效性（必填字段、参数范围等）
8. THE LLM_Settings SHALL 支持测试连接功能，验证 API 密钥和端点是否可用
9. THE LLM_Settings SHALL 将配置持久化到本地存储，下次打开时自动加载
10. IF 配置验证失败，THEN THE System SHALL 显示具体的错误信息和修复建议

### Requirement 14: 多 LLM 提供商支持

**User Story:** 作为开发者，我希望系统支持多种 LLM 提供商，以便根据需求选择最合适的 AI 服务。

#### Acceptance Criteria

1. THE LLM_Engine SHALL 支持 OpenAI API 格式（GPT-4、GPT-3.5 等模型）
2. THE LLM_Engine SHALL 支持 Anthropic API 格式（Claude 系列模型）
3. THE LLM_Engine SHALL 支持 iFlow 心流平台 API（https://apis.iflow.cn/v1/chat/completions）
4. THE LLM_Engine SHALL 支持任何兼容 OpenAI API 格式的自定义端点
5. WHEN 切换 LLM 提供商时，THE System SHALL 自动适配不同的请求格式和认证方式
6. THE LLM_Engine SHALL 为每个提供商提供合理的默认配置
7. THE LLM_Engine SHALL 支持流式响应（streaming）以提供实时反馈
8. IF LLM 请求失败，THEN THE System SHALL 提供详细的错误信息和重试选项

### Requirement 15: Schema 同步到编辑器

**User Story:** 作为用户，我希望 LLM 生成的 UI Schema 能自动同步到 JSON 编辑器和数据绑定编辑器，以便查看和修改。

#### Acceptance Criteria

1. WHEN LLM 生成 UI Schema 时，THE System SHALL 自动将 Schema 同步到 JSON Schema 编辑器
2. WHEN LLM 生成 UI Schema 时，THE System SHALL 自动提取数据绑定字段并同步到 Data Binding 编辑器
3. THE Schema_Sync SHALL 保持编辑器内容与最新生成的 Schema 一致
4. WHEN 用户在编辑器中修改 Schema 时，THE System SHALL 实时更新预览面板
5. THE Schema_Sync SHALL 支持增量更新，避免不必要的全量刷新
6. IF Schema 解析失败，THEN THE System SHALL 在编辑器中显示错误标记和提示
7. THE Schema_Sync SHALL 在同步时保留用户在 Data Binding 编辑器中的自定义数据值
