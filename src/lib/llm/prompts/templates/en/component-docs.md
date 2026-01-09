# Available Components Documentation

## Layout Components

### Box
Generic container component for layout and styling.

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
Card container with border and shadow.

```json
{
  "type": "Card",
  "props": {
    "className": "p-4"
  },
  "children": []
}
```

## Form Components

### Input
Text input field.

```json
{
  "type": "Input",
  "props": {
    "placeholder": "Enter text...",
    "type": "text"
  }
}
```

### Button
Button component.

```json
{
  "type": "Button",
  "props": {
    "variant": "default",
    "size": "default"
  },
  "children": [{ "type": "Text", "props": { "content": "Click" } }]
}
```

### Select
Dropdown select component.

```json
{
  "type": "Select",
  "props": {
    "placeholder": "Select..."
  }
}
```

## Display Components

### Text
Text display component.

```json
{
  "type": "Text",
  "props": {
    "content": "Display text",
    "className": "text-lg font-bold"
  }
}
```

### Icon
Icon component.

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
Badge component.

```json
{
  "type": "Badge",
  "props": {
    "variant": "default"
  },
  "children": [{ "type": "Text", "props": { "content": "New" } }]
}
```
