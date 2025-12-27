/**
 * Image Upload Component
 * 
 * Provides local image selection and Base64 conversion functionality.
 * 
 * Requirements: 3.5
 */

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Result of an image upload operation
 */
export interface ImageUploadResult {
  /** Base64 encoded image data */
  base64: string;
  /** Original file name */
  fileName: string;
  /** MIME type of the image */
  mimeType: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** File size in bytes */
  fileSize: number;
}

export interface ImageUploadProps {
  /** Callback when image is uploaded */
  onUpload?: (result: ImageUploadResult) => void;
  /** Callback when upload fails */
  onError?: (error: string) => void;
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** CSS class name */
  className?: string;
}

/** Supported image MIME types */
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

/** Default max file size: 5MB */
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

/**
 * Check if a file is a valid image file
 */
export function isValidImageFile(file: File, maxSize: number = DEFAULT_MAX_SIZE): { valid: boolean; error?: string } {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return { valid: false, error: `Unsupported file type: ${file.type}. Supported: ${SUPPORTED_TYPES.join(', ')}` };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: ${(maxSize / 1024 / 1024).toFixed(2)}MB` };
  }
  return { valid: true };
}

/**
 * Convert a file to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions from a Base64 string
 */
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

/**
 * Image Upload Component
 */
export function ImageUpload({
  onUpload,
  onError,
  accept = 'image/*',
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = isValidImageFile(file, maxSize);
    if (!validation.valid) {
      onError?.(validation.error!);
      return;
    }

    setIsLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const dimensions = await getImageDimensions(base64);
      
      setPreview(base64);
      onUpload?.({
        base64,
        fileName: file.name,
        mimeType: file.type,
        width: dimensions.width,
        height: dimensions.height,
        fileSize: file.size,
      });
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsLoading(false);
    }
  }, [maxSize, onUpload, onError]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleClear = useCallback(() => {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className={cn('space-y-2', className)}>
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isLoading}
        className="hidden"
      />
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Processing...' : 'Select Image'}
        </Button>
        
        {preview && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            disabled={disabled || isLoading}
          >
            Clear
          </Button>
        )}
      </div>
      
      {preview && (
        <div className="relative rounded-md overflow-hidden border">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto max-h-48 object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
