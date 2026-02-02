# 可用组件文档

## 布局组件

### Box
通用容器组件，用于布局和样式控制。

```json
{
  "type": "Box",
  "props": {
    "className": "flex flex-col gap-4 p-4"
  },
  "children": []
}
```

### Card
卡片容器，带有边框和阴影。

```json
{
  "type": "Card",
  "props": {
    "className": "p-4"
  },
  "children": []
}
```

## 表单组件

### Input
文本输入框。

```json
{
  "type": "Input",
  "props": {
    "placeholder": "请输入...",
    "type": "text"
  }
}
```

### Button
按钮组件。

```json
{
  "type": "Button",
  "props": {
    "variant": "default",
    "size": "default"
  },
  "children": [{ "type": "Text", "props": { "content": "点击" } }]
}
```

### Select
下拉选择框。

```json
{
  "type": "Select",
  "props": {
    "placeholder": "请选择"
  }
}
```

## 展示组件

### Text
文本显示组件。

```json
{
  "type": "Text",
  "props": {
    "content": "显示的文本",
    "className": "text-lg font-bold"
  }
}
```

### Icon
图标组件。

```json
{
  "type": "Icon",
  "props": {
    "name": "home",
    "size": 24
  }
}
```

### Badge
徽章组件。

```json
{
  "type": "Badge",
  "props": {
    "variant": "default"
  },
  "children": [{ "type": "Text", "props": { "content": "新" } }]
}
```

### Bubble
泡泡弹出组件，点击圆形进度条可展开弹出内容。

```json
{
  "type": "Bubble",
  "props": {},
  "children": [
    {
      "type": "BubbleProgressTrigger",
      "props": {
        "progress": 75,
        "size": 48,
        "strokeWidth": 4
      },
      "children": [{ "type": "Text", "props": { "content": "75%" } }]
    },
    {
      "type": "BubbleContent",
      "props": {
        "align": "center",
        "side": "top"
      },
      "children": [
        {
          "type": "Text",
          "props": { "content": "任务进度详情" }
        }
      ]
    }
  ]
}
```

BubbleProgressTrigger 支持的属性：
- `progress`: 进度值 (0-100)
- `size`: 圆形尺寸，默认 32
- `strokeWidth`: 进度条宽度，默认 3
- `color`: 进度条颜色，默认使用主题色
- `backgroundColor`: 背景颜色，默认使用次要颜色

BubbleContent 支持的属性：
- `align`: 对齐方式 ("start" | "center" | "end")，默认 "center"
- `side`: 弹出位置 ("top" | "right" | "bottom" | "left")

