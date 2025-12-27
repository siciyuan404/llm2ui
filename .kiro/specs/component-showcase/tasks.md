# Implementation Tasks: Component Showcase & Management

## Phase 1: 核心服务层 (Core Services)

### Task 1: 增强 Component Registry
- [x] 扩展 `src/lib/component-registry.ts`，添加多平台支持
- [x] 实现 `ComponentDefinition` 接口（含 version、platforms、examples、tags）
- [x] 实现 `getByCategory()`、`search()`、`getVersions()` 方法
- [x] 添加平台筛选参数到 `get()` 和 `getAll()` 方法
- [x] 创建 `src/lib/component-registry.test.ts` 属性测试

**验证 Requirements**: 1.1, 7.1, 10.1, 10.2
**验证 Properties**: 1, 7

### Task 2: 实现 Schema Generator
- [x] 创建 `src/lib/schema-generator.ts`
- [x] 实现 `generate()` 从组件定义生成 A2UI Schema
- [x] 实现 `generateAll()` 批量生成
- [x] 实现 `loadOnDemand()` 按需加载 Schema
- [x] 创建 `src/lib/schema-generator.test.ts` 属性测试

**验证 Requirements**: 8.1, 8.2, 8.3, 8.4
**验证 Properties**: 4

### Task 3: 实现 Template Manager
- [x] 创建 `src/lib/template-manager.ts`
- [x] 实现三层模板结构（Base → Platform → Theme）
- [x] 实现 `registerTemplate()` 和 `getTemplate()` 方法
- [x] 实现 `mergeTemplates()` 深度合并逻辑
- [x] 创建 `src/lib/template-manager.test.ts` 属性测试

**验证 Requirements**: 9.1, 9.2, 9.3, 9.4
**验证 Properties**: 5

### Task 4: 实现 Platform Adapter
- [x] 创建 `src/lib/platform-adapter.ts`
- [x] 定义四平台的属性/样式/事件映射表
- [x] 实现 `adapt()` 跨平台 Schema 转换
- [x] 实现 `isSupported()` 平台支持检查
- [x] 创建 `src/lib/platform-adapter.test.ts` 属性测试

**验证 Requirements**: 7.2, 7.4, 7.5
**验证 Properties**: 6

### Task 5: 实现 Icon Registry
- [x] 创建 `src/lib/icon-registry.ts`
- [x] 实现图标注册和分类管理
- [x] 实现 `search()` 图标搜索（名称+标签）
- [x] 集成 Lucide 图标库作为默认图标集
- [x] 创建 `src/lib/icon-registry.test.ts` 属性测试

**验证 Requirements**: 12.1, 12.2, 12.3
**验证 Properties**: 9

---

## Phase 2: 组件展示 UI

### Task 6: 创建 Showcase 页面框架
- [x] 创建 `src/components/showcase/ComponentShowcase.tsx` 主页面
- [x] 实现 `ShowcaseState` 状态管理
- [x] 添加路由配置 `/showcase`
- [x] 实现页面布局（侧边栏 + 主内容区）

**验证 Requirements**: 6.1, 6.2, 6.3

### Task 7: 实现组件列表与筛选
- [x] 创建 `src/components/showcase/ComponentList.tsx`
- [x] 实现分类筛选器 `CategoryFilter.tsx`
- [x] 实现搜索框 `SearchInput.tsx`
- [x] 实现平台切换器 `PlatformSwitcher.tsx`
- [x] 实现空状态和无结果提示

**验证 Requirements**: 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4
**验证 Properties**: 2, 3

### Task 8: 实现组件卡片与预览
- [x] 创建 `src/components/showcase/ComponentCard.tsx`
- [x] 实现 `LivePreview.tsx` 实时渲染预览
- [x] 实现变体展示和状态切换（hover、disabled）
- [x] 添加 Error Boundary 处理渲染错误
- [x] 实现网格/列表视图切换

**验证 Requirements**: 2.1, 2.2, 2.3, 2.4, 15.1

### Task 9: 实现属性面板
- [x] 创建 `src/components/showcase/PropsPanel.tsx`
- [x] 显示属性类型、必填、默认值
- [x] 显示枚举值列表
- [x] 显示属性描述

**验证 Requirements**: 3.1, 3.2, 3.3, 3.4
**验证 Properties**: 10

### Task 10: 实现案例展示
- [x] 创建 `src/components/showcase/ExamplesTab.tsx`
- [x] 显示组件使用案例和 JSON Schema
- [x] 实现一键复制 Schema
- [x] 实现"在编辑器中打开"功能

**验证 Requirements**: 11.1, 11.2, 11.3, 11.4

### Task 11: 实现图标库页面
- [x] 创建 `src/components/showcase/IconLibrary.tsx`
- [x] 实现图标网格展示
- [x] 实现搜索和分类筛选
- [x] 实现点击复制图标代码
- [x] 实现大小和颜色预览

**验证 Requirements**: 12.1, 12.2, 12.3, 12.4, 12.5

### Task 12: 实现预览模式
- [x] 实现深色/浅色模式切换
- [x] 实现响应式预览（desktop/tablet/mobile）
- [x] 实现全屏预览模式

**验证 Requirements**: 15.2, 15.3, 15.4

---

## Phase 3: SDK 层 (NPM Package)

### Task 13: 创建 JSON Renderer SDK
- [x] 创建 `src/sdk/index.ts` 入口文件
- [x] 实现 `render(schema, container)` 核心方法
- [x] 实现 `createRenderer(options)` 工厂方法
- [x] 实现 `update()` 和 `destroy()` 生命周期
- [x] 实现事件系统 `on()`/`off()`
- [x] 创建 `src/sdk/renderer.test.ts` 属性测试

**验证 Requirements**: 14.1, 14.2, 14.4
**验证 Properties**: 8

### Task 14: 实现框架封装
- [x] 创建 `src/sdk/react/LLM2UI.tsx` React 组件封装
- [x] 创建 `src/sdk/vue/LLM2UI.ts` Vue 组件封装
- [x] 实现自定义组件注册 API

**验证 Requirements**: 14.3, 14.5

### Task 15: 配置 NPM 包构建
- [x] 创建 `packages/renderer/package.json`
- [x] 配置 Vite 打包（支持 ESM/CJS）
- [x] 配置 Tree-shaking
- [x] 编写 README 文档

**验证 Requirements**: 13.1, 13.2, 13.3, 13.4, 13.5

---

## Phase 4: 高级功能

### Task 16: 实现版本管理 UI ✅
- [x] Component Registry 已支持多版本（getVersions、版本化存储）
- [x] 实现版本选择 UI 组件
  - 创建 `VersionSelector.tsx` 组件，支持版本下拉选择
  - 显示当前版本和可用版本列表
  - 支持最新版本标记
  - _Requirements: 10.3_
- [x] 实现升级建议提示
  - 创建 `UpgradeAlert.tsx` 组件
  - 当使用旧版本组件时显示升级提示
  - 显示 deprecationMessage 警告
  - _Requirements: 10.4_
- [x] 创建版本迁移指南模板
  - 在 `ExamplesTab.tsx` 中实现 `MigrationGuideSection` 组件
  - 显示版本变更说明（breaking/feature/fix/deprecation）
  - _Requirements: 10.5_

**验证 Requirements**: 10.3, 10.4, 10.5

### Task 17: 实现用户自定义案例 ✅
- [x] 创建案例提交表单
  - 创建 `CustomExampleForm.tsx` 组件
  - 支持输入标题、描述、JSON Schema
  - 实现表单验证和实时预览
  - _Requirements: 11.5_
- [x] 实现案例存储（localStorage）
  - 创建 `custom-examples-storage.ts` 工具
  - 支持增删改查自定义案例
  - 创建 `custom-examples-storage.test.ts` 单元测试
  - _Requirements: 11.5_
- [x] 在 ExamplesTab 中显示用户自定义案例
  - 区分系统案例和用户案例（不同颜色标记）
  - 支持添加和删除自定义案例
  - _Requirements: 11.5_

**验证 Requirements**: 11.5

### Task 18: 平台差异对比 ✅
- [x] 创建 `PlatformComparison.tsx` 组件
  - 并排显示同一组件在不同平台的预览
  - 支持预览模式和表格模式切换
  - _Requirements: 7.3_
- [x] 显示同一组件在不同平台的差异
  - 实现 `MultiPlatformDifferencePanel` 多平台对比
  - 对比属性、样式、事件支持情况
  - _Requirements: 7.3_
- [x] 高亮显示属性/样式差异
  - 使用颜色标记不同平台的差异项
  - 支持仅显示差异项筛选
  - _Requirements: 7.3_

**验证 Requirements**: 7.3

---

## Phase 5: 属性测试 (Property-Based Testing)

### Task 19: 核心属性测试（已完成）
- [x] Property 1: 组件注册表查找一致性测试 (`component-registry.test.ts`)
- [x] Property 2: 分类筛选完整性测试 (`component-registry.test.ts`)
- [x] Property 3: 搜索结果相关性测试 (`component-registry.test.ts`)
- [x] Property 4: Schema 生成一致性测试 (`schema-generator.test.ts`)
- [x] Property 5: 模板合并正确性测试 (`template-manager.test.ts`)

**验证 Properties**: 1, 2, 3, 4, 5

### Task 20: 高级属性测试（已完成）
- [x] Property 6: 平台适配映射正确性测试 (`platform-adapter.test.ts`)
- [x] Property 7: 版本查找一致性测试 (`component-registry.test.ts`)
- [x] Property 8: SDK 渲染一致性测试 (`sdk/renderer.test.ts`)
- [x] Property 9: 图标搜索完整性测试 (`icon-registry.test.ts`)
- [x] Property 10: Props 显示完整性测试（通过 PropsPanel 组件实现）

**验证 Properties**: 6, 7, 8, 9, 10

---

## 任务依赖关系

```
Phase 1 (并行) ✅ 已完成:
  Task 1 ─┬─> Task 2
          ├─> Task 3
          ├─> Task 4
          └─> Task 5

Phase 2 (依赖 Phase 1) ✅ 已完成:
  Task 6 ─> Task 7 ─> Task 8
                   ├─> Task 9
                   ├─> Task 10
                   └─> Task 11 ─> Task 12

Phase 3 (依赖 Task 1, 2) ✅ 已完成:
  Task 13 ─> Task 14 ─> Task 15

Phase 4 (依赖 Phase 2) ✅ 已完成:
  Task 16, Task 17, Task 18 (并行)

Phase 5 (贯穿所有阶段) ✅ 已完成:
  Task 19, Task 20
```

## 优先级建议

1. **P0 (必须)**: ✅ Task 1, 6, 7, 8, 9, 13 - 已完成
2. **P1 (重要)**: ✅ Task 2, 3, 4, 5, 10, 14, 15 - 已完成
3. **P2 (增强)**: ✅ Task 11, 12, 16, 17, 18 - 已完成
4. **P3 (质量)**: ✅ Task 19, 20 - 已完成

## 剩余工作

✅ 所有任务已完成！

Component Showcase & Management 功能已全部实现，包括：
- Phase 1: 核心服务层（Component Registry、Schema Generator、Template Manager、Platform Adapter、Icon Registry）
- Phase 2: 组件展示 UI（Showcase 页面、组件列表、筛选、预览、属性面板、案例展示、图标库）
- Phase 3: SDK 层（JSON Renderer SDK、React/Vue 封装、NPM 包配置）
- Phase 4: 高级功能（版本管理 UI、用户自定义案例、平台差异对比）
- Phase 5: 属性测试（所有 10 个 Property 测试已完成）
