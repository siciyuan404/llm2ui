/**
 * ThreeColumnLayout Component
 * 
 * Main layout component with three resizable columns: Chat, Editor, Preview.
 * Implements Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  type LayoutState,
  type PanelId,
  togglePanelCollapsed,
  setActiveTab,
  setNarrowMode,
  saveLayoutState,
  getOrCreateLayoutState,
} from '@/lib/state-management';
import { ResizeHandle } from './ResizablePanel';
import { PanelHeader } from './PanelHeader';
import { TabBar } from './TabBar';

/** Breakpoint for narrow/mobile mode (in pixels) */
const NARROW_BREAKPOINT = 768;

/** Minimum panel width percentage */
const MIN_PANEL_WIDTH = 15;

/** Maximum panel width percentage */
const MAX_PANEL_WIDTH = 70;

export interface ThreeColumnLayoutProps {
  /** Chat panel content */
  chatPanel: React.ReactNode;
  /** Editor panel content */
  editorPanel: React.ReactNode;
  /** Preview panel content */
  previewPanel: React.ReactNode;
  /** Initial layout state (optional, will load from storage if not provided) */
  initialState?: LayoutState;
  /** Callback when layout state changes */
  onLayoutChange?: (state: LayoutState) => void;
  /** Additional class names */
  className?: string;
}

/**
 * ThreeColumnLayout - Main application layout with resizable panels
 */
export function ThreeColumnLayout({
  chatPanel,
  editorPanel,
  previewPanel,
  initialState,
  onLayoutChange,
  className,
}: ThreeColumnLayoutProps) {
  const [layoutState, setLayoutState] = useState<LayoutState>(
    initialState ?? getOrCreateLayoutState()
  );
  const [isDragging, setIsDragging] = useState<'chat-editor' | 'editor-preview' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, widths: layoutState.panelWidths });

  // Handle window resize for narrow mode detection
  useEffect(() => {
    const handleResize = () => {
      const isNarrow = window.innerWidth < NARROW_BREAKPOINT;
      if (isNarrow !== layoutState.isNarrowMode) {
        setLayoutState(prev => setNarrowMode(prev, isNarrow));
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutState.isNarrowMode]);

  // Save layout state to localStorage when it changes
  useEffect(() => {
    saveLayoutState(layoutState);
    onLayoutChange?.(layoutState);
  }, [layoutState, onLayoutChange]);

  // Handle resize drag start
  const handleDragStart = useCallback((handle: 'chat-editor' | 'editor-preview') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(handle);
    dragStartRef.current = {
      x: e.clientX,
      widths: { ...layoutState.panelWidths },
    };
  }, [layoutState.panelWidths]);

  // Handle resize drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.getBoundingClientRect().width;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaPercent = (deltaX / containerWidth) * 100;

      const { widths } = dragStartRef.current;

      if (isDragging === 'chat-editor') {
        // Adjust chat and editor widths
        const newChatWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, widths.chat + deltaPercent));
        const chatDelta = newChatWidth - widths.chat;
        const newEditorWidth = Math.max(MIN_PANEL_WIDTH, widths.editor - chatDelta);
        
        if (newEditorWidth >= MIN_PANEL_WIDTH) {
          setLayoutState(prev => ({
            ...prev,
            panelWidths: {
              ...prev.panelWidths,
              chat: newChatWidth,
              editor: newEditorWidth,
            },
          }));
        }
      } else if (isDragging === 'editor-preview') {
        // Adjust editor and preview widths
        const newEditorWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, widths.editor + deltaPercent));
        const editorDelta = newEditorWidth - widths.editor;
        const newPreviewWidth = Math.max(MIN_PANEL_WIDTH, widths.preview - editorDelta);
        
        if (newPreviewWidth >= MIN_PANEL_WIDTH) {
          setLayoutState(prev => ({
            ...prev,
            panelWidths: {
              ...prev.panelWidths,
              editor: newEditorWidth,
              preview: newPreviewWidth,
            },
          }));
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle panel collapse toggle
  const handleToggleCollapse = useCallback((panelId: PanelId) => {
    setLayoutState(prev => togglePanelCollapsed(prev, panelId));
  }, []);

  // Handle tab change (narrow mode)
  const handleTabChange = useCallback((tab: PanelId) => {
    setLayoutState(prev => setActiveTab(prev, tab));
  }, []);

  // Calculate visible panel widths (accounting for collapsed panels)
  const getVisibleWidths = useCallback(() => {
    const { panelWidths, collapsedPanels } = layoutState;
    const visiblePanels = (['chat', 'editor', 'preview'] as PanelId[]).filter(
      p => !collapsedPanels[p]
    );
    
    if (visiblePanels.length === 0) return panelWidths;
    
    const collapsedTotal = (['chat', 'editor', 'preview'] as PanelId[])
      .filter(p => collapsedPanels[p])
      .reduce((sum, p) => sum + panelWidths[p], 0);
    
    const scale = 100 / (100 - collapsedTotal);
    
    return {
      chat: collapsedPanels.chat ? 0 : panelWidths.chat * scale,
      editor: collapsedPanels.editor ? 0 : panelWidths.editor * scale,
      preview: collapsedPanels.preview ? 0 : panelWidths.preview * scale,
    };
  }, [layoutState]);

  const visibleWidths = getVisibleWidths();

  // Narrow mode: show tabs
  if (layoutState.isNarrowMode) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <TabBar
          activeTab={layoutState.activeTab}
          onTabChange={handleTabChange}
        />
        <div className="flex-1 overflow-hidden">
          {layoutState.activeTab === 'chat' && chatPanel}
          {layoutState.activeTab === 'editor' && editorPanel}
          {layoutState.activeTab === 'preview' && previewPanel}
        </div>
      </div>
    );
  }

  // Wide mode: show three columns
  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full',
        isDragging && 'select-none cursor-col-resize',
        className
      )}
    >
      {/* Chat Panel */}
      {!layoutState.collapsedPanels.chat && (
        <div
          className="flex flex-col h-full overflow-hidden border-r border-border"
          style={{ width: `${visibleWidths.chat}%` }}
        >
          <PanelHeader
            title="Chat"
            panelId="chat"
            collapsed={false}
            onToggleCollapse={() => handleToggleCollapse('chat')}
          />
          <div className="flex-1 overflow-hidden">
            {chatPanel}
          </div>
        </div>
      )}

      {/* Chat-Editor Resize Handle */}
      {!layoutState.collapsedPanels.chat && !layoutState.collapsedPanels.editor && (
        <ResizeHandle
          onDragStart={handleDragStart('chat-editor')}
          isDragging={isDragging === 'chat-editor'}
        />
      )}

      {/* Collapsed Chat Indicator */}
      {layoutState.collapsedPanels.chat && (
        <CollapsedPanelIndicator
          panelId="chat"
          title="Chat"
          onExpand={() => handleToggleCollapse('chat')}
        />
      )}

      {/* Editor Panel */}
      {!layoutState.collapsedPanels.editor && (
        <div
          className="flex flex-col h-full overflow-hidden border-r border-border"
          style={{ width: `${visibleWidths.editor}%` }}
        >
          <PanelHeader
            title="Editor"
            panelId="editor"
            collapsed={false}
            onToggleCollapse={() => handleToggleCollapse('editor')}
          />
          <div className="flex-1 overflow-hidden">
            {editorPanel}
          </div>
        </div>
      )}

      {/* Editor-Preview Resize Handle */}
      {!layoutState.collapsedPanels.editor && !layoutState.collapsedPanels.preview && (
        <ResizeHandle
          onDragStart={handleDragStart('editor-preview')}
          isDragging={isDragging === 'editor-preview'}
        />
      )}

      {/* Collapsed Editor Indicator */}
      {layoutState.collapsedPanels.editor && (
        <CollapsedPanelIndicator
          panelId="editor"
          title="Editor"
          onExpand={() => handleToggleCollapse('editor')}
        />
      )}

      {/* Preview Panel */}
      {!layoutState.collapsedPanels.preview && (
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ width: `${visibleWidths.preview}%` }}
        >
          <PanelHeader
            title="Preview"
            panelId="preview"
            collapsed={false}
            onToggleCollapse={() => handleToggleCollapse('preview')}
          />
          <div className="flex-1 overflow-hidden">
            {previewPanel}
          </div>
        </div>
      )}

      {/* Collapsed Preview Indicator */}
      {layoutState.collapsedPanels.preview && (
        <CollapsedPanelIndicator
          panelId="preview"
          title="Preview"
          onExpand={() => handleToggleCollapse('preview')}
        />
      )}
    </div>
  );
}

interface CollapsedPanelIndicatorProps {
  panelId: PanelId;
  title: string;
  onExpand: () => void;
}

function CollapsedPanelIndicator({ title, onExpand }: CollapsedPanelIndicatorProps) {
  return (
    <button
      onClick={onExpand}
      className={cn(
        'w-8 h-full flex items-center justify-center',
        'bg-muted hover:bg-muted/80 transition-colors',
        'border-r border-border cursor-pointer'
      )}
      title={`Expand ${title}`}
      aria-label={`Expand ${title} panel`}
    >
      <span className="writing-mode-vertical text-xs text-muted-foreground font-medium">
        {title}
      </span>
    </button>
  );
}

export default ThreeColumnLayout;
