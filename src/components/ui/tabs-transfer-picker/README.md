# Tabs Transfer Picker - 面向 LLM 的通用生成配置器

## 组件概述

Tabs Transfer Picker 是一个用于组合和约束生成内容的三栏式穿梭选择器，专门设计用于与大语言模型（LLM）交互的 AI 工具和企业级系统。

## 核心功能

### 三栏布局

1. **左侧：生成维度切换区**
   - 展示不同的生成维度标签页
   - 每个维度代表生成内容时的一个关注角度
   - 切换维度时不会影响已选内容

2. **中间：可选内容要素区**
   - 展示当前维度下的可选生成要素
   - 支持搜索和快速定位
   - 每个要素包含主要文本和次要说明

3. **右侧：已选生成组合区**
   - 集中展示已选中的生成要素
   - 支持拖拽调整顺序
   - 可以随时移除或替换

### 关键特性

- **多维度组织**：通过标签页按维度分类组织内容
- **连续交互**：操作过程流畅，可回溯，不中断思路
- **优先级控制**：已选要素的顺序影响生成结果的权重
- **状态保持**：切换维度时保持已选内容不变
- **拖拽排序**：通过拖拽调整已选要素的优先级

## 数据结构

### DimensionData
```typescript
{
  dimension: {
    id: string          // 维度唯一标识
    name: string        // 维度显示名称
    description?: string  // 维度说明
  }
  elements: GenerationElement[]  // 该维度下的要素列表
}
```

### GenerationElement
```typescript
{
  id: string          // 要素唯一标识
  label: string       // 要素显示标签
  description?: string  // 要素详细说明
  dimensionId: string  // 所属维度 ID
  icon?: React.ReactNode  // 可选图标
}
```

### SelectedElement
```typescript
{
  ...GenerationElement
  order: number       // 在已选列表中的顺序
}
```

## LLM 集成指南

### 场景 1：提示词生成器

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
  
  // 生成结构化提示词
  let prompt = "请根据以下配置生成内容：\n\n"
  Object.entries(dimensionGroups).forEach(([dimension, items]) => {
    prompt += `${dimension}：${items.join('、')}\n`
  })
  
  return prompt
}
```

### 场景 2：动态约束配置

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

### 场景 3：权重计算

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

## 使用建议

### 为 LLM 设计维度

1. **内容类型维度**：定义生成内容的类型（文章、教程、文档等）
2. **表达风格维度**：控制语言风格（专业、友好、简洁等）
3. **输出结构维度**：指定输出格式（Markdown、列表、表格等）
4. **约束规则维度**：设置限制条件（字数、语言、代码等）
5. **参考背景维度**：提供上下文信息（目标读者、熟练程度等）

### 优化用户体验

- 每个维度提供清晰的描述说明
- 为要素添加图标增强视觉识别
- 使用次要文本说明要素的影响
- 保持每个维度的要素数量适中（5-10 个）
- 支持搜索功能，方便快速定位

## 示例：AI 写作助手

创建一个 AI 写作助手的配置器：

```typescript
const writingAssistantDimensions: DimensionData[] = [
  {
    dimension: { id: 'type', name: '内容类型' },
    elements: [
      { id: 'blog', label: '博客文章', description: '适合个人博客发布的文章' },
      { id: 'tutorial', label: '教程指南', description: '步骤详细的操作指南' },
      { id: 'whitepaper', label: '白皮书', description: '专业的技术白皮书' },
    ]
  },
  {
    dimension: { id: 'tone', name: '语调风格' },
    elements: [
      { id: 'professional', label: '专业正式', description: '适合商业场景' },
      { id: 'casual', label: '轻松随意', description: '适合社交平台' },
      { id: 'academic', label: '学术严谨', description: '适合学术场合' },
    ]
  },
  {
    dimension: { id: 'format', name: '输出格式' },
    elements: [
      { id: 'markdown', label: 'Markdown', description: '标准的 Markdown 格式' },
      { id: 'html', label: 'HTML', description: '富文本 HTML 格式' },
      { id: 'plain', label: '纯文本', description: '纯文本格式' },
    ]
  }
]
```

## 最佳实践

1. **维度命名**：使用清晰、简洁的中文名称
2. **要素说明**：为每个要素提供简短说明，解释其影响
3. **视觉层次**：使用图标、颜色等增强视觉识别
4. **反馈及时**：添加、删除、排序时提供即时反馈
5. **错误处理**：处理空状态、重复选择等边界情况

## 扩展功能

- 支持维度和要素的动态加载
- 添加预设模板功能
- 支持导入/导出配置
- 添加历史记录功能
- 支持实时预览生成结果

## 总结

Tabs Transfer Picker 为 LLM 交互提供了一个可视化的配置界面，让用户可以通过直观的点击和拖拽操作来精细控制生成内容。它的三栏设计和维度分类机制使得复杂的配置变得简单易用，是 AI 工具和企业级系统中理想的生成配置器组件。
