/**
 * @file spinner.tsx
 * @description 加载指示器组件，基于 shadcn-ui v4 实现
 * @module components/ui/spinner
 * 
 * 用于显示加载状态的旋转动画图标。
 */

import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
