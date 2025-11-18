/**
 * OraclusX Design System - Dropdown Component
 * Menu dropdown neuromórfico
 */

import React, { useState, useRef, useEffect } from"react";
import { cn } from"@/lib/utils";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?:"left" |"right";
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align ="left",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick?.();
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn("absolute z-50 mt-2 min-w-[200px] orx-card p-2","animate-in fade-in-0 zoom-in-95 duration-150",
            align ==="left" ?"left-0" :"right-0",
          )}
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.divider ? (
                <div className="h-px bg-surface-secondary dark:bg-muted my-2" />
              ) : (
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left","transition-colors duration-150","text-[var(--text-primary)]",
                    item.disabled
                      ?"opacity-50 cursor-not-allowed"
                      :"hover:bg-[var(--surface-hover)] cursor-pointer",
                  )}
                >
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <span className="flex-1">{item.label}</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.displayName ="OraclusXDropdown";

export default Dropdown;

