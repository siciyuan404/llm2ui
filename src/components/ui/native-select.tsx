/**
 * @file native-select.tsx
 * @description 原生选择组件，基于 shadcn-ui v4 实现
 * @module components/ui/native-select
 * 
 * 使用原生 HTML select 元素的选择组件，提供更好的性能和可访问性。
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] [&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

function NativeSelectItem({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function NativeSelectGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-group"
      className={cn(
        "pointer-events-none p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function NativeSelectLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="native-select-label"
      className={cn(
        "font-medium",
        className
      )}
      {...props}
    />
  )
}

export {
  NativeSelect,
  NativeSelectItem,
  NativeSelectGroup,
  NativeSelectLabel,
}