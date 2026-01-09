/**
 * @file useEditorResize.ts
 * @description 编辑器面板拖拽调整大小 Hook
 * @module hooks/useEditorResize
 * @requirements 4.4
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores';

/**
 * useEditorResize Hook 返回类型
 */
export interface UseEditorResize {
  /** 编辑器分割比例 (0-100) */
  splitPercent: number;
  /** 是否正在调整大小 */
  isResizing: boolean;
  /** 开始拖拽调整大小 */
  handleResizeStart: (e: React.MouseEvent) => void;
  /** 容器 ref，需要绑定到编辑器容器元素 */
  containerRef: React.RefObject<HTMLDivElement>;
  /** 设置分割比例 */
  setSplitPercent: (percent: number) => void;
}

/**
 * 拖拽起始状态
 */
interface DragStartState {
  /** 起始 Y 坐标 */
  y: number;
  /** 起始分割比例 */
  percent: number;
}

/**
 * 编辑器面板拖拽调整大小 Hook
 * 
 * 封装编辑器面板的拖拽调整大小逻辑。
 * 集成 appStore 的 UI 状态，提供统一的拖拽管理接口。
 * 
 * @returns UseEditorResize 接口
 * 
 * @example
 * ```tsx
 * function EditorPanel() {
 *   const { splitPercent, isResizing, handleResizeStart, containerRef } = useEditorResize();
 *   
 *   return (
 *     <div ref={containerRef} className={isResizing ? 'select-none' : ''}>
 *       <div style={{ height: `${splitPercent}%` }}>
 *         <JsonEditor />
 *       </div>
 *       <ResizeHandle onDragStart={handleResizeStart} isDragging={isResizing} />
 *       <div style={{ height: `${100 - splitPercent}%` }}>
 *         <DataEditor />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEditorResize(): UseEditorResize {
  // 从 store 获取状态和 actions
  const splitPercent = useAppStore((state) => state.editorSplitPercent);
  const isResizing = useAppStore((state) => state.isResizingEditor);
  const setEditorSplitPercent = useAppStore((state) => state.setEditorSplitPercent);
  const setIsResizingEditor = useAppStore((state) => state.setIsResizingEditor);

  // 容器 ref
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 拖拽起始状态 ref
  const dragStartRef = useRef<DragStartState>({ y: 0, percent: splitPercent });

  // 开始拖拽
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizingEditor(true);
      dragStartRef.current = { y: e.clientY, percent: splitPercent };
    },
    [splitPercent, setIsResizingEditor]
  );

  // 设置分割比例
  const setSplitPercent = useCallback(
    (percent: number) => {
      setEditorSplitPercent(percent);
    },
    [setEditorSplitPercent]
  );

  // 处理拖拽移动和结束
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const containerHeight = container.getBoundingClientRect().height;
      const deltaY = e.clientY - dragStartRef.current.y;
      const deltaPercent = (deltaY / containerHeight) * 100;
      const newPercent = Math.max(20, Math.min(90, dragStartRef.current.percent + deltaPercent));
      setEditorSplitPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsResizingEditor(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setEditorSplitPercent, setIsResizingEditor]);

  return {
    splitPercent,
    isResizing,
    handleResizeStart,
    containerRef,
    setSplitPercent,
  };
}

export default useEditorResize;
