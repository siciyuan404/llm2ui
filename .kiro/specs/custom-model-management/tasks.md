# Implementation Plan: Custom Model Management

## Overview

基于 TypeScript + React 实现自定义模型管理功能。创建 CustomModelManager 服务模块，实现模型的增删改查和持久化，并在 LLM 设置界面中添加模型管理入口。

## Tasks

- [x] 1. 创建 CustomModelManager 服务模块
  - [x] 1.1 创建类型定义和接口
    - 在 `src/lib/custom-model-manager.ts` 中定义 `CustomModel` 接口
    - 定义 `ModelInfo` 接口（统一的模型信息）
    - 定义 `ModelValidationResult` 接口
    - 定义存储键常量 `CUSTOM_MODELS_STORAGE_KEY`
    - _Requirements: 1.1_

  - [x] 1.2 实现模型验证功能
    - 实现 `validateModel()` 函数
    - 验证模型名称不能为空
    - 验证模型名称不能与现有模型重复
    - 返回详细的验证错误信息
    - _Requirements: 1.2, 1.5_

  - [x] 1.3 编写模型验证属性测试
    - **Property 2: 模型验证正确性**
    - **Validates: Requirements 1.2, 1.5**

  - [x] 1.4 实现模型添加功能
    - 实现 `addModel()` 函数
    - 生成唯一 ID
    - 设置创建时间和更新时间
    - 调用验证函数
    - _Requirements: 1.1, 1.6_

  - [x] 1.5 编写模型添加属性测试
    - **Property 1: 模型添加后可检索**
    - **Validates: Requirements 1.1, 1.6, 6.3**

  - [x] 1.6 实现模型编辑功能
    - 实现 `updateModel()` 函数
    - 检查模型是否存在
    - 检查是否为预设模型（不允许编辑）
    - 更新 updatedAt 时间戳
    - _Requirements: 2.1, 2.4_

  - [x] 1.7 编写模型编辑属性测试
    - **Property 3: 模型编辑正确性**
    - **Validates: Requirements 2.1, 2.4**

  - [x] 1.8 实现模型删除功能
    - 实现 `deleteModel()` 函数
    - 检查模型是否存在
    - 检查是否为预设模型（不允许删除）
    - _Requirements: 3.1_

  - [x] 1.9 编写模型删除属性测试
    - **Property 4: 模型删除正确性**
    - **Validates: Requirements 3.1**

- [x] 2. Checkpoint - 核心功能验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 3. 实现模型查询和持久化
  - [x] 3.1 实现模型查询功能
    - 实现 `getCustomModels()` 获取所有自定义模型
    - 实现 `getAllModels()` 获取所有模型（预设 + 自定义）
    - 实现 `isPresetModel()` 检查是否为预设模型
    - _Requirements: 6.3_

  - [x] 3.2 实现搜索过滤功能
    - 实现 `searchModels()` 函数
    - 支持按模型名称和显示名称搜索
    - 不区分大小写
    - _Requirements: 5.5_

  - [x] 3.3 编写搜索过滤属性测试
    - **Property 6: 搜索过滤正确性**
    - **Validates: Requirements 5.5**

  - [x] 3.4 实现端点继承逻辑
    - 在 `getAllModels()` 中处理端点继承
    - 自定义模型未指定端点时使用提供商默认端点
    - _Requirements: 6.2_

  - [x] 3.5 编写端点继承属性测试
    - **Property 7: 端点继承正确性**
    - **Validates: Requirements 6.2**

  - [x] 3.6 实现持久化功能
    - 实现 `saveToStorage()` 保存到 localStorage
    - 实现 `loadFromStorage()` 从 localStorage 加载
    - 在添加/编辑/删除操作后自动保存
    - _Requirements: 4.1, 4.2_

  - [x] 3.7 编写持久化属性测试
    - **Property 5: 持久化往返一致性**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 4. Checkpoint - 服务层验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 5. 创建模型管理 UI 组件
  - [x] 5.1 创建 ModelManagementDialog 组件
    - 创建 `src/components/settings/ModelManagementDialog.tsx`
    - 使用 shadcn/ui Dialog 组件
    - 显示模型列表（分组：预设/自定义）
    - 提供添加模型按钮
    - _Requirements: 5.1, 5.2_

  - [x] 5.2 创建 ModelListItem 组件
    - 显示模型名称、提供商、描述
    - 预设模型显示"预设"标签
    - 自定义模型显示编辑/删除按钮
    - _Requirements: 5.3, 5.4, 6.4_

  - [x] 5.3 创建 AddModelForm 组件
    - 模型名称输入（必填）
    - 显示名称输入（可选）
    - 提供商选择下拉菜单
    - 自定义端点输入（可选）
    - 描述输入（可选）
    - _Requirements: 1.2, 1.3, 1.4, 6.1_

  - [x] 5.4 实现搜索过滤 UI
    - 添加搜索输入框
    - 实时过滤模型列表
    - _Requirements: 5.5_

  - [x] 5.5 实现删除确认对话框
    - 显示确认消息
    - 如果模型正在使用，显示警告
    - _Requirements: 3.3, 3.4_

- [ ] 6. 集成到 LLM 设置界面
  - [x] 6.1 更新 LLMSettingsDialog
    - 添加"管理模型"按钮
    - 点击打开 ModelManagementDialog
    - _Requirements: 5.1_

  - [x] 6.2 更新模型选择下拉菜单
    - 使用 `getAllModels()` 获取模型列表
    - 显示预设和自定义模型
    - 用视觉标记区分两种类型
    - _Requirements: 6.3, 6.4_

  - [x] 6.3 更新 llm-providers.ts 导出
    - 导出 CustomModelManager 实例
    - 导出相关类型定义
    - 更新 `getAvailableModels()` 包含自定义模型
    - _Requirements: 6.3_

- [ ] 7. Final Checkpoint - 完整功能验证
  - 确保所有测试通过
  - 验证端到端流程：添加模型 → 在设置中选择 → 保存配置 → 刷新后仍可用
  - 如有问题请询问用户

## Notes

- 所有任务均为必需，包括属性测试任务
- 每个任务都引用了具体的需求以确保可追溯性
- Checkpoint 任务用于阶段性验证
- 属性测试使用 fast-check 库，每个测试至少运行 100 次迭代
- 自定义模型与现有 LLM 配置系统独立存储，避免数据冲突

