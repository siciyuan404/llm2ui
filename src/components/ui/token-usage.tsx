/**
 * @file token-usage.tsx
 * @description Token 使用量显示组件，用于展示 AI 响应的 token 统计
 * @module components/ui/token-usage
 * 
 * 借鉴自 proxycast TokenUsageDisplay 组件
 */

import * as React from "react"
import { Coins } from "lucide-react"

import { cn } from "@/lib/utils"

interface TokenUsage {
  /** 输入 token 数量 */
  inputTokens: number
  /** 输出 token 数量 */
  outputTokens: number
  /** 总 token 数量（可选，默认自动计算） */
  totalTokens?: number
}

interface TokenUsageDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Token 使用量数据 */
  usage: TokenUsage
  /** 是否显示图标 */
  showIcon?: boolean
  /** 是否显示总计 */
  showTotal?: boolean
  /** 紧凑模式 */
  compact?: boolean
}

/**
 * Token 使用量显示组件
 *
 * 显示输入/输出 token 数量
 */
function TokenUsageDisplay({
  usage,
  showIcon = true,
  showTotal = true,
  compact = false,
  className,
  ...props
}: TokenUsageDisplayProps) {
  const total = usage.totalTokens ?? (usage.inputTokens + usage.outputTokens)

  const formatNumber = (num: number) => {
    if (compact && num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toLocaleString()
  }

  return (
    <div
      data-slot="token-usage"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md",
        "bg-muted/50 text-muted-foreground",
        "text-[11px] font-mono",
        className
      )}
      {...props}
    >
      {showIcon && <Coins className="h-3 w-3 opacity-70" />}
      <span>{formatNumber(usage.inputTokens)} in</span>
      <span className="opacity-50">/</span>
      <span>{formatNumber(usage.outputTokens)} out</span>
      {showTotal && (
        <>
          <span className="opacity-50">·</span>
          <span>{formatNumber(total)} total</span>
        </>
      )}
    </div>
  )
}

export { TokenUsageDisplay }
export type { TokenUsageDisplayProps, TokenUsage }
