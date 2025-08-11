import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, X, ChevronDown } from "lucide-react";
import * as React from "react";

export type Option = {
  value: string;
  label: string;
  disable?: boolean;
};

interface VirtualizedMultiCommandProps {
  height: string;
  options: Option[];
  placeholder: string;
  selectedOptions: Option[];
  onSelectOption?: (option: Option) => void;
  onDeselectOption?: (option: Option) => void;
  creatable?: boolean;
  emptyIndicator?: React.ReactNode;
}

const VirtualizedMultiCommand = ({
  height,
  options,
  placeholder,
  selectedOptions,
  onSelectOption,
  onDeselectOption,
  creatable = false,
  emptyIndicator,
}: VirtualizedMultiCommandProps) => {
  const [filteredOptions, setFilteredOptions] =
    React.useState<Option[]>(options);
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const [isKeyboardNavActive, setIsKeyboardNavActive] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const parentRef = React.useRef(null);

  // Filter out already selected options
  const availableOptions = React.useMemo(
    () =>
      filteredOptions.filter(
        (option) =>
          !selectedOptions.some((selected) => selected.value === option.value),
      ),
    [filteredOptions, selectedOptions],
  );

  const virtualizer = useVirtualizer({
    count:
      availableOptions.length +
      (creatable &&
      searchValue &&
      !availableOptions.some(
        (opt) => opt.value.toLowerCase() === searchValue.toLowerCase(),
      )
        ? 1
        : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const scrollToIndex = (index: number) => {
    virtualizer.scrollToIndex(index, {
      align: "center",
    });
  };

  const handleSearch = (search: string) => {
    setSearchValue(search);
    setIsKeyboardNavActive(false);
    setFilteredOptions(
      options.filter(
        (option) =>
          option.label.toLowerCase().includes(search.toLowerCase()) ||
          option.value.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const totalItems =
      availableOptions.length +
      (creatable &&
      searchValue &&
      !availableOptions.some(
        (opt) => opt.value.toLowerCase() === searchValue.toLowerCase(),
      )
        ? 1
        : 0);

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        setIsKeyboardNavActive(true);
        setFocusedIndex((prev) => {
          const newIndex = prev === -1 ? 0 : Math.min(prev + 1, totalItems - 1);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        setIsKeyboardNavActive(true);
        setFocusedIndex((prev) => {
          const newIndex = prev === -1 ? totalItems - 1 : Math.max(prev - 1, 0);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      }
      case "Enter": {
        event.preventDefault();
        if (focusedIndex < availableOptions.length) {
          const option = availableOptions[focusedIndex];
          if (option && !option.disable) {
            onSelectOption?.(option);
          }
        } else if (creatable && searchValue) {
          // Create new option
          const newOption: Option = { value: searchValue, label: searchValue };
          onSelectOption?.(newOption);
          setSearchValue("");
        }
        break;
      }
      default:
        break;
    }
  };

  React.useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput
        onValueChange={handleSearch}
        placeholder={placeholder}
        value={searchValue}
      />
      <CommandList
        ref={parentRef}
        style={{
          height: height,
          width: "100%",
          overflow: "auto",
        }}
        onMouseDown={() => setIsKeyboardNavActive(false)}
        onMouseMove={() => setIsKeyboardNavActive(false)}
      >
        {availableOptions.length === 0 && !creatable && (
          <CommandEmpty>{emptyIndicator || "No items found."}</CommandEmpty>
        )}
        <CommandGroup>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualOptions.map((virtualOption) => {
              const isCreateOption =
                virtualOption.index >= availableOptions.length;

              if (isCreateOption && creatable && searchValue) {
                return (
                  <CommandItem
                    key="create-new"
                    disabled={isKeyboardNavActive}
                    className={cn(
                      "absolute top-0 left-0 w-full bg-transparent",
                      focusedIndex === virtualOption.index &&
                        "bg-accent text-accent-foreground",
                    )}
                    style={{
                      height: `${virtualOption.size}px`,
                      transform: `translateY(${virtualOption.start}px)`,
                    }}
                    value={searchValue}
                    onMouseEnter={() =>
                      !isKeyboardNavActive &&
                      setFocusedIndex(virtualOption.index)
                    }
                    onSelect={() => {
                      const newOption: Option = {
                        value: searchValue,
                        label: searchValue,
                      };
                      onSelectOption?.(newOption);
                      setSearchValue("");
                    }}
                  >
                    <div className="mr-2 h-4 w-4" />
                    Create "{searchValue}"
                  </CommandItem>
                );
              }

              const option = availableOptions[virtualOption.index];
              if (!option) return null;

              return (
                <CommandItem
                  key={option.value}
                  disabled={isKeyboardNavActive || option.disable}
                  className={cn(
                    "absolute top-0 left-0 w-full bg-transparent",
                    focusedIndex === virtualOption.index &&
                      "bg-accent text-accent-foreground",
                    isKeyboardNavActive &&
                      focusedIndex !== virtualOption.index &&
                      "aria-selected:text-primary aria-selected:bg-transparent",
                    option.disable && "cursor-not-allowed opacity-50",
                  )}
                  style={{
                    height: `${virtualOption.size}px`,
                    transform: `translateY(${virtualOption.start}px)`,
                  }}
                  value={option.value}
                  onMouseEnter={() =>
                    !isKeyboardNavActive && setFocusedIndex(virtualOption.index)
                  }
                  onMouseLeave={() =>
                    !isKeyboardNavActive && setFocusedIndex(-1)
                  }
                  onSelect={() => !option.disable && onSelectOption?.(option)}
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  {option.label}
                </CommandItem>
              );
            })}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

interface VirtualizedMultiSelectProps {
  options: Option[];
  selectedOptions: Option[];
  onSelectedOptionsChange: (options: Option[]) => void;
  searchPlaceholder?: string;
  width?: string;
  height?: string;
  creatable?: boolean;
  emptyIndicator?: React.ReactNode;
  disabled?: boolean;
  /** Custom trigger component - if not provided, uses default button */
  trigger?: React.ReactNode;
  /** Content width - if not provided, uses trigger width */
  contentWidth?: string;
  /** Show clear all button - defaults to true */
  showClearAll?: boolean;
}

export function VirtualizedMultiSelect({
  options,
  selectedOptions,
  onSelectedOptionsChange,
  searchPlaceholder = "Search items...",
  width = "400px",
  height = "300px",
  creatable = false,
  emptyIndicator,
  disabled = false,
  trigger,
  contentWidth,
  showClearAll = true,
}: VirtualizedMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelectOption = (option: Option) => {
    if (!selectedOptions.some((selected) => selected.value === option.value)) {
      onSelectedOptionsChange([...selectedOptions, option]);
    }
  };

  const handleDeselectOption = (option: Option) => {
    onSelectedOptionsChange(
      selectedOptions.filter((selected) => selected.value !== option.value),
    );
  };

  const handleClearAll = () => {
    onSelectedOptionsChange([]);
  };

  const finalContentWidth = contentWidth || width;

  const defaultTrigger = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className="justify-between text-left"
      style={{ width: width }}
      disabled={disabled}
    >
      <div className="mr-2 flex flex-1 flex-wrap gap-1">
        {selectedOptions.length === 0 ? (
          <span className="text-muted-foreground">{searchPlaceholder}</span>
        ) : selectedOptions.length <= 3 ? (
          selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleDeselectOption(option);
              }}
            >
              {option.label}
              <X className="hover:bg-muted ml-1 h-3 w-3 rounded-sm" />
            </Badge>
          ))
        ) : (
          <Badge variant="secondary" className="text-xs">
            {selectedOptions.length} selected
          </Badge>
        )}
      </div>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: finalContentWidth }}>
        {selectedOptions.length > 0 && (
          <div className="border-b p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-1 flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="hover:bg-muted cursor-pointer text-xs"
                    onClick={() => handleDeselectOption(option)}
                  >
                    {option.label}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
              {showClearAll && selectedOptions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 flex-shrink-0 p-0"
                  title="Clear all selections"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}
        <VirtualizedMultiCommand
          height={height}
          options={options}
          placeholder={searchPlaceholder}
          selectedOptions={selectedOptions}
          onSelectOption={handleSelectOption}
          onDeselectOption={handleDeselectOption}
          creatable={creatable}
          emptyIndicator={emptyIndicator}
        />
      </PopoverContent>
    </Popover>
  );
}
