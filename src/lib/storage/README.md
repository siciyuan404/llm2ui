# storage

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

持久化模块，包含自定义模型管理器等存储相关功能。
这些模块负责管理应用数据的本地持久化，包括自定义 LLM 模型的增删改查、验证和 localStorage 存储。

### 架构关系

```
CustomModelManager
       ↓
localStorage (持久化)
       ↓
LLM Service (使用模型配置)
```

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 统一导出入口，汇总所有存储模块的公共 API |
| custom-model-manager.ts | 自定义模型管理器，提供模型增删改查、验证、搜索过滤、端点继承和 localStorage 持久化功能 (Requirements 1.1, 1.2, 2.1, 3.1, 4.1, 5.5, 6.2) |
| custom-model-manager.test.ts | 自定义模型管理器属性测试，验证模型添加后可检索 (Property 1)、模型验证正确性 (Property 2)、模型编辑正确性 (Property 3)、模型删除正确性 (Property 4)、持久化往返一致性 (Property 5)、搜索过滤正确性 (Property 6)、端点继承正确性 (Property 7) |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
