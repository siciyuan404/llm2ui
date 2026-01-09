/**
 * @file ColorSchemeSelector.tsx
 * @description 配色方案选择器组件
 * @module components/chat
 * @requirements 21.1, 21.2, 21.6
 */

import * as React from 'react';
import { Check, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ColorScheme } from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface ColorSchemeSelectorProps {
  /** 可用的配色方案列表 */
  schemes: ColorScheme[];
  /** 当前选中的配色方案 ID */
  value?: string;
  /** 配色方案变更回调 */
  onChange?: (schemeId: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * 配色方案预览卡片
 */
function ColorSchemeCard({
  scheme,
  isSelected,
  onClick,
  disabled,
}: {
  scheme: ColorScheme;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const colors = scheme.colors;
  const colorKeys = ['background', 'foreground', 'primary', 'secondary', 'accent', 'muted'];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full p-3 rounded-lg border-2 transition-all text-left',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* 头部：名称和类型 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {scheme.type === 'light' ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
          <span className="font-medium text-sm">{scheme.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {scheme.type === 'light' ? '浅色' : '深色'}
          </Badge>
          {isSelected && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </div>
      </div>

      {/* 颜色预览 */}
      <div className="flex gap-1">
        {colorKeys.map((key) => {
          const color = colors[key];
          if (!color) return null;
          return (
            <div
              key={key}
              className="flex-1 h-8 rounded-sm border border-border/50 first:rounded-l-md last:rounded-r-md"
              style={{ backgroundColor: color }}
              title={`${key}: ${color}`}
            />
          );
        })}
      </div>

      {/* 颜色值预览 */}
      <div className="mt-2 flex flex-wrap gap-1">
        {colorKeys.slice(0, 3).map((key) => {
          const color = colors[key];
          if (!color) return null;
          return (
            <span
              key={key}
              className="text-xs text-muted-foreground font-mono"
            >
              {key}: {color}
            </span>
          );
        })}
      </div>
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ColorSchemeSelector - 配色方案选择器
 * 
 * 功能：
 * - 显示所有配色方案
 * - 显示预览
 * - 支持选择
 * 
 * @requirements 21.1, 21.2, 21.6
 */
export function ColorSchemeSelector({
  schemes,
  value,
  onChange,
  disabled = false,
  className,
}: ColorSchemeSelectorProps) {
  // 按类型分组
  const lightSchemes = schemes.filter((s) => s.type === 'light');
  const darkSchemes = schemes.filter((s) => s.type === 'dark');

  if (schemes.length === 0) {
    return (
      <div className={cn('text-center text-muted-foreground py-8', className)}>
        暂无可用的配色方案
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 浅色主题 */}
      {lightSchemes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sun className="h-4 w-4" />
            浅色主题
          </h4>
          <div className="space-y-2">
            {lightSchemes.map((scheme) => (
              <ColorSchemeCard
                key={scheme.id}
                scheme={scheme}
                isSelected={scheme.id === value}
                onClick={() => onChange?.(scheme.id)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* 深色主题 */}
      {darkSchemes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Moon className="h-4 w-4" />
            深色主题
          </h4>
          <div className="space-y-2">
            {darkSchemes.map((scheme) => (
              <ColorSchemeCard
                key={scheme.id}
                scheme={scheme}
                isSelected={scheme.id === value}
                onClick={() => onChange?.(scheme.id)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorSchemeSelector;
