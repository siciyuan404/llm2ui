/**
 * Data Binding Editor Component
 * 
 * Displays data fields extracted from UI Schema and allows
 * editing their values with type validation.
 * 
 * Requirements: 3.2, 3.4, 3.6
 */

import { useState, useCallback, useMemo } from 'react';
import { extractDataFields, type DataField } from '@/lib/data-binding';
import type { UISchema, DataContext } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Type of a data field value
 */
export type DataFieldType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null' | 'undefined';

/**
 * Data field with resolved value and type information
 */
export interface ResolvedDataField extends DataField {
  /** Current value from data context */
  value: unknown;
  /** Detected type of the value */
  type: DataFieldType;
  /** Whether the field exists in the data context */
  exists: boolean;
}

export interface DataBindingEditorProps {
  /** UI Schema to extract data fields from */
  schema: UISchema | null;
  /** Current data context */
  data: DataContext;
  /** Callback when data changes */
  onChange?: (data: DataContext) => void;
  /** Callback when validation warnings occur */
  onWarning?: (warnings: string[]) => void;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Get the type of a value
 */
function getValueType(value: unknown): DataFieldType {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value as DataFieldType;
}

/**
 * Resolve a path in the data context
 */
function resolvePath(data: DataContext, path: string): { value: unknown; exists: boolean } {
  const parts = path.split(/\.|\[(\d+)\]/).filter(Boolean);
  let current: unknown = data;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return { value: undefined, exists: false };
    }
    
    const index = parseInt(part, 10);
    if (!isNaN(index) && Array.isArray(current)) {
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return { value: undefined, exists: false };
    }
  }
  
  return { value: current, exists: true };
}

/**
 * Set a value at a path in the data context
 */
function setValueAtPath(data: DataContext, path: string, value: unknown): DataContext {
  const parts = path.split(/\.|\[(\d+)\]/).filter(Boolean);
  const result = JSON.parse(JSON.stringify(data)) as DataContext;
  
  let current: Record<string, unknown> | unknown[] = result;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const index = parseInt(part, 10);
    
    if (!isNaN(index) && Array.isArray(current)) {
      if (current[index] === undefined) {
        current[index] = !isNaN(parseInt(nextPart, 10)) ? [] : {};
      }
      current = current[index] as Record<string, unknown> | unknown[];
    } else if (typeof current === 'object' && current !== null) {
      const obj = current as Record<string, unknown>;
      if (obj[part] === undefined) {
        obj[part] = !isNaN(parseInt(nextPart, 10)) ? [] : {};
      }
      current = obj[part] as Record<string, unknown> | unknown[];
    }
  }
  
  const lastPart = parts[parts.length - 1];
  const lastIndex = parseInt(lastPart, 10);
  
  if (!isNaN(lastIndex) && Array.isArray(current)) {
    current[lastIndex] = value;
  } else if (typeof current === 'object' && current !== null) {
    (current as Record<string, unknown>)[lastPart] = value;
  }
  
  return result;
}

/**
 * Parse a string value to the appropriate type
 */
function parseValue(input: string, targetType: DataFieldType): unknown {
  const trimmed = input.trim();
  
  if (trimmed === '') return '';
  
  // Try to parse as JSON first for complex types
  if (targetType === 'array' || targetType === 'object') {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  
  // Parse boolean
  if (targetType === 'boolean') {
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    return trimmed;
  }
  
  // Parse number
  if (targetType === 'number') {
    const num = parseFloat(trimmed);
    if (!isNaN(num)) return num;
    return trimmed;
  }
  
  // Try auto-detection
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;
  if (trimmed.toLowerCase() === 'null') return null;
  
  const num = parseFloat(trimmed);
  if (!isNaN(num) && trimmed === String(num)) return num;
  
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'object') return parsed;
  } catch {
    // Not valid JSON, keep as string
  }
  
  return trimmed;
}

/**
 * Format a value for display in the input
 */
function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Data Binding Editor Component
 */
export function DataBindingEditor({
  schema,
  data,
  onChange,
  onWarning,
  readOnly = false,
  className,
}: DataBindingEditorProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  /**
   * Extract and resolve data fields from schema
   */
  const resolvedFields = useMemo((): ResolvedDataField[] => {
    if (!schema) return [];
    
    const fields = extractDataFields(schema);
    const uniquePaths = new Map<string, DataField>();
    
    // Deduplicate by path
    for (const field of fields) {
      if (!uniquePaths.has(field.path)) {
        uniquePaths.set(field.path, field);
      }
    }
    
    return Array.from(uniquePaths.values()).map(field => {
      const resolved = resolvePath(data, field.path);
      return {
        ...field,
        value: resolved.value,
        type: getValueType(resolved.value),
        exists: resolved.exists,
      };
    });
  }, [schema, data]);

  /**
   * Handle starting to edit a field
   */
  const handleStartEdit = useCallback((field: ResolvedDataField) => {
    if (readOnly) return;
    setEditingField(field.path);
    setEditValue(formatValue(field.value));
  }, [readOnly]);

  /**
   * Handle saving an edited field
   */
  const handleSaveEdit = useCallback((field: ResolvedDataField) => {
    const newValue = parseValue(editValue, field.type);
    const newData = setValueAtPath(data, field.path, newValue);
    
    // Check for type warnings
    const warnings: string[] = [];
    const newType = getValueType(newValue);
    if (field.exists && field.type !== newType && field.type !== 'undefined') {
      warnings.push(
        `Type changed for "${field.path}": ${field.type} → ${newType}`
      );
    }
    
    onChange?.(newData);
    onWarning?.(warnings);
    setEditingField(null);
    setEditValue('');
  }, [editValue, data, onChange, onWarning]);

  /**
   * Handle canceling edit
   */
  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  /**
   * Handle key press in edit input
   */
  const handleKeyDown = useCallback((
    e: React.KeyboardEvent,
    field: ResolvedDataField
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(field);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  /**
   * Add a new field
   */
  const handleAddField = useCallback(() => {
    const path = prompt('Enter the data path (e.g., user.name):');
    if (!path) return;
    
    const value = prompt('Enter the initial value:');
    if (value === null) return;
    
    const parsedValue = parseValue(value, 'string');
    const newData = setValueAtPath(data, path, parsedValue);
    onChange?.(newData);
  }, [data, onChange]);

  if (!schema) {
    return (
      <div className={cn('p-4 text-muted-foreground text-center', className)}>
        No schema loaded. Enter a valid UI Schema to see data bindings.
      </div>
    );
  }

  if (resolvedFields.length === 0) {
    return (
      <div className={cn('p-4', className)}>
        <div className="text-muted-foreground text-center mb-4">
          No data bindings found in the schema.
        </div>
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddField}
            className="w-full"
          >
            + Add Data Field
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2 p-2', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Data Bindings</h3>
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddField}
          >
            + Add
          </Button>
        )}
      </div>
      
      {resolvedFields.map((field) => (
        <Card key={field.path} className="p-2">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs font-mono flex items-center gap-2">
              <span className="text-primary">{`{{${field.path}}}`}</span>
              <span className={cn(
                'text-[10px] px-1 py-0.5 rounded',
                field.exists 
                  ? 'bg-green-500/20 text-green-600' 
                  : 'bg-yellow-500/20 text-yellow-600'
              )}>
                {field.type}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            {editingField === field.path ? (
              <div className="flex gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, field)}
                  className="h-8 text-sm font-mono"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSaveEdit(field)}
                  className="h-8 px-2"
                >
                  ✓
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="h-8 px-2"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'text-sm font-mono p-2 rounded bg-muted/50 cursor-pointer hover:bg-muted transition-colors',
                  !field.exists && 'text-muted-foreground italic'
                )}
                onClick={() => handleStartEdit(field)}
                title={readOnly ? 'Read-only' : 'Click to edit'}
              >
                {field.exists ? formatValue(field.value) : '(undefined)'}
              </div>
            )}
            <div className="text-[10px] text-muted-foreground mt-1">
              Used in: {field.componentId} → {field.property}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DataBindingEditor;
