/**
 * @file TokensModule.tsx
 * @description 全局样式展示模块，展示 Design Tokens（Icons、Typography、Colors、Spacing、Shadows、Border Radius）
 *              增强功能：显示每个 Token 的 "Used In" 部分，展示使用该 Token 的组件
 * @module components/showcase/TokensModule
 * @requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 6.1, 6.4
 */

import * as React from 'react';
import { cn, copyToClipboard } from '@/lib/utils';
import {
  Palette,
  Type,
  Ruler,
  CircleDot,
  Square,
} from 'lucide-react';
import {
  getDefaultDesignTokens,
} from '@/lib';
import type {
  DesignTokens,
  ColorTokens,
  ColorScale,
  SpacingTokens,
  TypographyTokens,
  ShadowTokens,
  RadiusTokens,
} from '@/lib';
import {
  defaultIconRegistry,
  initializeDefaultIcons,
} from '@/lib';
import type {
  IconDefinition,
  IconCategory,
} from '@/lib';
import {
  defaultTokenUsageRegistry,
} from '@/lib';
import type {
  TokenUsage,
  TokenCategory as TokenUsageCategory,
} from '@/lib';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from './SearchInput';

// ============================================================================
// Types
// ============================================================================

/**
 * Token 类别类型
 */
export type TokenCategory = 'icons' | 'typography' | 'colors' | 'spacing' | 'shadows' | 'radius';

/**
 * TokensModule Props
 */
export interface TokensModuleProps {
  /** 当前选中的 Token 类别 */
  activeCategory?: TokenCategory;
  /** 类别变化回调 */
  onCategoryChange?: (category: TokenCategory) => void;
  /** 自定义 Design Tokens（可选，默认使用系统默认值） */
  tokens?: DesignTokens;
  /** 自定义类名 */
  className?: string;
  /** 点击 Token 时高亮相关组件的回调 */
  onTokenClick?: (tokenPath: string, applicableComponents: string[]) => void;
  /** 导航到组件文档的回调 */
  onNavigateToComponent?: (componentName: string) => void;
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
 * Token 类别配置
 */
const TOKEN_CATEGORIES: { id: TokenCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'icons', label: 'Icons', icon: <Palette className="w-4 h-4" /> },
  { id: 'typography', label: 'Typography', icon: <Type className="w-4 h-4" /> },
  { id: 'colors', label: 'Colors', icon: <Palette className="w-4 h-4" /> },
  { id: 'spacing', label: 'Spacing', icon: <Ruler className="w-4 h-4" /> },
  { id: 'shadows', label: 'Shadows', icon: <CircleDot className="w-4 h-4" /> },
  { id: 'radius', label: 'Border Radius', icon: <Square className="w-4 h-4" /> },
];

/**
 * 图标预览尺寸
 */
const ICON_SIZES = [16, 24, 32] as const;

/**
 * 颜色语义分组标签
 */
const COLOR_GROUP_LABELS: Record<keyof ColorTokens, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  neutral: 'Neutral',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 将 hex 颜色转换为 RGB
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgb(${r}, ${g}, ${b})`;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * 复制按钮组件
 */
function CopyButton({
  value,
  label,
  copyState,
  onCopy,
}: {
  value: string;
  label?: string;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
}) {
  const isCopied = copyState?.key === value && copyState?.copied;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-xs"
      onClick={() => onCopy(value, value)}
      title={`复制 ${label || value}`}
    >
      {isCopied ? '✓ 已复制' : '复制'}
    </Button>
  );
}

/**
 * Token 值展示组件（带 Tooltip 和复制功能）
 */
function TokenValue({
  tokenName,
  value,
  usageExample,
  copyState,
  onCopy,
  children,
}: {
  tokenName: string;
  value: string;
  usageExample: string;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
  children: React.ReactNode;
}) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const isCopied = copyState?.key === tokenName && copyState?.copied;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        className="w-full text-left cursor-pointer hover:bg-muted/50 rounded transition-colors"
        onClick={() => onCopy(tokenName, value)}
        title="点击复制"
      >
        {children}
        {isCopied && (
          <span className="absolute top-1 right-1 text-xs text-green-600 dark:text-green-400">
            ✓
          </span>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border whitespace-nowrap">
          <div className="font-mono text-muted-foreground">{usageExample}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Section Components
// ============================================================================

/**
 * Icons 展示区域
 */
function IconsSection({
  searchQuery,
  copyState,
  onCopy,
}: {
  searchQuery: string;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
}) {
  // Initialize icons on mount
  React.useEffect(() => {
    if (defaultIconRegistry.size === 0) {
      initializeDefaultIcons();
    }
  }, []);

  const icons = React.useMemo(() => {
    const allIcons = defaultIconRegistry.getAll();
    if (!searchQuery) return allIcons;
    return defaultIconRegistry.search(searchQuery);
  }, [searchQuery]);

  const categories = React.useMemo(() => {
    return defaultIconRegistry.getCategories();
  }, []);

  const iconsByCategory = React.useMemo(() => {
    const grouped: Record<IconCategory, IconDefinition[]> = {} as Record<IconCategory, IconDefinition[]>;
    for (const category of categories) {
      grouped[category] = icons.filter(icon => icon.category === category);
    }
    return grouped;
  }, [icons, categories]);

  if (icons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery ? `没有找到匹配 "${searchQuery}" 的图标` : '暂无图标'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map(category => {
        const categoryIcons = iconsByCategory[category];
        if (categoryIcons.length === 0) return null;

        return (
          <div key={category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
              {category} ({categoryIcons.length})
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {categoryIcons.map(icon => (
                <TokenValue
                  key={icon.name}
                  tokenName={`icon-${icon.name}`}
                  value={icon.name}
                  usageExample={`<Icon name="${icon.name}" />`}
                  copyState={copyState}
                  onCopy={onCopy}
                >
                  <div className="flex flex-col items-center p-2 rounded-md border border-transparent hover:border-border">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {ICON_SIZES.map(size => (
                        <div
                          key={size}
                          className="flex items-center justify-center text-foreground"
                          style={{ width: size, height: size }}
                          dangerouslySetInnerHTML={{
                            __html: icon.svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`)
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                      {icon.name}
                    </span>
                  </div>
                </TokenValue>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Typography 展示区域
 */
function TypographySection({
  typography,
  copyState,
  onCopy,
}: {
  typography: TypographyTokens;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Font Family */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Font Family</h4>
        <div className="space-y-3">
          {Object.entries(typography.fontFamily).map(([name, value]) => (
            <TokenValue
              key={name}
              tokenName={`fontFamily-${name}`}
              value={value}
              usageExample={`font-family: var(--font-${name})`}
              copyState={copyState}
              onCopy={onCopy}
            >
              <div className="p-3 rounded-md border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{name}</span>
                  <CopyButton
                    value={value}
                    label={name}
                    copyState={copyState}
                    onCopy={onCopy}
                  />
                </div>
                <p className="text-lg" style={{ fontFamily: value }}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                  {value}
                </p>
              </div>
            </TokenValue>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Font Size</h4>
        <div className="space-y-2">
          {Object.entries(typography.fontSize).map(([name, value]) => (
            <TokenValue
              key={name}
              tokenName={`fontSize-${name}`}
              value={value}
              usageExample={`font-size: var(--text-${name})`}
              copyState={copyState}
              onCopy={onCopy}
            >
              <div className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono w-12">{name}</span>
                  <span style={{ fontSize: value }}>Aa</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{value}</span>
              </div>
            </TokenValue>
          ))}
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Font Weight</h4>
        <div className="space-y-2">
          {Object.entries(typography.fontWeight).map(([name, value]) => (
            <TokenValue
              key={name}
              tokenName={`fontWeight-${name}`}
              value={String(value)}
              usageExample={`font-weight: var(--font-${name})`}
              copyState={copyState}
              onCopy={onCopy}
            >
              <div className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono w-20">{name}</span>
                  <span style={{ fontWeight: value }}>The quick brown fox</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{value}</span>
              </div>
            </TokenValue>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Line Height</h4>
        <div className="space-y-2">
          {Object.entries(typography.lineHeight).map(([name, value]) => (
            <TokenValue
              key={name}
              tokenName={`lineHeight-${name}`}
              value={value}
              usageExample={`line-height: var(--leading-${name})`}
              copyState={copyState}
              onCopy={onCopy}
            >
              <div className="p-3 rounded-md border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-mono">{name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{value}</span>
                </div>
                <p className="text-sm bg-muted/30 p-2 rounded" style={{ lineHeight: value }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </TokenValue>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Colors 展示区域
 */
function ColorsSection({
  colors,
  copyState,
  onCopy,
}: {
  colors: ColorTokens;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
}) {
  const colorGroups = Object.entries(colors) as [keyof ColorTokens, ColorScale][];

  return (
    <div className="space-y-8">
      {colorGroups.map(([groupName, scale]) => (
        <div key={groupName}>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {COLOR_GROUP_LABELS[groupName]}
          </h4>
          <div className="grid grid-cols-11 gap-1">
            {Object.entries(scale).map(([shade, hex]) => (
              <TokenValue
                key={`${groupName}-${shade}`}
                tokenName={`color-${groupName}-${shade}`}
                value={hex}
                usageExample={`color: var(--${groupName}-${shade})`}
                copyState={copyState}
                onCopy={onCopy}
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-full aspect-square rounded-md border border-border/50 mb-1"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-xs text-muted-foreground">{shade}</span>
                  <span className="text-xs font-mono text-muted-foreground/70 hidden sm:block">
                    {hex}
                  </span>
                </div>
              </TokenValue>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            RGB: {hexToRgb(scale[500])}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Spacing 展示区域
 */
function SpacingSection({
  spacing,
  copyState,
  onCopy,
}: {
  spacing: SpacingTokens;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {Object.entries(spacing).map(([name, value]) => {
          const numericValue = parseInt(value, 10);
          return (
            <TokenValue
              key={name}
              tokenName={`spacing-${name}`}
              value={value}
              usageExample={`padding: var(--spacing-${name})`}
              copyState={copyState}
              onCopy={onCopy}
            >
              <div className="flex items-center gap-4 p-2 rounded-md border">
                <span className="text-sm font-mono w-12">{name}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className="h-4 bg-primary rounded"
                    style={{ width: `${numericValue}px` }}
                  />
                  <div className="flex-1 h-px bg-border" />
                </div>
                <span className="text-xs text-muted-foreground font-mono w-12 text-right">
                  {value}
                </span>
              </div>
            </TokenValue>
          );
        })}
      </div>

      {/* Visual Scale */}
      <div className="mt-6 p-4 rounded-md border bg-muted/30">
        <h5 className="text-sm font-medium mb-3">Visual Scale</h5>
        <div className="flex items-end gap-1 h-20">
          {Object.entries(spacing).map(([name, value]) => {
            const numericValue = parseInt(value, 10);
            return (
              <div
                key={name}
                className="flex flex-col items-center"
                title={`${name}: ${value}`}
              >
                <div
                  className="bg-primary rounded-t"
                  style={{ width: '24px', height: `${Math.min(numericValue, 64)}px` }}
                />
                <span className="text-xs text-muted-foreground mt-1">{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Shadows 展示区域
 */
function ShadowsSection({
  shadows,
  copyState,
  onCopy,
}: {
  shadows: ShadowTokens;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Object.entries(shadows).map(([name, value]) => (
        <TokenValue
          key={name}
          tokenName={`shadow-${name}`}
          value={value}
          usageExample={`box-shadow: var(--shadow-${name})`}
          copyState={copyState}
          onCopy={onCopy}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="h-24 rounded-lg bg-card flex items-center justify-center"
                style={{ boxShadow: value }}
              >
                <span className="text-muted-foreground text-sm">Shadow {name}</span>
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-3 break-all">
                {value}
              </p>
            </CardContent>
          </Card>
        </TokenValue>
      ))}
    </div>
  );
}

/**
 * Border Radius 展示区域
 */
function RadiusSection({
  radius,
  copyState,
  onCopy,
}: {
  radius: RadiusTokens;
  copyState: CopyState | null;
  onCopy: (key: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {Object.entries(radius).map(([name, value]) => (
        <TokenValue
          key={name}
          tokenName={`radius-${name}`}
          value={value}
          usageExample={`border-radius: var(--radius-${name})`}
          copyState={copyState}
          onCopy={onCopy}
        >
          <div className="flex flex-col items-center p-3 rounded-md border">
            <div
              className="w-16 h-16 bg-primary mb-2"
              style={{ borderRadius: value }}
            />
            <span className="text-sm font-mono">{name}</span>
            <span className="text-xs text-muted-foreground font-mono">{value}</span>
          </div>
        </TokenValue>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * TokensModule - 全局样式展示模块
 * 
 * 展示 Design Tokens 的各个类别：
 * - Icons: 图标网格，多尺寸预览，复制功能
 * - Typography: 字体样例，包含 font-family、font-size、font-weight、line-height
 * - Colors: 色板展示，按语义分组，显示 hex/rgb 值
 * - Spacing: 可视化间距刻度
 * - Shadows: 卡片阴影示例
 * - Border Radius: 圆角形状示例
 * 
 * 所有 Token 支持：
 * - Hover 显示使用示例代码 Tooltip
 * - 点击复制值到剪贴板
 */
export function TokensModule({
  activeCategory = 'icons',
  onCategoryChange,
  tokens,
  className,
}: TokensModuleProps) {
  const designTokens = tokens || getDefaultDesignTokens();
  const [copyState, setCopyState] = React.useState<CopyState | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Handle copy with visual feedback
  const handleCopy = React.useCallback(async (key: string, value: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopyState({ key, copied: true });
      setTimeout(() => setCopyState(null), 2000);
    }
  }, []);

  // Render active section
  const renderSection = () => {
    switch (activeCategory) {
      case 'icons':
        return (
          <IconsSection
            searchQuery={searchQuery}
            copyState={copyState}
            onCopy={handleCopy}
          />
        );
      case 'typography':
        return (
          <TypographySection
            typography={designTokens.typography}
            copyState={copyState}
            onCopy={handleCopy}
          />
        );
      case 'colors':
        return (
          <ColorsSection
            colors={designTokens.colors}
            copyState={copyState}
            onCopy={handleCopy}
          />
        );
      case 'spacing':
        return (
          <SpacingSection
            spacing={designTokens.spacing}
            copyState={copyState}
            onCopy={handleCopy}
          />
        );
      case 'shadows':
        return (
          <ShadowsSection
            shadows={designTokens.shadows}
            copyState={copyState}
            onCopy={handleCopy}
          />
        );
      case 'radius':
        return (
          <RadiusSection
            radius={designTokens.radius}
            copyState={copyState}
            onCopy={handleCopy}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* Sidebar */}
      <div className="w-48 border-r bg-muted/30 p-4 flex-shrink-0">
        <h3 className="text-sm font-semibold mb-4">Design Tokens</h3>
        <nav className="space-y-1">
          {TOKEN_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange?.(category.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {TOKEN_CATEGORIES.find(c => c.id === activeCategory)?.label}
          </h2>
          {activeCategory === 'icons' && (
            <div className="w-64">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="搜索图标..."
                debounceMs={200}
              />
            </div>
          )}
        </div>

        {/* Section Content */}
        {renderSection()}
      </div>
    </div>
  );
}

export default TokensModule;

