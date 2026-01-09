/**
 * @file input.tsx
 * @description 输入框组件，基于 shadcn-ui v4 实现
 * @module components/ui/input
 * 
 * 更新内容（v4）：
 * - 使用函数组件
 * - 添加 data-slot 属性
 * - 更新样式：h-9、shadow-xs、focus-visible:ring-[3px]
 * - 添加 selection 样式
 * - 添加 aria-invalid 状态样式
 * - 优化 file input 样式
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
