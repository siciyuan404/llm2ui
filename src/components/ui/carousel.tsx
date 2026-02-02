/**
 * @file carousel.tsx
 * @description 轮播组件，基于 shadcn-ui v4 实现
 * @module components/ui/carousel
 * 
 * 用于创建可滚动的轮播内容。
 * 注意：此组件需要安装 embla-carousel-react 依赖包。
 */

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Carousel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="carousel"
      className={cn(
        "relative w-full overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function CarouselContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="carousel-content"
      className={cn(
        "flex gap-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={cn(
        "absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0",
        className
      )}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0",
        className
      )}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

function CarouselDots({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="carousel-dots"
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2",
        className
      )}
      {...props}
    />
  )
}

function CarouselDot({
  className,
  active = false,
  ...props
}: React.ComponentProps<"button"> & {
  active?: boolean
}) {
  return (
    <button
      data-slot="carousel-dot"
      data-active={active}
      className={cn(
        "h-2 w-2 rounded-full transition-all",
        active ? "bg-primary w-8" : "bg-muted-foreground/30",
        className
      )}
      {...props}
    />
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselDot,
}