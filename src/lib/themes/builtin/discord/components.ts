/**
 * @file components.ts
 * @description Discord 主题的组件注册表
 * @module lib/themes/builtin/discord
 * @requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React from 'react';
import { ComponentRegistry } from '../../../core/component-registry';
import type { PropSchema, ComponentCategory } from '../../../core/component-registry';
import type { ThemeComponents, ComponentCategory as ThemeComponentCategory } from '../../types';

// Import base shadcn-ui components
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Badge } from '../../../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';

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
 * Discord 组件分类
 * @requirements 4.5
 */
export const discordComponentCategories: ThemeComponentCategory[] = [
  {
    id: 'layout',
    name: '布局组件',
    description: 'Discord 风格的布局组件',
    componentIds: [
      'Container', 'Card', 'CardHeader', 'CardTitle', 'CardDescription', 
      'CardContent', 'CardFooter', 'Flex', 'Grid',
      'DiscordServerList', 'DiscordChannelList',
    ],
  },
  {
    id: 'input',
    name: '输入组件',
    description: 'Discord 风格的输入组件',
    componentIds: [
      'Button', 'Input', 'Select', 'Checkbox', 'Label', 'Textarea', 'Switch',
      'DiscordMessageInput',
    ],
  },
  {
    id: 'display',
    name: '展示组件',
    description: 'Discord 风格的展示组件',
    componentIds: [
      'Text', 'Icon', 'Badge', 'Avatar',
      'DiscordMessage', 'DiscordUserStatus',
    ],
  },
  {
    id: 'discord',
    name: 'Discord 专属',
    description: 'Discord 特有的组件',
    componentIds: [
      'DiscordServerIcon', 'DiscordChannel', 'DiscordMember', 'DiscordVoiceChannel',
    ],
  },
];


/**
 * 创建 Discord 组件注册表
 * @requirements 4.1, 4.2, 4.3, 4.4
 */
export function createDiscordComponentRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry();

  // ============================================================================
  // 基础布局组件 (Requirements 4.1)
  // ============================================================================

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

  // Flex component
  registry.register({
    name: 'Flex',
    component: (props: Record<string, unknown>) => {
      const { children, className, direction = 'row', gap, align, justify, ...rest } = props;
      const style: React.CSSProperties = {
        display: 'flex',
        flexDirection: direction as React.CSSProperties['flexDirection'],
        gap: gap as string,
        alignItems: align as string,
        justifyContent: justify as string,
      };
      return React.createElement('div', { className, style, ...rest }, children as React.ReactNode);
    },
    category: 'layout' as ComponentCategory,
    description: 'A flexbox container component',
    propsSchema: {
      ...commonProps,
      direction: {
        type: 'string',
        required: false,
        description: 'Flex direction',
        enum: ['row', 'column', 'row-reverse', 'column-reverse'],
      },
      gap: {
        type: 'string',
        required: false,
        description: 'Gap between items',
      },
      align: {
        type: 'string',
        required: false,
        description: 'Align items',
      },
      justify: {
        type: 'string',
        required: false,
        description: 'Justify content',
      },
    },
  });

  // Grid component
  registry.register({
    name: 'Grid',
    component: (props: Record<string, unknown>) => {
      const { children, className, columns, gap, ...rest } = props;
      const style: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: columns as string,
        gap: gap as string,
      };
      return React.createElement('div', { className, style, ...rest }, children as React.ReactNode);
    },
    category: 'layout' as ComponentCategory,
    description: 'A CSS grid container component',
    propsSchema: {
      ...commonProps,
      columns: {
        type: 'string',
        required: false,
        description: 'Grid template columns',
      },
      gap: {
        type: 'string',
        required: false,
        description: 'Gap between items',
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

  // ============================================================================
  // 基础输入组件 (Requirements 4.2)
  // ============================================================================

  // Button component
  registry.register({
    name: 'Button',
    component: Button,
    category: 'input' as ComponentCategory,
    description: 'A clickable button component with Discord styling',
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
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the input is disabled',
      },
    },
  });

  // Select component (placeholder)
  registry.register({
    name: 'Select',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('select', { className, ...rest }, children as React.ReactNode);
    },
    category: 'input' as ComponentCategory,
    description: 'A select dropdown component',
    propsSchema: {
      ...commonProps,
      value: {
        type: 'string',
        required: false,
        description: 'Selected value',
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the select is disabled',
      },
    },
  });

  // Checkbox component
  registry.register({
    name: 'Checkbox',
    component: Checkbox,
    category: 'input' as ComponentCategory,
    description: 'A checkbox component',
    propsSchema: {
      ...commonProps,
      checked: {
        type: 'boolean',
        required: false,
        description: 'Whether the checkbox is checked',
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the checkbox is disabled',
      },
    },
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
    },
  });

  // Switch component
  registry.register({
    name: 'Switch',
    component: Switch,
    category: 'input' as ComponentCategory,
    description: 'A toggle switch component',
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
    },
  });

  // ============================================================================
  // 基础展示组件 (Requirements 4.3)
  // ============================================================================

  // Initialize default icons if not already done
  if (defaultIconRegistry.size === 0) {
    initializeDefaultIcons();
  }

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

  // Badge component
  registry.register({
    name: 'Badge',
    component: Badge,
    category: 'display' as ComponentCategory,
    description: 'A badge component for status indicators',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string',
        required: false,
        description: 'Badge variant',
        enum: ['default', 'secondary', 'destructive', 'outline'],
      },
    },
  });

  // Avatar component
  registry.register({
    name: 'Avatar',
    component: Avatar,
    category: 'display' as ComponentCategory,
    description: 'An avatar component for user images',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'AvatarImage',
    component: AvatarImage,
    category: 'display' as ComponentCategory,
    description: 'Avatar image element',
    propsSchema: {
      ...commonProps,
      src: {
        type: 'string',
        required: true,
        description: 'Image source URL',
      },
      alt: {
        type: 'string',
        required: false,
        description: 'Alt text for the image',
      },
    },
  });

  registry.register({
    name: 'AvatarFallback',
    component: AvatarFallback,
    category: 'display' as ComponentCategory,
    description: 'Avatar fallback content',
    propsSchema: commonProps,
  });

  // ============================================================================
  // Discord 专属组件 (Requirements 4.4)
  // ============================================================================

  // DiscordServerList component
  registry.register({
    name: 'DiscordServerList',
    component: (props: Record<string, unknown>) => {
      const { children, className, servers, ...rest } = props;
      return React.createElement('div', {
        className: `discord-server-list ${className || ''}`,
        style: { width: '72px', backgroundColor: 'var(--background-tertiary, #202225)' },
        ...rest,
      }, children as React.ReactNode);
    },
    category: 'layout' as ComponentCategory,
    description: 'Discord server list sidebar',
    propsSchema: {
      ...commonProps,
      servers: {
        type: 'array',
        required: false,
        description: 'List of server objects',
      },
    },
  });

  // DiscordChannelList component
  registry.register({
    name: 'DiscordChannelList',
    component: (props: Record<string, unknown>) => {
      const { children, className, channels, ...rest } = props;
      return React.createElement('div', {
        className: `discord-channel-list ${className || ''}`,
        style: { width: '240px', backgroundColor: 'var(--background-secondary, #2f3136)' },
        ...rest,
      }, children as React.ReactNode);
    },
    category: 'layout' as ComponentCategory,
    description: 'Discord channel list panel',
    propsSchema: {
      ...commonProps,
      channels: {
        type: 'array',
        required: false,
        description: 'List of channel objects',
      },
    },
  });

  // DiscordMessage component
  registry.register({
    name: 'DiscordMessage',
    component: (props: Record<string, unknown>) => {
      const { children, className, author, content, timestamp, ...rest } = props;
      return React.createElement('div', {
        className: `discord-message ${className || ''}`,
        style: { padding: '16px', display: 'flex', gap: '16px' },
        ...rest,
      }, children as React.ReactNode);
    },
    category: 'display' as ComponentCategory,
    description: 'Discord chat message component',
    propsSchema: {
      ...commonProps,
      author: {
        type: 'object',
        required: false,
        description: 'Message author information',
      },
      content: {
        type: 'string',
        required: false,
        description: 'Message content',
      },
      timestamp: {
        type: 'string',
        required: false,
        description: 'Message timestamp',
      },
    },
  });

  // DiscordUserStatus component
  registry.register({
    name: 'DiscordUserStatus',
    component: (props: Record<string, unknown>) => {
      const { className, status = 'online', ...rest } = props;
      const statusColors: Record<string, string> = {
        online: '#3ba55c',
        idle: '#faa61a',
        dnd: '#ed4245',
        offline: '#747f8d',
      };
      return React.createElement('span', {
        className: `discord-user-status ${className || ''}`,
        style: {
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: statusColors[status as string] || statusColors.offline,
          display: 'inline-block',
        },
        ...rest,
      });
    },
    category: 'display' as ComponentCategory,
    description: 'Discord user status indicator',
    propsSchema: {
      ...commonProps,
      status: {
        type: 'string',
        required: false,
        description: 'User status',
        enum: ['online', 'idle', 'dnd', 'offline'],
      },
    },
  });

  // DiscordServerIcon component
  registry.register({
    name: 'DiscordServerIcon',
    component: (props: Record<string, unknown>) => {
      const { className, name, icon, ...rest } = props;
      return React.createElement('div', {
        className: `discord-server-icon ${className || ''}`,
        style: {
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary, #5865F2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
        },
        ...rest,
      }, (name as string)?.charAt(0) || 'S');
    },
    category: 'discord' as ComponentCategory,
    description: 'Discord server icon',
    propsSchema: {
      ...commonProps,
      name: {
        type: 'string',
        required: false,
        description: 'Server name',
      },
      icon: {
        type: 'string',
        required: false,
        description: 'Server icon URL',
      },
    },
  });

  // DiscordChannel component
  registry.register({
    name: 'DiscordChannel',
    component: (props: Record<string, unknown>) => {
      const { className, name, type = 'text', ...rest } = props;
      const icon = type === 'voice' ? '🔊' : '#';
      return React.createElement('div', {
        className: `discord-channel ${className || ''}`,
        style: {
          height: '34px',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--muted-foreground, #72767d)',
          cursor: 'pointer',
        },
        ...rest,
      }, [
        React.createElement('span', { key: 'icon' }, icon),
        React.createElement('span', { key: 'name' }, name as string),
      ]);
    },
    category: 'discord' as ComponentCategory,
    description: 'Discord channel item',
    propsSchema: {
      ...commonProps,
      name: {
        type: 'string',
        required: true,
        description: 'Channel name',
      },
      type: {
        type: 'string',
        required: false,
        description: 'Channel type',
        enum: ['text', 'voice'],
      },
    },
  });

  // DiscordMember component
  registry.register({
    name: 'DiscordMember',
    component: (props: Record<string, unknown>) => {
      const { className, name, status = 'online', avatar, ...rest } = props;
      return React.createElement('div', {
        className: `discord-member ${className || ''}`,
        style: {
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        },
        ...rest,
      }, [
        React.createElement('div', {
          key: 'avatar',
          style: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary, #5865F2)',
          },
        }),
        React.createElement('span', { key: 'name' }, name as string),
      ]);
    },
    category: 'discord' as ComponentCategory,
    description: 'Discord member list item',
    propsSchema: {
      ...commonProps,
      name: {
        type: 'string',
        required: true,
        description: 'Member name',
      },
      status: {
        type: 'string',
        required: false,
        description: 'Member status',
        enum: ['online', 'idle', 'dnd', 'offline'],
      },
      avatar: {
        type: 'string',
        required: false,
        description: 'Avatar URL',
      },
    },
  });

  // DiscordVoiceChannel component
  registry.register({
    name: 'DiscordVoiceChannel',
    component: (props: Record<string, unknown>) => {
      const { className, name, users = [], ...rest } = props;
      return React.createElement('div', {
        className: `discord-voice-channel ${className || ''}`,
        style: {
          padding: '8px',
        },
        ...rest,
      }, [
        React.createElement('div', {
          key: 'header',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--muted-foreground, #72767d)',
          },
        }, [
          React.createElement('span', { key: 'icon' }, '🔊'),
          React.createElement('span', { key: 'name' }, name as string),
        ]),
      ]);
    },
    category: 'discord' as ComponentCategory,
    description: 'Discord voice channel with connected users',
    propsSchema: {
      ...commonProps,
      name: {
        type: 'string',
        required: true,
        description: 'Voice channel name',
      },
      users: {
        type: 'array',
        required: false,
        description: 'Connected users',
      },
    },
  });

  // DiscordMessageInput component
  registry.register({
    name: 'DiscordMessageInput',
    component: (props: Record<string, unknown>) => {
      const { className, placeholder = 'Message #channel', ...rest } = props;
      return React.createElement('div', {
        className: `discord-message-input ${className || ''}`,
        style: {
          padding: '16px',
          backgroundColor: 'var(--background, #36393f)',
        },
        ...rest,
      }, React.createElement('input', {
        type: 'text',
        placeholder: placeholder as string,
        style: {
          width: '100%',
          padding: '11px 16px',
          backgroundColor: 'var(--muted, #40444b)',
          border: 'none',
          borderRadius: '8px',
          color: 'var(--foreground, #dcddde)',
          outline: 'none',
        },
      }));
    },
    category: 'input' as ComponentCategory,
    description: 'Discord message input field',
    propsSchema: {
      ...commonProps,
      placeholder: {
        type: 'string',
        required: false,
        description: 'Input placeholder text',
      },
    },
  });

  return registry;
}

/**
 * Discord 主题组件配置
 */
export const discordComponents: ThemeComponents = {
  registry: createDiscordComponentRegistry(),
  aliases: {
    // 组件别名映射
    'box': 'Container',
    'div': 'Container',
    'span': 'Text',
    'p': 'Text',
    // Discord 组件别名
    'ServerList': 'DiscordServerList',
    'ChannelList': 'DiscordChannelList',
    'Message': 'DiscordMessage',
    'UserStatus': 'DiscordUserStatus',
  },
  categories: discordComponentCategories,
};
