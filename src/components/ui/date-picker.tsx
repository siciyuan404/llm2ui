/**
 * @file date-picker.tsx
 * @description 日期选择器组件，基于 shadcn-ui v4 实现
 * @module components/ui/date-picker
 * 
 * 用于选择日期的弹出式选择器。
 * 基于 Calendar 和 Popover 组件构建。
 */

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function DatePicker({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [date, setDate] = React.useState<Date>()

  return (
    <div
      data-slot="date-picker"
      className={cn(
        "grid gap-2",
        className
      )}
      {...props}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DatePicker }