/**
 * ModelManagementDialog Component
 * 
 * A modal dialog for managing custom LLM models.
 * Displays preset and custom models in grouped lists,
 * with add, edit, delete, and search functionality.
 * 
 * Implements Requirements:
 * - 5.1: Model management entry in LLM settings
 * - 5.2: Grouped display of preset and custom models
 * - 5.3: Edit/delete buttons for custom models
 * - 5.4: Preset label for preset models
 * - 5.5: Search/filter functionality
 * 
 * @module components/settings/ModelManagementDialog
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { LLMProvider, ModelInfo } from '@/lib';
import {
  PROVIDER_PRESETS,
  getAllModels,
  searchModels,
  addModel,
  updateModel,
  deleteModel,
  getCustomModelById,
  validateModel,
} from '@/lib';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';


// ============================================================================
// Types
// ============================================================================

export interface ModelManagementDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when models are changed (added/edited/deleted) */
  onModelsChange?: () => void;
}

interface ModelFormData {
  name: string;
  displayName: string;
  provider: LLMProvider;
  endpoint: string;
  description: string;
}

type ViewMode = 'list' | 'add' | 'edit';

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Model list item component
 */
function ModelListItem({
  model,
  onEdit,
  onDelete,
}: {
  model: ModelInfo;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{model.displayName}</span>
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
        <div className="text-xs text-muted-foreground mt-0.5">
          <span>{model.name}</span>
          {model.description && (
            <span className="ml-2">· {model.description}</span>
          )}
        </div>
      </div>
      {!model.isPreset && model.customModelId && (
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit?.(model.customModelId!)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete?.(model.customModelId!)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}


/**
 * Add/Edit model form component
 */
function ModelForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
}: {
  initialData?: ModelFormData;
  onSubmit: (data: ModelFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [formData, setFormData] = React.useState<ModelFormData>(
    initialData || {
      name: '',
      displayName: '',
      provider: 'openai',
      endpoint: '',
      description: '',
    }
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = '模型名称不能为空';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  const handleFieldChange = (field: keyof ModelFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="model-name">模型名称 *</Label>
        <Input
          id="model-name"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="例如: gpt-4-turbo-preview"
          className={cn(errors.name && 'border-destructive')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          用于 API 调用的模型标识符
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="display-name">显示名称</Label>
        <Input
          id="display-name"
          value={formData.displayName}
          onChange={(e) => handleFieldChange('displayName', e.target.value)}
          placeholder="例如: GPT-4 Turbo Preview"
        />
        <p className="text-xs text-muted-foreground">
          在界面中显示的名称，留空则使用模型名称
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="provider">提供商</Label>
        <Select
          value={formData.provider}
          onValueChange={(value) => handleFieldChange('provider', value as LLMProvider)}
        >
          <SelectTrigger id="provider">
            <SelectValue placeholder="选择提供商" />
          </SelectTrigger>
          <SelectContent>
            {PROVIDER_PRESETS.map((preset) => (
              <SelectItem key={preset.provider} value={preset.provider}>
                {preset.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="endpoint">自定义端点</Label>
        <Input
          id="endpoint"
          value={formData.endpoint}
          onChange={(e) => handleFieldChange('endpoint', e.target.value)}
          placeholder="留空则使用提供商默认端点"
        />
        <p className="text-xs text-muted-foreground">
          可选，用于私有部署或代理服务
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">描述</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="可选的模型描述"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {isEditing ? '保存' : '添加'}
        </Button>
      </div>
    </form>
  );
}


// ============================================================================
// Main Component
// ============================================================================

export function ModelManagementDialog({
  open,
  onClose,
  onModelsChange,
}: ModelManagementDialogProps) {
  // View state
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [editingModelId, setEditingModelId] = React.useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [modelToDelete, setModelToDelete] = React.useState<string | null>(null);
  
  // Error state
  const [error, setError] = React.useState<string | null>(null);

  // Get models based on search query
  const models = React.useMemo(() => {
    if (searchQuery.trim()) {
      return searchModels(searchQuery);
    }
    return getAllModels();
  }, [searchQuery]);

  // Group models by type
  const { presetModels, customModels } = React.useMemo(() => {
    const preset: ModelInfo[] = [];
    const custom: ModelInfo[] = [];
    
    for (const model of models) {
      if (model.isPreset) {
        preset.push(model);
      } else {
        custom.push(model);
      }
    }
    
    return { presetModels: preset, customModels: custom };
  }, [models]);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setViewMode('list');
      setEditingModelId(null);
      setSearchQuery('');
      setError(null);
    }
  }, [open]);

  // Handle add model
  const handleAddModel = React.useCallback((data: ModelFormData) => {
    try {
      const validation = validateModel({
        name: data.name,
        provider: data.provider,
      });
      
      if (!validation.valid) {
        setError(validation.errors.map(e => e.message).join(', '));
        return;
      }
      
      addModel({
        name: data.name.trim(),
        displayName: data.displayName.trim() || undefined,
        provider: data.provider,
        endpoint: data.endpoint.trim() || undefined,
        description: data.description.trim() || undefined,
      });
      
      setViewMode('list');
      setError(null);
      onModelsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加模型失败');
    }
  }, [onModelsChange]);

  // Handle edit model
  const handleEditModel = React.useCallback((data: ModelFormData) => {
    if (!editingModelId) return;
    
    try {
      updateModel(editingModelId, {
        name: data.name.trim(),
        displayName: data.displayName.trim() || undefined,
        provider: data.provider,
        endpoint: data.endpoint.trim() || undefined,
        description: data.description.trim() || undefined,
      });
      
      setViewMode('list');
      setEditingModelId(null);
      setError(null);
      onModelsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '编辑模型失败');
    }
  }, [editingModelId, onModelsChange]);

  // Handle delete model
  const handleDeleteModel = React.useCallback(() => {
    if (!modelToDelete) return;
    
    try {
      deleteModel(modelToDelete);
      setDeleteConfirmOpen(false);
      setModelToDelete(null);
      onModelsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除模型失败');
    }
  }, [modelToDelete, onModelsChange]);

  // Get editing model data
  const editingModel = React.useMemo(() => {
    if (!editingModelId) return null;
    return getCustomModelById(editingModelId);
  }, [editingModelId]);

  // Convert CustomModel to form data
  const editingFormData: ModelFormData | undefined = editingModel
    ? {
        name: editingModel.name,
        displayName: editingModel.displayName || '',
        provider: editingModel.provider,
        endpoint: editingModel.endpoint || '',
        description: editingModel.description || '',
      }
    : undefined;

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {viewMode === 'list' && '模型管理'}
              {viewMode === 'add' && '添加模型'}
              {viewMode === 'edit' && '编辑模型'}
            </DialogTitle>
            <DialogDescription>
              {viewMode === 'list' && '管理预设和自定义 LLM 模型'}
              {viewMode === 'add' && '添加新的自定义模型配置'}
              {viewMode === 'edit' && '修改自定义模型配置'}
            </DialogDescription>
          </DialogHeader>

          {/* Error display */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setError(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* List view */}
          {viewMode === 'list' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Search and Add */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索模型..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={() => setViewMode('add')}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              </div>

              {/* Model list */}
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 pb-4">
                  {/* Custom models section */}
                  {customModels.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        自定义模型 ({customModels.length})
                      </h4>
                      <div className="space-y-2">
                        {customModels.map((model) => (
                          <ModelListItem
                            key={model.customModelId}
                            model={model}
                            onEdit={(id) => {
                              setEditingModelId(id);
                              setViewMode('edit');
                            }}
                            onDelete={(id) => {
                              setModelToDelete(id);
                              setDeleteConfirmOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preset models section */}
                  {presetModels.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        预设模型 ({presetModels.length})
                      </h4>
                      <div className="space-y-2">
                        {presetModels.map((model) => (
                          <ModelListItem
                            key={`${model.provider}-${model.name}`}
                            model={model}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {models.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? '没有找到匹配的模型' : '暂无模型'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Add view */}
          {viewMode === 'add' && (
            <ModelForm
              onSubmit={handleAddModel}
              onCancel={() => {
                setViewMode('list');
                setError(null);
              }}
              isEditing={false}
            />
          )}

          {/* Edit view */}
          {viewMode === 'edit' && editingFormData && (
            <ModelForm
              initialData={editingFormData}
              onSubmit={handleEditModel}
              onCancel={() => {
                setViewMode('list');
                setEditingModelId(null);
                setError(null);
              }}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个自定义模型吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModelToDelete(null)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ModelManagementDialog;
