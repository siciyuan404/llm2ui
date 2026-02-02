/**
 * @file ComponentsModule.tsx
 * @description 基础组件展示模块，展示组件库中的所有组件，包含分类侧边栏、组件文档、预览和属性表
 *              增强功能：为每个组件添加 "Token Mappings" 部分，显示每个 Prop 应该使用哪些 Tokens
 * @module components/showcase/ComponentsModule
 * @requirements 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 6.2
 */

import * as React from 'react';
import { cn, copyToClipboard } from '@/lib/utils';
import {
  LayoutGrid,
  Type,
  FormInput,
  Navigation,
  Sparkles,
  MessageSquare,
  BarChart3,
  Layers,
  Package,
} from 'lucide-react';
import {
  defaultRegistry,
} from '@/lib';
import type {
  ComponentDefinition,
  ComponentRegistry,
  ScreenSize,
} from '@/lib';
import type { UISchema } from '@/types';
import { UIRenderer } from '@/lib';
import { ErrorBoundary, DefaultErrorFallback } from '@/components/preview/ErrorBoundary';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronIcon } from '@/components/ui/icons';
import { ScreenSizeSwitcher, getScreenSizeDimensions } from './ScreenSizeSwitcher';
import {
  PropsTable,
  TokenMappingsSection,
  CategorySidebar,
  type ComponentCategoryConfig,
} from './components-module';

// ============================================================================
// Types
// ============================================================================

/**
 * ComponentsModule Props
 */
export interface ComponentsModuleProps {
  /** 当前选中的组件名称 */
  activeComponent?: string | null;
  /** 组件选择回调 */
  onComponentSelect?: (componentName: string) => void;
  /** 当前预览尺寸 */
  previewSize?: ScreenSize;
  /** 预览尺寸变化回调 */
  onPreviewSizeChange?: (size: ScreenSize) => void;
  /** 在编辑器中打开回调 */
  onOpenInEditor?: (schema: UISchema) => void;
  /** 组件注册表（可选，默认使用 defaultRegistry） */
  registry?: ComponentRegistry;
  /** 自定义类名 */
  className?: string;
}

/**
 * ComponentDoc Props
 */
export interface ComponentDocProps {
  /** 组件定义 */
  component: ComponentDefinition;
  /** 当前预览尺寸 */
  previewSize?: ScreenSize;
  /** 预览尺寸变化回调 */
  onPreviewSizeChange?: (size: ScreenSize) => void;
  /** 在编辑器中打开回调 */
  onOpenInEditor?: (schema: UISchema) => void;
  /** 组件注册表 */
  registry?: ComponentRegistry;
}

/**
 * Props 表格行数据
 */
export interface PropTableRow {
  name: string;
  description: string;
  type: string;
  options?: string[];
  default?: string;
  required: boolean;
  isComplex?: boolean;
  complexSchema?: PropSchema;
}

/**
 * 复制状态
 */
interface CopyState {
  key: string;
  copied: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * 默认组件分类配置
 * 按照 Requirements 3.1 定义的分类，使用 lucide-react 图标
 */
const DEFAULT_CATEGORIES: ComponentCategoryConfig[] = [
  {
    id: 'layout',
    label: 'Layout',
    icon: <LayoutGrid className="w-4 h-4" />,
    components: ['Row', 'Column', 'List', 'Card', 'Content', 'Container', 'Grid', 'Stack', 'Flex'],
  },
  {
    id: 'text',
    label: 'Text & Media',
    icon: <Type className="w-4 h-4" />,
    components: ['Text', 'Image', 'Icon', 'Video', 'Audio', 'Player', 'Avatar', 'Label', 'Heading'],
  },
  {
    id: 'input',
    label: 'Form & Input',
    icon: <FormInput className="w-4 h-4" />,
    components: ['Input', 'TextField', 'CheckBox', 'Slider', 'DateTimeInput', 'MultipleChoice', 'Textarea', 'Select', 'Switch', 'RadioGroup', 'Form', 'DatePicker', 'TimePicker', 'ColorPicker', 'FileUpload'],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    icon: <Navigation className="w-4 h-4" />,
    components: ['Button', 'Tabs', 'Modal', 'Link', 'Menu', 'Breadcrumb', 'Pagination', 'Stepper', 'Sidebar', 'Navbar', 'Dropdown'],
  },
  {
    id: 'decoration',
    label: 'Decoration',
    icon: <Sparkles className="w-4 h-4" />,
    components: ['Divider', 'Badge', 'Separator', 'Tooltip', 'Tag', 'Chip', 'Progress', 'Skeleton'],
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: <MessageSquare className="w-4 h-4" />,
    components: ['Alert', 'Toast', 'Dialog', 'Popover', 'Notification', 'Spinner', 'Loading', 'Empty', 'Result'],
  },
  {
    id: 'data',
    label: 'Data Display',
    icon: <BarChart3 className="w-4 h-4" />,
    components: ['Table', 'DataGrid', 'Chart', 'Statistic', 'Timeline', 'Tree', 'Calendar', 'Carousel'],
  },
  {
    id: 'overlay',
    label: 'Overlay',
    icon: <Layers className="w-4 h-4" />,
    components: ['Sheet', 'Drawer', 'Popconfirm', 'ContextMenu', 'Command', 'HoverCard'],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 生成组件预览 Schema
 */
function generatePreviewSchema(component: ComponentDefinition): UISchema {
  const baseProps: Record<string, unknown> = {};

  // 从 propsSchema 获取默认值
  if (component.propsSchema) {
    for (const [key, schema] of Object.entries(component.propsSchema)) {
      if (schema.default !== undefined) {
        baseProps[key] = schema.default;
      }
    }
  }

  // 为常见组件类型添加预览内容
  const previewProps = getPreviewPropsForComponent(component.name, baseProps);

  return {
    version: '1.0',
    root: {
      id: `preview-${component.name}`,
      type: component.name,
      props: previewProps,
    },
  };
}

/**
 * 获取组件预览所需的默认 props
 */
function getPreviewPropsForComponent(
  componentName: string,
  baseProps: Record<string, unknown>
): Record<string, unknown> {
  const props = { ...baseProps };
  const lowerName = componentName.toLowerCase();

  if (lowerName.includes('button')) {
    props.children = props.children ?? '按钮';
  } else if (lowerName.includes('input') || lowerName.includes('textfield')) {
    props.placeholder = props.placeholder ?? '请输入...';
  } else if (lowerName.includes('card')) {
    props.children = props.children ?? '卡片内容';
  } else if (lowerName.includes('text')) {
    props.children = props.children ?? '示例文本';
  } else if (lowerName.includes('badge')) {
    props.children = props.children ?? '徽章';
  } else if (lowerName.includes('link')) {
    props.children = props.children ?? '链接';
    props.href = props.href ?? '#';
  }

  return props;
}

/**
 * 格式化默认值显示
 */
function formatDefaultValue(value: unknown): string {
  if (value === undefined) return '-';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'function') return '[Function]';
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * 获取类型显示名称
 */
function getTypeDisplayName(type: PropSchema['type']): string {
  const typeNames: Record<PropSchema['type'], string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
    function: 'function',
  };
  return typeNames[type] || type;
}

/**
 * 获取类型徽章颜色
 */
function getTypeBadgeClass(type: PropSchema['type']): string {
  const typeColors: Record<PropSchema['type'], string> = {
    string: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    number: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    boolean: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    object: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    array: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    function: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  };
  return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
}

/**
 * 从注册表动态生成分类
 */
function generateCategoriesFromRegistry(registry: ComponentRegistry): ComponentCategoryConfig[] {
  const categories: ComponentCategoryConfig[] = [];
  const registeredComponents = new Set(registry.getAll().map(c => c.name));

  for (const defaultCategory of DEFAULT_CATEGORIES) {
    const availableComponents = defaultCategory.components.filter(name => 
      registeredComponents.has(name)
    );
    const unavailableComponents = defaultCategory.components.filter(name => 
      !registeredComponents.has(name)
    );

    categories.push({
      ...defaultCategory,
      components: [...availableComponents, ...unavailableComponents],
    });
  }

  // 添加未分类的组件
  const categorizedComponents = new Set(DEFAULT_CATEGORIES.flatMap(c => c.components));
  const uncategorized = registry.getAll()
    .filter(c => !categorizedComponents.has(c.name))
    .map(c => c.name);

  if (uncategorized.length > 0) {
    categories.push({
      id: 'other',
      label: 'Other',
      icon: <Package className="w-4 h-4" />,
      components: uncategorized,
    });
  }

  return categories;
}

// ============================================================================
// Sub-Components
// ============================================================================

// CategorySidebar, PropsTable, TokenMappingsSection 已拆分到 ./components-module/

/**
 * 组件预览区域
 */
function ComponentPreview({
  component,
  previewSize,
  registry,
}: {
  component: ComponentDefinition;
  previewSize: ScreenSize;
  registry: ComponentRegistry;
}) {
  const [errorKey, setErrorKey] = React.useState(0);
  const [currentVariant, setCurrentVariant] = React.useState<string | null>(null);

  // 获取组件的变体选项
  const variants = React.useMemo(() => {
    const variantProps: { name: string; options: string[] }[] = [];
    if (component.propsSchema) {
      for (const [name, schema] of Object.entries(component.propsSchema)) {
        if (schema.enum && schema.enum.length > 1) {
          variantProps.push({ name, options: schema.enum });
        }
      }
    }
    return variantProps;
  }, [component.propsSchema]);

  // 生成预览 Schema
  const previewSchema = React.useMemo(() => {
    const schema = generatePreviewSchema(component);
    // 应用当前变体
    if (currentVariant && variants.length > 0) {
      const [propName, value] = currentVariant.split(':');
      if (schema.root.props) {
        schema.root.props[propName] = value;
      }
    }
    return schema;
  }, [component, currentVariant, variants]);

  const handleErrorReset = () => {
    setErrorKey(k => k + 1);
  };

  const isRegistered = registry.has(component.name);
  const sizeConfig = getScreenSizeDimensions(previewSize);

  return (
    <div className="space-y-4">
      {/* 变体切换器 */}
      {variants.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {variants.slice(0, 3).map(variant => (
            <div key={variant.name} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{variant.name}:</span>
              <div className="flex gap-1">
                {variant.options.map(option => {
                  const variantKey = `${variant.name}:${option}`;
                  const isActive = currentVariant === variantKey;
                  return (
                    <button
                      key={option}
                      onClick={() => setCurrentVariant(isActive ? null : variantKey)}
                      className={cn(
                        'px-2 py-1 text-xs rounded transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 预览容器 */}
      <div
        className={cn(
          'border rounded-lg bg-background p-6 min-h-[200px] flex items-center justify-center',
          previewSize !== 'desktop' && 'mx-auto border-dashed'
        )}
        style={{
          width: sizeConfig.width,
          maxWidth: '100%',
        }}
      >
        {isRegistered ? (
          <ErrorBoundary
            key={errorKey}
            fallback={DefaultErrorFallback}
            onReset={handleErrorReset}
          >
            <UIRenderer schema={previewSchema} registry={registry} />
          </ErrorBoundary>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">组件未注册</p>
            <p className="text-xs mt-1">{component.name}</p>
          </div>
        )}
      </div>

      {/* 尺寸指示器 */}
      {previewSize !== 'desktop' && (
        <div className="text-center text-xs text-muted-foreground">
          {sizeConfig.width}
        </div>
      )}
    </div>
  );
}

/**
 * 代码块组件
 */
function CodeBlock({
  code,
  language = 'json',
  copyState,
  onCopy,
}: {
  code: string;
  language?: string;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
}) {
  const isCopied = copyState?.key === 'code' && copyState?.copied;

  return (
    <div className="relative">
      <pre className={`p-4 bg-muted rounded-lg overflow-auto text-sm font-mono language-${language}`}>
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={() => onCopy('code', code)}
      >
        {isCopied ? '✓ 已复制' : '复制'}
      </Button>
    </div>
  );
}

/**
 * 组件文档组件
 */
export function ComponentDoc({
  component,
  previewSize = 'desktop',
  onPreviewSizeChange,
  onOpenInEditor,
  registry = defaultRegistry,
}: ComponentDocProps) {
  const [copyState, setCopyState] = React.useState<CopyState | null>(null);

  // 生成使用示例 Schema
  const usageSchema = React.useMemo(() => {
    return generatePreviewSchema(component);
  }, [component]);

  const usageCode = React.useMemo(() => {
    return JSON.stringify(usageSchema, null, 2);
  }, [usageSchema]);

  // 处理复制
  const handleCopy = async (key: string, value: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopyState({ key, copied: true });
      setTimeout(() => setCopyState(null), 2000);
    }
  };

  // 处理在编辑器中打开
  const handleOpenInEditor = () => {
    if (onOpenInEditor) {
      onOpenInEditor(usageSchema);
    }
  };

  // 获取支持的屏幕尺寸徽章
  const supportedSizes = component.platforms?.length
    ? component.platforms
    : ['pc-web', 'mobile-web', 'tablet'];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{component.name}</h1>
              {component.description && (
                <p className="text-muted-foreground mt-1">{component.description}</p>
              )}
            </div>
            {onPreviewSizeChange && (
              <ScreenSizeSwitcher
                value={previewSize}
                onChange={onPreviewSizeChange}
                syncWithUrl={false}
              />
            )}
          </div>

          {/* Screen Size Badges */}
          <div className="flex gap-2 mt-3">
            {supportedSizes.map(size => (
              <span
                key={size}
                className="text-xs px-2 py-1 bg-muted rounded"
              >
                {size}
              </span>
            ))}
          </div>

          {/* Deprecated Warning */}
          {component.deprecated && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ 此组件已弃用
                {component.deprecationMessage && `: ${component.deprecationMessage}`}
              </p>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ComponentPreview
              component={component}
              previewSize={previewSize}
              registry={registry}
            />
          </CardContent>
        </Card>

        {/* Usage Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Usage</CardTitle>
            {onOpenInEditor && (
              <Button variant="outline" size="sm" onClick={handleOpenInEditor}>
                在编辑器中打开
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={usageCode}
              copyState={copyState}
              onCopy={handleCopy}
            />
          </CardContent>
        </Card>

        {/* Props Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Props</CardTitle>
            {component.propsSchema && (
              <p className="text-sm text-muted-foreground">
                共 {Object.keys(component.propsSchema).length} 个属性
                {Object.values(component.propsSchema).filter(s => s.required).length > 0 && (
                  <span className="ml-2">
                    （{Object.values(component.propsSchema).filter(s => s.required).length} 个必填）
                  </span>
                )}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <PropsTable propsSchema={component.propsSchema || {}} />
          </CardContent>
        </Card>

        {/* Token Mappings Section - Requirements 6.2 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Token Mappings</CardTitle>
            <p className="text-sm text-muted-foreground">
              显示每个 Prop 应该使用哪些 Design Tokens
            </p>
          </CardHeader>
          <CardContent>
            <TokenMappingsSection componentName={component.name} />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

/**
 * 空状态组件
 */
function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <svg
          className="w-16 h-16 mx-auto mb-4 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="text-sm">选择一个组件查看文档</p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ComponentsModule - 基础组件展示模块
 * 
 * 功能：
 * - 组件分类侧边栏（从 ComponentRegistry 动态生成）
 * - 组件文档展示（Header、Preview、Usage、Props）
 * - 变体切换功能
 * - Props 表格（枚举徽章、复杂类型展开）
 * - 屏幕尺寸切换预览
 * 
 * @see Requirements 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 */
export function ComponentsModule({
  activeComponent = null,
  onComponentSelect,
  previewSize = 'desktop',
  onPreviewSizeChange,
  onOpenInEditor,
  registry = defaultRegistry,
  className,
}: ComponentsModuleProps) {
  // 从注册表动态生成分类
  const categories = React.useMemo(() => {
    return generateCategoriesFromRegistry(registry);
  }, [registry]);

  // 获取当前选中的组件定义
  const selectedComponent = React.useMemo(() => {
    if (!activeComponent) return null;
    return registry.get(activeComponent) || null;
  }, [activeComponent, registry]);

  // 处理组件选择
  const handleComponentSelect = (componentName: string) => {
    onComponentSelect?.(componentName);
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* Category Sidebar */}
      <CategorySidebar
        categories={categories}
        activeComponent={activeComponent}
        onComponentSelect={handleComponentSelect}
        registry={registry}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {selectedComponent ? (
          <ComponentDoc
            component={selectedComponent}
            previewSize={previewSize}
            onPreviewSizeChange={onPreviewSizeChange}
            onOpenInEditor={onOpenInEditor}
            registry={registry}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

export default ComponentsModule;
