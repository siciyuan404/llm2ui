# Icon 使用规范

## 🚫 禁止使用 Emoji 作为图标

**绝对不要**在 UI Schema 中使用 emoji（如 🔍、🏠、📦）作为图标。

## ✅ 必须使用 Icon 组件

所有图标**必须**使用 Icon 组件：

```json
{ "type": "Icon", "props": { "name": "search", "size": 16 } }
```

## 常用图标名称

| 分类 | 图标名称 |
|------|----------|
| 通用 | `home`, `settings`, `search`, `user`, `menu`, `check`, `x`, `plus`, `minus`, `info`, `alert-circle`, `star`, `clock`, `calendar`, `eye`, `lock`, `shield` |
| 箭头 | `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `chevron-up`, `chevron-down`, `chevron-left`, `chevron-right` |
| 社交 | `share`, `heart`, `thumbs-up`, `thumbs-down`, `message-circle`, `users` |
| 文件 | `file`, `file-text`, `folder`, `folder-open`, `download`, `upload`, `trash` |
| 媒体 | `image`, `video`, `music`, `play`, `pause`, `volume` |
| 操作 | `edit`, `copy`, `save`, `refresh`, `filter`, `zoom-in`, `zoom-out` |
