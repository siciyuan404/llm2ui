/**
 * Tabs Transfer Picker 案例定义
 * @description 将 Tabs Transfer Picker 添加到 showcase 组件库
 */

import type { ExampleMetadata } from './presets';

/**
 * Tabs Transfer Picker 穿梭选择器案例
 *
 * 这是一个面向 LLM 的通用生成配置器，用于组合和约束生成内容
 */
export const tabsTransferPickerExample: ExampleMetadata = {
  id: 'system-navigation-tabs-transfer-picker',
  title: 'Tabs Transfer Picker 穿梭选择器',
  description: '面向 LLM 的通用生成配置器 - 通过多维度标签页组合生成要素的三栏穿梭选择器',
  category: 'navigation',
  tags: ['tabs', 'transfer', 'picker', 'llm', 'ai', 'configuration'],
  source: 'system',
  componentName: 'TabsTransferPicker',
  schema: {
    version: '1.0',
    root: {
      id: 'tabs-transfer-picker-container',
      type: 'Container',
      props: {
        className: 'flex h-[600px] w-full gap-4 overflow-hidden p-4 bg-background',
      },
      children: [
        // 左侧：维度切换区
        {
          id: 'left-dimension-panel',
          type: 'Container',
          props: {
            className: 'w-64 flex flex-col border-r bg-muted/30',
          },
          children: [
            {
              id: 'dimension-header',
              type: 'Container',
              props: {
                className: 'border-b px-4 py-3',
              },
              children: [
                {
                  id: 'dimension-title',
                  type: 'Text',
                  props: {
                    className: 'font-semibold text-sm',
                  },
                  text: '生成维度',
                },
              ],
            },
            {
              id: 'dimension-list',
              type: 'Container',
              props: {
                className: 'flex-1 p-2 space-y-1',
              },
              children: [
                {
                  id: 'dimension-item-content-type',
                  type: 'Button',
                  props: {
                    variant: 'ghost',
                    className: 'w-full justify-start gap-2 px-3 py-2 bg-background shadow-sm',
                  },
                  children: [
                    {
                      id: 'content-type-text',
                      type: 'Text',
                      text: '内容类型',
                    },
                    {
                      id: 'content-type-badge',
                      type: 'Badge',
                      props: {
                        variant: 'secondary',
                        className: 'text-xs',
                      },
                      children: [
                        {
                          id: 'content-type-badge-text',
                          type: 'Text',
                          text: '2',
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'dimension-item-style',
                  type: 'Button',
                  props: {
                    variant: 'ghost',
                    className: 'w-full justify-start gap-2 px-3 py-2',
                  },
                  children: [
                    {
                      id: 'style-text',
                      type: 'Text',
                      text: '表达风格',
                    },
                  ],
                },
                {
                  id: 'dimension-item-structure',
                  type: 'Button',
                  props: {
                    variant: 'ghost',
                    className: 'w-full justify-start gap-2 px-3 py-2',
                  },
                  children: [
                    {
                      id: 'structure-text',
                      type: 'Text',
                      text: '输出结构',
                    },
                  ],
                },
                {
                  id: 'dimension-item-constraints',
                  type: 'Button',
                  props: {
                    variant: 'ghost',
                    className: 'w-full justify-start gap-2 px-3 py-2',
                  },
                  children: [
                    {
                      id: 'constraints-text',
                      type: 'Text',
                      text: '约束规则',
                    },
                  ],
                },
                {
                  id: 'dimension-item-context',
                  type: 'Button',
                  props: {
                    variant: 'ghost',
                    className: 'w-full justify-start gap-2 px-3 py-2',
                  },
                  children: [
                    {
                      id: 'context-text',
                      type: 'Text',
                      text: '参考背景',
                    },
                  ],
                },
              ],
            },
          ],
        },
        // 中间：可选要素区
        {
          id: 'middle-elements-panel',
          type: 'Container',
          props: {
            className: 'flex-1 flex flex-col border-r',
          },
          children: [
            {
              id: 'elements-header',
              type: 'Container',
              props: {
                className: 'border-b px-4 py-3',
              },
              children: [
                {
                  id: 'search-container',
                  type: 'Container',
                  props: {
                    className: 'mb-3 flex items-center gap-2',
                  },
                  children: [
                    {
                      id: 'search-icon',
                      type: 'Icon',
                      props: {
                        name: 'search',
                        size: 16,
                        className: 'text-muted-foreground',
                      },
                    },
                    {
                      id: 'search-input',
                      type: 'Input',
                      props: {
                        placeholder: '搜索生成要素...',
                        className: 'h-8',
                      },
                    },
                  ],
                },
                {
                  id: 'elements-title-row',
                  type: 'Container',
                  props: {
                    className: 'flex items-center justify-between',
                  },
                  children: [
                    {
                      id: 'elements-title',
                      type: 'Text',
                      props: {
                        className: 'font-semibold text-sm',
                      },
                      text: '内容类型',
                    },
                    {
                      id: 'elements-count',
                      type: 'Text',
                      props: {
                        className: 'text-xs text-muted-foreground',
                      },
                      text: '5 项可用',
                    },
                  ],
                },
              ],
            },
            {
              id: 'elements-list',
              type: 'Container',
              props: {
                className: 'flex-1 px-3 py-2 space-y-1 overflow-y-auto',
              },
              children: [
                {
                  id: 'element-item-article',
                  type: 'Card',
                  props: {
                    className: 'group relative flex items-start gap-3 border border-border bg-card p-3 hover:border-primary/30',
                  },
                  children: [
                    {
                      id: 'article-icon',
                      type: 'Icon',
                      props: {
                        name: 'file-text',
                        size: 16,
                        className: 'mt-0.5 text-blue-500',
                      },
                    },
                    {
                      id: 'article-content',
                      type: 'Container',
                      props: {
                        className: 'flex-1 min-w-0',
                      },
                      children: [
                        {
                          id: 'article-label',
                          type: 'Text',
                          props: {
                            className: 'text-sm font-medium',
                          },
                          text: '技术文章',
                        },
                        {
                          id: 'article-desc',
                          type: 'Text',
                          props: {
                            className: 'mt-1 text-xs text-muted-foreground line-clamp-2',
                          },
                          text: '深度技术分析和教程内容',
                        },
                      ],
                    },
                    {
                      id: 'article-add-btn',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        size: 'icon',
                        className: 'shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100',
                      },
                      children: [
                        {
                          id: 'add-icon',
                          type: 'Icon',
                          props: {
                            name: 'plus',
                            size: 16,
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'element-item-tutorial',
                  type: 'Card',
                  props: {
                    className: 'group relative flex items-start gap-3 border border-primary/20 bg-primary/5 p-3',
                  },
                  children: [
                    {
                      id: 'tutorial-icon',
                      type: 'Icon',
                      props: {
                        name: 'sparkles',
                        size: 16,
                        className: 'mt-0.5 text-purple-500',
                      },
                    },
                    {
                      id: 'tutorial-content',
                      type: 'Container',
                      props: {
                        className: 'flex-1 min-w-0',
                      },
                      children: [
                        {
                          id: 'tutorial-label-row',
                          type: 'Container',
                          props: {
                            className: 'flex items-center gap-2',
                          },
                          children: [
                            {
                              id: 'tutorial-label',
                              type: 'Text',
                              props: {
                                className: 'text-sm font-medium',
                              },
                              text: '教程指南',
                            },
                            {
                              id: 'tutorial-badge',
                              type: 'Badge',
                              props: {
                                variant: 'secondary',
                                className: 'text-xs',
                              },
                              children: [
                                {
                                  id: 'tutorial-badge-text',
                                  type: 'Text',
                                  text: '已选',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          id: 'tutorial-desc',
                          type: 'Text',
                          props: {
                            className: 'mt-1 text-xs text-muted-foreground line-clamp-2',
                          },
                          text: '步骤详细的操作指南',
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'element-item-documentation',
                  type: 'Card',
                  props: {
                    className: 'group relative flex items-start gap-3 border border-border bg-card p-3 hover:border-primary/30',
                  },
                  children: [
                    {
                      id: 'doc-icon',
                      type: 'Icon',
                      props: {
                        name: 'layout',
                        size: 16,
                        className: 'mt-0.5 text-green-500',
                      },
                    },
                    {
                      id: 'doc-content',
                      type: 'Container',
                      props: {
                        className: 'flex-1 min-w-0',
                      },
                      children: [
                        {
                          id: 'doc-label',
                          type: 'Text',
                          props: {
                            className: 'text-sm font-medium',
                          },
                          text: 'API 文档',
                        },
                        {
                          id: 'doc-desc',
                          type: 'Text',
                          props: {
                            className: 'mt-1 text-xs text-muted-foreground line-clamp-2',
                          },
                          text: '接口说明和调用示例',
                        },
                      ],
                    },
                    {
                      id: 'doc-add-btn',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        size: 'icon',
                        className: 'shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100',
                      },
                      children: [
                        {
                          id: 'doc-add-icon',
                          type: 'Icon',
                          props: {
                            name: 'plus',
                            size: 16,
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // 右侧：已选组合区
        {
          id: 'right-selected-panel',
          type: 'Container',
          props: {
            className: 'w-80 flex flex-col',
          },
          children: [
            {
              id: 'selected-header',
              type: 'Container',
              props: {
                className: 'border-b px-4 py-3',
              },
              children: [
                {
                  id: 'selected-title-row',
                  type: 'Container',
                  props: {
                    className: 'flex items-center justify-between',
                  },
                  children: [
                    {
                      id: 'selected-title',
                      type: 'Text',
                      props: {
                        className: 'font-semibold text-sm',
                      },
                      text: '已选生成组合',
                    },
                    {
                      id: 'selected-count-badge',
                      type: 'Badge',
                      props: {
                        variant: 'outline',
                        className: 'text-xs',
                      },
                      children: [
                        {
                          id: 'selected-count-text',
                          type: 'Text',
                          text: '2',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'selected-list',
              type: 'Container',
              props: {
                className: 'flex-1 px-3 py-2 space-y-1 overflow-y-auto',
              },
              children: [
                {
                  id: 'selected-item-1',
                  type: 'Card',
                  props: {
                    className: 'group relative flex items-start gap-3 border border-border bg-card p-3 hover:border-primary/30 hover:shadow-sm',
                  },
                  children: [
                    {
                      id: 'drag-handle-1',
                      type: 'Icon',
                      props: {
                        name: 'grip-vertical',
                        size: 16,
                        className: 'mt-0.5 shrink-0 cursor-grab text-muted-foreground',
                      },
                    },
                    {
                      id: 'item-1-content',
                      type: 'Container',
                      props: {
                        className: 'flex-1 min-w-0',
                      },
                      children: [
                        {
                          id: 'item-1-label',
                          type: 'Text',
                          props: {
                            className: 'text-sm font-medium',
                          },
                          text: '技术文章',
                        },
                        {
                          id: 'item-1-desc',
                          type: 'Text',
                          props: {
                            className: 'mt-1 text-xs text-muted-foreground line-clamp-1',
                          },
                          text: '深度技术分析和教程内容',
                        },
                      ],
                    },
                    {
                      id: 'item-1-badge',
                      type: 'Badge',
                      props: {
                        variant: 'secondary',
                        className: 'shrink-0 text-xs',
                      },
                      children: [
                        {
                          id: 'item-1-badge-text',
                          type: 'Text',
                          text: '#1',
                        },
                      ],
                    },
                    {
                      id: 'item-1-remove-btn',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        size: 'icon',
                        className: 'shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100',
                      },
                      children: [
                        {
                          id: 'remove-icon-1',
                          type: 'Icon',
                          props: {
                            name: 'x',
                            size: 16,
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'selected-item-2',
                  type: 'Card',
                  props: {
                    className: 'group relative flex items-start gap-3 border border-border bg-card p-3 hover:border-primary/30 hover:shadow-sm',
                  },
                  children: [
                    {
                      id: 'drag-handle-2',
                      type: 'Icon',
                      props: {
                        name: 'grip-vertical',
                        size: 16,
                        className: 'mt-0.5 shrink-0 cursor-grab text-muted-foreground',
                      },
                    },
                    {
                      id: 'item-2-content',
                      type: 'Container',
                      props: {
                        className: 'flex-1 min-w-0',
                      },
                      children: [
                        {
                          id: 'item-2-label',
                          type: 'Text',
                          props: {
                            className: 'text-sm font-medium',
                          },
                          text: '教程指南',
                        },
                        {
                          id: 'item-2-desc',
                          type: 'Text',
                          props: {
                            className: 'mt-1 text-xs text-muted-foreground line-clamp-1',
                          },
                          text: '步骤详细的操作指南',
                        },
                      ],
                    },
                    {
                      id: 'item-2-badge',
                      type: 'Badge',
                      props: {
                        variant: 'secondary',
                        className: 'shrink-0 text-xs',
                      },
                      children: [
                        {
                          id: 'item-2-badge-text',
                          type: 'Text',
                          text: '#2',
                        },
                      ],
                    },
                    {
                      id: 'item-2-remove-btn',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        size: 'icon',
                        className: 'shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100',
                      },
                      children: [
                        {
                          id: 'remove-icon-2',
                          type: 'Icon',
                          props: {
                            name: 'x',
                            size: 16,
                          },
                        },
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
};
