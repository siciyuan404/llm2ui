/**
 * CategoryFilter - Category filter component for component showcase
 * 
 * Provides category filtering options with count display.
 * Supports selecting a single category or showing all components.
 * 
 * @module CategoryFilter
 * @see Requirements 4.1, 4.2, 4.3, 4.4
 */

import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for CategoryFilter
 */
export interface CategoryFilterProps {
  /** Available categories */
  categories: string[];
  /** Count of components per category */
  categoryCount: Record<string, number>;
  /** Currently selected category (null for all) */
  selectedCategory: string | null;
  /** Callback when category selection changes */
  onCategoryChange: (category: string | null) => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * CategoryFilter - Filter components by category
 * 
 * Features:
 * - "All" option to show all components
 * - Category buttons with component counts
 * - Visual indication of selected category
 * - Keyboard navigation support
 */
export function CategoryFilter({
  categories,
  categoryCount,
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  // Calculate total count
  const totalCount = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);

  return (
    <div className={cn('space-y-1', className)} role="listbox" aria-label="分类筛选">
      {/* All categories option */}
      <button
        onClick={() => onCategoryChange(null)}
        role="option"
        aria-selected={selectedCategory === null}
        className={cn(
          'w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors flex justify-between items-center',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        )}
      >
        <span>全部</span>
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded',
          selectedCategory === null ? 'bg-primary-foreground/20' : 'bg-muted'
        )}>
          {totalCount}
        </span>
      </button>

      {/* Category options */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          role="option"
          aria-selected={selectedCategory === category}
          className={cn(
            'w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors flex justify-between items-center',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            selectedCategory === category
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
        >
          <span className="capitalize">{category}</span>
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            selectedCategory === category ? 'bg-primary-foreground/20' : 'bg-muted'
          )}>
            {categoryCount[category] || 0}
          </span>
        </button>
      ))}

      {/* Empty state when no categories */}
      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground px-2 py-1.5">
          暂无分类
        </p>
      )}
    </div>
  );
}

export default CategoryFilter;
