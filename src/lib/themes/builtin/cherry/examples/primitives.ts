/**
 * @file primitives.ts
 * @description Cherry Studio 原子级 UI 案例，展示最基础的组件用法
 * @module lib/themes/builtin/cherry/examples/primitives
 */

import type { ExampleMetadata } from './types';

// ============================================================================
// 按钮原子案例
// ============================================================================

/**
 * Cherry 主按钮案例
 */
export const cherryPrimaryButtonExample: ExampleMetadata = {
  id: 'cherry-primitive-primary-button',
  title: 'Cherry 主按钮',
  description: 'Cherry Studio 风格的主要操作按钮',
  category: 'primitive',
  tags: ['button', 'cherry', 'primary', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'primary-btn',
      type: 'Button',
      props: { variant: 'primary', className: 'bg-[var(--cherry-primary)]' },
      text: '主要按钮',
    },
  },
};

/**
 * Cherry 次要按钮案例
 */
export const cherrySecondaryButtonExample: ExampleMetadata = {
  id: 'cherry-primitive-secondary-button',
  title: 'Cherry 次要按钮',
  description: 'Cherry Studio 风格的次要操作按钮',
  category: 'primitive',
  tags: ['button', 'cherry', 'secondary', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'secondary-btn',
      type: 'Button',
      props: { variant: 'outline' },
      text: '次要按钮',
    },
  },
};

/**
 * Cherry 幽灵按钮案例
 */
export const cherryGhostButtonExample: ExampleMetadata = {
  id: 'cherry-primitive-ghost-button',
  title: 'Cherry 幽灵按钮',
  description: 'Cherry Studio 风格的幽灵按钮，用于次要操作',
  category: 'primitive',
  tags: ['button', 'cherry', 'ghost', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'ghost-btn',
      type: 'Button',
      props: { variant: 'ghost' },
      text: '幽灵按钮',
    },
  },
};


/**
 * Cherry 图标按钮案例
 */
export const cherryIconButtonExample: ExampleMetadata = {
  id: 'cherry-primitive-icon-button',
  title: 'Cherry 图标按钮',
  description: 'Cherry Studio 风格的图标按钮',
  category: 'primitive',
  tags: ['button', 'cherry', 'icon', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'icon-btn',
      type: 'Button',
      props: { variant: 'ghost', size: 'icon', className: 'w-9 h-9' },
      children: [{ id: 'btn-icon', type: 'Icon', props: { name: 'settings', size: 16 } }],
    },
  },
};

/**
 * Cherry 按钮组案例
 */
export const cherryButtonGroupExample: ExampleMetadata = {
  id: 'cherry-primitive-button-group',
  title: 'Cherry 按钮组',
  description: 'Cherry Studio 风格的按钮组合',
  category: 'primitive',
  tags: ['button', 'cherry', 'group', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'btn-group',
      type: 'Container',
      props: { className: 'flex items-center gap-2' },
      children: [
        { id: 'btn-1', type: 'Button', props: { variant: 'primary' }, text: '确认' },
        { id: 'btn-2', type: 'Button', props: { variant: 'outline' }, text: '取消' },
      ],
    },
  },
};

// ============================================================================
// 输入框原子案例
// ============================================================================

/**
 * Cherry 基础输入框案例
 */
export const cherryBasicInputExample: ExampleMetadata = {
  id: 'cherry-primitive-basic-input',
  title: 'Cherry 基础输入框',
  description: 'Cherry Studio 风格的基础文本输入框',
  category: 'primitive',
  tags: ['input', 'cherry', 'text', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'basic-input',
      type: 'Input',
      props: { placeholder: '请输入内容...' },
    },
  },
};

/**
 * Cherry 搜索输入框案例
 */
export const cherrySearchInputExample: ExampleMetadata = {
  id: 'cherry-primitive-search-input',
  title: 'Cherry 搜索输入框',
  description: 'Cherry Studio 风格的搜索输入框',
  category: 'primitive',
  tags: ['input', 'cherry', 'search', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'search-wrapper',
      type: 'Container',
      props: { className: 'relative' },
      children: [
        { id: 'search-icon', type: 'Icon', props: { name: 'search', size: 16, className: 'absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cherry-text-2)]' } },
        { id: 'search-input', type: 'Input', props: { placeholder: '搜索...', className: 'pl-9' } },
      ],
    },
  },
};

/**
 * Cherry 带标签输入框案例
 */
export const cherryLabeledInputExample: ExampleMetadata = {
  id: 'cherry-primitive-labeled-input',
  title: 'Cherry 带标签输入框',
  description: 'Cherry Studio 风格的带标签输入框',
  category: 'primitive',
  tags: ['input', 'cherry', 'label', 'form', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'labeled-input',
      type: 'Container',
      props: { className: 'space-y-2' },
      children: [
        { id: 'input-label', type: 'Label', props: { className: 'text-sm font-medium' }, text: '用户名' },
        { id: 'input-field', type: 'Input', props: { placeholder: '请输入用户名' } },
      ],
    },
  },
};

// ============================================================================
// 头像原子案例
// ============================================================================

/**
 * Cherry Emoji 头像案例
 */
export const cherryEmojiAvatarExample: ExampleMetadata = {
  id: 'cherry-primitive-emoji-avatar',
  title: 'Cherry Emoji 头像',
  description: 'Cherry Studio 风格的 Emoji 头像',
  category: 'primitive',
  tags: ['avatar', 'cherry', 'emoji', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'emoji-avatar',
      type: 'Container',
      props: { className: 'w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-xl' },
      children: [{ id: 'emoji', type: 'Text', text: '🤖' }],
    },
  },
};

/**
 * Cherry 用户头像案例
 */
export const cherryUserAvatarExample: ExampleMetadata = {
  id: 'cherry-primitive-user-avatar',
  title: 'Cherry 用户头像',
  description: 'Cherry Studio 风格的用户头像',
  category: 'primitive',
  tags: ['avatar', 'cherry', 'user', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'user-avatar',
      type: 'Container',
      props: { className: 'w-10 h-10 rounded-full bg-[var(--cherry-primary)] flex items-center justify-center text-white' },
      children: [{ id: 'user-icon', type: 'Icon', props: { name: 'user', size: 20 } }],
    },
  },
};

/**
 * Cherry 头像组案例
 */
export const cherryAvatarGroupExample: ExampleMetadata = {
  id: 'cherry-primitive-avatar-group',
  title: 'Cherry 头像组',
  description: 'Cherry Studio 风格的头像组',
  category: 'primitive',
  tags: ['avatar', 'cherry', 'group', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'avatar-group',
      type: 'Container',
      props: { className: 'flex -space-x-2' },
      children: [
        { id: 'av-1', type: 'Container', props: { className: 'w-8 h-8 rounded-full bg-blue-500 border-2 border-[var(--cherry-background)] flex items-center justify-center text-white text-xs' }, children: [{ id: 't1', type: 'Text', text: 'A' }] },
        { id: 'av-2', type: 'Container', props: { className: 'w-8 h-8 rounded-full bg-green-500 border-2 border-[var(--cherry-background)] flex items-center justify-center text-white text-xs' }, children: [{ id: 't2', type: 'Text', text: 'B' }] },
        { id: 'av-3', type: 'Container', props: { className: 'w-8 h-8 rounded-full bg-purple-500 border-2 border-[var(--cherry-background)] flex items-center justify-center text-white text-xs' }, children: [{ id: 't3', type: 'Text', text: 'C' }] },
      ],
    },
  },
};


// ============================================================================
// 标签原子案例
// ============================================================================

/**
 * Cherry 基础标签案例
 */
export const cherryBasicTagExample: ExampleMetadata = {
  id: 'cherry-primitive-basic-tag',
  title: 'Cherry 基础标签',
  description: 'Cherry Studio 风格的基础标签',
  category: 'primitive',
  tags: ['tag', 'cherry', 'badge', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'basic-tag',
      type: 'Container',
      props: { className: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[var(--cherry-background-soft)] text-[var(--cherry-text)]' },
      children: [{ id: 'tag-text', type: 'Text', text: '标签' }],
    },
  },
};

/**
 * Cherry 能力标签组案例
 */
export const cherryCapabilityTagsExample: ExampleMetadata = {
  id: 'cherry-primitive-capability-tags',
  title: 'Cherry 能力标签组',
  description: 'Cherry Studio 风格的模型能力标签',
  category: 'primitive',
  tags: ['tag', 'cherry', 'capability', 'model', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'capability-tags',
      type: 'Container',
      props: { className: 'flex flex-wrap gap-1' },
      children: [
        { id: 'vision-tag', type: 'Container', props: { className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400' }, children: [{ id: 'v-icon', type: 'Icon', props: { name: 'eye', size: 12 } }, { id: 'v-text', type: 'Text', text: 'Vision' }] },
        { id: 'reasoning-tag', type: 'Container', props: { className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400' }, children: [{ id: 'r-icon', type: 'Icon', props: { name: 'zap', size: 12 } }, { id: 'r-text', type: 'Text', text: 'Reasoning' }] },
        { id: 'web-tag', type: 'Container', props: { className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400' }, children: [{ id: 'w-icon', type: 'Icon', props: { name: 'globe', size: 12 } }, { id: 'w-text', type: 'Text', text: 'Web' }] },
      ],
    },
  },
};

// ============================================================================
// 消息气泡原子案例
// ============================================================================

/**
 * Cherry 用户消息气泡案例
 */
export const cherryUserMessageBubbleExample: ExampleMetadata = {
  id: 'cherry-primitive-user-message',
  title: 'Cherry 用户消息气泡',
  description: 'Cherry Studio 风格的用户消息气泡',
  category: 'primitive',
  tags: ['message', 'cherry', 'user', 'chat', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'user-message',
      type: 'Container',
      props: { className: 'flex justify-end' },
      children: [
        {
          id: 'bubble',
          type: 'Container',
          props: { className: 'max-w-[70%] bg-[var(--cherry-primary)] text-white rounded-lg rounded-tr-none px-4 py-2' },
          children: [{ id: 'msg-text', type: 'Text', text: '你好，请帮我写一段代码' }],
        },
      ],
    },
  },
};

/**
 * Cherry 助手消息气泡案例
 */
export const cherryAssistantMessageBubbleExample: ExampleMetadata = {
  id: 'cherry-primitive-assistant-message',
  title: 'Cherry 助手消息气泡',
  description: 'Cherry Studio 风格的助手消息气泡',
  category: 'primitive',
  tags: ['message', 'cherry', 'assistant', 'chat', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'assistant-message',
      type: 'Container',
      props: { className: 'flex gap-3' },
      children: [
        { id: 'avatar', type: 'Container', props: { className: 'w-8 h-8 rounded-full bg-[var(--cherry-primary)] flex items-center justify-center text-white shrink-0' }, children: [{ id: 'av-icon', type: 'Icon', props: { name: 'user', size: 16 } }] },
        {
          id: 'bubble',
          type: 'Container',
          props: { className: 'max-w-[70%] bg-[var(--cherry-background-soft)] rounded-lg rounded-tl-none px-4 py-2' },
          children: [{ id: 'msg-text', type: 'Text', text: '好的，我来帮你写一段代码。' }],
        },
      ],
    },
  },
};

// ============================================================================
// 侧边栏项原子案例
// ============================================================================

/**
 * Cherry 侧边栏图标项案例
 */
export const cherrySidebarItemExample: ExampleMetadata = {
  id: 'cherry-primitive-sidebar-item',
  title: 'Cherry 侧边栏项',
  description: 'Cherry Studio 风格的侧边栏导航项',
  category: 'primitive',
  tags: ['sidebar', 'cherry', 'navigation', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'sidebar-item',
      type: 'Container',
      props: { className: 'w-10 h-10 rounded-lg hover:bg-[var(--cherry-hover)] flex items-center justify-center cursor-pointer transition-colors' },
      children: [{ id: 'item-icon', type: 'Icon', props: { name: 'message-circle', size: 20 } }],
    },
  },
};

/**
 * Cherry 侧边栏激活项案例
 */
export const cherrySidebarActiveItemExample: ExampleMetadata = {
  id: 'cherry-primitive-sidebar-active-item',
  title: 'Cherry 侧边栏激活项',
  description: 'Cherry Studio 风格的侧边栏激活状态项',
  category: 'primitive',
  tags: ['sidebar', 'cherry', 'navigation', 'active', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'sidebar-active-item',
      type: 'Container',
      props: { className: 'w-10 h-10 rounded-lg bg-[var(--cherry-active)] flex items-center justify-center cursor-pointer border-l-2 border-[var(--cherry-primary)]' },
      children: [{ id: 'item-icon', type: 'Icon', props: { name: 'message-circle', size: 20, className: 'text-[var(--cherry-primary)]' } }],
    },
  },
};

// ============================================================================
// 卡片原子案例
// ============================================================================

/**
 * Cherry 基础卡片案例
 */
export const cherryBasicCardExample: ExampleMetadata = {
  id: 'cherry-primitive-basic-card',
  title: 'Cherry 基础卡片',
  description: 'Cherry Studio 风格的基础卡片',
  category: 'primitive',
  tags: ['card', 'cherry', 'container', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'basic-card',
      type: 'Card',
      props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)]' },
      children: [
        { id: 'card-title', type: 'Text', props: { className: 'font-medium mb-2' }, text: '卡片标题' },
        { id: 'card-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '这是卡片的描述内容' },
      ],
    },
  },
};

/**
 * Cherry 可点击卡片案例
 */
export const cherryClickableCardExample: ExampleMetadata = {
  id: 'cherry-primitive-clickable-card',
  title: 'Cherry 可点击卡片',
  description: 'Cherry Studio 风格的可点击卡片',
  category: 'primitive',
  tags: ['card', 'cherry', 'clickable', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'clickable-card',
      type: 'Card',
      props: { className: 'p-4 bg-[var(--cherry-background-soft)] border-[var(--cherry-border)] hover:bg-[var(--cherry-hover)] cursor-pointer transition-colors' },
      children: [
        { id: 'card-header', type: 'Container', props: { className: 'flex items-center gap-3' }, children: [
          { id: 'card-icon', type: 'Container', props: { className: 'w-10 h-10 rounded-lg bg-[var(--cherry-primary)] flex items-center justify-center text-white' }, children: [{ id: 'icon', type: 'Icon', props: { name: 'user', size: 20 } }] },
          { id: 'card-info', type: 'Container', children: [
            { id: 'card-title', type: 'Text', props: { className: 'font-medium' }, text: '代码助手' },
            { id: 'card-desc', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)]' }, text: '帮助你编写代码' },
          ]},
        ]},
      ],
    },
  },
};

// ============================================================================
// 开关原子案例
// ============================================================================

/**
 * Cherry 开关案例
 */
export const cherrySwitchExample: ExampleMetadata = {
  id: 'cherry-primitive-switch',
  title: 'Cherry 开关',
  description: 'Cherry Studio 风格的开关组件',
  category: 'primitive',
  tags: ['switch', 'cherry', 'toggle', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'switch-row',
      type: 'Container',
      props: { className: 'flex items-center justify-between' },
      children: [
        { id: 'switch-label', type: 'Container', children: [
          { id: 'label-text', type: 'Text', props: { className: 'font-medium' }, text: '开启通知' },
          { id: 'label-desc', type: 'Text', props: { className: 'text-sm text-[var(--cherry-text-2)]' }, text: '接收消息推送通知' },
        ]},
        { id: 'switch', type: 'Switch', props: { checked: true } },
      ],
    },
  },
};

// ============================================================================
// 对话列表项原子案例
// ============================================================================

/**
 * Cherry 对话列表项案例
 */
export const cherryConversationItemExample: ExampleMetadata = {
  id: 'cherry-primitive-conversation-item',
  title: 'Cherry 对话列表项',
  description: 'Cherry Studio 风格的对话列表项',
  category: 'primitive',
  tags: ['conversation', 'cherry', 'list', 'chat', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'conv-item',
      type: 'Container',
      props: { className: 'p-3 rounded-lg hover:bg-[var(--cherry-hover)] cursor-pointer transition-colors' },
      children: [
        { id: 'conv-title', type: 'Text', props: { className: 'font-medium text-sm truncate' }, text: 'GPT-4o 对话' },
        { id: 'conv-preview', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] truncate mt-1' }, text: '你好，请介绍一下自己...' },
        { id: 'conv-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] mt-1' }, text: '10 分钟前' },
      ],
    },
  },
};

/**
 * Cherry 对话列表激活项案例
 */
export const cherryConversationActiveItemExample: ExampleMetadata = {
  id: 'cherry-primitive-conversation-active-item',
  title: 'Cherry 对话列表激活项',
  description: 'Cherry Studio 风格的对话列表激活项',
  category: 'primitive',
  tags: ['conversation', 'cherry', 'list', 'active', 'primitive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'conv-active-item',
      type: 'Container',
      props: { className: 'p-3 rounded-lg bg-[var(--cherry-active)] cursor-pointer' },
      children: [
        { id: 'conv-title', type: 'Text', props: { className: 'font-medium text-sm truncate' }, text: 'Claude 对话' },
        { id: 'conv-preview', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] truncate mt-1' }, text: '帮我写一段代码...' },
        { id: 'conv-time', type: 'Text', props: { className: 'text-xs text-[var(--cherry-text-2)] mt-1' }, text: '刚刚' },
      ],
    },
  },
};

// ============================================================================
// 导出所有原子案例
// ============================================================================

/**
 * 所有 Cherry Studio 原子级案例
 */
export const CHERRY_PRIMITIVE_EXAMPLES: ExampleMetadata[] = [
  // 按钮
  cherryPrimaryButtonExample,
  cherrySecondaryButtonExample,
  cherryGhostButtonExample,
  cherryIconButtonExample,
  cherryButtonGroupExample,
  // 输入框
  cherryBasicInputExample,
  cherrySearchInputExample,
  cherryLabeledInputExample,
  // 头像
  cherryEmojiAvatarExample,
  cherryUserAvatarExample,
  cherryAvatarGroupExample,
  // 标签
  cherryBasicTagExample,
  cherryCapabilityTagsExample,
  // 消息气泡
  cherryUserMessageBubbleExample,
  cherryAssistantMessageBubbleExample,
  // 侧边栏
  cherrySidebarItemExample,
  cherrySidebarActiveItemExample,
  // 卡片
  cherryBasicCardExample,
  cherryClickableCardExample,
  // 开关
  cherrySwitchExample,
  // 对话列表
  cherryConversationItemExample,
  cherryConversationActiveItemExample,
];

/**
 * 获取所有 Cherry 原子级案例
 */
export function getCherryPrimitiveExamples(): ExampleMetadata[] {
  return [...CHERRY_PRIMITIVE_EXAMPLES];
}
