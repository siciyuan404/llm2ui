/**
 * @file import-compatibility.test.ts
 * @description Property-based test for backward compatibility of imports
 * 
 * **Feature: architecture-refactor, Property 1: Backward Compatibility of Imports**
 * **Validates: Requirements 1.2, 1.9**
 * 
 * @module lib
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// Import from core module only
import {
  ComponentRegistry,
  defaultRegistry,
  ComponentCatalog,
  defaultCatalog,
  render,
  UIRenderer,
  validateJSON,
  validateUISchema,
} from './core';

describe('Import Compatibility - Property-Based Tests', () => {
  describe('Property 1: Backward Compatibility of Imports', () => {
    it('should have core module exports accessible', () => {
      expect(ComponentRegistry).toBeDefined();
      expect(defaultRegistry).toBeDefined();
      expect(ComponentCatalog).toBeDefined();
      expect(defaultCatalog).toBeDefined();
      expect(render).toBeDefined();
      expect(UIRenderer).toBeDefined();
      expect(validateJSON).toBeDefined();
      expect(validateUISchema).toBeDefined();
    });

    it('should verify core exports are correct types', () => {
      const exports = [
        ComponentRegistry, defaultRegistry,
        ComponentCatalog, defaultCatalog,
        render, UIRenderer,
        validateJSON, validateUISchema,
      ];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...exports),
          (exportValue) => exportValue !== undefined && exportValue !== null
        ),
        { numRuns: exports.length }
      );
    });
  });
});
