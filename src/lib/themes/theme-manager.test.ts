/**
 * @file theme-manager.test.ts
 * @description ThemeManager 的属性测试和单元测试
 * @module lib/themes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { ThemeManager, createNamespacedComponentName, parseNamespacedComponentName } from './theme-manager';
import type { ThemePack, ThemeChangeEvent } from './types';
import { ThemeErrorCode } from './types';

// ============================================================================
// 测试辅助函数
// ============================================================================

/**
 * 创建一个最小的有效 ThemePack
 */
function createMockThemePack(id: string, name?: string): ThemePack {
  return {
    id,
    name: name || `Theme ${id}`,
    description: `Description for ${id}`,
    version: '1.0.0',
    tokens: {
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        primary: '#0066cc',
        primaryForeground: '#ffffff',
        secondary: '#666666',
        secondaryForeground: '#ffffff',
        accent: '#ff6600',
        accentForeground: '#ffffff',
        muted: '#f5f5f5',
        mutedForeground: '#666666',
        border: '#e0e0e0',
        ring: '#0066cc',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      typography: {
        fontFamily: {
          sans: 'ui-sans-serif, system-ui, sans-serif',
          mono: 'ui-monospace, monospace',
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75',
        },
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      radius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
    components: {
      registry: new Map() as any,
    },
    examples: {
      presets: [],
    },
    prompts: {
      templates: {
        zh: {
          systemIntro: '系统介绍',
          iconGuidelines: '图标指南',
          componentDocs: '组件文档',
          positiveExamples: '正面案例',
          negativeExamples: '负面案例',
          closing: '结束语',
        },
        en: {
          systemIntro: 'System intro',
          iconGuidelines: 'Icon guidelines',
          componentDocs: 'Component docs',
          positiveExamples: 'Positive examples',
          negativeExamples: 'Negative examples',
          closing: 'Closing',
        },
      },
    },
    colorSchemes: [
      {
        id: 'light',
        name: 'Light',
        type: 'light',
        colors: {
          background: '#ffffff',
          foreground: '#000000',
          primary: '#0066cc',
          secondary: '#666666',
          accent: '#ff6600',
          muted: '#f5f5f5',
          border: '#e0e0e0',
        },
      },
    ],
    layouts: [
      {
        id: 'default',
        name: 'Default',
        description: 'Default layout',
        config: {
          sidebar: 'left',
          mainContent: 'full',
          previewPanel: 'right',
        },
      },
    ],
  };
}


/**
 * 生成有效的主题 ID
 */
const themeIdArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/);

// ============================================================================
// Property Tests
// ============================================================================

describe('ThemeManager - Property Tests', () => {
  beforeEach(() => {
    ThemeManager.resetInstance();
  });

  /**
   * Property 3: Theme Component Dynamic Loading/Unloading
   * For any theme switch operation, the old theme's components SHALL be unloaded
   * and the new theme's components SHALL be loaded, with the component registry
   * correctly reflecting the current theme's state.
   * 
   * **Feature: codebase-refactor, Property 3: 主题组件动态加载/卸载**
   * **Validates: Requirements 2.3**
   */
  describe('Property 3: Theme Component Dynamic Loading/Unloading', () => {
    it('should unload old theme components and load new theme components on switch', () => {
      fc.assert(
        fc.property(
          fc.array(themeIdArb, { minLength: 2, maxLength: 5 })
            .filter(ids => new Set(ids).size === ids.length),
          (themeIds) => {
            const manager = ThemeManager.getInstance();
            
            // 注册所有主题（使用 definitions 模式）
            for (const id of themeIds) {
              const theme = createMockThemePack(id);
              // 添加 definitions 模式的组件配置
              theme.components = {
                definitions: [
                  { name: `${id}-button`, description: `Button for ${id}` },
                  { name: `${id}-input`, description: `Input for ${id}` },
                ],
                componentFactory: (name: string) => {
                  // 返回一个简单的组件
                  return () => null;
                },
              };
              manager.register(theme);
            }
            
            // 激活第一个主题
            manager.setActiveTheme(themeIds[0]);
            
            // 验证第一个主题的组件已加载
            expect(manager.hasLoadedComponents(themeIds[0])).toBe(true);
            const loadedNames1 = manager.getLoadedComponentNames(themeIds[0]);
            expect(loadedNames1.length).toBe(2);
            
            // 切换到第二个主题
            manager.setActiveTheme(themeIds[1]);
            
            // 验证第一个主题的组件已卸载
            expect(manager.hasLoadedComponents(themeIds[0])).toBe(false);
            
            // 验证第二个主题的组件已加载
            expect(manager.hasLoadedComponents(themeIds[1])).toBe(true);
            const loadedNames2 = manager.getLoadedComponentNames(themeIds[1]);
            expect(loadedNames2.length).toBe(2);
            
            ThemeManager.resetInstance();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should correctly reflect component state after multiple theme switches', () => {
      fc.assert(
        fc.property(
          fc.array(themeIdArb, { minLength: 3, maxLength: 5 })
            .filter(ids => new Set(ids).size === ids.length),
          fc.array(fc.nat({ max: 4 }), { minLength: 5, maxLength: 10 }),
          (themeIds, switchIndices) => {
            const manager = ThemeManager.getInstance();
            
            // 注册所有主题
            for (const id of themeIds) {
              const theme = createMockThemePack(id);
              theme.components = {
                definitions: [
                  { name: `${id}-component`, description: `Component for ${id}` },
                ],
                componentFactory: () => () => null,
              };
              manager.register(theme);
            }
            
            // 激活第一个主题
            manager.setActiveTheme(themeIds[0]);
            
            // 执行多次主题切换
            for (const idx of switchIndices) {
              const targetIdx = idx % themeIds.length;
              const targetId = themeIds[targetIdx];
              
              manager.setActiveTheme(targetId);
              
              // 验证：只有当前激活的主题有加载的组件
              for (const id of themeIds) {
                if (id === targetId) {
                  expect(manager.hasLoadedComponents(id)).toBe(true);
                } else {
                  expect(manager.hasLoadedComponents(id)).toBe(false);
                }
              }
            }
            
            ThemeManager.resetInstance();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 4: Component Namespace Isolation
   * For any two different themes with same-named components, when registered
   * to the component registry, they SHALL be distinguishable through namespacing.
   * 
   * **Feature: codebase-refactor, Property 4: 组件命名空间隔离**
   * **Validates: Requirements 2.5**
   */
  describe('Property 4: Component Namespace Isolation', () => {
    it('should namespace components from different themes to avoid conflicts', () => {
      fc.assert(
        fc.property(
          fc.array(themeIdArb, { minLength: 2, maxLength: 4 })
            .filter(ids => new Set(ids).size === ids.length),
          fc.stringMatching(/^[a-z][a-z0-9-]{0,9}$/), // 共同的组件名
          (themeIds, commonComponentName) => {
            const manager = ThemeManager.getInstance();
            
            // 注册所有主题，每个主题都有同名组件
            for (const id of themeIds) {
              const theme = createMockThemePack(id);
              theme.components = {
                definitions: [
                  { name: commonComponentName, description: `${commonComponentName} for ${id}` },
                ],
                componentFactory: () => () => null,
              };
              manager.register(theme);
            }
            
            // 依次激活每个主题并验证组件命名空间
            for (const id of themeIds) {
              manager.setActiveTheme(id);
              
              const loadedNames = manager.getLoadedComponentNames(id);
              
              // 验证：加载的组件名应该包含主题 ID 作为命名空间
              for (const name of loadedNames) {
                expect(name).toContain(id);
                expect(name).toContain(commonComponentName);
              }
              
              // 验证：不同主题的同名组件应该有不同的命名空间名称
              for (const otherId of themeIds) {
                if (otherId !== id) {
                  const otherLoadedNames = manager.getLoadedComponentNames(otherId);
                  // 其他主题的组件应该已被卸载
                  expect(otherLoadedNames.length).toBe(0);
                }
              }
            }
            
            ThemeManager.resetInstance();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should correctly parse namespaced component names', () => {
      fc.assert(
        fc.property(
          themeIdArb,
          fc.stringMatching(/^[a-z][a-z0-9-]{0,9}$/),
          (themeId, componentName) => {
            // 创建命名空间名称
            const namespacedName = createNamespacedComponentName(themeId, componentName);
            
            // 解析命名空间名称
            const parsed = parseNamespacedComponentName(namespacedName);
            
            // 验证：解析结果应该正确还原原始值
            expect(parsed).not.toBeNull();
            expect(parsed?.themeId).toBe(themeId);
            expect(parsed?.componentName).toBe(componentName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null for non-namespaced component names', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/)
            .filter(name => !name.startsWith('__theme__')),
          (regularName) => {
            const parsed = parseNamespacedComponentName(regularName);
            
            // 验证：非命名空间名称应该返回 null
            expect(parsed).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Theme Manager Single Active Theme Invariant
   * For any sequence of theme registration, unregistration, and activation operations,
   * the ThemeManager SHALL always have exactly one active theme.
   * 
   * **Validates: Requirements 2.3, 2.5**
   */
  describe('Property 2: Theme Manager Single Active Theme Invariant', () => {
    it('should always have exactly one active theme after any sequence of operations', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.record({ type: fc.constant('register'), id: themeIdArb }),
              fc.record({ type: fc.constant('activate'), id: themeIdArb }),
              fc.record({ type: fc.constant('unregister'), id: themeIdArb })
            ),
            { minLength: 1, maxLength: 20 }
          ),
          (operations) => {
            const manager = ThemeManager.getInstance();
            
            // 首先注册默认主题
            const defaultTheme = createMockThemePack('shadcn-ui');
            manager.register(defaultTheme);
            
            const registeredIds = new Set<string>(['shadcn-ui']);
            
            for (const op of operations) {
              try {
                if (op.type === 'register' && !registeredIds.has(op.id)) {
                  manager.register(createMockThemePack(op.id));
                  registeredIds.add(op.id);
                } else if (op.type === 'activate' && registeredIds.has(op.id)) {
                  manager.setActiveTheme(op.id);
                } else if (op.type === 'unregister' && registeredIds.has(op.id) && op.id !== 'shadcn-ui') {
                  manager.unregister(op.id);
                  registeredIds.delete(op.id);
                }
              } catch {
                // 忽略预期的错误
              }
            }
            
            // 验证：始终有且仅有一个激活的主题
            const activeThemeId = manager.getActiveThemeId();
            expect(activeThemeId).toBeDefined();
            expect(typeof activeThemeId).toBe('string');
            expect(activeThemeId.length).toBeGreaterThan(0);
            
            // 激活的主题必须在已注册的主题中
            expect(registeredIds.has(activeThemeId)).toBe(true);
            
            ThemeManager.resetInstance();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Theme Registration Uniqueness
   * For any ThemePack with id X, if a theme with id X is already registered,
   * then registering another theme with id X SHALL throw an error.
   * 
   * **Validates: Requirements 2.1, 2.7**
   */
  describe('Property 3: Theme Registration Uniqueness', () => {
    it('should throw error when registering theme with duplicate id', () => {
      fc.assert(
        fc.property(themeIdArb, (themeId) => {
          const manager = ThemeManager.getInstance();
          
          // 注册第一个主题
          const theme1 = createMockThemePack(themeId, 'First Theme');
          manager.register(theme1);
          
          // 尝试注册相同 ID 的第二个主题
          const theme2 = createMockThemePack(themeId, 'Second Theme');
          
          expect(() => manager.register(theme2)).toThrow();
          
          try {
            manager.register(theme2);
          } catch (error: any) {
            expect(error.code).toBe(ThemeErrorCode.THEME_ALREADY_EXISTS);
          }
          
          ThemeManager.resetInstance();
        }),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Property 9: Theme Change Event Emission
   * For any theme activation operation that changes the active theme,
   * a ThemeChangeEvent SHALL be emitted with correct oldThemeId and newThemeId.
   * 
   * **Validates: Requirements 9.1, 9.4**
   */
  describe('Property 9: Theme Change Event Emission', () => {
    it('should emit event with correct old and new theme ids when theme changes', () => {
      fc.assert(
        fc.property(
          fc.array(themeIdArb, { minLength: 2, maxLength: 10 }).filter(ids => new Set(ids).size === ids.length),
          (themeIds) => {
            const manager = ThemeManager.getInstance();
            const events: ThemeChangeEvent[] = [];
            
            // 订阅事件
            const unsubscribe = manager.subscribe((event) => {
              events.push(event);
            });
            
            // 注册所有主题
            for (const id of themeIds) {
              manager.register(createMockThemePack(id));
            }
            
            // 激活第一个主题
            manager.setActiveTheme(themeIds[0]);
            
            // 依次切换到其他主题
            for (let i = 1; i < themeIds.length; i++) {
              const oldId = themeIds[i - 1];
              const newId = themeIds[i];
              
              manager.setActiveTheme(newId);
              
              // 验证最后一个事件
              const lastEvent = events[events.length - 1];
              expect(lastEvent.oldThemeId).toBe(oldId);
              expect(lastEvent.newThemeId).toBe(newId);
              expect(lastEvent.oldTheme.id).toBe(oldId);
              expect(lastEvent.newTheme.id).toBe(newId);
            }
            
            unsubscribe();
            ThemeManager.resetInstance();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not emit event when activating the same theme', () => {
      fc.assert(
        fc.property(themeIdArb, (themeId) => {
          const manager = ThemeManager.getInstance();
          const events: ThemeChangeEvent[] = [];
          
          manager.register(createMockThemePack(themeId));
          
          const unsubscribe = manager.subscribe((event) => {
            events.push(event);
          });
          
          // 激活主题
          manager.setActiveTheme(themeId);
          const eventCountAfterFirst = events.length;
          
          // 再次激活相同主题
          manager.setActiveTheme(themeId);
          
          // 不应该有新事件
          expect(events.length).toBe(eventCountAfterFirst);
          
          unsubscribe();
          ThemeManager.resetInstance();
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 11: Theme Uninstall Safety
   * For any theme uninstall operation on the active theme,
   * the system SHALL first switch to the default theme before uninstalling.
   * 
   * **Validates: Requirements 17.3, 17.4**
   */
  describe('Property 11: Theme Uninstall Safety', () => {
    it('should switch to default theme before uninstalling active theme', () => {
      fc.assert(
        fc.property(
          fc.array(themeIdArb, { minLength: 1, maxLength: 5 })
            .filter(ids => new Set(ids).size === ids.length)
            .filter(ids => !ids.includes('shadcn-ui')), // 排除默认主题 ID
          (themeIds) => {
            const manager = ThemeManager.getInstance();
            
            // 注册默认主题
            const defaultTheme = createMockThemePack('shadcn-ui');
            manager.register(defaultTheme);
            
            // 注册其他主题
            for (const id of themeIds) {
              manager.register(createMockThemePack(id));
            }
            
            // 随机选择一个非默认主题作为激活主题
            const activeId = themeIds[0];
            manager.setActiveTheme(activeId);
            
            // 验证当前激活的是非默认主题
            expect(manager.getActiveThemeId()).toBe(activeId);
            
            // 卸载当前激活的主题
            manager.unregister(activeId);
            
            // 验证：卸载后应该自动切换到默认主题
            expect(manager.getActiveThemeId()).toBe('shadcn-ui');
            
            // 验证：被卸载的主题不再存在
            expect(manager.hasTheme(activeId)).toBe(false);
            
            ThemeManager.resetInstance();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should prevent uninstalling the default theme', () => {
      fc.assert(
        fc.property(
          fc.array(themeIdArb, { minLength: 0, maxLength: 3 })
            .filter(ids => new Set(ids).size === ids.length)
            .filter(ids => !ids.includes('shadcn-ui')),
          (themeIds) => {
            const manager = ThemeManager.getInstance();
            
            // 注册默认主题
            const defaultTheme = createMockThemePack('shadcn-ui');
            manager.register(defaultTheme);
            
            // 注册其他主题
            for (const id of themeIds) {
              manager.register(createMockThemePack(id));
            }
            
            // 尝试卸载默认主题应该抛出错误
            expect(() => manager.unregister('shadcn-ui')).toThrow();
            
            try {
              manager.unregister('shadcn-ui');
            } catch (error: any) {
              expect(error.code).toBe(ThemeErrorCode.CANNOT_UNINSTALL_BUILTIN);
            }
            
            // 验证：默认主题仍然存在
            expect(manager.hasTheme('shadcn-ui')).toBe(true);
            
            ThemeManager.resetInstance();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain single active theme invariant after uninstall', () => {
      fc.assert(
        fc.property(
          fc.array(themeIdArb, { minLength: 2, maxLength: 5 })
            .filter(ids => new Set(ids).size === ids.length)
            .filter(ids => !ids.includes('shadcn-ui')),
          fc.nat({ max: 10 }), // 随机卸载次数
          (themeIds, uninstallCount) => {
            const manager = ThemeManager.getInstance();
            
            // 注册默认主题
            const defaultTheme = createMockThemePack('shadcn-ui');
            manager.register(defaultTheme);
            
            // 注册其他主题
            const registeredIds = new Set<string>(['shadcn-ui']);
            for (const id of themeIds) {
              manager.register(createMockThemePack(id));
              registeredIds.add(id);
            }
            
            // 激活第一个非默认主题
            manager.setActiveTheme(themeIds[0]);
            
            // 执行多次卸载操作
            for (let i = 0; i < Math.min(uninstallCount, themeIds.length); i++) {
              const idToUninstall = themeIds[i];
              if (registeredIds.has(idToUninstall) && idToUninstall !== 'shadcn-ui') {
                manager.unregister(idToUninstall);
                registeredIds.delete(idToUninstall);
              }
              
              // 每次卸载后验证：始终有且仅有一个激活的主题
              const activeId = manager.getActiveThemeId();
              expect(activeId).toBeDefined();
              expect(registeredIds.has(activeId)).toBe(true);
            }
            
            ThemeManager.resetInstance();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

// ============================================================================
// Unit Tests
// ============================================================================

describe('ThemeManager - Unit Tests', () => {
  beforeEach(() => {
    ThemeManager.resetInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = ThemeManager.getInstance();
      const instance2 = ThemeManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('register', () => {
    it('should register a theme successfully', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      
      expect(manager.hasTheme('test-theme')).toBe(true);
      expect(manager.getTheme('test-theme')).toBe(theme);
    });

    it('should throw error for duplicate theme id', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      
      expect(() => manager.register(theme)).toThrow();
    });
  });

  describe('unregister', () => {
    it('should unregister a theme successfully', () => {
      const manager = ThemeManager.getInstance();
      const defaultTheme = createMockThemePack('shadcn-ui');
      const theme = createMockThemePack('test-theme');
      
      manager.register(defaultTheme);
      manager.register(theme);
      manager.unregister('test-theme');
      
      expect(manager.hasTheme('test-theme')).toBe(false);
    });

    it('should throw error for non-existent theme', () => {
      const manager = ThemeManager.getInstance();
      
      expect(() => manager.unregister('non-existent')).toThrow();
    });

    it('should switch to default theme when unregistering active theme', () => {
      const manager = ThemeManager.getInstance();
      const defaultTheme = createMockThemePack('shadcn-ui');
      const theme = createMockThemePack('test-theme');
      
      manager.register(defaultTheme);
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      manager.unregister('test-theme');
      
      expect(manager.getActiveThemeId()).toBe('shadcn-ui');
    });
  });


  describe('setActiveTheme', () => {
    it('should set active theme successfully', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      
      expect(manager.getActiveThemeId()).toBe('test-theme');
    });

    it('should throw error for non-existent theme', () => {
      const manager = ThemeManager.getInstance();
      
      expect(() => manager.setActiveTheme('non-existent')).toThrow();
    });
  });

  describe('getActiveTheme', () => {
    it('should return the active theme', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      
      expect(manager.getActiveTheme()).toBe(theme);
    });

    it('should throw error when no theme is registered', () => {
      const manager = ThemeManager.getInstance();
      
      expect(() => manager.getActiveTheme()).toThrow();
    });
  });

  describe('getAllThemes', () => {
    it('should return all registered themes', () => {
      const manager = ThemeManager.getInstance();
      const theme1 = createMockThemePack('theme-1');
      const theme2 = createMockThemePack('theme-2');
      
      manager.register(theme1);
      manager.register(theme2);
      
      const themes = manager.getAllThemes();
      expect(themes).toHaveLength(2);
      expect(themes).toContain(theme1);
      expect(themes).toContain(theme2);
    });
  });

  describe('getThemeMetadata', () => {
    it('should return metadata for all themes', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      
      const metadata = manager.getThemeMetadata();
      expect(metadata).toHaveLength(1);
      expect(metadata[0].id).toBe('test-theme');
      expect(metadata[0].name).toBe('Theme test-theme');
      expect(metadata[0].installed).toBe(true);
    });
  });

  describe('subscribe', () => {
    it('should call listener when theme changes', () => {
      const manager = ThemeManager.getInstance();
      const theme1 = createMockThemePack('theme-1');
      const theme2 = createMockThemePack('theme-2');
      const listener = vi.fn();
      
      manager.register(theme1);
      manager.register(theme2);
      manager.setActiveTheme('theme-1');
      
      manager.subscribe(listener);
      manager.setActiveTheme('theme-2');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          oldThemeId: 'theme-1',
          newThemeId: 'theme-2',
        })
      );
    });

    it('should return unsubscribe function', () => {
      const manager = ThemeManager.getInstance();
      const theme1 = createMockThemePack('theme-1');
      const theme2 = createMockThemePack('theme-2');
      const listener = vi.fn();
      
      manager.register(theme1);
      manager.register(theme2);
      manager.setActiveTheme('theme-1');
      
      const unsubscribe = manager.subscribe(listener);
      unsubscribe();
      
      manager.setActiveTheme('theme-2');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('convenience methods', () => {
    it('should return tokens from active theme', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      
      expect(manager.getTokens()).toBe(theme.tokens);
    });

    it('should return components from active theme', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      
      expect(manager.getComponents()).toBe(theme.components);
    });

    it('should return examples from active theme', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      
      expect(manager.getExamples()).toBe(theme.examples);
    });

    it('should return prompts from active theme', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      
      expect(manager.getPrompts()).toBe(theme.prompts);
    });

    it('should return color schemes from active theme', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      
      expect(manager.getColorSchemes()).toBe(theme.colorSchemes);
    });

    it('should return layouts from active theme', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      
      expect(manager.getLayouts()).toBe(theme.layouts);
    });
  });

  describe('registerTokenCategory', () => {
    it('should add custom token category to active theme', () => {
      const manager = ThemeManager.getInstance();
      const theme = createMockThemePack('test-theme');
      
      manager.register(theme);
      manager.setActiveTheme('test-theme');
      
      manager.registerTokenCategory({
        name: 'custom',
        description: 'Custom tokens',
        values: { foo: 'bar' },
      });
      
      expect(theme.tokens.extensions?.custom).toBeDefined();
      expect(theme.tokens.extensions?.custom.values.foo).toBe('bar');
    });
  });
});
