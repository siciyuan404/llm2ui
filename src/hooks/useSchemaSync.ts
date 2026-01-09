/**
 * @file useSchemaSync.ts
 * @description Schema 同步 Hook，封装 schema 同步逻辑
 * @module hooks/useSchemaSync
 * @requirements 4.2
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useAppStore } from '@/stores';
import { SchemaSyncer, type SyncResult, type SchemaSyncCallback } from '@/lib';
import type { UISchema, DataContext } from '@/types';

/**
 * useSchemaSync Hook 返回类型
 */
export interface UseSchemaSync {
  /** SchemaSyncer 实例 */
  schemaSyncer: SchemaSyncer;
  /** 同步 schema 到编辑器 */
  syncSchema: (schema: UISchema) => SyncResult;
  /** 同步数据上下文 */
  syncData: (schema: UISchema, existingData?: DataContext) => SyncResult;
  /** 从 LLM 响应提取并同步 */
  extractAndSync: (response: string, existingData?: DataContext) => SyncResult;
  /** 订阅同步事件 */
  subscribe: (callback: SchemaSyncCallback) => () => void;
  /** 处理同步结果 */
  handleSyncResult: (result: SyncResult) => void;
  /** 当前 schema */
  currentSchema: UISchema | null;
  /** 当前数据上下文 */
  currentData: DataContext;
}

/**
 * Schema 同步 Hook
 * 
 * 封装 schema 同步逻辑，集成 SchemaSyncer 和 appStore。
 * 提供统一的接口来管理 schema 和数据上下文的同步。
 * 
 * @returns UseSchemaSync 接口
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { schemaSyncer, syncSchema, handleSyncResult } = useSchemaSync();
 *   
 *   const handleSchemaChange = (schema: UISchema) => {
 *     const result = syncSchema(schema);
 *     handleSyncResult(result);
 *   };
 * }
 * ```
 */
export function useSchemaSync(): UseSchemaSync {
  // 从 store 获取状态和 actions
  const schema = useAppStore((state) => state.schema);
  const dataContext = useAppStore((state) => state.dataContext);
  const setSchema = useAppStore((state) => state.setSchema);
  const setJsonContent = useAppStore((state) => state.setJsonContent);
  const setDataContext = useAppStore((state) => state.setDataContext);

  // 创建 SchemaSyncer 实例（memoized）
  const schemaSyncer = useMemo(() => new SchemaSyncer(), []);

  // 订阅 SchemaSyncer 事件，同步到 store
  useEffect(() => {
    const unsubscribe = schemaSyncer.onSync((event) => {
      if (event.type === 'schema_updated' && event.schema) {
        setSchema(event.schema);
        setJsonContent(JSON.stringify(event.schema, null, 2));
      } else if (event.type === 'data_updated' && event.data) {
        setDataContext(event.data);
      }
    });
    return unsubscribe;
  }, [schemaSyncer, setSchema, setJsonContent, setDataContext]);

  // 同步 schema 到编辑器
  const syncSchema = useCallback(
    (newSchema: UISchema): SyncResult => {
      return schemaSyncer.syncToJsonEditor(newSchema);
    },
    [schemaSyncer]
  );

  // 同步数据上下文
  const syncData = useCallback(
    (newSchema: UISchema, existingData?: DataContext): SyncResult => {
      return schemaSyncer.syncToDataBindingEditor(newSchema, {
        preserveExistingData: true,
        existingData: existingData || dataContext,
      });
    },
    [schemaSyncer, dataContext]
  );

  // 从 LLM 响应提取并同步
  const extractAndSync = useCallback(
    (response: string, existingData?: DataContext): SyncResult => {
      return schemaSyncer.extractAndSync(response, {
        preserveExistingData: true,
        existingData: existingData || dataContext,
      });
    },
    [schemaSyncer, dataContext]
  );

  // 订阅同步事件
  const subscribe = useCallback(
    (callback: SchemaSyncCallback): (() => void) => {
      return schemaSyncer.onSync(callback);
    },
    [schemaSyncer]
  );

  // 处理同步结果，更新 store
  const handleSyncResult = useCallback(
    (result: SyncResult) => {
      if (result.success) {
        if (result.schema) {
          setSchema(result.schema);
          setJsonContent(JSON.stringify(result.schema, null, 2));
        }
        if (result.data) {
          setDataContext(result.data);
        }
      }
    },
    [setSchema, setJsonContent, setDataContext]
  );

  return {
    schemaSyncer,
    syncSchema,
    syncData,
    extractAndSync,
    subscribe,
    handleSyncResult,
    currentSchema: schema,
    currentData: dataContext,
  };
}

export default useSchemaSync;
