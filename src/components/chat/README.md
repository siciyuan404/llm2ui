# chat

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

聊天交互组件目录，实现与 LLM 的对话界面。
包括消息显示、输入发送、流式响应、对话历史管理、网络错误处理、模型切换、UI Schema 渲染、LLM 设置集成、Schema 同步等功能。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 组件导出入口 |
| ChatInterface.tsx | 主聊天界面，集成 ModelSwitcher 和 LLMSettingsDialog，支持消息列表、输入框、发送按钮、流式响应显示、Schema 同步到编辑器 |
| MessageBubble.tsx | 消息气泡组件，用户/AI 消息样式、JSON 语法高亮、加载指示器、UI Schema 自动检测与渲染 |
| ConversationHistory.tsx | 对话历史列表，切换对话、新建对话、删除对话、加载历史 Schema |
| NetworkErrorAlert.tsx | 网络错误提示组件，显示错误信息、重试按钮、友好的错误消息 |
| ModelSwitcher.tsx | 模型切换器组件，快速切换已保存的 LLM 配置、显示当前提供商和模型 |
| RenderedUICard.tsx | UI Schema 渲染卡片，在对话中直接渲染 AI 生成的 UI，支持全屏预览、复制 JSON、应用到编辑器 |
| RenderedUICard.test.tsx | RenderedUICard 组件的单元测试 |
| ChatCustomization.tsx | Chat 界面定制面板，配色方案选择、布局类型选择、主题选择 |
| ColorSchemeSelector.tsx | 配色方案选择器，显示所有配色方案和预览 |
| LayoutSelector.tsx | 布局选择器，显示所有布局类型和视觉预览 |
| ContextSettingsPanel.tsx | LLM 上下文设置面板，主题/组件/案例/配色选择、Token 预算显示 |
| ComponentSelector.tsx | 组件选择器，按类别分组显示组件，支持选择/取消选择和预设选择 |
| ExampleSelector.tsx | 案例选择器，按类别分组显示案例，支持选择/取消选择，显示 Token 计数 |
| ColorPresetSelector.tsx | 配色预设选择器，显示配色方案列表和预览 |
| TokenBudgetControl.tsx | Token 预算控制组件，显示当前 Token 数、设置最大预算、显示各部分占用 |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
