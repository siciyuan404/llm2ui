/**
 * SidebarNav - 通用侧边栏导航组件
 * 
 * 为 Showcase 页面的三个模块（Tokens、Components、Examples）提供统一的导航体验。
 * 支持分类折叠/展开、搜索过滤、项目数量徽章、URL 路由同步和移动端抽屉模式。
 * 
 * @module SidebarNav
 * @see Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================================================
// Types
// ============================================================================

/**
 * 侧边栏导航项
 */
export interface SidebarNavItem {
  /** 唯一标识 */
  id: string;
  /** 显示标签 */
  label: string;
  /** 简短描述 */
  description?: string;
  /** 图标名称 */
  icon?: string;
  /** 子项 */
  children?: SidebarNavItem[];
  /** 徽章文本 (如 "Coming Soon") */
  badge?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 侧边栏导航分类
 */
export interface SidebarNavCategory {
  /** 分类 ID */
  id: string;
  /** 分类标签 */
  label: string;
  /** 分类图标 */
  icon?: string;
  /** 分类下的项目 */
  items: SidebarNavItem[];
  /** 是否默认展开 */
  defaultExpanded?: boolean;
}

/**
 * 侧边栏导航 Props
 */
export interface SidebarNavProps {
  /** 分类列表 */
  categories: SidebarNavCategory[];
  /** 当前选中项 ID */
  activeItemId: string | null;
  /** 选中项变化回调 */
  onItemSelect: (itemId: string) => void;
  /** 搜索查询 */
  searchQuery?: string;
  /** 搜索变化回调 */
  onSearchChange?: (query: string) => void;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 是否显示项目数量 */
  showItemCount?: boolean;
  /** URL 参数名称（用于路由同步） */
  urlParamName?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 移动端抽屉状态
 */
interface DrawerState {
  isOpen: boolean;
}

// ============================================================================
// Icons
// ============================================================================

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 计算分类下的项目总数（包括子项）
 */
function countCategoryItems(category: SidebarNavCategory): number {
  return category.items.reduce((count, item) => {
    return count + 1 + (item.children?.length ?? 0);
  }, 0);
}

/**
 * 过滤分类和项目
 * 根据搜索查询过滤，返回匹配的分类和项目
 */
export function filterCategories(
  categories: SidebarNavCategory[],
  searchQuery: string
): SidebarNavCategory[] {
  if (!searchQuery.trim()) {
    return categories;
  }

  const query = searchQuery.toLowerCase().trim();

  const result: SidebarNavCategory[] = [];

  for (const category of categories) {
    const filteredItems: SidebarNavItem[] = [];

    for (const item of category.items) {
      // 检查项目本身是否匹配
      const itemMatches =
        item.label.toLowerCase().includes(query) ||
        (item.description?.toLowerCase().includes(query) ?? false);

      // 过滤子项
      const filteredChildren = item.children?.filter(
        (child) =>
          child.label.toLowerCase().includes(query) ||
          (child.description?.toLowerCase().includes(query) ?? false)
      );

      // 如果项目匹配或有匹配的子项，保留该项目
      if (itemMatches || (filteredChildren && filteredChildren.length > 0)) {
        filteredItems.push({
          ...item,
          children: itemMatches ? item.children : filteredChildren,
        });
      }
    }

    // 如果分类有匹配的项目，保留该分类
    if (filteredItems.length > 0) {
      result.push({
        ...category,
        items: filteredItems,
      });
    }
  }

  return result;
}

/**
 * 查找项目所属的分类 ID
 */
function findCategoryForItem(
  categories: SidebarNavCategory[],
  itemId: string
): string | null {
  for (const category of categories) {
    for (const item of category.items) {
      if (item.id === itemId) {
        return category.id;
      }
      if (item.children?.some((child) => child.id === itemId)) {
        return category.id;
      }
    }
  }
  return null;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * 搜索输入框
 */
function SearchBox({
  value,
  onChange,
  placeholder = '搜索...',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClear = React.useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && value) {
        e.preventDefault();
        handleClear();
      }
    },
    [value, handleClear]
  );

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <SearchIcon />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="搜索导航项"
        className={cn(
          'w-full pl-9 pr-9 py-2 text-sm rounded-md',
          'border border-input bg-background',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'placeholder:text-muted-foreground'
        )}
      />
      {value && (
        <button
          onClick={handleClear}
          type="button"
          aria-label="清除搜索"
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'p-1 rounded-sm text-muted-foreground',
            'hover:text-foreground hover:bg-muted',
            'focus:outline-none focus:ring-2 focus:ring-ring'
          )}
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}


/**
 * 导航项组件
 */
function NavItem({
  item,
  isActive,
  onSelect,
  level = 0,
}: {
  item: SidebarNavItem;
  isActive: boolean;
  onSelect: (id: string) => void;
  level?: number;
}) {
  const itemRef = React.useRef<HTMLButtonElement>(null);

  // 当项目激活时滚动到可见区域
  React.useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isActive]);

  return (
    <button
      ref={itemRef}
      onClick={() => !item.disabled && onSelect(item.id)}
      disabled={item.disabled}
      role="option"
      aria-selected={isActive}
      aria-disabled={item.disabled}
      className={cn(
        'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
        'flex items-center justify-between gap-2',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        level > 0 && 'pl-6',
        isActive
          ? 'bg-primary text-primary-foreground'
          : item.disabled
          ? 'text-muted-foreground cursor-not-allowed opacity-60'
          : 'hover:bg-muted'
      )}
    >
      <div className="flex flex-col min-w-0">
        <span className="truncate">{item.label}</span>
        {item.description && (
          <span
            className={cn(
              'text-xs truncate',
              isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}
          >
            {item.description}
          </span>
        )}
      </div>
      {item.badge && (
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded shrink-0',
            isActive
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

/**
 * 分类组件
 */
function CategorySection({
  category,
  activeItemId,
  onItemSelect,
  showItemCount,
  isExpanded,
  onToggleExpand,
}: {
  category: SidebarNavCategory;
  activeItemId: string | null;
  onItemSelect: (id: string) => void;
  showItemCount: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const itemCount = countCategoryItems(category);

  return (
    <div className="space-y-1">
      {/* 分类标题 */}
      <button
        onClick={onToggleExpand}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm font-medium',
          'rounded-md transition-colors',
          'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
        )}
        aria-expanded={isExpanded}
        aria-controls={`category-${category.id}`}
      >
        <span className="flex items-center gap-2">
          <ChevronDownIcon
            className={cn(
              'transition-transform duration-200',
              !isExpanded && '-rotate-90'
            )}
          />
          <span>{category.label}</span>
        </span>
        {showItemCount && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {itemCount}
          </span>
        )}
      </button>

      {/* 分类项目 */}
      {isExpanded && (
        <div
          id={`category-${category.id}`}
          role="listbox"
          aria-label={category.label}
          className="space-y-0.5 ml-2"
        >
          {category.items.map((item) => (
            <div key={item.id}>
              <NavItem
                item={item}
                isActive={activeItemId === item.id}
                onSelect={onItemSelect}
              />
              {/* 子项 */}
              {item.children && item.children.length > 0 && (
                <div className="space-y-0.5 mt-0.5">
                  {item.children.map((child) => (
                    <NavItem
                      key={child.id}
                      item={child}
                      isActive={activeItemId === child.id}
                      onSelect={onItemSelect}
                      level={1}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 移动端抽屉组件
 */
function MobileDrawer({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // 防止背景滚动
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 键盘关闭
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 抽屉内容 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-72 bg-card border-r border-border',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="导航菜单"
      >
        {/* 关闭按钮 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-medium">导航</span>
          <button
            onClick={onClose}
            className={cn(
              'p-1 rounded-md text-muted-foreground',
              'hover:text-foreground hover:bg-muted',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
            aria-label="关闭导航菜单"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}


// ============================================================================
// Main Component
// ============================================================================

/**
 * 通用侧边栏导航组件
 * 
 * 功能：
 * - 分类折叠/展开
 * - 搜索过滤
 * - 项目数量徽章
 * - URL 路由同步
 * - 移动端抽屉模式
 * - 自动滚动到选中项
 * 
 * @see Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */
export function SidebarNav({
  categories,
  activeItemId,
  onItemSelect,
  searchQuery = '',
  onSearchChange,
  showSearch = true,
  showItemCount = true,
  urlParamName = 'item',
  className,
}: SidebarNavProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    () => {
      // 初始化展开状态：默认展开的分类 + 包含当前选中项的分类
      const expanded = new Set<string>();
      categories.forEach((category) => {
        if (category.defaultExpanded) {
          expanded.add(category.id);
        }
      });
      // 如果有选中项，展开其所属分类
      if (activeItemId) {
        const categoryId = findCategoryForItem(categories, activeItemId);
        if (categoryId) {
          expanded.add(categoryId);
        }
      }
      return expanded;
    }
  );
  const [drawerState, setDrawerState] = React.useState<DrawerState>({
    isOpen: false,
  });

  // 同步外部搜索查询
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // URL 路由同步：从 URL 读取选中项
  React.useEffect(() => {
    const itemFromUrl = searchParams.get(urlParamName);
    if (itemFromUrl && itemFromUrl !== activeItemId) {
      onItemSelect(itemFromUrl);
      // 展开包含该项的分类
      const categoryId = findCategoryForItem(categories, itemFromUrl);
      if (categoryId) {
        setExpandedCategories((prev) => new Set([...prev, categoryId]));
      }
    }
  }, [searchParams, urlParamName, activeItemId, onItemSelect, categories]);

  // URL 路由同步：选中项变化时更新 URL
  const handleItemSelect = React.useCallback(
    (itemId: string) => {
      onItemSelect(itemId);
      // 更新 URL 参数
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set(urlParamName, itemId);
          return newParams;
        },
        { replace: true }
      );
      // 移动端关闭抽屉
      setDrawerState({ isOpen: false });
    },
    [onItemSelect, setSearchParams, urlParamName]
  );

  // 搜索变化处理
  const handleSearchChange = React.useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
      onSearchChange?.(query);
      // 搜索时展开所有分类
      if (query.trim()) {
        setExpandedCategories(new Set(categories.map((c) => c.id)));
      }
    },
    [onSearchChange, categories]
  );

  // 切换分类展开状态
  const toggleCategory = React.useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  // 过滤分类
  const filteredCategories = React.useMemo(
    () => filterCategories(categories, localSearchQuery),
    [categories, localSearchQuery]
  );

  // 导航内容
  const navContent = (
    <div className="flex flex-col h-full">
      {/* 搜索框 */}
      {showSearch && (
        <div className="p-4 border-b border-border">
          <SearchBox
            value={localSearchQuery}
            onChange={handleSearchChange}
            placeholder="搜索..."
          />
        </div>
      )}

      {/* 分类列表 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                activeItemId={activeItemId}
                onItemSelect={handleItemSelect}
                showItemCount={showItemCount}
                isExpanded={expandedCategories.has(category.id)}
                onToggleExpand={() => toggleCategory(category.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">未找到匹配项</p>
              {localSearchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  清除搜索
                </button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside
        className={cn(
          'hidden md:flex flex-col w-64 h-full',
          'border-r border-border bg-card',
          className
        )}
        role="navigation"
        aria-label="侧边栏导航"
      >
        {navContent}
      </aside>

      {/* 移动端汉堡菜单按钮 */}
      <button
        onClick={() => setDrawerState({ isOpen: true })}
        className={cn(
          'md:hidden fixed bottom-4 left-4 z-40',
          'p-3 rounded-full bg-primary text-primary-foreground shadow-lg',
          'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring'
        )}
        aria-label="打开导航菜单"
      >
        <MenuIcon />
      </button>

      {/* 移动端抽屉 */}
      <MobileDrawer
        isOpen={drawerState.isOpen}
        onClose={() => setDrawerState({ isOpen: false })}
      >
        {navContent}
      </MobileDrawer>
    </>
  );
}

export default SidebarNav;
