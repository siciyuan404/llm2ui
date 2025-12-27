# Implementation Plan: LLM Chat Integration

## Overview

基于 TypeScript + React 实现 LLM 对话集成功能。扩展现有的 LLM 服务模块，添加多提供商支持、设置界面、对话渲染器和 Schema 同步功能。

## Tasks

- [x] 1. 扩展 LLM 服务模块
  - [x] 1.1 添加 iFlow 提供商支持
    - 在 `src/lib/llm-service.ts` 中添加 `iflow` 提供商类型
    - 添加 iFlow 默认配置（endpoint: https://apis.iflow.cn/v1/chat/completions）
    - iFlow 使用 OpenAI 兼容格式，复用 OpenAI 请求构建逻辑
    - _Requirements: 2.3_

  - [x] 1.2 添加提供商预设数据
    - 创建 `src/lib/llm-providers.ts` 文件
    - 定义 `PROVIDER_PRESETS` 常量，包含 OpenAI、Anthropic、iFlow、自定义
    - 导出 `getProviderPreset()` 和 `getAvailableModels()` 函数
    - _Requirements: 1.2, 1.3, 2.6_

  - [x] 1.3 编写提供商默认配置属性测试
    - **Property 3: 提供商默认配置完整性**
    - **Validates: Requirements 1.3, 2.6**

  - [x] 1.4 编写请求格式适配属性测试
    - **Property 4: 请求格式适配正确性**
    - **Validates: Requirements 2.5**

- [x] 2. 实现 LLM 配置管理
  - [x] 2.1 创建配置管理模块
    - 创建 `src/lib/llm-config-manager.ts` 文件
    - 实现 `validateLLMConfig()` 函数，验证必填字段和参数范围
    - 实现 `saveLLMConfig()` 和 `loadLLMConfig()` 函数
    - 使用 localStorage 持久化配置
    - _Requirements: 1.7, 1.9, 1.10_

  - [x] 2.2 编写配置验证属性测试
    - **Property 1: 配置验证正确性**
    - **Validates: Requirements 1.7, 1.10**

  - [x] 2.3 编写配置持久化属性测试
    - **Property 2: 配置持久化往返一致性**
    - **Validates: Requirements 1.9**

- [x] 3. Checkpoint - LLM 服务层验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 实现 LLM 设置界面
  - [x] 4.1 创建 LLMSettingsDialog 组件
    - 创建 `src/components/settings/LLMSettingsDialog.tsx`
    - 使用 shadcn/ui Dialog 组件
    - 实现提供商选择下拉菜单
    - 实现 API 密钥输入（密码类型）
    - 实现模型选择下拉菜单
    - 实现温度和最大 token 数滑块/输入
    - 实现自定义端点输入
    - 实现系统提示词文本域
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

  - [x] 4.2 实现测试连接功能
    - 在设置对话框中添加"测试连接"按钮
    - 调用 LLM 服务发送测试消息
    - 显示连接成功/失败状态
    - _Requirements: 1.8_

  - [x] 4.3 实现配置保存和加载
    - 保存时验证配置有效性
    - 显示验证错误信息
    - 加载时自动填充已保存的配置
    - _Requirements: 1.7, 1.9, 1.10_

- [x] 5. 实现模型切换器组件
  - [x] 5.1 创建 ModelSwitcher 组件
    - 创建 `src/components/chat/ModelSwitcher.tsx`
    - 使用 shadcn/ui Select 组件
    - 显示当前提供商和模型名称
    - 支持快速切换已保存的配置
    - 添加"设置"按钮打开设置对话框
    - _Requirements: 3.9, 3.10, 3.11_

- [x] 6. Checkpoint - 设置界面验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 7. 实现 Schema 同步功能
  - [x] 7.1 创建 Schema 同步模块
    - 创建 `src/lib/schema-sync.ts` 文件
    - 实现 `syncToJsonEditor()` 函数
    - 实现 `syncToDataBindingEditor()` 函数
    - 实现 `extractAndSync()` 函数
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 7.2 实现数据绑定字段保留逻辑
    - 在同步时合并现有数据值
    - 只更新 Schema 中新增的字段
    - 保留用户自定义的数据值
    - _Requirements: 4.7_

  - [x] 7.3 编写 Schema 同步属性测试
    - **Property 8: Schema 同步完整性**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 7.4 编写数据绑定保留属性测试
    - **Property 9: 数据绑定字段保留**
    - **Validates: Requirements 4.7**

- [x] 8. 增强 JSON 提取功能
  - [x] 8.1 增强 extractJSONBlocks 函数
    - 更新 `src/lib/llm-service.ts` 中的 `extractJSONBlocks()`
    - 支持提取多个 JSON 块
    - 改进正则表达式匹配
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 8.2 编写 JSON 提取属性测试
    - **Property 5: JSON 代码块提取完整性**
    - **Validates: Requirements 5.1, 5.2, 5.5**

  - [x] 8.3 编写 Schema 验证属性测试
    - **Property 6: UI Schema 验证正确性**
    - **Validates: Requirements 5.3, 5.4**

  - [x] 8.4 编写 Schema 序列化属性测试
    - **Property 7: UI Schema 序列化往返一致性**
    - **Validates: Requirements 5.6**

- [x] 9. Checkpoint - Schema 处理验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 10. 实现对话内容渲染器
  - [x] 10.1 创建 RenderedUICard 组件
    - 创建 `src/components/chat/RenderedUICard.tsx`
    - 使用现有 Renderer 渲染 UI Schema
    - 添加"AI 生成的 UI"标签
    - 添加边框和背景样式
    - _Requirements: 7.1, 7.2, 7.3, 7.10_

  - [x] 10.2 实现全屏预览功能
    - 添加"全屏预览"按钮
    - 使用 shadcn/ui Dialog 实现全屏模态框
    - 在模态框中渲染完整 UI
    - _Requirements: 7.4_

  - [x] 10.3 实现操作按钮
    - 添加"复制 JSON"按钮，复制原始 Schema
    - 添加"应用到编辑器"按钮，调用 Schema 同步
    - _Requirements: 7.5, 7.6_

  - [x] 10.4 实现交互支持
    - 为渲染的 UI 绑定事件处理
    - 支持按钮点击、输入等交互
    - _Requirements: 7.7_

  - [x] 10.5 实现错误处理
    - 渲染失败时显示错误信息
    - 显示原始 JSON 代码作为回退
    - _Requirements: 7.8_

  - [x] 10.6 编写 Schema 渲染属性测试
    - **Property 11: Schema 渲染正确性**
    - **Validates: Requirements 7.1, 7.8**

- [x] 11. 增强 MessageBubble 组件
  - [x] 11.1 集成 RenderedUICard
    - 更新 `src/components/chat/MessageBubble.tsx`
    - 检测消息中的 UI Schema
    - 使用 RenderedUICard 渲染 Schema
    - 保留原有文本消息显示
    - _Requirements: 7.1, 7.9_

- [x] 12. 实现系统提示词管理
  - [x] 12.1 创建默认系统提示词
    - 在 `src/lib/llm-providers.ts` 中添加 `DEFAULT_SYSTEM_PROMPT`
    - 包含可用组件类型说明
    - 包含 UI Schema 格式示例
    - _Requirements: 6.1, 6.4, 6.5_

  - [x] 12.2 实现提示词注入
    - 更新 `sendMessage()` 函数
    - 自动在消息列表开头添加系统提示词
    - _Requirements: 6.3_

  - [x] 12.3 编写系统提示词注入属性测试
    - **Property 10: 系统提示词注入**
    - **Validates: Requirements 6.3**

- [x] 13. Checkpoint - 对话渲染验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 14. 集成到主应用
  - [x] 14.1 更新 ChatInterface 组件
    - 集成 ModelSwitcher 组件
    - 集成 LLMSettingsDialog 组件
    - 连接 Schema 同步功能
    - _Requirements: 3.1-3.11_

  - [x] 14.2 更新 App.tsx
    - 添加 LLM 配置状态管理
    - 连接 ChatInterface 和编辑器的 Schema 同步
    - _Requirements: 4.1, 4.2, 4.4_

- [x] 15. Final Checkpoint - 完整功能验证
  - 确保所有测试通过
  - 验证端到端流程：配置 LLM → 发送消息 → 渲染 UI → 同步到编辑器
  - 如有问题请询问用户

## Notes

- 所有任务均为必需，包括属性测试任务
- 每个任务都引用了具体的需求以确保可追溯性
- Checkpoint 任务用于阶段性验证
- 属性测试使用 fast-check 库，每个测试至少运行 100 次迭代
- 现有的 LLM 服务模块已支持 OpenAI 和 Anthropic，本次主要扩展 iFlow 支持和设置界面
