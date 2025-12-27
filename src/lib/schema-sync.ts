/**
 * Schema Sync Module
 * 
 * Provides functionality to synchronize UI Schema from LLM responses
 * to JSON Editor and Data Binding Editor.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.7
 */

import type { UISchema, DataContext } from '../types';
import { extractDataFields, type DataField } from './data-binding';
import { extractUISchema } from './llm-service';
import { validateUISchema } from './validation';

/**
 * Schema sync event types
 */
export type SchemaSyncEventType = 'schema_updated' | 'data_updated' | 'sync_error';

/**
 * Schema sync event payload
 */
export interface SchemaSyncEvent {
  /** Event type */
  type: SchemaSyncEventType;
  /** Updated schema (for schema_updated event) */
  schema?: UISchema;
  /** Updated data context (for data_updated event) */
  data?: DataContext;
  /** Error message (for sync_error event) */
  error?: string;
  /** Timestamp of the event */
  timestamp: number;
}

/**
 * Callback type for sync event listeners
 */
export type SchemaSyncCallback = (event: SchemaSyncEvent) => void;

/**
 * Result of sync operation
 */
export interface SyncResult {
  /** Whether the sync was successful */
  success: boolean;
  /** The synced schema (if successful) */
  schema?: UISchema;
  /** The synced data context (if successful) */
  data?: DataContext;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Options for data binding sync
 */
export interface DataBindingSyncOptions {
  /** Whether to preserve existing data values */
  preserveExistingData?: boolean;
  /** Existing data context to merge with */
  existingData?: DataContext;
}

/**
 * Schema Syncer class
 * 
 * Manages synchronization of UI Schema to editors and provides
 * event-based notifications for sync operations.
 */
export class SchemaSyncer {
  private listeners: Set<SchemaSyncCallback> = new Set();
  private currentSchema: UISchema | null = null;
  private currentData: DataContext = {};

  /**
   * Get the current schema
   */
  getCurrentSchema(): UISchema | null {
    return this.currentSchema;
  }

  /**
   * Get the current data context
   */
  getCurrentData(): DataContext {
    return this.currentData;
  }

  /**
   * Subscribe to sync events
   * 
   * @param callback - Callback function to be called on sync events
   * @returns Unsubscribe function
   */
  onSync(callback: SchemaSyncCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Emit a sync event to all listeners
   */
  private emit(event: SchemaSyncEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in sync event listener:', error);
      }
    });
  }

  /**
   * Sync schema to JSON Editor
   * 
   * Updates the current schema and emits a schema_updated event.
   * 
   * @param schema - The UI Schema to sync
   * @returns SyncResult indicating success or failure
   */
  syncToJsonEditor(schema: UISchema): SyncResult {
    // Validate the schema first
    const validation = validateUISchema(schema);
    if (!validation.valid) {
      const errorMessage = validation.errors.map(e => e.message).join('; ');
      this.emit({
        type: 'sync_error',
        error: `Schema validation failed: ${errorMessage}`,
        timestamp: Date.now(),
      });
      return {
        success: false,
        error: `Schema validation failed: ${errorMessage}`,
      };
    }

    // Update current schema
    this.currentSchema = schema;

    // Emit schema updated event
    this.emit({
      type: 'schema_updated',
      schema,
      timestamp: Date.now(),
    });

    return {
      success: true,
      schema,
    };
  }

  /**
   * Sync data binding fields to Data Binding Editor
   * 
   * Extracts data binding fields from the schema and creates/updates
   * the data context. Optionally preserves existing data values.
   * 
   * @param schema - The UI Schema to extract bindings from
   * @param options - Sync options including data preservation settings
   * @returns SyncResult with the updated data context
   */
  syncToDataBindingEditor(
    schema: UISchema,
    options: DataBindingSyncOptions = {}
  ): SyncResult {
    const { preserveExistingData = true, existingData } = options;

    try {
      // Extract data fields from schema
      const dataFields = extractDataFields(schema);
      
      // Build new data context from extracted fields
      const newData = buildDataContextFromFields(dataFields);
      
      // Merge with existing data if preservation is enabled
      let finalData: DataContext;
      if (preserveExistingData) {
        const baseData = existingData || this.currentData;
        finalData = mergeDataContexts(baseData, newData);
      } else {
        finalData = newData;
      }

      // Also include any data from the schema itself
      if (schema.data) {
        finalData = mergeDataContexts(finalData, schema.data);
      }

      // Update current data
      this.currentData = finalData;

      // Emit data updated event
      this.emit({
        type: 'data_updated',
        data: finalData,
        timestamp: Date.now(),
      });

      return {
        success: true,
        data: finalData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emit({
        type: 'sync_error',
        error: `Data binding sync failed: ${errorMessage}`,
        timestamp: Date.now(),
      });
      return {
        success: false,
        error: `Data binding sync failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Extract UI Schema from LLM response and sync to both editors
   * 
   * This is the main entry point for syncing LLM-generated schemas.
   * It extracts the schema from the response text, validates it,
   * and syncs to both JSON Editor and Data Binding Editor.
   * 
   * @param response - The LLM response text containing UI Schema
   * @param options - Sync options
   * @returns SyncResult with the extracted and synced schema
   */
  extractAndSync(
    response: string,
    options: DataBindingSyncOptions = {}
  ): SyncResult {
    // Extract UI Schema from response
    const schema = extractUISchema(response);
    
    if (!schema) {
      this.emit({
        type: 'sync_error',
        error: 'No valid UI Schema found in response',
        timestamp: Date.now(),
      });
      return {
        success: false,
        error: 'No valid UI Schema found in response',
      };
    }

    // Sync to JSON Editor
    const jsonSyncResult = this.syncToJsonEditor(schema);
    if (!jsonSyncResult.success) {
      return jsonSyncResult;
    }

    // Sync to Data Binding Editor
    const dataSyncResult = this.syncToDataBindingEditor(schema, options);
    if (!dataSyncResult.success) {
      return dataSyncResult;
    }

    return {
      success: true,
      schema,
      data: dataSyncResult.data,
    };
  }

  /**
   * Clear all sync state
   */
  clear(): void {
    this.currentSchema = null;
    this.currentData = {};
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }
}


/**
 * Build a data context structure from extracted data fields
 * 
 * Creates nested object structure based on binding paths.
 * For example, "user.name" creates { user: { name: undefined } }
 * 
 * @param fields - Array of extracted data fields
 * @returns DataContext with placeholder values
 */
export function buildDataContextFromFields(fields: DataField[]): DataContext {
  const context: DataContext = {};

  for (const field of fields) {
    setNestedValue(context, field.segments, undefined);
  }

  return context;
}

/**
 * Set a nested value in an object based on path segments
 * 
 * @param obj - The object to set the value in
 * @param segments - Path segments from parsed binding expression
 * @param value - The value to set (undefined for placeholder)
 */
function setNestedValue(
  obj: DataContext,
  segments: DataField['segments'],
  value: unknown
): void {
  if (segments.length === 0) return;

  let current: Record<string, unknown> | unknown[] = obj;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const nextSegment = segments[i + 1];

    if (segment.type === 'property') {
      const record = current as Record<string, unknown>;
      if (!(segment.name in record) || record[segment.name] === undefined) {
        // Create appropriate container for next segment
        record[segment.name] = nextSegment.type === 'index' ? [] : {};
      }
      current = record[segment.name] as Record<string, unknown> | unknown[];
    } else {
      // Index segment
      const arr = current as unknown[];
      if (arr[segment.index] === undefined) {
        arr[segment.index] = nextSegment.type === 'index' ? [] : {};
      }
      current = arr[segment.index] as Record<string, unknown> | unknown[];
    }
  }

  // Set the final value
  const lastSegment = segments[segments.length - 1];
  if (lastSegment.type === 'property') {
    const record = current as Record<string, unknown>;
    // Only set if not already defined (preserve existing values)
    if (!(lastSegment.name in record) || record[lastSegment.name] === undefined) {
      record[lastSegment.name] = value;
    }
  } else {
    const arr = current as unknown[];
    if (arr[lastSegment.index] === undefined) {
      arr[lastSegment.index] = value;
    }
  }
}

/**
 * Merge two data contexts, preserving existing values
 * 
 * Values from existingData take precedence over newData.
 * This ensures user-customized values are not overwritten.
 * 
 * @param existingData - The existing data context (higher priority)
 * @param newData - The new data context (lower priority)
 * @returns Merged data context
 */
export function mergeDataContexts(
  existingData: DataContext,
  newData: DataContext
): DataContext {
  const result: DataContext = {};

  // First, copy all keys from newData
  for (const key of Object.keys(newData)) {
    const newValue = newData[key];
    const existingValue = existingData[key];

    if (existingValue !== undefined) {
      // Existing value takes precedence
      if (isPlainObject(existingValue) && isPlainObject(newValue)) {
        // Recursively merge objects
        result[key] = mergeDataContexts(
          existingValue as DataContext,
          newValue as DataContext
        );
      } else {
        // Use existing value
        result[key] = existingValue;
      }
    } else {
      // No existing value, use new value
      result[key] = newValue;
    }
  }

  // Then, copy any keys from existingData that aren't in newData
  for (const key of Object.keys(existingData)) {
    if (!(key in result)) {
      result[key] = existingData[key];
    }
  }

  return result;
}

/**
 * Check if a value is a plain object (not array, null, etc.)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Extract unique binding paths from a schema
 * 
 * @param schema - The UI Schema to extract paths from
 * @returns Array of unique binding path strings
 */
export function extractBindingPaths(schema: UISchema): string[] {
  const fields = extractDataFields(schema);
  const paths = new Set(fields.map(f => f.path));
  return Array.from(paths);
}

/**
 * Create a default SchemaSyncer instance
 */
export function createSchemaSyncer(): SchemaSyncer {
  return new SchemaSyncer();
}

// Standalone functions for direct use without class instance

/**
 * Sync schema to JSON Editor (standalone function)
 * 
 * @param schema - The UI Schema to sync
 * @returns SyncResult indicating success or failure
 */
export function syncToJsonEditor(schema: UISchema): SyncResult {
  const validation = validateUISchema(schema);
  if (!validation.valid) {
    const errorMessage = validation.errors.map(e => e.message).join('; ');
    return {
      success: false,
      error: `Schema validation failed: ${errorMessage}`,
    };
  }

  return {
    success: true,
    schema,
  };
}

/**
 * Sync data binding fields to Data Binding Editor (standalone function)
 * 
 * @param schema - The UI Schema to extract bindings from
 * @param options - Sync options
 * @returns SyncResult with the data context
 */
export function syncToDataBindingEditor(
  schema: UISchema,
  options: DataBindingSyncOptions = {}
): SyncResult {
  const { preserveExistingData = true, existingData = {} } = options;

  try {
    const dataFields = extractDataFields(schema);
    const newData = buildDataContextFromFields(dataFields);
    
    let finalData: DataContext;
    if (preserveExistingData) {
      finalData = mergeDataContexts(existingData, newData);
    } else {
      finalData = newData;
    }

    // Include schema's own data
    if (schema.data) {
      finalData = mergeDataContexts(finalData, schema.data);
    }

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Data binding sync failed: ${errorMessage}`,
    };
  }
}

/**
 * Extract and sync schema from LLM response (standalone function)
 * 
 * @param response - The LLM response text
 * @param options - Sync options
 * @returns SyncResult with extracted schema and data
 */
export function extractAndSync(
  response: string,
  options: DataBindingSyncOptions = {}
): SyncResult {
  const schema = extractUISchema(response);
  
  if (!schema) {
    return {
      success: false,
      error: 'No valid UI Schema found in response',
    };
  }

  const jsonResult = syncToJsonEditor(schema);
  if (!jsonResult.success) {
    return jsonResult;
  }

  const dataResult = syncToDataBindingEditor(schema, options);
  if (!dataResult.success) {
    return dataResult;
  }

  return {
    success: true,
    schema,
    data: dataResult.data,
  };
}
