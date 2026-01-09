/**
 * @file theme-storage.ts
 * @description 主题本地存储管理 - 使用 localStorage 存储主题数据
 * @module lib/themes
 * @requirements 16.5, 16.7
 */

import type {
  StoredThemeData,
  SerializedThemePack,
  ThemePack,
} from './types';
import { DEFAULT_THEME_ID } from './types';

/**
 * 存储键名
 */
const STORAGE_KEY = 'llm2ui-theme-data';

/**
 * 默认存储数据
 */
const DEFAULT_STORED_DATA: StoredThemeData = {
  installedThemes: [],
  activeThemeId: DEFAULT_THEME_ID,
  themePacks: {},
  preferences: {
    colorScheme: 'light',
    layout: 'sidebar-left',
  },
};

/**
 * 主题存储管理器
 * 负责主题数据的持久化存储
 */
export class ThemeStorage {
  private static instance: ThemeStorage | null = null;
  private data: StoredThemeData;
  private storageAvailable: boolean;

  private constructor() {
    this.storageAvailable = this.checkStorageAvailable();
    this.data = this.load();
  }

  /**
   * 获取 ThemeStorage 单例实例
   */
  static getInstance(): ThemeStorage {
    if (!ThemeStorage.instance) {
      ThemeStorage.instance = new ThemeStorage();
    }
    return ThemeStorage.instance;
  }

  /**
   * 重置单例实例（仅用于测试）
   */
  static resetInstance(): void {
    ThemeStorage.instance = null;
  }

  /**
   * 检查 localStorage 是否可用
   */
  private checkStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 从 localStorage 加载数据
   */
  private load(): StoredThemeData {
    if (!this.storageAvailable) {
      return { ...DEFAULT_STORED_DATA };
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { ...DEFAULT_STORED_DATA };
      }

      const parsed = JSON.parse(stored) as StoredThemeData;
      // 合并默认值，确保所有字段存在
      return {
        ...DEFAULT_STORED_DATA,
        ...parsed,
        preferences: {
          ...DEFAULT_STORED_DATA.preferences,
          ...parsed.preferences,
        },
      };
    } catch (error) {
      console.error('Failed to load theme data from storage:', error);
      return { ...DEFAULT_STORED_DATA };
    }
  }

  /**
   * 保存数据到 localStorage
   */
  private save(): void {
    if (!this.storageAvailable) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save theme data to storage:', error);
    }
  }

  // ============================================================================
  // 已安装主题管理
  // ============================================================================

  /**
   * 获取已安装的主题 ID 列表
   */
  getInstalledThemeIds(): string[] {
    return [...this.data.installedThemes];
  }

  /**
   * 检查主题是否已安装
   */
  isInstalled(themeId: string): boolean {
    return this.data.installedThemes.includes(themeId);
  }

  /**
   * 添加已安装主题
   */
  addInstalledTheme(themeId: string): void {
    if (!this.data.installedThemes.includes(themeId)) {
      this.data.installedThemes.push(themeId);
      this.save();
    }
  }

  /**
   * 移除已安装主题
   */
  removeInstalledTheme(themeId: string): void {
    const index = this.data.installedThemes.indexOf(themeId);
    if (index !== -1) {
      this.data.installedThemes.splice(index, 1);
      // 同时删除主题包数据
      delete this.data.themePacks[themeId];
      this.save();
    }
  }

  // ============================================================================
  // 主题包数据管理
  // ============================================================================

  /**
   * 保存序列化的主题包
   */
  saveThemePack(themePack: SerializedThemePack): void {
    this.data.themePacks[themePack.id] = themePack;
    if (!this.data.installedThemes.includes(themePack.id)) {
      this.data.installedThemes.push(themePack.id);
    }
    this.save();
  }

  /**
   * 获取序列化的主题包
   */
  getThemePack(themeId: string): SerializedThemePack | undefined {
    return this.data.themePacks[themeId];
  }

  /**
   * 获取所有序列化的主题包
   */
  getAllThemePacks(): SerializedThemePack[] {
    return Object.values(this.data.themePacks);
  }

  /**
   * 删除主题包
   */
  deleteThemePack(themeId: string): void {
    delete this.data.themePacks[themeId];
    this.removeInstalledTheme(themeId);
  }

  // ============================================================================
  // 激活主题管理
  // ============================================================================

  /**
   * 获取当前激活的主题 ID
   */
  getActiveThemeId(): string {
    return this.data.activeThemeId;
  }

  /**
   * 设置当前激活的主题 ID
   */
  setActiveThemeId(themeId: string): void {
    this.data.activeThemeId = themeId;
    this.save();
  }

  // ============================================================================
  // 用户偏好管理
  // ============================================================================

  /**
   * 获取用户偏好的配色方案
   */
  getColorSchemePreference(): string {
    return this.data.preferences.colorScheme;
  }

  /**
   * 设置用户偏好的配色方案
   */
  setColorSchemePreference(schemeId: string): void {
    this.data.preferences.colorScheme = schemeId;
    this.save();
  }

  /**
   * 获取用户偏好的布局
   */
  getLayoutPreference(): string {
    return this.data.preferences.layout;
  }

  /**
   * 设置用户偏好的布局
   */
  setLayoutPreference(layoutId: string): void {
    this.data.preferences.layout = layoutId;
    this.save();
  }

  /**
   * 获取所有用户偏好
   */
  getPreferences(): StoredThemeData['preferences'] {
    return { ...this.data.preferences };
  }

  /**
   * 设置所有用户偏好
   */
  setPreferences(preferences: Partial<StoredThemeData['preferences']>): void {
    this.data.preferences = {
      ...this.data.preferences,
      ...preferences,
    };
    this.save();
  }

  // ============================================================================
  // 数据管理
  // ============================================================================

  /**
   * 获取完整的存储数据
   */
  getData(): StoredThemeData {
    return {
      ...this.data,
      installedThemes: [...this.data.installedThemes],
      themePacks: { ...this.data.themePacks },
      preferences: { ...this.data.preferences },
    };
  }

  /**
   * 清除所有存储数据
   */
  clear(): void {
    this.data = { ...DEFAULT_STORED_DATA };
    if (this.storageAvailable) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * 检查存储是否可用
   */
  isStorageAvailable(): boolean {
    return this.storageAvailable;
  }
}

// ============================================================================
// 序列化工具函数
// ============================================================================

/**
 * 将 ThemePack 序列化为可存储的格式
 * 注意：components.registry 不会被序列化，需要在加载时重新构建
 */
export function serializeThemePack(theme: ThemePack): SerializedThemePack {
  return {
    id: theme.id,
    name: theme.name,
    description: theme.description,
    version: theme.version,
    author: theme.author,
    repository: theme.repository,
    homepage: theme.homepage,
    previewImage: theme.previewImage,
    tokens: theme.tokens,
    examples: theme.examples,
    prompts: theme.prompts,
    validation: theme.validation,
    colorSchemes: theme.colorSchemes,
    layouts: theme.layouts,
    extensions: theme.extensions,
  };
}

// 导出单例获取函数
export const getThemeStorage = (): ThemeStorage => ThemeStorage.getInstance();
