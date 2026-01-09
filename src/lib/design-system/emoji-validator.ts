/**
 * @file emoji-validator.ts
 * @description Emoji 检测和 Icon 合规验证模块
 * @module lib/design-system/emoji-validator
 * @requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

import type { UISchema, UIComponent } from '@/types/ui-schema';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Icon 合规警告
 */
export interface IconComplianceWarning {
  /** 警告路径 */
  path: string;
  /** 检测到的 emoji */
  emoji: string;
  /** 建议的 Icon 名称 */
  suggestedIcon?: string;
  /** 建议说明 */
  suggestion: string;
}

/**
 * Icon 合规验证结果
 */
export interface IconComplianceResult {
  /** 是否合规 */
  valid: boolean;
  /** 警告列表 */
  warnings: IconComplianceWarning[];
}

// ============================================================================
// 常量定义
// ============================================================================

/**
 * 默认 Emoji 到 Icon 映射表
 * 包含 16+ 常用 UI emoji 的映射
 */
export const DEFAULT_EMOJI_ICON_MAPPINGS: Record<string, string> = {
  // 搜索和导航
  '\u{1F50D}': 'search',      // 🔍
  '\u{1F3E0}': 'home',        // 🏠
  '\u{2699}\uFE0F': 'settings', // ⚙️
  '\u{2699}': 'settings',     // ⚙ (无变体选择器)
  
  // 文件和文件夹
  '\u{1F4C1}': 'folder',      // 📁
  '\u{1F4C2}': 'folder-open', // 📂
  '\u{1F4C4}': 'file',        // 📄
  '\u{1F4E6}': 'package',     // 📦
  
  // 操作
  '\u{2795}': 'plus',         // ➕
  '\u{2796}': 'minus',        // ➖
  '\u{274C}': 'x',            // ❌
  '\u{2705}': 'check',        // ✅
  '\u{2714}\uFE0F': 'check',  // ✔️
  '\u{2714}': 'check',        // ✔ (无变体选择器)
  
  // 通信
  '\u{1F4AC}': 'message-circle', // 💬
  '\u{1F514}': 'bell',        // 🔔
  '\u{2709}\uFE0F': 'mail',   // ✉️
  '\u{2709}': 'mail',         // ✉ (无变体选择器)
  
  // 用户
  '\u{1F464}': 'user',        // 👤
  '\u{1F465}': 'users',       // 👥
  
  // 其他常用
  '\u{2B50}': 'star',         // ⭐
  '\u{2764}\uFE0F': 'heart',  // ❤️
  '\u{2764}': 'heart',        // ❤ (无变体选择器)
  '\u{1F512}': 'lock',        // 🔒
  '\u{1F513}': 'unlock',      // 🔓
  '\u{1F4DD}': 'edit',        // 📝
  '\u{1F5D1}\uFE0F': 'trash', // 🗑️
  '\u{1F5D1}': 'trash',       // 🗑 (无变体选择器)
};

// ============================================================================
// 公共函数
// ============================================================================

/**
 * 检测字符串中的 emoji
 * @param text 要检测的文本
 * @returns 检测到的 emoji 数组（去重）
 */
export function detectEmojis(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // 使用 Unicode 属性转义来匹配 emoji
  // 匹配 Emoji_Presentation 和带变体选择器的 emoji
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{2B50}-\u{2B55}]|[\u{23E9}-\u{23F3}]|[\u{231A}-\u{231B}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{FE0F}]?/gu;
  
  const matches = text.match(emojiRegex);
  if (!matches) {
    return [];
  }
  
  // 过滤空字符串和变体选择器，去重
  const emojis = matches.filter(m => m && m !== '\uFE0F');
  return [...new Set(emojis)];
}

/**
 * 获取 emoji 对应的 Icon 建议
 * @param emoji 要查询的 emoji
 * @returns Icon 名称，如果没有映射则返回 undefined
 */
export function getIconSuggestion(emoji: string): string | undefined {
  return DEFAULT_EMOJI_ICON_MAPPINGS[emoji];
}

/**
 * 验证 UISchema 的 Icon 合规性
 * @param schema 要验证的 UISchema
 * @returns 验证结果
 */
export function validateIconCompliance(schema: UISchema): IconComplianceResult {
  const warnings: IconComplianceWarning[] = [];
  
  if (!schema || !schema.root) {
    return { valid: true, warnings: [] };
  }
  
  function traverseComponent(component: UIComponent, path: string): void {
    // 检查 props 中的字符串值
    if (component.props) {
      for (const [key, value] of Object.entries(component.props)) {
        if (typeof value === 'string') {
          const emojis = detectEmojis(value);
          for (const emoji of emojis) {
            const suggestedIcon = getIconSuggestion(emoji);
            warnings.push({
              path: `${path}.props.${key}`,
              emoji,
              suggestedIcon,
              suggestion: suggestedIcon
                ? `使用 Icon 组件替代: { "type": "Icon", "props": { "name": "${suggestedIcon}" } }`
                : `请使用 Icon 组件替代 emoji，参考 ui-generation-guide.md 中的图标列表`,
            });
          }
        }
      }
    }
    
    // 检查 children
    if (component.children && Array.isArray(component.children)) {
      component.children.forEach((child, index) => {
        if (typeof child === 'string') {
          const emojis = detectEmojis(child);
          for (const emoji of emojis) {
            const suggestedIcon = getIconSuggestion(emoji);
            warnings.push({
              path: `${path}.children[${index}]`,
              emoji,
              suggestedIcon,
              suggestion: suggestedIcon
                ? `使用 Icon 组件替代: { "type": "Icon", "props": { "name": "${suggestedIcon}" } }`
                : `请使用 Icon 组件替代 emoji，参考 ui-generation-guide.md 中的图标列表`,
            });
          }
        } else if (typeof child === 'object' && child !== null) {
          traverseComponent(child as UIComponent, `${path}.children[${index}]`);
        }
      });
    }
  }
  
  traverseComponent(schema.root, 'root');
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * 格式化 Icon 合规警告为 LLM 可读格式
 * @param result 验证结果
 * @returns 格式化的字符串
 */
export function formatIconComplianceForLLM(result: IconComplianceResult): string {
  if (result.valid) {
    return '✅ Icon 合规检查通过，未发现 emoji 使用';
  }
  
  const lines = [
    '⚠️ Icon 合规检查发现以下问题：',
    '',
  ];
  
  for (const warning of result.warnings) {
    lines.push(`- 路径: ${warning.path}`);
    lines.push(`  Emoji: ${warning.emoji}`);
    lines.push(`  建议: ${warning.suggestion}`);
    lines.push('');
  }
  
  lines.push('请使用 Icon 组件替代 emoji，参考 ui-generation-guide.md 中的图标列表。');
  
  return lines.join('\n');
}
