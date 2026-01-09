/**
 * @file shadcn-components.ts
 * @description shadcn-ui 组件注册模块，将所有 shadcn-ui 组件注册到 ComponentRegistry
 * @module lib/core/shadcn-components
 * @requirements 6.1, 6.3
 * 
 * 基于 shadcn-ui v4 更新
 * 
 * 包含组件：
 * - 布局: Card, CardAction, Container, Separator, AspectRatio, ScrollArea, Collapsible, Accordion, Resizable
 * - 输入: Button, Input, Textarea, Label, Checkbox, Switch, Slider, Select, RadioGroup, Toggle, ToggleGroup
 * - 展示: Text, Icon, Badge, Avatar, Progress, Skeleton, Table, Empty
 * - 导航: Tabs, Breadcrumb, Pagination, NavigationMenu, Menubar, ContextMenu, DropdownMenu
 * - 反馈: Alert, Dialog, AlertDialog, Sheet, Drawer, Popover, Tooltip, HoverCard, Command, Spinner
 * 
 * 布局容器别名（LLM 兼容）：
 * - Box, Div, Wrapper, Section, View, Flex, Grid, Stack, Row, Column → Container
 */

import React from 'react';
import { ComponentRegistry, defaultRegistry } from './component-registry';
import type { PropSchema, ComponentCategory } from './component-registry';
import { defaultIconRegistry, initializeDefaultIcons } from '../utils/icon-registry';

// ============================================================================
// Import shadcn-ui components
// ============================================================================

// Basic
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

// Card (v4: 新增 CardAction)
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction,
} from '../../components/ui/card';

// Table
import {
  Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption,
} from '../../components/ui/table';

// Form Controls
import { Checkbox } from '../../components/ui/checkbox';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel,
} from '../../components/ui/select';

// Display
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import { Separator } from '../../components/ui/separator';

// v4 新增组件
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from '../../components/ui/empty';
import { Spinner } from '../../components/ui/spinner';

// Layout
import { AspectRatio } from '../../components/ui/aspect-ratio';
import { ScrollArea, ScrollBar } from '../../components/ui/scroll-area';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../components/ui/collapsible';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../components/ui/resizable';

// Navigation
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Toggle } from '../../components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationPrevious, PaginationNext, PaginationEllipsis,
} from '../../components/ui/pagination';
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem,
  NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink,
} from '../../components/ui/navigation-menu';
import {
  Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem,
  MenubarSeparator, MenubarShortcut,
} from '../../components/ui/menubar';
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuShortcut,
} from '../../components/ui/context-menu';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup,
} from '../../components/ui/dropdown-menu';

// Feedback
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '../../components/ui/dialog';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter, AlertDialogTitle, AlertDialogDescription,
  AlertDialogAction, AlertDialogCancel,
} from '../../components/ui/alert-dialog';
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription,
} from '../../components/ui/sheet';
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription,
} from '../../components/ui/drawer';
import { Popover, PopoverTrigger, PopoverContent } from '../../components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui/tooltip';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../../components/ui/hover-card';
import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator,
} from '../../components/ui/command';

// ============================================================================
// Common Props Schema
// ============================================================================

const commonProps: Record<string, PropSchema> = {
  className: { type: 'string', required: false, description: 'CSS 类名' },
  children: { type: 'object', required: false, description: '子元素' },
};

const asChildProp: PropSchema = { type: 'boolean', required: false, description: '作为子元素渲染' };

// ============================================================================
// Register Components
// ============================================================================

export function registerShadcnComponents(registry: ComponentRegistry = defaultRegistry): void {

  // ==========================================================================
  // 基础组件 (Basic)
  // ==========================================================================

  registry.register({
    name: 'Button',
    component: Button,
    category: 'input' as ComponentCategory,
    description: '按钮组件，支持多种样式变体和尺寸',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string', required: false, description: '按钮样式',
        enum: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      },
      size: {
        type: 'string', required: false, description: '按钮尺寸',
        enum: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
      },
      disabled: { type: 'boolean', required: false, description: '是否禁用' },
      asChild: asChildProp,
    },
  });

  registry.register({
    name: 'Input',
    component: Input,
    category: 'input' as ComponentCategory,
    description: '文本输入框组件',
    propsSchema: {
      ...commonProps,
      type: {
        type: 'string', required: false, description: '输入类型',
        enum: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
      },
      placeholder: { type: 'string', required: false, description: '占位文本' },
      value: { type: 'string', required: false, description: '输入值' },
      disabled: { type: 'boolean', required: false, description: '是否禁用' },
    },
  });

  registry.register({
    name: 'Label',
    component: Label,
    category: 'input' as ComponentCategory,
    description: '表单标签组件',
    propsSchema: {
      ...commonProps,
      htmlFor: { type: 'string', required: false, description: '关联的表单元素 ID' },
    },
  });

  registry.register({
    name: 'Textarea',
    component: Textarea,
    category: 'input' as ComponentCategory,
    description: '多行文本输入框组件',
    propsSchema: {
      ...commonProps,
      placeholder: { type: 'string', required: false, description: '占位文本' },
      value: { type: 'string', required: false, description: '输入值' },
      disabled: { type: 'boolean', required: false, description: '是否禁用' },
      rows: { type: 'number', required: false, description: '可见行数' },
    },
  });

  // ==========================================================================
  // Card 组件
  // ==========================================================================

  registry.register({ name: 'Card', component: Card, category: 'layout' as ComponentCategory, description: '卡片容器组件', propsSchema: commonProps });
  registry.register({ name: 'CardHeader', component: CardHeader, category: 'layout' as ComponentCategory, description: '卡片头部', propsSchema: commonProps });
  registry.register({ name: 'CardTitle', component: CardTitle, category: 'layout' as ComponentCategory, description: '卡片标题', propsSchema: commonProps });
  registry.register({ name: 'CardDescription', component: CardDescription, category: 'layout' as ComponentCategory, description: '卡片描述', propsSchema: commonProps });
  registry.register({ name: 'CardContent', component: CardContent, category: 'layout' as ComponentCategory, description: '卡片内容', propsSchema: commonProps });
  registry.register({ name: 'CardFooter', component: CardFooter, category: 'layout' as ComponentCategory, description: '卡片底部', propsSchema: commonProps });

  // ==========================================================================
  // Table 组件
  // ==========================================================================

  registry.register({ name: 'Table', component: Table, category: 'display' as ComponentCategory, description: '表格组件', propsSchema: commonProps });
  registry.register({ name: 'TableHeader', component: TableHeader, category: 'display' as ComponentCategory, description: '表格头部', propsSchema: commonProps });
  registry.register({ name: 'TableBody', component: TableBody, category: 'display' as ComponentCategory, description: '表格主体', propsSchema: commonProps });
  registry.register({ name: 'TableFooter', component: TableFooter, category: 'display' as ComponentCategory, description: '表格底部', propsSchema: commonProps });
  registry.register({ name: 'TableHead', component: TableHead, category: 'display' as ComponentCategory, description: '表头单元格', propsSchema: commonProps });
  registry.register({ name: 'TableRow', component: TableRow, category: 'display' as ComponentCategory, description: '表格行', propsSchema: commonProps });
  registry.register({ name: 'TableCell', component: TableCell, category: 'display' as ComponentCategory, description: '表格单元格', propsSchema: commonProps });
  registry.register({ name: 'TableCaption', component: TableCaption, category: 'display' as ComponentCategory, description: '表格标题', propsSchema: commonProps });

  // ==========================================================================
  // 表单控件 (Form Controls)
  // ==========================================================================

  registry.register({
    name: 'Checkbox',
    component: Checkbox,
    category: 'input' as ComponentCategory,
    description: '复选框组件',
    propsSchema: {
      ...commonProps,
      checked: { type: 'boolean', required: false, description: '是否选中' },
      disabled: { type: 'boolean', required: false, description: '是否禁用' },
    },
  });

  registry.register({
    name: 'Switch',
    component: Switch,
    category: 'input' as ComponentCategory,
    description: '开关组件',
    propsSchema: {
      ...commonProps,
      checked: { type: 'boolean', required: false, description: '是否开启' },
      disabled: { type: 'boolean', required: false, description: '是否禁用' },
    },
  });

  registry.register({
    name: 'Slider',
    component: Slider,
    category: 'input' as ComponentCategory,
    description: '滑块组件',
    propsSchema: {
      ...commonProps,
      value: { type: 'array', required: false, description: '当前值' },
      min: { type: 'number', required: false, description: '最小值' },
      max: { type: 'number', required: false, description: '最大值' },
      step: { type: 'number', required: false, description: '步长' },
      disabled: { type: 'boolean', required: false, description: '是否禁用' },
    },
  });

  registry.register({
    name: 'RadioGroup',
    component: RadioGroup,
    category: 'input' as ComponentCategory,
    description: '单选按钮组',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: false, description: '选中值' },
      defaultValue: { type: 'string', required: false, description: '默认值' },
      disabled: { type: 'boolean', required: false, description: '是否禁用' },
    },
  });

  registry.register({
    name: 'RadioGroupItem',
    component: RadioGroupItem as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'input' as ComponentCategory,
    description: '单选按钮项',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: true, description: '选项值' },
      disabled: { type: 'boolean', required: false, description: '是否禁用' },
    },
  });

  // Select 组件
  registry.register({ name: 'Select', component: Select, category: 'input' as ComponentCategory, description: '下拉选择组件', propsSchema: { ...commonProps, value: { type: 'string', required: false, description: '选中值' }, disabled: { type: 'boolean', required: false, description: '是否禁用' } } });
  registry.register({ name: 'SelectTrigger', component: SelectTrigger, category: 'input' as ComponentCategory, description: '选择触发器', propsSchema: commonProps });
  registry.register({ name: 'SelectValue', component: SelectValue, category: 'input' as ComponentCategory, description: '选择值显示', propsSchema: { ...commonProps, placeholder: { type: 'string', required: false, description: '占位文本' } } });
  registry.register({ name: 'SelectContent', component: SelectContent, category: 'input' as ComponentCategory, description: '选择内容', propsSchema: commonProps });
  registry.register({ name: 'SelectItem', component: SelectItem as unknown as React.ComponentType<Record<string, unknown>>, category: 'input' as ComponentCategory, description: '选择项', propsSchema: { ...commonProps, value: { type: 'string', required: true, description: '选项值' } } });
  registry.register({ name: 'SelectGroup', component: SelectGroup, category: 'input' as ComponentCategory, description: '选择分组', propsSchema: commonProps });
  registry.register({ name: 'SelectLabel', component: SelectLabel, category: 'input' as ComponentCategory, description: '选择标签', propsSchema: commonProps });


  // ==========================================================================
  // 展示组件 (Display)
  // ==========================================================================

  registry.register({
    name: 'Badge',
    component: Badge,
    category: 'display' as ComponentCategory,
    description: '徽章组件，用于状态标识',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string', required: false, description: '徽章样式',
        enum: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning'],
      },
      asChild: asChildProp,
    },
  });

  registry.register({ name: 'Avatar', component: Avatar, category: 'display' as ComponentCategory, description: '头像组件', propsSchema: commonProps });
  registry.register({ name: 'AvatarImage', component: AvatarImage, category: 'display' as ComponentCategory, description: '头像图片', propsSchema: { ...commonProps, src: { type: 'string', required: false, description: '图片地址' }, alt: { type: 'string', required: false, description: '替代文本' } } });
  registry.register({ name: 'AvatarFallback', component: AvatarFallback, category: 'display' as ComponentCategory, description: '头像占位', propsSchema: commonProps });

  registry.register({
    name: 'Progress',
    component: Progress,
    category: 'feedback' as ComponentCategory,
    description: '进度条组件',
    propsSchema: {
      ...commonProps,
      value: { type: 'number', required: false, description: '进度值 (0-100)' },
      max: { type: 'number', required: false, description: '最大值' },
    },
  });

  registry.register({ name: 'Skeleton', component: Skeleton, category: 'feedback' as ComponentCategory, description: '骨架屏组件', propsSchema: commonProps });

  registry.register({
    name: 'Separator',
    component: Separator,
    category: 'layout' as ComponentCategory,
    description: '分隔线组件',
    propsSchema: {
      ...commonProps,
      orientation: { type: 'string', required: false, description: '方向', enum: ['horizontal', 'vertical'] },
    },
  });

  // ==========================================================================
  // 布局组件 (Layout)
  // ==========================================================================

  registry.register({
    name: 'AspectRatio',
    component: AspectRatio,
    category: 'layout' as ComponentCategory,
    description: '宽高比容器组件',
    propsSchema: {
      ...commonProps,
      ratio: { type: 'number', required: false, description: '宽高比 (width/height)' },
    },
  });

  registry.register({ name: 'ScrollArea', component: ScrollArea, category: 'layout' as ComponentCategory, description: '自定义滚动区域', propsSchema: commonProps });
  registry.register({ name: 'ScrollBar', component: ScrollBar, category: 'layout' as ComponentCategory, description: '滚动条', propsSchema: { ...commonProps, orientation: { type: 'string', required: false, description: '方向', enum: ['horizontal', 'vertical'] } } });

  registry.register({ name: 'Collapsible', component: Collapsible, category: 'layout' as ComponentCategory, description: '可折叠组件', propsSchema: { ...commonProps, open: { type: 'boolean', required: false, description: '是否展开' } } });
  registry.register({ name: 'CollapsibleTrigger', component: CollapsibleTrigger, category: 'layout' as ComponentCategory, description: '折叠触发器', propsSchema: { ...commonProps, asChild: asChildProp } });
  registry.register({ name: 'CollapsibleContent', component: CollapsibleContent, category: 'layout' as ComponentCategory, description: '折叠内容', propsSchema: commonProps });

  registry.register({ name: 'Accordion', component: Accordion as unknown as React.ComponentType<Record<string, unknown>>, category: 'layout' as ComponentCategory, description: '手风琴组件', propsSchema: { ...commonProps, type: { type: 'string', required: false, description: '类型', enum: ['single', 'multiple'] }, collapsible: { type: 'boolean', required: false, description: '是否可折叠' } } });
  registry.register({ name: 'AccordionItem', component: AccordionItem as unknown as React.ComponentType<Record<string, unknown>>, category: 'layout' as ComponentCategory, description: '手风琴项', propsSchema: { ...commonProps, value: { type: 'string', required: true, description: '项标识' } } });
  registry.register({ name: 'AccordionTrigger', component: AccordionTrigger, category: 'layout' as ComponentCategory, description: '手风琴触发器', propsSchema: commonProps });
  registry.register({ name: 'AccordionContent', component: AccordionContent, category: 'layout' as ComponentCategory, description: '手风琴内容', propsSchema: commonProps });

  registry.register({ name: 'ResizablePanelGroup', component: ResizablePanelGroup, category: 'layout' as ComponentCategory, description: '可调整大小面板组', propsSchema: { ...commonProps, direction: { type: 'string', required: false, description: '方向', enum: ['horizontal', 'vertical'] } } });
  registry.register({ name: 'ResizablePanel', component: ResizablePanel, category: 'layout' as ComponentCategory, description: '可调整大小面板', propsSchema: { ...commonProps, defaultSize: { type: 'number', required: false, description: '默认大小' }, minSize: { type: 'number', required: false, description: '最小大小' }, maxSize: { type: 'number', required: false, description: '最大大小' } } });
  registry.register({ name: 'ResizableHandle', component: ResizableHandle, category: 'layout' as ComponentCategory, description: '调整大小手柄', propsSchema: { ...commonProps, withHandle: { type: 'boolean', required: false, description: '显示手柄' } } });

  // ==========================================================================
  // 导航组件 (Navigation)
  // ==========================================================================

  registry.register({ name: 'Tabs', component: Tabs, category: 'navigation' as ComponentCategory, description: '标签页组件', propsSchema: { ...commonProps, defaultValue: { type: 'string', required: false, description: '默认选中' }, value: { type: 'string', required: false, description: '选中值' } } });
  registry.register({ name: 'TabsList', component: TabsList, category: 'navigation' as ComponentCategory, description: '标签列表', propsSchema: commonProps });
  registry.register({ name: 'TabsTrigger', component: TabsTrigger as unknown as React.ComponentType<Record<string, unknown>>, category: 'navigation' as ComponentCategory, description: '标签触发器', propsSchema: { ...commonProps, value: { type: 'string', required: true, description: '标签值' }, disabled: { type: 'boolean', required: false, description: '是否禁用' } } });
  registry.register({ name: 'TabsContent', component: TabsContent as unknown as React.ComponentType<Record<string, unknown>>, category: 'navigation' as ComponentCategory, description: '标签内容', propsSchema: { ...commonProps, value: { type: 'string', required: true, description: '标签值' } } });

  registry.register({ name: 'Toggle', component: Toggle, category: 'input' as ComponentCategory, description: '切换按钮', propsSchema: { ...commonProps, variant: { type: 'string', required: false, description: '样式', enum: ['default', 'outline'] }, size: { type: 'string', required: false, description: '尺寸', enum: ['default', 'sm', 'lg'] }, pressed: { type: 'boolean', required: false, description: '是否按下' } } });
  registry.register({ name: 'ToggleGroup', component: ToggleGroup as unknown as React.ComponentType<Record<string, unknown>>, category: 'input' as ComponentCategory, description: '切换按钮组', propsSchema: { ...commonProps, type: { type: 'string', required: true, description: '类型', enum: ['single', 'multiple'] }, value: { type: 'string', required: false, description: '选中值' } } });
  registry.register({ name: 'ToggleGroupItem', component: ToggleGroupItem as unknown as React.ComponentType<Record<string, unknown>>, category: 'input' as ComponentCategory, description: '切换按钮项', propsSchema: { ...commonProps, value: { type: 'string', required: true, description: '项值' } } });

  // Breadcrumb
  registry.register({ name: 'Breadcrumb', component: Breadcrumb, category: 'navigation' as ComponentCategory, description: '面包屑导航', propsSchema: commonProps });
  registry.register({ name: 'BreadcrumbList', component: BreadcrumbList, category: 'navigation' as ComponentCategory, description: '面包屑列表', propsSchema: commonProps });
  registry.register({ name: 'BreadcrumbItem', component: BreadcrumbItem, category: 'navigation' as ComponentCategory, description: '面包屑项', propsSchema: commonProps });
  registry.register({ name: 'BreadcrumbLink', component: BreadcrumbLink, category: 'navigation' as ComponentCategory, description: '面包屑链接', propsSchema: { ...commonProps, href: { type: 'string', required: false, description: '链接地址' }, asChild: asChildProp } });
  registry.register({ name: 'BreadcrumbPage', component: BreadcrumbPage, category: 'navigation' as ComponentCategory, description: '面包屑当前页', propsSchema: commonProps });
  registry.register({ name: 'BreadcrumbSeparator', component: BreadcrumbSeparator, category: 'navigation' as ComponentCategory, description: '面包屑分隔符', propsSchema: commonProps });

  // Pagination
  registry.register({ name: 'Pagination', component: Pagination, category: 'navigation' as ComponentCategory, description: '分页组件', propsSchema: commonProps });
  registry.register({ name: 'PaginationContent', component: PaginationContent, category: 'navigation' as ComponentCategory, description: '分页内容', propsSchema: commonProps });
  registry.register({ name: 'PaginationItem', component: PaginationItem, category: 'navigation' as ComponentCategory, description: '分页项', propsSchema: commonProps });
  registry.register({ name: 'PaginationLink', component: PaginationLink, category: 'navigation' as ComponentCategory, description: '分页链接', propsSchema: { ...commonProps, isActive: { type: 'boolean', required: false, description: '是否激活' } } });
  registry.register({ name: 'PaginationPrevious', component: PaginationPrevious, category: 'navigation' as ComponentCategory, description: '上一页', propsSchema: commonProps });
  registry.register({ name: 'PaginationNext', component: PaginationNext, category: 'navigation' as ComponentCategory, description: '下一页', propsSchema: commonProps });
  registry.register({ name: 'PaginationEllipsis', component: PaginationEllipsis, category: 'navigation' as ComponentCategory, description: '分页省略号', propsSchema: commonProps });


  // NavigationMenu
  registry.register({ name: 'NavigationMenu', component: NavigationMenu, category: 'navigation' as ComponentCategory, description: '导航菜单', propsSchema: commonProps });
  registry.register({ name: 'NavigationMenuList', component: NavigationMenuList, category: 'navigation' as ComponentCategory, description: '导航菜单列表', propsSchema: commonProps });
  registry.register({ name: 'NavigationMenuItem', component: NavigationMenuItem, category: 'navigation' as ComponentCategory, description: '导航菜单项', propsSchema: commonProps });
  registry.register({ name: 'NavigationMenuTrigger', component: NavigationMenuTrigger, category: 'navigation' as ComponentCategory, description: '导航菜单触发器', propsSchema: commonProps });
  registry.register({ name: 'NavigationMenuContent', component: NavigationMenuContent, category: 'navigation' as ComponentCategory, description: '导航菜单内容', propsSchema: commonProps });
  registry.register({ name: 'NavigationMenuLink', component: NavigationMenuLink, category: 'navigation' as ComponentCategory, description: '导航菜单链接', propsSchema: commonProps });

  // Menubar
  registry.register({ name: 'Menubar', component: Menubar, category: 'navigation' as ComponentCategory, description: '菜单栏', propsSchema: commonProps });
  registry.register({ name: 'MenubarMenu', component: MenubarMenu, category: 'navigation' as ComponentCategory, description: '菜单栏菜单', propsSchema: commonProps });
  registry.register({ name: 'MenubarTrigger', component: MenubarTrigger, category: 'navigation' as ComponentCategory, description: '菜单栏触发器', propsSchema: commonProps });
  registry.register({ name: 'MenubarContent', component: MenubarContent, category: 'navigation' as ComponentCategory, description: '菜单栏内容', propsSchema: commonProps });
  registry.register({ name: 'MenubarItem', component: MenubarItem, category: 'navigation' as ComponentCategory, description: '菜单栏项', propsSchema: commonProps });
  registry.register({ name: 'MenubarSeparator', component: MenubarSeparator, category: 'navigation' as ComponentCategory, description: '菜单栏分隔符', propsSchema: commonProps });
  registry.register({ name: 'MenubarShortcut', component: MenubarShortcut, category: 'navigation' as ComponentCategory, description: '菜单栏快捷键', propsSchema: commonProps });

  // ContextMenu
  registry.register({ name: 'ContextMenu', component: ContextMenu, category: 'navigation' as ComponentCategory, description: '右键菜单', propsSchema: commonProps });
  registry.register({ name: 'ContextMenuTrigger', component: ContextMenuTrigger, category: 'navigation' as ComponentCategory, description: '右键菜单触发器', propsSchema: commonProps });
  registry.register({ name: 'ContextMenuContent', component: ContextMenuContent, category: 'navigation' as ComponentCategory, description: '右键菜单内容', propsSchema: commonProps });
  registry.register({ name: 'ContextMenuItem', component: ContextMenuItem, category: 'navigation' as ComponentCategory, description: '右键菜单项', propsSchema: commonProps });
  registry.register({ name: 'ContextMenuSeparator', component: ContextMenuSeparator, category: 'navigation' as ComponentCategory, description: '右键菜单分隔符', propsSchema: commonProps });
  registry.register({ name: 'ContextMenuShortcut', component: ContextMenuShortcut, category: 'navigation' as ComponentCategory, description: '右键菜单快捷键', propsSchema: commonProps });

  // DropdownMenu
  registry.register({ name: 'DropdownMenu', component: DropdownMenu, category: 'navigation' as ComponentCategory, description: '下拉菜单', propsSchema: commonProps });
  registry.register({ name: 'DropdownMenuTrigger', component: DropdownMenuTrigger, category: 'navigation' as ComponentCategory, description: '下拉菜单触发器', propsSchema: { ...commonProps, asChild: asChildProp } });
  registry.register({ name: 'DropdownMenuContent', component: DropdownMenuContent, category: 'navigation' as ComponentCategory, description: '下拉菜单内容', propsSchema: { ...commonProps, align: { type: 'string', required: false, description: '对齐方式', enum: ['start', 'center', 'end'] } } });
  registry.register({ name: 'DropdownMenuItem', component: DropdownMenuItem, category: 'navigation' as ComponentCategory, description: '下拉菜单项', propsSchema: { ...commonProps, disabled: { type: 'boolean', required: false, description: '是否禁用' } } });
  registry.register({ name: 'DropdownMenuSeparator', component: DropdownMenuSeparator, category: 'navigation' as ComponentCategory, description: '下拉菜单分隔符', propsSchema: commonProps });
  registry.register({ name: 'DropdownMenuLabel', component: DropdownMenuLabel, category: 'navigation' as ComponentCategory, description: '下拉菜单标签', propsSchema: commonProps });
  registry.register({ name: 'DropdownMenuGroup', component: DropdownMenuGroup, category: 'navigation' as ComponentCategory, description: '下拉菜单分组', propsSchema: commonProps });

  // ==========================================================================
  // 反馈组件 (Feedback)
  // ==========================================================================

  registry.register({
    name: 'Alert',
    component: Alert,
    category: 'feedback' as ComponentCategory,
    description: '警告提示组件',
    propsSchema: {
      ...commonProps,
      variant: { type: 'string', required: false, description: '样式', enum: ['default', 'destructive'] },
    },
  });
  registry.register({ name: 'AlertTitle', component: AlertTitle, category: 'feedback' as ComponentCategory, description: '警告标题', propsSchema: commonProps });
  registry.register({ name: 'AlertDescription', component: AlertDescription, category: 'feedback' as ComponentCategory, description: '警告描述', propsSchema: commonProps });

  // Dialog
  registry.register({ name: 'Dialog', component: Dialog, category: 'feedback' as ComponentCategory, description: '对话框组件', propsSchema: { ...commonProps, open: { type: 'boolean', required: false, description: '是否打开' } } });
  registry.register({ name: 'DialogTrigger', component: DialogTrigger, category: 'feedback' as ComponentCategory, description: '对话框触发器', propsSchema: { ...commonProps, asChild: asChildProp } });
  registry.register({ name: 'DialogContent', component: DialogContent, category: 'feedback' as ComponentCategory, description: '对话框内容', propsSchema: commonProps });
  registry.register({ name: 'DialogHeader', component: DialogHeader, category: 'feedback' as ComponentCategory, description: '对话框头部', propsSchema: commonProps });
  registry.register({ name: 'DialogFooter', component: DialogFooter, category: 'feedback' as ComponentCategory, description: '对话框底部', propsSchema: commonProps });
  registry.register({ name: 'DialogTitle', component: DialogTitle, category: 'feedback' as ComponentCategory, description: '对话框标题', propsSchema: commonProps });
  registry.register({ name: 'DialogDescription', component: DialogDescription, category: 'feedback' as ComponentCategory, description: '对话框描述', propsSchema: commonProps });

  // AlertDialog
  registry.register({ name: 'AlertDialog', component: AlertDialog, category: 'feedback' as ComponentCategory, description: '确认对话框', propsSchema: { ...commonProps, open: { type: 'boolean', required: false, description: '是否打开' } } });
  registry.register({ name: 'AlertDialogTrigger', component: AlertDialogTrigger, category: 'feedback' as ComponentCategory, description: '确认对话框触发器', propsSchema: { ...commonProps, asChild: asChildProp } });
  registry.register({ name: 'AlertDialogContent', component: AlertDialogContent, category: 'feedback' as ComponentCategory, description: '确认对话框内容', propsSchema: commonProps });
  registry.register({ name: 'AlertDialogHeader', component: AlertDialogHeader, category: 'feedback' as ComponentCategory, description: '确认对话框头部', propsSchema: commonProps });
  registry.register({ name: 'AlertDialogFooter', component: AlertDialogFooter, category: 'feedback' as ComponentCategory, description: '确认对话框底部', propsSchema: commonProps });
  registry.register({ name: 'AlertDialogTitle', component: AlertDialogTitle, category: 'feedback' as ComponentCategory, description: '确认对话框标题', propsSchema: commonProps });
  registry.register({ name: 'AlertDialogDescription', component: AlertDialogDescription, category: 'feedback' as ComponentCategory, description: '确认对话框描述', propsSchema: commonProps });
  registry.register({ name: 'AlertDialogAction', component: AlertDialogAction, category: 'feedback' as ComponentCategory, description: '确认对话框确认按钮', propsSchema: commonProps });
  registry.register({ name: 'AlertDialogCancel', component: AlertDialogCancel, category: 'feedback' as ComponentCategory, description: '确认对话框取消按钮', propsSchema: commonProps });

  // Sheet
  registry.register({ name: 'Sheet', component: Sheet, category: 'feedback' as ComponentCategory, description: '侧边抽屉组件', propsSchema: { ...commonProps, open: { type: 'boolean', required: false, description: '是否打开' } } });
  registry.register({ name: 'SheetTrigger', component: SheetTrigger, category: 'feedback' as ComponentCategory, description: '侧边抽屉触发器', propsSchema: { ...commonProps, asChild: asChildProp } });
  registry.register({ name: 'SheetContent', component: SheetContent, category: 'feedback' as ComponentCategory, description: '侧边抽屉内容', propsSchema: { ...commonProps, side: { type: 'string', required: false, description: '方向', enum: ['top', 'right', 'bottom', 'left'] } } });
  registry.register({ name: 'SheetHeader', component: SheetHeader, category: 'feedback' as ComponentCategory, description: '侧边抽屉头部', propsSchema: commonProps });
  registry.register({ name: 'SheetFooter', component: SheetFooter, category: 'feedback' as ComponentCategory, description: '侧边抽屉底部', propsSchema: commonProps });
  registry.register({ name: 'SheetTitle', component: SheetTitle, category: 'feedback' as ComponentCategory, description: '侧边抽屉标题', propsSchema: commonProps });
  registry.register({ name: 'SheetDescription', component: SheetDescription, category: 'feedback' as ComponentCategory, description: '侧边抽屉描述', propsSchema: commonProps });

  // Drawer
  registry.register({ name: 'Drawer', component: Drawer, category: 'feedback' as ComponentCategory, description: '底部抽屉组件', propsSchema: { ...commonProps, open: { type: 'boolean', required: false, description: '是否打开' } } });
  registry.register({ name: 'DrawerTrigger', component: DrawerTrigger, category: 'feedback' as ComponentCategory, description: '底部抽屉触发器', propsSchema: { ...commonProps, asChild: asChildProp } });
  registry.register({ name: 'DrawerContent', component: DrawerContent, category: 'feedback' as ComponentCategory, description: '底部抽屉内容', propsSchema: commonProps });
  registry.register({ name: 'DrawerHeader', component: DrawerHeader, category: 'feedback' as ComponentCategory, description: '底部抽屉头部', propsSchema: commonProps });
  registry.register({ name: 'DrawerFooter', component: DrawerFooter, category: 'feedback' as ComponentCategory, description: '底部抽屉底部', propsSchema: commonProps });
  registry.register({ name: 'DrawerTitle', component: DrawerTitle, category: 'feedback' as ComponentCategory, description: '底部抽屉标题', propsSchema: commonProps });
  registry.register({ name: 'DrawerDescription', component: DrawerDescription, category: 'feedback' as ComponentCategory, description: '底部抽屉描述', propsSchema: commonProps });


  // Popover
  registry.register({ name: 'Popover', component: Popover, category: 'feedback' as ComponentCategory, description: '弹出框组件', propsSchema: commonProps });
  registry.register({ name: 'PopoverTrigger', component: PopoverTrigger, category: 'feedback' as ComponentCategory, description: '弹出框触发器', propsSchema: { ...commonProps, asChild: asChildProp } });
  registry.register({ name: 'PopoverContent', component: PopoverContent, category: 'feedback' as ComponentCategory, description: '弹出框内容', propsSchema: { ...commonProps, align: { type: 'string', required: false, description: '对齐方式', enum: ['start', 'center', 'end'] }, side: { type: 'string', required: false, description: '位置', enum: ['top', 'right', 'bottom', 'left'] } } });

  // Tooltip
  registry.register({ name: 'TooltipProvider', component: TooltipProvider as unknown as React.ComponentType<Record<string, unknown>>, category: 'feedback' as ComponentCategory, description: '提示框提供者', propsSchema: commonProps });
  registry.register({ name: 'Tooltip', component: Tooltip, category: 'feedback' as ComponentCategory, description: '提示框组件', propsSchema: commonProps });
  registry.register({ name: 'TooltipTrigger', component: TooltipTrigger, category: 'feedback' as ComponentCategory, description: '提示框触发器', propsSchema: { ...commonProps, asChild: asChildProp } });
  registry.register({ name: 'TooltipContent', component: TooltipContent, category: 'feedback' as ComponentCategory, description: '提示框内容', propsSchema: { ...commonProps, side: { type: 'string', required: false, description: '位置', enum: ['top', 'right', 'bottom', 'left'] }, align: { type: 'string', required: false, description: '对齐方式', enum: ['start', 'center', 'end'] } } });

  // HoverCard
  registry.register({ name: 'HoverCard', component: HoverCard, category: 'feedback' as ComponentCategory, description: '悬停卡片组件', propsSchema: commonProps });
  registry.register({ name: 'HoverCardTrigger', component: HoverCardTrigger, category: 'feedback' as ComponentCategory, description: '悬停卡片触发器', propsSchema: { ...commonProps, asChild: asChildProp } });
  registry.register({ name: 'HoverCardContent', component: HoverCardContent, category: 'feedback' as ComponentCategory, description: '悬停卡片内容', propsSchema: commonProps });

  // Command
  registry.register({ name: 'Command', component: Command, category: 'feedback' as ComponentCategory, description: '命令面板组件', propsSchema: commonProps });
  registry.register({ name: 'CommandInput', component: CommandInput, category: 'feedback' as ComponentCategory, description: '命令输入框', propsSchema: { ...commonProps, placeholder: { type: 'string', required: false, description: '占位文本' } } });
  registry.register({ name: 'CommandList', component: CommandList, category: 'feedback' as ComponentCategory, description: '命令列表', propsSchema: commonProps });
  registry.register({ name: 'CommandEmpty', component: CommandEmpty, category: 'feedback' as ComponentCategory, description: '命令空状态', propsSchema: commonProps });
  registry.register({ name: 'CommandGroup', component: CommandGroup, category: 'feedback' as ComponentCategory, description: '命令分组', propsSchema: { ...commonProps, heading: { type: 'string', required: false, description: '分组标题' } } });
  registry.register({ name: 'CommandItem', component: CommandItem, category: 'feedback' as ComponentCategory, description: '命令项', propsSchema: commonProps });
  registry.register({ name: 'CommandSeparator', component: CommandSeparator, category: 'feedback' as ComponentCategory, description: '命令分隔符', propsSchema: commonProps });

  // ==========================================================================
  // v4 新增组件 (Empty, Spinner)
  // ==========================================================================

  // Empty 空状态组件
  registry.register({ name: 'Empty', component: Empty, category: 'feedback' as ComponentCategory, description: '空状态容器组件，用于显示无数据状态', propsSchema: commonProps });
  registry.register({ name: 'EmptyHeader', component: EmptyHeader, category: 'feedback' as ComponentCategory, description: '空状态头部', propsSchema: commonProps });
  registry.register({ name: 'EmptyTitle', component: EmptyTitle, category: 'feedback' as ComponentCategory, description: '空状态标题', propsSchema: commonProps });
  registry.register({ name: 'EmptyDescription', component: EmptyDescription, category: 'feedback' as ComponentCategory, description: '空状态描述', propsSchema: commonProps });
  registry.register({ name: 'EmptyContent', component: EmptyContent, category: 'feedback' as ComponentCategory, description: '空状态内容区域', propsSchema: commonProps });
  registry.register({
    name: 'EmptyMedia',
    component: EmptyMedia,
    category: 'feedback' as ComponentCategory,
    description: '空状态媒体/图标区域',
    propsSchema: {
      ...commonProps,
      variant: { type: 'string', required: false, description: '样式变体', enum: ['default', 'icon'] },
    },
  });

  // Spinner 加载指示器
  registry.register({
    name: 'Spinner',
    component: Spinner,
    category: 'feedback' as ComponentCategory,
    description: '加载指示器组件，显示旋转动画',
    propsSchema: commonProps,
  });

  // CardAction (v4 新增)
  registry.register({
    name: 'CardAction',
    component: CardAction,
    category: 'layout' as ComponentCategory,
    description: '卡片操作区域，用于放置卡片右上角的操作按钮',
    propsSchema: commonProps,
  });

  // ==========================================================================
  // 基础包装组件 (Text, Container, Icon)
  // ==========================================================================

  registry.register({
    name: 'Text',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('span', { className, ...rest }, children as React.ReactNode);
    },
    category: 'display' as ComponentCategory,
    description: '文本组件',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'Container',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('div', { className, ...rest }, children as React.ReactNode);
    },
    category: 'layout' as ComponentCategory,
    description: '容器组件',
    propsSchema: commonProps,
  });

  // Initialize default icons
  if (defaultIconRegistry.size === 0) {
    initializeDefaultIcons();
  }

  registry.register({
    name: 'Icon',
    component: (props: Record<string, unknown>) => {
      const { name, className, size = 'default', color = 'default', strokeWidth = 'default', ...rest } = props;
      const iconDef = defaultIconRegistry.get(name as string);
      if (!iconDef) {
        return React.createElement('span', { className, ...rest }, `[${name}]`);
      }
      const sizeMap: Record<string, number> = { xs: 12, sm: 14, default: 16, md: 20, lg: 24, xl: 32, '2xl': 48 };
      const resolvedSize = typeof size === 'number' ? size : (sizeMap[size as string] || 16);
      const colorMap: Record<string, string> = {
        default: 'currentColor', muted: 'hsl(215.4 16.3% 46.9%)', primary: 'hsl(222.2 47.4% 11.2%)',
        secondary: 'hsl(210 40% 96.1%)', destructive: 'hsl(0 84.2% 60.2%)', success: 'hsl(142.1 76.2% 36.3%)',
        warning: 'hsl(47.9 95.8% 53.1%)', info: 'hsl(199.4 95.5% 53.8%)',
      };
      const resolvedColor = colorMap[color as string] || (color as string) || 'currentColor';
      const strokeWidthMap: Record<string, number> = { thin: 1.5, default: 2, bold: 2.5 };
      const resolvedStrokeWidth = typeof strokeWidth === 'number' ? strokeWidth : (strokeWidthMap[strokeWidth as string] || 2);
      const svgWithProps = iconDef.svg
        .replace(/width="24"/, `width="${resolvedSize}"`).replace(/height="24"/, `height="${resolvedSize}"`)
        .replace(/stroke="currentColor"/, `stroke="${resolvedColor}"`).replace(/stroke-width="2"/, `stroke-width="${resolvedStrokeWidth}"`);
      return React.createElement('span', {
        className: `inline-flex items-center justify-center ${className || ''}`.trim(),
        style: { width: resolvedSize, height: resolvedSize },
        dangerouslySetInnerHTML: { __html: svgWithProps }, ...rest,
      });
    },
    category: 'display' as ComponentCategory,
    description: '图标组件。可用图标: home, settings, search, user, menu, check, x, plus, minus, arrow-up/down/left/right, chevron-up/down/left/right, share, heart, file, folder, download, upload, trash, edit, copy, save, mail, phone, bell, send 等',
    propsSchema: {
      ...commonProps,
      name: { type: 'string', required: true, description: '图标名称', enum: ['home', 'settings', 'search', 'user', 'menu', 'check', 'x', 'plus', 'minus', 'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right', 'share', 'heart', 'thumbs-up', 'message-circle', 'file', 'folder', 'download', 'upload', 'trash', 'image', 'video', 'music', 'play', 'pause', 'edit', 'copy', 'save', 'refresh', 'filter', 'external-link', 'link', 'log-in', 'log-out', 'mail', 'phone', 'bell', 'send'] },
      size: { type: 'string', required: false, description: '尺寸: xs/sm/default/md/lg/xl/2xl', enum: ['xs', 'sm', 'default', 'md', 'lg', 'xl', '2xl'] },
      color: { type: 'string', required: false, description: '颜色: default/muted/primary/destructive/success/warning/info', enum: ['default', 'muted', 'primary', 'secondary', 'destructive', 'success', 'warning', 'info'] },
      strokeWidth: { type: 'string', required: false, description: '线宽: thin/default/bold', enum: ['thin', 'default', 'bold'] },
    },
  });

  // ==========================================================================
  // 小写别名 (Lowercase Aliases for LLM compatibility)
  // ==========================================================================

  const lowercaseAliases: Array<{ name: string; original: string }> = [
    { name: 'button', original: 'Button' }, { name: 'input', original: 'Input' }, { name: 'label', original: 'Label' },
    { name: 'textarea', original: 'Textarea' }, { name: 'card', original: 'Card' }, { name: 'table', original: 'Table' },
    { name: 'checkbox', original: 'Checkbox' }, { name: 'switch', original: 'Switch' }, { name: 'slider', original: 'Slider' },
    { name: 'badge', original: 'Badge' }, { name: 'avatar', original: 'Avatar' }, { name: 'progress', original: 'Progress' },
    { name: 'skeleton', original: 'Skeleton' }, { name: 'separator', original: 'Separator' }, { name: 'tabs', original: 'Tabs' },
    { name: 'alert', original: 'Alert' }, { name: 'dialog', original: 'Dialog' }, { name: 'popover', original: 'Popover' },
    { name: 'tooltip', original: 'Tooltip' }, { name: 'text', original: 'Text' }, { name: 'container', original: 'Container' },
    { name: 'icon', original: 'Icon' }, { name: 'empty', original: 'Empty' }, { name: 'spinner', original: 'Spinner' },
    // 布局容器别名（LLM 常用）
    { name: 'Box', original: 'Container' }, { name: 'box', original: 'Container' },
    { name: 'Div', original: 'Container' }, { name: 'div', original: 'Container' },
    { name: 'Wrapper', original: 'Container' }, { name: 'wrapper', original: 'Container' },
    { name: 'Section', original: 'Container' }, { name: 'section', original: 'Container' },
    { name: 'View', original: 'Container' }, { name: 'view', original: 'Container' },
    { name: 'Flex', original: 'Container' }, { name: 'flex', original: 'Container' },
    { name: 'Grid', original: 'Container' }, { name: 'grid', original: 'Container' },
    { name: 'Stack', original: 'Container' }, { name: 'stack', original: 'Container' },
    { name: 'Row', original: 'Container' }, { name: 'row', original: 'Container' },
    { name: 'Column', original: 'Container' }, { name: 'column', original: 'Container' },
  ];

  for (const alias of lowercaseAliases) {
    const original = registry.get(alias.original);
    if (original) {
      registry.register({
        name: alias.name,
        component: original.component,
        category: original.category,
        description: `小写别名: ${alias.original}`,
        propsSchema: original.propsSchema,
      });
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export function initializeDefaultRegistry(): ComponentRegistry {
  registerShadcnComponents(defaultRegistry);
  return defaultRegistry;
}

export function getRegisteredComponentNames(registry: ComponentRegistry = defaultRegistry): string[] {
  return registry.getAll().map(def => def.name);
}
