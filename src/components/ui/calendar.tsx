/**
 * @file calendar.tsx
 * @description 日历组件，基于 shadcn-ui v4 实现
 * @module components/ui/calendar
 * 
 * 用于显示和选择日期的日历组件。
 * 注意：此组件需要安装 @radix-ui/react-calendar 依赖包。
 */

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Calendar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar"
      className={cn(
        "p-3",
        className
      )}
      {...props}
    />
  )
}

function CalendarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar-header"
      className={cn(
        "flex items-center justify-between px-2",
        className
      )}
      {...props}
    />
  )
}

function CalendarTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar-title"
      className={cn(
        "text-sm font-semibold",
        className
      )}
      {...props}
    />
  )
}

function CalendarPrevButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        className
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous month</span>
    </Button>
  )
}

function CalendarNextButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        className
      )}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next month</span>
    </Button>
  )
}

function CalendarBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar-body"
      className={cn(
        "mt-4",
        className
      )}
      {...props}
    />
  )
}

function CalendarGrid({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar-grid"
      className={cn(
        "grid grid-cols-7 gap-1",
        className
      )}
      {...props}
    />
  )
}

function CalendarDayHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar-day-header"
      className={cn(
        "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        className
      )}
      {...props}
    />
  )
}

function CalendarDay({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="calendar-day"
      className={cn(
        "relative flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 outline-hidden hover:bg-accent hover:text-accent-foreground selected:bg-primary selected:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Calendar,
  CalendarHeader,
  CalendarTitle,
  CalendarPrevButton,
  CalendarNextButton,
  CalendarBody,
  CalendarGrid,
  CalendarDayHeader,
  CalendarDay,
}