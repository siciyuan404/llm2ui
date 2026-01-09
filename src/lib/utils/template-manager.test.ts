/**
 * Template Manager Property-Based Tests
 * 
 * **Feature: component-showcase, Property 5: 模板合并正确性**
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
 * 
 * @module lib/utils/template-manager.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { TemplateManager } from './template-manager';
import type { ComponentTemplate, TemplateLayer } from './template-manager';
import type { UISchema, UIComponent } from '../../types';
import type { PlatformType } from '../core/component-registry';

const componentNameArb = fc.string({ minLength: 1, maxLength: 30 })
  .filter(s => s.trim().length > 0 && !s.includes(':'));
const platformArb = fc.constantFrom<PlatformType>('pc-web', 'mobile-web', 'mobile-native', 'pc-desktop');
const themeArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0 && !s.includes(':'));

const uiComponentArb: fc.Arbitrary<UIComponent> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  type: fc.string({ minLength: 1, maxLength: 20 }),
  props: fc.option(
    fc.dictionary(
      fc.string({ minLength: 1, maxLength: 10 }),
      fc.oneof(fc.string(), fc.integer(), fc.boolean()),
      { minKeys: 0, maxKeys: 5 }
    ),
    { nil: undefined }
  ),
  text: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
});

const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: uiComponentArb,
});

describe('TemplateManager', () => {
  let manager: TemplateManager;

  beforeEach(() => {
    manager = new TemplateManager();
  });

  describe('Template Registration', () => {
    it('Property 5a: registered base templates can be retrieved', () => {
      fc.assert(
        fc.property(componentNameArb, uiSchemaArb, (name, schema) => {
          const template: ComponentTemplate = { layer: 'base', template: schema };
          manager.registerTemplate(name, template);
          
          const retrieved = manager.getTemplateByLayer(name, 'base');
          expect(retrieved).toBeDefined();
          expect(retrieved!.layer).toBe('base');
        }),
        { numRuns: 50 }
      );
    });

    it('Property 5b: platform templates are stored with correct platform', () => {
      fc.assert(
        fc.property(componentNameArb, platformArb, uiSchemaArb, (name, platform, schema) => {
          const template: ComponentTemplate = { layer: 'platform', platform, template: schema };
          manager.registerTemplate(name, template);
          
          const retrieved = manager.getTemplateByLayer(name, 'platform', platform);
          expect(retrieved).toBeDefined();
          expect(retrieved!.platform).toBe(platform);
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Template Merging - Property 5', () => {
    it('Property 5: template merging follows Base → Platform → Theme order', () => {
      const baseSchema: UISchema = {
        version: '1.0',
        root: { id: 'base-id', type: 'BaseType', props: { baseProp: 'base' } },
      };
      const platformSchema: UISchema = {
        version: '1.0',
        root: { id: 'platform-id', type: 'PlatformType', props: { platformProp: 'platform' } },
      };
      const themeSchema: UISchema = {
        version: '1.0',
        root: { id: 'theme-id', type: 'ThemeType', props: { themeProp: 'theme' } },
      };

      manager.registerTemplate('TestComponent', { layer: 'base', template: baseSchema });
      manager.registerTemplate('TestComponent', { layer: 'platform', platform: 'pc-web', template: platformSchema });
      manager.registerTemplate('TestComponent', { layer: 'theme', theme: 'dark', template: themeSchema });

      const merged = manager.getTemplate('TestComponent', 'pc-web', 'dark');
      
      expect(merged).toBeDefined();
      expect(merged!.root.id).toBe('theme-id');
      expect(merged!.root.props).toHaveProperty('baseProp', 'base');
      expect(merged!.root.props).toHaveProperty('platformProp', 'platform');
      expect(merged!.root.props).toHaveProperty('themeProp', 'theme');
    });

    it('Property 5d: base template alone returns base schema', () => {
      fc.assert(
        fc.property(componentNameArb, platformArb, uiSchemaArb, (name, platform, baseSchema) => {
          manager.registerTemplate(name, { layer: 'base', template: baseSchema });
          
          const result = manager.getTemplate(name, platform);
          expect(result).toBeDefined();
          expect(result!.root.id).toBe(baseSchema.root.id);
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Template Management Operations', () => {
    it('Property 5j: hasTemplate correctly reports template existence', () => {
      const name = 'TestComponent';
      const template: ComponentTemplate = {
        layer: 'base',
        template: { version: '1.0', root: { id: 'test', type: 'Test' } },
      };

      expect(manager.hasTemplate(name, 'base')).toBe(false);
      manager.registerTemplate(name, template);
      expect(manager.hasTemplate(name, 'base')).toBe(true);
      manager.removeTemplate(name, 'base');
      expect(manager.hasTemplate(name, 'base')).toBe(false);
    });

    it('Property 5l: clear removes all templates', () => {
      manager.registerTemplate('A', { layer: 'base', template: { version: '1.0', root: { id: 'a', type: 'A' } } });
      manager.registerTemplate('B', { layer: 'base', template: { version: '1.0', root: { id: 'b', type: 'B' } } });
      
      expect(manager.size).toBeGreaterThan(0);
      manager.clear();
      expect(manager.size).toBe(0);
    });
  });
});
