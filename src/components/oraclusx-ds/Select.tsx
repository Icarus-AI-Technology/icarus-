/**
 * OraclusX Design System - Select Component
 * Wrapper para o Select do HeroUI com estilo consistente
 */

import React from 'react';
import { Select as HeroSelect, SelectItem, SelectProps as HeroSelectProps } from '@heroui/react';
import { cn } from '@/lib/utils';

type Selection = 'all' | Set<React.Key>;

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<
    HeroSelectProps,
    'children' | 'selectedKeys' | 'defaultSelectedKeys' | 'onSelectionChange' | 'value'
  > {
  options: SelectOption[];
  error?: string;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  onSelectionChange?: HeroSelectProps['onSelectionChange'];
}

export const Select: React.FC<SelectProps> = ({
  options,
  error,
  value,
  defaultValue,
  onValueChange,
  onSelectionChange,
  variant = "flat",
  radius = "lg",
  className,
  classNames,
  ...rest
}) => {
  const hasError = !!error;
  const controlledKeys = value !== undefined ? new Set(value ? [value] : []) : undefined;
  const defaultKeys = defaultValue !== undefined ? new Set(defaultValue ? [defaultValue] : []) : undefined;

  const handleSelectionChange = (selection: Selection) => {
    // Cast to any to avoid type conflicts between HeroUI versions
    onSelectionChange?.(selection as unknown as Parameters<NonNullable<typeof onSelectionChange>>[0]);
    if (!onValueChange) return;

    if (selection === 'all') {
      onValueChange(null);
      return;
    }

    if (selection instanceof Set) {
      const first = selection.values().next().value;
      onValueChange(typeof first === 'string' ? first : first ? String(first) : null);
      return;
    }

    onValueChange(selection ? String(selection as React.Key) : null);
  };

  return (
    <div className={cn('w-full', className)}>
      <HeroSelect
        selectedKeys={controlledKeys}
        defaultSelectedKeys={defaultKeys}
        variant={variant}
        radius={radius}
        errorMessage={error}
        isInvalid={hasError}
        classNames={{
          trigger: [
            "bg-white/5 hover:bg-white/10",
            "border-white/10 hover:border-white/20",
            "backdrop-blur-md",
            hasError ? "border-danger" : "",
          ].join(" "),
          label: "text-slate-400",
          value: "text-white",
          popoverContent: "bg-[#181b29] border border-white/10 shadow-xl backdrop-blur-xl",
          ...classNames,
        }}
        listboxProps={{
          itemClasses: {
            base: [
              "data-[hover=true]:bg-white/10",
              "data-[hover=true]:text-white",
              "text-slate-300",
            ].join(" "),
          },
        }}
        onSelectionChange={handleSelectionChange}
        {...rest}
      >
        {options.map((option) => (
          <SelectItem key={option.value} textValue={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </HeroSelect>
    </div>
  );
};

Select.displayName = 'OraclusXSelect';

export default Select;
