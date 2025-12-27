/**
 * Editor Components
 * 
 * Components for the code editor area including JSON Schema editor,
 * Data Binding editor, and image upload functionality.
 */

export { JsonSchemaEditor } from './JsonSchemaEditor';
export type { JsonSchemaEditorProps } from './JsonSchemaEditor';

export { DataBindingEditor } from './DataBindingEditor';
export type { DataBindingEditorProps, ResolvedDataField, DataFieldType } from './DataBindingEditor';

export { ImageUpload, fileToBase64, getImageDimensions, isValidImageFile } from './ImageUpload';
export type { ImageUploadProps, ImageUploadResult } from './ImageUpload';

export { SchemaErrorPanel, InlineSchemaError } from './SchemaErrorPanel';
export type { SchemaErrorPanelProps, InlineSchemaErrorProps } from './SchemaErrorPanel';
