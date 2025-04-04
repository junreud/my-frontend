"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"
import type { DayClickEventHandler } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

//
// CalendarProps 정의
// ------------------------------------------------------------
// 1) Omit으로 "mode"와 "selected"를 제거 (항상 range + DateRange만 쓰기 위함)
// 2) 필요한 경우 footer도 따로 받을 수 있게 추가
//
export interface CalendarProps
  extends Omit<React.ComponentProps<typeof DayPicker>, "mode" | "selected"> {
  /**
   * 선택 완료 시 (두 번째 클릭 후) 부모로 range를 넘겨줄 콜백
   */
  onRangeChange?: (range: DateRange | undefined) => void

  /**
   * "두 번 클릭"으로 range를 고정하는 모드
   */
  alternatingMode?: boolean

  /**
   * 이미 선택된 range를 컨트롤하고 싶다면 전달
   * (ex. { from: Date, to: Date } or undefined)
   */
  selected?: DateRange

  /**
   * DayPicker 기본 footer 대신 사용할 커스텀 footer
   */
  footer?: React.ReactNode
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onRangeChange,
  alternatingMode = false,
  //
  // DayPicker의 다른 props 중에서 우리가 override 가능하도록 남겨둠
  // 단, "selected"와 "mode"는 Omit 처리했으므로 여기엔 없음
  //
  footer,
  selected,
  ...props
}: CalendarProps) {
  // 1) 클릭 상태 ("start" or "end")
  const [selectingState, setSelectingState] = React.useState<"start" | "end">(
    "start"
  )

  // 2) range가 현재 진행 중일 때 표시할 내부 상태
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>(
    selected
  )

  // ref로 현재 클릭 상태 추적 (비동기 업데이트 문제 해결용)
  const currentSelectingState = React.useRef<"start" | "end">("start")

  React.useEffect(() => {
    currentSelectingState.current = selectingState
  }, [selectingState])

  // 외부에서 selected 값이 바뀌면 내부 상태도 싱크
  React.useEffect(() => {
    setInternalRange(selected)
  }, [selected])

  // DayPicker에서 날짜 클릭 시
  const handleDayClick: DayClickEventHandler = (day, modifiers, e) => {
    // alternatingMode 꺼져 있으면 원래 DayPicker의 onDayClick만 호출
    if (!alternatingMode) {
      props.onDayClick?.(day, modifiers, e)
      return
    }

    // 비활성화된 날짜는 선택 불가
    if (modifiers.disabled) return

    // 1) 첫 번째 클릭 → 시작일
    if (currentSelectingState.current === "start") {
      setInternalRange({ from: day, to: undefined })
      setSelectingState("end")
      currentSelectingState.current = "end"
    }
    // 2) 두 번째 클릭 → 종료일
    else {
      const finalRange = {
        from: internalRange?.from,
        to: day,
      }
      // 부모에게 변경사항 알림
      onRangeChange?.(finalRange)

      // 내부 range는 초기화 (다음 클릭은 다시 start)
      setInternalRange(undefined)
      setSelectingState("start")
      currentSelectingState.current = "start"
    }
  }

  return (
    <DayPicker
      // 항상 range 모드
      mode="range"
      // 클릭 중이면 internalRange로 하이라이트, 아니면 selected
      selected={alternatingMode ? internalRange : selected}
      onDayClick={handleDayClick}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // 아래는 Tailwind UI 스타일링 예시
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has(>.day-range-end)]:rounded-r-md",
          "[&:has(>.day-range-start)]:rounded-l-md",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:!bg-accent/50 aria-selected:!text-accent-foreground hover:!bg-accent/70 hover:!text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...iconProps }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...iconProps} />
        ),
        IconRight: ({ className, ...iconProps }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...iconProps} />
        ),
      }}
      // alternatingMode일 때는 footer에 안내 문구
      footer={
        alternatingMode ? (
          <div className="p-2 text-xs text-center">
            {selectingState === "start" ? (
              <p className="text-blue-600 font-medium">시작일을 선택하세요</p>
            ) : (
              <p className="text-green-600 font-medium">종료일을 선택하세요</p>
            )}
          </div>
        ) : (
          footer
        )
      }
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
export type { DateRange }