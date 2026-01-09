/**
 * @file help-tip.tsx
 * @description 可折叠帮助提示组件，用于显示帮助信息和使用说明
 * @module components/ui/help-tip
 * 
 * 借鉴自 proxycast HelpTip 组件
 * 支持多种颜色变体，可展开/折叠
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown, ChevronUp, HelpCircle, Lightbulb, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const helpTipVariants = cva(
  "rounded-lg border mb-2",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/30",
        blue: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
        amber: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
        green: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30",
        purple: "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const titleColorMap = {
  default: "text-foreground",
  blue: "text-blue-800 dark:text-blue-300",
  amber: "text-amber-800 dark:text-amber-300",
  green: "text-green-800 dark:text-green-300",
  purple: "text-purple-800 dark:text-purple-300",
}

const iconColorMap = {
  default: "text-muted-foreground",
  blue: "text-blue-600 dark:text-blue-400",
  amber: "text-amber-600 dark:text-amber-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
}

const iconMap = {
  help: HelpCircle,
  tip: Lightbulb,
  info: Info,
}

interface HelpTipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof helpTipVariants> {
  /** 标题 */
  title: string
  /** 默认是否展开 */
  defaultOpen?: boolean
  /** 图标类型 */
  iconType?: "help" | "tip" | "info"
  /** 自定义图标 */
  icon?: React.ReactNode
}

function HelpTip({
  className,
  variant = "default",
  title,
  defaultOpen = false,
  iconType = "help",
  icon,
  children,
  ...props
}: HelpTipProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const IconComponent = iconMap[iconType]
  const titleColor = titleColorMap[variant || "default"]
  const iconColor = iconColorMap[variant || "default"]

  return (
    <div
      data-slot="help-tip"
      data-variant={variant}
      data-state={isOpen ? "open" : "closed"}
      className={cn(helpTipVariants({ variant }), className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className={cn("shrink-0", iconColor)}>
            {icon || <IconComponent className="h-4 w-4" />}
          </span>
          <span className={cn("text-sm font-medium", titleColor)}>{title}</span>
        </div>
        <span className={iconColor}>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="px-3 pb-4 pt-1 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  )
}

export { HelpTip, helpTipVariants }
export type { HelpTipProps }
