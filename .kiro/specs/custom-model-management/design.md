# Design Document: Custom Model Management

## Overview

本设计文档描述自定义模型管理功能的技术架构和实现方案。该功能允许用户手动添加、编辑和删除 LLM 模型配置，扩展现有的预设模型列表。

核心设计原则：
1. **非侵入式扩展**：不修改现有预设模型数据，自定义模型独立存储
2. **统一访问接口**：提供统一的 API 获取所有模型（预设 + 自定义）
3. **持久化存储**：自定义模型配置保存到 localStorage
4. **类型安全**：完整的 TypeScript 类型定义

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Custom Model Management                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      UI Layer                                        │    │
│  │  ┌──────────────────┐  ┌──────────────────────────────────────────┐ │    │
│  │  │ LLMSettingsDialog│  │ ModelManagementDialog                    │ │    │
│  │  │                  │  │  ┌────────────────┐ ┌─────────────────┐  │ │    │
│  │  │ [管理模型] ──────┼──┼─▶│ ModelList      │ │ AddModelForm    │  │ │    │
│  │  │                  │  │  │ - 预设模型     │ │ - 模型名称      │  │ │    │
│  │  │ 模型选择下拉     │  │  │ - 自定义模型   │ │ - 提供商选择    │  │ │    │
│  │  │ (预设+自定义)    │  │  │ [编辑][删除]   │ │ - 端点(可选)    │  │ │    │
│  │  └──────────────────┘  │  └────────────────┘ └─────────────────┘  │ │    │
│  │                        └──────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Service Layer                                   │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │ CustomModelManager                                            │   │    │
│  │  │                                                               │   │    │
│  │  │ addModel(model: CustomModel): void                            │   │    │
│  │  │ updateModel(id: string, model: Partial<CustomModel>): void    │   │    │
│  │  │ deleteModel(id: string): void                                 │   │    │
│  │  │ getCustomModels(): CustomModel[]                              │   │    │
│  │  │ getAllModels(provider?: LLMProvider): ModelInfo[]             │   │    │
│  │  │ searchModels(query: string): ModelInfo[]                      │   │    │
│  │  │ isPresetModel(modelName: string): boolean                     │   │    │
│  │  │ validateModel(model: CustomModel): ValidationResult           │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Storage Layer                                   │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │ localStorage                                                  │   │    │
│  │  │                                                               │   │    │
│  │  │ Key: 'llm2ui_custom_models'                                   │   │    │
│  │  │ Value: CustomModel[]                                          │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 自定义模型数据结构

```typescript
/**
 * 自定义模型配置
 */
interface CustomModel {
  /** 唯一标识符 */
  id: string;
  /** 模型名称（用于 API 调用） */
  name: string;
  /** 显示名称（用于 UI 显示，可选） */
  displayName?: string;
  /** 所属提供商 */
  provider: LLMProvider;
  /** 自定义 API 端点（可选，留空则使用提供商默认端点） */
  endpoint?: string;
  /** 模型描述（可选） */
  description?: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/**
 * 统一的模型信息（用于 UI 显示）
 */
interface ModelInfo {
  /** 模型名称 */
  name: string;
  /** 显示名称 */
  displayName: string;
  /** 所属提供商 */
  provider: LLMProvider;
  /** 是否为预设模型 */
  isPreset: boolean;
  /** 自定义模型 ID（仅自定义模型有） */
  customModelId?: string;
  /** 自定义端点（可选） */
  endpoint?: string;
  /** 描述 */
  description?: string;
}

/**
 * 模型验证结果
 */
interface ModelValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}
```

### 2. CustomModelManager 接口

```typescript
/**
 * 自定义模型管理器接口
 */
interface ICustomModelManager {
  /**
   * 添加自定义模型
   * @throws 如果模型名称为空或重复
   */
  addModel(model: Omit<CustomModel, 'id' | 'createdAt' | 'updatedAt'>): CustomModel;
  
  /**
   * 更新自定义模型
   * @throws 如果模型不存在或尝试更新预设模型
   */
  updateModel(id: string, updates: Partial<Omit<CustomModel, 'id' | 'createdAt'>>): CustomModel;
  
  /**
   * 删除自定义模型
   * @throws 如果模型不存在或尝试删除预设模型
   */
  deleteModel(id: string): void;
  
  /**
   * 获取所有自定义模型
   */
  getCustomModels(): CustomModel[];
  
  /**
   * 获取指定提供商的所有模型（预设 + 自定义）
   */
  getAllModels(provider?: LLMProvider): ModelInfo[];
  
  /**
   * 搜索模型
   */
  searchModels(query: string): ModelInfo[];
  
  /**
   * 检查是否为预设模型
   */
  isPresetModel(modelName: string, provider: LLMProvider): boolean;
  
  /**
   * 验证模型配置
   */
  validateModel(model: Partial<CustomModel>): ModelValidationResult;
  
  /**
   * 从存储加载
   */
  loadFromStorage(): void;
  
  /**
   * 保存到存储
   */
  saveToStorage(): void;
}
```

### 3. UI 组件接口

```typescript
/**
 * 模型管理对话框属性
 */
interface ModelManagementDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 模型变更回调 */
  onModelsChange?: () => void;
}

/**
 * 添加/编辑模型表单属性
 */
interface ModelFormProps {
  /** 编辑模式时的现有模型 */
  existingModel?: CustomModel;
  /** 提交回调 */
  onSubmit: (model: Omit<CustomModel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  /** 取消回调 */
  onCancel: () => void;
}

/**
 * 模型列表项属性
 */
interface ModelListItemProps {
  model: ModelInfo;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}
```

## Data Models

### 1. 存储键常量

```typescript
/**
 * 自定义模型存储键
 */
const CUSTOM_MODELS_STORAGE_KEY = 'llm2ui_custom_models';
```

### 2. 默认值

```typescript
/**
 * 生成唯一 ID
 */
function generateModelId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 模型添加后可检索

*For any* 有效的自定义模型配置，添加到管理器后，通过 getAllModels 或 getCustomModels 应能检索到该模型。

**Validates: Requirements 1.1, 1.6, 6.3**

### Property 2: 模型验证正确性

*For any* 模型配置，验证函数应正确识别：
- 空模型名称为无效
- 与现有模型（预设或自定义）重复的名称为无效
- 有效配置返回 valid: true

**Validates: Requirements 1.2, 1.5**

### Property 3: 模型编辑正确性

*For any* 已添加的自定义模型，编辑操作应成功更新模型配置，且更新后的模型可通过 ID 检索到。

**Validates: Requirements 2.1, 2.4**

### Property 4: 模型删除正确性

*For any* 已添加的自定义模型，删除操作后该模型不应出现在任何模型列表中。

**Validates: Requirements 3.1**

### Property 5: 持久化往返一致性

*For any* 有效的自定义模型列表，保存到存储后再加载，应产生等价的模型列表。

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: 搜索过滤正确性

*For any* 搜索查询，返回的模型列表中所有模型的名称或显示名称应包含查询字符串（不区分大小写）。

**Validates: Requirements 5.5**

### Property 7: 端点继承正确性

*For any* 为现有提供商添加的自定义模型（未指定端点），获取该模型信息时应返回提供商的默认端点。

**Validates: Requirements 6.2**

## Error Handling

### 1. 验证错误

```typescript
/**
 * 模型验证错误类型
 */
type ModelValidationErrorCode = 
  | 'EMPTY_NAME'           // 模型名称为空
  | 'DUPLICATE_NAME'       // 模型名称重复
  | 'INVALID_PROVIDER'     // 无效的提供商
  | 'INVALID_ENDPOINT';    // 无效的端点格式

/**
 * 验证错误消息映射
 */
const VALIDATION_ERROR_MESSAGES: Record<ModelValidationErrorCode, string> = {
  EMPTY_NAME: '模型名称不能为空',
  DUPLICATE_NAME: '模型名称已存在',
  INVALID_PROVIDER: '请选择有效的提供商',
  INVALID_ENDPOINT: 'API 端点格式不正确',
};
```

### 2. 操作错误

```typescript
/**
 * 模型操作错误
 */
class ModelOperationError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'PRESET_MODEL' | 'VALIDATION_FAILED',
    message: string
  ) {
    super(message);
    this.name = 'ModelOperationError';
  }
}
```

错误处理策略：
- 尝试编辑/删除预设模型：抛出 PRESET_MODEL 错误
- 模型不存在：抛出 NOT_FOUND 错误
- 验证失败：返回验证结果，不抛出错误

## Testing Strategy

### 单元测试

使用 Vitest 进行单元测试，覆盖以下模块：

1. **CustomModelManager**
   - 添加模型功能
   - 编辑模型功能
   - 删除模型功能
   - 模型验证
   - 搜索过滤

2. **存储操作**
   - 保存到 localStorage
   - 从 localStorage 加载

### 属性测试

使用 fast-check 进行属性测试，每个测试至少运行 100 次迭代：

1. **Property 1**: 模型添加后可检索
2. **Property 2**: 模型验证正确性
3. **Property 3**: 模型编辑正确性
4. **Property 4**: 模型删除正确性
5. **Property 5**: 持久化往返一致性
6. **Property 6**: 搜索过滤正确性
7. **Property 7**: 端点继承正确性

### 测试标注格式

每个属性测试必须包含以下注释：

```typescript
/**
 * Feature: custom-model-management, Property N: [属性名称]
 * Validates: Requirements X.Y
 */
```

