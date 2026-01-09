/**
 * @file DraggableList 组件
 * @description 支持拖拽排序的列表
 * @module components/cherry/list/DraggableList
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

export interface DraggableListProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  /** 列表项数据 */
  items: T[];
  /** 渲染单个列表项 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 重新排序回调 */
  onReorder?: (items: T[]) => void;
  /** 获取项的唯一 key */
  getItemKey?: (item: T, index: number) => string | number;
  /** 是否显示拖拽手柄 */
  showHandle?: boolean;
}

export function DraggableList<T>({
  items,
  renderItem,
  onReorder,
  getItemKey,
  showHandle = true,
  className,
  ...props
}: DraggableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    onReorder?.(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {items.map((item, index) => {
        const key = getItemKey ? getItemKey(item, index) : index;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div
            key={key}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'flex items-center gap-2 rounded-[var(--cherry-list-item-border-radius)]',
              'transition-all duration-150',
              isDragging && 'opacity-50',
              isDragOver && 'ring-2 ring-[var(--cherry-primary)] ring-offset-1'
            )}
          >
            {showHandle && (
              <div className="cursor-grab active:cursor-grabbing p-1 text-[var(--cherry-icon)]">
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <div className="flex-1">{renderItem(item, index)}</div>
          </div>
        );
      })}
    </div>
  );
}

DraggableList.displayName = 'DraggableList';
