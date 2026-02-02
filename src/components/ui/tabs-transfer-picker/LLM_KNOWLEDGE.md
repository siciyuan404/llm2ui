# 让 LLM 知道 Tabs Transfer Picker 组件

## 组件描述

Tabs Transfer Picker 是一个面向大语言模型（LLM）的通用生成配置器，通过三栏穿梭选择器的交互方式，让用户可以精确配置生成内容的各个维度。

## LLM 提示词模板

当需要 LLM 生成或使用 Tabs Transfer Picker 时，可以使用以下提示词模板：

### 基础描述

```
我需要使用 Tabs Transfer Picker 组件，这是一个面向 LLM 的通用生成配置器。

它是一个三栏穿梭选择器，包含：
1. 左侧区域：生成维度切换区
   - 显示不同的生成维度（如内容类型、表达风格、输出结构、约束规则、参考背景等）
   - 用户点击切换维度
   - 切换维度时不会影响已选内容

2. 中间区域：可选内容要素区
   - 展示当前维度下的可选生成要素
   - 每个要素包含：标签、描述、可选图标
   - 支持搜索和快速定位
   - 用户点击 + 号添加到已选组合

3. 右侧区域：已选生成组合区
   - 集中展示已选中的生成要素
   - 支持拖拽调整顺序
   - 顺序影响生成结果的优先级或权重
   - 可以点击 × 移除要素

使用场景：组合和约束生成内容，然后将选中的要素组合成提示词传递给 LLM。
```

### 技术细节

```
Tabs Transfer Picker 组件的技术细节：

类型定义：
- DimensionData: 维度数据，包含 dimension 和 elements
- GenerationElement: 可选要素，包含 id、label、description、dimensionId、icon
- SelectedElement: 已选要素，继承自 GenerationElement，额外包含 order

主要属性：
- dimensions: DimensionData[] - 维度数据列表
- selectedElements: SelectedElement[] - 已选要素列表
- onAddElement: (element: GenerationElement) => void - 添加要素回调
- onRemoveElement: (id: string) => void - 移除要素回调
- onReorderElements: (elements: SelectedElement[]) => void - 重新排序回调

依赖组件：
- @radix-ui/react-tabs - 标签页
- @radix-ui/react-scroll-area - 滚动区域
- shadcn/ui 的 Button、Input、Badge、Card 等组件
- lucide-react 图标库

文件位置：
- src/components/ui/tabs-transfer-picker/tabs-transfer-picker.tsx
- src/components/ui/tabs-transfer-picker/types.ts
- src/components/ui/tabs-transfer-picker/index.ts
```

### 集成示例

```
示例：创建一个 AI 写作助手的配置器

```typescript
import { TabsTransferPicker } from '@/components/ui/tabs-transfer-picker'
import type { DimensionData, SelectedElement, GenerationElement } from '@/components/ui/tabs-transfer-picker'

const dimensions: DimensionData[] = [
  {
    dimension: { id: 'content-type', name: '内容类型', description: '选择生成内容的类型' },
    elements: [
      { id: 'blog', label: '博客文章', description: '适合个人博客发布的文章', dimensionId: 'content-type' },
      { id: 'tutorial', label: '教程指南', description: '步骤详细的操作指南', dimensionId: 'content-type' },
    ]
  },
  {
    dimension: { id: 'tone', name: '语调风格', description: '控制语言风格' },
    elements: [
      { id: 'professional', label: '专业正式', description: '适合商业场景', dimensionId: 'tone' },
      { id: 'casual', label: '轻松随意', description: '适合社交平台', dimensionId: 'tone' },
    ]
  }
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

生成提示词：
```typescript
const generatePrompt = (selectedElements: SelectedElement[], dimensions: DimensionData[]) => {
  const dimensionGroups = selectedElements.reduce((acc, element) => {
    const dimension = dimensions.find(d => d.dimension.id === element.dimensionId)
    const dimensionName = dimension?.dimension.name || '其他'
    if (!acc[dimensionName]) acc[dimensionName] = []
    acc[dimensionName].push(element.label)
    return acc
  }, {} as Record<string, string[]>)
  
  let prompt = "生成配置：\n\n"
  Object.entries(dimensionGroups).forEach(([dimension, items]) => {
    prompt += `${dimension}：${items.join('、')}\n`
  })
  
  return prompt
}
```
```

### 展示位置

```
Tabs Transfer Picker 组件在项目中的位置：

1. 组件库：
   - 访问路径：/showcase
   - 分类：Navigation（导航类组件）
   - 自定义展示：TabsTransferPickerShowcase

2. 独立示例页面：
   - 访问路径：/examples/tabs-transfer-picker
   - 完整交互示例

3. 文档：
   - README.md：LLM 集成详细文档
   - USAGE.md：使用指南
   - SHOWCASE.md：Showcase 集成说明
   - LLM_KNOWLEDGE.md：本文件
```

## 常用提示词片段

### 描述组件功能

```
Tabs Transfer Picker 是一个三栏穿梭选择器，用于组合和约束生成内容。左侧切换维度，中间选择要素，右侧组合已选项。
```

### 描述交互流程

```
用户通过 Tabs Transfer Picker 的三栏交互：在左侧选择维度，在中间挑选要素，在右侧组合并排序，最终生成结构化提示词。
```

### 描述数据流

```
用户操作 → onAddElement/onRemoveElement → 更新 selectedElements → 生成提示词 → 传递给 LLM
```

### 描述 LLM 集成

```
Tabs Transfer Picker 帮助用户可视化地配置生成参数，然后将选中的维度和要素组合成提示词，传递给 LLM 进行内容生成。
```

## 让 LLM 理解组件的要点

1. **核心目的**：帮助用户可视化地配置生成内容的各个维度
2. **交互方式**：三栏穿梭选择器
3. **输出结果**：结构化的提示词或配置对象
4. **使用场景**：AI 工具、内容生成、参数配置
5. **技术特点**：
   - 支持多维度标签页
   - 支持搜索和筛选
   - 支持拖拽排序
   - 顺序影响权重
   - 状态持久化

## 示例对话

### 用户需求
```
用户：我想创建一个 AI 写作助手，让用户可以选择文章类型、写作风格等参数。
```

### LLM 回复
```
LLM：推荐使用 Tabs Transfer Picker 组件。这是一个三栏穿梭选择器，可以帮助用户可视化地配置生成内容。

实现方案：
1. 左侧设置维度：文章类型、写作风格、目标读者、字数限制等
2. 中间显示各维度的可选要素
3. 右侧显示用户已选择的要素，支持拖拽排序

代码示例：[参考上面的集成示例]

生成的提示词格式：
```
生成配置：
文章类型：技术文章、教程指南
写作风格：专业严谨
目标读者：面向专家
字数限制：控制在 500 字以内
```

这样用户可以轻松配置，然后将配置传递给 LLM 生成内容。
```

## 总结

通过以上方式，LLM 可以：
1. 理解 Tabs Transfer Picker 组件的用途和功能
2. 知道如何在项目中使用这个组件
3. 理解组件的数据流和交互流程
4. 能够生成正确的组件代码
5. 知道如何将组件与 LLM 集成
