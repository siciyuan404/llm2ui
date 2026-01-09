# Popup 弹窗组件

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 功能描述

提供各种弹窗和对话框组件，包括确认对话框、搜索弹窗和模型选择弹窗。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| ConfirmDialog.tsx | 确认对话框，用于危险操作确认 |
| SearchPopup.tsx | 全屏搜索界面，支持分组结果和键盘导航 |
| SelectModelPopup.tsx | 模型选择弹窗，支持分组、搜索和能力标签显示 |
| index.ts | 模块导出入口 |

## 使用方式

```tsx
import { ConfirmDialog, SearchPopup, SelectModelPopup } from '@/components/cherry/popup';

// 确认对话框
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="确认删除"
  description="此操作不可撤销"
  onConfirm={handleDelete}
  destructive
/>

// 搜索弹窗
<SearchPopup
  open={searchOpen}
  onOpenChange={setSearchOpen}
  results={results}
  onSearch={handleSearch}
  onSelect={handleSelect}
/>

// 模型选择弹窗
<SelectModelPopup
  open={modelOpen}
  onOpenChange={setModelOpen}
  providers={providers}
  value={selectedModel}
  onSelect={handleModelSelect}
/>
```

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
