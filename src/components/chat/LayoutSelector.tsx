/**
 * @file LayoutSelector.tsx
 * @description 布局选择器组件
 * @module components/chat
 * @requirements 22.1, 22.5
 */

import * as React from 'react';
import { Check, PanelLeft, PanelRight, Columns, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LayoutConfig } from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface LayoutSelectorProps {
  /** 可用的布局列表 */
  layouts: LayoutConfig[];
  /** 当前选中的布局 ID */
  value?: string;
  /** 布局变更回调 */
  onChange?: (layoutId: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 获取布局图标
 */
function getLayoutIcon(config: LayoutConfig['config']) {
  if (config.sidebar === 'left') {
    return <PanelLeft className="h-5 w-5" />;
  }
  if (config.sidebar === 'right') {
    return <PanelRight className="h-5 w-5" />;
  }
  if (config.previewPanel !== 'none') {
    return <Columns className="h-5 w-5" />;
  }
  return <Maximize className="h-5 w-5" />;
}

/**
 * 渲染布局预览
 */
function LayoutPreview({ config }: { config: LayoutConfig['config'] }) {
  const hasSidebar = config.sidebar !== 'none';
  const hasPreview = config.previewPanel !== 'none';
  const isPreviewBottom = config.previewPanel === 'bottom';

  return (
    <div className="w-full h-16 bg-muted/30 rounded border border-border/50 overflow-hidden flex">
      {/* 左侧边栏 */}
      {hasSidebar && config.sidebar === 'left' && (
        <div className="w-1/5 h-full bg-muted/50 border-r border-border/50" />
      )}

      {/* 主内容区 */}
      <div className={cn(
        'flex-1 h-full',
        isPreviewBottom ? 'flex flex-col' : 'flex'
      )}>
        {/* 主内容 */}
        <div className={cn(
          'bg-background',
          isPreviewBottom ? 'flex-1' : 'flex-1',
          hasPreview && !isPreviewBottom && 'border-r border-border/50'
        )} />

        {/* 预览面板 */}
        {hasPreview && (
          <div className={cn(
            'bg-muted/30',
            isPreviewBottom
              ? 'h-1/3 border-t border-border/50'
              : 'w-2/5'
          )} />
        )}
      </div>

      {/* 右侧边栏 */}
      {hasSidebar && config.sidebar === 'right' && (
        <div className="w-1/5 h-full bg-muted/50 border-l border-border/50" />
      )}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * 布局选项卡片
 */
function LayoutCard({
  layout,
  isSelected,
  onClick,
  disabled,
}: {
  layout: LayoutConfig;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
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
      {/* 头部：图标、名称和选中状态 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getLayoutIcon(layout.config)}
          <span className="font-medium text-sm">{layout.name}</span>
        </div>
        {isSelected && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* 布局预览 */}
      <LayoutPreview config={layout.config} />

      {/* 描述 */}
      {layout.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
          {layout.description}
        </p>
      )}
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * LayoutSelector - 布局选择器
 * 
 * 功能：
 * - 显示所有布局类型
 * - 显示视觉预览
 * - 支持选择
 * 
 * @requirements 22.1, 22.5
 */
export function LayoutSelector({
  layouts,
  value,
  onChange,
  disabled = false,
  className,
}: LayoutSelectorProps) {
  if (layouts.length === 0) {
    return (
      <div className={cn('text-center text-muted-foreground py-8', className)}>
        暂无可用的布局
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {layouts.map((layout) => (
        <LayoutCard
          key={layout.id}
          layout={layout}
          isSelected={layout.id === value}
          onClick={() => onChange?.(layout.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default LayoutSelector;
