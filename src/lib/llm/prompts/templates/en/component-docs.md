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

### Bubble
Bubble popup component with circular progress trigger.

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
          "props": { "content": "Task Progress Details" }
        }
      ]
    }
  ]
}
```

BubbleProgressTrigger properties:
- `progress`: Progress value (0-100)
- `size`: Circle size, default 32
- `strokeWidth`: Progress bar width, default 3
- `color`: Progress bar color, default theme primary
- `backgroundColor`: Background color, default theme secondary

BubbleContent properties:
- `align`: Alignment ("start" | "center" | "end"), default "center"
- `side`: Popup position ("top" | "right" | "bottom" | "left")

