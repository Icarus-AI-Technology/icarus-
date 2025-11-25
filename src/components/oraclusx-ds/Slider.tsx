import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import clsx from 'clsx';

export type SliderSize = 'sm' | 'md' | 'lg';
export type SliderColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface SliderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    'onValueChange' | 'defaultValue' | 'value'
  > {
  id?: string;
  label?: string;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  size?: SliderSize;
  color?: SliderColor;
  showValue?: boolean;
}

const sizeToClasses: Record<SliderSize, { root: string; thumb: string; track: string }> = {
  sm: {
    root: 'h-6',
    thumb: 'h-4 w-4',
    track: 'h-1.5',
  },
  md: {
    root: 'h-8',
    thumb: 'h-5 w-5',
    track: 'h-2',
  },
  lg: {
    root: 'h-10',
    thumb: 'h-6 w-6',
    track: 'h-2.5',
  },
};

const colorToClasses: Record<SliderColor, string> = {
  primary: 'bg-[var(--orx-primary)]',
  success: 'bg-[var(--orx-success)]',
  warning: 'bg-[var(--orx-warning)]',
  error: 'bg-[var(--orx-error)]',
  info: 'bg-[var(--orx-info)]',
};

export function Slider({
  id,
  label,
  size = 'md',
  color = 'primary',
  className,
  showValue = false,
  value,
  defaultValue = [50],
  onValueChange,
  ...props
}: SliderProps) {
  const classes = sizeToClasses[size];

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block orx-text-sm orx-orx-font-medium text-[var(--orx-text-primary)] dark:text-[var(--orx-text-secondary)]"
        >
          {label}
        </label>
      )}
      <SliderPrimitive.Root
        id={id}
        value={value}
        defaultValue={value ? undefined : defaultValue}
        onValueChange={onValueChange}
        className={clsx('relative flex w-full touch-none select-none items-center', classes.root)}
        {...props}
      >
        <SliderPrimitive.Track
          className={clsx(
            'relative grow overflow-hidden rounded-full',
            classes.track,
            // Neumorphic track background
            'bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-inset-light-1),_var(--orx-shadow-inset-light-2)]',
            'dark:bg-[var(--orx-bg-dark)] dark:shadow-[var(--orx-shadow-inset-dark-1),_var(--orx-shadow-inset-dark-2)]'
          )}
        >
          <SliderPrimitive.Range
            className={clsx(
              'absolute h-full',
              colorToClasses[color],
              'transition-colors duration-300'
            )}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={label}
          className={clsx(
            'block rounded-full outline-none',
            classes.thumb,
            'bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)]',
            'hover:shadow-[10px_10px_20px_#8f9db3,_-10px_-10px_20px_#f5f7fa] focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-[var(--orx-primary)]',
            'dark:bg-[var(--orx-bg-dark)] dark:shadow-[var(--orx-shadow-dark-1),_var(--orx-shadow-dark-2)]',
            'transition-[box-shadow,transform] duration-300'
          )}
        />
      </SliderPrimitive.Root>
      {showValue && (value ?? defaultValue)?.length > 0 && (
        <div className="mt-2 orx-text-xs text-[var(--orx-text-secondary)] dark:text-[var(--orx-text-muted)]">
          {(value ?? defaultValue)[0]}%
        </div>
      )}
    </div>
  );
}

export default Slider;
