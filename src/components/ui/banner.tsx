/**
 * @file banner.tsx
 * @description 横幅提示组件，用于显示重要通知、警告或实验功能提示
 * @module components/ui/banner
 * 
 * 借鉴自 proxycast ExperimentalBanner 组件
 * 支持多种变体：info/warning/success/error/experimental
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, Info, CheckCircle, XCircle, FlaskConical, X } from "lucide-react"

import { cn } from "@/lib/utils"

const bannerVariants = cva(
  "flex items-center gap-2 px-3 py-2 text-xs rounded-md border",
  {
    variants: {
      variant: {
        default: "bg-muted/50 border-border text-foreground",
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-900 dark:text-yellow-300",
        success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900 dark:text-green-300",
        error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300",
        experimental: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/30 dark:border-purple-900 dark:text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  default: Info,
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
  experimental: FlaskConical,
}

interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  /** 是否显示图标 */
  showIcon?: boolean
  /** 是否可关闭 */
  dismissible?: boolean
  /** 关闭回调 */
  onDismiss?: () => void
  /** 自定义图标 */
  icon?: React.ReactNode
}

function Banner({
  className,
  variant = "default",
  showIcon = true,
  dismissible = false,
  onDismiss,
  icon,
  children,
  ...props
}: BannerProps) {
  const IconComponent = iconMap[variant || "default"]

  return (
    <div
      data-slot="banner"
      data-variant={variant}
      className={cn(bannerVariants({ variant }), className)}
      role="alert"
      {...props}
    >
      {showIcon && (
        <span className="shrink-0">
          {icon || <IconComponent className="h-3.5 w-3.5" />}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="关闭"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export { Banner, bannerVariants }
export type { BannerProps }
