/**
 * UI Schema Serialization/Deserialization
 * 
 * Functions for converting UISchema to/from JSON strings.
 * Ensures round-trip consistency for schema persistence.
 */

import type { UISchema, ValidationResult, ValidationError } from '../types';

/**
 * Serialization options
 */
export interface SerializeOptions {
  /** Pretty print with indentation */
  pretty?: boolean;
  /** Indentation spaces (default: 2) */
  indent?: number;
}

/**
 * Deserialization result
 */
export interface DeserializeResult {
  /** Whether deserialization was successful */
  success: boolean;
  /** The deserialized schema (if successful) */
  schema?: UISchema;
  /** Error message (if failed) */
  error?: string;
  /** Error position in the JSON string */
  position?: number;
}

/**
 * Serialize a UISchema to a JSON string
 * 
 * @param schema - The UISchema to serialize
 * @param options - Serialization options
 * @returns JSON string representation of the schema
 */
export function serialize(schema: UISchema, options: SerializeOptions = {}): string {
  const { pretty = true, indent = 2 } = options;
  
  if (pretty) {
    return JSON.stringify(schema, null, indent);
  }
  
  return JSON.stringify(schema);
}


/**
 * Deserialize a JSON string to a UISchema
 * 
 * @param json - The JSON string to deserialize
 * @returns DeserializeResult with the schema or error information
 */
export function deserialize(json: string): DeserializeResult {
  // Handle empty or whitespace-only input
  if (!json || json.trim() === '') {
    return {
      success: false,
      error: 'Empty input: JSON string is empty or contains only whitespace',
    };
  }

  try {
    const parsed = JSON.parse(json);
    
    // Basic structure validation
    const validation = validateBasicStructure(parsed);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.map(e => e.message).join('; '),
      };
    }
    
    return {
      success: true,
      schema: parsed as UISchema,
    };
  } catch (e) {
    const error = e as SyntaxError;
    // Extract position from error message if available
    const positionMatch = error.message.match(/position (\d+)/i);
    const position = positionMatch ? parseInt(positionMatch[1], 10) : undefined;
    
    return {
      success: false,
      error: `JSON parse error: ${error.message}`,
      position,
    };
  }
}

/**
 * Validate basic structure of a parsed object
 * Checks for required fields: version and root
 */
function validateBasicStructure(obj: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      path: '',
      message: 'Schema must be an object',
      code: 'INVALID_TYPE',
    });
    return { valid: false, errors };
  }
  
  const schema = obj as Record<string, unknown>;
  
  // Check version field
  if (!('version' in schema)) {
    errors.push({
      path: 'version',
      message: 'Missing required field: version',
      code: 'MISSING_FIELD',
    });
  } else if (typeof schema.version !== 'string') {
    errors.push({
      path: 'version',
      message: 'Field "version" must be a string',
      code: 'INVALID_TYPE',
    });
  }
  
  // Check root field
  if (!('root' in schema)) {
    errors.push({
      path: 'root',
      message: 'Missing required field: root',
      code: 'MISSING_FIELD',
    });
  } else {
    const rootErrors = validateComponent(schema.root, 'root');
    errors.push(...rootErrors);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}


/**
 * Validate a UIComponent structure recursively
 */
function validateComponent(obj: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      path,
      message: `Component at "${path}" must be an object`,
      code: 'INVALID_TYPE',
    });
    return errors;
  }
  
  const component = obj as Record<string, unknown>;
  
  // Check id field
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
  }
  
  // Check type field
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
  }
  
  // Recursively validate children
  if ('children' in component && component.children !== undefined) {
    if (!Array.isArray(component.children)) {
      errors.push({
        path: `${path}.children`,
        message: `Field "children" must be an array at "${path}"`,
        code: 'INVALID_TYPE',
      });
    } else {
      component.children.forEach((child, index) => {
        const childErrors = validateComponent(child, `${path}.children[${index}]`);
        errors.push(...childErrors);
      });
    }
  }
  
  return errors;
}

/**
 * Check if two UISchemas are structurally equal
 * Used for round-trip consistency testing
 */
export function schemasEqual(a: UISchema, b: UISchema): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
