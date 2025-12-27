/**
 * Template Manager
 * 
 * Manages component templates with layered architecture:
 * Base → Platform → Theme
 * 
 * @module template-manager
 * @see Requirements 9.1, 9.2, 9.3, 9.4
 */

import type { UISchema, UIComponent, StyleProps } from '../types';
import type { PlatformType } from './component-registry';

/**
 * Template layer types
 */
export type TemplateLayer = 'base' | 'platform' | 'theme';

/**
 * Component template definition
 */
export interface ComponentTemplate {
  /** Template layer */
  layer: TemplateLayer;
  /** Target platform (for platform layer) */
  platform?: PlatformType;
  /** Theme name (for theme layer) */
  theme?: string;
  /** Template UI schema */
  template: UISchema;
  /** Additional styles */
  styles?: Record<string, string>;
}

/**
 * Template storage key
 */
function createTemplateKey(
  componentName: string,
  layer: TemplateLayer,
  platform?: PlatformType,
  theme?: string
): string {
  const parts = [componentName, layer];
  if (platform) parts.push(platform);
  if (theme) parts.push(theme);
  return parts.join(':');
}

/**
 * Deep merge two objects
 */
function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  
  for (const key of Object.keys(override) as (keyof T)[]) {
    const baseValue = base[key];
    const overrideValue = override[key];
    
    if (
      overrideValue !== undefined &&
      typeof baseValue === 'object' &&
      baseValue !== null &&
      typeof overrideValue === 'object' &&
      overrideValue !== null &&
      !Array.isArray(baseValue) &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>
      ) as T[keyof T];
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue as T[keyof T];
    }
  }
  
  return result;
}

/**
 * Merge UIComponent with override
 */
function mergeComponent(base: UIComponent, override: Partial<UIComponent>): UIComponent {
  const result: UIComponent = {
    ...base,
    ...override,
    id: override.id || base.id,
    type: override.type || base.type,
  };

  // Merge props
  if (base.props || override.props) {
    result.props = deepMerge(
      (base.props || {}) as Record<string, unknown>,
      (override.props || {}) as Record<string, unknown>
    );
  }

  // Merge styles
  if (base.style || override.style) {
    result.style = deepMerge(
      (base.style || {}) as unknown as Record<string, unknown>,
      (override.style || {}) as unknown as Record<string, unknown>
    ) as unknown as StyleProps;
  }

  // Merge children recursively
  if (override.children) {
    result.children = override.children;
  } else if (base.children) {
    result.children = base.children;
  }

  return result;
}

/**
 * Merge two UISchemas
 */
function mergeSchemas(base: UISchema, override: UISchema): UISchema {
  return {
    version: override.version || base.version,
    root: mergeComponent(base.root, override.root),
    data: override.data ? deepMerge(base.data || {}, override.data) : base.data,
    meta: override.meta ? deepMerge(base.meta || {}, override.meta) : base.meta,
  };
}

/**
 * Template Manager class
 * 
 * Manages component templates with three-layer architecture:
 * 1. Base - Common component structure
 * 2. Platform - Platform-specific overrides
 * 3. Theme - Theme-specific styling
 */
export class TemplateManager {
  private templates: Map<string, ComponentTemplate> = new Map();

  /**
   * Register a template
   * @param componentName - Component name
   * @param template - Template definition
   */
  registerTemplate(componentName: string, template: ComponentTemplate): void {
    const key = createTemplateKey(
      componentName,
      template.layer,
      template.platform,
      template.theme
    );
    this.templates.set(key, template);
  }

  /**
   * Get a specific template
   * @param componentName - Component name
   * @param layer - Template layer
   * @param platform - Platform (for platform layer)
   * @param theme - Theme (for theme layer)
   */
  getTemplateByLayer(
    componentName: string,
    layer: TemplateLayer,
    platform?: PlatformType,
    theme?: string
  ): ComponentTemplate | undefined {
    const key = createTemplateKey(componentName, layer, platform, theme);
    return this.templates.get(key);
  }

  /**
   * Get merged template for a component
   * Merges Base → Platform → Theme layers
   * @param componentName - Component name
   * @param platform - Target platform
   * @param theme - Theme name
   * @returns Merged UISchema or undefined
   */
  getTemplate(
    componentName: string,
    platform: PlatformType,
    theme?: string
  ): UISchema | undefined {
    // Get base template
    const baseTemplate = this.getTemplateByLayer(componentName, 'base');
    if (!baseTemplate) return undefined;

    let result = baseTemplate.template;

    // Merge platform template
    const platformTemplate = this.getTemplateByLayer(componentName, 'platform', platform);
    if (platformTemplate) {
      result = mergeSchemas(result, platformTemplate.template);
    }

    // Merge theme template
    if (theme) {
      const themeTemplate = this.getTemplateByLayer(componentName, 'theme', undefined, theme);
      if (themeTemplate) {
        result = mergeSchemas(result, themeTemplate.template);
      }
    }

    return result;
  }

  /**
   * Merge multiple templates
   * @param base - Base schema
   * @param overrides - Override schemas
   * @returns Merged schema
   */
  mergeTemplates(base: UISchema, ...overrides: UISchema[]): UISchema {
    let result = base;
    for (const override of overrides) {
      result = mergeSchemas(result, override);
    }
    return result;
  }

  /**
   * Check if a template exists
   */
  hasTemplate(
    componentName: string,
    layer: TemplateLayer,
    platform?: PlatformType,
    theme?: string
  ): boolean {
    const key = createTemplateKey(componentName, layer, platform, theme);
    return this.templates.has(key);
  }

  /**
   * Remove a template
   */
  removeTemplate(
    componentName: string,
    layer: TemplateLayer,
    platform?: PlatformType,
    theme?: string
  ): boolean {
    const key = createTemplateKey(componentName, layer, platform, theme);
    return this.templates.delete(key);
  }

  /**
   * Get all templates for a component
   */
  getComponentTemplates(componentName: string): ComponentTemplate[] {
    const result: ComponentTemplate[] = [];
    for (const [key, template] of this.templates) {
      if (key.startsWith(componentName + ':')) {
        result.push(template);
      }
    }
    return result;
  }

  /**
   * Clear all templates
   */
  clear(): void {
    this.templates.clear();
  }

  /**
   * Get template count
   */
  get size(): number {
    return this.templates.size;
  }
}

/**
 * Default template manager instance
 */
export const defaultTemplateManager = new TemplateManager();
