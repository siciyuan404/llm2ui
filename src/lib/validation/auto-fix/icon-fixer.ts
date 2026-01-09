/**
 * @file icon-fixer.ts
 * @description Emoji 自动修复器，将 emoji 字符转换为 Icon 组件
 * @module lib/validation/auto-fix/icon-fixer
 * @requirements REQ-4.1, REQ-4.2, REQ-4.3, REQ-4.4, REQ-4.5, REQ-4.6
 */

import type { UISchema, UIComponent } from '@/types/ui-schema';
import type { IconFixResult, IconFixChange, FixConfidence } from './types';
import { detectEmojis, getIconSuggestion, DEFAULT_EMOJI_ICON_MAPPINGS } from '../../design-system/emoji-validator';

// ============================================================================
// 常量
// ============================================================================

/** 默认回退图标 */
const DEFAULT_FALLBACK_ICON = 'help-circle';

/** 生成唯一 ID 的计数器 */
let idCounter = 0;

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 生成唯一组件 ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

/**
 * 深拷贝对象
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 创建 Icon 组件
 */
function createIconComponent(iconName: string, size?: number): UIComponent {
  return {
    type: 'Icon',
    id: generateId('icon'),
    props: {
      name: iconName,
      ...(size && { size }),
    },
  };
}

/**
 * 创建 Text 组件
 */
function createTextComponent(text: string): UIComponent {
  return {
    type: 'Text',
    id: generateId('text'),
    props: {},
    children: [text],
  };
}

/**
 * 创建 Container 组件包装多个子组件
 */
function createContainerComponent(children: UIComponent[]): UIComponent {
  return {
    type: 'Container',
    id: generateId('container'),
    props: {
      className: 'flex items-center gap-1',
    },
    children,
  };
}

/**
 * 将包含 emoji 的文本拆分为组件数组
 */
function splitTextWithEmojis(
  text: string,
  path: string,
  changes: IconFixChange[],
  unmappedEmojis: string[]
): UIComponent[] {
  const components: UIComponent[] = [];
  const emojis = detectEmojis(text);
  
  if (emojis.length === 0) {
    return [createTextComponent(text)];
  }
  
  let remaining = text;
  
  for (const emoji of emojis) {
    const index = remaining.indexOf(emoji);
    if (index === -1) continue;
    
    // 添加 emoji 前的文本
    if (index > 0) {
      const beforeText = remaining.slice(0, index).trim();
      if (beforeText) {
        components.push(createTextComponent(beforeText));
      }
    }
    
    // 添加 Icon 组件
    const iconName = getIconSuggestion(emoji);
    const confidence: FixConfidence = iconName ? 'high' : 'low';
    const finalIconName = iconName || DEFAULT_FALLBACK_ICON;
    
    const iconComponent = createIconComponent(finalIconName);
    components.push(iconComponent);
    
    // 记录变更
    changes.push({
      path,
      emoji,
      replacement: iconComponent,
      confidence,
      description: iconName
        ? `将 emoji "${emoji}" 替换为 Icon "${finalIconName}"`
        : `将未知 emoji "${emoji}" 替换为默认 Icon "${DEFAULT_FALLBACK_ICON}"`,
    });
    
    // 记录无法映射的 emoji
    if (!iconName && !unmappedEmojis.includes(emoji)) {
      unmappedEmojis.push(emoji);
    }
    
    // 更新剩余文本
    remaining = remaining.slice(index + emoji.length);
  }
  
  // 添加剩余文本
  if (remaining.trim()) {
    components.push(createTextComponent(remaining.trim()));
  }
  
  return components;
}

// ============================================================================
// Icon Fixer 类
// ============================================================================

/**
 * Icon 修复器
 */
export class IconFixer {
  private changes: IconFixChange[] = [];
  private unmappedEmojis: string[] = [];
  
  /**
   * 检查 Schema 是否可以修复
   */
  canFix(schema: UISchema): boolean {
    if (!schema || !schema.root) {
      return false;
    }
    
    return this.hasEmojis(schema.root);
  }
  
  /**
   * 修复 Schema 中的 emoji
   */
  fix(schema: UISchema): IconFixResult {
    // 重置状态
    this.changes = [];
    this.unmappedEmojis = [];
    
    if (!schema || !schema.root) {
      return {
        fixed: schema,
        changes: [],
        hasUnmapped: false,
        unmappedEmojis: [],
      };
    }
    
    // 深拷贝 Schema
    const fixed = deepClone(schema);
    
    // 修复根组件
    fixed.root = this.fixComponent(fixed.root, 'root');
    
    return {
      fixed,
      changes: this.changes,
      hasUnmapped: this.unmappedEmojis.length > 0,
      unmappedEmojis: this.unmappedEmojis,
    };
  }
  
  /**
   * 检查组件是否包含 emoji
   */
  private hasEmojis(component: UIComponent): boolean {
    // 检查 props
    if (component.props) {
      for (const value of Object.values(component.props)) {
        if (typeof value === 'string' && detectEmojis(value).length > 0) {
          return true;
        }
      }
    }
    
    // 检查 children
    if (component.children) {
      for (const child of component.children) {
        if (typeof child === 'string' && detectEmojis(child).length > 0) {
          return true;
        }
        if (typeof child === 'object' && child !== null && this.hasEmojis(child as UIComponent)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * 修复单个组件
   */
  private fixComponent(component: UIComponent, path: string): UIComponent {
    const fixed = { ...component };
    
    // 修复 props 中的 emoji
    if (fixed.props) {
      fixed.props = this.fixProps(fixed.props, `${path}.props`);
    }
    
    // 修复 children 中的 emoji
    if (fixed.children) {
      fixed.children = this.fixChildren(fixed.children, `${path}.children`);
    }
    
    return fixed;
  }
  
  /**
   * 修复 props 中的 emoji
   */
  private fixProps(
    props: Record<string, unknown>,
    path: string
  ): Record<string, unknown> {
    const fixed: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string') {
        const emojis = detectEmojis(value);
        if (emojis.length > 0) {
          // 对于 props 中的 emoji，只替换为纯文本（移除 emoji）
          // 因为 props 通常不支持组件作为值
          let fixedValue = value;
          for (const emoji of emojis) {
            const iconName = getIconSuggestion(emoji) || DEFAULT_FALLBACK_ICON;
            fixedValue = fixedValue.replace(emoji, `[${iconName}]`);
            
            this.changes.push({
              path: `${path}.${key}`,
              emoji,
              replacement: createIconComponent(iconName),
              confidence: getIconSuggestion(emoji) ? 'medium' : 'low',
              description: `在 props 中将 emoji "${emoji}" 替换为文本标记 "[${iconName}]"`,
            });
            
            if (!getIconSuggestion(emoji) && !this.unmappedEmojis.includes(emoji)) {
              this.unmappedEmojis.push(emoji);
            }
          }
          fixed[key] = fixedValue;
        } else {
          fixed[key] = value;
        }
      } else {
        fixed[key] = value;
      }
    }
    
    return fixed;
  }
  
  /**
   * 修复 children 中的 emoji
   */
  private fixChildren(
    children: (string | UIComponent)[],
    path: string
  ): (string | UIComponent)[] {
    const fixed: (string | UIComponent)[] = [];
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childPath = `${path}[${i}]`;
      
      if (typeof child === 'string') {
        const emojis = detectEmojis(child);
        if (emojis.length > 0) {
          // 将包含 emoji 的文本拆分为组件
          const components = splitTextWithEmojis(
            child,
            childPath,
            this.changes,
            this.unmappedEmojis
          );
          
          if (components.length === 1) {
            fixed.push(components[0]);
          } else {
            // 多个组件需要用 Container 包装
            fixed.push(createContainerComponent(components));
          }
        } else {
          fixed.push(child);
        }
      } else if (typeof child === 'object' && child !== null) {
        fixed.push(this.fixComponent(child as UIComponent, childPath));
      } else {
        fixed.push(child);
      }
    }
    
    return fixed;
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建 Icon 修复器实例
 */
export function createIconFixer(): IconFixer {
  return new IconFixer();
}

/**
 * 修复 Schema 中的 emoji（便捷函数）
 */
export function fixIcons(schema: UISchema): IconFixResult {
  const fixer = new IconFixer();
  return fixer.fix(schema);
}

/**
 * 检查 Schema 是否需要修复（便捷函数）
 */
export function needsIconFix(schema: UISchema): boolean {
  const fixer = new IconFixer();
  return fixer.canFix(schema);
}
