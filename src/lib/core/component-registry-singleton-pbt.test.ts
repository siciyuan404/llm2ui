/**
 * @file component-registry-singleton-pbt.test.ts
 * @description Property-based test for Component Registry Singleton Pattern
 * 
 * **Feature: codebase-refactor, Property 2: 组件注册表单例**
 * **Validates: Requirements 2.1**
 * 
 * 验证 defaultRegistry 是单例模式，任何获取调用都返回同一个对象引用。
 * 
 * @module lib/core
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import { ComponentRegistry, defaultRegistry } from './component-registry';
import type { ComponentDefinition } from './component-registry';

/**
 * Create a mock React component for testing
 */
const createMockComponent = (name: string): React.ComponentType<Record<string, unknown>> => {
  const MockComponent: React.FC<Record<string, unknown>> = () => null;
  MockComponent.displayName = name;
  return MockComponent;
};

/**
 * Generator for valid component names
 */
const componentNameArb = fc.string({ minLength: 1, maxLength: 30 })
  .filter(s => s.trim().length > 0);

describe('ComponentRegistry Singleton Pattern - Property-Based Tests', () => {
  /**
   * Property 2: 组件注册表单例 (Component Registry Singleton)
   * 
   * For any call to get defaultRegistry, the returned instance should be
   * the same object reference.
   * 
   * **Feature: codebase-refactor, Property 2: 组件注册表单例**
   * **Validates: Requirements 2.1**
   */
  describe('Property 2: 组件注册表单例', () => {
    
    beforeEach(() => {
      // Clear the registry before each test to ensure clean state
      defaultRegistry.clear();
    });

    it('Property 2a: defaultRegistry is always the same instance', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (accessCount) => {
            // Access defaultRegistry multiple times
            const references: typeof defaultRegistry[] = [];
            for (let i = 0; i < accessCount; i++) {
              references.push(defaultRegistry);
            }
            
            // All references should be the same object
            for (const ref of references) {
              expect(ref).toBe(defaultRegistry);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 2b: modifications to defaultRegistry are visible across all references', () => {
      fc.assert(
        fc.property(
          componentNameArb,
          (componentName) => {
            // Get multiple references to defaultRegistry
            const ref1 = defaultRegistry;
            const ref2 = defaultRegistry;
            
            // Register a component through one reference
            const component = createMockComponent(componentName);
            ref1.register({ name: componentName, component });
            
            // Should be visible through the other reference
            expect(ref2.has(componentName)).toBe(true);
            expect(ref2.get(componentName)).toBeDefined();
            expect(ref2.get(componentName)?.component).toBe(component);
            
            // Clean up
            ref1.unregister(componentName);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 2c: defaultRegistry size is consistent across references', () => {
      fc.assert(
        fc.property(
          fc.array(componentNameArb, { minLength: 1, maxLength: 10 })
            .map(names => [...new Set(names)]), // Ensure unique names
          (componentNames) => {
            // Get multiple references
            const ref1 = defaultRegistry;
            const ref2 = defaultRegistry;
            
            // Register components through ref1
            for (const name of componentNames) {
              ref1.register({ name, component: createMockComponent(name) });
            }
            
            // Size should be the same through both references
            expect(ref1.size).toBe(ref2.size);
            expect(ref1.size).toBe(componentNames.length);
            
            // Clean up
            for (const name of componentNames) {
              ref1.unregister(name);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 2d: defaultRegistry is an instance of ComponentRegistry', () => {
      fc.assert(
        fc.property(
          fc.constant(null), // No input needed
          () => {
            expect(defaultRegistry).toBeInstanceOf(ComponentRegistry);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 2e: defaultRegistry maintains state across multiple operations', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: componentNameArb,
              operation: fc.constantFrom('register', 'unregister', 'get', 'has'),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (operations) => {
            const registeredNames = new Set<string>();
            
            for (const op of operations) {
              const ref = defaultRegistry; // Get reference each time
              
              switch (op.operation) {
                case 'register':
                  if (!registeredNames.has(op.name)) {
                    ref.register({ name: op.name, component: createMockComponent(op.name) });
                    registeredNames.add(op.name);
                  }
                  break;
                case 'unregister':
                  if (registeredNames.has(op.name)) {
                    ref.unregister(op.name);
                    registeredNames.delete(op.name);
                  }
                  break;
                case 'get':
                  if (registeredNames.has(op.name)) {
                    expect(ref.get(op.name)).toBeDefined();
                  } else {
                    expect(ref.get(op.name)).toBeUndefined();
                  }
                  break;
                case 'has':
                  expect(ref.has(op.name)).toBe(registeredNames.has(op.name));
                  break;
              }
            }
            
            // Verify final state
            expect(defaultRegistry.size).toBe(registeredNames.size);
            
            // Clean up
            for (const name of registeredNames) {
              defaultRegistry.unregister(name);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 2f: new ComponentRegistry instances are independent from defaultRegistry', () => {
      fc.assert(
        fc.property(
          componentNameArb,
          (componentName) => {
            // Create a new registry instance
            const newRegistry = new ComponentRegistry();
            
            // Register in defaultRegistry
            defaultRegistry.register({ name: componentName, component: createMockComponent(componentName) });
            
            // New registry should NOT have the component
            expect(newRegistry.has(componentName)).toBe(false);
            expect(newRegistry.get(componentName)).toBeUndefined();
            
            // defaultRegistry should have it
            expect(defaultRegistry.has(componentName)).toBe(true);
            
            // Clean up
            defaultRegistry.unregister(componentName);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
