"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/adminPopover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ComboboxOption<T = unknown> {
  value: string;
  label: string;
  userData?: T;
}

// Define two separate interfaces for single and multi-select props
interface BaseComboboxProps<T = unknown> {
  options: ComboboxOption<T>[];
  placeholder?: string;
  position?: "bottom" | "right";
  displayMode?: "default" | "text"; // Add display mode option
}

interface SingleSelectComboboxProps<T = unknown> extends BaseComboboxProps<T> {
  multiSelect: false;
  selected: string;
  onChange: (selected: string) => void;
}

interface MultiSelectComboboxProps<T = unknown> extends BaseComboboxProps<T> {
  multiSelect?: true;
  selected: string[];
  onChange: (selected: string[]) => void;
}

// Union type to represent either single or multi-select props
type ComboboxProps<T = unknown> = SingleSelectComboboxProps<T> | MultiSelectComboboxProps<T>;

export function MultiSelectCombobox<T = unknown>(props: ComboboxProps<T>) {
  const {
    options,
    placeholder = "항목 선택...",
    position = "bottom",
    displayMode = "default", // Default to badges for multi-select
  } = props;
  
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // 안전한 값 보장
  const safeOptions = React.useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    return options.map(opt => ({
      value: opt?.value || "",
      label: opt?.label || "",
      userData: opt?.userData
    }));
  }, [options]);

  // Handle both string and array types for selected value
  const safeSelected = React.useMemo(() => {
    if (props.multiSelect !== false) {
      return [...props.selected];
    } else {
      // For single select, convert string to array for internal processing
      return props.selected ? [props.selected] : [];
    }
  }, [props.selected, props.multiSelect]);

  const handleSelect = React.useCallback((value: string) => {
    if (!value) return;
    
    if (props.multiSelect !== false) {
      // Multi-select behavior
      if (safeSelected.includes(value)) {
        props.onChange(safeSelected.filter((item) => item !== value));
      } else {
        props.onChange([...safeSelected, value]);
      }
    } else {
      // Single-select behavior - always replace with the new value
      props.onChange(value);
      setOpen(false); // Close dropdown after selection
    }
  }, [safeSelected, props, setOpen]);

  const handleRemove = React.useCallback((value: string) => {
    if (props.multiSelect !== false) {
      props.onChange(safeSelected.filter((item) => item !== value));
    } else {
      // For single select, removing means clearing the selection
      props.onChange("");
    }
  }, [safeSelected, props]);

  // 필터링된 옵션 계산
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return safeOptions;
    
    return safeOptions.filter(option => 
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [safeOptions, inputValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1">
            {safeSelected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : props.multiSelect === false || displayMode === "text" ? (
              // Display as text for single-select or if displayMode is "text"
              <div className="flex items-center justify-between w-full">
                <span className="text-foreground">
                  {safeOptions.find(opt => opt.value === safeSelected[0])?.label || safeSelected[0]}
                </span>
                {/* Add X button to clear selection */}
                <span
                  className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(safeSelected[0]);
                  }}
                >
                  <X className="h-4 w-4" />
                </span>
              </div>
            ) : (
              // For multi-select with default display mode, use badges
              safeSelected.map((value) => {
                const option = safeOptions.find(opt => opt.value === value);
                return (
                  <Badge
                    variant="secondary"
                    key={value}
                    className="mr-1 mb-1"
                  >
                    {option?.label || value}
                    <span
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRemove(value);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(value);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </span>
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        align="start"
        side={position === "right" ? "right" : "bottom"}
        // Set width to approximately half of the trigger width
        style={{ width: "calc(var(--radix-popover-trigger-width) * 0.5)" }}
      >
        <div className="border-none p-0 outline-none">
          <div className="px-3 py-2">
            <input
              className="w-full border-none bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder={`${placeholder} 검색...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <div className="h-px bg-border"></div>
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="max-h-60 overflow-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
                    safeSelected.includes(option.value) ? "bg-accent/50" : ""
                  )}
                  onClick={() => {
                    handleSelect(option.value);
                    setInputValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 flex-shrink-0",
                      safeSelected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {/* Add truncation to option text */}
                  <span className="truncate">{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}