/**
 * LLMSettingsDialog Component
 * 
 * A modal dialog for configuring LLM provider settings.
 * Supports multiple providers (OpenAI, Anthropic, iFlow, Custom)
 * with provider-specific defaults and model selection.
 * 
 * Implements Requirements:
 * - 1.1: Visual settings interface for LLM parameters
 * - 1.2: Provider selection dropdown
 * - 1.4: API key input with secure storage
 * - 1.5: Model, temperature, max tokens configuration
 * - 1.6: Custom endpoint input
 * - 1.7: Configuration validation
 * - 1.8: Test connection functionality
 * - 1.9: Configuration persistence
 * - 1.10: Validation error display
 * 
 * @module components/settings/LLMSettingsDialog
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { LLMConfig, LLMProvider, ConfigValidationError, ModelInfo } from '@/lib';
import {
  DEFAULT_CONFIGS,
  PROVIDER_PRESETS,
  getProviderPreset,
  DEFAULT_SYSTEM_PROMPT,
  validateLLMConfigDetailed as validateLLMConfig,
  getAllModels,
} from '@/lib';
import { ModelManagementDialog } from './ModelManagementDialog';
import { Settings2 } from 'lucide-react';


// ============================================================================
// Types
// ============================================================================

export interface LLMSettingsDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Current LLM configuration */
  currentConfig?: LLMConfig;
  /** Callback when configuration is saved */
  onSave: (config: LLMConfig) => void;
  /** Callback to test connection */
  onTestConnection?: (config: LLMConfig) => Promise<{ success: boolean; error?: string }>;
}

interface FormState {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  endpoint: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  timeout: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates initial form state from config or defaults
 */
function createInitialState(config?: LLMConfig): FormState {
  if (config) {
    return {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      endpoint: config.endpoint || '',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 4096,
      systemPrompt: config.systemPrompt || '',
      timeout: config.timeout ?? 60000,
    };
  }

  const defaultConfig = DEFAULT_CONFIGS.openai;
  return {
    provider: 'openai',
    apiKey: '',
    model: defaultConfig.model || 'gpt-4',
    endpoint: defaultConfig.endpoint || '',
    temperature: defaultConfig.temperature ?? 0.7,
    maxTokens: defaultConfig.maxTokens ?? 4096,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    timeout: defaultConfig.timeout ?? 60000,
  };
}

/**
 * Converts form state to LLMConfig
 */
function formStateToConfig(state: FormState): LLMConfig {
  return {
    provider: state.provider,
    apiKey: state.apiKey,
    model: state.model,
    endpoint: state.endpoint || undefined,
    temperature: state.temperature,
    maxTokens: state.maxTokens,
    systemPrompt: state.systemPrompt || undefined,
    timeout: state.timeout,
  };
}

// ============================================================================
// Main Component
// ============================================================================

export function LLMSettingsDialog({
  open,
  onClose,
  currentConfig,
  onSave,
  onTestConnection,
}: LLMSettingsDialogProps) {
  // Form state
  const [formState, setFormState] = React.useState<FormState>(() =>
    createInitialState(currentConfig)
  );

  // Validation errors
  const [errors, setErrors] = React.useState<ConfigValidationError[]>([]);

  // Test connection state
  const [testStatus, setTestStatus] = React.useState<{
    testing: boolean;
    success?: boolean;
    error?: string;
  }>({ testing: false });

  // Model management dialog state
  const [modelManagementOpen, setModelManagementOpen] = React.useState(false);

  // Available models for current provider (preset + custom)
  const [availableModels, setAvailableModels] = React.useState<ModelInfo[]>([]);

  // Reset form when dialog opens with new config
  React.useEffect(() => {
    if (open) {
      setFormState(createInitialState(currentConfig));
      setErrors([]);
      setTestStatus({ testing: false });
    }
  }, [open, currentConfig]);

  // Update available models when provider changes or models are updated
  const refreshAvailableModels = React.useCallback(() => {
    const models = getAllModels(formState.provider);
    setAvailableModels(models);
  }, [formState.provider]);

  React.useEffect(() => {
    refreshAvailableModels();
  }, [refreshAvailableModels]);

  // Handle models change from ModelManagementDialog
  const handleModelsChange = React.useCallback(() => {
    refreshAvailableModels();
  }, [refreshAvailableModels]);

  /**
   * Handles provider change
   */
  const handleProviderChange = React.useCallback((provider: LLMProvider) => {
    const preset = getProviderPreset(provider);
    const defaults = DEFAULT_CONFIGS[provider];

    setFormState((prev) => ({
      ...prev,
      provider,
      endpoint: preset?.endpoint || defaults?.endpoint || '',
      model: preset?.defaultModel || defaults?.model || '',
    }));
    setErrors([]);
  }, []);

  /**
   * Handles form field change
   */
  const handleFieldChange = React.useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field
      setErrors((prev) => prev.filter((e) => e.field !== field));
    },
    []
  );

  /**
   * Gets error message for a field
   */
  const getFieldError = React.useCallback(
    (field: string): string | undefined => {
      return errors.find((e) => e.field === field)?.message;
    },
    [errors]
  );

  /**
   * Handles test connection
   */
  const handleTestConnection = React.useCallback(async () => {
    if (!onTestConnection) return;

    const config = formStateToConfig(formState);
    const validation = validateLLMConfig(config);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setTestStatus({ testing: true });

    try {
      const result = await onTestConnection(config);
      setTestStatus({
        testing: false,
        success: result.success,
        error: result.error,
      });
    } catch (error) {
      setTestStatus({
        testing: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [formState, onTestConnection]);

  /**
   * Handles save
   */
  const handleSave = React.useCallback(() => {
    const config = formStateToConfig(formState);
    const validation = validateLLMConfig(config);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSave(config);
    onClose();
  }, [formState, onSave, onClose]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>LLM 设置</DialogTitle>
          <DialogDescription>
            配置 LLM 提供商和参数，用于 AI 对话生成 UI。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Provider Selection */}
          <div className="grid gap-2">
            <Label htmlFor="provider">提供商</Label>
            <Select
              value={formState.provider}
              onValueChange={(value) => handleProviderChange(value as LLMProvider)}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="选择提供商" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_PRESETS.map((preset) => (
                  <SelectItem key={preset.provider} value={preset.provider}>
                    <div className="flex flex-col">
                      <span>{preset.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {preset.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('provider') && (
              <p className="text-sm text-destructive">{getFieldError('provider')}</p>
            )}
          </div>

          {/* API Key */}
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API 密钥</Label>
            <Input
              id="apiKey"
              type="password"
              value={formState.apiKey}
              onChange={(e) => handleFieldChange('apiKey', e.target.value)}
              placeholder="输入 API 密钥"
              className={cn(getFieldError('apiKey') && 'border-destructive')}
            />
            {getFieldError('apiKey') && (
              <p className="text-sm text-destructive">{getFieldError('apiKey')}</p>
            )}
          </div>

          {/* Model Selection */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="model">模型</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setModelManagementOpen(true)}
              >
                <Settings2 className="h-3 w-3 mr-1" />
                管理模型
              </Button>
            </div>
            {availableModels.length > 0 ? (
              <Select
                value={formState.model}
                onValueChange={(value) => handleFieldChange('model', value)}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.customModelId || model.name} value={model.name}>
                      <div className="flex items-center gap-2">
                        <span>{model.displayName}</span>
                        {model.isPreset ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            预设
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            自定义
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="model"
                value={formState.model}
                onChange={(e) => handleFieldChange('model', e.target.value)}
                placeholder="输入模型名称"
                className={cn(getFieldError('model') && 'border-destructive')}
              />
            )}
            {getFieldError('model') && (
              <p className="text-sm text-destructive">{getFieldError('model')}</p>
            )}
          </div>

          {/* Custom Endpoint (for custom provider or override) */}
          <div className="grid gap-2">
            <Label htmlFor="endpoint">
              API 端点
              {formState.provider !== 'custom' && (
                <span className="text-xs text-muted-foreground ml-2">
                  (可选，留空使用默认)
                </span>
              )}
            </Label>
            <Input
              id="endpoint"
              value={formState.endpoint}
              onChange={(e) => handleFieldChange('endpoint', e.target.value)}
              placeholder={
                formState.provider === 'custom'
                  ? '输入自定义 API 端点'
                  : getProviderPreset(formState.provider)?.endpoint || ''
              }
              className={cn(getFieldError('endpoint') && 'border-destructive')}
            />
            {getFieldError('endpoint') && (
              <p className="text-sm text-destructive">{getFieldError('endpoint')}</p>
            )}
          </div>

          {/* Temperature */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">温度 (Temperature)</Label>
              <span className="text-sm text-muted-foreground">
                {formState.temperature.toFixed(2)}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.01}
              value={[formState.temperature]}
              onValueChange={([value]) => handleFieldChange('temperature', value)}
            />
            <p className="text-xs text-muted-foreground">
              较低的值使输出更确定，较高的值使输出更随机
            </p>
            {getFieldError('temperature') && (
              <p className="text-sm text-destructive">{getFieldError('temperature')}</p>
            )}
          </div>

          {/* Max Tokens */}
          <div className="grid gap-2">
            <Label htmlFor="maxTokens">最大 Token 数</Label>
            <Input
              id="maxTokens"
              type="number"
              min={1}
              max={128000}
              value={formState.maxTokens}
              onChange={(e) =>
                handleFieldChange('maxTokens', parseInt(e.target.value, 10) || 4096)
              }
              className={cn(getFieldError('maxTokens') && 'border-destructive')}
            />
            {getFieldError('maxTokens') && (
              <p className="text-sm text-destructive">{getFieldError('maxTokens')}</p>
            )}
          </div>

          {/* System Prompt */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="systemPrompt">系统提示词</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleFieldChange('systemPrompt', DEFAULT_SYSTEM_PROMPT)}
              >
                重置为默认
              </Button>
            </div>
            <Textarea
              id="systemPrompt"
              value={formState.systemPrompt}
              onChange={(e) => handleFieldChange('systemPrompt', e.target.value)}
              placeholder="输入系统提示词..."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              系统提示词用于指导 AI 生成符合规范的 UI Schema
            </p>
          </div>

          {/* Test Connection Status */}
          {testStatus.success !== undefined && (
            <div
              className={cn(
                'p-3 rounded-md text-sm',
                testStatus.success
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              )}
            >
              {testStatus.success
                ? '✓ 连接成功'
                : `✗ 连接失败: ${testStatus.error || '未知错误'}`}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {onTestConnection && (
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testStatus.testing}
            >
              {testStatus.testing ? '测试中...' : '测试连接'}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="button" onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Model Management Dialog */}
      <ModelManagementDialog
        open={modelManagementOpen}
        onClose={() => setModelManagementOpen(false)}
        onModelsChange={handleModelsChange}
      />
    </Dialog>
  );
}

export default LLMSettingsDialog;
