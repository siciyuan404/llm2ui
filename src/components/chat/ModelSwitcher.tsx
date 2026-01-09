/**
 * ModelSwitcher Component
 * 
 * A dropdown component for quickly switching between saved LLM configurations.
 * Displays the current provider and model name, and provides access to settings.
 * 
 * Implements Requirements:
 * - 3.9: LLM model quick switch dropdown
 * - 3.10: Immediate model switching for subsequent messages
 * - 3.11: Display current provider and model name
 * 
 * @module components/chat/ModelSwitcher
 */

import * as React from 'react';
import { Settings, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LLMConfig, SavedLLMConfig } from '@/lib';
import { getProviderPreset } from '@/lib';

// ============================================================================
// Types
// ============================================================================

export interface ModelSwitcherProps {
  /** Current active LLM configuration */
  currentConfig?: LLMConfig | SavedLLMConfig;
  /** List of saved configurations available for switching */
  savedConfigs: SavedLLMConfig[];
  /** Callback when a configuration is selected */
  onConfigChange: (config: SavedLLMConfig) => void;
  /** Callback to open settings dialog */
  onOpenSettings?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the switcher is disabled */
  disabled?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets display label for a configuration
 */
function getConfigDisplayLabel(config: LLMConfig | SavedLLMConfig): string {
  if ('displayName' in config && config.displayName) {
    return config.displayName;
  }
  
  const preset = getProviderPreset(config.provider);
  const providerName = preset?.displayName || config.provider;
  return `${providerName} - ${config.model}`;
}

/**
 * Gets short display label for trigger (provider + model)
 */
function getShortDisplayLabel(config: LLMConfig | SavedLLMConfig): string {
  const preset = getProviderPreset(config.provider);
  const providerName = preset?.displayName || config.provider;
  return `${providerName} / ${config.model}`;
}

/**
 * Checks if a config is a SavedLLMConfig with an ID
 */
function isSavedConfig(config: LLMConfig | SavedLLMConfig): config is SavedLLMConfig {
  return 'id' in config && typeof config.id === 'string';
}

// ============================================================================
// Main Component
// ============================================================================

export function ModelSwitcher({
  currentConfig,
  savedConfigs,
  onConfigChange,
  onOpenSettings,
  className,
  disabled = false,
}: ModelSwitcherProps) {
  // Get current config ID for select value
  const currentConfigId = React.useMemo(() => {
    if (!currentConfig) return undefined;
    if (isSavedConfig(currentConfig)) {
      return currentConfig.id;
    }
    // Try to find matching saved config
    const matching = savedConfigs.find(
      (c) => c.provider === currentConfig.provider && c.model === currentConfig.model
    );
    return matching?.id;
  }, [currentConfig, savedConfigs]);

  /**
   * Handles config selection from dropdown
   */
  const handleValueChange = React.useCallback(
    (value: string) => {
      if (value === '__settings__') {
        onOpenSettings?.();
        return;
      }
      
      const selectedConfig = savedConfigs.find((c) => c.id === value);
      if (selectedConfig) {
        onConfigChange(selectedConfig);
      }
    },
    [savedConfigs, onConfigChange, onOpenSettings]
  );

  // If no configs available, show a button to open settings
  if (savedConfigs.length === 0 && !currentConfig) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenSettings}
        disabled={disabled}
        className={cn('gap-2', className)}
      >
        <Plus className="h-4 w-4" />
        配置 LLM
      </Button>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        value={currentConfigId}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="选择模型">
            {currentConfig && (
              <span className="truncate">
                {getShortDisplayLabel(currentConfig)}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {savedConfigs.map((config) => (
            <SelectItem key={config.id} value={config.id}>
              <div className="flex flex-col">
                <span className="font-medium">
                  {getConfigDisplayLabel(config)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getProviderPreset(config.provider)?.description || config.provider}
                </span>
              </div>
            </SelectItem>
          ))}
          
          {savedConfigs.length > 0 && onOpenSettings && (
            <>
              <SelectSeparator />
              <SelectItem value="__settings__">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>管理配置...</span>
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      {onOpenSettings && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          disabled={disabled}
          className="h-9 w-9"
          title="LLM 设置"
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default ModelSwitcher;
