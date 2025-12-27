/**
 * Template Manager Property-Based Tests
 * 
 * **Feature: component-showcase, Property 5: 模板合并正确性**
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
 * 
 * Tests that template merging follows Base → Platform → Theme order,
 * with later layers overriding earlier layers while preserving unoverridden properties.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { 
  TemplateManager
} from './template-manager';
import type { 
  ComponentTemplate, 
  TemplateLayer 
} from './template-manager';
import type { UISchema, UIComponent } from '../types';
import type { PlatformType } from './component-registry';

/**
 * Generator for valid component names
 */
const componentNameArb = fc.string({ minLength: 1, maxLength: 30 })
  .filter(s => s.trim().length > 0 && !s.includes(':'));

/**
 * Generator for platform types
 */
const platformArb = fc.constantFrom<PlatformType>('pc-web', 'mobile-web', 'mobile-native', 'pc-desktop');

/**
 * Generator for theme names
 */
const themeArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0 && !s.includes(':'));

// Template layer arbitrary (reserved for future use)
// const _layerArb = fc.constantFrom<TemplateLayer>('base', 'platform', 'theme');

/**
 * Generator for simple UIComponent
 */
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


/**
 * Generator for simple UISchema
 */
const uiSchemaArb: fc.Arbitrary<UISchema> = fc.record({
  version: fc.constant('1.0'),
  root: uiComponentArb,
  data: fc.option(
    fc.dictionary(
      fc.string({ minLength: 1, maxLength: 10 }),
      fc.oneof(fc.string(), fc.integer(), fc.boolean()),
      { minKeys: 0, maxKeys: 3 }
    ),
    { nil: undefined }
  ),
  meta: fc.option(
    fc.record({
      title: fc.option(fc.string({ maxLength: 30 }), { nil: undefined }),
      description: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
    }),
    { nil: undefined }
  ),
});

/**
 * Generator for base template
 */
const baseTemplateArb = (componentName?: string): fc.Arbitrary<{ name: string; template: ComponentTemplate }> =>
  fc.record({
    name: componentName ? fc.constant(componentName) : componentNameArb,
    template: fc.record({
      layer: fc.constant<TemplateLayer>('base'),
      template: uiSchemaArb,
      styles: fc.option(
        fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.string({ maxLength: 20 }), { minKeys: 0, maxKeys: 3 }),
        { nil: undefined }
      ),
    }),
  });

/**
 * Generator for platform template
 */
const platformTemplateArb = (componentName?: string): fc.Arbitrary<{ name: string; platform: PlatformType; template: ComponentTemplate }> =>
  fc.record({
    name: componentName ? fc.constant(componentName) : componentNameArb,
    platform: platformArb,
    template: fc.record({
      layer: fc.constant<TemplateLayer>('platform'),
      platform: platformArb,
      template: uiSchemaArb,
      styles: fc.option(
        fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.string({ maxLength: 20 }), { minKeys: 0, maxKeys: 3 }),
        { nil: undefined }
      ),
    }),
  }).map(({ name, platform, template }) => ({
    name,
    platform,
    template: { ...template, platform },
  }));

/**
 * Generator for theme template
 */
const themeTemplateArb = (componentName?: string): fc.Arbitrary<{ name: string; theme: string; template: ComponentTemplate }> =>
  fc.record({
    name: componentName ? fc.constant(componentName) : componentNameArb,
    theme: themeArb,
    template: fc.record({
      layer: fc.constant<TemplateLayer>('theme'),
      theme: themeArb,
      template: uiSchemaArb,
      styles: fc.option(
        fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.string({ maxLength: 20 }), { minKeys: 0, maxKeys: 3 }),
        { nil: undefined }
      ),
    }),
  }).map(({ name, theme, template }) => ({
    name,
    theme,
    template: { ...template, theme },
  }));

describe('TemplateManager', () => {
  let manager: TemplateManager;

  beforeEach(() => {
    manager = new TemplateManager();
  });

  describe('Template Registration', () => {
    /**
     * Property 5a: Registered templates can be retrieved
     * 
     * **Validates: Requirements 9.1**
     */
    it('Property 5a: registered base templates can be retrieved', () => {
      fc.assert(
        fc.property(baseTemplateArb(), ({ name, template }) => {
          manager.registerTemplate(name, template);
          
          const retrieved = manager.getTemplateByLayer(name, 'base');
          
          expect(retrieved).toBeDefined();
          expect(retrieved!.layer).toBe('base');
          expect(retrieved!.template).toEqual(template.template);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5b: Platform templates are stored with platform key
     * 
     * **Validates: Requirements 9.2**
     */
    it('Property 5b: platform templates are stored with correct platform', () => {
      fc.assert(
        fc.property(platformTemplateArb(), ({ name, platform, template }) => {
          manager.registerTemplate(name, template);
          
          const retrieved = manager.getTemplateByLayer(name, 'platform', platform);
          
          expect(retrieved).toBeDefined();
          expect(retrieved!.layer).toBe('platform');
          expect(retrieved!.platform).toBe(platform);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5c: Theme templates are stored with theme key
     * 
     * **Validates: Requirements 9.3**
     */
    it('Property 5c: theme templates are stored with correct theme', () => {
      fc.assert(
        fc.property(themeTemplateArb(), ({ name, theme, template }) => {
          manager.registerTemplate(name, template);
          
          const retrieved = manager.getTemplateByLayer(name, 'theme', undefined, theme);
          
          expect(retrieved).toBeDefined();
          expect(retrieved!.layer).toBe('theme');
          expect(retrieved!.theme).toBe(theme);
        }),
        { numRuns: 100 }
      );
    });
  });


  describe('Template Merging - Property 5', () => {
    /**
     * Property 5: 模板合并正确性 (Template Merge Correctness)
     * 
     * For any template layering (Base → Platform → Theme), later layer properties
     * SHALL override earlier layer properties, and unoverridden properties SHALL be preserved.
     * 
     * **Feature: component-showcase, Property 5: 模板合并正确性**
     * **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
     */
    it('Property 5: template merging follows Base → Platform → Theme order', () => {
      fc.assert(
        fc.property(
          componentNameArb,
          platformArb,
          themeArb,
          uiSchemaArb,
          uiSchemaArb,
          uiSchemaArb,
          (name, platform, theme, baseSchema, platformSchema, themeSchema) => {
            // Register all three layers
            manager.registerTemplate(name, {
              layer: 'base',
              template: baseSchema,
            });
            
            manager.registerTemplate(name, {
              layer: 'platform',
              platform,
              template: platformSchema,
            });
            
            manager.registerTemplate(name, {
              layer: 'theme',
              theme,
              template: themeSchema,
            });
            
            // Get merged template
            const merged = manager.getTemplate(name, platform, theme);
            
            expect(merged).toBeDefined();
            
            // Version should come from theme (last override) or platform or base
            expect(merged!.version).toBe(
              themeSchema.version || platformSchema.version || baseSchema.version
            );
            
            // Root id should be overridden by later layers
            const expectedId = themeSchema.root.id || platformSchema.root.id || baseSchema.root.id;
            expect(merged!.root.id).toBe(expectedId);
            
            // Root type should be overridden by later layers
            const expectedType = themeSchema.root.type || platformSchema.root.type || baseSchema.root.type;
            expect(merged!.root.type).toBe(expectedType);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5d: Base template alone returns base schema
     * 
     * **Validates: Requirements 9.1**
     */
    it('Property 5d: base template alone returns base schema', () => {
      fc.assert(
        fc.property(
          componentNameArb,
          platformArb,
          uiSchemaArb,
          (name, platform, baseSchema) => {
            manager.registerTemplate(name, {
              layer: 'base',
              template: baseSchema,
            });
            
            const result = manager.getTemplate(name, platform);
            
            expect(result).toBeDefined();
            expect(result!.version).toBe(baseSchema.version);
            expect(result!.root.id).toBe(baseSchema.root.id);
            expect(result!.root.type).toBe(baseSchema.root.type);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5e: Platform layer overrides base layer
     * 
     * **Validates: Requirements 9.2, 9.4**
     */
    it('Property 5e: platform layer overrides base layer properties', () => {
      fc.assert(
        fc.property(
          componentNameArb,
          platformArb,
          fc.record({
            version: fc.constant('1.0'),
            root: fc.record({
              id: fc.constant('base-id'),
              type: fc.constant('BaseType'),
              props: fc.constant({ baseProp: 'baseValue', sharedProp: 'fromBase' }),
            }),
          }),
          fc.record({
            version: fc.constant('1.0'),
            root: fc.record({
              id: fc.constant('platform-id'),
              type: fc.constant('PlatformType'),
              props: fc.constant({ platformProp: 'platformValue', sharedProp: 'fromPlatform' }),
            }),
          }),
          (name, platform, baseSchema, platformSchema) => {
            manager.registerTemplate(name, {
              layer: 'base',
              template: baseSchema as UISchema,
            });
            
            manager.registerTemplate(name, {
              layer: 'platform',
              platform,
              template: platformSchema as UISchema,
            });
            
            const merged = manager.getTemplate(name, platform);
            
            expect(merged).toBeDefined();
            
            // Platform should override base
            expect(merged!.root.id).toBe('platform-id');
            expect(merged!.root.type).toBe('PlatformType');
            
            // Props should be merged with platform overriding base
            expect(merged!.root.props).toHaveProperty('baseProp', 'baseValue');
            expect(merged!.root.props).toHaveProperty('platformProp', 'platformValue');
            expect(merged!.root.props).toHaveProperty('sharedProp', 'fromPlatform');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5f: Theme layer overrides platform and base layers
     * 
     * **Validates: Requirements 9.3, 9.4**
     */
    it('Property 5f: theme layer overrides platform and base layers', () => {
      fc.assert(
        fc.property(
          componentNameArb,
          platformArb,
          themeArb,
          (name, platform, theme) => {
            const baseSchema: UISchema = {
              version: '1.0',
              root: {
                id: 'base-id',
                type: 'BaseType',
                props: { baseProp: 'base', shared: 'fromBase' },
              },
            };
            
            const platformSchema: UISchema = {
              version: '1.0',
              root: {
                id: 'platform-id',
                type: 'PlatformType',
                props: { platformProp: 'platform', shared: 'fromPlatform' },
              },
            };
            
            const themeSchema: UISchema = {
              version: '1.0',
              root: {
                id: 'theme-id',
                type: 'ThemeType',
                props: { themeProp: 'theme', shared: 'fromTheme' },
              },
            };
            
            manager.registerTemplate(name, { layer: 'base', template: baseSchema });
            manager.registerTemplate(name, { layer: 'platform', platform, template: platformSchema });
            manager.registerTemplate(name, { layer: 'theme', theme, template: themeSchema });
            
            const merged = manager.getTemplate(name, platform, theme);
            
            expect(merged).toBeDefined();
            
            // Theme should override all
            expect(merged!.root.id).toBe('theme-id');
            expect(merged!.root.type).toBe('ThemeType');
            
            // Props should be merged with theme having highest priority
            expect(merged!.root.props).toHaveProperty('baseProp', 'base');
            expect(merged!.root.props).toHaveProperty('platformProp', 'platform');
            expect(merged!.root.props).toHaveProperty('themeProp', 'theme');
            expect(merged!.root.props).toHaveProperty('shared', 'fromTheme');
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('mergeTemplates Method', () => {
    /**
     * Property 5g: mergeTemplates preserves unoverridden properties
     * 
     * **Validates: Requirements 9.4**
     */
    it('Property 5g: mergeTemplates preserves unoverridden properties', () => {
      fc.assert(
        fc.property(
          uiSchemaArb,
          uiSchemaArb,
          (base, override) => {
            const merged = manager.mergeTemplates(base, override);
            
            // Version should be from override if present, else base
            expect(merged.version).toBe(override.version || base.version);
            
            // Root id should be from override if present, else base
            expect(merged.root.id).toBe(override.root.id || base.root.id);
            
            // Root type should be from override if present, else base
            expect(merged.root.type).toBe(override.root.type || base.root.type);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5h: mergeTemplates handles multiple overrides in order
     * 
     * **Validates: Requirements 9.4**
     */
    it('Property 5h: mergeTemplates applies overrides in order', () => {
      fc.assert(
        fc.property(
          fc.array(uiSchemaArb, { minLength: 2, maxLength: 5 }),
          (schemas) => {
            const [base, ...overrides] = schemas;
            const merged = manager.mergeTemplates(base, ...overrides);
            
            // Last override should win for id and type
            const lastOverride = overrides[overrides.length - 1];
            expect(merged.root.id).toBe(lastOverride.root.id || base.root.id);
            expect(merged.root.type).toBe(lastOverride.root.type || base.root.type);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5i: mergeTemplates with no overrides returns base
     * 
     * **Validates: Requirements 9.4**
     */
    it('Property 5i: mergeTemplates with no overrides returns equivalent to base', () => {
      fc.assert(
        fc.property(uiSchemaArb, (base) => {
          const merged = manager.mergeTemplates(base);
          
          expect(merged.version).toBe(base.version);
          expect(merged.root.id).toBe(base.root.id);
          expect(merged.root.type).toBe(base.root.type);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Template Management Operations', () => {
    /**
     * Property 5j: hasTemplate correctly reports template existence
     */
    it('Property 5j: hasTemplate correctly reports template existence', () => {
      fc.assert(
        fc.property(baseTemplateArb(), ({ name, template }) => {
          // Before registration
          expect(manager.hasTemplate(name, 'base')).toBe(false);
          
          // After registration
          manager.registerTemplate(name, template);
          expect(manager.hasTemplate(name, 'base')).toBe(true);
          
          // After removal
          manager.removeTemplate(name, 'base');
          expect(manager.hasTemplate(name, 'base')).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5k: getComponentTemplates returns all templates for a component
     */
    it('Property 5k: getComponentTemplates returns all templates for a component', () => {
      fc.assert(
        fc.property(
          componentNameArb,
          platformArb,
          themeArb,
          uiSchemaArb,
          uiSchemaArb,
          uiSchemaArb,
          (name, platform, theme, baseSchema, platformSchema, themeSchema) => {
            manager.registerTemplate(name, { layer: 'base', template: baseSchema });
            manager.registerTemplate(name, { layer: 'platform', platform, template: platformSchema });
            manager.registerTemplate(name, { layer: 'theme', theme, template: themeSchema });
            
            const templates = manager.getComponentTemplates(name);
            
            expect(templates.length).toBe(3);
            expect(templates.some(t => t.layer === 'base')).toBe(true);
            expect(templates.some(t => t.layer === 'platform')).toBe(true);
            expect(templates.some(t => t.layer === 'theme')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5l: clear removes all templates
     */
    it('Property 5l: clear removes all templates', () => {
      fc.assert(
        fc.property(
          fc.array(baseTemplateArb(), { minLength: 1, maxLength: 5 }),
          (templates) => {
            // Register all templates
            for (const { name, template } of templates) {
              manager.registerTemplate(name, template);
            }
            
            expect(manager.size).toBeGreaterThan(0);
            
            // Clear all
            manager.clear();
            
            expect(manager.size).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    /**
     * Property 5m: getTemplate returns undefined when no base template exists
     */
    it('Property 5m: getTemplate returns undefined when no base template exists', () => {
      fc.assert(
        fc.property(
          componentNameArb,
          platformArb,
          (name, platform) => {
            // Don't register any template
            const result = manager.getTemplate(name, platform);
            expect(result).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5n: Different platforms have independent templates
     */
    it('Property 5n: different platforms have independent templates', () => {
      fc.assert(
        fc.property(
          componentNameArb,
          uiSchemaArb,
          (name, baseSchema) => {
            const platforms: PlatformType[] = ['pc-web', 'mobile-web', 'mobile-native', 'pc-desktop'];
            
            // Register base
            manager.registerTemplate(name, { layer: 'base', template: baseSchema });
            
            // Register different platform templates
            for (const platform of platforms) {
              const platformSchema: UISchema = {
                version: '1.0',
                root: { id: `${platform}-id`, type: `${platform}-type` },
              };
              manager.registerTemplate(name, { layer: 'platform', platform, template: platformSchema });
            }
            
            // Each platform should get its own template
            for (const platform of platforms) {
              const result = manager.getTemplate(name, platform);
              expect(result).toBeDefined();
              expect(result!.root.id).toBe(`${platform}-id`);
              expect(result!.root.type).toBe(`${platform}-type`);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
