/**
 * @file component-mapping-registry.ts
 * @description 组件 Token 映射注册表，定义组件的每个 Prop 应该使用哪些 Tokens
 * @module lib/design-system/component-mapping-registry
 * @requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import type { TokenCategory } from './token-usage-registry';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 属性 Token 映射
 */
export interface PropTokenMapping {
  /** 属性名称 */
  propName: string;
  
  /** 适用的 Token 类别 */
  tokenCategories: TokenCategory[];
  
  /** 如果是枚举属性，定义枚举值与 Token 的映射 */
  enumTokenMap?: Record<string, string>;
  
  /** 使用说明 */
  description: string;
}

/**
 * 组件 Token 映射
 */
export interface ComponentTokenMapping {
  /** 组件名称 */
  componentName: string;
  
  /** 属性 Token 映射列表 */
  propMappings: PropTokenMapping[];
  
  /** 组件级别的样式 Token 建议 */
  styleTokens?: {
    /** 推荐的颜色 Token */
    colors?: string[];
    /** 推荐的间距 Token */
    spacing?: string[];
  };
}

// ============================================================================
// ComponentMappingRegistry 类
// ============================================================================

/**
 * 组件 Token 映射注册表
 * 
 * 管理所有组件与 Token 的映射关系，提供注册、查询和格式化功能。
 */
export class ComponentMappingRegistry {
  private mappings: Map<string, ComponentTokenMapping>;

  constructor() {
    this.mappings = new Map();
  }

  /**
   * 注册组件 Token 映射
   * @param mapping 组件 Token 映射定义
   */
  registerMapping(mapping: ComponentTokenMapping): void {
    // 验证必填字段
    if (!mapping.componentName || mapping.componentName.trim() === '') {
      throw new Error('ComponentTokenMapping must have a non-empty componentName');
    }
    if (!mapping.propMappings || mapping.propMappings.length === 0) {
      throw new Error('ComponentTokenMapping must have at least one propMapping');
    }

    // 验证每个 propMapping
    for (const propMapping of mapping.propMappings) {
      if (!propMapping.propName || propMapping.propName.trim() === '') {
        throw new Error('PropTokenMapping must have a non-empty propName');
      }
      if (!propMapping.tokenCategories || propMapping.tokenCategories.length === 0) {
        throw new Error('PropTokenMapping must have at least one tokenCategory');
      }
      if (!propMapping.description || propMapping.description.trim() === '') {
        throw new Error('PropTokenMapping must have a non-empty description');
      }
    }

    this.mappings.set(mapping.componentName, mapping);
  }

  /**
   * 批量注册组件 Token 映射
   * @param mappings 组件 Token 映射数组
   */
  registerMappings(mappings: ComponentTokenMapping[]): void {
    for (const mapping of mappings) {
      this.registerMapping(mapping);
    }
  }

  /**
   * 获取指定组件的 Token 映射
   * @param componentName 组件名称
   * @returns 组件 Token 映射，如果不存在则返回 undefined
   */
  getMapping(componentName: string): ComponentTokenMapping | undefined {
    return this.mappings.get(componentName);
  }

  /**
   * 获取所有已注册的组件名称
   * @returns 组件名称数组
   */
  getAllComponentNames(): string[] {
    return Array.from(this.mappings.keys());
  }

  /**
   * 获取所有已注册的组件 Token 映射
   * @returns 组件 Token 映射数组
   */
  getAllMappings(): ComponentTokenMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * 获取使用指定 Token 类别的所有组件
   * @param category Token 类别
   * @returns 组件名称数组
   */
  getComponentsUsingTokenCategory(category: TokenCategory): string[] {
    const result: string[] = [];
    
    for (const [componentName, mapping] of this.mappings) {
      for (const propMapping of mapping.propMappings) {
        if (propMapping.tokenCategories.includes(category)) {
          result.push(componentName);
          break; // 找到一个就跳出内层循环
        }
      }
    }
    
    return result;
  }

  /**
   * 检查组件是否已注册
   * @param componentName 组件名称
   * @returns 是否已注册
   */
  hasMapping(componentName: string): boolean {
    return this.mappings.has(componentName);
  }

  /**
   * 获取已注册组件数量
   * @returns 组件数量
   */
  get size(): number {
    return this.mappings.size;
  }


  /**
   * 格式化为 LLM 可读格式
   * 
   * 生成格式：
   * ```
   * ## Component Token Mappings
   * 
   * ### Button
   * - **variant** → colors
   *   - default → colors.primary
   *   - destructive → colors.error
   *   - outline → colors.secondary
   *   - Description: Button style variant determines the color scheme
   * - **size** → spacing
   *   - Description: Button size affects padding and font size
   * - **className** → colors, spacing
   *   - Description: Additional styling via Tailwind classes
   * 
   * ### Container
   * - **className** → spacing
   *   - Description: Use for padding, margin, and gap
   * ```
   * 
   * @returns LLM 可读的格式化字符串
   */
  formatForLLM(): string {
    const sections: string[] = ['## Component Token Mappings'];
    
    // 按组件名称排序
    const sortedMappings = Array.from(this.mappings.entries())
      .sort(([a], [b]) => a.localeCompare(b));
    
    for (const [componentName, mapping] of sortedMappings) {
      sections.push('');
      sections.push(`### ${componentName}`);
      
      for (const propMapping of mapping.propMappings) {
        const categories = propMapping.tokenCategories.join(', ');
        sections.push(`- **${propMapping.propName}** → ${categories}`);
        
        // 如果有枚举映射，显示映射关系
        if (propMapping.enumTokenMap && Object.keys(propMapping.enumTokenMap).length > 0) {
          for (const [enumValue, tokenRef] of Object.entries(propMapping.enumTokenMap)) {
            sections.push(`  - ${enumValue} → ${tokenRef}`);
          }
        }
        
        sections.push(`  - Description: ${propMapping.description}`);
      }
      
      // 如果有组件级别的样式 Token 建议
      if (mapping.styleTokens) {
        if (mapping.styleTokens.colors && mapping.styleTokens.colors.length > 0) {
          sections.push(`- Recommended colors: ${mapping.styleTokens.colors.join(', ')}`);
        }
        if (mapping.styleTokens.spacing && mapping.styleTokens.spacing.length > 0) {
          sections.push(`- Recommended spacing: ${mapping.styleTokens.spacing.join(', ')}`);
        }
      }
    }
    
    return sections.join('\n');
  }

  /**
   * 清空所有注册的组件 Token 映射
   */
  clear(): void {
    this.mappings.clear();
  }
}

// ============================================================================
// 默认实例
// ============================================================================

/**
 * 默认组件 Token 映射注册表实例
 */
export const defaultComponentMappingRegistry = new ComponentMappingRegistry();


// ============================================================================
// 预设组件 Token 映射
// ============================================================================

/**
 * Button 组件 Token 映射
 * @requirements 2.3, 2.6
 */
export const BUTTON_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Button',
  propMappings: [
    {
      propName: 'variant',
      tokenCategories: ['colors'],
      enumTokenMap: {
        'default': 'colors.primary',
        'destructive': 'colors.error',
        'outline': 'colors.secondary',
        'secondary': 'colors.secondary',
        'ghost': 'colors.neutral',
        'link': 'colors.primary',
      },
      description: 'Button style variant determines the color scheme',
    },
    {
      propName: 'size',
      tokenCategories: ['spacing'],
      enumTokenMap: {
        'sm': 'spacing.sm',
        'default': 'spacing.md',
        'lg': 'spacing.lg',
        'icon': 'spacing.sm',
      },
      description: 'Button size affects padding and font size',
    },
    {
      propName: 'className',
      tokenCategories: ['colors', 'spacing', 'typography'],
      description: 'Additional styling via Tailwind classes for colors, spacing, and typography',
    },
  ],
  styleTokens: {
    colors: ['colors.primary', 'colors.error', 'colors.secondary'],
    spacing: ['spacing.sm', 'spacing.md', 'spacing.lg'],
  },
};

/**
 * Container 组件 Token 映射
 * @requirements 2.4
 */
export const CONTAINER_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Container',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['spacing', 'colors'],
      description: 'Use for padding (p-*), margin (m-*), gap, and background colors',
    },
  ],
  styleTokens: {
    spacing: ['spacing.md', 'spacing.lg', 'spacing.xl'],
    colors: ['colors.neutral'],
  },
};

/**
 * Row 组件 Token 映射 (水平 flex 容器)
 * @requirements 2.4
 */
export const ROW_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Row',
  propMappings: [
    {
      propName: 'gap',
      tokenCategories: ['spacing'],
      enumTokenMap: {
        'xs': 'spacing.xs',
        'sm': 'spacing.sm',
        'md': 'spacing.md',
        'lg': 'spacing.lg',
        'xl': 'spacing.xl',
      },
      description: 'Gap between child elements',
    },
    {
      propName: 'className',
      tokenCategories: ['spacing', 'colors'],
      description: 'Use for padding, margin, gap, and background colors',
    },
  ],
  styleTokens: {
    spacing: ['spacing.sm', 'spacing.md'],
  },
};

/**
 * Column 组件 Token 映射 (垂直 flex 容器)
 * @requirements 2.4
 */
export const COLUMN_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Column',
  propMappings: [
    {
      propName: 'gap',
      tokenCategories: ['spacing'],
      enumTokenMap: {
        'xs': 'spacing.xs',
        'sm': 'spacing.sm',
        'md': 'spacing.md',
        'lg': 'spacing.lg',
        'xl': 'spacing.xl',
      },
      description: 'Gap between child elements',
    },
    {
      propName: 'className',
      tokenCategories: ['spacing', 'colors'],
      description: 'Use for padding, margin, gap, and background colors',
    },
  ],
  styleTokens: {
    spacing: ['spacing.sm', 'spacing.md'],
  },
};

/**
 * Text 组件 Token 映射
 * @requirements 2.5
 */
export const TEXT_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Text',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['typography', 'colors'],
      description: 'Use for font size (text-*), font weight (font-*), and text colors',
    },
  ],
  styleTokens: {
    colors: ['colors.primary', 'colors.neutral', 'colors.error', 'colors.success'],
  },
};

/**
 * Label 组件 Token 映射
 * @requirements 2.5
 */
export const LABEL_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Label',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['typography', 'colors'],
      description: 'Use for font size (text-*), font weight (font-*), and text colors',
    },
  ],
  styleTokens: {
    colors: ['colors.neutral'],
  },
};


/**
 * Input 组件 Token 映射
 * @requirements 2.1
 */
export const INPUT_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Input',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['spacing', 'colors', 'radius'],
      description: 'Use for padding, border colors, and border radius',
    },
  ],
  styleTokens: {
    colors: ['colors.neutral', 'colors.primary', 'colors.error'],
    spacing: ['spacing.sm', 'spacing.md'],
  },
};

/**
 * Card 组件 Token 映射
 * @requirements 2.1
 */
export const CARD_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Card',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['spacing', 'colors', 'shadows', 'radius'],
      description: 'Use for padding, background colors, shadows, and border radius',
    },
  ],
  styleTokens: {
    spacing: ['spacing.md', 'spacing.lg'],
    colors: ['colors.neutral'],
  },
};

/**
 * CardHeader 组件 Token 映射
 * @requirements 2.1
 */
export const CARD_HEADER_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'CardHeader',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['spacing'],
      description: 'Use for padding and margin',
    },
  ],
  styleTokens: {
    spacing: ['spacing.md'],
  },
};

/**
 * CardTitle 组件 Token 映射
 * @requirements 2.1
 */
export const CARD_TITLE_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'CardTitle',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['typography', 'colors'],
      description: 'Use for font size, font weight, and text colors',
    },
  ],
};

/**
 * CardDescription 组件 Token 映射
 * @requirements 2.1
 */
export const CARD_DESCRIPTION_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'CardDescription',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['typography', 'colors'],
      description: 'Use for font size and muted text colors',
    },
  ],
  styleTokens: {
    colors: ['colors.neutral'],
  },
};

/**
 * CardContent 组件 Token 映射
 * @requirements 2.1
 */
export const CARD_CONTENT_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'CardContent',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['spacing'],
      description: 'Use for padding and gap',
    },
  ],
  styleTokens: {
    spacing: ['spacing.md', 'spacing.lg'],
  },
};

/**
 * CardFooter 组件 Token 映射
 * @requirements 2.1
 */
export const CARD_FOOTER_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'CardFooter',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['spacing'],
      description: 'Use for padding and gap',
    },
  ],
  styleTokens: {
    spacing: ['spacing.md'],
  },
};

/**
 * Badge 组件 Token 映射
 * @requirements 2.1
 */
export const BADGE_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Badge',
  propMappings: [
    {
      propName: 'variant',
      tokenCategories: ['colors'],
      enumTokenMap: {
        'default': 'colors.primary',
        'secondary': 'colors.secondary',
        'destructive': 'colors.error',
        'outline': 'colors.neutral',
      },
      description: 'Badge variant determines the color scheme',
    },
    {
      propName: 'className',
      tokenCategories: ['colors', 'typography', 'spacing'],
      description: 'Additional styling for colors, font size, and padding',
    },
  ],
  styleTokens: {
    colors: ['colors.primary', 'colors.secondary', 'colors.error', 'colors.success', 'colors.warning'],
  },
};

/**
 * Link 组件 Token 映射
 * @requirements 2.1
 */
export const LINK_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Link',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['colors', 'typography'],
      description: 'Use for link colors and text styling',
    },
  ],
  styleTokens: {
    colors: ['colors.primary', 'colors.secondary'],
  },
};

/**
 * Textarea 组件 Token 映射
 * @requirements 2.1
 */
export const TEXTAREA_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Textarea',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['spacing', 'colors', 'radius'],
      description: 'Use for padding, border colors, and border radius',
    },
  ],
  styleTokens: {
    colors: ['colors.neutral', 'colors.primary', 'colors.error'],
    spacing: ['spacing.sm', 'spacing.md'],
  },
};

/**
 * Table 组件 Token 映射
 * @requirements 2.1
 */
export const TABLE_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Table',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['spacing', 'colors'],
      description: 'Use for table styling, borders, and background colors',
    },
  ],
  styleTokens: {
    colors: ['colors.neutral'],
  },
};

/**
 * TableHeader 组件 Token 映射
 * @requirements 2.1
 */
export const TABLE_HEADER_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'TableHeader',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['colors', 'typography'],
      description: 'Use for header background and text styling',
    },
  ],
  styleTokens: {
    colors: ['colors.neutral'],
  },
};

/**
 * TableBody 组件 Token 映射
 * @requirements 2.1
 */
export const TABLE_BODY_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'TableBody',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['colors'],
      description: 'Use for body background colors',
    },
  ],
};

/**
 * TableRow 组件 Token 映射
 * @requirements 2.1
 */
export const TABLE_ROW_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'TableRow',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['colors', 'spacing'],
      description: 'Use for row background, hover states, and padding',
    },
  ],
  styleTokens: {
    colors: ['colors.neutral'],
  },
};

/**
 * TableHead 组件 Token 映射
 * @requirements 2.1
 */
export const TABLE_HEAD_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'TableHead',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['typography', 'spacing', 'colors'],
      description: 'Use for header cell text styling, padding, and colors',
    },
  ],
};

/**
 * TableCell 组件 Token 映射
 * @requirements 2.1
 */
export const TABLE_CELL_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'TableCell',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['typography', 'spacing', 'colors'],
      description: 'Use for cell text styling, padding, and colors',
    },
  ],
};

/**
 * TableFooter 组件 Token 映射
 * @requirements 2.1
 */
export const TABLE_FOOTER_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'TableFooter',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['colors', 'typography'],
      description: 'Use for footer background and text styling',
    },
  ],
  styleTokens: {
    colors: ['colors.neutral'],
  },
};

/**
 * TableCaption 组件 Token 映射
 * @requirements 2.1
 */
export const TABLE_CAPTION_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'TableCaption',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['typography', 'colors'],
      description: 'Use for caption text styling and colors',
    },
  ],
  styleTokens: {
    colors: ['colors.neutral'],
  },
};

/**
 * Heading 组件 Token 映射
 * @requirements 2.1
 */
export const HEADING_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Heading',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['typography', 'colors', 'spacing'],
      description: 'Use for heading font size, weight, colors, and margin',
    },
  ],
  styleTokens: {
    colors: ['colors.primary', 'colors.neutral'],
  },
};

/**
 * Image 组件 Token 映射
 * @requirements 2.1
 */
export const IMAGE_TOKEN_MAPPING: ComponentTokenMapping = {
  componentName: 'Image',
  propMappings: [
    {
      propName: 'className',
      tokenCategories: ['spacing', 'radius'],
      description: 'Use for margin, padding, and border radius',
    },
  ],
};

// ============================================================================
// 所有预设组件 Token 映射
// ============================================================================

/**
 * 所有预设组件 Token 映射数组
 */
export const ALL_COMPONENT_TOKEN_MAPPINGS: ComponentTokenMapping[] = [
  BUTTON_TOKEN_MAPPING,
  CONTAINER_TOKEN_MAPPING,
  ROW_TOKEN_MAPPING,
  COLUMN_TOKEN_MAPPING,
  TEXT_TOKEN_MAPPING,
  LABEL_TOKEN_MAPPING,
  INPUT_TOKEN_MAPPING,
  CARD_TOKEN_MAPPING,
  CARD_HEADER_TOKEN_MAPPING,
  CARD_TITLE_TOKEN_MAPPING,
  CARD_DESCRIPTION_TOKEN_MAPPING,
  CARD_CONTENT_TOKEN_MAPPING,
  CARD_FOOTER_TOKEN_MAPPING,
  BADGE_TOKEN_MAPPING,
  LINK_TOKEN_MAPPING,
  TEXTAREA_TOKEN_MAPPING,
  TABLE_TOKEN_MAPPING,
  TABLE_HEADER_TOKEN_MAPPING,
  TABLE_BODY_TOKEN_MAPPING,
  TABLE_ROW_TOKEN_MAPPING,
  TABLE_HEAD_TOKEN_MAPPING,
  TABLE_CELL_TOKEN_MAPPING,
  TABLE_FOOTER_TOKEN_MAPPING,
  TABLE_CAPTION_TOKEN_MAPPING,
  HEADING_TOKEN_MAPPING,
  IMAGE_TOKEN_MAPPING,
];

// ============================================================================
// 初始化默认注册表
// ============================================================================

/**
 * 初始化默认组件 Token 映射注册表
 * 注册所有预设的组件 Token 映射
 */
export function initializeDefaultComponentMappingRegistry(): void {
  defaultComponentMappingRegistry.clear();
  defaultComponentMappingRegistry.registerMappings(ALL_COMPONENT_TOKEN_MAPPINGS);
}

// 自动初始化默认注册表
initializeDefaultComponentMappingRegistry();
