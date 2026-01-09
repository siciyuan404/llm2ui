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
        className: 'w-64 h-screen bg-slate-900 text-white flex flex-col',
      },
      children: [
        {
          id: 'sidebar-header',
          type: 'Container',
          props: {
            className: 'p-4 border-b border-slate-700',
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
                className: 'w-full justify-start text-white hover:bg-slate-800 gap-2',
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
                className: 'w-full justify-start text-white hover:bg-slate-800 gap-2',
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
                className: 'w-full justify-start text-white hover:bg-slate-800 gap-2',
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
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                      },
                      text: '首页',
                    },
                    {
                      id: 'nav-products',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                      },
                      text: '产品',
                    },
                    {
                      id: 'nav-solutions',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                      },
                      text: '解决方案',
                    },
                    {
                      id: 'nav-pricing',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                      },
                      text: '定价',
                    },
                    {
                      id: 'nav-docs',
                      type: 'Button',
                      props: {
                        variant: 'ghost',
                        className: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                      },
                      text: '文档',
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
          props: { variant: 'link', className: 'p-0 h-auto' },
          text: '首页',
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
                className: 'rounded-none border-b-2 border-primary px-4 py-2',
              },
              text: '概览',
            },
            {
              id: 'tab-2',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'rounded-none border-b-2 border-transparent px-4 py-2',
              },
              text: '分析',
            },
            {
              id: 'tab-3',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'rounded-none border-b-2 border-transparent px-4 py-2',
              },
              text: '报告',
            },
            {
              id: 'tab-4',
              type: 'Button',
              props: {
                variant: 'ghost',
                className: 'rounded-none border-b-2 border-transparent px-4 py-2',
              },
              text: '设置',
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
            { id: 'follow-btn', type: 'Button', props: { className: 'flex-1' }, text: '关注' },
            { id: 'message-btn', type: 'Button', props: { variant: 'outline', className: 'flex-1' }, text: '私信' },
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
  // Form 类别
  loginFormExample,
  registerFormExample,
  searchFormExample,
  settingsFormExample,
  // Navigation 类别
  breadcrumbNavExample,
  tabsNavExample,
  stepsNavExample,
  // Dashboard 类别
  dataCardsExample,
  statsPanelExample,
  listPageExample,
  // Display 类别
  userProfileCardExample,
  notificationListExample,
  // Feedback 类别
  loadingStateExample,
  emptyStateExample,
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
