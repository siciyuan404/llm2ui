/**
 * ToggleGroup Component Property-Based Tests
 * 
 * **Feature: ui-components-expansion, Property 7: ToggleGroup Selection Behavior**
 * **Validates: Requirements 12.2, 12.3, 12.5**
 * 
 * Tests that:
 * 1. Single selection mode behaves like radio buttons (only one selected at a time)
 * 2. Multiple selection mode allows multiple items to be selected
 * 3. Variant and size props are shared with child items
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid ToggleGroup variants
 */
const variantArb = fc.constantFrom('default', 'outline') as fc.Arbitrary<'default' | 'outline'>;

/**
 * Generator for valid ToggleGroup sizes
 */
const sizeArb = fc.constantFrom('default', 'sm', 'lg') as fc.Arbitrary<'default' | 'sm' | 'lg'>;

/**
 * Generator for item values (unique identifiers)
 */
const itemValueArb = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s));

/**
 * Generator for array of unique item values
 */
const itemValuesArb = fc.array(itemValueArb, { minLength: 2, maxLength: 5 })
  .map(arr => [...new Set(arr)])
  .filter(arr => arr.length >= 2);

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('ToggleGroup Selection Behavior (Property 7)', () => {
  /**
   * Property 7a: Single selection mode - selecting a new item deselects the previous
   * 
   * For any ToggleGroup with type="single":
   * - Selecting a new item should deselect the previously selected item
   * - Only one item should be selected at any time
   * 
   * **Validates: Requirements 12.2**
   */
  it('Property 7a: Single selection mode - selecting a new item deselects the previous', () => {
    fc.assert(
      fc.property(itemValuesArb, (values) => {
        // Ensure we have at least 2 unique values
        if (values.length < 2) return true;

        const { unmount } = render(
          <ToggleGroup type="single" data-testid="toggle-group">
            {values.map((value) => (
              <ToggleGroupItem key={value} value={value} data-testid={`item-${value}`}>
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        );

        // Click first item
        const firstItem = screen.getByTestId(`item-${values[0]}`);
        fireEvent.click(firstItem);
        
        // First item should be selected
        expect(firstItem.getAttribute('data-state')).toBe('on');

        // Click second item
        const secondItem = screen.getByTestId(`item-${values[1]}`);
        fireEvent.click(secondItem);

        // Second item should be selected, first should be deselected
        expect(secondItem.getAttribute('data-state')).toBe('on');
        expect(firstItem.getAttribute('data-state')).toBe('off');

        // Verify only one item is selected
        const allItems = values.map(v => screen.getByTestId(`item-${v}`));
        const selectedCount = allItems.filter(
          item => item.getAttribute('data-state') === 'on'
        ).length;
        expect(selectedCount).toBe(1);

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 7b: Multiple selection mode - selecting a new item does not affect others
   * 
   * For any ToggleGroup with type="multiple":
   * - Selecting a new item should not deselect other selected items
   * - Multiple items can be selected simultaneously
   * 
   * **Validates: Requirements 12.3**
   */
  it('Property 7b: Multiple selection mode - selecting a new item does not affect others', () => {
    fc.assert(
      fc.property(itemValuesArb, (values) => {
        // Ensure we have at least 2 unique values
        if (values.length < 2) return true;

        const { unmount } = render(
          <ToggleGroup type="multiple" data-testid="toggle-group">
            {values.map((value) => (
              <ToggleGroupItem key={value} value={value} data-testid={`item-${value}`}>
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        );

        // Click first item
        const firstItem = screen.getByTestId(`item-${values[0]}`);
        fireEvent.click(firstItem);
        
        // First item should be selected
        expect(firstItem.getAttribute('data-state')).toBe('on');

        // Click second item
        const secondItem = screen.getByTestId(`item-${values[1]}`);
        fireEvent.click(secondItem);

        // Both items should be selected
        expect(firstItem.getAttribute('data-state')).toBe('on');
        expect(secondItem.getAttribute('data-state')).toBe('on');

        // Verify both items are selected
        const allItems = values.map(v => screen.getByTestId(`item-${v}`));
        const selectedCount = allItems.filter(
          item => item.getAttribute('data-state') === 'on'
        ).length;
        expect(selectedCount).toBe(2);

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 7c: Variant and size props are shared with child items
   * 
   * For any ToggleGroup with variant and size props:
   * - Child ToggleGroupItems should inherit the variant and size
   * - The styling should be consistent across all items
   * 
   * **Validates: Requirements 12.5**
   */
  it('Property 7c: Variant and size props are shared with child items', () => {
    fc.assert(
      fc.property(variantArb, sizeArb, itemValuesArb, (variant, size, values) => {
        // Ensure we have at least 2 unique values
        if (values.length < 2) return true;

        const { unmount } = render(
          <ToggleGroup type="single" variant={variant} size={size}>
            {values.map((value) => (
              <ToggleGroupItem key={value} value={value} data-testid={`item-${value}`}>
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        );

        // Check that all items have the expected size classes
        const allItems = values.map(v => screen.getByTestId(`item-${v}`));
        
        for (const item of allItems) {
          // Check size-specific classes
          if (size === 'sm') {
            expect(item.className).toContain('h-9');
          } else if (size === 'lg') {
            expect(item.className).toContain('h-11');
          } else {
            expect(item.className).toContain('h-10');
          }

          // Check variant-specific classes
          if (variant === 'outline') {
            expect(item.className).toContain('border');
          }
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 7d: ToggleGroup renders all items correctly
   * 
   * For any ToggleGroup configuration:
   * - All items should be rendered
   * - Items should be accessible (have button role)
   * 
   * **Validates: Requirements 12.1**
   */
  it('Property 7d: ToggleGroup renders all items correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('single', 'multiple') as fc.Arbitrary<'single' | 'multiple'>,
        variantArb,
        sizeArb,
        itemValuesArb,
        (type, variant, size, values) => {
          // Ensure we have at least 2 unique values
          if (values.length < 2) return true;

          const { unmount, container } = render(
            <ToggleGroup type={type} variant={variant} size={size}>
              {values.map((value) => (
                <ToggleGroupItem key={value} value={value}>
                  {value}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          );

          // Should render without throwing
          expect(container).toBeDefined();

          // All items should be rendered - single mode uses radio role, multiple uses button
          const role = type === 'single' ? 'radio' : 'button';
          const items = screen.getAllByRole(role);
          expect(items.length).toBe(values.length);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('ToggleGroup Unit Tests', () => {
  it('should render a single selection toggle group', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>
    );
    
    // Single mode uses radio role
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('should render a multiple selection toggle group', () => {
    render(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('should call onValueChange when selection changes in single mode', () => {
    const handleValueChange = vi.fn();
    
    render(
      <ToggleGroup type="single" onValueChange={handleValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const buttonA = screen.getByText('A');
    fireEvent.click(buttonA);
    
    expect(handleValueChange).toHaveBeenCalledWith('a');
  });

  it('should call onValueChange when selection changes in multiple mode', () => {
    const handleValueChange = vi.fn();
    
    render(
      <ToggleGroup type="multiple" onValueChange={handleValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const buttonA = screen.getByText('A');
    const buttonB = screen.getByText('B');
    
    fireEvent.click(buttonA);
    expect(handleValueChange).toHaveBeenCalledWith(['a']);
    
    fireEvent.click(buttonB);
    expect(handleValueChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('should support controlled value in single mode', () => {
    render(
      <ToggleGroup type="single" value="b">
        <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
        <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const itemA = screen.getByTestId('item-a');
    const itemB = screen.getByTestId('item-b');
    
    expect(itemA.getAttribute('data-state')).toBe('off');
    expect(itemB.getAttribute('data-state')).toBe('on');
  });

  it('should support controlled value in multiple mode', () => {
    render(
      <ToggleGroup type="multiple" value={['a', 'c']}>
        <ToggleGroupItem value="a" data-testid="item-a">A</ToggleGroupItem>
        <ToggleGroupItem value="b" data-testid="item-b">B</ToggleGroupItem>
        <ToggleGroupItem value="c" data-testid="item-c">C</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const itemA = screen.getByTestId('item-a');
    const itemB = screen.getByTestId('item-b');
    const itemC = screen.getByTestId('item-c');
    
    expect(itemA.getAttribute('data-state')).toBe('on');
    expect(itemB.getAttribute('data-state')).toBe('off');
    expect(itemC.getAttribute('data-state')).toBe('on');
  });

  it('should accept custom className on group', () => {
    render(
      <ToggleGroup type="single" className="custom-group-class">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const group = screen.getByRole('group');
    expect(group.className).toContain('custom-group-class');
  });

  it('should accept custom className on items', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a" className="custom-item-class">A</ToggleGroupItem>
      </ToggleGroup>
    );
    
    // Single mode uses radio role
    const radio = screen.getByRole('radio');
    expect(radio.className).toContain('custom-item-class');
  });

  it('should disable items when disabled prop is set', () => {
    render(
      <ToggleGroup type="single" disabled>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    
    // Single mode uses radio role
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toBeDisabled();
    });
  });
});
