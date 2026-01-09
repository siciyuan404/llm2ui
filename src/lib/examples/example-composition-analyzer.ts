/**
 * @file example-composition-analyzer.ts
 * @description 案例组成分析器，分析 UISchema 的组成结构，提取使用的组件和 Token
 * @module lib/examples/example-composition-analyzer
 * @requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import type { UISchema, UIComponent } from '../../types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Token 引用信息
 */
export interface TokenReference {
  /** Token 路径 */
  path: string;
  /** 使用位置描述 */
  usedIn: string;
}

/**
 * 案例组成分析结果
 */
export interface ExampleComposition {
  /** 案例 ID */
  exampleId: string;
  
  /** 使用的组件类型列表（去重） */
  usedComponents: string[];
  
  /** 使用的 Token 引用列表 */
  usedTokens: TokenReference[];
  
  /** 布局层级描述 */
  layoutHierarchy: string;
  
  /** 组成说明 */
  compositionNotes: string;
}

// ============================================================================
// Token 检测模式
// ============================================================================

/**
 * Tailwind 颜色类名模式
 */
const COLOR_CLASS_PATTERNS = [
  /\b(text|bg|border|ring|outline|shadow|accent|fill|stroke)-(primary|secondary|destructive|muted|accent|popover|card|foreground)/,
  /\b(text|bg|border|ring|outline|shadow|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(-\d{2,3})?/,
  /\b(text|bg|border)-(transparent|current|inherit)/,
];

/**
 * Tailwind 间距类名模式
 */
const SPACING_CLASS_PATTERNS = [
  /\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-(\d+|px|auto)/,
  /\b(w|h|min-w|min-h|max-w|max-h)-(\d+|full|screen|auto|fit|min|max)/,
  /\b(inset|top|right|bottom|left)-(\d+|px|auto|full)/,
];

/**
 * Tailwind 排版类名模式
 */
const TYPOGRAPHY_CLASS_PATTERNS = [
  /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
  /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,
  /\b(leading|tracking|line-clamp)-(\d+|none|tight|snug|normal|relaxed|loose)/,
];

/**
 * Tailwind 圆角类名模式
 */
const RADIUS_CLASS_PATTERNS = [
  /\brounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?/,
];

/**
 * Tailwind 阴影类名模式
 */
const SHADOW_CLASS_PATTERNS = [
  /\bshadow(-none|-sm|-md|-lg|-xl|-2xl|-inner)?/,
];

// ============================================================================
// ExampleCompositionAnalyzer 类
// ============================================================================

/**
 * 案例组成分析器
 */
export class ExampleCompositionAnalyzer {
  /**
   * 分析 UISchema 的组成
   */
  analyze(schema: UISchema, exampleId: string = ''): ExampleComposition {
    if (!schema || !schema.root) {
      return {
        exampleId,
        usedComponents: [],
        usedTokens: [],
        layoutHierarchy: '',
        compositionNotes: 'Invalid or empty schema',
      };
    }

    const usedComponents = this.extractComponents(schema.root);
    const usedTokens = this.extractTokenReferences(schema.root);
    const layoutHierarchy = this.generateLayoutHierarchy(schema.root);
    const compositionNotes = this.generateCompositionNotes(schema.root, usedComponents, usedTokens);

    return {
      exampleId,
      usedComponents,
      usedTokens,
      layoutHierarchy,
      compositionNotes,
    };
  }

  /**
   * 提取使用的组件类型（去重）
   */
  private extractComponents(node: UIComponent): string[] {
    const components = new Set<string>();
    
    this.traverseNode(node, (n) => {
      if (n.type) {
        components.add(n.type);
      }
    });
    
    return Array.from(components).sort();
  }

  /**
   * 提取使用的 Token 引用
   */
  private extractTokenReferences(node: UIComponent): TokenReference[] {
    const tokens: TokenReference[] = [];
    const seenTokens = new Set<string>();
    
    this.traverseNode(node, (n) => {
      const className = n.props?.className as string | undefined;
      if (className) {
        const extractedTokens = this.extractTokensFromClassName(className, n.type, n.id);
        for (const token of extractedTokens) {
          const key = `${token.path}:${token.usedIn}`;
          if (!seenTokens.has(key)) {
            seenTokens.add(key);
            tokens.push(token);
          }
        }
      }
      
      const variant = n.props?.variant as string | undefined;
      if (variant && n.type) {
        const tokenPath = this.mapVariantToToken(n.type, variant);
        if (tokenPath) {
          const usedIn = `${n.type} variant="${variant}"`;
          const key = `${tokenPath}:${usedIn}`;
          if (!seenTokens.has(key)) {
            seenTokens.add(key);
            tokens.push({ path: tokenPath, usedIn });
          }
        }
      }
      
      const gap = n.props?.gap as string | undefined;
      if (gap) {
        const tokenPath = `spacing.${gap}`;
        const usedIn = `${n.type || 'Component'} gap="${gap}"`;
        const key = `${tokenPath}:${usedIn}`;
        if (!seenTokens.has(key)) {
          seenTokens.add(key);
          tokens.push({ path: tokenPath, usedIn });
        }
      }
    });
    
    return tokens;
  }

  /**
   * 从 className 中提取 Token 引用
   */
  private extractTokensFromClassName(
    className: string,
    componentType?: string,
    componentId?: string
  ): TokenReference[] {
    const tokens: TokenReference[] = [];
    const location = componentType || componentId || 'Component';
    
    for (const pattern of COLOR_CLASS_PATTERNS) {
      const matches = className.match(new RegExp(pattern, 'g'));
      if (matches) {
        for (const match of matches) {
          tokens.push({
            path: `colors.${this.normalizeColorClass(match)}`,
            usedIn: `${location} className`,
          });
        }
      }
    }
    
    for (const pattern of SPACING_CLASS_PATTERNS) {
      const matches = className.match(new RegExp(pattern, 'g'));
      if (matches) {
        for (const match of matches) {
          tokens.push({
            path: `spacing.${this.normalizeSpacingClass(match)}`,
            usedIn: `${location} className`,
          });
        }
      }
    }
    
    for (const pattern of TYPOGRAPHY_CLASS_PATTERNS) {
      const matches = className.match(new RegExp(pattern, 'g'));
      if (matches) {
        for (const match of matches) {
          tokens.push({
            path: `typography.${this.normalizeTypographyClass(match)}`,
            usedIn: `${location} className`,
          });
        }
      }
    }
    
    for (const pattern of RADIUS_CLASS_PATTERNS) {
      const matches = className.match(new RegExp(pattern, 'g'));
      if (matches) {
        for (const match of matches) {
          tokens.push({
            path: `radius.${match}`,
            usedIn: `${location} className`,
          });
        }
      }
    }
    
    for (const pattern of SHADOW_CLASS_PATTERNS) {
      const matches = className.match(new RegExp(pattern, 'g'));
      if (matches) {
        for (const match of matches) {
          tokens.push({
            path: `shadows.${match}`,
            usedIn: `${location} className`,
          });
        }
      }
    }
    
    return tokens;
  }

  private normalizeColorClass(className: string): string {
    return className.replace(/^(text|bg|border|ring|outline|shadow|accent|fill|stroke)-/, '');
  }

  private normalizeSpacingClass(className: string): string {
    const match = className.match(/-([\d]+|px|auto|full|screen|fit|min|max)$/);
    return match ? match[1] : className;
  }

  private normalizeTypographyClass(className: string): string {
    if (className.startsWith('text-')) {
      return `fontSize.${className.replace('text-', '')}`;
    }
    if (className.startsWith('font-')) {
      return `fontWeight.${className.replace('font-', '')}`;
    }
    return className;
  }

  private mapVariantToToken(componentType: string, variant: string): string | null {
    const variantTokenMap: Record<string, Record<string, string>> = {
      Button: {
        default: 'colors.primary',
        destructive: 'colors.error',
        outline: 'colors.secondary',
        secondary: 'colors.secondary',
        ghost: 'colors.neutral',
        link: 'colors.primary',
      },
      Badge: {
        default: 'colors.primary',
        secondary: 'colors.secondary',
        destructive: 'colors.error',
        outline: 'colors.neutral',
      },
    };
    
    return variantTokenMap[componentType]?.[variant] || null;
  }

  private generateLayoutHierarchy(node: UIComponent, depth: number = 0, maxDepth: number = 3): string {
    if (depth > maxDepth) {
      return '...';
    }
    
    const type = node.type || 'Unknown';
    
    if (!node.children || node.children.length === 0) {
      return type;
    }
    
    if (depth === maxDepth) {
      return `${type} > [${node.children.length} children]`;
    }
    
    const childTypes = node.children.map(child => 
      this.generateLayoutHierarchy(child, depth + 1, maxDepth)
    );
    
    const uniqueChildTypes = [...new Set(childTypes)];
    if (uniqueChildTypes.length === 1 && node.children.length > 1) {
      return `${type} > [${childTypes[0]}]*${node.children.length}`;
    }
    
    if (childTypes.length > 4) {
      const shown = childTypes.slice(0, 3).join(', ');
      return `${type} > [${shown}, +${childTypes.length - 3} more]`;
    }
    
    return `${type} > [${childTypes.join(', ')}]`;
  }

  private generateCompositionNotes(
    node: UIComponent,
    usedComponents: string[],
    usedTokens: TokenReference[]
  ): string {
    const notes: string[] = [];
    
    const rootType = node.type || 'Unknown';
    notes.push(`Root component: ${rootType}`);
    
    const componentCount = usedComponents.length;
    notes.push(`Uses ${componentCount} component type${componentCount !== 1 ? 's' : ''}: ${usedComponents.join(', ')}`);
    
    if (usedTokens.length > 0) {
      const colorTokens = usedTokens.filter(t => t.path.startsWith('colors.'));
      const spacingTokens = usedTokens.filter(t => t.path.startsWith('spacing.'));
      const typographyTokens = usedTokens.filter(t => t.path.startsWith('typography.'));
      
      if (colorTokens.length > 0) {
        const uniqueColors = [...new Set(colorTokens.map(t => t.path))];
        notes.push(`Color tokens: ${uniqueColors.slice(0, 5).join(', ')}${uniqueColors.length > 5 ? ` (+${uniqueColors.length - 5} more)` : ''}`);
      }
      
      if (spacingTokens.length > 0) {
        const uniqueSpacing = [...new Set(spacingTokens.map(t => t.path))];
        notes.push(`Spacing tokens: ${uniqueSpacing.slice(0, 5).join(', ')}${uniqueSpacing.length > 5 ? ` (+${uniqueSpacing.length - 5} more)` : ''}`);
      }
      
      if (typographyTokens.length > 0) {
        const uniqueTypography = [...new Set(typographyTokens.map(t => t.path))];
        notes.push(`Typography tokens: ${uniqueTypography.slice(0, 5).join(', ')}${uniqueTypography.length > 5 ? ` (+${uniqueTypography.length - 5} more)` : ''}`);
      }
    }
    
    const layoutPattern = this.detectLayoutPattern(node, usedComponents);
    if (layoutPattern) {
      notes.push(`Layout pattern: ${layoutPattern}`);
    }
    
    return notes.join('. ');
  }

  private detectLayoutPattern(_node: UIComponent, usedComponents: string[]): string | null {
    const hasCard = usedComponents.includes('Card');
    const hasInput = usedComponents.includes('Input');
    const hasButton = usedComponents.includes('Button');
    const hasLabel = usedComponents.includes('Label');
    const hasTable = usedComponents.includes('Table');
    const hasContainer = usedComponents.includes('Container');
    
    if (hasCard && hasInput && hasButton && hasLabel) {
      return 'Form (Card with inputs and submit button)';
    }
    
    if (hasTable) {
      return 'Data Table';
    }
    
    if (hasContainer && hasButton && !hasInput && !hasCard) {
      return 'Navigation';
    }
    
    if (hasCard && !hasInput) {
      return 'Card Layout';
    }
    
    return null;
  }

  private traverseNode(node: UIComponent, callback: (node: UIComponent) => void): void {
    callback(node);
    
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.traverseNode(child, callback);
      }
    }
  }

  /**
   * 格式化为 LLM 可读格式
   */
  formatForLLM(composition: ExampleComposition): string {
    const lines: string[] = [];
    
    if (composition.exampleId) {
      lines.push(`### Example: ${composition.exampleId}`);
    }
    
    lines.push('');
    lines.push('**Components Used:**');
    if (composition.usedComponents.length > 0) {
      lines.push(composition.usedComponents.map(c => `- ${c}`).join('\n'));
    } else {
      lines.push('- None');
    }
    
    lines.push('');
    lines.push('**Tokens Used:**');
    if (composition.usedTokens.length > 0) {
      const byCategory: Record<string, TokenReference[]> = {};
      for (const token of composition.usedTokens) {
        const category = token.path.split('.')[0];
        if (!byCategory[category]) {
          byCategory[category] = [];
        }
        byCategory[category].push(token);
      }
      
      for (const [category, tokens] of Object.entries(byCategory)) {
        lines.push(`- ${category}:`);
        const uniquePaths = [...new Set(tokens.map(t => t.path))];
        for (const path of uniquePaths.slice(0, 5)) {
          lines.push(`  - ${path}`);
        }
        if (uniquePaths.length > 5) {
          lines.push(`  - (+${uniquePaths.length - 5} more)`);
        }
      }
    } else {
      lines.push('- None detected');
    }
    
    lines.push('');
    lines.push('**Layout Hierarchy:**');
    lines.push(composition.layoutHierarchy || 'N/A');
    
    lines.push('');
    lines.push('**Composition Notes:**');
    lines.push(composition.compositionNotes || 'N/A');
    
    return lines.join('\n');
  }

  /**
   * 批量分析多个案例
   */
  analyzeMultiple(examples: Array<{ id: string; schema: UISchema }>): ExampleComposition[] {
    return examples.map(example => this.analyze(example.schema, example.id));
  }
}

// ============================================================================
// 默认实例
// ============================================================================

export const defaultExampleCompositionAnalyzer = new ExampleCompositionAnalyzer();

// ============================================================================
// 便捷函数
// ============================================================================

export function analyzeExampleComposition(schema: UISchema, exampleId: string = ''): ExampleComposition {
  return defaultExampleCompositionAnalyzer.analyze(schema, exampleId);
}

export function formatCompositionForLLM(composition: ExampleComposition): string {
  return defaultExampleCompositionAnalyzer.formatForLLM(composition);
}

// ============================================================================
// 预设案例组成分析缓存
// ============================================================================

const presetCompositionCache = new Map<string, ExampleComposition>();

export function getPresetComposition(exampleId: string): ExampleComposition | undefined {
  return presetCompositionCache.get(exampleId);
}

export function getAllPresetCompositions(): ExampleComposition[] {
  return Array.from(presetCompositionCache.values());
}

export function isPresetCompositionsInitialized(): boolean {
  return presetCompositionCache.size > 0;
}

export function initializePresetCompositions(
  presetExamples: Array<{ id: string; schema: UISchema }>
): void {
  presetCompositionCache.clear();
  
  for (const example of presetExamples) {
    const composition = defaultExampleCompositionAnalyzer.analyze(example.schema, example.id);
    presetCompositionCache.set(example.id, composition);
  }
}

export function clearPresetCompositions(): void {
  presetCompositionCache.clear();
}
