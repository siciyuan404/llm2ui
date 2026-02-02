/**
 * InputBar Component
 * 
 * A chat input bar component with support for:
 * - Text input with auto-resize
 * - Image attachments
 * - Tool buttons (thinking, web search, etc.)
 * - Task files display
 * - Fullscreen mode
 * 
 * @module components/ui/input-bar
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ArrowUp, Square, X, Languages, Paperclip, Lightbulb, Globe, Zap, Brush, MessageSquareDiff, Maximize2, FolderOpen, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ============================================================================
// Types
// ============================================================================

export interface MessageImage {
  data: string;
  mediaType: string;
}

export interface TaskFile {
  id: string;
  name: string;
  type: string;
  content?: string;
  version?: number;
  createdAt?: number;
  updatedAt?: number;
}

interface InputBarProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (
    images?: MessageImage[],
    webSearch?: boolean,
    thinking?: boolean,
  ) => void;
  /** 停止生成回调 */
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
  onClearMessages?: () => void;
  /** 切换画布显示 */
  onToggleCanvas?: () => void;
  /** 画布是否打开 */
  isCanvasOpen?: boolean;
  /** 任务文件列表 */
  taskFiles?: TaskFile[];
  /** 选中的文件 ID */
  selectedFileId?: string;
  /** 任务文件面板是否展开 */
  taskFilesExpanded?: boolean;
  /** 切换任务文件面板 */
  onToggleTaskFiles?: () => void;
  /** 文件点击回调 */
  onTaskFileClick?: (file: TaskFile) => void;
}

// ============================================================================
// Sub-Components
// ============================================================================

interface InputbarCoreProps {
  text: string;
  setText: (text: string) => void;
  onSend: () => void;
  /** 停止生成回调 */
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  activeTools: Record<string, boolean>;
  onToolClick: (tool: string) => void;
  pendingImages?: MessageImage[];
  onRemoveImage?: (index: number) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  isFullscreen?: boolean;
}

const InputbarCore: React.FC<InputbarCoreProps> = ({
  text,
  setText,
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  activeTools,
  onToolClick,
  pendingImages = [],
  onRemoveImage,
  onPaste,
  isFullscreen = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasContent = text.trim().length > 0 || pendingImages.length > 0;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      if (isFullscreen) {
        textareaRef.current.style.height = "100%";
      } else {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
      }
    }
  }, [text, isFullscreen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!hasContent || disabled || isLoading) return;
      onSend();
    }
    // ESC 退出全屏
    if (e.key === "Escape" && isFullscreen) {
      onToolClick("fullscreen");
    }
  };

  return (
    <div className={cn("flex flex-col relative z-2", isFullscreen ? "flex-1" : "")}>
      <div
        className={cn(
          "border border-border rounded-2xl pt-2 relative transition-all",
          "bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700",
          "focus-within:border-primary focus-within:bg-background focus-within:shadow-[0_0_0_1px_hsl(var(--primary))]",
          isFullscreen ? "flex-1 flex flex-col" : ""
        )}
      >
        {!isFullscreen && (
          <div className="absolute -top-3 left-0 right-0 h-6 flex items-center justify-center cursor-row-resize text-muted-foreground opacity-0 hover:opacity-100 transition-opacity z-10">
            <div className="w-12 h-1 bg-border rounded-full" />
          </div>
        )}

        {pendingImages.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border-b border-border">
            {pendingImages.map((img, index) => (
              <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={`data:${img.mediaType};base64,${img.data}`}
                  alt={`预览 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onRemoveImage?.(index)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white border-none cursor-pointer flex items-center justify-center hover:bg-red-500/90 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          placeholder={
            isFullscreen
              ? "全屏编辑模式，按 ESC 退出，Enter 发送"
              : "在这里输入消息... 按 Enter 发送"
          }
          disabled={disabled}
          className={cn(
            "px-4 pt-1 resize-none overflow-auto w-full box-sizing-border bg-transparent border-none outline-none",
            "leading-6 font-inherit text-sm text-foreground min-h-8",
            "placeholder:text-muted-foreground",
            "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
            isFullscreen ? "flex-1 resize-none" : ""
          )}
        />

        <div className="flex flex-row justify-between items-center p-1.5 h-10 gap-4 relative z-2 flex-shrink-0">
          <div className="flex items-center flex-1 min-w-0">
            <InputbarTools
              onToolClick={onToolClick}
              activeTools={activeTools}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onToolClick("translate")}
                    className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-all hover:text-foreground hover:bg-secondary border-none cursor-pointer p-0"
                  >
                    <Languages size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">翻译</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button
              onClick={isLoading ? onStop : onSend}
              disabled={!isLoading && (!hasContent || disabled)}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer transition-all",
                "hover:scale-105",
                isLoading
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-transparent text-primary hover:bg-primary-foreground",
                "disabled:cursor-default disabled:text-muted-foreground disabled:opacity-50"
              )}
            >
              {isLoading ? (
                <Square size={16} fill="currentColor" />
              ) : (
                <ArrowUp size={20} strokeWidth={3} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InputbarToolsProps {
  onToolClick?: (tool: string) => void;
  activeTools?: Record<string, boolean>;
}

const InputbarTools: React.FC<InputbarToolsProps> = ({
  onToolClick,
  activeTools = {},
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolClick?.("new_topic")}
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-all hover:text-foreground hover:bg-secondary border-none cursor-pointer p-0 mr-0.5"
            >
              <MessageSquareDiff size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">新建话题</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolClick?.("attach")}
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-all hover:text-foreground hover:bg-secondary border-none cursor-pointer p-0 mr-0.5"
            >
              <Paperclip size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">上传文件</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolClick?.("thinking")}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-all hover:text-foreground hover:bg-secondary border-none cursor-pointer p-0 mr-0.5",
                activeTools["thinking"] ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Lightbulb
                className={activeTools["thinking"] ? "text-yellow-500" : ""}
                size={16}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            深度思考 {activeTools["thinking"] ? "(已开启)" : ""}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolClick?.("web_search")}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-all hover:text-foreground hover:bg-secondary border-none cursor-pointer p-0 mr-0.5",
                activeTools["web_search"] ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Globe
                className={activeTools["web_search"] ? "text-blue-500" : ""}
                size={16}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            联网搜索 {activeTools["web_search"] ? "(已开启)" : ""}
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolClick?.("quick_action")}
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-all hover:text-foreground hover:bg-secondary border-none cursor-pointer p-0 mr-0.5"
            >
              <Zap size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">快捷指令</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolClick?.("fullscreen")}
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-all hover:text-foreground hover:bg-secondary border-none cursor-pointer p-0 mr-0.5"
            >
              <Maximize2 size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">全屏编辑</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolClick?.("clear")}
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-all hover:text-foreground hover:bg-secondary border-none cursor-pointer p-0 mr-0.5"
            >
              <Brush size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">清除输入</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const InputBar: React.FC<InputBarProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  disabled,
  onClearMessages,
  onToggleCanvas: _onToggleCanvas,
  isCanvasOpen: _isCanvasOpen,
  taskFiles = [],
  selectedFileId,
  taskFilesExpanded = false,
  onToggleTaskFiles,
  onTaskFileClick,
}) => {
  const [activeTools, setActiveTools] = useState<Record<string, boolean>>({});
  const [pendingImages, setPendingImages] = useState<MessageImage[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToolClick = useCallback(
    (tool: string) => {
      switch (tool) {
        case "thinking":
        case "web_search":
          setActiveTools((prev) => {
            const newState = { ...prev, [tool]: !prev[tool] };
            console.log(
              `${tool === "thinking" ? "深度思考" : "联网搜索"}${newState[tool] ? "已开启" : "已关闭"}`
            );
            return newState;
          });
          break;
        case "clear":
          setInput("");
          setPendingImages([]);
          break;
        case "new_topic":
          onClearMessages?.();
          setInput("");
          setPendingImages([]);
          break;
        case "attach":
          fileInputRef.current?.click();
          break;
        case "quick_action":
          console.log("快捷指令功能开发中...");
          break;
        case "translate":
          console.log("翻译功能开发中...");
          break;
        case "fullscreen":
          setIsFullscreen((prev) => !prev);
          break;
        default:
          break;
      }
    },
    [setInput, onClearMessages],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const base64Data = base64.split(",")[1];
            setPendingImages((prev) => [
              ...prev,
              {
                data: base64Data,
                mediaType: file.type,
              },
            ]);
          };
          reader.readAsDataURL(file);
        }
      });

      e.target.value = "";
    },
    [],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const base64Data = base64.split(",")[1];
            setPendingImages((prev) => [
              ...prev,
              {
                data: base64Data,
                mediaType: item.type,
              },
            ]);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const base64Data = base64.split(",")[1];
          setPendingImages((prev) => [
            ...prev,
            {
              data: base64Data,
              mediaType: file.type,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() && pendingImages.length === 0) return;
    const webSearch = activeTools["web_search"] || false;
    const thinking = activeTools["thinking"] || false;
    onSend(
      pendingImages.length > 0 ? pendingImages : undefined,
      webSearch,
      thinking,
    );
    setPendingImages([]);
  }, [input, pendingImages, onSend, activeTools]);

  const handleToggleTaskFiles = useCallback(() => {
    onToggleTaskFiles?.();
  }, [onToggleTaskFiles]);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        isFullscreen ? "fixed inset-0 z-50 bg-background p-4 flex flex-col" : ""
      )}
    >
      {/* 任务文件区域 - 在输入框上方 */}
      {taskFiles.length > 0 && (
        <div className="flex justify-end py-0 px-4.5 pb-2 w-full max-w-[900px] mx-auto">
          <div className="relative">
            {/* 任务文件按钮 */}
            <button
              onClick={handleToggleTaskFiles}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
                "bg-background border border-border text-muted-foreground",
                "hover:border-primary/50 hover:text-foreground transition-all cursor-pointer",
                taskFilesExpanded && "border-primary text-foreground bg-primary/5"
              )}
              data-task-files-trigger
            >
              <FolderOpen size={14} />
              任务文件
              <span className="font-medium">({taskFiles.length})</span>
              <span
                className={cn(
                  "flex items-center transition-transform",
                  taskFilesExpanded ? "rotate-0" : "rotate-180"
                )}
              >
                <ChevronUp size={14} />
              </span>
            </button>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      <div className={cn(isFullscreen ? "flex-1 flex flex-col" : "px-4.5 pb-4.5 w-full max-w-[900px] mx-auto")}>
        <InputbarCore
          text={input}
          setText={setInput}
          onSend={handleSend}
          onStop={onStop}
          isLoading={isLoading}
          disabled={disabled}
          onToolClick={handleToolClick}
          activeTools={activeTools}
          pendingImages={pendingImages}
          onRemoveImage={handleRemoveImage}
          onPaste={handlePaste}
          isFullscreen={isFullscreen}
        />
      </div>
    </div>
  );
};

export default InputBar;