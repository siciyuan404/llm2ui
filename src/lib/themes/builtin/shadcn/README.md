# shadcn

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

shadcn-ui 主题包，基于 [shadcn/ui](https://ui.shadcn.com/) 设计系统构建。
提供完整的设计令牌、组件注册、案例预设和提示词模板。

### 核心功能

1. **设计令牌** - 定义颜色、间距、排版、阴影、圆角等视觉样式
2. **组件注册** - 注册所有 shadcn-ui 组件到 ComponentRegistry
3. **图标系统** - 提供统一的图标令牌配置和 Icon 组件
4. **案例预设** - 提供常用 UI 模式的案例定义
5. **提示词模板** - 中英文 LLM 提示词模板

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 模块导出入口，导出 shadcnTheme 主题包 |
| tokens.ts | 设计令牌定义，包含颜色、间距、排版、阴影、圆角、图标等令牌 |
| components.ts | 组件注册，注册所有 shadcn-ui 组件和 Icon 组件（主题级别） |
| examples.ts | 案例预设定义 |
| prompts.ts | LLM 提示词模板 |

## 重要说明

Icon 组件在两个地方注册：
1. `src/lib/core/shadcn-components.ts` - 核心注册表（defaultRegistry），用于渲染
2. `src/lib/themes/builtin/shadcn/components.ts` - 主题注册表，用于主题系统

确保两处的 Icon 组件定义保持同步。

## 设计令牌

### 颜色令牌
- 基础颜色：background, foreground
- 主色系：primary, secondary, accent
- 状态色：destructive, success, warning, info
- 组件色：card, popover, muted, border, ring, input
- 侧边栏：sidebar 系列颜色

### 图标令牌（新增）
```typescript
icon: {
  // 尺寸配置
  sizeXs: 12,      // 超小
  sizeSm: 14,      // 小
  sizeDefault: 16, // 默认
  sizeMd: 20,      // 中等
  sizeLg: 24,      // 大
  sizeXl: 32,      // 超大
  size2xl: 48,     // 特大
  
  // 线条样式
  strokeWidth: 2,        // 默认线宽
  strokeWidthThin: 1.5,  // 细线
  strokeWidthBold: 2.5,  // 粗线
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  
  // 颜色（与主题色对应）
  colorDefault: 'currentColor',
  colorMuted, colorPrimary, colorDestructive,
  colorSuccess, colorWarning, colorInfo
}
```

## Icon 组件

### 可用图标
| 分类 | 图标名称 |
|------|---------|
| general | home, settings, search, user, menu, check, x, plus, minus |
| arrow | arrow-up, arrow-down, arrow-left, arrow-right, chevron-up, chevron-down, chevron-left, chevron-right |
| social | share, heart, thumbs-up, message-circle |
| file | file, folder, download, upload, trash |
| media | image, video, music, play, pause |
| action | edit, copy, save, refresh, filter |
| navigation | external-link, link, log-in, log-out |
| communication | mail, phone, bell, send |

### 使用示例
```json
// 基础用法
{ "type": "Icon", "props": { "name": "home" } }

// 自定义尺寸和颜色
{ "type": "Icon", "props": { "name": "check", "size": "lg", "color": "success" } }

// 自定义线条宽度
{ "type": "Icon", "props": { "name": "x", "size": 20, "color": "destructive", "strokeWidth": "bold" } }

// 添加动画
{ "type": "Icon", "props": { "name": "settings", "className": "animate-spin" } }
```

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
