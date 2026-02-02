
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Trash2, FileText } from "lucide-react"

interface ContextProgressProps {
  used: number
  total: number
  onClear?: () => void
  onCompress?: () => void
  className?: string
}

export function ContextProgress({ used, total, onClear, onCompress, className }: ContextProgressProps) {
  const percentage = Math.min((used / total) * 100, 100)
  const circumference = 2 * Math.PI * 16
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}W`
    }
    return num.toString()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative flex items-center justify-center w-5 h-5 rounded-full",
            "text-slate-600 hover:text-slate-900 transition-all",
            "hover:scale-105",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            className
          )}
        >
          <svg width={20} height={20} viewBox="0 0 36 36" className="transform -rotate-90">
            <circle
              cx={18}
              cy={18}
              r={16}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              className="text-slate-200"
            />
            <circle
              cx={18}
              cy={18}
              r={16}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-300",
                percentage > 80 ? "text-red-500" : percentage > 60 ? "text-yellow-500" : "text-blue-500"
              )}
            />
          </svg>
          <span className="absolute text-[8px] font-medium leading-none">{Math.round(percentage)}%</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" side="top" className="w-56 p-3 shadow-lg rounded-lg bg-white border border-gray-200">
        <div className="mb-2 text-center">
          <div className="text-xs text-gray-500 mb-1">上下文</div>
          <div className="text-sm text-gray-600 font-medium">
            {formatNumber(used)}/{formatNumber(total)}
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          {onClear && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="flex-1 gap-1 text-xs py-1 px-2 h-auto"
            >
              <Trash2 size={12} />
              清空
            </Button>
          )}
          {onCompress && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCompress}
              className="flex-1 gap-1 text-xs py-1 px-2 h-auto"
            >
              <FileText size={12} />
              压缩
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
