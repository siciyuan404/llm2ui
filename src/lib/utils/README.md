# utils

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

工具模块目录，包含 LLM2UI 系统的通用工具函数和辅助模块：
- 通用工具函数（类名合并、ID 生成）
- 错误处理
- Monaco Editor 配置
- 平台适配器
- 模板管理器
- 图标注册表
- Schema 生成器
- Schema 同步
- 代码导出

所有模块通过 index.ts 统一导出。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 统一导出入口，汇总所有工具模块的公共 API |
| utils.ts | 通用工具函数，cn() 类名合并、generateId() 唯一ID生成等 |
| error-handling.ts | 错误处理模块，网络错误重试、Schema 错误建议、未知组件日志 |
| monaco-config.ts | Monaco Editor 配置，配置使用本地安装而非 CDN 加载 |
| platform-adapter.ts | 平台适配器，处理跨平台组件的属性/样式/事件映射 (Requirements 7.2, 7.4, 7.5) |
| platform-adapter.test.ts | 平台适配器属性测试，验证平台适配映射正确性 (Property 6) |
| template-manager.ts | 模板管理器，支持三层模板架构 (Base → Platform → Theme) (Requirements 9.1-9.4) |
| template-manager.test.ts | 模板管理器属性测试，验证模板合并正确性 (Property 5) |
| icon-registry.ts | 图标注册表，管理图标的注册、分类和搜索，集成 Lucide 图标库 (Requirements 12.1-12.3) |
| icon-registry.test.ts | 图标注册表属性测试，验证图标搜索完整性 (Property 9) |
| schema-generator.ts | Schema 生成器，从组件定义自动生成 A2UI Schema，支持按需加载 (Requirements 8.1-8.4) |
| schema-generator.test.ts | Schema 生成器属性测试，验证 Schema 生成一致性 (Property 4) |
| schema-sync.ts | Schema 同步模块，将 LLM 生成的 UI Schema 同步到 JSON 编辑器和数据绑定编辑器 (Requirements 4.1-4.7) |
| schema-sync.test.ts | Schema 同步属性测试，验证 Schema 同步完整性 (Property 8) 和数据绑定字段保留 (Property 9) |
| export.ts | 导出模块，支持 JSON、Vue3 SFC、React JSX 代码导出 (Requirements 9.2-9.4) |
| export.test.ts | 导出模块属性测试，验证代码导出语法正确性 (Property 8) |

## 模块依赖关系

```
utils.ts (基础工具)
    ↓
error-handling.ts (错误处理)
    ↓
platform-adapter.ts ← component-registry (平台适配)
    ↓
template-manager.ts (模板管理)
    ↓
schema-generator.ts ← component-registry (Schema 生成)
    ↓
schema-sync.ts ← data-binding, validation, llm-service (Schema 同步)
    ↓
export.ts ← serialization (代码导出)
```

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
