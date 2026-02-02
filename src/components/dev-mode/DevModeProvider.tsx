/**
 * @file DevModeProvider.tsx
 * @description 开发者模式 Provider，为子组件提供轮廓显示和 Alt+点击功能
 * @module components/dev-mode/DevModeProvider
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useDevMode } from '@/hooks/useDevMode';
import type { ComponentDebugInfo } from '@/types/state.types';

/**
 * DevModeProvider Props
 */
interface DevModeProviderProps {
  children: React.ReactNode;
}

/**
 * 从 React Fiber 获取组件信息
 * React 在 DOM 元素上存储了 Fiber 节点信息
 */
function getReactFiberInfo(element: HTMLElement): ComponentDebugInfo | null {
  // React 17+ 使用 __reactFiber$ 前缀
  // React 16 使用 __reactInternalInstance$ 前缀
  const fiberKey = Object.keys(element).find(
    key => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
  );
  
  if (!fiberKey) return null;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fiber = (element as any)[fiberKey];
  
  // 向上遍历 Fiber 树找到最近的函数/类组件
  while (fiber) {
    const componentName = getComponentName(fiber);
    if (componentName && !isBuiltInComponent(componentName)) {
      // 尝试获取源码位置
      const source = fiber._debugSource || fiber._source;
      const filePath = source?.fileName || getFileFromStack(fiber) || '未知文件';
      const lineNumber = source?.lineNumber;
      
      return {
        componentName,
        filePath: normalizeFilePath(filePath),
        lineNumber,
      };
    }
    fiber = fiber.return;
  }
  
  return null;
}

/**
 * 获取组件名称
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getComponentName(fiber: any): string | null {
  if (!fiber || !fiber.type) return null;
  
  // 函数组件
  if (typeof fiber.type === 'function') {
    return fiber.type.displayName || fiber.type.name || null;
  }
  
  // 类组件
  if (typeof fiber.type === 'object' && fiber.type !== null) {
    // forwardRef, memo 等
    if (fiber.type.displayName) return fiber.type.displayName;
    if (fiber.type.render?.displayName) return fiber.type.render.displayName;
    if (fiber.type.render?.name) return fiber.type.render.name;
  }
  
  // 原生 DOM 元素
  if (typeof fiber.type === 'string') {
    return fiber.type;
  }
  
  return null;
}

/**
 * 检查是否为内置组件（跳过）
 */
function isBuiltInComponent(name: string): boolean {
  // 跳过原生 HTML 元素和 React 内置组件
  const builtIns = ['div', 'span', 'p', 'a', 'button', 'input', 'form', 'Fragment', 'Suspense', 'StrictMode'];
  return builtIns.includes(name) || /^[a-z]/.test(name);
}

/**
 * 从错误堆栈尝试获取文件路径
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFileFromStack(fiber: any): string | null {
  try {
    // 某些情况下可以从组件函数获取
    if (fiber.type && typeof fiber.type === 'function') {
      const fnStr = fiber.type.toString();
      // 尝试匹配 source map 注释或文件路径
      const match = fnStr.match(/\/\/# sourceURL=(.+)/);
      if (match) return match[1];
    }
  } catch {
    // 忽略错误
  }
  return null;
}

/**
 * 规范化文件路径（移除 webpack/vite 前缀）
 */
function normalizeFilePath(path: string): string {
  // 移除常见的构建工具前缀
  return path
    .replace(/^webpack:\/\/[^/]*\//, '')
    .replace(/^\/src\//, 'src/')
    .replace(/\?.*$/, ''); // 移除查询参数
}

/**
 * 从 DOM 元素获取组件调试信息（优先使用 data 属性，其次使用 Fiber）
 */
function getComponentDebugInfo(element: HTMLElement): ComponentDebugInfo | null {
  // 优先使用手动添加的 data 属性
  const componentName = element.dataset.devComponent;
  const filePath = element.dataset.devFile;
  const lineNumber = element.dataset.devLine;

  if (componentName && filePath) {
    return {
      componentName,
      filePath,
      lineNumber: lineNumber ? parseInt(lineNumber, 10) : undefined,
    };
  }
  
  // 尝试从 React Fiber 获取
  return getReactFiberInfo(element);
}

/**
 * 查找最近的有组件信息的元素
 */
function findComponentElement(target: HTMLElement): { element: HTMLElement; info: ComponentDebugInfo } | null {
  let current: HTMLElement | null = target;
  
  while (current) {
    const info = getComponentDebugInfo(current);
    if (info) {
      return { element: current, info };
    }
    current = current.parentElement;
  }
  
  return null;
}

/**
 * 开发者模式 Provider
 * 
 * 功能：
 * - 开启时为所有元素添加轮廓
 * - Alt+点击复制组件名和代码位置
 */
export function DevModeProvider({ children }: DevModeProviderProps) {
  const { isDevMode, copyComponentInfo } = useDevMode();
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 处理 Alt+点击事件
   */
  const handleClick = useCallback((event: MouseEvent) => {
    if (!isDevMode || !event.altKey) return;

    const target = event.target as HTMLElement;
    const result = findComponentElement(target);
    
    if (result) {
      event.preventDefault();
      event.stopPropagation();
      
      copyComponentInfo(result.info);
      
      // 视觉反馈：短暂高亮
      result.element.style.outline = '3px solid #22c55e';
      result.element.style.outlineOffset = '2px';
      setTimeout(() => {
        result.element.style.outline = '';
        result.element.style.outlineOffset = '';
      }, 300);
    }
  }, [isDevMode, copyComponentInfo]);

  /**
   * 绑定全局点击事件
   */
  useEffect(() => {
    if (isDevMode) {
      document.addEventListener('click', handleClick, true);
      return () => {
        document.removeEventListener('click', handleClick, true);
      };
    }
  }, [isDevMode, handleClick]);

  return (
    <div
      ref={containerRef}
      className={isDevMode ? 'dev-mode-active' : ''}
      data-dev-mode={isDevMode ? 'on' : 'off'}
    >
      {children}
      {/* 开发者模式全局样式 */}
      {isDevMode && (
        <style>{`
          /* 所有元素显示轮廓 */
          .dev-mode-active * {
            outline: 1px dashed rgba(59, 130, 246, 0.3) !important;
          }
          .dev-mode-active *:hover {
            outline: 1px solid rgba(59, 130, 246, 0.6) !important;
          }
          /* 带调试信息的组件高亮显示 */
          .dev-mode-active [data-dev-component] {
            outline: 1px dashed rgba(234, 88, 12, 0.6) !important;
            outline-offset: 1px;
          }
          .dev-mode-active [data-dev-component]:hover {
            outline: 2px solid rgba(234, 88, 12, 0.9) !important;
            outline-offset: 1px;
          }
        `}</style>
      )}
    </div>
  );
}

export default DevModeProvider;
