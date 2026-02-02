/**
 * @file TokenMappingsSection.tsx
 * @description Token 映射展示组件，显示组件的每个 Prop 应该使用哪些 Design Tokens
 * @module components/showcase/components-module/TokenMappingsSection
 * @requirements 6.2
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { defaultComponentMappingRegistry } from '@/lib';
import type { PropTokenMapping } from '@/lib';
import { ChevronIcon } from '@/components/ui/icons';

// ============================================================================
// Constants
// ============================================================================

/**
 * Token 类别徽章颜色映射
 */
const TOKEN_CATEGORY_COLORS: Record<string, string> = {
  colors: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  spacing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  typography: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  shadows: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  radius: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Token 类别徽章组件
 */
function TokenCategoryBadge({ category }: { category: string }) {
  const colorClass = TOKEN_CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded', colorClass)}>
      {category}
    </span>
  );
}

/**
 * Token 映射行组件
 */
function TokenMappingRow({ propMapping }: { propMapping: PropTokenMapping }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasEnumMap = propMapping.enumTokenMap && Object.keys(propMapping.enumTokenMap).length > 0;

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="py-3 px-4">
        <code className="text-sm font-semibold font-mono">{propMapping.propName}</code>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {propMapping.tokenCategories.map(category => (
            <TokenCategoryBadge key={category} category={category} />
          ))}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {propMapping.description}
        {hasEnumMap && (
          <div className="mt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ChevronIcon className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-90')} />
              {isExpanded ? '收起枚举映射' : '展开枚举映射'}
            </button>
            {isExpanded && propMapping.enumTokenMap && (
              <div className="mt-2 space-y-1">
                {Object.entries(propMapping.enumTokenMap).map(([enumValue, tokenRef]) => (
                  <div key={enumValue} className="flex items-center gap-2 text-xs">
                    <code className="px-1.5 py-0.5 bg-muted rounded font-mono">"{enumValue}"</code>
                    <span className="text-muted-foreground">→</span>
                    <code className="px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono">{tokenRef}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export interface TokenMappingsSectionProps {
  /** 组件名称 */
  componentName: string;
}

/**
 * Token 映射表格组件
 * 显示组件的每个 Prop 应该使用哪些 Tokens
 * @requirements 6.2
 */
export const TokenMappingsSection = React.memo(function TokenMappingsSection({ componentName }: TokenMappingsSectionProps) {
  const mapping = defaultComponentMappingRegistry.getMapping(componentName);

  if (!mapping || mapping.propMappings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">此组件暂无 Token 映射信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Token 映射表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="py-2 px-4 text-sm font-medium">Prop</th>
              <th className="py-2 px-4 text-sm font-medium">Token Categories</th>
              <th className="py-2 px-4 text-sm font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {mapping.propMappings.map(propMapping => (
              <TokenMappingRow key={propMapping.propName} propMapping={propMapping} />
            ))}
          </tbody>
        </table>
      </div>

      {/* 推荐的样式 Token */}
      {mapping.styleTokens && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-3">推荐的样式 Tokens</h4>
          <div className="space-y-2">
            {mapping.styleTokens.colors && mapping.styleTokens.colors.length > 0 && (
              <div className="flex items-start gap-2">
                <TokenCategoryBadge category="colors" />
                <div className="flex flex-wrap gap-1">
                  {mapping.styleTokens.colors.map(token => (
                    <code key={token} className="text-xs px-1.5 py-0.5 bg-background rounded font-mono">
                      {token}
                    </code>
                  ))}
                </div>
              </div>
            )}
            {mapping.styleTokens.spacing && mapping.styleTokens.spacing.length > 0 && (
              <div className="flex items-start gap-2">
                <TokenCategoryBadge category="spacing" />
                <div className="flex flex-wrap gap-1">
                  {mapping.styleTokens.spacing.map(token => (
                    <code key={token} className="text-xs px-1.5 py-0.5 bg-background rounded font-mono">
                      {token}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default TokenMappingsSection;
