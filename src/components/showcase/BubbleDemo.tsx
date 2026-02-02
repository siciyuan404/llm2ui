import * as React from "react"
import {
  Bubble,
  BubbleContent,
  BubbleProgressTrigger,
} from "@/components/ui/bubble"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function BubbleDemo() {
  const [progress1, setProgress1] = React.useState(75)
  const progress2 = 45
  const progress3 = 90

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">泡泡组件示例</h2>
        <p className="text-muted-foreground mb-6">
          点击圆形进度条可以展开泡泡内容
        </p>
      </div>

      <div className="flex flex-wrap gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>任务进度</CardTitle>
            <CardDescription>点击查看详细信息</CardDescription>
          </CardHeader>
          <CardContent>
            <Bubble>
              <BubbleProgressTrigger progress={progress1} size={48} strokeWidth={4}>
                <span className="text-xs font-bold">{progress1}%</span>
              </BubbleProgressTrigger>
              <BubbleContent side="top">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">当前任务</span>
                    <Badge variant="secondary">进行中</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    完成度: {progress1}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    预计剩余时间: 2小时
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      暂停
                    </Button>
                    <Button size="sm" className="flex-1">
                      继续
                    </Button>
                  </div>
                </div>
              </BubbleContent>
            </Bubble>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>下载进度</CardTitle>
            <CardDescription>迷你圆形进度条</CardDescription>
          </CardHeader>
          <CardContent>
            <Bubble>
              <BubbleProgressTrigger
                progress={progress2}
                size={32}
                strokeWidth={3}
                color="hsl(var(--success))"
                backgroundColor="hsl(var(--muted))"
              >
                <span className="text-[10px] font-bold">{progress2}%</span>
              </BubbleProgressTrigger>
              <BubbleContent side="right">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">下载文件</span>
                    <Badge>活跃</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    已下载: 2.3GB / 5.0GB
                  </div>
                  <div className="text-xs text-muted-foreground">
                    速度: 5.2 MB/s
                  </div>
                </div>
              </BubbleContent>
            </Bubble>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>大尺寸圆形进度条</CardDescription>
          </CardHeader>
          <CardContent>
            <Bubble>
              <BubbleProgressTrigger
                progress={progress3}
                size={64}
                strokeWidth={5}
                color="hsl(var(--destructive))"
                backgroundColor="hsl(var(--secondary))"
              >
                <span className="text-sm font-bold">{progress3}%</span>
              </BubbleProgressTrigger>
              <BubbleContent side="bottom" align="end">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">系统负载</span>
                    <Badge variant="destructive">高负载</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    CPU: {progress3}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    内存使用: 4.2GB / 8GB
                  </div>
                  <div className="text-xs text-muted-foreground">
                    磁盘: 128GB / 256GB
                  </div>
                  <Button size="sm" variant="destructive" className="w-full mt-3">
                    查看详情
                  </Button>
                </div>
              </BubbleContent>
            </Bubble>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>纯圆形进度条</CardTitle>
            <CardDescription>不带弹出内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <div
                className="relative inline-flex items-center justify-center"
                style={{ width: 32, height: 32 }}
              >
                <svg width={32} height={32} viewBox="0 0 32 32" className="transform -rotate-90">
                  <circle
                    cx={16}
                    cy={16}
                    r={14.5}
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={3}
                  />
                  <circle
                    cx={16}
                    cy={16}
                    r={14.5}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={91.11}
                    strokeDashoffset={22.78}
                    className="transition-all duration-300 ease-in-out"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold">75%</span>
              </div>
              <span className="text-sm text-muted-foreground">迷你 (32px)</span>
            </div>
            <div className="flex gap-4 items-center">
              <div
                className="relative inline-flex items-center justify-center"
                style={{ width: 48, height: 48 }}
              >
                <svg width={48} height={48} viewBox="0 0 48 48" className="transform -rotate-90">
                  <circle
                    cx={24}
                    cy={24}
                    r={22}
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={4}
                  />
                  <circle
                    cx={24}
                    cy={24}
                    r={22}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeDasharray={138.23}
                    strokeDashoffset={34.56}
                    className="transition-all duration-300 ease-in-out"
                  />
                </svg>
                <span className="absolute text-xs font-bold">75%</span>
              </div>
              <span className="text-sm text-muted-foreground">标准 (48px)</span>
            </div>
            <div className="flex gap-4 items-center">
              <div
                className="relative inline-flex items-center justify-center"
                style={{ width: 64, height: 64 }}
              >
                <svg width={64} height={64} viewBox="0 0 64 64" className="transform -rotate-90">
                  <circle
                    cx={32}
                    cy={32}
                    r={29.5}
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={5}
                  />
                  <circle
                    cx={32}
                    cy={32}
                    r={29.5}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeDasharray={185.35}
                    strokeDashoffset={46.34}
                    className="transition-all duration-300 ease-in-out"
                  />
                </svg>
                <span className="absolute text-sm font-bold">75%</span>
              </div>
              <span className="text-sm text-muted-foreground">大尺寸 (64px)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>动态进度示例</CardTitle>
          <CardDescription>点击按钮更新进度</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Bubble>
              <BubbleProgressTrigger
                progress={progress1}
                size={48}
                strokeWidth={4}
              >
                <span className="text-xs font-bold">{progress1}%</span>
              </BubbleProgressTrigger>
              <BubbleContent>
                <div className="space-y-2">
                  <div className="font-semibold">进度详情</div>
                  <div className="text-sm text-muted-foreground">
                    当前进度: {progress1}%
                  </div>
                </div>
              </BubbleContent>
            </Bubble>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setProgress1(Math.max(0, progress1 - 10))}
              >
                -10%
              </Button>
              <Button
                size="sm"
                onClick={() => setProgress1(Math.min(100, progress1 + 10))}
              >
                +10%
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
