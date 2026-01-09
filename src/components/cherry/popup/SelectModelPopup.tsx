/**
 * @file SelectModelPopup 组件
 * @description 模型选择弹窗
 * @module components/cherry/popup/SelectModelPopup
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check } from 'lucide-react';
import { ModelAvatar } from '../avatar';
import { VisionTag, ReasoningTag, WebSearchTag, ToolsCallingTag, FreeTag } from '../tags';

export interface ModelOption {
  id: string;
  name: string;
  provider?: string;
  capabilities?: ('vision' | 'reasoning' | 'web-search' | 'tools')[];
  isFree?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  models: ModelOption[];
}

export interface SelectModelPopupProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** 提供商列表 */
  providers: Provider[];
  /** 当前选中的模型 ID */
  value?: string;
  /** 选择回调 */
  onSelect?: (modelId: string) => void;
  /** 标题 */
  title?: string;
}

export function SelectModelPopup({
  open,
  onOpenChange,
  providers,
  value,
  onSelect,
  title = '选择模型',
}: SelectModelPopupProps) {
  const handleSelect = (modelId: string) => {
    onSelect?.(modelId);
    onOpenChange(false);
  };

  const renderCapabilityTags = (model: ModelOption) => {
    const tags: React.ReactNode[] = [];
    
    if (model.isFree) {
      tags.push(<FreeTag key="free" size="sm" />);
    }
    
    model.capabilities?.forEach((cap) => {
      switch (cap) {
        case 'vision':
          tags.push(<VisionTag key="vision" size="sm" />);
          break;
        case 'reasoning':
          tags.push(<ReasoningTag key="reasoning" size="sm" />);
          break;
        case 'web-search':
          tags.push(<WebSearchTag key="web-search" size="sm" />);
          break;
        case 'tools':
          tags.push(<ToolsCallingTag key="tools" size="sm" />);
          break;
      }
    });

    return tags;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border-0">
          <div className="px-3 pb-2">
            <CommandInput placeholder="搜索模型..." />
          </div>
          <CommandList className="max-h-[400px] px-2 pb-2">
            <CommandEmpty>未找到模型</CommandEmpty>
            {providers.map((provider) => (
              <CommandGroup key={provider.id} heading={provider.name}>
                {provider.models.map((model) => (
                  <CommandItem
                    key={model.id}
                    value={`${model.name} ${model.provider || provider.name}`}
                    onSelect={() => handleSelect(model.id)}
                    className="flex items-center gap-2 cursor-pointer py-2"
                  >
                    <ModelAvatar
                      model={{ ...model, provider: model.provider || provider.name }}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{model.name}</span>
                        {value === model.id && (
                          <Check className="h-4 w-4 text-[var(--cherry-primary)] shrink-0" />
                        )}
                      </div>
                      {(model.capabilities?.length || model.isFree) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {renderCapabilityTags(model)}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

SelectModelPopup.displayName = 'SelectModelPopup';
