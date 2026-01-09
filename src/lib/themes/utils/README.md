# themes/utils

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

主题系统工具函数目录，提供令牌合并、主题序列化和 CSS 变量应用等功能。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 工具函数统一导出入口 |
| merge-tokens.ts | 令牌合并工具，支持基础令牌和扩展令牌的合并 |
| merge-tokens.test.ts | 令牌合并的属性测试 |
| serialize-theme.ts | 主题序列化工具，支持主题的导入导出 |
| serialize-theme.test.ts | 主题序列化的属性测试 |
| css-variables.ts | CSS 变量应用工具，将主题配色方案应用到 DOM |

## 功能说明

### merge-tokens.ts

令牌合并工具，提供以下功能：

- `mergeTokens(base, override)` - 合并基础令牌和覆盖令牌
- `addTokenCategory(tokens, category)` - 添加自定义令牌类别
- `removeTokenCategory(tokens, name)` - 移除令牌类别
- `getTokenCategories(tokens)` - 获取所有令牌类别名称
- `getTokensByCategory(tokens, category)` - 按类别获取令牌值
- `formatTokensForLLM(tokens)` - 格式化令牌为 LLM 可读字符串

### serialize-theme.ts

主题序列化工具，提供以下功能：

- `exportTheme(theme)` - 将主题包导出为 JSON 字符串
- `importTheme(json)` - 从 JSON 字符串导入主题包
- `cloneTheme(theme, newId?)` - 克隆主题包
- `mergeThemes(base, override)` - 合并两个主题包
- `validateExportedJson(json)` - 验证导出的 JSON 是否有效

### css-variables.ts

CSS 变量应用工具，提供以下功能：

- `applyCssVariables(colorScheme, options?)` - 将配色方案的 CSS 变量应用到 DOM
- `applyThemeColorScheme(theme, schemeId?, options?)` - 应用主题的指定配色方案
- `clearCssVariables(target?)` - 清除已应用的 CSS 变量
- `getCurrentColorSchemeType()` - 获取当前应用的配色方案类型
- `watchSystemColorScheme(callback)` - 监听系统配色方案变化

## 使用示例

```typescript
import {
  mergeTokens,
  exportTheme,
  importTheme,
  applyCssVariables,
  applyThemeColorScheme,
} from '@/lib/themes/utils';

// 合并令牌
const mergedTokens = mergeTokens(baseTokens, overrideTokens);

// 导出主题
const json = exportTheme(themePack);

// 导入主题
const importedTheme = importTheme(json);

// 应用配色方案
applyThemeColorScheme(themePack, 'dark');
```

## 更新提醒

任何文件变更后，请更新此文档和上级目录的 README.md。
