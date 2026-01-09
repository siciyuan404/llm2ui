# 负面示例 - 请避免这些错误

## ❌ 错误 1: 使用 Emoji 作为图标

```json
// 错误示例
{
  "type": "Text",
  "props": { "content": "🏠 首页" }
}
```

✅ 正确做法:
```json
{
  "type": "Box",
  "props": { "className": "flex items-center gap-2" },
  "children": [
    { "type": "Icon", "props": { "name": "home", "size": 16 } },
    { "type": "Text", "props": { "content": "首页" } }
  ]
}
```

## ❌ 错误 2: 缺少必要的 id 字段

```json
// 错误示例
{
  "type": "Button",
  "props": {}
}
```

✅ 正确做法:
```json
{
  "id": "submit-button",
  "type": "Button",
  "props": {}
}
```

## ❌ 错误 3: 使用不存在的组件类型

```json
// 错误示例
{
  "type": "Div",
  "props": {}
}
```

✅ 正确做法:
```json
{
  "type": "Box",
  "props": {}
}
```

## ❌ 错误 4: 缺少 version 字段

```json
// 错误示例
{
  "root": { ... }
}
```

✅ 正确做法:
```json
{
  "version": "1.0",
  "root": { ... }
}
```
