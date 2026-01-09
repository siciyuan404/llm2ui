/**
 * Icon Registry
 * 
 * Manages registration and lookup of icons for the llm2ui system.
 * Supports categorization, search by name and tags, and integration with Lucide icons.
 * 
 * @module lib/utils/icon-registry
 * @see Requirements 12.1, 12.2, 12.3
 */

/**
 * Icon category types
 */
export type IconCategory = 'general' | 'arrow' | 'social' | 'file' | 'media' | 'action' | 'navigation' | 'communication';

/**
 * Icon definition for registration
 */
export interface IconDefinition {
  /** Icon name/identifier */
  name: string;
  /** Icon category for organization */
  category: IconCategory;
  /** SVG content string */
  svg: string;
  /** Searchable tags */
  tags: string[];
}

/**
 * Validation result for icon definition
 */
export interface IconValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates an icon definition
 */
export function validateIconDefinition(
  definition: Partial<IconDefinition>
): IconValidationResult {
  const errors: string[] = [];

  if (!definition.name || typeof definition.name !== 'string') {
    errors.push('Icon name is required and must be a string');
  } else if (definition.name.trim() === '') {
    errors.push('Icon name cannot be empty');
  }

  const validCategories: IconCategory[] = ['general', 'arrow', 'social', 'file', 'media', 'action', 'navigation', 'communication'];
  if (!definition.category) {
    errors.push('Icon category is required');
  } else if (!validCategories.includes(definition.category)) {
    errors.push(`Invalid category: ${definition.category}. Must be one of: ${validCategories.join(', ')}`);
  }

  if (!definition.svg || typeof definition.svg !== 'string') {
    errors.push('Icon svg is required and must be a string');
  } else if (definition.svg.trim() === '') {
    errors.push('Icon svg cannot be empty');
  }

  if (!definition.tags) {
    errors.push('Icon tags is required');
  } else if (!Array.isArray(definition.tags)) {
    errors.push('Icon tags must be an array');
  } else {
    for (let i = 0; i < definition.tags.length; i++) {
      if (typeof definition.tags[i] !== 'string') {
        errors.push(`Tag at index ${i} must be a string`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


/**
 * Icon Registry class
 * 
 * Manages registration and lookup of icons with support for:
 * - Category filtering
 * - Full-text search by name and tags
 */
export class IconRegistry {
  private icons: Map<string, IconDefinition> = new Map();

  /**
   * Register an icon definition
   * @param icon - The icon definition to register
   * @throws Error if the definition is invalid
   */
  register(icon: IconDefinition): void {
    const validation = validateIconDefinition(icon);
    if (!validation.valid) {
      throw new Error(`Invalid icon definition: ${validation.errors.join(', ')}`);
    }

    this.icons.set(icon.name, icon);
  }

  /**
   * Register multiple icons at once
   * @param icons - Array of icon definitions to register
   */
  registerAll(icons: IconDefinition[]): void {
    for (const icon of icons) {
      this.register(icon);
    }
  }

  /**
   * Get an icon definition by name
   * @param name - The icon name
   * @returns The icon definition or undefined if not found
   */
  get(name: string): IconDefinition | undefined {
    return this.icons.get(name);
  }

  /**
   * Get all registered icon definitions
   * @returns Array of all icon definitions
   */
  getAll(): IconDefinition[] {
    return Array.from(this.icons.values());
  }

  /**
   * Get icons by category
   * @param category - The category to filter by
   * @returns Array of icon definitions in the category
   */
  getByCategory(category: IconCategory): IconDefinition[] {
    return this.getAll().filter(icon => icon.category === category);
  }

  /**
   * Search icons by name or tags
   * @param query - Search query string
   * @returns Array of matching icon definitions
   */
  search(query: string): IconDefinition[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return this.getAll();

    return this.getAll().filter(icon => {
      // Search in name
      if (icon.name.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in tags
      if (icon.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;

      return false;
    });
  }

  /**
   * Check if an icon is registered
   * @param name - The icon name
   * @returns True if the icon is registered
   */
  has(name: string): boolean {
    return this.icons.has(name);
  }

  /**
   * Unregister an icon
   * @param name - The icon name to unregister
   * @returns True if the icon was unregistered
   */
  unregister(name: string): boolean {
    return this.icons.delete(name);
  }

  /**
   * Get the number of registered icons
   */
  get size(): number {
    return this.icons.size;
  }

  /**
   * Clear all registered icons
   */
  clear(): void {
    this.icons.clear();
  }

  /**
   * Get all unique categories that have icons
   * @returns Array of category names
   */
  getCategories(): IconCategory[] {
    const categories = new Set<IconCategory>();
    for (const icon of this.icons.values()) {
      categories.add(icon.category);
    }
    return Array.from(categories).sort();
  }

  /**
   * Get icon count by category
   * @returns Map of category to count
   */
  getCategoryCounts(): Record<IconCategory, number> {
    const counts: Record<string, number> = {};
    for (const icon of this.icons.values()) {
      counts[icon.category] = (counts[icon.category] || 0) + 1;
    }
    return counts as Record<IconCategory, number>;
  }
}

/**
 * Default global icon registry instance
 */
export const defaultIconRegistry = new IconRegistry();


/**
 * Lucide icon definitions
 * A curated set of commonly used icons from the Lucide icon library
 */
export const lucideIcons: IconDefinition[] = [
  // General icons
  {
    name: 'home',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    tags: ['house', 'building', 'main', 'index'],
  },
  {
    name: 'settings',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    tags: ['cog', 'gear', 'preferences', 'config'],
  },
  {
    name: 'search',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    tags: ['find', 'magnifier', 'lookup', 'query'],
  },
  {
    name: 'user',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    tags: ['person', 'account', 'profile', 'avatar'],
  },
  {
    name: 'menu',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
    tags: ['hamburger', 'navigation', 'sidebar'],
  },
  {
    name: 'check',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    tags: ['tick', 'done', 'complete', 'success'],
  },
  {
    name: 'x',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    tags: ['close', 'cancel', 'remove', 'delete'],
  },
  {
    name: 'plus',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    tags: ['add', 'new', 'create'],
  },
  {
    name: 'minus',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
    tags: ['subtract', 'remove', 'decrease'],
  },
  // Arrow icons
  {
    name: 'arrow-up',
    category: 'arrow',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
    tags: ['up', 'direction', 'north'],
  },
  {
    name: 'arrow-down',
    category: 'arrow',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>',
    tags: ['down', 'direction', 'south'],
  },
  {
    name: 'arrow-left',
    category: 'arrow',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
    tags: ['left', 'direction', 'west', 'back'],
  },
  {
    name: 'arrow-right',
    category: 'arrow',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    tags: ['right', 'direction', 'east', 'forward'],
  },
  {
    name: 'chevron-up',
    category: 'arrow',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
    tags: ['up', 'expand', 'collapse'],
  },
  {
    name: 'chevron-down',
    category: 'arrow',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    tags: ['down', 'expand', 'dropdown'],
  },
  {
    name: 'chevron-left',
    category: 'arrow',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    tags: ['left', 'previous', 'back'],
  },
  {
    name: 'chevron-right',
    category: 'arrow',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    tags: ['right', 'next', 'forward'],
  },
  // Social icons
  {
    name: 'share',
    category: 'social',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',
    tags: ['social', 'share', 'send'],
  },
  {
    name: 'heart',
    category: 'social',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    tags: ['like', 'love', 'favorite'],
  },
  {
    name: 'thumbs-up',
    category: 'social',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>',
    tags: ['like', 'approve', 'vote'],
  },
  {
    name: 'message-circle',
    category: 'social',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
    tags: ['chat', 'comment', 'conversation'],
  },
  // File icons
  {
    name: 'file',
    category: 'file',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
    tags: ['document', 'page', 'paper'],
  },
  {
    name: 'folder',
    category: 'file',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
    tags: ['directory', 'storage', 'organize'],
  },
  {
    name: 'download',
    category: 'file',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
    tags: ['save', 'export', 'get'],
  },
  {
    name: 'upload',
    category: 'file',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    tags: ['import', 'send', 'put'],
  },
  {
    name: 'trash',
    category: 'file',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    tags: ['delete', 'remove', 'bin'],
  },
  // Media icons
  {
    name: 'image',
    category: 'media',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    tags: ['picture', 'photo', 'gallery'],
  },
  {
    name: 'video',
    category: 'media',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>',
    tags: ['movie', 'film', 'camera'],
  },
  {
    name: 'music',
    category: 'media',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    tags: ['audio', 'sound', 'song'],
  },
  {
    name: 'play',
    category: 'media',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    tags: ['start', 'begin', 'video'],
  },
  {
    name: 'pause',
    category: 'media',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>',
    tags: ['stop', 'wait', 'hold'],
  },
  // Action icons
  {
    name: 'edit',
    category: 'action',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>',
    tags: ['pencil', 'modify', 'write'],
  },
  {
    name: 'copy',
    category: 'action',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    tags: ['duplicate', 'clone', 'clipboard'],
  },
  {
    name: 'save',
    category: 'action',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>',
    tags: ['store', 'disk', 'floppy'],
  },
  {
    name: 'refresh',
    category: 'action',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
    tags: ['reload', 'sync', 'update'],
  },
  {
    name: 'filter',
    category: 'action',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    tags: ['sort', 'funnel', 'refine'],
  },
  // Navigation icons
  {
    name: 'external-link',
    category: 'navigation',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    tags: ['link', 'open', 'new-tab'],
  },
  {
    name: 'link',
    category: 'navigation',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    tags: ['url', 'chain', 'connect'],
  },
  {
    name: 'log-in',
    category: 'navigation',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>',
    tags: ['signin', 'enter', 'auth'],
  },
  {
    name: 'log-out',
    category: 'navigation',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
    tags: ['signout', 'exit', 'leave'],
  },
  // Communication icons
  {
    name: 'mail',
    category: 'communication',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    tags: ['email', 'envelope', 'message'],
  },
  {
    name: 'phone',
    category: 'communication',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    tags: ['call', 'telephone', 'contact'],
  },
  {
    name: 'bell',
    category: 'communication',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    tags: ['notification', 'alert', 'ring'],
  },
  {
    name: 'send',
    category: 'communication',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    tags: ['submit', 'paper-plane', 'dispatch'],
  },
];

/**
 * Initialize the default icon registry with Lucide icons
 */
export function initializeDefaultIcons(): void {
  defaultIconRegistry.registerAll(lucideIcons);
}