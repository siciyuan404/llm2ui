# types

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

TypeScript 类型定义目录，定义 LLM2UI 系统的核心数据结构。
包括 UISchema、LLM 配置、案例系统、设计令牌和应用状态等类型。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 类型导出入口，统一导出所有类型定义 |
| ui-schema.ts | 核心类型定义：UISchema、UIComponent、StyleProps、EventBinding、DataContext、ValidationResult |
| llm.types.ts | LLM 相关类型：LLMConfig、LLMProvider、LLMResponse、StreamingChunk、ChatMessage |
| example.types.ts | 案例系统类型：Example、ExampleCategory、ExampleTag、ExampleSearchResult |
| design-tokens.types.ts | 设计令牌类型：DesignTokens、ColorToken、SpacingToken、TokenCategory |
| state.types.ts | 状态管理类型：ChatState、EditorState、UIState、AppState、ConversationMessage |

## 类型分类

### 核心类型 (ui-schema.ts)
- `UISchema` - UI 定义的根结构
- `UIComponent` - 单个 UI 组件定义
- `StyleProps` - 样式属性
- `EventBinding` - 事件绑定配置
- `DataContext` - 数据上下文

### LLM 类型 (llm.types.ts)
- `LLMConfig` - LLM 配置接口
- `LLMProvider` - 支持的提供商类型
- `LLMResponse` - LLM 响应结构
- `StreamingChunk` - 流式响应数据块
- `ChatMessage` - 聊天消息结构

### 案例类型 (example.types.ts)
- `Example` - 案例元数据
- `ExampleCategory` - 案例分类
- `ExampleTag` - 案例标签
- `ExampleSearchResult` - 搜索结果

### 设计令牌类型 (design-tokens.types.ts)
- `DesignTokens` - 完整设计令牌配置
- `ColorToken` - 颜色令牌
- `SpacingToken` - 间距令牌
- `TokenCategory` - 令牌分类

### 状态类型 (state.types.ts)
- `AppState` - 应用状态
- `ChatState` - 聊天状态
- `EditorState` - 编辑器状态
- `UIState` - UI 状态
- `ConversationMessage` - 对话消息
- `DevModeStatus` - 开发者模式状态 ('on' | 'off')
- `ComponentDebugInfo` - 组件调试信息

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
