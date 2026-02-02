# Hooks 目录

本目录包含应用的自定义 React Hooks，用于封装可复用的状态逻辑。

## 目录结构

```
hooks/
├── index.ts              # 统一导出
├── useSchemaSync.ts      # Schema 同步逻辑
├── useLLMConfig.ts       # LLM 配置管理
├── useEditorResize.ts    # 编辑器面板拖拽
├── useChatState.ts       # 聊天状态管理
├── useTheme.ts           # 主题管理
├── useDevMode.ts         # 开发者模式管理
└── README.md             # 本文件
```

## 文件索引

| 文件 | 描述 | 相关需求 |
|------|------|----------|
| `index.ts` | 统一导出所有 hooks | 4.6, 11.6 |
| `useSchemaSync.ts` | 封装 schema 同步逻辑，集成 SchemaSyncer 和 appStore | 4.2 |
| `useLLMConfig.ts` | 封装 LLM 配置加载和保存逻辑 | 4.3 |
| `useEditorResize.ts` | 封装编辑器面板拖拽调整大小逻辑 | 4.4 |
| `useChatState.ts` | 封装聊天状态管理逻辑 | 4.5 |
| `useTheme.ts` | 封装主题管理逻辑，统一管理主题切换时的所有同步操作 | 11.4, 11.5, 11.6 |
| `useDevMode.ts` | 封装开发者模式管理，提供组件轮廓显示和 Alt+点击复制功能 | - |

## 使用方式

```typescript
import { 
  useSchemaSync, 
  useLLMConfig, 
  useEditorResize, 
  useChatState,
  useTheme,
} from '@/hooks';

// 在组件中使用
function MyComponent() {
  const { schemaSyncer, syncSchema, handleSyncResult } = useSchemaSync();
  const { config, setConfig, isConfigured } = useLLMConfig();
  const { splitPercent, isResizing, handleResizeStart, containerRef } = useEditorResize();
  const { messages, sendMessage, updateMessage, clearConversation, isLoading } = useChatState();
  const { themeId, theme, setTheme, colorSchemeId, setColorScheme } = useTheme();
  
  // ...
}
```

## Hook 详细说明

### useSchemaSync

封装 schema 同步逻辑，集成 SchemaSyncer 和 appStore。

```typescript
interface UseSchemaSync {
  schemaSyncer: SchemaSyncer;           // SchemaSyncer 实例
  syncSchema: (schema: UISchema) => SyncResult;  // 同步 schema
  syncData: (schema: UISchema, existingData?: DataContext) => SyncResult;  // 同步数据
  extractAndSync: (response: string, existingData?: DataContext) => SyncResult;  // 从 LLM 响应提取并同步
  subscribe: (callback: SchemaSyncCallback) => () => void;  // 订阅同步事件
  handleSyncResult: (result: SyncResult) => void;  // 处理同步结果
  currentSchema: UISchema | null;       // 当前 schema
  currentData: DataContext;             // 当前数据上下文
}
```

### useLLMConfig

封装 LLM 配置的加载、保存和管理逻辑。

```typescript
interface UseLLMConfig {
  config: LLMConfig | null;             // 当前配置
  setConfig: (config: LLMConfig) => void;  // 设置配置
  isConfigured: boolean;                // 是否已配置
  reloadConfig: () => void;             // 重新加载配置
  clearConfig: () => void;              // 清除配置
}
```

### useEditorResize

封装编辑器面板的拖拽调整大小逻辑。

```typescript
interface UseEditorResize {
  splitPercent: number;                 // 分割比例 (0-100)
  isResizing: boolean;                  // 是否正在调整
  handleResizeStart: (e: React.MouseEvent) => void;  // 开始拖拽
  containerRef: React.RefObject<HTMLDivElement>;  // 容器 ref
  setSplitPercent: (percent: number) => void;  // 设置分割比例
}
```

### useChatState

封装聊天状态的管理逻辑。

```typescript
interface UseChatState {
  messages: ConversationMessage[];      // 消息列表
  activeConversation: Conversation | null;  // 当前对话
  sendMessage: (message: ConversationMessage) => void;  // 发送消息
  updateMessage: (messageId: string, updates: Partial<ConversationMessage>) => void;  // 更新消息
  clearConversation: () => void;        // 清空对话
  isLoading: boolean;                   // 是否加载中
  setLoading: (loading: boolean) => void;  // 设置加载状态
  createMessage: (role: MessageRole, content: string) => ConversationMessage;  // 创建消息
}
```

### useTheme

封装主题管理逻辑，统一管理主题切换时的所有同步操作。

```typescript
interface UseThemeReturn {
  themeId: string;                      // 当前主题 ID
  theme: ThemePack | null;              // 当前主题包
  themes: ThemeMetadata[];              // 所有可用主题
  colorSchemeId: string;                // 当前配色方案 ID
  colorScheme: ColorScheme | null;      // 当前配色方案
  colorSchemes: ColorScheme[];          // 所有配色方案
  layoutId: string;                     // 当前布局 ID
  layout: LayoutConfig | null;          // 当前布局配置
  layouts: LayoutConfig[];              // 所有布局配置
  setTheme: (themeId: string) => void;  // 切换主题
  setColorScheme: (schemeId: string) => void;  // 切换配色方案
  setLayout: (layoutId: string) => void;  // 切换布局
  isLoading: boolean;                   // 是否正在加载
}
```

主题切换时自动同步：
- CSS 变量应用
- 提示词缓存清除
- 案例库刷新
- 关键词映射刷新
- 用户偏好持久化

## 设计原则

1. **单一职责**: 每个 hook 只负责一个特定的功能领域
2. **与 Store 集成**: 所有 hooks 都与 appStore 集成，实现状态共享
3. **向后兼容**: 保持与现有 App.tsx 逻辑的兼容性
4. **类型安全**: 所有 hooks 都有完整的 TypeScript 类型定义

## 相关文档

- [状态管理 Store](../stores/README.md)
- [类型定义](../types/README.md)
- [主题系统](../lib/themes/README.md)
- [设计文档](../../.kiro/specs/architecture-refactor/design.md)
