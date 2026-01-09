/**
 * @file SearchPopup 组件
 * @description 全屏搜索界面
 * @module components/cherry/popup/SearchPopup
 */

import * as React from 'react';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
}

export interface SearchPopupProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** 搜索结果 */
  results?: SearchResult[];
  /** 搜索回调 */
  onSearch?: (query: string) => void;
  /** 选择结果回调 */
  onSelect?: (result: SearchResult) => void;
  /** 占位文本 */
  placeholder?: string;
  /** 是否正在加载 */
  isLoading?: boolean;
}

export function SearchPopup({
  open,
  onOpenChange,
  results = [],
  onSearch,
  onSelect,
  placeholder = '搜索...',
  isLoading = false,
}: SearchPopupProps) {
  const [query, setQuery] = React.useState('');

  // 按分类分组结果
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((result) => {
      const category = result.category || '结果';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(result);
    });
    return groups;
  }, [results]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result);
    onOpenChange(false);
    setQuery('');
  };

  // 键盘快捷键
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <Command className="rounded-lg border-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={handleSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="p-1 hover:bg-[var(--cherry-hover)] rounded"
              >
                <X className="h-4 w-4 opacity-50" />
              </button>
            )}
          </div>
          <CommandList className="max-h-[400px]">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-[var(--cherry-text-2)]">
                搜索中...
              </div>
            ) : results.length === 0 ? (
              <CommandEmpty>未找到结果</CommandEmpty>
            ) : (
              Object.entries(groupedResults).map(([category, items]) => (
                <CommandGroup key={category} heading={category}>
                  {items.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {result.icon}
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{result.title}</div>
                        {result.description && (
                          <div className="text-xs text-[var(--cherry-text-2)] truncate">
                            {result.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

SearchPopup.displayName = 'SearchPopup';
