// /componenets/ui/popover.tsx

"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

// This is now a custom component that can accept configuration
interface PopoverProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
  disableOutsideClick?: boolean;
}

const Popover = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Root>,
  PopoverProps
>(({ disableOutsideClick, ...props }, ref) => {
  return <PopoverPrimitive.Root {...props} />;
});
Popover.displayName = "Popover";

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

// Extended to support customizing the outside click behavior
interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  disableOutsideClick?: boolean;
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ 
  className, 
  align = "start", // Changed default from "center" to "start"
  sideOffset = 4,
  side = "bottom", // Changed default side to "bottom"
  disableOutsideClick,
  style,  // Add style prop to support custom width
  ...props 
}, ref) => {
  // Use this approach to completely block outside interactions when disabled
  const handleInteractOutside = (event: Event) => {
    if (disableOutsideClick) {
      // This completely prevents the event from proceeding
      event.preventDefault();
      event.stopPropagation();
      // Return false to ensure Radix knows we're preventing the close
      return false;
    }
  };

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        side={side} // Added side prop
        style={style}  // Pass style prop through
        onInteractOutside={handleInteractOutside}
        className={cn(
          "z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
