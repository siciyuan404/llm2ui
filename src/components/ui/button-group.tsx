/**
 * @file button-group.tsx
 * @description 按钮组组件，基于 shadcn-ui v4 实现
 * @module components/ui/button-group
 * 
 * 用于将相关按钮组合在一起，提供一致的样式和布局。
 * 支持嵌套按钮组、分割按钮模式以及与输入框的组合。
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function ButtonGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="button-group"
      className={cn(
        "inline-flex items-center gap-1 [&>[data-slot=button-group]]:rounded-r-none [&>[data-slot=button-group]]:border-r-0 first:[&>[data-slot=button-group]]:rounded-l-md last:[&>[data-slot=button-group]]:rounded-r-md",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="button-group-text"
      className={cn(
        "text-muted-foreground text-sm/relaxed",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="button-group-separator"
      className={cn(
        "w-px bg-border",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupText,
  ButtonGroupSeparator,
}