# 正面示例

以下是高质量 UI Schema 的示例，请参考这些模式：

## 示例 1: 简单表单

用户请求: "创建一个登录表单"

```json
{
  "version": "1.0",
  "root": {
    "id": "login-form",
    "type": "Card",
    "props": { "className": "w-96 p-6" },
    "children": [
      {
        "id": "title",
        "type": "Text",
        "props": { "content": "登录", "className": "text-2xl font-bold mb-4" }
      },
      {
        "id": "email-input",
        "type": "Input",
        "props": { "placeholder": "邮箱", "type": "email", "className": "mb-3" }
      },
      {
        "id": "password-input",
        "type": "Input",
        "props": { "placeholder": "密码", "type": "password", "className": "mb-4" }
      },
      {
        "id": "submit-btn",
        "type": "Button",
        "props": { "className": "w-full" },
        "children": [{ "type": "Text", "props": { "content": "登录" } }]
      }
    ]
  }
}
```

## 示例 2: 带图标的导航

用户请求: "创建一个侧边导航栏"

```json
{
  "version": "1.0",
  "root": {
    "id": "sidebar",
    "type": "Box",
    "props": { "className": "w-64 h-full bg-gray-100 p-4" },
    "children": [
      {
        "id": "nav-home",
        "type": "Box",
        "props": { "className": "flex items-center gap-2 p-2 hover:bg-gray-200 rounded" },
        "children": [
          { "id": "home-icon", "type": "Icon", "props": { "name": "home", "size": 20 } },
          { "id": "home-text", "type": "Text", "props": { "content": "首页" } }
        ]
      },
      {
        "id": "nav-settings",
        "type": "Box",
        "props": { "className": "flex items-center gap-2 p-2 hover:bg-gray-200 rounded" },
        "children": [
          { "id": "settings-icon", "type": "Icon", "props": { "name": "settings", "size": 20 } },
          { "id": "settings-text", "type": "Text", "props": { "content": "设置" } }
        ]
      }
    ]
  }
}
```

{{additionalExamples}}
