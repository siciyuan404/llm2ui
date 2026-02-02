/**
 * App Component
 * 
 * Main application component with three-column layout.
 * Integrates Chat, Editor, and Preview panels.
 * Provides navigation to Component Showcase page.
 * Supports loading schema from showcase via sessionStorage.
 * Integrates LLM configuration and Schema sync functionality.
 * 
 * Refactored to use centralized state management (Zustand) and custom hooks.
 * 
 * @see Requirements 6.1 - Main interface provides access to Component_Showcase
 * @see Requirements 11.4 - "Open in Editor" functionality from showcase
 * @see Requirements 3.1-3.11 - Chat interface with LLM integration
 * @see Requirements 4.1, 4.2, 4.4 - Schema sync to editors
 * @see Requirements 3.3, 4.6 - Use hooks and store for state management
 */

import { ThreeColumnLayout, ResizeHandle } from '@/components/layout';
import { ChatInterface } from '@/components/chat';
import { JsonSchemaEditor, DataBindingEditor } from '@/components/editor';
import { PreviewPanelWithControls } from '@/components/preview';
import { DevModeToggle } from '@/components/dev-mode';
import { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { UISchema, DataContext } from '@/types';
import type { ConversationMessage } from '@/types/state.types';
import { useAppStore } from '@/stores';
import {
  useSchemaSync,
  useLLMConfig,
  useEditorResize,
  useChatState,
} from '@/hooks';
import { STORAGE_KEYS } from '@/constants';

function App() {
  // ========================================
  // Store State
  // ========================================
  const schema = useAppStore((state) => state.schema);
  const jsonContent = useAppStore((state) => state.jsonContent);
  const dataContext = useAppStore((state) => state.dataContext);
  const setSchema = useAppStore((state) => state.setSchema);
  const setJsonContent = useAppStore((state) => state.setJsonContent);
  const setDataContext = useAppStore((state) => state.setDataContext);

  // ========================================
  // Custom Hooks
  // ========================================
  
  // Schema sync hook
  const { schemaSyncer, handleSyncResult } = useSchemaSync();
  
  // LLM config hook
  const { config: llmConfig, setConfig: setLLMConfig } = useLLMConfig();
  
  // Editor resize hook
  const {
    splitPercent: editorSplitPercent,
    isResizing: isResizingEditor,
    handleResizeStart: handleEditorResizeStart,
    containerRef: editorContainerRef,
  } = useEditorResize();
  
  // Chat state hook
  const {
    messages,
    sendMessage,
    updateMessage,
    clearConversation,
    isLoading,
    setLoading,
  } = useChatState();

  // ========================================
  // Effects
  // ========================================

  // Check for schema from showcase on mount
  useEffect(() => {
    const storedSchema = sessionStorage.getItem(STORAGE_KEYS.SCHEMA_CACHE);
    if (storedSchema) {
      try {
        const parsed = JSON.parse(storedSchema) as UISchema;
        setSchema(parsed);
        setJsonContent(JSON.stringify(parsed, null, 2));
        // Clear the stored schema after loading
        sessionStorage.removeItem(STORAGE_KEYS.SCHEMA_CACHE);
      } catch {
        // Invalid JSON, ignore
        sessionStorage.removeItem(STORAGE_KEYS.SCHEMA_CACHE);
      }
    }
  }, [setSchema, setJsonContent]);

  // ========================================
  // Callbacks
  // ========================================

  // Handle schema changes from chat
  const handleSchemaExtracted = useCallback((newSchema: UISchema) => {
    setSchema(newSchema);
    setJsonContent(JSON.stringify(newSchema, null, 2));
  }, [setSchema, setJsonContent]);

  // Handle JSON content changes from editor
  const handleJsonChange = useCallback((content: string) => {
    setJsonContent(content);
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && 'version' in parsed && 'root' in parsed) {
        setSchema(parsed as UISchema);
      }
    } catch {
      // Invalid JSON, don't update schema
    }
  }, [setJsonContent, setSchema]);

  // Handle data context changes
  const handleDataChange = useCallback((newData: DataContext) => {
    setDataContext(newData);
  }, [setDataContext]);

  // Handle sending a message (adapter for ChatInterface)
  const handleSendMessage = useCallback((message: ConversationMessage) => {
    sendMessage(message);
  }, [sendMessage]);

  // Handle message updates (streaming) - adapter for ChatInterface
  const handleMessageUpdate = useCallback((messageId: string, updates: Partial<ConversationMessage>) => {
    updateMessage(messageId, updates);
  }, [updateMessage]);

  // Handle clearing the conversation
  const handleClearConversation = useCallback(() => {
    clearConversation();
  }, [clearConversation]);

  // ========================================
  // Render
  // ========================================

  // Chat panel content
  const chatPanel = (
    <ChatInterface
      messages={messages}
      onSendMessage={handleSendMessage}
      onMessageUpdate={handleMessageUpdate}
      onSchemaExtracted={handleSchemaExtracted}
      llmConfig={llmConfig ?? undefined}
      onLLMConfigChange={setLLMConfig}
      isLoading={isLoading}
      onLoadingChange={setLoading}
      schemaSyncer={schemaSyncer}
      onSchemaSync={handleSyncResult}
      onClearConversation={handleClearConversation}
      dataContext={dataContext}
    />
  );

  // Editor panel content
  const editorPanel = (
    <div ref={editorContainerRef} className={`h-full flex flex-col ${isResizingEditor ? 'select-none' : ''}`}>
      <div className="min-h-0 overflow-hidden" style={{ height: `${editorSplitPercent}%` }}>
        <JsonSchemaEditor
          value={jsonContent}
          onChange={handleJsonChange}
        />
      </div>
      <ResizeHandle
        onDragStart={handleEditorResizeStart}
        isDragging={isResizingEditor}
        orientation="vertical"
      />
      <div className="min-h-0 overflow-auto" style={{ height: `${100 - editorSplitPercent}%` }}>
        <DataBindingEditor
          schema={schema}
          data={dataContext}
          onChange={handleDataChange}
        />
      </div>
    </div>
  );

  // Preview panel content
  const previewPanel = (
    <PreviewPanelWithControls
      schema={schema}
      dataContext={dataContext}
    />
  );

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Navigation Bar */}
      <nav className="h-10 px-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm">LLM2UI</span>
        </div>
        <div className="flex items-center gap-4">
          <DevModeToggle showLabel={true} className="text-xs" />
          <Link
            to="/showcase"
            className="px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
          >
            组件库
          </Link>
        </div>
      </nav>
      {/* Main Layout */}
      <div className="h-[calc(100vh-2.5rem)]">
        <ThreeColumnLayout
          chatPanel={chatPanel}
          editorPanel={editorPanel}
          previewPanel={previewPanel}
        />
      </div>
    </div>
  );
}

export default App;
