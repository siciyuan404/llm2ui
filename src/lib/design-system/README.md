# design-system

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

设计系统模块，包含 Design Tokens 定义、Token 使用映射、组件 Token 映射、Token 合规验证、约束注入和验证链等功能。
这些模块为 LLM Agent 提供设计系统约束，确保生成的 UI 符合设计规范。

### 架构关系

```
Design Tokens (原子级)
       ↓
TokenUsageRegistry (Token 使用映射)
       ↓
ComponentMappingRegistry (组件 Token 映射)
       ↓
Components (分子级)
       ↓
ConstraintInjector (约束注入到 LLM Prompt)
       ↓
ValidationChain (多层验证)
       ↓
TokenComplianceValidator (验证生成结果)
```

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 统一导出入口，汇总所有设计系统模块的公共 API |
| design-tokens.ts | Design Tokens 定义和格式化，包含颜色、间距、字体、阴影、圆角、断点等配置 (Requirements 1.1-1.6, 7.1-7.2) |
| design-tokens.test.ts | Design Tokens 属性测试，验证 Token 约束注入完整性 (Property 8) |
| token-usage-registry.ts | Token 使用映射注册表，定义 Token 在哪些 Components 的哪些 Props 中可用 (Requirements 1.1-1.6) |
| token-usage-registry.test.ts | Token 使用映射属性测试，验证 Category Completeness (Property 1)、Field Validity (Property 2)、Component Coverage (Property 3)、LLM Format Inclusion (Property 4) |
| component-mapping-registry.ts | 组件 Token 映射注册表，定义组件的每个 Prop 应该使用哪些 Tokens (Requirements 2.1-2.7) |
| component-mapping-registry.test.ts | 组件 Token 映射属性测试，验证 Completeness (Property 5)、Field Validity (Property 6)、Enum Prop Token Mapping (Property 7)、LLM Format Inclusion (Property 8) |
| token-compliance-validator.ts | Token 合规验证器，检测硬编码值并生成 Token 替换建议，计算合规分数 (Requirements 5.1-5.6) |
| token-compliance-validator.test.ts | Token 合规验证器属性测试，验证 Hardcoded Value Detection (Property 17)、Suggestion Generation (Property 18)、Compliance Score Calculation (Property 19) |
| constraint-injector.ts | 约束注入器，将设计约束注入到 LLM 提示词中 (Requirements 7.1-7.6, 4.1-4.6) |
| constraint-injector.test.ts | 约束注入器属性测试，验证 Design Tokens 约束注入完整性 (Property 8) |
| validation-chain.ts | 验证链模块，按顺序执行多层验证流程 (Requirements 5.1, 8.1-8.8) |
| validation-chain.test.ts | 验证链属性测试，验证验证链顺序执行 (Property 2)、错误路径准确性 (Property 3)、错误建议有效性 (Property 4) |
| emoji-validator.ts | Emoji 检测和 Icon 合规验证模块，检测 UISchema 中的 emoji 并建议使用 Icon 组件替代 (Requirements 1.1-1.5) |
| icon-compliance-validator.test.ts | Icon 合规验证器属性测试，验证 Emoji 检测完整性 (Property 1)、Emoji 到 Icon 映射正确性 (Property 2) |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
