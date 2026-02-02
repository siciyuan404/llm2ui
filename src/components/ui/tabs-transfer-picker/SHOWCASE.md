# Tabs Transfer Picker - LLM 生成配置器

## 组件概述

Tabs Transfer Picker 是一个面向大语言模型（LLM）的通用生成配置器，通过三栏穿梭选择器的交互方式，让用户可以精确配置生成内容的各个维度。

## 快速开始

### 基础使用

```typescript
import { TabsTransferPicker } from '@/components/ui/tabs-transfer-picker'
import type { DimensionData, SelectedElement, GenerationElement } from '@/components/ui/tabs-transfer-picker'

function App() {
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([])

  const dimensions: DimensionData[] = [
    {
      dimension: {
        id: 'content-type',
        name: '内容类型',
        description: '选择生成内容的类型',
      },
      elements: [
        {
          id: 'article',
          label: '技术文章',
          description: '深度技术分析',
          dimensionId: 'content-type',
        },
      ],
    },
  ]

  return (
    <TabsTransferPicker
      dimensions={dimensions}
      selectedElements={selectedElements}
      onAddElement={(el) => setSelectedElements(prev => [...prev, { ...el, order: prev.length }])}
      onRemoveElement={(id) => setSelectedElements(prev => prev.filter(item => item.id !== id))}
      onReorderElements={setSelectedElements}
    />
  )
}
```

## 数据结构

### DimensionData
```typescript
interface DimensionData {
  dimension: {
    id: string           // 维度唯一标识
    name: string         // 维度显示名称
    description?: string  // 维度说明
  }
  elements: GenerationElement[]
}
```

### GenerationElement
```typescript
interface GenerationElement {
  id: string           // 要素唯一标识
  label: string        // 要素显示标签
  description?: string  // 要素详细说明
  dimensionId: string  // 所属维度 ID
  icon?: React.ReactNode
}
```

### SelectedElement
```typescript
interface SelectedElement extends GenerationElement {
  order: number  // 在已选列表中的顺序
}
```

## LLM 集成

### 生成提示词

```typescript
const generatePrompt = (selectedElements: SelectedElement[], dimensions: DimensionData[]) => {
  const dimensionGroups = selectedElements.reduce((acc, element) => {
    const dimension = dimensions.find(d => d.dimension.id === element.dimensionId)
    const dimensionName = dimension?.dimension.name || '其他'
    
    if (!acc[dimensionName]) acc[dimensionName] = []
    acc[dimensionName].push(element.label)
    return acc
  }, {} as Record<string, string[]>)
  
  let prompt = "请根据以下配置生成内容：\n\n"
  Object.entries(dimensionGroups).forEach(([dimension, items]) => {
    prompt += `${dimension}：${items.join('、')}\n`
  })
  
  return prompt
}
```

### 权重计算

```typescript
const calculateWeights = (selectedElements: SelectedElement[]) => {
  const total = selectedElements.length
  return selectedElements.map((el, index) => ({
    ...el,
    weight: (total - index) / total  // 优先级越高，权重越大
  }))
}
```

## 在 Showcase 中展示

由于 Tabs Transfer Picker 是一个复杂的交互组件，不适合通过简单的 Schema 定义，推荐以下方式在 Component Showcase 中展示：

1. **独立示例页面**：访问 `/examples/tabs-transfer-picker` 查看完整示例
2. **组件库集成**：在 `ExamplesModule` 中添加自定义展示
3. **文档页面**：参考本文档了解详细用法

## 示例维度

### 内容类型
- 技术文章
- 教程指南
- API 文档
- 代码审查
- 案例分析

### 表达风格
- 专业严谨
- 亲切易懂
- 简洁精炼
- 详细说明

### 输出结构
- Markdown
- 列表形式
- 表格形式
- 代码块

### 约束规则
- 字数限制
- 无代码
- 仅英文
- 重点标注

### 参考背景
- 面向初学者
- 面向专家
- 快速参考
- 最佳实践

## 设计原则

1. **维度分类**：按内容类型、风格、结构、约束等维度组织
2. **视觉层次**：使用图标、颜色增强识别度
3. **交互流畅**：拖拽排序、实时反馈
4. **状态保持**：切换维度不丢失已选内容

## 完整示例

访问完整示例页面：`http://localhost:5173/examples/tabs-transfer-picker`

## 文件结构

```
src/components/ui/tabs-transfer-picker/
├── index.ts                          # 导出文件
├── tabs-transfer-picker.tsx          # 主组件
├── types.ts                          # 类型定义
├── README.md                         # LLM 集成文档
└── USAGE.md                          # 使用指南

src/components/examples/
├── tabs-transfer-picker-example.tsx  # 完整示例
└── tabs-transfer-picker-page.tsx     # 示例页面

src/components/showcase/
└── TabsTransferPickerShowcase.tsx    # Showcase 展示
```

## 让 LLM 知道

在提示 LLM 生成 UI 时，可以描述：

```
请创建一个 Tabs Transfer Picker 穿梭选择器，这是一个面向 LLM 的通用生成配置器。

它包含三个区域：
1. 左侧：生成维度切换区，显示不同的生成维度（如内容类型、表达风格等）
2. 中间：可选内容要素区，展示当前维度下的可选生成要素
3. 右侧：已选生成组合区，集中展示已选中的生成要素，支持拖拽排序

用户可以通过这个组件精确配置生成内容的各个维度，然后将选中的要素组合成结构化的提示词传递给 LLM。

关键特性：
- 支持多维度标签页切换
- 支持要素搜索和筛选
- 支持拖拽调整已选要素顺序
- 顺序影响生成结果的权重
- 切换维度时保持已选内容
```

## 技术栈

- React 19
- TypeScript
- Tailwind CSS
- Radix UI (@radix-ui/react-tabs, @radix-ui/react-scroll-area)
- Lucide React (icons)
