# LLM2UI React SDK

React component wrapper for the LLM2UI JSON Renderer SDK.

## Overview

This module provides a declarative React component (`LLM2UI`) for rendering UISchema in React applications. It offers a simple, amis-like API for integrating LLM-generated UI into your React projects.

## File Index

| File | Description |
|------|-------------|
| `LLM2UI.tsx` | Main React component wrapper |
| `index.ts` | Module exports |

## Usage

### Basic Usage

```tsx
import { LLM2UI } from '@llm2ui/renderer';

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

function App() {
  return <LLM2UI schema={schema} />;
}
```

### With Data Binding

```tsx
import { LLM2UI } from '@llm2ui/renderer';

function App() {
  const schema = {
    version: '1.0',
    root: {
      id: 'greeting',
      type: 'Text',
      text: 'Hello, {{user.name}}!'
    }
  };

  return (
    <LLM2UI 
      schema={schema}
      data={{ user: { name: 'John' } }}
    />
  );
}
```

### With Event Handling

```tsx
import { LLM2UI, type LLM2UIEvent } from '@llm2ui/renderer';

function App() {
  const handleEvent = (event: LLM2UIEvent) => {
    console.log('Event type:', event.type);
    console.log('Component ID:', event.componentId);
    console.log('Action:', event.action);
    
    if (event.type === 'submit') {
      // Handle form submission
    }
  };

  return (
    <LLM2UI 
      schema={schema}
      onEvent={handleEvent}
    />
  );
}
```

### With Custom Components

```tsx
import { LLM2UI } from '@llm2ui/renderer';

const MyCustomButton = ({ children, variant, ...props }) => (
  <button className={`custom-btn custom-btn-${variant}`} {...props}>
    {children}
  </button>
);

function App() {
  return (
    <LLM2UI 
      schema={schema}
      customComponents={{
        MyCustomButton
      }}
    />
  );
}
```

### With Custom Component Definitions (Full Metadata)

```tsx
import { LLM2UI, type CustomComponentDefinition } from '@llm2ui/renderer';

const MyButton = ({ children, variant = 'primary', disabled }) => (
  <button className={`btn btn-${variant}`} disabled={disabled}>
    {children}
  </button>
);

const customDefinitions: CustomComponentDefinition[] = [
  {
    name: 'MyButton',
    component: MyButton,
    description: 'A custom button with variants',
    category: 'input',
    propsSchema: {
      variant: { type: 'string', enum: ['primary', 'secondary', 'danger'], default: 'primary' },
      disabled: { type: 'boolean', default: false }
    },
    tags: ['button', 'action']
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

### With Theme Support

```tsx
import { LLM2UI } from '@llm2ui/renderer';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <LLM2UI 
      schema={schema}
      theme={theme}
      className="my-app"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `schema` | `UISchema` | required | The UISchema to render |
| `data` | `DataContext` | - | Additional data context to merge with schema.data |
| `onEvent` | `LLM2UIEventCallback` | - | Event callback handler |
| `platform` | `PlatformType` | - | Target platform for rendering |
| `theme` | `'light' \| 'dark'` | - | Theme mode |
| `className` | `string` | - | Custom CSS class name |
| `style` | `CSSProperties` | - | Inline styles |
| `registry` | `ComponentRegistry` | defaultRegistry | Custom component registry |
| `customComponents` | `Record<string, ComponentType>` | - | Custom components (simple format: name -> component) |
| `customComponentDefinitions` | `CustomComponentDefinition[]` | - | Custom components with full metadata |
| `showErrors` | `boolean` | `false` | Whether to show error boundaries |
| `unknownComponent` | `ComponentType` | - | Custom component for unknown types |
| `onRender` | `() => void` | - | Callback when rendering is complete |
| `onError` | `(error: Error) => void` | - | Callback when an error occurs |

## Requirements Validation

- **14.3**: React component wrapper (`LLM2UI`) ✓
- **14.5**: Framework integration support ✓
