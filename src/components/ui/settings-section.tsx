/**
 * @file settings-section.tsx
 * @description 可折叠的设置分组组件
 * @module components/ui/settings-section
 *
 * 用于构建设置面板的可折叠分组，支持展开/折叠状态管理。
 * 基于 Radix UI Collapsible 构建。
 */

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface SettingsSectionProps {
  /** 分组标题 */
  title: string
  /** 子内容 */
  children: React.ReactNode
  /** 默认是否展开 */
  defaultOpen?: boolean
  /** 受控模式：是否展开 */
  open?: boolean
  /** 受控模式：展开状态变化回调 */
  onOpenChange?: (open: boolean) => void
  /** 自定义类名 */
  className?: string
  /** 标题区域自定义类名 */
  titleClassName?: string
  /** 内容区域自定义类名 */
  contentClassName?: string
  /** 标题前的图标 */
  icon?: React.ReactNode
}

function SettingsSection({
  title,
  children,
  defaultOpen = true,
  open,
  onOpenChange,
  className,
  titleClassName,
  contentClassName,
  icon,
}: SettingsSectionProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn("", className)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-1.5 py-3 px-4 text-xs font-medium",
            "text-muted-foreground hover:text-foreground transition-colors",
            "cursor-pointer select-none",
            titleClassName
          )}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          {icon && <span className="mr-1">{icon}</span>}
          {title}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "px-4 pb-4",
          contentClassName
        )}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface SettingsSectionGroupProps {
  /** 子内容（多个 SettingsSection） */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 是否显示分隔线 */
  showSeparator?: boolean
}

function SettingsSectionGroup({
  children,
  className,
  showSeparator = true,
}: SettingsSectionGroupProps) {
  const childArray = React.Children.toArray(children)

  return (
    <div className={cn("", className)}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {showSeparator && index < childArray.length - 1 && (
            <div className="h-px bg-border" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export { SettingsSection, SettingsSectionGroup }
export type { SettingsSectionProps, SettingsSectionGroupProps }
