# ui

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

基础 UI 组件目录，基于 shadcn-ui 的可复用组件。
这些组件被注册到 ComponentRegistry 中，可在 UISchema 中使用。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| alert.tsx | 提示组件，支持多种变体（default/destructive/warning/success），用于错误和通知显示 |
| button.tsx | 按钮组件，支持多种变体（default/destructive/outline/secondary/ghost/link）和尺寸 |
| card.tsx | 卡片组件，包含 Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter |
| dialog.tsx | 对话框组件，基于 Radix UI Dialog，支持模态对话框 |
| input.tsx | 输入框组件，支持多种类型（text/password/email/number 等） |
| label.tsx | 标签组件，用于表单元素的标签 |
| select.tsx | 下拉选择组件，基于 Radix UI Select，支持单选 |
| slider.tsx | 滑块组件，基于 Radix UI Slider，用于范围输入 |
| table.tsx | 表格组件，包含 Table/TableHeader/TableBody/TableRow/TableHead/TableCell/TableCaption |
| textarea.tsx | 多行文本输入组件，用于长文本输入 |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
