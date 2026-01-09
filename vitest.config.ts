/**
 * @file vitest.config.ts
 * @description Vitest 测试配置文件，支持架构重构后的新目录结构
 * @module vitest-config
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    /**
     * 测试文件发现配置
     * 支持架构重构后的所有子目录中的测试文件：
     * 
     * 核心库 (src/lib/):
     * - src/lib/core/*.test.ts          - 核心渲染模块测试
     * - src/lib/llm/*.test.ts           - LLM 相关模块测试
     * - src/lib/design-system/*.test.ts - 设计系统模块测试
     * - src/lib/examples/*.test.ts      - 案例系统模块测试
     * - src/lib/storage/*.test.ts       - 持久化模块测试
     * - src/lib/utils/*.test.ts         - 工具函数模块测试
     * - src/lib/*.test.ts               - 向后兼容的根级测试文件
     * 
     * 状态管理 (src/stores/):
     * - src/stores/*.test.ts            - Zustand store 测试
     * 
     * 自定义 Hooks (src/hooks/):
     * - src/hooks/*.test.ts             - React hooks 测试
     * 
     * 组件 (src/components/):
     * - src/components/**\/*.test.tsx    - React 组件测试
     * 
     * 通用测试:
     * - src/test/*.test.ts              - 通用测试文件
     */
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    /**
     * 排除的测试文件
     */
    exclude: [
      'node_modules/**',
      'dist/**',
      'packages/**', // packages/renderer 有独立的 vitest 配置
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
