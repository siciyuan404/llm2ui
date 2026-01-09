/**
 * @file ChatCustomization.tsx
 * @description Chat 界面定制面板 - 配色方案、布局、主题选择
 * @module components/chat
 * @requirements 20.1, 20.2, 20.3, 20.4
 */

import * as React from 'react';
import { Settings2, Palette, Layout, Paintbrush } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorSchemeSelector } from './ColorSchemeSelector';
import { LayoutSelector } from './LayoutSelector';
import { ThemeSwitcher } from '@/components/showcase/ThemeSwitcher';
import {
  getThemeManager,
  type ColorScheme,
  type LayoutConfig,
} from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface ChatCustomizationProps {
  /** 当前主题 ID */
  themeId?: string;
  /** 当前配色方案 ID */
  colorSchemeId?: string;
  /** 当前布局 ID */
  layoutId?: string;
  /** 主题变更回调 */
  onThemeChange?: (themeId: string) => void;
  /** 配色方案变更回调 */
  onColorSchemeChange?: (schemeId: string) => void;
  /** 布局变更回调 */
  onLayoutChange?: (layoutId: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ChatCustomization - Chat 界面定制面板
 * 
 * 功能：
 * - 配色方案选择
 * - 布局类型选择
 * - 主题选择
 * 
 * @requirements 20.1, 20.2, 20.3, 20.4
 */
export function ChatCustomization({
  themeId,
  colorSchemeId,
  layoutId,
  onThemeChange,
  onColorSchemeChange,
  onLayoutChange,
  disabled = false,
  className,
}: ChatCustomizationProps) {
  const themeManager = getThemeManager();
  const [open, setOpen] = React.useState(false);

  // 获取当前主题
  const currentTheme = React.useMemo(() => {
    const id = themeId ?? themeManager.getActiveTheme()?.id ?? 'shadcn-ui';
    return themeManager.getTheme(id);
  }, [themeId, themeManager]);

  // 获取可用的配色方案和布局
  const colorSchemes = currentTheme?.colorSchemes ?? [];
  const layouts = currentTheme?.layouts ?? [];

  // 当前选中的配色方案和布局
  const [selectedColorScheme, setSelectedColorScheme] = React.useState(
    colorSchemeId ?? colorSchemes[0]?.id ?? 'light'
  );
  const [selectedLayout, setSelectedLayout] = React.useState(
    layoutId ?? layouts[0]?.id ?? 'default'
  );

  // 同步外部值
  React.useEffect(() => {
    if (colorSchemeId && colorSchemeId !== selectedColorScheme) {
      setSelectedColorScheme(colorSchemeId);
    }
  }, [colorSchemeId, selectedColorScheme]);

  React.useEffect(() => {
    if (layoutId && layoutId !== selectedLayout) {
      setSelectedLayout(layoutId);
    }
  }, [layoutId, selectedLayout]);

  // 处理配色方案变更
  const handleColorSchemeChange = (schemeId: string) => {
    setSelectedColorScheme(schemeId);
    onColorSchemeChange?.(schemeId);
  };

  // 处理布局变更
  const handleLayoutChange = (layoutId: string) => {
    setSelectedLayout(layoutId);
    onLayoutChange?.(layoutId);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={className}
          title="界面定制"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[360px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            界面定制
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 主题选择 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              主题
            </Label>
            <ThemeSwitcher
              value={themeId}
              onChange={onThemeChange}
              showDescription
              className="w-full justify-between"
            />
          </div>

          {/* 标签页：配色和布局 */}
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="colors" className="gap-2">
                <Palette className="h-4 w-4" />
                配色
              </TabsTrigger>
              <TabsTrigger value="layout" className="gap-2">
                <Layout className="h-4 w-4" />
                布局
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="mt-4">
              <ColorSchemeSelector
                schemes={colorSchemes}
                value={selectedColorScheme}
                onChange={handleColorSchemeChange}
              />
            </TabsContent>

            <TabsContent value="layout" className="mt-4">
              <LayoutSelector
                layouts={layouts}
                value={selectedLayout}
                onChange={handleLayoutChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ChatCustomization;
