/**
 * @file field.tsx
 * @description 表单字段组件，基于 shadcn-ui v4 实现
 * @module components/ui/field
 * 
 * 用于构建复杂表单的组件，支持与各种表单库集成。
 * 包含 Field、FieldLabel、FieldDescription、FieldError、FieldSet 等子组件。
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal"
}) {
  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      className={cn(
        "grid gap-2",
        orientation === "horizontal" && "grid-cols-[auto_1fr] items-center",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-sm/relaxed",
        className
      )}
      {...props}
    />
  )
}

function FieldError({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-error"
      className={cn(
        "text-destructive text-sm",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "grid gap-4",
        className
      )}
      {...props}
    />
  )
}

function FieldSet({
  className,
  ...props
}: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="fieldset"
      className={cn(
        "grid gap-2 rounded-lg border p-4",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"legend"> & {
  variant?: "default" | "label"
}) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "text-sm",
        variant === "default" && "font-semibold",
        variant === "label" && "font-medium",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      className={cn(
        "my-4 h-px bg-border",
        className
      )}
      {...props}
    />
  )
}

function FieldContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "grid gap-1.5",
        className
      )}
      {...props}
    />
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldSeparator,
  FieldContent,
}