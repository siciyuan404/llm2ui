import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

const Bubble = PopoverPrimitive.Root

const BubbleTrigger = PopoverPrimitive.Trigger

const BubbleContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
BubbleContent.displayName = PopoverPrimitive.Content.displayName

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  progress?: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
  backgroundColor?: string
  children?: React.ReactNode
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      progress = 0,
      size = 32,
      strokeWidth = 3,
      color = "hsl(var(--primary))",
      backgroundColor = "hsl(var(--secondary))",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (progress / 100) * circumference

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        {children && (
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

interface BubbleTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  progress?: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  children?: React.ReactNode
}

const BubbleProgressTrigger = React.forwardRef<HTMLDivElement, BubbleTriggerProps>(
  (
    {
      progress = 0,
      size = 32,
      strokeWidth = 3,
      color = "hsl(var(--primary))",
      backgroundColor = "hsl(var(--secondary))",
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <BubbleTrigger asChild>
        <div
          ref={ref}
          className={cn(
            "cursor-pointer transition-all hover:scale-105 active:scale-95",
            className
          )}
          {...props}
        >
          <CircularProgress
            progress={progress}
            size={size}
            strokeWidth={strokeWidth}
            color={color}
            backgroundColor={backgroundColor}
          >
            {children}
          </CircularProgress>
        </div>
      </BubbleTrigger>
    )
  }
)
BubbleProgressTrigger.displayName = "BubbleProgressTrigger"

export {
  Bubble,
  BubbleTrigger,
  BubbleContent,
  CircularProgress,
  BubbleProgressTrigger,
}
