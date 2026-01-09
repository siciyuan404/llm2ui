/**
 * @file ComponentSelector.tsx
 * @description 组件选择器 - 用于 LLM 上下文设置
 * @module components/chat
 * @requirements 24.1, 24.2, 24.3, 24.4, 24.5, 24.6
 */

import * as React from 'react';
import { Check, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { ThemePack } from '@/lib/themes';
import { COMPONENT_PRESETS } from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface ComponentSelectorProps {
  /** 当前主题 */
  theme?: ThemePack | null;
  /** 选择模式 */
  mode: 'all' | 'selected' | 'preset';
  /** 已选择的组件 ID */
  selectedIds?: string[];
  /** 预设名称 */
  presetName?: string;
  /** 变更回调 */
  onChange?: (
    mode: 'all' | 'selected' | 'preset',
    selectedIds?: string[],
    presetName?: string
  ) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PRESET_OPTIONS = [
  { id: 'all', name: '全部组件', description: '包含所有可用组件' },
  { id: 'layout-only', name: '仅布局', description: 'Container, Card 等布局组件' },
  { id: 'forms-only', name: '仅表单', description: 'Input, Button, Select 等表单组件' },
  { id: 'display-only', name: '仅展示', description: 'Text, Icon, Badge 等展示组件' },
];

// ============================================================================
// Component
// ============================================================================

/**
 * ComponentSelector - 组件选择器
 * 
 * 功能：
 * - 按类别分组显示组件
 * - 支持选择/取消选择
 * - 支持预设选择
 * 
 * @requirements 24.1, 24.2, 24.3, 24.4, 24.5, 24.6
 */
export function ComponentSelector({
  theme,
  mode,
  selectedIds = [],
  presetName = 'all',
  onChange,
  className,
}: ComponentSelectorProps) {
  // 获取所有组件
  const allComponents = React.useMemo(() => {
    if (!theme) return [];
    return theme.components.registry.getAllComponentIds().map((id) => {
      const component = theme.components.registry.getComponent(id);
      return {
        id,
        type: component?.type ?? id,
        description: component?.description ?? '',
        category: component?.category ?? 'other',
      };
    });
  }, [theme]);

  // 按类别分组
  const componentsByCategory = React.useMemo(() => {
    const groups: Record<string, typeof allComponents> = {};
    allComponents.forEach((comp) => {
      const category = comp.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(comp);
    });
    return groups;
  }, [allComponents]);

  // 内部选择状态
  const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(
    new Set(selectedIds)
  );

  // 同步外部选择
  React.useEffect(() => {
    setInternalSelectedIds(new Set(selectedIds));
  }, [selectedIds]);

  // 处理模式变更
  const handleModeChange = (newMode: string) => {
    const m = newMode as 'all' | 'selected' | 'preset';
    if (m === 'all') {
      onChange?.(m);
    } else if (m === 'preset') {
      onChange?.(m, undefined, presetName);
    } else {
      onChange?.(m, Array.from(internalSelectedIds));
    }
  };

  // 处理预设变更
  const handlePresetChange = (preset: string) => {
    onChange?.('preset', undefined, preset);
  };

  // 处理组件选择
  const handleComponentToggle = (componentId: string, checked: boolean) => {
    const newSelected = new Set(internalSelectedIds);
    if (checked) {
      newSelected.add(componentId);
    } else {
      newSelected.delete(componentId);
    }
    setInternalSelectedIds(newSelected);
    onChange?.('selected', Array.from(newSelected));
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    const allIds = allComponents.map((c) => c.id);
    setInternalSelectedIds(new Set(allIds));
    onChange?.('selected', allIds);
  };

  const handleDeselectAll = () => {
    setInternalSelectedIds(new Set());
    onChange?.('selected', []);
  };

  if (!theme) {
    return (
      <div className={cn('text-center text-muted-foreground py-4', className)}>
        请先选择主题
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 模式选择 */}
      <RadioGroup value={mode} onValueChange={handleModeChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="mode-all" />
          <Label htmlFor="mode-all">全部组件</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="preset" id="mode-preset" />
          <Label htmlFor="mode-preset">使用预设</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="selected" id="mode-selected" />
          <Label htmlFor="mode-selected">自定义选择</Label>
        </div>
      </RadioGroup>

      {/* 预设选择 */}
      {mode === 'preset' && (
        <div className="space-y-2 pl-6">
          {PRESET_OPTIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id)}
              className={cn(
                'w-full p-2 rounded-md border text-left transition-colors',
                presetName === preset.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{preset.name}</span>
                {presetName === preset.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* 自定义选择 */}
      {mode === 'selected' && (
        <div className="space-y-3 pl-6">
          {/* 快捷操作 */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              全选
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              取消全选
            </Button>
            <Badge variant="secondary">
              已选 {internalSelectedIds.size}/{allComponents.length}
            </Badge>
          </div>

          {/* 组件列表 */}
          <ScrollArea className="h-[200px] border rounded-md p-2">
            {Object.entries(componentsByCategory).map(([category, components]) => (
              <div key={category} className="mb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  {category}
                </h4>
                <div className="space-y-1">
                  {components.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <Checkbox
                        id={`comp-${comp.id}`}
                        checked={internalSelectedIds.has(comp.id)}
                        onCheckedChange={(checked) =>
                          handleComponentToggle(comp.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`comp-${comp.id}`}
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        <Package className="h-3 w-3 text-muted-foreground" />
                        {comp.type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default ComponentSelector;
