/**
 * @file constraint-injector.ts
 * @description 约束注入器模块，将设计约束注入到 LLM 提示词中
 * @module lib/design-system/constraint-injector
 * @requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import type { DesignTokens, ScreenSize } from './design-tokens';
import { formatTokensForLLM } from './design-tokens';
import type { ComponentCatalog, ComponentMetadata } from '../core/component-catalog';
import type { ExampleMetadata } from '../examples/preset-examples';
import type { TokenUsageMap } from './token-usage-registry';
import type { ComponentTokenMapping } from './component-mapping-registry';
import type { ExampleComposition } from '../examples/example-composition-analyzer';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 组成模式定义
 * @requirements 4.3
 */
export interface CompositionPattern {
  /** 模式名称 */
  name: string;
  /** 模式描述 */
  description: string;
  /** 组件层级结构 */
  structure: string;
  /** 使用说明 */
  usage: string;
  /** 示例 */
  example?: string;
}

/**
 * 约束注入配置
 * @requirements 4.1
 */
export interface ConstraintInjectionConfig {
  /** 设计令牌 */
  designTokens: DesignTokens;
  /** 组件目录 */
  catalog: ComponentCatalog;
  /** 目标屏幕尺寸 */
  targetScreenSize?: ScreenSize;
  /** 相关案例 (最多 3 个) */
  relevantExamples?: ExampleMetadata[];
  /** 是否包含完整 props schema */
  includeFullPropsSchema?: boolean;
  /** Token 使用映射 @requirements 4.1 */
  tokenUsageMap?: TokenUsageMap;
  /** 组件 Token 映射 @requirements 4.1 */
  componentTokenMappings?: ComponentTokenMapping[];
  /** 是否包含组成模式 @requirements 4.1 */
  includeCompositionPatterns?: boolean;
  /** 案例组成分析 @requirements 4.6 */
  exampleCompositions?: Map<string, ExampleComposition>;
}


// ============================================================================
// 缓存管理
// ============================================================================

/** 约束字符串缓存 */
const constraintCache = new Map<string, string>();

/**
 * 生成缓存键
 * @requirements 4.5
 */
function generateCacheKey(config: ConstraintInjectionConfig): string {
  const tokenVersion = generateTokenVersion(config.designTokens);
  const componentCount = config.catalog.getValidTypes().length;
  const exampleIds = (config.relevantExamples || []).map(e => e.id).sort().join(',');
  const hasTokenUsageMap = !!config.tokenUsageMap && (
    config.tokenUsageMap.colors.length > 0 ||
    config.tokenUsageMap.spacing.length > 0 ||
    config.tokenUsageMap.typography.length > 0
  );
  const hasComponentMappings = !!config.componentTokenMappings && config.componentTokenMappings.length > 0;
  const includeCompositionPatterns = config.includeCompositionPatterns || false;
  const hasExampleCompositions = !!config.exampleCompositions && config.exampleCompositions.size > 0;
  
  return `${tokenVersion}:${componentCount}:${config.targetScreenSize || 'none'}:${exampleIds}:${config.includeFullPropsSchema || false}:${hasTokenUsageMap}:${hasComponentMappings}:${includeCompositionPatterns}:${hasExampleCompositions}`;
}

function generateTokenVersion(tokens: DesignTokens): string {
  const colorKeys = Object.keys(tokens.colors).join(',');
  const spacingKeys = Object.keys(tokens.spacing).join(',');
  return `${colorKeys}:${spacingKeys}`;
}

/** 清除约束缓存 */
export function clearConstraintCache(): void {
  constraintCache.clear();
}

/** 获取缓存的约束字符串 */
export function getCachedConstraints(config: ConstraintInjectionConfig): string | undefined {
  const cacheKey = generateCacheKey(config);
  return constraintCache.get(cacheKey);
}

// ============================================================================
// 基础格式化函数
// ============================================================================

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatPropType(schema: { type?: string; enum?: unknown[] }): string {
  if (schema.enum && Array.isArray(schema.enum)) {
    return schema.enum.map(v => String(v)).join('|');
  }
  return schema.type || 'any';
}

function formatComponentProps(component: ComponentMetadata, includeFullSchema: boolean): string {
  const propsSchema = component.propsSchema;
  if (!propsSchema || Object.keys(propsSchema).length === 0) return '';
  
  const propEntries = Object.entries(propsSchema);
  
  if (includeFullSchema) {
    return propEntries.map(([name, schema]) => `${name} (${formatPropType(schema)})`).join(', ');
  } else {
    return propEntries.map(([name, schema]) => {
      if (schema.enum && Array.isArray(schema.enum)) {
        return `${name} (${schema.enum.join('|')})`;
      }
      return name;
    }).join(', ');
  }
}

function formatComponentsForLLM(catalog: ComponentCatalog, includeFullPropsSchema: boolean = false): string {
  const byCategory = catalog.getByCategory();
  const sections: string[] = ['## Available Components'];
  
  for (const [category, components] of Object.entries(byCategory)) {
    sections.push(`\n### ${capitalizeFirst(category)}`);
    for (const component of components) {
      const propsStr = formatComponentProps(component, includeFullPropsSchema);
      sections.push(`- **${component.name}**: ${component.description || 'No description'}`);
      if (propsStr) sections.push(`  Props: ${propsStr}`);
    }
  }
  
  return sections.join('\n');
}

function formatExamplesForLLM(examples: ExampleMetadata[]): string {
  if (!examples || examples.length === 0) return '';
  
  const sections: string[] = ['## Reference Examples'];
  const limitedExamples = examples.slice(0, 3);
  
  for (let i = 0; i < limitedExamples.length; i++) {
    const example = limitedExamples[i];
    sections.push(`\n### Example ${i + 1}: ${example.title}`);
    sections.push(`Description: ${example.description}`);
    sections.push(`Category: ${example.category}`);
    sections.push(`Tags: ${example.tags.join(', ')}`);
    sections.push('```json');
    sections.push(JSON.stringify(example.schema, null, 2));
    sections.push('```');
  }
  
  return sections.join('\n');
}

function formatResponsiveGuidelines(targetScreenSize: ScreenSize, breakpoints: { mobile: number; tablet: number; desktop: number }): string {
  const guidelines: string[] = ['## Responsive Guidelines'];
  guidelines.push(`\nTarget Screen Size: **${targetScreenSize}**`);
  
  switch (targetScreenSize) {
    case 'mobile':
      guidelines.push(`- Width: < ${breakpoints.mobile}px`);
      guidelines.push('- Use single column layouts');
      guidelines.push('- Prioritize touch-friendly interactions');
      guidelines.push('- Use larger tap targets (min 44px)');
      guidelines.push('- Consider hiding non-essential elements');
      break;
    case 'tablet':
      guidelines.push(`- Width: ${breakpoints.mobile}px - ${breakpoints.tablet - 1}px`);
      guidelines.push('- Use 2-column layouts where appropriate');
      guidelines.push('- Balance between mobile and desktop patterns');
      guidelines.push('- Consider collapsible sidebars');
      break;
    case 'desktop':
      guidelines.push(`- Width: >= ${breakpoints.tablet}px`);
      guidelines.push('- Use multi-column layouts');
      guidelines.push('- Show full navigation and sidebars');
      guidelines.push('- Utilize available screen space');
      break;
  }
  
  return guidelines.join('\n');
}


// ============================================================================
// 增强格式化函数
// ============================================================================

/** 格式化 Token 使用指南 @requirements 4.2 */
function formatTokenUsageGuideForLLM(tokenUsageMap: TokenUsageMap): string {
  const sections: string[] = ['## Token Usage Guide'];
  
  if (tokenUsageMap.colors.length > 0) {
    sections.push('');
    sections.push('### Color Tokens');
    for (const usage of tokenUsageMap.colors) {
      sections.push(`- **${usage.tokenPath}**: ${usage.description}`);
      sections.push(`  - Components: ${usage.applicableComponents.join(', ')}`);
      sections.push(`  - Props: ${usage.applicableProps.join(', ')}`);
    }
  }
  
  if (tokenUsageMap.spacing.length > 0) {
    sections.push('');
    sections.push('### Spacing Tokens');
    for (const usage of tokenUsageMap.spacing) {
      sections.push(`- **${usage.tokenPath}**: ${usage.description}`);
      sections.push(`  - Components: ${usage.applicableComponents.join(', ')}`);
      sections.push(`  - Props: ${usage.applicableProps.join(', ')}`);
    }
  }
  
  if (tokenUsageMap.typography.length > 0) {
    sections.push('');
    sections.push('### Typography Tokens');
    for (const usage of tokenUsageMap.typography) {
      sections.push(`- **${usage.tokenPath}**: ${usage.description}`);
      sections.push(`  - Components: ${usage.applicableComponents.join(', ')}`);
      sections.push(`  - Props: ${usage.applicableProps.join(', ')}`);
    }
  }
  
  if (tokenUsageMap.shadows.length > 0) {
    sections.push('');
    sections.push('### Shadow Tokens');
    for (const usage of tokenUsageMap.shadows) {
      sections.push(`- **${usage.tokenPath}**: ${usage.description}`);
      sections.push(`  - Components: ${usage.applicableComponents.join(', ')}`);
      sections.push(`  - Props: ${usage.applicableProps.join(', ')}`);
    }
  }
  
  if (tokenUsageMap.radius.length > 0) {
    sections.push('');
    sections.push('### Border Radius Tokens');
    for (const usage of tokenUsageMap.radius) {
      sections.push(`- **${usage.tokenPath}**: ${usage.description}`);
      sections.push(`  - Components: ${usage.applicableComponents.join(', ')}`);
      sections.push(`  - Props: ${usage.applicableProps.join(', ')}`);
    }
  }
  
  return sections.join('\n');
}

/** 格式化组件 Token 映射 */
function formatComponentMappingsForLLM(mappings: ComponentTokenMapping[]): string {
  if (!mappings || mappings.length === 0) return '';
  
  const sections: string[] = ['## Component Token Mappings'];
  const sortedMappings = [...mappings].sort((a, b) => a.componentName.localeCompare(b.componentName));
  
  for (const mapping of sortedMappings) {
    sections.push('');
    sections.push(`### ${mapping.componentName}`);
    
    for (const propMapping of mapping.propMappings) {
      const categories = propMapping.tokenCategories.join(', ');
      sections.push(`- **${propMapping.propName}** → ${categories}`);
      
      if (propMapping.enumTokenMap && Object.keys(propMapping.enumTokenMap).length > 0) {
        for (const [enumValue, tokenRef] of Object.entries(propMapping.enumTokenMap)) {
          sections.push(`  - ${enumValue} → ${tokenRef}`);
        }
      }
      sections.push(`  - Description: ${propMapping.description}`);
    }
    
    if (mapping.styleTokens) {
      if (mapping.styleTokens.colors?.length) {
        sections.push(`- Recommended colors: ${mapping.styleTokens.colors.join(', ')}`);
      }
      if (mapping.styleTokens.spacing?.length) {
        sections.push(`- Recommended spacing: ${mapping.styleTokens.spacing.join(', ')}`);
      }
    }
  }
  
  return sections.join('\n');
}

/** 预设组成模式 @requirements 4.3 */
export const DEFAULT_COMPOSITION_PATTERNS: CompositionPattern[] = [
  {
    name: 'Form Pattern',
    description: 'Standard form layout with labeled inputs and submit button',
    structure: 'Card > Column > [Label + Input]* > Button',
    usage: 'Use Card as container with spacing.lg padding. Use Column with spacing.md gap. Pair Label with Input for each field. Place submit Button at bottom.',
    example: 'Login form, Contact form, Settings form',
  },
  {
    name: 'Navigation Pattern',
    description: 'Horizontal navigation with buttons or links',
    structure: 'Container > Row > [Button|Link]*',
    usage: 'Use Container with spacing.md padding. Use Row with spacing.sm gap. Use Button or Link for navigation items.',
    example: 'Header navigation, Tab bar, Action toolbar',
  },
  {
    name: 'Card Layout Pattern',
    description: 'Content card with header, body, and optional footer',
    structure: 'Card > [CardHeader > CardTitle + CardDescription] + CardContent + [CardFooter]',
    usage: 'Use Card as wrapper. CardHeader for title area. CardContent for main content. CardFooter for actions.',
    example: 'Product card, User profile card, Dashboard widget',
  },
  {
    name: 'Data Table Pattern',
    description: 'Tabular data display with headers and rows',
    structure: 'Table > TableHeader > TableRow > TableHead* + TableBody > TableRow* > TableCell*',
    usage: 'Use Table as container. TableHeader with TableHead cells for column headers. TableBody with TableRow and TableCell for data.',
    example: 'User list, Order history, Inventory table',
  },
  {
    name: 'List Pattern',
    description: 'Vertical list of similar items',
    structure: 'Column > [Card|Row]*',
    usage: 'Use Column with spacing.sm or spacing.md gap. Each item can be a Card or Row depending on complexity.',
    example: 'Todo list, Message list, Menu items',
  },
  {
    name: 'Dashboard Stats Pattern',
    description: 'Grid of metric cards showing key statistics',
    structure: 'Container > Row/Grid > Card* > [Text (label) + Text (value) + Text (change)]',
    usage: 'Use grid layout (grid-cols-2 or grid-cols-4), each Card shows a metric with label, value, and trend.',
    example: 'Dashboard overview, Analytics summary, KPI display',
  },
];

/** 格式化组成模式 @requirements 4.3 */
function formatCompositionPatternsForLLM(patterns?: CompositionPattern[]): string {
  const patternsToUse = patterns || DEFAULT_COMPOSITION_PATTERNS;
  if (patternsToUse.length === 0) return '';
  
  const sections: string[] = ['## Component Composition Patterns'];
  
  for (const pattern of patternsToUse) {
    sections.push('');
    sections.push(`### ${pattern.name}`);
    sections.push(`${pattern.description}`);
    sections.push('```');
    sections.push(pattern.structure);
    sections.push('```');
    sections.push(`**Usage:** ${pattern.usage}`);
    if (pattern.example) sections.push(`**Examples:** ${pattern.example}`);
  }
  
  return sections.join('\n');
}


/** 格式化案例（增强版，包含组成分析）@requirements 4.6 */
function formatExamplesWithCompositionForLLM(
  examples: ExampleMetadata[],
  compositions?: Map<string, ExampleComposition>
): string {
  if (!examples || examples.length === 0) return '';
  
  const sections: string[] = ['## Reference Examples'];
  const limitedExamples = examples.slice(0, 3);
  
  for (let i = 0; i < limitedExamples.length; i++) {
    const example = limitedExamples[i];
    sections.push(`\n### Example ${i + 1}: ${example.title}`);
    sections.push(`Description: ${example.description}`);
    sections.push(`Category: ${example.category}`);
    sections.push(`Tags: ${example.tags.join(', ')}`);
    
    const composition = compositions?.get(example.id);
    if (composition) {
      sections.push('');
      sections.push('**Composition Analysis:**');
      sections.push(`- Components Used: ${composition.usedComponents.join(', ')}`);
      
      if (composition.usedTokens.length > 0) {
        const tokensByCategory: Record<string, string[]> = {};
        for (const token of composition.usedTokens) {
          const category = token.path.split('.')[0];
          if (!tokensByCategory[category]) tokensByCategory[category] = [];
          if (!tokensByCategory[category].includes(token.path)) {
            tokensByCategory[category].push(token.path);
          }
        }
        
        const tokenSummary = Object.entries(tokensByCategory)
          .map(([cat, tokens]) => `${cat}: ${tokens.slice(0, 3).join(', ')}${tokens.length > 3 ? '...' : ''}`)
          .join('; ');
        sections.push(`- Tokens Used: ${tokenSummary}`);
      }
      
      sections.push(`- Layout: ${composition.layoutHierarchy}`);
    }
    
    sections.push('');
    sections.push('```json');
    sections.push(JSON.stringify(example.schema, null, 2));
    sections.push('```');
  }
  
  return sections.join('\n');
}

/** 生成增强指令部分 */
function generateEnhancedInstructions(
  hasExamples: boolean,
  targetScreenSize?: ScreenSize,
  hasTokenUsageGuide: boolean = false,
  hasCompositionPatterns: boolean = false
): string {
  const instructions: string[] = [
    '## Instructions',
    '',
    '**MUST FOLLOW:**',
    '- Use Design Tokens instead of hardcoded values (e.g., use "primary" instead of "#3b82f6")',
    '- Only use components from the Available Components list above',
    '- Each component must have a unique "id" property',
    '- Follow the UISchema structure with "version", "root", and nested "children"',
  ];
  
  if (hasTokenUsageGuide) instructions.push('- Follow Token Usage Guide for correct token-component pairing');
  if (hasCompositionPatterns) instructions.push('- Reference Component Composition Patterns for layout structure');
  if (hasExamples) instructions.push('- Reference the provided examples for structure and patterns');
  if (targetScreenSize) {
    instructions.push(`- Optimize layout for ${targetScreenSize} screen size`);
    instructions.push('- Apply responsive guidelines from above');
  }
  
  return instructions.join('\n');
}


/**
 * 验证增强约束注入是否包含所有必要部分
 * @param injectedPrompt 注入约束后的提示词
 * @param config 约束注入配置
 * @returns 验证结果
 * @requirements 4.2, 4.3, 4.4
 */
export function validateEnhancedConstraintInjection(
  injectedPrompt: string,
  config: ConstraintInjectionConfig
): { valid: boolean; missingSections: string[] } {
  const missingSections: string[] = [];
  
  // 检查必需部分
  if (!injectedPrompt.includes('## Design Tokens')) missingSections.push('Design Tokens');
  if (!injectedPrompt.includes('## Available Components')) missingSections.push('Available Components');
  if (!injectedPrompt.includes('## Instructions')) missingSections.push('Instructions');
  
  // 检查可选部分（如果配置了则必须存在）
  const hasTokenUsageMap = !!config.tokenUsageMap && (
    config.tokenUsageMap.colors.length > 0 ||
    config.tokenUsageMap.spacing.length > 0 ||
    config.tokenUsageMap.typography.length > 0 ||
    config.tokenUsageMap.shadows.length > 0 ||
    config.tokenUsageMap.radius.length > 0
  );
  
  if (hasTokenUsageMap && !injectedPrompt.includes('## Token Usage Guide')) {
    missingSections.push('Token Usage Guide');
  }
  
  if (config.includeCompositionPatterns && !injectedPrompt.includes('## Component Composition Patterns')) {
    missingSections.push('Component Composition Patterns');
  }
  
  if (config.relevantExamples?.length && !injectedPrompt.includes('## Reference Examples')) {
    missingSections.push('Reference Examples');
  }
  
  if (config.targetScreenSize && !injectedPrompt.includes('## Responsive Guidelines')) {
    missingSections.push('Responsive Guidelines');
  }
  
  return { valid: missingSections.length === 0, missingSections };
}


// ============================================================================
// 主要导出函数
// ============================================================================

/**
 * 注入约束到 prompt
 * 
 * 增强格式（按设计文档顺序）：
 * Design Tokens → Token Usage Guide → Available Components → 
 * Component Token Mappings → Composition Patterns → Examples → 
 * Responsive Guidelines → Instructions
 * 
 * @requirements 4.4
 */
export function injectConstraints(
  basePrompt: string,
  config: ConstraintInjectionConfig
): string {
  const cacheKey = generateCacheKey(config);
  let constraintSection = constraintCache.get(cacheKey);
  
  if (!constraintSection) {
    const sections: string[] = [];
    
    // 1. Design Tokens
    sections.push(formatTokensForLLM(config.designTokens));
    sections.push('');
    
    // 2. Token Usage Guide (if provided)
    const hasTokenUsageGuide = !!config.tokenUsageMap && (
      config.tokenUsageMap.colors.length > 0 ||
      config.tokenUsageMap.spacing.length > 0 ||
      config.tokenUsageMap.typography.length > 0 ||
      config.tokenUsageMap.shadows.length > 0 ||
      config.tokenUsageMap.radius.length > 0
    );
    
    if (hasTokenUsageGuide && config.tokenUsageMap) {
      sections.push(formatTokenUsageGuideForLLM(config.tokenUsageMap));
      sections.push('');
    }
    
    // 3. Available Components
    sections.push(formatComponentsForLLM(config.catalog, config.includeFullPropsSchema || false));
    sections.push('');
    
    // 4. Component Token Mappings (if provided)
    if (config.componentTokenMappings && config.componentTokenMappings.length > 0) {
      sections.push(formatComponentMappingsForLLM(config.componentTokenMappings));
      sections.push('');
    }
    
    // 5. Component Composition Patterns (if enabled)
    const hasCompositionPatterns = config.includeCompositionPatterns || false;
    if (hasCompositionPatterns) {
      sections.push(formatCompositionPatternsForLLM());
      sections.push('');
    }
    
    // 6. Reference Examples (with composition analysis if available)
    if (config.relevantExamples && config.relevantExamples.length > 0) {
      if (config.exampleCompositions && config.exampleCompositions.size > 0) {
        sections.push(formatExamplesWithCompositionForLLM(config.relevantExamples, config.exampleCompositions));
      } else {
        sections.push(formatExamplesForLLM(config.relevantExamples));
      }
      sections.push('');
    }
    
    // 7. Responsive Guidelines (if targetScreenSize specified)
    if (config.targetScreenSize) {
      sections.push(formatResponsiveGuidelines(config.targetScreenSize, config.designTokens.breakpoints));
      sections.push('');
    }
    
    // 8. Instructions (enhanced)
    sections.push(generateEnhancedInstructions(
      (config.relevantExamples?.length || 0) > 0,
      config.targetScreenSize,
      hasTokenUsageGuide,
      hasCompositionPatterns
    ));
    
    constraintSection = sections.join('\n');
    constraintCache.set(cacheKey, constraintSection);
  }
  
  return `${constraintSection}\n\n---\n\n${basePrompt}`;
}

/** 获取所有组件名称（用于验证） */
export function getAllComponentNames(catalog: ComponentCatalog): string[] {
  return catalog.getValidTypes();
}

/** 检查约束注入是否包含所有必要信息 */
export function validateConstraintInjection(
  injectedPrompt: string,
  config: ConstraintInjectionConfig
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  const colorNames = Object.keys(config.designTokens.colors);
  for (const colorName of colorNames) {
    if (!injectedPrompt.includes(colorName)) missing.push(`color:${colorName}`);
  }
  
  const spacingNames = Object.keys(config.designTokens.spacing);
  for (const spacingName of spacingNames) {
    if (!injectedPrompt.includes(spacingName)) missing.push(`spacing:${spacingName}`);
  }
  
  const componentNames = config.catalog.getValidTypes();
  for (const componentName of componentNames) {
    if (!injectedPrompt.includes(componentName)) missing.push(`component:${componentName}`);
  }
  
  return { valid: missing.length === 0, missing };
}