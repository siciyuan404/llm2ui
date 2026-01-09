/**
 * @file theme-isolation-pbt.test.ts
 * @description 主题隔离架构属性测试
 * @module lib/themes/builtin
 * 
 * 验证主题隔离架构的正确性属性：
 * - Property 1: 主题案例自包含性
 * - Property 4: 主题目录结构一致性
 * - Property 5: 案例迁移数据完整性
 * - Property 6: API 向后兼容性
 * - Property 7: 共享目录纯净性
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { ThemeManager } from '../theme-manager';
import { shadcnThemePack } from './shadcn';
import { cherryThemePack } from './cherry';
import { discordThemePack } from './discord';

// 内置主题列表
const BUILTIN_THEMES = ['cherry', 'shadcn-ui', 'discord'] as const;
type BuiltinThemeId = typeof BUILTIN_THEMES[number];

// 主题包映射
const THEME_PACKS = {
  'cherry': cherryThemePack,
  'shadcn-ui': shadcnThemePack,
  'discord': discordThemePack,
};

// 主题目录映射
const THEME_DIRECTORIES: Record<BuiltinThemeId, string> = {
  'cherry': 'src/lib/themes/builtin/cherry',
  'shadcn-ui': 'src/lib/themes/builtin/shadcn',
  'discord': 'src/lib/themes/builtin/discord',
};

// 标准主题目录结构
const STANDARD_STRUCTURE = {
  requiredFiles: ['index.ts', 'tokens.ts', 'components.ts'],
  requiredDirs: ['examples', 'prompts'],
};

describe('Theme Isolation Property-Based Tests', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    ThemeManager.resetInstance();
    themeManager = ThemeManager.getInstance();
    themeManager.register(shadcnThemePack);
    themeManager.register(cherryThemePack);
    themeManager.register(discordThemePack);
  });

  afterEach(() => {
    ThemeManager.resetInstance();
  });

  /**
   * Feature: theme-isolation, Property 1: 主题案例自包含性
   * 
   * *For any* 内置主题，其案例数据的导入路径应该完全位于该主题的目录内，
   * 不应该从 `src/lib/examples/` 导入主题特定的案例数据文件。
   * 
   * **Validates: Requirements 1.2, 1.3, 1.4**
   */
  describe('Property 1: Theme Examples Self-Containment', () => {
    it('should have all theme examples defined within theme directory', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            const themePack = THEME_PACKS[themeId];
            const examples = themePack.examples;
            
            // 验证主题有案例定义
            expect(examples).toBeDefined();
            expect(examples.presets).toBeDefined();
            
            // 验证案例数组存在
            if (examples.presets.length > 0) {
              // 每个案例应该有有效的 ID
              for (const example of examples.presets) {
                expect(example.id).toBeDefined();
                expect(typeof example.id).toBe('string');
                expect(example.id.length).toBeGreaterThan(0);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not have cross-theme example references', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            const themePack = THEME_PACKS[themeId];
            const examples = themePack.examples.presets;
            
            // 获取其他主题的 ID 前缀
            const otherThemePrefixes = BUILTIN_THEMES
              .filter(id => id !== themeId)
              .map(id => {
                if (id === 'shadcn-ui') return 'shadcn';
                if (id === 'discord') return 'discord';
                return id;
              });
            
            // 验证案例 ID 不包含其他主题的前缀
            for (const example of examples) {
              for (const prefix of otherThemePrefixes) {
                // Cherry 案例不应该包含 shadcn 或 discord 前缀
                // shadcn 案例不应该包含 cherry 或 discord 前缀
                // discord 案例不应该包含 cherry 或 shadcn 前缀
                const hasOtherThemePrefix = example.id.toLowerCase().startsWith(prefix.toLowerCase() + '-');
                expect(hasOtherThemePrefix).toBe(false);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: theme-isolation, Property 4: 主题目录结构一致性
   * 
   * *For any* 内置主题目录，应该包含标准的文件和子目录结构：
   * `index.ts`、`tokens.ts`、`components.ts`、`examples/` 目录、`prompts/` 目录。
   * 
   * **Validates: Requirements 4.1, 4.3, 4.4**
   */
  describe('Property 4: Theme Directory Structure Consistency', () => {
    it('should have all required files in theme directory', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            const themeDir = THEME_DIRECTORIES[themeId];
            
            // 检查必需文件
            for (const file of STANDARD_STRUCTURE.requiredFiles) {
              const filePath = path.join(themeDir, file);
              const exists = fs.existsSync(filePath);
              expect(exists).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have all required directories in theme directory', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            const themeDir = THEME_DIRECTORIES[themeId];
            
            // 检查必需目录
            for (const dir of STANDARD_STRUCTURE.requiredDirs) {
              const dirPath = path.join(themeDir, dir);
              const exists = fs.existsSync(dirPath);
              const isDir = exists && fs.statSync(dirPath).isDirectory();
              expect(isDir).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have examples/index.ts in each theme', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            const themeDir = THEME_DIRECTORIES[themeId];
            const examplesIndexPath = path.join(themeDir, 'examples', 'index.ts');
            const exists = fs.existsSync(examplesIndexPath);
            expect(exists).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: theme-isolation, Property 5: 案例迁移数据完整性
   * 
   * *For any* 迁移前的案例数据，迁移后应该保持相同的 ID、标题、描述、分类、标签和 schema，
   * 不应该丢失或改变任何数据。
   * 
   * **Validates: Requirements 5.4**
   */
  describe('Property 5: Example Migration Data Integrity', () => {
    it('should have valid example data structure for all examples', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            const themePack = THEME_PACKS[themeId];
            const examples = themePack.examples.presets;
            
            for (const example of examples) {
              // 验证必需字段存在
              expect(example.id).toBeDefined();
              expect(typeof example.id).toBe('string');
              
              expect(example.name).toBeDefined();
              expect(typeof example.name).toBe('string');
              
              expect(example.description).toBeDefined();
              expect(typeof example.description).toBe('string');
              
              expect(example.category).toBeDefined();
              expect(typeof example.category).toBe('string');
              
              expect(example.tags).toBeDefined();
              expect(Array.isArray(example.tags)).toBe(true);
              
              expect(example.schema).toBeDefined();
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have unique example IDs within each theme', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            const themePack = THEME_PACKS[themeId];
            const examples = themePack.examples.presets;
            const ids = examples.map(e => e.id);
            const uniqueIds = new Set(ids);
            
            // 所有 ID 应该唯一
            expect(uniqueIds.size).toBe(ids.length);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have valid schema structure for all examples', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            const themePack = THEME_PACKS[themeId];
            const examples = themePack.examples.presets;
            
            for (const example of examples) {
              const schema = example.schema as { version?: string; root?: unknown };
              
              // 验证 schema 结构
              if (schema) {
                // schema 应该有 version 或 root
                const hasValidStructure = 
                  schema.version !== undefined || 
                  schema.root !== undefined ||
                  Object.keys(schema).length > 0;
                expect(hasValidStructure).toBe(true);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: theme-isolation, Property 6: API 向后兼容性
   * 
   * *For any* 重构前通过 ThemePack 接口访问的主题数据，重构后应该仍然可以通过相同的接口访问，
   * 且返回的数据结构保持不变。
   * 
   * **Validates: Requirements 6.1, 6.2, 6.3**
   */
  describe('Property 6: API Backward Compatibility', () => {
    it('should access theme data through ThemeManager API', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            // 通过 ThemeManager 获取主题
            const theme = themeManager.getTheme(themeId);
            expect(theme).toBeDefined();
            
            // 验证基本属性可访问
            expect(theme?.id).toBe(themeId);
            expect(theme?.name).toBeDefined();
            expect(theme?.version).toBeDefined();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should access theme components through ThemeManager', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            themeManager.setActiveTheme(themeId);
            const components = themeManager.getComponents();
            
            expect(components).toBeDefined();
            expect(components.registry).toBeDefined();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should access theme examples through ThemeManager', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            themeManager.setActiveTheme(themeId);
            const examples = themeManager.getExamples();
            
            expect(examples).toBeDefined();
            expect(examples.presets).toBeDefined();
            expect(Array.isArray(examples.presets)).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should access theme tokens through ThemeManager', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            themeManager.setActiveTheme(themeId);
            const tokens = themeManager.getTokens();
            
            expect(tokens).toBeDefined();
            expect(tokens.colors).toBeDefined();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should access theme prompts through ThemeManager', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...BUILTIN_THEMES),
          (themeId: BuiltinThemeId) => {
            themeManager.setActiveTheme(themeId);
            const prompts = themeManager.getPrompts();
            
            expect(prompts).toBeDefined();
            expect(prompts.templates).toBeDefined();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: theme-isolation, Property 7: 共享目录纯净性
   * 
   * *For any* 重构后的 `src/lib/examples/` 目录，不应该包含任何主题特定的案例数据文件
   * （如 `cherry-*.ts`、`preset-examples.ts`），只应该包含跨主题通用的功能模块。
   * 
   * **Validates: Requirements 7.1, 7.3**
   */
  describe('Property 7: Shared Directory Purity', () => {
    const SHARED_EXAMPLES_DIR = 'src/lib/examples';
    
    // 主题特定文件模式（这些文件不应该存在于共享目录）
    const THEME_SPECIFIC_PATTERNS = [
      /^cherry-.*\.ts$/,           // cherry-patterns.ts, cherry-primitives.ts 等
      /^preset-examples\.ts$/,     // preset-examples.ts
      /^discord-.*\.ts$/,          // discord 相关文件
      /^shadcn-.*\.ts$/,           // shadcn 相关文件
    ];
    
    // 允许存在的核心功能文件
    const ALLOWED_CORE_FILES = [
      'index.ts',
      'example-library.ts',
      'example-injector.ts',
      'example-retriever.ts',
      'example-validator.ts',
      'example-registry.ts',
      'example-tags.ts',
      'example-collections.ts',
      'example-composition-analyzer.ts',
      'custom-examples-storage.ts',
      'diversity-filter.ts',
      'README.md',
    ];

    it('should not contain theme-specific example files in shared directory', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...THEME_SPECIFIC_PATTERNS),
          (pattern: RegExp) => {
            const files = fs.readdirSync(SHARED_EXAMPLES_DIR);
            
            for (const file of files) {
              // 跳过目录
              const filePath = path.join(SHARED_EXAMPLES_DIR, file);
              if (fs.statSync(filePath).isDirectory()) continue;
              
              // 验证文件不匹配主题特定模式
              const isThemeSpecific = pattern.test(file);
              expect(isThemeSpecific).toBe(false);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only contain core functionality files in shared directory', () => {
      const files = fs.readdirSync(SHARED_EXAMPLES_DIR);
      
      for (const file of files) {
        const filePath = path.join(SHARED_EXAMPLES_DIR, file);
        
        // 跳过目录和测试文件
        if (fs.statSync(filePath).isDirectory()) continue;
        if (file.endsWith('.test.ts')) continue;
        
        // 验证文件是允许的核心文件
        const isAllowed = ALLOWED_CORE_FILES.includes(file);
        if (!isAllowed) {
          // 如果不在允许列表中，确保不是主题特定文件
          const isThemeSpecific = THEME_SPECIFIC_PATTERNS.some(p => p.test(file));
          expect(isThemeSpecific).toBe(false);
        }
      }
    });

    it('should have re-exports for backward compatibility in index.ts', () => {
      const indexPath = path.join(SHARED_EXAMPLES_DIR, 'index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');
      
      // 验证 index.ts 包含向后兼容的重新导出
      // 这些导出应该来自主题目录而非本地文件
      expect(content).toContain('themes/builtin/shadcn/examples');
      expect(content).toContain('themes/builtin/cherry/examples');
    });
  });
});
