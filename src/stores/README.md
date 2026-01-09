# Stores 目录

## 概述

本目录包含应用的集中式状态管理模块，使用 [Zustand](https://github.com/pmndrs/zustand) 实现。

## 文件索引

| 文件 | 描述 |
|------|------|
| `appStore.ts` | 应用主状态 Store，管理 Schema、聊天、LLM 配置和 UI 状态 |
| `index.ts` | 模块统一导出 |

## 状态结构

### AppState

```typescript
interface AppState {
  // Schema 状态
  schema: UISchema | null;
  jsonContent: string;
  dataContext: DataContext;
  
  // 聊天状态
  chatState: ChatState;
  isLoading: boolean;
  
  // LLM 配置
  llmConfig: LLMConfig | null;
  
  // UI 状态
  editorSplitPercent: number;
  isResizingEditor: boolean;
}
```

## 使用示例

### 基本使用

```typescript
import { useAppStore } from '@/stores';

function MyComponent() {
  // 获取状态
  const schema = useAppStore((state) => state.schema);
  const isLoading = useAppStore((state) => state.isLoading);
  
  // 获取 actions
  const setSchema = useAppStore((state) => state.setSchema);
  const setLoading = useAppStore((state) => state.setLoading);
  
  // 使用
  const handleUpdate = () => {
    setLoading(true);
    // ...
    setSchema(newSchema);
    setLoading(false);
  };
}
```

### 使用选择器

```typescript
import { useAppStore, selectActiveMessages, selectIsLLMConfigured } from '@/stores';

function ChatPanel() {
  const messages = useAppStore(selectActiveMessages);
  const isConfigured = useAppStore(selectIsLLMConfigured);
  
  if (!isConfigured) {
    return <div>请先配置 LLM</div>;
  }
  
  return <MessageList messages={messages} />;
}
```

## 持久化

Store 使用 Zustand 的 `persist` 中间件实现状态持久化：

- **持久化字段**: `llmConfig`
- **存储键**: `llm2ui-app-state`
- **存储位置**: localStorage

## 相关模块

- `@/types/state.types` - 状态类型定义
- `@/types/llm.types` - LLM 配置类型
- `@/constants/storage-keys` - 存储键常量
- `@/constants/defaults` - 默认配置值
