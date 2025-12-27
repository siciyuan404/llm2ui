# 需求文档

## 简介

本功能旨在优化 LLM2UI 系统中 Agent 的输出质量和一致性。参考 Google A2UI 项目的设计理念，通过建立组件目录单一数据源、强化 Schema 验证、优化系统提示词和添加输出修复机制，确保 Agent 生成的 UI Schema 符合预定义的组件规范，减少无效输出和渲染错误。

### 当前项目现状

- `ComponentRegistry` 已支持多平台、版本管理、分类搜索和 `PropSchema` 定义
- `shadcn-components.ts` 注册了组件但与系统提示词 (`llm-providers.ts`) 不同步
- `validation.ts` 只验证 JSON 结构，不验证组件类型和属性约束
- 缺少自动修复机制和流式验证能力

### A2UI 设计参考

- **标准组件目录**: JSON Schema 定义组件，作为验证和提示词的单一数据源
- **消息协议**: 结构化的 createSurface/updateComponents/updateDataModel 消息
- **Prompt Engineering**: Schema 注入 + Few-shot 示例 + 负面示例
- **验证重试**: jsonschema 验证失败时自动重试

## 术语表

- **Component_Catalog**: 组件目录模块，整合现有 `ComponentRegistry` 的组件定义，作为验证和提示词生成的单一数据源
- **Schema_Validator**: Schema 验证器，扩展现有 `validation.ts`，增加组件类型和属性约束验证
- **Schema_Fixer**: Schema 修复器，尝试自动修复常见的 Schema 错误
- **Prompt_Generator**: 提示词生成器，从 Component_Catalog 动态生成系统提示词，替代硬编码的 `DEFAULT_SYSTEM_PROMPT`
- **Streaming_Validator**: 流式验证器，在流式响应过程中进行实时验证
- **Type_Alias_Map**: 类型别名映射，定义常见的组件类型别名（如 btn → button）

## 需求列表

### 需求 1: 组件目录单一数据源

**用户故事:** 作为开发者，我希望有一个组件定义的单一数据源，以便验证规则和系统提示词始终与已注册的组件保持同步。

#### 验收标准

1. Component_Catalog 应当与现有 ComponentRegistry 集成，获取所有已注册的组件定义
2. Component_Catalog 应当提供方法导出组件元数据，包括 name、category、description、propsSchema 和 examples
3. Component_Catalog 应当维护一个从注册表派生的有效组件类型名称规范列表
4. 当组件在 ComponentRegistry 中注册或注销时，Component_Catalog 应当自动反映该变化
5. Component_Catalog 应当提供 Type_Alias_Map 用于常见别名（如 "btn" → "Button"、"div" → "Container"、"img" → "Image"）
6. Component_Catalog 应当导出一个函数，用于检查组件类型是否有效或是否有已知别名

### 需求 2: 强化 Schema 验证

**用户故事:** 作为系统，我希望严格验证 LLM 输出是否符合组件定义，以便在渲染前拒绝无效的 Schema。

#### 验收标准

1. 当验证 UISchema 时，Schema_Validator 应当检查所有组件类型是否存在于 Component_Catalog 中或具有有效别名
2. 当验证 UISchema 时，Schema_Validator 应当验证每个组件的必填属性（propsSchema 中标记为 required: true）是否存在
3. 当验证 UISchema 时，Schema_Validator 应当验证属性值是否匹配其定义的类型（string、number、boolean、object、array）
4. 当验证 UISchema 时，Schema_Validator 应当验证枚举属性值是否在允许的值列表中
5. 当组件类型不在目录中且没有别名时，Schema_Validator 应当返回错误码 "UNKNOWN_COMPONENT" 并列出有效类型
6. 当必填属性缺失时，Schema_Validator 应当返回错误码 "MISSING_REQUIRED_PROP"
7. 当属性值类型错误时，Schema_Validator 应当返回错误码 "INVALID_PROP_TYPE" 和期望的类型
8. 当枚举属性值无效时，Schema_Validator 应当返回错误码 "INVALID_ENUM_VALUE" 和允许的值列表

### 需求 3: 优化系统提示词

**用户故事:** 作为开发者，我希望系统提示词能从组件目录动态生成，以便 LLM 始终接收准确且最新的组件信息。

#### 验收标准

1. Prompt_Generator 应当从 Component_Catalog 生成按类别分组的组件文档
2. Prompt_Generator 应当将有效组件类型的完整列表作为明确约束包含在内
3. Prompt_Generator 应当为每个组件包含属性 schema，包括类型、必填标志和枚举值
4. Prompt_Generator 应当包含至少一个展示正确 UISchema 格式的正面示例
5. Prompt_Generator 应当包含展示常见错误的负面示例（未知组件类型、缺少必填属性、无效枚举值）
6. Prompt_Generator 应当生成与现有 DEFAULT_SYSTEM_PROMPT 相同语言（中文）的输出
7. 当 Component_Catalog 变化时，调用 Prompt_Generator 应当无需代码更改即可生成更新后的提示词

### 需求 4: Schema 自动修复

**用户故事:** 作为用户，我希望系统能自动尝试修复小的 Schema 错误，以便 LLM 的小失误不会导致完全失败。

#### 验收标准

1. 当 UISchema 缺少 version 字段时，Schema_Fixer 应当添加默认版本 "1.0"
2. 当组件类型在 Type_Alias_Map 中有已知别名时，Schema_Fixer 应当将其替换为规范类型名称
3. 当组件缺少 id 字段时，Schema_Fixer 应当使用模式 "{type}-{random}" 生成唯一 id
4. 当组件类型使用错误的大小写（如 "BUTTON" 或 "button"）时，Schema_Fixer 应当规范化为已注册的大小写形式
5. Schema_Fixer 应当返回包含以下内容的 FixResult：fixed（布尔值）、schema（如果已修复）和 fixes（已应用修复的描述数组）
6. Schema_Fixer 应当递归修复所有嵌套的子组件
7. 如果 Schema 无法修复到通过验证，Schema_Fixer 应当返回 fixed: false 和剩余的验证错误

### 需求 5: 流式验证

**用户故事:** 作为用户，我希望在流式传输过程中看到验证警告，以便尽早知道 LLM 输出是否有问题。

#### 验收标准

1. Streaming_Validator 应当提供 feed(chunk: string) 方法来接收流式数据块
2. 当在流中检测到 "type": "xxx" 模式时，Streaming_Validator 应当检查 xxx 是否为有效的组件类型
3. 当在流式传输过程中检测到未知组件类型时，Streaming_Validator 应当将其添加到 warnings 数组而不阻塞
4. Streaming_Validator 应当提供 getWarnings() 方法来获取当前警告
5. Streaming_Validator 应当提供 reset() 方法来清除状态以用于新的流
6. 当流式传输完成时，Streaming_Validator 应当提供 finalize() 方法返回完整的验证结果

### 需求 6: 验证结果增强

**用户故事:** 作为开发者，我希望获得带有建议的详细验证结果，以便我能轻松理解和修复 Schema 问题。

#### 验收标准

1. Schema_Validator 应当返回包含以下字段的 ValidationError 对象：path、message、code、severity 和 suggestion
2. 当组件类型未知时，suggestion 字段应当包含基于 Levenshtein 距离的最多 3 个相似的有效类型
3. 当属性值无效时，suggestion 字段应当显示期望的类型或有效枚举值列表
4. Schema_Validator 应当按严重程度分类错误："error" 表示阻塞性问题，"warning" 表示非阻塞性问题
5. 当使用已弃用的组件时，Schema_Validator 应当返回带有来自 ComponentRegistry 的弃用消息的警告

### 需求 7: 集成与兼容性

**用户故事:** 作为开发者，我希望新的验证系统能与现有代码无缝集成，以便我不需要重写应用程序。

#### 验收标准

1. Schema_Validator 增强函数应当与现有 validateUISchema 签名向后兼容
2. Prompt_Generator 输出应当可作为 DEFAULT_SYSTEM_PROMPT 的直接替代品使用
3. Component_Catalog 应当与现有 defaultRegistry 配合工作，无需迁移
4. Schema_Fixer 应当可从 llm-service.ts 中的 extractUISchema 调用，在返回前自动修复
5. 当禁用验证时，系统应当回退到当前行为（仅结构验证）
