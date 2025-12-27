/**
 * Custom Examples Storage - localStorage persistence for user-submitted examples
 * 
 * Provides CRUD operations for managing custom component examples:
 * - Save, load, update, delete custom examples
 * - Query examples by component name
 * - Automatic ID generation and timestamp management
 * 
 * @module custom-examples-storage
 * @see Requirements 11.5
 */

import type { UISchema } from '../types';

// ============================================================================
// Types
// ============================================================================

/**
 * Custom example data structure
 * Matches the interface defined in CustomExampleForm
 */
export interface CustomExample {
  /** Unique identifier */
  id: string;
  /** Example title */
  title: string;
  /** Example description */
  description: string;
  /** JSON Schema for the example */
  schema: UISchema;
  /** Component name this example belongs to */
  componentName: string;
  /** Creation timestamp (ISO string) */
  createdAt: string;
  /** Last update timestamp (ISO string) */
  updatedAt: string;
}

/**
 * Input data for creating a new custom example
 */
export interface CreateExampleInput {
  /** Example title */
  title: string;
  /** Example description */
  description: string;
  /** JSON Schema for the example */
  schema: UISchema;
  /** Component name this example belongs to */
  componentName: string;
}

/**
 * Input data for updating an existing custom example
 */
export interface UpdateExampleInput {
  /** Example title (optional) */
  title?: string;
  /** Example description (optional) */
  description?: string;
  /** JSON Schema for the example (optional) */
  schema?: UISchema;
}

/**
 * Result of storage operations
 */
export interface StorageResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Result data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** localStorage key for custom examples */
const STORAGE_KEY = 'llm2ui-custom-examples';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique ID for a new example
 * @returns Unique identifier string
 */
export function generateExampleId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `example-${timestamp}-${random}`;
}

/**
 * Get current ISO timestamp
 * @returns ISO formatted timestamp string
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Load all examples from localStorage
 * @returns Array of custom examples or empty array if none exist
 */
function loadFromStorage(): CustomExample[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as CustomExample[];
  } catch {
    return [];
  }
}

/**
 * Save examples to localStorage
 * @param examples - Array of examples to save
 * @returns Whether the save was successful
 */
function saveToStorage(examples: CustomExample[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(examples));
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Get all custom examples
 * @returns Array of all custom examples
 */
export function getAllExamples(): CustomExample[] {
  return loadFromStorage();
}

/**
 * Get custom examples for a specific component
 * @param componentName - Name of the component to filter by
 * @returns Array of examples for the specified component
 */
export function getExamplesByComponent(componentName: string): CustomExample[] {
  const examples = loadFromStorage();
  return examples.filter((e) => e.componentName === componentName);
}

/**
 * Get a single custom example by ID
 * @param id - Example ID to find
 * @returns The example if found, undefined otherwise
 */
export function getExampleById(id: string): CustomExample | undefined {
  const examples = loadFromStorage();
  return examples.find((e) => e.id === id);
}

/**
 * Create a new custom example
 * @param input - Example data to create
 * @returns Result with the created example or error
 */
export function createExample(input: CreateExampleInput): StorageResult<CustomExample> {
  try {
    const examples = loadFromStorage();
    const now = getCurrentTimestamp();
    
    const newExample: CustomExample = {
      id: generateExampleId(),
      title: input.title,
      description: input.description,
      schema: input.schema,
      componentName: input.componentName,
      createdAt: now,
      updatedAt: now,
    };
    
    examples.push(newExample);
    
    if (!saveToStorage(examples)) {
      return {
        success: false,
        error: '保存到 localStorage 失败',
      };
    }
    
    return {
      success: true,
      data: newExample,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '创建案例失败',
    };
  }
}

/**
 * Update an existing custom example
 * @param id - ID of the example to update
 * @param input - Fields to update
 * @returns Result with the updated example or error
 */
export function updateExample(id: string, input: UpdateExampleInput): StorageResult<CustomExample> {
  try {
    const examples = loadFromStorage();
    const index = examples.findIndex((e) => e.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: '案例不存在',
      };
    }
    
    const existing = examples[index];
    const updated: CustomExample = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      schema: input.schema ?? existing.schema,
      updatedAt: getCurrentTimestamp(),
    };
    
    examples[index] = updated;
    
    if (!saveToStorage(examples)) {
      return {
        success: false,
        error: '保存到 localStorage 失败',
      };
    }
    
    return {
      success: true,
      data: updated,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '更新案例失败',
    };
  }
}

/**
 * Delete a custom example by ID
 * @param id - ID of the example to delete
 * @returns Result indicating success or failure
 */
export function deleteExample(id: string): StorageResult<void> {
  try {
    const examples = loadFromStorage();
    const index = examples.findIndex((e) => e.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: '案例不存在',
      };
    }
    
    examples.splice(index, 1);
    
    if (!saveToStorage(examples)) {
      return {
        success: false,
        error: '保存到 localStorage 失败',
      };
    }
    
    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '删除案例失败',
    };
  }
}

/**
 * Delete all custom examples for a specific component
 * @param componentName - Name of the component
 * @returns Result with count of deleted examples
 */
export function deleteExamplesByComponent(componentName: string): StorageResult<number> {
  try {
    const examples = loadFromStorage();
    const originalCount = examples.length;
    const filtered = examples.filter((e) => e.componentName !== componentName);
    const deletedCount = originalCount - filtered.length;
    
    if (deletedCount === 0) {
      return {
        success: true,
        data: 0,
      };
    }
    
    if (!saveToStorage(filtered)) {
      return {
        success: false,
        error: '保存到 localStorage 失败',
      };
    }
    
    return {
      success: true,
      data: deletedCount,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '删除案例失败',
    };
  }
}

/**
 * Clear all custom examples from storage
 * @returns Result indicating success or failure
 */
export function clearAllExamples(): StorageResult<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '清除案例失败',
    };
  }
}

/**
 * Get count of custom examples
 * @param componentName - Optional component name to filter by
 * @returns Number of examples
 */
export function getExampleCount(componentName?: string): number {
  const examples = loadFromStorage();
  if (componentName) {
    return examples.filter((e) => e.componentName === componentName).length;
  }
  return examples.length;
}

/**
 * Check if an example exists
 * @param id - Example ID to check
 * @returns Whether the example exists
 */
export function exampleExists(id: string): boolean {
  const examples = loadFromStorage();
  return examples.some((e) => e.id === id);
}

/**
 * Search custom examples by title or description
 * @param query - Search query string
 * @param componentName - Optional component name to filter by
 * @returns Array of matching examples
 */
export function searchExamples(query: string, componentName?: string): CustomExample[] {
  const examples = loadFromStorage();
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    return componentName 
      ? examples.filter((e) => e.componentName === componentName)
      : examples;
  }
  
  return examples.filter((e) => {
    const matchesQuery = 
      e.title.toLowerCase().includes(lowerQuery) ||
      e.description.toLowerCase().includes(lowerQuery);
    
    if (componentName) {
      return matchesQuery && e.componentName === componentName;
    }
    return matchesQuery;
  });
}
