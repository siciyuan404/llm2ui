/**
 * @file setting-row.tsx
 * @description 设置行组件，用于表单项的水平布局
 * @module components/ui/setting-row
 *
 * 提供标签 + 控件的水平布局，支持帮助提示、描述文本等。
 * 适用于设置面板中的各类表单项。
 */

import * as React from "react"
import { HelpCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SettingRowProps {
  /** 标签文本 */
  label: string
  /** 帮助提示文本 */
  helpText?: string
  /** 描述文本（显示在标签下方） */
  description?: string
  /** 控件内容 */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 标签区域自定义类名 */
  labelClassName?: string
  /** 控件区域自定义类名 */
  controlClassName?: string
  /** 是否禁用 */
  disabled?: boolean
}

function SettingRow({
  label,
  helpText,
  description,
  children,
  className,
  labelClassName,
  controlClassName,
  disabled,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-2",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <div className={cn("flex flex-col gap-0.5", labelClassName)}>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-foreground">{label}</span>
          {helpText && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground/70 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs">{helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {description && (
          <span className="text-[11px] text-muted-foreground">{description}</span>
        )}
      </div>
      <div className={cn("flex-shrink-0", controlClassName)}>{children}</div>
    </div>
  )
}

interface SettingRowGroupProps {
  /** 子内容（多个 SettingRow） */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
}

function SettingRowGroup({ children, className }: SettingRowGroupProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {children}
    </div>
  )
}

export { SettingRow, SettingRowGroup }
export type { SettingRowProps, SettingRowGroupProps }
