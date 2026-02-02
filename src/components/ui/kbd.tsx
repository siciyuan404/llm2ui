/**
 * @file kbd.tsx
 * @description 键盘快捷键组件，基于 shadcn-ui v4 实现
 * @module components/ui/kbd
 * 
 * 用于显示键盘按键或按键组合，常用于快捷键提示。
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function Kbd({
  className,
  ...props
}: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-[0_2px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_2px_0_0_rgba(255,255,255,0.1)]",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="kbd-group"
      className={cn(
        "inline-flex items-center gap-1",
        className
      )}
      {...props}
    />
  )
}

export {
  Kbd,
  KbdGroup,
}