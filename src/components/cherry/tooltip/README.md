# Tooltip 提示组件

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 功能描述

提供带图标的工具提示组件，用于显示帮助、信息和警告内容。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| HelpTooltip.tsx | 帮助提示图标，显示问号图标和帮助内容 |
| InfoTooltip.tsx | 信息提示图标，显示信息图标和说明内容 |
| WarnTooltip.tsx | 警告提示图标，显示警告图标和警告内容 |
| index.ts | 模块导出入口 |

## 使用方式

```tsx
import { HelpTooltip, InfoTooltip, WarnTooltip } from '@/components/cherry/tooltip';

// 帮助提示
<HelpTooltip content="这是帮助信息" />

// 信息提示
<InfoTooltip content="这是说明信息" size="lg" />

// 警告提示
<WarnTooltip content="这是警告信息" side="right" />
```

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
