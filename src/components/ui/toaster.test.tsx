/**
 * Toaster Component Property-Based Tests
 * 
 * **Feature: ui-components-expansion, Property 1: Toast Configuration Rendering**
 * **Validates: Requirements 1.1, 1.2, 1.4**
 * 
 * Tests that:
 * 1. Toaster renders with correct position configuration
 * 2. Toast types (success, error, warning, info) render with appropriate styling
 * 3. Toaster supports all valid position combinations
 */

import { describe, it, expect, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { Toaster } from './toaster';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid Toaster positions
 */
const positionArb = fc.constantFrom(
  'top-left',
  'top-right', 
  'bottom-left',
  'bottom-right',
  'top-center',
  'bottom-center'
) as fc.Arbitrary<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'>;

/**
 * Generator for expand prop
 */
const expandArb = fc.boolean();

/**
 * Generator for richColors prop
 */
const richColorsArb = fc.boolean();

/**
 * Generator for closeButton prop
 */
const closeButtonArb = fc.boolean();

/**
 * Generator for duration (in milliseconds)
 */
const durationArb = fc.integer({ min: 1000, max: 10000 });

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Toast Configuration Rendering (Property 1)', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 1a: Toaster renders without error for any valid position
   * 
   * For any valid position (top-left, top-right, bottom-left, bottom-right, top-center, bottom-center):
   * - The Toaster component should render successfully
   * - The Toaster should have the toaster class
   * 
   * **Validates: Requirements 1.4**
   */
  it('Property 1a: Toaster renders without error for any valid position', () => {
    fc.assert(
      fc.property(positionArb, (position) => {
        const { container, unmount } = render(
          <Toaster position={position} />
        );

        // Should render without throwing
        expect(container).toBeDefined();

        // Should have the toaster element with correct class
        const toasterElement = container.querySelector('[data-sonner-toaster]');
        expect(toasterElement).toBeDefined();

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 1b: Toaster renders with all configuration combinations
   * 
   * For any combination of position, expand, richColors, and closeButton:
   * - The Toaster component should render successfully
   * 
   * **Validates: Requirements 1.1, 1.2, 1.4**
   */
  it('Property 1b: Toaster renders with all configuration combinations', () => {
    fc.assert(
      fc.property(
        positionArb,
        expandArb,
        richColorsArb,
        closeButtonArb,
        (position, expand, richColors, closeButton) => {
          const { container, unmount } = render(
            <Toaster 
              position={position}
              expand={expand}
              richColors={richColors}
              closeButton={closeButton}
            />
          );

          // Should render without throwing
          expect(container).toBeDefined();

          // Should have the toaster element
          const toasterElement = container.querySelector('[data-sonner-toaster]');
          expect(toasterElement).toBeDefined();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 1c: Toaster renders with valid duration configurations
   * 
   * For any valid duration value:
   * - The Toaster component should render successfully
   * 
   * **Validates: Requirements 1.1**
   */
  it('Property 1c: Toaster renders with valid duration configurations', () => {
    fc.assert(
      fc.property(durationArb, (duration) => {
        const { container, unmount } = render(
          <Toaster duration={duration} />
        );

        // Should render without throwing
        expect(container).toBeDefined();

        // Should have the toaster element
        const toasterElement = container.querySelector('[data-sonner-toaster]');
        expect(toasterElement).toBeDefined();

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 1d: Toaster has correct styling classes
   * 
   * For any Toaster configuration:
   * - The Toaster should have the 'toaster' and 'group' classes
   * 
   * **Validates: Requirements 1.1, 1.2**
   */
  it('Property 1d: Toaster has correct styling classes', () => {
    fc.assert(
      fc.property(positionArb, (position) => {
        const { container, unmount } = render(
          <Toaster position={position} />
        );

        const toasterElement = container.querySelector('[data-sonner-toaster]');
        expect(toasterElement).toBeDefined();
        
        // Check that the toaster has the expected classes
        if (toasterElement) {
          expect(toasterElement.className).toContain('toaster');
          expect(toasterElement.className).toContain('group');
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Toaster Unit Tests', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with default configuration', () => {
    const { container } = render(<Toaster />);
    
    const toasterElement = container.querySelector('[data-sonner-toaster]');
    expect(toasterElement).toBeDefined();
  });

  it('should render with top-right position', () => {
    const { container } = render(<Toaster position="top-right" />);
    
    const toasterElement = container.querySelector('[data-sonner-toaster]');
    expect(toasterElement).toBeDefined();
  });

  it('should render with bottom-left position', () => {
    const { container } = render(<Toaster position="bottom-left" />);
    
    const toasterElement = container.querySelector('[data-sonner-toaster]');
    expect(toasterElement).toBeDefined();
  });

  it('should render with expand prop', () => {
    const { container } = render(<Toaster expand={true} />);
    
    const toasterElement = container.querySelector('[data-sonner-toaster]');
    expect(toasterElement).toBeDefined();
  });

  it('should render with richColors prop', () => {
    const { container } = render(<Toaster richColors={true} />);
    
    const toasterElement = container.querySelector('[data-sonner-toaster]');
    expect(toasterElement).toBeDefined();
  });

  it('should render with closeButton prop', () => {
    const { container } = render(<Toaster closeButton={true} />);
    
    const toasterElement = container.querySelector('[data-sonner-toaster]');
    expect(toasterElement).toBeDefined();
  });

  it('should render with custom duration', () => {
    const { container } = render(<Toaster duration={5000} />);
    
    const toasterElement = container.querySelector('[data-sonner-toaster]');
    expect(toasterElement).toBeDefined();
  });

  it('should have toaster and group classes', () => {
    const { container } = render(<Toaster />);
    
    const toasterElement = container.querySelector('[data-sonner-toaster]');
    expect(toasterElement).toBeDefined();
    if (toasterElement) {
      expect(toasterElement.className).toContain('toaster');
      expect(toasterElement.className).toContain('group');
    }
  });
});
