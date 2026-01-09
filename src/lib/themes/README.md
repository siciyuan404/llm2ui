# themes

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

多主题系统核心模块，提供完整的主题管理、切换、存储和 LLM 上下文构建功能。
支持内置主题（shadcn-ui、cherry）和社区主题的安装/卸载。

### 核心功能

1. **主题管理** - ThemeManager 单例管理所有主题的注册、切换、事件订阅
2. **主题注册表** - ThemeRegistry 管理主题的安装、卸载、更新检查
3. **主题存储** - ThemeStorage 实现主题数据的本地持久化
4. **主题验证** - validateThemePack 验证主题包的完整性和正确性
5. **上下文构建** - ContextBuilder 根据设置构建 LLM 提示词
6. **令牌合并** - mergeTokens 合并基础令牌和扩展令牌
7. **导入导出** - exportTheme/importTheme 支持主题的序列化和反序列化

### 主题包结构

每个主题包（ThemePack）包含：
- 基础信息：id、name、description、version、author
- 设计令牌：colors、spacing、typography、shadows、radius
- 组件注册：ComponentRegistry 实例
- 案例预设：ExampleMetadata 数组
- 提示词模板：中英文提示词模板
- 配色方案：light/dark 配色
- 布局配置：sidebar、mainContent、previewPanel 配置

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 模块导出入口，统一导出所有主题相关模块、类型和初始化函数 |
| types.ts | 类型定义，ThemePack、ThemeTokens、ContextSettings 等接口 |
| types.test.ts | 类型定义的属性测试 |
| theme-manager.ts | ThemeManager 类，单例模式管理主题注册、切换、事件订阅 |
| theme-manager.test.ts | ThemeManager 的属性测试 |
| theme-registry.ts | ThemeRegistry 类，管理主题安装、卸载、更新检查 |
| theme-storage.ts | ThemeStorage 类，实现主题数据的 localStorage 持久化 |
| theme-validator.ts | 主题验证工具，validateThemePack 和 createThemePack 函数 |
| theme-validator.test.ts | 主题验证的属性测试 |
| context-builder.ts | ContextBuilder 类，根据设置构建 LLM 提示词，估算 Token 数量 |
| themes-registry.json | 主题注册表配置文件，定义内置和社区主题列表 |

## 子目录

### builtin/
内置主题目录，包含 shadcn-ui 和 cherry 两个内置主题。

| 子目录 | 功能描述 |
|--------|----------|
| shadcn/ | shadcn-ui 主题包，包含 tokens、components、examples、prompts |
| cherry/ | Cherry Studio 主题包，包含 tokens、components、examples、prompts |

### utils/
工具函数目录。

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 工具函数统一导出入口 |
| merge-tokens.ts | 令牌合并工具，mergeTokens 和 getTokenCategories 函数 |
| merge-tokens.test.ts | 令牌合并的属性测试 |
| serialize-theme.ts | 主题序列化工具，exportTheme 和 importTheme 函数 |
| serialize-theme.test.ts | 主题序列化的属性测试 |
| css-variables.ts | CSS 变量应用工具，applyCssVariables 和 applyThemeColorScheme 函数 |

## 使用示例

```typescript
import {
  initializeThemeSystem,
  getThemeManager,
  createContextBuilder,
} from '@/lib/themes';

// 初始化主题系统
const themeManager = initializeThemeSystem('shadcn-ui');

// 切换主题
themeManager.setActiveTheme('cherry');

// 订阅主题变化
const unsubscribe = themeManager.subscribe((event) => {
  console.log('Theme changed:', event.newThemeId);
});

// 构建 LLM 上下文
const builder = createContextBuilder({ language: 'zh' });
const result = builder.build({
  themeId: 'shadcn-ui',
  components: { mode: 'all' },
  examples: { mode: 'auto', maxCount: 5 },
  colorScheme: { id: 'light', includeInPrompt: true },
  tokenBudget: { max: 4000, autoOptimize: true },
});
```

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
