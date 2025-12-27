# Requirements Document

## Introduction

组件展示与管理系统（Component Showcase & Management）是 LLM2UI 的核心模块，用于集中管理和展示多平台 UI 组件。系统支持四套组件库：PC Web 端、移动 Web 端、移动原生端、PC 桌面端。通过组件注册表、按需加载 Schema、模板分层、Schema 自动生成和版本化策略，实现组件的高效管理和平滑升级。

## Glossary

- **Component_Showcase**: 组件展示页面，用于展示所有已注册组件的独立页面
- **Component_Card**: 组件卡片，展示单个组件信息和预览的容器
- **Props_Panel**: 属性面板，显示组件可用属性及其类型的区域
- **Live_Preview**: 实时预览，组件的交互式渲染展示
- **Category_Filter**: 分类筛选器，按组件类别过滤显示的功能
- **Component_Registry**: 组件注册表，集中管理所有已注册组件的模块
- **Platform_Adapter**: 平台适配器，处理不同平台组件差异的模块
- **Schema_Generator**: Schema 生成器，自动生成组件 Schema 的工具
- **Component_Version**: 组件版本，用于管理组件升级和兼容性
- **Platform_Type**: 平台类型，包括 pc-web、mobile-web、mobile-native、pc-desktop

## Requirements

### Requirement 1: 组件列表展示

**User Story:** 作为开发者，我希望能够看到所有已注册的 UI 组件列表，以便了解系统支持哪些组件。

#### Acceptance Criteria

1. WHEN 用户访问组件展示页面时，THE Component_Showcase SHALL 从 Component_Registry 获取所有已注册组件
2. THE Component_Showcase SHALL 以卡片形式展示每个组件的名称和描述
3. THE Component_Showcase SHALL 按组件类别（input、layout、display）分组展示
4. WHEN 组件列表为空时，THE Component_Showcase SHALL 显示友好的空状态提示

### Requirement 2: 组件实时预览

**User Story:** 作为开发者，我希望能够看到每个组件的实际渲染效果，以便了解组件的外观。

#### Acceptance Criteria

1. THE Component_Card SHALL 包含组件的实时渲染预览区域
2. WHEN 组件支持多种变体时，THE Live_Preview SHALL 展示所有变体样式
3. THE Live_Preview SHALL 展示组件的默认状态和交互状态（如 hover、disabled）
4. IF 组件渲染失败，THEN THE Component_Card SHALL 显示错误提示而非崩溃

### Requirement 3: 属性文档展示

**User Story:** 作为开发者，我希望能够查看每个组件的可用属性，以便正确使用组件。

#### Acceptance Criteria

1. THE Props_Panel SHALL 显示组件的所有可配置属性
2. THE Props_Panel SHALL 显示每个属性的类型、是否必填、默认值
3. WHEN 属性有枚举值时，THE Props_Panel SHALL 列出所有可选值
4. THE Props_Panel SHALL 显示属性的描述说明

### Requirement 4: 分类筛选功能

**User Story:** 作为开发者，我希望能够按类别筛选组件，以便快速找到需要的组件类型。

#### Acceptance Criteria

1. THE Category_Filter SHALL 提供按类别筛选的选项（全部、input、layout、display）
2. WHEN 用户选择某个类别时，THE Component_Showcase SHALL 仅显示该类别的组件
3. THE Category_Filter SHALL 显示每个类别的组件数量
4. WHEN 筛选结果为空时，THE Component_Showcase SHALL 显示无匹配组件的提示

### Requirement 5: 搜索功能

**User Story:** 作为开发者，我希望能够通过名称搜索组件，以便快速定位特定组件。

#### Acceptance Criteria

1. THE Component_Showcase SHALL 提供组件名称搜索输入框
2. WHEN 用户输入搜索关键词时，THE Component_Showcase SHALL 实时过滤匹配的组件
3. THE 搜索 SHALL 支持模糊匹配组件名称和描述
4. WHEN 搜索无结果时，THE Component_Showcase SHALL 显示无匹配结果的提示

### Requirement 6: 页面导航集成

**User Story:** 作为用户，我希望能够方便地访问组件展示页面，以便随时查看可用组件。

#### Acceptance Criteria

1. THE System SHALL 在主界面提供访问 Component_Showcase 的入口
2. THE Component_Showcase SHALL 支持作为独立路由页面访问
3. WHEN 用户从展示页面返回时，THE System SHALL 保持之前的工作状态

### Requirement 7: 多平台组件支持

**User Story:** 作为开发者，我希望系统支持多个目标平台的组件库，以便为不同平台生成适配的 UI。

#### Acceptance Criteria

1. THE Component_Registry SHALL 支持注册四种平台类型的组件：pc-web、mobile-web、mobile-native、pc-desktop
2. THE Component_Showcase SHALL 提供平台切换选项，展示对应平台的组件
3. WHEN 组件在多个平台都有实现时，THE System SHALL 显示平台差异对比
4. THE Platform_Adapter SHALL 处理不同平台组件的属性映射和样式适配
5. WHEN 某平台缺少特定组件时，THE System SHALL 显示该组件不支持该平台的提示

### Requirement 8: 组件 Schema 管理

**User Story:** 作为开发者，我希望组件 Schema 能够自动生成和按需加载，以减少 token 消耗并保持一致性。

#### Acceptance Criteria

1. THE Schema_Generator SHALL 从组件定义自动生成 A2UI Schema
2. THE System SHALL 支持按需加载组件 Schema，而非一次性加载全部
3. THE Schema SHALL 包含组件的完整属性定义、事件绑定和样式选项
4. WHEN 组件定义更新时，THE Schema_Generator SHALL 自动同步更新 Schema

### Requirement 9: 模板分层系统

**User Story:** 作为开发者，我希望组件模板支持分层复用，以提高可维护性。

#### Acceptance Criteria

1. THE System SHALL 支持基础模板层（Base Template）定义通用组件结构
2. THE System SHALL 支持平台模板层（Platform Template）覆盖平台特定样式
3. THE System SHALL 支持主题模板层（Theme Template）应用不同主题风格
4. WHEN 渲染组件时，THE System SHALL 按 Base → Platform → Theme 顺序合并模板

### Requirement 10: 组件版本管理

**User Story:** 作为开发者，我希望组件支持版本管理，以便平滑升级和保持兼容性。

#### Acceptance Criteria

1. THE Component_Registry SHALL 支持为组件指定版本号
2. THE System SHALL 支持同时注册同一组件的多个版本
3. WHEN 使用旧版本组件时，THE System SHALL 显示升级建议
4. THE System SHALL 提供版本迁移指南，说明版本间的变更
5. THE Component_Showcase SHALL 显示组件的当前版本和可用版本列表


### Requirement 11: 案例模板展示

**User Story:** 作为开发者，我希望能够查看组件的使用案例，以便快速理解组件的实际应用场景。

#### Acceptance Criteria

1. THE Component_Showcase SHALL 提供"案例"标签页，展示组件的典型使用场景
2. THE 案例 SHALL 包含完整的 JSON Schema 代码示例
3. THE 案例 SHALL 支持一键复制 Schema 到剪贴板
4. THE 案例 SHALL 提供"在编辑器中打开"功能，直接加载到主编辑器
5. THE System SHALL 支持用户提交自定义案例模板

### Requirement 12: 图标库管理

**User Story:** 作为开发者，我希望能够浏览和使用系统内置的图标，以便在 UI 中添加图标元素。

#### Acceptance Criteria

1. THE Component_Showcase SHALL 提供"图标"标签页，展示所有可用图标
2. THE 图标库 SHALL 支持按名称搜索图标
3. THE 图标库 SHALL 支持按类别筛选图标（通用、箭头、社交、文件等）
4. WHEN 用户点击图标时，THE System SHALL 复制图标的使用代码
5. THE 图标 SHALL 支持自定义大小和颜色预览

### Requirement 13: NPM 包发布支持

**User Story:** 作为开发者，我希望能够将组件库发布为 NPM 包，以便其他项目可以直接安装使用。

#### Acceptance Criteria

1. THE System SHALL 支持将组件库打包为独立的 NPM 包
2. THE NPM 包 SHALL 提供 JSON Schema 渲染器，支持传入 JSON 直接渲染 UI
3. THE NPM 包 SHALL 支持 Tree-shaking，仅打包使用到的组件
4. THE NPM 包 SHALL 提供 TypeScript 类型定义
5. THE NPM 包 SHALL 提供完整的 README 文档和使用示例

### Requirement 14: JSON 渲染器 SDK

**User Story:** 作为外部项目开发者，我希望能够通过简单的 API 调用，使用 JSON 渲染出完整的 UI。

#### Acceptance Criteria

1. THE SDK SHALL 提供 `render(schema, container)` 方法，将 JSON Schema 渲染到指定容器
2. THE SDK SHALL 提供 `createRenderer(options)` 方法，支持自定义配置
3. THE SDK SHALL 支持注册自定义组件扩展内置组件库
4. THE SDK SHALL 支持事件回调，处理用户交互
5. THE SDK SHALL 提供 React/Vue 组件封装，方便框架集成
6. THE SDK 使用方式 SHALL 类似 amis 低代码框架的 API 风格

### Requirement 15: 组件预览模式

**User Story:** 作为开发者，我希望能够在不同模式下预览组件，以便全面了解组件效果。

#### Acceptance Criteria

1. THE Component_Showcase SHALL 支持"网格视图"和"列表视图"切换
2. THE Component_Showcase SHALL 支持"深色模式"和"浅色模式"预览
3. THE Component_Showcase SHALL 支持"响应式预览"，模拟不同屏幕尺寸
4. THE Component_Showcase SHALL 支持"全屏预览"单个组件
