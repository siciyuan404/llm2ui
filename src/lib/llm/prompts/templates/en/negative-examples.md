# Negative Examples - Avoid These Mistakes

## ❌ Mistake 1: Using Emoji as Icons

```json
// Wrong
{
  "type": "Text",
  "props": { "content": "🏠 Home" }
}
```

✅ Correct:
```json
{
  "type": "Box",
  "props": { "className": "flex items-center gap-2" },
  "children": [
    { "type": "Icon", "props": { "name": "home", "size": 16 } },
    { "type": "Text", "props": { "content": "Home" } }
  ]
}
```

## ❌ Mistake 2: Missing Required id Field

```json
// Wrong
{
  "type": "Button",
  "props": {}
}
```

✅ Correct:
```json
{
  "id": "submit-button",
  "type": "Button",
  "props": {}
}
```

## ❌ Mistake 3: Using Non-existent Component Types

```json
// Wrong
{
  "type": "Div",
  "props": {}
}
```

✅ Correct:
```json
{
  "type": "Box",
  "props": {}
}
```

## ❌ Mistake 4: Missing version Field

```json
// Wrong
{
  "root": { ... }
}
```

✅ Correct:
```json
{
  "version": "1.0",
  "root": { ... }
}
```
