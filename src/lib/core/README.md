# Core Module (lib/core)

核心渲染模块，包含 LLM2UI 系统的核心功能。

## 目录用途

此目录包含 UI Schema 渲染系统的核心模块：

- **组件注册与管理** - 组件注册表和目录
- **渲染引擎** - UISchema 到 React 组件的渲染
- **验证系统** - JSON 和 Schema 结构验证
- **数据绑定** - 表达式解析和数据绑定
- **事件处理** - 组件事件处理
- **序列化** - Schema 的序列化/反序列化

## 文件索引

| 文件 | 描述 |
|------|------|
| `component-registry.ts` | 组件注册表，管理组件定义、版本、平台支持 |
| `component-catalog.ts` | 组件目录，提供类型验证、别名解析、元数据导出 |
| `renderer.tsx` | 核心渲染器，将 UISchema 渲染为 React 组件 |
| `validation.ts` | Schema 验证，包括 JSON 语法和结构验证 |
| `schema-fixer.ts` | Schema 自动修复，修复常见错误 |
| `data-binding.ts` | 数据绑定系统，解析和解析绑定表达式 |
| `event-handler.ts` | 事件处理工具，处理组件事件和动作分发 |
| `serialization.ts` | 序列化/反序列化，Schema 的 JSON 转换 |
| `shadcn-components.ts` | shadcn-ui v4 组件注册，包含 100+ 组件（Button, Card, Table, Dialog, Sheet, Tabs, Icon, Empty, Spinner 等），支持 data-slot 属性 |
| `index.ts` | 模块导出入口 |

## 使用示例

```typescript
import {
  ComponentRegistry,
  defaultRegistry,
  render,
  validateUISchema,
  resolveBindings,
} from '@/lib/core';

// 注册组件
defaultRegistry.register({
  name: 'MyComponent',
  component: MyComponent,
  category: 'display',
});

// 验证 Schema
const result = validateUISchema(schema);
if (result.valid) {
  // 渲染 Schema
  const element = render(result.schema);
}

// 解析数据绑定
const resolved = resolveBindings('Hello {{user.name}}', { user: { name: 'World' } });
// => 'Hello World'
```

## 依赖关系

```
component-registry.ts
       ↓
component-catalog.ts → validation.ts
       ↓                    ↓
   renderer.tsx ←── schema-fixer.ts
       ↓
data-binding.ts
       ↓
event-handler.ts
```

## 相关需求

- Requirements 1.1, 1.3: Lib 目录按领域拆分
- Requirements 7.1, 7.2: 测试文件组织
- Requirements 8.4: 文档同步更新
