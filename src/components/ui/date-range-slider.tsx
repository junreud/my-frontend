"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface DateRangeSliderProps {
  label?: string
  showValue?: boolean
  valuePrefix?: string
  valueSuffix?: string
  min?: number
  max?: number
  step?: number
  className?: string
  defaultValue?: number[]
  value?: number[]
  formatValue?: (value: number) => string
  onValueChange?: (values: number[]) => void
}

const DateRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DateRangeSliderProps
>(({ 
  className, 
  label, 
  showValue = true, 
  valuePrefix = "", 
  valueSuffix = "일 전", 
  min = 0, 
  max = 30, 
  step = 1,
  value,
  defaultValue,
  onValueChange,
  formatValue = (value) => value.toString(),
}, ref) => {
  // Default to showing the first value (for now we only support single thumb)
  const displayValue = value ? value[0] : defaultValue ? defaultValue[0] : min

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        {label && <div className="text-sm font-medium">{label}</div>}
        {showValue && (
          <div className="text-sm font-medium">
            {valuePrefix}{formatValue(displayValue)}{valueSuffix}
          </div>
        )}
      </div>
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  )
})

DateRangeSlider.displayName = "DateRangeSlider"

export { DateRangeSlider }
