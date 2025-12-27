# Design Document: Component Showcase & Management

## Overview

组件展示与管理系统是 LLM2UI 的核心模块，提供多平台组件的集中管理、展示、文档化和 SDK 发布能力。系统采用分层架构，支持按需加载、模板复用和版本管理，并提供类似 amis 的 JSON 渲染 SDK 供外部项目使用。

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component Showcase UI                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 组件列表  │ │ 案例展示  │ │ 图标库   │ │ 文档     │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Core Services Layer                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Component    │ │ Schema       │ │ Template     │            │
│  │ Registry     │ │ Generator    │ │ Manager      │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Platform     │ │ Version      │ │ Icon         │            │
│  │ Adapter      │ │ Manager      │ │ Registry     │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    SDK Layer (NPM Package)                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ JSON         │ │ React        │ │ Vue          │            │
│  │ Renderer     │ │ Wrapper      │ │ Wrapper      │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Component Registry (增强版)

```typescript
interface PlatformType = 'pc-web' | 'mobile-web' | 'mobile-native' | 'pc-desktop';

interface ComponentDefinition {
  name: string;
  version: string;
  platforms: PlatformType[];
  component: ComponentType<any>;
  propsSchema: Record<string, PropSchema>;
  category: 'input' | 'layout' | 'display' | 'feedback' | 'navigation';
  description: string;
  examples: ComponentExample[];
  icon?: string;
  tags?: string[];
  deprecated?: boolean;
  deprecationMessage?: string;
}

interface ComponentExample {
  title: string;
  description: string;
  schema: UISchema;
  preview?: string; // 预览图 URL
}

interface ComponentRegistry {
  register(definition: ComponentDefinition): void;
  get(name: string, platform?: PlatformType, version?: string): ComponentDefinition | undefined;
  getAll(platform?: PlatformType): ComponentDefinition[];
  getByCategory(category: string, platform?: PlatformType): ComponentDefinition[];
  search(query: string, platform?: PlatformType): ComponentDefinition[];
  getVersions(name: string): string[];
}
```

### 2. Schema Generator

```typescript
interface SchemaGeneratorOptions {
  includeExamples?: boolean;
  includeDeprecated?: boolean;
  platform?: PlatformType;
}

interface GeneratedSchema {
  component: string;
  version: string;
  props: Record<string, PropSchemaDefinition>;
  events: EventDefinition[];
  slots?: SlotDefinition[];
  examples?: UISchema[];
}

interface SchemaGenerator {
  generate(componentName: string, options?: SchemaGeneratorOptions): GeneratedSchema;
  generateAll(options?: SchemaGeneratorOptions): Record<string, GeneratedSchema>;
  loadOnDemand(componentName: string): Promise<GeneratedSchema>;
}
```

### 3. Template Manager (模板分层)

```typescript
interface TemplateLayer = 'base' | 'platform' | 'theme';

interface ComponentTemplate {
  layer: TemplateLayer;
  platform?: PlatformType;
  theme?: string;
  template: UISchema;
  styles?: Record<string, string>;
}

interface TemplateManager {
  registerTemplate(componentName: string, template: ComponentTemplate): void;
  getTemplate(componentName: string, platform: PlatformType, theme?: string): UISchema;
  mergeTemplates(base: UISchema, ...overrides: UISchema[]): UISchema;
}
```

### 4. Platform Adapter

```typescript
interface PlatformMapping {
  props: Record<string, string>; // 属性名映射
  styles: Record<string, string>; // 样式映射
  events: Record<string, string>; // 事件映射
}

interface PlatformAdapter {
  adapt(schema: UISchema, targetPlatform: PlatformType): UISchema;
  getMapping(componentName: string, sourcePlatform: PlatformType, targetPlatform: PlatformType): PlatformMapping;
  isSupported(componentName: string, platform: PlatformType): boolean;
}
```

### 5. Icon Registry

```typescript
interface IconDefinition {
  name: string;
  category: 'general' | 'arrow' | 'social' | 'file' | 'media' | 'action';
  svg: string;
  tags: string[];
}

interface IconRegistry {
  register(icon: IconDefinition): void;
  get(name: string): IconDefinition | undefined;
  getAll(): IconDefinition[];
  getByCategory(category: string): IconDefinition[];
  search(query: string): IconDefinition[];
}
```

### 6. JSON Renderer SDK

```typescript
interface RendererOptions {
  platform?: PlatformType;
  theme?: 'light' | 'dark';
  locale?: string;
  onEvent?: (event: UIEvent) => void;
  customComponents?: Record<string, ComponentType<any>>;
}

interface LLM2UIRenderer {
  render(schema: UISchema, container: HTMLElement): void;
  update(schema: UISchema): void;
  destroy(): void;
  on(event: string, handler: Function): void;
  off(event: string, handler?: Function): void;
}

// React 封装
interface LLM2UIProps {
  schema: UISchema;
  data?: DataContext;
  onEvent?: (event: UIEvent) => void;
  className?: string;
}

// 使用示例
// import { render, LLM2UI } from '@llm2ui/renderer';
// render(schema, document.getElementById('app'));
// <LLM2UI schema={schema} data={data} onEvent={handleEvent} />
```

## Data Models

### Component Showcase State

```typescript
interface ShowcaseState {
  // 筛选状态
  selectedPlatform: PlatformType;
  selectedCategory: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  
  // 预览状态
  previewTheme: 'light' | 'dark';
  previewSize: 'desktop' | 'tablet' | 'mobile';
  
  // 当前选中
  selectedComponent: string | null;
  selectedTab: 'preview' | 'props' | 'examples' | 'code';
}
```

### Filtered Components

```typescript
interface FilteredResult {
  components: ComponentDefinition[];
  totalCount: number;
  categoryCount: Record<string, number>;
}

function filterComponents(
  registry: ComponentRegistry,
  state: ShowcaseState
): FilteredResult;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do.*

### Property 1: 组件注册表查找一致性
*For any* 已注册的组件定义，通过 `registry.get(name)` 获取的组件 SHALL 与注册时的定义完全一致。
**Validates: Requirements 1.1, 7.1**

### Property 2: 分类筛选完整性
*For any* 组件类别筛选，筛选结果中的所有组件 SHALL 属于该类别，且该类别的所有组件都 SHALL 包含在结果中。
**Validates: Requirements 4.2, 4.3**

### Property 3: 搜索结果相关性
*For any* 搜索查询，返回的所有组件的名称或描述 SHALL 包含搜索关键词（模糊匹配）。
**Validates: Requirements 5.2, 5.3**

### Property 4: Schema 生成一致性
*For any* 组件定义，生成的 Schema SHALL 包含组件的所有 props、events 和 slots 定义。
**Validates: Requirements 8.1, 8.3**

### Property 5: 模板合并正确性
*For any* 模板分层（Base → Platform → Theme），后层的属性 SHALL 覆盖前层的同名属性，未覆盖的属性 SHALL 保留。
**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 6: 平台适配映射正确性
*For any* 跨平台组件，适配后的 Schema SHALL 保持语义等价，仅属性名和样式名发生映射变换。
**Validates: Requirements 7.4**

### Property 7: 版本查找一致性
*For any* 指定版本的组件查询，返回的组件版本 SHALL 与请求的版本完全匹配。
**Validates: Requirements 10.1, 10.2**

### Property 8: SDK 渲染一致性
*For any* 有效的 UISchema，`render(schema, container)` 后容器内 SHALL 包含与 Schema 对应的 DOM 结构。
**Validates: Requirements 14.1**

### Property 9: 图标搜索完整性
*For any* 图标搜索查询，返回的图标名称或标签 SHALL 包含搜索关键词。
**Validates: Requirements 12.2**

### Property 10: Props 显示完整性
*For any* 组件的 propsSchema，Props_Panel SHALL 显示所有定义的属性及其完整信息（类型、必填、默认值、枚举值、描述）。
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Error Handling

### 组件渲染错误
- 使用 React Error Boundary 捕获渲染错误
- 显示友好的错误提示卡片，包含组件名称和错误信息
- 提供"重试"按钮

### Schema 加载错误
- 按需加载失败时显示加载错误提示
- 提供重试机制和离线缓存回退

### 平台不支持错误
- 组件不支持当前平台时显示"不支持"标识
- 提供切换到支持平台的建议

## Testing Strategy

### 单元测试
- 组件注册表的 CRUD 操作
- 搜索和筛选逻辑
- Schema 生成逻辑
- 模板合并逻辑
- 平台适配映射

### 属性测试 (Property-Based Testing)
- 使用 fast-check 库
- 每个属性测试至少运行 100 次迭代
- 测试标签格式: **Feature: component-showcase, Property N: {property_text}**

### 集成测试
- 组件展示页面的完整渲染
- SDK 的 render/update/destroy 生命周期
- 跨平台组件的适配流程
