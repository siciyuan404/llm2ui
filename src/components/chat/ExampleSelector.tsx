/**
 * @file ExampleSelector.tsx
 * @description 案例选择器 - 用于 LLM 上下文设置
 * @module components/chat
 * @requirements 25.1, 25.2, 25.3, 25.4, 25.6
 */

import * as React from 'react';
import { Check, FileText, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import type { ThemePack, ExampleMetadata } from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface ExampleSelectorProps {
  /** 当前主题 */
  theme?: ThemePack | null;
  /** 选择模式 */
  mode: 'auto' | 'selected' | 'none';
  /** 已选择的案例 ID */
  selectedIds?: string[];
  /** 自动模式下的最大数量 */
  maxCount?: number;
  /** 变更回调 */
  onChange?: (
    mode: 'auto' | 'selected' | 'none',
    selectedIds?: string[],
    maxCount?: number
  ) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ExampleSelector - 案例选择器
 * 
 * 功能：
 * - 按类别分组显示案例
 * - 支持选择/取消选择
 * - 显示 Token 计数
 * 
 * @requirements 25.1, 25.2, 25.3, 25.4, 25.6
 */
export function ExampleSelector({
  theme,
  mode,
  selectedIds = [],
  maxCount = 5,
  onChange,
  className,
}: ExampleSelectorProps) {
  // 获取所有案例
  const allExamples = React.useMemo(() => {
    if (!theme) return [];
    return theme.examples.presets;
  }, [theme]);

  // 按类别分组
  const examplesByCategory = React.useMemo(() => {
    const groups: Record<string, ExampleMetadata[]> = {};
    allExamples.forEach((example) => {
      const category = example.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(example);
    });
    return groups;
  }, [allExamples]);

  // 内部选择状态
  const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(
    new Set(selectedIds)
  );
  const [internalMaxCount, setInternalMaxCount] = React.useState(maxCount);

  // 同步外部选择
  React.useEffect(() => {
    setInternalSelectedIds(new Set(selectedIds));
  }, [selectedIds]);

  React.useEffect(() => {
    setInternalMaxCount(maxCount);
  }, [maxCount]);

  // 计算总 Token 数
  const totalTokens = React.useMemo(() => {
    if (mode === 'none') return 0;
    if (mode === 'auto') {
      return allExamples
        .slice(0, internalMaxCount)
        .reduce((sum, e) => sum + (e.tokenCount ?? 100), 0);
    }
    return allExamples
      .filter((e) => internalSelectedIds.has(e.id))
      .reduce((sum, e) => sum + (e.tokenCount ?? 100), 0);
  }, [mode, allExamples, internalMaxCount, internalSelectedIds]);

  // 处理模式变更
  const handleModeChange = (newMode: string) => {
    const m = newMode as 'auto' | 'selected' | 'none';
    if (m === 'none') {
      onChange?.(m);
    } else if (m === 'auto') {
      onChange?.(m, undefined, internalMaxCount);
    } else {
      onChange?.(m, Array.from(internalSelectedIds));
    }
  };

  // 处理最大数量变更
  const handleMaxCountChange = (value: number[]) => {
    const count = value[0];
    setInternalMaxCount(count);
    onChange?.('auto', undefined, count);
  };

  // 处理案例选择
  const handleExampleToggle = (exampleId: string, checked: boolean) => {
    const newSelected = new Set(internalSelectedIds);
    if (checked) {
      newSelected.add(exampleId);
    } else {
      newSelected.delete(exampleId);
    }
    setInternalSelectedIds(newSelected);
    onChange?.('selected', Array.from(newSelected));
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    const allIds = allExamples.map((e) => e.id);
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
      {/* Token 统计 */}
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
        <span className="text-sm text-muted-foreground">预估 Token</span>
        <Badge variant="secondary" className="gap-1">
          <Hash className="h-3 w-3" />
          {totalTokens}
        </Badge>
      </div>

      {/* 模式选择 */}
      <RadioGroup value={mode} onValueChange={handleModeChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="auto" id="example-mode-auto" />
          <Label htmlFor="example-mode-auto">自动选择</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="selected" id="example-mode-selected" />
          <Label htmlFor="example-mode-selected">手动选择</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="none" id="example-mode-none" />
          <Label htmlFor="example-mode-none">不包含案例</Label>
        </div>
      </RadioGroup>

      {/* 自动模式：数量控制 */}
      {mode === 'auto' && (
        <div className="space-y-3 pl-6">
          <div className="flex items-center justify-between">
            <Label>最大案例数</Label>
            <span className="text-sm font-medium">{internalMaxCount}</span>
          </div>
          <Slider
            value={[internalMaxCount]}
            onValueChange={handleMaxCountChange}
            min={1}
            max={Math.min(20, allExamples.length)}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            将自动选择最相关的 {internalMaxCount} 个案例
          </p>
        </div>
      )}

      {/* 手动选择 */}
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
              已选 {internalSelectedIds.size}/{allExamples.length}
            </Badge>
          </div>

          {/* 案例列表 */}
          <ScrollArea className="h-[240px] border rounded-md p-2">
            {Object.entries(examplesByCategory).map(([category, examples]) => (
              <div key={category} className="mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  {category}
                </h4>
                <div className="space-y-2">
                  {examples.map((example) => (
                    <div
                      key={example.id}
                      className="flex items-start space-x-2 py-1"
                    >
                      <Checkbox
                        id={`example-${example.id}`}
                        checked={internalSelectedIds.has(example.id)}
                        onCheckedChange={(checked) =>
                          handleExampleToggle(example.id, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`example-${example.id}`}
                          className="text-sm cursor-pointer flex items-center gap-2"
                        >
                          <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{example.name}</span>
                        </Label>
                        <p className="text-xs text-muted-foreground line-clamp-1 ml-5">
                          {example.description}
                        </p>
                        {example.tokenCount && (
                          <span className="text-xs text-muted-foreground ml-5">
                            ~{example.tokenCount} tokens
                          </span>
                        )}
                      </div>
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

export default ExampleSelector;
