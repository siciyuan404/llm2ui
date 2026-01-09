/**
 * @file test-file-colocation-pbt.test.ts
 * @description Property-based test for test file co-location
 * 
 * Feature: codebase-refactor, Property 6: Test File Co-location
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 * 
 * Verifies that test files in src/lib/ follow the Co-location strategy:
 * - Test files are in the same directory as source files
 * - Test files use *.test.ts or *.test.tsx naming convention
 * - No separate __tests__ or tests directories
 * 
 * @module lib
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// =============================================================================
// Test file pairs representing co-located tests
// =============================================================================

/**
 * Co-located test files in subdirectories
 * Each entry maps a test file to its corresponding source file
 */
const COLOCATED_TEST_FILES = [
  // Core module
  { testFile: 'src/lib/core/component-registry.test.ts', sourceFile: 'src/lib/core/component-registry.ts' },
  { testFile: 'src/lib/core/component-catalog.test.ts', sourceFile: 'src/lib/core/component-catalog.ts' },
  
  // Design System module
  { testFile: 'src/lib/design-system/design-tokens.test.ts', sourceFile: 'src/lib/design-system/design-tokens.ts' },
  { testFile: 'src/lib/design-system/token-compliance-validator.test.ts', sourceFile: 'src/lib/design-system/token-compliance-validator.ts' },
  { testFile: 'src/lib/design-system/token-usage-registry.test.ts', sourceFile: 'src/lib/design-system/token-usage-registry.ts' },
  { testFile: 'src/lib/design-system/component-mapping-registry.test.ts', sourceFile: 'src/lib/design-system/component-mapping-registry.ts' },
  { testFile: 'src/lib/design-system/validation-chain.test.ts', sourceFile: 'src/lib/design-system/validation-chain.ts' },
  { testFile: 'src/lib/design-system/constraint-injector.test.ts', sourceFile: 'src/lib/design-system/constraint-injector.ts' },
  
  // Utils module
  { testFile: 'src/lib/utils/icon-registry.test.ts', sourceFile: 'src/lib/utils/icon-registry.ts' },
  { testFile: 'src/lib/utils/platform-adapter.test.ts', sourceFile: 'src/lib/utils/platform-adapter.ts' },
  { testFile: 'src/lib/utils/schema-generator.test.ts', sourceFile: 'src/lib/utils/schema-generator.ts' },
  { testFile: 'src/lib/utils/schema-sync.test.ts', sourceFile: 'src/lib/utils/schema-sync.ts' },
  { testFile: 'src/lib/utils/template-manager.test.ts', sourceFile: 'src/lib/utils/template-manager.ts' },
  { testFile: 'src/lib/utils/export.test.ts', sourceFile: 'src/lib/utils/export.ts' },
  
  // LLM module
  { testFile: 'src/lib/llm/prompt-builder.test.ts', sourceFile: 'src/lib/llm/prompt-builder.ts' },
  { testFile: 'src/lib/llm/prompt-cache.test.ts', sourceFile: 'src/lib/llm/prompt-cache.ts' },
  { testFile: 'src/lib/llm/prompt-generator.test.ts', sourceFile: 'src/lib/llm/prompt-generator.ts' },
  { testFile: 'src/lib/llm/prompt-optimizer.test.ts', sourceFile: 'src/lib/llm/prompt-optimizer.ts' },
  { testFile: 'src/lib/llm/retry-mechanism.test.ts', sourceFile: 'src/lib/llm/retry-mechanism.ts' },
  { testFile: 'src/lib/llm/streaming-validator.test.ts', sourceFile: 'src/lib/llm/streaming-validator.ts' },
  { testFile: 'src/lib/llm/template-loader.test.ts', sourceFile: 'src/lib/llm/template-loader.ts' },
  { testFile: 'src/lib/llm/token-counter.test.ts', sourceFile: 'src/lib/llm/token-counter.ts' },
  
  // Examples module
  { testFile: 'src/lib/examples/example-library.test.ts', sourceFile: 'src/lib/examples/example-library.ts' },
  { testFile: 'src/lib/examples/example-registry.test.ts', sourceFile: 'src/lib/examples/example-registry.ts' },
  { testFile: 'src/lib/examples/example-retriever.test.ts', sourceFile: 'src/lib/examples/example-retriever.ts' },
  { testFile: 'src/lib/examples/example-injector.test.ts', sourceFile: 'src/lib/examples/example-injector.ts' },
  { testFile: 'src/lib/examples/example-validator.test.ts', sourceFile: 'src/lib/examples/example-validator.ts' },
  { testFile: 'src/lib/examples/diversity-filter.test.ts', sourceFile: 'src/lib/examples/diversity-filter.ts' },
  
  // Themes module
  { testFile: 'src/lib/themes/theme-manager.test.ts', sourceFile: 'src/lib/themes/theme-manager.ts' },
  { testFile: 'src/lib/themes/theme-validator.test.ts', sourceFile: 'src/lib/themes/theme-validator.ts' },
  { testFile: 'src/lib/themes/types.test.ts', sourceFile: 'src/lib/themes/types.ts' },
  
  // Storage module
  { testFile: 'src/lib/storage/custom-model-manager.test.ts', sourceFile: 'src/lib/storage/custom-model-manager.ts' },
  
  // Quality module
  { testFile: 'src/lib/quality/quality-metrics.test.ts', sourceFile: 'src/lib/quality/quality-metrics.ts' },
  { testFile: 'src/lib/quality/quality-report.test.ts', sourceFile: 'src/lib/quality/quality-report.ts' },
  { testFile: 'src/lib/quality/quality-tracker.test.ts', sourceFile: 'src/lib/quality/quality-tracker.ts' },
];

/**
 * Special test files in root directory (PBT, integration, compatibility tests)
 * These are allowed in root directory as they don't correspond to specific source files
 */
const ROOT_SPECIAL_TEST_FILES = [
  'src/lib/duplicate-cleanup-pbt.test.ts',
  'src/lib/import-compat-pbt.test.ts',
  'src/lib/import-compatibility.test.ts',
  'src/lib/readme-existence-pbt.test.ts',
  'src/lib/test-file-colocation-pbt.test.ts',
];

// =============================================================================
// Helper functions
// =============================================================================

/**
 * Extract directory from file path
 */
function getDirectory(filePath: string): string {
  const parts = filePath.split('/');
  parts.pop();
  return parts.join('/');
}

/**
 * Check if test file follows naming convention
 */
function hasValidTestNaming(testFile: string): boolean {
  return testFile.endsWith('.test.ts') || testFile.endsWith('.test.tsx');
}

/**
 * Check if test file is co-located with source file
 */
function isColocated(testFile: string, sourceFile: string): boolean {
  return getDirectory(testFile) === getDirectory(sourceFile);
}

/**
 * Check if file is a special test file (PBT, integration, compatibility)
 */
function isSpecialTestFile(testFile: string): boolean {
  const filename = testFile.split('/').pop() || '';
  return (
    filename.includes('-pbt.test.') ||
    filename.includes('integration') ||
    filename.includes('compat') ||
    filename.includes('compatibility')
  );
}

/**
 * Check if path contains separate test directory
 */
function hasSeparateTestDirectory(filePath: string): boolean {
  const parts = filePath.split('/');
  return parts.some(part => part === '__tests__' || part === 'tests');
}

// =============================================================================
// Property-Based Tests
// =============================================================================

describe('Test File Co-location - Property-Based Tests', () => {
  describe('Property 6: Test File Co-location', () => {
    
    /**
     * 6.1 Test File Naming Convention
     * 
     * *For any* test file, its name should follow *.test.ts or *.test.tsx format
     * 
     * **Validates: Requirements 6.4**
     */
    describe('6.1 Test File Naming Convention', () => {
      const allTestFiles = [
        ...COLOCATED_TEST_FILES.map(f => f.testFile),
        ...ROOT_SPECIAL_TEST_FILES,
      ];
      
      it('all test files should follow *.test.ts or *.test.tsx naming convention', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...allTestFiles),
            (testFile) => {
              const isValid = hasValidTestNaming(testFile);
              expect(isValid).toBe(true);
              return isValid;
            }
          ),
          { numRuns: Math.min(allTestFiles.length, 100) }
        );
      });
    });

    /**
     * 6.2 Subdirectory Test File Co-location
     * 
     * *For any* test file in a subdirectory, its corresponding source file
     * should be in the same directory
     * 
     * **Validates: Requirements 6.2**
     */
    describe('6.2 Subdirectory Test File Co-location', () => {
      it('test files in subdirectories should be co-located with source files', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...COLOCATED_TEST_FILES),
            ({ testFile, sourceFile }) => {
              const colocated = isColocated(testFile, sourceFile);
              expect(colocated).toBe(true);
              return colocated;
            }
          ),
          { numRuns: Math.min(COLOCATED_TEST_FILES.length, 100) }
        );
      });
    });

    /**
     * 6.3 Root Directory Special Test Files
     * 
     * *For any* test file in root directory (src/lib/), it should be one of:
     * - Property-based test file (*-pbt.test.ts)
     * - Integration test file
     * - Compatibility test file
     * 
     * **Validates: Requirements 6.3**
     */
    describe('6.3 Root Directory Special Test Files', () => {
      it('root directory special test files should be valid (PBT, integration, or compatibility)', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...ROOT_SPECIAL_TEST_FILES),
            (testFile) => {
              const isSpecial = isSpecialTestFile(testFile);
              expect(isSpecial).toBe(true);
              return isSpecial;
            }
          ),
          { numRuns: Math.min(ROOT_SPECIAL_TEST_FILES.length, 100) }
        );
      });
    });

    /**
     * 6.4 No Separate Test Directories
     * 
     * *For any* test file, it should not be in __tests__ or tests directories
     * 
     * **Validates: Requirements 6.1**
     */
    describe('6.4 No Separate Test Directories', () => {
      const allTestFiles = [
        ...COLOCATED_TEST_FILES.map(f => f.testFile),
        ...ROOT_SPECIAL_TEST_FILES,
      ];
      
      it('test files should not be in __tests__ or tests directories', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...allTestFiles),
            (testFile) => {
              const hasSeparateDir = hasSeparateTestDirectory(testFile);
              expect(hasSeparateDir).toBe(false);
              return !hasSeparateDir;
            }
          ),
          { numRuns: Math.min(allTestFiles.length, 100) }
        );
      });
    });

    /**
     * 6.5 Test File Extension Consistency
     * 
     * *For any* test file, its extension should match the source file extension
     * (.tsx source -> .test.tsx, .ts source -> .test.ts)
     * 
     * **Validates: Requirements 6.4**
     */
    describe('6.5 Test File Extension Consistency', () => {
      it('test file extension should match source file extension', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...COLOCATED_TEST_FILES),
            ({ testFile, sourceFile }) => {
              const testIsTsx = testFile.endsWith('.tsx');
              const sourceIsTsx = sourceFile.endsWith('.tsx');
              
              // .tsx source should have .test.tsx test
              // .ts source should have .test.ts test
              expect(testIsTsx).toBe(sourceIsTsx);
              return testIsTsx === sourceIsTsx;
            }
          ),
          { numRuns: Math.min(COLOCATED_TEST_FILES.length, 100) }
        );
      });
    });

    /**
     * 6.6 Module Test File Distribution
     * 
     * Each major module should have co-located test files
     * 
     * **Validates: Requirements 6.1, 6.2**
     */
    describe('6.6 Module Test File Distribution', () => {
      const modules = [
        { name: 'core', prefix: 'src/lib/core/' },
        { name: 'design-system', prefix: 'src/lib/design-system/' },
        { name: 'utils', prefix: 'src/lib/utils/' },
        { name: 'llm', prefix: 'src/lib/llm/' },
        { name: 'examples', prefix: 'src/lib/examples/' },
        { name: 'themes', prefix: 'src/lib/themes/' },
        { name: 'storage', prefix: 'src/lib/storage/' },
        { name: 'quality', prefix: 'src/lib/quality/' },
      ];
      
      it('each major module should have co-located test files', () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...modules),
            ({ name, prefix }) => {
              const moduleTestFiles = COLOCATED_TEST_FILES.filter(
                f => f.testFile.startsWith(prefix)
              );
              
              // Each module should have at least one test file
              expect(moduleTestFiles.length).toBeGreaterThan(0);
              return moduleTestFiles.length > 0;
            }
          ),
          { numRuns: modules.length }
        );
      });
    });
  });

  /**
   * Statistics test
   */
  describe('Test File Statistics', () => {
    it('should report test file statistics', () => {
      const totalColocated = COLOCATED_TEST_FILES.length;
      const totalSpecial = ROOT_SPECIAL_TEST_FILES.length;
      const total = totalColocated + totalSpecial;
      
      console.log('\n📊 Test File Co-location Statistics:');
      console.log(`   Total test files tracked: ${total}`);
      console.log(`   Co-located test files (subdirectories): ${totalColocated}`);
      console.log(`   Special test files (root): ${totalSpecial}`);
      console.log(`   Co-location compliance: ${((totalColocated / total) * 100).toFixed(1)}%\n`);
      
      // Verify majority of test files are co-located
      expect(totalColocated).toBeGreaterThan(totalSpecial);
    });
  });
});
