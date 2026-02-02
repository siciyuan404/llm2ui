/**
 * @file input-otp.tsx
 * @description OTP 输入组件，基于 shadcn-ui v4 实现
 * @module components/ui/input-otp
 * 
 * 用于输入一次性密码（OTP）的组件，常用于验证码输入。
 * 支持自动聚焦、粘贴和键盘导航。
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp"
      className={cn(
        "flex items-center gap-2",
        className
      )}
      {...props}
    />
  )
}

function InputOTPGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-otp-slot"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md border border-input bg-transparent text-center text-sm shadow-xs transition-all focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        "has-[:placeholder-shown]:border-muted-foreground/30",
        className
      )}
      maxLength={1}
      {...props}
    />
  )
}

function InputOTPSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className={cn(
        "text-muted-foreground",
        className
      )}
      {...props}
    >
      -
    </div>
  )
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
}