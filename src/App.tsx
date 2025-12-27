/**
 * App Component
 * 
 * Main application component with three-column layout.
 * Integrates Chat, Editor, and Preview panels.
 * Provides navigation to Component Showcase page.
 * Supports loading schema from showcase via sessionStorage.
 * Integrates LLM configuration and Schema sync functionality.
 * 
 * @see Requirements 6.1 - Main interface provides access to Component_Showcase
 * @see Requirements 11.4 - "Open in Editor" functionality from showcase
 * @see Requirements 3.1-3.11 - Chat interface with LLM integration
 * @see Requirements 4.1, 4.2, 4.4 - Schema sync to editors
 */

import { ThreeColumnLayout, ResizeHandle } from '@/components/layout';
import { ChatInterface } from '@/components/chat';
import { JsonSchemaEditor, DataBindingEditor } from '@/components/editor';
import { PreviewPanelWithControls } from '@/components/preview';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { UISchema, DataContext } from '@/types';
import type { ConversationMessage } from '@/lib/state-management';
import {
  createInitialChatState,
  addConversationToState,
  createConversation,
  addMessageToConversation,
  updateMessageInConversation,
  getActiveConversation,
  updateConversationInState,
  type ChatState,
} from '@/lib/state-management';
import type { LLMConfig } from '@/lib/llm-service';
import { loadCurrentLLMConfig, saveCurrentLLMConfig } from '@/lib/llm-config-manager';
import { SchemaSyncer, type SyncResult } from '@/lib/schema-sync';

function App() {
  const [schema, setSchema] = useState<UISchema | null>(null);
  const [dataContext, setDataContext] = useState<DataContext>({});
  const [jsonContent, setJsonContent] = useState('');
  const [chatState, setChatState] = useState<ChatState>(() => {
    // Initialize with a default conversation
    const initialState = createInitialChatState();
    const conversation = createConversation('New Chat');
    return addConversationToState(initialState, conversation);
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // LLM configuration state
  const [llmConfig, setLLMConfig] = useState<LLMConfig | null>(() => {
    return loadCurrentLLMConfig();
  });
  
  // Schema syncer instance (memoized to prevent recreation)
  const schemaSyncer = useMemo(() => new SchemaSyncer(), []);
  
  // Editor panel resize state
  const [editorSplitPercent, setEditorSplitPercent] = useState(70); // JsonSchemaEditor takes 70%
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ y: 0, percent: 70 });

  // Check for schema from showcase on mount
  useEffect(() => {
    const storedSchema = sessionStorage.getItem('llm2ui-schema');
    if (storedSchema) {
      try {
        const parsed = JSON.parse(storedSchema) as UISchema;
        setSchema(parsed);
        setJsonContent(JSON.stringify(parsed, null, 2));
        // Clear the stored schema after loading
        sessionStorage.removeItem('llm2ui-schema');
      } catch {
        // Invalid JSON, ignore
        sessionStorage.removeItem('llm2ui-schema');
      }
    }
  }, []);

  // Subscribe to schema sync events
  useEffect(() => {
    const unsubscribe = schemaSyncer.onSync((event) => {
      if (event.type === 'schema_updated' && event.schema) {
        setSchema(event.schema);
        setJsonContent(JSON.stringify(event.schema, null, 2));
      } else if (event.type === 'data_updated' && event.data) {
        setDataContext(event.data);
      }
    });
    return unsubscribe;
  }, [schemaSyncer]);

  // Get current conversation messages
  const activeConversation = getActiveConversation(chatState);
  const messages = activeConversation?.messages ?? [];

  // Handle schema changes from chat
  const handleSchemaExtracted = useCallback((newSchema: UISchema) => {
    setSchema(newSchema);
    setJsonContent(JSON.stringify(newSchema, null, 2));
  }, []);

  // Handle LLM config changes
  const handleLLMConfigChange = useCallback((config: LLMConfig) => {
    setLLMConfig(config);
    saveCurrentLLMConfig(config);
  }, []);

  // Handle schema sync results
  const handleSchemaSync = useCallback((result: SyncResult) => {
    if (result.success) {
      if (result.schema) {
        setSchema(result.schema);
        setJsonContent(JSON.stringify(result.schema, null, 2));
      }
      if (result.data) {
        setDataContext(result.data);
      }
    }
  }, []);

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
  }, []);

  // Handle data context changes
  const handleDataChange = useCallback((newData: DataContext) => {
    setDataContext(newData);
  }, []);

  // Handle sending a message
  const handleSendMessage = useCallback((message: ConversationMessage) => {
    setChatState(prev => {
      const conversation = getActiveConversation(prev);
      if (!conversation) return prev;
      const updated = addMessageToConversation(conversation, message);
      return updateConversationInState(prev, updated);
    });
  }, []);

  // Handle message updates (streaming)
  const handleMessageUpdate = useCallback((messageId: string, updates: Partial<ConversationMessage>) => {
    setChatState(prev => {
      const conversation = getActiveConversation(prev);
      if (!conversation) return prev;
      const updated = updateMessageInConversation(conversation, messageId, updates);
      return updateConversationInState(prev, updated);
    });
  }, []);

  // Handle clearing the conversation
  const handleClearConversation = useCallback(() => {
    setChatState(prev => {
      const conversation = getActiveConversation(prev);
      if (!conversation) return prev;
      // Create a new conversation with the same ID but empty messages
      const clearedConversation = createConversation('New Chat', conversation.id);
      return updateConversationInState(prev, clearedConversation);
    });
  }, []);

  // Handle editor panel resize drag
  const handleEditorResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingEditor(true);
    dragStartRef.current = { y: e.clientY, percent: editorSplitPercent };
  }, [editorSplitPercent]);

  useEffect(() => {
    if (!isResizingEditor) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = editorContainerRef.current;
      if (!container) return;

      const containerHeight = container.getBoundingClientRect().height;
      const deltaY = e.clientY - dragStartRef.current.y;
      const deltaPercent = (deltaY / containerHeight) * 100;
      const newPercent = Math.max(20, Math.min(90, dragStartRef.current.percent + deltaPercent));
      setEditorSplitPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsResizingEditor(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingEditor]);

  // Chat panel content
  const chatPanel = (
    <ChatInterface
      messages={messages}
      onSendMessage={handleSendMessage}
      onMessageUpdate={handleMessageUpdate}
      onSchemaExtracted={handleSchemaExtracted}
      llmConfig={llmConfig ?? undefined}
      onLLMConfigChange={handleLLMConfigChange}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      schemaSyncer={schemaSyncer}
      onSchemaSync={handleSchemaSync}
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
        <div className="flex items-center gap-2">
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

export default App
