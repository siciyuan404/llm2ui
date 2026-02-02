/**
 * @file settings-panel.tsx
 * @description 设置面板容器组件
 * @module components/ui/settings-panel
 *
 * 提供完整的设置面板布局，包含标题栏、滚动区域和关闭按钮。
 * 可作为侧边栏或弹出面板使用。
 */

import * as React from "react"
import { Settings2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SettingsPanelProps {
  /** 面板标题 */
  title?: string
  /** 标题图标 */
  icon?: React.ReactNode
  /** 子内容 */
  children: React.ReactNode
  /** 关闭回调 */
  onClose?: () => void
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean
  /** 自定义类名 */
  className?: string
  /** 面板宽度 */
  width?: string | number
  /** 标题栏右侧额外内容 */
  headerExtra?: React.ReactNode
}

function SettingsPanel({
  title = "设置",
  icon,
  children,
  onClose,
  showCloseButton = true,
  className,
  width = 300,
  headerExtra,
}: SettingsPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full flex-shrink-0",
        "bg-background border-l border-border",
        className
      )}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon ?? <Settings2 className="h-4 w-4" />}
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          {showCloseButton && onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {children}
      </ScrollArea>
    </div>
  )
}

interface SettingsPanelFooterProps {
  /** 子内容 */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
}

function SettingsPanelFooter({ children, className }: SettingsPanelFooterProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 border-t border-border",
        "flex items-center justify-end gap-2",
        className
      )}
    >
      {children}
    </div>
  )
}

export { SettingsPanel, SettingsPanelFooter }
export type { SettingsPanelProps, SettingsPanelFooterProps }
