/**
 * @file form.tsx
 * @description 表单组件，基于 shadcn-ui v4 实现
 * @module components/ui/form
 * 
 * 用于构建表单的高级组件，支持与各种表单库集成。
 * 基于 Field 组件构建。
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldSeparator,
  FieldContent,
} from "@/components/ui/field"

function Form({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form
      data-slot="form"
      className={cn(
        "space-y-6",
        className
      )}
      {...props}
    />
  )
}

function FormField({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Field
      className={cn(
        "space-y-2",
        className
      )}
      {...props}
    />
  )
}

function FormItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <FieldContent
      className={cn(
        className
      )}
      {...props}
    />
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <FieldLabel
      className={cn(
        className
      )}
      {...props}
    />
  )
}

function FormControl({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-control"
      className={cn(
        className
      )}
      {...props}
    />
  )
}

function FormDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <FieldDescription
      className={cn(
        className
      )}
      {...props}
    />
  )
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <FieldError
      className={cn(
        className
      )}
      {...props}
    >
      {children}
    </FieldError>
  )
}

function FormFieldset({
  className,
  ...props
}: React.ComponentProps<"fieldset">) {
  return (
    <FieldSet
      className={cn(
        className
      )}
      {...props}
    />
  )
}

function FormLegend({
  className,
  ...props
}: React.ComponentProps<"legend">) {
  return (
    <FieldLegend
      className={cn(
        className
      )}
      {...props}
    />
  )
}

function FormFieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <FieldGroup
      className={cn(
        className
      )}
      {...props}
    />
  )
}

function FormFieldSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <FieldSeparator
      className={cn(
        className
      )}
      {...props}
    />
  )
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormFieldset,
  FormLegend,
  FormFieldGroup,
  FormFieldSeparator,
}