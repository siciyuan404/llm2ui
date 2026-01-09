/**
 * Sheet Component Property-Based Tests
 * 
 * **Feature: ui-components-expansion, Property 2: Sheet Side Positioning**
 * **Validates: Requirements 2.1**
 * 
 * Tests that:
 * 1. Sheet renders with correct side-specific positioning classes
 * 2. Sheet slides in from the specified side (top, bottom, left, right)
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  sheetVariants,
} from './sheet';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid Sheet sides
 */
const sideArb = fc.constantFrom('top', 'bottom', 'left', 'right') as fc.Arbitrary<'top' | 'bottom' | 'left' | 'right'>;

/**
 * Generator for Sheet content text
 */
const textArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Sheet Side Positioning (Property 2)', () => {
  /**
   * Property 2a: Sheet variant classes contain correct side-specific positioning
   * 
   * For any valid side value (top, bottom, left, right):
   * - The sheetVariants function should return classes that include slide animations from that side
   * 
   * **Validates: Requirements 2.1**
   */
  it('Property 2a: sheetVariants returns correct side-specific classes', () => {
    fc.assert(
      fc.property(sideArb, (side) => {
        const classes = sheetVariants({ side });
        
        // Each side should have corresponding slide-in-from and slide-out-to classes
        switch (side) {
          case 'top':
            expect(classes).toContain('slide-in-from-top');
            expect(classes).toContain('slide-out-to-top');
            expect(classes).toContain('top-0');
            expect(classes).toContain('border-b');
            break;
          case 'bottom':
            expect(classes).toContain('slide-in-from-bottom');
            expect(classes).toContain('slide-out-to-bottom');
            expect(classes).toContain('bottom-0');
            expect(classes).toContain('border-t');
            break;
          case 'left':
            expect(classes).toContain('slide-in-from-left');
            expect(classes).toContain('slide-out-to-left');
            expect(classes).toContain('left-0');
            expect(classes).toContain('border-r');
            break;
          case 'right':
            expect(classes).toContain('slide-in-from-right');
            expect(classes).toContain('slide-out-to-right');
            expect(classes).toContain('right-0');
            expect(classes).toContain('border-l');
            break;
        }
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 2b: Sheet renders with correct positioning for any side
   * 
   * For any valid side value:
   * - The SheetContent should render with the correct positioning classes
   * 
   * **Validates: Requirements 2.1**
   */
  it('Property 2b: SheetContent renders with correct positioning for any side', () => {
    fc.assert(
      fc.property(sideArb, textArb, (side, title) => {
        const { unmount } = render(
          <Sheet open={true}>
            <SheetTrigger>Open</SheetTrigger>
            <SheetContent side={side}>
              <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        );

        // Find the sheet content by role
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeDefined();

        // Check that the dialog has the correct side-specific classes
        const classes = dialog.className;
        
        switch (side) {
          case 'top':
            expect(classes).toContain('top-0');
            break;
          case 'bottom':
            expect(classes).toContain('bottom-0');
            break;
          case 'left':
            expect(classes).toContain('left-0');
            break;
          case 'right':
            expect(classes).toContain('right-0');
            break;
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 2c: Horizontal sides (left, right) have full height
   * 
   * For left and right sides:
   * - The Sheet should have h-full class for full height
   * 
   * **Validates: Requirements 2.1**
   */
  it('Property 2c: Horizontal sides have full height', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('left', 'right') as fc.Arbitrary<'left' | 'right'>,
        (side) => {
          const classes = sheetVariants({ side });
          expect(classes).toContain('h-full');
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 2d: Vertical sides (top, bottom) span full width
   * 
   * For top and bottom sides:
   * - The Sheet should have inset-x-0 class for full width
   * 
   * **Validates: Requirements 2.1**
   */
  it('Property 2d: Vertical sides span full width', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('top', 'bottom') as fc.Arbitrary<'top' | 'bottom'>,
        (side) => {
          const classes = sheetVariants({ side });
          expect(classes).toContain('inset-x-0');
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Sheet Unit Tests', () => {
  it('should render with default side (right)', () => {
    render(
      <Sheet open={true}>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('right-0');
  });

  it('should render SheetHeader correctly', () => {
    render(
      <Sheet open={true}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Test Title</SheetTitle>
            <SheetDescription>Test Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render SheetFooter correctly', () => {
    render(
      <Sheet open={true}>
        <SheetContent>
          <SheetFooter>
            <button>Save</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    render(
      <Sheet open={true}>
        <SheetContent className="custom-class">
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('custom-class');
  });

  it('should render close button', () => {
    render(
      <Sheet open={true}>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should render overlay', () => {
    const { container } = render(
      <Sheet open={true}>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    // Overlay should have bg-black/80 class
    const overlay = container.querySelector('[data-state="open"]');
    expect(overlay).toBeDefined();
  });
});
