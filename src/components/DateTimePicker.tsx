"use client"

import * as React from "react"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  date: Date | undefined
  time: string
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
  label: string
  placeholder?: string
}

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  label,
  placeholder = "Pick a date"
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-2">
        {/* Date Picker */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              {date ? format(date, "PPP") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                onDateChange(selectedDate)
                setOpen(false)
              }}
              disabled={(date) => date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        {/* Time Input */}
        <div className="relative">
          <Clock className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full pl-8 h-10"
          />
        </div>
      </div>
    </div>
  )
}