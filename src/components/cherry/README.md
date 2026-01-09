# Cherry Studio 风格组件库

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

Cherry Studio 风格 UI 组件库，完全独立于 shadcn-ui，使用 Cherry 自己的设计系统和 CSS 变量。遵循原子设计原则，从基础组件逐步构建复杂组件。

## 设计原则

1. **独立性**: 不依赖 shadcn-ui，使用 Cherry 自己的设计语言
2. **原子设计**: 组件从小到大分为 Atoms → Molecules → Organisms
3. **组合优于继承**: 使用组合模式构建复杂组件
4. **CSS Variables**: 使用 `--cherry-*` CSS 变量实现主题切换
5. **Tailwind First**: 优先使用 Tailwind 类，复杂样式使用 cn() 合并
6. **可访问性**: 遵循 WAI-ARIA 规范

## 文件索引

| 目录名 | 功能描述 |
|--------|----------|
| base/ | **基础组件**：CherryButton、CherryInput、CherryTextarea、CherryCard、CherryLabel、CherrySwitch、CherryBadge（独立于 shadcn-ui） |
| app/ | 应用框架组件：Sidebar 侧边栏、Navbar 顶部导航栏、WindowControls 窗口控制 |
| chat/ | 聊天组件：Message 消息项、Inputbar 输入栏 |
| avatar/ | 头像组件：EmojiAvatar、ModelAvatar、AssistantAvatar |
| buttons/ | 按钮组件：ActionIconButton 图标按钮 |
| selector/ | 选择器组件：ModelSelector 模型选择器 |
| tags/ | 标签组件：VisionTag、ReasoningTag、WebSearchTag、ToolsCallingTag、FreeTag |
| code/ | 代码组件：CodeBlock 代码块、CodeToolbar 代码工具栏 |
| preview/ | 预览组件：MermaidPreview、SvgPreview、GraphvizPreview |
| list/ | 列表组件：VirtualList 虚拟列表、DraggableList 可拖拽列表 |
| popup/ | 弹窗组件：ConfirmDialog、SearchPopup、SelectModelPopup |
| tooltip/ | 提示组件：HelpTooltip、InfoTooltip、WarnTooltip |
| context/ | 上下文组件：ThemeProvider 主题提供者 |

## 使用方式

```tsx
// 导入基础组件
import { CherryButton, CherryInput, CherryCard } from '@/components/cherry/base';

// 导入业务组件
import { Sidebar, Navbar, Message, Inputbar } from '@/components/cherry';
```

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
