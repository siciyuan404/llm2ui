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

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
