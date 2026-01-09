# showcase

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

设计系统文档中心，采用模块化架构展示 LLM2UI 系统的设计资源。
包含三大模块：全局样式（Design Tokens）、基础组件库和案例展示。
每个模块都有独立的侧边栏导航和详细内容展示。
支持多屏幕尺寸预览和响应式设计。

### 核心功能

1. **Design Tokens 展示** - 全局样式变量的可视化展示（颜色、间距、字体、阴影、圆角）
2. **组件库文档** - 基础组件的交互式预览、Props 表格、使用示例、Token 映射表格
3. **案例展示** - UI 案例库的分类浏览、实时预览、代码复制、组成分析
4. **多屏幕尺寸预览** - Desktop/Tablet/Mobile 三种尺寸切换
5. **验证反馈 UI** - LLM 生成过程中的验证状态、错误分类、重试进度显示
6. **Token-Component 映射** - 显示组件与 Design Tokens 的映射关系，帮助理解设计系统规范
7. **案例组成分析** - 自动分析案例使用的组件和 Tokens，支持点击导航

### Token-Component-Example 映射增强

本模块集成了 Token-Component-Example 映射功能，建立 Tokens → Components → Examples 的层级关系：

#### ComponentsModule 增强
- **Token Mappings 表格**：显示每个组件 Prop 应该使用哪些 Design Tokens
- **枚举值映射**：显示枚举属性值与 Token 的对应关系（如 Button variant="default" → colors.primary）
- **推荐样式 Tokens**：显示组件推荐使用的颜色和间距 Tokens

#### ExamplesModule 增强
- **组成分析面板**：自动分析案例使用的组件类型和 Design Tokens
- **布局层级描述**：显示组件的嵌套结构（如 Card > Column > [Input, Button]）
- **组件导航**：点击组成分析中的组件可跳转到组件文档
- **Token 引用列表**：显示案例中使用的所有 Token 引用及其使用位置

### 相关核心库模块

- `src/lib/design-tokens.ts` - Design Tokens 定义和格式化
- `src/lib/validation-chain.ts` - 多层验证链
- `src/lib/retry-mechanism.ts` - 智能重试机制
- `src/lib/constraint-injector.ts` - LLM 约束注入器（含 Token 使用指南、组成模式）
- `src/lib/token-usage-registry.ts` - Token 使用映射注册表（定义 Token 在哪些组件中可用）
- `src/lib/component-mapping-registry.ts` - 组件 Token 映射注册表（定义组件 Prop 与 Token 的映射）
- `src/lib/example-composition-analyzer.ts` - 案例组成分析器（分析案例使用的组件和 Tokens）
- `src/lib/token-compliance-validator.ts` - Token 合规验证器（检测硬编码值、生成建议）

## 路由配置

组件展示页面通过 React Router 配置为独立路由：
- 基础路径: `/showcase` - 默认显示 Tokens 模块
- Tokens 模块: `/showcase/tokens` - 设计令牌展示
- Components 模块: `/showcase/components` - 组件库文档
- Examples 模块: `/showcase/examples` - UI 案例展示
- Themes 模块: `/showcase/themes` - 主题市场
- 主界面入口: 顶部导航栏"组件库"链接
- 返回主界面: 头部"返回"链接

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 模块导出入口，汇总所有组件和类型 |
| ComponentShowcase.tsx | 主展示页面，设计系统文档中心，包含模块切换 Tabs（Tokens/Components/Examples）、集成三个展示模块、支持 URL 路由同步 |
| ComponentList.tsx | 组件列表展示，支持网格/列表视图切换和空状态处理 |
| ComponentCard.tsx | 组件卡片，展示单个组件信息和预览，支持网格/列表两种视图模式 |
| CategoryFilter.tsx | 分类筛选器，按组件类别过滤显示 |
| SearchInput.tsx | 搜索输入框，支持实时搜索和防抖 |
| PlatformSwitcher.tsx | 平台切换器，支持四种平台类型筛选 |
| LivePreview.tsx | 实时预览组件，渲染组件定义为交互式预览，支持响应式尺寸 |
| PropsPanel.tsx | 属性面板，显示组件可配置属性及其类型、必填状态、默认值、枚举值和描述，集成版本选择器 |
| ExamplesTab.tsx | 案例展示标签页，显示组件使用案例、JSON Schema 代码、复制和编辑器打开功能、版本迁移指南 |
| IconLibrary.tsx | 图标库展示页面，网格展示所有图标，支持搜索、分类筛选、大小/颜色预览、点击复制 |
| ResponsivePreviewSelector.tsx | 响应式预览选择器，支持桌面/平板/手机三种预览尺寸切换 |
| ScreenSizeSwitcher.tsx | 屏幕尺寸切换器，支持 URL 持久化的响应式预览尺寸切换（Desktop ≥1024px、Tablet 768-1023px、Mobile <768px） |
| FullscreenPreview.tsx | 全屏预览模态框，支持组件全屏预览、主题切换、响应式尺寸选择 |
| VersionSelector.tsx | 版本选择器，显示当前版本和可用版本列表，支持版本切换 |
| UpgradeAlert.tsx | 升级提示组件，显示版本升级建议和废弃警告 |
| CustomExampleForm.tsx | 自定义案例提交表单，支持输入标题、描述、JSON Schema，带实时预览和验证 |
| PlatformComparison.tsx | 平台差异对比组件，并排显示同一组件在不同平台的预览，高亮显示属性/样式/事件差异 |
| SidebarNav.tsx | 通用侧边栏导航组件，支持分类折叠/展开、搜索过滤、项目数量徽章、URL 路由同步、移动端抽屉模式 |
| TokensModule.tsx | 全局样式展示模块，展示 Design Tokens（Icons、Typography、Colors、Spacing、Shadows、Border Radius），支持 Tooltip 显示使用示例代码和点击复制功能 |
| ComponentsModule.tsx | 基础组件展示模块，展示组件库中的所有组件，包含分类侧边栏、组件文档（Header、Preview、Usage、Props、Token Mappings）、变体切换功能、Props 表格（枚举徽章、复杂类型展开）、Token 映射表格（显示每个 Prop 应该使用哪些 Tokens） |
| ExamplesModule.tsx | 案例展示模块，展示 UI 案例库，包含分类侧边栏、案例文档（预览、组成分析、代码、编辑器打开），支持系统预设案例和用户自定义案例，组成分析显示使用的组件和 Tokens，支持点击组件导航到组件文档 |
| ValidationFeedback.tsx | 验证结果反馈 UI 组件，显示 LLM 生成过程中的验证状态、错误分类、重试进度、JSON 错误高亮和自动修复建议 |
| ThemeSwitcher.tsx | 主题切换器组件，显示当前主题名称和图标，下拉菜单展示所有可用主题 |
| ThemeCard.tsx | 主题卡片组件，显示主题名称、描述、预览图，显示安装/卸载按钮 |
| ThemePreview.tsx | 主题预览组件，显示主题的配色方案、设计令牌、组件示例 |
| ThemeMarketplace.tsx | 主题市场页面，展示所有可用主题，支持按类别筛选和搜索，安装/卸载主题 |
| SidebarNav.test.tsx | SidebarNav 组件的属性测试，验证 URL 同步往返和搜索过滤正确性 |
| ComponentsModule.test.tsx | ComponentsModule 组件的属性测试，验证组件注册表同步（Property 7: 已注册组件启用，未注册组件显示 "Coming Soon"） |
| ScreenSizeSwitcher.test.tsx | ScreenSizeSwitcher 组件的属性测试，验证屏幕尺寸 URL 持久化（Property 9: 尺寸选择更新 URL、导航时保持尺寸选择） |
| ExamplesModule.test.tsx | ExamplesModule 组件的属性测试，验证案例数据源同步（Property 12: 案例存在于 preset-examples.ts 或 custom-examples-storage，显示数据与源数据匹配） |

## 组件说明

### ComponentShowcase
主展示页面组件，设计系统文档中心。
- 头部导航栏：返回链接、标题、模块切换 Tabs、屏幕尺寸切换器、主题切换
- 模块切换 Tabs：Tokens（设计令牌）、Components（组件库）、Examples（案例展示）、Themes（主题市场）
- 集成四个展示模块：TokensModule、ComponentsModule、ExamplesModule、ThemeMarketplace
- 主题系统集成：订阅主题变化，将当前主题的 tokens、components、examples 数据传递给各模块
- URL 路由同步：支持 /showcase/tokens、/showcase/components、/showcase/examples、/showcase/themes
- 屏幕尺寸持久化：通过 URL query parameter 保持尺寸选择
- 支持"在编辑器中打开"功能，将 Schema 传递到主编辑器

### ComponentList
组件列表展示组件，支持：
- 网格视图（Grid View）
- 列表视图（List View）
- 深色/浅色主题预览
- 空状态提示（根据上下文显示不同消息）
  - 无注册组件时显示注册提示
  - 搜索无结果时显示搜索建议
  - 分类筛选无结果时显示分类提示
  - 其他筛选无结果时显示清除筛选按钮
- 组件选择交互
- 变体/状态切换控制（可通过 showStateControls 属性控制）

### ComponentCard
组件卡片组件，支持：
- 网格视图卡片（带预览区域和状态切换）
- 列表视图行（紧凑布局和状态切换）
- 深色/浅色主题预览
- Error Boundary 错误处理（渲染失败时显示友好提示和重试按钮）
- 废弃组件标识
- 键盘导航支持
- 选中状态显示
- 自定义预览渲染器
- 变体/状态切换（默认、悬停、禁用、聚焦、激活）

### CategoryFilter
分类筛选器组件，支持：
- 显示所有分类选项
- 显示每个分类的组件数量
- 单选筛选模式

### SearchInput
搜索输入组件，支持：
- 实时搜索过滤
- 可选防抖延迟
- 清除按钮
- Escape 键清除

### PlatformSwitcher
平台切换器组件，支持：
- 四种平台类型（PC Web、Mobile Web、Mobile Native、PC Desktop）
- 全部平台选项
- 平台图标显示

### LivePreview
实时预览组件，支持：
- 使用 UIRenderer 实时渲染组件
- 多种预览状态（默认、悬停、禁用、聚焦、激活）
- 深色/浅色主题切换预览
- 响应式预览尺寸（桌面、平板、手机）
- 状态控制按钮切换
- ErrorBoundary 错误处理
- 组件示例预览（ExamplePreview）
- 变体对比预览（VariantPreview）

### ResponsivePreviewSelector
响应式预览选择器组件，支持：
- 三种预览尺寸（桌面 1280px、平板 768px、手机 375px）
- 设备图标显示
- 尺寸描述提示
- 键盘导航支持
- 禁用状态

### ScreenSizeSwitcher
屏幕尺寸切换器组件（带 URL 持久化），支持：
- 三种屏幕尺寸：Desktop（≥1024px）、Tablet（768-1023px）、Mobile（<768px）
- 设备图标显示（显示器、平板、手机）
- URL query parameter 持久化（?size=tablet）
- 导航时保持尺寸选择
- 受控和非受控模式
- useScreenSize Hook 用于自定义集成
- 辅助函数：getScreenSizeConfig、getScreenSizeDimensions、parseScreenSizeFromUrl
- 键盘导航和焦点管理
- 禁用状态支持

### FullscreenPreview
全屏预览模态框组件，支持：
- Portal 渲染确保正确的 z-index 层叠
- 深色/浅色主题切换
- 响应式尺寸选择（桌面、平板、手机）
- 键盘导航（Escape 键关闭）
- 点击背景关闭
- 组件信息头部显示
- 状态控制（默认、悬停、禁用等）
- 防止背景滚动

### PropsPanel
属性面板组件，支持：
- 显示组件所有可配置属性
- 显示属性类型（带颜色标识）
- 显示必填/可选状态
- 显示默认值
- 显示枚举值列表（针对 string 类型）
- 显示属性描述说明
- 属性排序（必填优先，然后按字母排序）
- 空状态提示（无属性时）
- 版本选择器（显示当前版本和可用版本列表）

### VersionSelector
版本选择器组件，支持：
- 显示当前组件版本
- 下拉选择可用版本列表
- 高亮显示最新版本
- 选中版本显示勾选标记
- 键盘导航支持（Escape 关闭、Enter/Space 打开）
- 单版本时显示为简单徽章
- 支持禁用状态
- 两种尺寸（sm/md）

### UpgradeAlert
升级提示组件，支持：
- 显示废弃警告（当组件 deprecated 为 true 时）
- 显示废弃消息（deprecationMessage）
- 显示版本升级建议（当有更新版本可用时）
- 显示当前版本和最新版本对比
- 提供升级按钮回调
- 紧凑模式（compact）适用于空间受限场景
- 集成到 PropsPanel 和 DetailPanel 中

### ExamplesTab
案例展示标签页组件，支持：
- 显示组件所有使用案例
- 每个案例包含标题、描述和实时预览
- JSON Schema 代码展示（可折叠）
- 一键复制 Schema 到剪贴板（带状态反馈）
- "在编辑器中打开"功能（通过 sessionStorage 传递 Schema）
- 空状态提示（无案例时）
- 版本迁移指南（显示版本变更说明）
  - 显示当前版本和可用版本列表
  - 显示版本变更类型（破坏性变更、新功能、修复、废弃）
  - 提供迁移提示和建议
- 用户自定义案例（Requirements 11.5）
  - 区分系统案例和用户案例（不同颜色标识）
  - 系统案例显示蓝色徽章，用户案例显示紫色徽章
  - 支持添加自定义案例（通过 CustomExampleForm）
  - 支持删除用户自定义案例（带确认对话框）
  - 自定义案例存储在 localStorage 中

### IconLibrary
图标库展示组件，支持：
- 网格展示所有可用图标
- 按名称和标签搜索图标
- 按分类筛选图标（通用、箭头、社交、文件、媒体、操作、导航、通讯）
- 图标大小预览（16px、24px、32px、48px）
- 图标颜色预览（默认、黑色、白色、蓝色、绿色、红色、橙色、紫色）
- 点击图标复制使用代码
- 复制成功状态反馈
- 悬停显示图标标签

### CustomExampleForm
自定义案例提交表单组件，支持：
- 标题输入（必填，2-100 字符）
- 描述输入（可选，最多 500 字符）
- JSON Schema 编辑器（带语法验证）
- 实时预览 Schema 渲染效果
- 表单验证和错误提示
- JSON 自动格式化（失焦时）
- 提交和取消操作
- 字符计数显示

### PlatformComparison
平台差异对比组件，支持：
- 并排显示同一组件在四个平台的预览（PC Web、Mobile Web、Mobile Native、PC Desktop）
- 显示每个平台的支持状态（支持/不支持）
- 两种视图模式切换：
  - 预览对比模式：点击平台卡片查看与 PC Web 的详细差异对比
  - 差异表格模式：显示所有平台的属性/样式/事件支持对比表格
- 属性支持对比：
  - 显示组件所有属性在各平台的支持状态
  - 显示属性重命名映射（如 onClick → onPress）
  - 高亮显示有差异的属性行
- 样式支持对比：
  - 显示常用样式属性在各平台的支持状态
  - 显示样式属性重命名映射
  - 高亮显示有差异的样式行
- 事件支持对比：
  - 显示常用事件在各平台的支持状态
  - 显示事件重命名映射（如 onClick → onTap）
  - 高亮显示有差异的事件行
- 差异筛选：可选择仅显示有差异的项目
- 差异类型颜色标识：
  - 绿色圆圈：支持
  - 红色圆圈：不支持
  - 黄色圆点：有差异
  - 黄色箭头文字：属性重命名
- 兼容性状态汇总（完全兼容/N 项差异）
- 图例说明各种标识含义
- 深色/浅色主题支持

### SidebarNav
通用侧边栏导航组件，支持：
- 分层分类结构（父子项目）
- 分类折叠/展开切换
- 每个分类显示项目数量徽章
- 实时搜索过滤功能
- 当前选中项高亮显示
- 移动端抽屉模式（响应式）
- URL 路由同步（useSearchParams）
- 页面加载时自动选中并滚动到对应项目

### TokensModule
全局样式展示模块，支持：
- 侧边栏导航切换 Token 类别
- Icons 展示：
  - 图标网格布局
  - 多尺寸预览（16px、24px、32px）
  - 按分类分组显示
  - 搜索过滤功能
  - 点击复制图标名称
- Typography 展示：
  - 字体样例（font-family）
  - 字号刻度（font-size）
  - 字重样例（font-weight）
  - 行高样例（line-height）
- Colors 展示：
  - 按语义分组的色板（primary、secondary、neutral、success、warning、error）
  - 显示 hex 和 rgb 值
  - 11 级色阶展示
- Spacing 展示：
  - 可视化间距刻度
  - 像素值和 token 名称
  - 视觉比例图
- Shadows 展示：
  - 卡片阴影示例
  - CSS 值显示
- Border Radius 展示：
  - 圆角形状示例
  - 像素值显示
- 通用功能：
  - Hover 显示使用示例代码 Tooltip
  - 点击复制值到剪贴板（带视觉反馈）

### ComponentsModule
基础组件展示模块，支持：
- 组件分类侧边栏：
  - 从 ComponentRegistry 动态生成分类
  - 使用 lucide-react 图标（LayoutGrid、Type、FormInput、Navigation、Sparkles、MessageSquare、BarChart3、Layers、Package）
  - 丰富的分类：Layout、Text & Media、Form & Input、Navigation、Decoration、Feedback、Data Display、Overlay、Other
  - 分类折叠/展开切换
  - 显示已注册/总数量徽章
  - 未注册组件显示 "Coming Soon" 徽章并禁用
  - 组件简短描述显示
- 组件文档展示（ComponentDoc）：
  - Header 区域：组件名称、描述、支持的屏幕尺寸徽章、废弃警告
  - Preview 区域：交互式组件预览、变体切换功能、响应式尺寸切换（使用 lucide-react 图标：Monitor、Tablet、Smartphone）
  - Usage 区域：JSON Schema 代码块、语法高亮、一键复制、在编辑器中打开
  - Props 区域：属性表格、类型徽章、枚举值徽章、复杂类型展开、必填标识
  - Token Mappings 区域：显示每个 Prop 应该使用哪些 Design Tokens、枚举值与 Token 的映射、推荐的样式 Tokens
- 变体切换功能：
  - 自动检测组件的枚举类型属性
  - 提供变体切换按钮
  - 实时更新预览
- Props 表格：
  - 显示属性名称、描述、类型、默认值
  - 枚举值显示为内联徽章
  - 复杂类型（object/array）支持展开查看定义
  - 必填属性优先排序
- Token 映射表格：
  - 显示 Prop 名称、Token 类别、描述
  - 枚举值与 Token 的映射关系（可展开）
  - 推荐的样式 Tokens（颜色、间距）
- 屏幕尺寸切换：
  - Desktop（100%）、Tablet（768px）、Mobile（375px）
  - 预览容器自动调整尺寸

### ExamplesModule
案例展示模块，支持：
- 案例分类侧边栏：
  - 按分类分组显示案例（Layout、Form、Navigation、Dashboard、Display、Feedback）
  - 使用 lucide-react 图标（LayoutGrid、FormInput、Navigation、LayoutDashboard、Image、MessageSquare）
  - 分类折叠/展开切换
  - 显示每个分类的案例数量
  - 区分系统预设案例和用户自定义案例（紫色徽章标识）
- 案例文档展示（ExampleDoc）：
  - Header 区域：案例标题、描述、分类标签、标签列表、屏幕尺寸徽章
  - Preview 区域：实时预览、响应式尺寸切换（使用 lucide-react 图标：Monitor、Tablet、Smartphone）
  - Composition Analysis 区域：显示使用的组件（可点击导航）、使用的 Tokens（按类别分组）、布局层级、组成说明
  - Code 区域：JSON Schema 代码块、语法高亮、一键复制、在编辑器中打开
- 组成分析功能：
  - 自动分析案例使用的组件类型
  - 自动检测使用的 Design Tokens
  - 生成布局层级描述
  - 点击组件可导航到组件文档
- 数据源同步：
  - 从 preset-examples.ts 加载系统预设案例
  - 从 custom-examples-storage 加载用户自定义案例
  - 自动合并两个数据源
- 屏幕尺寸切换：
  - Desktop（100%）、Tablet（768px）、Mobile（375px）
  - 预览容器自动调整尺寸

### ValidationFeedback
验证结果反馈 UI 组件，支持：
- 生成状态显示：
  - 加载状态（LoadingState）：显示 "Generating..."、"Validating..."、"Retrying..." 消息
  - 成功状态（SuccessState）：显示生成时间（如 "Generated in 2.3s"）
  - 错误状态（ErrorState）：显示错误和警告数量
- 重试进度显示（RetryProgress）：
  - 显示当前尝试次数和总次数（如 "Attempt 2/3"）
  - 显示剩余错误数量
  - 显示已修复的错误数量
  - 进度条可视化
- 错误列表（ErrorList）：
  - 按类别分组显示错误（JSON Syntax、Schema Structure、Component、Props、Style Compliance）
  - 可折叠的错误类别组
  - 每个错误显示消息、路径、行号/列号
  - 已修复的错误显示删除线样式
  - "Apply Suggestion" 按钮用于有自动修复建议的错误
  - "Copy Error Report" 按钮复制格式化的错误报告
- JSON 错误高亮（JsonErrorHighlight）：
  - 显示带行号的 JSON 代码
  - 高亮显示有错误的行
  - 行内显示错误消息
  - 悬停显示完整错误信息
- 辅助函数：
  - categorizeError：根据验证层分类错误
  - getCategoryDisplayName：获取类别显示名称
  - groupErrorsByCategory：按类别分组错误
  - formatErrorReport：格式化错误报告为文本

## 状态管理

`ShowcaseState` 接口定义了展示页面的完整状态：
- `activeModule`: 当前激活的模块（tokens/components/examples）
- `activeItemId`: 当前选中的项目 ID
- `screenSize`: 屏幕尺寸（desktop/tablet/mobile）
- `theme`: 主题（light/dark）

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
