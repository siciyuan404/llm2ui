/**
 * @file ThemePreview.tsx
 * @description 主题预览组件 - 显示主题的颜色、组件示例
 * @module components/showcase
 * @requirements 13.1, 13.2, 13.3, 13.4
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ThemePack, ColorScheme, ThemeTokens } from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface ThemePreviewProps {
  /** 主题包 */
  theme: ThemePack;
  /** 当前选中的配色方案 ID */
  colorSchemeId?: string;
  /** 配色方案变更回调 */
  onColorSchemeChange?: (schemeId: string) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * 颜色预览块
 */
function ColorSwatch({
  name,
  color,
  textColor,
}: {
  name: string;
  color: string;
  textColor?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-md border shadow-sm flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{color}</p>
      </div>
    </div>
  );
}

/**
 * 颜色方案预览
 */
function ColorSchemePreview({
  scheme,
  isActive,
  onClick,
}: {
  scheme: ColorScheme;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border-2 transition-all text-left w-full',
        isActive ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-sm">{scheme.name}</span>
        <Badge variant="outline" className="text-xs">
          {scheme.type}
        </Badge>
      </div>
      <div className="flex gap-1">
        {Object.entries(scheme.colors).slice(0, 6).map(([key, value]) => (
          <div
            key={key}
            className="w-6 h-6 rounded-sm border"
            style={{ backgroundColor: value }}
            title={key}
          />
        ))}
      </div>
    </button>
  );
}

/**
 * 令牌预览
 */
function TokensPreview({ tokens }: { tokens: ThemeTokens }) {
  return (
    <div className="space-y-6">
      {/* 颜色令牌 */}
      <div>
        <h4 className="text-sm font-semibold mb-3">颜色</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(tokens.colors).slice(0, 8).map(([name, color]) => (
            color && (
              <ColorSwatch key={name} name={name} color={color} />
            )
          ))}
        </div>
      </div>

      {/* 间距令牌 */}
      <div>
        <h4 className="text-sm font-semibold mb-3">间距</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(tokens.spacing).map(([name, value]) => (
            <div key={name} className="text-center">
              <div
                className="bg-primary/20 border border-primary/30 rounded"
                style={{ width: value, height: value }}
              />
              <span className="text-xs text-muted-foreground mt-1 block">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 圆角令牌 */}
      <div>
        <h4 className="text-sm font-semibold mb-3">圆角</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(tokens.radius).map(([name, value]) => (
            <div key={name} className="text-center">
              <div
                className="w-12 h-12 bg-primary/20 border border-primary/30"
                style={{ borderRadius: value }}
              />
              <span className="text-xs text-muted-foreground mt-1 block">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 组件预览
 */
function ComponentsPreview() {
  return (
    <div className="space-y-6">
      {/* 按钮 */}
      <div>
        <h4 className="text-sm font-semibold mb-3">按钮</h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">默认</Button>
          <Button variant="secondary">次要</Button>
          <Button variant="outline">轮廓</Button>
          <Button variant="ghost">幽灵</Button>
          <Button variant="destructive">危险</Button>
        </div>
      </div>

      {/* 输入框 */}
      <div>
        <h4 className="text-sm font-semibold mb-3">输入框</h4>
        <div className="flex flex-col gap-2 max-w-xs">
          <Input placeholder="默认输入框" />
          <Input placeholder="禁用状态" disabled />
        </div>
      </div>

      {/* 徽章 */}
      <div>
        <h4 className="text-sm font-semibold mb-3">徽章</h4>
        <div className="flex flex-wrap gap-2">
          <Badge>默认</Badge>
          <Badge variant="secondary">次要</Badge>
          <Badge variant="outline">轮廓</Badge>
          <Badge variant="destructive">危险</Badge>
        </div>
      </div>

      {/* 卡片 */}
      <div>
        <h4 className="text-sm font-semibold mb-3">卡片</h4>
        <Card className="max-w-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">示例卡片</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              这是一个卡片组件的预览示例。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ThemePreview - 主题预览组件
 * 
 * 功能：
 * - 显示主题的配色方案
 * - 显示设计令牌
 * - 显示组件示例
 * 
 * @requirements 13.1, 13.2, 13.3, 13.4
 */
export function ThemePreview({
  theme,
  colorSchemeId,
  onColorSchemeChange,
  className,
}: ThemePreviewProps) {
  const [activeSchemeId, setActiveSchemeId] = React.useState(
    colorSchemeId ?? theme.colorSchemes[0]?.id ?? 'light'
  );

  // 同步外部 colorSchemeId
  React.useEffect(() => {
    if (colorSchemeId && colorSchemeId !== activeSchemeId) {
      setActiveSchemeId(colorSchemeId);
    }
  }, [colorSchemeId, activeSchemeId]);

  const handleSchemeChange = (schemeId: string) => {
    setActiveSchemeId(schemeId);
    onColorSchemeChange?.(schemeId);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* 主题信息 */}
      <div>
        <h3 className="text-lg font-semibold">{theme.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          {theme.author && <span>作者: {theme.author}</span>}
          <span>版本: {theme.version}</span>
        </div>
      </div>

      {/* 配色方案选择 */}
      {theme.colorSchemes.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">配色方案</h4>
          <div className="grid grid-cols-2 gap-2">
            {theme.colorSchemes.map((scheme) => (
              <ColorSchemePreview
                key={scheme.id}
                scheme={scheme}
                isActive={scheme.id === activeSchemeId}
                onClick={() => handleSchemeChange(scheme.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 详细预览标签页 */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tokens">设计令牌</TabsTrigger>
          <TabsTrigger value="components">组件示例</TabsTrigger>
        </TabsList>
        <TabsContent value="tokens" className="mt-4">
          <TokensPreview tokens={theme.tokens} />
        </TabsContent>
        <TabsContent value="components" className="mt-4">
          <ComponentsPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ThemePreview;
