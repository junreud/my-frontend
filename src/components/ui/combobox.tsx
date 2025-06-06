"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  renderOption?: (option: string) => React.ReactElement;
  className?: string;
  renderActions?: () => React.ReactNode;
  // Add controlled open state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Add option to disable outside click closing
  disableOutsideClick?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "선택하기...",
  renderOption,
  className,
  renderActions,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  disableOutsideClick = false,
}: ComboboxProps) {
  // Use internal state if not controlled externally
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  // Determine if we're using controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  // 디버깅 로그 추가
  React.useEffect(() => {
    console.log('Combobox rendered with:', {
      optionsCount: options.length,
      options: options,
      value,
      isOpen: open
    });
  }, [options, value, open]);

  // No need for special handling - we want outside clicks to close the popover
  // Let the parent decide what to do when the popover closes

  return (
    <Popover 
      open={open} 
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`${placeholder} 검색...`} />
          <CommandEmpty>찾는 항목이 없습니다</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options && options.length > 0 ? (
                options.map((option, index) => {
                  console.log('Rendering option:', option, 'at index:', index);
                  return (
                    <CommandItem
                      key={`${option}-${index}`}
                      value={option}
                      onSelect={(currentValue) => {
                        console.log('Selected option:', currentValue);
                        // Always call onChange
                        onChange(currentValue);
                        
                        // Only close if not using custom renderer
                        if (!renderOption) {
                          setOpen(false);
                        }
                        // When using custom renderer, let parent component decide
                      }}
                      className="w-full"
                    >
                      {renderOption ? (
                        renderOption(option)
                      ) : (
                        <>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option}
                        </>
                      )}
                    </CommandItem>
                  );
                })
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  표시할 항목이 없습니다
                </div>
              )}
            </CommandGroup>
          </CommandList>
          
          {renderActions && (
            <div 
              className="border-t" 
              onMouseDown={(e) => {
                // Don't prevent default here - we want outside clicks to close
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {renderActions()}
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
