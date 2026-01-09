/**
 * @file confirm-dialog.tsx
 * @description 确认对话框组件，用于危险操作或重要决策的二次确认
 * @module components/ui/confirm-dialog
 * 
 * 借鉴自 proxycast ConfirmDialog 组件
 * 支持 danger/warning/default 三种变体
 */

import * as React from "react"
import { AlertTriangle, Info, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"

type ConfirmVariant = "default" | "danger" | "warning"

const variantStyles: Record<ConfirmVariant, {
  icon: string
  button: string
  IconComponent: typeof AlertTriangle
}> = {
  danger: {
    icon: "text-red-500",
    button: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-600",
    IconComponent: AlertTriangle,
  },
  warning: {
    icon: "text-yellow-500",
    button: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-600",
    IconComponent: AlertCircle,
  },
  default: {
    icon: "text-primary",
    button: "bg-primary hover:bg-primary/90 text-primary-foreground",
    IconComponent: Info,
  },
}

interface ConfirmDialogProps {
  /** 是否打开 */
  open: boolean
  /** 打开状态变化回调 */
  onOpenChange?: (open: boolean) => void
  /** 标题 */
  title?: string
  /** 描述信息 */
  description: string
  /** 确认按钮文字 */
  confirmText?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 变体样式 */
  variant?: ConfirmVariant
  /** 确认回调 */
  onConfirm: () => void
  /** 取消回调 */
  onCancel?: () => void
  /** 是否显示图标 */
  showIcon?: boolean
  /** 确认按钮是否禁用 */
  confirmDisabled?: boolean
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
}

function ConfirmDialog({
  open,
  onOpenChange,
  title = "确认操作",
  description,
  confirmText = "确定",
  cancelText = "取消",
  variant = "danger",
  onConfirm,
  onCancel,
  showIcon = true,
  confirmDisabled = false,
  confirmLoading = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant]
  const { IconComponent } = styles

  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            {showIcon && (
              <div className={cn("mt-0.5 shrink-0", styles.icon)}>
                <IconComponent className="h-6 w-6" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmDisabled || confirmLoading}
            className={cn(styles.button)}
          >
            {confirmLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                处理中...
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog }
export type { ConfirmDialogProps, ConfirmVariant }
