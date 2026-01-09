/**
 * @file components.ts
 * @description Cherry Studio 主题的组件注册
 * @module lib/themes/builtin/cherry
 * @requirements 4.1
 */

import React from 'react';
import { ComponentRegistry } from '../../../core/component-registry';
import type { PropSchema, ComponentCategory } from '../../../core/component-registry';
import type { ThemeComponents } from '../../types';

// Import Cherry Studio components
import { Message } from '../../../../components/cherry/chat/Message';
import { Inputbar } from '../../../../components/cherry/chat/Inputbar';
import { MessageHeader } from '../../../../components/cherry/chat/MessageHeader';
import { MessageContent } from '../../../../components/cherry/chat/MessageContent';
import { MessageFooter } from '../../../../components/cherry/chat/MessageFooter';
import { InputbarTools } from '../../../../components/cherry/chat/InputbarTools';

import { Sidebar } from '../../../../components/cherry/app/Sidebar';
import { Navbar, NavbarLeft, NavbarCenter, NavbarRight } from '../../../../components/cherry/app/Navbar';
import { WindowControls } from '../../../../components/cherry/app/WindowControls';

import { EmojiAvatar } from '../../../../components/cherry/avatar/EmojiAvatar';
import { ModelAvatar } from '../../../../components/cherry/avatar/ModelAvatar';
import { AssistantAvatar } from '../../../../components/cherry/avatar/AssistantAvatar';

import { ActionIconButton } from '../../../../components/cherry/buttons/ActionIconButton';

import { ModelSelector } from '../../../../components/cherry/selector/ModelSelector';

import { BaseTag, VisionTag, ReasoningTag, WebSearchTag, ToolsCallingTag, FreeTag } from '../../../../components/cherry/tags';

import { CodeBlock } from '../../../../components/cherry/code/CodeBlock';
import { CodeToolbar } from '../../../../components/cherry/code/CodeToolbar';

import { VirtualList } from '../../../../components/cherry/list/VirtualList';
import { DraggableList } from '../../../../components/cherry/list/DraggableList';

import { ConfirmDialog } from '../../../../components/cherry/popup/ConfirmDialog';
import { SearchPopup } from '../../../../components/cherry/popup/SearchPopup';
import { SelectModelPopup } from '../../../../components/cherry/popup/SelectModelPopup';

// Import Cherry native base components (no shadcn-ui dependency)
import { CherryButton } from '../../../../components/cherry/base/CherryButton';
import { CherryInput } from '../../../../components/cherry/base/CherryInput';
import { 
  CherryCard, 
  CherryCardHeader, 
  CherryCardTitle, 
  CherryCardDescription, 
  CherryCardContent, 
  CherryCardFooter 
} from '../../../../components/cherry/base/CherryCard';
import { CherryLabel } from '../../../../components/cherry/base/CherryLabel';
import { CherryTextarea } from '../../../../components/cherry/base/CherryTextarea';
import { CherrySwitch } from '../../../../components/cherry/base/CherrySwitch';
import { CherryBadge } from '../../../../components/cherry/base/CherryBadge';

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
 * 创建 Cherry Studio 组件注册表
 */
export function createCherryComponentRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry();

  // ============================================================================
  // Cherry 专属组件
  // ============================================================================

  // Chat components
  registry.register({
    name: 'CherryMessage',
    component: Message,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio style chat message component',
    propsSchema: {
      ...commonProps,
      role: {
        type: 'string',
        required: true,
        description: 'Message role: user or assistant',
        enum: ['user', 'assistant'],
      },
      content: {
        type: 'string',
        required: false,
        description: 'Message text content',
      },
      timestamp: {
        type: 'string',
        required: false,
        description: 'Message timestamp',
      },
    },
  });

  registry.register({
    name: 'CherryInputbar',
    component: Inputbar,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio style message input bar',
    propsSchema: {
      ...commonProps,
      placeholder: {
        type: 'string',
        required: false,
        description: 'Input placeholder text',
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the input is disabled',
      },
      onSend: {
        type: 'function',
        required: false,
        description: 'Callback when message is sent',
      },
    },
  });

  registry.register({
    name: 'CherryMessageHeader',
    component: MessageHeader,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio message header with avatar and name',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryMessageContent',
    component: MessageContent,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio message content area',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryMessageFooter',
    component: MessageFooter,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio message footer with actions',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryInputbarTools',
    component: InputbarTools,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio input bar toolbar',
    propsSchema: commonProps,
  });

  // App framework components
  registry.register({
    name: 'CherrySidebar',
    component: Sidebar,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio vertical sidebar navigation',
    propsSchema: {
      ...commonProps,
      items: {
        type: 'array',
        required: false,
        description: 'Sidebar navigation items',
      },
      activeId: {
        type: 'string',
        required: false,
        description: 'Currently active item ID',
      },
    },
  });

  registry.register({
    name: 'CherryNavbar',
    component: Navbar,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio top navigation bar',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryNavbarLeft',
    component: NavbarLeft,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio navbar left section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryNavbarCenter',
    component: NavbarCenter,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio navbar center section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryNavbarRight',
    component: NavbarRight,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio navbar right section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryWindowControls',
    component: WindowControls,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio window control buttons (minimize, maximize, close)',
    propsSchema: commonProps,
  });

  // Avatar components
  registry.register({
    name: 'CherryEmojiAvatar',
    component: EmojiAvatar,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio emoji avatar component',
    propsSchema: {
      ...commonProps,
      emoji: {
        type: 'string',
        required: true,
        description: 'Emoji character to display',
      },
      size: {
        type: 'string',
        required: false,
        description: 'Avatar size',
        enum: ['sm', 'md', 'lg'],
      },
      backgroundColor: {
        type: 'string',
        required: false,
        description: 'Background color',
      },
    },
  });

  registry.register({
    name: 'CherryModelAvatar',
    component: ModelAvatar,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio model avatar with provider logo',
    propsSchema: {
      ...commonProps,
      model: {
        type: 'object',
        required: true,
        description: 'Model information object',
      },
      size: {
        type: 'string',
        required: false,
        description: 'Avatar size',
        enum: ['sm', 'md', 'lg'],
      },
    },
  });

  registry.register({
    name: 'CherryAssistantAvatar',
    component: AssistantAvatar,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio assistant avatar',
    propsSchema: {
      ...commonProps,
      name: {
        type: 'string',
        required: false,
        description: 'Assistant name',
      },
      emoji: {
        type: 'string',
        required: false,
        description: 'Avatar emoji',
      },
    },
  });

  // Button components
  registry.register({
    name: 'CherryActionIconButton',
    component: ActionIconButton,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio icon action button',
    propsSchema: {
      ...commonProps,
      icon: {
        type: 'string',
        required: true,
        description: 'Icon name',
      },
      size: {
        type: 'string',
        required: false,
        description: 'Button size',
        enum: ['sm', 'md', 'lg'],
      },
      tooltip: {
        type: 'string',
        required: false,
        description: 'Tooltip text',
      },
      onClick: {
        type: 'function',
        required: false,
        description: 'Click handler',
      },
    },
  });

  // Selector components
  registry.register({
    name: 'CherryModelSelector',
    component: ModelSelector,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio model selector dropdown',
    propsSchema: {
      ...commonProps,
      providers: {
        type: 'array',
        required: false,
        description: 'List of model providers',
      },
      selectedModel: {
        type: 'string',
        required: false,
        description: 'Currently selected model ID',
      },
      onSelect: {
        type: 'function',
        required: false,
        description: 'Selection change handler',
      },
    },
  });

  // Tag components
  registry.register({
    name: 'CherryBaseTag',
    component: BaseTag,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio base tag component',
    propsSchema: {
      ...commonProps,
      label: {
        type: 'string',
        required: true,
        description: 'Tag label text',
      },
      color: {
        type: 'string',
        required: false,
        description: 'Tag color',
      },
    },
  });

  registry.register({
    name: 'CherryVisionTag',
    component: VisionTag,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio vision capability tag',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryReasoningTag',
    component: ReasoningTag,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio reasoning capability tag',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryWebSearchTag',
    component: WebSearchTag,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio web search capability tag',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryToolsCallingTag',
    component: ToolsCallingTag,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio tools calling capability tag',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CherryFreeTag',
    component: FreeTag,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio free tier tag',
    propsSchema: commonProps,
  });

  // Code components
  registry.register({
    name: 'CherryCodeBlock',
    component: CodeBlock,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio code block with syntax highlighting',
    propsSchema: {
      ...commonProps,
      code: {
        type: 'string',
        required: true,
        description: 'Code content',
      },
      language: {
        type: 'string',
        required: false,
        description: 'Programming language',
      },
      showLineNumbers: {
        type: 'boolean',
        required: false,
        description: 'Whether to show line numbers',
      },
    },
  });

  registry.register({
    name: 'CherryCodeToolbar',
    component: CodeToolbar,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio code block toolbar',
    propsSchema: commonProps,
  });

  // List components
  registry.register({
    name: 'CherryVirtualList',
    component: VirtualList,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio virtualized list for large datasets',
    propsSchema: {
      ...commonProps,
      items: {
        type: 'array',
        required: true,
        description: 'List items',
      },
      itemHeight: {
        type: 'number',
        required: false,
        description: 'Height of each item',
      },
      renderItem: {
        type: 'function',
        required: true,
        description: 'Item render function',
      },
    },
  });

  registry.register({
    name: 'CherryDraggableList',
    component: DraggableList,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio draggable list',
    propsSchema: {
      ...commonProps,
      items: {
        type: 'array',
        required: true,
        description: 'List items',
      },
      onReorder: {
        type: 'function',
        required: false,
        description: 'Reorder callback',
      },
    },
  });

  // Popup components
  registry.register({
    name: 'CherryConfirmDialog',
    component: ConfirmDialog,
    category: 'feedback' as ComponentCategory,
    description: 'Cherry Studio confirmation dialog',
    propsSchema: {
      ...commonProps,
      title: {
        type: 'string',
        required: true,
        description: 'Dialog title',
      },
      message: {
        type: 'string',
        required: false,
        description: 'Dialog message',
      },
      onConfirm: {
        type: 'function',
        required: false,
        description: 'Confirm callback',
      },
      onCancel: {
        type: 'function',
        required: false,
        description: 'Cancel callback',
      },
    },
  });

  registry.register({
    name: 'CherrySearchPopup',
    component: SearchPopup,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio search popup',
    propsSchema: {
      ...commonProps,
      placeholder: {
        type: 'string',
        required: false,
        description: 'Search placeholder',
      },
      onSearch: {
        type: 'function',
        required: false,
        description: 'Search callback',
      },
    },
  });

  registry.register({
    name: 'CherrySelectModelPopup',
    component: SelectModelPopup,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio model selection popup',
    propsSchema: {
      ...commonProps,
      providers: {
        type: 'array',
        required: false,
        description: 'Model providers',
      },
      onSelect: {
        type: 'function',
        required: false,
        description: 'Selection callback',
      },
    },
  });

  // ============================================================================
  // Cherry 原生基础组件（独立于 shadcn-ui）
  // ============================================================================

  // Button component
  registry.register({
    name: 'Button',
    component: CherryButton,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio 风格按钮组件',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string',
        required: false,
        description: 'Button style variant',
        enum: ['default', 'primary', 'secondary', 'ghost', 'outline', 'destructive', 'link'],
      },
      size: {
        type: 'string',
        required: false,
        description: 'Button size',
        enum: ['sm', 'md', 'lg', 'icon'],
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the button is disabled',
      },
      loading: {
        type: 'boolean',
        required: false,
        description: 'Whether the button is in loading state',
      },
    },
  });

  // Input component
  registry.register({
    name: 'Input',
    component: CherryInput,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio 风格输入框组件',
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
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the input is disabled',
      },
      error: {
        type: 'boolean',
        required: false,
        description: 'Whether the input has error state',
      },
      inputSize: {
        type: 'string',
        required: false,
        description: 'Input size',
        enum: ['sm', 'md', 'lg'],
      },
    },
  });

  // Card components
  registry.register({
    name: 'Card',
    component: CherryCard,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio 风格卡片容器',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string',
        required: false,
        description: 'Card variant',
        enum: ['default', 'elevated', 'outlined', 'filled'],
      },
      clickable: {
        type: 'boolean',
        required: false,
        description: 'Whether the card is clickable',
      },
      selected: {
        type: 'boolean',
        required: false,
        description: 'Whether the card is selected',
      },
    },
  });

  registry.register({
    name: 'CardHeader',
    component: CherryCardHeader,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio 卡片头部',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardTitle',
    component: CherryCardTitle,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio 卡片标题',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardDescription',
    component: CherryCardDescription,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio 卡片描述',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardContent',
    component: CherryCardContent,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio 卡片内容区',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardFooter',
    component: CherryCardFooter,
    category: 'layout' as ComponentCategory,
    description: 'Cherry Studio 卡片底部',
    propsSchema: commonProps,
  });

  // Label component
  registry.register({
    name: 'Label',
    component: CherryLabel,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio 风格表单标签',
    propsSchema: {
      ...commonProps,
      htmlFor: {
        type: 'string',
        required: false,
        description: 'ID of the associated form element',
      },
      required: {
        type: 'boolean',
        required: false,
        description: 'Whether the field is required',
      },
    },
  });

  // Textarea component
  registry.register({
    name: 'Textarea',
    component: CherryTextarea,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio 风格多行文本框',
    propsSchema: {
      ...commonProps,
      placeholder: {
        type: 'string',
        required: false,
        description: 'Placeholder text',
      },
      rows: {
        type: 'number',
        required: false,
        description: 'Number of visible text lines',
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the textarea is disabled',
      },
      error: {
        type: 'boolean',
        required: false,
        description: 'Whether the textarea has error state',
      },
      autoResize: {
        type: 'boolean',
        required: false,
        description: 'Whether to auto resize based on content',
      },
    },
  });

  // Switch component
  registry.register({
    name: 'Switch',
    component: CherrySwitch,
    category: 'input' as ComponentCategory,
    description: 'Cherry Studio 风格开关组件',
    propsSchema: {
      ...commonProps,
      checked: {
        type: 'boolean',
        required: false,
        description: 'Whether the switch is checked',
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the switch is disabled',
      },
      size: {
        type: 'string',
        required: false,
        description: 'Switch size',
        enum: ['sm', 'md', 'lg'],
      },
    },
  });

  // Badge component (Cherry native)
  registry.register({
    name: 'Badge',
    component: CherryBadge,
    category: 'display' as ComponentCategory,
    description: 'Cherry Studio 风格徽章组件',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string',
        required: false,
        description: 'Badge variant',
        enum: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'outline'],
      },
      size: {
        type: 'string',
        required: false,
        description: 'Badge size',
        enum: ['sm', 'md', 'lg'],
      },
    },
  });

  // Initialize default icons if not already done
  if (defaultIconRegistry.size === 0) {
    initializeDefaultIcons();
  }

  // Icon component
  registry.register({
    name: 'Icon',
    component: (props: Record<string, unknown>) => {
      const { name, className, size = 16, ...rest } = props;
      const iconDef = defaultIconRegistry.get(name as string);
      if (!iconDef) {
        return React.createElement('span', { className, ...rest }, `[${name}]`);
      }
      const svgWithSize = iconDef.svg
        .replace(/width="24"/, `width="${size}"`)
        .replace(/height="24"/, `height="${size}"`);
      return React.createElement('span', {
        className,
        dangerouslySetInnerHTML: { __html: svgWithSize },
        ...rest,
      });
    },
    category: 'display' as ComponentCategory,
    description: 'An icon component that renders SVG icons from the icon registry',
    propsSchema: {
      ...commonProps,
      name: {
        type: 'string',
        required: true,
        description: 'Icon name from registry',
      },
      size: {
        type: 'number',
        required: false,
        description: 'Icon size in pixels (default: 16)',
      },
    },
  });

  // Text component
  registry.register({
    name: 'Text',
    component: (props: Record<string, unknown>) => {
      const { children, text, className, ...rest } = props;
      return React.createElement('span', { className, ...rest }, (children || text) as React.ReactNode);
    },
    category: 'display' as ComponentCategory,
    description: 'A simple text display component',
    propsSchema: {
      ...commonProps,
      text: {
        type: 'string',
        required: false,
        description: 'Text content (alternative to children)',
      },
    },
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

  return registry;
}

/**
 * Cherry Studio 主题组件配置
 */
export const cherryComponents: ThemeComponents = {
  registry: createCherryComponentRegistry(),
  aliases: {
    // 组件别名映射
    'box': 'Container',
    'div': 'Container',
    'span': 'Text',
    'p': 'Text',
    // Cherry 组件别名
    'Message': 'CherryMessage',
    'Inputbar': 'CherryInputbar',
    'Sidebar': 'CherrySidebar',
    'Navbar': 'CherryNavbar',
    'ModelSelector': 'CherryModelSelector',
    'CodeBlock': 'CherryCodeBlock',
  },
  categories: [
    {
      id: 'layout',
      name: '布局组件',
      description: 'Cherry Studio 风格的布局组件',
      componentIds: [
        'Container', 'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter',
        'CherrySidebar', 'CherryNavbar', 'CherryNavbarLeft', 'CherryNavbarCenter', 'CherryNavbarRight',
        'CherryWindowControls',
      ],
    },
    {
      id: 'input',
      name: '输入组件',
      description: 'Cherry Studio 风格的输入组件',
      componentIds: [
        'Button', 'Input', 'Label', 'Textarea', 'Switch',
        'CherryInputbar', 'CherryInputbarTools', 'CherryActionIconButton',
        'CherryModelSelector', 'CherrySearchPopup', 'CherrySelectModelPopup',
      ],
    },
    {
      id: 'display',
      name: '展示组件',
      description: 'Cherry Studio 风格的展示组件',
      componentIds: [
        'Text', 'Icon', 'Badge',
        'CherryMessage', 'CherryMessageHeader', 'CherryMessageContent', 'CherryMessageFooter',
        'CherryEmojiAvatar', 'CherryModelAvatar', 'CherryAssistantAvatar',
        'CherryBaseTag', 'CherryVisionTag', 'CherryReasoningTag', 'CherryWebSearchTag',
        'CherryToolsCallingTag', 'CherryFreeTag',
        'CherryCodeBlock', 'CherryCodeToolbar',
        'CherryVirtualList', 'CherryDraggableList',
      ],
    },
    {
      id: 'feedback',
      name: '反馈组件',
      description: 'Cherry Studio 风格的反馈组件',
      componentIds: ['CherryConfirmDialog'],
    },
  ],
};
