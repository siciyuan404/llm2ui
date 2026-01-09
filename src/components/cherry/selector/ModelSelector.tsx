/**
 * @file ModelSelector 组件
 * @description 模型选择器，基于 Command 组件，支持分组、搜索、头像显示
 * @module components/cherry/selector/ModelSelector
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ModelAvatar } from '../avatar';

export interface ModelOption {
  id: string;
  name: string;
  provider?: string;
  capabilities?: ('vision' | 'reasoning' | 'web-search' | 'tools')[];
}

export interface Provider {
  id: string;
  name: string;
  models: ModelOption[];
}

export interface ModelSelectorProps {
  /** 提供商列表（包含模型） */
  providers: Provider[];
  /** 当前选中的模型 ID */
  value?: string;
  /** 选择变化回调 */
  onChange?: (modelId: string) => void;
  /** 是否按提供商分组显示 */
  grouped?: boolean;
  /** 是否显示模型头像 */
  showAvatar?: boolean;
  /** 是否显示提供商后缀 */
  showProviderSuffix?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 自定义类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

export function ModelSelector({
  providers,
  value,
  onChange,
  grouped = true,
  showAvatar = true,
  showProviderSuffix = false,
  placeholder = '选择模型...',
  className,
  disabled = false,
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);

  // 扁平化所有模型
  const allModels = React.useMemo(() => {
    return providers.flatMap((provider) =>
      provider.models.map((model) => ({
        ...model,
        provider: model.provider || provider.name,
      }))
    );
  }, [providers]);

  // 查找当前选中的模型
  const selectedModel = React.useMemo(() => {
    return allModels.find((model) => model.id === value);
  }, [allModels, value]);

  const handleSelect = (modelId: string) => {
    onChange?.(modelId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-[280px] justify-between',
            'bg-[var(--cherry-background)]',
            'border-[var(--cherry-border)]',
            'hover:bg-[var(--cherry-hover)]',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedModel && showAvatar && (
              <ModelAvatar model={selectedModel} size="sm" />
            )}
            <span className="truncate">
              {selectedModel ? (
                <>
                  {selectedModel.name}
                  {showProviderSuffix && selectedModel.provider && (
                    <span className="text-[var(--cherry-text-2)] ml-1">
                      ({selectedModel.provider})
                    </span>
                  )}
                </>
              ) : (
                placeholder
              )}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="搜索模型..." />
          <CommandList>
            <CommandEmpty>未找到模型</CommandEmpty>
            {grouped ? (
              // 分组显示
              providers.map((provider) => (
                <CommandGroup key={provider.id} heading={provider.name}>
                  {provider.models.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={`${model.name} ${model.provider || provider.name}`}
                      onSelect={() => handleSelect(model.id)}
                      className="flex items-center gap-2"
                    >
                      {showAvatar && (
                        <ModelAvatar
                          model={{ ...model, provider: model.provider || provider.name }}
                          size="sm"
                        />
                      )}
                      <span className="flex-1 truncate">{model.name}</span>
                      {value === model.id && (
                        <Check className="h-4 w-4 text-[var(--cherry-primary)]" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : (
              // 扁平显示
              <CommandGroup>
                {allModels.map((model) => (
                  <CommandItem
                    key={model.id}
                    value={`${model.name} ${model.provider}`}
                    onSelect={() => handleSelect(model.id)}
                    className="flex items-center gap-2"
                  >
                    {showAvatar && <ModelAvatar model={model} size="sm" />}
                    <span className="flex-1 truncate">
                      {model.name}
                      {showProviderSuffix && model.provider && (
                        <span className="text-[var(--cherry-text-2)] ml-1">
                          ({model.provider})
                        </span>
                      )}
                    </span>
                    {value === model.id && (
                      <Check className="h-4 w-4 text-[var(--cherry-primary)]" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

ModelSelector.displayName = 'ModelSelector';
