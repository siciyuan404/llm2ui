/**
 * @file streaming-text.tsx
 * @description 流式文本组件，实现逐字符打字机效果
 * @module components/ui/streaming-text
 * 
 * 借鉴自 proxycast StreamingRenderer 组件
 * 用于 AI 响应的流式展示，支持光标动画
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface StreamingCursorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 光标颜色 */
  color?: string
}

/**
 * 流式光标组件
 */
function StreamingCursor({ className, color, ...props }: StreamingCursorProps) {
  return (
    <span
      data-slot="streaming-cursor"
      className={cn(
        "inline-block w-0.5 h-[1em] bg-primary ml-0.5 align-text-bottom animate-pulse",
        className
      )}
      style={{ 
        animationDuration: "1s",
        backgroundColor: color,
      }}
      {...props}
    />
  )
}

interface StreamingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 目标文本（完整内容） */
  text: string
  /** 是否正在流式输出 */
  isStreaming?: boolean
  /** 是否显示光标 */
  showCursor?: boolean
  /** 每个字符的渲染间隔（毫秒），默认 12ms */
  charInterval?: number
  /** 渲染函数，用于自定义文本渲染（如 Markdown） */
  renderText?: (text: string) => React.ReactNode
}

/**
 * 流式文本组件
 *
 * 实现逐字符平滑显示效果，类似 ChatGPT/Claude 的打字机效果。
 * 当流式结束时，立即显示完整文本。
 */
function StreamingText({
  text,
  isStreaming = false,
  showCursor = true,
  charInterval = 12,
  renderText,
  className,
  ...props
}: StreamingTextProps) {
  const [displayText, setDisplayText] = React.useState("")
  const displayIndexRef = React.useRef(0)
  const animationRef = React.useRef<number | null>(null)
  const prevTextRef = React.useRef("")

  React.useEffect(() => {
    // 如果不是流式输出，直接显示完整文本
    if (!isStreaming) {
      setDisplayText(text)
      displayIndexRef.current = text.length
      prevTextRef.current = text
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    // 检测文本是否有新增
    if (text.length <= prevTextRef.current.length) {
      prevTextRef.current = text
      return
    }

    prevTextRef.current = text

    // 如果已经有动画在运行，让它继续
    if (animationRef.current !== null) {
      return
    }

    let lastTime = 0

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime
      const elapsed = currentTime - lastTime

      if (elapsed >= charInterval) {
        // 计算这一帧应该显示多少个字符
        const charsToAdd = Math.max(1, Math.floor(elapsed / charInterval))
        const newIndex = Math.min(
          displayIndexRef.current + charsToAdd,
          text.length
        )

        if (newIndex > displayIndexRef.current) {
          displayIndexRef.current = newIndex
          setDisplayText(text.slice(0, newIndex))
        }

        lastTime = currentTime
      }

      // 继续动画直到追上目标
      if (displayIndexRef.current < text.length) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        animationRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [text, isStreaming, charInterval])

  // 组件卸载时清理
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const shouldShowCursor =
    isStreaming && showCursor && displayIndexRef.current < text.length

  const renderedContent = renderText ? renderText(displayText) : displayText

  return (
    <div
      data-slot="streaming-text"
      data-streaming={isStreaming}
      className={cn("relative", className)}
      {...props}
    >
      {renderedContent}
      {shouldShowCursor && <StreamingCursor />}
    </div>
  )
}

export { StreamingText, StreamingCursor }
export type { StreamingTextProps, StreamingCursorProps }
