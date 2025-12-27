/**
 * shadcn-ui Component Registration
 * 
 * Registers all shadcn-ui base components with the ComponentRegistry.
 * Each component includes a propsSchema for validation.
 * 
 * Requirements: 6.1, 6.3
 */

import React from 'react';
import { ComponentRegistry, defaultRegistry } from './component-registry';
import type { PropSchema } from './component-registry';

// Import shadcn-ui components
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../components/ui/table';
import { Label } from '../components/ui/label';

/**
 * Common prop schemas used across multiple components
 */
const commonProps: Record<string, PropSchema> = {
  className: {
    type: 'string',
    required: false,
    description: 'Additional CSS class names',
  },
  children: {
    type: 'object',
    required: false,
    description: 'Child elements',
  },
};

/**
 * Register all shadcn-ui components to a registry
 */
export function registerShadcnComponents(registry: ComponentRegistry = defaultRegistry): void {
  // Button component
  registry.register({
    name: 'Button',
    component: Button,
    category: 'input',
    description: 'A clickable button component with multiple variants',
    propsSchema: {
      ...commonProps,
      variant: {
        type: 'string',
        required: false,
        description: 'Button style variant',
        enum: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      },
      size: {
        type: 'string',
        required: false,
        description: 'Button size',
        enum: ['default', 'sm', 'lg', 'icon'],
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the button is disabled',
      },
      asChild: {
        type: 'boolean',
        required: false,
        description: 'Render as child element',
      },
      onClick: {
        type: 'function',
        required: false,
        description: 'Click event handler',
      },
    },
  });

  // Input component
  registry.register({
    name: 'Input',
    component: Input,
    category: 'input',
    description: 'A text input field component',
    propsSchema: {
      ...commonProps,
      type: {
        type: 'string',
        required: false,
        description: 'Input type',
        enum: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
      },
      placeholder: {
        type: 'string',
        required: false,
        description: 'Placeholder text',
      },
      value: {
        type: 'string',
        required: false,
        description: 'Input value',
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Whether the input is disabled',
      },
      onChange: {
        type: 'function',
        required: false,
        description: 'Change event handler',
      },
    },
  });

  // Card components
  registry.register({
    name: 'Card',
    component: Card,
    category: 'layout',
    description: 'A card container component',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardHeader',
    component: CardHeader,
    category: 'layout',
    description: 'Card header section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardTitle',
    component: CardTitle,
    category: 'layout',
    description: 'Card title element',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardDescription',
    component: CardDescription,
    category: 'layout',
    description: 'Card description text',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardContent',
    component: CardContent,
    category: 'layout',
    description: 'Card content section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'CardFooter',
    component: CardFooter,
    category: 'layout',
    description: 'Card footer section',
    propsSchema: commonProps,
  });

  // Table components
  registry.register({
    name: 'Table',
    component: Table,
    category: 'display',
    description: 'A table component for displaying tabular data',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableHeader',
    component: TableHeader,
    category: 'display',
    description: 'Table header section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableBody',
    component: TableBody,
    category: 'display',
    description: 'Table body section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableFooter',
    component: TableFooter,
    category: 'display',
    description: 'Table footer section',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableHead',
    component: TableHead,
    category: 'display',
    description: 'Table header cell',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableRow',
    component: TableRow,
    category: 'display',
    description: 'Table row element',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableCell',
    component: TableCell,
    category: 'display',
    description: 'Table data cell',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'TableCaption',
    component: TableCaption,
    category: 'display',
    description: 'Table caption element',
    propsSchema: commonProps,
  });

  // Label component
  registry.register({
    name: 'Label',
    component: Label,
    category: 'input',
    description: 'A label component for form elements',
    propsSchema: {
      ...commonProps,
      htmlFor: {
        type: 'string',
        required: false,
        description: 'ID of the associated form element',
      },
    },
  });

  // Text component (simple span wrapper)
  registry.register({
    name: 'Text',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('span', { className, ...rest }, children as React.ReactNode);
    },
    category: 'display',
    description: 'A simple text display component',
    propsSchema: commonProps,
  });

  // Container component (simple div wrapper)
  registry.register({
    name: 'Container',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('div', { className, ...rest }, children as React.ReactNode);
    },
    category: 'layout',
    description: 'A container component for layout purposes',
    propsSchema: commonProps,
  });

  // Register lowercase aliases for LLM compatibility
  // LLMs often generate lowercase component names
  const lowercaseAliases = [
    { name: 'button', component: Button, category: 'input' },
    { name: 'input', component: Input, category: 'input' },
    { name: 'card', component: Card, category: 'layout' },
    { name: 'cardHeader', component: CardHeader, category: 'layout' },
    { name: 'cardTitle', component: CardTitle, category: 'layout' },
    { name: 'cardDescription', component: CardDescription, category: 'layout' },
    { name: 'cardContent', component: CardContent, category: 'layout' },
    { name: 'cardFooter', component: CardFooter, category: 'layout' },
    { name: 'table', component: Table, category: 'display' },
    { name: 'tableHeader', component: TableHeader, category: 'display' },
    { name: 'tableBody', component: TableBody, category: 'display' },
    { name: 'tableFooter', component: TableFooter, category: 'display' },
    { name: 'tableHead', component: TableHead, category: 'display' },
    { name: 'tableRow', component: TableRow, category: 'display' },
    { name: 'tableCell', component: TableCell, category: 'display' },
    { name: 'tableCaption', component: TableCaption, category: 'display' },
    { name: 'label', component: Label, category: 'input' },
  ] as const;

  for (const alias of lowercaseAliases) {
    registry.register({
      name: alias.name,
      component: alias.component,
      category: alias.category,
      description: `Lowercase alias for ${alias.name.charAt(0).toUpperCase() + alias.name.slice(1)}`,
      propsSchema: commonProps,
    });
  }

  // Also register text and container lowercase aliases
  registry.register({
    name: 'text',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('span', { className, ...rest }, children as React.ReactNode);
    },
    category: 'display',
    description: 'Lowercase alias for Text',
    propsSchema: commonProps,
  });

  registry.register({
    name: 'container',
    component: (props: Record<string, unknown>) => {
      const { children, className, ...rest } = props;
      return React.createElement('div', { className, ...rest }, children as React.ReactNode);
    },
    category: 'layout',
    description: 'Lowercase alias for Container',
    propsSchema: commonProps,
  });
}

/**
 * Initialize the default registry with shadcn-ui components
 */
export function initializeDefaultRegistry(): ComponentRegistry {
  registerShadcnComponents(defaultRegistry);
  return defaultRegistry;
}

/**
 * Get a list of all registered component names
 */
export function getRegisteredComponentNames(registry: ComponentRegistry = defaultRegistry): string[] {
  return registry.getAll().map(def => def.name);
}
