/**
 * Export Module
 * 
 * Provides functionality to export UISchema to various formats:
 * - JSON (complete schema with data context)
 * - Vue3 SFC (Single File Component)
 * - React JSX
 * 
 * @module lib/export
 */

import type { UISchema, UIComponent, DataContext } from '../types';
import { serialize } from './serialization';

/**
 * Export options for JSON export
 */
export interface JSONExportOptions {
  /** Pretty print with indentation */
  pretty?: boolean;
  /** Indentation spaces (default: 2) */
  indent?: number;
  /** Include data context in export */
  includeData?: boolean;
  /** Include metadata in export */
  includeMeta?: boolean;
}

/**
 * Export result containing the exported content and metadata
 */
export interface ExportResult {
  /** Whether export was successful */
  success: boolean;
  /** Exported content (code or JSON string) */
  content?: string;
  /** File name suggestion */
  filename?: string;
  /** MIME type for download */
  mimeType?: string;
  /** Error message if export failed */
  error?: string;
}

/**
 * Export UISchema to JSON format
 * 
 * @param schema - The UISchema to export
 * @param options - Export options
 * @returns ExportResult with JSON string
 */
export function exportToJSON(
  schema: UISchema,
  options: JSONExportOptions = {}
): ExportResult {
  const {
    pretty = true,
    indent = 2,
    includeData = true,
    includeMeta = true,
  } = options;

  try {
    // Create export object based on options
    const exportSchema: UISchema = {
      version: schema.version,
      root: schema.root,
    };

    // Include data context if requested
    if (includeData && schema.data) {
      exportSchema.data = schema.data;
    }

    // Include metadata if requested
    if (includeMeta && schema.meta) {
      exportSchema.meta = {
        ...schema.meta,
        updatedAt: new Date().toISOString(),
      };
    } else if (includeMeta) {
      // Add basic metadata if none exists
      exportSchema.meta = {
        updatedAt: new Date().toISOString(),
      };
    }

    const content = serialize(exportSchema, { pretty, indent });
    const title = schema.meta?.title || 'ui-schema';
    const filename = `${sanitizeFilename(title)}.json`;

    return {
      success: true,
      content,
      filename,
      mimeType: 'application/json',
    };
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      error: `JSON export failed: ${error.message}`,
    };
  }
}


/**
 * Sanitize a string for use as a filename
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'export';
}

/**
 * Vue3 export options
 */
export interface Vue3ExportOptions {
  /** Component name (PascalCase) */
  componentName?: string;
  /** Use TypeScript */
  typescript?: boolean;
  /** Include scoped styles */
  scopedStyles?: boolean;
}

/**
 * Export UISchema to Vue3 Single File Component
 * 
 * @param schema - The UISchema to export
 * @param options - Export options
 * @returns ExportResult with Vue SFC code
 */
export function exportToVue3(
  schema: UISchema,
  options: Vue3ExportOptions = {}
): ExportResult {
  const {
    componentName = 'GeneratedComponent',
    typescript = true,
    scopedStyles = true,
  } = options;

  try {
    const template = generateVueTemplate(schema.root, schema.data);
    const script = generateVueScript(schema, typescript);
    const styles = generateVueStyles();

    const content = `<template>
${template}
</template>

<script${typescript ? ' lang="ts"' : ''} setup>
${script}
</script>

<style${scopedStyles ? ' scoped' : ''}>
${styles}
</style>
`;

    const filename = `${componentName}.vue`;

    return {
      success: true,
      content,
      filename,
      mimeType: 'text/plain',
    };
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      error: `Vue3 export failed: ${error.message}`,
    };
  }
}

/**
 * Generate Vue template from UIComponent tree
 */
function generateVueTemplate(component: UIComponent, data?: DataContext, indent: number = 2): string {
  const spaces = ' '.repeat(indent);
  const tag = mapComponentToVueTag(component.type);
  const attrs = generateVueAttributes(component);
  const events = generateVueEvents(component);
  
  let content = '';
  
  // Handle text content
  if (component.text) {
    content = convertBindingToVue(component.text);
  }
  
  // Handle binding
  if (component.binding) {
    content = `{{ ${convertBindingPathToVue(component.binding)} }}`;
  }
  
  // Handle children
  if (component.children && component.children.length > 0) {
    const childrenContent = component.children
      .map(child => generateVueTemplate(child, data, indent + 2))
      .join('\n');
    content = `\n${childrenContent}\n${spaces}`;
  }
  
  // Handle loop
  let loopAttr = '';
  if (component.loop) {
    const itemName = component.loop.itemName || 'item';
    const indexName = component.loop.indexName || 'index';
    const source = convertBindingPathToVue(component.loop.source);
    loopAttr = ` v-for="(${itemName}, ${indexName}) in ${source}" :key="${indexName}"`;
  }
  
  // Handle condition
  let conditionAttr = '';
  if (component.condition) {
    conditionAttr = ` v-if="${convertBindingPathToVue(component.condition)}"`;
  }
  
  const allAttrs = `${loopAttr}${conditionAttr}${attrs}${events}`.trim();
  const attrStr = allAttrs ? ` ${allAttrs}` : '';
  
  if (content) {
    return `${spaces}<${tag}${attrStr}>${content}</${tag}>`;
  }
  
  return `${spaces}<${tag}${attrStr} />`;
}

/**
 * Map UIComponent type to Vue tag
 */
function mapComponentToVueTag(type: string): string {
  const tagMap: Record<string, string> = {
    container: 'div',
    card: 'div',
    button: 'button',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    checkbox: 'input',
    radio: 'input',
    switch: 'input',
    slider: 'input',
    table: 'table',
    list: 'ul',
    image: 'img',
    text: 'span',
    heading: 'h2',
    badge: 'span',
    avatar: 'img',
    alert: 'div',
    dialog: 'dialog',
    tabs: 'div',
    accordion: 'div',
    form: 'form',
    separator: 'hr',
  };
  
  return tagMap[type.toLowerCase()] || 'div';
}

/**
 * Generate Vue attributes from component props and style
 */
function generateVueAttributes(component: UIComponent): string {
  const attrs: string[] = [];
  
  // Add class attribute
  const classes: string[] = [];
  if (component.style?.className) {
    classes.push(component.style.className);
  }
  classes.push(getDefaultClassForType(component.type));
  
  if (classes.length > 0) {
    attrs.push(`class="${classes.filter(Boolean).join(' ')}"`);
  }
  
  // Add props as attributes
  if (component.props) {
    for (const [key, value] of Object.entries(component.props)) {
      if (typeof value === 'string') {
        if (value.includes('{{')) {
          attrs.push(`:${key}="${convertBindingPathToVue(value)}"`);
        } else {
          attrs.push(`${key}="${value}"`);
        }
      } else if (typeof value === 'boolean') {
        if (value) {
          attrs.push(key);
        }
      } else if (typeof value === 'number') {
        attrs.push(`:${key}="${value}"`);
      }
    }
  }
  
  // Handle specific component types
  if (component.type.toLowerCase() === 'checkbox' || component.type.toLowerCase() === 'radio') {
    attrs.push(`type="${component.type.toLowerCase()}"`);
  }
  if (component.type.toLowerCase() === 'slider') {
    attrs.push('type="range"');
  }
  if (component.type.toLowerCase() === 'switch') {
    attrs.push('type="checkbox"');
  }
  
  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

/**
 * Generate Vue event bindings
 */
function generateVueEvents(component: UIComponent): string {
  if (!component.events || component.events.length === 0) {
    return '';
  }
  
  const events = component.events.map(event => {
    const eventName = event.event;
    const handlerName = `handle${capitalize(eventName)}${capitalize(component.id)}`;
    return `@${eventName}="${handlerName}"`;
  });
  
  return ' ' + events.join(' ');
}

/**
 * Generate Vue script section
 */
function generateVueScript(schema: UISchema, typescript: boolean): string {
  const lines: string[] = [];
  
  // Import ref for reactive data
  lines.push("import { ref, reactive } from 'vue';");
  lines.push('');
  
  // Generate reactive data
  if (schema.data) {
    if (typescript) {
      lines.push('// Component data');
      lines.push(`const data = reactive(${JSON.stringify(schema.data, null, 2)});`);
    } else {
      lines.push('// Component data');
      lines.push(`const data = reactive(${JSON.stringify(schema.data, null, 2)});`);
    }
    lines.push('');
  }
  
  // Generate event handlers
  const handlers = collectEventHandlers(schema.root);
  if (handlers.length > 0) {
    lines.push('// Event handlers');
    for (const handler of handlers) {
      lines.push(`function ${handler.name}(event${typescript ? ': Event' : ''}) {`);
      lines.push(`  console.log('${handler.event} triggered on ${handler.componentId}', event);`);
      if (handler.action) {
        lines.push(`  // Action: ${JSON.stringify(handler.action)}`);
      }
      lines.push('}');
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Generate Vue styles
 */
function generateVueStyles(): string {
  return `/* Generated styles */
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
`;
}

/**
 * Convert binding expression to Vue syntax
 */
function convertBindingToVue(text: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    return `{{ ${convertBindingPathToVue(path.trim())} }}`;
  });
}

/**
 * Convert binding path to Vue data access
 */
function convertBindingPathToVue(path: string): string {
  // Remove {{ }} if present
  const cleanPath = path.replace(/^\{\{|\}\}$/g, '').trim();
  // Prefix with data. if not already
  if (!cleanPath.startsWith('data.')) {
    return `data.${cleanPath}`;
  }
  return cleanPath;
}

/**
 * Get default CSS class for component type
 */
function getDefaultClassForType(type: string): string {
  const classMap: Record<string, string> = {
    container: 'container',
    card: 'card',
    button: 'button',
    input: 'input',
    textarea: 'input',
    text: 'text',
    heading: 'heading',
  };
  return classMap[type.toLowerCase()] || '';
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Collect event handlers from component tree
 */
interface EventHandlerInfo {
  name: string;
  event: string;
  componentId: string;
  action?: unknown;
}

function collectEventHandlers(component: UIComponent): EventHandlerInfo[] {
  const handlers: EventHandlerInfo[] = [];
  
  function traverse(comp: UIComponent) {
    if (comp.events) {
      for (const event of comp.events) {
        handlers.push({
          name: `handle${capitalize(event.event)}${capitalize(comp.id)}`,
          event: event.event,
          componentId: comp.id,
          action: event.action,
        });
      }
    }
    if (comp.children) {
      comp.children.forEach(traverse);
    }
  }
  
  traverse(component);
  return handlers;
}


/**
 * React export options
 */
export interface ReactExportOptions {
  /** Component name (PascalCase) */
  componentName?: string;
  /** Use TypeScript */
  typescript?: boolean;
  /** Use functional component with hooks */
  functional?: boolean;
}

/**
 * Export UISchema to React JSX/TSX
 * 
 * @param schema - The UISchema to export
 * @param options - Export options
 * @returns ExportResult with React component code
 */
export function exportToReact(
  schema: UISchema,
  options: ReactExportOptions = {}
): ExportResult {
  const {
    componentName = 'GeneratedComponent',
    typescript = true,
  } = options;

  try {
    const imports = generateReactImports();
    const dataType = typescript ? generateDataType(schema.data) : '';
    const component = generateReactComponent(schema, componentName, typescript);

    const content = `${imports}
${dataType}
${component}

export default ${componentName};
`;

    const filename = `${componentName}.${typescript ? 'tsx' : 'jsx'}`;

    return {
      success: true,
      content,
      filename,
      mimeType: 'text/plain',
    };
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      error: `React export failed: ${error.message}`,
    };
  }
}

/**
 * Generate React imports
 */
function generateReactImports(): string {
  const imports: string[] = [];
  
  imports.push("import React, { useState } from 'react';");
  
  return imports.join('\n');
}

/**
 * Generate TypeScript type for data
 */
function generateDataType(data?: DataContext): string {
  if (!data) return '';
  
  const lines: string[] = [];
  lines.push('interface ComponentData {');
  
  for (const [key, value] of Object.entries(data)) {
    const type = inferTypeFromValue(value);
    lines.push(`  ${key}: ${type};`);
  }
  
  lines.push('}');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Infer TypeScript type from value
 */
function inferTypeFromValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const itemType = inferTypeFromValue(value[0]);
    return `${itemType}[]`;
  }
  if (typeof value === 'object') {
    return 'Record<string, unknown>';
  }
  return typeof value;
}

/**
 * Generate React component code
 */
function generateReactComponent(
  schema: UISchema,
  componentName: string,
  typescript: boolean
): string {
  const lines: string[] = [];
  
  // Component signature
  if (typescript) {
    lines.push(`function ${componentName}(): JSX.Element {`);
  } else {
    lines.push(`function ${componentName}() {`);
  }
  
  // State for data
  if (schema.data) {
    const dataStr = JSON.stringify(schema.data, null, 2)
      .split('\n')
      .map((line, i) => i === 0 ? line : '  ' + line)
      .join('\n');
    lines.push(`  const [data, setData] = useState(${dataStr});`);
    lines.push('');
  }
  
  // Event handlers
  const handlers = collectEventHandlers(schema.root);
  if (handlers.length > 0) {
    for (const handler of handlers) {
      if (typescript) {
        lines.push(`  const ${handler.name} = (event: React.SyntheticEvent) => {`);
      } else {
        lines.push(`  const ${handler.name} = (event) => {`);
      }
      lines.push(`    console.log('${handler.event} triggered on ${handler.componentId}', event);`);
      if (handler.action) {
        lines.push(`    // Action: ${JSON.stringify(handler.action)}`);
      }
      lines.push('  };');
      lines.push('');
    }
  }
  
  // Render
  lines.push('  return (');
  const jsx = generateReactJSX(schema.root, schema.data, 4);
  lines.push(jsx);
  lines.push('  );');
  lines.push('}');
  
  return lines.join('\n');
}

/**
 * Generate React JSX from UIComponent tree
 */
function generateReactJSX(component: UIComponent, data?: DataContext, indent: number = 0): string {
  const spaces = ' '.repeat(indent);
  const tag = mapComponentToReactTag(component.type);
  const attrs = generateReactAttributes(component);
  const events = generateReactEvents(component);
  
  let content = '';
  
  // Handle text content
  if (component.text) {
    content = convertBindingToReact(component.text);
  }
  
  // Handle binding
  if (component.binding) {
    content = `{${convertBindingPathToReact(component.binding)}}`;
  }
  
  // Handle children
  if (component.children && component.children.length > 0) {
    const childrenContent = component.children
      .map(child => generateReactJSX(child, data, indent + 2))
      .join('\n');
    content = `\n${childrenContent}\n${spaces}`;
  }
  
  // Handle loop
  if (component.loop) {
    const itemName = component.loop.itemName || 'item';
    const indexName = component.loop.indexName || 'index';
    const source = convertBindingPathToReact(component.loop.source);
    
    const innerJSX = generateReactJSXInner(component, data, indent + 2, itemName, indexName);
    return `${spaces}{${source}.map((${itemName}, ${indexName}) => (
${innerJSX}
${spaces}))}`;
  }
  
  // Handle condition
  if (component.condition) {
    const condition = convertBindingPathToReact(component.condition);
    const innerJSX = generateReactJSXInner(component, data, indent + 2);
    return `${spaces}{${condition} && (
${innerJSX}
${spaces})}`;
  }
  
  const allAttrs = `${attrs}${events}`.trim();
  const attrStr = allAttrs ? ` ${allAttrs}` : '';
  
  if (content) {
    return `${spaces}<${tag}${attrStr}>${content}</${tag}>`;
  }
  
  return `${spaces}<${tag}${attrStr} />`;
}

/**
 * Generate inner JSX without loop/condition wrapper
 */
function generateReactJSXInner(
  component: UIComponent,
  data?: DataContext,
  indent: number = 0,
  itemName?: string,
  indexName?: string
): string {
  const spaces = ' '.repeat(indent);
  const tag = mapComponentToReactTag(component.type);
  const attrs = generateReactAttributes(component);
  const events = generateReactEvents(component);
  
  let content = '';
  
  if (component.text) {
    content = convertBindingToReact(component.text, itemName);
  }
  
  if (component.binding) {
    content = `{${convertBindingPathToReact(component.binding, itemName)}}`;
  }
  
  if (component.children && component.children.length > 0) {
    const childrenContent = component.children
      .map(child => generateReactJSX(child, data, indent + 2))
      .join('\n');
    content = `\n${childrenContent}\n${spaces}`;
  }
  
  const keyAttr = indexName ? ` key={${indexName}}` : '';
  const allAttrs = `${keyAttr}${attrs}${events}`.trim();
  const attrStr = allAttrs ? ` ${allAttrs}` : '';
  
  if (content) {
    return `${spaces}<${tag}${attrStr}>${content}</${tag}>`;
  }
  
  return `${spaces}<${tag}${attrStr} />`;
}

/**
 * Map UIComponent type to React tag
 */
function mapComponentToReactTag(type: string): string {
  const tagMap: Record<string, string> = {
    container: 'div',
    card: 'div',
    button: 'button',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    checkbox: 'input',
    radio: 'input',
    switch: 'input',
    slider: 'input',
    table: 'table',
    list: 'ul',
    image: 'img',
    text: 'span',
    heading: 'h2',
    badge: 'span',
    avatar: 'img',
    alert: 'div',
    dialog: 'dialog',
    tabs: 'div',
    accordion: 'div',
    form: 'form',
    separator: 'hr',
  };
  
  return tagMap[type.toLowerCase()] || 'div';
}

/**
 * Generate React attributes from component props and style
 */
function generateReactAttributes(component: UIComponent): string {
  const attrs: string[] = [];
  
  // Add className attribute
  const classes: string[] = [];
  if (component.style?.className) {
    classes.push(component.style.className);
  }
  classes.push(getDefaultClassForType(component.type));
  
  const classStr = classes.filter(Boolean).join(' ');
  if (classStr) {
    attrs.push(`className="${classStr}"`);
  }
  
  // Add props as attributes
  if (component.props) {
    for (const [key, value] of Object.entries(component.props)) {
      const reactKey = key === 'class' ? 'className' : key;
      if (typeof value === 'string') {
        if (value.includes('{{')) {
          attrs.push(`${reactKey}={${convertBindingPathToReact(value)}}`);
        } else {
          attrs.push(`${reactKey}="${value}"`);
        }
      } else if (typeof value === 'boolean') {
        if (value) {
          attrs.push(`${reactKey}={true}`);
        }
      } else if (typeof value === 'number') {
        attrs.push(`${reactKey}={${value}}`);
      }
    }
  }
  
  // Handle specific component types
  if (component.type.toLowerCase() === 'checkbox' || component.type.toLowerCase() === 'radio') {
    attrs.push(`type="${component.type.toLowerCase()}"`);
  }
  if (component.type.toLowerCase() === 'slider') {
    attrs.push('type="range"');
  }
  if (component.type.toLowerCase() === 'switch') {
    attrs.push('type="checkbox"');
  }
  
  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

/**
 * Generate React event bindings
 */
function generateReactEvents(component: UIComponent): string {
  if (!component.events || component.events.length === 0) {
    return '';
  }
  
  const events = component.events.map(event => {
    const eventName = toReactEventName(event.event);
    const handlerName = `handle${capitalize(event.event)}${capitalize(component.id)}`;
    return `${eventName}={${handlerName}}`;
  });
  
  return ' ' + events.join(' ');
}

/**
 * Convert event name to React event prop name
 */
function toReactEventName(event: string): string {
  const eventMap: Record<string, string> = {
    click: 'onClick',
    change: 'onChange',
    submit: 'onSubmit',
    focus: 'onFocus',
    blur: 'onBlur',
    keydown: 'onKeyDown',
    keyup: 'onKeyUp',
    keypress: 'onKeyPress',
    mouseenter: 'onMouseEnter',
    mouseleave: 'onMouseLeave',
    input: 'onInput',
  };
  
  return eventMap[event.toLowerCase()] || `on${capitalize(event)}`;
}

/**
 * Convert binding expression to React syntax
 */
function convertBindingToReact(text: string, itemName?: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    return `{${convertBindingPathToReact(path.trim(), itemName)}}`;
  });
}

/**
 * Convert binding path to React data access
 */
function convertBindingPathToReact(path: string, itemName?: string): string {
  // Remove {{ }} if present
  const cleanPath = path.replace(/^\{\{|\}\}$/g, '').trim();
  
  // If we're in a loop context and path starts with item variable
  if (itemName && cleanPath.startsWith(itemName)) {
    return cleanPath;
  }
  
  // Prefix with data. if not already
  if (!cleanPath.startsWith('data.') && !cleanPath.startsWith('data[')) {
    return `data.${cleanPath}`;
  }
  return cleanPath;
}

/**
 * Generate dependency declaration for package.json
 */
export interface DependencyInfo {
  name: string;
  version: string;
  dev?: boolean;
}

/**
 * Get dependencies for Vue3 export
 */
export function getVue3Dependencies(): DependencyInfo[] {
  return [
    { name: 'vue', version: '^3.4.0' },
    { name: '@vitejs/plugin-vue', version: '^5.0.0', dev: true },
    { name: 'vite', version: '^5.0.0', dev: true },
  ];
}

/**
 * Get dependencies for React export
 */
export function getReactDependencies(): DependencyInfo[] {
  return [
    { name: 'react', version: '^18.2.0' },
    { name: 'react-dom', version: '^18.2.0' },
    { name: '@types/react', version: '^18.2.0', dev: true },
    { name: '@types/react-dom', version: '^18.2.0', dev: true },
    { name: 'vite', version: '^5.0.0', dev: true },
    { name: '@vitejs/plugin-react', version: '^4.0.0', dev: true },
  ];
}

/**
 * Trigger file download in browser
 */
export function downloadExport(result: ExportResult): void {
  if (!result.success || !result.content) {
    console.error('Cannot download: export failed');
    return;
  }
  
  const blob = new Blob([result.content], { type: result.mimeType || 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename || 'export.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
