# 需求文档

## 简介

本功能旨在优化 LLM2UI 系统中 Agent 的 UI 生成质量，通过建立案例驱动的生成机制，让 Agent 能够根据用户需求智能选择和参考相关案例，生成更符合预期的 UI Schema。

### 当前问题

- 组件注册时的 `examples` 字段没有被注入到 LLM 提示词中
- LLM 只能看到一个硬编码的登录表单示例，无法参考更多场景
- 用户描述"后台管理侧边栏"时，LLM 无法参考已有的侧边栏案例
- 案例库与提示词生成器之间缺乏连接

### 目标

- 建立案例库作为 LLM 生成 UI 的参考素材
- 实现案例的智能检索和选择
- 将相关案例注入到 LLM 提示词中
- 支持案例的分类、标签和搜索

## 术语表

- **Example_Library**: 案例库，存储和管理所有 UI 案例，包括系统预设案例和用户自定义案例
- **Example_Retriever**: 案例检索器，根据用户输入检索相关案例
- **Example_Injector**: 案例注入器，将检索到的案例注入到 LLM 提示词中
- **Example_Category**: 案例分类，如 layout（布局）、form（表单）、navigation（导航）、dashboard（仪表盘）等
- **Example_Tag**: 案例标签，用于更细粒度的案例检索，如 sidebar、header、carousel、admin 等

## 需求列表

### 需求 1: 案例库管理

**用户故事:** 作为开发者，我希望有一个统一的案例库来管理所有 UI 案例，以便案例能被系统化地存储、检索和使用。

#### 验收标准

1. Example_Library 应当整合 ComponentRegistry 中组件的 examples 字段
2. Example_Library 应当整合 custom-examples-storage 中的用户自定义案例
3. Example_Library 应当为每个案例维护以下元数据：id、title、description、category、tags、schema、source（system/custom）
4. Example_Library 应当提供按 category 分组获取案例的方法
5. Example_Library 应当提供按 tags 筛选案例的方法
6. Example_Library 应当提供全文搜索案例的方法（搜索 title 和 description）

### 需求 2: 案例智能检索

**用户故事:** 作为系统，我希望能根据用户的自然语言描述检索相关案例，以便为 LLM 提供最相关的参考。

#### 验收标准

1. Example_Retriever 应当接收用户输入文本，返回相关度排序的案例列表
2. Example_Retriever 应当支持关键词匹配检索（匹配 title、description、tags）
3. Example_Retriever 应当支持配置返回案例的最大数量（默认 3 个）
4. Example_Retriever 应当支持按 category 过滤检索结果
5. 当用户输入包含"侧边栏"、"sidebar"等关键词时，Example_Retriever 应当优先返回带有相关标签的案例
6. 当用户输入包含"后台"、"admin"、"管理"等关键词时，Example_Retriever 应当优先返回 dashboard 类别的案例

### 需求 3: 案例注入提示词

**用户故事:** 作为开发者，我希望相关案例能自动注入到 LLM 提示词中，以便 LLM 能参考这些案例生成更好的 UI。

#### 验收标准

1. Example_Injector 应当将检索到的案例格式化为 LLM 可理解的文本
2. Example_Injector 应当在系统提示词中添加"参考案例"部分
3. 每个注入的案例应当包含：标题、描述、完整的 UISchema JSON
4. Example_Injector 应当在案例前添加说明文字，指导 LLM 如何参考案例
5. 当没有检索到相关案例时，Example_Injector 应当使用默认的通用案例
6. Example_Injector 应当支持配置是否启用案例注入（默认启用）

### 需求 4: 预设案例库

**用户故事:** 作为用户，我希望系统预置常见的 UI 案例，以便 LLM 能生成常见场景的 UI。

#### 验收标准

1. 系统应当预置以下 layout 类别案例：Admin 侧边栏、顶部导航栏、三栏布局、响应式容器
2. 系统应当预置以下 form 类别案例：登录表单、注册表单、搜索表单、设置表单
3. 系统应当预置以下 navigation 类别案例：面包屑导航、标签页导航、步骤导航
4. 系统应当预置以下 dashboard 类别案例：数据卡片组、统计面板、列表页面
5. 每个预设案例应当包含完整的 title、description、category、tags 和 schema
6. 预设案例应当使用已注册的组件类型，确保可渲染

### 需求 5: Prompt Generator 集成

**用户故事:** 作为开发者，我希望案例检索和注入能与现有的 Prompt Generator 无缝集成，以便不需要大幅修改现有代码。

#### 验收标准

1. Prompt_Generator 应当新增 includeRelevantExamples 选项（默认 true）
2. Prompt_Generator 应当新增 userInput 参数，用于检索相关案例
3. 当 includeRelevantExamples 为 true 且提供 userInput 时，Prompt_Generator 应当调用 Example_Retriever 获取相关案例
4. Prompt_Generator 应当调用 Example_Injector 将案例注入到生成的提示词中
5. 生成的提示词结构应当为：系统介绍 → 组件文档 → 参考案例 → 格式要求 → 负面示例
6. 当 includeRelevantExamples 为 false 时，Prompt_Generator 应当保持现有行为（使用硬编码示例）

### 需求 6: LLM Service 集成

**用户故事:** 作为开发者，我希望 LLM Service 能自动使用案例增强的提示词，以便用户无需额外配置即可获得更好的生成效果。

#### 验收标准

1. LLM_Service 的 sendMessage 方法应当接收用户输入文本
2. LLM_Service 应当在发送请求前调用 Prompt_Generator 生成包含相关案例的系统提示词
3. LLM_Service 应当支持配置是否启用案例增强（通过 LLMConfig）
4. 当启用案例增强时，LLM_Service 应当将用户输入传递给 Prompt_Generator
5. LLM_Service 应当缓存生成的系统提示词，避免重复生成（当组件目录未变化时）

### 需求 7: 案例标签体系

**用户故事:** 作为开发者，我希望有一套标准化的案例标签体系，以便案例能被准确分类和检索。

#### 验收标准

1. 系统应当定义以下标准 category：layout、form、navigation、dashboard、display、feedback
2. 系统应当定义以下标准 tags：sidebar、header、footer、navbar、card、table、list、modal、drawer、carousel、breadcrumb、tabs、steps、search、login、register、settings、profile、admin、mobile、responsive
3. Example_Library 应当验证案例的 category 是否为标准值
4. Example_Library 应当允许自定义 tags，但建议使用标准 tags
5. 系统应当提供获取所有标准 category 和 tags 的方法

