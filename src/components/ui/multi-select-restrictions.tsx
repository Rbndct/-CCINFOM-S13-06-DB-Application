import * as React from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTypeIcon, getTypeColor } from "@/utils/restrictionUtils";

interface DietaryRestriction {
  restriction_id: number;
  restriction_name: string;
  restriction_type?: string;
  severity_level?: string;
}

interface MultiSelectRestrictionsProps {
  restrictions: DietaryRestriction[];
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxHeight?: string;
  error?: string;
}

export const MultiSelectRestrictions = React.forwardRef<
  HTMLButtonElement,
  MultiSelectRestrictionsProps
>(({ 
  restrictions, 
  selectedIds, 
  onSelectionChange, 
  disabled = false,
  placeholder = "Select dietary restrictions...",
  maxHeight = "300px",
  error
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedRestrictions = restrictions.filter(r => selectedIds.includes(r.restriction_id));

  const handleToggle = (restrictionId: number) => {
    if (selectedIds.includes(restrictionId)) {
      onSelectionChange(selectedIds.filter(id => id !== restrictionId));
    } else {
      onSelectionChange([...selectedIds, restrictionId]);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const filteredRestrictions = React.useMemo(() => {
    if (!search) return restrictions;
    const searchLower = search.toLowerCase();
    return restrictions.filter(r => 
      r.restriction_name.toLowerCase().includes(searchLower) ||
      r.restriction_type?.toLowerCase().includes(searchLower) ||
      r.severity_level?.toLowerCase().includes(searchLower)
    );
  }, [restrictions, search]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-h-[42px] h-auto",
              error && "border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedRestrictions.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <>
                  {selectedRestrictions.slice(0, 3).map((restriction) => (
                    <Badge
                      key={restriction.restriction_id}
                      variant="outline"
                      className={cn(
                        "text-xs flex items-center gap-1 pr-1",
                        getTypeColor(restriction.restriction_type || '')
                      )}
                    >
                      {getTypeIcon(restriction.restriction_type || '')}
                      <span className="max-w-[120px] truncate" title={restriction.restriction_name}>
                        {restriction.restriction_name}
                      </span>
                      {!disabled && (
                        <button
                          type="button"
                          className="ml-1 rounded-full outline-none hover:bg-secondary"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleToggle(restriction.restriction_id);
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggle(restriction.restriction_id);
                          }}
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {selectedRestrictions.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs flex items-center gap-1"
                    >
                      +{selectedRestrictions.length - 3} more
                    </Badge>
                  )}
                </>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search restrictions..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList style={{ maxHeight }}>
              <CommandEmpty>No restrictions found.</CommandEmpty>
              <CommandGroup>
                {filteredRestrictions.length > 0 && (
                  <div className="p-2 border-b">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-full justify-start text-xs"
                      onClick={handleClearAll}
                    >
                      <X className="mr-2 h-3 w-3" />
                      Clear All
                    </Button>
                  </div>
                )}
                {filteredRestrictions.map((restriction) => {
                  const isSelected = selectedIds.includes(restriction.restriction_id);
                  return (
                    <CommandItem
                      key={restriction.restriction_id}
                      value={`${restriction.restriction_name} ${restriction.restriction_type} ${restriction.severity_level}`}
                      onSelect={() => handleToggle(restriction.restriction_id)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded text-xs",
                          getTypeColor(restriction.restriction_type || '')
                        )}>
                          {getTypeIcon(restriction.restriction_type || '')}
                          <span className="truncate" title={restriction.restriction_name}>
                            {restriction.restriction_name}
                          </span>
                        </span>
                        {restriction.severity_level && (
                          <span className="text-muted-foreground text-xs whitespace-nowrap">
                            {restriction.severity_level}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} restriction{selectedIds.length !== 1 ? 's' : ''} selected
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

MultiSelectRestrictions.displayName = "MultiSelectRestrictions";


