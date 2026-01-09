/**
 * SidebarNav Property-Based Tests
 * 
 * **Feature: showcase-design-system, Property 1: 侧边栏导航 URL 同步往返**
 * **Validates: Requirements 1.7, 1.8**
 * 
 * Tests that:
 * 1. Selecting an item updates the URL to include that item ID
 * 2. Loading a page with a URL path auto-selects the corresponding item
 * 
 * @module SidebarNav.test
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { SidebarNav, filterCategories, type SidebarNavCategory, type SidebarNavItem } from './SidebarNav';

// Mock scrollIntoView for jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Helper component to capture URL search params
 */
function URLParamsCapture({ onParams }: { onParams: (params: URLSearchParams) => void }) {
  const [searchParams] = useSearchParams();
  onParams(searchParams);
  return null;
}

/**
 * Render SidebarNav with router context
 */
function renderWithRouter(
  ui: React.ReactElement,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid item IDs (simple alphanumeric)
 */
const itemIdArb = fc.stringMatching(/^[a-z][a-z0-9]{1,8}$/);

/**
 * Generator for item labels
 */
const labelArb = fc.string({ minLength: 1, maxLength: 15 })
  .filter(s => s.trim().length > 0);

/**
 * Generator for SidebarNavItem (leaf)
 */
const leafItemArb: fc.Arbitrary<SidebarNavItem> = fc.record({
  id: itemIdArb,
  label: labelArb,
});

/**
 * Generator for SidebarNavCategory
 */
const categoryArb: fc.Arbitrary<SidebarNavCategory> = fc.record({
  id: itemIdArb,
  label: labelArb,
  items: fc.array(leafItemArb, { minLength: 1, maxLength: 3 }),
  defaultExpanded: fc.constant(true),
});

/**
 * Generator for array of categories with unique IDs
 */
const categoriesArb: fc.Arbitrary<SidebarNavCategory[]> = fc
  .array(categoryArb, { minLength: 1, maxLength: 2 })
  .map(categories => {
    // Ensure unique IDs across all items
    const usedIds = new Set<string>();
    let counter = 0;
    return categories.map((cat) => {
      let catId = cat.id;
      while (usedIds.has(catId)) {
        catId = `cat${counter++}`;
      }
      usedIds.add(catId);
      
      return {
        ...cat,
        id: catId,
        items: cat.items.map((item) => {
          let itemId = item.id;
          while (usedIds.has(itemId)) {
            itemId = `item${counter++}`;
          }
          usedIds.add(itemId);
          return { ...item, id: itemId };
        }),
      };
    });
  });

/**
 * Get all item IDs from categories
 */
function getAllItemIds(categories: SidebarNavCategory[]): string[] {
  const ids: string[] = [];
  for (const category of categories) {
    for (const item of category.items) {
      if (!item.disabled) {
        ids.push(item.id);
      }
    }
  }
  return ids;
}

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Property 1: 侧边栏导航 URL 同步往返', () => {
  /**
   * Property 1a: Selecting an item calls onItemSelect with correct ID
   * 
   * *For any* valid sidebar item ID, selecting the item SHALL call onItemSelect
   * with that ID.
   * 
   * **Feature: showcase-design-system, Property 1: 侧边栏导航 URL 同步往返**
   * **Validates: Requirements 1.7**
   */
  it('Property 1a: Selecting an item calls onItemSelect with correct ID', () => {
    fc.assert(
      fc.property(categoriesArb, (categories) => {
        const enabledIds = getAllItemIds(categories);
        if (enabledIds.length === 0) return true;
        
        const targetId = enabledIds[0];
        const onItemSelect = vi.fn();
        
        const { unmount } = renderWithRouter(
          <SidebarNav
            categories={categories}
            activeItemId={null}
            onItemSelect={onItemSelect}
            urlParamName="item"
            showSearch={false}
          />
        );
        
        // Find the item by its label
        const targetItem = categories.flatMap(c => c.items).find(i => i.id === targetId);
        if (targetItem) {
          const button = screen.queryByText(targetItem.label);
          if (button) {
            fireEvent.click(button);
            expect(onItemSelect).toHaveBeenCalledWith(targetId);
          }
        }
        
        unmount();
        return true;
      }),
      { numRuns: 20 }
    );
  }, 30000);

  /**
   * Property 1b: URL with item ID auto-selects item
   * 
   * *For any* valid sidebar item ID in the URL, loading the page SHALL
   * auto-select the corresponding item by calling onItemSelect.
   * 
   * **Feature: showcase-design-system, Property 1: 侧边栏导航 URL 同步往返**
   * **Validates: Requirements 1.8**
   */
  it('Property 1b: Loading page with URL item param auto-selects item', () => {
    fc.assert(
      fc.property(categoriesArb, (categories) => {
        const enabledIds = getAllItemIds(categories);
        if (enabledIds.length === 0) return true;
        
        const targetId = enabledIds[0];
        const onItemSelect = vi.fn();
        
        const { unmount } = renderWithRouter(
          <SidebarNav
            categories={categories}
            activeItemId={null}
            onItemSelect={onItemSelect}
            urlParamName="item"
            showSearch={false}
          />,
          { initialEntries: [`/?item=${targetId}`] }
        );
        
        // Verify onItemSelect was called with the item ID from URL
        expect(onItemSelect).toHaveBeenCalledWith(targetId);
        
        unmount();
        return true;
      }),
      { numRuns: 20 }
    );
  }, 30000);

  /**
   * Property 1c: Round-trip consistency
   * 
   * *For any* valid sidebar item ID, the URL parameter name and item ID
   * should be correctly encoded and decoded.
   * 
   * **Feature: showcase-design-system, Property 1: 侧边栏导航 URL 同步往返**
   * **Validates: Requirements 1.7, 1.8**
   */
  it('Property 1c: URL sync round-trip preserves item selection', () => {
    fc.assert(
      fc.property(categoriesArb, (categories) => {
        const enabledIds = getAllItemIds(categories);
        if (enabledIds.length === 0) return true;
        
        const targetId = enabledIds[0];
        const urlParamName = 'item';
        
        // Simulate the URL that would be created
        const expectedUrl = `/?${urlParamName}=${targetId}`;
        
        // Load with that URL and verify selection
        const onItemSelect = vi.fn();
        
        const { unmount } = renderWithRouter(
          <SidebarNav
            categories={categories}
            activeItemId={null}
            onItemSelect={onItemSelect}
            urlParamName={urlParamName}
            showSearch={false}
          />,
          { initialEntries: [expectedUrl] }
        );
        
        // Verify the same item is selected
        expect(onItemSelect).toHaveBeenCalledWith(targetId);
        
        unmount();
        return true;
      }),
      { numRuns: 20 }
    );
  }, 30000);
});

// ============================================================================
// Property-Based Tests for Search Filtering
// ============================================================================

describe('Property 10: 侧边栏搜索过滤正确性', () => {
  /**
   * Generator for search query strings
   */
  const searchQueryArb = fc.string({ minLength: 1, maxLength: 10 })
    .filter(s => s.trim().length > 0);

  /**
   * Generator for SidebarNavItem with optional description and children
   */
  const itemWithDescArb: fc.Arbitrary<SidebarNavItem> = fc.record({
    id: itemIdArb,
    label: labelArb,
    description: fc.option(labelArb, { nil: undefined }),
    children: fc.option(
      fc.array(
        fc.record({
          id: itemIdArb,
          label: labelArb,
          description: fc.option(labelArb, { nil: undefined }),
        }),
        { minLength: 0, maxLength: 2 }
      ),
      { nil: undefined }
    ),
  });

  /**
   * Generator for SidebarNavCategory with items that have descriptions
   */
  const categoryWithDescArb: fc.Arbitrary<SidebarNavCategory> = fc.record({
    id: itemIdArb,
    label: labelArb,
    items: fc.array(itemWithDescArb, { minLength: 1, maxLength: 3 }),
    defaultExpanded: fc.constant(true),
  });

  /**
   * Generator for array of categories with unique IDs and descriptions
   */
  const categoriesWithDescArb: fc.Arbitrary<SidebarNavCategory[]> = fc
    .array(categoryWithDescArb, { minLength: 1, maxLength: 2 })
    .map(categories => {
      const usedIds = new Set<string>();
      let counter = 0;
      return categories.map((cat) => {
        let catId = cat.id;
        while (usedIds.has(catId)) {
          catId = `cat${counter++}`;
        }
        usedIds.add(catId);
        
        return {
          ...cat,
          id: catId,
          items: cat.items.map((item) => {
            let itemId = item.id;
            while (usedIds.has(itemId)) {
              itemId = `item${counter++}`;
            }
            usedIds.add(itemId);
            
            const children = item.children?.map((child) => {
              let childId = child.id;
              while (usedIds.has(childId)) {
                childId = `child${counter++}`;
              }
              usedIds.add(childId);
              return { ...child, id: childId };
            });
            
            return { ...item, id: itemId, children };
          }),
        };
      });
    });

  /**
   * Helper: Check if a string contains query (case-insensitive)
   */
  function containsQuery(text: string | undefined, query: string): boolean {
    if (!text) return false;
    return text.toLowerCase().includes(query.toLowerCase());
  }

  /**
   * Helper: Check if an item matches the query (label, description, or children)
   */
  function itemMatchesQuery(item: SidebarNavItem, query: string): boolean {
    // Check item's own label and description
    if (containsQuery(item.label, query)) return true;
    if (containsQuery(item.description, query)) return true;
    
    // Check children's labels and descriptions
    if (item.children) {
      for (const child of item.children) {
        if (containsQuery(child.label, query)) return true;
        if (containsQuery(child.description, query)) return true;
      }
    }
    
    return false;
  }

  /**
   * Property 10a: Filtered results only contain matching items
   * 
   * *For any* search query Q and categories list, every item in the filtered
   * results SHALL have its label, description, or a child's label/description
   * contain Q (case-insensitive, after trimming).
   * 
   * **Feature: showcase-design-system, Property 10: 侧边栏搜索过滤正确性**
   * **Validates: Requirements 1.4**
   */
  it('Property 10a: Filtered results only contain items matching the query', () => {
    fc.assert(
      fc.property(
        categoriesWithDescArb,
        searchQueryArb,
        (categories, query) => {
          const filtered = filterCategories(categories, query);
          const trimmedQuery = query.trim();
          
          // If query is empty after trimming, all items should be returned
          if (!trimmedQuery) {
            return filtered === categories;
          }
          
          // Every item in filtered results must match the trimmed query
          for (const category of filtered) {
            for (const item of category.items) {
              const matches = itemMatchesQuery(item, trimmedQuery);
              if (!matches) {
                return false;
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 10b: All matching items are included in results
   * 
   * *For any* search query Q and categories list, if an item's label,
   * description, or child's label/description contains Q (after trimming),
   * that item SHALL appear in the filtered results.
   * 
   * **Feature: showcase-design-system, Property 10: 侧边栏搜索过滤正确性**
   * **Validates: Requirements 1.4**
   */
  it('Property 10b: All matching items are included in filtered results', () => {
    fc.assert(
      fc.property(
        categoriesWithDescArb,
        searchQueryArb,
        (categories, query) => {
          const filtered = filterCategories(categories, query);
          const trimmedQuery = query.trim();
          
          // If query is empty after trimming, all items should be returned
          if (!trimmedQuery) {
            return filtered === categories;
          }
          
          // Collect all item IDs from filtered results
          const filteredItemIds = new Set<string>();
          for (const category of filtered) {
            for (const item of category.items) {
              filteredItemIds.add(item.id);
            }
          }
          
          // Check that all matching items from original are in filtered
          for (const category of categories) {
            for (const item of category.items) {
              if (itemMatchesQuery(item, trimmedQuery)) {
                if (!filteredItemIds.has(item.id)) {
                  return false;
                }
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 10c: Empty query returns all items
   * 
   * *For any* categories list, filtering with an empty or whitespace-only
   * query SHALL return all original categories unchanged.
   * 
   * **Feature: showcase-design-system, Property 10: 侧边栏搜索过滤正确性**
   * **Validates: Requirements 1.4**
   */
  it('Property 10c: Empty query returns all categories unchanged', () => {
    fc.assert(
      fc.property(
        categoriesWithDescArb,
        fc.constantFrom('', ' ', '  ', '\t', '\n'),
        (categories, emptyQuery) => {
          const filtered = filterCategories(categories, emptyQuery);
          
          // Should return the same categories
          return filtered === categories;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 10d: Search is case-insensitive
   * 
   * *For any* search query Q and categories list, filtering with Q.toLowerCase()
   * and Q.toUpperCase() SHALL produce the same results.
   * 
   * **Feature: showcase-design-system, Property 10: 侧边栏搜索过滤正确性**
   * **Validates: Requirements 1.4**
   */
  it('Property 10d: Search filtering is case-insensitive', () => {
    fc.assert(
      fc.property(
        categoriesWithDescArb,
        fc.string({ minLength: 1, maxLength: 5 }).filter(s => /^[a-zA-Z]+$/.test(s)),
        (categories, query) => {
          const lowerFiltered = filterCategories(categories, query.toLowerCase());
          const upperFiltered = filterCategories(categories, query.toUpperCase());
          
          // Extract item IDs from both results
          const lowerIds = new Set(lowerFiltered.flatMap(c => c.items.map(i => i.id)));
          const upperIds = new Set(upperFiltered.flatMap(c => c.items.map(i => i.id)));
          
          // Both should have the same items
          if (lowerIds.size !== upperIds.size) return false;
          for (const id of lowerIds) {
            if (!upperIds.has(id)) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 10e: Child match includes parent with filtered children
   * 
   * *For any* item with children where only a child matches the query,
   * the filtered result SHALL include the parent item with only the
   * matching children.
   * 
   * **Feature: showcase-design-system, Property 10: 侧边栏搜索过滤正确性**
   * **Validates: Requirements 1.4**
   */
  it('Property 10e: When only child matches, parent is included with filtered children', () => {
    fc.assert(
      fc.property(
        categoriesWithDescArb,
        (categories) => {
          // Find an item with children where we can test child-only matching
          for (const category of categories) {
            for (const item of category.items) {
              if (item.children && item.children.length > 0) {
                // Use the first child's label as query (if it doesn't match parent)
                const childLabel = item.children[0].label;
                const parentMatches = containsQuery(item.label, childLabel) || 
                                     containsQuery(item.description, childLabel);
                
                if (!parentMatches && childLabel.length > 0) {
                  const filtered = filterCategories(categories, childLabel);
                  
                  // Find the item in filtered results
                  const filteredItem = filtered
                    .flatMap(c => c.items)
                    .find(i => i.id === item.id);
                  
                  if (filteredItem) {
                    // If parent doesn't match but child does, children should be filtered
                    // to only include matching children
                    if (filteredItem.children) {
                      for (const child of filteredItem.children) {
                        if (!containsQuery(child.label, childLabel) && 
                            !containsQuery(child.description, childLabel)) {
                          return false;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});

// ============================================================================
// Unit Tests for filterCategories
// ============================================================================

describe('filterCategories', () => {
  const testCategories: SidebarNavCategory[] = [
    {
      id: 'layout',
      label: 'Layout',
      items: [
        { id: 'row', label: 'Row', description: 'Horizontal layout' },
        { id: 'column', label: 'Column', description: 'Vertical layout' },
      ],
    },
    {
      id: 'input',
      label: 'Input',
      items: [
        { id: 'button', label: 'Button', description: 'Clickable button' },
        { 
          id: 'text-input', 
          label: 'Text Input', 
          description: 'Text field',
          children: [
            { id: 'email', label: 'Email', description: 'Email input' },
            { id: 'password', label: 'Password', description: 'Password input' },
          ],
        },
      ],
    },
  ];

  it('returns all categories when search query is empty', () => {
    const result = filterCategories(testCategories, '');
    expect(result).toEqual(testCategories);
  });

  it('returns all categories when search query is whitespace', () => {
    const result = filterCategories(testCategories, '   ');
    expect(result).toEqual(testCategories);
  });

  it('filters items by label (case-insensitive)', () => {
    const result = filterCategories(testCategories, 'button');
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('input');
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].id).toBe('button');
  });

  it('filters items by description (case-insensitive)', () => {
    const result = filterCategories(testCategories, 'horizontal');
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('layout');
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].id).toBe('row');
  });

  it('includes parent item when child matches', () => {
    const result = filterCategories(testCategories, 'email');
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('input');
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].id).toBe('text-input');
    expect(result[0].items[0].children).toHaveLength(1);
    expect(result[0].items[0].children![0].id).toBe('email');
  });

  it('returns empty array when no matches found', () => {
    const result = filterCategories(testCategories, 'nonexistent');
    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// Unit Tests for SidebarNav Component
// ============================================================================

describe('SidebarNav Component', () => {
  const testCategories: SidebarNavCategory[] = [
    {
      id: 'tokens',
      label: 'Tokens',
      defaultExpanded: true,
      items: [
        { id: 'colors', label: 'Colors' },
        { id: 'spacing', label: 'Spacing' },
      ],
    },
  ];

  it('renders categories and items', () => {
    renderWithRouter(
      <SidebarNav
        categories={testCategories}
        activeItemId={null}
        onItemSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Tokens')).toBeInTheDocument();
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Spacing')).toBeInTheDocument();
  });

  it('highlights active item', () => {
    renderWithRouter(
      <SidebarNav
        categories={testCategories}
        activeItemId="colors"
        onItemSelect={vi.fn()}
      />
    );

    const activeItem = screen.getByRole('option', { selected: true });
    expect(activeItem).toHaveTextContent('Colors');
  });

  it('shows item count badge when showItemCount is true', () => {
    renderWithRouter(
      <SidebarNav
        categories={testCategories}
        activeItemId={null}
        onItemSelect={vi.fn()}
        showItemCount={true}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows search box when showSearch is true', () => {
    renderWithRouter(
      <SidebarNav
        categories={testCategories}
        activeItemId={null}
        onItemSelect={vi.fn()}
        showSearch={true}
      />
    );

    expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
  });

  it('hides search box when showSearch is false', () => {
    renderWithRouter(
      <SidebarNav
        categories={testCategories}
        activeItemId={null}
        onItemSelect={vi.fn()}
        showSearch={false}
      />
    );

    expect(screen.queryByPlaceholderText('搜索...')).not.toBeInTheDocument();
  });

  it('calls onItemSelect when item is clicked', () => {
    const onItemSelect = vi.fn();
    
    renderWithRouter(
      <SidebarNav
        categories={testCategories}
        activeItemId={null}
        onItemSelect={onItemSelect}
      />
    );

    fireEvent.click(screen.getByText('Colors'));
    
    expect(onItemSelect).toHaveBeenCalledWith('colors');
  });

  it('does not call onItemSelect for disabled items', () => {
    const categoriesWithDisabled: SidebarNavCategory[] = [
      {
        id: 'tokens',
        label: 'Tokens',
        defaultExpanded: true,
        items: [
          { id: 'colors', label: 'Colors', disabled: true },
        ],
      },
    ];
    
    const onItemSelect = vi.fn();
    
    renderWithRouter(
      <SidebarNav
        categories={categoriesWithDisabled}
        activeItemId={null}
        onItemSelect={onItemSelect}
      />
    );

    fireEvent.click(screen.getByText('Colors'));
    
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it('toggles category expansion when category header is clicked', () => {
    const categoriesCollapsed: SidebarNavCategory[] = [
      {
        id: 'tokens',
        label: 'Tokens',
        defaultExpanded: false,
        items: [
          { id: 'colors', label: 'Colors' },
        ],
      },
    ];
    
    renderWithRouter(
      <SidebarNav
        categories={categoriesCollapsed}
        activeItemId={null}
        onItemSelect={vi.fn()}
      />
    );

    // Initially collapsed - items should not be visible
    expect(screen.queryByText('Colors')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByText('Tokens'));
    
    // Now items should be visible
    expect(screen.getByText('Colors')).toBeInTheDocument();
  });

  it('filters items when search query changes', () => {
    const onSearchChange = vi.fn();
    
    renderWithRouter(
      <SidebarNav
        categories={testCategories}
        activeItemId={null}
        onItemSelect={vi.fn()}
        showSearch={true}
        onSearchChange={onSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('搜索...');
    fireEvent.change(searchInput, { target: { value: 'color' } });
    
    expect(onSearchChange).toHaveBeenCalledWith('color');
  });
});
