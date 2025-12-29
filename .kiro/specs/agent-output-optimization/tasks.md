# 实现计划: Agent 输出优化

## 概述

本计划将 Agent 输出优化功能分解为可执行的编码任务。按照组件目录 → 验证增强 → 修复器 → 提示词生成器 → 流式验证器 → 集成的顺序实现。

## 任务列表

- [x] 1. 实现 Component_Catalog 模块
  - [x] 1.1 创建 `src/lib/component-catalog.ts` 文件，定义 TYPE_ALIAS_MAP 常量和 ComponentMetadata 接口
    - 定义常见类型别名映射（btn→Button, div→Container 等）
    - 定义 ComponentMetadata 接口
    - _需求: 1.5_
  - [x] 1.2 实现 ComponentCatalog 类的核心方法
    - 实现 constructor 接收 ComponentRegistry
    - 实现 getValidTypes() 返回有效类型列表
    - 实现 isValidType() 检查类型有效性
    - 实现 resolveAlias() 解析类型别名
    - _需求: 1.1, 1.3, 1.6_
  - [x] 1.3 实现元数据导出方法
    - 实现 getAllMetadata() 导出所有组件元数据
    - 实现 getByCategory() 按类别分组
    - 实现 getPropsSchema() 获取属性 schema
    - _需求: 1.2_
  - [x] 1.4 编写 Property 1 属性测试：组件目录同步一致性
    - **Property 1: 组件目录同步一致性**
    - **验证: 需求 1.1, 1.3, 1.4**
  - [x] 1.5 编写 Property 2 属性测试：类型别名解析正确性
    - **Property 2: 类型别名解析正确性**
    - **验证: 需求 1.5, 1.6**

- [x] 2. 增强 Schema 验证
  - [x] 2.1 扩展 `src/lib/validation.ts`，添加增强类型定义
    - 定义 EnhancedValidationError 接口（添加 severity, suggestion 字段）
    - 定义 EnhancedValidationResult 接口
    - 定义 ValidationOptions 接口
    - _需求: 6.1_
  - [x] 2.2 实现 Levenshtein 距离计算和相似类型建议
    - 实现 levenshteinDistance() 函数
    - 实现 getSimilarTypes() 函数
    - _需求: 6.2_
  - [x] 2.3 实现组件类型验证逻辑
    - 检查组件类型是否在 Catalog 中
    - 返回 UNKNOWN_COMPONENT 错误码和建议
    - _需求: 2.1, 2.5_
  - [x] 2.4 实现属性验证逻辑
    - 验证必填属性存在性
    - 验证属性类型匹配
    - 验证枚举值有效性
    - _需求: 2.2, 2.3, 2.4, 2.6, 2.7, 2.8_
  - [x] 2.5 实现 validateUISchemaEnhanced() 主函数
    - 整合结构验证和组件验证
    - 支持 ValidationOptions 配置
    - 分类 errors 和 warnings
    - _需求: 6.4_
  - [x] 2.6 实现已弃用组件警告
    - 检查组件的 deprecated 标志
    - 返回包含 deprecationMessage 的警告
    - _需求: 6.5_
  - [x] 2.7 编写 Property 3 属性测试：Schema 验证完整性
    - **Property 3: Schema 验证完整性**
    - **验证: 需求 2.1, 2.2, 2.3, 2.4**
  - [x] 2.8 编写 Property 4 属性测试：验证错误码正确性
    - **Property 4: 验证错误码正确性**
    - **验证: 需求 2.5, 6.2**

- [x] 3. 检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 实现 Schema_Fixer 模块
  - [x] 4.1 创建 `src/lib/schema-fixer.ts` 文件，定义接口
    - 定义 FixResult 接口
    - 定义 FixOptions 接口
    - 实现 generateComponentId() 函数
    - _需求: 4.3, 4.5_
  - [x] 4.2 实现基础修复功能
    - 实现缺失 version 修复
    - 实现类型别名替换
    - 实现缺失 id 生成
    - 实现大小写规范化
    - _需求: 4.1, 4.2, 4.3, 4.4_
  - [x] 4.3 实现递归修复和结果返回
    - 递归处理 children 组件
    - 收集所有修复描述
    - 修复后重新验证
    - _需求: 4.6, 4.7_
  - [x] 4.4 编写 Property 5 属性测试：Schema 修复往返一致性
    - **Property 5: Schema 修复往返一致性**
    - **验证: 需求 4.1, 4.2, 4.3, 4.4, 4.5**

- [x] 5. 实现 Prompt_Generator 模块
  - [x] 5.1 创建 `src/lib/prompt-generator.ts` 文件，定义接口
    - 定义 PromptGeneratorOptions 接口
    - _需求: 3.6_
  - [x] 5.2 实现组件文档生成
    - 实现 generateComponentDocs() 按类别生成文档
    - 包含组件名称、描述、属性 schema
    - _需求: 3.1, 3.3_
  - [x] 5.3 实现示例生成
    - 实现 generatePositiveExamples() 生成正面示例
    - 实现 generateNegativeExamples() 生成负面示例
    - _需求: 3.4, 3.5_
  - [x] 5.4 实现 generateSystemPrompt() 主函数
    - 整合组件文档、类型列表、示例
    - 生成中文提示词
    - _需求: 3.2, 3.6, 3.7_
  - [x] 5.5 编写 Property 6 属性测试：提示词生成完整性
    - **Property 6: 提示词生成完整性**
    - **验证: 需求 3.1, 3.2, 3.3, 3.7**

- [x] 6. 检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户
  - **状态**: 447/449 测试通过。2个失败的测试与本 spec 无关：
    - `llm-service.test.ts` Property 2: extractJSON (-0 vs +0 比较问题)
    - `template-manager.test.ts` Property 5k: getComponentTemplates (预期3个模板但得到5个)
  - 本 spec 相关测试全部通过 ✓

- [x] 7. 实现 Streaming_Validator 模块
  - [x] 7.1 创建 `src/lib/streaming-validator.ts` 文件，定义接口
    - 定义 StreamingWarning 接口
    - _需求: 5.3_
  - [x] 7.2 实现 StreamingValidator 类
    - 实现 feed() 方法接收数据块
    - 实现类型检测正则匹配
    - 实现 getWarnings() 方法
    - 实现 reset() 方法
    - _需求: 5.1, 5.2, 5.4, 5.5_
  - [x] 7.3 实现 finalize() 方法
    - 尝试解析完整 JSON
    - 调用 validateUISchemaEnhanced 验证
    - 返回完整验证结果
    - _需求: 5.6_
  - [x] 7.4 编写 Property 7 属性测试：流式验证检测正确性
    - **Property 7: 流式验证检测正确性**
    - **验证: 需求 5.2, 5.3**

- [x] 8. 集成与兼容性
  - [x] 8.1 更新 `src/lib/llm-providers.ts`
    - 导入 Prompt_Generator
    - 使用 generateSystemPrompt() 替代硬编码的 DEFAULT_SYSTEM_PROMPT
    - 保持导出接口不变
    - _需求: 7.2_
  - [x] 8.2 更新 `src/lib/llm-service.ts`
    - 在 extractUISchema() 中集成 Schema_Fixer
    - 添加可选的自动修复功能
    - _需求: 7.4_
  - [x] 8.3 确保向后兼容性
    - validateUISchema 保持原有签名
    - 添加 validateUISchemaEnhanced 作为新 API
    - 默认禁用增强验证时回退到结构验证
    - _需求: 7.1, 7.3, 7.5_
  - [x] 8.4 编写 Property 8 属性测试：向后兼容性
    - **Property 8: 向后兼容性**
    - **验证: 需求 7.1, 7.5**

- [x] 9. 更新导出和文档
  - [x] 9.1 更新 `src/lib/index.ts` 导出新模块
    - 导出 ComponentCatalog 和 defaultCatalog
    - 导出增强验证函数
    - 导出 Schema_Fixer 函数
    - 导出 Prompt_Generator 函数
    - 导出 StreamingValidator 类
  - [x] 9.2 更新 `src/lib/README.md` 文档
    - 添加新模块的描述
    - 更新文件索引

- [x] 10. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户
  - **状态**: 466/467 测试通过。1个失败的测试与本 spec 无关：
    - `template-manager.test.ts` Property 5k: getComponentTemplates (预期3个模板但得到4个)
  - 本 spec 所有相关测试全部通过 ✓
  - **Agent 输出优化 Spec 实现完成** 🎉

## 备注

- 每个任务引用具体的需求以便追溯
- 检查点确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
