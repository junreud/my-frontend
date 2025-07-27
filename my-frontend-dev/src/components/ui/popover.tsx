"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

// 기본 컴포넌트 직접 사용
const Popover = PopoverPrimitive.Root
Popover.displayName = "Popover"

const PopoverTrigger = PopoverPrimitive.Trigger
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverAnchor = PopoverPrimitive.Anchor
PopoverAnchor.displayName = "PopoverAnchor"

// Content 컴포넌트에서만 disableOutsideClick 기능 구현
interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  disableOutsideClick?: boolean;
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ 
  className, 
  align = "start",
  sideOffset = 4,
  side = "bottom",
  disableOutsideClick,
  style,
  ...props 
}, ref) => {
  // disableOutsideClick이 true일 경우에만 이벤트 처리
  const handleInteractOutside = disableOutsideClick 
    ? (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
      }
    : undefined;

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        side={side}
        style={style}
        onInteractOutside={handleInteractOutside}
        className={cn(
          "z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }