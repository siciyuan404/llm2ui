/**
 * Component Registry (Enhanced)
 * 
 * Manages registration and lookup of UI components for the llm2ui system.
 * Supports multi-platform components, versioning, search, and categorization.
 * 
 * @module component-registry
 * @see Requirements 1.1, 7.1, 10.1, 10.2
 */

import type { ComponentType } from 'react';
import type { UISchema } from '../types';

/**
 * Supported platform types
 */
export type PlatformType = 'pc-web' | 'mobile-web' | 'mobile-native' | 'pc-desktop';

/**
 * Component category types
 */
export type ComponentCategory = 'input' | 'layout' | 'display' | 'feedback' | 'navigation';

/**
 * Schema definition for component props validation
 */
export interface PropSchema {
  /** Property type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  /** Whether the property is required */
  required?: boolean;
  /** Default value */
  default?: unknown;
  /** Description of the property */
  description?: string;
  /** Enum values for string type */
  enum?: string[];
}

/**
 * Component usage example
 */
export interface ComponentExample {
  /** Example title */
  title: string;
  /** Example description */
  description: string;
  /** Example UI schema */
  schema: UISchema;
  /** Preview image URL */
  preview?: string;
}

/**
 * Component definition for registration (Enhanced)
 */
export interface ComponentDefinition {
  /** Component name/type identifier */
  name: string;
  /** Component version (semver format) */
  version?: string;
  /** Supported platforms */
  platforms?: PlatformType[];
  /** The actual React component */
  component: ComponentType<Record<string, unknown>>;
  /** Props schema for validation */
  propsSchema?: Record<string, PropSchema>;
  /** Component description */
  description?: string;
  /** Component category for organization */
  category?: ComponentCategory | string;
  /** Usage examples */
  examples?: ComponentExample[];
  /** Icon name (from icon registry) */
  icon?: string;
  /** Searchable tags */
  tags?: string[];
  /** Whether component is deprecated */
  deprecated?: boolean;
  /** Deprecation message with migration guide */
  deprecationMessage?: string;
}

/**
 * Validation result for component definition
 */
export interface ComponentValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Internal storage key for versioned components
 */
function createStorageKey(name: string, version?: string): string {
  return version ? `${name}@${version}` : name;
}

/**
 * Parse storage key to extract name and version
 * Exported for potential future use in version management
 */
export function parseStorageKey(key: string): { name: string; version?: string } {
  const atIndex = key.lastIndexOf('@');
  if (atIndex > 0) {
    return {
      name: key.substring(0, atIndex),
      version: key.substring(atIndex + 1),
    };
  }
  return { name: key };
}

/**
 * Validates a component definition
 */
export function validateComponentDefinition(
  definition: Partial<ComponentDefinition>
): ComponentValidationResult {
  const errors: string[] = [];

  if (!definition.name || typeof definition.name !== 'string') {
    errors.push('Component name is required and must be a string');
  } else if (definition.name.trim() === '') {
    errors.push('Component name cannot be empty');
  }

  if (!definition.component) {
    errors.push('Component is required');
  } else if (typeof definition.component !== 'function' && typeof definition.component !== 'object') {
    errors.push('Component must be a function or object (React component)');
  }

  if (definition.version !== undefined) {
    if (typeof definition.version !== 'string' || definition.version.trim() === '') {
      errors.push('Version must be a non-empty string');
    }
  }

  if (definition.platforms !== undefined) {
    if (!Array.isArray(definition.platforms)) {
      errors.push('Platforms must be an array');
    } else {
      const validPlatforms: PlatformType[] = ['pc-web', 'mobile-web', 'mobile-native', 'pc-desktop'];
      for (const platform of definition.platforms) {
        if (!validPlatforms.includes(platform)) {
          errors.push(`Invalid platform: ${platform}`);
        }
      }
    }
  }

  if (definition.propsSchema !== undefined) {
    if (typeof definition.propsSchema !== 'object' || definition.propsSchema === null) {
      errors.push('propsSchema must be an object');
    } else {
      for (const [propName, schema] of Object.entries(definition.propsSchema)) {
        if (!schema || typeof schema !== 'object') {
          errors.push(`Invalid schema for prop "${propName}"`);
          continue;
        }
        const validTypes = ['string', 'number', 'boolean', 'object', 'array', 'function'];
        if (!schema.type || !validTypes.includes(schema.type)) {
          errors.push(`Invalid type for prop "${propName}": must be one of ${validTypes.join(', ')}`);
        }
      }
    }
  }

  // Validate examples array
  if (definition.examples !== undefined) {
    if (!Array.isArray(definition.examples)) {
      errors.push('Examples must be an array');
    } else {
      for (let i = 0; i < definition.examples.length; i++) {
        const example = definition.examples[i];
        if (!example || typeof example !== 'object') {
          errors.push(`Example at index ${i} must be an object`);
          continue;
        }
        if (!example.title || typeof example.title !== 'string') {
          errors.push(`Example at index ${i} must have a title string`);
        }
        if (!example.description || typeof example.description !== 'string') {
          errors.push(`Example at index ${i} must have a description string`);
        }
        if (!example.schema || typeof example.schema !== 'object') {
          errors.push(`Example at index ${i} must have a schema object`);
        }
        if (example.preview !== undefined && typeof example.preview !== 'string') {
          errors.push(`Example at index ${i} preview must be a string if provided`);
        }
      }
    }
  }

  // Validate tags array
  if (definition.tags !== undefined) {
    if (!Array.isArray(definition.tags)) {
      errors.push('Tags must be an array');
    } else {
      for (let i = 0; i < definition.tags.length; i++) {
        if (typeof definition.tags[i] !== 'string') {
          errors.push(`Tag at index ${i} must be a string`);
        } else if (definition.tags[i].trim() === '') {
          errors.push(`Tag at index ${i} cannot be empty`);
        }
      }
    }
  }

  // Validate category
  if (definition.category !== undefined) {
    const validCategories: ComponentCategory[] = ['input', 'layout', 'display', 'feedback', 'navigation'];
    if (typeof definition.category !== 'string') {
      errors.push('Category must be a string');
    } else if (!validCategories.includes(definition.category as ComponentCategory)) {
      // Allow custom categories but warn (not an error for extensibility)
      // This is intentionally not an error to allow custom categories
    }
  }

  // Validate icon
  if (definition.icon !== undefined) {
    if (typeof definition.icon !== 'string') {
      errors.push('Icon must be a string');
    }
  }

  // Validate deprecated flag
  if (definition.deprecated !== undefined) {
    if (typeof definition.deprecated !== 'boolean') {
      errors.push('Deprecated must be a boolean');
    }
  }

  // Validate deprecationMessage
  if (definition.deprecationMessage !== undefined) {
    if (typeof definition.deprecationMessage !== 'string') {
      errors.push('DeprecationMessage must be a string');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Component Registry class (Enhanced)
 * 
 * Manages registration and lookup of UI components with support for:
 * - Multi-platform components
 * - Version management
 * - Category filtering
 * - Full-text search
 */
export class ComponentRegistry {
  private components: Map<string, ComponentDefinition> = new Map();
  private versionedComponents: Map<string, ComponentDefinition> = new Map();
  private componentVersions: Map<string, Set<string>> = new Map();

  /**
   * Register a component definition
   * @param definition - The component definition to register
   * @throws Error if the definition is invalid
   */
  register(definition: ComponentDefinition): void {
    const validation = validateComponentDefinition(definition);
    if (!validation.valid) {
      throw new Error(`Invalid component definition: ${validation.errors.join(', ')}`);
    }

    // Store as latest (unversioned)
    this.components.set(definition.name, definition);

    // Store versioned if version provided
    if (definition.version) {
      const versionedKey = createStorageKey(definition.name, definition.version);
      this.versionedComponents.set(versionedKey, definition);

      // Track versions
      if (!this.componentVersions.has(definition.name)) {
        this.componentVersions.set(definition.name, new Set());
      }
      this.componentVersions.get(definition.name)!.add(definition.version);
    }
  }

  /**
   * Get a component definition by name, optionally filtered by platform and version
   * @param name - The component name
   * @param platform - Optional platform filter
   * @param version - Optional version (returns specific version if provided)
   * @returns The component definition or undefined if not found
   */
  get(
    name: string,
    platform?: PlatformType,
    version?: string
  ): ComponentDefinition | undefined {
    let definition: ComponentDefinition | undefined;

    if (version) {
      const versionedKey = createStorageKey(name, version);
      definition = this.versionedComponents.get(versionedKey);
    } else {
      definition = this.components.get(name);
    }

    if (!definition) return undefined;

    // Filter by platform if specified
    if (platform && definition.platforms && definition.platforms.length > 0) {
      if (!definition.platforms.includes(platform)) {
        return undefined;
      }
    }

    return definition;
  }

  /**
   * Get all registered component definitions
   * @param platform - Optional platform filter
   * @returns Array of all component definitions
   */
  getAll(platform?: PlatformType): ComponentDefinition[] {
    const all = Array.from(this.components.values());
    
    if (!platform) return all;

    return all.filter(def => {
      // If no platforms specified, assume available on all platforms
      if (!def.platforms || def.platforms.length === 0) return true;
      return def.platforms.includes(platform);
    });
  }

  /**
   * Get components by category
   * @param category - The category to filter by
   * @param platform - Optional platform filter
   * @returns Array of component definitions in the category
   */
  getByCategory(category: string, platform?: PlatformType): ComponentDefinition[] {
    return this.getAll(platform).filter(def => def.category === category);
  }

  /**
   * Search components by name, description, or tags
   * @param query - Search query string
   * @param platform - Optional platform filter
   * @returns Array of matching component definitions
   */
  search(query: string, platform?: PlatformType): ComponentDefinition[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return this.getAll(platform);

    return this.getAll(platform).filter(def => {
      // Search in name
      if (def.name.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in description
      if (def.description?.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in tags
      if (def.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;

      return false;
    });
  }

  /**
   * Get all versions of a component
   * @param name - The component name
   * @returns Array of version strings, sorted descending
   */
  getVersions(name: string): string[] {
    const versions = this.componentVersions.get(name);
    if (!versions) return [];
    
    return Array.from(versions).sort((a, b) => {
      // Simple semver-like comparison
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);
      
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const numA = partsA[i] || 0;
        const numB = partsB[i] || 0;
        if (numA !== numB) return numB - numA; // Descending
      }
      return 0;
    });
  }

  /**
   * Check if a component is registered
   * @param name - The component name
   * @returns True if the component is registered
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Unregister a component
   * @param name - The component name to unregister
   * @param version - Optional specific version to unregister
   * @returns True if the component was unregistered
   */
  unregister(name: string, version?: string): boolean {
    if (version) {
      const versionedKey = createStorageKey(name, version);
      const removed = this.versionedComponents.delete(versionedKey);
      
      if (removed) {
        const versions = this.componentVersions.get(name);
        if (versions) {
          versions.delete(version);
          if (versions.size === 0) {
            this.componentVersions.delete(name);
          }
        }
      }
      return removed;
    }

    // Remove all versions
    const versions = this.componentVersions.get(name);
    if (versions) {
      for (const v of versions) {
        const versionedKey = createStorageKey(name, v);
        this.versionedComponents.delete(versionedKey);
      }
      this.componentVersions.delete(name);
    }

    return this.components.delete(name);
  }

  /**
   * Get the number of registered components (unique names)
   */
  get size(): number {
    return this.components.size;
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
    this.versionedComponents.clear();
    this.componentVersions.clear();
  }

  /**
   * Get all unique categories
   * @param platform - Optional platform filter
   * @returns Array of category names
   */
  getCategories(platform?: PlatformType): string[] {
    const categories = new Set<string>();
    for (const def of this.getAll(platform)) {
      if (def.category) {
        categories.add(def.category);
      }
    }
    return Array.from(categories).sort();
  }

  /**
   * Get component count by category
   * @param platform - Optional platform filter
   * @returns Map of category to count
   */
  getCategoryCounts(platform?: PlatformType): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const def of this.getAll(platform)) {
      const category = def.category || 'uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    }
    return counts;
  }

  /**
   * Check if a component supports a specific platform
   * @param name - The component name
   * @param platform - The platform to check
   * @returns True if supported, false if not, undefined if component not found
   */
  isSupported(name: string, platform: PlatformType): boolean | undefined {
    const def = this.components.get(name);
    if (!def) return undefined;
    
    // If no platforms specified, assume all platforms supported
    if (!def.platforms || def.platforms.length === 0) return true;
    
    return def.platforms.includes(platform);
  }
}

/**
 * Default global component registry instance
 */
export const defaultRegistry = new ComponentRegistry();
