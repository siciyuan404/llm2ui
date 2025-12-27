/**
 * LLM Providers Module
 * 
 * Provides predefined LLM provider configurations and utility functions
 * for managing provider presets and available models.
 * 
 * @module llm-providers
 */

import type { LLMProvider, LLMConfig } from './llm-service';
import {
  getAllModels as getAllModelsFromManager,
  type ModelInfo,
  type CustomModel,
  type ModelValidationResult,
  type ModelValidationError,
  type ModelOperationErrorCode,
  ModelOperationError,
  addModel,
  updateModel,
  deleteModel,
  getCustomModels,
  getCustomModelById,
  searchModels,
  isPresetModel,
  validateModel,
  loadFromStorage,
  saveToStorage,
  clearAllCustomModels,
  clearInMemoryModels,
  generateModelId,
  CUSTOM_MODELS_STORAGE_KEY,
} from './custom-model-manager';

// Re-export from provider-presets to maintain backward compatibility
export {
  PROVIDER_PRESETS,
  getProviderPreset,
  type ProviderPreset,
} from './provider-presets';

// Re-export custom model manager types and functions
export {
  type ModelInfo,
  type CustomModel,
  type ModelValidationResult,
  type ModelValidationError,
  type ModelOperationErrorCode,
  ModelOperationError,
  addModel,
  updateModel,
  deleteModel,
  getCustomModels,
  getCustomModelById,
  searchModels,
  isPresetModel,
  validateModel,
  loadFromStorage,
  saveToStorage,
  clearAllCustomModels,
  clearInMemoryModels,
  generateModelId,
  CUSTOM_MODELS_STORAGE_KEY,
};

// Import PROVIDER_PRESETS for local use
import { PROVIDER_PRESETS, getProviderPreset, type ProviderPreset } from './provider-presets';

/**
 * Gets available models for a provider
 * 
 * Returns both preset and custom models for the specified provider.
 * Custom models are appended after preset models.
 * 
 * @param provider - The provider type
 * @returns Array of available model names, empty array if provider not found
 * 
 * @see Requirements 6.3
 */
export function getAvailableModels(provider: LLMProvider): string[] {
  // Get all models (preset + custom) for the provider
  const allModels = getAllModelsFromManager(provider);
  return allModels.map(model => model.name);
}

/**
 * Gets all models (preset + custom) for a provider with full model info
 * 
 * @param provider - Optional provider filter
 * @returns Array of ModelInfo objects
 * 
 * @see Requirements 6.3
 */
export function getAllModelsWithInfo(provider?: LLMProvider): ModelInfo[] {
  return getAllModelsFromManager(provider);
}

/**
 * Gets all provider presets
 * 
 * @returns Array of all provider presets
 */
export function getAllProviderPresets(): ProviderPreset[] {
  return [...PROVIDER_PRESETS];
}

/**
 * Creates a default LLM config from a provider preset
 * 
 * @param provider - The provider type
 * @param apiKey - Optional API key to include
 * @returns Partial LLM config with preset defaults
 */
export function createConfigFromPreset(
  provider: LLMProvider,
  apiKey?: string
): Partial<LLMConfig> {
  const preset = getProviderPreset(provider);
  
  if (!preset) {
    return {
      provider,
      apiKey: apiKey ?? '',
    };
  }

  return {
    provider: preset.provider,
    apiKey: apiKey ?? '',
    endpoint: preset.endpoint,
    model: preset.defaultModel,
  };
}

/**
 * Default system prompt for UI generation
 * 
 * Guides the LLM to generate A2UI-compatible UI Schema.
 * Includes available component types, their properties, and format examples.
 * 
 * @see Requirements 6.1, 6.4, 6.5
 */
export const DEFAULT_SYSTEM_PROMPT = `你是一个 UI 生成助手，专门帮助用户通过自然语言描述生成用户界面。

当用户描述他们想要的 UI 时，你需要生成符合以下格式的 JSON Schema：

\`\`\`json
{
  "version": "1.0",
  "root": {
    "id": "root",
    "type": "container",
    "props": {
      "direction": "column",
      "gap": "md"
    },
    "children": [...]
  }
}
\`\`\`

## 可用的组件类型及其属性

### 布局组件
- **container**: 容器布局
  - props: { direction: "row" | "column", gap: "sm" | "md" | "lg", align: "start" | "center" | "end", justify: "start" | "center" | "end" | "between" }
- **card**: 卡片容器
  - props: { title?: string, description?: string, padding?: "sm" | "md" | "lg" }

### 表单组件
- **input**: 输入框
  - props: { placeholder?: string, label?: string, type?: "text" | "email" | "password" | "number", disabled?: boolean }
- **select**: 下拉选择
  - props: { placeholder?: string, label?: string, options: Array<{ value: string, label: string }>, disabled?: boolean }
- **checkbox**: 复选框
  - props: { label?: string, checked?: boolean, disabled?: boolean }
- **switch**: 开关
  - props: { label?: string, checked?: boolean, disabled?: boolean }
- **form**: 表单容器
  - props: { onSubmit?: string }

### 展示组件
- **text**: 文本
  - props: { content: string, variant?: "default" | "muted" | "primary" }
- **heading**: 标题
  - props: { content: string, level?: 1 | 2 | 3 | 4 | 5 | 6 }
- **image**: 图片
  - props: { src: string, alt?: string, width?: number, height?: number }
- **badge**: 徽章
  - props: { content: string, variant?: "default" | "secondary" | "destructive" | "outline" }
- **alert**: 提示
  - props: { title?: string, description?: string, variant?: "default" | "destructive" }

### 交互组件
- **button**: 按钮
  - props: { label: string, variant?: "default" | "secondary" | "outline" | "ghost" | "destructive", size?: "sm" | "md" | "lg", disabled?: boolean, onClick?: string }

### 数据展示组件
- **list**: 列表
  - props: { items: Array<{ id: string, content: string }> }
- **table**: 表格
  - props: { columns: Array<{ key: string, header: string }>, data: Array<Record<string, unknown>> }

### 其他组件
- **separator**: 分隔线
  - props: { orientation?: "horizontal" | "vertical" }

## 组件通用属性

每个组件都有以下基本属性：
- **id**: 唯一标识符（必填）
- **type**: 组件类型（必填）
- **props**: 组件属性对象
- **children**: 子组件数组（可选，仅容器类组件支持）
- **style**: 自定义样式对象（可选）
- **data**: 数据绑定配置（可选）

## 数据绑定示例

\`\`\`json
{
  "id": "greeting",
  "type": "text",
  "props": {
    "content": "Hello, {{user.name}}!"
  },
  "data": {
    "user": {
      "name": "string"
    }
  }
}
\`\`\`

## 完整示例

\`\`\`json
{
  "version": "1.0",
  "root": {
    "id": "login-form",
    "type": "card",
    "props": {
      "title": "用户登录",
      "description": "请输入您的账号信息"
    },
    "children": [
      {
        "id": "username-input",
        "type": "input",
        "props": {
          "label": "用户名",
          "placeholder": "请输入用户名"
        }
      },
      {
        "id": "password-input",
        "type": "input",
        "props": {
          "label": "密码",
          "placeholder": "请输入密码",
          "type": "password"
        }
      },
      {
        "id": "submit-btn",
        "type": "button",
        "props": {
          "label": "登录",
          "variant": "default"
        }
      }
    ]
  }
}
\`\`\`

请始终将 UI Schema 放在 \`\`\`json 代码块中。根据用户的描述生成合适的 UI 组件组合。`;
