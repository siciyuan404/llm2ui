/**
 * @file 弹窗组件入口
 * @description 导出 ConfirmDialog、SearchPopup、SelectModelPopup 等弹窗组件
 * @module components/cherry/popup
 */

export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

export { SearchPopup } from './SearchPopup';
export type { SearchPopupProps, SearchResult } from './SearchPopup';

export { SelectModelPopup } from './SelectModelPopup';
export type { SelectModelPopupProps } from './SelectModelPopup';
// ModelOption 和 Provider 类型已在 selector 模块中导出，避免重复导出
export type {
  ModelOption as SelectModelOption,
  Provider as SelectModelProvider,
} from './SelectModelPopup';
