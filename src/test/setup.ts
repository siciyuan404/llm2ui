import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock ResizeObserver for components that use it (e.g., cmdk)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock scrollIntoView for components that use it (e.g., cmdk)
Element.prototype.scrollIntoView = function() {}

// Mock document.queryCommandSupported for monaco-editor
if (typeof document !== 'undefined' && !document.queryCommandSupported) {
  document.queryCommandSupported = () => false;
}

// Mock monaco-editor to avoid browser-specific API issues in tests
vi.mock('monaco-editor', () => ({
  editor: {
    create: vi.fn(),
    defineTheme: vi.fn(),
    setTheme: vi.fn(),
  },
  languages: {
    register: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
    registerCompletionItemProvider: vi.fn(),
  },
  Uri: {
    parse: vi.fn(),
  },
}));

vi.mock('@monaco-editor/react', () => ({
  loader: {
    config: vi.fn(),
  },
  default: vi.fn(() => null),
}));

// Cleanup after each test case
afterEach(() => {
  cleanup()
})
