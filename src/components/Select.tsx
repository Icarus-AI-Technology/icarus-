/**
 * OraclusX Design System - Select Component
 * Dropdown de seleção neuromórfico
 */

import React, { useState, useRef, useEffect } from"react";
import { Check, ChevronDown } from"lucide-react";
import { cn } from"@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder ="Selecione...",
  label,
  error,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value ||"");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-body-sm text-secondary dark:text-muted mb-1 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn("orx-input w-full flex items-center justify-between",
            error &&"border-2 border-error",
            disabled &&"opacity-50 cursor-not-allowed",
          )}
        >
          <span className={cn(!selectedOption &&"text-muted")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={18}
            className={cn("transition-transform duration-200",
              isOpen &&"transform rotate-180",
            )}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-2 orx-card p-2 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-left","transition-colors duration-150",
                  option.value === selectedValue
                    ?"bg-primary text-inverse"
                    :"hover:bg-[var(--surface-hover)] text-primary",
                  option.disabled &&"opacity-50 cursor-not-allowed",
                )}
              >
                <span>{option.label}</span>
                {option.value === selectedValue && <Check size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-body-sm text-error">{error}</p>}
    </div>
  );
};

Select.displayName ="OraclusXSelect";

export default Select;

