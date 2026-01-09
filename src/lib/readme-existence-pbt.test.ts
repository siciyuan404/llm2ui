/**
 * @file readme-existence-pbt.test.ts
 * @description Property-based test for README existence in new directories
 * 
 * **Feature: architecture-refactor, Property 5: README Existence for New Directories**
 * **Validates: Requirements 8.4**
 * 
 * @module lib
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property 5: README Existence for New Directories
 * 
 * *For any* newly created directory (hooks, stores, constants, lib/core, 
 * lib/llm, lib/design-system, lib/examples, lib/storage, lib/utils), 
 * the directory SHALL contain a README.md file.
 * 
 * **Validates: Requirements 8.4**
 */
describe('README Existence - Property-Based Tests', () => {
  // List of all newly created directories that must have README.md
  const newDirectories = [
    'src/hooks',
    'src/stores',
    'src/constants',
    'src/lib/core',
    'src/lib/llm',
    'src/lib/design-system',
    'src/lib/examples',
    'src/lib/storage',
    'src/lib/utils',
  ] as const;

  describe('Property 5: README Existence for New Directories', () => {
    it('should have README.md in all newly created directories', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...newDirectories),
          (dirPath) => {
            const readmePath = path.join(process.cwd(), dirPath, 'README.md');
            const exists = fs.existsSync(readmePath);
            
            // Property: README.md must exist in the directory
            return exists === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have non-empty README.md files', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...newDirectories),
          (dirPath) => {
            const readmePath = path.join(process.cwd(), dirPath, 'README.md');
            
            if (!fs.existsSync(readmePath)) {
              return false;
            }
            
            const content = fs.readFileSync(readmePath, 'utf-8');
            // Property: README.md must have content (not empty)
            return content.trim().length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have README.md with proper markdown heading', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...newDirectories),
          (dirPath) => {
            const readmePath = path.join(process.cwd(), dirPath, 'README.md');
            
            if (!fs.existsSync(readmePath)) {
              return false;
            }
            
            const content = fs.readFileSync(readmePath, 'utf-8');
            // Property: README.md should start with a markdown heading
            return content.trim().startsWith('#');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional unit tests for completeness
  describe('README Content Verification', () => {
    it('should verify all directories exist', () => {
      for (const dirPath of newDirectories) {
        const fullPath = path.join(process.cwd(), dirPath);
        expect(fs.existsSync(fullPath), `Directory ${dirPath} should exist`).toBe(true);
      }
    });

    it('should verify all README.md files exist', () => {
      for (const dirPath of newDirectories) {
        const readmePath = path.join(process.cwd(), dirPath, 'README.md');
        expect(fs.existsSync(readmePath), `README.md should exist in ${dirPath}`).toBe(true);
      }
    });
  });
});
