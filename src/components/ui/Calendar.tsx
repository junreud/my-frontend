"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"
import type { DayModifiers as DayClickEventHandlerMod } from "react-day-picker"; // 추가
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onRangeChange?: (range: DateRange | undefined) => void;
  alternatingMode?: boolean;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onRangeChange,
  alternatingMode = false,
  ...props
}: CalendarProps) {
  // 선택 모드 상태 관리
  const [selectingState, setSelectingState] = React.useState<"start" | "end">("start");
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>(
    props.selected as DateRange | undefined
  );
  
  // ref로 현재 선택 상태 추적 (비동기 업데이트 문제 해결)
  const currentSelectingState = React.useRef<"start" | "end">("start");
  
  // selectingState가 변경될 때 ref도 업데이트
  React.useEffect(() => {
    currentSelectingState.current = selectingState;
  }, [selectingState]);

  // 외부에서 전달된 selected 값이 변경될 때 내부 상태 업데이트
  React.useEffect(() => {
    if (props.mode === "range" && props.selected) {
      setInternalRange(props.selected as DateRange | undefined);
    }
  }, [props.selected, props.mode]);

  // 날짜 클릭 핸들러
  const handleDayClick = (
    day: Date,
    modifiers: DayClickEventHandlerMod,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    // 일반 모드일 경우 기본 핸들러 호출
    if (!alternatingMode) {
      props.onDayClick?.(day, modifiers, e);
      return;
    }
  
    // 비활성화된 날짜는 선택 불가
    if (modifiers.disabled) return;

    if (currentSelectingState.current === "start") {
      // 첫 번째 클릭: 시작일
      const newRange = { from: day, to: undefined };
      setInternalRange(newRange);
      currentSelectingState.current = "end";
      setSelectingState("end");
    } else {
      // 두 번째 클릭: 종료일
      const finalRange = { from: internalRange?.from, to: day };
      onRangeChange?.(finalRange);

      // 초기화 → 세 번째 클릭은 다시 시작일
      setInternalRange(undefined);
      currentSelectingState.current = "start";
      setSelectingState("start");
    }
  };
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
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
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
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
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      // 만약 새 range가 진행 중이면 internalRange로 하이라이트, 없으면 finalRange를 표시
      selected={alternatingMode ? internalRange : props.selected}
      onDayClick={handleDayClick}
      mode="range" // 항상 범위 선택 모드 적용
      {...props}
      footer={
        alternatingMode ? (
          <div className="p-2 text-xs text-center">
            {selectingState === "start" ? (
              <p className="text-blue-600 font-medium">시작일을 선택하세요</p>
            ) : (
              <p className="text-green-600 font-medium">종료일을 선택하세요</p>
            )}
          </div>
        ) : props.footer
      }
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
export type { DateRange }