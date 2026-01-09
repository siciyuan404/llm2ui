/**
 * Icon Registry Tests
 * 
 * Property-based tests for the Icon Registry module.
 * 
 * @module lib/utils/icon-registry.test
 * @see Requirements 12.1, 12.2, 12.3
 * @see Property 9: 图标搜索完整性
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { IconDefinition, IconCategory } from './icon-registry';
import {
  IconRegistry,
  validateIconDefinition,
  lucideIcons,
  defaultIconRegistry,
  initializeDefaultIcons,
} from './icon-registry';

const validCategories: IconCategory[] = [
  'general', 'arrow', 'social', 'file', 'media', 'action', 'navigation', 'communication',
];

const iconDefinitionArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  category: fc.constantFrom(...validCategories),
  svg: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 10 }),
});

const uniqueIconsArb = fc.array(iconDefinitionArb, { minLength: 1, maxLength: 20 })
  .map(icons => {
    const seen = new Set<string>();
    return icons.filter(icon => {
      if (seen.has(icon.name)) return false;
      seen.add(icon.name);
      return true;
    });
  })
  .filter(icons => icons.length > 0);

describe('IconRegistry', () => {
  let registry: IconRegistry;

  beforeEach(() => {
    registry = new IconRegistry();
  });

  describe('Basic Operations', () => {
    it('should register and retrieve an icon', () => {
      const icon: IconDefinition = {
        name: 'test-icon',
        category: 'general',
        svg: '<svg></svg>',
        tags: ['test'],
      };
      registry.register(icon);
      expect(registry.get('test-icon')).toEqual(icon);
    });

    it('should return undefined for non-existent icon', () => {
      expect(registry.get('non-existent')).toBeUndefined();
    });

    it('should check if icon exists', () => {
      const icon: IconDefinition = {
        name: 'test-icon',
        category: 'general',
        svg: '<svg></svg>',
        tags: [],
      };
      registry.register(icon);
      expect(registry.has('test-icon')).toBe(true);
      expect(registry.has('non-existent')).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should reject icon with empty name', () => {
      const result = validateIconDefinition({
        name: '',
        category: 'general',
        svg: '<svg></svg>',
        tags: [],
      });
      expect(result.valid).toBe(false);
    });

    it('should reject icon with invalid category', () => {
      const result = validateIconDefinition({
        name: 'test',
        category: 'invalid' as IconCategory,
        svg: '<svg></svg>',
        tags: [],
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('Category Filtering', () => {
    beforeEach(() => {
      registry.register({ name: 'icon1', category: 'general', svg: '<svg>1</svg>', tags: [] });
      registry.register({ name: 'icon2', category: 'general', svg: '<svg>2</svg>', tags: [] });
      registry.register({ name: 'icon3', category: 'arrow', svg: '<svg>3</svg>', tags: [] });
    });

    it('should filter icons by category', () => {
      const generalIcons = registry.getByCategory('general');
      expect(generalIcons).toHaveLength(2);
      expect(generalIcons.every(i => i.category === 'general')).toBe(true);
    });
  });

  describe('Search', () => {
    beforeEach(() => {
      registry.register({ name: 'home', category: 'general', svg: '<svg></svg>', tags: ['house', 'building'] });
      registry.register({ name: 'arrow-up', category: 'arrow', svg: '<svg></svg>', tags: ['up', 'direction'] });
    });

    it('should search by icon name', () => {
      const results = registry.search('home');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('home');
    });

    it('should search by tag', () => {
      const results = registry.search('direction');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('arrow-up');
    });

    it('should search case-insensitively', () => {
      const results = registry.search('HOME');
      expect(results).toHaveLength(1);
    });
  });
});

describe('Property-Based Tests', () => {
  describe('Property 9: Icon Search Completeness', () => {
    it('should return only icons whose name or tags contain the search query', () => {
      fc.assert(
        fc.property(uniqueIconsArb, fc.string({ minLength: 1, maxLength: 20 }), (icons, query) => {
          const registry = new IconRegistry();
          icons.forEach(icon => registry.register(icon));

          const results = registry.search(query);
          const lowerQuery = query.toLowerCase().trim();

          return results.every(icon => {
            const nameMatches = icon.name.toLowerCase().includes(lowerQuery);
            const tagMatches = icon.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
            return nameMatches || tagMatches;
          });
        }),
        { numRuns: 50 }
      );
    });

    it('should find icon when searching by exact name', () => {
      fc.assert(
        fc.property(uniqueIconsArb, (icons) => {
          const registry = new IconRegistry();
          icons.forEach(icon => registry.register(icon));

          const targetIcon = icons[0];
          const results = registry.search(targetIcon.name);
          return results.some(icon => icon.name === targetIcon.name);
        }),
        { numRuns: 50 }
      );
    });
  });
});

describe('Lucide Icons Integration', () => {
  it('should have icons in all expected categories', () => {
    const categories = new Set(lucideIcons.map(i => i.category));
    expect(categories.has('general')).toBe(true);
    expect(categories.has('arrow')).toBe(true);
  });

  it('should have valid SVG content for all icons', () => {
    lucideIcons.forEach(icon => {
      expect(icon.svg).toContain('<svg');
      expect(icon.svg).toContain('</svg>');
    });
  });

  it('should initialize default registry with Lucide icons', () => {
    const registry = new IconRegistry();
    registry.registerAll(lucideIcons);
    expect(registry.size).toBe(lucideIcons.length);
  });
});

describe('Default Registry and Initialization', () => {
  it('should have a default registry instance', () => {
    expect(defaultIconRegistry).toBeInstanceOf(IconRegistry);
  });

  it('should initialize default icons via initializeDefaultIcons', () => {
    defaultIconRegistry.clear();
    expect(defaultIconRegistry.size).toBe(0);
    initializeDefaultIcons();
    expect(defaultIconRegistry.size).toBe(lucideIcons.length);
  });
});
