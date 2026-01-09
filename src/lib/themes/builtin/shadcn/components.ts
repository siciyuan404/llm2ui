/**
 * @file components.ts
 * @description shadcn-ui 主题的组件注册
 * @module lib/themes/builtin/shadcn
 * @requirements 4.1
 * 
 * 优化内容：
 * - 注册更多已有的 UI 组件（Badge, Avatar, Progress, Skeleton, Separator, Alert 等）
 * - 添加更完整的 props schema
 * - 优化组件分类
 */

import React from 'react';
import { ComponentRegistry } from '../../../core/component-registry';
import type { PropSchema, ComponentCategory } from '../../../core/component-registry';
import type { ThemeComponents } from '../../types';

// Import shadcn-ui components
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../../components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../../../../components/ui/table';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';
import { Badge } from '../../../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';
import { Progress } from '../../../../components/ui/progress';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Separator } from '../../../../components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/tabs';
import { ScrollArea, ScrollBar } from '../../../../components/ui/scroll-area';
import { Slider } from '../../../../components/ui/slider';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../../../../components/ui/tooltip';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from '../../../../components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '../../../../components/ui/dropdown-menu';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../../../components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import { Toggle } from '../../../../components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '../../../../components/ui/toggle-group';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../../../../components/ui/collapsible';
import { AspectRatio } from '../../../../components/ui/aspect-ratio';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../../../../components/ui/hover-card';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../components/ui/popover';

// Import icon registry
import { defaultIconRegistry, initializeDefaultIcons } from '../../../utils/icon-registry';

/**
 * 通用属性 Schema
 */
const commonProps: Record<string, PropSchema> = {
  className: {
    type: 'string',
    required: false,
    description: 'Additional CSS class names',
  },
  children: {
    type: 'object',
    required: false,
    description: 'Child elements',
  },
};

/**
 * 创建 shadcn-ui 组件注册表
 */
export function createShadcnComponentRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry();

  // Button component
  registry.register({
    name: 'Button',
    component: Button,
    category: 'input' as ComponentCategory,
    description: 'A clickable button component with multiple variants',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string',
        required: false,
        description: 'Button style variant',
        enum: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      },
      size: {
        type: 'string',
        required: false,
        description: 'Button size',
        enum: ['default', 'sm', 'lg', 'icon'],
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the button is disabled',
      },
      asChild: {
        type: 'boolean',
        required: false,
        description: 'Render as child element',
      },
      onClick: {
        type: 'function',
        required: false,
        description: 'Click event handler',
      },
    },
  });

  // Input component
  registry.register({
    name: 'Input',
    component: Input,
    category: 'input' as ComponentCategory,
    description: 'A text input field component',
    propsSchema: {
      ...commonProps,
      type: {
        type: 'string',
        required: false,
        description: 'Input type',
        enum: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
      },
      placeholder: {
        type: 'string',
        required: false,
        description: 'Placeholder text',
      },
      value: {
        type: 'string',
        required: false,
        description: 'Input value',
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the input is disabled',
      },
      onChange: {
        type: 'function',
        required: false,
        description: 'Change event handler',
      },
    },
  });

  // Card components
  registry.register({
    name: 'Card',
    component: Card,
    category: 'layout' as ComponentCategory,
    description: 'A card container component',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardHeader',
    component: CardHeader,
    category: 'layout' as ComponentCategory,
    description: 'Card header section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardTitle',
    component: CardTitle,
    category: 'layout' as ComponentCategory,
    description: 'Card title element',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardDescription',
    component: CardDescription,
    category: 'layout' as ComponentCategory,
    description: 'Card description text',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardContent',
    component: CardContent,
    category: 'layout' as ComponentCategory,
    description: 'Card content section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardFooter',
    component: CardFooter,
    category: 'layout' as ComponentCategory,
    description: 'Card footer section',
    propsSchema: commonProps,
  });

  // Table components
  registry.register({
    name: 'Table',
    component: Table,
    category: 'display' as ComponentCategory,
    description: 'A table component for displaying tabular data',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableHeader',
    component: TableHeader,
    category: 'display' as ComponentCategory,
    description: 'Table header section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableBody',
    component: TableBody,
    category: 'display' as ComponentCategory,
    description: 'Table body section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableFooter',
    component: TableFooter,
    category: 'display' as ComponentCategory,
    description: 'Table footer section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableHead',
    component: TableHead,
    category: 'display' as ComponentCategory,
    description: 'Table header cell',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableRow',
    component: TableRow,
    category: 'display' as ComponentCategory,
    description: 'Table row element',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableCell',
    component: TableCell,
    category: 'display' as ComponentCategory,
    description: 'Table data cell',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableCaption',
    component: TableCaption,
    category: 'display' as ComponentCategory,
    description: 'Table caption element',
    propsSchema: commonProps,
  });

  // Label component
  registry.register({
    name: 'Label',
    component: Label,
    category: 'input' as ComponentCategory,
    description: 'A label component for form elements',
    propsSchema: {
      ...commonProps,
      htmlFor: {
        type: 'string',
        required: false,
        description: 'ID of the associated form element',
      },
    },
  });

  // Textarea component
  registry.register({
    name: 'Textarea',
    component: Textarea,
    category: 'input' as ComponentCategory,
    description: 'A multi-line text input component',
    propsSchema: {
      ...commonProps,
      placeholder: {
        type: 'string',
        required: false,
        description: 'Placeholder text',
      },
      value: {
        type: 'string',
        required: false,
        description: 'Textarea value',
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the textarea is disabled',
      },
      rows: {
        type: 'number',
        required: false,
        description: 'Number of visible text lines',
      },
      onChange: {
        type: 'function',
        required: false,
        description: 'Change event handler',
      },
    },
  });

  // Switch component
  registry.register({
    name: 'Switch',
    component: Switch,
    category: 'input' as ComponentCategory,
    description: 'A toggle switch component for boolean states',
    propsSchema: {
      ...commonProps,
      checked: {
        type: 'boolean',
        required: false,
        description: 'Whether the switch is checked',
      },
      defaultChecked: {
        type: 'boolean',
        required: false,
        description: 'Default checked state',
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the switch is disabled',
      },
      onCheckedChange: {
        type: 'function',
        required: false,
        description: 'Callback when checked state changes',
      },
    },
  });

  // ============================================================================
  // 新增组件注册
  // ============================================================================

  // Badge component
  registry.register({
    name: 'Badge',
    component: Badge,
    category: 'display' as ComponentCategory,
    description: 'A badge component for status indicators and labels',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string',
        required: false,
        description: 'Badge style variant',
        enum: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning'],
      },
    },
  });

  // Avatar components
  registry.register({
    name: 'Avatar',
    component: Avatar,
    category: 'display' as ComponentCategory,
    description: 'An avatar component for user profile images',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'AvatarImage',
    component: AvatarImage,
    category: 'display' as ComponentCategory,
    description: 'Avatar image element',
    propsSchema: {
      ...commonProps,
      src: { type: 'string', required: false, description: 'Image source URL' },
      alt: { type: 'string', required: false, description: 'Alt text for the image' },
    },
  });

  registry.register({
    name: 'AvatarFallback',
    component: AvatarFallback,
    category: 'display' as ComponentCategory,
    description: 'Avatar fallback content when image fails to load',
    propsSchema: commonProps,
  });

  // Progress component
  registry.register({
    name: 'Progress',
    component: Progress,
    category: 'feedback' as ComponentCategory,
    description: 'A progress bar component for showing completion status',
    propsSchema: {
      ...commonProps,
      value: { type: 'number', required: false, description: 'Progress value (0-100)' },
      max: { type: 'number', required: false, description: 'Maximum value' },
    },
  });

  // Skeleton component
  registry.register({
    name: 'Skeleton',
    component: Skeleton,
    category: 'feedback' as ComponentCategory,
    description: 'A skeleton loading placeholder component',
    propsSchema: commonProps,
  });

  // Separator component
  registry.register({
    name: 'Separator',
    component: Separator,
    category: 'layout' as ComponentCategory,
    description: 'A visual separator component',
    propsSchema: {
      ...commonProps,
      orientation: {
        type: 'string',
        required: false,
        description: 'Separator orientation',
        enum: ['horizontal', 'vertical'],
      },
    },
  });

  // Alert components
  registry.register({
    name: 'Alert',
    component: Alert,
    category: 'feedback' as ComponentCategory,
    description: 'An alert component for displaying messages',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string',
        required: false,
        description: 'Alert style variant',
        enum: ['default', 'destructive', 'warning', 'success'],
      },
    },
  });

  registry.register({
    name: 'AlertTitle',
    component: AlertTitle,
    category: 'feedback' as ComponentCategory,
    description: 'Alert title element',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'AlertDescription',
    component: AlertDescription,
    category: 'feedback' as ComponentCategory,
    description: 'Alert description text',
    propsSchema: commonProps,
  });

  // Checkbox component
  registry.register({
    name: 'Checkbox',
    component: Checkbox,
    category: 'input' as ComponentCategory,
    description: 'A checkbox component for boolean selection',
    propsSchema: {
      ...commonProps,
      checked: { type: 'boolean', required: false, description: 'Whether the checkbox is checked' },
      disabled: { type: 'boolean', required: false, description: 'Whether the checkbox is disabled' },
      onCheckedChange: { type: 'function', required: false, description: 'Callback when checked state changes' },
    },
  });

  // Tabs components
  registry.register({
    name: 'Tabs',
    component: Tabs,
    category: 'navigation' as ComponentCategory,
    description: 'A tabs container component',
    propsSchema: {
      ...commonProps,
      defaultValue: { type: 'string', required: false, description: 'Default active tab value' },
      value: { type: 'string', required: false, description: 'Controlled active tab value' },
      onValueChange: { type: 'function', required: false, description: 'Callback when tab changes' },
    },
  });

  registry.register({
    name: 'TabsList',
    component: TabsList,
    category: 'navigation' as ComponentCategory,
    description: 'Tabs list container',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TabsTrigger',
    component: TabsTrigger as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'navigation' as ComponentCategory,
    description: 'Tab trigger button',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: true, description: 'Tab value identifier' },
      disabled: { type: 'boolean', required: false, description: 'Whether the tab is disabled' },
    },
  });

  registry.register({
    name: 'TabsContent',
    component: TabsContent as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'navigation' as ComponentCategory,
    description: 'Tab content panel',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: true, description: 'Tab value identifier' },
    },
  });

  // ScrollArea components
  registry.register({
    name: 'ScrollArea',
    component: ScrollArea,
    category: 'layout' as ComponentCategory,
    description: 'A custom scrollable area component',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'ScrollBar',
    component: ScrollBar,
    category: 'layout' as ComponentCategory,
    description: 'Custom scrollbar element',
    propsSchema: {
      ...commonProps,
      orientation: {
        type: 'string',
        required: false,
        description: 'Scrollbar orientation',
        enum: ['horizontal', 'vertical'],
      },
    },
  });

  // Slider component
  registry.register({
    name: 'Slider',
    component: Slider,
    category: 'input' as ComponentCategory,
    description: 'A slider component for range selection',
    propsSchema: {
      ...commonProps,
      value: { type: 'array', required: false, description: 'Slider value(s)' },
      defaultValue: { type: 'array', required: false, description: 'Default slider value(s)' },
      min: { type: 'number', required: false, description: 'Minimum value' },
      max: { type: 'number', required: false, description: 'Maximum value' },
      step: { type: 'number', required: false, description: 'Step increment' },
      disabled: { type: 'boolean', required: false, description: 'Whether the slider is disabled' },
      onValueChange: { type: 'function', required: false, description: 'Callback when value changes' },
    },
  });

  // Tooltip components
  registry.register({
    name: 'TooltipProvider',
    component: TooltipProvider as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'feedback' as ComponentCategory,
    description: 'Tooltip provider wrapper',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'Tooltip',
    component: Tooltip,
    category: 'feedback' as ComponentCategory,
    description: 'A tooltip component for additional information',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TooltipTrigger',
    component: TooltipTrigger,
    category: 'feedback' as ComponentCategory,
    description: 'Tooltip trigger element',
    propsSchema: { ...commonProps, asChild: { type: 'boolean', required: false, description: 'Render as child element' } },
  });

  registry.register({
    name: 'TooltipContent',
    component: TooltipContent,
    category: 'feedback' as ComponentCategory,
    description: 'Tooltip content panel',
    propsSchema: {
      ...commonProps,
      side: { type: 'string', required: false, description: 'Tooltip position', enum: ['top', 'right', 'bottom', 'left'] },
      align: { type: 'string', required: false, description: 'Tooltip alignment', enum: ['start', 'center', 'end'] },
    },
  });

  // Select components
  registry.register({
    name: 'Select',
    component: Select,
    category: 'input' as ComponentCategory,
    description: 'A select dropdown component',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: false, description: 'Selected value' },
      defaultValue: { type: 'string', required: false, description: 'Default selected value' },
      onValueChange: { type: 'function', required: false, description: 'Callback when value changes' },
      disabled: { type: 'boolean', required: false, description: 'Whether the select is disabled' },
    },
  });

  registry.register({
    name: 'SelectTrigger',
    component: SelectTrigger,
    category: 'input' as ComponentCategory,
    description: 'Select trigger button',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'SelectValue',
    component: SelectValue,
    category: 'input' as ComponentCategory,
    description: 'Select value display',
    propsSchema: { ...commonProps, placeholder: { type: 'string', required: false, description: 'Placeholder text' } },
  });

  registry.register({
    name: 'SelectContent',
    component: SelectContent,
    category: 'input' as ComponentCategory,
    description: 'Select dropdown content',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'SelectItem',
    component: SelectItem as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'input' as ComponentCategory,
    description: 'Select option item',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: true, description: 'Option value' },
      disabled: { type: 'boolean', required: false, description: 'Whether the option is disabled' },
    },
  });

  registry.register({
    name: 'SelectGroup',
    component: SelectGroup,
    category: 'input' as ComponentCategory,
    description: 'Select option group',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'SelectLabel',
    component: SelectLabel,
    category: 'input' as ComponentCategory,
    description: 'Select group label',
    propsSchema: commonProps,
  });

  // Dialog components
  registry.register({
    name: 'Dialog',
    component: Dialog,
    category: 'feedback' as ComponentCategory,
    description: 'A modal dialog component',
    propsSchema: {
      ...commonProps,
      open: { type: 'boolean', required: false, description: 'Whether the dialog is open' },
      onOpenChange: { type: 'function', required: false, description: 'Callback when open state changes' },
    },
  });

  registry.register({
    name: 'DialogTrigger',
    component: DialogTrigger,
    category: 'feedback' as ComponentCategory,
    description: 'Dialog trigger element',
    propsSchema: { ...commonProps, asChild: { type: 'boolean', required: false, description: 'Render as child element' } },
  });

  registry.register({
    name: 'DialogContent',
    component: DialogContent,
    category: 'feedback' as ComponentCategory,
    description: 'Dialog content panel',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'DialogHeader',
    component: DialogHeader,
    category: 'feedback' as ComponentCategory,
    description: 'Dialog header section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'DialogFooter',
    component: DialogFooter,
    category: 'feedback' as ComponentCategory,
    description: 'Dialog footer section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'DialogTitle',
    component: DialogTitle,
    category: 'feedback' as ComponentCategory,
    description: 'Dialog title element',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'DialogDescription',
    component: DialogDescription,
    category: 'feedback' as ComponentCategory,
    description: 'Dialog description text',
    propsSchema: commonProps,
  });

  // DropdownMenu components
  registry.register({
    name: 'DropdownMenu',
    component: DropdownMenu,
    category: 'navigation' as ComponentCategory,
    description: 'A dropdown menu component',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'DropdownMenuTrigger',
    component: DropdownMenuTrigger,
    category: 'navigation' as ComponentCategory,
    description: 'Dropdown menu trigger',
    propsSchema: { ...commonProps, asChild: { type: 'boolean', required: false, description: 'Render as child element' } },
  });

  registry.register({
    name: 'DropdownMenuContent',
    component: DropdownMenuContent,
    category: 'navigation' as ComponentCategory,
    description: 'Dropdown menu content',
    propsSchema: {
      ...commonProps,
      align: { type: 'string', required: false, description: 'Menu alignment', enum: ['start', 'center', 'end'] },
    },
  });

  registry.register({
    name: 'DropdownMenuItem',
    component: DropdownMenuItem,
    category: 'navigation' as ComponentCategory,
    description: 'Dropdown menu item',
    propsSchema: {
      ...commonProps,
      disabled: { type: 'boolean', required: false, description: 'Whether the item is disabled' },
    },
  });

  registry.register({
    name: 'DropdownMenuSeparator',
    component: DropdownMenuSeparator,
    category: 'navigation' as ComponentCategory,
    description: 'Dropdown menu separator',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'DropdownMenuLabel',
    component: DropdownMenuLabel,
    category: 'navigation' as ComponentCategory,
    description: 'Dropdown menu label',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'DropdownMenuGroup',
    component: DropdownMenuGroup,
    category: 'navigation' as ComponentCategory,
    description: 'Dropdown menu group',
    propsSchema: commonProps,
  });

  // Accordion components
  registry.register({
    name: 'Accordion',
    component: Accordion as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'layout' as ComponentCategory,
    description: 'An accordion component for collapsible content',
    propsSchema: {
      ...commonProps,
      type: { type: 'string', required: false, description: 'Accordion type', enum: ['single', 'multiple'] },
      collapsible: { type: 'boolean', required: false, description: 'Whether items can be collapsed' },
    },
  });

  registry.register({
    name: 'AccordionItem',
    component: AccordionItem as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'layout' as ComponentCategory,
    description: 'Accordion item container',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: true, description: 'Item value identifier' },
    },
  });

  registry.register({
    name: 'AccordionTrigger',
    component: AccordionTrigger,
    category: 'layout' as ComponentCategory,
    description: 'Accordion item trigger',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'AccordionContent',
    component: AccordionContent,
    category: 'layout' as ComponentCategory,
    description: 'Accordion item content',
    propsSchema: commonProps,
  });

  // RadioGroup components
  registry.register({
    name: 'RadioGroup',
    component: RadioGroup,
    category: 'input' as ComponentCategory,
    description: 'A radio button group component',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: false, description: 'Selected value' },
      defaultValue: { type: 'string', required: false, description: 'Default selected value' },
      onValueChange: { type: 'function', required: false, description: 'Callback when value changes' },
      disabled: { type: 'boolean', required: false, description: 'Whether the group is disabled' },
    },
  });

  registry.register({
    name: 'RadioGroupItem',
    component: RadioGroupItem as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'input' as ComponentCategory,
    description: 'Radio button item',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: true, description: 'Radio value' },
      disabled: { type: 'boolean', required: false, description: 'Whether the radio is disabled' },
    },
  });

  // Breadcrumb components
  registry.register({
    name: 'Breadcrumb',
    component: Breadcrumb,
    category: 'navigation' as ComponentCategory,
    description: 'A breadcrumb navigation component',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'BreadcrumbList',
    component: BreadcrumbList,
    category: 'navigation' as ComponentCategory,
    description: 'Breadcrumb list container',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'BreadcrumbItem',
    component: BreadcrumbItem,
    category: 'navigation' as ComponentCategory,
    description: 'Breadcrumb item',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'BreadcrumbLink',
    component: BreadcrumbLink,
    category: 'navigation' as ComponentCategory,
    description: 'Breadcrumb link',
    propsSchema: {
      ...commonProps,
      href: { type: 'string', required: false, description: 'Link URL' },
      asChild: { type: 'boolean', required: false, description: 'Render as child element' },
    },
  });

  registry.register({
    name: 'BreadcrumbPage',
    component: BreadcrumbPage,
    category: 'navigation' as ComponentCategory,
    description: 'Breadcrumb current page',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'BreadcrumbSeparator',
    component: BreadcrumbSeparator,
    category: 'navigation' as ComponentCategory,
    description: 'Breadcrumb separator',
    propsSchema: commonProps,
  });

  // Toggle components
  registry.register({
    name: 'Toggle',
    component: Toggle,
    category: 'input' as ComponentCategory,
    description: 'A toggle button component',
    propsSchema: {
      ...commonProps,
      variant: { type: 'string', required: false, description: 'Toggle variant', enum: ['default', 'outline'] },
      size: { type: 'string', required: false, description: 'Toggle size', enum: ['default', 'sm', 'lg'] },
      pressed: { type: 'boolean', required: false, description: 'Whether the toggle is pressed' },
      onPressedChange: { type: 'function', required: false, description: 'Callback when pressed state changes' },
    },
  });

  registry.register({
    name: 'ToggleGroup',
    component: ToggleGroup as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'input' as ComponentCategory,
    description: 'A toggle button group component',
    propsSchema: {
      ...commonProps,
      type: { type: 'string', required: true, description: 'Group type', enum: ['single', 'multiple'] },
      value: { type: 'string', required: false, description: 'Selected value(s)' },
      onValueChange: { type: 'function', required: false, description: 'Callback when value changes' },
    },
  });

  registry.register({
    name: 'ToggleGroupItem',
    component: ToggleGroupItem as unknown as React.ComponentType<Record<string, unknown>>,
    category: 'input' as ComponentCategory,
    description: 'Toggle group item',
    propsSchema: {
      ...commonProps,
      value: { type: 'string', required: true, description: 'Item value' },
    },
  });

  // Collapsible components
  registry.register({
    name: 'Collapsible',
    component: Collapsible,
    category: 'layout' as ComponentCategory,
    description: 'A collapsible content component',
    propsSchema: {
      ...commonProps,
      open: { type: 'boolean', required: false, description: 'Whether the content is open' },
      onOpenChange: { type: 'function', required: false, description: 'Callback when open state changes' },
    },
  });

  registry.register({
    name: 'CollapsibleTrigger',
    component: CollapsibleTrigger,
    category: 'layout' as ComponentCategory,
    description: 'Collapsible trigger element',
    propsSchema: { ...commonProps, asChild: { type: 'boolean', required: false, description: 'Render as child element' } },
  });

  registry.register({
    name: 'CollapsibleContent',
    component: CollapsibleContent,
    category: 'layout' as ComponentCategory,
    description: 'Collapsible content panel',
    propsSchema: commonProps,
  });

  // AspectRatio component
  registry.register({
    name: 'AspectRatio',
    component: AspectRatio,
    category: 'layout' as ComponentCategory,
    description: 'A component for maintaining aspect ratio',
    propsSchema: {
      ...commonProps,
      ratio: { type: 'number', required: false, description: 'Aspect ratio (width/height)' },
    },
  });

  // HoverCard components
  registry.register({
    name: 'HoverCard',
    component: HoverCard,
    category: 'feedback' as ComponentCategory,
    description: 'A hover card component for additional info on hover',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'HoverCardTrigger',
    component: HoverCardTrigger,
    category: 'feedback' as ComponentCategory,
    description: 'Hover card trigger element',
    propsSchema: { ...commonProps, asChild: { type: 'boolean', required: false, description: 'Render as child element' } },
  });

  registry.register({
    name: 'HoverCardContent',
    component: HoverCardContent,
    category: 'feedback' as ComponentCategory,
    description: 'Hover card content panel',
    propsSchema: commonProps,
  });

  // Popover components
  registry.register({
    name: 'Popover',
    component: Popover,
    category: 'feedback' as ComponentCategory,
    description: 'A popover component for floating content',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'PopoverTrigger',
    component: PopoverTrigger,
    category: 'feedback' as ComponentCategory,
    description: 'Popover trigger element',
    propsSchema: { ...commonProps, asChild: { type: 'boolean', required: false, description: 'Render as child element' } },
  });

  registry.register({
    name: 'PopoverContent',
    component: PopoverContent,
    category: 'feedback' as ComponentCategory,
    description: 'Popover content panel',
    propsSchema: {
      ...commonProps,
      align: { type: 'string', required: false, description: 'Popover alignment', enum: ['start', 'center', 'end'] },
      side: { type: 'string', required: false, description: 'Popover position', enum: ['top', 'right', 'bottom', 'left'] },
    },
  });

  // Initialize default icons if not already done
  if (defaultIconRegistry.size === 0) {
    initializeDefaultIcons();
  }

  /**
   * Icon 组件
   * 
   * 用于渲染 SVG 图标，支持从图标注册表中按名称获取图标。
   * 
   * ## LLM 使用指南
   * 
   * ### 可用图标名称（按分类）
   * - general: home, settings, search, user, menu, check, x, plus, minus
   * - arrow: arrow-up, arrow-down, arrow-left, arrow-right, chevron-up, chevron-down, chevron-left, chevron-right
   * - social: share, heart, thumbs-up, message-circle
   * - file: file, folder, download, upload, trash
   * - media: image, video, music, play, pause
   * - action: edit, copy, save, refresh, filter
   * - navigation: external-link, link, log-in, log-out
   * - communication: mail, phone, bell, send
   * 
   * ### 尺寸选项
   * - xs: 12px（超小）
   * - sm: 14px（小）
   * - default: 16px（默认）
   * - md: 20px（中等）
   * - lg: 24px（大）
   * - xl: 32px（超大）
   * - 2xl: 48px（特大）
   * - 或直接传入数字
   * 
   * ### 颜色选项
   * - default: 继承当前文本颜色
   * - muted: 静音灰色
   * - primary: 主色
   * - destructive: 红色（危险操作）
   * - success: 绿色（成功状态）
   * - warning: 黄色（警告状态）
   * - info: 蓝色（信息状态）
   * - 或直接传入 CSS 颜色值
   * 
   * ### 线条宽度选项
   * - thin: 1.5（细线）
   * - default: 2（默认）
   * - bold: 2.5（粗线）
   * - 或直接传入数字
   * 
   * ### 使用示例
   * ```json
   * { "type": "Icon", "props": { "name": "home" } }
   * { "type": "Icon", "props": { "name": "check", "size": "lg", "color": "success" } }
   * { "type": "Icon", "props": { "name": "x", "size": 20, "color": "destructive", "strokeWidth": "bold" } }
   * { "type": "Icon", "props": { "name": "settings", "className": "animate-spin" } }
   * ```
   */
  registry.register({
    name: 'Icon',
    component: (props: Record<string, unknown>) => {
      const { 
        name, 
        className, 
        size = 'default', 
        color = 'default',
        strokeWidth = 'default',
        ...rest 
      } = props;
      
      const iconDef = defaultIconRegistry.get(name as string);
      if (!iconDef) {
        return React.createElement('span', { className, ...rest }, `[${name}]`);
      }
      
      // 尺寸映射
      const sizeMap: Record<string, number> = {
        xs: 12,
        sm: 14,
        default: 16,
        md: 20,
        lg: 24,
        xl: 32,
        '2xl': 48,
      };
      const resolvedSize = typeof size === 'number' ? size : (sizeMap[size as string] || 16);
      
      // 颜色映射
      const colorMap: Record<string, string> = {
        default: 'currentColor',
        muted: 'hsl(215.4 16.3% 46.9%)',
        primary: 'hsl(222.2 47.4% 11.2%)',
        secondary: 'hsl(210 40% 96.1%)',
        destructive: 'hsl(0 84.2% 60.2%)',
        success: 'hsl(142.1 76.2% 36.3%)',
        warning: 'hsl(47.9 95.8% 53.1%)',
        info: 'hsl(199.4 95.5% 53.8%)',
      };
      const resolvedColor = colorMap[color as string] || (color as string) || 'currentColor';
      
      // 线条宽度映射
      const strokeWidthMap: Record<string, number> = {
        thin: 1.5,
        default: 2,
        bold: 2.5,
      };
      const resolvedStrokeWidth = typeof strokeWidth === 'number' 
        ? strokeWidth 
        : (strokeWidthMap[strokeWidth as string] || 2);
      
      // 替换 SVG 属性
      let svgWithProps = iconDef.svg
        .replace(/width="24"/, `width="${resolvedSize}"`)
        .replace(/height="24"/, `height="${resolvedSize}"`)
        .replace(/stroke="currentColor"/, `stroke="${resolvedColor}"`)
        .replace(/stroke-width="2"/, `stroke-width="${resolvedStrokeWidth}"`);
      
      return React.createElement('span', {
        className: `inline-flex items-center justify-center ${className || ''}`.trim(),
        style: { width: resolvedSize, height: resolvedSize },
        dangerouslySetInnerHTML: { __html: svgWithProps },
        ...rest,
      });
    },
    category: 'display' as ComponentCategory,
    description: `图标组件，用于渲染 SVG 图标。支持多种尺寸(xs/sm/default/md/lg/xl/2xl)、颜色(default/muted/primary/destructive/success/warning/info)和线条宽度(thin/default/bold)。可用图标: home, settings, search, user, menu, check, x, plus, minus, arrow-up/down/left/right, chevron-up/down/left/right, share, heart, file, folder, download, upload, trash, edit, copy, save, mail, phone, bell, send 等。`,
    propsSchema: {
      ...commonProps,
      name: {
        type: 'string',
        required: true,
        description: '图标名称。可选值: home, settings, search, user, menu, check, x, plus, minus, arrow-up, arrow-down, arrow-left, arrow-right, chevron-up, chevron-down, chevron-left, chevron-right, share, heart, thumbs-up, message-circle, file, folder, download, upload, trash, image, video, music, play, pause, edit, copy, save, refresh, filter, external-link, link, log-in, log-out, mail, phone, bell, send',
        enum: [
          'home', 'settings', 'search', 'user', 'menu', 'check', 'x', 'plus', 'minus',
          'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
          'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
          'share', 'heart', 'thumbs-up', 'message-circle',
          'file', 'folder', 'download', 'upload', 'trash',
          'image', 'video', 'music', 'play', 'pause',
          'edit', 'copy', 'save', 'refresh', 'filter',
          'external-link', 'link', 'log-in', 'log-out',
          'mail', 'phone', 'bell', 'send',
        ],
      },
      size: {
        type: 'string',
        required: false,
        description: '图标尺寸。可选值: xs(12px), sm(14px), default(16px), md(20px), lg(24px), xl(32px), 2xl(48px)，或直接传入数字',
        enum: ['xs', 'sm', 'default', 'md', 'lg', 'xl', '2xl'],
      },
      color: {
        type: 'string',
        required: false,
        description: '图标颜色。可选值: default(继承), muted(灰色), primary(主色), destructive(红色), success(绿色), warning(黄色), info(蓝色)，或直接传入 CSS 颜色值',
        enum: ['default', 'muted', 'primary', 'secondary', 'destructive', 'success', 'warning', 'info'],
      },
      strokeWidth: {
        type: 'string',
        required: false,
        description: '线条宽度。可选值: thin(1.5), default(2), bold(2.5)，或直接传入数字',
        enum: ['thin', 'default', 'bold'],
      },
    },
  });

  // Text component
  registry.register({
    name: 'Text',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('span', { className, ...rest }, children as React.ReactNode);
    },
    category: 'display' as ComponentCategory,
    description: 'A simple text display component',
    propsSchema: commonProps,
  });

  // Container component
  registry.register({
    name: 'Container',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('div', { className, ...rest }, children as React.ReactNode);
    },
    category: 'layout' as ComponentCategory,
    description: 'A container component for layout purposes',
    propsSchema: commonProps,
  });

  // Register lowercase aliases for LLM compatibility
  registerLowercaseAliases(registry);

  return registry;
}

/**
 * 注册小写别名以兼容 LLM 生成
 */
function registerLowercaseAliases(registry: ComponentRegistry): void {
  const lowercaseAliases = [
    { name: 'button', component: Button, category: 'input' as ComponentCategory },
    { name: 'input', component: Input, category: 'input' as ComponentCategory },
    { name: 'card', component: Card, category: 'layout' as ComponentCategory },
    { name: 'cardHeader', component: CardHeader, category: 'layout' as ComponentCategory },
    { name: 'cardTitle', component: CardTitle, category: 'layout' as ComponentCategory },
    { name: 'cardDescription', component: CardDescription, category: 'layout' as ComponentCategory },
    { name: 'cardContent', component: CardContent, category: 'layout' as ComponentCategory },
    { name: 'cardFooter', component: CardFooter, category: 'layout' as ComponentCategory },
    { name: 'table', component: Table, category: 'display' as ComponentCategory },
    { name: 'tableHeader', component: TableHeader, category: 'display' as ComponentCategory },
    { name: 'tableBody', component: TableBody, category: 'display' as ComponentCategory },
    { name: 'tableFooter', component: TableFooter, category: 'display' as ComponentCategory },
    { name: 'tableHead', component: TableHead, category: 'display' as ComponentCategory },
    { name: 'tableRow', component: TableRow, category: 'display' as ComponentCategory },
    { name: 'tableCell', component: TableCell, category: 'display' as ComponentCategory },
    { name: 'tableCaption', component: TableCaption, category: 'display' as ComponentCategory },
    { name: 'label', component: Label, category: 'input' as ComponentCategory },
    { name: 'textarea', component: Textarea, category: 'input' as ComponentCategory },
    { name: 'switch', component: Switch, category: 'input' as ComponentCategory },
  ];

  for (const alias of lowercaseAliases) {
    registry.register({
      name: alias.name,
      component: alias.component,
      category: alias.category,
      description: `Lowercase alias for ${alias.name.charAt(0).toUpperCase() + alias.name.slice(1)}`,
      propsSchema: commonProps,
    });
  }

  // Text and Container lowercase aliases
  registry.register({
    name: 'text',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('span', { className, ...rest }, children as React.ReactNode);
    },
    category: 'display' as ComponentCategory,
    description: 'Lowercase alias for Text',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'container',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('div', { className, ...rest }, children as React.ReactNode);
    },
    category: 'layout' as ComponentCategory,
    description: 'Lowercase alias for Container',
    propsSchema: commonProps,
  });
}

/**
 * shadcn-ui 主题组件配置
 */
export const shadcnComponents: ThemeComponents = {
  registry: createShadcnComponentRegistry(),
  aliases: {
    // 组件别名映射
    'box': 'Container',
    'div': 'Container',
    'span': 'Text',
    'p': 'Text',
    'img': 'Avatar',
  },
  categories: [
    {
      id: 'layout',
      name: '布局组件',
      description: '用于页面布局和结构的组件',
      componentIds: [
        'Container', 'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter',
        'Separator', 'ScrollArea', 'ScrollBar', 'AspectRatio',
        'Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent',
        'Collapsible', 'CollapsibleTrigger', 'CollapsibleContent',
      ],
    },
    {
      id: 'input',
      name: '输入组件',
      description: '用于用户输入的表单组件',
      componentIds: [
        'Button', 'Input', 'Label', 'Textarea', 'Switch', 'Checkbox', 'Slider',
        'Select', 'SelectTrigger', 'SelectValue', 'SelectContent', 'SelectItem', 'SelectGroup', 'SelectLabel',
        'RadioGroup', 'RadioGroupItem',
        'Toggle', 'ToggleGroup', 'ToggleGroupItem',
      ],
    },
    {
      id: 'display',
      name: '展示组件',
      description: '用于数据展示的组件',
      componentIds: [
        'Text', 'Icon', 'Badge',
        'Avatar', 'AvatarImage', 'AvatarFallback',
        'Table', 'TableHeader', 'TableBody', 'TableFooter', 'TableHead', 'TableRow', 'TableCell', 'TableCaption',
      ],
    },
    {
      id: 'navigation',
      name: '导航组件',
      description: '用于页面导航的组件',
      componentIds: [
        'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent',
        'Breadcrumb', 'BreadcrumbList', 'BreadcrumbItem', 'BreadcrumbLink', 'BreadcrumbPage', 'BreadcrumbSeparator',
        'DropdownMenu', 'DropdownMenuTrigger', 'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuSeparator', 'DropdownMenuLabel', 'DropdownMenuGroup',
      ],
    },
    {
      id: 'feedback',
      name: '反馈组件',
      description: '用于用户反馈和状态提示的组件',
      componentIds: [
        'Alert', 'AlertTitle', 'AlertDescription',
        'Progress', 'Skeleton',
        'Dialog', 'DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogFooter', 'DialogTitle', 'DialogDescription',
        'Tooltip', 'TooltipProvider', 'TooltipTrigger', 'TooltipContent',
        'HoverCard', 'HoverCardTrigger', 'HoverCardContent',
        'Popover', 'PopoverTrigger', 'PopoverContent',
      ],
    },
  ],
};
