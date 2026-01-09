/**
 * @file theme-registry.ts
 * @description 主题注册表 - 管理可用主题列表、安装和更新
 * @module lib/themes
 * @requirements 15.1, 15.2, 15.3, 15.4, 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 18.1, 18.2
 */

import type {
  ThemePack,
  ThemeMetadata,
  ThemeRegistryConfig,
  ThemeRegistryEntry,
  ThemeUpdateInfo,
} from './types';
import { ThemeError, ThemeErrorCode, DEFAULT_THEME_ID } from './types';
import { ThemeManager } from './theme-manager';
import { ThemeStorage, serializeThemePack } from './theme-storage';
import { validateThemePack } from './theme-validator';

// 内置主题 ID 列表
const BUILTIN_THEME_IDS = ['shadcn-ui', 'cherry', 'discord'];

/**
 * 主题注册表 - 管理可用主题列表
 */
export class ThemeRegistry {
  private static instance: ThemeRegistry | null = null;
  private registryConfig: ThemeRegistryConfig | null = null;
  private themeManager: ThemeManager;
  private themeStorage: ThemeStorage;

  private constructor() {
    this.themeManager = ThemeManager.getInstance();
    this.themeStorage = ThemeStorage.getInstance();
  }

  /**
   * 获取 ThemeRegistry 单例实例
   */
  static getInstance(): ThemeRegistry {
    if (!ThemeRegistry.instance) {
      ThemeRegistry.instance = new ThemeRegistry();
    }
    return ThemeRegistry.instance;
  }

  /**
   * 重置单例实例（仅用于测试）
   */
  static resetInstance(): void {
    ThemeRegistry.instance = null;
  }

  // ============================================================================
  // 注册表获取
  // ============================================================================

  /**
   * 获取注册表配置
   * 从本地 JSON 文件加载
   */
  async fetchRegistry(): Promise<ThemeMetadata[]> {
    try {
      // 动态导入注册表配置
      const config = await import('./themes-registry.json');
      this.registryConfig = (config.default || config) as unknown as ThemeRegistryConfig;

      // 转换为 ThemeMetadata 格式
      return this.registryConfig!.themes.map((entry) => ({
        id: entry.id,
        name: entry.name,
        description: entry.description,
        version: entry.version,
        author: entry.author,
        repository: entry.repository,
        previewImage: entry.previewImage,
        category: entry.category as 'builtin' | 'community',
        installed: this.isInstalled(entry.id),
      }));
    } catch (error) {
      console.error('Failed to fetch theme registry:', error);
      return [];
    }
  }

  /**
   * 获取缓存的注册表配置
   */
  getRegistryConfig(): ThemeRegistryConfig | null {
    return this.registryConfig;
  }

  /**
   * 获取注册表中的主题条目
   */
  getRegistryEntry(themeId: string): ThemeRegistryEntry | undefined {
    return this.registryConfig?.themes.find((t) => t.id === themeId);
  }

  // ============================================================================
  // 安装/卸载
  // ============================================================================

  /**
   * 安装主题
   * @param themeId 主题 ID
   * @returns 安装的主题包
   */
  async installTheme(themeId: string): Promise<ThemePack> {
    // 检查是否已安装
    if (this.isInstalled(themeId)) {
      const existingTheme = this.themeManager.getTheme(themeId);
      if (existingTheme) {
        return existingTheme;
      }
    }

    // 获取注册表条目
    const entry = this.getRegistryEntry(themeId);
    if (!entry) {
      throw new ThemeError(
        ThemeErrorCode.THEME_NOT_FOUND,
        `Theme "${themeId}" not found in registry`,
        { themeId }
      );
    }

    // 内置主题直接从模块加载
    if (BUILTIN_THEME_IDS.includes(themeId)) {
      return this.loadBuiltinTheme(themeId);
    }

    // 社区主题从 URL 下载
    if (!entry.downloadUrl) {
      throw new ThemeError(
        ThemeErrorCode.DOWNLOAD_FAILED,
        `No download URL for theme "${themeId}"`,
        { themeId }
      );
    }

    return this.downloadAndInstallTheme(entry);
  }

  /**
   * 加载内置主题
   */
  private async loadBuiltinTheme(themeId: string): Promise<ThemePack> {
    try {
      let themePack: ThemePack;

      if (themeId === 'shadcn-ui') {
        const module = await import('./builtin/shadcn');
        themePack = module.shadcnThemePack;
      } else if (themeId === 'cherry') {
        const module = await import('./builtin/cherry');
        themePack = module.cherryThemePack;
      } else if (themeId === 'discord') {
        const module = await import('./builtin/discord');
        themePack = module.discordThemePack;
      } else {
        throw new ThemeError(
          ThemeErrorCode.THEME_NOT_FOUND,
          `Unknown builtin theme "${themeId}"`,
          { themeId }
        );
      }

      // 注册到 ThemeManager
      if (!this.themeManager.hasTheme(themeId)) {
        this.themeManager.register(themePack);
      }

      // 标记为已安装
      this.themeStorage.addInstalledTheme(themeId);

      return themePack;
    } catch (error) {
      if (error instanceof ThemeError) {
        throw error;
      }
      throw new ThemeError(
        ThemeErrorCode.DOWNLOAD_FAILED,
        `Failed to load builtin theme "${themeId}": ${error}`,
        { themeId, error }
      );
    }
  }

  /**
   * 从 URL 下载并安装主题
   */
  private async downloadAndInstallTheme(entry: ThemeRegistryEntry): Promise<ThemePack> {
    try {
      // 下载主题包
      const response = await fetch(entry.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const themeData = await response.json();

      // 验证主题包结构
      const validation = validateThemePack(themeData);
      if (!validation.valid) {
        throw new ThemeError(
          ThemeErrorCode.INVALID_THEME_PACK,
          `Invalid theme pack: ${validation.errors.join(', ')}`,
          { themeId: entry.id, errors: validation.errors }
        );
      }

      const themePack = themeData as ThemePack;

      // 注册到 ThemeManager
      if (!this.themeManager.hasTheme(themePack.id)) {
        this.themeManager.register(themePack);
      }

      // 保存到本地存储
      this.themeStorage.saveThemePack(serializeThemePack(themePack));

      return themePack;
    } catch (error) {
      if (error instanceof ThemeError) {
        throw error;
      }
      throw new ThemeError(
        ThemeErrorCode.DOWNLOAD_FAILED,
        `Failed to download theme "${entry.id}": ${error}`,
        { themeId: entry.id, error }
      );
    }
  }

  /**
   * 卸载主题
   * @param themeId 主题 ID
   */
  async uninstallTheme(themeId: string): Promise<void> {
    // 检查是否为内置主题
    if (BUILTIN_THEME_IDS.includes(themeId)) {
      throw new ThemeError(
        ThemeErrorCode.CANNOT_UNINSTALL_BUILTIN,
        `Cannot uninstall builtin theme "${themeId}"`,
        { themeId }
      );
    }

    // 检查是否已安装
    if (!this.isInstalled(themeId)) {
      throw new ThemeError(
        ThemeErrorCode.THEME_NOT_FOUND,
        `Theme "${themeId}" is not installed`,
        { themeId }
      );
    }

    // 如果是当前激活的主题，先切换到默认主题
    if (this.themeManager.getActiveThemeId() === themeId) {
      this.themeManager.setActiveTheme(DEFAULT_THEME_ID);
    }

    // 从 ThemeManager 注销
    if (this.themeManager.hasTheme(themeId)) {
      this.themeManager.unregister(themeId);
    }

    // 从本地存储删除
    this.themeStorage.deleteThemePack(themeId);
  }

  // ============================================================================
  // 更新检查
  // ============================================================================

  /**
   * 检查所有已安装主题的更新
   */
  async checkUpdates(): Promise<ThemeUpdateInfo[]> {
    const updates: ThemeUpdateInfo[] = [];
    const installedIds = this.getInstalledThemeIds();

    // 确保注册表已加载
    if (!this.registryConfig) {
      await this.fetchRegistry();
    }

    for (const themeId of installedIds) {
      const updateInfo = await this.checkThemeUpdate(themeId);
      if (updateInfo) {
        updates.push(updateInfo);
      }
    }

    return updates;
  }

  /**
   * 检查单个主题的更新
   */
  private async checkThemeUpdate(themeId: string): Promise<ThemeUpdateInfo | null> {
    const entry = this.getRegistryEntry(themeId);
    if (!entry) {
      return null;
    }

    const installedTheme = this.themeManager.getTheme(themeId);
    if (!installedTheme) {
      return null;
    }

    const currentVersion = installedTheme.version;
    const latestVersion = entry.version;

    return {
      themeId,
      currentVersion,
      latestVersion,
      updateAvailable: this.isNewerVersion(latestVersion, currentVersion),
    };
  }

  /**
   * 比较版本号
   */
  private isNewerVersion(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const l = latestParts[i] || 0;
      const c = currentParts[i] || 0;
      if (l > c) return true;
      if (l < c) return false;
    }

    return false;
  }

  /**
   * 更新主题
   * @param themeId 主题 ID
   */
  async updateTheme(themeId: string): Promise<ThemePack> {
    // 内置主题不支持更新
    if (BUILTIN_THEME_IDS.includes(themeId)) {
      const theme = this.themeManager.getTheme(themeId);
      if (theme) {
        return theme;
      }
      return this.loadBuiltinTheme(themeId);
    }

    // 获取注册表条目
    const entry = this.getRegistryEntry(themeId);
    if (!entry) {
      throw new ThemeError(
        ThemeErrorCode.THEME_NOT_FOUND,
        `Theme "${themeId}" not found in registry`,
        { themeId }
      );
    }

    // 记录当前是否为激活主题
    const wasActive = this.themeManager.getActiveThemeId() === themeId;

    // 卸载旧版本
    if (this.themeManager.hasTheme(themeId)) {
      // 临时切换到默认主题
      if (wasActive) {
        this.themeManager.setActiveTheme(DEFAULT_THEME_ID);
      }
      this.themeManager.unregister(themeId);
    }

    // 安装新版本
    const newTheme = await this.downloadAndInstallTheme(entry);

    // 恢复激活状态
    if (wasActive) {
      this.themeManager.setActiveTheme(themeId);
    }

    return newTheme;
  }

  // ============================================================================
  // 查询方法
  // ============================================================================

  /**
   * 获取已安装的主题 ID 列表
   */
  getInstalledThemeIds(): string[] {
    return this.themeStorage.getInstalledThemeIds();
  }

  /**
   * 获取已安装的主题列表
   */
  getInstalledThemes(): ThemePack[] {
    return this.themeManager.getAllThemes();
  }

  /**
   * 检查主题是否已安装
   */
  isInstalled(themeId: string): boolean {
    return (
      this.themeStorage.isInstalled(themeId) || this.themeManager.hasTheme(themeId)
    );
  }

  /**
   * 检查是否为内置主题
   */
  isBuiltinTheme(themeId: string): boolean {
    return BUILTIN_THEME_IDS.includes(themeId);
  }

  /**
   * 获取所有可用主题的元数据
   * 包括已安装和未安装的
   */
  async getAllAvailableThemes(): Promise<ThemeMetadata[]> {
    return this.fetchRegistry();
  }

  /**
   * 按类别获取主题
   */
  async getThemesByCategory(
    category: 'builtin' | 'community' | 'installed'
  ): Promise<ThemeMetadata[]> {
    const allThemes = await this.fetchRegistry();

    if (category === 'installed') {
      return allThemes.filter((t) => t.installed);
    }

    return allThemes.filter((t) => t.category === category);
  }

  /**
   * 搜索主题
   */
  async searchThemes(query: string): Promise<ThemeMetadata[]> {
    const allThemes = await this.fetchRegistry();
    const lowerQuery = query.toLowerCase();

    return allThemes.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// 导出单例获取函数
export const getThemeRegistry = (): ThemeRegistry => ThemeRegistry.getInstance();
