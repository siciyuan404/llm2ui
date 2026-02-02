# Tabs Transfer Picker 穿梭选择器使用指南

## 快速开始

### 1. 访问示例页面

启动开发服务器后，访问：
```
http://localhost:5173/examples/tabs-transfer-picker
```

### 2. 导入组件

```typescript
import { TabsTransferPicker } from '@/components/ui/tabs-transfer-picker'
import type { DimensionData, SelectedElement, GenerationElement } from '@/components/ui/tabs-transfer-picker'
```

## 基础用法

```typescript
import { TabsTransferPicker } from '@/components/ui/tabs-transfer-picker'
import type { DimensionData, SelectedElement } from '@/components/ui/tabs-transfer-picker'

function MyComponent() {
  const [selectedElements, setSelectedElements] = React.useState<SelectedElement[]>([])

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
          label: '文章',
          description: '技术文章和分析',
          dimensionId: 'content-type',
        },
        {
          id: 'tutorial',
          label: '教程',
          description: '操作步骤指南',
          dimensionId: 'content-type',
        },
      ],
    },
  ]

  const handleAddElement = (element: GenerationElement) => {
    setSelectedElements(prev => [...prev, { ...element, order: prev.length }])
  }

  const handleRemoveElement = (id: string) => {
    setSelectedElements(prev => prev.filter(item => item.id !== id))
  }

  const handleReorderElements = (elements: SelectedElement[]) => {
    setSelectedElements(elements)
  }

  return (
    <TabsTransferPicker
      dimensions={dimensions}
      selectedElements={selectedElements}
      onAddElement={handleAddElement}
      onRemoveElement={handleRemoveElement}
      onReorderElements={handleReorderElements}
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
  elements: GenerationElement[]  // 该维度下的要素列表
}
```

### GenerationElement

```typescript
interface GenerationElement {
  id: string           // 要素唯一标识
  label: string        // 要素显示标签
  description?: string  // 要素详细说明
  dimensionId: string  // 所属维度 ID
  icon?: React.ReactNode  // 可选图标
}
```

### SelectedElement

```typescript
interface SelectedElement extends GenerationElement {
  order: number  // 在已选列表中的顺序
}
```

## Props

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| dimensions | DimensionData[] | 是 | - | 维度数据列表 |
| selectedElements | SelectedElement[] | 是 | - | 已选要素列表 |
| onAddElement | (element: GenerationElement) => void | 是 | - | 添加要素回调 |
| onRemoveElement | (id: string) => void | 是 | - | 移除要素回调 |
| onReorderElements | (elements: SelectedElement[]) => void | 是 | - | 重新排序回调 |
| searchPlaceholder | string | 否 | "搜索生成要素..." | 搜索框占位符 |
| selectedTitle | string | 否 | "已选生成组合" | 已选区域标题 |
| emptySelectedText | string | 否 | "暂无选中的生成要素" | 空状态文本 |

## 高级用法

### 生成提示词

将选中的要素组合成结构化的提示词：

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

根据已选要素的顺序计算权重：

```typescript
const calculateWeights = (selectedElements: SelectedElement[]) => {
  const total = selectedElements.length
  return selectedElements.map((el, index) => ({
    ...el,
    weight: (total - index) / total  // 优先级越高，权重越大
  }))
}
```

### 应用约束

根据选中的约束维度动态调整生成参数：

```typescript
const applyConstraints = (selectedElements: SelectedElement[]) => {
  const constraints = selectedElements
    .filter(el => el.dimensionId === 'constraints')
    .reduce((acc, el) => {
      switch(el.id) {
        case 'max-length':
          acc.maxLength = 500
          break
        case 'english-only':
          acc.language = 'en'
          break
        case 'no-code':
          acc.includeCode = false
          break
      }
      return acc
    }, {} as GenerationConfig)
  
  return constraints
}
```

## 设计建议

### 维度分类

建议的维度分类：

1. **内容类型**：定义生成内容的类型（文章、教程、文档等）
2. **表达风格**：控制语言风格（专业、友好、简洁等）
3. **输出结构**：指定输出格式（Markdown、列表、表格等）
4. **约束规则**：设置限制条件（字数、语言、代码等）
5. **参考背景**：提供上下文信息（目标读者、熟练程度等）

### 用户体验

- 每个维度提供清晰的描述说明
- 为要素添加图标增强视觉识别
- 使用次要文本说明要素的影响
- 保持每个维度的要素数量适中（5-10 个）
- 支持搜索功能，方便快速定位

## 文件结构

```
src/components/ui/tabs-transfer-picker/
├── index.ts                          # 导出文件
├── tabs-transfer-picker.tsx          # 主组件
├── types.ts                          # 类型定义
└── README.md                         # 文档

src/components/examples/
├── tabs-transfer-picker-example.tsx  # 示例组件
└── tabs-transfer-picker-page.tsx     # 示例页面
```

## 路由配置

在 `src/main.tsx` 中添加路由（如需独立页面）：

```typescript
const TabsTransferPickerPage = lazy(() => {
  return import('./components/examples/tabs-transfer-picker-page');
});

// 在 Routes 中添加：
<Route path="/examples/tabs-transfer-picker" element={<TabsTransferPickerPage />} />
```

## 依赖组件

- `@radix-ui/react-tabs` - 标签页
- `@radix-ui/react-scroll-area` - 滚动区域
- lucide-react - 图标
- 其他 shadcn/ui 组件（Button, Input, Badge, Card）

## 常见问题

**Q: 如何禁用拖拽排序？**
A: 当前版本不支持禁用拖拽，如需此功能，需要修改组件源码。

**Q: 如何自定义样式？**
A: 通过 `className` prop 传递自定义类名，或修改组件内的 Tailwind 类名。

**Q: 如何实现持久化？**
A: 使用 localStorage 或 sessionStorage 保存 selectedElements：

```typescript
const loadFromStorage = () => {
  const saved = localStorage.getItem('tabs-transfer-picker-selection')
  return saved ? JSON.parse(saved) : []
}

const saveToStorage = (elements: SelectedElement[]) => {
  localStorage.setItem('tabs-transfer-picker-selection', JSON.stringify(elements))
}
```

## 总结

Tabs Transfer Picker 是一个功能强大的三栏穿梭选择器，专为 LLM 交互设计。通过直观的点击和拖拽操作，用户可以精细控制生成内容的各个维度，是 AI 工具和企业级系统中理想的生成配置器组件。
