/**
 * @file sonner.tsx
 * @description Sonner 通知组件，基于 shadcn-ui v4 实现
 * @module components/ui/sonner
 * 
 * 基于 sonner 库的 Toast 通知组件。
 * 项目已安装 sonner 依赖包。
 */

import * as React from "react"
import { toast as sonnerToast } from "sonner"

function Sonner({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sonner"
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col gap-2",
        className
      )}
      {...props}
    />
  )
}

export { sonnerToast as toast }
export { Sonner }