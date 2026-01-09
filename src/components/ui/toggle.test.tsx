/**
 * Toggle Component Property-Based Tests
 * 
 * **Feature: ui-components-expansion, Property 6: Toggle State and Styling**
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**
 * 
 * Tests that:
 * 1. Toggle renders with correct variant and size classes
 * 2. Toggle updates aria-pressed attribute when state changes
 * 3. Toggle visual styling reflects the pressed state
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './toggle';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid Toggle variants
 */
const variantArb = fc.constantFrom('default', 'outline') as fc.Arbitrary<'default' | 'outline'>;

/**
 * Generator for valid Toggle sizes
 */
const sizeArb = fc.constantFrom('default', 'sm', 'lg') as fc.Arbitrary<'default' | 'sm' | 'lg'>;

/**
 * Generator for Toggle pressed state
 */
const pressedArb = fc.boolean();

/**
 * Generator for Toggle text content
 */
const textArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Toggle State and Styling (Property 6)', () => {
  /**
   * Property 6a: Toggle renders correct classes for any valid variant and size
   * 
   * For any valid variant (default, outline) and size (default, sm, lg):
   * - The Toggle component should render with the corresponding CSS classes
   * 
   * **Validates: Requirements 11.2, 11.3**
   */
  it('Property 6a: Toggle renders correct classes for any valid variant and size', () => {
    fc.assert(
      fc.property(variantArb, sizeArb, textArb, (variant, size, text) => {
        const { unmount } = render(
          <Toggle variant={variant} size={size}>
            {text}
          </Toggle>
        );

        const button = screen.getByRole('button');
        expect(button).toBeDefined();

        // Check that key variant-specific classes are present
        if (variant === 'outline') {
          expect(button.className).toContain('border');
        }

        // Check size-specific classes
        if (size === 'sm') {
          expect(button.className).toContain('h-9');
        } else if (size === 'lg') {
          expect(button.className).toContain('h-11');
        } else {
          expect(button.className).toContain('h-10');
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 6b: Toggle aria-pressed attribute matches pressed state
   * 
   * For any Toggle with any pressed state:
   * - The aria-pressed attribute should match the current pressed state
   * 
   * **Validates: Requirements 11.4**
   */
  it('Property 6b: Toggle aria-pressed attribute matches pressed state', () => {
    fc.assert(
      fc.property(pressedArb, textArb, (pressed, text) => {
        const { unmount } = render(
          <Toggle pressed={pressed}>
            {text}
          </Toggle>
        );

        const button = screen.getByRole('button');
        expect(button.getAttribute('aria-pressed')).toBe(String(pressed));
        expect(button.getAttribute('data-state')).toBe(pressed ? 'on' : 'off');

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 6c: Toggle state changes update both aria-pressed and visual styling
   * 
   * For any Toggle, when the pressed state changes:
   * - The aria-pressed attribute should update
   * - The data-state attribute should update (used for styling)
   * 
   * **Validates: Requirements 11.1, 11.5**
   */
  it('Property 6c: Toggle state changes update both aria-pressed and visual styling', () => {
    fc.assert(
      fc.property(variantArb, sizeArb, textArb, (variant, size, text) => {
        const { unmount } = render(
          <Toggle variant={variant} size={size} defaultPressed={false}>
            {text}
          </Toggle>
        );

        const button = screen.getByRole('button');
        
        // Initial state should be unpressed
        expect(button.getAttribute('aria-pressed')).toBe('false');
        expect(button.getAttribute('data-state')).toBe('off');

        // Click to toggle
        fireEvent.click(button);

        // State should now be pressed
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(button.getAttribute('data-state')).toBe('on');

        // Click again to toggle back
        fireEvent.click(button);

        // State should be unpressed again
        expect(button.getAttribute('aria-pressed')).toBe('false');
        expect(button.getAttribute('data-state')).toBe('off');

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 6d: Toggle with all variant/size combinations renders without error
   * 
   * For any combination of variant and size:
   * - The Toggle should render successfully
   * - The Toggle should be accessible (have button role)
   * 
   * **Validates: Requirements 11.1, 11.2, 11.3**
   */
  it('Property 6d: Toggle with all variant/size combinations renders without error', () => {
    const variants = ['default', 'outline'] as const;
    const sizes = ['default', 'sm', 'lg'] as const;

    fc.assert(
      fc.property(
        fc.constantFrom(...variants),
        fc.constantFrom(...sizes),
        fc.boolean(),
        (variant, size, pressed) => {
          const { unmount, container } = render(
            <Toggle variant={variant} size={size} pressed={pressed}>
              Toggle
            </Toggle>
          );

          // Should render without throwing
          expect(container).toBeDefined();

          // Should have button role for accessibility
          const button = screen.getByRole('button');
          expect(button).toBeInTheDocument();

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

describe('Toggle Unit Tests', () => {
  it('should render with default variant and size', () => {
    render(<Toggle>Toggle</Toggle>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Toggle');
  });

  it('should render with outline variant', () => {
    render(<Toggle variant="outline">Toggle</Toggle>);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('border');
  });

  it('should render with sm size', () => {
    render(<Toggle size="sm">Toggle</Toggle>);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-9');
  });

  it('should render with lg size', () => {
    render(<Toggle size="lg">Toggle</Toggle>);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-11');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Toggle disabled>Toggle</Toggle>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should accept custom className', () => {
    render(<Toggle className="custom-class">Toggle</Toggle>);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });

  it('should call onPressedChange when toggled', () => {
    let pressedState = false;
    const handlePressedChange = (pressed: boolean) => {
      pressedState = pressed;
    };

    render(
      <Toggle onPressedChange={handlePressedChange}>
        Toggle
      </Toggle>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(pressedState).toBe(true);
  });
});
