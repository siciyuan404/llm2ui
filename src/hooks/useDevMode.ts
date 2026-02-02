/**
 * @file useDevMode.ts
 * @description 开发者模式 Hook，提供组件轮廓显示和 Alt+点击复制功能
 * @module hooks/useDevMode
 */

import { useCallback } from 'react';
import { useAppStore } from '@/stores';
import type { DevModeStatus, ComponentDebugInfo } from '@/types/state.types';

/**
 * useDevMode Hook 返回类型
 */
export interface UseDevModeReturn {
  /** 开发者模式状态 */
  devMode: DevModeStatus;
  /** 是否开启开发者模式 */
  isDevMode: boolean;
  /** 设置开发者模式 */
  setDevMode: (mode: DevModeStatus) => void;
  /** 切换开发者模式 */
  toggleDevMode: () => void;
  /** 复制组件信息到剪贴板 */
  copyComponentInfo: (info: ComponentDebugInfo) => Promise<void>;
}

/**
 * 开发者模式 Hook
 * 
 * 提供：
 * - 开发者模式状态管理
 * - Alt+点击复制组件信息功能
 * - 组件轮廓显示控制
 */
export function useDevMode(): UseDevModeReturn {
  const devMode = useAppStore((state) => state.devMode);
  const setDevMode = useAppStore((state) => state.setDevMode);
  const toggleDevMode = useAppStore((state) => state.toggleDevMode);

  const isDevMode = devMode === 'on';

  /**
   * 复制组件信息到剪贴板
   */
  const copyComponentInfo = useCallback(async (info: ComponentDebugInfo) => {
    const text = info.lineNumber
      ? `${info.componentName} - ${info.filePath}:${info.lineNumber}`
      : `${info.componentName} - ${info.filePath}`;
    
    try {
      await navigator.clipboard.writeText(text);
      console.log('[DevMode] 已复制:', text);
    } catch (err) {
      console.error('[DevMode] 复制失败:', err);
    }
  }, []);

  return {
    devMode,
    isDevMode,
    setDevMode,
    toggleDevMode,
    copyComponentInfo,
  };
}
