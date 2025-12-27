# LLM2UI Vue SDK

Vue 3 component wrapper for the LLM2UI JSON Renderer SDK.

## Overview

This module provides Vue 3 integration for LLM2UI, allowing you to render UI from JSON schemas in Vue applications. It supports:

- **Component**: `<LLM2UI />` Vue component
- **Composable**: `useLLM2UI()` for Composition API
- **Factory**: `createLLM2UIComponent()` for custom setup

## Prerequisites

Vue 3 must be installed as a peer dependency:

```bash
npm install vue
```

## File Index

| File | Description |
|------|-------------|
| `index.ts` | Vue module exports |
| `LLM2UI.ts` | Vue component wrapper and composable |

## Usage

### Component Usage

```vue
<template>
  <LLM2UI 
    :schema="schema"
    :data="{ user: { name: 'John' } }"
    theme="light"
    @event="handleEvent"
    @render="onRender"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { LLM2UI, type LLM2UIEvent } from '@llm2ui/renderer/vue';

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

function handleEvent(event: LLM2UIEvent) {
  console.log('Event:', event.type, event.componentId);
}

function onRender() {
  console.log('Render complete');
}

function onError(error: Error) {
  console.error('Render error:', error);
}
</script>
```

### Composable Usage

```vue
<template>
  <div ref="containerRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useLLM2UI } from '@llm2ui/renderer/vue';

const containerRef = ref<HTMLElement | null>(null);
const schema = ref({
  version: '1.0',
  root: { id: 'root', type: 'Container', children: [] }
});

const { render, update, destroy, on, off } = useLLM2UI({
  theme: 'dark',
  onEvent: (action, event, componentId) => {
    console.log('Event:', action.type, componentId);
  },
});

onMounted(() => {
  if (containerRef.value) {
    render(schema.value, containerRef.value);
  }
});

watch(schema, (newSchema) => {
  update(newSchema);
}, { deep: true });

onUnmounted(() => {
  destroy();
});
</script>
```

### Global Registration

```typescript
import { createApp } from 'vue';
import { LLM2UI } from '@llm2ui/renderer/vue';
import App from './App.vue';

const app = createApp(App);
app.component('LLM2UI', LLM2UI);
app.mount('#app');
```

## API Reference

### `<LLM2UI />` Component

Props:
- `schema`: UISchema - The schema to render (required)
- `data`: DataContext - Additional data to merge with schema.data
- `platform`: PlatformType - Target platform
- `theme`: 'light' | 'dark' - Theme mode
- `showErrors`: boolean - Show error boundaries
- `customComponentDefinitions`: CustomComponentDefinition[] - Custom components with full metadata

Events:
- `@event`: Emitted when a UI event occurs
- `@render`: Emitted when rendering is complete
- `@error`: Emitted when an error occurs

### Custom Component Definitions

```vue
<template>
  <LLM2UI 
    :schema="schema"
    :customComponentDefinitions="customDefinitions"
    @event="handleEvent"
  />
</template>

<script setup lang="ts">
import { LLM2UI, type CustomComponentDefinition } from '@llm2ui/renderer/vue';

const customDefinitions: CustomComponentDefinition[] = [
  {
    name: 'MyButton',
    component: MyButtonComponent,
    description: 'A custom button',
    category: 'input',
    propsSchema: {
      variant: { type: 'string', enum: ['primary', 'secondary'] }
    }
  }
];
</script>
```

### `useLLM2UI(options?)`

Composable function for Composition API integration.

Returns:
- `render(schema, container)` - Render schema to container
- `update(schema)` - Update with new schema
- `destroy()` - Clean up and unmount
- `on(event, handler)` - Add event listener
- `off(event, handler?)` - Remove event listener
- `isMounted()` - Check if mounted
- `getSchema()` - Get current schema

### `createLLM2UIComponent()`

Factory function to create a custom LLM2UI component definition.

### `isVueAvailable()`

Utility function to check if Vue is available at runtime.

## Requirements Validation

- **14.3**: Vue component wrapper ✓
- **14.5**: Framework integration support ✓
