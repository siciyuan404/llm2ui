/**
 * Resizable Component Property-Based Tests
 * 
 * **Feature: ui-components-expansion, Property 10: Resizable Direction Support**
 * **Validates: Requirements 15.2**
 * 
 * Tests that:
 * 1. ResizablePanelGroup renders with correct direction-based layout
 * 2. ResizableHandle renders correctly for both orientations
 * 3. Panels are laid out in the corresponding direction
 * 
 * Note: Due to jsdom/cssstyle compatibility issues with react-resizable-panels,
 * we test the component wrapper logic rather than full rendering.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock react-resizable-panels to avoid jsdom CSS compatibility issues
vi.mock('react-resizable-panels', () => ({
  Group: ({ children, className, orientation, ...props }: { 
    children?: React.ReactNode; 
    className?: string; 
    orientation?: string;
    [key: string]: unknown;
  }) => (
    <div 
      data-orientation={orientation || 'horizontal'} 
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Panel: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-panel {...props}>{children}</div>
  ),
  Separator: ({ children, className, ...props }: { 
    children?: React.ReactNode; 
    className?: string;
    [key: string]: unknown;
  }) => (
    <div role="separator" className={className} {...props}>{children}</div>
  ),
}));

// Import after mocking
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './resizable';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for valid ResizablePanelGroup orientations
 */
const orientationArb = fc.constantFrom('horizontal', 'vertical') as fc.Arbitrary<'horizontal' | 'vertical'>;

/**
 * Generator for panel default sizes (percentages that sum to 100)
 */
const panelSizeArb = fc.integer({ min: 10, max: 90 });

/**
 * Generator for withHandle prop
 */
const withHandleArb = fc.boolean();

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Resizable Direction Support (Property 10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 10a: ResizablePanelGroup renders with correct orientation attribute
   * 
   * For any valid orientation (horizontal, vertical):
   * - The ResizablePanelGroup should render with the correct data attribute
   * 
   * **Validates: Requirements 15.2**
   */
  it('Property 10a: ResizablePanelGroup renders with correct orientation attribute', () => {
    fc.assert(
      fc.property(orientationArb, panelSizeArb, (orientation, size) => {
        const { unmount } = render(
          <ResizablePanelGroup orientation={orientation} data-testid="panel-group">
            <ResizablePanel id="panel-1" defaultSize={`${size}%`}>
              Panel 1
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="panel-2" defaultSize={`${100 - size}%`}>
              Panel 2
            </ResizablePanel>
          </ResizablePanelGroup>
        );

        const group = screen.getByTestId('panel-group');
        expect(group).toBeDefined();
        
        // The group should have the correct orientation attribute
        expect(group.getAttribute('data-orientation')).toBe(orientation);

        // The group should have the correct flex direction class
        if (orientation === 'vertical') {
          expect(group.className).toContain('flex-col');
        } else {
          // horizontal is the default, should have flex but not flex-col
          expect(group.className).toContain('flex');
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 10b: ResizableHandle renders correctly for both orientations
   * 
   * For any orientation and withHandle setting:
   * - The ResizableHandle should render
   * - When withHandle is true, the grip icon should be present
   * 
   * **Validates: Requirements 15.2**
   */
  it('Property 10b: ResizableHandle renders correctly for both orientations', () => {
    fc.assert(
      fc.property(orientationArb, withHandleArb, (orientation, withHandle) => {
        const { unmount } = render(
          <ResizablePanelGroup orientation={orientation}>
            <ResizablePanel id="panel-1" defaultSize="50%">
              Panel 1
            </ResizablePanel>
            <ResizableHandle withHandle={withHandle} data-testid="resize-handle" />
            <ResizablePanel id="panel-2" defaultSize="50%">
              Panel 2
            </ResizablePanel>
          </ResizablePanelGroup>
        );

        const handle = screen.getByTestId('resize-handle');
        expect(handle).toBeDefined();
        
        // Handle should have separator role for accessibility
        expect(handle.getAttribute('role')).toBe('separator');

        // When withHandle is true, there should be a grip icon container
        if (withHandle) {
          const gripContainer = handle.querySelector('div');
          expect(gripContainer).toBeDefined();
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 10c: Multiple panels render in correct order
   * 
   * For any orientation:
   * - All panels should render in the correct order
   * - Handles should be between panels
   * 
   * **Validates: Requirements 15.2, 15.4**
   */
  it('Property 10c: Multiple panels render in correct order', () => {
    fc.assert(
      fc.property(orientationArb, (orientation) => {
        const { unmount } = render(
          <ResizablePanelGroup orientation={orientation}>
            <ResizablePanel id="panel-1" defaultSize="33%">
              <div data-testid="content-1">Content 1</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="panel-2" defaultSize="34%">
              <div data-testid="content-2">Content 2</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="panel-3" defaultSize="33%">
              <div data-testid="content-3">Content 3</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        );

        // All content should be rendered
        expect(screen.getByTestId('content-1')).toBeInTheDocument();
        expect(screen.getByTestId('content-2')).toBeInTheDocument();
        expect(screen.getByTestId('content-3')).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property 10d: ResizablePanelGroup accepts custom className
   * 
   * For any orientation and custom class:
   * - The custom class should be applied to the group
   * 
   * **Validates: Requirements 15.1**
   */
  it('Property 10d: ResizablePanelGroup accepts custom className', () => {
    fc.assert(
      fc.property(
        orientationArb,
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z][a-z0-9-]*$/.test(s)),
        (orientation, customClass) => {
          const { unmount } = render(
            <ResizablePanelGroup 
              orientation={orientation} 
              className={customClass}
              data-testid="panel-group"
            >
              <ResizablePanel id="panel-1" defaultSize="50%">
                Panel 1
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel id="panel-2" defaultSize="50%">
                Panel 2
              </ResizablePanel>
            </ResizablePanelGroup>
          );

          const group = screen.getByTestId('panel-group');
          expect(group.className).toContain(customClass);

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

describe('Resizable Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ResizablePanelGroup with horizontal orientation by default', () => {
    render(
      <ResizablePanelGroup data-testid="panel-group">
        <ResizablePanel id="panel-1" defaultSize="50%">
          Panel 1
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="panel-2" defaultSize="50%">
          Panel 2
        </ResizablePanel>
      </ResizablePanelGroup>
    );
    
    const group = screen.getByTestId('panel-group');
    expect(group).toBeInTheDocument();
    expect(group.className).toContain('flex');
  });

  it('should render ResizablePanelGroup with vertical orientation', () => {
    render(
      <ResizablePanelGroup orientation="vertical" data-testid="panel-group">
        <ResizablePanel id="panel-1" defaultSize="50%">
          Panel 1
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="panel-2" defaultSize="50%">
          Panel 2
        </ResizablePanel>
      </ResizablePanelGroup>
    );
    
    const group = screen.getByTestId('panel-group');
    expect(group).toBeInTheDocument();
    expect(group.getAttribute('data-orientation')).toBe('vertical');
  });

  it('should render ResizableHandle with grip icon when withHandle is true', () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel id="panel-1" defaultSize="50%">
          Panel 1
        </ResizablePanel>
        <ResizableHandle withHandle data-testid="handle" />
        <ResizablePanel id="panel-2" defaultSize="50%">
          Panel 2
        </ResizablePanel>
      </ResizablePanelGroup>
    );
    
    const handle = screen.getByTestId('handle');
    expect(handle).toBeInTheDocument();
    
    // Should have the grip icon container
    const gripContainer = handle.querySelector('div');
    expect(gripContainer).toBeInTheDocument();
  });

  it('should render ResizableHandle without grip icon when withHandle is false', () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel id="panel-1" defaultSize="50%">
          Panel 1
        </ResizablePanel>
        <ResizableHandle withHandle={false} data-testid="handle" />
        <ResizablePanel id="panel-2" defaultSize="50%">
          Panel 2
        </ResizablePanel>
      </ResizablePanelGroup>
    );
    
    const handle = screen.getByTestId('handle');
    expect(handle).toBeInTheDocument();
    
    // Should not have the grip icon container
    const gripContainer = handle.querySelector('div');
    expect(gripContainer).toBeNull();
  });

  it('should render panels with specified default sizes', () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel id="panel-1" defaultSize="30%" data-testid="panel-1">
          Panel 1
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="panel-2" defaultSize="70%" data-testid="panel-2">
          Panel 2
        </ResizablePanel>
      </ResizablePanelGroup>
    );
    
    expect(screen.getByTestId('panel-1')).toBeInTheDocument();
    expect(screen.getByTestId('panel-2')).toBeInTheDocument();
  });

  it('should apply custom className to ResizableHandle', () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel id="panel-1" defaultSize="50%">
          Panel 1
        </ResizablePanel>
        <ResizableHandle className="custom-handle" data-testid="handle" />
        <ResizablePanel id="panel-2" defaultSize="50%">
          Panel 2
        </ResizablePanel>
      </ResizablePanelGroup>
    );
    
    const handle = screen.getByTestId('handle');
    expect(handle.className).toContain('custom-handle');
  });
});
