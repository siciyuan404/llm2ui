/**
 * Icon Registry Tests
 * 
 * Property-based tests for the Icon Registry module.
 * Tests icon registration, search, and category filtering.
 * 
 * @module icon-registry.test
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

// Valid icon categories for testing
const validCategories: IconCategory[] = [
  'general',
  'arrow',
  'social',
  'file',
  'media',
  'action',
  'navigation',
  'communication',
];

// Arbitrary for generating valid icon definitions
const iconDefinitionArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  category: fc.constantFrom(...validCategories),
  svg: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 10 }),
});

// Arbitrary for generating unique icon definitions (with unique names)
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

    it('should unregister an icon', () => {
      const icon: IconDefinition = {
        name: 'test-icon',
        category: 'general',
        svg: '<svg></svg>',
        tags: [],
      };

      registry.register(icon);
      expect(registry.unregister('test-icon')).toBe(true);
      expect(registry.has('test-icon')).toBe(false);
    });

    it('should clear all icons', () => {
      const icon: IconDefinition = {
        name: 'test-icon',
        category: 'general',
        svg: '<svg></svg>',
        tags: [],
      };

      registry.register(icon);
      registry.clear();
      expect(registry.size).toBe(0);
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
      // Empty string is falsy, so it triggers "required" error
      expect(result.errors).toContain('Icon name is required and must be a string');
    });

    it('should reject icon with whitespace-only name', () => {
      const result = validateIconDefinition({
        name: '   ',
        category: 'general',
        svg: '<svg></svg>',
        tags: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Icon name cannot be empty');
    });

    it('should reject icon with invalid category', () => {
      const result = validateIconDefinition({
        name: 'test',
        category: 'invalid' as IconCategory,
        svg: '<svg></svg>',
        tags: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid category'))).toBe(true);
    });

    it('should reject icon with empty svg', () => {
      const result = validateIconDefinition({
        name: 'test',
        category: 'general',
        svg: '',
        tags: [],
      });
      expect(result.valid).toBe(false);
      // Empty string is falsy, so it triggers "required" error
      expect(result.errors).toContain('Icon svg is required and must be a string');
    });

    it('should reject icon with whitespace-only svg', () => {
      const result = validateIconDefinition({
        name: 'test',
        category: 'general',
        svg: '   ',
        tags: [],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Icon svg cannot be empty');
    });

    it('should throw error when registering invalid icon', () => {
      expect(() => {
        registry.register({
          name: '',
          category: 'general',
          svg: '<svg></svg>',
          tags: [],
        });
      }).toThrow();
    });
  });

  describe('Category Filtering', () => {
    beforeEach(() => {
      registry.register({ name: 'icon1', category: 'general', svg: '<svg>1</svg>', tags: [] });
      registry.register({ name: 'icon2', category: 'general', svg: '<svg>2</svg>', tags: [] });
      registry.register({ name: 'icon3', category: 'arrow', svg: '<svg>3</svg>', tags: [] });
      registry.register({ name: 'icon4', category: 'file', svg: '<svg>4</svg>', tags: [] });
    });

    it('should filter icons by category', () => {
      const generalIcons = registry.getByCategory('general');
      expect(generalIcons).toHaveLength(2);
      expect(generalIcons.every(i => i.category === 'general')).toBe(true);
    });

    it('should return empty array for category with no icons', () => {
      const socialIcons = registry.getByCategory('social');
      expect(socialIcons).toHaveLength(0);
    });

    it('should get all unique categories', () => {
      const categories = registry.getCategories();
      expect(categories).toContain('general');
      expect(categories).toContain('arrow');
      expect(categories).toContain('file');
      expect(categories).not.toContain('social');
    });

    it('should get category counts', () => {
      const counts = registry.getCategoryCounts();
      expect(counts['general']).toBe(2);
      expect(counts['arrow']).toBe(1);
      expect(counts['file']).toBe(1);
    });
  });

  describe('Search', () => {
    beforeEach(() => {
      registry.register({
        name: 'home',
        category: 'general',
        svg: '<svg></svg>',
        tags: ['house', 'building'],
      });
      registry.register({
        name: 'arrow-up',
        category: 'arrow',
        svg: '<svg></svg>',
        tags: ['up', 'direction'],
      });
      registry.register({
        name: 'file-text',
        category: 'file',
        svg: '<svg></svg>',
        tags: ['document', 'text'],
      });
    });

    it('should search by icon name', () => {
      const results = registry.search('home');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('home');
    });

    it('should search by tag', () => {
      const results = registry.search('document');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('file-text');
    });

    it('should search case-insensitively', () => {
      const results = registry.search('HOME');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('home');
    });

    it('should return all icons for empty query', () => {
      const results = registry.search('');
      expect(results).toHaveLength(3);
    });

    it('should return empty array for no matches', () => {
      const results = registry.search('nonexistent');
      expect(results).toHaveLength(0);
    });

    it('should match partial names', () => {
      const results = registry.search('arrow');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('arrow-up');
    });
  });
});


/**
 * Property-Based Tests
 * 
 * **Feature: component-showcase, Property 9: 图标搜索完整性**
 * *For any* 图标搜索查询，返回的图标名称或标签 SHALL 包含搜索关键词。
 * **Validates: Requirements 12.2**
 */
describe('Property-Based Tests', () => {
  describe('Property 9: Icon Search Completeness', () => {
    /**
     * Property 9: 图标搜索完整性
     * *For any* 图标搜索查询，返回的图标名称或标签 SHALL 包含搜索关键词。
     * **Validates: Requirements 12.2**
     */
    it('should return only icons whose name or tags contain the search query', () => {
      fc.assert(
        fc.property(
          uniqueIconsArb,
          fc.string({ minLength: 1, maxLength: 20 }),
          (icons, query) => {
            const registry = new IconRegistry();
            icons.forEach(icon => registry.register(icon));

            const results = registry.search(query);
            const lowerQuery = query.toLowerCase().trim();

            // All results should match the query in name or tags
            return results.every(icon => {
              const nameMatches = icon.name.toLowerCase().includes(lowerQuery);
              const tagMatches = icon.tags.some(tag =>
                tag.toLowerCase().includes(lowerQuery)
              );
              return nameMatches || tagMatches;
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Search should find all matching icons
     * *For any* registered icon, searching by its exact name should return that icon.
     * **Validates: Requirements 12.2**
     */
    it('should find icon when searching by exact name', () => {
      fc.assert(
        fc.property(
          uniqueIconsArb,
          (icons) => {
            const registry = new IconRegistry();
            icons.forEach(icon => registry.register(icon));

            // Pick a random icon and search for it
            const targetIcon = icons[0];
            const results = registry.search(targetIcon.name);

            // The target icon should be in the results
            return results.some(icon => icon.name === targetIcon.name);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Search should find icon by any of its tags
     * *For any* registered icon with tags, searching by any tag should return that icon.
     * **Validates: Requirements 12.2**
     */
    it('should find icon when searching by any of its tags', () => {
      fc.assert(
        fc.property(
          uniqueIconsArb.filter(icons => icons.some(i => i.tags.length > 0)),
          (icons) => {
            const registry = new IconRegistry();
            icons.forEach(icon => registry.register(icon));

            // Find an icon with tags
            const iconWithTags = icons.find(i => i.tags.length > 0);
            if (!iconWithTags) return true;

            // Search by the first tag
            const tag = iconWithTags.tags[0];
            const results = registry.search(tag);

            // The icon should be in the results
            return results.some(icon => icon.name === iconWithTags.name);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Registration Consistency', () => {
    /**
     * Property: Registered icons should be retrievable
     * *For any* valid icon definition, after registration, get(name) should return the same icon.
     * **Validates: Requirements 12.1**
     */
    it('should retrieve registered icon with same properties', () => {
      fc.assert(
        fc.property(
          iconDefinitionArb,
          (icon) => {
            const registry = new IconRegistry();
            registry.register(icon);

            const retrieved = registry.get(icon.name);
            return (
              retrieved !== undefined &&
              retrieved.name === icon.name &&
              retrieved.category === icon.category &&
              retrieved.svg === icon.svg &&
              retrieved.tags.length === icon.tags.length &&
              retrieved.tags.every((tag, i) => tag === icon.tags[i])
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: getAll should return all registered icons
     * *For any* set of unique icons, getAll should return exactly those icons.
     * **Validates: Requirements 12.1**
     */
    it('should return all registered icons via getAll', () => {
      fc.assert(
        fc.property(
          uniqueIconsArb,
          (icons) => {
            const registry = new IconRegistry();
            icons.forEach(icon => registry.register(icon));

            const all = registry.getAll();
            return (
              all.length === icons.length &&
              icons.every(icon => all.some(a => a.name === icon.name))
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Category Filtering Completeness', () => {
    /**
     * Property: Category filter should return only icons of that category
     * *For any* category filter, all returned icons should belong to that category.
     * **Validates: Requirements 12.3**
     */
    it('should return only icons of the specified category', () => {
      fc.assert(
        fc.property(
          uniqueIconsArb,
          fc.constantFrom(...validCategories),
          (icons, category) => {
            const registry = new IconRegistry();
            icons.forEach(icon => registry.register(icon));

            const filtered = registry.getByCategory(category);
            return filtered.every(icon => icon.category === category);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Category filter should return all icons of that category
     * *For any* category, all icons of that category should be in the filtered result.
     * **Validates: Requirements 12.3**
     */
    it('should return all icons of the specified category', () => {
      fc.assert(
        fc.property(
          uniqueIconsArb,
          fc.constantFrom(...validCategories),
          (icons, category) => {
            const registry = new IconRegistry();
            icons.forEach(icon => registry.register(icon));

            const filtered = registry.getByCategory(category);
            const expectedCount = icons.filter(i => i.category === category).length;

            return filtered.length === expectedCount;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Lucide Icons Integration', () => {
  it('should have icons in all expected categories', () => {
    const categories = new Set(lucideIcons.map(i => i.category));
    expect(categories.has('general')).toBe(true);
    expect(categories.has('arrow')).toBe(true);
    expect(categories.has('social')).toBe(true);
    expect(categories.has('file')).toBe(true);
    expect(categories.has('media')).toBe(true);
    expect(categories.has('action')).toBe(true);
    expect(categories.has('navigation')).toBe(true);
    expect(categories.has('communication')).toBe(true);
  });

  it('should have valid SVG content for all icons', () => {
    lucideIcons.forEach(icon => {
      expect(icon.svg).toContain('<svg');
      expect(icon.svg).toContain('</svg>');
    });
  });

  it('should have unique icon names', () => {
    const names = lucideIcons.map(i => i.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should initialize default registry with Lucide icons', () => {
    const registry = new IconRegistry();
    expect(registry.size).toBe(0);

    registry.registerAll(lucideIcons);
    expect(registry.size).toBe(lucideIcons.length);
  });

  it('should be searchable after initialization', () => {
    const registry = new IconRegistry();
    registry.registerAll(lucideIcons);

    // Search for common icons
    expect(registry.search('home').length).toBeGreaterThan(0);
    expect(registry.search('arrow').length).toBeGreaterThan(0);
    expect(registry.search('file').length).toBeGreaterThan(0);
  });
});

describe('Default Registry and Initialization', () => {
  it('should have a default registry instance', () => {
    expect(defaultIconRegistry).toBeInstanceOf(IconRegistry);
  });

  it('should initialize default icons via initializeDefaultIcons', () => {
    // Clear the default registry first
    defaultIconRegistry.clear();
    expect(defaultIconRegistry.size).toBe(0);

    // Initialize with Lucide icons
    initializeDefaultIcons();
    expect(defaultIconRegistry.size).toBe(lucideIcons.length);

    // Verify some icons are present
    expect(defaultIconRegistry.has('home')).toBe(true);
    expect(defaultIconRegistry.has('search')).toBe(true);
    expect(defaultIconRegistry.has('arrow-up')).toBe(true);
  });
});
