/**
 * Pagination Component Property-Based Tests
 * 
 * **Feature: ui-components-expansion, Property 5: Pagination Page Rendering**
 * **Validates: Requirements 10.1, 10.3**
 * 
 * Tests that:
 * 1. For any pagination with currentPage and totalPages, the active page link
 *    SHALL have the isActive styling
 * 2. The component SHALL render navigation controls for previous/next when applicable
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './pagination';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for current page (must be within total pages)
 */
const paginationStateArb = fc.integer({ min: 1, max: 20 }).chain(totalPages =>
  fc.record({
    totalPages: fc.constant(totalPages),
    currentPage: fc.integer({ min: 1, max: totalPages }),
  })
);

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Helper component to render a pagination with given state
 */
const TestPagination = ({ 
  currentPage, 
  totalPages,
  showPrevious = true,
  showNext = true,
}: { 
  currentPage: number; 
  totalPages: number;
  showPrevious?: boolean;
  showNext?: boolean;
}) => {
  // Generate page numbers to display (simplified: show all pages up to 7, then use ellipsis)
  const pages: (number | 'ellipsis')[] = [];
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('ellipsis');
    }
    
    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }
    
    // Always show last page
    pages.push(totalPages);
  }

  return (
    <Pagination>
      <PaginationContent>
        {showPrevious && currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
        )}
        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href="#" isActive={page === currentPage}>
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        {showNext && currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Pagination Page Rendering (Property 5)', () => {
  /**
   * Property 5a: Active page has isActive styling (aria-current="page")
   * 
   * For any pagination with currentPage and totalPages:
   * - The active page link SHALL have aria-current="page"
   * 
   * **Validates: Requirements 10.3**
   */
  it('Property 5a: Active page has isActive styling (aria-current="page")', () => {
    fc.assert(
      fc.property(paginationStateArb, ({ currentPage, totalPages }) => {
        const { container, unmount } = render(
          <TestPagination currentPage={currentPage} totalPages={totalPages} />
        );

        // Find the active page link
        const activeLink = container.querySelector('[aria-current="page"]');
        
        // Should have exactly one active page
        expect(activeLink).not.toBeNull();
        
        // The active link should contain the current page number
        expect(activeLink?.textContent).toBe(String(currentPage));

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 5b: Previous button shown only when not on first page
   * 
   * For any pagination:
   * - Previous button should be shown when currentPage > 1
   * - Previous button should not be shown when currentPage === 1
   * 
   * **Validates: Requirements 10.1**
   */
  it('Property 5b: Previous button shown only when not on first page', () => {
    fc.assert(
      fc.property(paginationStateArb, ({ currentPage, totalPages }) => {
        const { container, unmount } = render(
          <TestPagination currentPage={currentPage} totalPages={totalPages} />
        );

        const previousButton = container.querySelector('[aria-label="Go to previous page"]');
        
        if (currentPage > 1) {
          // Should have previous button when not on first page
          expect(previousButton).not.toBeNull();
        } else {
          // Should not have previous button on first page
          expect(previousButton).toBeNull();
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 5c: Next button shown only when not on last page
   * 
   * For any pagination:
   * - Next button should be shown when currentPage < totalPages
   * - Next button should not be shown when currentPage === totalPages
   * 
   * **Validates: Requirements 10.1**
   */
  it('Property 5c: Next button shown only when not on last page', () => {
    fc.assert(
      fc.property(paginationStateArb, ({ currentPage, totalPages }) => {
        const { container, unmount } = render(
          <TestPagination currentPage={currentPage} totalPages={totalPages} />
        );

        const nextButton = container.querySelector('[aria-label="Go to next page"]');
        
        if (currentPage < totalPages) {
          // Should have next button when not on last page
          expect(nextButton).not.toBeNull();
        } else {
          // Should not have next button on last page
          expect(nextButton).toBeNull();
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 5d: Only one page is marked as active at a time
   * 
   * For any pagination:
   * - Exactly one page link should have aria-current="page"
   * 
   * **Validates: Requirements 10.3**
   */
  it('Property 5d: Only one page is marked as active at a time', () => {
    fc.assert(
      fc.property(paginationStateArb, ({ currentPage, totalPages }) => {
        const { container, unmount } = render(
          <TestPagination currentPage={currentPage} totalPages={totalPages} />
        );

        const activeLinks = container.querySelectorAll('[aria-current="page"]');
        
        // Should have exactly one active page
        expect(activeLinks.length).toBe(1);

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Pagination Unit Tests', () => {
  it('should render pagination with aria-label', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'pagination');
  });

  it('should render PaginationLink with isActive styling', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    const link = screen.getByText('1');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('should render PaginationPrevious with correct aria-label', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    const previous = screen.getByLabelText('Go to previous page');
    expect(previous).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('should render PaginationNext with correct aria-label', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    const next = screen.getByLabelText('Go to next page');
    expect(next).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should render PaginationEllipsis with sr-only text', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    expect(screen.getByText('More pages')).toHaveClass('sr-only');
  });

  it('should accept custom className on Pagination', () => {
    render(
      <Pagination className="custom-pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-pagination');
  });

  it('should accept custom className on PaginationContent', () => {
    render(
      <Pagination>
        <PaginationContent className="custom-content">
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    const list = screen.getByRole('list');
    expect(list).toHaveClass('custom-content');
  });
});
