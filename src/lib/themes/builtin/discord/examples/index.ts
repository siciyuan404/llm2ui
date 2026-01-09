/**
 * @file index.ts
 * @description Discord 主题的案例库
 * @module lib/themes/builtin/discord/examples
 * @requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

import type { ThemeExamples, ExampleMetadata, ExampleCategory, KeywordMapping } from '../../../types';

/**
 * Discord 案例分类
 */
export const discordExampleCategories: ExampleCategory[] = [
  { id: 'server-sidebar', name: '服务器侧边栏', description: '服务器列表和导航相关案例' },
  { id: 'channel-list', name: '频道列表', description: '频道列表和分类相关案例' },
  { id: 'message-area', name: '消息区域', description: '聊天消息和输入相关案例' },
  { id: 'user-panel', name: '用户面板', description: '用户信息和状态相关案例' },
  { id: 'settings', name: '设置界面', description: '设置和配置相关案例' },
];

/**
 * Discord 案例预设
 */
export const discordExamplePresets: ExampleMetadata[] = [
  // 服务器侧边栏案例
  {
    id: 'discord-server-sidebar',
    name: 'Discord 服务器侧边栏',
    description: '展示服务器图标列表的侧边栏',
    category: 'server-sidebar',
    tags: ['server', 'sidebar', 'navigation', 'guild'],
    tokenCount: 450,
    schema: {
      type: 'Flex',
      props: {
        direction: 'column',
        className: 'w-[72px] h-full bg-[#202225] py-3',
      },
      children: [
        {
          type: 'DiscordServerIcon',
          props: {
            name: 'Home',
            icon: '',
            active: false,
            hasNotification: false,
            className: 'mb-2',
          },
        },
        {
          type: 'Container',
          props: { className: 'w-8 h-[2px] bg-[#36393f] mx-auto mb-2' },
        },
        {
          type: 'DiscordServerIcon',
          props: {
            name: 'Gaming Server',
            icon: 'https://example.com/server1.png',
            active: true,
            hasNotification: false,
          },
        },
        {
          type: 'DiscordServerIcon',
          props: {
            name: 'Dev Community',
            icon: 'https://example.com/server2.png',
            active: false,
            hasNotification: true,
          },
        },
        {
          type: 'DiscordServerIcon',
          props: {
            name: 'Music Lovers',
            icon: '',
            active: false,
            hasNotification: false,
          },
        },
      ],
    },
  },
  {
    id: 'discord-server-list-with-folders',
    name: 'Discord 服务器列表（带文件夹）',
    description: '带有服务器文件夹分组的侧边栏',
    category: 'server-sidebar',
    tags: ['server', 'folder', 'organization', 'guild'],
    tokenCount: 520,
    schema: {
      type: 'Flex',
      props: {
        direction: 'column',
        gap: 'sm',
        className: 'w-[72px] h-full bg-[#202225] py-3 items-center',
      },
      children: [
        {
          type: 'Button',
          props: {
            variant: 'secondary',
            className: 'w-12 h-12 rounded-full bg-[#36393f] hover:bg-[#5865F2] hover:rounded-2xl transition-all',
          },
          children: [{ type: 'Icon', props: { name: 'home', size: 24 } }],
        },
        {
          type: 'Container',
          props: { className: 'w-8 h-[2px] bg-[#36393f]' },
        },
        {
          type: 'Flex',
          props: {
            direction: 'column',
            gap: 'xs',
            className: 'bg-[#36393f] rounded-2xl p-1',
          },
          children: [
            { type: 'Avatar', props: { src: '', alt: 'Server 1', size: 'md' } },
            { type: 'Avatar', props: { src: '', alt: 'Server 2', size: 'md' } },
          ],
        },
      ],
    },
  },

  // 频道列表案例
  {
    id: 'discord-channel-list',
    name: 'Discord 频道列表',
    description: '展示文字和语音频道的列表',
    category: 'channel-list',
    tags: ['channel', 'text', 'voice', 'navigation'],
    tokenCount: 580,
    schema: {
      type: 'Flex',
      props: {
        direction: 'column',
        className: 'w-[240px] h-full bg-[#2f3136]',
      },
      children: [
        {
          type: 'Flex',
          props: {
            justify: 'space-between',
            align: 'center',
            className: 'h-12 px-4 border-b border-[#202225] shadow-sm',
          },
          children: [
            { type: 'Text', props: { variant: 'heading', className: 'font-semibold text-white' }, children: 'Gaming Server' },
            { type: 'Icon', props: { name: 'chevron-down', size: 16 } },
          ],
        },
        {
          type: 'Flex',
          props: { direction: 'column', className: 'flex-1 overflow-y-auto py-4 px-2' },
          children: [
            {
              type: 'Text',
              props: { variant: 'muted', size: 'xs', className: 'px-2 mb-1 uppercase font-semibold' },
              children: '文字频道',
            },
            { type: 'DiscordChannel', props: { name: 'general', type: 'text', active: true, unread: false } },
            { type: 'DiscordChannel', props: { name: 'announcements', type: 'announcement', active: false, unread: true } },
            { type: 'DiscordChannel', props: { name: 'off-topic', type: 'text', active: false, unread: false } },
            {
              type: 'Text',
              props: { variant: 'muted', size: 'xs', className: 'px-2 mt-4 mb-1 uppercase font-semibold' },
              children: '语音频道',
            },
            { type: 'DiscordVoiceChannel', props: { name: 'General Voice', participants: [], userLimit: 0 } },
            { type: 'DiscordVoiceChannel', props: { name: 'Gaming', participants: ['User1', 'User2'], userLimit: 10 } },
          ],
        },
      ],
    },
  },
  {
    id: 'discord-channel-categories',
    name: 'Discord 频道分类',
    description: '带有可折叠分类的频道列表',
    category: 'channel-list',
    tags: ['channel', 'category', 'collapsible'],
    tokenCount: 490,
    schema: {
      type: 'Flex',
      props: {
        direction: 'column',
        gap: 'sm',
        className: 'w-[240px] bg-[#2f3136] p-2',
      },
      children: [
        {
          type: 'Flex',
          props: { align: 'center', gap: 'xs', className: 'px-1 cursor-pointer hover:text-white' },
          children: [
            { type: 'Icon', props: { name: 'chevron-down', size: 12 } },
            { type: 'Text', props: { variant: 'muted', size: 'xs', className: 'uppercase font-semibold' }, children: 'Information' },
          ],
        },
        { type: 'DiscordChannel', props: { name: 'rules', type: 'text', active: false, unread: false } },
        { type: 'DiscordChannel', props: { name: 'welcome', type: 'text', active: false, unread: false } },
      ],
    },
  },

  // 消息区域案例
  {
    id: 'discord-message-list',
    name: 'Discord 消息列表',
    description: '聊天消息列表展示',
    category: 'message-area',
    tags: ['message', 'chat', 'conversation'],
    tokenCount: 720,
    schema: {
      type: 'Flex',
      props: {
        direction: 'column',
        className: 'flex-1 bg-[#36393f] overflow-y-auto',
      },
      children: [
        {
          type: 'DiscordMessage',
          props: {
            author: { name: 'John', avatar: '', color: '#e91e63' },
            content: 'Hey everyone! How is it going?',
            timestamp: 'Today at 10:30 AM',
            reactions: [],
          },
        },
        {
          type: 'DiscordMessage',
          props: {
            author: { name: 'Alice', avatar: '', color: '#3ba55c' },
            content: 'Pretty good! Just finished a new feature.',
            timestamp: 'Today at 10:32 AM',
            reactions: [{ emoji: '👍', count: 3 }],
          },
        },
        {
          type: 'DiscordMessage',
          props: {
            author: { name: 'Bob', avatar: '', color: '#5865F2' },
            content: 'Nice! Can you share a demo?',
            timestamp: 'Today at 10:35 AM',
            reactions: [],
          },
        },
      ],
    },
  },
  {
    id: 'discord-message-with-embed',
    name: 'Discord 消息（带嵌入）',
    description: '带有链接预览嵌入的消息',
    category: 'message-area',
    tags: ['message', 'embed', 'preview', 'link'],
    tokenCount: 650,
    schema: {
      type: 'Flex',
      props: {
        direction: 'column',
        gap: 'sm',
        className: 'p-4 bg-[#36393f]',
      },
      children: [
        {
          type: 'DiscordMessage',
          props: {
            author: { name: 'DevBot', avatar: '', color: '#5865F2' },
            content: 'Check out this cool article!',
            timestamp: 'Today at 2:00 PM',
            reactions: [],
          },
        },
        {
          type: 'Card',
          props: {
            className: 'ml-14 border-l-4 border-[#5865F2] bg-[#2f3136] p-3 max-w-md',
          },
          children: [
            { type: 'Text', props: { variant: 'body', className: 'text-[#00b0f4] hover:underline cursor-pointer' }, children: 'Introduction to Discord Bots' },
            { type: 'Text', props: { variant: 'muted', size: 'sm', className: 'mt-1' }, children: 'Learn how to create your first Discord bot with Node.js...' },
          ],
        },
      ],
    },
  },
  {
    id: 'discord-message-input',
    name: 'Discord 消息输入框',
    description: '消息输入区域',
    category: 'message-area',
    tags: ['input', 'message', 'chat', 'compose'],
    tokenCount: 420,
    schema: {
      type: 'Flex',
      props: {
        align: 'center',
        gap: 'sm',
        className: 'mx-4 mb-6 px-4 py-2 bg-[#40444b] rounded-lg',
      },
      children: [
        { type: 'Button', props: { variant: 'secondary', className: 'p-1 hover:text-white' }, children: [{ type: 'Icon', props: { name: 'plus-circle', size: 24 } }] },
        { type: 'Input', props: { placeholder: 'Message #general', className: 'flex-1 bg-transparent border-none text-white placeholder-[#72767d]' } },
        { type: 'Flex', props: { gap: 'xs' }, children: [
          { type: 'Button', props: { variant: 'secondary', className: 'p-1' }, children: [{ type: 'Icon', props: { name: 'gift', size: 20 } }] },
          { type: 'Button', props: { variant: 'secondary', className: 'p-1' }, children: [{ type: 'Icon', props: { name: 'image', size: 20 } }] },
          { type: 'Button', props: { variant: 'secondary', className: 'p-1' }, children: [{ type: 'Icon', props: { name: 'smile', size: 20 } }] },
        ]},
      ],
    },
  },

  // 用户面板案例
  {
    id: 'discord-user-panel',
    name: 'Discord 用户面板',
    description: '底部用户信息面板',
    category: 'user-panel',
    tags: ['user', 'profile', 'status', 'settings'],
    tokenCount: 480,
    schema: {
      type: 'Flex',
      props: {
        align: 'center',
        justify: 'space-between',
        className: 'h-[52px] px-2 bg-[#292b2f]',
      },
      children: [
        {
          type: 'Flex',
          props: { align: 'center', gap: 'sm' },
          children: [
            { type: 'Avatar', props: { src: '', alt: 'User', size: 'sm', status: 'online' } },
            {
              type: 'Flex',
              props: { direction: 'column' },
              children: [
                { type: 'Text', props: { size: 'sm', className: 'font-medium text-white' }, children: 'Username' },
                { type: 'Text', props: { variant: 'muted', size: 'xs' }, children: '#1234' },
              ],
            },
          ],
        },
        {
          type: 'Flex',
          props: { gap: 'xs' },
          children: [
            { type: 'Button', props: { variant: 'secondary', className: 'p-1' }, children: [{ type: 'Icon', props: { name: 'mic', size: 20 } }] },
            { type: 'Button', props: { variant: 'secondary', className: 'p-1' }, children: [{ type: 'Icon', props: { name: 'headphones', size: 20 } }] },
            { type: 'Button', props: { variant: 'secondary', className: 'p-1' }, children: [{ type: 'Icon', props: { name: 'settings', size: 20 } }] },
          ],
        },
      ],
    },
  },
  {
    id: 'discord-member-list',
    name: 'Discord 成员列表',
    description: '服务器成员列表',
    category: 'user-panel',
    tags: ['member', 'user', 'list', 'role'],
    tokenCount: 550,
    schema: {
      type: 'Flex',
      props: {
        direction: 'column',
        className: 'w-[240px] h-full bg-[#2f3136] p-4',
      },
      children: [
        { type: 'Text', props: { variant: 'muted', size: 'xs', className: 'uppercase font-semibold mb-2' }, children: 'Online — 3' },
        { type: 'DiscordMember', props: { user: { name: 'Admin', avatar: '' }, role: 'Admin', roleColor: '#e91e63' } },
        { type: 'DiscordMember', props: { user: { name: 'Moderator', avatar: '' }, role: 'Mod', roleColor: '#3ba55c' } },
        { type: 'DiscordMember', props: { user: { name: 'Member', avatar: '' }, role: '', roleColor: '' } },
        { type: 'Text', props: { variant: 'muted', size: 'xs', className: 'uppercase font-semibold mt-4 mb-2' }, children: 'Offline — 2' },
        { type: 'DiscordMember', props: { user: { name: 'User1', avatar: '' }, role: '', roleColor: '', className: 'opacity-50' } },
        { type: 'DiscordMember', props: { user: { name: 'User2', avatar: '' }, role: '', roleColor: '', className: 'opacity-50' } },
      ],
    },
  },

  // 设置界面案例
  {
    id: 'discord-settings-page',
    name: 'Discord 设置页面',
    description: '用户设置界面',
    category: 'settings',
    tags: ['settings', 'preferences', 'config', 'account'],
    tokenCount: 680,
    schema: {
      type: 'Flex',
      props: {
        className: 'h-full bg-[#36393f]',
      },
      children: [
        {
          type: 'Flex',
          props: {
            direction: 'column',
            className: 'w-[218px] bg-[#2f3136] p-4',
          },
          children: [
            { type: 'Text', props: { variant: 'muted', size: 'xs', className: 'uppercase font-semibold mb-2' }, children: 'User Settings' },
            { type: 'Button', props: { variant: 'secondary', className: 'justify-start text-left mb-1 bg-[#42464d]' }, children: 'My Account' },
            { type: 'Button', props: { variant: 'secondary', className: 'justify-start text-left mb-1' }, children: 'User Profile' },
            { type: 'Button', props: { variant: 'secondary', className: 'justify-start text-left mb-1' }, children: 'Privacy & Safety' },
            { type: 'Text', props: { variant: 'muted', size: 'xs', className: 'uppercase font-semibold mt-4 mb-2' }, children: 'App Settings' },
            { type: 'Button', props: { variant: 'secondary', className: 'justify-start text-left mb-1' }, children: 'Appearance' },
            { type: 'Button', props: { variant: 'secondary', className: 'justify-start text-left mb-1' }, children: 'Notifications' },
          ],
        },
        {
          type: 'Flex',
          props: {
            direction: 'column',
            className: 'flex-1 p-8 max-w-2xl',
          },
          children: [
            { type: 'Text', props: { variant: 'heading', size: 'xl', className: 'font-bold text-white mb-6' }, children: 'My Account' },
            {
              type: 'Card',
              props: { className: 'bg-[#202225] p-4 rounded-lg' },
              children: [
                {
                  type: 'Flex',
                  props: { align: 'center', gap: 'md' },
                  children: [
                    { type: 'Avatar', props: { src: '', alt: 'User', size: 'lg' } },
                    {
                      type: 'Flex',
                      props: { direction: 'column' },
                      children: [
                        { type: 'Text', props: { className: 'font-semibold text-white' }, children: 'Username#1234' },
                        { type: 'Button', props: { variant: 'primary', size: 'sm', className: 'mt-2' }, children: 'Edit User Profile' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
];

/**
 * Discord 关键词映射
 */
export const discordKeywordMappings: KeywordMapping[] = [
  {
    keywords: ['server', 'guild', 'servers', 'guilds'],
    exampleIds: ['discord-server-sidebar', 'discord-server-list-with-folders'],
  },
  {
    keywords: ['channel', 'text', 'voice', 'channels'],
    exampleIds: ['discord-channel-list', 'discord-channel-categories'],
  },
  {
    keywords: ['message', 'chat', 'conversation', 'messages'],
    exampleIds: ['discord-message-list', 'discord-message-with-embed', 'discord-message-input'],
  },
  {
    keywords: ['user', 'member', 'profile', 'members', 'users'],
    exampleIds: ['discord-user-panel', 'discord-member-list'],
  },
  {
    keywords: ['settings', 'preferences', 'config', 'configuration'],
    exampleIds: ['discord-settings-page'],
  },
];

/**
 * Discord 案例配置
 */
export const discordExamples: ThemeExamples = {
  presets: discordExamplePresets,
  categories: discordExampleCategories,
  keywordMappings: discordKeywordMappings,
};

/**
 * 获取所有 Discord 案例 ID
 */
export function getDiscordExampleIds(): string[] {
  return discordExamplePresets.map((example) => example.id);
}

/**
 * 根据 ID 获取 Discord 案例
 */
export function getDiscordExampleById(id: string): ExampleMetadata | undefined {
  return discordExamplePresets.find((example) => example.id === id);
}

/**
 * 根据分类获取 Discord 案例
 */
export function getDiscordExamplesByCategory(category: string): ExampleMetadata[] {
  return discordExamplePresets.filter((example) => example.category === category);
}

/**
 * 根据关键词获取 Discord 案例
 */
export function getDiscordExamplesByKeyword(keyword: string): ExampleMetadata[] {
  const lowerKeyword = keyword.toLowerCase();
  const mapping = discordKeywordMappings.find((m) =>
    m.keywords.some((k) => k.toLowerCase() === lowerKeyword)
  );

  if (!mapping) {
    // 如果没有精确匹配，尝试模糊匹配标签
    return discordExamplePresets.filter((example) =>
      example.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
    );
  }

  return mapping.exampleIds
    .map((id) => getDiscordExampleById(id))
    .filter((example): example is ExampleMetadata => example !== undefined);
}
