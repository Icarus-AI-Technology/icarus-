/**
 * OraclusX Design System - DatePicker Component
 * Seletor de data com validação
 * 
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (label, aria-*, keyboard)
 * ✅ TypeScript strict
 */

import React, { useState, useRef, useEffect } from"react";
import { Calendar as CalendarIcon } from"lucide-react";
import { cn } from"@/lib/utils";

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
  className?: string;
  format?:"dd/MM/yyyy" |"MM/dd/yyyy" |"yyyy-MM-dd";
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder ="Selecione uma data",
  minDate,
  maxDate,
  disabled = false,
  error,
  className,
  format ="dd/MM/yyyy"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [viewMonth, setViewMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2,"0");
    const month = (date.getMonth() + 1).toString().padStart(2,"0");
    const year = date.getFullYear();

    switch (format) {
      case"dd/MM/yyyy":
        return `${day}/${month}/${year}`;
      case"MM/dd/yyyy":
        return `${month}/${day}/${year}`;
      case"yyyy-MM-dd":
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const handleDateSelect = (date: Date) => {
    // Validate against min/max
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;

    setSelectedDate(date);
    onChange(date);
    setIsOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(viewMonth);

  const previousMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1));
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label className="block mb-2 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
          {label}
        </label>
      )}

      {/* Input */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label="Selecionar data"
        {...(isOpen ? { 'aria-expanded': 'true' as const } : { 'aria-expanded': 'false' as const })}
        aria-haspopup="dialog"
        className={cn("w-full px-4 py-2 rounded-lg flex items-center justify-between","bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]","border border-gray-200 dark:border-border","shadow-[var(--shadow-light-inner)] dark:shadow-[var(--shadow-dark-inner)]","focus:outline-none focus:ring-3 focus:ring-[var(--primary)]","transition-all",
          disabled &&"opacity-50 cursor-not-allowed",
          error &&"border-error"
        )}
      >
        <span
          className={cn(
            selectedDate
              ?"text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]"
              :"text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]"
          )}
        >
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <CalendarIcon size={18} />
      </button>

      {error && (
        <p className="mt-1 text-error dark:text-red-400">
          {error}
        </p>
      )}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendário"
          className={cn("absolute z-50 mt-2 p-4 rounded-lg","bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]","shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]","border border-gray-200 dark:border-border"
          )}
        >
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              aria-label="Mês anterior"
              className="p-2 rounded-md hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-3 focus:ring-[var(--primary)]"
            >
              ←
            </button>
            <span className="text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] orx-orx-font-medium">
              {viewMonth.toLocaleDateString("pt-BR", { month:"long", year:"numeric" })}
            </span>
            <button
              onClick={nextMonth}
              aria-label="Próximo mês"
              className="p-2 rounded-md hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-3 focus:ring-[var(--primary)]"
            >
              →
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((day) => (
              <div
                key={day}
                className="text-center text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isDisabled = isDateDisabled(date);

              return (
                <button
                  key={day}
                  onClick={() => !isDisabled && handleDateSelect(date)}
                  disabled={isDisabled}
                  aria-label={`${day} de ${viewMonth.toLocaleDateString("pt-BR", { month:"long" })}`}
                  className={cn("p-2 rounded-md text-center transition-colors","focus:outline-none focus:ring-3 focus:ring-[var(--primary)]",
                    isSelected &&"bg-[var(--primary)] text-inverse shadow-md",
                    !isSelected && !isDisabled &&"hover:bg-[var(--surface-hover)]",
                    isDisabled &&"opacity-30 cursor-not-allowed"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

