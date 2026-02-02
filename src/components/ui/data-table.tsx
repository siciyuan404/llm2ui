/**
 * @file data-table.tsx
 * @description 数据表格组件，基于 shadcn/ui v4 实现
 * @module components/ui/data-table
 * 
 * 用于显示和操作大量数据的表格组件。
 * 基于 Table 组件构建，支持排序、筛选、分页等功能。
 */

import * as React from "react"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function DataTable({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table"
      className={cn(
        "w-full",
        className
      )}
      {...props}
    />
  )
}

function DataTableToolbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-toolbar"
      className={cn(
        "flex items-center justify-between py-4",
        className
      )}
      {...props}
    />
  )
}

function DataTableFilter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-filter"
      className={cn(
        "flex items-center gap-2",
        className
      )}
      {...props}
    />
  )
}

function DataTableActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-actions"
      className={cn(
        "flex items-center gap-2",
        className
      )}
      {...props}
    />
  )
}

function DataTableColumnHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-column-header"
      className={cn(
        "flex items-center gap-2",
        className
      )}
      {...props}
    />
  )
}

function DataTableSortButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 data-[state=open]:bg-accent",
        className
      )}
      {...props}
    >
      <span>Sort</span>
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

function DataTableRowActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-row-actions"
      className={cn(
        "flex items-center justify-end",
        className
      )}
      {...props}
    />
  )
}

function DataTableRowActionsDropdown({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu>) {
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex h-8 w-8 p-0 data-[state=open]:bg-muted",
            className
          )}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Copy</DropdownMenuItem>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  DataTable,
  DataTableToolbar,
  DataTableFilter,
  DataTableActions,
  DataTableColumnHeader,
  DataTableSortButton,
  DataTableRowActions,
  DataTableRowActionsDropdown,
}