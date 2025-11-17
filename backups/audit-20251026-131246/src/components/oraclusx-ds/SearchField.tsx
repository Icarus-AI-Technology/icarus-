/**
 * OraclusX Design System - SearchField Component
 * Campo de busca neuromórfico
 */

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, onClear, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState("");
    const currentValue = value !== undefined ? value : internalValue;

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue("");
      }
      onClear?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    return (
      <div className="relative w-full">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">
          <Search size={18} />
        </div>
        <input
          ref={ref}
          type="search"
          value={currentValue}
          onChange={handleChange}
          className={cn("orx-input", "w-full pl-10 pr-10", className)}
          {...props}
        />
        {currentValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-secondary dark:hover:text-gray-300 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  },
);

SearchField.displayName = "OraclusXSearchField";

export default SearchField;
