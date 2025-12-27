# LLM2UI SDK

JSON Renderer SDK for LLM2UI - Render UI from JSON schemas with a simple API.

## Overview

The LLM2UI SDK provides a simple, amis-like API for rendering UI components from JSON schemas. It supports:

- **Simple rendering**: `render(schema, container)`
- **Factory pattern**: `createRenderer(options)`
- **Lifecycle management**: `update()`, `destroy()`
- **Event system**: `on()`, `off()`
- **React integration**: `<LLM2UI />` component

## File Index

| File | Description |
|------|-------------|
| `index.ts` | Main SDK entry point with all exports |
| `renderer.test.ts` | Property-based tests for SDK rendering consistency |
| `react/` | React component wrapper module |
| `react/LLM2UI.tsx` | React component wrapper for declarative usage |
| `react/index.ts` | React module exports |
| `vue/` | Vue 3 component wrapper module |
| `vue/LLM2UI.ts` | Vue component wrapper and composable |
| `vue/index.ts` | Vue module exports |

## Usage

### Basic Rendering

```typescript
import { render } from '@llm2ui/renderer';

const schema = {
  version: '1.0',
  root: {
    id: 'root',
    type: 'Container',
    children: [
      { id: 'btn', type: 'Button', props: { children: 'Click me' } }
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

const schema = { ... };

function handleEvent(event: LLM2UIVueEvent) {
  console.log('Event:', event.type, event.componentId);
}
</script>
```

### Vue Composable

```vue
<template>
  <div ref="containerRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useLLM2UI } from '@llm2ui/renderer';

const containerRef = ref<HTMLElement | null>(null);
const schema = ref({ ... });

const { render, update, destroy } = useLLM2UI({ theme: 'dark' });

onMounted(() => {
  if (containerRef.value) {
    render(schema.value, containerRef.value);
  }
});

watch(schema, (newSchema) => update(newSchema), { deep: true });
onUnmounted(() => destroy());
</script>
```

### Custom Components

```typescript
import { createRenderer } from '@llm2ui/renderer';

const renderer = createRenderer({
  customComponents: {
    MyCustomButton: ({ children, ...props }) => (
      <button className="custom-btn" {...props}>{children}</button>
    )
  }
});
```

### Custom Components with Full Metadata

```typescript
import { createRenderer, registerCustomComponent, type CustomComponentDefinition } from '@llm2ui/renderer';

// Method 1: Register globally (available to all renderers)
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

// Method 2: Register via renderer instance
const renderer = createRenderer();
renderer.registerComponent({
  name: 'MyInput',
  component: MyInputComponent,
  category: 'input',
  propsSchema: {
    placeholder: { type: 'string' },
    value: { type: 'string' }
  }
});

// Method 3: Register multiple components at once
renderer.registerComponents([
  { name: 'MyCard', component: MyCard, category: 'display' },
  { name: 'MyModal', component: MyModal, category: 'feedback' }
]);

// Method 4: Via options with full definitions
const renderer2 = createRenderer({
  customComponentDefinitions: [
    {
      name: 'CustomAlert',
      component: CustomAlertComponent,
      category: 'feedback',
      propsSchema: {
        type: { type: 'string', enum: ['info', 'warning', 'error'] }
      }
    }
  ]
});
```

### Custom Components in React

```tsx
import { LLM2UI, type CustomComponentDefinition } from '@llm2ui/renderer';

const customDefinitions: CustomComponentDefinition[] = [
  {
    name: 'MyButton',
    component: MyButtonComponent,
    category: 'input',
    propsSchema: {
      variant: { type: 'string', enum: ['primary', 'secondary'] }
    }
  }
];

function App() {
  return (
    <LLM2UI 
      schema={schema}
      customComponentDefinitions={customDefinitions}
    />
  );
}
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

- `render(schema, container)` - Render schema to container
- `update(schema)` - Update with new schema
- `destroy()` - Clean up and unmount
- `on(event, handler)` - Add event listener
- `off(event, handler?)` - Remove event listener
- `getSchema()` - Get current schema
- `getContainer()` - Get container element
- `isMounted()` - Check if mounted
- `registerComponent(definition)` - Register a custom component
- `registerComponents(definitions)` - Register multiple custom components
- `unregisterComponent(name)` - Unregister a custom component
- `hasComponent(name)` - Check if a component is registered
- `getCustomComponentNames()` - Get all custom component names
- `getRegistry()` - Get the component registry

### `registerCustomComponent(definition)`

Register a custom component globally to the default registry.

```typescript
registerCustomComponent({
  name: 'MyButton',
  component: MyButtonComponent,
  description: 'A custom button',
  category: 'input',
  propsSchema: { ... }
});
```

### `registerCustomComponents(definitions)`

Register multiple custom components globally.

### `unregisterCustomComponent(name)`

Unregister a custom component from the default registry.

### `LLM2UI` (React Component)

React component for rendering UISchema with a declarative API:

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

Props:
- `schema`: UISchema - The schema to render (required)
- `data`: DataContext - Additional data to merge with schema.data
- `onEvent`: LLM2UIEventCallback - Event handler callback
- `platform`: PlatformType - Target platform
- `theme`: 'light' | 'dark' - Theme mode
- `className`: string - CSS class name
- `style`: CSSProperties - Inline styles
- `registry`: ComponentRegistry - Custom registry
- `customComponents`: Record<string, ComponentType> - Custom components (simple format)
- `customComponentDefinitions`: CustomComponentDefinition[] - Custom components with full metadata
- `showErrors`: boolean - Show error boundaries
- `onRender`: () => void - Render complete callback
- `onError`: (error: Error) => void - Error callback

## Requirements Validation

- **14.1**: `render(schema, container)` method ✓
- **14.2**: `createRenderer(options)` factory method ✓
- **14.3**: React component wrapper (`LLM2UI`) ✓
- **14.3**: Vue component wrapper (`LLM2UIVue`) ✓
- **14.4**: Event callbacks via `onEvent` and `on()`/`off()` ✓
- **14.5**: Framework integration support (React & Vue) ✓

## Property-Based Testing

The SDK includes property-based tests (`renderer.test.ts`) that validate:

- **Property 8**: SDK 渲染一致性 - For any valid UISchema, `render(schema, container)` correctly mounts content and tracks state
- **Property 8b**: `createRenderer(options)` creates functional renderer instances
- **Property 8c**: `update(schema)` correctly changes rendered content
- **Property 8d**: `destroy()` properly cleans up renderer state
- **Property 8e**: Event listener management via `on()`/`off()` is consistent
- **Property 8f**: Multiple renders to same container work correctly

**Validates: Requirements 14.1, 14.2, 14.4**
