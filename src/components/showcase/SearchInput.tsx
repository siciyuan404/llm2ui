/**
 * SearchInput - Search input component for component showcase
 * 
 * Provides a search input with debounced updates and clear functionality.
 * Supports real-time filtering of components by name and description.
 * 
 * @module SearchInput
 * @see Requirements 5.1, 5.2, 5.3, 5.4
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for SearchInput
 */
export interface SearchInputProps {
  /** Current search query value */
  value: string;
  /** Callback when search query changes */
  onChange: (query: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in milliseconds (0 for no debounce) */
  debounceMs?: number;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      className="w-4 h-4"
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

// ============================================================================
// Main Component
// ============================================================================

/**
 * SearchInput - Search input with debounce and clear functionality
 * 
 * Features:
 * - Search icon indicator
 * - Clear button when input has value
 * - Optional debounced updates
 * - Keyboard shortcuts (Escape to clear)
 */
export function SearchInput({
  value,
  onChange,
  placeholder = '搜索组件...',
  debounceMs = 0,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local value with external value
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle input change with optional debounce
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (debounceMs > 0) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          onChange(newValue);
        }, debounceMs);
      } else {
        onChange(newValue);
      }
    },
    [onChange, debounceMs]
  );

  // Handle clear button click
  const handleClear = React.useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && localValue) {
        e.preventDefault();
        handleClear();
      }
    },
    [localValue, handleClear]
  );

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Search icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <SearchIcon />
      </div>

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="搜索组件"
        className={cn(
          'w-full pl-9 pr-9 py-2 text-sm rounded-md',
          'border border-input bg-background',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'placeholder:text-muted-foreground'
        )}
      />

      {/* Clear button */}
      {localValue && (
        <button
          onClick={handleClear}
          type="button"
          aria-label="清除搜索"
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'p-1 rounded-sm text-muted-foreground',
            'hover:text-foreground hover:bg-muted',
            'focus:outline-none focus:ring-2 focus:ring-ring'
          )}
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
