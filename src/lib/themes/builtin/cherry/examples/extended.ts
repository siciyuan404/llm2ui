/**
 * @file extended.ts
 * @description Cherry Studio 扩展案例库，包含 29 个高保真 UI 案例
 * @module lib/themes/builtin/cherry/examples/extended
 * @requirements 1.1-29.6
 */

import type { ExampleMetadata } from './types';

// ============================================================================
// 布局类案例
// ============================================================================

/**
 * 布局按钮案例 - 水平/垂直布局切换、侧边栏折叠、全屏切换
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
export const layoutButtonExample: ExampleMetadata = {
  id: 'system-cherry-layout-buttons',
  title: 'Cherry 布局按钮',
  description: 'Cherry Studio 风格的布局切换按钮组，包含水平/垂直布局、侧边栏折叠、全屏切换',
  category: 'layout',
  tags: ['layout', 'cherry', 'buttons', 'toggle'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'layout-buttons',
      type: 'Container',
      props: { className: 'flex items-center gap-2 p-2 bg-[var(--cherry-background-soft)] rounded-lg' },
      children: [
        {
          id: 'layout-toggle-group',
          type: 'Container',
          props: { className: 'flex items-center gap-1 p-1 bg-[var(--cherry-background)] rounded-md' },
          children: [
            {
              id: 'horizontal-layout-btn',
              type: 'Button',
              props: { 
                variant: 'ghost', 
                size: 'sm',
                className: 'w-8 h-8 p-0 bg-[var(--cherry-primary)] text-white hover:bg-[var(--cherry-primary-soft)]'
              },
              children: [{ id: 'horizontal-icon', type: 'Icon', props: { name: 'layout-grid', size: 16 } }],
            },
            {
              id: 'vertical-layout-btn',
              type: 'Button',
              props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' },
              children: [{ id: 'vertical-icon', type: 'Icon', props: { name: 'layout-list', size: 16 } }],
            },
          ],
        },
        {
          id: 'divider-1',
          type: 'Container',
          props: { className: 'w-px h-6 bg-[var(--cherry-border)]' },
          children: [],
        },
        {
          id: 'sidebar-toggle-btn',
          type: 'Button',
          props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' },
          children: [{ id: 'sidebar-icon', type: 'Icon', props: { name: 'panel-left', size: 16 } }],
        },
        {
          id: 'panel-resize-btn',
          type: 'Button',
          props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' },
          children: [{ id: 'resize-icon', type: 'Icon', props: { name: 'move-horizontal', size: 16 } }],
        },
        {
          id: 'divider-2',
          type: 'Container',
          props: { className: 'w-px h-6 bg-[var(--cherry-border)]' },
          children: [],
        },
        {
          id: 'fullscreen-btn',
          type: 'Button',
          props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' },
          children: [{ id: 'fullscreen-icon', type: 'Icon', props: { name: 'maximize', size: 16 } }],
        },
      ],
    },
  },
};

/**
 * 完整应用布局案例 - 三栏布局、可调整面板、响应式折叠
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6
 */
export const fullLayoutExample: ExampleMetadata = {
  id: 'system-cherry-full-layout',
  title: 'Cherry 完整应用布局',
  description: 'Cherry Studio 风格的完整应用布局，包含三栏布局、可调整面板分隔线、响应式折叠',
  category: 'layout',
  tags: ['layout', 'cherry', 'three-column', 'resizable'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'full-layout',
      type: 'Container',
      props: { className: 'flex h-screen bg-[var(--cherry-background)]' },
      children: [
        {
          id: 'sidebar',
          type: 'Container',
          props: { className: 'w-[60px] bg-[var(--cherry-background-soft)] flex flex-col items-center py-4 border-r border-[var(--cherry-border)]' },
          children: [
            { id: 'sidebar-avatar', type: 'Container', props: { className: 'w-10 h-10 rounded-full bg-[var(--cherry-primary)] flex items-center justify-center text-white mb-4' }, children: [{ id: 'avatar-icon', type: 'Icon', props: { name: 'user', size: 20 } }] },
            { id: 'nav-chat', type: 'Container', props: { className: 'w-10 h-10 rounded-lg bg-[var(--cherry-active)] flex items-center justify-center cursor-pointer' }, children: [{ id: 'chat-icon', type: 'Icon', props: { name: 'message-circle', size: 20 } }] },
            { id: 'nav-agents', type: 'Container', props: { className: 'w-10 h-10 rounded-lg hover:bg-[var(--cherry-hover)] flex items-center justify-center cursor-pointer mt-2' }, children: [{ id: 'agents-icon', type: 'Icon', props: { name: 'user', size: 20 } }] },
          ],
        },
        {
          id: 'conversation-list',
          type: 'Container',
          props: { className: 'w-64 bg-[var(--cherry-background)] border-r border-[var(--cherry-border)] flex flex-col' },
          children: [
            { id: 'list-header', type: 'Container', props: { className: 'h-12 px-4 flex items-center justify-between border-b border-[var(--cherry-border)]' }, children: [
              { id: 'list-title', type: 'Text', props: { className: 'font-medium' }, text: '对话列表' },
              { id: 'new-chat-btn', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'new-chat-icon', type: 'Icon', props: { name: 'plus', size: 16 } }] },
            ]},
            { id: 'list-content', type: 'Container', props: { className: 'flex-1 overflow-auto p-2 space-y-1' }, children: [
              { id: 'conv-1', type: 'Container', props: { className: 'p-3 rounded-lg bg-[var(--cherry-active)] cursor-pointer' }, children: [
                { id: 'conv-1-title', type: 'Text', props: { className: 'font-medium text-sm truncate' }, text: 'GPT-4o 对话' },
                { id: 'conv-1-preview', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] truncate mt-1' }, text: '你好，请介绍一下自己...' },
              ]},
              { id: 'conv-2', type: 'Container', props: { className: 'p-3 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
                { id: 'conv-2-title', type: 'Text', props: { className: 'font-medium text-sm truncate' }, text: 'Claude 对话' },
                { id: 'conv-2-preview', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] truncate mt-1' }, text: '帮我写一段代码...' },
              ]},
            ]},
          ],
        },
        {
          id: 'resize-handle',
          type: 'Container',
          props: { className: 'w-1 bg-transparent hover:bg-[var(--cherry-primary)] cursor-col-resize transition-colors' },
          children: [],
        },
        {
          id: 'main-content',
          type: 'Container',
          props: { className: 'flex-1 flex flex-col' },
          children: [
            { id: 'content-header', type: 'Container', props: { className: 'h-12 px-4 flex items-center justify-between border-b border-[var(--cherry-border)]' }, children: [
              { id: 'model-name', type: 'Text', props: { className: 'font-medium' }, text: 'GPT-4o' },
              { id: 'header-actions', type: 'Container', props: { className: 'flex items-center gap-2' }, children: [
                { id: 'settings-btn', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'settings-icon', type: 'Icon', props: { name: 'settings', size: 16 } }] },
              ]},
            ]},
            { id: 'messages-area', type: 'Container', props: { className: 'flex-1 overflow-auto p-4' }, children: [
              { id: 'placeholder', type: 'Text', props: { className: 'text-center text-[var(--cherry-text-2)]' }, text: '开始新对话...' },
            ]},
            { id: 'status-bar', type: 'Container', props: { className: 'h-6 px-4 flex items-center justify-between text-xs text-[var(--cherry-text-2)] border-t border-[var(--cherry-border)]' }, children: [
              { id: 'connection-status', type: 'Container', props: { className: 'flex items-center gap-1' }, children: [
                { id: 'status-dot', type: 'Container', props: { className: 'w-2 h-2 rounded-full bg-green-500' }, children: [] },
                { id: 'status-text', type: 'Text', text: '已连接' },
              ]},
              { id: 'token-count', type: 'Text', text: 'Token: 0' },
            ]},
          ],
        },
      ],
    },
  },
};

/**
 * 聊天页面布局案例
 * Requirements: 24.1
 */
export const chatPageLayoutExample: ExampleMetadata = {
  id: 'system-cherry-chat-page-layout',
  title: 'Cherry 聊天页面布局',
  description: 'Cherry Studio 风格的聊天页面布局，包含侧边栏、对话列表和聊天内容区',
  category: 'layout',
  tags: ['layout', 'cherry', 'chat', 'page'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'chat-page',
      type: 'Container',
      props: { className: 'flex h-screen bg-[var(--cherry-background)]' },
      children: [
        { id: 'sidebar', type: 'Container', props: { className: 'w-[60px] bg-[var(--cherry-background-soft)] border-r border-[var(--cherry-border)]' }, children: [] },
        { id: 'conv-list', type: 'Container', props: { className: 'w-64 border-r border-[var(--cherry-border)]' }, children: [
          { id: 'list-header', type: 'Container', props: { className: 'h-12 px-4 flex items-center border-b border-[var(--cherry-border)]' }, children: [{ id: 'title', type: 'Text', props: { className: 'font-medium' }, text: '对话' }] },
        ]},
        { id: 'chat-content', type: 'Container', props: { className: 'flex-1 flex flex-col' }, children: [
          { id: 'chat-header', type: 'Container', props: { className: 'h-12 border-b border-[var(--cherry-border)]' }, children: [] },
          { id: 'messages', type: 'Container', props: { className: 'flex-1' }, children: [] },
          { id: 'input-area', type: 'Container', props: { className: 'border-t border-[var(--cherry-border)] p-4' }, children: [] },
        ]},
      ],
    },
  },
};

/**
 * 助手页面布局案例
 * Requirements: 24.2
 */
export const agentsPageLayoutExample: ExampleMetadata = {
  id: 'system-cherry-agents-page-layout',
  title: 'Cherry 助手页面布局',
  description: 'Cherry Studio 风格的助手页面布局，包含侧边栏和助手网格',
  category: 'layout',
  tags: ['layout', 'cherry', 'agents', 'page'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'agents-page',
      type: 'Container',
      props: { className: 'flex h-screen bg-[var(--cherry-background)]' },
      children: [
        { id: 'sidebar', type: 'Container', props: { className: 'w-[60px] bg-[var(--cherry-background-soft)] border-r border-[var(--cherry-border)]' }, children: [] },
        { id: 'agents-content', type: 'Container', props: { className: 'flex-1 p-6' }, children: [
          { id: 'header', type: 'Container', props: { className: 'flex items-center justify-between mb-6' }, children: [
            { id: 'title', type: 'Text', props: { className: 'text-xl font-bold' }, text: '助手' },
            { id: 'add-btn', type: 'Button', props: { className: 'bg-[var(--cherry-primary)] gap-2' }, children: [
              { id: 'add-btn-icon', type: 'Icon', props: { name: 'plus', size: 16 } },
              { id: 'add-btn-text', type: 'Text', text: '新建助手' },
            ] },
          ]},
          { id: 'agents-grid', type: 'Container', props: { className: 'grid grid-cols-3 gap-4' }, children: [
            { id: 'agent-1', type: 'Card', props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' }, children: [
              { id: 'agent-1-avatar', type: 'Container', props: { className: 'w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-3' }, children: [{ id: 'agent-icon', type: 'Icon', props: { name: 'user', size: 24, className: 'text-white' } }] },
              { id: 'agent-1-name', type: 'Text', props: { className: 'font-medium' }, text: '代码助手' },
            ]},
          ]},
        ]},
      ],
    },
  },
};


/**
 * 文件页面布局案例
 * Requirements: 24.3
 */
export const filesPageLayoutExample: ExampleMetadata = {
  id: 'system-cherry-files-page-layout',
  title: 'Cherry 文件页面布局',
  description: 'Cherry Studio 风格的文件页面布局，包含侧边栏、文件树和预览区',
  category: 'layout',
  tags: ['layout', 'cherry', 'files', 'page'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'files-page',
      type: 'Container',
      props: { className: 'flex h-screen bg-[var(--cherry-background)]' },
      children: [
        { id: 'sidebar', type: 'Container', props: { className: 'w-[60px] bg-[var(--cherry-background-soft)] border-r border-[var(--cherry-border)]' }, children: [] },
        { id: 'file-tree', type: 'Container', props: { className: 'w-64 border-r border-[var(--cherry-border)] p-4' }, children: [
          { id: 'tree-header', type: 'Text', props: { className: 'font-medium mb-4' }, text: '文件' },
          { id: 'folder-1', type: 'Container', props: { className: 'flex items-center gap-2 py-1 cursor-pointer' }, children: [
            { id: 'folder-icon', type: 'Icon', props: { name: 'folder', size: 16 } },
            { id: 'folder-name', type: 'Text', text: '文档' },
          ]},
        ]},
        { id: 'preview', type: 'Container', props: { className: 'flex-1 p-6' }, children: [
          { id: 'preview-placeholder', type: 'Text', props: { className: 'text-[var(--cherry-text-2)]' }, text: '选择文件以预览' },
        ]},
      ],
    },
  },
};

/**
 * 设置页面布局案例
 * Requirements: 24.4
 */
export const settingsPageLayoutExample: ExampleMetadata = {
  id: 'system-cherry-settings-page-layout',
  title: 'Cherry 设置页面布局',
  description: 'Cherry Studio 风格的设置页面布局，包含侧边栏、标签页和设置内容',
  category: 'layout',
  tags: ['layout', 'cherry', 'settings', 'page'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'settings-page',
      type: 'Container',
      props: { className: 'flex h-screen bg-[var(--cherry-background)]' },
      children: [
        { id: 'sidebar', type: 'Container', props: { className: 'w-[60px] bg-[var(--cherry-background-soft)] border-r border-[var(--cherry-border)]' }, children: [] },
        { id: 'settings-content', type: 'Container', props: { className: 'flex-1 flex' }, children: [
          { id: 'settings-nav', type: 'Container', props: { className: 'w-48 border-r border-[var(--cherry-border)] p-4' }, children: [
            { id: 'nav-general', type: 'Container', props: { className: 'px-3 py-2 rounded-lg bg-[var(--cherry-active)] cursor-pointer' }, children: [{ id: 'nav-general-text', type: 'Text', text: '通用' }] },
            { id: 'nav-model', type: 'Container', props: { className: 'px-3 py-2 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer mt-1' }, children: [{ id: 'nav-model-text', type: 'Text', text: '模型' }] },
            { id: 'nav-data', type: 'Container', props: { className: 'px-3 py-2 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer mt-1' }, children: [{ id: 'nav-data-text', type: 'Text', text: '数据' }] },
            { id: 'nav-about', type: 'Container', props: { className: 'px-3 py-2 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer mt-1' }, children: [{ id: 'nav-about-text', type: 'Text', text: '关于' }] },
          ]},
          { id: 'settings-panel', type: 'Container', props: { className: 'flex-1 p-6 overflow-auto' }, children: [
            { id: 'panel-title', type: 'Text', props: { className: 'text-xl font-bold mb-6' }, text: '通用设置' },
          ]},
        ]},
      ],
    },
  },
};

/**
 * 知识库页面布局案例
 * Requirements: 24.5
 */
export const knowledgePageLayoutExample: ExampleMetadata = {
  id: 'system-cherry-knowledge-page-layout',
  title: 'Cherry 知识库页面布局',
  description: 'Cherry Studio 风格的知识库页面布局，包含侧边栏、文档列表和详情',
  category: 'layout',
  tags: ['layout', 'cherry', 'knowledge', 'page'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'knowledge-page',
      type: 'Container',
      props: { className: 'flex h-screen bg-[var(--cherry-background)]' },
      children: [
        { id: 'sidebar', type: 'Container', props: { className: 'w-[60px] bg-[var(--cherry-background-soft)] border-r border-[var(--cherry-border)]' }, children: [] },
        { id: 'doc-list', type: 'Container', props: { className: 'w-72 border-r border-[var(--cherry-border)]' }, children: [
          { id: 'list-header', type: 'Container', props: { className: 'h-12 px-4 flex items-center justify-between border-b border-[var(--cherry-border)]' }, children: [
            { id: 'title', type: 'Text', props: { className: 'font-medium' }, text: '知识库' },
            { id: 'upload-btn', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'upload-icon', type: 'Icon', props: { name: 'upload', size: 16 } }] },
          ]},
        ]},
        { id: 'doc-detail', type: 'Container', props: { className: 'flex-1 p-6' }, children: [] },
      ],
    },
  },
};

/**
 * 翻译页面布局案例
 * Requirements: 24.6
 */
export const translationPageLayoutExample: ExampleMetadata = {
  id: 'system-cherry-translation-page-layout',
  title: 'Cherry 翻译页面布局',
  description: 'Cherry Studio 风格的翻译页面布局，包含侧边栏和翻译面板',
  category: 'layout',
  tags: ['layout', 'cherry', 'translation', 'page'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'translation-page',
      type: 'Container',
      props: { className: 'flex h-screen bg-[var(--cherry-background)]' },
      children: [
        { id: 'sidebar', type: 'Container', props: { className: 'w-[60px] bg-[var(--cherry-background-soft)] border-r border-[var(--cherry-border)]' }, children: [] },
        { id: 'translation-content', type: 'Container', props: { className: 'flex-1 p-6' }, children: [
          { id: 'title', type: 'Text', props: { className: 'text-xl font-bold mb-6' }, text: '翻译' },
          { id: 'translation-panel', type: 'Container', props: { className: 'grid grid-cols-2 gap-4 h-[calc(100%-60px)]' }, children: [
            { id: 'source-panel', type: 'Card', props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' }, children: [] },
            { id: 'target-panel', type: 'Card', props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' }, children: [] },
          ]},
        ]},
      ],
    },
  },
};

/**
 * 图片生成页面布局案例
 * Requirements: 24.7
 */
export const imagePageLayoutExample: ExampleMetadata = {
  id: 'system-cherry-image-page-layout',
  title: 'Cherry 图片生成页面布局',
  description: 'Cherry Studio 风格的图片生成页面布局，包含侧边栏、提示词输入和图片画廊',
  category: 'layout',
  tags: ['layout', 'cherry', 'image', 'page'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'image-page',
      type: 'Container',
      props: { className: 'flex h-screen bg-[var(--cherry-background)]' },
      children: [
        { id: 'sidebar', type: 'Container', props: { className: 'w-[60px] bg-[var(--cherry-background-soft)] border-r border-[var(--cherry-border)]' }, children: [] },
        { id: 'image-content', type: 'Container', props: { className: 'flex-1 flex' }, children: [
          { id: 'prompt-panel', type: 'Container', props: { className: 'w-80 border-r border-[var(--cherry-border)] p-4' }, children: [
            { id: 'prompt-title', type: 'Text', props: { className: 'font-medium mb-4' }, text: '提示词' },
            { id: 'prompt-input', type: 'Textarea', props: { placeholder: '描述你想生成的图片...', className: 'min-h-[120px]' } },
            { id: 'generate-btn', type: 'Button', props: { className: 'w-full mt-4 bg-[var(--cherry-primary)] gap-2' }, children: [
              { id: 'generate-btn-icon', type: 'Icon', props: { name: 'plus', size: 16 } },
              { id: 'generate-btn-text', type: 'Text', text: '生成' },
            ] },
          ]},
          { id: 'gallery', type: 'Container', props: { className: 'flex-1 p-6' }, children: [
            { id: 'gallery-title', type: 'Text', props: { className: 'font-medium mb-4' }, text: '生成结果' },
            { id: 'gallery-grid', type: 'Container', props: { className: 'grid grid-cols-3 gap-4' }, children: [] },
          ]},
        ]},
      ],
    },
  },
};

// ============================================================================
// 设置类案例
// ============================================================================

/**
 * 完整 Settings 界面案例
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 */
export const settingsInterfaceExample: ExampleMetadata = {
  id: 'system-cherry-settings-interface',
  title: 'Cherry 完整设置界面',
  description: 'Cherry Studio 风格的完整设置界面，包含标签页导航、设置分组、各类控件',
  category: 'form',
  tags: ['settings', 'cherry', 'tabs', 'form'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'settings-interface',
      type: 'Container',
      props: { className: 'max-w-3xl mx-auto p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'settings-header', type: 'Text', props: { className: 'text-2xl font-bold mb-6' }, text: '设置' },
        {
          id: 'settings-tabs',
          type: 'Container',
          props: { className: 'flex gap-1 mb-6 border-b border-[var(--cherry-border)]' },
          children: [
            { id: 'tab-general', type: 'Button', props: { variant: 'ghost', className: 'rounded-none border-b-2 border-[var(--cherry-primary)] text-[var(--cherry-primary)]' }, text: '通用' },
            { id: 'tab-model', type: 'Button', props: { variant: 'ghost', className: 'rounded-none border-b-2 border-transparent' }, text: '模型' },
            { id: 'tab-data', type: 'Button', props: { variant: 'ghost', className: 'rounded-none border-b-2 border-transparent' }, text: '数据' },
            { id: 'tab-about', type: 'Button', props: { variant: 'ghost', className: 'rounded-none border-b-2 border-transparent' }, text: '关于' },
          ],
        },
        {
          id: 'settings-content',
          type: 'Container',
          props: { className: 'space-y-6' },
          children: [
            {
              id: 'appearance-group',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'appearance-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: '外观' },
                {
                  id: 'theme-setting',
                  type: 'Container',
                  props: { className: 'flex items-center justify-between py-3 border-b border-[var(--cherry-border)]' },
                  children: [
                    { id: 'theme-label', type: 'Container', children: [
                      { id: 'theme-name', type: 'Text', props: { className: 'font-medium' }, text: '主题' },
                      { id: 'theme-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '选择应用主题' },
                    ]},
                    { id: 'theme-select', type: 'Button', props: { variant: 'outline', size: 'sm' }, text: '深色 ▼' },
                  ],
                },
                {
                  id: 'font-setting',
                  type: 'Container',
                  props: { className: 'flex items-center justify-between py-3' },
                  children: [
                    { id: 'font-label', type: 'Container', children: [
                      { id: 'font-name', type: 'Text', props: { className: 'font-medium' }, text: '字体大小' },
                      { id: 'font-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '调整界面字体大小' },
                    ]},
                    { id: 'font-slider', type: 'Container', props: { className: 'w-32 h-2 bg-[var(--cherry-border)] rounded-full' }, children: [
                      { id: 'slider-thumb', type: 'Container', props: { className: 'w-4 h-4 bg-[var(--cherry-primary)] rounded-full -mt-1 ml-[50%]' }, children: [] },
                    ]},
                  ],
                },
              ],
            },
            {
              id: 'behavior-group',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'behavior-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: '行为' },
                {
                  id: 'startup-setting',
                  type: 'Container',
                  props: { className: 'flex items-center justify-between py-3 border-b border-[var(--cherry-border)]' },
                  children: [
                    { id: 'startup-label', type: 'Container', children: [
                      { id: 'startup-name', type: 'Text', props: { className: 'font-medium' }, text: '开机启动' },
                      { id: 'startup-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '系统启动时自动运行' },
                    ]},
                    { id: 'startup-switch', type: 'Switch', props: { checked: true } },
                  ],
                },
                {
                  id: 'tray-setting',
                  type: 'Container',
                  props: { className: 'flex items-center justify-between py-3' },
                  children: [
                    { id: 'tray-label', type: 'Container', children: [
                      { id: 'tray-name', type: 'Text', props: { className: 'font-medium' }, text: '最小化到托盘' },
                      { id: 'tray-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '关闭窗口时最小化到系统托盘' },
                    ]},
                    { id: 'tray-switch', type: 'Switch' },
                  ],
                },
              ],
            },
            {
              id: 'danger-zone',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-red-500/30' },
              children: [
                { id: 'danger-title', type: 'Text', props: { className: 'font-semibold mb-4 text-red-500' }, text: '危险区域' },
                {
                  id: 'clear-data',
                  type: 'Container',
                  props: { className: 'flex items-center justify-between py-3' },
                  children: [
                    { id: 'clear-label', type: 'Container', children: [
                      { id: 'clear-name', type: 'Text', props: { className: 'font-medium' }, text: '清除所有数据' },
                      { id: 'clear-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '删除所有对话和设置' },
                    ]},
                    { id: 'clear-btn', type: 'Button', props: { variant: 'destructive', size: 'sm', className: 'gap-2' }, children: [
                      { id: 'clear-btn-icon', type: 'Icon', props: { name: 'trash', size: 14 } },
                      { id: 'clear-btn-text', type: 'Text', text: '清除' },
                    ] },
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
 * LLM 设置案例
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */
export const llmSettingsExample: ExampleMetadata = {
  id: 'system-cherry-llm-settings',
  title: 'Cherry LLM 设置',
  description: 'Cherry Studio 风格的 LLM 模型配置界面，包含提供商选择、API Key、参数滑块',
  category: 'form',
  tags: ['settings', 'cherry', 'llm', 'api'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'llm-settings',
      type: 'Container',
      props: { className: 'max-w-2xl mx-auto p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'llm-title', type: 'Text', props: { className: 'text-xl font-bold mb-6' }, text: 'LLM 设置' },
        {
          id: 'provider-section',
          type: 'Card',
          props: { className: 'p-4 mb-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
          children: [
            { id: 'provider-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: '提供商' },
            {
              id: 'provider-grid',
              type: 'Container',
              props: { className: 'grid grid-cols-4 gap-2' },
              children: [
                { id: 'provider-openai', type: 'Container', props: { className: 'p-3 rounded-lg bg-[var(--cherry-active)] border-2 border-[var(--cherry-primary)] cursor-pointer text-center' }, children: [
                  { id: 'openai-logo', type: 'Container', props: { className: 'w-8 h-8 mx-auto mb-2 rounded bg-green-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'logo-text', type: 'Text', text: 'O' }] },
                  { id: 'openai-name', type: 'Text', props: { className: 'text-sm' }, text: 'OpenAI' },
                ]},
                { id: 'provider-anthropic', type: 'Container', props: { className: 'p-3 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer text-center' }, children: [
                  { id: 'anthropic-logo', type: 'Container', props: { className: 'w-8 h-8 mx-auto mb-2 rounded bg-orange-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'logo-text-2', type: 'Text', text: 'A' }] },
                  { id: 'anthropic-name', type: 'Text', props: { className: 'text-sm' }, text: 'Anthropic' },
                ]},
                { id: 'provider-google', type: 'Container', props: { className: 'p-3 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer text-center' }, children: [
                  { id: 'google-logo', type: 'Container', props: { className: 'w-8 h-8 mx-auto mb-2 rounded bg-blue-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'logo-text-3', type: 'Text', text: 'G' }] },
                  { id: 'google-name', type: 'Text', props: { className: 'text-sm' }, text: 'Google' },
                ]},
                { id: 'provider-custom', type: 'Container', props: { className: 'p-3 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer text-center' }, children: [
                  { id: 'custom-logo', type: 'Container', props: { className: 'w-8 h-8 mx-auto mb-2 rounded bg-gray-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'logo-text-4', type: 'Text', text: '+' }] },
                  { id: 'custom-name', type: 'Text', props: { className: 'text-sm' }, text: '自定义' },
                ]},
              ],
            },
          ],
        },
        {
          id: 'api-section',
          type: 'Card',
          props: { className: 'p-4 mb-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
          children: [
            { id: 'api-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: 'API 配置' },
            {
              id: 'api-key-field',
              type: 'Container',
              props: { className: 'mb-4' },
              children: [
                { id: 'api-key-label', type: 'Label', props: { className: 'mb-2 block' }, text: 'API Key' },
                { id: 'api-key-wrapper', type: 'Container', props: { className: 'flex gap-2' }, children: [
                  { id: 'api-key-input', type: 'Input', props: { type: 'password', placeholder: 'sk-...', className: 'flex-1' } },
                  { id: 'api-key-toggle', type: 'Button', props: { variant: 'outline', size: 'sm' }, children: [{ id: 'toggle-icon', type: 'Icon', props: { name: 'search', size: 14 } }] },
                ]},
              ],
            },
            {
              id: 'endpoint-field',
              type: 'Container',
              props: { className: 'mb-4' },
              children: [
                { id: 'endpoint-label', type: 'Label', props: { className: 'mb-2 block' }, text: 'API 端点' },
                { id: 'endpoint-input', type: 'Input', props: { placeholder: 'https://api.openai.com/v1' } },
              ],
            },
            {
              id: 'test-connection',
              type: 'Container',
              props: { className: 'flex items-center gap-2' },
              children: [
                { id: 'test-btn', type: 'Button', props: { variant: 'outline', size: 'sm', className: 'gap-2' }, children: [
                  { id: 'test-btn-icon', type: 'Icon', props: { name: 'link', size: 14 } },
                  { id: 'test-btn-text', type: 'Text', text: '测试连接' },
                ] },
                { id: 'test-status', type: 'Container', props: { className: 'flex items-center gap-1 text-green-500 text-sm' }, children: [
                { id: 'status-icon', type: 'Icon', props: { name: 'check', size: 14, className: 'text-green-500' } },
                  { id: 'status-text', type: 'Text', text: '连接成功' },
                ]},
              ],
            },
          ],
        },
        {
          id: 'params-section',
          type: 'Card',
          props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
          children: [
            { id: 'params-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: '模型参数' },
            {
              id: 'temp-param',
              type: 'Container',
              props: { className: 'mb-4' },
              children: [
                { id: 'temp-header', type: 'Container', props: { className: 'flex justify-between mb-2' }, children: [
                  { id: 'temp-label', type: 'Text', props: { className: 'text-sm' }, text: 'Temperature' },
                  { id: 'temp-value', type: 'Text', props: { className: 'text-sm font-mono' }, text: '0.7' },
                ]},
                { id: 'temp-slider', type: 'Container', props: { className: 'h-2 bg-[var(--cherry-border)] rounded-full' }, children: [
                  { id: 'temp-track', type: 'Container', props: { className: 'h-full w-[70%] bg-[var(--cherry-primary)] rounded-full' }, children: [] },
                ]},
              ],
            },
            {
              id: 'top-p-param',
              type: 'Container',
              props: { className: 'mb-4' },
              children: [
                { id: 'top-p-header', type: 'Container', props: { className: 'flex justify-between mb-2' }, children: [
                  { id: 'top-p-label', type: 'Text', props: { className: 'text-sm' }, text: 'Top P' },
                  { id: 'top-p-value', type: 'Text', props: { className: 'text-sm font-mono' }, text: '0.9' },
                ]},
                { id: 'top-p-slider', type: 'Container', props: { className: 'h-2 bg-[var(--cherry-border)] rounded-full' }, children: [
                  { id: 'top-p-track', type: 'Container', props: { className: 'h-full w-[90%] bg-[var(--cherry-primary)] rounded-full' }, children: [] },
                ]},
              ],
            },
            {
              id: 'max-tokens-param',
              type: 'Container',
              children: [
                { id: 'max-tokens-header', type: 'Container', props: { className: 'flex justify-between mb-2' }, children: [
                  { id: 'max-tokens-label', type: 'Text', props: { className: 'text-sm' }, text: 'Max Tokens' },
                  { id: 'max-tokens-value', type: 'Text', props: { className: 'text-sm font-mono' }, text: '4096' },
                ]},
                { id: 'max-tokens-slider', type: 'Container', props: { className: 'h-2 bg-[var(--cherry-border)] rounded-full' }, children: [
                  { id: 'max-tokens-track', type: 'Container', props: { className: 'h-full w-[50%] bg-[var(--cherry-primary)] rounded-full' }, children: [] },
                ]},
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 快捷键面板案例
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */
export const shortcutsPanelExample: ExampleMetadata = {
  id: 'system-cherry-shortcuts-panel',
  title: 'Cherry 快捷键面板',
  description: 'Cherry Studio 风格的快捷键配置面板，包含快捷键列表、按键组合显示、自定义快捷键',
  category: 'form',
  tags: ['settings', 'cherry', 'shortcuts', 'keyboard'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'shortcuts-panel',
      type: 'Container',
      props: { className: 'max-w-2xl mx-auto p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'shortcuts-header', type: 'Container', props: { className: 'flex items-center justify-between mb-6' }, children: [
          { id: 'shortcuts-title', type: 'Text', props: { className: 'text-xl font-bold' }, text: '快捷键' },
          { id: 'search-input', type: 'Input', props: { placeholder: '搜索快捷键...', className: 'w-48' } },
        ]},
        {
          id: 'shortcuts-list',
          type: 'Card',
          props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
          children: [
            { id: 'category-general', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)] mb-3' }, text: '通用' },
            {
              id: 'shortcut-new-chat',
              type: 'Container',
              props: { className: 'flex items-center justify-between py-2 border-b border-[var(--cherry-border)]' },
              children: [
                { id: 'new-chat-label', type: 'Text', text: '新建对话' },
                { id: 'new-chat-keys', type: 'Container', props: { className: 'flex gap-1' }, children: [
                  { id: 'key-ctrl', type: 'Container', props: { className: 'px-2 py-1 bg-[var(--cherry-background)] rounded text-xs font-mono' }, children: [{ id: 'ctrl-text', type: 'Text', text: 'Ctrl' }] },
                  { id: 'key-plus', type: 'Text', props: { className: 'text-[var(--cherry-text-2)]' }, text: '+' },
                  { id: 'key-n', type: 'Container', props: { className: 'px-2 py-1 bg-[var(--cherry-background)] rounded text-xs font-mono' }, children: [{ id: 'n-text', type: 'Text', text: 'N' }] },
                ]},
              ],
            },
            {
              id: 'shortcut-send',
              type: 'Container',
              props: { className: 'flex items-center justify-between py-2 border-b border-[var(--cherry-border)]' },
              children: [
                { id: 'send-label', type: 'Text', text: '发送消息' },
                { id: 'send-keys', type: 'Container', props: { className: 'flex gap-1' }, children: [
                  { id: 'key-enter', type: 'Container', props: { className: 'px-2 py-1 bg-[var(--cherry-background)] rounded text-xs font-mono' }, children: [{ id: 'enter-text', type: 'Text', text: 'Enter' }] },
                ]},
              ],
            },
            {
              id: 'shortcut-settings',
              type: 'Container',
              props: { className: 'flex items-center justify-between py-2' },
              children: [
                { id: 'settings-label', type: 'Text', text: '打开设置' },
                { id: 'settings-keys', type: 'Container', props: { className: 'flex gap-1' }, children: [
                  { id: 'key-ctrl-2', type: 'Container', props: { className: 'px-2 py-1 bg-[var(--cherry-background)] rounded text-xs font-mono' }, children: [{ id: 'ctrl-text-2', type: 'Text', text: 'Ctrl' }] },
                  { id: 'key-plus-2', type: 'Text', props: { className: 'text-[var(--cherry-text-2)]' }, text: '+' },
                  { id: 'key-comma', type: 'Container', props: { className: 'px-2 py-1 bg-[var(--cherry-background)] rounded text-xs font-mono' }, children: [{ id: 'comma-text', type: 'Text', text: ',' }] },
                ]},
              ],
            },
          ],
        },
        { id: 'reset-btn', type: 'Button', props: { variant: 'outline', className: 'mt-4 gap-2' }, children: [
          { id: 'reset-btn-icon', type: 'Icon', props: { name: 'refresh', size: 16 } },
          { id: 'reset-btn-text', type: 'Text', text: '恢复默认' },
        ] },
      ],
    },
  },
};

/**
 * 模型提供商配置案例
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */
export const providerConfigExample: ExampleMetadata = {
  id: 'system-cherry-provider-config',
  title: 'Cherry 提供商配置',
  description: 'Cherry Studio 风格的模型提供商配置界面，包含提供商卡片、状态指示、代理配置',
  category: 'form',
  tags: ['settings', 'cherry', 'provider', 'config'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'provider-config',
      type: 'Container',
      props: { className: 'max-w-3xl mx-auto p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'provider-title', type: 'Text', props: { className: 'text-xl font-bold mb-6' }, text: '模型提供商' },
        {
          id: 'provider-list',
          type: 'Container',
          props: { className: 'space-y-4' },
          children: [
            {
              id: 'openai-provider',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'openai-header', type: 'Container', props: { className: 'flex items-center justify-between mb-4' }, children: [
                  { id: 'openai-info', type: 'Container', props: { className: 'flex items-center gap-3' }, children: [
                    { id: 'openai-logo', type: 'Container', props: { className: 'w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold' }, children: [{ id: 'logo', type: 'Text', text: 'O' }] },
                    { id: 'openai-details', type: 'Container', children: [
                      { id: 'openai-name', type: 'Text', props: { className: 'font-medium' }, text: 'OpenAI' },
                      { id: 'openai-status', type: 'Container', props: { className: 'flex items-center gap-1 text-xs text-green-500' }, children: [
                        { id: 'status-dot', type: 'Container', props: { className: 'w-2 h-2 rounded-full bg-green-500' }, children: [] },
                        { id: 'status-text', type: 'Text', text: '已连接' },
                      ]},
                    ]},
                  ]},
                  { id: 'openai-switch', type: 'Switch', props: { checked: true } },
                ]},
                { id: 'openai-models', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '可用模型: GPT-4o, GPT-4, GPT-3.5-turbo' },
              ],
            },
            {
              id: 'anthropic-provider',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'anthropic-header', type: 'Container', props: { className: 'flex items-center justify-between mb-4' }, children: [
                  { id: 'anthropic-info', type: 'Container', props: { className: 'flex items-center gap-3' }, children: [
                    { id: 'anthropic-logo', type: 'Container', props: { className: 'w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold' }, children: [{ id: 'logo-2', type: 'Text', text: 'A' }] },
                    { id: 'anthropic-details', type: 'Container', children: [
                      { id: 'anthropic-name', type: 'Text', props: { className: 'font-medium' }, text: 'Anthropic' },
                      { id: 'anthropic-status', type: 'Container', props: { className: 'flex items-center gap-1 text-xs text-[var(--cherry-text-2)]' }, children: [
                        { id: 'status-dot-2', type: 'Container', props: { className: 'w-2 h-2 rounded-full bg-gray-500' }, children: [] },
                        { id: 'status-text-2', type: 'Text', text: '未配置' },
                      ]},
                    ]},
                  ]},
                  { id: 'anthropic-switch', type: 'Switch' },
                ]},
                { id: 'anthropic-models', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '可用模型: Claude 3.5 Sonnet, Claude 3 Opus' },
              ],
            },
          ],
        },
        {
          id: 'proxy-section',
          type: 'Card',
          props: { className: 'p-4 mt-6 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
          children: [
            { id: 'proxy-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: '代理设置' },
            { id: 'proxy-input', type: 'Input', props: { placeholder: 'http://127.0.0.1:7890' } },
          ],
        },
      ],
    },
  },
};


// ============================================================================
// 管理类案例
// ============================================================================

/**
 * 助手管理案例
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
 */
export const assistantManagerExample: ExampleMetadata = {
  id: 'system-cherry-assistant-manager',
  title: 'Cherry 助手管理',
  description: 'Cherry Studio 风格的助手管理界面，包含助手卡片网格、Emoji 头像选择、系统提示词编辑',
  category: 'display',
  tags: ['assistant', 'cherry', 'manager', 'grid'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'assistant-manager',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'manager-header', type: 'Container', props: { className: 'flex items-center justify-between mb-6' }, children: [
          { id: 'manager-title', type: 'Text', props: { className: 'text-xl font-bold' }, text: '助手管理' },
          { id: 'header-actions', type: 'Container', props: { className: 'flex gap-2' }, children: [
            { id: 'import-btn', type: 'Button', props: { variant: 'outline', size: 'sm', className: 'gap-2' }, children: [
              { id: 'import-btn-icon', type: 'Icon', props: { name: 'download', size: 14 } },
              { id: 'import-btn-text', type: 'Text', text: '导入' },
            ] },
            { id: 'create-btn', type: 'Button', props: { size: 'sm', className: 'bg-[var(--cherry-primary)] gap-2' }, children: [
              { id: 'create-btn-icon', type: 'Icon', props: { name: 'plus', size: 14 } },
              { id: 'create-btn-text', type: 'Text', text: '新建助手' },
            ] },
          ]},
        ]},
        {
          id: 'assistant-grid',
          type: 'Container',
          props: { className: 'grid grid-cols-3 gap-4' },
          children: [
            {
              id: 'assistant-1',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)] hover:border-[var(--cherry-primary)] cursor-pointer transition-colors' },
              children: [
                { id: 'assistant-1-header', type: 'Container', props: { className: 'flex items-start justify-between mb-3' }, children: [
                  { id: 'assistant-1-avatar', type: 'Container', props: { className: 'w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center' }, children: [{ id: 'emoji-1', type: 'Icon', props: { name: 'user', size: 24 } }] },
                  { id: 'assistant-1-menu', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'menu-icon', type: 'Icon', props: { name: 'settings', size: 16 } }] },
                ]},
                { id: 'assistant-1-name', type: 'Text', props: { className: 'font-medium mb-1' }, text: '代码助手' },
                { id: 'assistant-1-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)] line-clamp-2' }, text: '专业的编程助手，擅长代码编写、调试和优化' },
                { id: 'assistant-1-model', type: 'Container', props: { className: 'mt-3 flex items-center gap-2' }, children: [
                  { id: 'model-badge', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'model-text', type: 'Text', text: 'GPT-4o' }] },
                ]},
              ],
            },
            {
              id: 'assistant-2',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)] hover:border-[var(--cherry-primary)] cursor-pointer transition-colors' },
              children: [
                { id: 'assistant-2-header', type: 'Container', props: { className: 'flex items-start justify-between mb-3' }, children: [
                  { id: 'assistant-2-avatar', type: 'Container', props: { className: 'w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center' }, children: [{ id: 'emoji-2', type: 'Icon', props: { name: 'edit', size: 24 } }] },
                  { id: 'assistant-2-menu', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'menu-icon-2', type: 'Icon', props: { name: 'menu', size: 16 } }] },
                ]},
                { id: 'assistant-2-name', type: 'Text', props: { className: 'font-medium mb-1' }, text: '写作助手' },
                { id: 'assistant-2-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)] line-clamp-2' }, text: '帮助你撰写文章、邮件和各类文档' },
                { id: 'assistant-2-model', type: 'Container', props: { className: 'mt-3 flex items-center gap-2' }, children: [
                  { id: 'model-badge-2', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'model-text-2', type: 'Text', text: 'Claude 3.5' }] },
                ]},
              ],
            },
            {
              id: 'assistant-3',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)] hover:border-[var(--cherry-primary)] cursor-pointer transition-colors' },
              children: [
                { id: 'assistant-3-header', type: 'Container', props: { className: 'flex items-start justify-between mb-3' }, children: [
                  { id: 'assistant-3-avatar', type: 'Container', props: { className: 'w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center' }, children: [{ id: 'emoji-3', type: 'Icon', props: { name: 'share', size: 24 } }] },
                  { id: 'assistant-3-menu', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'menu-icon-3', type: 'Icon', props: { name: 'menu', size: 16 } }] },
                ]},
                { id: 'assistant-3-name', type: 'Text', props: { className: 'font-medium mb-1' }, text: '翻译助手' },
                { id: 'assistant-3-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)] line-clamp-2' }, text: '多语言翻译专家，支持中英日韩等多种语言' },
                { id: 'assistant-3-model', type: 'Container', props: { className: 'mt-3 flex items-center gap-2' }, children: [
                  { id: 'model-badge-3', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'model-text-3', type: 'Text', text: 'GPT-4o' }] },
                ]},
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 知识库面板案例
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
 */
export const knowledgeBaseExample: ExampleMetadata = {
  id: 'system-cherry-knowledge-base',
  title: 'Cherry 知识库面板',
  description: 'Cherry Studio 风格的知识库管理面板，包含文档列表、上传进度、嵌入状态',
  category: 'display',
  tags: ['knowledge', 'cherry', 'documents', 'upload'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'knowledge-base',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'kb-header', type: 'Container', props: { className: 'flex items-center justify-between mb-6' }, children: [
          { id: 'kb-title', type: 'Text', props: { className: 'text-xl font-bold' }, text: '知识库' },
          { id: 'upload-btn', type: 'Button', props: { size: 'sm', className: 'bg-[var(--cherry-primary)] gap-2' }, children: [
            { id: 'upload-btn-icon', type: 'Icon', props: { name: 'upload', size: 14 } },
            { id: 'upload-btn-text', type: 'Text', text: '上传文档' },
          ] },
        ]},
        { id: 'storage-info', type: 'Container', props: { className: 'mb-4 p-3 bg-[var(--cherry-background-soft)] rounded-lg' }, children: [
          { id: 'storage-header', type: 'Container', props: { className: 'flex justify-between text-sm mb-2' }, children: [
            { id: 'storage-label', type: 'Text', text: '存储空间' },
            { id: 'storage-value', type: 'Text', text: '2.4 GB / 10 GB' },
          ]},
          { id: 'storage-bar', type: 'Container', props: { className: 'h-2 bg-[var(--cherry-border)] rounded-full' }, children: [
            { id: 'storage-progress', type: 'Container', props: { className: 'h-full w-[24%] bg-[var(--cherry-primary)] rounded-full' }, children: [] },
          ]},
        ]},
        {
          id: 'doc-list',
          type: 'Card',
          props: { className: 'bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
          children: [
            {
              id: 'doc-1',
              type: 'Container',
              props: { className: 'flex items-center gap-3 p-3 border-b border-[var(--cherry-border)]' },
              children: [
                { id: 'doc-1-icon', type: 'Container', props: { className: 'w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center' }, children: [{ id: 'icon-1', type: 'Icon', props: { name: 'file', size: 20 } }] },
                { id: 'doc-1-info', type: 'Container', props: { className: 'flex-1' }, children: [
                  { id: 'doc-1-name', type: 'Text', props: { className: 'font-medium' }, text: '产品文档.pdf' },
                  { id: 'doc-1-meta', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '2.3 MB · 已嵌入' },
                ]},
                { id: 'doc-1-status', type: 'Container', props: { className: 'flex items-center gap-1 text-green-500 text-xs' }, children: [
                  { id: 'status-1', type: 'Icon', props: { name: 'check', size: 12, className: 'text-green-500' } },
                ]},
              ],
            },
            {
              id: 'doc-2',
              type: 'Container',
              props: { className: 'flex items-center gap-3 p-3 border-b border-[var(--cherry-border)]' },
              children: [
                { id: 'doc-2-icon', type: 'Container', props: { className: 'w-10 h-10 rounded bg-green-500/20 flex items-center justify-center' }, children: [{ id: 'icon-2', type: 'Icon', props: { name: 'file', size: 20 } }] },
                { id: 'doc-2-info', type: 'Container', props: { className: 'flex-1' }, children: [
                  { id: 'doc-2-name', type: 'Text', props: { className: 'font-medium' }, text: '数据报告.xlsx' },
                  { id: 'doc-2-meta', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '1.1 MB · 处理中...' },
                ]},
                { id: 'doc-2-progress', type: 'Container', props: { className: 'w-20' }, children: [
                  { id: 'progress-bar', type: 'Container', props: { className: 'h-1.5 bg-[var(--cherry-border)] rounded-full' }, children: [
                    { id: 'progress-fill', type: 'Container', props: { className: 'h-full w-[60%] bg-[var(--cherry-primary)] rounded-full' }, children: [] },
                  ]},
                ]},
              ],
            },
            {
              id: 'doc-3',
              type: 'Container',
              props: { className: 'flex items-center gap-3 p-3' },
              children: [
                { id: 'doc-3-icon', type: 'Container', props: { className: 'w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center' }, children: [{ id: 'icon-3', type: 'Icon', props: { name: 'file', size: 20 } }] },
                { id: 'doc-3-info', type: 'Container', props: { className: 'flex-1' }, children: [
                  { id: 'doc-3-name', type: 'Text', props: { className: 'font-medium' }, text: '会议记录.md' },
                  { id: 'doc-3-meta', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '45 KB · 已嵌入' },
                ]},
                { id: 'doc-3-status', type: 'Container', props: { className: 'flex items-center gap-1 text-green-500 text-xs' }, children: [
                  { id: 'status-3', type: 'Icon', props: { name: 'check', size: 12, className: 'text-green-500' } },
                ]},
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 模型分类管理案例
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8
 */
export const modelCategoryExample: ExampleMetadata = {
  id: 'system-cherry-model-category',
  title: 'Cherry 模型分类管理',
  description: 'Cherry Studio 风格的模型分类管理界面，包含分类列表、拖拽排序、模型计数徽章',
  category: 'display',
  tags: ['model', 'cherry', 'category', 'management'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'model-category',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'category-header', type: 'Container', props: { className: 'flex items-center justify-between mb-6' }, children: [
          { id: 'category-title', type: 'Text', props: { className: 'text-xl font-bold' }, text: '模型分类' },
          { id: 'add-category-btn', type: 'Button', props: { size: 'sm', className: 'bg-[var(--cherry-primary)] gap-2' }, children: [
            { id: 'add-category-btn-icon', type: 'Icon', props: { name: 'plus', size: 14 } },
            { id: 'add-category-btn-text', type: 'Text', text: '新建分类' },
          ] },
        ]},
        {
          id: 'category-list',
          type: 'Container',
          props: { className: 'space-y-2' },
          children: [
            {
              id: 'category-1',
              type: 'Container',
              props: { className: 'flex items-center gap-3 p-3 bg-[var(--cherry-background-soft)] rounded-lg cursor-move' },
              children: [
                { id: 'drag-handle-1', type: 'Text', props: { className: 'text-[var(--cherry-text-2)] cursor-grab' }, text: '⋮⋮' },
                { id: 'category-1-color', type: 'Container', props: { className: 'w-3 h-3 rounded-full bg-green-500' }, children: [] },
                { id: 'category-1-name', type: 'Text', props: { className: 'flex-1 font-medium' }, text: 'OpenAI' },
                { id: 'category-1-count', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'count-1', type: 'Text', text: '5 个模型' }] },
                { id: 'category-1-default', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-primary)]/20 text-[var(--cherry-primary)] rounded text-xs' }, children: [{ id: 'default-text', type: 'Text', text: '默认' }] },
              ],
            },
            {
              id: 'category-2',
              type: 'Container',
              props: { className: 'flex items-center gap-3 p-3 bg-[var(--cherry-background-soft)] rounded-lg cursor-move' },
              children: [
                { id: 'drag-handle-2', type: 'Text', props: { className: 'text-[var(--cherry-text-2)] cursor-grab' }, text: '⋮⋮' },
                { id: 'category-2-color', type: 'Container', props: { className: 'w-3 h-3 rounded-full bg-orange-500' }, children: [] },
                { id: 'category-2-name', type: 'Text', props: { className: 'flex-1 font-medium' }, text: 'Anthropic' },
                { id: 'category-2-count', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'count-2', type: 'Text', text: '3 个模型' }] },
              ],
            },
            {
              id: 'category-3',
              type: 'Container',
              props: { className: 'flex items-center gap-3 p-3 bg-[var(--cherry-background-soft)] rounded-lg cursor-move' },
              children: [
                { id: 'drag-handle-3', type: 'Text', props: { className: 'text-[var(--cherry-text-2)] cursor-grab' }, text: '⋮⋮' },
                { id: 'category-3-color', type: 'Container', props: { className: 'w-3 h-3 rounded-full bg-blue-500' }, children: [] },
                { id: 'category-3-name', type: 'Text', props: { className: 'flex-1 font-medium' }, text: 'Google' },
                { id: 'category-3-count', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'count-3', type: 'Text', text: '2 个模型' }] },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * MCP 管理案例
 * Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8, 23.9, 23.10
 */
export const mcpManagerExample: ExampleMetadata = {
  id: 'system-cherry-mcp-manager',
  title: 'Cherry MCP 管理',
  description: 'Cherry Studio 风格的 MCP 服务器管理界面，包含服务器列表、配置表单、工具列表、日志查看',
  category: 'display',
  tags: ['mcp', 'cherry', 'server', 'management'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'mcp-manager',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'mcp-header', type: 'Container', props: { className: 'flex items-center justify-between mb-6' }, children: [
          { id: 'mcp-title', type: 'Text', props: { className: 'text-xl font-bold' }, text: 'MCP 服务器' },
          { id: 'add-server-btn', type: 'Button', props: { size: 'sm', className: 'bg-[var(--cherry-primary)] gap-2' }, children: [
            { id: 'add-server-btn-icon', type: 'Icon', props: { name: 'plus', size: 14 } },
            { id: 'add-server-btn-text', type: 'Text', text: '添加服务器' },
          ] },
        ]},
        {
          id: 'server-list',
          type: 'Container',
          props: { className: 'space-y-4' },
          children: [
            {
              id: 'server-1',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'server-1-header', type: 'Container', props: { className: 'flex items-center justify-between mb-3' }, children: [
                  { id: 'server-1-info', type: 'Container', props: { className: 'flex items-center gap-3' }, children: [
                    { id: 'server-1-status', type: 'Container', props: { className: 'w-2 h-2 rounded-full bg-green-500' }, children: [] },
                    { id: 'server-1-name', type: 'Text', props: { className: 'font-medium' }, text: 'filesystem' },
                  ]},
                  { id: 'server-1-actions', type: 'Container', props: { className: 'flex items-center gap-2' }, children: [
                    { id: 'restart-btn', type: 'Button', props: { variant: 'ghost', size: 'sm' }, text: '↻' },
                    { id: 'server-1-switch', type: 'Switch', props: { checked: true } },
                  ]},
                ]},
                { id: 'server-1-command', type: 'Container', props: { className: 'p-2 bg-[var(--cherry-background)] rounded text-xs font-mono mb-3' }, children: [
                  { id: 'command-text', type: 'Text', text: 'npx -y @anthropic/mcp-server-filesystem' },
                ]},
                { id: 'server-1-tools', type: 'Container', props: { className: 'flex flex-wrap gap-1' }, children: [
                  { id: 'tool-1', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'tool-1-text', type: 'Text', text: 'read_file' }] },
                  { id: 'tool-2', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'tool-2-text', type: 'Text', text: 'write_file' }] },
                  { id: 'tool-3', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'tool-3-text', type: 'Text', text: 'list_directory' }] },
                ]},
              ],
            },
            {
              id: 'server-2',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'server-2-header', type: 'Container', props: { className: 'flex items-center justify-between mb-3' }, children: [
                  { id: 'server-2-info', type: 'Container', props: { className: 'flex items-center gap-3' }, children: [
                    { id: 'server-2-status', type: 'Container', props: { className: 'w-2 h-2 rounded-full bg-gray-500' }, children: [] },
                    { id: 'server-2-name', type: 'Text', props: { className: 'font-medium' }, text: 'web-search' },
                  ]},
                  { id: 'server-2-actions', type: 'Container', props: { className: 'flex items-center gap-2' }, children: [
                    { id: 'restart-btn-2', type: 'Button', props: { variant: 'ghost', size: 'sm' }, text: '↻' },
                    { id: 'server-2-switch', type: 'Switch' },
                  ]},
                ]},
                { id: 'server-2-command', type: 'Container', props: { className: 'p-2 bg-[var(--cherry-background)] rounded text-xs font-mono' }, children: [
                  { id: 'command-text-2', type: 'Text', text: 'npx -y @anthropic/mcp-server-web-search' },
                ]},
              ],
            },
          ],
        },
      ],
    },
  },
};


/**
 * 插件管理案例
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */
export const pluginManagerExample: ExampleMetadata = {
  id: 'system-cherry-plugin-manager',
  title: 'Cherry 插件管理',
  description: 'Cherry Studio 风格的插件管理界面，包含已安装插件列表、启用/禁用开关、更新通知',
  category: 'display',
  tags: ['plugin', 'cherry', 'manager', 'extension'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'plugin-manager',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'plugin-header', type: 'Container', props: { className: 'flex items-center justify-between mb-6' }, children: [
          { id: 'plugin-title', type: 'Text', props: { className: 'text-xl font-bold' }, text: '插件管理' },
          { id: 'browse-btn', type: 'Button', props: { variant: 'outline', size: 'sm' }, text: '浏览插件市场' },
        ]},
        {
          id: 'plugin-list',
          type: 'Container',
          props: { className: 'space-y-3' },
          children: [
            {
              id: 'plugin-1',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'plugin-1-header', type: 'Container', props: { className: 'flex items-center justify-between' }, children: [
                  { id: 'plugin-1-info', type: 'Container', props: { className: 'flex items-center gap-3' }, children: [
                    { id: 'plugin-1-icon', type: 'Container', props: { className: 'w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center' }, children: [{ id: 'icon-1', type: 'Icon', props: { name: 'search', size: 20 } }] },
                    { id: 'plugin-1-details', type: 'Container', children: [
                      { id: 'plugin-1-name', type: 'Text', props: { className: 'font-medium' }, text: 'Web Search' },
                      { id: 'plugin-1-version', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: 'v1.2.0' },
                    ]},
                  ]},
                  { id: 'plugin-1-switch', type: 'Switch', props: { checked: true } },
                ]},
              ],
            },
            {
              id: 'plugin-2',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'plugin-2-header', type: 'Container', props: { className: 'flex items-center justify-between' }, children: [
                  { id: 'plugin-2-info', type: 'Container', props: { className: 'flex items-center gap-3' }, children: [
                    { id: 'plugin-2-icon', type: 'Container', props: { className: 'w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center' }, children: [{ id: 'icon-2', type: 'Icon', props: { name: 'file', size: 20 } }] },
                    { id: 'plugin-2-details', type: 'Container', children: [
                      { id: 'plugin-2-name', type: 'Container', props: { className: 'flex items-center gap-2' }, children: [
                        { id: 'name-text', type: 'Text', props: { className: 'font-medium' }, text: 'Data Analysis' },
                        { id: 'update-badge', type: 'Container', props: { className: 'px-1.5 py-0.5 bg-orange-500/20 text-orange-500 rounded text-xs' }, children: [{ id: 'update-text', type: 'Text', text: '有更新' }] },
                      ]},
                      { id: 'plugin-2-version', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: 'v2.0.1 → v2.1.0' },
                    ]},
                  ]},
                  { id: 'plugin-2-switch', type: 'Switch', props: { checked: true } },
                ]},
              ],
            },
            {
              id: 'plugin-3',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)] opacity-60' },
              children: [
                { id: 'plugin-3-header', type: 'Container', props: { className: 'flex items-center justify-between' }, children: [
                  { id: 'plugin-3-info', type: 'Container', props: { className: 'flex items-center gap-3' }, children: [
                    { id: 'plugin-3-icon', type: 'Container', props: { className: 'w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl' }, children: [{ id: 'icon-3', type: 'Text', text: '🎨' }] },
                    { id: 'plugin-3-details', type: 'Container', children: [
                      { id: 'plugin-3-name', type: 'Text', props: { className: 'font-medium' }, text: 'Image Generator' },
                      { id: 'plugin-3-version', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: 'v1.0.0 · 已禁用' },
                    ]},
                  ]},
                  { id: 'plugin-3-switch', type: 'Switch' },
                ]},
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 文件管理器案例
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 19.10
 */
export const fileManagerExample: ExampleMetadata = {
  id: 'system-cherry-file-manager',
  title: 'Cherry 文件管理器',
  description: 'Cherry Studio 风格的文件管理器界面，包含文件树视图、网格/列表切换、面包屑导航',
  category: 'display',
  tags: ['file', 'cherry', 'manager', 'tree'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'file-manager',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'file-header', type: 'Container', props: { className: 'flex items-center justify-between mb-4' }, children: [
          { id: 'breadcrumb', type: 'Container', props: { className: 'flex items-center gap-1 text-sm' }, children: [
            { id: 'bc-root', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'gap-1' }, children: [
              { id: 'bc-root-icon', type: 'Icon', props: { name: 'folder', size: 14 } },
              { id: 'bc-root-text', type: 'Text', text: '根目录' },
            ] },
            { id: 'bc-sep', type: 'Text', props: { className: 'text-[var(--cherry-text-2)]' }, text: '/' },
            { id: 'bc-docs', type: 'Button', props: { variant: 'ghost', size: 'sm' }, text: '文档' },
          ]},
          { id: 'view-toggle', type: 'Container', props: { className: 'flex items-center gap-1 p-1 bg-[var(--cherry-background-soft)] rounded' }, children: [
            { id: 'grid-view', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 bg-[var(--cherry-active)]' }, children: [{ id: 'grid-icon', type: 'Icon', props: { name: 'layout-grid', size: 16 } }] },
            { id: 'list-view', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0' }, children: [{ id: 'list-icon', type: 'Icon', props: { name: 'list', size: 16 } }] },
          ]},
        ]},
        { id: 'search-bar', type: 'Input', props: { placeholder: '搜索文件...', className: 'mb-4' } },
        {
          id: 'file-grid',
          type: 'Container',
          props: { className: 'grid grid-cols-4 gap-4' },
          children: [
            {
              id: 'folder-1',
              type: 'Container',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer text-center' },
              children: [
                { id: 'folder-1-icon', type: 'Container', props: { className: 'flex items-center justify-center' }, children: [{ id: 'folder-1-icon-inner', type: 'Icon', props: { name: 'folder', size: 32 } }] },
                { id: 'folder-1-name', type: 'Text', props: { className: 'text-sm truncate' }, text: '项目文档' },
              ],
            },
            {
              id: 'folder-2',
              type: 'Container',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer text-center' },
              children: [
                { id: 'folder-2-icon', type: 'Container', props: { className: 'flex items-center justify-center' }, children: [{ id: 'folder-2-icon-inner', type: 'Icon', props: { name: 'folder', size: 32 } }] },
                { id: 'folder-2-name', type: 'Text', props: { className: 'text-sm truncate' }, text: '图片资源' },
              ],
            },
            {
              id: 'file-1',
              type: 'Container',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer text-center' },
              children: [
                { id: 'file-1-icon', type: 'Container', props: { className: 'flex items-center justify-center' }, children: [{ id: 'file-1-icon-inner', type: 'Icon', props: { name: 'file', size: 32 } }] },
                { id: 'file-1-name', type: 'Text', props: { className: 'text-sm truncate' }, text: 'README.md' },
              ],
            },
            {
              id: 'file-2',
              type: 'Container',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer text-center' },
              children: [
                { id: 'file-2-icon', type: 'Container', props: { className: 'flex items-center justify-center' }, children: [{ id: 'file-2-icon-inner', type: 'Icon', props: { name: 'image', size: 32 } }] },
                { id: 'file-2-name', type: 'Text', props: { className: 'text-sm truncate' }, text: 'logo.png' },
              ],
            },
          ],
        },
      ],
    },
  },
};

// ============================================================================
// 聊天类案例
// ============================================================================

/**
 * 对话历史列表案例
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 */
export const conversationListExample: ExampleMetadata = {
  id: 'system-cherry-conversation-list',
  title: 'Cherry 对话历史列表',
  description: 'Cherry Studio 风格的对话历史列表，包含对话项、时间戳、固定对话区域、日期分组',
  category: 'display',
  tags: ['conversation', 'cherry', 'list', 'history'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'conversation-list',
      type: 'Container',
      props: { className: 'w-72 h-screen bg-[var(--cherry-background)] border-r border-[var(--cherry-border)]' },
      children: [
        { id: 'list-header', type: 'Container', props: { className: 'h-12 px-4 flex items-center justify-between border-b border-[var(--cherry-border)]' }, children: [
          { id: 'list-title', type: 'Text', props: { className: 'font-medium' }, text: '对话' },
          { id: 'search-btn', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'search-icon', type: 'Icon', props: { name: 'search', size: 16 } }] },
        ]},
        { id: 'pinned-section', type: 'Container', props: { className: 'p-2' }, children: [
          { id: 'pinned-label', type: 'Container', props: { className: 'text-xs text-[var(--cherry-text-2)] px-2 mb-1 flex items-center gap-1' }, children: [{ id: 'pin-label-icon', type: 'Icon', props: { name: 'pin', size: 12 } }, { id: 'pin-label-text', type: 'Text', text: '已固定' }] },
          { id: 'pinned-conv', type: 'Container', props: { className: 'p-3 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
            { id: 'pinned-header', type: 'Container', props: { className: 'flex items-center justify-between mb-1' }, children: [
              { id: 'pinned-title', type: 'Text', props: { className: 'font-medium text-sm truncate' }, text: '重要项目讨论' },
              { id: 'pinned-model', type: 'Container', props: { className: 'w-5 h-5 rounded bg-green-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'model-icon', type: 'Text', text: 'G' }] },
            ]},
            { id: 'pinned-preview', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] truncate' }, text: '关于新功能的讨论...' },
          ]},
        ]},
        { id: 'today-section', type: 'Container', props: { className: 'p-2' }, children: [
          { id: 'today-label', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] px-2 mb-1' }, text: '今天' },
          { id: 'conv-1', type: 'Container', props: { className: 'p-3 rounded-lg bg-[var(--cherry-active)] cursor-pointer mb-1' }, children: [
            { id: 'conv-1-header', type: 'Container', props: { className: 'flex items-center justify-between mb-1' }, children: [
              { id: 'conv-1-title', type: 'Text', props: { className: 'font-medium text-sm truncate' }, text: 'GPT-4o 对话' },
              { id: 'conv-1-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '10:30' },
            ]},
            { id: 'conv-1-preview', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] truncate' }, text: '你好，请介绍一下自己...' },
          ]},
          { id: 'conv-2', type: 'Container', props: { className: 'p-3 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
            { id: 'conv-2-header', type: 'Container', props: { className: 'flex items-center justify-between mb-1' }, children: [
              { id: 'conv-2-title', type: 'Text', props: { className: 'font-medium text-sm truncate' }, text: 'Claude 对话' },
              { id: 'conv-2-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '09:15' },
            ]},
            { id: 'conv-2-preview', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] truncate' }, text: '帮我写一段代码...' },
          ]},
        ]},
        { id: 'yesterday-section', type: 'Container', props: { className: 'p-2' }, children: [
          { id: 'yesterday-label', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] px-2 mb-1' }, text: '昨天' },
          { id: 'conv-3', type: 'Container', props: { className: 'p-3 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
            { id: 'conv-3-header', type: 'Container', props: { className: 'flex items-center justify-between mb-1' }, children: [
              { id: 'conv-3-title', type: 'Text', props: { className: 'font-medium text-sm truncate' }, text: '翻译任务' },
              { id: 'conv-3-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '昨天' },
            ]},
            { id: 'conv-3-preview', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] truncate' }, text: '请翻译以下内容...' },
          ]},
        ]},
      ],
    },
  },
};

/**
 * 话题分组案例
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */
export const topicListExample: ExampleMetadata = {
  id: 'system-cherry-topic-list',
  title: 'Cherry 话题分组',
  description: 'Cherry Studio 风格的话题分组列表，包含话题卡片、消息计数、话题搜索',
  category: 'display',
  tags: ['topic', 'cherry', 'list', 'group'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'topic-list',
      type: 'Container',
      props: { className: 'p-4 bg-[var(--cherry-background)]' },
      children: [
        { id: 'topic-header', type: 'Container', props: { className: 'flex items-center justify-between mb-4' }, children: [
          { id: 'topic-title', type: 'Text', props: { className: 'font-medium' }, text: '话题' },
          { id: 'topic-search', type: 'Input', props: { placeholder: '搜索话题...', className: 'w-40 h-8 text-sm' } },
        ]},
        {
          id: 'topic-cards',
          type: 'Container',
          props: { className: 'space-y-2' },
          children: [
            {
              id: 'topic-1',
              type: 'Container',
              props: { className: 'p-3 bg-[var(--cherry-background-soft)] rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer' },
              children: [
                { id: 'topic-1-header', type: 'Container', props: { className: 'flex items-center justify-between mb-1' }, children: [
                  { id: 'topic-1-name', type: 'Text', props: { className: 'font-medium text-sm' }, text: '代码优化讨论' },
                  { id: 'topic-1-count', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'count-1', type: 'Text', text: '12 条' }] },
                ]},
                { id: 'topic-1-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '最后更新: 10分钟前' },
              ],
            },
            {
              id: 'topic-2',
              type: 'Container',
              props: { className: 'p-3 bg-[var(--cherry-background-soft)] rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer' },
              children: [
                { id: 'topic-2-header', type: 'Container', props: { className: 'flex items-center justify-between mb-1' }, children: [
                  { id: 'topic-2-name', type: 'Text', props: { className: 'font-medium text-sm' }, text: 'API 设计方案' },
                  { id: 'topic-2-count', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'count-2', type: 'Text', text: '8 条' }] },
                ]},
                { id: 'topic-2-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '最后更新: 1小时前' },
              ],
            },
            {
              id: 'topic-3',
              type: 'Container',
              props: { className: 'p-3 bg-[var(--cherry-background-soft)] rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer' },
              children: [
                { id: 'topic-3-header', type: 'Container', props: { className: 'flex items-center justify-between mb-1' }, children: [
                  { id: 'topic-3-name', type: 'Text', props: { className: 'font-medium text-sm' }, text: '文档翻译' },
                  { id: 'topic-3-count', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'count-3', type: 'Text', text: '5 条' }] },
                ]},
                { id: 'topic-3-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '最后更新: 昨天' },
              ],
            },
          ],
        },
      ],
    },
  },
};


/**
 * 消息操作工具栏案例
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 */
export const messageToolbarExample: ExampleMetadata = {
  id: 'system-cherry-message-toolbar',
  title: 'Cherry 消息操作工具栏',
  description: 'Cherry Studio 风格的消息操作工具栏，包含复制/编辑/重新生成、翻译、朗读、反馈按钮',
  category: 'navigation',
  tags: ['message', 'cherry', 'toolbar', 'actions'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'message-toolbar',
      type: 'Container',
      props: { className: 'flex items-center gap-1 p-1 bg-[var(--cherry-background-soft)] rounded-lg' },
      children: [
        { id: 'copy-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'copy-icon', type: 'Icon', props: { name: 'copy', size: 16 } }] },
        { id: 'edit-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'edit-icon', type: 'Icon', props: { name: 'edit', size: 16 } }] },
        { id: 'regenerate-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'regenerate-icon', type: 'Icon', props: { name: 'refresh', size: 16 } }] },
        { id: 'divider-1', type: 'Container', props: { className: 'w-px h-5 bg-[var(--cherry-border)]' }, children: [] },
        { id: 'translate-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'translate-icon', type: 'Icon', props: { name: 'share', size: 16 } }] },
        { id: 'speak-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'speak-icon', type: 'Icon', props: { name: 'play', size: 16 } }] },
        { id: 'divider-2', type: 'Container', props: { className: 'w-px h-5 bg-[var(--cherry-border)]' }, children: [] },
        { id: 'like-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'like-icon', type: 'Icon', props: { name: 'thumbs-up', size: 16 } }] },
        { id: 'dislike-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'dislike-icon', type: 'Icon', props: { name: 'thumbs-up', size: 16, className: 'rotate-180' } }] },
        { id: 'divider-3', type: 'Container', props: { className: 'w-px h-5 bg-[var(--cherry-border)]' }, children: [] },
        { id: 'more-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-8 h-8 p-0 hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'more-icon', type: 'Icon', props: { name: 'menu', size: 16 } }] },
      ],
    },
  },
};

/**
 * 导出对话案例
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */
export const exportDialogExample: ExampleMetadata = {
  id: 'system-cherry-export-dialog',
  title: 'Cherry 导出对话',
  description: 'Cherry Studio 风格的导出对话界面，包含格式选择、导出选项、预览',
  category: 'form',
  tags: ['export', 'cherry', 'dialog', 'format'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'export-dialog',
      type: 'Card',
      props: { className: 'w-96 p-6 bg-[var(--cherry-background)] border-[var(--cherry-border)]' },
      children: [
        { id: 'export-title', type: 'Text', props: { className: 'text-lg font-bold mb-4' }, text: '导出对话' },
        {
          id: 'format-section',
          type: 'Container',
          props: { className: 'mb-4' },
          children: [
            { id: 'format-label', type: 'Text', props: { className: 'text-sm font-medium mb-2' }, text: '导出格式' },
            { id: 'format-grid', type: 'Container', props: { className: 'grid grid-cols-4 gap-2' }, children: [
              { id: 'format-md', type: 'Container', props: { className: 'p-2 bg-[var(--cherry-active)] border-2 border-[var(--cherry-primary)] rounded text-center cursor-pointer' }, children: [{ id: 'md-text', type: 'Text', props: { className: 'text-sm' }, text: 'MD' }] },
              { id: 'format-json', type: 'Container', props: { className: 'p-2 bg-[var(--cherry-background-soft)] rounded text-center cursor-pointer hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'json-text', type: 'Text', props: { className: 'text-sm' }, text: 'JSON' }] },
              { id: 'format-pdf', type: 'Container', props: { className: 'p-2 bg-[var(--cherry-background-soft)] rounded text-center cursor-pointer hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'pdf-text', type: 'Text', props: { className: 'text-sm' }, text: 'PDF' }] },
              { id: 'format-html', type: 'Container', props: { className: 'p-2 bg-[var(--cherry-background-soft)] rounded text-center cursor-pointer hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'html-text', type: 'Text', props: { className: 'text-sm' }, text: 'HTML' }] },
            ]},
          ],
        },
        {
          id: 'options-section',
          type: 'Container',
          props: { className: 'mb-4 space-y-3' },
          children: [
            { id: 'options-label', type: 'Text', props: { className: 'text-sm font-medium mb-2' }, text: '导出选项' },
            { id: 'option-images', type: 'Container', props: { className: 'flex items-center justify-between' }, children: [
              { id: 'images-label', type: 'Text', props: { className: 'text-sm' }, text: '包含图片' },
              { id: 'images-switch', type: 'Switch', props: { checked: true } },
            ]},
            { id: 'option-code', type: 'Container', props: { className: 'flex items-center justify-between' }, children: [
              { id: 'code-label', type: 'Text', props: { className: 'text-sm' }, text: '包含代码块' },
              { id: 'code-switch', type: 'Switch', props: { checked: true } },
            ]},
          ],
        },
        {
          id: 'preview-section',
          type: 'Container',
          props: { className: 'mb-4' },
          children: [
            { id: 'preview-label', type: 'Text', props: { className: 'text-sm font-medium mb-2' }, text: '预览' },
            { id: 'preview-box', type: 'Container', props: { className: 'h-32 bg-[var(--cherry-background-soft)] rounded p-3 overflow-auto text-xs font-mono' }, children: [
              { id: 'preview-content', type: 'Text', props: { className: 'text-[var(--cherry-text-2)]' }, text: '# GPT-4o 对话\n\n**用户**: 你好，请介绍一下自己\n\n**助手**: 你好！我是 AI 助手...' },
            ]},
          ],
        },
        { id: 'export-actions', type: 'Container', props: { className: 'flex justify-end gap-2' }, children: [
          { id: 'cancel-btn', type: 'Button', props: { variant: 'outline' }, text: '取消' },
          { id: 'export-btn', type: 'Button', props: { className: 'bg-[var(--cherry-primary)]' }, text: '导出' },
        ]},
      ],
    },
  },
};

// ============================================================================
// 工具类案例
// ============================================================================

/**
 * 翻译面板案例
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8
 */
export const translationPanelExample: ExampleMetadata = {
  id: 'system-cherry-translation-panel',
  title: 'Cherry 翻译面板',
  description: 'Cherry Studio 风格的翻译面板，包含语言选择器、交换语言按钮、翻译结果显示',
  category: 'form',
  tags: ['translation', 'cherry', 'language', 'panel'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'translation-panel',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'translation-header', type: 'Container', props: { className: 'flex items-center justify-center gap-4 mb-6' }, children: [
          { id: 'source-lang', type: 'Button', props: { variant: 'outline', className: 'w-32' }, text: '中文 ▼' },
          { id: 'swap-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-10 h-10 rounded-full' }, text: '⇄' },
          { id: 'target-lang', type: 'Button', props: { variant: 'outline', className: 'w-32' }, text: '英文 ▼' },
        ]},
        {
          id: 'translation-content',
          type: 'Container',
          props: { className: 'grid grid-cols-2 gap-4' },
          children: [
            {
              id: 'source-panel',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'source-header', type: 'Container', props: { className: 'flex items-center justify-between mb-2' }, children: [
                  { id: 'source-label', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '原文' },
                  { id: 'auto-detect', type: 'Container', props: { className: 'px-2 py-0.5 bg-[var(--cherry-background)] rounded text-xs' }, children: [{ id: 'detect-text', type: 'Text', text: '自动检测' }] },
                ]},
                { id: 'source-textarea', type: 'Textarea', props: { placeholder: '输入要翻译的文本...', className: 'min-h-[200px] bg-transparent border-0 resize-none' } },
              ],
            },
            {
              id: 'target-panel',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
              children: [
                { id: 'target-header', type: 'Container', props: { className: 'flex items-center justify-between mb-2' }, children: [
                  { id: 'target-label', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '译文' },
                  { id: 'copy-btn', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'copy-icon', type: 'Icon', props: { name: 'copy', size: 14 } }] },
                ]},
                { id: 'target-content', type: 'Container', props: { className: 'min-h-[200px]' }, children: [
                  { id: 'target-text', type: 'Text', props: { className: 'text-[var(--cherry-text-2)]' }, text: '翻译结果将显示在这里...' },
                ]},
              ],
            },
          ],
        },
        { id: 'provider-select', type: 'Container', props: { className: 'mt-4 flex items-center justify-between' }, children: [
          { id: 'provider-label', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '翻译服务' },
          { id: 'provider-btn', type: 'Button', props: { variant: 'outline', size: 'sm' }, text: 'GPT-4o ▼' },
        ]},
      ],
    },
  },
};

/**
 * 图片生成案例
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9
 */
export const imageGenerationExample: ExampleMetadata = {
  id: 'system-cherry-image-generation',
  title: 'Cherry 图片生成',
  description: 'Cherry Studio 风格的图片生成界面，包含提示词输入、风格预设、生成进度、图片画廊',
  category: 'form',
  tags: ['image', 'cherry', 'generation', 'ai'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'image-generation',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'gen-header', type: 'Text', props: { className: 'text-xl font-bold mb-6' }, text: '图片生成' },
        {
          id: 'prompt-section',
          type: 'Card',
          props: { className: 'p-4 mb-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
          children: [
            { id: 'prompt-label', type: 'Text', props: { className: 'text-sm font-medium mb-2' }, text: '提示词' },
            { id: 'prompt-input', type: 'Textarea', props: { placeholder: '描述你想生成的图片...', className: 'min-h-[80px] mb-3' } },
            { id: 'negative-label', type: 'Text', props: { className: 'text-sm font-medium mb-2' }, text: '负面提示词' },
            { id: 'negative-input', type: 'Input', props: { placeholder: '不想出现的元素...' } },
          ],
        },
        {
          id: 'style-section',
          type: 'Container',
          props: { className: 'mb-4' },
          children: [
            { id: 'style-label', type: 'Text', props: { className: 'text-sm font-medium mb-2' }, text: '风格预设' },
            { id: 'style-grid', type: 'Container', props: { className: 'flex gap-2 flex-wrap' }, children: [
              { id: 'style-1', type: 'Container', props: { className: 'px-3 py-1.5 bg-[var(--cherry-active)] border-2 border-[var(--cherry-primary)] rounded-full text-sm cursor-pointer' }, children: [{ id: 's1', type: 'Text', text: '写实' }] },
              { id: 'style-2', type: 'Container', props: { className: 'px-3 py-1.5 bg-[var(--cherry-background-soft)] rounded-full text-sm cursor-pointer hover:bg-[var(--cherry-hover)]' }, children: [{ id: 's2', type: 'Text', text: '动漫' }] },
              { id: 'style-3', type: 'Container', props: { className: 'px-3 py-1.5 bg-[var(--cherry-background-soft)] rounded-full text-sm cursor-pointer hover:bg-[var(--cherry-hover)]' }, children: [{ id: 's3', type: 'Text', text: '油画' }] },
              { id: 'style-4', type: 'Container', props: { className: 'px-3 py-1.5 bg-[var(--cherry-background-soft)] rounded-full text-sm cursor-pointer hover:bg-[var(--cherry-hover)]' }, children: [{ id: 's4', type: 'Text', text: '水彩' }] },
            ]},
          ],
        },
        {
          id: 'params-section',
          type: 'Container',
          props: { className: 'flex gap-4 mb-4' },
          children: [
            { id: 'size-select', type: 'Container', props: { className: 'flex-1' }, children: [
              { id: 'size-label', type: 'Text', props: { className: 'text-sm font-medium mb-2' }, text: '尺寸' },
              { id: 'size-btn', type: 'Button', props: { variant: 'outline', className: 'w-full justify-between' }, text: '1024 × 1024 ▼' },
            ]},
            { id: 'model-select', type: 'Container', props: { className: 'flex-1' }, children: [
              { id: 'model-label', type: 'Text', props: { className: 'text-sm font-medium mb-2' }, text: '模型' },
              { id: 'model-btn', type: 'Button', props: { variant: 'outline', className: 'w-full justify-between' }, text: 'DALL-E 3 ▼' },
            ]},
          ],
        },
        { id: 'generate-btn', type: 'Button', props: { className: 'w-full bg-[var(--cherry-primary)] mb-6' }, text: '生成图片' },
        {
          id: 'gallery-section',
          type: 'Container',
          children: [
            { id: 'gallery-label', type: 'Text', props: { className: 'text-sm font-medium mb-3' }, text: '生成结果' },
            { id: 'gallery-grid', type: 'Container', props: { className: 'grid grid-cols-3 gap-3' }, children: [
              { id: 'img-1', type: 'Container', props: { className: 'aspect-square bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center' }, children: [{ id: 'img-1-placeholder', type: 'Icon', props: { name: 'image', size: 32 } }] },
              { id: 'img-2', type: 'Container', props: { className: 'aspect-square bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center' }, children: [{ id: 'img-2-placeholder', type: 'Icon', props: { name: 'image', size: 32 } }] },
              { id: 'img-3', type: 'Container', props: { className: 'aspect-square bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center' }, children: [{ id: 'img-3-placeholder', type: 'Icon', props: { name: 'image', size: 32 } }] },
            ]},
          ],
        },
      ],
    },
  },
};

/**
 * 语音交互案例
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8
 */
export const voiceInterfaceExample: ExampleMetadata = {
  id: 'system-cherry-voice-interface',
  title: 'Cherry 语音交互',
  description: 'Cherry Studio 风格的语音交互界面，包含录音按钮、波形可视化、语音选择、速度/音调控制',
  category: 'form',
  tags: ['voice', 'cherry', 'speech', 'audio'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'voice-interface',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'voice-header', type: 'Text', props: { className: 'text-xl font-bold mb-6' }, text: '语音交互' },
        {
          id: 'record-section',
          type: 'Card',
          props: { className: 'p-6 mb-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)] text-center' },
          children: [
            { id: 'record-btn', type: 'Container', props: { className: 'w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--cherry-primary)] flex items-center justify-center cursor-pointer hover:bg-[var(--cherry-primary-soft)] transition-colors' }, children: [
              { id: 'mic-icon', type: 'Text', props: { className: 'text-3xl text-white' }, text: '🎤' },
            ]},
            { id: 'record-hint', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '点击开始录音' },
            { id: 'waveform', type: 'Container', props: { className: 'h-16 mt-4 flex items-center justify-center gap-1' }, children: [
              { id: 'wave-1', type: 'Container', props: { className: 'w-1 h-4 bg-[var(--cherry-primary)] rounded-full' }, children: [] },
              { id: 'wave-2', type: 'Container', props: { className: 'w-1 h-8 bg-[var(--cherry-primary)] rounded-full' }, children: [] },
              { id: 'wave-3', type: 'Container', props: { className: 'w-1 h-6 bg-[var(--cherry-primary)] rounded-full' }, children: [] },
              { id: 'wave-4', type: 'Container', props: { className: 'w-1 h-10 bg-[var(--cherry-primary)] rounded-full' }, children: [] },
              { id: 'wave-5', type: 'Container', props: { className: 'w-1 h-5 bg-[var(--cherry-primary)] rounded-full' }, children: [] },
              { id: 'wave-6', type: 'Container', props: { className: 'w-1 h-8 bg-[var(--cherry-primary)] rounded-full' }, children: [] },
              { id: 'wave-7', type: 'Container', props: { className: 'w-1 h-4 bg-[var(--cherry-primary)] rounded-full' }, children: [] },
            ]},
          ],
        },
        {
          id: 'tts-section',
          type: 'Card',
          props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
          children: [
            { id: 'tts-title', type: 'Text', props: { className: 'font-medium mb-4' }, text: '文字转语音' },
            { id: 'voice-select', type: 'Container', props: { className: 'mb-4' }, children: [
              { id: 'voice-label', type: 'Text', props: { className: 'text-sm mb-2' }, text: '语音' },
              { id: 'voice-btn', type: 'Button', props: { variant: 'outline', className: 'w-full justify-between' }, text: 'Alloy (女声) ▼' },
            ]},
            { id: 'speed-control', type: 'Container', props: { className: 'mb-4' }, children: [
              { id: 'speed-header', type: 'Container', props: { className: 'flex justify-between mb-2' }, children: [
                { id: 'speed-label', type: 'Text', props: { className: 'text-sm' }, text: '语速' },
                { id: 'speed-value', type: 'Text', props: { className: 'text-sm font-mono' }, text: '1.0x' },
              ]},
              { id: 'speed-slider', type: 'Container', props: { className: 'h-2 bg-[var(--cherry-border)] rounded-full' }, children: [
                { id: 'speed-track', type: 'Container', props: { className: 'h-full w-[50%] bg-[var(--cherry-primary)] rounded-full' }, children: [] },
              ]},
            ]},
            { id: 'pitch-control', type: 'Container', children: [
              { id: 'pitch-header', type: 'Container', props: { className: 'flex justify-between mb-2' }, children: [
                { id: 'pitch-label', type: 'Text', props: { className: 'text-sm' }, text: '音调' },
                { id: 'pitch-value', type: 'Text', props: { className: 'text-sm font-mono' }, text: '0' },
              ]},
              { id: 'pitch-slider', type: 'Container', props: { className: 'h-2 bg-[var(--cherry-border)] rounded-full' }, children: [
                { id: 'pitch-track', type: 'Container', props: { className: 'h-full w-[50%] bg-[var(--cherry-primary)] rounded-full' }, children: [] },
              ]},
            ]},
          ],
        },
      ],
    },
  },
};


/**
 * 代码解释器案例
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9
 */
export const codeInterpreterExample: ExampleMetadata = {
  id: 'system-cherry-code-interpreter',
  title: 'Cherry 代码解释器',
  description: 'Cherry Studio 风格的代码解释器界面，包含代码编辑器、运行按钮、输出控制台、可视化输出',
  category: 'form',
  tags: ['code', 'cherry', 'interpreter', 'console'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'code-interpreter',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'interpreter-header', type: 'Container', props: { className: 'flex items-center justify-between mb-4' }, children: [
          { id: 'interpreter-title', type: 'Text', props: { className: 'text-xl font-bold' }, text: '代码解释器' },
          { id: 'lang-select', type: 'Button', props: { variant: 'outline', size: 'sm' }, text: 'Python ▼' },
        ]},
        {
          id: 'editor-section',
          type: 'Card',
          props: { className: 'mb-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)] overflow-hidden' },
          children: [
            { id: 'editor-toolbar', type: 'Container', props: { className: 'flex items-center justify-between px-3 py-2 border-b border-[var(--cherry-border)]' }, children: [
              { id: 'file-name', type: 'Text', props: { className: 'text-sm font-mono' }, text: 'main.py' },
              { id: 'run-btn', type: 'Button', props: { size: 'sm', className: 'bg-green-500 hover:bg-green-600' }, text: '▶ 运行' },
            ]},
            { id: 'code-area', type: 'Container', props: { className: 'p-4 font-mono text-sm' }, children: [
              { id: 'code-line-1', type: 'Text', props: { className: 'text-blue-400' }, text: 'import matplotlib.pyplot as plt' },
              { id: 'code-line-2', type: 'Text', props: { className: 'text-blue-400' }, text: 'import numpy as np' },
              { id: 'code-line-3', type: 'Text', text: '' },
              { id: 'code-line-4', type: 'Text', text: 'x = np.linspace(0, 10, 100)' },
              { id: 'code-line-5', type: 'Text', text: 'y = np.sin(x)' },
              { id: 'code-line-6', type: 'Text', text: 'plt.plot(x, y)' },
              { id: 'code-line-7', type: 'Text', text: 'plt.show()' },
            ]},
          ],
        },
        {
          id: 'output-section',
          type: 'Card',
          props: { className: 'bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
          children: [
            { id: 'output-header', type: 'Container', props: { className: 'flex items-center gap-2 px-3 py-2 border-b border-[var(--cherry-border)]' }, children: [
              { id: 'output-tab', type: 'Container', props: { className: 'px-3 py-1 bg-[var(--cherry-active)] rounded text-sm' }, children: [{ id: 'tab-text', type: 'Text', text: '输出' }] },
              { id: 'viz-tab', type: 'Container', props: { className: 'px-3 py-1 hover:bg-[var(--cherry-hover)] rounded text-sm cursor-pointer' }, children: [{ id: 'viz-text', type: 'Text', text: '可视化' }] },
            ]},
            { id: 'console-output', type: 'Container', props: { className: 'p-4 font-mono text-sm text-green-400 min-h-[100px]' }, children: [
              { id: 'output-text', type: 'Text', text: '>>> 运行成功' },
            ]},
          ],
        },
      ],
    },
  },
};


/**
 * 提示词库案例
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 20.10
 */
export const promptLibraryExample: ExampleMetadata = {
  id: 'system-cherry-prompt-library',
  title: 'Cherry 提示词库',
  description: 'Cherry Studio 风格的提示词库界面，包含提示词卡片网格、分类筛选、变量预览、收藏功能',
  category: 'display',
  tags: ['prompt', 'cherry', 'library', 'template'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'prompt-library',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'library-header', type: 'Container', props: { className: 'flex items-center justify-between mb-6' }, children: [
          { id: 'library-title', type: 'Text', props: { className: 'text-xl font-bold' }, text: '提示词库' },
          { id: 'header-actions', type: 'Container', props: { className: 'flex gap-2' }, children: [
            { id: 'search-input', type: 'Input', props: { placeholder: '搜索提示词...', className: 'w-48' } },
            { id: 'create-btn', type: 'Button', props: { size: 'sm', className: 'bg-[var(--cherry-primary)] gap-2' }, children: [
              { id: 'create-btn-icon', type: 'Icon', props: { name: 'plus', size: 14 } },
              { id: 'create-btn-text', type: 'Text', text: '新建' },
            ] },
          ]},
        ]},
        { id: 'category-filter', type: 'Container', props: { className: 'flex gap-2 mb-4 flex-wrap' }, children: [
          { id: 'cat-all', type: 'Container', props: { className: 'px-3 py-1 bg-[var(--cherry-active)] border-2 border-[var(--cherry-primary)] rounded-full text-sm cursor-pointer' }, children: [{ id: 'all-text', type: 'Text', text: '全部' }] },
          { id: 'cat-writing', type: 'Container', props: { className: 'px-3 py-1 bg-[var(--cherry-background-soft)] rounded-full text-sm cursor-pointer hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'writing-text', type: 'Text', text: '写作' }] },
          { id: 'cat-code', type: 'Container', props: { className: 'px-3 py-1 bg-[var(--cherry-background-soft)] rounded-full text-sm cursor-pointer hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'code-text', type: 'Text', text: '编程' }] },
          { id: 'cat-translate', type: 'Container', props: { className: 'px-3 py-1 bg-[var(--cherry-background-soft)] rounded-full text-sm cursor-pointer hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'translate-text', type: 'Text', text: '翻译' }] },
        ]},
        {
          id: 'prompt-grid',
          type: 'Container',
          props: { className: 'grid grid-cols-2 gap-4' },
          children: [
            {
              id: 'prompt-1',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)] hover:border-[var(--cherry-primary)] cursor-pointer' },
              children: [
                { id: 'prompt-1-header', type: 'Container', props: { className: 'flex items-start justify-between mb-2' }, children: [
                  { id: 'prompt-1-title', type: 'Text', props: { className: 'font-medium' }, text: '代码审查助手' },
                  { id: 'prompt-1-fav', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'text-yellow-500' }, children: [{ id: 'fav-icon-1', type: 'Icon', props: { name: 'star', size: 14, className: 'fill-current' } }] },
                ]},
                { id: 'prompt-1-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)] mb-3 line-clamp-2' }, text: '帮助审查代码，找出潜在问题和优化建议' },
                { id: 'prompt-1-vars', type: 'Container', props: { className: 'flex gap-1 mb-2' }, children: [
                  { id: 'var-1', type: 'Container', props: { className: 'px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs' }, children: [{ id: 'v1', type: 'Text', text: '{{code}}' }] },
                  { id: 'var-2', type: 'Container', props: { className: 'px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs' }, children: [{ id: 'v2', type: 'Text', text: '{{language}}' }] },
                ]},
                { id: 'prompt-1-meta', type: 'Container', props: { className: 'flex items-center justify-between text-xs text-[var(--cherry-text-2)]' }, children: [
                  { id: 'usage', type: 'Text', text: '使用 128 次' },
                  { id: 'rating', type: 'Container', props: { className: 'flex items-center gap-1' }, children: [
                    { id: 'rating-icon', type: 'Icon', props: { name: 'heart', size: 12 } },
                    { id: 'rating-text', type: 'Text', text: '4.8' },
                  ] },
                ]},
              ],
            },
            {
              id: 'prompt-2',
              type: 'Card',
              props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)] hover:border-[var(--cherry-primary)] cursor-pointer' },
              children: [
                { id: 'prompt-2-header', type: 'Container', props: { className: 'flex items-start justify-between mb-2' }, children: [
                  { id: 'prompt-2-title', type: 'Text', props: { className: 'font-medium' }, text: '文章润色' },
                  { id: 'prompt-2-fav', type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: [{ id: 'fav-icon', type: 'Icon', props: { name: 'star', size: 14 } }] },
                ]},
                { id: 'prompt-2-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)] mb-3 line-clamp-2' }, text: '优化文章表达，提升文字质量和可读性' },
                { id: 'prompt-2-vars', type: 'Container', props: { className: 'flex gap-1 mb-2' }, children: [
                  { id: 'var-3', type: 'Container', props: { className: 'px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs' }, children: [{ id: 'v3', type: 'Text', text: '{{article}}' }] },
                  { id: 'var-4', type: 'Container', props: { className: 'px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs' }, children: [{ id: 'v4', type: 'Text', text: '{{style}}' }] },
                ]},
                { id: 'prompt-2-meta', type: 'Container', props: { className: 'flex items-center justify-between text-xs text-[var(--cherry-text-2)]' }, children: [
                  { id: 'usage-2', type: 'Text', text: '使用 256 次' },
                  { id: 'rating-2', type: 'Container', props: { className: 'flex items-center gap-1' }, children: [
                    { id: 'rating-2-icon', type: 'Icon', props: { name: 'heart', size: 12 } },
                    { id: 'rating-2-text', type: 'Text', text: '4.9' },
                  ] },
                ]},
              ],
            },
          ],
        },
      ],
    },
  },
};


// ============================================================================
// 交互类案例
// ============================================================================

/**
 * 悬浮窗案例
 * Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 27.10
 */
export const floatingWindowExample: ExampleMetadata = {
  id: 'system-cherry-floating-window',
  title: 'Cherry 悬浮窗',
  description: 'Cherry Studio 风格的悬浮窗界面，包含迷你聊天窗口、拖拽手柄、缩放控制、透明度滑块、置顶切换',
  category: 'layout',
  tags: ['floating', 'cherry', 'window', 'mini'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'floating-window',
      type: 'Card',
      props: { className: 'w-80 bg-[var(--cherry-background)] border-[var(--cherry-border)] shadow-2xl rounded-xl overflow-hidden' },
      children: [
        { id: 'window-header', type: 'Container', props: { className: 'h-8 bg-[var(--cherry-background-soft)] flex items-center justify-between px-2 cursor-move' }, children: [
          { id: 'drag-handle', type: 'Container', props: { className: 'flex items-center gap-2' }, children: [
            { id: 'drag-icon', type: 'Text', props: { className: 'text-[var(--cherry-text-2)] text-xs' }, text: '⋮⋮' },
            { id: 'window-title', type: 'Text', props: { className: 'text-xs font-medium' }, text: 'Quick Chat' },
          ]},
          { id: 'window-controls', type: 'Container', props: { className: 'flex items-center gap-1' }, children: [
            { id: 'pin-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-6 h-6 p-0' }, children: [{ id: 'pin-icon', type: 'Icon', props: { name: 'pin', size: 12 } }] },
            { id: 'minimize-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-6 h-6 p-0' }, children: [{ id: 'minimize-icon', type: 'Icon', props: { name: 'minus', size: 12 } }] },
            { id: 'close-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-6 h-6 p-0 hover:bg-red-500/20 hover:text-red-500' }, children: [{ id: 'close-icon', type: 'Icon', props: { name: 'x', size: 12 } }] },
          ]},
        ]},
        { id: 'chat-area', type: 'Container', props: { className: 'h-48 p-3 overflow-auto' }, children: [
          { id: 'msg-1', type: 'Container', props: { className: 'flex gap-2 mb-2' }, children: [
            { id: 'msg-1-avatar', type: 'Container', props: { className: 'w-6 h-6 rounded-full bg-[var(--cherry-primary)] flex items-center justify-center text-white text-xs shrink-0' }, children: [{ id: 'av', type: 'Text', text: 'AI' }] },
            { id: 'msg-1-text', type: 'Text', props: { className: 'text-sm' }, text: '有什么可以帮你的？' },
          ]},
        ]},
        { id: 'input-area', type: 'Container', props: { className: 'p-2 border-t border-[var(--cherry-border)]' }, children: [
          { id: 'quick-input', type: 'Container', props: { className: 'flex gap-2' }, children: [
            { id: 'input-field', type: 'Input', props: { placeholder: '快速提问...', className: 'flex-1 h-8 text-sm' } },
            { id: 'send-btn', type: 'Button', props: { size: 'sm', className: 'h-8 w-8 p-0 bg-[var(--cherry-primary)]' }, children: [{ id: 'send-icon', type: 'Icon', props: { name: 'arrow-up', size: 14 } }] },
          ]},
        ]},
        { id: 'resize-handle', type: 'Container', props: { className: 'absolute bottom-0 right-0 w-4 h-4 cursor-se-resize' }, children: [] },
      ],
    },
  },
};

/**
 * 划字按钮案例
 * Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9, 28.10
 */
export const selectionToolbarExample: ExampleMetadata = {
  id: 'system-cherry-selection-toolbar',
  title: 'Cherry 划字按钮',
  description: 'Cherry Studio 风格的划字按钮界面，包含选中文本工具栏、翻译/解释/总结/改写按钮、位置自适应、动画效果',
  category: 'navigation',
  tags: ['selection', 'cherry', 'toolbar', 'popup'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'selection-toolbar',
      type: 'Container',
      props: { className: 'inline-flex items-center gap-1 p-1.5 bg-[var(--cherry-background)] border border-[var(--cherry-border)] rounded-lg shadow-lg' },
      children: [
        { id: 'translate-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'h-8 px-2 text-xs hover:bg-[var(--cherry-hover)] gap-1' }, children: [
          { id: 'translate-icon', type: 'Icon', props: { name: 'share', size: 12 } },
          { id: 'translate-text', type: 'Text', text: '翻译' },
        ] },
        { id: 'explain-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'h-8 px-2 text-xs hover:bg-[var(--cherry-hover)] gap-1' }, children: [
          { id: 'explain-icon', type: 'Icon', props: { name: 'file', size: 12 } },
          { id: 'explain-text', type: 'Text', text: '解释' },
        ] },
        { id: 'summarize-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'h-8 px-2 text-xs hover:bg-[var(--cherry-hover)] gap-1' }, children: [
          { id: 'summarize-icon', type: 'Icon', props: { name: 'file', size: 12 } },
          { id: 'summarize-text', type: 'Text', text: '总结' },
        ] },
        { id: 'rewrite-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'h-8 px-2 text-xs hover:bg-[var(--cherry-hover)] gap-1' }, children: [
          { id: 'rewrite-icon', type: 'Icon', props: { name: 'edit', size: 12 } },
          { id: 'rewrite-text', type: 'Text', text: '改写' },
        ] },
        { id: 'divider', type: 'Container', props: { className: 'w-px h-5 bg-[var(--cherry-border)]' }, children: [] },
        { id: 'copy-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'h-8 w-8 p-0 text-xs hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'copy-icon', type: 'Icon', props: { name: 'copy', size: 14 } }] },
        { id: 'search-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'h-8 w-8 p-0 text-xs hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'search-icon', type: 'Icon', props: { name: 'search', size: 14 } }] },
        { id: 'ask-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'h-8 w-8 p-0 text-xs hover:bg-[var(--cherry-hover)]' }, children: [{ id: 'ask-icon', type: 'Icon', props: { name: 'message-circle', size: 14 } }] },
      ],
    },
  },
};


// ============================================================================
// 展示类案例
// ============================================================================

/**
 * 笔记目录树案例
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 */
export const notesTreeExample: ExampleMetadata = {
  id: 'system-cherry-notes-tree',
  title: 'Cherry 笔记目录树',
  description: 'Cherry Studio 风格的笔记目录树，包含文件夹层级、展开/折叠、拖拽排序、右键菜单',
  category: 'display',
  tags: ['notes', 'cherry', 'tree', 'folder'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'notes-tree',
      type: 'Container',
      props: { className: 'w-64 p-4 bg-[var(--cherry-background)]' },
      children: [
        { id: 'tree-header', type: 'Container', props: { className: 'flex items-center justify-between mb-4' }, children: [
          { id: 'tree-title', type: 'Text', props: { className: 'font-medium' }, text: '笔记' },
          { id: 'tree-actions', type: 'Container', props: { className: 'flex gap-1' }, children: [
            { id: 'new-folder-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-7 h-7 p-0' }, children: [{ id: 'new-folder-icon', type: 'Icon', props: { name: 'folder', size: 14 } }] },
            { id: 'new-note-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'w-7 h-7 p-0' }, children: [{ id: 'new-note-icon', type: 'Icon', props: { name: 'file', size: 14 } }] },
          ]},
        ]},
        { id: 'search-input', type: 'Input', props: { placeholder: '搜索笔记...', className: 'mb-3 h-8 text-sm' } },
        {
          id: 'tree-content',
          type: 'Container',
          props: { className: 'space-y-1' },
          children: [
            {
              id: 'folder-1',
              type: 'Container',
              children: [
                { id: 'folder-1-header', type: 'Container', props: { className: 'flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
                  { id: 'folder-1-expand', type: 'Icon', props: { name: 'chevron-down', size: 12, className: 'text-[var(--cherry-text-2)]' } },
                  { id: 'folder-1-icon', type: 'Icon', props: { name: 'folder', size: 14 } },
                  { id: 'folder-1-name', type: 'Text', props: { className: 'flex-1 text-sm' }, text: '工作笔记' },
                  { id: 'folder-1-count', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '3' },
                ]},
                { id: 'folder-1-children', type: 'Container', props: { className: 'ml-4 space-y-1' }, children: [
                  { id: 'note-1', type: 'Container', props: { className: 'flex items-center gap-2 py-1.5 px-2 rounded bg-[var(--cherry-active)] cursor-pointer' }, children: [
                    { id: 'note-1-icon', type: 'Icon', props: { name: 'file', size: 14 } },
                    { id: 'note-1-name', type: 'Text', props: { className: 'text-sm' }, text: '会议记录' },
                  ]},
                  { id: 'note-2', type: 'Container', props: { className: 'flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
                    { id: 'note-2-icon', type: 'Icon', props: { name: 'file', size: 14 } },
                    { id: 'note-2-name', type: 'Text', props: { className: 'text-sm' }, text: '项目计划' },
                  ]},
                  { id: 'note-3', type: 'Container', props: { className: 'flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
                    { id: 'note-3-icon', type: 'Icon', props: { name: 'file', size: 14 } },
                    { id: 'note-3-name', type: 'Text', props: { className: 'text-sm' }, text: '待办事项' },
                  ]},
                ]},
              ],
            },
            {
              id: 'folder-2',
              type: 'Container',
              children: [
                { id: 'folder-2-header', type: 'Container', props: { className: 'flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
                  { id: 'folder-2-expand', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '▶' },
                  { id: 'folder-2-icon', type: 'Icon', props: { name: 'folder', size: 14 } },
                  { id: 'folder-2-name', type: 'Text', props: { className: 'flex-1 text-sm' }, text: '学习笔记' },
                  { id: 'folder-2-count', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '5' },
                ]},
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 图标库案例
 * Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.9, 25.10, 25.11, 25.12
 */
export const iconGalleryExample: ExampleMetadata = {
  id: 'system-cherry-icon-gallery',
  title: 'Cherry 图标库',
  description: 'Cherry Studio 风格的图标库展示，包含导航图标、操作图标、状态图标、提供商图标、尺寸变体、颜色变体',
  category: 'display',
  tags: ['icon', 'cherry', 'gallery', 'library'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'icon-gallery',
      type: 'Container',
      props: { className: 'p-6 bg-[var(--cherry-background)]' },
      children: [
        { id: 'gallery-header', type: 'Container', props: { className: 'flex items-center justify-between mb-6' }, children: [
          { id: 'gallery-title', type: 'Text', props: { className: 'text-xl font-bold' }, text: '图标库' },
          { id: 'search-input', type: 'Input', props: { placeholder: '搜索图标...', className: 'w-48' } },
        ]},
        {
          id: 'nav-icons',
          type: 'Container',
          props: { className: 'mb-6' },
          children: [
            { id: 'nav-label', type: 'Text', props: { className: 'text-sm font-medium mb-3 text-[var(--cherry-text-2)]' }, text: '导航图标' },
            { id: 'nav-grid', type: 'Container', props: { className: 'grid grid-cols-8 gap-3' }, children: [
              { id: 'icon-chat', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'i1', type: 'Icon', props: { name: 'message-circle', size: 20 } }] },
              { id: 'icon-agents', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'i2', type: 'Icon', props: { name: 'user', size: 20 } }] },
              { id: 'icon-files', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'i3', type: 'Icon', props: { name: 'folder', size: 20 } }] },
              { id: 'icon-settings', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'i4', type: 'Icon', props: { name: 'settings', size: 20 } }] },
              { id: 'icon-translate', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'i5', type: 'Icon', props: { name: 'share', size: 20 } }] },
              { id: 'icon-image', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'i6', type: 'Icon', props: { name: 'image', size: 20 } }] },
              { id: 'icon-knowledge', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'i7', type: 'Icon', props: { name: 'folder', size: 20 } }] },
              { id: 'icon-theme', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'i8', type: 'Icon', props: { name: 'settings', size: 20 } }] },
            ]},
          ],
        },
        {
          id: 'action-icons',
          type: 'Container',
          props: { className: 'mb-6' },
          children: [
            { id: 'action-label', type: 'Text', props: { className: 'text-sm font-medium mb-3 text-[var(--cherry-text-2)]' }, text: '操作图标' },
            { id: 'action-grid', type: 'Container', props: { className: 'grid grid-cols-8 gap-3' }, children: [
              { id: 'icon-copy', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'a1', type: 'Icon', props: { name: 'copy', size: 20 } }] },
              { id: 'icon-edit', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'a2', type: 'Icon', props: { name: 'edit', size: 20 } }] },
              { id: 'icon-delete', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'a3', type: 'Icon', props: { name: 'trash', size: 20 } }] },
              { id: 'icon-share', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'a4', type: 'Icon', props: { name: 'share', size: 20 } }] },
              { id: 'icon-download', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'a5', type: 'Icon', props: { name: 'download', size: 20 } }] },
              { id: 'icon-refresh', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'a6', type: 'Icon', props: { name: 'refresh', size: 20 } }] },
              { id: 'icon-search', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'a7', type: 'Icon', props: { name: 'search', size: 20 } }] },
              { id: 'icon-add', type: 'Container', props: { className: 'w-12 h-12 bg-[var(--cherry-background-soft)] rounded-lg flex items-center justify-center hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [{ id: 'a8', type: 'Icon', props: { name: 'plus', size: 20 } }] },
            ]},
          ],
        },
        {
          id: 'provider-icons',
          type: 'Container',
          children: [
            { id: 'provider-label', type: 'Text', props: { className: 'text-sm font-medium mb-3 text-[var(--cherry-text-2)]' }, text: '提供商图标' },
            { id: 'provider-grid', type: 'Container', props: { className: 'grid grid-cols-8 gap-3' }, children: [
              { id: 'icon-openai', type: 'Container', props: { className: 'w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold hover:opacity-80 cursor-pointer' }, children: [{ id: 'p1', type: 'Text', text: 'O' }] },
              { id: 'icon-anthropic', type: 'Container', props: { className: 'w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold hover:opacity-80 cursor-pointer' }, children: [{ id: 'p2', type: 'Text', text: 'A' }] },
              { id: 'icon-google', type: 'Container', props: { className: 'w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold hover:opacity-80 cursor-pointer' }, children: [{ id: 'p3', type: 'Text', text: 'G' }] },
              { id: 'icon-meta', type: 'Container', props: { className: 'w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold hover:opacity-80 cursor-pointer' }, children: [{ id: 'p4', type: 'Text', text: 'M' }] },
            ]},
          ],
        },
      ],
    },
  },
};


/**
 * 模型切换案例
 * Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9
 */
export const modelSwitchExample: ExampleMetadata = {
  id: 'system-cherry-model-switch',
  title: 'Cherry 模型切换',
  description: 'Cherry Studio 风格的模型切换界面，包含快速切换下拉、最近模型、能力标签、收藏模型',
  category: 'form',
  tags: ['model', 'cherry', 'switch', 'dropdown'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'model-switch',
      type: 'Card',
      props: { className: 'w-72 bg-[var(--cherry-background)] border-[var(--cherry-border)] shadow-lg' },
      children: [
        { id: 'switch-header', type: 'Container', props: { className: 'p-3 border-b border-[var(--cherry-border)]' }, children: [
          { id: 'search-input', type: 'Input', props: { placeholder: '搜索模型...', className: 'h-8 text-sm' } },
        ]},
        { id: 'recent-section', type: 'Container', props: { className: 'p-2' }, children: [
          { id: 'recent-label', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] px-2 mb-1' }, text: '最近使用' },
          { id: 'recent-model', type: 'Container', props: { className: 'flex items-center gap-2 p-2 rounded hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
            { id: 'recent-avatar', type: 'Container', props: { className: 'w-6 h-6 rounded bg-green-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'av', type: 'Text', text: 'G' }] },
            { id: 'recent-name', type: 'Text', props: { className: 'flex-1 text-sm' }, text: 'GPT-4o' },
            { id: 'recent-check', type: 'Icon', props: { name: 'check', size: 14, className: 'text-[var(--cherry-primary)]' } },
          ]},
        ]},
        { id: 'favorites-section', type: 'Container', props: { className: 'p-2 border-t border-[var(--cherry-border)]' }, children: [
          { id: 'favorites-label', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] px-2 mb-1 flex items-center gap-1' }, children: [{ id: 'star-icon', type: 'Icon', props: { name: 'star', size: 12 } }, { id: 'fav-text', type: 'Text', text: '收藏' }] },
          { id: 'fav-model-1', type: 'Container', props: { className: 'flex items-center gap-2 p-2 rounded hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
            { id: 'fav-1-avatar', type: 'Container', props: { className: 'w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'av1', type: 'Text', text: 'C' }] },
            { id: 'fav-1-info', type: 'Container', props: { className: 'flex-1' }, children: [
              { id: 'fav-1-name', type: 'Text', props: { className: 'text-sm' }, text: 'Claude 3.5 Sonnet' },
              { id: 'fav-1-tags', type: 'Container', props: { className: 'flex gap-1 mt-0.5' }, children: [
                { id: 'tag-vision', type: 'Container', props: { className: 'px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] flex items-center gap-0.5' }, children: [{ id: 'vision-icon', type: 'Icon', props: { name: 'eye', size: 10 } }, { id: 't1', type: 'Text', text: '视觉' }] },
                { id: 'tag-reasoning', type: 'Container', props: { className: 'px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] flex items-center gap-0.5' }, children: [{ id: 'brain-icon', type: 'Icon', props: { name: 'brain', size: 10 } }, { id: 't2', type: 'Text', text: '推理' }] },
              ]},
            ]},
          ]},
        ]},
        { id: 'all-section', type: 'Container', props: { className: 'p-2 border-t border-[var(--cherry-border)] max-h-48 overflow-auto' }, children: [
          { id: 'openai-group', type: 'Container', children: [
            { id: 'openai-label', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] px-2 mb-1' }, text: 'OpenAI' },
            { id: 'gpt4o', type: 'Container', props: { className: 'flex items-center gap-2 p-2 rounded hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
              { id: 'gpt4o-avatar', type: 'Container', props: { className: 'w-6 h-6 rounded bg-green-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'g1', type: 'Text', text: 'G' }] },
              { id: 'gpt4o-name', type: 'Text', props: { className: 'flex-1 text-sm' }, text: 'GPT-4o' },
              { id: 'gpt4o-status', type: 'Container', props: { className: 'w-2 h-2 rounded-full bg-green-500' }, children: [] },
            ]},
            { id: 'gpt4', type: 'Container', props: { className: 'flex items-center gap-2 p-2 rounded hover:bg-[var(--cherry-hover)] cursor-pointer' }, children: [
              { id: 'gpt4-avatar', type: 'Container', props: { className: 'w-6 h-6 rounded bg-green-500 flex items-center justify-center text-white text-xs' }, children: [{ id: 'g2', type: 'Text', text: 'G' }] },
              { id: 'gpt4-name', type: 'Text', props: { className: 'flex-1 text-sm' }, text: 'GPT-4' },
              { id: 'gpt4-status', type: 'Container', props: { className: 'w-2 h-2 rounded-full bg-green-500' }, children: [] },
            ]},
          ]},
        ]},
        { id: 'shortcut-hint', type: 'Container', props: { className: 'p-2 border-t border-[var(--cherry-border)] flex items-center justify-center gap-1 text-xs text-[var(--cherry-text-2)]' }, children: [
          { id: 'hint-text', type: 'Text', text: '快捷键' },
          { id: 'hint-key', type: 'Container', props: { className: 'px-1.5 py-0.5 bg-[var(--cherry-background-soft)] rounded font-mono' }, children: [{ id: 'key', type: 'Text', text: 'Ctrl+M' }] },
        ]},
      ],
    },
  },
};

// ============================================================================
// 导出
// ============================================================================

/**
 * 所有 Cherry Studio 扩展案例
 */
export const CHERRY_EXTENDED_EXAMPLES: ExampleMetadata[] = [
  // 布局类
  layoutButtonExample,
  fullLayoutExample,
  chatPageLayoutExample,
  agentsPageLayoutExample,
  filesPageLayoutExample,
  settingsPageLayoutExample,
  knowledgePageLayoutExample,
  translationPageLayoutExample,
  imagePageLayoutExample,
  // 设置类
  settingsInterfaceExample,
  llmSettingsExample,
  shortcutsPanelExample,
  providerConfigExample,
  // 管理类
  assistantManagerExample,
  knowledgeBaseExample,
  modelCategoryExample,
  mcpManagerExample,
  pluginManagerExample,
  fileManagerExample,
  // 聊天类
  conversationListExample,
  topicListExample,
  messageToolbarExample,
  exportDialogExample,
  // 工具类
  translationPanelExample,
  imageGenerationExample,
  voiceInterfaceExample,
  codeInterpreterExample,
  promptLibraryExample,
  // 交互类
  floatingWindowExample,
  selectionToolbarExample,
  // 展示类
  notesTreeExample,
  iconGalleryExample,
  modelSwitchExample,
];

/**
 * 获取所有 Cherry 扩展案例
 */
export function getCherryExtendedExamples(): ExampleMetadata[] {
  return [...CHERRY_EXTENDED_EXAMPLES];
}
