# LLM 模块

LLM（大语言模型）相关功能模块，提供 LLM 服务调用、配置管理、提供商预设等功能。

## 目录结构

```
llm/
├── index.ts              # 统一导出
├── llm-service.ts        # LLM 服务核心
├── llm-providers.ts      # 提供商管理
├── llm-config-manager.ts # 配置持久化
├── provider-presets.ts   # 预设配置
└── README.md             # 本文档
```

## 文件索引

| 文件 | 描述 |
|------|------|
| `llm-service.ts` | LLM 服务核心，包括消息发送、流式响应、JSON 提取 |
| `llm-providers.ts` | 提供商管理，包括模型列表、预设配置 |
| `llm-config-manager.ts` | 配置验证和 localStorage 持久化 |
| `provider-presets.ts` | 预定义的提供商配置（OpenAI、Anthropic、iFlow） |

## 主要功能

### LLM 服务 (llm-service.ts)

- `sendMessage()` - 发送消息并获取流式响应
- `extractJSON()` - 从 LLM 响应中提取 JSON
- `extractUISchema()` - 提取并验证 UI Schema
- `testConnection()` - 测试 LLM 连接

### 提供商管理 (llm-providers.ts)

- `getAvailableModels()` - 获取可用模型列表
- `createConfigFromPreset()` - 从预设创建配置
- `DEFAULT_SYSTEM_PROMPT` - 默认系统提示词

### 配置管理 (llm-config-manager.ts)

- `saveLLMConfig()` - 保存配置
- `loadCurrentLLMConfig()` - 加载当前配置
- `validateLLMConfig()` - 验证配置

## 使用示例

```typescript
import {
  sendMessage,
  createLLMConfig,
  extractUISchema,
  type LLMConfig,
  type ChatMessage,
} from '@/lib/llm';

// 创建配置
const config: LLMConfig = createLLMConfig({
  provider: 'openai',
  apiKey: 'your-api-key',
  model: 'gpt-4',
});

// 发送消息
const messages: ChatMessage[] = [
  { role: 'user', content: '创建一个登录表单' }
];

for await (const chunk of sendMessage(messages, config)) {
  if (chunk.error) {
    console.error(chunk.error);
    break;
  }
  console.log(chunk.content);
}
```

## 支持的提供商

| 提供商 | 端点 | 默认模型 |
|--------|------|----------|
| OpenAI | api.openai.com | gpt-4 |
| Anthropic | api.anthropic.com | claude-3-opus |
| iFlow | apis.iflow.cn | glm-4.6 |
| Custom | 自定义 | 自定义 |

## 相关需求

- Requirements 1.4: LLM 子目录
- Requirements 7.2: 提供商配置
- Requirements 7.4: JSON 提取
