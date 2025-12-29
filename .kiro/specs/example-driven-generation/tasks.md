# 实现计划：案例驱动生成

## 概述

本实现计划将案例驱动生成功能分解为可执行的编码任务。实现顺序遵循依赖关系：先建立基础设施（标签体系），再构建核心模块（案例库、检索器、注入器），最后集成到现有系统。

## 任务列表

- [x] 1. 实现标签体系模块
  - [x] 1.1 创建 `src/lib/example-tags.ts` 文件，定义标准分类和标签
    - 定义 `ExampleCategory` 类型
    - 定义 `STANDARD_TAGS` 常量
    - 实现 `getStandardCategories()` 函数
    - 实现 `getStandardTags()` 函数
    - 实现 `isStandardCategory()` 函数
    - 实现 `isStandardTag()` 函数
    - 实现 `validateCategory()` 函数
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 1.2 编写标签体系单元测试
    - 测试标准分类和标签的获取
    - 测试分类验证逻辑
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. 实现预设案例数据
  - [x] 2.1 创建 `src/lib/preset-examples.ts` 文件，定义系统预设案例
    - 定义 `ExampleMetadata` 接口
    - 实现 layout 类别案例：Admin 侧边栏、顶部导航栏、三栏布局、响应式容器
    - 实现 form 类别案例：登录表单、注册表单、搜索表单、设置表单
    - 实现 navigation 类别案例：面包屑导航、标签页导航、步骤导航
    - 实现 dashboard 类别案例：数据卡片组、统计面板、列表页面
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.2 编写预设案例属性测试
    - **Property 11: 预设案例完整性**
    - **Validates: Requirements 4.5, 4.6**

- [x] 3. 实现案例库模块
  - [x] 3.1 创建 `src/lib/example-library.ts` 文件，实现 ExampleLibrary 类
    - 实现从 ComponentRegistry 加载组件 examples
    - 实现从 CustomExamplesStorage 加载用户自定义案例
    - 实现从 PresetExamples 加载系统预设案例
    - 实现 `getAll()` 方法
    - 实现 `getById()` 方法
    - 实现 `getByCategory()` 方法
    - 实现 `getAllByCategory()` 方法
    - 实现 `filterByTags()` 方法
    - 实现 `search()` 方法
    - 实现 `refresh()` 方法
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 3.2 编写案例库属性测试 - 数据聚合
    - **Property 1: 数据聚合完整性**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 3.3 编写案例库属性测试 - 分类分组
    - **Property 2: 分类分组正确性**
    - **Validates: Requirements 1.4**

  - [x] 3.4 编写案例库属性测试 - 标签筛选
    - **Property 3: 标签筛选正确性**
    - **Validates: Requirements 1.5**

  - [x] 3.5 编写案例库属性测试 - 全文搜索
    - **Property 4: 全文搜索正确性**
    - **Validates: Requirements 1.6**

- [x] 4. 检查点 - 案例库完成
  - 确保所有测试通过，如有问题请询问用户

- [x] 5. 实现案例检索器模块
  - [x] 5.1 创建 `src/lib/example-retriever.ts` 文件，实现 ExampleRetriever 类
    - 定义 `RetrievalOptions` 接口
    - 定义 `RetrievalResult` 接口
    - 定义 `KeywordMapping` 接口
    - 实现关键词匹配算法
    - 实现相关度评分算法
    - 实现 `retrieve()` 方法
    - 实现 `addKeywordMapping()` 方法
    - 实现 `getKeywordMappings()` 方法
    - 添加默认关键词映射（侧边栏、后台、admin 等）
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 5.2 编写检索器属性测试 - 结果排序
    - **Property 5: 检索结果排序**
    - **Validates: Requirements 2.1**

  - [x] 5.3 编写检索器属性测试 - 关键词匹配
    - **Property 6: 关键词匹配正确性**
    - **Validates: Requirements 2.2**

  - [x] 5.4 编写检索器属性测试 - 结果限制
    - **Property 7: 结果数量限制**
    - **Validates: Requirements 2.3**

  - [x] 5.5 编写检索器属性测试 - 分类过滤
    - **Property 8: 分类过滤正确性**
    - **Validates: Requirements 2.4**

  - [x] 5.6 编写检索器单元测试 - 关键词映射
    - 测试侧边栏关键词映射
    - 测试后台/admin 关键词映射
    - _Requirements: 2.5, 2.6_

- [x] 6. 实现案例注入器模块
  - [x] 6.1 创建 `src/lib/example-injector.ts` 文件，实现 ExampleInjector 类
    - 定义 `InjectionOptions` 接口
    - 实现 `format()` 方法
    - 实现 `getDefaultExamples()` 方法
    - 实现 `generateGuidance()` 方法
    - 支持中英文输出
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 6.2 编写注入器属性测试 - 格式完整性
    - **Property 9: 案例注入格式完整性**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 6.3 编写注入器属性测试 - 开关有效性
    - **Property 10: 注入开关有效性**
    - **Validates: Requirements 3.6**

  - [x] 6.4 编写注入器单元测试 - 默认案例
    - 测试空输入时使用默认案例
    - _Requirements: 3.5_

- [x] 7. 检查点 - 核心模块完成
  - 确保所有测试通过，如有问题请询问用户

- [x] 8. 集成到 PromptGenerator
  - [x] 8.1 扩展 `src/lib/prompt-generator.ts`
    - 扩展 `PromptGeneratorOptions` 接口，添加 `includeRelevantExamples` 和 `userInput` 选项
    - 修改 `generateSystemPrompt()` 函数，集成案例检索和注入
    - 确保提示词结构顺序正确：系统介绍 → 组件文档 → 参考案例 → 格式要求 → 负面示例
    - 保持向后兼容：当 `includeRelevantExamples` 为 false 时使用原有行为
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 8.2 编写 PromptGenerator 属性测试 - 结构正确性
    - **Property 12: 提示词结构正确性**
    - **Validates: Requirements 5.3, 5.4, 5.5**

  - [x] 8.3 编写 PromptGenerator 属性测试 - 向后兼容
    - **Property 13: 向后兼容性**
    - **Validates: Requirements 5.6**

- [x] 9. 集成到 LLMService
  - [x] 9.1 扩展 `src/lib/llm-service.ts`
    - 扩展 `LLMConfig` 接口，添加 `enableExampleEnhancement` 选项
    - 修改 `sendMessage()` 函数，在发送前生成包含相关案例的系统提示词
    - 实现系统提示词缓存机制
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 9.2 编写 LLMService 单元测试
    - 测试案例增强配置
    - 测试提示词缓存
    - _Requirements: 6.3, 6.5_

- [x] 10. 更新模块导出
  - [x] 10.1 更新 `src/lib/index.ts`
    - 导出 ExampleLibrary 类和相关类型
    - 导出 ExampleRetriever 类和相关类型
    - 导出 ExampleInjector 类和相关类型
    - 导出标签体系工具函数
    - _Requirements: 全部_

- [x] 11. 最终检查点
  - 确保所有测试通过，如有问题请询问用户

## 注意事项

- 所有任务（包括测试任务）都必须完成
- 每个属性测试应至少运行 100 次迭代
- 属性测试使用 fast-check 库
- 所有新文件需要添加文件头注释和更新相关 README.md
