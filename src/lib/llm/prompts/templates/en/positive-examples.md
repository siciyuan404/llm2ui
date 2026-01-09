# Positive Examples

Here are high-quality UI Schema examples to follow:

## Example 1: Simple Form

User request: "Create a login form"

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
        "props": { "content": "Login", "className": "text-2xl font-bold mb-4" }
      },
      {
        "id": "email-input",
        "type": "Input",
        "props": { "placeholder": "Email", "type": "email", "className": "mb-3" }
      },
      {
        "id": "password-input",
        "type": "Input",
        "props": { "placeholder": "Password", "type": "password", "className": "mb-4" }
      },
      {
        "id": "submit-btn",
        "type": "Button",
        "props": { "className": "w-full" },
        "children": [{ "type": "Text", "props": { "content": "Login" } }]
      }
    ]
  }
}
```

## Example 2: Navigation with Icons

User request: "Create a sidebar navigation"

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
          { "id": "home-text", "type": "Text", "props": { "content": "Home" } }
        ]
      },
      {
        "id": "nav-settings",
        "type": "Box",
        "props": { "className": "flex items-center gap-2 p-2 hover:bg-gray-200 rounded" },
        "children": [
          { "id": "settings-icon", "type": "Icon", "props": { "name": "settings", "size": 20 } },
          { "id": "settings-text", "type": "Text", "props": { "content": "Settings" } }
        ]
      }
    ]
  }
}
```

{{additionalExamples}}
