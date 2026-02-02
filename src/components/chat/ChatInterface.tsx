/**
 * ChatInterface Component
 * 
 * Main chat interface for interacting with LLM.
 * Implements Requirements 1.1, 1.2, 1.4, 3.1-3.11
 * - Message list display
 * - Input box and send button
 * - Streaming response display
 * - Model switcher integration
 * - LLM settings dialog integration
 * - Schema sync functionality
 * 
 * @module components/chat/ChatInterface
 */

import * as React from 'react';
import { 
  Trash2, 
  FileText,
  X,
  Paperclip,
  Image,
  Brain,
  Search,
  Settings,
  Mic,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ContextProgress } from '@/components/ui/context-progress';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/lib/state-management';
import {
  createMessage,
  generateId,
} from '@/lib/state-management';
import type { LLMConfig, SavedLLMConfig } from '@/lib';
import {
  sendMessage,
  extractUISchema,
  testConnection,
  loadAllLLMConfigs,
  loadCurrentLLMConfig,
  saveCurrentLLMConfig,
  saveLLMConfig,
  SchemaSyncer,
} from '@/lib';
import type { SyncResult } from '@/lib';
import type { UISchema, DataContext } from '@/types';
import { MessageBubble, LoadingIndicator } from './MessageBubble';
import { ModelSwitcher } from './ModelSwitcher';
import { ContextSettingsPanel } from './ContextSettingsPanel';
import { LLMSettingsDialog } from '@/components/settings';
import { useAppStore } from '@/stores';

// ============================================================================
// Types
// ============================================================================

export interface ChatInterfaceProps {
  /** Current messages to display */
  messages: ConversationMessage[];
  /** Callback when a new message is sent */
  onSendMessage?: (message: ConversationMessage) => void;
  /** Callback when assistant message is updated (during streaming) */
  onMessageUpdate?: (messageId: string, updates: Partial<ConversationMessage>) => void;
  /** Callback when a UISchema is extracted from response */
  onSchemaExtracted?: (schema: UISchema) => void;
  /** LLM configuration for sending messages (optional, will use internal state if not provided) */
  llmConfig?: LLMConfig;
  /** Callback when LLM config changes */
  onLLMConfigChange?: (config: LLMConfig) => void;
  /** Whether the chat is currently loading/streaming */
  isLoading?: boolean;
  /** Callback to set loading state */
  onLoadingChange?: (loading: boolean) => void;
  /** Placeholder text for input */
  placeholder?: string;
  /** Additional class name */
  className?: string;
  /** Schema syncer instance for syncing to editors */
  schemaSyncer?: SchemaSyncer;
  /** Callback when schema is synced to editors */
  onSchemaSync?: (result: SyncResult) => void;
  /** Callback to clear conversation */
  onClearConversation?: () => void;
  /** Current data context for schema sync */
  dataContext?: DataContext;
}

// ============================================================================
// Main Component
// ============================================================================

export function ChatInterface({
  messages,
  onSendMessage,
  onMessageUpdate,
  onSchemaExtracted,
  llmConfig: externalLLMConfig,
  onLLMConfigChange,
  isLoading = false,
  onLoadingChange,
  placeholder = '输入消息...',
  className,
  schemaSyncer,
  onSchemaSync,
  onClearConversation,
  dataContext,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [internalLoading, setInternalLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  
  const contextSettings = useAppStore((state) => state.contextSettings);
  const setContextSettings = useAppStore((state) => state.setContextSettings);
  
  // Convert PersistedContextSettings to ContextSettings for ContextSettingsPanel
  const contextSettingsForPanel = React.useMemo(() => ({
    themeId: contextSettings.themeId,
    components: {
      mode: contextSettings.componentsMode,
      selectedIds: contextSettings.selectedComponentIds,
      presetName: contextSettings.componentPresetName,
    },
    examples: {
      mode: contextSettings.examplesMode,
      selectedIds: contextSettings.selectedExampleIds,
      maxCount: contextSettings.maxExampleCount,
    },
    colorScheme: {
      id: contextSettings.colorSchemeId,
      includeInPrompt: contextSettings.includeColorInPrompt,
    },
    tokenBudget: {
      max: contextSettings.tokenBudgetMax,
      autoOptimize: contextSettings.tokenAutoOptimize,
    },
  }), [contextSettings]);
  
  const contextUsed = React.useMemo(() => {
    return messages.reduce((acc, msg) => acc + msg.content.length, 0);
  }, [messages]);
  
  const contextTotal = contextSettings.tokenBudgetMax || 4000;
  
  // File attachments state
  const [attachedFiles, setAttachedFiles] = React.useState<Array<{ id: string; name: string; type: string }>>([]);
  // Toggle states
  const [deepThinkingEnabled, setDeepThinkingEnabled] = React.useState(false);
  const [searchEnabled, setSearchEnabled] = React.useState(false);

  // LLM configuration state
  const [internalLLMConfig, setInternalLLMConfig] = React.useState<LLMConfig | null>(() => {
    return loadCurrentLLMConfig();
  });
  const [savedConfigs, setSavedConfigs] = React.useState<SavedLLMConfig[]>(() => {
    return loadAllLLMConfigs();
  });
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // Use external config if provided, otherwise use internal
  const llmConfig = externalLLMConfig ?? internalLLMConfig;

  // Use external loading state if provided, otherwise use internal
  const loading = isLoading || internalLoading;

  // Reload saved configs when settings dialog closes
  const reloadSavedConfigs = React.useCallback(() => {
    setSavedConfigs(loadAllLLMConfigs());
  }, []);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handles config change from ModelSwitcher
   */
  const handleConfigChange = React.useCallback((config: SavedLLMConfig) => {
    setInternalLLMConfig(config);
    saveCurrentLLMConfig(config);
    onLLMConfigChange?.(config);
  }, [onLLMConfigChange]);

  /**
   * Handles saving config from settings dialog
   */
  const handleSaveConfig = React.useCallback((config: LLMConfig) => {
    // Save as current config
    setInternalLLMConfig(config);
    saveCurrentLLMConfig(config);
    onLLMConfigChange?.(config);
    
    // Also save to configs list
    try {
      saveLLMConfig(config);
      reloadSavedConfigs();
    } catch {
      // Config already saved or error, ignore
    }
  }, [onLLMConfigChange, reloadSavedConfigs]);

  /**
   * Handles test connection from settings dialog
   */
  const handleTestConnection = React.useCallback(async (config: LLMConfig) => {
    return testConnection(config);
  }, []);

  /**
   * Handles applying schema to editors
   */
  const handleApplyToEditor = React.useCallback((schema: UISchema) => {
    if (schemaSyncer) {
      const result = schemaSyncer.extractAndSync(JSON.stringify(schema), {
        preserveExistingData: true,
        existingData: dataContext,
      });
      onSchemaSync?.(result);
    }
    onSchemaExtracted?.(schema);
  }, [schemaSyncer, dataContext, onSchemaSync, onSchemaExtracted]);

  /**
   * Handles sending a message
   */
  const handleSend = React.useCallback(async () => {
    const content = inputValue.trim();
    if (!content || loading) return;

    // Clear input
    setInputValue('');

    // Create user message
    const userMessage = createMessage('user', content);
    onSendMessage?.(userMessage);

    // If no LLM config, just send the user message
    if (!llmConfig) {
      return;
    }

    // Set loading state
    setInternalLoading(true);
    onLoadingChange?.(true);

    // Create assistant message placeholder
    const assistantMessageId = generateId();
    const assistantMessage = createMessage('assistant', '', {
      id: assistantMessageId,
      status: 'streaming',
    });
    onSendMessage?.(assistantMessage);

    try {
      // Build messages for LLM
      const chatMessages = [
        ...messages
          .filter(m => m.role !== 'system')
          .map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content },
      ];

      // Add system prompt if configured
      if (llmConfig.systemPrompt) {
        chatMessages.unshift({
          role: 'system' as const,
          content: llmConfig.systemPrompt,
        });
      }

      // Stream response
      let fullContent = '';
      const stream = sendMessage(chatMessages, llmConfig);

      for await (const chunk of stream) {
        if (chunk.error) {
          onMessageUpdate?.(assistantMessageId, {
            status: 'error',
            error: chunk.error,
          });
          break;
        }

        fullContent += chunk.content;
        onMessageUpdate?.(assistantMessageId, {
          content: fullContent,
          status: chunk.done ? 'complete' : 'streaming',
        });

        // Try to extract UISchema when done (with autoFix to resolve type aliases)
        if (chunk.done && fullContent) {
          const result = extractUISchema(fullContent, { autoFix: true });
          const extractedSchema = result && typeof result === 'object' && 'schema' in result ? result.schema : result;
          const isValidSchema = extractedSchema && typeof extractedSchema === 'object' && 'version' in extractedSchema && 'root' in extractedSchema;
          if (isValidSchema) {
            onMessageUpdate?.(assistantMessageId, {
              extractedSchema: extractedSchema as UISchema,
            });
            // Use handleApplyToEditor for schema sync
            handleApplyToEditor(extractedSchema as UISchema);
          }
        }
      }
    } catch (error) {
      onMessageUpdate?.(assistantMessageId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setInternalLoading(false);
      onLoadingChange?.(false);
    }
  }, [
    inputValue,
    loading,
    messages,
    llmConfig,
    onSendMessage,
    onMessageUpdate,
    handleApplyToEditor,
    onLoadingChange,
  ]);

  /**
   * Handles key press in input
   */
  const handleKeyPress = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  /**
   * Handles file upload
   */
  const handleFileUpload = React.useCallback(() => {
    // TODO: Implement file upload functionality
    console.log('File upload clicked');
  }, []);

  /**
   * Handles image upload
   */
  const handleImageUpload = React.useCallback(() => {
    // TODO: Implement image upload functionality
    console.log('Image upload clicked');
  }, []);

  /**
   * Handles removing an attached file
   */
  const handleRemoveFile = React.useCallback((fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  /**
   * Toggles deep thinking mode
   */
  const toggleDeepThinking = React.useCallback(() => {
    setDeepThinkingEnabled(prev => !prev);
  }, []);

  /**
   * Toggles search mode
   */
  const toggleSearch = React.useCallback(() => {
    setSearchEnabled(prev => !prev);
  }, []);

  /**
   * Handles clearing context
   */
  const handleClearContext = React.useCallback(() => {
    onClearConversation?.();
  }, [onClearConversation]);

  /**
   * Handles compressing context
   */
  const handleCompressContext = React.useCallback(() => {
    console.log('压缩上下文功能开发中...');
  }, []);

  /**
   * Handles context settings change from ContextSettingsPanel
   */
  const handleContextSettingsChange = React.useCallback((settings: any) => {
    // Convert ContextSettings to PersistedContextSettings format
    setContextSettings({
      themeId: settings.themeId,
      componentsMode: settings.components.mode,
      selectedComponentIds: settings.components.selectedIds,
      componentPresetName: settings.components.presetName,
      examplesMode: settings.examples.mode,
      selectedExampleIds: settings.examples.selectedIds,
      maxExampleCount: settings.examples.maxCount,
      colorSchemeId: settings.colorScheme.id,
      includeColorInPrompt: settings.colorScheme.includeInPrompt,
      tokenBudgetMax: settings.tokenBudget.max,
      tokenAutoOptimize: settings.tokenBudget.autoOptimize,
    });
  }, [setContextSettings]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with ModelSwitcher */}
      <div className="border-b p-2 flex items-center justify-between gap-2">
        <ModelSwitcher
          currentConfig={llmConfig ?? undefined}
          savedConfigs={savedConfigs}
          onConfigChange={handleConfigChange}
          onOpenSettings={() => setSettingsOpen(true)}
          disabled={loading}
        />
        {onClearConversation && messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearConversation}
            disabled={loading}
            title="清空对话"
            className="h-9 w-9"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {llmConfig ? '开始对话，让 AI 为您生成 UI' : '请先配置 LLM 设置'}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onApplyToEditor={handleApplyToEditor}
              />
            ))}
            {loading && messages[messages.length - 1]?.status !== 'streaming' && (
              <LoadingIndicator />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-white">
        <div className="flex flex-col border rounded-lg p-2 bg-white shadow-sm m-4">
          
          {/* File references area */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center bg-slate-100 rounded-full px-3 py-1 text-sm"
                >
                  <FileText className="mr-1" size={14} />
                  <span className="ml-1 mr-2">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Text input area */}
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={loading || !llmConfig}
              className="w-full min-h-[80px] resize-none border-none focus:outline-none"
            />
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-between mt-2">
            {/* Icon button group */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900"
                onClick={handleFileUpload}
                title="上传文件"
              >
                <Paperclip size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900"
                onClick={handleImageUpload}
                title="上传图片"
              >
                <Image size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-slate-600 hover:text-slate-900",
                  deepThinkingEnabled && "bg-slate-200"
                )}
                onClick={toggleDeepThinking}
                title="深度思考"
              >
                <Brain size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-slate-600 hover:text-slate-900",
                  searchEnabled && "bg-slate-200"
                )}
                onClick={toggleSearch}
                title="搜索"
              >
                <Search size={16} />
              </Button>
            </div>

            {/* Options menu */}
            <div className="flex items-center gap-2">
              <ContextProgress
                used={contextUsed}
                total={contextTotal}
                onClear={handleClearContext}
                onCompress={handleCompressContext}
              />
              <ContextSettingsPanel
                settings={contextSettingsForPanel}
                onSettingsChange={handleContextSettingsChange}
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900"
                onClick={() => setSettingsOpen(true)}
                title="设置"
              >
                <Settings size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900 ml-2"
                title="语音输入"
              >
                <Mic size={16} />
              </Button>
              <Button
                variant="default"
                size="sm"
                className="ml-2"
                onClick={handleSend}
                disabled={loading || !inputValue.trim() || !llmConfig}
                title="发送"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* LLM Settings Dialog */}
      <LLMSettingsDialog
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          reloadSavedConfigs();
        }}
        currentConfig={llmConfig ?? undefined}
        onSave={handleSaveConfig}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
}

export default ChatInterface;
