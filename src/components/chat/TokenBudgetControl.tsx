/**
 * @file TokenBudgetControl.tsx
 * @description Token 预算控制组件
 * @module components/chat
 * @requirements 27.1, 27.2, 27.3, 27.4
 */

import * as React from 'react';
import { AlertCircle, Hash, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TokenEstimate } from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface TokenBudgetControlProps {
  /** Token 估算结果 */
  estimate: TokenEstimate;
  /** 最大预算 */
  max: number;
  /** 是否自动优化 */
  autoOptimize: boolean;
  /** 变更回调 */
  onChange?: (max: number, autoOptimize: boolean) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const BUDGET_PRESETS = [
  { value: 2000, label: '2K', description: '适合简单任务' },
  { value: 4000, label: '4K', description: '推荐设置' },
  { value: 8000, label: '8K', description: '复杂任务' },
  { value: 16000, label: '16K', description: '大型上下文' },
];

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Token 分布条
 */
function TokenBreakdown({
  estimate,
  max,
}: {
  estimate: TokenEstimate;
  max: number;
}) {
  const { componentDocs, examples, colorInfo, base, total } = estimate;
  const percentage = Math.min(100, (total / max) * 100);
  const isOverBudget = total > max;

  // 计算各部分占比
  const componentPercent = (componentDocs / max) * 100;
  const examplePercent = (examples / max) * 100;
  const colorPercent = (colorInfo / max) * 100;
  const basePercent = (base / max) * 100;

  return (
    <div className="space-y-2">
      {/* 总进度条 */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* 组件文档 */}
        <div
          className="absolute h-full bg-blue-500"
          style={{ width: `${componentPercent}%`, left: 0 }}
        />
        {/* 案例 */}
        <div
          className="absolute h-full bg-green-500"
          style={{ width: `${examplePercent}%`, left: `${componentPercent}%` }}
        />
        {/* 配色 */}
        <div
          className="absolute h-full bg-purple-500"
          style={{ width: `${colorPercent}%`, left: `${componentPercent + examplePercent}%` }}
        />
        {/* 基础 */}
        <div
          className="absolute h-full bg-gray-400"
          style={{ width: `${basePercent}%`, left: `${componentPercent + examplePercent + colorPercent}%` }}
        />
        {/* 超出预算指示 */}
        {isOverBudget && (
          <div
            className="absolute h-full bg-destructive/50"
            style={{ width: `${percentage - 100}%`, left: '100%' }}
          />
        )}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">组件 ({componentDocs})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">案例 ({examples})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-muted-foreground">配色 ({colorInfo})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-muted-foreground">基础 ({base})</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * TokenBudgetControl - Token 预算控制
 * 
 * 功能：
 * - 显示当前 Token 数
 * - 设置最大预算
 * - 显示各部分占用
 * - 自动优化开关
 * 
 * @requirements 27.1, 27.2, 27.3, 27.4
 */
export function TokenBudgetControl({
  estimate,
  max,
  autoOptimize,
  onChange,
  className,
}: TokenBudgetControlProps) {
  const [internalMax, setInternalMax] = React.useState(max);
  const [internalAutoOptimize, setInternalAutoOptimize] = React.useState(autoOptimize);

  // 同步外部值
  React.useEffect(() => {
    setInternalMax(max);
  }, [max]);

  React.useEffect(() => {
    setInternalAutoOptimize(autoOptimize);
  }, [autoOptimize]);

  const isOverBudget = estimate.total > internalMax;
  const percentage = Math.min(100, (estimate.total / internalMax) * 100);

  // 处理预算变更
  const handleMaxChange = (value: number[]) => {
    const newMax = value[0];
    setInternalMax(newMax);
    onChange?.(newMax, internalAutoOptimize);
  };

  // 处理预设选择
  const handlePresetSelect = (value: number) => {
    setInternalMax(value);
    onChange?.(value, internalAutoOptimize);
  };

  // 处理自动优化开关
  const handleAutoOptimizeChange = (checked: boolean) => {
    setInternalAutoOptimize(checked);
    onChange?.(internalMax, checked);
  };

  return (
    <div className={cn('space-y-4 p-4 border rounded-lg', className)}>
      {/* 标题和总数 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Token 预算</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOverBudget ? 'destructive' : 'secondary'}
            className="gap-1"
          >
            {estimate.total} / {internalMax}
          </Badge>
          {isOverBudget && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>超出预算 {estimate.total - internalMax} tokens</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Token 分布 */}
      <TokenBreakdown estimate={estimate} max={internalMax} />

      {/* 预算滑块 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">最大预算</Label>
          <span className="text-sm font-mono">{internalMax}</span>
        </div>
        <Slider
          value={[internalMax]}
          onValueChange={handleMaxChange}
          min={1000}
          max={32000}
          step={500}
        />
      </div>

      {/* 预设按钮 */}
      <div className="flex gap-2">
        {BUDGET_PRESETS.map((preset) => (
          <TooltipProvider key={preset.value}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handlePresetSelect(preset.value)}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors',
                    internalMax === preset.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {preset.label}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{preset.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* 自动优化开关 */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <div className="space-y-0.5">
            <Label htmlFor="auto-optimize" className="text-sm">
              自动优化
            </Label>
            <p className="text-xs text-muted-foreground">
              超出预算时自动减少内容
            </p>
          </div>
        </div>
        <Switch
          id="auto-optimize"
          checked={internalAutoOptimize}
          onCheckedChange={handleAutoOptimizeChange}
        />
      </div>
    </div>
  );
}

export default TokenBudgetControl;
