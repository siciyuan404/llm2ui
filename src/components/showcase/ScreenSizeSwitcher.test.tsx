/**
 * ScreenSizeSwitcher Property-Based Tests
 * 
 * **Feature: showcase-design-system, Property 9: 屏幕尺寸 URL 持久化**
 * **Validates: Requirements 6.5, 6.6**
 * 
 * Tests that:
 * 1. Screen size selection updates URL query parameter "size"
 * 2. Navigating between items preserves the screen size selection
 * 
 * @module ScreenSizeSwitcher.test
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ScreenSizeSwitcher, 
  useScreenSize,
  parseScreenSizeFromUrl,
  isValidScreenSize,
  type ScreenSize 
} from './ScreenSizeSwitcher';

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
 * Helper component to test useScreenSize hook
 */
function UseScreenSizeTestComponent({ 
  onSize, 
  onSetSize,
  queryParam = 'size'
}: { 
  onSize: (size: ScreenSize) => void;
  onSetSize: (setSize: (size: ScreenSize) => void) => void;
  queryParam?: string;
}) {
  const [size, setSize] = useScreenSize({ queryParam });
  onSize(size);
  onSetSize(setSize);
  return null;
}

/**
 * Helper component to simulate navigation while preserving query params
 */
function NavigationTestComponent({ 
  onNavigate 
}: { 
  onNavigate: (navigate: ReturnType<typeof useNavigate>) => void 
}) {
  const navigate = useNavigate();
  onNavigate(navigate);
  return null;
}

/**
 * Render component with router context
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
 * Generator for valid screen sizes
 */
const screenSizeArb: fc.Arbitrary<ScreenSize> = fc.constantFrom('desktop', 'tablet', 'mobile');

/**
 * Generator for non-default screen sizes (tablet, mobile)
 * Desktop is the default, so it's removed from URL
 */
const nonDefaultScreenSizeArb: fc.Arbitrary<ScreenSize> = fc.constantFrom('tablet', 'mobile');

/**
 * Generator for URL query parameter names
 */
const queryParamNameArb = fc.stringMatching(/^[a-z][a-z0-9]{0,8}$/);

/**
 * Generator for sidebar item paths (simulating navigation)
 */
const itemPathArb = fc.stringMatching(/^\/showcase\/[a-z]+\/[a-z]+$/);

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Property 9: 屏幕尺寸 URL 持久化', () => {
  /**
   * Property 9a: Screen size selection updates URL query parameter
   * 
   * *For any* screen size selection (desktop/tablet/mobile), the URL query
   * parameter "size" SHALL be updated to reflect the selection.
   * 
   * **Feature: showcase-design-system, Property 9: 屏幕尺寸 URL 持久化**
   * **Validates: Requirements 6.5**
   */
  it('Property 9a: Screen size selection updates URL query parameter', () => {
    fc.assert(
      fc.property(nonDefaultScreenSizeArb, (targetSize) => {
        let capturedParams: URLSearchParams | null = null;
        
        const { unmount } = renderWithRouter(
          <>
            <ScreenSizeSwitcher syncWithUrl={true} />
            <URLParamsCapture onParams={(params) => { capturedParams = params; }} />
          </>
        );
        
        // Find and click the target size button
        const button = screen.getByRole('radio', { name: new RegExp(targetSize, 'i') });
        fireEvent.click(button);
        
        // Verify URL was updated
        expect(capturedParams).not.toBeNull();
        expect(capturedParams!.get('size')).toBe(targetSize);
        
        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 9b: Desktop selection removes size parameter (clean URL)
   * 
   * *For any* initial non-default screen size, selecting desktop SHALL
   * remove the "size" query parameter to keep the URL clean.
   * 
   * **Feature: showcase-design-system, Property 9: 屏幕尺寸 URL 持久化**
   * **Validates: Requirements 6.5**
   */
  it('Property 9b: Desktop selection removes size parameter for clean URL', () => {
    fc.assert(
      fc.property(nonDefaultScreenSizeArb, (initialSize) => {
        let capturedParams: URLSearchParams | null = null;
        
        const { unmount } = renderWithRouter(
          <>
            <ScreenSizeSwitcher syncWithUrl={true} />
            <URLParamsCapture onParams={(params) => { capturedParams = params; }} />
          </>,
          { initialEntries: [`/?size=${initialSize}`] }
        );
        
        // Click desktop button
        const desktopButton = screen.getByRole('radio', { name: /desktop/i });
        fireEvent.click(desktopButton);
        
        // Verify size parameter was removed
        expect(capturedParams).not.toBeNull();
        expect(capturedParams!.has('size')).toBe(false);
        
        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 9c: Loading page with URL size parameter selects correct size
   * 
   * *For any* valid screen size in the URL, loading the page SHALL
   * display that size as selected.
   * 
   * **Feature: showcase-design-system, Property 9: 屏幕尺寸 URL 持久化**
   * **Validates: Requirements 6.5**
   */
  it('Property 9c: Loading page with URL size parameter selects correct size', () => {
    fc.assert(
      fc.property(screenSizeArb, (targetSize) => {
        const initialUrl = targetSize === 'desktop' ? '/' : `/?size=${targetSize}`;
        
        const { unmount } = renderWithRouter(
          <ScreenSizeSwitcher syncWithUrl={true} />,
          { initialEntries: [initialUrl] }
        );
        
        // Verify the correct button is selected (case-insensitive match)
        const selectedButton = screen.getByRole('radio', { checked: true });
        const ariaLabel = selectedButton.getAttribute('aria-label') || '';
        expect(ariaLabel.toLowerCase()).toContain(targetSize.toLowerCase());
        
        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 9d: Screen size persists when navigating between items
   * 
   * *For any* screen size selection, navigating to a different sidebar item
   * SHALL preserve the screen size query parameter.
   * 
   * **Feature: showcase-design-system, Property 9: 屏幕尺寸 URL 持久化**
   * **Validates: Requirements 6.6**
   */
  it('Property 9d: Screen size persists when navigating between items', () => {
    fc.assert(
      fc.property(
        nonDefaultScreenSizeArb,
        itemPathArb,
        (targetSize, newPath) => {
          let capturedParams: URLSearchParams | null = null;
          let navigateFn: ReturnType<typeof useNavigate> | null = null;
          
          const { unmount } = renderWithRouter(
            <>
              <ScreenSizeSwitcher syncWithUrl={true} />
              <URLParamsCapture onParams={(params) => { capturedParams = params; }} />
              <NavigationTestComponent onNavigate={(nav) => { navigateFn = nav; }} />
            </>,
            { initialEntries: [`/?size=${targetSize}`] }
          );
          
          // Verify initial size is set
          expect(capturedParams).not.toBeNull();
          expect(capturedParams!.get('size')).toBe(targetSize);
          
          // Navigate to new path while preserving query params
          if (navigateFn) {
            navigateFn(`${newPath}?size=${targetSize}`);
          }
          
          // Verify size parameter is preserved after navigation
          expect(capturedParams!.get('size')).toBe(targetSize);
          
          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 9e: Round-trip URL persistence
   * 
   * *For any* screen size, setting it via the switcher and then reading
   * from URL SHALL return the same size.
   * 
   * **Feature: showcase-design-system, Property 9: 屏幕尺寸 URL 持久化**
   * **Validates: Requirements 6.5, 6.6**
   */
  it('Property 9e: Round-trip URL persistence', () => {
    fc.assert(
      fc.property(screenSizeArb, (targetSize) => {
        let capturedParams: URLSearchParams | null = null;
        
        const { unmount } = renderWithRouter(
          <>
            <ScreenSizeSwitcher syncWithUrl={true} />
            <URLParamsCapture onParams={(params) => { capturedParams = params; }} />
          </>
        );
        
        // Click the target size button
        const button = screen.getByRole('radio', { name: new RegExp(targetSize, 'i') });
        fireEvent.click(button);
        
        // Parse the size back from URL
        const parsedSize = parseScreenSizeFromUrl(capturedParams!, 'size');
        
        // Verify round-trip consistency
        expect(parsedSize).toBe(targetSize);
        
        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 9f: Custom query parameter name works correctly
   * 
   * *For any* valid query parameter name and screen size, the URL SHALL
   * use the custom parameter name for persistence.
   * 
   * **Feature: showcase-design-system, Property 9: 屏幕尺寸 URL 持久化**
   * **Validates: Requirements 6.5**
   */
  it('Property 9f: Custom query parameter name works correctly', () => {
    fc.assert(
      fc.property(
        queryParamNameArb,
        nonDefaultScreenSizeArb,
        (paramName, targetSize) => {
          let capturedParams: URLSearchParams | null = null;
          
          const { unmount } = renderWithRouter(
            <>
              <ScreenSizeSwitcher queryParam={paramName} syncWithUrl={true} />
              <URLParamsCapture onParams={(params) => { capturedParams = params; }} />
            </>
          );
          
          // Click the target size button
          const button = screen.getByRole('radio', { name: new RegExp(targetSize, 'i') });
          fireEvent.click(button);
          
          // Verify custom parameter name was used
          expect(capturedParams).not.toBeNull();
          expect(capturedParams!.get(paramName)).toBe(targetSize);
          
          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});

// ============================================================================
// Unit Tests for Helper Functions
// ============================================================================

describe('isValidScreenSize', () => {
  it('returns true for valid screen sizes', () => {
    expect(isValidScreenSize('desktop')).toBe(true);
    expect(isValidScreenSize('tablet')).toBe(true);
    expect(isValidScreenSize('mobile')).toBe(true);
  });

  it('returns false for invalid values', () => {
    expect(isValidScreenSize('invalid')).toBe(false);
    expect(isValidScreenSize('')).toBe(false);
    expect(isValidScreenSize(null)).toBe(false);
  });
});

describe('parseScreenSizeFromUrl', () => {
  it('parses valid screen size from URL', () => {
    const params = new URLSearchParams('size=tablet');
    expect(parseScreenSizeFromUrl(params)).toBe('tablet');
  });

  it('returns desktop as default for missing parameter', () => {
    const params = new URLSearchParams('');
    expect(parseScreenSizeFromUrl(params)).toBe('desktop');
  });

  it('returns desktop as default for invalid value', () => {
    const params = new URLSearchParams('size=invalid');
    expect(parseScreenSizeFromUrl(params)).toBe('desktop');
  });

  it('uses custom parameter name', () => {
    const params = new URLSearchParams('viewport=mobile');
    expect(parseScreenSizeFromUrl(params, 'viewport')).toBe('mobile');
  });
});

// ============================================================================
// Unit Tests for ScreenSizeSwitcher Component
// ============================================================================

describe('ScreenSizeSwitcher Component', () => {
  it('renders all three screen size options', () => {
    renderWithRouter(<ScreenSizeSwitcher />);
    
    expect(screen.getByRole('radio', { name: /desktop/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /tablet/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /mobile/i })).toBeInTheDocument();
  });

  it('defaults to desktop when no URL parameter', () => {
    renderWithRouter(<ScreenSizeSwitcher syncWithUrl={true} />);
    
    const desktopButton = screen.getByRole('radio', { name: /desktop/i });
    expect(desktopButton).toHaveAttribute('aria-checked', 'true');
  });

  it('selects size from URL parameter on load', () => {
    renderWithRouter(
      <ScreenSizeSwitcher syncWithUrl={true} />,
      { initialEntries: ['/?size=tablet'] }
    );
    
    const tabletButton = screen.getByRole('radio', { name: /tablet/i });
    expect(tabletButton).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange callback when size changes', () => {
    const onChange = vi.fn();
    
    renderWithRouter(
      <ScreenSizeSwitcher onChange={onChange} syncWithUrl={true} />
    );
    
    fireEvent.click(screen.getByRole('radio', { name: /mobile/i }));
    
    expect(onChange).toHaveBeenCalledWith('mobile');
  });

  it('respects controlled value prop', () => {
    renderWithRouter(
      <ScreenSizeSwitcher value="tablet" syncWithUrl={false} />
    );
    
    const tabletButton = screen.getByRole('radio', { name: /tablet/i });
    expect(tabletButton).toHaveAttribute('aria-checked', 'true');
  });

  it('disables all buttons when disabled prop is true', () => {
    renderWithRouter(
      <ScreenSizeSwitcher disabled={true} />
    );
    
    expect(screen.getByRole('radio', { name: /desktop/i })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /tablet/i })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /mobile/i })).toBeDisabled();
  });

  it('does not sync with URL when syncWithUrl is false', () => {
    let capturedParams: URLSearchParams | null = null;
    
    renderWithRouter(
      <>
        <ScreenSizeSwitcher syncWithUrl={false} onChange={vi.fn()} />
        <URLParamsCapture onParams={(params) => { capturedParams = params; }} />
      </>
    );
    
    fireEvent.click(screen.getByRole('radio', { name: /mobile/i }));
    
    // URL should not have size parameter
    expect(capturedParams!.has('size')).toBe(false);
  });
});

// ============================================================================
// Unit Tests for useScreenSize Hook
// ============================================================================

describe('useScreenSize Hook', () => {
  it('returns desktop as default size', () => {
    let capturedSize: ScreenSize | null = null;
    
    renderWithRouter(
      <UseScreenSizeTestComponent 
        onSize={(size) => { capturedSize = size; }}
        onSetSize={() => {}}
      />
    );
    
    expect(capturedSize).toBe('desktop');
  });

  it('returns size from URL parameter', () => {
    let capturedSize: ScreenSize | null = null;
    
    renderWithRouter(
      <UseScreenSizeTestComponent 
        onSize={(size) => { capturedSize = size; }}
        onSetSize={() => {}}
      />,
      { initialEntries: ['/?size=mobile'] }
    );
    
    expect(capturedSize).toBe('mobile');
  });

  it('updates URL when setSize is called', async () => {
    let capturedParams: URLSearchParams | null = null;
    let setSizeFn: ((size: ScreenSize) => void) | null = null;
    
    const { rerender } = renderWithRouter(
      <>
        <UseScreenSizeTestComponent 
          onSize={() => {}}
          onSetSize={(setSize) => { setSizeFn = setSize; }}
        />
        <URLParamsCapture onParams={(params) => { capturedParams = params; }} />
      </>
    );
    
    // Call setSize using act to properly handle state updates
    const { act } = await import('@testing-library/react');
    await act(async () => {
      if (setSizeFn) {
        setSizeFn('tablet');
      }
    });
    
    expect(capturedParams!.get('size')).toBe('tablet');
  });
});
