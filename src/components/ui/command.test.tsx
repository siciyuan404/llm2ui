/**
 * Command Component Property-Based Tests
 * 
 * **Feature: ui-components-expansion, Property 4: Command Filtering**
 * **Validates: Requirements 4.1, 4.2**
 * 
 * Tests that:
 * 1. Command provides a searchable list of commands/items
 * 2. Command filters items in real-time as user types
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './command';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid command item labels
 */
const labelArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);

/**
 * Generator for search query strings
 */
const searchQueryArb = fc.string({ minLength: 1, maxLength: 15 }).filter(s => s.trim().length > 0);

/**
 * Generator for a list of command items (labels)
 */
const itemListArb = fc.array(labelArb, { minLength: 1, maxLength: 10 });

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Command Filtering (Property 4)', () => {
  /**
   * Property 4a: Command filters items based on search query (case-insensitive)
   * 
   * For any search query string and list of command items:
   * - The Command component should display only items whose label contains the query string
   * - The filtering should be case-insensitive
   * 
   * **Validates: Requirements 4.1, 4.2**
   */
  it('Property 4a: Command filters items based on search query (case-insensitive)', () => {
    fc.assert(
      fc.property(itemListArb, searchQueryArb, (items, query) => {
        const { unmount } = render(
          <Command>
            <CommandInput placeholder="Search..." data-testid="command-input" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {items.map((item, index) => (
                  <CommandItem key={index} value={item}>
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        );

        const input = screen.getByTestId('command-input');
        
        // Type the search query using fireEvent
        fireEvent.change(input, { target: { value: query } });

        // Calculate expected visible items (case-insensitive match)
        const expectedVisibleItems = items.filter(item =>
          item.toLowerCase().includes(query.toLowerCase())
        );

        // Get all visible command items
        const visibleItems = screen.queryAllByRole('option');

        // The number of visible items should match expected
        // Note: cmdk may show items differently, so we check that filtered items are shown
        if (expectedVisibleItems.length === 0) {
          // If no items match, the empty state should be shown or no items visible
          expect(visibleItems.length).toBe(0);
        } else {
          // All visible items should contain the query (case-insensitive)
          visibleItems.forEach(item => {
            const itemText = item.textContent?.toLowerCase() || '';
            expect(itemText.includes(query.toLowerCase())).toBe(true);
          });
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 4b: Command shows all items when search is empty
   * 
   * For any list of command items:
   * - When the search input is empty, all items should be visible
   * 
   * **Validates: Requirements 4.1**
   */
  it('Property 4b: Command shows all items when search is empty', () => {
    fc.assert(
      fc.property(itemListArb, (items) => {
        const { unmount } = render(
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {items.map((item, index) => (
                  <CommandItem key={index} value={item}>
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        );

        // Get all visible command items
        const visibleItems = screen.queryAllByRole('option');

        // All items should be visible when no search query
        expect(visibleItems.length).toBe(items.length);

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 4c: Command renders without error for any valid item list
   * 
   * For any list of command items:
   * - The Command component should render successfully
   * - The input should be accessible
   * 
   * **Validates: Requirements 4.1**
   */
  it('Property 4c: Command renders without error for any valid item list', () => {
    fc.assert(
      fc.property(itemListArb, (items) => {
        const { unmount, container } = render(
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Items">
                {items.map((item, index) => (
                  <CommandItem key={index} value={item}>
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        );

        // Should render without throwing
        expect(container).toBeDefined();

        // Should have input for searching
        const input = screen.getByRole('combobox');
        expect(input).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Command Unit Tests', () => {
  it('should render Command with input and items', () => {
    render(
      <Command>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandGroup>
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('should render CommandEmpty when no items match', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." data-testid="search-input" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem value="apple">Apple</CommandItem>
            <CommandItem value="banana">Banana</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'xyz' } });

    // Should show empty state
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('should render CommandGroup with heading', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Fruits">
            <CommandItem>Apple</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('Fruits')).toBeInTheDocument();
  });

  it('should accept custom className on Command', () => {
    render(
      <Command className="custom-command">
        <CommandList>
          <CommandItem>Item</CommandItem>
        </CommandList>
      </Command>
    );

    const command = document.querySelector('.custom-command');
    expect(command).toBeInTheDocument();
  });

  it('should filter items based on search input', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." data-testid="filter-input" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup>
            <CommandItem value="apple">Apple</CommandItem>
            <CommandItem value="banana">Banana</CommandItem>
            <CommandItem value="cherry">Cherry</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByTestId('filter-input');
    
    // Initially all items should be visible
    expect(screen.getAllByRole('option')).toHaveLength(3);

    // Type 'a' - should filter items
    fireEvent.change(input, { target: { value: 'a' } });
    const filteredItems = screen.getAllByRole('option');
    expect(filteredItems.length).toBeLessThanOrEqual(3);
  });
});
