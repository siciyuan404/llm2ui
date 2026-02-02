/**
 * @file CategorySidebar.tsx
 * @description 组件分类侧边栏，展示组件分类和组件列表
 * @module components/showcase/components-module/CategorySidebar
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentRegistry } from '@/lib';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronIcon } from '@/components/ui/icons';

// ============================================================================
// Types
// ============================================================================

/**
 * 组件分类配置
 */
export interface ComponentCategoryConfig {
  /** 分类 ID */
  id: string;
  /** 分类标签 */
  label: string;
  /** 分类图标 */
  icon?: React.ReactNode;
  /** 分类下的组件名称列表 */
  components: string[];
}

export interface CategorySidebarProps {
  /** 分类配置列表 */
  categories: ComponentCategoryConfig[];
  /** 当前选中的组件名称 */
  activeComponent: string | null;
  /** 组件选择回调 */
  onComponentSelect: (name: string) => void;
  /** 组件注册表 */
  registry: ComponentRegistry;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * 分类侧边栏组件
 */
export const CategorySidebar = React.memo(function CategorySidebar({
  categories,
  activeComponent,
  onComponentSelect,
  registry,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(() => {
    // 默认展开包含当前选中组件的分类
    const expanded = new Set<string>();
    if (activeComponent) {
      for (const category of categories) {
        if (category.components.includes(activeComponent)) {
          expanded.add(category.id);
          break;
        }
      }
    }
    // 默认展开第一个分类
    if (expanded.size === 0 && categories.length > 0) {
      expanded.add(categories[0].id);
    }
    return expanded;
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className="w-56 border-r bg-muted/30 flex-shrink-0">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold">Components</h3>
      </div>
      <ScrollArea className="h-[calc(100%-57px)]">
        <div className="p-2">
          {categories.map(category => {
            const isExpanded = expandedCategories.has(category.id);
            const registeredCount = category.components.filter(name =>
              registry.has(name)
            ).length;

            return (
              <div key={category.id} className="mb-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium',
                    'rounded-md transition-colors hover:bg-muted'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ChevronIcon className={cn('transition-transform', isExpanded && 'rotate-90')} />
                    {category.icon}
                    <span>{category.label}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {registeredCount}/{category.components.length}
                  </span>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="ml-4 space-y-0.5">
                    {category.components.map(componentName => {
                      const isRegistered = registry.has(componentName);
                      const isActive = activeComponent === componentName;
                      const componentDef = registry.get(componentName);

                      return (
                        <button
                          key={componentName}
                          onClick={() => isRegistered && onComponentSelect(componentName)}
                          disabled={!isRegistered}
                          className={cn(
                            'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                            'flex items-center justify-between gap-2',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : isRegistered
                              ? 'hover:bg-muted'
                              : 'text-muted-foreground cursor-not-allowed opacity-60'
                          )}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{componentName}</span>
                            {componentDef?.description && isRegistered && (
                              <span className={cn(
                                'text-xs truncate',
                                isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              )}>
                                {componentDef.description.slice(0, 30)}
                                {componentDef.description.length > 30 ? '...' : ''}
                              </span>
                            )}
                          </div>
                          {!isRegistered && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                              Coming Soon
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

export default CategorySidebar;
