/**
 * JSON Schema Editor Component
 * 
 * A Monaco Editor-based JSON editor with syntax highlighting,
 * error markers, code folding, and search functionality.
 * 
 * Requirements: 2.1, 2.4, 2.7
 */

import { useCallback, useRef, useEffect } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { validateJSON, validateUISchema } from '@/lib/validation';
import type { ValidationError } from '@/types';

export interface JsonSchemaEditorProps {
  /** Current JSON content */
  value: string;
  /** Callback when content changes */
  onChange?: (value: string) => void;
  /** Callback when validation errors change */
  onValidationChange?: (errors: ValidationError[]) => void;
  /** Editor height (default: 100%) */
  height?: string | number;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Theme: 'light' or 'dark' */
  theme?: 'light' | 'dark';
  /** Placeholder text when empty */
  placeholder?: string;
}

/**
 * JSON Schema Editor with Monaco Editor integration
 */
export function JsonSchemaEditor({
  value,
  onChange,
  onValidationChange,
  height = '100%',
  readOnly = false,
  theme = 'dark',
  placeholder = '// Enter your UI Schema JSON here...',
}: JsonSchemaEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);

  /**
   * Handle editor mount
   */
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure JSON language defaults
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Trigger save action (format document)
      editor.getAction('editor.action.formatDocument')?.run();
    });

    // Initial validation
    validateAndMarkErrors(value);
  }, [value]);

  /**
   * Validate JSON and mark errors in the editor
   */
  const validateAndMarkErrors = useCallback((content: string) => {
    if (!editorRef.current || !monacoRef.current) return;

    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers: editor.IMarkerData[] = [];
    const validationErrors: ValidationError[] = [];

    // First validate JSON syntax
    const jsonResult = validateJSON(content);
    
    if (!jsonResult.valid && jsonResult.error) {
      const error = jsonResult.error;
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: error.message,
        startLineNumber: error.line ?? 1,
        startColumn: error.column ?? 1,
        endLineNumber: error.line ?? 1,
        endColumn: (error.column ?? 1) + 1,
      });
      validationErrors.push({
        path: '',
        message: error.message,
        code: 'JSON_SYNTAX_ERROR',
      });
    } else if (jsonResult.valid && jsonResult.value) {
      // Validate UI Schema structure
      const schemaResult = validateUISchema(jsonResult.value);
      
      if (!schemaResult.valid) {
        for (const error of schemaResult.errors) {
          // Try to find the line number for the error path
          const lineInfo = findLineForPath(content, error.path);
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: error.message,
            startLineNumber: lineInfo.line,
            startColumn: lineInfo.column,
            endLineNumber: lineInfo.line,
            endColumn: lineInfo.endColumn,
          });
          validationErrors.push(error);
        }
      }
    }

    // Set markers on the model
    monaco.editor.setModelMarkers(model, 'json-schema-validator', markers);

    // Notify parent of validation changes
    onValidationChange?.(validationErrors);
  }, [onValidationChange]);

  /**
   * Handle content change
   */
  const handleChange: OnChange = useCallback((newValue) => {
    const content = newValue ?? '';
    onChange?.(content);
    validateAndMarkErrors(content);
  }, [onChange, validateAndMarkErrors]);

  /**
   * Re-validate when value changes externally
   */
  useEffect(() => {
    validateAndMarkErrors(value);
  }, [value, validateAndMarkErrors]);

  return (
    <div className="h-full w-full relative">
      <Editor
        height={height}
        language="json"
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          folding: true,
          foldingStrategy: 'indentation',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            strings: true,
            other: true,
            comments: false,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading editor...
          </div>
        }
      />
      {!value && (
        <div className="absolute top-2 left-14 text-muted-foreground pointer-events-none opacity-50">
          {placeholder}
        </div>
      )}
    </div>
  );
}

/**
 * Find the line number for a JSON path
 */
function findLineForPath(
  content: string,
  path: string
): { line: number; column: number; endColumn: number } {
  if (!path) {
    return { line: 1, column: 1, endColumn: 2 };
  }

  const lines = content.split('\n');
  const pathParts = path.split('.').filter(Boolean);
  
  // Simple heuristic: search for the key in the JSON
  const lastPart = pathParts[pathParts.length - 1];
  const searchKey = lastPart?.replace(/\[\d+\]$/, '') ?? '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const keyPattern = new RegExp(`"${searchKey}"\\s*:`);
    const match = line.match(keyPattern);
    if (match) {
      const column = (match.index ?? 0) + 1;
      return {
        line: i + 1,
        column,
        endColumn: column + searchKey.length + 2,
      };
    }
  }

  return { line: 1, column: 1, endColumn: 2 };
}

export default JsonSchemaEditor;
