/**
 * Data Binding System
 * 
 * Functions for parsing and resolving data binding expressions.
 * Supports expressions like {{path.to.value}} and {{items[0].name}}.
 * 
 * Requirements: 5.4
 */

import type { DataContext } from '../types';

/**
 * Result of resolving a binding expression
 */
export interface BindingResult {
  /** Whether the binding was successfully resolved */
  success: boolean;
  /** The resolved value (if successful) */
  value?: unknown;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Parsed path segment
 */
export type PathSegment =
  | { type: 'property'; name: string }
  | { type: 'index'; index: number };

/**
 * Result of parsing a binding expression
 */
export interface ParseResult {
  /** Whether parsing was successful */
  success: boolean;
  /** The parsed path segments (if successful) */
  segments?: PathSegment[];
  /** The original expression without braces */
  expression?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Regular expression to match binding expressions: {{...}}
 */
const BINDING_PATTERN = /\{\{([^}]+)\}\}/g;

/**
 * Regular expression to match a single binding expression
 */
const SINGLE_BINDING_PATTERN = /^\{\{([^}]+)\}\}$/;

/**
 * Parse a path expression into segments
 * Supports dot notation (a.b.c) and bracket notation (a[0].b)
 * 
 * @param expression - The path expression (without {{ }})
 * @returns Array of path segments
 */
export function parsePath(expression: string): ParseResult {
  if (!expression || expression.trim() === '') {
    return {
      success: false,
      error: 'Empty expression',
    };
  }

  const trimmed = expression.trim();
  const segments: PathSegment[] = [];
  let current = '';
  let i = 0;

  while (i < trimmed.length) {
    const char = trimmed[i];

    if (char === '.') {
      // Dot separator - push current property if exists
      if (current) {
        segments.push({ type: 'property', name: current });
        current = '';
      } else if (segments.length === 0) {
        // Leading dot is invalid
        return {
          success: false,
          error: 'Invalid expression: leading dot',
        };
      }
      i++;
    } else if (char === '[') {
      // Start of bracket notation
      if (current) {
        segments.push({ type: 'property', name: current });
        current = '';
      }

      // Find closing bracket
      const closeBracket = trimmed.indexOf(']', i);
      if (closeBracket === -1) {
        return {
          success: false,
          error: 'Invalid expression: unclosed bracket',
        };
      }

      const indexStr = trimmed.substring(i + 1, closeBracket);
      const index = parseInt(indexStr, 10);

      if (isNaN(index) || index < 0) {
        return {
          success: false,
          error: `Invalid array index: ${indexStr}`,
        };
      }

      segments.push({ type: 'index', index });
      i = closeBracket + 1;
    } else {
      // Regular character - add to current property name
      current += char;
      i++;
    }
  }

  // Push final segment if exists
  if (current) {
    segments.push({ type: 'property', name: current });
  }

  if (segments.length === 0) {
    return {
      success: false,
      error: 'Empty path expression',
    };
  }

  return {
    success: true,
    segments,
    expression: trimmed,
  };
}


/**
 * Parse a binding expression (with {{ }} delimiters)
 * 
 * @param binding - The binding expression (e.g., "{{user.name}}")
 * @returns ParseResult with path segments or error
 */
export function parseBindingExpression(binding: string): ParseResult {
  if (!binding || binding.trim() === '') {
    return {
      success: false,
      error: 'Empty binding expression',
    };
  }

  const match = binding.match(SINGLE_BINDING_PATTERN);
  if (!match) {
    return {
      success: false,
      error: 'Invalid binding format: must be {{expression}}',
    };
  }

  return parsePath(match[1]);
}

/**
 * Resolve a path against a data context
 * 
 * @param segments - The parsed path segments
 * @param data - The data context to resolve against
 * @returns The resolved value or undefined if path doesn't exist
 */
export function resolvePath(segments: PathSegment[], data: DataContext): BindingResult {
  let current: unknown = data;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return {
        success: false,
        error: `Cannot access property of ${current}`,
      };
    }

    if (segment.type === 'property') {
      if (typeof current !== 'object') {
        return {
          success: false,
          error: `Cannot access property "${segment.name}" of non-object`,
        };
      }
      current = (current as Record<string, unknown>)[segment.name];
    } else {
      // index access
      if (!Array.isArray(current)) {
        return {
          success: false,
          error: `Cannot access index ${segment.index} of non-array`,
        };
      }
      if (segment.index >= current.length) {
        return {
          success: false,
          error: `Array index ${segment.index} out of bounds (length: ${current.length})`,
        };
      }
      current = current[segment.index];
    }
  }

  return {
    success: true,
    value: current,
  };
}

/**
 * Resolve a single binding expression against a data context
 * 
 * @param binding - The binding expression (e.g., "{{user.name}}")
 * @param data - The data context
 * @returns BindingResult with resolved value or error
 */
export function resolveBinding(binding: string, data: DataContext): BindingResult {
  const parseResult = parseBindingExpression(binding);
  if (!parseResult.success || !parseResult.segments) {
    return {
      success: false,
      error: parseResult.error,
    };
  }

  return resolvePath(parseResult.segments, data);
}

/**
 * Resolve all binding expressions in a string
 * Replaces {{...}} expressions with their resolved values
 * 
 * @param template - The template string with binding expressions
 * @param data - The data context
 * @returns The resolved string with bindings replaced
 */
export function resolveBindings(template: string, data: DataContext): string {
  if (!template) {
    return template;
  }

  return template.replace(BINDING_PATTERN, (match, expression) => {
    const parseResult = parsePath(expression);
    if (!parseResult.success || !parseResult.segments) {
      return match; // Keep original if parsing fails
    }

    const resolveResult = resolvePath(parseResult.segments, data);
    if (!resolveResult.success) {
      return match; // Keep original if resolution fails
    }

    // Convert value to string
    const value = resolveResult.value;
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  });
}


/**
 * Data field information extracted from a UISchema
 */
export interface DataField {
  /** The binding expression (e.g., "{{user.name}}") */
  binding: string;
  /** The path expression without braces (e.g., "user.name") */
  path: string;
  /** The parsed path segments */
  segments: PathSegment[];
  /** The component ID where this binding was found */
  componentId: string;
  /** The property where this binding was found (e.g., "text", "binding", "props.label") */
  property: string;
}

/**
 * Import UIComponent and UISchema for extraction
 */
import type { UIComponent, UISchema } from '../types';

/**
 * Extract all data binding expressions from a UIComponent recursively
 * 
 * @param component - The component to extract bindings from
 * @param fields - Array to collect found fields
 * @param propertyPrefix - Prefix for nested property paths
 */
function extractFromComponent(
  component: UIComponent,
  fields: DataField[],
  propertyPrefix: string = ''
): void {
  const componentId = component.id;

  // Check direct binding property
  if (component.binding) {
    const parseResult = parseBindingExpression(component.binding);
    if (parseResult.success && parseResult.segments && parseResult.expression) {
      fields.push({
        binding: component.binding,
        path: parseResult.expression,
        segments: parseResult.segments,
        componentId,
        property: propertyPrefix ? `${propertyPrefix}.binding` : 'binding',
      });
    }
  }

  // Check text property for bindings
  if (component.text) {
    extractBindingsFromString(
      component.text,
      componentId,
      propertyPrefix ? `${propertyPrefix}.text` : 'text',
      fields
    );
  }

  // Check props for bindings
  if (component.props) {
    extractBindingsFromObject(
      component.props,
      componentId,
      propertyPrefix ? `${propertyPrefix}.props` : 'props',
      fields
    );
  }

  // Check loop source
  if (component.loop?.source) {
    const parseResult = parsePath(component.loop.source);
    if (parseResult.success && parseResult.segments) {
      fields.push({
        binding: `{{${component.loop.source}}}`,
        path: component.loop.source,
        segments: parseResult.segments,
        componentId,
        property: propertyPrefix ? `${propertyPrefix}.loop.source` : 'loop.source',
      });
    }
  }

  // Check condition for bindings
  if (component.condition) {
    extractBindingsFromString(
      component.condition,
      componentId,
      propertyPrefix ? `${propertyPrefix}.condition` : 'condition',
      fields
    );
  }

  // Recursively process children
  if (component.children) {
    component.children.forEach((child, index) => {
      extractFromComponent(child, fields, `children[${index}]`);
    });
  }
}

/**
 * Extract bindings from a string value
 */
function extractBindingsFromString(
  value: string,
  componentId: string,
  property: string,
  fields: DataField[]
): void {
  const bindingPattern = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = bindingPattern.exec(value)) !== null) {
    const expression = match[1];
    const parseResult = parsePath(expression);
    if (parseResult.success && parseResult.segments) {
      fields.push({
        binding: match[0],
        path: expression,
        segments: parseResult.segments,
        componentId,
        property,
      });
    }
  }
}

/**
 * Extract bindings from an object (props)
 */
function extractBindingsFromObject(
  obj: Record<string, unknown>,
  componentId: string,
  propertyPrefix: string,
  fields: DataField[]
): void {
  for (const [key, value] of Object.entries(obj)) {
    const property = `${propertyPrefix}.${key}`;
    
    if (typeof value === 'string') {
      extractBindingsFromString(value, componentId, property, fields);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      extractBindingsFromObject(
        value as Record<string, unknown>,
        componentId,
        property,
        fields
      );
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          extractBindingsFromString(item, componentId, `${property}[${index}]`, fields);
        } else if (typeof item === 'object' && item !== null) {
          extractBindingsFromObject(
            item as Record<string, unknown>,
            componentId,
            `${property}[${index}]`,
            fields
          );
        }
      });
    }
  }
}

/**
 * Extract all data binding fields from a UISchema
 * 
 * @param schema - The UISchema to extract bindings from
 * @returns Array of DataField objects representing all bindings found
 */
export function extractDataFields(schema: UISchema): DataField[] {
  const fields: DataField[] = [];
  extractFromComponent(schema.root, fields);
  return fields;
}

/**
 * Get unique binding paths from a UISchema
 * 
 * @param schema - The UISchema to extract paths from
 * @returns Array of unique path strings
 */
export function getUniquePaths(schema: UISchema): string[] {
  const fields = extractDataFields(schema);
  const paths = new Set(fields.map(f => f.path));
  return Array.from(paths);
}
