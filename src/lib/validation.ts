/**
 * Schema Validation
 * 
 * Functions for validating JSON syntax and UI Schema structure.
 * Provides detailed error information including position and path.
 */

import type { UISchema, ValidationResult, ValidationError } from '../types';

/**
 * JSON validation result with detailed error information
 */
export interface JSONValidationResult {
  /** Whether the JSON is valid */
  valid: boolean;
  /** Parsed value if valid */
  value?: unknown;
  /** Error details if invalid */
  error?: JSONValidationError;
}

/**
 * Detailed JSON validation error
 */
export interface JSONValidationError {
  /** Error message */
  message: string;
  /** Character position in the input string (0-based) */
  position?: number;
  /** Line number (1-based) */
  line?: number;
  /** Column number (1-based) */
  column?: number;
}

/**
 * Calculate line and column from position in a string
 */
function getLineAndColumn(input: string, position: number): { line: number; column: number } {
  const lines = input.substring(0, position).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

/**
 * Extract position from JSON parse error message
 */
function extractPositionFromError(errorMessage: string): number | undefined {
  // Different JS engines format the error differently
  // V8: "... at position 5"
  // SpiderMonkey: "... at line 1 column 6"
  const positionMatch = errorMessage.match(/position\s+(\d+)/i);
  if (positionMatch) {
    return parseInt(positionMatch[1], 10);
  }
  return undefined;
}

/**
 * Validate JSON syntax
 * 
 * @param input - The JSON string to validate
 * @returns JSONValidationResult with parsed value or detailed error
 */
export function validateJSON(input: string): JSONValidationResult {
  // Handle empty or whitespace-only input
  if (!input || input.trim() === '') {
    return {
      valid: false,
      error: {
        message: 'Empty input: JSON string is empty or contains only whitespace',
        position: 0,
        line: 1,
        column: 1,
      },
    };
  }

  try {
    const value = JSON.parse(input);
    return {
      valid: true,
      value,
    };
  } catch (e) {
    const syntaxError = e as SyntaxError;
    const position = extractPositionFromError(syntaxError.message);
    
    let line: number | undefined;
    let column: number | undefined;
    
    if (position !== undefined) {
      const lineCol = getLineAndColumn(input, position);
      line = lineCol.line;
      column = lineCol.column;
    }

    return {
      valid: false,
      error: {
        message: syntaxError.message,
        position,
        line,
        column,
      },
    };
  }
}


/**
 * UI Schema validation result
 */
export interface UISchemaValidationResult extends ValidationResult {
  /** The validated schema if valid */
  schema?: UISchema;
}

/**
 * Validate UI Schema structure
 * 
 * Validates that a parsed object conforms to the UISchema structure:
 * - Required fields (version, root)
 * - Component structure (id, type required for each component)
 * - Component reference integrity (all children are valid components)
 * 
 * @param input - The object to validate (typically from JSON.parse)
 * @returns UISchemaValidationResult with validation errors or validated schema
 */
export function validateUISchema(input: unknown): UISchemaValidationResult {
  const errors: ValidationError[] = [];

  // Check if input is an object
  if (typeof input !== 'object' || input === null) {
    errors.push({
      path: '',
      message: 'Schema must be an object',
      code: 'INVALID_TYPE',
    });
    return { valid: false, errors };
  }

  const obj = input as Record<string, unknown>;

  // Validate version field
  if (!('version' in obj)) {
    errors.push({
      path: 'version',
      message: 'Missing required field: version',
      code: 'MISSING_FIELD',
    });
  } else if (typeof obj.version !== 'string') {
    errors.push({
      path: 'version',
      message: 'Field "version" must be a string',
      code: 'INVALID_TYPE',
    });
  } else if (obj.version.trim() === '') {
    errors.push({
      path: 'version',
      message: 'Field "version" cannot be empty',
      code: 'INVALID_VALUE',
    });
  }

  // Validate root field
  if (!('root' in obj)) {
    errors.push({
      path: 'root',
      message: 'Missing required field: root',
      code: 'MISSING_FIELD',
    });
  } else {
    const componentErrors = validateComponentRecursive(obj.root, 'root', new Set<string>());
    errors.push(...componentErrors);
  }

  // Validate data field if present
  if ('data' in obj && obj.data !== undefined && obj.data !== null) {
    if (typeof obj.data !== 'object') {
      errors.push({
        path: 'data',
        message: 'Field "data" must be an object',
        code: 'INVALID_TYPE',
      });
    }
  }

  // Validate meta field if present
  if ('meta' in obj && obj.meta !== undefined && obj.meta !== null) {
    if (typeof obj.meta !== 'object') {
      errors.push({
        path: 'meta',
        message: 'Field "meta" must be an object',
        code: 'INVALID_TYPE',
      });
    }
  }

  if (errors.length === 0) {
    return {
      valid: true,
      errors: [],
      schema: input as UISchema,
    };
  }

  return { valid: false, errors };
}

/**
 * Validate a UIComponent structure recursively
 * Also checks for duplicate component IDs
 */
function validateComponentRecursive(
  obj: unknown,
  path: string,
  seenIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if component is an object
  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      path,
      message: `Component at "${path}" must be an object`,
      code: 'INVALID_TYPE',
    });
    return errors;
  }

  const component = obj as Record<string, unknown>;

  // Validate id field
  if (!('id' in component)) {
    errors.push({
      path: `${path}.id`,
      message: `Missing required field: id at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof component.id !== 'string') {
    errors.push({
      path: `${path}.id`,
      message: `Field "id" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
    });
  } else if (component.id.trim() === '') {
    errors.push({
      path: `${path}.id`,
      message: `Field "id" cannot be empty at "${path}"`,
      code: 'INVALID_VALUE',
    });
  } else {
    // Check for duplicate IDs
    if (seenIds.has(component.id)) {
      errors.push({
        path: `${path}.id`,
        message: `Duplicate component id "${component.id}" at "${path}"`,
        code: 'DUPLICATE_ID',
      });
    } else {
      seenIds.add(component.id);
    }
  }

  // Validate type field
  if (!('type' in component)) {
    errors.push({
      path: `${path}.type`,
      message: `Missing required field: type at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof component.type !== 'string') {
    errors.push({
      path: `${path}.type`,
      message: `Field "type" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
    });
  } else if (component.type.trim() === '') {
    errors.push({
      path: `${path}.type`,
      message: `Field "type" cannot be empty at "${path}"`,
      code: 'INVALID_VALUE',
    });
  }

  // Validate props field if present
  if ('props' in component && component.props !== undefined && component.props !== null) {
    if (typeof component.props !== 'object' || Array.isArray(component.props)) {
      errors.push({
        path: `${path}.props`,
        message: `Field "props" must be an object at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  // Validate style field if present
  if ('style' in component && component.style !== undefined && component.style !== null) {
    if (typeof component.style !== 'object' || Array.isArray(component.style)) {
      errors.push({
        path: `${path}.style`,
        message: `Field "style" must be an object at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  // Validate events field if present
  if ('events' in component && component.events !== undefined && component.events !== null) {
    if (!Array.isArray(component.events)) {
      errors.push({
        path: `${path}.events`,
        message: `Field "events" must be an array at "${path}"`,
        code: 'INVALID_TYPE',
      });
    } else {
      component.events.forEach((event, index) => {
        const eventErrors = validateEventBinding(event, `${path}.events[${index}]`);
        errors.push(...eventErrors);
      });
    }
  }

  // Validate loop field if present
  if ('loop' in component && component.loop !== undefined && component.loop !== null) {
    const loopErrors = validateLoopConfig(component.loop, `${path}.loop`);
    errors.push(...loopErrors);
  }

  // Recursively validate children
  if ('children' in component && component.children !== undefined && component.children !== null) {
    if (!Array.isArray(component.children)) {
      errors.push({
        path: `${path}.children`,
        message: `Field "children" must be an array at "${path}"`,
        code: 'INVALID_TYPE',
      });
    } else {
      component.children.forEach((child, index) => {
        const childErrors = validateComponentRecursive(
          child,
          `${path}.children[${index}]`,
          seenIds
        );
        errors.push(...childErrors);
      });
    }
  }

  return errors;
}

/**
 * Validate an EventBinding structure
 */
function validateEventBinding(obj: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      path,
      message: `Event binding at "${path}" must be an object`,
      code: 'INVALID_TYPE',
    });
    return errors;
  }

  const event = obj as Record<string, unknown>;

  // Validate event field
  if (!('event' in event)) {
    errors.push({
      path: `${path}.event`,
      message: `Missing required field: event at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof event.event !== 'string') {
    errors.push({
      path: `${path}.event`,
      message: `Field "event" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
    });
  }

  // Validate action field
  if (!('action' in event)) {
    errors.push({
      path: `${path}.action`,
      message: `Missing required field: action at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof event.action !== 'object' || event.action === null) {
    errors.push({
      path: `${path}.action`,
      message: `Field "action" must be an object at "${path}"`,
      code: 'INVALID_TYPE',
    });
  } else {
    const action = event.action as Record<string, unknown>;
    if (!('type' in action)) {
      errors.push({
        path: `${path}.action.type`,
        message: `Missing required field: type in action at "${path}"`,
        code: 'MISSING_FIELD',
      });
    } else if (typeof action.type !== 'string') {
      errors.push({
        path: `${path}.action.type`,
        message: `Field "type" must be a string in action at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  return errors;
}

/**
 * Validate a loop configuration
 */
function validateLoopConfig(obj: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      path,
      message: `Loop config at "${path}" must be an object`,
      code: 'INVALID_TYPE',
    });
    return errors;
  }

  const loop = obj as Record<string, unknown>;

  // Validate source field (required)
  if (!('source' in loop)) {
    errors.push({
      path: `${path}.source`,
      message: `Missing required field: source at "${path}"`,
      code: 'MISSING_FIELD',
    });
  } else if (typeof loop.source !== 'string') {
    errors.push({
      path: `${path}.source`,
      message: `Field "source" must be a string at "${path}"`,
      code: 'INVALID_TYPE',
    });
  }

  // Validate itemName if present
  if ('itemName' in loop && loop.itemName !== undefined) {
    if (typeof loop.itemName !== 'string') {
      errors.push({
        path: `${path}.itemName`,
        message: `Field "itemName" must be a string at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  // Validate indexName if present
  if ('indexName' in loop && loop.indexName !== undefined) {
    if (typeof loop.indexName !== 'string') {
      errors.push({
        path: `${path}.indexName`,
        message: `Field "indexName" must be a string at "${path}"`,
        code: 'INVALID_TYPE',
      });
    }
  }

  return errors;
}
