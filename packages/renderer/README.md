# @llm2ui/renderer

JSON Renderer SDK for LLM2UI - Render UI from JSON schemas with a simple API, similar to [amis](https://github.com/baidu/amis) low-code framework.

## Features

- 🚀 **Simple API**: `render(schema, container)` - just like amis
- 🎨 **Multi-platform**: Support for PC Web, Mobile Web, Mobile Native, PC Desktop
- ⚛️ **React Integration**: `<LLM2UI />` component for declarative usage
- 💚 **Vue Integration**: Vue 3 component and composable support
- 🔌 **Custom Components**: Register your own components easily
- 📦 **Tree-shakable**: Only bundle what you use
- 📝 **TypeScript**: Full type definitions included

## Installation

```bash
npm install @llm2ui/renderer
# or
yarn add @llm2ui/renderer
# or
pnpm add @llm2ui/renderer
```

## Styling Setup

The renderer comes with pre-compiled CSS that includes all necessary Tailwind utilities. Just import the styles file:

```typescript
// In your main entry file (e.g., main.tsx or App.tsx)
import '@siciyuan404/llm2ui-renderer/styles.css';
```

That's it! The styles.css file includes:
- All Tailwind CSS utilities used by the components
- CSS variables for theming (light/dark mode)
- Base styles and resets

### Advanced: Custom Tailwind Setup

If you want to customize the theme or use your own Tailwind configuration:

```javascript
// tailwind.config.js
const llm2uiConfig = require('@siciyuan404/llm2ui-renderer/tailwind.config');

module.exports = {
  presets: [llm2uiConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Include renderer's dist files for Tailwind to scan
    './node_modules/@siciyuan404/llm2ui-renderer/dist/**/*.{js,cjs}',
  ],
  // Add your customizations here
  theme: {
    extend: {
      // Custom colors, etc.
    }
  }
};
```

## Quick Start

### Basic Rendering

```typescript
import { render } from '@llm2ui/renderer';

const schema = {
  version: '1.0',
  root: {
    id: 'root',
    type: 'Container',
    children: [
      { 
        id: 'btn', 
        type: 'Button', 
        props: { children: 'Click me' } 
      }
    ]
  }
};

const renderer = render(schema, document.getElementById('app'));
```

### With Options

```typescript
import { createRenderer } from '@llm2ui/renderer';

const renderer = createRenderer({
  theme: 'dark',
  onEvent: (action, event, componentId) => {
    console.log('Event:', action.type, componentId);
  }
});

renderer.render(schema, container);
renderer.on('click', (event) => console.log('Clicked:', event.componentId));
```

### React Component

```tsx
import { LLM2UI, type LLM2UIEvent } from '@llm2ui/renderer';

function App() {
  const handleEvent = (event: LLM2UIEvent) => {
    console.log('Event:', event.type, event.componentId);
  };

  return (
    <LLM2UI 
      schema={schema}
      data={{ user: { name: 'John' } }}
      onEvent={handleEvent}
      theme="light"
    />
  );
}
```

### Vue Component

```vue
<template>
  <LLM2UI 
    :schema="schema"
    :data="{ user: { name: 'John' } }"
    @event="handleEvent"
    theme="light"
  />
</template>

<script setup lang="ts">
import { LLM2UIVue as LLM2UI, type LLM2UIVueEvent } from '@llm2ui/renderer';

const schema = { /* ... */ };

function handleEvent(event: LLM2UIVueEvent) {
  console.log('Event:', event.type, event.componentId);
}
</script>
```

## Custom Components

### Simple Registration

```typescript
import { createRenderer } from '@llm2ui/renderer';

const renderer = createRenderer({
  customComponents: {
    MyButton: ({ children, ...props }) => (
      <button className="my-btn" {...props}>{children}</button>
    )
  }
});
```

### With Full Metadata

```typescript
import { registerCustomComponent } from '@llm2ui/renderer';

registerCustomComponent({
  name: 'MyButton',
  component: MyButtonComponent,
  description: 'A custom button with variants',
  category: 'input',
  propsSchema: {
    variant: { type: 'string', enum: ['primary', 'secondary', 'danger'] },
    disabled: { type: 'boolean', default: false },
    size: { type: 'string', enum: ['sm', 'md', 'lg'], default: 'md' }
  },
  tags: ['button', 'action', 'interactive']
});
```

## API Reference

### `render(schema, container, options?)`

Renders a UISchema to a DOM container.

- `schema`: UISchema - The schema to render
- `container`: HTMLElement - Target DOM element
- `options`: RendererOptions - Optional configuration
- Returns: `LLM2UIRenderer` instance

### `createRenderer(options?)`

Creates a new renderer instance.

- `options`: RendererOptions - Configuration options
- Returns: `LLM2UIRenderer` instance

### `LLM2UIRenderer`

Main renderer class with lifecycle methods:

| Method | Description |
|--------|-------------|
| `render(schema, container)` | Render schema to container |
| `update(schema)` | Update with new schema |
| `destroy()` | Clean up and unmount |
| `on(event, handler)` | Add event listener |
| `off(event, handler?)` | Remove event listener |
| `registerComponent(definition)` | Register a custom component |
| `getSchema()` | Get current schema |
| `isMounted()` | Check if mounted |

### `LLM2UI` (React Component)

```tsx
<LLM2UI
  schema={schema}
  data={{ user: { name: 'John' } }}
  onEvent={(event) => console.log(event.type)}
  theme="dark"
  customComponents={{ MyButton }}
  showErrors={true}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `schema` | `UISchema` | The schema to render (required) |
| `data` | `DataContext` | Additional data context |
| `onEvent` | `LLM2UIEventCallback` | Event handler callback |
| `platform` | `PlatformType` | Target platform |
| `theme` | `'light' \| 'dark'` | Theme mode |
| `customComponents` | `Record<string, ComponentType>` | Custom components |
| `showErrors` | `boolean` | Show error boundaries |

## UISchema Format

```typescript
interface UISchema {
  version: string;
  root: UIComponent;
  data?: DataContext;
  theme?: ThemeConfig;
}

interface UIComponent {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: UIComponent[];
  events?: EventBinding[];
  style?: StyleProps;
  conditional?: ConditionalConfig;
}
```

## Built-in Components

The SDK includes a comprehensive set of UI components:

- **Input**: Button, Input, Checkbox, Radio, Select, Switch, Slider
- **Layout**: Container, Grid, Flex, Card, Accordion, Tabs
- **Display**: Text, Image, Avatar, Badge, Table
- **Feedback**: Alert, Toast, Dialog, Tooltip
- **Navigation**: Menu, Breadcrumb, Pagination

## Tree-shaking

This package is fully tree-shakable. Only the components and utilities you actually use will be included in your final bundle.

### How it works

1. **ES Modules**: The package exports ES modules that bundlers can statically analyze
2. **Side-effect free**: All modules are marked as side-effect free (except CSS)
3. **Preserved module structure**: Each module is kept separate for granular imports
4. **Named exports**: All exports are named, allowing bundlers to eliminate unused code

### Best practices for optimal tree-shaking

```typescript
// ✅ Good - Import only what you need
import { render, LLM2UI } from '@llm2ui/renderer';
import { LLM2UI } from '@llm2ui/renderer/react';

// ❌ Avoid - Importing everything
import * as LLM2UIRenderer from '@llm2ui/renderer';
```

### Bundle size optimization

For the smallest possible bundle:

1. Use specific entry points (`@llm2ui/renderer/react` or `@llm2ui/renderer/vue`)
2. Only import the components you need
3. Use a modern bundler (Vite, Webpack 5+, Rollup, esbuild)
4. Enable production mode for dead code elimination

## License

MIT © LLM2UI Team
