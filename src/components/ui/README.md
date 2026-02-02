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
| button-group.tsx | 按钮组组件（v4 新增），用于将相关按钮组合在一起，支持嵌套和分割按钮模式 |
| button.tsx | 按钮组件（v4），支持 data-slot/data-variant/data-size 属性，新增 icon-sm/icon-lg 尺寸 |
| calendar.tsx | 日历组件（v4 新增），用于显示和选择日期，包含 Calendar/CalendarHeader/CalendarTitle/CalendarPrevButton/CalendarNextButton/CalendarBody/CalendarGrid/CalendarDayHeader/CalendarDay |
| card.tsx | 卡片组件（v4），新增 CardAction 组件，使用 grid 布局，包含 Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter/CardAction |
| carousel.tsx | 轮播组件（v4 新增），用于创建可滚动的轮播内容，包含 Carousel/CarouselContent/CarouselItem/CarouselPrevious/CarouselNext/CarouselDots/CarouselDot |
| chart.tsx | 图表组件（v4 新增），用于显示数据的图表，包含 Chart/ChartTooltip/ChartTooltipContent/ChartLegend/ChartLegendItem/ChartLegendColor |
| checkbox.tsx | 复选框组件，基于 Radix UI Checkbox，支持选中/未选中/不确定状态 |
| collapsible.tsx | 可折叠组件，基于 Radix UI Collapsible，用于显示/隐藏内容区域 |
| combobox.tsx | 组合框组件（v4 新增），用于可搜索和可选择的下拉列表，基于 Command 组件构建 |
| command.tsx | 命令面板组件，基于 cmdk 库，包含 Command/CommandDialog/CommandInput/CommandList/CommandEmpty/CommandGroup/CommandItem/CommandShortcut/CommandSeparator，支持搜索过滤和键盘导航 |
| context-menu.tsx | 右键菜单组件，基于 Radix UI ContextMenu，包含 ContextMenu/ContextMenuTrigger/ContextMenuContent/ContextMenuItem/ContextMenuCheckboxItem/ContextMenuRadioItem/ContextMenuLabel/ContextMenuSeparator/ContextMenuShortcut/ContextMenuSub/ContextMenuSubTrigger/ContextMenuSubContent |
| data-table.tsx | 数据表格组件（v4 新增），用于显示和操作大量数据，包含 DataTable/DataTableToolbar/DataTableFilter/DataTableActions/DataTableColumnHeader/DataTableSortButton/DataTableRowActions/DataTableRowActionsDropdown |
| date-picker.tsx | 日期选择器组件（v4 新增），用于选择日期的弹出式选择器，基于 Calendar 和 Popover 组件构建 |
| dialog.tsx | 对话框组件（v4），新增 showCloseButton 属性，支持模态对话框 |
| drawer.tsx | 抽屉组件，基于 vaul 库，支持从底部滑入和拖拽关闭手势 |
| dropdown-menu.tsx | 下拉菜单组件，基于 Radix UI DropdownMenu，支持嵌套菜单和快捷键显示 |
| empty.tsx | 空状态组件（v4 新增），包含 Empty/EmptyHeader/EmptyTitle/EmptyDescription/EmptyContent/EmptyMedia |
| field.tsx | 表单字段组件（v4 新增），用于构建复杂表单，包含 Field/FieldLabel/FieldDescription/FieldError/FieldGroup/FieldSet/FieldLegend/FieldSeparator/FieldContent |
| form.tsx | 表单组件（v4 新增），用于构建表单的高级组件，包含 Form/FormField/FormItem/FormLabel/FormControl/FormDescription/FormMessage/FormFieldset/FormLegend/FormFieldGroup/FormFieldSeparator |
| hover-card.tsx | 悬停卡片组件，基于 Radix UI HoverCard，用于在悬停时显示额外信息 |
| input-group.tsx | 输入组组件（v4 新增），用于在输入框周围添加图标、按钮、标签等元素，包含 InputGroup/InputGroupInput/InputGroupTextarea/InputGroupAddon/InputGroupButton/InputGroupText |
| input-otp.tsx | OTP 输入组件（v4 新增），用于输入一次性密码，包含 InputOTP/InputOTPGroup/InputOTPSlot/InputOTPSeparator |
| input.tsx | 输入框组件（v4），支持 selection 样式和 aria-invalid 状态 |
| item.tsx | 列表项组件（v4 新增），用于显示列表项、卡片等内容，包含 Item/ItemHeader/ItemTitle/ItemDescription/ItemContent/ItemMedia/ItemAction/ItemFooter |
| kbd.tsx | 键盘快捷键组件（v4 新增），用于显示键盘按键或按键组合，包含 Kbd/KbdGroup |
| label.tsx | 标签组件，用于表单元素的标签 |
| menubar.tsx | 菜单栏组件，基于 Radix UI Menubar，包含 Menubar/MenubarMenu/MenubarTrigger/MenubarContent/MenubarItem/MenubarSeparator/MenubarLabel/MenubarCheckboxItem/MenubarRadioGroup/MenubarRadioItem/MenubarSub/MenubarSubTrigger/MenubarSubContent/MenubarShortcut |
| native-select.tsx | 原生选择组件（v4 新增），使用原生 HTML select 元素，包含 NativeSelect/NativeSelectItem/NativeSelectGroup/NativeSelectLabel |
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
| sidebar.tsx | 侧边栏组件（v4 新增），用于创建可折叠的侧边栏导航，包含 Sidebar/SidebarHeader/SidebarFooter/SidebarContent/SidebarGroup/SidebarGroupLabel/SidebarGroupContent/SidebarMenu/SidebarMenuItem/SidebarMenuButton/SidebarTrigger/SidebarCollapsible |
| skeleton.tsx | 骨架屏组件，用于内容加载时的占位显示 |
| slider.tsx | 滑块组件，基于 Radix UI Slider，用于范围输入 |
| sonner.tsx | Sonner 通知组件（v4 新增），基于 sonner 库的 Toast 通知 |
| spinner.tsx | 加载指示器组件（v4 新增），基于 Loader2Icon，支持旋转动画 |
| switch.tsx | 开关组件，基于 Radix UI Switch，用于二元状态切换 |
| table.tsx | 表格组件，包含 Table/TableHeader/TableBody/TableRow/TableHead/TableCell/TableCaption |
| tabs.tsx | 标签页组件（v4），基于 Radix UI Tabs，支持暗色模式样式 |
| textarea.tsx | 多行文本输入组件，用于长文本输入 |
| toast.tsx | Toast 通知组件（v4 新增），基于 Radix UI Toast，包含 ToastProvider/ToastViewport/Toast/ToastTitle/ToastDescription/ToastClose/ToastAction |
| toaster.tsx | Toast 通知组件，基于 sonner 库，支持多种位置和类型（success/error/warning/info），自动消失 |
| toggle-group.tsx | 切换按钮组组件，基于 Radix UI ToggleGroup，支持单选和多选模式 |
| toggle.tsx | 切换按钮组件，基于 Radix UI Toggle，支持多种变体（default/outline）和尺寸（default/sm/lg） |
| tooltip.tsx | 工具提示组件，基于 Radix UI Tooltip，用于显示悬停提示信息 |
| typography.tsx | 排版组件（v4 新增），提供一致的排版样式，包含 TypographyH1/TypographyH2/TypographyH3/TypographyH4/TypographyP/TypographyBlockquote/TypographyList/TypographyInlineCode/TypographyLead/TypographyLarge/TypographySmall/TypographyMuted |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
