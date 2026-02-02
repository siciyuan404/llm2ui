/**
 * @file item.tsx
 * @description 列表项组件，基于 shadcn-ui v4 实现
 * @module components/ui/item
 * 
 * 用于显示列表项、卡片等内容。
 * 支持多种变体和交互状态。
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function Item({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item"
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function ItemHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex flex-1 flex-col gap-1",
        className
      )}
      {...props}
    />
  )
}

function ItemTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "font-semibold leading-none",
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-description"
      className={cn(
        "text-muted-foreground text-sm/relaxed",
        className
      )}
      {...props}
    />
  )
}

function ItemContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex flex-col gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-media"
      className={cn(
        "flex shrink-0 items-center justify-center",
        className
      )}
      {...props}
    />
  )
}

function ItemAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-action"
      className={cn(
        "flex shrink-0 items-center gap-1",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex items-center gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemHeader,
  ItemTitle,
  ItemDescription,
  ItemContent,
  ItemMedia,
  ItemAction,
  ItemFooter,
}