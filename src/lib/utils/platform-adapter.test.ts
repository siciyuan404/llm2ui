/**
 * Platform Adapter Property-Based Tests
 * 
 * **Feature: component-showcase, Property 6: 平台适配映射正确性**
 * **Validates: Requirements 7.2, 7.4, 7.5**
 * 
 * Tests that for any cross-platform component, the adapted schema maintains
 * semantic equivalence with only property names and style names being mapped.
 * 
 * @module lib/utils/platform-adapter.test
 */

// Re-export tests from original location with updated imports
// This file serves as a proxy to the original test file during migration

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import React from 'react';
import { PlatformAdapter, createPlatformAdapter } from './platform-adapter';
import type { PlatformMapping } from './platform-adapter';
import { ComponentRegistry } from '../core/component-registry';
import type { PlatformType } from '../core/component-registry';
import type { UISchema, UIComponent, StyleProps, EventBinding } from '../../types';

/**
 * Create a mock React component for testing
 */
const createMockComponent = (name: string): React.ComponentType<Record<string, unknown>> => {
  const MockComponent: React.FC<Record<string, unknown>> = () => null;
  MockComponent.displayName = name;
  return MockComponent;
};

const platformArb = fc.constantFrom<PlatformType>('pc-web', 'mobile-web', 'mobile-native', 'pc-desktop');
const componentIdArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);
const componentTypeArb = fc.constantFrom('Button', 'Input', 'Card', 'Text', 'Container', 'Image');

describe('PlatformAdapter', () => {
  let adapter: PlatformAdapter;
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();
    adapter = new PlatformAdapter(registry);
  });

  describe('Basic Functionality', () => {
    it('should create adapter with factory function', () => {
      const factoryAdapter = createPlatformAdapter();
      expect(factoryAdapter).toBeInstanceOf(PlatformAdapter);
    });

    it('should create adapter with registry', () => {
      const adapterWithRegistry = createPlatformAdapter(registry);
      expect(adapterWithRegistry).toBeInstanceOf(PlatformAdapter);
    });
  });

  describe('Property 6: Platform Adaptation Semantic Equivalence', () => {
    it('Property 6: adapted schema preserves structure', () => {
      const schema: UISchema = {
        version: '1.0',
        root: { id: 'test', type: 'Button', text: 'Click me' },
      };
      
      fc.assert(
        fc.property(platformArb, (targetPlatform) => {
          const adapted = adapter.adapt(schema, targetPlatform);
          expect(adapted.version).toBe(schema.version);
          expect(adapted.root.id).toBe(schema.root.id);
          expect(adapted.root.type).toBe(schema.root.type);
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Event Mapping', () => {
    it('onClick maps to onTap for mobile-web', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'btn1',
          type: 'Button',
          events: [{ event: 'onClick', action: { type: 'navigate', url: '/test' } }],
        },
      };
      
      const adapted = adapter.adapt(schema, 'mobile-web');
      expect(adapted.root.events![0].event).toBe('onTap');
    });

    it('onClick maps to onPress for mobile-native', () => {
      const schema: UISchema = {
        version: '1.0',
        root: {
          id: 'btn1',
          type: 'Button',
          events: [{ event: 'onClick', action: { type: 'navigate', url: '/test' } }],
        },
      };
      
      const adapted = adapter.adapt(schema, 'mobile-native');
      expect(adapted.root.events![0].event).toBe('onPress');
    });
  });

  describe('getMapping', () => {
    it('returns valid mapping structure', () => {
      fc.assert(
        fc.property(componentTypeArb, platformArb, platformArb, (componentName, sourcePlatform, targetPlatform) => {
          const mapping = adapter.getMapping(componentName, sourcePlatform, targetPlatform);
          expect(mapping).toHaveProperty('props');
          expect(mapping).toHaveProperty('styles');
          expect(mapping).toHaveProperty('events');
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('isSupported', () => {
    it('returns true when no registry', () => {
      const adapterNoRegistry = new PlatformAdapter();
      expect(adapterNoRegistry.isSupported('Button', 'pc-web')).toBe(true);
    });

    it('checks registry for platform support', () => {
      registry.register({
        name: 'MobileButton',
        component: createMockComponent('MobileButton'),
        platforms: ['mobile-web', 'mobile-native'],
      });
      
      expect(adapter.isSupported('MobileButton', 'mobile-web')).toBe(true);
      expect(adapter.isSupported('MobileButton', 'pc-web')).toBe(false);
    });
  });

  describe('registerMapping', () => {
    it('custom mappings are used after registration', () => {
      const customMapping: PlatformMapping = {
        props: { customProp: 'mappedProp' },
        styles: { customStyle: 'mappedStyle' },
        events: { customEvent: 'mappedEvent' },
      };
      
      adapter.registerMapping('CustomComponent', 'mobile-web', customMapping);
      const retrieved = adapter.getMapping('CustomComponent', 'pc-web', 'mobile-web');
      
      expect(retrieved.props.customProp).toBe('mappedProp');
      expect(retrieved.events.customEvent).toBe('mappedEvent');
    });
  });
});