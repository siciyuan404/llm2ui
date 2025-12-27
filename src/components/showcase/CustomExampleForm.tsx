/**
 * CustomExampleForm - User-submitted custom example form
 * 
 * Allows users to submit custom component usage examples with:
 * - Title input
 * - Description input
 * - JSON Schema editor with validation
 * - Live preview of the schema
 * - Form validation and error handling
 * 
 * @module CustomExampleForm
 * @see Requirements 11.5
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UISchema } from '@/types';
import { ExamplePreview } from './LivePreview';

// ============================================================================
// Types
// ============================================================================

/**
 * Custom example data structure
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
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Form data for creating/editing custom examples
 */
export interface CustomExampleFormData {
  /** Example title */
  title: string;
  /** Example description */
  description: string;
  /** JSON Schema string (to be parsed) */
  schemaJson: string;
}

/**
 * Form validation errors
 */
export interface FormErrors {
  /** Title field error */
  title?: string;
  /** Description field error */
  description?: string;
  /** Schema field error */
  schemaJson?: string;
}

/**
 * Props for CustomExampleForm component
 */
export interface CustomExampleFormProps {
  /** Component name this example belongs to */
  componentName: string;
  /** Initial form data for editing */
  initialData?: Partial<CustomExampleFormData>;
  /** Callback when form is submitted successfully */
  onSubmit: (example: Omit<CustomExample, 'id' | 'createdAt' | 'updatedAt'>) => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default schema template for new examples
 */
const DEFAULT_SCHEMA_TEMPLATE = `{
  "version": "1.0",
  "root": {
    "id": "example-root",
    "type": "Button",
    "props": {
      "variant": "default"
    },
    "text": "示例按钮"
  }
}`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate form data
 * @param data - Form data to validate
 * @returns Validation errors object
 */
export function validateFormData(data: CustomExampleFormData): FormErrors {
  const errors: FormErrors = {};

  // Validate title
  if (!data.title.trim()) {
    errors.title = '请输入案例标题';
  } else if (data.title.trim().length < 2) {
    errors.title = '标题至少需要 2 个字符';
  } else if (data.title.trim().length > 100) {
    errors.title = '标题不能超过 100 个字符';
  }

  // Validate description (optional but has length limit)
  if (data.description.trim().length > 500) {
    errors.description = '描述不能超过 500 个字符';
  }

  // Validate schema JSON
  if (!data.schemaJson.trim()) {
    errors.schemaJson = '请输入 JSON Schema';
  } else {
    try {
      const parsed = JSON.parse(data.schemaJson);
      
      // Basic schema structure validation
      if (!parsed.version) {
        errors.schemaJson = 'Schema 缺少 version 字段';
      } else if (!parsed.root) {
        errors.schemaJson = 'Schema 缺少 root 字段';
      } else if (!parsed.root.id) {
        errors.schemaJson = 'Schema root 缺少 id 字段';
      } else if (!parsed.root.type) {
        errors.schemaJson = 'Schema root 缺少 type 字段';
      }
    } catch {
      errors.schemaJson = 'JSON 格式无效，请检查语法';
    }
  }

  return errors;
}

/**
 * Parse schema JSON string to UISchema object
 * @param schemaJson - JSON string to parse
 * @returns Parsed UISchema or null if invalid
 */
export function parseSchemaJson(schemaJson: string): UISchema | null {
  try {
    const parsed = JSON.parse(schemaJson);
    if (parsed.version && parsed.root && parsed.root.id && parsed.root.type) {
      return parsed as UISchema;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Icons
// ============================================================================

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Form field wrapper with label and error display
 */
function FormField({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {hint && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertIcon className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * JSON Schema editor with syntax highlighting placeholder
 */
function SchemaEditor({
  value,
  onChange,
  error,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
    }
  }, [value]);

  // Format JSON on blur
  const handleBlur = React.useCallback(() => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      if (formatted !== value) {
        onChange(formatted);
      }
    } catch {
      // Keep original value if invalid JSON
    }
  }, [value, onChange]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={handleBlur}
      className={cn(
        'w-full min-h-[200px] p-3 font-mono text-sm rounded-md border resize-none',
        'bg-muted/30 focus:bg-background',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-input',
        className
      )}
      placeholder={DEFAULT_SCHEMA_TEMPLATE}
      spellCheck={false}
    />
  );
}

/**
 * Preview panel for the schema
 */
function PreviewPanel({
  schema,
  isValid,
  className,
}: {
  schema: UISchema | null;
  isValid: boolean;
  className?: string;
}) {
  if (!isValid || !schema) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-md border border-dashed',
          'bg-muted/20 text-muted-foreground',
          className
        )}
      >
        <CodeIcon className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">输入有效的 JSON Schema 以预览</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-md border bg-background',
        className
      )}
    >
      <ExamplePreview schema={schema} className="min-h-[100px]" />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * CustomExampleForm - Form for submitting custom component examples
 * 
 * Features:
 * - Title and description input fields
 * - JSON Schema editor with validation
 * - Live preview of the schema
 * - Form validation with error messages
 * - Auto-format JSON on blur
 * - Submit and cancel actions
 * 
 * @see Requirements 11.5
 */
export function CustomExampleForm({
  componentName,
  initialData,
  onSubmit,
  onCancel,
  className,
}: CustomExampleFormProps) {
  // Form state
  const [formData, setFormData] = React.useState<CustomExampleFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    schemaJson: initialData?.schemaJson ?? DEFAULT_SCHEMA_TEMPLATE,
  });

  // Validation state
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Preview state
  const [showPreview, setShowPreview] = React.useState(true);
  const parsedSchema = React.useMemo(
    () => parseSchemaJson(formData.schemaJson),
    [formData.schemaJson]
  );

  // Validate on change
  React.useEffect(() => {
    const newErrors = validateFormData(formData);
    setErrors(newErrors);
  }, [formData]);

  // Handle field change
  const handleChange = React.useCallback(
    (field: keyof CustomExampleFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle field blur (mark as touched)
  const handleBlur = React.useCallback((field: keyof CustomExampleFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Handle form submission
  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      setTouched({ title: true, description: true, schemaJson: true });

      // Validate
      const validationErrors = validateFormData(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Parse schema
      const schema = parseSchemaJson(formData.schemaJson);
      if (!schema) {
        setErrors({ schemaJson: 'JSON Schema 解析失败' });
        return;
      }

      setIsSubmitting(true);

      try {
        onSubmit({
          title: formData.title.trim(),
          description: formData.description.trim(),
          schema,
          componentName,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, componentName, onSubmit]
  );

  // Check if form has errors
  const hasErrors = Object.keys(errors).length > 0;
  const isValid = !hasErrors && parsedSchema !== null;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold">添加自定义案例</h3>
          <p className="text-sm text-muted-foreground mt-1">
            为 <span className="font-medium text-foreground">{componentName}</span> 组件添加使用案例
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-1.5"
        >
          <EyeIcon />
          {showPreview ? '隐藏预览' : '显示预览'}
        </Button>
      </div>

      {/* Form Fields */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Form Inputs */}
        <div className="space-y-4">
          {/* Title Field */}
          <FormField
            label="案例标题"
            htmlFor="example-title"
            error={touched.title ? errors.title : undefined}
            required
            hint={`${formData.title.length}/100`}
          >
            <Input
              id="example-title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              placeholder="例如：主要按钮样式"
              maxLength={100}
            />
          </FormField>

          {/* Description Field */}
          <FormField
            label="案例描述"
            htmlFor="example-description"
            error={touched.description ? errors.description : undefined}
            hint={`${formData.description.length}/500`}
          >
            <textarea
              id="example-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              placeholder="描述这个案例的使用场景和特点..."
              maxLength={500}
              rows={3}
              className={cn(
                'w-full p-3 text-sm rounded-md border resize-none',
                'bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                touched.description && errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-input'
              )}
            />
          </FormField>

          {/* Schema Editor */}
          <FormField
            label="JSON Schema"
            htmlFor="example-schema"
            error={touched.schemaJson ? errors.schemaJson : undefined}
            required
          >
            <SchemaEditor
              value={formData.schemaJson}
              onChange={(value) => handleChange('schemaJson', value)}
              error={touched.schemaJson ? errors.schemaJson : undefined}
            />
          </FormField>
        </div>

        {/* Right Column - Preview */}
        {showPreview && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">实时预览</Label>
              {isValid && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  ✓ Schema 有效
                </span>
              )}
            </div>
            <PreviewPanel
              schema={parsedSchema}
              isValid={isValid}
              className="min-h-[300px]"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <CloseIcon />
            取消
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || hasErrors}
        >
          <SaveIcon />
          {isSubmitting ? '保存中...' : '保存案例'}
        </Button>
      </div>
    </form>
  );
}

export default CustomExampleForm;
