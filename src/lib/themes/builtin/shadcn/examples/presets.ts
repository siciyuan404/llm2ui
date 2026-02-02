/**
 * @file presets.ts
 * @description shadcn-ui 主题预设案例模块，定义常见 UI 场景的预设案例
 * @module lib/themes/builtin/shadcn/examples/presets
 * @requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import type { UISchema } from '../../../../../types';

/**
 * 案例分类
 */
export type ExampleCategory = 
  | 'layout'
  | 'form'
  | 'navigation'
  | 'dashboard'
  | 'display'
  | 'feedback';

/**
 * 案例元数据接口
 * 
 * 定义案例的完整元数据结构，包括标识、描述、分类、标签和 Schema
 */
export interface ExampleMetadata {
  /** 唯一标识符，格式: "system-{category}-{name}" 或 "custom-{timestamp}-{random}" */
  id: string;
  /** 案例标题 */
  title: string;
  /** 案例描述 */
  description: string;
  /** 案例分类 */
  category: ExampleCategory;
  /** 案例标签 */
  tags: string[];
  /** UI Schema */
  schema: UISchema;
  /** 来源：system（系统预设）或 custom（用户自定义） */
  source: 'system' | 'custom';
  /** 关联的组件名称（可选，来自 ComponentRegistry 的案例） */
  componentName?: string;
}

// ============================================================================
// Layout 类别案例
// ============================================================================

/**
 * Admin 侧边栏案例
 */
const adminSidebarExample: ExampleMetadata = {
  id: 'system-layout-admin-sidebar',
  title: 'Admin 侧边栏',
  description: '后台管理系统的侧边导航栏，包含菜单项和图标',
  category: 'layout',
  tags: ['sidebar', 'admin', 'navigation', 'responsive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'sidebar-container',
      type: 'Container',
      props: {
        className: 'w-64 h-screen bg-slate-100 text-slate-900 flex flex-col border-r border-slate-200',
      },
      children: [
        {
          id: 'sidebar-header',
          type: 'Container',
          props: {
            className: 'p-4 border-b border-slate-200',
          },
          children: [
            {
              id: 'logo-text',
              type: 'Text',
              props: {
                className: 'text-xl font-bold',
              },
              text: 'Admin Panel',
            },
          ],
        },
        {
          id: 'nav-menu',
          type: 'Container',
          props: {
            className: 'flex-1 py-4',
          },
          children: [
            {
              id: 'menu-item-dashboard',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'w-full justify-start text-slate-700 hover:bg-slate-200 hover:text-slate-900 gap-2',
              },
              children: [
                { id: 'dashboard-icon', type: 'Icon', props: { name: 'home', size: 16 } },
                { id: 'dashboard-text', type: 'Text', text: '仪表盘' },
              ],
            },
            {
              id: 'menu-item-users',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'w-full justify-start text-slate-700 hover:bg-slate-200 hover:text-slate-900 gap-2',
              },
              children: [
                { id: 'users-icon', type: 'Icon', props: { name: 'user', size: 16 } },
                { id: 'users-text', type: 'Text', text: '用户管理' },
              ],
            },
            {
              id: 'menu-item-settings',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'w-full justify-start text-slate-700 hover:bg-slate-200 hover:text-slate-900 gap-2',
              },
              children: [
                { id: 'settings-icon', type: 'Icon', props: { name: 'settings', size: 16 } },
                { id: 'settings-text', type: 'Text', text: '系统设置' },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * AppSidebar 图标导航栏案例
 * 类似 cherry-studio 风格的垂直图标导航栏
 */
const appSidebarExample: ExampleMetadata = {
  id: 'system-navigation-app-sidebar',
  title: 'AppSidebar 图标导航栏',
  description: '垂直图标导航栏，类似 cherry-studio 风格，包含 Logo、主菜单和底部操作区',
  category: 'navigation',
  tags: ['sidebar', 'navigation', 'icon', 'app', 'cherry-studio'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'app-sidebar',
      type: 'AppSidebar',
      children: [
        {
          id: 'app-sidebar-logo',
          type: 'AppSidebarLogo',
          children: [
            {
              id: 'logo-icon',
              type: 'Container',
              props: {
                className: 'w-8 h-8 bg-primary rounded-lg flex items-center justify-center',
              },
              children: [
                {
                  id: 'logo-text',
                  type: 'Text',
                  props: { className: 'text-primary-foreground font-bold text-sm' },
                  text: 'A',
                },
              ],
            },
          ],
        },
        {
          id: 'app-sidebar-menus',
          type: 'AppSidebarMenus',
          children: [
            {
              id: 'menu-bot',
              type: 'AppSidebarIconButton',
              props: { active: true },
              children: [
                { id: 'bot-icon', type: 'Icon', props: { name: 'bot', size: 20 } },
              ],
            },
            {
              id: 'menu-globe',
              type: 'AppSidebarIconButton',
              children: [
                { id: 'globe-icon', type: 'Icon', props: { name: 'globe', size: 20 } },
              ],
            },
            {
              id: 'menu-database',
              type: 'AppSidebarIconButton',
              children: [
                { id: 'database-icon', type: 'Icon', props: { name: 'database', size: 20 } },
              ],
            },
            {
              id: 'menu-terminal',
              type: 'AppSidebarIconButton',
              children: [
                { id: 'terminal-icon', type: 'Icon', props: { name: 'terminal', size: 20 } },
              ],
            },
            {
              id: 'menu-wrench',
              type: 'AppSidebarIconButton',
              children: [
                { id: 'wrench-icon', type: 'Icon', props: { name: 'wrench', size: 20 } },
              ],
            },
            {
              id: 'menu-puzzle',
              type: 'AppSidebarIconButton',
              children: [
                { id: 'puzzle-icon', type: 'Icon', props: { name: 'puzzle', size: 20 } },
              ],
            },
          ],
        },
        {
          id: 'app-sidebar-bottom',
          type: 'AppSidebarBottomMenus',
          children: [
            {
              id: 'menu-activity',
              type: 'AppSidebarIconButton',
              children: [
                { id: 'activity-icon', type: 'Icon', props: { name: 'activity', size: 20 } },
              ],
            },
            {
              id: 'menu-moon',
              type: 'AppSidebarIconButton',
              children: [
                { id: 'moon-icon', type: 'Icon', props: { name: 'moon', size: 20 } },
              ],
            },
            {
              id: 'menu-settings',
              type: 'AppSidebarIconButton',
              children: [
                { id: 'settings-icon', type: 'Icon', props: { name: 'settings', size: 20 } },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 顶部导航栏案例
 */
const topNavbarExample: ExampleMetadata = {
  id: 'system-layout-top-navbar',
  title: '顶部导航栏',
  description: '网站顶部导航栏，包含 Logo、菜单和用户操作区',
  category: 'layout',
  tags: ['header', 'navbar', 'navigation', 'responsive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'navbar-container',
      type: 'Container',
      props: {
        className: 'w-full h-16 bg-white border-b flex items-center justify-between px-6',
      },
      children: [
        {
          id: 'navbar-left',
          type: 'Container',
          props: {
            className: 'flex items-center gap-8',
          },
          children: [
            {
              id: 'logo',
              type: 'Text',
              props: {
                className: 'text-xl font-bold text-primary',
              },
              text: 'Logo',
            },
            {
              id: 'nav-links',
              type: 'Container',
              props: {
                className: 'flex gap-4',
              },
              children: [
                {
                  id: 'link-home',
                  type: 'Button',
                  props: { variant: 'ghost', className: 'gap-2' },
                  children: [
                    { id: 'link-home-icon', type: 'Icon', props: { name: 'home', size: 16 } },
                    { id: 'link-home-text', type: 'Text', text: '首页' },
                  ],
                },
                {
                  id: 'link-products',
                  type: 'Button',
                  props: { variant: 'ghost', className: 'gap-2' },
                  children: [
                    { id: 'link-products-icon', type: 'Icon', props: { name: 'folder', size: 16 } },
                    { id: 'link-products-text', type: 'Text', text: '产品' },
                  ],
                },
                {
                  id: 'link-about',
                  type: 'Button',
                  props: { variant: 'ghost', className: 'gap-2' },
                  children: [
                    { id: 'link-about-icon', type: 'Icon', props: { name: 'file', size: 16 } },
                    { id: 'link-about-text', type: 'Text', text: '关于' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'navbar-right',
          type: 'Container',
          props: {
            className: 'flex items-center gap-4',
          },
          children: [
            {
              id: 'login-btn',
              type: 'Button',
              props: { variant: 'outline', className: 'gap-2' },
              children: [
                { id: 'login-btn-icon', type: 'Icon', props: { name: 'log-in', size: 16 } },
                { id: 'login-btn-text', type: 'Text', text: '登录' },
              ],
            },
            {
              id: 'signup-btn',
              type: 'Button',
              props: { variant: 'default', className: 'gap-2' },
              children: [
                { id: 'signup-btn-icon', type: 'Icon', props: { name: 'plus', size: 16 } },
                { id: 'signup-btn-text', type: 'Text', text: '注册' },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 三栏布局案例
 */
const threeColumnLayoutExample: ExampleMetadata = {
  id: 'system-layout-three-column',
  title: '三栏布局',
  description: '经典的三栏布局，包含左侧边栏、主内容区和右侧边栏',
  category: 'layout',
  tags: ['sidebar', 'responsive', 'admin'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'three-column-layout',
      type: 'Container',
      props: {
        className: 'flex h-screen',
      },
      children: [
        {
          id: 'left-sidebar',
          type: 'Container',
          props: {
            className: 'w-64 bg-slate-100 p-4 border-r',
          },
          children: [
            {
              id: 'left-title',
              type: 'Text',
              props: { className: 'font-bold mb-4' },
              text: '导航菜单',
            },
          ],
        },
        {
          id: 'main-content',
          type: 'Container',
          props: {
            className: 'flex-1 p-6 overflow-auto',
          },
          children: [
            {
              id: 'main-title',
              type: 'Text',
              props: { className: 'text-2xl font-bold mb-4' },
              text: '主内容区',
            },
            {
              id: 'main-text',
              type: 'Text',
              text: '这里是主要内容展示区域',
            },
          ],
        },
        {
          id: 'right-sidebar',
          type: 'Container',
          props: {
            className: 'w-80 bg-slate-50 p-4 border-l',
          },
          children: [
            {
              id: 'right-title',
              type: 'Text',
              props: { className: 'font-bold mb-4' },
              text: '侧边信息',
            },
          ],
        },
      ],
    },
  },
};


/**
 * PC Web Header 案例
 * 企业级网站顶部导航，包含 Logo、主导航、搜索框、通知和用户菜单
 */
const pcWebHeaderExample: ExampleMetadata = {
  id: 'system-layout-pc-web-header',
  title: 'PC Web Header',
  description: '企业级 PC 网站顶部导航栏，包含 Logo、主导航菜单、搜索框、通知图标和用户下拉菜单',
  category: 'layout',
  tags: ['header', 'navbar', 'navigation', 'pc', 'web', 'responsive'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'pc-header',
      type: 'Container',
      props: {
        className: 'w-full h-16 bg-white border-b shadow-sm sticky top-0 z-50',
      },
      children: [
        {
          id: 'header-inner',
          type: 'Container',
          props: {
            className: 'max-w-7xl mx-auto h-full px-4 flex items-center justify-between',
          },
          children: [
            {
              id: 'header-left',
              type: 'Container',
              props: {
                className: 'flex items-center gap-8',
              },
              children: [
                {
                  id: 'logo-wrapper',
                  type: 'Container',
                  props: {
                    className: 'flex items-center gap-2',
                  },
                  children: [
                    {
                      id: 'logo-icon',
                      type: 'Container',
                      props: {
                        className: 'w-8 h-8 bg-primary rounded-lg flex items-center justify-center',
                      },
                      children: [
                        {
                          id: 'logo-text-icon',
                          type: 'Text',
                          props: { className: 'text-white font-bold text-sm' },
                          text: 'A',
                        },
                      ],
                    },
                    {
                      id: 'logo-name',
                      type: 'Text',
                      props: {
                        className: 'text-xl font-bold text-slate-900',
                      },
                      text: 'Acme Inc',
                    },
                  ],
                },
                {
                  id: 'main-nav',
                  type: 'Container',
                  props: {
                    className: 'hidden md:flex items-center gap-1',
                  },
                  children: [
                    {
                      id: 'nav-home',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2',
                      },
                      children: [
                        { id: 'nav-home-icon', type: 'Icon', props: { name: 'home', size: 16 } },
                        { id: 'nav-home-text', type: 'Text', text: '首页' },
                      ],
                    },
                    {
                      id: 'nav-products',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2',
                      },
                      children: [
                        { id: 'nav-products-icon', type: 'Icon', props: { name: 'package', size: 16 } },
                        { id: 'nav-products-text', type: 'Text', text: '产品' },
                      ],
                    },
                    {
                      id: 'nav-solutions',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2',
                      },
                      children: [
                        { id: 'nav-solutions-icon', type: 'Icon', props: { name: 'lightbulb', size: 16 } },
                        { id: 'nav-solutions-text', type: 'Text', text: '解决方案' },
                      ],
                    },
                    {
                      id: 'nav-pricing',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2',
                      },
                      children: [
                        { id: 'nav-pricing-icon', type: 'Icon', props: { name: 'dollar-sign', size: 16 } },
                        { id: 'nav-pricing-text', type: 'Text', text: '定价' },
                      ],
                    },
                    {
                      id: 'nav-docs',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2',
                      },
                      children: [
                        { id: 'nav-docs-icon', type: 'Icon', props: { name: 'book', size: 16 } },
                        { id: 'nav-docs-text', type: 'Text', text: '文档' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'header-right',
              type: 'Container',
              props: {
                className: 'flex items-center gap-4',
              },
              children: [
                {
                  id: 'search-box',
                  type: 'Container',
                  props: {
                    className: 'hidden lg:flex items-center',
                  },
                  children: [
                    {
                      id: 'search-input-wrapper',
                      type: 'Container',
                      props: {
                        className: 'relative',
                      },
                      children: [
                        {
                          id: 'search-input',
                          type: 'Input',
                          props: {
                            placeholder: '搜索...',
                            className: 'w-64 pl-10 bg-slate-50 border-slate-200 focus:bg-white',
                          },
                        },
                        {
                          id: 'search-icon',
                          type: 'Icon',
                          props: {
                            name: 'search',
                            size: 16,
                            className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'notification-btn',
                  type: 'Button',
                  props: {
                    variant: 'ghost',
                    size: 'icon',
                    className: 'relative text-slate-600 hover:text-slate-900',
                  },
                  children: [
                    { id: 'notification-icon', type: 'Icon', props: { name: 'bell', size: 20 } },
                  ],
                },
                {
                  id: 'user-menu',
                  type: 'Container',
                  props: {
                    className: 'flex items-center gap-3 pl-4 border-l border-slate-200',
                  },
                  children: [
                    {
                      id: 'user-avatar',
                      type: 'Container',
                      props: {
                        className: 'w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center',
                      },
                      children: [
                        {
                          id: 'avatar-text',
                          type: 'Text',
                          props: { className: 'text-sm font-medium text-slate-600' },
                          text: 'U',
                        },
                      ],
                    },
                    {
                      id: 'user-info',
                      type: 'Container',
                      props: {
                        className: 'hidden sm:block',
                      },
                      children: [
                        {
                          id: 'user-name',
                          type: 'Text',
                          props: { className: 'text-sm font-medium text-slate-900' },
                          text: '用户名',
                        },
                        {
                          id: 'user-role',
                          type: 'Text',
                          props: { className: 'text-xs text-slate-500' },
                          text: '管理员',
                        },
                      ],
                    },
                    {
                      id: 'dropdown-icon',
                      type: 'Icon',
                      props: { name: 'chevron-down', size: 14, className: 'text-slate-400' },
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

/**
 * 响应式容器案例
 */
const responsiveContainerExample: ExampleMetadata = {
  id: 'system-layout-responsive-container',
  title: '响应式容器',
  description: '自适应宽度的内容容器，适用于各种屏幕尺寸',
  category: 'layout',
  tags: ['responsive', 'mobile'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'responsive-wrapper',
      type: 'Container',
      props: {
        className: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      },
      children: [
        {
          id: 'content-section',
          type: 'Container',
          props: {
            className: 'py-8',
          },
          children: [
            {
              id: 'section-title',
              type: 'Text',
              props: { className: 'text-3xl font-bold text-center mb-8' },
              text: '响应式内容区',
            },
            {
              id: 'card-grid',
              type: 'Container',
              props: {
                className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
              },
              children: [
                {
                  id: 'card-1',
                  type: 'Card',
                  props: { className: 'p-4' },
                  children: [
                    { id: 'card-1-title', type: 'Text', props: { className: 'font-bold' }, text: '卡片 1' },
                  ],
                },
                {
                  id: 'card-2',
                  type: 'Card',
                  props: { className: 'p-4' },
                  children: [
                    { id: 'card-2-title', type: 'Text', props: { className: 'font-bold' }, text: '卡片 2' },
                  ],
                },
                {
                  id: 'card-3',
                  type: 'Card',
                  props: { className: 'p-4' },
                  children: [
                    { id: 'card-3-title', type: 'Text', props: { className: 'font-bold' }, text: '卡片 3' },
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


// ============================================================================
// Form 类别案例
// ============================================================================

/**
 * 登录表单案例
 */
const loginFormExample: ExampleMetadata = {
  id: 'system-form-login',
  title: '登录表单',
  description: '用户登录表单，包含用户名、密码输入和登录按钮',
  category: 'form',
  tags: ['login', 'card', 'modal'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'login-form-container',
      type: 'Card',
      props: {
        className: 'w-full max-w-md mx-auto p-6',
      },
      children: [
        {
          id: 'login-title',
          type: 'Text',
          props: { className: 'text-2xl font-bold text-center mb-6' },
          text: '用户登录',
        },
        {
          id: 'login-form',
          type: 'Container',
          props: { className: 'space-y-4' },
          children: [
            {
              id: 'username-field',
              type: 'Container',
              props: { className: 'space-y-2' },
              children: [
                {
                  id: 'username-label',
                  type: 'Label',
                  props: { htmlFor: 'username' },
                  text: '用户名',
                },
                {
                  id: 'username-input',
                  type: 'Input',
                  props: {
                    id: 'username',
                    placeholder: '请输入用户名',
                    type: 'text',
                  },
                },
              ],
            },
            {
              id: 'password-field',
              type: 'Container',
              props: { className: 'space-y-2' },
              children: [
                {
                  id: 'password-label',
                  type: 'Label',
                  props: { htmlFor: 'password' },
                  text: '密码',
                },
                {
                  id: 'password-input',
                  type: 'Input',
                  props: {
                    id: 'password',
                    placeholder: '请输入密码',
                    type: 'password',
                  },
                },
              ],
            },
            {
              id: 'login-button',
              type: 'Button',
              props: {
                className: 'w-full gap-2',
                variant: 'default',
              },
              children: [
                { id: 'login-button-icon', type: 'Icon', props: { name: 'log-in', size: 16 } },
                { id: 'login-button-text', type: 'Text', text: '登录' },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 注册表单案例
 */
const registerFormExample: ExampleMetadata = {
  id: 'system-form-register',
  title: '注册表单',
  description: '用户注册表单，包含用户名、邮箱、密码和确认密码',
  category: 'form',
  tags: ['register', 'card'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'register-form-container',
      type: 'Card',
      props: {
        className: 'w-full max-w-md mx-auto p-6',
      },
      children: [
        {
          id: 'register-title',
          type: 'Text',
          props: { className: 'text-2xl font-bold text-center mb-6' },
          text: '创建账户',
        },
        {
          id: 'register-form',
          type: 'Container',
          props: { className: 'space-y-4' },
          children: [
            {
              id: 'reg-username-field',
              type: 'Container',
              props: { className: 'space-y-2' },
              children: [
                { id: 'reg-username-label', type: 'Label', text: '用户名' },
                { id: 'reg-username-input', type: 'Input', props: { placeholder: '请输入用户名' } },
              ],
            },
            {
              id: 'reg-email-field',
              type: 'Container',
              props: { className: 'space-y-2' },
              children: [
                { id: 'reg-email-label', type: 'Label', text: '邮箱' },
                { id: 'reg-email-input', type: 'Input', props: { placeholder: '请输入邮箱', type: 'email' } },
              ],
            },
            {
              id: 'reg-password-field',
              type: 'Container',
              props: { className: 'space-y-2' },
              children: [
                { id: 'reg-password-label', type: 'Label', text: '密码' },
                { id: 'reg-password-input', type: 'Input', props: { placeholder: '请输入密码', type: 'password' } },
              ],
            },
            {
              id: 'reg-confirm-field',
              type: 'Container',
              props: { className: 'space-y-2' },
              children: [
                { id: 'reg-confirm-label', type: 'Label', text: '确认密码' },
                { id: 'reg-confirm-input', type: 'Input', props: { placeholder: '请再次输入密码', type: 'password' } },
              ],
            },
            {
              id: 'register-button',
              type: 'Button',
              props: { className: 'w-full gap-2', variant: 'default' },
              children: [
                { id: 'register-button-icon', type: 'Icon', props: { name: 'plus', size: 16 } },
                { id: 'register-button-text', type: 'Text', text: '注册' },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 搜索表单案例
 */
const searchFormExample: ExampleMetadata = {
  id: 'system-form-search',
  title: '搜索表单',
  description: '搜索输入框，包含搜索图标和清除按钮',
  category: 'form',
  tags: ['search', 'navbar'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'search-form-container',
      type: 'Container',
      props: {
        className: 'w-full max-w-xl mx-auto',
      },
      children: [
        {
          id: 'search-wrapper',
          type: 'Container',
          props: {
            className: 'flex gap-2',
          },
          children: [
            {
              id: 'search-input',
              type: 'Input',
              props: {
                placeholder: '搜索...',
                className: 'flex-1',
              },
            },
            {
              id: 'search-button',
              type: 'Button',
              props: { variant: 'default', className: 'gap-2' },
              children: [
                { id: 'search-button-icon', type: 'Icon', props: { name: 'search', size: 16 } },
                { id: 'search-button-text', type: 'Text', text: '搜索' },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 设置表单案例
 */
const settingsFormExample: ExampleMetadata = {
  id: 'system-form-settings',
  title: '设置表单',
  description: '用户设置表单，包含个人信息和偏好设置',
  category: 'form',
  tags: ['settings', 'profile', 'admin'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'settings-form-container',
      type: 'Card',
      props: {
        className: 'w-full max-w-2xl mx-auto p-6',
      },
      children: [
        {
          id: 'settings-title',
          type: 'Text',
          props: { className: 'text-2xl font-bold mb-6' },
          text: '账户设置',
        },
        {
          id: 'settings-form',
          type: 'Container',
          props: { className: 'space-y-6' },
          children: [
            {
              id: 'profile-section',
              type: 'Container',
              props: { className: 'space-y-4' },
              children: [
                {
                  id: 'profile-title',
                  type: 'Text',
                  props: { className: 'text-lg font-semibold' },
                  text: '个人信息',
                },
                {
                  id: 'name-field',
                  type: 'Container',
                  props: { className: 'grid grid-cols-2 gap-4' },
                  children: [
                    {
                      id: 'firstname-wrapper',
                      type: 'Container',
                      props: { className: 'space-y-2' },
                      children: [
                        { id: 'firstname-label', type: 'Label', text: '名' },
                        { id: 'firstname-input', type: 'Input', props: { placeholder: '名' } },
                      ],
                    },
                    {
                      id: 'lastname-wrapper',
                      type: 'Container',
                      props: { className: 'space-y-2' },
                      children: [
                        { id: 'lastname-label', type: 'Label', text: '姓' },
                        { id: 'lastname-input', type: 'Input', props: { placeholder: '姓' } },
                      ],
                    },
                  ],
                },
                {
                  id: 'bio-field',
                  type: 'Container',
                  props: { className: 'space-y-2' },
                  children: [
                    { id: 'bio-label', type: 'Label', text: '个人简介' },
                    { id: 'bio-input', type: 'Textarea', props: { placeholder: '介绍一下自己...', rows: 3 } },
                  ],
                },
              ],
            },
            {
              id: 'save-button',
              type: 'Button',
              props: { variant: 'default', className: 'gap-2' },
              children: [
                { id: 'save-button-icon', type: 'Icon', props: { name: 'save', size: 16 } },
                { id: 'save-button-text', type: 'Text', text: '保存设置' },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 可折叠设置面板案例
 * 使用 SettingsPanel、SettingsSection 和各类表单控件组件
 */
const collapsibleSettingsPanelExample: ExampleMetadata = {
  id: 'system-form-collapsible-settings',
  title: '可折叠设置面板',
  description: '使用可折叠分组的设置面板，包含开关、下拉选择、滑块等表单控件',
  category: 'form',
  tags: ['settings', 'collapsible', 'panel', 'switch', 'select', 'slider'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'settings-panel',
      type: 'SettingsPanel',
      props: {
        title: '设置',
        width: 320,
      },
      children: [
        {
          id: 'settings-sections',
          type: 'SettingsSectionGroup',
          children: [
            // 消息设置分组
            {
              id: 'message-settings',
              type: 'SettingsSection',
              props: { title: '消息设置' },
              children: [
                {
                  id: 'show-prompt',
                  type: 'SwitchField',
                  props: {
                    label: '显示提示词',
                    defaultChecked: true,
                  },
                },
                {
                  id: 'use-serif',
                  type: 'SwitchField',
                  props: {
                    label: '使用衬线字体',
                    defaultChecked: false,
                  },
                },
                {
                  id: 'auto-fold-thinking',
                  type: 'SwitchField',
                  props: {
                    label: '思考内容自动折叠',
                    helpText: 'AI 的思考过程会自动折叠，点击可展开查看',
                    defaultChecked: true,
                  },
                },
                {
                  id: 'message-style',
                  type: 'SelectField',
                  props: {
                    label: '消息样式',
                    options: [
                      { value: 'simple', label: '简洁' },
                      { value: 'bubble', label: '气泡' },
                    ],
                    defaultValue: 'simple',
                  },
                },
                {
                  id: 'font-size',
                  type: 'SliderField',
                  props: {
                    label: '消息字体大小',
                    defaultValue: [14],
                    min: 12,
                    max: 24,
                    step: 1,
                    showValue: true,
                    showRangeLabels: true,
                    minLabel: 'A',
                    maxLabel: 'A',
                    centerLabel: '默认',
                  },
                },
              ],
            },
            // 数学公式设置分组
            {
              id: 'math-settings',
              type: 'SettingsSection',
              props: { title: '数学公式设置' },
              children: [
                {
                  id: 'math-engine',
                  type: 'SelectField',
                  props: {
                    label: '数学公式引擎',
                    options: [
                      { value: 'katex', label: 'KaTeX' },
                      { value: 'mathjax', label: 'MathJax' },
                    ],
                    defaultValue: 'katex',
                  },
                },
                {
                  id: 'enable-dollar',
                  type: 'SwitchField',
                  props: {
                    label: '启用 $...$',
                    helpText: '使用单个美元符号包裹行内公式',
                    defaultChecked: true,
                  },
                },
              ],
            },
            // 代码块设置分组
            {
              id: 'code-settings',
              type: 'SettingsSection',
              props: { title: '代码块设置' },
              children: [
                {
                  id: 'code-style',
                  type: 'SelectField',
                  props: {
                    label: '代码风格',
                    options: [
                      { value: 'auto', label: 'auto' },
                      { value: 'dark', label: 'dark' },
                      { value: 'light', label: 'light' },
                    ],
                    defaultValue: 'auto',
                  },
                },
                {
                  id: 'fancy-code',
                  type: 'SwitchField',
                  props: {
                    label: '花式代码块',
                    helpText: '使用更美观的代码块样式',
                    defaultChecked: true,
                  },
                },
                {
                  id: 'code-execution',
                  type: 'SwitchField',
                  props: {
                    label: '代码执行',
                    helpText: '允许在沙箱中执行代码',
                    defaultChecked: false,
                  },
                },
                {
                  id: 'show-line-numbers',
                  type: 'SwitchField',
                  props: {
                    label: '代码显示行号',
                    defaultChecked: false,
                  },
                },
                {
                  id: 'code-collapsible',
                  type: 'SwitchField',
                  props: {
                    label: '代码块可折叠',
                    defaultChecked: false,
                  },
                },
              ],
            },
            // 输入设置分组
            {
              id: 'input-settings',
              type: 'SettingsSection',
              props: { title: '输入设置' },
              children: [
                {
                  id: 'show-token-count',
                  type: 'SwitchField',
                  props: {
                    label: '显示预估 Token 数',
                    defaultChecked: false,
                  },
                },
                {
                  id: 'paste-as-file',
                  type: 'SwitchField',
                  props: {
                    label: '长文本粘贴为文件',
                    defaultChecked: false,
                  },
                },
                {
                  id: 'markdown-input',
                  type: 'SwitchField',
                  props: {
                    label: 'Markdown 渲染输入消息',
                    defaultChecked: false,
                  },
                },
              ],
            },
            // 高级设置分组（默认折叠）
            {
              id: 'advanced-settings',
              type: 'SettingsSection',
              props: { title: '高级设置', defaultOpen: false },
              children: [
                {
                  id: 'api-endpoint',
                  type: 'InputField',
                  props: {
                    label: 'API 端点',
                    placeholder: 'https://api.example.com',
                    inputWidth: '160px',
                  },
                },
                {
                  id: 'timeout',
                  type: 'InputField',
                  props: {
                    label: '超时时间',
                    type: 'number',
                    defaultValue: '30',
                    helpText: '请求超时时间（秒）',
                    inputWidth: '80px',
                  },
                },
                {
                  id: 'temperature',
                  type: 'SliderField',
                  props: {
                    label: '温度参数',
                    defaultValue: [0.7],
                    min: 0,
                    max: 2,
                    step: 0.1,
                    showValue: true,
                  },
                },
                {
                  id: 'max-tokens',
                  type: 'SliderField',
                  props: {
                    label: '最大 Token 数',
                    defaultValue: [2048],
                    min: 256,
                    max: 8192,
                    step: 256,
                    showValue: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
};


// ============================================================================
// Navigation 类别案例
// ============================================================================

/**
 * 面包屑导航案例
 */
const breadcrumbNavExample: ExampleMetadata = {
  id: 'system-navigation-breadcrumb',
  title: '面包屑导航',
  description: '显示当前页面在网站层级结构中的位置',
  category: 'navigation',
  tags: ['breadcrumb', 'navigation'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'breadcrumb-container',
      type: 'Container',
      props: {
        className: 'flex items-center gap-2 text-sm text-muted-foreground',
      },
      children: [
        {
          id: 'breadcrumb-home',
          type: 'Button',
          props: { variant: 'link', className: 'p-0 h-auto gap-1' },
          children: [
            { id: 'breadcrumb-home-icon', type: 'Icon', props: { name: 'home', size: 14 } },
            { id: 'breadcrumb-home-text', type: 'Text', text: '首页' },
          ],
        },
        {
          id: 'breadcrumb-sep-1',
          type: 'Text',
          text: '/',
        },
        {
          id: 'breadcrumb-category',
          type: 'Button',
          props: { variant: 'link', className: 'p-0 h-auto' },
          text: '产品分类',
        },
        {
          id: 'breadcrumb-sep-2',
          type: 'Text',
          text: '/',
        },
        {
          id: 'breadcrumb-current',
          type: 'Text',
          props: { className: 'text-foreground font-medium' },
          text: '当前页面',
        },
      ],
    },
  },
};

/**
 * 标签页导航案例
 */
const tabsNavExample: ExampleMetadata = {
  id: 'system-navigation-tabs',
  title: '标签页导航',
  description: '水平标签页导航，用于在不同内容面板之间切换',
  category: 'navigation',
  tags: ['tabs', 'navigation'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'tabs-container',
      type: 'Container',
      props: {
        className: 'w-full',
      },
      children: [
        {
          id: 'tabs-list',
          type: 'Container',
          props: {
            className: 'flex border-b',
          },
          children: [
            {
              id: 'tab-1',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'rounded-none border-b-2 border-primary px-4 py-2 gap-2',
              },
              children: [
                { id: 'tab-1-icon', type: 'Icon', props: { name: 'layout-dashboard', size: 16 } },
                { id: 'tab-1-text', type: 'Text', text: '概览' },
              ],
            },
            {
              id: 'tab-2',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'rounded-none border-b-2 border-transparent px-4 py-2 gap-2',
              },
              children: [
                { id: 'tab-2-icon', type: 'Icon', props: { name: 'bar-chart', size: 16 } },
                { id: 'tab-2-text', type: 'Text', text: '分析' },
              ],
            },
            {
              id: 'tab-3',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'rounded-none border-b-2 border-transparent px-4 py-2 gap-2',
              },
              children: [
                { id: 'tab-3-icon', type: 'Icon', props: { name: 'file-text', size: 16 } },
                { id: 'tab-3-text', type: 'Text', text: '报告' },
              ],
            },
            {
              id: 'tab-4',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'rounded-none border-b-2 border-transparent px-4 py-2 gap-2',
              },
              children: [
                { id: 'tab-4-icon', type: 'Icon', props: { name: 'settings', size: 16 } },
                { id: 'tab-4-text', type: 'Text', text: '设置' },
              ],
            },
          ],
        },
        {
          id: 'tab-content',
          type: 'Container',
          props: {
            className: 'p-4',
          },
          children: [
            {
              id: 'tab-content-text',
              type: 'Text',
              text: '标签页内容区域',
            },
          ],
        },
      ],
    },
  },
};

/**
 * 步骤导航案例
 */
const stepsNavExample: ExampleMetadata = {
  id: 'system-navigation-steps',
  title: '步骤导航',
  description: '显示多步骤流程的进度，常用于表单向导',
  category: 'navigation',
  tags: ['steps', 'navigation'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'steps-container',
      type: 'Container',
      props: {
        className: 'w-full',
      },
      children: [
        {
          id: 'steps-list',
          type: 'Container',
          props: {
            className: 'flex items-center justify-between',
          },
          children: [
            {
              id: 'step-1',
              type: 'Container',
              props: { className: 'flex items-center gap-2' },
              children: [
                {
                  id: 'step-1-number',
                  type: 'Container',
                  props: {
                    className: 'w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium',
                  },
                  children: [{ id: 'step-1-num-text', type: 'Text', text: '1' }],
                },
                {
                  id: 'step-1-label',
                  type: 'Text',
                  props: { className: 'font-medium' },
                  text: '基本信息',
                },
              ],
            },
            {
              id: 'step-line-1',
              type: 'Container',
              props: { className: 'flex-1 h-0.5 bg-primary mx-4' },
              children: [],
            },
            {
              id: 'step-2',
              type: 'Container',
              props: { className: 'flex items-center gap-2' },
              children: [
                {
                  id: 'step-2-number',
                  type: 'Container',
                  props: {
                    className: 'w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium',
                  },
                  children: [{ id: 'step-2-num-text', type: 'Text', text: '2' }],
                },
                {
                  id: 'step-2-label',
                  type: 'Text',
                  props: { className: 'font-medium' },
                  text: '详细设置',
                },
              ],
            },
            {
              id: 'step-line-2',
              type: 'Container',
              props: { className: 'flex-1 h-0.5 bg-muted mx-4' },
              children: [],
            },
            {
              id: 'step-3',
              type: 'Container',
              props: { className: 'flex items-center gap-2' },
              children: [
                {
                  id: 'step-3-number',
                  type: 'Container',
                  props: {
                    className: 'w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium',
                  },
                  children: [{ id: 'step-3-num-text', type: 'Text', text: '3' }],
                },
                {
                  id: 'step-3-label',
                  type: 'Text',
                  props: { className: 'text-muted-foreground' },
                  text: '完成',
                },
              ],
            },
          ],
        },
      ],
    },
  },
};


// ============================================================================
// Dashboard 类别案例
// ============================================================================

/**
 * 数据卡片组案例
 */
const dataCardsExample: ExampleMetadata = {
  id: 'system-dashboard-data-cards',
  title: '数据卡片组',
  description: '展示关键指标的数据卡片组，常用于仪表盘顶部',
  category: 'dashboard',
  tags: ['card', 'admin', 'dashboard'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'data-cards-container',
      type: 'Container',
      props: {
        className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
      },
      children: [
        {
          id: 'card-revenue',
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              id: 'revenue-header',
              type: 'Container',
              props: { className: 'flex items-center justify-between' },
              children: [
                { id: 'revenue-label', type: 'Text', props: { className: 'text-sm text-muted-foreground' }, text: '总收入' },
                { id: 'revenue-icon', type: 'Icon', props: { name: 'heart', size: 16, className: 'text-muted-foreground' } },
              ],
            },
            { id: 'revenue-value', type: 'Text', props: { className: 'text-2xl font-bold mt-2' }, text: '¥45,231.89' },
            { id: 'revenue-change', type: 'Text', props: { className: 'text-xs text-green-500 mt-1' }, text: '+20.1% 较上月' },
          ],
        },
        {
          id: 'card-users',
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              id: 'users-header',
              type: 'Container',
              props: { className: 'flex items-center justify-between' },
              children: [
                { id: 'users-label', type: 'Text', props: { className: 'text-sm text-muted-foreground' }, text: '用户数' },
                { id: 'users-icon', type: 'Icon', props: { name: 'user', size: 16, className: 'text-muted-foreground' } },
              ],
            },
            { id: 'users-value', type: 'Text', props: { className: 'text-2xl font-bold mt-2' }, text: '2,350' },
            { id: 'users-change', type: 'Text', props: { className: 'text-xs text-green-500 mt-1' }, text: '+180 新用户' },
          ],
        },
        {
          id: 'card-orders',
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              id: 'orders-header',
              type: 'Container',
              props: { className: 'flex items-center justify-between' },
              children: [
                { id: 'orders-label', type: 'Text', props: { className: 'text-sm text-muted-foreground' }, text: '订单数' },
                { id: 'orders-icon', type: 'Icon', props: { name: 'folder', size: 16, className: 'text-muted-foreground' } },
              ],
            },
            { id: 'orders-value', type: 'Text', props: { className: 'text-2xl font-bold mt-2' }, text: '12,234' },
            { id: 'orders-change', type: 'Text', props: { className: 'text-xs text-green-500 mt-1' }, text: '+19% 较上月' },
          ],
        },
        {
          id: 'card-active',
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              id: 'active-header',
              type: 'Container',
              props: { className: 'flex items-center justify-between' },
              children: [
                { id: 'active-label', type: 'Text', props: { className: 'text-sm text-muted-foreground' }, text: '活跃用户' },
                { id: 'active-icon', type: 'Icon', props: { name: 'arrow-up', size: 16, className: 'text-muted-foreground' } },
              ],
            },
            { id: 'active-value', type: 'Text', props: { className: 'text-2xl font-bold mt-2' }, text: '573' },
            { id: 'active-change', type: 'Text', props: { className: 'text-xs text-green-500 mt-1' }, text: '+201 今日' },
          ],
        },
      ],
    },
  },
};

/**
 * 统计面板案例
 */
const statsPanelExample: ExampleMetadata = {
  id: 'system-dashboard-stats-panel',
  title: '统计面板',
  description: '综合统计面板，包含图表占位和数据摘要',
  category: 'dashboard',
  tags: ['card', 'admin', 'dashboard', 'table'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'stats-panel-container',
      type: 'Container',
      props: {
        className: 'space-y-6',
      },
      children: [
        {
          id: 'stats-header',
          type: 'Container',
          props: { className: 'flex items-center justify-between' },
          children: [
            { id: 'stats-title', type: 'Text', props: { className: 'text-2xl font-bold' }, text: '数据概览' },
            {
              id: 'stats-actions',
              type: 'Container',
              props: { className: 'flex gap-2' },
              children: [
                { id: 'btn-export', type: 'Button', props: { variant: 'outline', className: 'gap-2' }, children: [
                  { id: 'btn-export-icon', type: 'Icon', props: { name: 'download', size: 16 } },
                  { id: 'btn-export-text', type: 'Text', text: '导出' },
                ] },
                { id: 'btn-refresh', type: 'Button', props: { variant: 'default', className: 'gap-2' }, children: [
                  { id: 'btn-refresh-icon', type: 'Icon', props: { name: 'refresh', size: 16 } },
                  { id: 'btn-refresh-text', type: 'Text', text: '刷新' },
                ] },
              ],
            },
          ],
        },
        {
          id: 'stats-grid',
          type: 'Container',
          props: { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
          children: [
            {
              id: 'chart-card',
              type: 'Card',
              props: { className: 'p-6' },
              children: [
                { id: 'chart-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: '趋势图' },
                {
                  id: 'chart-placeholder',
                  type: 'Container',
                  props: { className: 'h-64 bg-muted rounded flex items-center justify-center' },
                  children: [
                    { id: 'chart-text', type: 'Text', props: { className: 'text-muted-foreground' }, text: '图表区域' },
                  ],
                },
              ],
            },
            {
              id: 'summary-card',
              type: 'Card',
              props: { className: 'p-6' },
              children: [
                { id: 'summary-title', type: 'Text', props: { className: 'font-semibold mb-4' }, text: '数据摘要' },
                {
                  id: 'summary-list',
                  type: 'Container',
                  props: { className: 'space-y-4' },
                  children: [
                    {
                      id: 'summary-item-1',
                      type: 'Container',
                      props: { className: 'flex justify-between items-center' },
                      children: [
                        { id: 'item-1-label', type: 'Text', props: { className: 'text-muted-foreground' }, text: '总访问量' },
                        { id: 'item-1-value', type: 'Text', props: { className: 'font-medium' }, text: '1,234,567' },
                      ],
                    },
                    {
                      id: 'summary-item-2',
                      type: 'Container',
                      props: { className: 'flex justify-between items-center' },
                      children: [
                        { id: 'item-2-label', type: 'Text', props: { className: 'text-muted-foreground' }, text: '平均停留时间' },
                        { id: 'item-2-value', type: 'Text', props: { className: 'font-medium' }, text: '3m 24s' },
                      ],
                    },
                    {
                      id: 'summary-item-3',
                      type: 'Container',
                      props: { className: 'flex justify-between items-center' },
                      children: [
                        { id: 'item-3-label', type: 'Text', props: { className: 'text-muted-foreground' }, text: '跳出率' },
                        { id: 'item-3-value', type: 'Text', props: { className: 'font-medium' }, text: '42.3%' },
                      ],
                    },
                    {
                      id: 'summary-item-4',
                      type: 'Container',
                      props: { className: 'flex justify-between items-center' },
                      children: [
                        { id: 'item-4-label', type: 'Text', props: { className: 'text-muted-foreground' }, text: '转化率' },
                        { id: 'item-4-value', type: 'Text', props: { className: 'font-medium' }, text: '3.2%' },
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

/**
 * 列表页面案例
 */
const listPageExample: ExampleMetadata = {
  id: 'system-dashboard-list-page',
  title: '列表页面',
  description: '数据列表页面，包含搜索、筛选和表格',
  category: 'dashboard',
  tags: ['table', 'list', 'admin', 'search'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'list-page-container',
      type: 'Container',
      props: {
        className: 'space-y-6',
      },
      children: [
        {
          id: 'list-header',
          type: 'Container',
          props: { className: 'flex items-center justify-between' },
          children: [
            { id: 'list-title', type: 'Text', props: { className: 'text-2xl font-bold' }, text: '用户列表' },
            { id: 'btn-add', type: 'Button', props: { variant: 'default', className: 'gap-2' }, children: [
              { id: 'btn-add-icon', type: 'Icon', props: { name: 'plus', size: 16 } },
              { id: 'btn-add-text', type: 'Text', text: '添加用户' },
            ] },
          ],
        },
        {
          id: 'list-toolbar',
          type: 'Container',
          props: { className: 'flex items-center gap-4' },
          children: [
            {
              id: 'search-wrapper',
              type: 'Container',
              props: { className: 'flex-1 max-w-sm' },
              children: [
                { id: 'search-input', type: 'Input', props: { placeholder: '搜索用户...' } },
              ],
            },
            { id: 'btn-filter', type: 'Button', props: { variant: 'outline', className: 'gap-2' }, children: [
              { id: 'btn-filter-icon', type: 'Icon', props: { name: 'filter', size: 16 } },
              { id: 'btn-filter-text', type: 'Text', text: '筛选' },
            ] },
            { id: 'btn-export', type: 'Button', props: { variant: 'outline', className: 'gap-2' }, children: [
              { id: 'btn-export-icon', type: 'Icon', props: { name: 'download', size: 16 } },
              { id: 'btn-export-text', type: 'Text', text: '导出' },
            ] },
          ],
        },
        {
          id: 'list-table-card',
          type: 'Card',
          children: [
            {
              id: 'list-table',
              type: 'Table',
              children: [
                {
                  id: 'table-header',
                  type: 'TableHeader',
                  children: [
                    {
                      id: 'header-row',
                      type: 'TableRow',
                      children: [
                        { id: 'th-name', type: 'TableHead', props: { className: 'w-[200px]' }, children: [{ id: 'th-name-text', type: 'Text', text: '姓名' }] },
                        { id: 'th-email', type: 'TableHead', children: [{ id: 'th-email-text', type: 'Text', text: '邮箱' }] },
                        { id: 'th-role', type: 'TableHead', children: [{ id: 'th-role-text', type: 'Text', text: '角色' }] },
                        { id: 'th-status', type: 'TableHead', children: [{ id: 'th-status-text', type: 'Text', text: '状态' }] },
                        { id: 'th-actions', type: 'TableHead', props: { className: 'text-right' }, children: [{ id: 'th-actions-text', type: 'Text', text: '操作' }] },
                      ],
                    },
                  ],
                },
                {
                  id: 'table-body',
                  type: 'TableBody',
                  children: [
                    {
                      id: 'row-1',
                      type: 'TableRow',
                      children: [
                        { id: 'td-1-name', type: 'TableCell', props: { className: 'font-medium' }, children: [{ id: 'td-1-name-text', type: 'Text', text: '张三' }] },
                        { id: 'td-1-email', type: 'TableCell', children: [{ id: 'td-1-email-text', type: 'Text', text: 'zhangsan@example.com' }] },
                        { id: 'td-1-role', type: 'TableCell', children: [{ id: 'td-1-role-text', type: 'Text', text: '管理员' }] },
                        { id: 'td-1-status', type: 'TableCell', children: [{ id: 'td-1-status-text', type: 'Text', props: { className: 'text-green-500' }, text: '活跃' }] },
                        { id: 'td-1-actions', type: 'TableCell', props: { className: 'text-right' }, children: [{ id: 'td-1-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'gap-1' }, children: [
                          { id: 'td-1-btn-icon', type: 'Icon', props: { name: 'edit', size: 14 } },
                          { id: 'td-1-btn-text', type: 'Text', text: '编辑' },
                        ] }] },
                      ],
                    },
                    {
                      id: 'row-2',
                      type: 'TableRow',
                      children: [
                        { id: 'td-2-name', type: 'TableCell', props: { className: 'font-medium' }, children: [{ id: 'td-2-name-text', type: 'Text', text: '李四' }] },
                        { id: 'td-2-email', type: 'TableCell', children: [{ id: 'td-2-email-text', type: 'Text', text: 'lisi@example.com' }] },
                        { id: 'td-2-role', type: 'TableCell', children: [{ id: 'td-2-role-text', type: 'Text', text: '用户' }] },
                        { id: 'td-2-status', type: 'TableCell', children: [{ id: 'td-2-status-text', type: 'Text', props: { className: 'text-green-500' }, text: '活跃' }] },
                        { id: 'td-2-actions', type: 'TableCell', props: { className: 'text-right' }, children: [{ id: 'td-2-btn', type: 'Button', props: { variant: 'ghost', size: 'sm', className: 'gap-1' }, children: [
                          { id: 'td-2-btn-icon', type: 'Icon', props: { name: 'edit', size: 14 } },
                          { id: 'td-2-btn-text', type: 'Text', text: '编辑' },
                        ] }] },
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


// ============================================================================
// Display 类别案例
// ============================================================================

/**
 * 产品展示卡片案例
 */
const productCardExample: ExampleMetadata = {
  id: 'system-display-product-card',
  title: '产品展示卡片',
  description: '展示产品图片、标题、价格和购买按钮的产品卡片',
  category: 'display',
  tags: ['card', 'product', 'ecommerce'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'product-card',
      type: 'Card',
      props: { className: 'w-full max-w-sm' },
      children: [
        {
          id: 'product-image',
          type: 'Container',
          props: { className: 'aspect-video bg-muted rounded-t-lg flex items-center justify-center' },
          children: [
            { id: 'image-placeholder', type: 'Text', props: { className: 'text-muted-foreground' }, text: '产品图片' },
          ],
        },
        {
          id: 'product-content',
          type: 'CardContent',
          props: { className: 'p-4' },
          children: [
            {
              id: 'product-category',
              type: 'Badge',
              props: { className: 'w-fit mb-2' },
              text: '新品',
            },
            {
              id: 'product-title',
              type: 'Text',
              props: { className: 'font-semibold text-lg' },
              text: '高级无线耳机',
            },
            {
              id: 'product-description',
              type: 'Text',
              props: { className: 'text-sm text-muted-foreground mt-2' },
              text: '降噪、超长续航、舒适佩戴',
            },
            {
              id: 'product-price',
              type: 'Container',
              props: { className: 'flex items-center gap-2 mt-4' },
              children: [
                { id: 'price-current', type: 'Text', props: { className: 'text-2xl font-bold' }, text: '¥299' },
                { id: 'price-original', type: 'Text', props: { className: 'text-sm text-muted-foreground line-through' }, text: '¥399' },
              ],
            },
          ],
        },
        {
          id: 'product-footer',
          type: 'CardFooter',
          props: { className: 'gap-2' },
          children: [
            { id: 'btn-cart', type: 'Button', props: { variant: 'outline', className: 'flex-1 gap-2' }, children: [
              { id: 'btn-cart-icon', type: 'Icon', props: { name: 'shopping-cart', size: 16 } },
              { id: 'btn-cart-text', type: 'Text', text: '加入购物车' },
            ] },
            { id: 'btn-buy', type: 'Button', props: { className: 'flex-1 gap-2' }, children: [
              { id: 'btn-buy-icon', type: 'Icon', props: { name: 'heart', size: 16 } },
              { id: 'btn-buy-text', type: 'Text', text: '立即购买' },
            ] },
          ],
        },
      ],
    },
  },
};

/**
 * 图片画廊案例
 */
const imageGalleryExample: ExampleMetadata = {
  id: 'system-display-image-gallery',
  title: '图片画廊',
  description: '网格布局的图片展示画廊',
  category: 'display',
  tags: ['gallery', 'image', 'grid'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'gallery-container',
      type: 'Container',
      props: { className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' },
      children: [
        {
          id: 'gallery-item-1',
          type: 'Card',
          props: { className: 'overflow-hidden' },
          children: [
            {
              id: 'gallery-image-1',
              type: 'Container',
              props: { className: 'aspect-square bg-muted' },
              children: [{ id: 'gallery-text-1', type: 'Text', props: { className: 'flex items-center justify-center h-full text-muted-foreground' }, text: '图片 1' }],
            },
          ],
        },
        {
          id: 'gallery-item-2',
          type: 'Card',
          props: { className: 'overflow-hidden' },
          children: [
            {
              id: 'gallery-image-2',
              type: 'Container',
              props: { className: 'aspect-square bg-muted' },
              children: [{ id: 'gallery-text-2', type: 'Text', props: { className: 'flex items-center justify-center h-full text-muted-foreground' }, text: '图片 2' }],
            },
          ],
        },
        {
          id: 'gallery-item-3',
          type: 'Card',
          props: { className: 'overflow-hidden' },
          children: [
            {
              id: 'gallery-image-3',
              type: 'Container',
              props: { className: 'aspect-square bg-muted' },
              children: [{ id: 'gallery-text-3', type: 'Text', props: { className: 'flex items-center justify-center h-full text-muted-foreground' }, text: '图片 3' }],
            },
          ],
        },
        {
          id: 'gallery-item-4',
          type: 'Card',
          props: { className: 'overflow-hidden' },
          children: [
            {
              id: 'gallery-image-4',
              type: 'Container',
              props: { className: 'aspect-square bg-muted' },
              children: [{ id: 'gallery-text-4', type: 'Text', props: { className: 'flex items-center justify-center h-full text-muted-foreground' }, text: '图片 4' }],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 用户资料卡片案例
 */
const userProfileCardExample: ExampleMetadata = {
  id: 'system-display-user-profile-card',
  title: '用户资料卡片',
  description: '展示用户头像、姓名、简介和操作按钮的资料卡片',
  category: 'display',
  tags: ['card', 'avatar', 'profile', 'user'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'profile-card',
      type: 'Card',
      props: { className: 'w-full max-w-sm mx-auto' },
      children: [
        {
          id: 'profile-header',
          type: 'CardHeader',
          props: { className: 'text-center' },
          children: [
            {
              id: 'avatar-wrapper',
              type: 'Container',
              props: { className: 'flex justify-center mb-4' },
              children: [
                {
                  id: 'user-avatar',
                  type: 'Container',
                  props: { className: 'w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center' },
                  children: [
                    { id: 'avatar-text', type: 'Text', props: { className: 'text-2xl font-bold text-white' }, text: 'JD' },
                  ],
                },
              ],
            },
            { id: 'user-name', type: 'CardTitle', children: [{ id: 'name-text', type: 'Text', text: 'John Doe' }] },
            { id: 'user-role', type: 'CardDescription', children: [{ id: 'role-text', type: 'Text', text: '高级前端工程师' }] },
          ],
        },
        {
          id: 'profile-content',
          type: 'CardContent',
          props: { className: 'text-center' },
          children: [
            { id: 'bio', type: 'Text', props: { className: 'text-sm text-muted-foreground' }, text: '热爱编程，专注于 React 和 TypeScript 开发。喜欢分享技术知识和开源项目。' },
            {
              id: 'stats',
              type: 'Container',
              props: { className: 'flex justify-center gap-6 mt-4' },
              children: [
                {
                  id: 'stat-posts',
                  type: 'Container',
                  props: { className: 'text-center' },
                  children: [
                    { id: 'posts-count', type: 'Text', props: { className: 'text-2xl font-bold' }, text: '128' },
                    { id: 'posts-label', type: 'Text', props: { className: 'text-xs text-muted-foreground' }, text: '文章' },
                  ],
                },
                {
                  id: 'stat-followers',
                  type: 'Container',
                  props: { className: 'text-center' },
                  children: [
                    { id: 'followers-count', type: 'Text', props: { className: 'text-2xl font-bold' }, text: '2.4k' },
                    { id: 'followers-label', type: 'Text', props: { className: 'text-xs text-muted-foreground' }, text: '关注者' },
                  ],
                },
                {
                  id: 'stat-following',
                  type: 'Container',
                  props: { className: 'text-center' },
                  children: [
                    { id: 'following-count', type: 'Text', props: { className: 'text-2xl font-bold' }, text: '186' },
                    { id: 'following-label', type: 'Text', props: { className: 'text-xs text-muted-foreground' }, text: '关注中' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'profile-footer',
          type: 'CardFooter',
          props: { className: 'flex gap-2' },
          children: [
            {
              id: 'follow-btn',
              type: 'Button',
              props: { className: 'flex-1 gap-2' },
              children: [
                { id: 'follow-icon', type: 'Icon', props: { name: 'heart', size: 16 } },
                { id: 'follow-text', type: 'Text', text: '关注' },
              ],
            },
            {
              id: 'message-btn',
              type: 'Button',
              props: { variant: 'outline', className: 'flex-1 gap-2' },
              children: [
                { id: 'message-icon', type: 'Icon', props: { name: 'message-circle', size: 16 } },
                { id: 'message-text', type: 'Text', text: '私信' },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * 通知列表案例
 */
const notificationListExample: ExampleMetadata = {
  id: 'system-display-notification-list',
  title: '通知列表',
  description: '展示系统通知的列表，包含不同类型的通知样式',
  category: 'display',
  tags: ['list', 'notification', 'alert', 'feedback'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'notification-container',
      type: 'Container',
      props: { className: 'w-full max-w-md mx-auto space-y-3' },
      children: [
        {
          id: 'notification-success',
          type: 'Container',
          props: { className: 'flex items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50' },
          children: [
            { id: 'success-icon', type: 'Icon', props: { name: 'check', size: 20, className: 'text-green-600 mt-0.5' } },
            {
              id: 'success-content',
              type: 'Container',
              props: { className: 'flex-1' },
              children: [
                { id: 'success-title', type: 'Text', props: { className: 'font-medium text-green-800' }, text: '操作成功' },
                { id: 'success-desc', type: 'Text', props: { className: 'text-sm text-green-700' }, text: '您的更改已成功保存。' },
              ],
            },
            { id: 'success-close', type: 'Button', props: { variant: 'ghost', size: 'icon', className: 'h-6 w-6 text-green-600' }, children: [{ id: 'close-icon-1', type: 'Icon', props: { name: 'x', size: 14 } }] },
          ],
        },
        {
          id: 'notification-warning',
          type: 'Container',
          props: { className: 'flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50' },
          children: [
            { id: 'warning-icon', type: 'Icon', props: { name: 'alert-triangle', size: 20, className: 'text-yellow-600 mt-0.5' } },
            {
              id: 'warning-content',
              type: 'Container',
              props: { className: 'flex-1' },
              children: [
                { id: 'warning-title', type: 'Text', props: { className: 'font-medium text-yellow-800' }, text: '注意' },
                { id: 'warning-desc', type: 'Text', props: { className: 'text-sm text-yellow-700' }, text: '您的会员即将到期，请及时续费。' },
              ],
            },
            { id: 'warning-close', type: 'Button', props: { variant: 'ghost', size: 'icon', className: 'h-6 w-6 text-yellow-600' }, children: [{ id: 'close-icon-2', type: 'Icon', props: { name: 'x', size: 14 } }] },
          ],
        },
        {
          id: 'notification-error',
          type: 'Container',
          props: { className: 'flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50' },
          children: [
            { id: 'error-icon', type: 'Icon', props: { name: 'x', size: 20, className: 'text-red-600 mt-0.5' } },
            {
              id: 'error-content',
              type: 'Container',
              props: { className: 'flex-1' },
              children: [
                { id: 'error-title', type: 'Text', props: { className: 'font-medium text-red-800' }, text: '错误' },
                { id: 'error-desc', type: 'Text', props: { className: 'text-sm text-red-700' }, text: '网络连接失败，请检查您的网络设置。' },
              ],
            },
            { id: 'error-close', type: 'Button', props: { variant: 'ghost', size: 'icon', className: 'h-6 w-6 text-red-600' }, children: [{ id: 'close-icon-3', type: 'Icon', props: { name: 'x', size: 14 } }] },
          ],
        },
      ],
    },
  },
};

// ============================================================================
// Feedback 类别案例
// ============================================================================

/**
 * 加载状态案例
 */
const loadingStateExample: ExampleMetadata = {
  id: 'system-feedback-loading-state',
  title: '加载状态',
  description: '展示各种加载状态的骨架屏和进度条',
  category: 'feedback',
  tags: ['loading', 'skeleton', 'progress', 'feedback'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'loading-container',
      type: 'Container',
      props: { className: 'w-full max-w-md mx-auto space-y-6' },
      children: [
        {
          id: 'card-skeleton',
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              id: 'skeleton-header',
              type: 'Container',
              props: { className: 'flex items-center gap-4 mb-4' },
              children: [
                { id: 'avatar-skeleton', type: 'Skeleton', props: { className: 'h-12 w-12 rounded-full' } },
                {
                  id: 'text-skeleton',
                  type: 'Container',
                  props: { className: 'space-y-2' },
                  children: [
                    { id: 'title-skeleton', type: 'Skeleton', props: { className: 'h-4 w-32' } },
                    { id: 'subtitle-skeleton', type: 'Skeleton', props: { className: 'h-3 w-24' } },
                  ],
                },
              ],
            },
            { id: 'content-skeleton-1', type: 'Skeleton', props: { className: 'h-4 w-full mb-2' } },
            { id: 'content-skeleton-2', type: 'Skeleton', props: { className: 'h-4 w-4/5 mb-2' } },
            { id: 'content-skeleton-3', type: 'Skeleton', props: { className: 'h-4 w-3/5' } },
          ],
        },
        {
          id: 'progress-section',
          type: 'Container',
          props: { className: 'space-y-4' },
          children: [
            { id: 'progress-label', type: 'Text', props: { className: 'text-sm font-medium' }, text: '上传进度' },
            { id: 'progress-bar', type: 'Progress', props: { value: 65, className: 'h-2' } },
            { id: 'progress-text', type: 'Text', props: { className: 'text-xs text-muted-foreground text-right' }, text: '65%' },
          ],
        },
      ],
    },
  },
};

/**
 * 空状态案例
 */
const emptyStateExample: ExampleMetadata = {
  id: 'system-feedback-empty-state',
  title: '空状态',
  description: '当没有数据时显示的空状态提示',
  category: 'feedback',
  tags: ['empty', 'placeholder', 'feedback'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'empty-state-container',
      type: 'Container',
      props: { className: 'w-full max-w-md mx-auto py-12 text-center' },
      children: [
        {
          id: 'empty-icon-wrapper',
          type: 'Container',
          props: { className: 'mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4' },
          children: [
            { id: 'empty-icon', type: 'Icon', props: { name: 'folder', size: 32, className: 'text-muted-foreground' } },
          ],
        },
        { id: 'empty-title', type: 'Text', props: { className: 'text-lg font-semibold mb-2' }, text: '暂无数据' },
        { id: 'empty-desc', type: 'Text', props: { className: 'text-sm text-muted-foreground mb-6' }, text: '您还没有创建任何项目，点击下方按钮开始创建。' },
        {
          id: 'empty-action',
          type: 'Button',
          props: { className: 'gap-2' },
          children: [
            { id: 'action-icon', type: 'Icon', props: { name: 'plus', size: 16 } },
            { id: 'action-text', type: 'Text', text: '创建项目' },
          ],
        },
      ],
    },
  },
};

/**
 * 成功提示案例
 */
const successAlertExample: ExampleMetadata = {
  id: 'system-feedback-success-alert',
  title: '成功提示',
  description: '操作成功的提示信息',
  category: 'feedback',
  tags: ['alert', 'success', 'notification'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'success-alert',
      type: 'Alert',
      props: { className: 'border-green-200 bg-green-50' },
      children: [
        { id: 'success-icon', type: 'Icon', props: { name: 'check-circle', size: 20, className: 'text-green-600' } },
        { id: 'success-title', type: 'Text', props: { className: 'font-medium text-green-800' }, text: '操作成功' },
        { id: 'success-desc', type: 'Text', props: { className: 'text-green-700' }, text: '您的更改已成功保存' },
      ],
    },
  },
};

/**
 * 错误提示案例
 */
const errorAlertExample: ExampleMetadata = {
  id: 'system-feedback-error-alert',
  title: '错误提示',
  description: '操作失败的错误提示信息',
  category: 'feedback',
  tags: ['alert', 'error', 'notification'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'error-alert',
      type: 'Alert',
      props: { variant: 'destructive' },
      children: [
        { id: 'error-icon', type: 'Icon', props: { name: 'alert-circle', size: 20 } },
        { id: 'error-title', type: 'Text', props: { className: 'font-medium' }, text: '操作失败' },
        { id: 'error-desc', type: 'Text', text: '保存时发生错误，请稍后重试' },
      ],
    },
  },
};

/**
 * 确认对话框案例
 */
const confirmDialogExample: ExampleMetadata = {
  id: 'system-feedback-confirm-dialog',
  title: '确认对话框',
  description: '需要用户确认的对话框',
  category: 'feedback',
  tags: ['dialog', 'confirm', 'modal'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'confirm-dialog',
      type: 'AlertDialog',
      props: { open: true },
      children: [
        {
          id: 'confirm-content',
          type: 'AlertDialogContent',
          children: [
            {
              id: 'confirm-header',
              type: 'AlertDialogHeader',
              children: [
                { id: 'confirm-title', type: 'AlertDialogTitle', text: '确认删除' },
                { id: 'confirm-desc', type: 'AlertDialogDescription', text: '此操作无法撤销，确定要删除吗？' },
              ],
            },
            {
              id: 'confirm-footer',
              type: 'AlertDialogFooter',
              children: [
                { id: 'btn-cancel', type: 'AlertDialogCancel', props: { className: 'gap-2' }, children: [
                  { id: 'btn-cancel-icon', type: 'Icon', props: { name: 'x', size: 16 } },
                  { id: 'btn-cancel-text', type: 'Text', text: '取消' },
                ] },
                { id: 'btn-confirm', type: 'AlertDialogAction', props: { className: 'bg-destructive gap-2' }, children: [
                  { id: 'btn-confirm-icon', type: 'Icon', props: { name: 'trash', size: 16 } },
                  { id: 'btn-confirm-text', type: 'Text', text: '删除' },
                ] },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * Toast 通知案例
 */
const toastNotificationExample: ExampleMetadata = {
  id: 'system-feedback-toast-notification',
  title: 'Toast 通知',
  description: '右上角弹出的通知消息',
  category: 'feedback',
  tags: ['toast', 'notification', 'message'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'toast-container',
      type: 'Container',
      props: { className: 'fixed top-4 right-4 z-50 space-y-2' },
      children: [
        {
          id: 'toast-item',
          type: 'Card',
          props: { className: 'w-80 p-4 shadow-lg border-l-4 border-l-green-500' },
          children: [
            {
              id: 'toast-header',
              type: 'Container',
              props: { className: 'flex items-start gap-3' },
              children: [
                { id: 'toast-icon', type: 'Icon', props: { name: 'check-circle', size: 20, className: 'text-green-500' } },
                {
                  id: 'toast-content',
                  type: 'Container',
                  props: { className: 'flex-1' },
                  children: [
                    { id: 'toast-title', type: 'Text', props: { className: 'font-medium' }, text: '成功' },
                    { id: 'toast-desc', type: 'Text', props: { className: 'text-sm text-muted-foreground' }, text: '操作已完成' },
                  ],
                },
                { id: 'toast-close', type: 'Icon', props: { name: 'x', size: 16, className: 'text-muted-foreground cursor-pointer' } },
              ],
            },
          ],
        },
      ],
    },
  },
};

/**
 * Agent 聊天页面案例
 * 
 * 来自 ProxyCast 项目的 AgentChatPage 组件
 * 包含聊天界面、输入框、消息列表等功能
 */
const agentChatPageExample: ExampleMetadata = {
  id: 'system-layout-agent-chat-page',
  title: 'Agent 聊天页面',
  description: 'AI Agent 聊天界面，包含消息列表、输入框、工具栏等功能',
  category: 'layout',
  tags: ['chat', 'agent', 'sidebar', 'input', 'message'],
  source: 'system',
  schema: {
    version: '1.0',
    root: {
      id: 'chat-page',
      type: 'Container',
      props: { className: 'flex h-screen w-full bg-background' },
      children: [
        // 侧边栏
        {
          id: 'sidebar',
          type: 'Container',
          props: { className: 'w-64 border-r border-border bg-card flex flex-col' },
          children: [
            {
              id: 'sidebar-header',
              type: 'Container',
              props: { className: 'p-4 border-b border-border' },
              children: [
                { id: 'logo-text', type: 'Text', props: { className: 'text-xl font-bold' }, text: 'Agent Chat' },
              ],
            },
            {
              id: 'sidebar-content',
              type: 'Container',
              props: { className: 'flex-1 py-4 px-2' },
              children: [
                {
                  id: 'new-chat-btn',
                  type: 'Button',
                  props: { className: 'w-full justify-start gap-2 mb-4' },
                  children: [
                    { id: 'new-chat-icon', type: 'Icon', props: { name: 'plus', size: 16 } },
                    { id: 'new-chat-text', type: 'Text', text: '新建对话' },
                  ],
                },
                {
                  id: 'chat-list',
                  type: 'Container',
                  props: { className: 'space-y-1' },
                  children: [
                    {
                      id: 'chat-item-1',
                      type: 'Button',
                      props: { className: 'w-full justify-start text-left px-3 py-2 rounded-md hover:bg-accent' },
                      children: [
                        { id: 'chat-title-1', type: 'Text', props: { className: 'text-sm' }, text: '对话 1' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // 主内容区
        {
          id: 'main-content',
          type: 'Container',
          props: { className: 'flex-1 flex flex-col min-w-0' },
          children: [
            // 顶部导航栏
            {
              id: 'navbar',
              type: 'Container',
              props: { className: 'h-12 border-b border-border flex items-center justify-between px-4' },
              children: [
                {
                  id: 'navbar-left',
                  type: 'Container',
                  props: { className: 'flex items-center gap-2' },
                  children: [
                    { id: 'toggle-sidebar-btn', type: 'Button', props: { variant: 'ghost', size: 'icon' }, children: [
                      { id: 'toggle-sidebar-icon', type: 'Icon', props: { name: 'menu', size: 20 } },
                    ]},
                    { id: 'current-model', type: 'Text', props: { className: 'text-sm font-medium' }, text: 'GPT-4' },
                  ],
                },
                {
                  id: 'navbar-right',
                  type: 'Container',
                  props: { className: 'flex items-center gap-2' },
                  children: [
                    { id: 'settings-btn', type: 'Button', props: { variant: 'ghost', size: 'icon' }, children: [
                      { id: 'settings-icon', type: 'Icon', props: { name: 'settings', size: 20 } },
                    ]},
                  ],
                },
              ],
            },
            // 消息列表区域
            {
              id: 'message-area',
              type: 'Container',
              props: { className: 'flex-1 overflow-auto' },
              children: [
                {
                  id: 'message-list',
                  type: 'Container',
                  props: { className: 'max-w-3xl mx-auto py-8 space-y-6' },
                  children: [
                    {
                      id: 'user-message',
                      type: 'Container',
                      props: { className: 'flex gap-4' },
                      children: [
                        { id: 'user-avatar', type: 'Avatar', props: { className: 'w-8 h-8' }, children: [
                          { id: 'user-avatar-icon', type: 'Icon', props: { name: 'user', size: 20 } },
                        ]},
                        {
                          id: 'user-message-content',
                          type: 'Container',
                          props: { className: 'flex-1' },
                          children: [
                            { id: 'user-message-text', type: 'Text', props: { className: 'text-sm' }, text: '你好，请帮我分析一下这个问题' },
                          ],
                        },
                      ],
                    },
                    {
                      id: 'assistant-message',
                      type: 'Container',
                      props: { className: 'flex gap-4' },
                      children: [
                        { id: 'assistant-avatar', type: 'Avatar', props: { className: 'w-8 h-8 bg-primary' }, children: [
                          { id: 'assistant-avatar-icon', type: 'Icon', props: { name: 'bot', size: 20, className: 'text-primary-foreground' } },
                        ]},
                        {
                          id: 'assistant-message-content',
                          type: 'Container',
                          props: { className: 'flex-1' },
                          children: [
                            { id: 'assistant-message-text', type: 'Text', props: { className: 'text-sm' }, text: '好的，我来帮你分析这个问题...' },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // 输入区域
            {
              id: 'input-area',
              type: 'Container',
              props: { className: 'p-4 border-t border-border' },
              children: [
                {
                  id: 'input-container',
                  type: 'Container',
                  props: { className: 'max-w-3xl mx-auto' },
                  children: [
                    {
                      id: 'input-wrapper',
                      type: 'Container',
                      props: { className: 'border border-border rounded-2xl bg-zinc-100 dark:bg-zinc-800' },
                      children: [
                        {
                          id: 'input-textarea',
                          type: 'Textarea',
                          props: { 
                            className: 'w-full px-4 py-2 bg-transparent border-none resize-none min-h-[40px]',
                            placeholder: '在这里输入消息... 按 Enter 发送'
                          },
                        },
                        {
                          id: 'input-toolbar',
                          type: 'Container',
                          props: { className: 'flex items-center justify-between px-2 pb-2' },
                          children: [
                            {
                              id: 'input-tools',
                              type: 'Container',
                              props: { className: 'flex items-center gap-1' },
                              children: [
                                { id: 'attach-btn', type: 'Button', props: { variant: 'ghost', size: 'icon', className: 'w-8 h-8' }, children: [
                                  { id: 'attach-icon', type: 'Icon', props: { name: 'paperclip', size: 16 } },
                                ]},
                                { id: 'thinking-btn', type: 'Button', props: { variant: 'ghost', size: 'icon', className: 'w-8 h-8' }, children: [
                                  { id: 'thinking-icon', type: 'Icon', props: { name: 'lightbulb', size: 16 } },
                                ]},
                                { id: 'search-btn', type: 'Button', props: { variant: 'ghost', size: 'icon', className: 'w-8 h-8' }, children: [
                                  { id: 'search-icon', type: 'Icon', props: { name: 'globe', size: 16 } },
                                ]},
                              ],
                            },
                            {
                              id: 'send-btn',
                              type: 'Button',
                              props: { className: 'w-8 h-8 rounded-full bg-primary text-primary-foreground' },
                              children: [
                                { id: 'send-icon', type: 'Icon', props: { name: 'arrow-up', size: 20 } },
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
          ],
        },
      ],
    },
  },
};


// ============================================================================
// 导出
// ============================================================================

/**
 * 所有系统预设案例（仅包含 shadcn-ui 风格案例）
 * 
 * 注意：Cherry Studio 风格案例已移至独立的主题模块
 * @see src/lib/themes/builtin/cherry/examples
 */
export const PRESET_EXAMPLES: ExampleMetadata[] = [
  // Layout 类别
  adminSidebarExample,
  topNavbarExample,
  pcWebHeaderExample,
  threeColumnLayoutExample,
  responsiveContainerExample,
  agentChatPageExample,
  // Navigation 类别
  appSidebarExample,
  breadcrumbNavExample,
  tabsNavExample,
  stepsNavExample,
  // Form 类别
  loginFormExample,
  registerFormExample,
  searchFormExample,
  settingsFormExample,
  collapsibleSettingsPanelExample,
  // Dashboard 类别
  dataCardsExample,
  statsPanelExample,
  listPageExample,
  // Display 类别
  userProfileCardExample,
  notificationListExample,
  productCardExample,
  imageGalleryExample,
  // Feedback 类别
  loadingStateExample,
  emptyStateExample,
  successAlertExample,
  errorAlertExample,
  confirmDialogExample,
  toastNotificationExample,
];

/**
 * 按分类获取预设案例
 * @param category - 案例分类
 * @returns 该分类下的所有预设案例
 */
export function getPresetExamplesByCategory(category: ExampleCategory): ExampleMetadata[] {
  return PRESET_EXAMPLES.filter(example => example.category === category);
}

/**
 * 按 ID 获取预设案例
 * @param id - 案例 ID
 * @returns 匹配的案例，如果不存在则返回 undefined
 */
export function getPresetExampleById(id: string): ExampleMetadata | undefined {
  return PRESET_EXAMPLES.find(example => example.id === id);
}

/**
 * 获取所有预设案例的 ID 列表
 * @returns 所有预设案例的 ID 数组
 */
export function getPresetExampleIds(): string[] {
  return PRESET_EXAMPLES.map(example => example.id);
}

/**
 * 检查预设案例是否使用有效的组件类型
 * @param example - 要检查的案例
 * @param validTypes - 有效的组件类型列表
 * @returns 检查结果，包含是否有效和无效类型列表
 */
export function validatePresetExampleTypes(
  example: ExampleMetadata,
  validTypes: string[]
): { valid: boolean; invalidTypes: string[] } {
  const invalidTypes: string[] = [];
  const validTypesSet = new Set(validTypes.map(t => t.toLowerCase()));
  
  function checkNode(node: { type?: string; children?: unknown[] }): void {
    if (node.type && !validTypesSet.has(node.type.toLowerCase())) {
      if (!invalidTypes.includes(node.type)) {
        invalidTypes.push(node.type);
      }
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        if (child && typeof child === 'object') {
          checkNode(child as { type?: string; children?: unknown[] });
        }
      }
    }
  }
  
  if (example.schema.root) {
    checkNode(example.schema.root as { type?: string; children?: unknown[] });
  }
  
  return {
    valid: invalidTypes.length === 0,
    invalidTypes,
  };
}

// ============================================================================
// 预设案例组成分析初始化
// ============================================================================

import { initializePresetCompositions } from '../../../../examples/example-composition-analyzer';

/**
 * 初始化预设案例的组成分析
 * 在模块加载时自动执行
 */
export function initializePresetExampleCompositions(): void {
  initializePresetCompositions(PRESET_EXAMPLES);
}

// 自动初始化预设案例组成分析
initializePresetExampleCompositions();
