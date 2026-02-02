/**
 * @file ExamplesModule.tsx
 * @description 案例展示模块，展示 UI 案例库，包含分类侧边栏、案例文档（预览、代码、编辑器打开）
 *              增强功能：添加 "Composition Analysis" 部分，显示使用的组件和 Tokens，支持点击组件导航
 * @module components/showcase/ExamplesModule
 * @requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.3, 6.5
 */

import * as React from 'react';
import { cn, copyToClipboard } from '@/lib/utils';
import {
  LayoutGrid,
  FormInput,
  Navigation,
  LayoutDashboard,
  Image,
  MessageSquare,
} from 'lucide-react';
import type { UISchema } from '@/types';
import {
  PRESET_EXAMPLES,
  getAllExamples,
  getCategoryLabel,
  UIRenderer,
  defaultRegistry,
  analyzeExampleComposition,
} from '@/lib';
import type {
  ScreenSize,
  ExampleMetadata,
  ExampleCategory,
  CustomExample,
  ExampleComposition,
  TokenReference,
} from '@/lib';
import { ErrorBoundary, DefaultErrorFallback } from '@/components/preview/ErrorBoundary';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronIcon } from '@/components/ui/icons';
import { ScreenSizeSwitcher, getScreenSizeDimensions } from './ScreenSizeSwitcher';

// ============================================================================
// Types
// ============================================================================

/**
 * ExamplesModule Props
 */
export interface ExamplesModuleProps {
  /** 当前选中的案例 ID */
  activeExampleId?: string | null;
  /** 案例选择回调 */
  onExampleSelect?: (exampleId: string) => void;
  /** 当前预览尺寸 */
  previewSize?: ScreenSize;
  /** 预览尺寸变化回调 */
  onPreviewSizeChange?: (size: ScreenSize) => void;
  /** 在编辑器中打开回调 */
  onOpenInEditor?: (schema: UISchema) => void;
  /** 导航到组件文档的回调 */
  onNavigateToComponent?: (componentName: string) => void;
  /** 自定义案例列表（可选，默认使用系统预设） */
  examples?: ExampleMetadata[];
  /** 自定义类名 */
  className?: string;
}

/**
 * ExampleDoc Props
 */
export interface ExampleDocProps {
  /** 案例数据 */
  example: ExampleMetadata;
  /** 当前预览尺寸 */
  previewSize?: ScreenSize;
  /** 预览尺寸变化回调 */
  onPreviewSizeChange?: (size: ScreenSize) => void;
  /** 在编辑器中打开回调 */
  onOpenInEditor?: (schema: UISchema) => void;
  /** 导航到组件文档的回调 */
  onNavigateToComponent?: (componentName: string) => void;
}

/**
 * 案例分类配置
 */
export interface ExampleCategoryConfig {
  /** 分类 ID */
  id: ExampleCategory;
  /** 分类标签 */
  label: string;
  /** 分类图标 */
  icon: React.ReactNode;
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
 * 案例分类配置
 * 按照 Requirements 5.1 定义的分类，使用 lucide-react 图标
 */
const EXAMPLE_CATEGORIES: ExampleCategoryConfig[] = [
  { id: 'layout', label: 'Layout', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'form', label: 'Form', icon: <FormInput className="w-4 h-4" /> },
  { id: 'navigation', label: 'Navigation', icon: <Navigation className="w-4 h-4" /> },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'display', label: 'Display', icon: <Image className="w-4 h-4" /> },
  { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-4 h-4" /> },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 将 CustomExample 转换为 ExampleMetadata 格式
 */
function convertCustomToMetadata(custom: CustomExample): ExampleMetadata {
  return {
    id: custom.id,
    title: custom.title,
    description: custom.description,
    category: 'layout' as ExampleCategory, // 默认分类
    tags: [],
    schema: custom.schema,
    source: 'custom',
    componentName: custom.componentName,
  };
}

/**
 * 获取所有案例（系统预设 + 用户自定义）
 */
function getAllExamplesData(): ExampleMetadata[] {
  const presetExamples = [...PRESET_EXAMPLES];
  const customExamples = getAllExamples().map(convertCustomToMetadata);
  return [...presetExamples, ...customExamples];
}

/**
 * 按分类分组案例
 */
function groupExamplesByCategory(examples: ExampleMetadata[]): Map<ExampleCategory, ExampleMetadata[]> {
  const grouped = new Map<ExampleCategory, ExampleMetadata[]>();
  
  for (const category of EXAMPLE_CATEGORIES) {
    grouped.set(category.id, []);
  }
  
  for (const example of examples) {
    const categoryExamples = grouped.get(example.category);
    if (categoryExamples) {
      categoryExamples.push(example);
    }
  }
  
  return grouped;
}

// ============================================================================
// Sub-Components
// ============================================================================


/**
 * 分类侧边栏组件
 */
function CategorySidebar({
  examplesByCategory,
  activeExampleId,
  onExampleSelect,
}: {
  examplesByCategory: Map<ExampleCategory, ExampleMetadata[]>;
  activeExampleId: string | null;
  onExampleSelect: (id: string) => void;
}) {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(() => {
    // 默认展开包含当前选中案例的分类
    const expanded = new Set<string>();
    if (activeExampleId) {
      for (const [category, examples] of examplesByCategory) {
        if (examples.some(e => e.id === activeExampleId)) {
          expanded.add(category);
          break;
        }
      }
    }
    // 默认展开第一个有案例的分类
    if (expanded.size === 0) {
      for (const [category, examples] of examplesByCategory) {
        if (examples.length > 0) {
          expanded.add(category);
          break;
        }
      }
    }
    return expanded;
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className="w-56 border-r bg-muted/30 flex-shrink-0">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold">Examples</h3>
      </div>
      <ScrollArea className="h-[calc(100%-57px)]">
        <div className="p-2">
          {EXAMPLE_CATEGORIES.map(category => {
            const examples = examplesByCategory.get(category.id) || [];
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id} className="mb-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium',
                    'rounded-md transition-colors hover:bg-muted'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ChevronIcon className={cn('transition-transform', isExpanded && 'rotate-90')} />
                    {category.icon}
                    <span>{category.label}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {examples.length}
                  </span>
                </button>

                {/* Category Items */}
                {isExpanded && examples.length > 0 && (
                  <div className="ml-4 space-y-0.5">
                    {examples.map(example => {
                      const isActive = activeExampleId === example.id;
                      const isCustom = example.source === 'custom';

                      return (
                        <button
                          key={example.id}
                          onClick={() => onExampleSelect(example.id)}
                          className={cn(
                            'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                            'flex items-center justify-between gap-2',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{example.title}</span>
                            {example.description && (
                              <span className={cn(
                                'text-xs truncate',
                                isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              )}>
                                {example.description.slice(0, 30)}
                                {example.description.length > 30 ? '...' : ''}
                              </span>
                            )}
                          </div>
                          {isCustom && (
                            <span className={cn(
                              'text-xs px-1.5 py-0.5 rounded shrink-0',
                              isActive
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                            )}>
                              自定义
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Empty Category */}
                {isExpanded && examples.length === 0 && (
                  <div className="ml-4 px-3 py-2 text-xs text-muted-foreground">
                    暂无案例
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * 案例预览区域
 */
function ExamplePreview({
  example,
  previewSize,
}: {
  example: ExampleMetadata;
  previewSize: ScreenSize;
}) {
  const [errorKey, setErrorKey] = React.useState(0);
  const sizeConfig = getScreenSizeDimensions(previewSize);

  const handleErrorReset = () => {
    setErrorKey(k => k + 1);
  };

  return (
    <div className="space-y-4">
      {/* 预览容器 */}
      <div
        className={cn(
          'border rounded-lg bg-background p-6 min-h-[300px] overflow-auto',
          previewSize !== 'desktop' && 'mx-auto border-dashed'
        )}
        style={{
          width: sizeConfig.width,
          maxWidth: '100%',
        }}
      >
        <ErrorBoundary
          key={errorKey}
          fallback={DefaultErrorFallback}
          onReset={handleErrorReset}
        >
          <UIRenderer schema={example.schema} registry={defaultRegistry} />
        </ErrorBoundary>
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
  copyState,
  onCopy,
}: {
  code: string;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
}) {
  const isCopied = copyState?.key === 'code' && copyState?.copied;

  return (
    <div className="relative">
      <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm font-mono max-h-[400px]">
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
 * Token 类别徽章颜色映射
 */
const TOKEN_CATEGORY_COLORS: Record<string, string> = {
  colors: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  spacing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  typography: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  shadows: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  radius: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

/**
 * Token 类别徽章组件
 */
function TokenCategoryBadge({ category }: { category: string }) {
  const colorClass = TOKEN_CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded', colorClass)}>
      {category}
    </span>
  );
}

/**
 * 组成分析部分组件
 * 显示案例使用的组件和 Tokens
 * @requirements 6.3, 6.5
 */
function CompositionAnalysisSection({
  composition,
  onNavigateToComponent,
}: {
  composition: ExampleComposition;
  onNavigateToComponent?: (componentName: string) => void;
}) {
  // 按类别分组 Tokens
  const tokensByCategory = React.useMemo(() => {
    const grouped: Record<string, TokenReference[]> = {};
    for (const token of composition.usedTokens) {
      const category = token.path.split('.')[0];
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(token);
    }
    return grouped;
  }, [composition.usedTokens]);

  // 获取唯一的 Token 路径
  const getUniqueTokenPaths = (tokens: TokenReference[]): string[] => {
    return [...new Set(tokens.map(t => t.path))];
  };

  return (
    <div className="space-y-6">
      {/* 使用的组件 */}
      <div>
        <h4 className="text-sm font-medium mb-3">使用的组件 ({composition.usedComponents.length})</h4>
        {composition.usedComponents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {composition.usedComponents.map(componentName => (
              <button
                key={componentName}
                onClick={() => onNavigateToComponent?.(componentName)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  'bg-primary/10 text-primary hover:bg-primary/20',
                  onNavigateToComponent && 'cursor-pointer',
                  !onNavigateToComponent && 'cursor-default'
                )}
                title={onNavigateToComponent ? `点击查看 ${componentName} 组件文档` : componentName}
              >
                {componentName}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">未检测到组件</p>
        )}
      </div>

      {/* 使用的 Tokens */}
      <div>
        <h4 className="text-sm font-medium mb-3">使用的 Tokens ({composition.usedTokens.length})</h4>
        {Object.keys(tokensByCategory).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(tokensByCategory).map(([category, tokens]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <TokenCategoryBadge category={category} />
                  <span className="text-xs text-muted-foreground">
                    ({getUniqueTokenPaths(tokens).length} 个)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {getUniqueTokenPaths(tokens).slice(0, 10).map(path => (
                    <code
                      key={path}
                      className="text-xs px-1.5 py-0.5 bg-muted rounded font-mono"
                    >
                      {path}
                    </code>
                  ))}
                  {getUniqueTokenPaths(tokens).length > 10 && (
                    <span className="text-xs text-muted-foreground px-1.5 py-0.5">
                      +{getUniqueTokenPaths(tokens).length - 10} 更多
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">未检测到 Token 使用</p>
        )}
      </div>

      {/* 布局层级 */}
      <div>
        <h4 className="text-sm font-medium mb-3">布局层级</h4>
        <div className="p-3 bg-muted/30 rounded-lg">
          <code className="text-sm font-mono text-muted-foreground">
            {composition.layoutHierarchy || '无'}
          </code>
        </div>
      </div>

      {/* 组成说明 */}
      <div>
        <h4 className="text-sm font-medium mb-3">组成说明</h4>
        <p className="text-sm text-muted-foreground">
          {composition.compositionNotes || '无'}
        </p>
      </div>
    </div>
  );
}

/**
 * 案例文档组件
 */
export function ExampleDoc({
  example,
  previewSize = 'desktop',
  onPreviewSizeChange,
  onOpenInEditor,
  onNavigateToComponent,
}: ExampleDocProps) {
  const [copyState, setCopyState] = React.useState<CopyState | null>(null);

  const schemaCode = React.useMemo(() => {
    return JSON.stringify(example.schema, null, 2);
  }, [example.schema]);

  // 分析案例组成
  const composition = React.useMemo(() => {
    return analyzeExampleComposition(example.schema, example.id);
  }, [example.schema, example.id]);

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
      onOpenInEditor(example.schema);
    }
  };

  // 获取支持的屏幕尺寸徽章
  const supportedSizes = ['desktop', 'tablet', 'mobile'];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{example.title}</h1>
                {example.source === 'custom' && (
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    自定义
                  </span>
                )}
              </div>
              {example.description && (
                <p className="text-muted-foreground mt-1">{example.description}</p>
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

          {/* Category and Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              {getCategoryLabel(example.category)}
            </span>
            {example.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-muted rounded"
              >
                {tag}
              </span>
            ))}
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
        </div>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ExamplePreview
              example={example}
              previewSize={previewSize}
            />
          </CardContent>
        </Card>

        {/* Composition Analysis Section - Requirements 6.3, 6.5 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Composition Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              分析此案例使用的组件和 Design Tokens
            </p>
          </CardHeader>
          <CardContent>
            <CompositionAnalysisSection 
              composition={composition} 
              onNavigateToComponent={onNavigateToComponent}
            />
          </CardContent>
        </Card>

        {/* Code Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">JSON Schema</CardTitle>
            {onOpenInEditor && (
              <Button variant="outline" size="sm" onClick={handleOpenInEditor}>
                在编辑器中打开
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={schemaCode}
              copyState={copyState}
              onCopy={handleCopy}
            />
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="text-sm">选择一个案例查看详情</p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ExamplesModule - 案例展示模块
 * 
 * 功能：
 * - 案例分类侧边栏
 * - 案例文档展示（标题、描述、分类标签）
 * - 实时预览
 * - JSON Schema 代码块（语法高亮、复制）
 * - 在编辑器中打开功能
 * - 屏幕尺寸切换预览
 * - 支持系统预设案例和用户自定义案例
 * - 组成分析（显示使用的组件和 Tokens）
 * - 点击组件导航到组件文档
 * 
 * @see Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.3, 6.5
 */
export function ExamplesModule({
  activeExampleId = null,
  onExampleSelect,
  previewSize = 'desktop',
  onPreviewSizeChange,
  onOpenInEditor,
  onNavigateToComponent,
  examples,
  className,
}: ExamplesModuleProps) {
  // 获取所有案例数据（优先使用传入的 examples，否则使用默认数据）
  const allExamples = React.useMemo(() => {
    if (examples && examples.length > 0) {
      return examples;
    }
    return getAllExamplesData();
  }, [examples]);
  
  // 按分类分组
  const examplesByCategory = React.useMemo(
    () => groupExamplesByCategory(allExamples),
    [allExamples]
  );

  // 获取当前选中的案例
  const activeExample = React.useMemo(() => {
    if (!activeExampleId) return null;
    return allExamples.find(e => e.id === activeExampleId) || null;
  }, [activeExampleId, allExamples]);

  // 处理案例选择
  const handleExampleSelect = React.useCallback((exampleId: string) => {
    onExampleSelect?.(exampleId);
  }, [onExampleSelect]);

  return (
    <div className={cn('flex h-full', className)}>
      {/* Sidebar */}
      <CategorySidebar
        examplesByCategory={examplesByCategory}
        activeExampleId={activeExampleId}
        onExampleSelect={handleExampleSelect}
      />

      {/* Content */}
      {activeExample ? (
        <div className="flex-1 overflow-hidden">
          <ExampleDoc
            example={activeExample}
            previewSize={previewSize}
            onPreviewSizeChange={onPreviewSizeChange}
            onOpenInEditor={onOpenInEditor}
            onNavigateToComponent={onNavigateToComponent}
          />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

export default ExamplesModule;
