# Tabs Transfer Picker 穿梭选择器

## 快速链接

- 📘 **[README.md](./README.md)** - LLM 集成详细文档
- 📖 **[USAGE.md](./USAGE.md)** - 使用指南
- 🎨 **[SHOWCASE.md](./SHOWCASE.md)** - Showcase 集成说明
- 🤖 **[LLM_KNOWLEDGE.md](./LLM_KNOWLEDGE.md)** - 让 LLM 知道这个组件

## 组件概述

Tabs Transfer Picker 是一个面向大语言模型（LLM）的通用生成配置器，通过三栏穿梭选择器的交互方式，让用户可以精确配置生成内容的各个维度。

### 三栏布局

1. **左侧：生成维度切换区**
   - 切换不同的生成维度（如内容类型、表达风格等）
   - 切换维度时保持已选内容不变

2. **中间：可选内容要素区**
   - 浏览当前维度的可选生成要素
   - 支持搜索和快速定位
   - 点击 + 号添加到已选组合

3. **右侧：已选生成组合区**
   - 集中展示已选中的生成要素
   - 支持拖拽调整顺序（影响权重）
   - 点击 × 移除要素

## 快速开始

```typescript
import { TabsTransferPicker } from '@/components/ui/tabs-transfer-picker'
import type { DimensionData, SelectedElement, GenerationElement } from '@/components/ui/tabs-transfer-picker'

const dimensions: DimensionData[] = [
  {
    dimension: { id: 'content-type', name: '内容类型', description: '选择生成内容的类型' },
    elements: [
      { id: 'article', label: '技术文章', description: '深度技术分析', dimensionId: 'content-type' },
    ]
  },
]

const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([])

<TabsTransferPicker
  dimensions={dimensions}
  selectedElements={selectedElements}
  onAddElement={(el) => setSelectedElements(prev => [...prev, { ...el, order: prev.length }])}
  onRemoveElement={(id) => setSelectedElements(prev => prev.filter(item => item.id !== id))}
  onReorderElements={setSelectedElements}
/>
```

## 示例页面

### 独立示例
访问 `/examples/tabs-transfer-picker` 查看完整交互示例，包含：
- 5 个维度（内容类型、表达风格、输出结构、约束规则、参考背景）
- 每个维度 4-5 个要素
- 实时生成提示词功能
- 完整的使用说明

### Component Showcase
在 `/showcase` 的 Navigation 分类中查看 Tabs Transfer Picker。

## 文件结构

```
src/components/ui/tabs-transfer-picker/
├── index.ts                          # 导出文件
├── tabs-transfer-picker.tsx          # 主组件
├── types.ts                          # 类型定义
├── README.md                         # LLM 集成文档
├── USAGE.md                          # 使用指南
├── SHOWCASE.md                       # Showcase 集成说明
└── LLM_KNOWLEDGE.md                  # LLM 知识库

src/components/examples/
├── tabs-transfer-picker-example.tsx  # 完整示例
└── tabs-transfer-picker-page.tsx     # 示例页面

src/components/showcase/
└── TabsTransferPickerShowcase.tsx    # Showcase 展示
```

## 核心特性

✅ **三栏布局**：左侧维度切换、中间可选要素、右侧已选组合  
✅ **拖拽排序**：支持拖拽调整已选要素的优先级  
✅ **搜索功能**：快速定位要素  
✅ **状态保持**：切换维度不影响已选内容  
✅ **完整类型**：TypeScript 类型定义  
✅ **shadcn/ui 风格**：符合设计系统

## 让 LLM 知道

查看 **[LLM_KNOWLEDGE.md](./LLM_KNOWLEDGE.md)** 了解如何向 LLM 描述这个组件。

关键提示词片段：
```
Tabs Transfer Picker 是一个面向 LLM 的通用生成配置器，通过三栏穿梭选择器让用户可视化地配置生成内容的各个维度。
```

## LLM 集成

查看 **[README.md](./README.md)** 了解完整的 LLM 集成方案：

1. 生成提示词
2. 权重计算
3. 约束应用
4. 上下文设置

## 使用场景

- **AI 写作助手**：配置文章类型、写作风格、目标读者等
- **代码生成器**：配置语言、框架、代码风格等
- **内容生成**：配置内容类型、格式、约束条件等
- **参数配置**：可视化地组合和调整复杂参数

## 技术栈

- React 19
- TypeScript
- Tailwind CSS
- Radix UI (@radix-ui/react-tabs, @radix-ui/react-scroll-area)
- Lucide React (icons)
- shadcn/ui 组件

## License

MIT
