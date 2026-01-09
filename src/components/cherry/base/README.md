# Cherry Base 基础组件

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

Cherry Studio 风格的基础 UI 组件，完全独立于 shadcn-ui，使用 Cherry 设计系统的 CSS 变量。

## 设计原则

1. **独立性**: 不依赖 shadcn-ui，使用 Cherry 自己的设计语言
2. **CSS 变量**: 使用 `--cherry-*` CSS 变量实现主题化
3. **可访问性**: 遵循 WAI-ARIA 规范
4. **组合性**: 可与其他 Cherry 组件自由组合

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| CherryButton.tsx | 按钮组件，支持多种变体和尺寸 |
| CherryInput.tsx | 输入框组件，支持图标和错误状态 |
| CherryTextarea.tsx | 多行文本框，支持自动调整高度 |
| CherryCard.tsx | 卡片组件及子组件（Header/Title/Description/Content/Footer） |
| CherryLabel.tsx | 表单标签组件 |
| CherrySwitch.tsx | 开关组件 |
| CherryBadge.tsx | 徽章组件，支持多种颜色变体 |

## CSS 变量依赖

```css
--cherry-background
--cherry-background-soft
--cherry-text
--cherry-text-2
--cherry-primary
--cherry-primary-soft
--cherry-secondary
--cherry-border
--cherry-hover
```

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
