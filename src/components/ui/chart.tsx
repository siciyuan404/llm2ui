/**
 * @file chart.tsx
 * @description 图表组件，基于 shadcn-ui v4 实现
 * @module components/ui/chart
 * 
 * 用于显示数据的图表组件。
 * 注意：此组件需要安装 recharts 依赖包。
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function Chart({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart"
      className={cn(
        "w-full h-full",
        className
      )}
      {...props}
    />
  )
}

function ChartTooltip({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        "rounded-lg border bg-background p-3 shadow-md",
        className
      )}
      {...props}
    />
  )
}

function ChartTooltipContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart-tooltip-content"
      className={cn(
        "grid gap-1 text-sm",
        className
      )}
      {...props}
    />
  )
}

function ChartLegend({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart-legend"
      className={cn(
        "flex items-center justify-center gap-4",
        className
      )}
      {...props}
    />
  )
}

function ChartLegendItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart-legend-item"
      className={cn(
        "flex items-center gap-2 text-sm",
        className
      )}
      {...props}
    />
  )
}

function ChartLegendColor({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chart-legend-color"
      className={cn(
        "h-3 w-3 rounded-full",
        className
      )}
      {...props}
    />
  )
}

export {
  Chart,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
  ChartLegendColor,
}