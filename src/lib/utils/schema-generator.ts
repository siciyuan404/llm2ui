/**
 * Schema Generator
 * 
 * Automatically generates A2UI Schema from component definitions.
 * Supports on-demand loading and batch generation.
 * 
 * @module lib/utils/schema-generator
 * @see Requirements 8.1, 8.2, 8.3, 8.4
 */

import type { UISchema } from '../../types';
import type { 
  ComponentDefinition, 
  PropSchema, 
  PlatformType,
  ComponentRegistry 
} from '../core/component-registry';

/**
 * Options for schema generation
 */
export interface SchemaGeneratorOptions {
  /** Include component examples in generated schema */
  includeExamples?: boolean;
  /** Include deprecated components */
  includeDeprecated?: boolean;
  /** Target platform filter */
  platform?: PlatformType;
}

/**
 * Property schema definition in generated schema
 */
export interface PropSchemaDefinition {
  /** Property type */
  type: string;
  /** Whether required */
  required: boolean;
  /** Default value */
  default?: unknown;
  /** Description */
  description?: string;
  /** Enum values */
  enum?: string[];
}

/**
 * Event definition in generated schema
 */
export interface EventDefinition {
  /** Event name */
  name: string;
  /** Event description */
  description?: string;
  /** Event payload type */
  payloadType?: string;
}

/**
 * Slot definition in generated schema
 */
export interface SlotDefinition {
  /** Slot name */
  name: string;
  /** Slot description */
  description?: string;
}

/**
 * Generated schema for a component
 */
export interface GeneratedSchema {
  /** Component name */
  component: string;
  /** Component version */
  version: string;
  /** Component category */
  category?: string;
  /** Component description */
  description?: string;
  /** Props definitions */
  props: Record<string, PropSchemaDefinition>;
  /** Event definitions */
  events: EventDefinition[];
  /** Slot definitions */
  slots?: SlotDefinition[];
  /** Example schemas */
  examples?: UISchema[];
  /** Supported platforms */
  platforms?: PlatformType[];
  /** Whether deprecated */
  deprecated?: boolean;
  /** Deprecation message */
  deprecationMessage?: string;
}

/**
 * Schema cache for on-demand loading
 */
const schemaCache = new Map<string, GeneratedSchema>();

/**
 * Convert PropSchema to PropSchemaDefinition
 */
function convertPropSchema(schema: PropSchema): PropSchemaDefinition {
  return {
    type: schema.type,
    required: schema.required ?? false,
    default: schema.default,
    description: schema.description,
    enum: schema.enum,
  };
}

/**
 * Extract events from component definition
 * Default events based on category
 */
function extractEvents(definition: ComponentDefinition): EventDefinition[] {
  const events: EventDefinition[] = [];
  
  // Add common events based on category
  switch (definition.category) {
    case 'input':
      events.push(
        { name: 'onChange', description: 'Fired when value changes' },
        { name: 'onFocus', description: 'Fired when component receives focus' },
        { name: 'onBlur', description: 'Fired when component loses focus' }
      );
      break;
    case 'navigation':
      events.push(
        { name: 'onClick', description: 'Fired when clicked' },
        { name: 'onNavigate', description: 'Fired on navigation' }
      );
      break;
    case 'feedback':
      events.push(
        { name: 'onClose', description: 'Fired when closed' },
        { name: 'onAction', description: 'Fired on action button click' }
      );
      break;
    default:
      events.push(
        { name: 'onClick', description: 'Fired when clicked' }
      );
  }
  
  return events;
}

/**
 * Schema Generator class
 * 
 * Generates A2UI Schema from component definitions with support for:
 * - Single component generation
 * - Batch generation
 * - On-demand loading with caching
 */
export class SchemaGenerator {
  private registry: ComponentRegistry;

  constructor(registry: ComponentRegistry) {
    this.registry = registry;
  }

  /**
   * Generate schema for a single component
   * @param componentName - Name of the component
   * @param options - Generation options
   * @returns Generated schema or undefined if not found
   */
  generate(
    componentName: string,
    options: SchemaGeneratorOptions = {}
  ): GeneratedSchema | undefined {
    const definition = this.registry.get(componentName, options.platform);
    
    if (!definition) return undefined;
    
    // Skip deprecated if not included
    if (definition.deprecated && !options.includeDeprecated) {
      return undefined;
    }

    // Convert props schema
    const props: Record<string, PropSchemaDefinition> = {};
    if (definition.propsSchema) {
      for (const [propName, propSchema] of Object.entries(definition.propsSchema)) {
        props[propName] = convertPropSchema(propSchema);
      }
    }

    // Build generated schema
    const schema: GeneratedSchema = {
      component: definition.name,
      version: definition.version || '1.0.0',
      category: definition.category,
      description: definition.description,
      props,
      events: extractEvents(definition),
      platforms: definition.platforms,
      deprecated: definition.deprecated,
      deprecationMessage: definition.deprecationMessage,
    };

    // Include examples if requested
    if (options.includeExamples && definition.examples) {
      schema.examples = definition.examples.map(ex => ex.schema);
    }

    return schema;
  }

  /**
   * Generate schemas for all components
   * @param options - Generation options
   * @returns Map of component name to generated schema
   */
  generateAll(
    options: SchemaGeneratorOptions = {}
  ): Record<string, GeneratedSchema> {
    const result: Record<string, GeneratedSchema> = {};
    const components = this.registry.getAll(options.platform);

    for (const definition of components) {
      const schema = this.generate(definition.name, options);
      if (schema) {
        result[definition.name] = schema;
      }
    }

    return result;
  }

  /**
   * Load schema on-demand with caching
   * @param componentName - Name of the component
   * @returns Promise resolving to generated schema
   */
  async loadOnDemand(componentName: string): Promise<GeneratedSchema | undefined> {
    // Check cache first
    const cached = schemaCache.get(componentName);
    if (cached) return cached;

    // Generate schema
    const schema = this.generate(componentName, { includeExamples: true });
    
    if (schema) {
      // Cache the result
      schemaCache.set(componentName, schema);
    }

    return schema;
  }

  /**
   * Clear schema cache
   */
  clearCache(): void {
    schemaCache.clear();
  }

  /**
   * Get cached schema count
   */
  getCacheSize(): number {
    return schemaCache.size;
  }
}

/**
 * Create a schema generator for a registry
 */
export function createSchemaGenerator(registry: ComponentRegistry): SchemaGenerator {
  return new SchemaGenerator(registry);
}