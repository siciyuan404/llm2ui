# components

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

UI 组件目录，按功能模块划分为 chat（聊天交互）、cherry（Cherry Studio 风格组件）、dev-mode（开发者模式）、editor（编辑器）、layout（布局）、preview（预览面板）、settings（设置）、showcase（组件展示）和 ui（基础 UI 组件）九个子目录。
每个子目录包含相关的 React 组件及其类型定义。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| chat/ | 聊天交互组件：消息气泡、对话历史、聊天界面 |
| cherry/ | Cherry Studio 风格组件：Sidebar、Navbar、Message、Inputbar、Avatar、ModelSelector 等 |
| dev-mode/ | 开发者模式组件：DevModeProvider、DevModeToggle，提供组件轮廓显示和 Alt+点击复制功能 |
| editor/ | 编辑器组件：JSON Schema 编辑器、数据绑定编辑器、图片上传 |
| layout/ | 布局组件：三栏布局、可调整宽度面板、标签栏 |
| preview/ | 预览组件：预览面板、设备选择器、主题切换、错误边界 |
| settings/ | 设置组件：LLM 设置对话框、提供商配置 |
| showcase/ | 组件展示：组件库浏览、搜索筛选、多平台支持 |
| ui/ | 基础 UI 组件：Accordion、Alert、AlertDialog、AspectRatio、Avatar、Badge、Breadcrumb、Button、Card、Checkbox、Collapsible、Command、ContextMenu、Dialog、Drawer、DropdownMenu、HoverCard、Input、Label、Menubar、NavigationMenu、Pagination、Popover、Progress、RadioGroup、Resizable、ScrollArea、Select、Separator、Sheet、Skeleton、Slider、Switch、Table、Tabs、Textarea、Toaster、Toggle、ToggleGroup、Tooltip（shadcn-ui） |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
