/**
 * @llm2ui/renderer - Main Entry Point
 * 
 * This is the main entry point for the @llm2ui/renderer NPM package.
 * It re-exports all public APIs from the SDK.
 * 
 * @module @llm2ui/renderer
 * @see Requirements 13.1, 13.2, 14.1, 14.2
 * 
 * @example
 * ```typescript
 * import { render, createRenderer, LLM2UI } from '@llm2ui/renderer';
 * 
 * // Simple render
 * render(schema, document.getElementById('app'));
 * 
 * // With options
 * const renderer = createRenderer({ theme: 'dark' });
 * renderer.render(schema, container);
 * 
 * // React component
 * <LLM2UI schema={schema} onEvent={handleEvent} />
 * ```
 */

// Note: During build, these imports will be resolved from the main src/sdk
// For development, this file serves as a reference for the package structure

// Re-export everything from the main SDK
// In the actual build, the source files will be copied or bundled here

export * from '../../../src/sdk/index';
