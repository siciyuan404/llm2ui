/**
 * @file ContextSettingsPanel.tsx
 * @description LLM 上下文设置面板
 * @module components/chat
 * @requirements 23.1, 23.2, 23.3, 23.4, 23.5, 23.6
 */

import * as React from 'react';
import { Settings, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ThemeSwitcher } from '@/components/showcase/ThemeSwitcher';
import { ComponentSelector } from './ComponentSelector';
import { ExampleSelector } from './ExampleSelector';
import { ColorPresetSelector } from './ColorPresetSelector';
import { TokenBudgetControl } from './TokenBudgetControl';
import {
  getThemeManager,
  createContextBuilder,
  type ContextSettings,
  type TokenEstimate,
  DEFAULT_CONTEXT_SETTINGS,
} from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface ContextSettingsPanelProps {
  /** 当前设置 */
  settings?: ContextSettings;
  /** 设置变更回调 */
  onSettingsChange?: (settings: ContextSettings) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ContextSettingsPanel - LLM 上下文设置面板
 * 
 * 功能：
 * - 主题选择
 * - 组件选择
 * - 案例选择
 * - 配色选择
 * - Token 预算显示
 * 
 * @requirements 23.1, 23.2, 23.3, 23.4, 23.5, 23.6
 */
export function ContextSettingsPanel({
  settings: externalSettings,
  onSettingsChange,
  disabled = false,
  className,
}: ContextSettingsPanelProps) {
  const themeManager = getThemeManager();
  const [open, setOpen] = React.useState(false);
  
  // 内部设置状态
  const [settings, setSettings] = React.useState<ContextSettings>(
    externalSettings ?? DEFAULT_CONTEXT_SETTINGS
  );

  // Token 估算
  const [tokenEstimate, setTokenEstimate] = React.useState<TokenEstimate>({
    componentDocs: 0,
    examples: 0,
    colorInfo: 0,
    base: 500,
    total: 500,
  });

  // 同步外部设置
  React.useEffect(() => {
    if (externalSettings) {
      setSettings(externalSettings);
    }
  }, [externalSettings]);

  // 更新 Token 估算
  React.useEffect(() => {
    const builder = createContextBuilder();
    const estimate = builder.estimate(settings);
    setTokenEstimate(estimate);
  }, [settings]);

  // 获取当前主题
  const currentTheme = React.useMemo(() => {
    return themeManager.getTheme(settings.themeId);
  }, [themeManager, settings.themeId]);

  // 更新设置
  const updateSettings = React.useCallback((updates: Partial<ContextSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  }, [settings, onSettingsChange]);

  // 处理主题变更
  const handleThemeChange = React.useCallback((themeId: string) => {
    updateSettings({ themeId });
  }, [updateSettings]);

  // 处理组件选择变更
  const handleComponentsChange = React.useCallback((
    mode: 'all' | 'selected' | 'preset',
    selectedIds?: string[],
    presetName?: string
  ) => {
    updateSettings({
      components: { mode, selectedIds, presetName },
    });
  }, [updateSettings]);

  // 处理案例选择变更
  const handleExamplesChange = React.useCallback((
    mode: 'auto' | 'selected' | 'none',
    selectedIds?: string[],
    maxCount?: number
  ) => {
    updateSettings({
      examples: { mode, selectedIds, maxCount },
    });
  }, [updateSettings]);

  // 处理配色选择变更
  const handleColorSchemeChange = React.useCallback((
    id: string,
    includeInPrompt: boolean
  ) => {
    updateSettings({
      colorScheme: { id, includeInPrompt },
    });
  }, [updateSettings]);

  // 处理 Token 预算变更
  const handleTokenBudgetChange = React.useCallback((
    max: number,
    autoOptimize: boolean
  ) => {
    updateSettings({
      tokenBudget: { max, autoOptimize },
    });
  }, [updateSettings]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={className}
          title="上下文设置"
        >
          <Sliders className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            LLM 上下文设置
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Token 预算控制 */}
          <TokenBudgetControl
            estimate={tokenEstimate}
            max={settings.tokenBudget.max}
            autoOptimize={settings.tokenBudget.autoOptimize}
            onChange={handleTokenBudgetChange}
          />

          {/* 主题选择 */}
          <div className="space-y-2">
            <Label>主题</Label>
            <ThemeSwitcher
              value={settings.themeId}
              onChange={handleThemeChange}
              className="w-full justify-between"
            />
          </div>

          {/* 详细设置 */}
          <Accordion type="multiple" defaultValue={['components']} className="w-full">
            {/* 组件选择 */}
            <AccordionItem value="components">
              <AccordionTrigger>组件选择</AccordionTrigger>
              <AccordionContent>
                <ComponentSelector
                  theme={currentTheme}
                  mode={settings.components.mode}
                  selectedIds={settings.components.selectedIds}
                  presetName={settings.components.presetName}
                  onChange={handleComponentsChange}
                />
              </AccordionContent>
            </AccordionItem>

            {/* 案例选择 */}
            <AccordionItem value="examples">
              <AccordionTrigger>案例选择</AccordionTrigger>
              <AccordionContent>
                <ExampleSelector
                  theme={currentTheme}
                  mode={settings.examples.mode}
                  selectedIds={settings.examples.selectedIds}
                  maxCount={settings.examples.maxCount}
                  onChange={handleExamplesChange}
                />
              </AccordionContent>
            </AccordionItem>

            {/* 配色选择 */}
            <AccordionItem value="colors">
              <AccordionTrigger>配色方案</AccordionTrigger>
              <AccordionContent>
                <ColorPresetSelector
                  theme={currentTheme}
                  selectedId={settings.colorScheme.id}
                  includeInPrompt={settings.colorScheme.includeInPrompt}
                  onChange={handleColorSchemeChange}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ContextSettingsPanel;
