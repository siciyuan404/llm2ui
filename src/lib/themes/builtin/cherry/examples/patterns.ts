/**
 * @file patterns.ts
 * @description Cherry Studio 风格 UI 案例，展示聊天界面、侧边栏导航等模式
 * @module lib/themes/builtin/cherry/examples/patterns
 */

import type { ExampleMetadata } from './types';

/**
 * Cherry Studio 聊天界面案例
 */
export const cherryChatInterfaceExample: ExampleMetadata = {
  id: 'system-cherry-chat-interface',
  title: 'Cherry 聊天界面',
  description: 'Cherry Studio 风格的 AI 聊天界面，包含消息列表和输入栏',
  category: 'layout',
  tags: ['chat', 'cherry', 'ai', 'message'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'cherry-chat',
      type: 'Container',
      props: {
        className: 'flex flex-col h-screen bg-[var(--cherry-background)]',
      },
      children: [
        {
          id: 'chat-header',
          type: 'Container',
          props: {
            className: 'h-12 border-b border-[var(--cherry-border)] flex items-center px-4',
          },
          children: [
            { id: 'chat-title', type: 'Text', props: { className: 'font-medium' }, text: 'GPT-4o' },
          ],
        },
        {
          id: 'messages-area',
          type: 'Container',
          props: { className: 'flex-1 overflow-auto p-4 space-y-4' },
          children: [
            {
              id: 'user-msg',
              type: 'Container',
              props: { className: 'flex gap-3 justify-end' },
              children: [
                {
                  id: 'user-bubble',
                  type: 'Container',
                  props: { className: 'max-w-[70%] bg-[var(--cherry-chat-user)] rounded-lg p-3' },
                  children: [{ id: 'user-text', type: 'Text', text: '你好，请介绍一下自己' }],
                },
              ],
            },
            {
              id: 'assistant-msg',
              type: 'Container',
              props: { className: 'flex gap-3' },
              children: [
                {
                  id: 'assistant-avatar',
                  type: 'Container',
                  props: { className: 'w-8 h-8 rounded-full bg-[var(--cherry-primary)] flex items-center justify-center text-white text-sm' },
                  children: [{ id: 'avatar-icon', type: 'Icon', props: { name: 'user', size: 16 } }],
                },
                {
                  id: 'assistant-bubble',
                  type: 'Container',
                  props: { className: 'max-w-[70%] rounded-lg p-3' },
                  children: [{ id: 'assistant-text', type: 'Text', text: '你好！我是 AI 助手，很高兴为你服务。' }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * Cherry Studio 侧边栏导航案例
 */
export const cherrySidebarNavigationExample: ExampleMetadata = {
  id: 'system-cherry-sidebar-navigation',
  title: 'Cherry 侧边栏导航',
  description: 'Cherry Studio 风格的垂直侧边栏，包含图标导航和主题切换',
  category: 'navigation',
  tags: ['sidebar', 'cherry', 'navigation', 'theme'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'cherry-sidebar',
      type: 'Container',
      props: {
        className: 'w-[60px] h-screen bg-[var(--cherry-background-soft)] flex flex-col items-center py-4',
      },
      children: [
        {
          id: 'user-avatar',
          type: 'Container',
          props: { className: 'w-10 h-10 rounded-full bg-[var(--cherry-primary)] flex items-center justify-center text-white mb-6 cursor-pointer' },
          children: [{ id: 'avatar-icon', type: 'Icon', props: { name: 'user', size: 20 } }],
        },
        {
          id: 'nav-items',
          type: 'Container',
          props: { className: 'flex-1 flex flex-col gap-2' },
          children: [
            {
              id: 'nav-chat',
              type: 'Container',
              props: { className: 'w-10 h-10 rounded-lg bg-[var(--cherry-active)] flex items-center justify-center cursor-pointer border-l-2 border-[var(--cherry-primary)]' },
              children: [{ id: 'chat-icon', type: 'Icon', props: { name: 'message-circle', size: 20 } }],
            },
            {
              id: 'nav-agents',
              type: 'Container',
              props: { className: 'w-10 h-10 rounded-lg hover:bg-[var(--cherry-hover)] flex items-center justify-center cursor-pointer' },
              children: [{ id: 'agents-icon', type: 'Icon', props: { name: 'user', size: 20 } }],
            },
            {
              id: 'nav-files',
              type: 'Container',
              props: { className: 'w-10 h-10 rounded-lg hover:bg-[var(--cherry-hover)] flex items-center justify-center cursor-pointer' },
              children: [{ id: 'files-icon', type: 'Icon', props: { name: 'folder', size: 20 } }],
            },
          ],
        },
        {
          id: 'bottom-items',
          type: 'Container',
          props: { className: 'flex flex-col gap-2' },
          children: [
            {
              id: 'nav-theme',
              type: 'Container',
              props: { className: 'w-10 h-10 rounded-lg hover:bg-[var(--cherry-hover)] flex items-center justify-center cursor-pointer' },
              children: [{ id: 'theme-icon', type: 'Icon', props: { name: 'settings', size: 20 } }],
            },
            {
              id: 'nav-settings',
              type: 'Container',
              props: { className: 'w-10 h-10 rounded-lg hover:bg-[var(--cherry-hover)] flex items-center justify-center cursor-pointer' },
              children: [{ id: 'settings-icon', type: 'Icon', props: { name: 'menu', size: 20 } }],
            },
          ],
        },
      ],
    },
  },
};

/**
 * Cherry Studio 模型选择器案例
 */
export const cherryModelSelectorExample: ExampleMetadata = {
  id: 'system-cherry-model-selector',
  title: 'Cherry 模型选择器',
  description: 'Cherry Studio 风格的 AI 模型选择器，支持分组和搜索',
  category: 'form',
  tags: ['selector', 'cherry', 'model', 'dropdown'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'model-selector',
      type: 'Container',
      props: { className: 'w-80 bg-[var(--cherry-background)] border border-[var(--cherry-border)] rounded-lg shadow-lg' },
      children: [
        {
          id: 'search-box',
          type: 'Container',
          props: { className: 'p-3 border-b border-[var(--cherry-border)]' },
          children: [
            { id: 'search-input', type: 'Input', props: { placeholder: '搜索模型...', className: 'w-full' } },
          ],
        },
        {
          id: 'model-groups',
          type: 'Container',
          props: { className: 'max-h-80 overflow-auto' },
          children: [
            {
              id: 'openai-group',
              type: 'Container',
              props: { className: 'p-2' },
              children: [
                { id: 'openai-label', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] px-2 py-1' }, text: 'OpenAI' },
                {
                  id: 'gpt4-item',
                  type: 'Container',
                  props: { className: 'flex items-center gap-2 px-2 py-2 rounded hover:bg-[var(--cherry-hover)] cursor-pointer' },
                  children: [
                    { id: 'gpt4-avatar', type: 'Container', props: { className: 'w-6 h-6 rounded bg-green-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'gpt4-icon', type: 'Text', text: 'G' }] },
                    { id: 'gpt4-name', type: 'Text', props: { className: 'flex-1' }, text: 'GPT-4o' },
                    { id: 'gpt4-check', type: 'Icon', props: { name: 'check', size: 14, className: 'text-[var(--cherry-primary)]' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};


/**
 * Cherry Studio 消息列表案例
 */
export const cherryMessageListExample: ExampleMetadata = {
  id: 'system-cherry-message-list',
  title: 'Cherry 消息列表',
  description: 'Cherry Studio 风格的消息列表，包含用户和助手消息',
  category: 'display',
  tags: ['message', 'cherry', 'chat', 'list'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'message-list',
      type: 'Container',
      props: { className: 'space-y-6 p-4' },
      children: [
        {
          id: 'msg-1',
          type: 'Container',
          props: { className: 'flex gap-3' },
          children: [
            { id: 'msg-1-avatar', type: 'Container', props: { className: 'w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm shrink-0' }, children: [{ id: 'a1', type: 'Icon', props: { name: 'user', size: 16 } }] },
            {
              id: 'msg-1-content',
              type: 'Container',
              props: { className: 'flex-1' },
              children: [
                { id: 'msg-1-header', type: 'Container', props: { className: 'flex items-center gap-2 mb-1' }, children: [
                  { id: 'msg-1-name', type: 'Text', props: { className: 'font-medium text-sm' }, text: '用户' },
                  { id: 'msg-1-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '10:30' },
                ]},
                { id: 'msg-1-text', type: 'Text', text: '请帮我写一段 Python 代码' },
              ],
            },
          ],
        },
        {
          id: 'msg-2',
          type: 'Container',
          props: { className: 'flex gap-3' },
          children: [
            { id: 'msg-2-avatar', type: 'Container', props: { className: 'w-8 h-8 rounded-full bg-[var(--cherry-primary)] flex items-center justify-center text-white text-sm shrink-0' }, children: [{ id: 'a2', type: 'Icon', props: { name: 'user', size: 16 } }] },
            {
              id: 'msg-2-content',
              type: 'Container',
              props: { className: 'flex-1' },
              children: [
                { id: 'msg-2-header', type: 'Container', props: { className: 'flex items-center gap-2 mb-1' }, children: [
                  { id: 'msg-2-name', type: 'Text', props: { className: 'font-medium text-sm' }, text: 'GPT-4o' },
                  { id: 'msg-2-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '10:31' },
                ]},
                { id: 'msg-2-text', type: 'Text', text: '好的，这是一个简单的 Python 示例：' },
                {
                  id: 'msg-2-code',
                  type: 'Container',
                  props: { className: 'mt-2 bg-[var(--cherry-background-soft)] rounded-lg p-3 font-mono text-sm' },
                  children: [{ id: 'code-text', type: 'Text', text: 'print("Hello, World!")' }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * Cherry Studio 输入栏案例
 */
export const cherryInputBarExample: ExampleMetadata = {
  id: 'system-cherry-input-bar',
  title: 'Cherry 输入栏',
  description: 'Cherry Studio 风格的消息输入栏，包含工具栏和发送按钮',
  category: 'form',
  tags: ['input', 'cherry', 'chat', 'toolbar'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'input-bar',
      type: 'Container',
      props: { className: 'border-t border-[var(--cherry-border)] p-4' },
      children: [
        {
          id: 'input-wrapper',
          type: 'Container',
          props: { className: 'bg-[var(--cherry-background-soft)] rounded-lg' },
          children: [
            {
              id: 'toolbar',
              type: 'Container',
              props: { className: 'flex items-center gap-1 px-3 py-2 border-b border-[var(--cherry-border)]' },
              children: [
                { id: 'btn-attach', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'attach-icon', type: 'Icon', props: { name: 'link', size: 16 } }] },
                { id: 'btn-image', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'image-icon', type: 'Icon', props: { name: 'image', size: 16 } }] },
                { id: 'btn-code', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'code-icon', type: 'Icon', props: { name: 'code', size: 16 } }] },
              ],
            },
            {
              id: 'input-area',
              type: 'Container',
              props: { className: 'flex items-end gap-2 p-3' },
              children: [
                { id: 'textarea', type: 'Textarea', props: { placeholder: '输入消息...', className: 'flex-1 min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent focus:ring-0', rows: 1 } },
                { id: 'send-btn', type: 'Button', props: { className: 'bg-[var(--cherry-primary)] hover:bg-[var(--cherry-primary-soft)]' }, children: [{ id: 'send-icon', type: 'Icon', props: { name: 'send', size: 16 } }] },
              ],
            },
          ],
        },
        {
          id: 'token-count',
          type: 'Text',
          props: { className: 'text-xs text-[var(--cherry-text-2)] mt-2 text-right' },
          text: 'Token: 0',
        },
      ],
    },
  },
};

/**
 * Cherry Studio 设置面板案例
 */
export const cherrySettingsPanelExample: ExampleMetadata = {
  id: 'system-cherry-settings-panel',
  title: 'Cherry 设置面板',
  description: 'Cherry Studio 风格的设置面板，包含分组设置项',
  category: 'form',
  tags: ['settings', 'cherry', 'panel', 'form'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'settings-panel',
      type: 'Container',
      props: { className: 'max-w-2xl mx-auto p-6 space-y-6' },
      children: [
        { id: 'settings-title', type: 'Text', props: { className: 'text-2xl font-bold mb-6' }, text: '设置' },
        {
          id: 'general-section',
          type: 'Card',
          props: { className: 'p-4' },
          children: [
            { id: 'general-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: '通用设置' },
            {
              id: 'theme-setting',
              type: 'Container',
              props: { className: 'flex items-center justify-between py-3 border-b border-[var(--cherry-border)]' },
              children: [
                {
                  id: 'theme-label',
                  type: 'Container',
                  children: [
                    { id: 'theme-name', type: 'Text', props: { className: 'font-medium' }, text: '主题' },
                    { id: 'theme-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '选择应用主题' },
                  ],
                },
                { id: 'theme-select', type: 'Button', props: { variant: 'outline' }, text: '深色 ▼' },
              ],
            },
            {
              id: 'lang-setting',
              type: 'Container',
              props: { className: 'flex items-center justify-between py-3' },
              children: [
                {
                  id: 'lang-label',
                  type: 'Container',
                  children: [
                    { id: 'lang-name', type: 'Text', props: { className: 'font-medium' }, text: '语言' },
                    { id: 'lang-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '选择界面语言' },
                  ],
                },
                { id: 'lang-select', type: 'Button', props: { variant: 'outline' }, text: '简体中文 ▼' },
              ],
            },
          ],
        },
        {
          id: 'model-section',
          type: 'Card',
          props: { className: 'p-4' },
          children: [
            { id: 'model-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: '模型设置' },
            {
              id: 'default-model',
              type: 'Container',
              props: { className: 'flex items-center justify-between py-3 border-b border-[var(--cherry-border)]' },
              children: [
                {
                  id: 'dm-label',
                  type: 'Container',
                  children: [
                    { id: 'dm-name', type: 'Text', props: { className: 'font-medium' }, text: '默认模型' },
                    { id: 'dm-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '新对话使用的模型' },
                  ],
                },
                { id: 'dm-select', type: 'Button', props: { variant: 'outline' }, text: 'GPT-4o ▼' },
              ],
            },
            {
              id: 'temp-setting',
              type: 'Container',
              props: { className: 'flex items-center justify-between py-3' },
              children: [
                {
                  id: 'temp-label',
                  type: 'Container',
                  children: [
                    { id: 'temp-name', type: 'Text', props: { className: 'font-medium' }, text: '温度' },
                    { id: 'temp-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '控制回复的随机性' },
                  ],
                },
                { id: 'temp-value', type: 'Text', props: { className: 'font-mono' }, text: '0.7' },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 所有 Cherry Studio 风格案例
 */
export const CHERRY_PATTERN_EXAMPLES: ExampleMetadata[] = [
  cherryChatInterfaceExample,
  cherrySidebarNavigationExample,
  cherryModelSelectorExample,
  cherryMessageListExample,
  cherryInputBarExample,
  cherrySettingsPanelExample,
];

/**
 * 获取所有 Cherry 风格案例
 */
export function getCherryPatternExamples(): ExampleMetadata[] {
  return [...CHERRY_PATTERN_EXAMPLES];
}
