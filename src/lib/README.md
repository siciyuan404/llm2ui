# lib

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

核心库目录，包含 LLM2UI 系统的核心逻辑：组件注册、数据绑定、渲染引擎、序列化、验证、状态管理、LLM 服务和错误处理。
所有模块通过 index.ts 统一导出。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 统一导出入口，汇总所有模块的公共 API |
| component-registry.ts | 组件注册表，管理 UI 组件的注册和查找 |
| shadcn-components.ts | shadcn-ui 组件注册，将基础组件注册到注册表 |
| data-binding.ts | 数据绑定系统，解析和解析 `{{path}}` 表达式 |
| event-handler.ts | 事件处理模块，处理组件事件和动作分发 |
| renderer.tsx | 渲染引擎，将 UISchema 渲染为 React 组件 |
| serialization.ts | 序列化模块，UISchema 的 JSON 序列化/反序列化 |
| validation.ts | 验证模块，JSON 语法和 UISchema 结构验证 |
| state-management.ts | 状态管理，聊天、编辑器、布局状态的纯函数操作 |
| llm-service.ts | LLM 服务，配置管理、流式响应、JSON 提取（支持多块提取和元数据）、连接测试、系统提示词注入 |
| llm-service.test.ts | LLM 服务属性测试，验证 JSON 代码块提取完整性 (Property 5)、UI Schema 验证正确性 (Property 6)、UI Schema 序列化往返一致性 (Property 7)、系统提示词注入 (Property 10) |
| llm-providers.ts | LLM 提供商预设，包含 OpenAI、Anthropic、iFlow 等提供商配置和默认系统提示词（含组件类型、属性说明和格式示例），并重新导出自定义模型管理器的类型和函数 |
| llm-providers.test.ts | LLM 提供商属性测试，验证提供商默认配置完整性 (Property 3) 和请求格式适配正确性 (Property 4) |
| provider-presets.ts | 提供商预设定义，独立模块避免循环依赖，包含 PROVIDER_PRESETS 常量和 getProviderPreset 函数 |
| llm-config-manager.ts | LLM 配置管理器，提供配置验证、localStorage 持久化、保存/加载/删除配置功能 |
| llm-config-manager.test.ts | LLM 配置管理器属性测试，验证配置验证正确性 (Property 1) 和配置持久化往返一致性 (Property 2) |
| export.ts | 导出模块，支持 JSON、Vue3 SFC、React JSX 代码导出 |
| schema-generator.ts | Schema 生成器，从组件定义自动生成 A2UI Schema，支持按需加载 |
| error-handling.ts | 错误处理模块，网络错误重试、Schema 错误建议、未知组件日志 |
| utils.ts | 工具函数，cn() 类名合并、generateId() 唯一ID生成等通用工具 |
| monaco-config.ts | Monaco Editor 配置，配置使用本地安装而非 CDN 加载 |
| schema-generator.test.ts | Schema 生成器属性测试，验证 Schema 生成一致性 (Property 4) |
| template-manager.ts | 模板管理器，支持三层模板架构 (Base → Platform → Theme) |
| template-manager.test.ts | 模板管理器属性测试，验证模板合并正确性 (Property 5) |
| platform-adapter.ts | 平台适配器，处理跨平台组件的属性/样式/事件映射 |
| platform-adapter.test.ts | 平台适配器属性测试，验证平台适配映射正确性 (Property 6) |
| icon-registry.ts | 图标注册表，管理图标的注册、分类和搜索，集成 Lucide 图标库 |
| icon-registry.test.ts | 图标注册表属性测试，验证图标搜索完整性 (Property 9) |
| custom-examples-storage.ts | 自定义案例存储，使用 localStorage 管理用户提交的组件案例 |
| custom-model-manager.ts | 自定义模型管理器，提供模型增删改查、验证、搜索过滤、端点继承和 localStorage 持久化功能 |
| custom-model-manager.test.ts | 自定义模型管理器属性测试，验证模型添加后可检索 (Property 1)、模型验证正确性 (Property 2)、模型编辑正确性 (Property 3)、模型删除正确性 (Property 4)、持久化往返一致性 (Property 5)、搜索过滤正确性 (Property 6)、端点继承正确性 (Property 7) |
| schema-sync.ts | Schema 同步模块，将 LLM 生成的 UI Schema 同步到 JSON 编辑器和数据绑定编辑器 |
| schema-sync.test.ts | Schema 同步属性测试，验证 Schema 同步完整性 (Property 8) 和数据绑定字段保留 (Property 9) |
| *.test.ts | 对应模块的单元测试文件 |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
