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
