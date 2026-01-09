/**
 * @file VirtualList 组件
 * @description 虚拟列表，只渲染可见项以提高性能
 * @module components/cherry/list/VirtualList
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualListProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  /** 列表项数据 */
  items: T[];
  /** 渲染单个列表项 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 固定项高度或动态高度函数 */
  itemHeight?: number | ((index: number) => number);
  /** 预渲染的额外项数 */
  overscan?: number;
  /** 获取项的唯一 key */
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight = 50,
  overscan = 5,
  getItemKey,
  className,
  ...props
}: VirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === 'function' ? itemHeight : () => itemHeight,
    overscan,
    getItemKey: getItemKey
      ? (index) => getItemKey(items[index], index)
      : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      {...props}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

VirtualList.displayName = 'VirtualList';
