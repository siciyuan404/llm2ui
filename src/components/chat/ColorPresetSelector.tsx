/**
 * @file ColorPresetSelector.tsx
 * @description 配色预设选择器 - 用于 LLM 上下文设置
 * @module components/chat
 * @requirements 26.1, 26.2, 26.4, 26.5
 */

import * as React from 'react';
import { Check, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { ThemePack, ColorScheme } from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface ColorPresetSelectorProps {
  /** 当前主题 */
  theme?: ThemePack | null;
  /** 选中的配色方案 ID */
  selectedId?: string;
  /** 是否在提示词中包含配色信息 */
  includeInPrompt?: boolean;
  /** 变更回调 */
  onChange?: (id: string, includeInPrompt: boolean) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * 配色方案选项
 */
function ColorSchemeOption({
  scheme,
  isSelected,
  onClick,
}: {
  scheme: ColorScheme;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors = scheme.colors;
  const previewColors = ['background', 'primary', 'secondary', 'accent'];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-lg border-2 transition-all text-left',
        'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {scheme.type === 'light' ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
          <span className="font-medium text-sm">{scheme.name}</span>
        </div>
        {isSelected && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* 颜色预览 */}
      <div className="flex gap-1">
        {previewColors.map((key) => {
          const color = colors[key];
          if (!color) return null;
          return (
            <div
              key={key}
              className="flex-1 h-6 rounded-sm border border-border/50"
              style={{ backgroundColor: color }}
              title={`${key}: ${color}`}
            />
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
 * ColorPresetSelector - 配色预设选择器
 * 
 * 功能：
 * - 显示配色方案列表
 * - 显示预览
 * - 控制是否包含在提示词中
 * 
 * @requirements 26.1, 26.2, 26.4, 26.5
 */
export function ColorPresetSelector({
  theme,
  selectedId,
  includeInPrompt = true,
  onChange,
  className,
}: ColorPresetSelectorProps) {
  // 获取配色方案
  const colorSchemes = theme?.colorSchemes ?? [];

  // 内部状态
  const [internalSelectedId, setInternalSelectedId] = React.useState(
    selectedId ?? colorSchemes[0]?.id ?? 'light'
  );
  const [internalInclude, setInternalInclude] = React.useState(includeInPrompt);

  // 同步外部值
  React.useEffect(() => {
    if (selectedId) {
      setInternalSelectedId(selectedId);
    }
  }, [selectedId]);

  React.useEffect(() => {
    setInternalInclude(includeInPrompt);
  }, [includeInPrompt]);

  // 处理配色方案选择
  const handleSchemeSelect = (schemeId: string) => {
    setInternalSelectedId(schemeId);
    onChange?.(schemeId, internalInclude);
  };

  // 处理包含开关
  const handleIncludeChange = (checked: boolean) => {
    setInternalInclude(checked);
    onChange?.(internalSelectedId, checked);
  };

  if (!theme || colorSchemes.length === 0) {
    return (
      <div className={cn('text-center text-muted-foreground py-4', className)}>
        当前主题没有配色方案
      </div>
    );
  }

  // 按类型分组
  const lightSchemes = colorSchemes.filter((s) => s.type === 'light');
  const darkSchemes = colorSchemes.filter((s) => s.type === 'dark');

  return (
    <div className={cn('space-y-4', className)}>
      {/* 包含开关 */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
        <div className="space-y-0.5">
          <Label htmlFor="include-colors">在提示词中包含配色</Label>
          <p className="text-xs text-muted-foreground">
            将配色信息添加到 LLM 提示词中
          </p>
        </div>
        <Switch
          id="include-colors"
          checked={internalInclude}
          onCheckedChange={handleIncludeChange}
        />
      </div>

      {/* 配色方案列表 */}
      <div className={cn('space-y-4', !internalInclude && 'opacity-50 pointer-events-none')}>
        {/* 浅色主题 */}
        {lightSchemes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Sun className="h-3 w-3" />
              浅色
            </h4>
            <div className="space-y-2">
              {lightSchemes.map((scheme) => (
                <ColorSchemeOption
                  key={scheme.id}
                  scheme={scheme}
                  isSelected={scheme.id === internalSelectedId}
                  onClick={() => handleSchemeSelect(scheme.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 深色主题 */}
        {darkSchemes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Moon className="h-3 w-3" />
              深色
            </h4>
            <div className="space-y-2">
              {darkSchemes.map((scheme) => (
                <ColorSchemeOption
                  key={scheme.id}
                  scheme={scheme}
                  isSelected={scheme.id === internalSelectedId}
                  onClick={() => handleSchemeSelect(scheme.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ColorPresetSelector;
