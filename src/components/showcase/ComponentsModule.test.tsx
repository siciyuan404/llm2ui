/**
 * ComponentsModule Property-Based Tests
 * 
 * **Feature: showcase-design-system, Property 7: 组件注册表同步**
 * **Validates: Requirements 3.3, 3.4**
 * 
 * Tests that:
 * 1. Components registered in ComponentRegistry are enabled in the sidebar
 * 2. Components NOT registered are displayed as disabled with "Coming Soon" badge
 * 
 * @module ComponentsModule.test
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import fc from 'fast-check';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { ComponentRegistry } from '@/lib';
import type { ComponentDefinition } from '@/lib';
import { ComponentsModule, type ComponentCategoryConfig } from './ComponentsModule';

// Mock scrollIntoView for jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Create a mock React component for testing
 */
const createMockComponent = (name: string): React.ComponentType<Record<string, unknown>> => {
  const MockComponent: React.FC<Record<string, unknown>> = () => 
    React.createElement('div', { 'data-testid': `mock-${name}` }, name);
  MockComponent.displayName = name;
  return MockComponent;
};

/**
 * Default categories used by ComponentsModule
 */
const DEFAULT_CATEGORIES: ComponentCategoryConfig[] = [
  {
    id: 'layout',
    label: 'Layout',
    icon: '📐',
    components: ['Row', 'Column', 'List', 'Card', 'Content', 'Container'],
  },
  {
    id: 'text',
    label: 'Text',
    icon: '📝',
    components: ['Text', 'Image', 'Icon', 'Video', 'Audio', 'Player'],
  },
  {
    id: 'input',
    label: 'Input',
    icon: '✏️',
    components: ['Input', 'TextField', 'CheckBox', 'Slider', 'DateTimeInput', 'MultipleChoice', 'Textarea', 'Select'],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    icon: '🧭',
    components: ['Button', 'Tabs', 'Modal', 'Link'],
  },
  {
    id: 'decoration',
    label: 'Decoration',
    icon: '✨',
    components: ['Divider', 'Badge', 'Separator'],
  },
];

/**
 * Get all component names from default categories
 */
function getAllComponentNames(): string[] {
  return DEFAULT_CATEGORIES.flatMap(cat => cat.components);
}

// ============================================================================
// Generators
// ============================================================================

/**
 * Generator for selecting a subset of component names to register
 */
const registeredComponentsArb = fc.subarray(getAllComponentNames(), { minLength: 0 });

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Property 7: 组件注册表同步', () => {
  /**
   * Property 7a: Registered components are enabled in sidebar
   * 
   * *For any* component name in the sidebar navigation, if ComponentRegistry.has(name)
   * returns true, the item SHALL be enabled (clickable, not showing "Coming Soon").
   * 
   * **Feature: showcase-design-system, Property 7: 组件注册表同步**
   * **Validates: Requirements 3.3**
   */
  it('Property 7a: Registered components are enabled in sidebar', () => {
    fc.assert(
      fc.property(registeredComponentsArb, (registeredNames) => {
        const registry = new ComponentRegistry();
        
        // Register the selected components
        for (const name of registeredNames) {
          registry.register({
            name,
            component: createMockComponent(name),
            description: `${name} component`,
          });
        }
        
        const { container, unmount } = render(
          <ComponentsModule
            registry={registry}
            onComponentSelect={vi.fn()}
          />
        );
        
        // For each registered component, verify it's enabled (no "Coming Soon" badge)
        for (const name of registeredNames) {
          // Find the button for this component
          const buttons = container.querySelectorAll('button');
          let foundButton: Element | null = null;
          
          for (const button of buttons) {
            if (button.textContent?.includes(name)) {
              foundButton = button;
              break;
            }
          }
          
          if (foundButton) {
            // Should NOT be disabled
            expect(foundButton).not.toBeDisabled();
            // Should NOT have "Coming Soon" badge
            expect(foundButton.textContent).not.toContain('Coming Soon');
          }
        }
        
        unmount();
        return true;
      }),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property 7b: Unregistered components show "Coming Soon" badge
   * 
   * *For any* component name in the sidebar navigation, if ComponentRegistry.has(name)
   * returns false, the item SHALL be displayed as disabled with a "Coming Soon" badge.
   * 
   * **Feature: showcase-design-system, Property 7: 组件注册表同步**
   * **Validates: Requirements 3.4**
   */
  it('Property 7b: Unregistered components show "Coming Soon" badge', () => {
    fc.assert(
      fc.property(registeredComponentsArb, (registeredNames) => {
        const registry = new ComponentRegistry();
        const registeredSet = new Set(registeredNames);
        
        // Register the selected components
        for (const name of registeredNames) {
          registry.register({
            name,
            component: createMockComponent(name),
            description: `${name} component`,
          });
        }
        
        const { container, unmount } = render(
          <ComponentsModule
            registry={registry}
            onComponentSelect={vi.fn()}
          />
        );
        
        // Get all component names that should be unregistered
        const allNames = getAllComponentNames();
        const unregisteredNames = allNames.filter(name => !registeredSet.has(name));
        
        // For each unregistered component, verify it shows "Coming Soon"
        for (const name of unregisteredNames) {
          // Find the button for this component
          const buttons = container.querySelectorAll('button');
          let foundButton: Element | null = null;
          
          for (const button of buttons) {
            // Check if this button is for the component (contains the name but not as part of another name)
            const buttonText = button.textContent || '';
            if (buttonText.includes(name)) {
              // Make sure it's the exact component, not a substring match
              const nameRegex = new RegExp(`\\b${name}\\b`);
              if (nameRegex.test(buttonText)) {
                foundButton = button;
                break;
              }
            }
          }
          
          if (foundButton) {
            // Should be disabled
            expect(foundButton).toBeDisabled();
            // Should have "Coming Soon" badge
            expect(foundButton.textContent).toContain('Coming Soon');
          }
        }
        
        unmount();
        return true;
      }),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property 7c: Registry.has() consistency with sidebar state
   * 
   * *For any* subset of components registered, the sidebar state (enabled/disabled)
   * SHALL be consistent with registry.has() for all components.
   * 
   * **Feature: showcase-design-system, Property 7: 组件注册表同步**
   * **Validates: Requirements 3.3, 3.4**
   */
  it('Property 7c: Registry.has() is consistent with sidebar enabled/disabled state', () => {
    fc.assert(
      fc.property(registeredComponentsArb, (registeredNames) => {
        const registry = new ComponentRegistry();
        const registeredSet = new Set(registeredNames);
        
        // Register the selected components
        for (const name of registeredNames) {
          registry.register({
            name,
            component: createMockComponent(name),
            description: `${name} component`,
          });
        }
        
        const { container, unmount } = render(
          <ComponentsModule
            registry={registry}
            onComponentSelect={vi.fn()}
          />
        );
        
        // Check all components
        const allNames = getAllComponentNames();
        
        for (const name of allNames) {
          const isRegistered = registry.has(name);
          
          // Find the button for this component
          const buttons = container.querySelectorAll('button');
          let foundButton: Element | null = null;
          
          for (const button of buttons) {
            const buttonText = button.textContent || '';
            const nameRegex = new RegExp(`\\b${name}\\b`);
            if (nameRegex.test(buttonText)) {
              foundButton = button;
              break;
            }
          }
          
          if (foundButton) {
            if (isRegistered) {
              // Registered: should be enabled, no "Coming Soon"
              expect(foundButton).not.toBeDisabled();
              expect(foundButton.textContent).not.toContain('Coming Soon');
            } else {
              // Not registered: should be disabled, has "Coming Soon"
              expect(foundButton).toBeDisabled();
              expect(foundButton.textContent).toContain('Coming Soon');
            }
          }
        }
        
        unmount();
        return true;
      }),
      { numRuns: 50 }
    );
  }, 60000);
});

// ============================================================================
// Property 11: Props 表格枚举显示
// ============================================================================

describe('Property 11: Props 表格枚举显示', () => {
  /**
   * Generator for enum values (non-empty arrays of unique strings)
   */
  const enumValuesArb = fc.array(
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && !s.includes('"')),
    { minLength: 1, maxLength: 10 }
  ).map(arr => [...new Set(arr)]).filter(arr => arr.length > 0);

  /**
   * Generator for prop name (valid identifier)
   */
  const propNameArb = fc.string({ minLength: 1, maxLength: 20 })
    .filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s));

  /**
   * Generator for props schema with enum values
   */
  const propsSchemaWithEnumArb = fc.record({
    propName: propNameArb,
    enumValues: enumValuesArb,
  });

  /**
   * Property 11a: All enum values are displayed as badges
   * 
   * *For any* component with props that have enum type, the Props table SHALL
   * display all enum values as inline badges.
   * 
   * **Feature: showcase-design-system, Property 11: Props 表格枚举显示**
   * **Validates: Requirements 4.6**
   */
  it('Property 11a: All enum values are displayed as inline badges', () => {
    fc.assert(
      fc.property(propsSchemaWithEnumArb, ({ propName, enumValues }) => {
        const registry = new ComponentRegistry();
        const componentName = 'TestComponent';
        
        // Register a component with enum props
        registry.register({
          name: componentName,
          component: createMockComponent(componentName),
          description: 'Test component with enum props',
          propsSchema: {
            [propName]: {
              type: 'string',
              description: `A ${propName} prop with enum values`,
              enum: enumValues,
            },
          },
        });
        
        const { container, unmount } = render(
          <ComponentsModule
            registry={registry}
            activeComponent={componentName}
            onComponentSelect={vi.fn()}
          />
        );
        
        // Find the Props section
        const propsSection = container.querySelector('table');
        expect(propsSection).not.toBeNull();
        
        if (propsSection) {
          // Check that all enum values are displayed
          for (const enumValue of enumValues) {
            // Enum values are displayed as code elements with quotes: "value"
            const expectedText = `"${enumValue}"`;
            const codeElements = propsSection.querySelectorAll('code');
            
            let found = false;
            for (const codeEl of codeElements) {
              if (codeEl.textContent === expectedText) {
                found = true;
                break;
              }
            }
            
            expect(found).toBe(true);
          }
        }
        
        unmount();
        return true;
      }),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property 11b: Displayed enum values match propsSchema exactly
   * 
   * *For any* component with props that have enum type, the displayed values
   * SHALL match the enum array in the propsSchema.
   * 
   * **Feature: showcase-design-system, Property 11: Props 表格枚举显示**
   * **Validates: Requirements 4.6**
   */
  it('Property 11b: Displayed enum values match propsSchema exactly', () => {
    fc.assert(
      fc.property(propsSchemaWithEnumArb, ({ propName, enumValues }) => {
        const registry = new ComponentRegistry();
        const componentName = 'TestComponent';
        
        // Register a component with enum props
        registry.register({
          name: componentName,
          component: createMockComponent(componentName),
          description: 'Test component with enum props',
          propsSchema: {
            [propName]: {
              type: 'string',
              description: `A ${propName} prop with enum values`,
              enum: enumValues,
            },
          },
        });
        
        const { container, unmount } = render(
          <ComponentsModule
            registry={registry}
            activeComponent={componentName}
            onComponentSelect={vi.fn()}
          />
        );
        
        // Find the Props table
        const propsTable = container.querySelector('table');
        expect(propsTable).not.toBeNull();
        
        if (propsTable) {
          // Find the row for our prop
          const rows = propsTable.querySelectorAll('tbody tr');
          let propRow: Element | null = null;
          
          for (const row of rows) {
            const firstCell = row.querySelector('td');
            if (firstCell?.textContent?.includes(propName)) {
              propRow = row;
              break;
            }
          }
          
          expect(propRow).not.toBeNull();
          
          if (propRow) {
            // Get all enum badges in this row (code elements with quoted values)
            const codeElements = propRow.querySelectorAll('code');
            const displayedEnumValues: string[] = [];
            
            for (const codeEl of codeElements) {
              const text = codeEl.textContent || '';
              // Match quoted strings like "value"
              const match = text.match(/^"(.+)"$/);
              if (match) {
                displayedEnumValues.push(match[1]);
              }
            }
            
            // Verify count matches
            expect(displayedEnumValues.length).toBe(enumValues.length);
            
            // Verify all values are present (order may vary)
            const sortedDisplayed = [...displayedEnumValues].sort();
            const sortedExpected = [...enumValues].sort();
            expect(sortedDisplayed).toEqual(sortedExpected);
          }
        }
        
        unmount();
        return true;
      }),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property 11c: Multiple props with enums all display correctly
   * 
   * *For any* component with multiple props that have enum types, each prop's
   * enum values SHALL be displayed correctly in their respective rows.
   * 
   * **Feature: showcase-design-system, Property 11: Props 表格枚举显示**
   * **Validates: Requirements 4.6**
   */
  it('Property 11c: Multiple props with enums all display correctly', () => {
    fc.assert(
      fc.property(
        fc.array(propsSchemaWithEnumArb, { minLength: 1, maxLength: 3 })
          .map(arr => {
            // Ensure unique prop names
            const seen = new Set<string>();
            return arr.filter(item => {
              if (seen.has(item.propName)) return false;
              seen.add(item.propName);
              return true;
            });
          })
          .filter(arr => arr.length > 0),
        (propsWithEnums) => {
          const registry = new ComponentRegistry();
          const componentName = 'TestComponent';
          
          // Build propsSchema with multiple enum props
          const propsSchema: Record<string, { type: 'string'; description: string; enum: string[] }> = {};
          for (const { propName, enumValues } of propsWithEnums) {
            propsSchema[propName] = {
              type: 'string',
              description: `A ${propName} prop`,
              enum: enumValues,
            };
          }
          
          // Register the component
          registry.register({
            name: componentName,
            component: createMockComponent(componentName),
            description: 'Test component with multiple enum props',
            propsSchema,
          });
          
          const { container, unmount } = render(
            <ComponentsModule
              registry={registry}
              activeComponent={componentName}
              onComponentSelect={vi.fn()}
            />
          );
          
          // Find the Props table
          const propsTable = container.querySelector('table');
          expect(propsTable).not.toBeNull();
          
          if (propsTable) {
            // For each prop with enum, verify its values are displayed
            for (const { propName, enumValues } of propsWithEnums) {
              const rows = propsTable.querySelectorAll('tbody tr');
              let propRow: Element | null = null;
              
              for (const row of rows) {
                const firstCell = row.querySelector('td');
                if (firstCell?.textContent?.includes(propName)) {
                  propRow = row;
                  break;
                }
              }
              
              expect(propRow).not.toBeNull();
              
              if (propRow) {
                // Get enum badges in this row
                const codeElements = propRow.querySelectorAll('code');
                const displayedEnumValues: string[] = [];
                
                for (const codeEl of codeElements) {
                  const text = codeEl.textContent || '';
                  const match = text.match(/^"(.+)"$/);
                  if (match) {
                    displayedEnumValues.push(match[1]);
                  }
                }
                
                // Verify all enum values are present
                for (const enumValue of enumValues) {
                  expect(displayedEnumValues).toContain(enumValue);
                }
              }
            }
          }
          
          unmount();
          return true;
        }
      ),
      { numRuns: 30 }
    );
  }, 60000);
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('ComponentsModule', () => {
  /**
   * Helper to expand a category by clicking its header
   */
  function expandCategory(container: HTMLElement, categoryLabel: string) {
    const buttons = container.querySelectorAll('button');
    for (const button of buttons) {
      if (button.textContent?.includes(categoryLabel) && !button.textContent?.includes('Coming Soon')) {
        // This is likely a category header
        const buttonText = button.textContent;
        // Category headers have format like "🧭 Navigation 2/4"
        if (buttonText.includes('/')) {
          button.click();
          return;
        }
      }
    }
  }

  it('renders with empty registry showing all components as "Coming Soon"', () => {
    const registry = new ComponentRegistry();
    
    render(
      <ComponentsModule
        registry={registry}
        onComponentSelect={vi.fn()}
      />
    );
    
    // Should show "Coming Soon" for all components since none are registered
    const comingSoonBadges = screen.getAllByText('Coming Soon');
    expect(comingSoonBadges.length).toBeGreaterThan(0);
  });

  it('renders registered components as enabled', () => {
    const registry = new ComponentRegistry();
    // Register Row from Layout category (which is expanded by default)
    registry.register({
      name: 'Row',
      component: createMockComponent('Row'),
      description: 'A row component',
    });
    
    const { container } = render(
      <ComponentsModule
        registry={registry}
        onComponentSelect={vi.fn()}
      />
    );
    
    // Find the Row item (Layout category is expanded by default)
    const buttons = container.querySelectorAll('button');
    let rowItem: Element | null = null;
    
    for (const button of buttons) {
      const text = button.textContent || '';
      // Look for Row that is NOT showing "Coming Soon"
      if (text.includes('Row') && !text.includes('Coming Soon') && !text.includes('/')) {
        rowItem = button;
        break;
      }
    }
    
    // Row should be found and enabled
    expect(rowItem).not.toBeNull();
    if (rowItem) {
      expect(rowItem).not.toBeDisabled();
    }
  });

  it('shows category counts correctly', () => {
    const registry = new ComponentRegistry();
    
    // Register 2 components from layout category (which is expanded by default)
    registry.register({
      name: 'Row',
      component: createMockComponent('Row'),
    });
    registry.register({
      name: 'Column',
      component: createMockComponent('Column'),
    });
    
    const { container } = render(
      <ComponentsModule
        registry={registry}
        onComponentSelect={vi.fn()}
      />
    );
    
    // Layout category should show 2/6 (2 registered out of 6 total)
    expect(container.textContent).toContain('2/6');
  });

  it('calls onComponentSelect when registered component is clicked', () => {
    const registry = new ComponentRegistry();
    // Register Row from Layout category (which is expanded by default)
    registry.register({
      name: 'Row',
      component: createMockComponent('Row'),
    });
    
    const onComponentSelect = vi.fn();
    
    const { container } = render(
      <ComponentsModule
        registry={registry}
        onComponentSelect={onComponentSelect}
      />
    );
    
    // Find and click the Row item
    const buttons = container.querySelectorAll('button');
    for (const button of buttons) {
      const text = button.textContent || '';
      // Look for Row that is NOT showing "Coming Soon" and is not a category header
      if (text.includes('Row') && !text.includes('Coming Soon') && !text.includes('/')) {
        button.click();
        break;
      }
    }
    
    expect(onComponentSelect).toHaveBeenCalledWith('Row');
  });

  it('does not call onComponentSelect when unregistered component is clicked', () => {
    const registry = new ComponentRegistry();
    // Don't register Row
    
    const onComponentSelect = vi.fn();
    
    const { container } = render(
      <ComponentsModule
        registry={registry}
        onComponentSelect={onComponentSelect}
      />
    );
    
    // Find and click the Row item (which should be disabled)
    // Layout category is expanded by default
    const buttons = container.querySelectorAll('button');
    for (const button of buttons) {
      const text = button.textContent || '';
      if (text.includes('Row') && !text.includes('/')) {
        button.click();
        break;
      }
    }
    
    // Should not have been called since Row is not registered
    expect(onComponentSelect).not.toHaveBeenCalled();
  });
});
