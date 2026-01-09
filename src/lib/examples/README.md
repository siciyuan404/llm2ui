# examples

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

案例系统模块，提供案例驱动生成功能的核心组件。该模块管理系统预设案例、用户自定义案例的存储和检索，支持基于用户输入的智能案例匹配和注入到 LLM 提示词中。

### 主题隔离架构

**重要变更**：主题特定的案例已迁移到各自的主题目录，实现主题自包含性：

- **shadcn 案例**: `src/lib/themes/builtin/shadcn/examples/`
- **Cherry 案例**: `src/lib/themes/builtin/cherry/examples/`
- **Discord 案例**: `src/lib/themes/builtin/discord/examples/`

本目录现在只包含：
- 核心功能模块（标签体系、存储、检索、注入等）
- 向后兼容的重新导出（从主题目录导入并重新导出）

### 核心功能

- **案例标签体系** - 标准化的分类和标签系统
- **案例存储** - 用户自定义案例的管理
- **案例检索** - 基于关键词和相关度的智能检索
- **案例注入** - 将检索到的案例格式化并注入到 LLM 提示词
- **组成分析** - 分析案例的组件和 Token 使用情况

### 模块关系

```
example-tags.ts (标签体系定义)
       ↓
[主题目录]/examples/ (主题特定案例)
custom-examples-storage.ts (用户自定义案例)
       ↓
example-library.ts (统一案例库)
       ↓
example-retriever.ts (智能检索)
       ↓
example-injector.ts (提示词注入)
       ↓
example-composition-analyzer.ts (组成分析)
```

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 统一导出入口，汇总所有案例模块的公共 API，并从主题目录重新导出案例以保持向后兼容 |
| example-tags.ts | 案例标签体系模块，定义标准分类（layout、form、navigation、dashboard、display、feedback）和标签，提供验证和查询功能 (Requirements 7.1-7.5) |
| example-tags.test.ts | 案例标签体系单元测试，验证标准分类和标签的获取、分类验证逻辑 |
| custom-examples-storage.ts | 自定义案例存储，使用 localStorage 管理用户提交的组件案例，提供 CRUD 操作和搜索功能 (Requirements 11.5) |
| custom-examples-storage.test.ts | 自定义案例存储单元测试，验证 CRUD 操作和搜索功能 |
| example-composition-analyzer.ts | 案例组成分析器，分析 UISchema 的组成结构，提取使用的组件类型和 Token 引用 (Requirements 3.1-3.6) |
| example-composition-analyzer.test.ts | 案例组成分析器属性测试，验证 ExampleComposition Completeness (Property 9)、Field Validity (Property 10)、Auto-Generation Round Trip (Property 11)、Content Completeness (Property 12) |
| example-library.ts | 案例库模块，统一管理所有 UI 案例（系统预设、用户自定义、组件注册表），提供分类、标签筛选、搜索等功能 (Requirements 1.1-1.6) |
| example-library.test.ts | 案例库属性测试，验证数据聚合完整性 (Property 1)、分类分组正确性 (Property 2)、标签筛选正确性 (Property 3)、全文搜索正确性 (Property 4) |
| example-retriever.ts | 案例检索器模块，根据用户输入检索相关案例，支持关键词匹配、相关度排序、分类过滤、多样性过滤 (Requirements 2.1-2.6, 4.3) |
| example-retriever.test.ts | 案例检索器属性测试，验证检索结果排序 (Property 5)、关键词匹配正确性 (Property 6)、结果数量限制 (Property 7)、分类过滤正确性 (Property 8) |
| diversity-filter.ts | 多样性过滤器模块，确保检索结果的多样性，避免返回过于相似的案例 (Requirements 4.1-4.5) |
| diversity-filter.test.ts | 多样性过滤器属性测试，验证多样性过滤约束 (Property 5)、多样性阈值行为 (Property 6)、多样性分数计算 (Property 7) |
| example-injector.ts | 案例注入器模块，将检索到的案例格式化并注入到 LLM 提示词中，支持中英文输出 (Requirements 3.1-3.6) |
| example-injector.test.ts | 案例注入器属性测试，验证案例注入格式完整性 (Property 9)、注入开关有效性 (Property 10) |
| config/ | 配置模块目录，包含关键词映射配置和配置加载器 |
| example-validator.ts | 案例验证器模块，验证案例有效性和计算质量评分 (Requirements 6.1-6.6, 8.1-8.2) |
| example-validator.test.ts | 案例验证器属性测试，验证 Validation Completeness (Property 9)、Quality Score Calculation (Property 10) |
| example-registry.ts | 案例注册中心模块，单例模式管理所有 UI 案例，提供注册、查询、排名功能 (Requirements 5.1-5.6, 8.3-8.4) |
| example-registry.test.ts | 案例注册中心属性测试，验证 Registration with Validation (Property 8)、Top Examples Ranking (Property 11) |
| example-collections.ts | 案例集合模块，按功能领域组织案例分组，提供工厂函数创建各类集合 (Requirements 7.1-7.5) |
| example-collections.test.ts | 案例集合属性测试，验证 Backward Compatibility (Property 12) |
| retrieval/ | 语义检索模块目录，包含 Embedding 提供者和语义检索器 |

### 已迁移的文件（向后兼容重新导出）

以下案例文件已迁移到主题目录，但通过 `index.ts` 重新导出以保持向后兼容：

| 原文件 | 新位置 |
|--------|--------|
| preset-examples.ts | `src/lib/themes/builtin/shadcn/examples/presets.ts` |
| cherry-patterns.ts | `src/lib/themes/builtin/cherry/examples/patterns.ts` |
| cherry-patterns-extended.ts | `src/lib/themes/builtin/cherry/examples/extended.ts` |
| cherry-primitives.ts | `src/lib/themes/builtin/cherry/examples/primitives.ts` |

## 导出的类型

### ExampleCategory
案例分类类型：`'layout' | 'form' | 'navigation' | 'dashboard' | 'display' | 'feedback'`

### ExampleMetadata
案例元数据接口，包含 id、title、description、category、tags、schema、source 字段

### RetrievalResult
检索结果接口，包含 example、score、matchedKeywords 字段

### InjectionOptions
注入选项接口，包含 enabled、language、includeSchema 字段

## 使用示例

```typescript
import {
  ExampleLibrary,
  ExampleRetriever,
  ExampleInjector,
  createExampleLibrary,
  createExampleRetriever,
  createExampleInjector,
} from './examples';

// 创建案例库
const library = createExampleLibrary();

// 创建检索器
const retriever = createExampleRetriever(library);

// 检索相关案例
const results = retriever.retrieve('后台管理侧边栏', {
  maxResults: 3,
  category: 'layout',
});

// 创建注入器
const injector = createExampleInjector();

// 格式化案例用于 LLM 提示词
const examples = results.map(r => r.example);
const formattedExamples = injector.format(examples, {
  language: 'zh',
  includeSchema: true,
});
```

## Cherry Studio 扩展案例

Cherry Studio 扩展案例已迁移到 `src/lib/themes/builtin/cherry/examples/`。

详细文档请参考：
- `src/lib/themes/builtin/cherry/examples/extended.ts` - 33 个高保真 UI 案例
- `src/lib/themes/builtin/cherry/examples/patterns.ts` - 基础模式案例
- `src/lib/themes/builtin/cherry/examples/primitives.ts` - 原子级组件案例

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。


## 语义检索模块

语义检索模块 (`retrieval/`) 提供基于 Embedding 的案例匹配功能。

### 功能特点

- **简单词向量**: 基于词频和 TF-IDF 的轻量级 Embedding 实现
- **混合检索**: 支持关键词 (40%) + 语义 (60%) 的混合模式
- **Embedding 缓存**: 预计算并缓存案例 Embedding，提升检索性能
- **余弦相似度**: 使用余弦相似度计算语义匹配分数

### 使用示例

```typescript
import { SemanticRetriever, createSemanticRetriever } from './examples';

// 创建语义检索器
const retriever = createSemanticRetriever({
  keywordWeight: 0.4,
  semanticWeight: 0.6,
  cacheEmbeddings: true,
});

// 注册案例
retriever.registerExamples([
  { id: 'login', title: 'Login Form', description: 'User authentication form' },
  { id: 'dashboard', title: 'Dashboard', description: 'Main dashboard layout' },
]);

// 预计算 Embedding
await retriever.precomputeEmbeddings();

// 检索相关案例
const results = await retriever.retrieve('user login authentication', {
  limit: 5,
  minScore: 0.3,
  hybrid: true,
});

console.log(results);
// [{ id: 'login', title: 'Login Form', score: 0.85, keywordScore: 0.9, semanticScore: 0.82 }]
```

### 文件结构

```
retrieval/
├── index.ts              # 模块导出
├── types.ts              # 类型定义
├── embedding-provider.ts # Embedding 提供者接口
├── simple-embedding.ts   # 简单词向量实现
├── semantic-retriever.ts # 语义检索器
└── semantic-retriever.test.ts # 单元测试
```
