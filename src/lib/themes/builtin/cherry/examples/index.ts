/**
 * @file index.ts
 * @description Cherry Studio 主题的案例配置（自包含）
 * @module lib/themes/builtin/cherry/examples
 * @requirements 1.1, 1.2, 1.3, 1.4, 5.1
 */

import type { ThemeExamples, ExampleMetadata } from '../../../types';
import { CHERRY_PATTERN_EXAMPLES } from './patterns';
import { CHERRY_EXTENDED_EXAMPLES } from './extended';
import { CHERRY_PRIMITIVE_EXAMPLES } from './primitives';

// 重新导出类型
export type { ExampleMetadata } from './types';

// 重新导出案例数组以保持向后兼容
export { CHERRY_PATTERN_EXAMPLES } from './patterns';
export { CHERRY_EXTENDED_EXAMPLES } from './extended';
export { CHERRY_PRIMITIVE_EXAMPLES } from './primitives';

// 重新导出单个案例和辅助函数以保持向后兼容
export {
  cherryChatInterfaceExample,
  cherrySidebarNavigationExample,
  cherryModelSelectorExample,
  cherryMessageListExample,
  cherryInputBarExample,
  cherrySettingsPanelExample,
  getCherryPatternExamples,
} from './patterns';

/**
 * 估算案例的 Token 数量
 */
function estimateTokenCount(schema: unknown): number {
  const jsonStr = JSON.stringify(schema);
  // 粗略估算：每 4 个字符约 1 个 token
  return Math.ceil(jsonStr.length / 4);
}

/**
 * 转换案例格式为 ThemeExamples 格式
 */
function convertToExampleMetadata(examples: Array<{
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  source: string;
  schema: unknown;
}>): ExampleMetadata[] {
  return examples.map(example => ({
    id: example.id,
    name: example.title,
    description: example.description,
    category: example.category,
    tags: example.tags,
    tokenCount: estimateTokenCount(example.schema),
    schema: example.schema,
  }));
}

/**
 * Cherry Studio 主题的案例元数据
 * 合并原子案例、基础案例和扩展案例
 */
export const cherryExamplePresets: ExampleMetadata[] = [
  ...convertToExampleMetadata(CHERRY_PRIMITIVE_EXAMPLES),
  ...convertToExampleMetadata(CHERRY_PATTERN_EXAMPLES),
  ...convertToExampleMetadata(CHERRY_EXTENDED_EXAMPLES),
];


/**
 * Cherry Studio 主题的案例配置
 */
export const cherryExamples: ThemeExamples = {
  presets: cherryExamplePresets,
  categories: [
    {
      id: 'primitive',
      name: '原子组件',
      description: 'Cherry Studio 风格的原子级基础组件案例',
    },
    {
      id: 'layout',
      name: '布局',
      description: 'Cherry Studio 风格的页面布局案例',
    },
    {
      id: 'form',
      name: '表单',
      description: 'Cherry Studio 风格的表单和设置案例',
    },
    {
      id: 'navigation',
      name: '导航',
      description: 'Cherry Studio 风格的导航和菜单案例',
    },
    {
      id: 'display',
      name: '展示',
      description: 'Cherry Studio 风格的数据展示案例',
    },
    {
      id: 'chat',
      name: '聊天',
      description: 'Cherry Studio 风格的聊天界面案例',
    },
  ],
  keywordMappings: [
    // 原子组件相关
    {
      keywords: ['primitive', '原子', '基础', 'basic', 'simple'],
      exampleIds: [
        'cherry-primitive-primary-button',
        'cherry-primitive-secondary-button',
        'cherry-primitive-ghost-button',
        'cherry-primitive-icon-button',
        'cherry-primitive-basic-input',
        'cherry-primitive-emoji-avatar',
        'cherry-primitive-basic-tag',
        'cherry-primitive-basic-card',
        'cherry-primitive-switch',
      ],
    },
    // 按钮相关
    {
      keywords: ['button', '按钮'],
      exampleIds: [
        'cherry-primitive-primary-button',
        'cherry-primitive-secondary-button',
        'cherry-primitive-ghost-button',
        'cherry-primitive-icon-button',
        'cherry-primitive-button-group',
      ],
    },
    // 输入框相关
    {
      keywords: ['input', '输入', '输入框', 'search', '搜索'],
      exampleIds: [
        'cherry-primitive-basic-input',
        'cherry-primitive-search-input',
        'cherry-primitive-labeled-input',
      ],
    },
    // 头像相关
    {
      keywords: ['avatar', '头像'],
      exampleIds: [
        'cherry-primitive-emoji-avatar',
        'cherry-primitive-user-avatar',
        'cherry-primitive-avatar-group',
      ],
    },
    // 标签相关
    {
      keywords: ['tag', '标签', 'badge', '徽章'],
      exampleIds: [
        'cherry-primitive-basic-tag',
        'cherry-primitive-capability-tags',
      ],
    },
    // 布局相关
    {
      keywords: ['layout', '布局', '页面', 'page'],
      exampleIds: [
        'system-cherry-full-layout',
        'system-cherry-chat-page-layout',
        'system-cherry-agents-page-layout',
        'system-cherry-files-page-layout',
        'system-cherry-settings-page-layout',
        'system-cherry-knowledge-page-layout',
        'system-cherry-translation-page-layout',
        'system-cherry-image-page-layout',
      ],
    },
    // 侧边栏相关
    {
      keywords: ['sidebar', '侧边栏', '导航栏'],
      exampleIds: [
        'system-cherry-sidebar-navigation',
        'system-cherry-full-layout',
      ],
    },
    // 聊天相关
    {
      keywords: ['chat', '聊天', '对话', 'message', '消息'],
      exampleIds: [
        'system-cherry-chat-interface',
        'system-cherry-message-list',
        'system-cherry-input-bar',
        'system-cherry-conversation-list',
        'system-cherry-message-toolbar',
      ],
    },
    // 设置相关
    {
      keywords: ['settings', '设置', '配置', 'config'],
      exampleIds: [
        'system-cherry-settings-panel',
        'system-cherry-settings-interface',
        'system-cherry-llm-settings',
        'system-cherry-shortcuts-panel',
        'system-cherry-provider-config',
      ],
    },
    // 模型相关
    {
      keywords: ['model', '模型', 'llm', 'ai'],
      exampleIds: [
        'system-cherry-model-selector',
        'system-cherry-llm-settings',
        'system-cherry-model-category',
        'system-cherry-model-switch',
        'system-cherry-provider-config',
      ],
    },
    // 助手相关
    {
      keywords: ['assistant', '助手', 'agent'],
      exampleIds: [
        'system-cherry-assistant-manager',
        'system-cherry-agents-page-layout',
      ],
    },
    // 知识库相关
    {
      keywords: ['knowledge', '知识库', '文档', 'document'],
      exampleIds: [
        'system-cherry-knowledge-base',
        'system-cherry-knowledge-page-layout',
      ],
    },
    // 翻译相关
    {
      keywords: ['translate', '翻译', 'translation'],
      exampleIds: [
        'system-cherry-translation-panel',
        'system-cherry-translation-page-layout',
      ],
    },
    // 图片生成相关
    {
      keywords: ['image', '图片', '生成', 'generation'],
      exampleIds: [
        'system-cherry-image-generation',
        'system-cherry-image-page-layout',
      ],
    },
    // 代码相关
    {
      keywords: ['code', '代码', 'interpreter'],
      exampleIds: [
        'system-cherry-code-interpreter',
      ],
    },
    // 文件相关
    {
      keywords: ['file', '文件', 'folder', '文件夹'],
      exampleIds: [
        'system-cherry-file-manager',
        'system-cherry-files-page-layout',
      ],
    },
    // 插件相关
    {
      keywords: ['plugin', '插件', 'extension'],
      exampleIds: [
        'system-cherry-plugin-manager',
        'system-cherry-mcp-manager',
      ],
    },
    // 提示词相关
    {
      keywords: ['prompt', '提示词', 'template'],
      exampleIds: [
        'system-cherry-prompt-library',
      ],
    },
    // 语音相关
    {
      keywords: ['voice', '语音', 'speech'],
      exampleIds: [
        'system-cherry-voice-interface',
      ],
    },
    // 导出相关
    {
      keywords: ['export', '导出', 'download'],
      exampleIds: [
        'system-cherry-export-dialog',
      ],
    },
    // 话题相关
    {
      keywords: ['topic', '话题', '分组'],
      exampleIds: [
        'system-cherry-topic-list',
      ],
    },
    // 笔记相关
    {
      keywords: ['note', '笔记', 'tree'],
      exampleIds: [
        'system-cherry-notes-tree',
      ],
    },
    // 图标相关
    {
      keywords: ['icon', '图标'],
      exampleIds: [
        'system-cherry-icon-gallery',
      ],
    },
    // 悬浮窗相关
    {
      keywords: ['floating', '悬浮', 'window'],
      exampleIds: [
        'system-cherry-floating-window',
      ],
    },
    // 工具栏相关
    {
      keywords: ['toolbar', '工具栏', 'selection'],
      exampleIds: [
        'system-cherry-message-toolbar',
        'system-cherry-selection-toolbar',
      ],
    },
  ],
};

/**
 * 获取 Cherry Studio 主题的所有案例 ID
 */
export function getCherryExampleIds(): string[] {
  return cherryExamplePresets.map(example => example.id);
}

/**
 * 根据 ID 获取案例
 */
export function getCherryExampleById(id: string): ExampleMetadata | undefined {
  return cherryExamplePresets.find(example => example.id === id);
}

/**
 * 根据分类获取案例
 */
export function getCherryExamplesByCategory(category: string): ExampleMetadata[] {
  return cherryExamplePresets.filter(example => example.category === category);
}

/**
 * 根据关键词获取相关案例
 */
export function getCherryExamplesByKeyword(keyword: string): ExampleMetadata[] {
  const lowerKeyword = keyword.toLowerCase();
  const matchingIds = new Set<string>();

  // 从关键词映射中查找
  for (const mapping of cherryExamples.keywordMappings || []) {
    if (mapping.keywords.some(k => k.toLowerCase().includes(lowerKeyword))) {
      mapping.exampleIds.forEach(id => matchingIds.add(id));
    }
  }

  // 从标签中查找
  for (const example of cherryExamplePresets) {
    if (example.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))) {
      matchingIds.add(example.id);
    }
  }

  return cherryExamplePresets.filter(example => matchingIds.has(example.id));
}
