# Icon Usage Guidelines

## 🚫 Never Use Emoji as Icons

**Never** use emoji (like 🔍, 🏠, 📦) as icons in UI Schema.

## ✅ Always Use Icon Component

All icons **must** use the Icon component:

```json
{ "type": "Icon", "props": { "name": "search", "size": 16 } }
```

## Common Icon Names

| Category | Icon Names |
|----------|------------|
| General | `home`, `settings`, `search`, `user`, `menu`, `check`, `x`, `plus`, `minus`, `info`, `alert-circle`, `star`, `clock`, `calendar`, `eye`, `lock`, `shield` |
| Arrows | `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `chevron-up`, `chevron-down`, `chevron-left`, `chevron-right` |
| Social | `share`, `heart`, `thumbs-up`, `thumbs-down`, `message-circle`, `users` |
| Files | `file`, `file-text`, `folder`, `folder-open`, `download`, `upload`, `trash` |
| Media | `image`, `video`, `music`, `play`, `pause`, `volume` |
| Actions | `edit`, `copy`, `save`, `refresh`, `filter`, `zoom-in`, `zoom-out` |
