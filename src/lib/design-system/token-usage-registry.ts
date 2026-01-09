/**
 * @file token-usage-registry.ts
 * @description Token 使用映射注册表，定义 Token 在哪些 Components 的哪些 Props 中可用
 * @module lib/design-system/token-usage-registry
 * @requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Token 类别
 */
export type TokenCategory = 'colors' | 'spacing' | 'typography' | 'shadows' | 'radius';

/**
 * Token 使用场景定义
 */
export interface TokenUsage {
  /** Token 路径，如 "colors.primary.500" */
  tokenPath: string;
  
  /** Token 类别 */
  category: TokenCategory;
  
  /** 适用的组件类型列表 */
  applicableComponents: string[];
  
  /** 适用的属性名称列表 */
  applicableProps: string[];
  
  /** 使用示例代码 */
  usageExample: string;
  
  /** 使用说明 */
  description: string;
}

/**
 * Token 使用映射表
 */
export interface TokenUsageMap {
  /** 按 Token 类别分组的使用映射 */
  colors: TokenUsage[];
  spacing: TokenUsage[];
  typography: TokenUsage[];
  shadows: TokenUsage[];
  radius: TokenUsage[];
}

// ============================================================================
// TokenUsageRegistry 类
// ============================================================================

/**
 * Token 使用映射注册表
 * 
 * 管理所有 Token 使用映射，提供注册、查询和格式化功能。
 */
export class TokenUsageRegistry {
  private usageMap: TokenUsageMap;
  private usageByPath: Map<string, TokenUsage>;

  constructor() {
    this.usageMap = {
      colors: [],
      spacing: [],
      typography: [],
      shadows: [],
      radius: [],
    };
    this.usageByPath = new Map();
  }

  /**
   * 注册 Token 使用场景
   * @param usage Token 使用场景定义
   */
  registerUsage(usage: TokenUsage): void {
    // 验证必填字段
    if (!usage.tokenPath || !usage.category) {
      throw new Error('TokenUsage must have tokenPath and category');
    }
    if (!usage.applicableComponents || usage.applicableComponents.length === 0) {
      throw new Error('TokenUsage must have at least one applicable component');
    }
    if (!usage.applicableProps || usage.applicableProps.length === 0) {
      throw new Error('TokenUsage must have at least one applicable prop');
    }

    // 添加到类别数组
    this.usageMap[usage.category].push(usage);
    
    // 添加到路径索引
    this.usageByPath.set(usage.tokenPath, usage);
  }

  /**
   * 批量注册 Token 使用场景
   * @param usages Token 使用场景数组
   */
  registerUsages(usages: TokenUsage[]): void {
    for (const usage of usages) {
      this.registerUsage(usage);
    }
  }

  /**
   * 获取指定 Token 的使用场景
   * @param tokenPath Token 路径
   * @returns Token 使用场景，如果不存在则返回 undefined
   */
  getUsage(tokenPath: string): TokenUsage | undefined {
    return this.usageByPath.get(tokenPath);
  }

  /**
   * 获取指定类别的所有 Token 使用场景
   * @param category Token 类别
   * @returns Token 使用场景数组
   */
  getUsagesByCategory(category: TokenCategory): TokenUsage[] {
    return [...this.usageMap[category]];
  }

  /**
   * 获取适用于指定组件的所有 Token
   * @param componentName 组件名称
   * @returns Token 使用场景数组
   */
  getTokensForComponent(componentName: string): TokenUsage[] {
    const result: TokenUsage[] = [];
    
    for (const category of Object.keys(this.usageMap) as TokenCategory[]) {
      for (const usage of this.usageMap[category]) {
        if (usage.applicableComponents.includes(componentName)) {
          result.push(usage);
        }
      }
    }
    
    return result;
  }

  /**
   * 获取适用于指定属性的所有 Token
   * @param propName 属性名称
   * @returns Token 使用场景数组
   */
  getTokensForProp(propName: string): TokenUsage[] {
    const result: TokenUsage[] = [];
    
    for (const category of Object.keys(this.usageMap) as TokenCategory[]) {
      for (const usage of this.usageMap[category]) {
        if (usage.applicableProps.includes(propName)) {
          result.push(usage);
        }
      }
    }
    
    return result;
  }

  /**
   * 获取完整的 Token 使用映射表
   * @returns Token 使用映射表
   */
  getUsageMap(): TokenUsageMap {
    return {
      colors: [...this.usageMap.colors],
      spacing: [...this.usageMap.spacing],
      typography: [...this.usageMap.typography],
      shadows: [...this.usageMap.shadows],
      radius: [...this.usageMap.radius],
    };
  }

  /**
   * 获取所有已注册的 Token 路径
   * @returns Token 路径数组
   */
  getAllTokenPaths(): string[] {
    return Array.from(this.usageByPath.keys());
  }

  /**
   * 检查是否有指定类别的 Token
   * @param category Token 类别
   * @returns 是否有该类别的 Token
   */
  hasCategory(category: TokenCategory): boolean {
    return this.usageMap[category].length > 0;
  }

  /**
   * 格式化为 LLM 可读格式
   * 
   * 生成格式：
   * ```
   * ## Token Usage Guide
   * 
   * ### Color Tokens
   * - **colors.primary**: Use for Button (variant="default"), Link, primary actions
   *   - Components: Button, Link, Text, Badge
   *   - Props: variant, className
   *   - Example: <Button variant="default">Primary</Button>
   * 
   * ### Spacing Tokens
   * - **spacing.md**: Use for Container padding, Row/Column gap
   *   - Components: Container, Row, Column, Card
   *   - Props: gap, className
   *   - Example: <Container className="p-4">...</Container>
   * ```
   * 
   * @returns LLM 可读的格式化字符串
   */
  formatForLLM(): string {
    const sections: string[] = ['## Token Usage Guide'];
    
    // 格式化颜色 Token
    if (this.usageMap.colors.length > 0) {
      sections.push('');
      sections.push('### Color Tokens');
      for (const usage of this.usageMap.colors) {
        sections.push(this.formatUsageForLLM(usage));
      }
    }
    
    // 格式化间距 Token
    if (this.usageMap.spacing.length > 0) {
      sections.push('');
      sections.push('### Spacing Tokens');
      for (const usage of this.usageMap.spacing) {
        sections.push(this.formatUsageForLLM(usage));
      }
    }
    
    // 格式化排版 Token
    if (this.usageMap.typography.length > 0) {
      sections.push('');
      sections.push('### Typography Tokens');
      for (const usage of this.usageMap.typography) {
        sections.push(this.formatUsageForLLM(usage));
      }
    }
    
    // 格式化阴影 Token
    if (this.usageMap.shadows.length > 0) {
      sections.push('');
      sections.push('### Shadow Tokens');
      for (const usage of this.usageMap.shadows) {
        sections.push(this.formatUsageForLLM(usage));
      }
    }
    
    // 格式化圆角 Token
    if (this.usageMap.radius.length > 0) {
      sections.push('');
      sections.push('### Border Radius Tokens');
      for (const usage of this.usageMap.radius) {
        sections.push(this.formatUsageForLLM(usage));
      }
    }
    
    return sections.join('\n');
  }

  /**
   * 格式化单个 Token 使用场景为 LLM 可读格式
   * @param usage Token 使用场景
   * @returns 格式化字符串
   */
  private formatUsageForLLM(usage: TokenUsage): string {
    const lines: string[] = [];
    lines.push(`- **${usage.tokenPath}**: ${usage.description}`);
    lines.push(`  - Components: ${usage.applicableComponents.join(', ')}`);
    lines.push(`  - Props: ${usage.applicableProps.join(', ')}`);
    if (usage.usageExample) {
      lines.push(`  - Example: ${usage.usageExample}`);
    }
    return lines.join('\n');
  }

  /**
   * 清空所有注册的 Token 使用场景
   */
  clear(): void {
    this.usageMap = {
      colors: [],
      spacing: [],
      typography: [],
      shadows: [],
      radius: [],
    };
    this.usageByPath.clear();
  }
}

// ============================================================================
// 默认实例和预设 Token 使用场景
// ============================================================================

/**
 * 默认 Token 使用注册表实例
 */
export const defaultTokenUsageRegistry = new TokenUsageRegistry();


// ============================================================================
// 预设颜色 Token 使用场景
// ============================================================================

/**
 * 颜色 Token 使用场景预设
 * @requirements 1.3
 */
export const COLOR_TOKEN_USAGES: TokenUsage[] = [
  {
    tokenPath: 'colors.primary',
    category: 'colors',
    applicableComponents: ['Button', 'Link', 'Text', 'Badge', 'Input'],
    applicableProps: ['variant', 'className'],
    usageExample: '<Button variant="default">Primary Action</Button>',
    description: 'Use for primary actions, default buttons, and important links',
  },
  {
    tokenPath: 'colors.secondary',
    category: 'colors',
    applicableComponents: ['Button', 'Link', 'Text', 'Badge'],
    applicableProps: ['variant', 'className'],
    usageExample: '<Button variant="secondary">Secondary Action</Button>',
    description: 'Use for secondary actions and less prominent elements',
  },
  {
    tokenPath: 'colors.error',
    category: 'colors',
    applicableComponents: ['Button', 'Text', 'Badge', 'Input'],
    applicableProps: ['variant', 'className'],
    usageExample: '<Button variant="destructive">Delete</Button>',
    description: 'Use for error messages, destructive actions, and validation errors',
  },
  {
    tokenPath: 'colors.success',
    category: 'colors',
    applicableComponents: ['Text', 'Badge'],
    applicableProps: ['className'],
    usageExample: '<Text className="text-green-500">Success!</Text>',
    description: 'Use for success messages and positive feedback',
  },
  {
    tokenPath: 'colors.warning',
    category: 'colors',
    applicableComponents: ['Text', 'Badge'],
    applicableProps: ['className'],
    usageExample: '<Badge className="bg-yellow-500">Warning</Badge>',
    description: 'Use for warning messages and cautionary information',
  },
  {
    tokenPath: 'colors.neutral',
    category: 'colors',
    applicableComponents: ['Container', 'Card', 'Text', 'Label'],
    applicableProps: ['className'],
    usageExample: '<Card className="bg-neutral-100">Content</Card>',
    description: 'Use for backgrounds, borders, and muted text',
  },
];

// ============================================================================
// 预设间距 Token 使用场景
// ============================================================================

/**
 * 间距 Token 使用场景预设
 * @requirements 1.4
 */
export const SPACING_TOKEN_USAGES: TokenUsage[] = [
  {
    tokenPath: 'spacing.xs',
    category: 'spacing',
    applicableComponents: ['Container', 'Row', 'Column', 'Card', 'Button'],
    applicableProps: ['gap', 'className'],
    usageExample: '<Row gap="xs">...</Row>',
    description: 'Use for tight spacing (4px), icon gaps, inline elements',
  },
  {
    tokenPath: 'spacing.sm',
    category: 'spacing',
    applicableComponents: ['Container', 'Row', 'Column', 'Card', 'Button'],
    applicableProps: ['gap', 'className'],
    usageExample: '<Column gap="sm">...</Column>',
    description: 'Use for small spacing (8px), form field gaps, compact layouts',
  },
  {
    tokenPath: 'spacing.md',
    category: 'spacing',
    applicableComponents: ['Container', 'Row', 'Column', 'Card'],
    applicableProps: ['gap', 'className'],
    usageExample: '<Container className="p-4">...</Container>',
    description: 'Use for medium spacing (16px), standard padding, section gaps',
  },
  {
    tokenPath: 'spacing.lg',
    category: 'spacing',
    applicableComponents: ['Container', 'Row', 'Column', 'Card'],
    applicableProps: ['gap', 'className'],
    usageExample: '<Card className="p-6">...</Card>',
    description: 'Use for large spacing (24px), card padding, major section gaps',
  },
  {
    tokenPath: 'spacing.xl',
    category: 'spacing',
    applicableComponents: ['Container', 'Row', 'Column'],
    applicableProps: ['gap', 'className'],
    usageExample: '<Container className="p-8">...</Container>',
    description: 'Use for extra large spacing (32px), page margins, hero sections',
  },
];

// ============================================================================
// 预设排版 Token 使用场景
// ============================================================================

/**
 * 排版 Token 使用场景预设
 * @requirements 1.5
 */
export const TYPOGRAPHY_TOKEN_USAGES: TokenUsage[] = [
  {
    tokenPath: 'typography.fontSize.xs',
    category: 'typography',
    applicableComponents: ['Text', 'Label', 'Badge'],
    applicableProps: ['className'],
    usageExample: '<Text className="text-xs">Small text</Text>',
    description: 'Use for captions, footnotes, and helper text (12px)',
  },
  {
    tokenPath: 'typography.fontSize.sm',
    category: 'typography',
    applicableComponents: ['Text', 'Label', 'Button'],
    applicableProps: ['className'],
    usageExample: '<Label className="text-sm">Field Label</Label>',
    description: 'Use for labels, secondary text, and small buttons (14px)',
  },
  {
    tokenPath: 'typography.fontSize.base',
    category: 'typography',
    applicableComponents: ['Text', 'Label', 'Button', 'Input'],
    applicableProps: ['className'],
    usageExample: '<Text className="text-base">Body text</Text>',
    description: 'Use for body text and default content (16px)',
  },
  {
    tokenPath: 'typography.fontSize.lg',
    category: 'typography',
    applicableComponents: ['Text', 'Heading'],
    applicableProps: ['className'],
    usageExample: '<Text className="text-lg">Large text</Text>',
    description: 'Use for emphasized text and small headings (18px)',
  },
  {
    tokenPath: 'typography.fontSize.xl',
    category: 'typography',
    applicableComponents: ['Text', 'Heading'],
    applicableProps: ['className'],
    usageExample: '<Heading className="text-xl">Section Title</Heading>',
    description: 'Use for section headings (20px)',
  },
  {
    tokenPath: 'typography.fontSize.2xl',
    category: 'typography',
    applicableComponents: ['Text', 'Heading'],
    applicableProps: ['className'],
    usageExample: '<Heading className="text-2xl">Page Title</Heading>',
    description: 'Use for page titles and major headings (24px)',
  },
  {
    tokenPath: 'typography.fontWeight.normal',
    category: 'typography',
    applicableComponents: ['Text', 'Label'],
    applicableProps: ['className'],
    usageExample: '<Text className="font-normal">Regular text</Text>',
    description: 'Use for regular body text (400)',
  },
  {
    tokenPath: 'typography.fontWeight.medium',
    category: 'typography',
    applicableComponents: ['Text', 'Label', 'Button'],
    applicableProps: ['className'],
    usageExample: '<Label className="font-medium">Label</Label>',
    description: 'Use for labels and slightly emphasized text (500)',
  },
  {
    tokenPath: 'typography.fontWeight.semibold',
    category: 'typography',
    applicableComponents: ['Text', 'Heading', 'Button'],
    applicableProps: ['className'],
    usageExample: '<Text className="font-semibold">Important</Text>',
    description: 'Use for important text and subheadings (600)',
  },
  {
    tokenPath: 'typography.fontWeight.bold',
    category: 'typography',
    applicableComponents: ['Text', 'Heading'],
    applicableProps: ['className'],
    usageExample: '<Heading className="font-bold">Bold Heading</Heading>',
    description: 'Use for headings and strong emphasis (700)',
  },
];

// ============================================================================
// 初始化默认注册表
// ============================================================================

/**
 * 初始化默认 Token 使用注册表
 * 注册所有预设的 Token 使用场景
 */
export function initializeDefaultTokenUsageRegistry(): void {
  defaultTokenUsageRegistry.clear();
  defaultTokenUsageRegistry.registerUsages(COLOR_TOKEN_USAGES);
  defaultTokenUsageRegistry.registerUsages(SPACING_TOKEN_USAGES);
  defaultTokenUsageRegistry.registerUsages(TYPOGRAPHY_TOKEN_USAGES);
}

// 自动初始化默认注册表
initializeDefaultTokenUsageRegistry();
