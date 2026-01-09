/**
 * Breadcrumb Component Property-Based Tests
 * 
 * **Feature: ui-components-expansion, Property 3: Breadcrumb Separator Rendering**
 * **Validates: Requirements 3.1**
 * 
 * Tests that:
 * 1. For any list of breadcrumb items with length N > 1, the rendered Breadcrumb
 *    SHALL contain exactly N-1 separator elements between the items.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for breadcrumb item text
 */
const itemTextArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);

/**
 * Generator for breadcrumb item count (at least 2 to have separators)
 */
const itemCountArb = fc.integer({ min: 2, max: 10 });

/**
 * Generator for a list of breadcrumb item texts
 */
const itemListArb = fc.array(itemTextArb, { minLength: 2, maxLength: 10 });

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Breadcrumb Separator Rendering (Property 3)', () => {
  /**
   * Property 3a: Breadcrumb with N items has exactly N-1 separators
   * 
   * For any list of breadcrumb items with length N > 1:
   * - The rendered Breadcrumb SHALL contain exactly N-1 separator elements
   * 
   * **Validates: Requirements 3.1**
   */
  it('Property 3a: Breadcrumb with N items has exactly N-1 separators', () => {
    fc.assert(
      fc.property(itemListArb, (items) => {
        const { container, unmount } = render(
          <Breadcrumb>
            <BreadcrumbList>
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index < items.length - 1 ? (
                      <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < items.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        );

        // Count separators (li elements with role="presentation" and aria-hidden="true")
        const separators = container.querySelectorAll('li[role="presentation"][aria-hidden="true"]');
        
        // Should have exactly N-1 separators for N items
        expect(separators.length).toBe(items.length - 1);

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 3b: Breadcrumb separators are properly marked as presentational
   * 
   * For any breadcrumb with separators:
   * - Each separator should have role="presentation" and aria-hidden="true"
   * 
   * **Validates: Requirements 3.1**
   */
  it('Property 3b: Breadcrumb separators are properly marked as presentational', () => {
    fc.assert(
      fc.property(itemCountArb, (count) => {
        const items = Array.from({ length: count }, (_, i) => `Item ${i + 1}`);
        
        const { container, unmount } = render(
          <Breadcrumb>
            <BreadcrumbList>
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index < items.length - 1 ? (
                      <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < items.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        );

        const separators = container.querySelectorAll('li[role="presentation"]');
        
        // All separators should have aria-hidden="true"
        separators.forEach(separator => {
          expect(separator.getAttribute('aria-hidden')).toBe('true');
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 3c: Breadcrumb renders correct number of links and pages
   * 
   * For any breadcrumb with N items:
   * - Should have N-1 links (all but the last item)
   * - Should have 1 page (the last item)
   * 
   * **Validates: Requirements 3.1**
   */
  it('Property 3c: Breadcrumb renders correct number of links and pages', () => {
    fc.assert(
      fc.property(itemListArb, (items) => {
        const { container, unmount } = render(
          <Breadcrumb>
            <BreadcrumbList>
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index < items.length - 1 ? (
                      <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < items.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        );

        // Count links (anchor elements)
        const links = container.querySelectorAll('a');
        expect(links.length).toBe(items.length - 1);

        // Count pages (span with aria-current="page")
        const pages = container.querySelectorAll('[aria-current="page"]');
        expect(pages.length).toBe(1);

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('Breadcrumb Unit Tests', () => {
  it('should render breadcrumb with aria-label', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb');
  });

  it('should render BreadcrumbPage with aria-current="page"', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Current Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    
    const page = screen.getByText('Current Page');
    expect(page).toHaveAttribute('aria-current', 'page');
    expect(page).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render BreadcrumbEllipsis with sr-only text', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    
    expect(screen.getByText('More')).toHaveClass('sr-only');
  });

  it('should render custom separator', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('should accept custom className on BreadcrumbList', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList className="custom-list">
          <BreadcrumbItem>
            <BreadcrumbPage>Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    
    const list = screen.getByRole('list');
    expect(list).toHaveClass('custom-list');
  });

  it('should render BreadcrumbLink with asChild prop', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <span data-testid="custom-link">Custom Link</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    
    expect(screen.getByTestId('custom-link')).toBeInTheDocument();
  });
});
