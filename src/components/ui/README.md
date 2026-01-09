# ui

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

基础 UI 组件目录，基于 shadcn-ui v4 的可复用组件。
这些组件被注册到 ComponentRegistry 中，可在 UISchema 中使用。

### v4 更新特性

- 使用函数组件替代 forwardRef（更简洁的 API）
- 添加 `data-slot` 属性用于样式选择器
- 更新焦点样式：`focus-visible:ring-[3px]`、`focus-visible:border-ring`
- 添加 `aria-invalid` 状态样式支持
- 优化暗色模式样式
- 新增组件：Empty（空状态）、Spinner（加载指示器）

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| accordion.tsx | 手风琴组件，基于 Radix UI Accordion，用于可折叠的内容面板 |
| alert-dialog.tsx | 警告对话框组件，基于 Radix UI AlertDialog，用于需要用户确认的操作 |
| alert.tsx | 提示组件，支持多种变体（default/destructive/warning/success），用于错误和通知显示 |
| aspect-ratio.tsx | 宽高比组件，基于 Radix UI AspectRatio，用于保持内容的固定宽高比 |
| avatar.tsx | 头像组件，基于 Radix UI Avatar，支持图片和回退文字显示 |
| badge.tsx | 徽章组件（v4），支持 asChild 属性，变体：default/secondary/destructive/outline/success/warning |
| breadcrumb.tsx | 面包屑导航组件，包含 Breadcrumb/BreadcrumbList/BreadcrumbItem/BreadcrumbLink/BreadcrumbPage/BreadcrumbSeparator/BreadcrumbEllipsis |
| button.tsx | 按钮组件（v4），支持 data-slot/data-variant/data-size 属性，新增 icon-sm/icon-lg 尺寸 |
| card.tsx | 卡片组件（v4），新增 CardAction 组件，使用 grid 布局，包含 Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter/CardAction |
| checkbox.tsx | 复选框组件，基于 Radix UI Checkbox，支持选中/未选中/不确定状态 |
| collapsible.tsx | 可折叠组件，基于 Radix UI Collapsible，用于显示/隐藏内容区域 |
| command.tsx | 命令面板组件，基于 cmdk 库，包含 Command/CommandDialog/CommandInput/CommandList/CommandEmpty/CommandGroup/CommandItem/CommandShortcut/CommandSeparator，支持搜索过滤和键盘导航 |
| context-menu.tsx | 右键菜单组件，基于 Radix UI ContextMenu，包含 ContextMenu/ContextMenuTrigger/ContextMenuContent/ContextMenuItem/ContextMenuCheckboxItem/ContextMenuRadioItem/ContextMenuLabel/ContextMenuSeparator/ContextMenuShortcut/ContextMenuSub/ContextMenuSubTrigger/ContextMenuSubContent |
| dialog.tsx | 对话框组件（v4），新增 showCloseButton 属性，支持模态对话框 |
| drawer.tsx | 抽屉组件，基于 vaul 库，支持从底部滑入和拖拽关闭手势 |
| dropdown-menu.tsx | 下拉菜单组件，基于 Radix UI DropdownMenu，支持嵌套菜单和快捷键显示 |
| empty.tsx | 空状态组件（v4 新增），包含 Empty/EmptyHeader/EmptyTitle/EmptyDescription/EmptyContent/EmptyMedia |
| hover-card.tsx | 悬停卡片组件，基于 Radix UI HoverCard，用于在悬停时显示额外信息 |
| input.tsx | 输入框组件（v4），支持 selection 样式和 aria-invalid 状态 |
| label.tsx | 标签组件，用于表单元素的标签 |
| menubar.tsx | 菜单栏组件，基于 Radix UI Menubar，包含 Menubar/MenubarMenu/MenubarTrigger/MenubarContent/MenubarItem/MenubarSeparator/MenubarLabel/MenubarCheckboxItem/MenubarRadioGroup/MenubarRadioItem/MenubarSub/MenubarSubTrigger/MenubarSubContent/MenubarShortcut |
| navigation-menu.tsx | 导航菜单组件，基于 Radix UI NavigationMenu，包含 NavigationMenu/NavigationMenuList/NavigationMenuItem/NavigationMenuContent/NavigationMenuTrigger/NavigationMenuLink/NavigationMenuIndicator/NavigationMenuViewport 及 navigationMenuTriggerStyle |
| pagination.tsx | 分页组件，包含 Pagination/PaginationContent/PaginationItem/PaginationLink/PaginationPrevious/PaginationNext/PaginationEllipsis |
| popover.tsx | 弹出框组件，基于 Radix UI Popover，用于显示浮动内容 |
| progress.tsx | 进度条组件，基于 Radix UI Progress，用于显示操作进度 |
| radio-group.tsx | 单选按钮组组件，基于 Radix UI RadioGroup，用于单选选择 |
| resizable.tsx | 可调整大小面板组件，基于 react-resizable-panels 库，包含 ResizablePanelGroup/ResizablePanel/ResizableHandle，支持水平和垂直布局 |
| scroll-area.tsx | 滚动区域组件，基于 Radix UI ScrollArea，提供自定义滚动条样式 |
| select.tsx | 下拉选择组件，基于 Radix UI Select，支持单选 |
| separator.tsx | 分隔线组件，基于 Radix UI Separator，支持水平和垂直方向 |
| sheet.tsx | 侧边栏组件，基于 Radix UI Dialog，支持从四个方向（top/bottom/left/right）滑入 |
| skeleton.tsx | 骨架屏组件，用于内容加载时的占位显示 |
| slider.tsx | 滑块组件，基于 Radix UI Slider，用于范围输入 |
| spinner.tsx | 加载指示器组件（v4 新增），基于 Loader2Icon，支持旋转动画 |
| switch.tsx | 开关组件，基于 Radix UI Switch，用于二元状态切换 |
| table.tsx | 表格组件，包含 Table/TableHeader/TableBody/TableRow/TableHead/TableCell/TableCaption |
| tabs.tsx | 标签页组件（v4），基于 Radix UI Tabs，支持暗色模式样式 |
| textarea.tsx | 多行文本输入组件，用于长文本输入 |
| toaster.tsx | Toast 通知组件，基于 sonner 库，支持多种位置和类型（success/error/warning/info），自动消失 |
| toggle.tsx | 切换按钮组件，基于 Radix UI Toggle，支持多种变体（default/outline）和尺寸（default/sm/lg） |
| toggle-group.tsx | 切换按钮组组件，基于 Radix UI ToggleGroup，支持单选和多选模式 |
| tooltip.tsx | 工具提示组件，基于 Radix UI Tooltip，用于显示悬停提示信息 |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
