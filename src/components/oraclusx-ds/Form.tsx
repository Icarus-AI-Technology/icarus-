/**
 * Form Components - OraclusX Design System
 * Componentes de formulário com validação e acessibilidade
 */

import React, { forwardRef } from 'react';

// FormField Component
export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  hint,
  children,
  htmlFor,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="block text-body-sm text-secondary dark:text-muted mb-2 orx-orx-font-medium"
      >
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-body-xs text-[var(--text-secondary)]">{hint}</p>}
      {error && (
        <p className="mt-1 text-body-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// TextInput Component
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          px-4 py-2.5
          border rounded-lg
          bg-surface dark:bg-card
          text-primary dark:text-inverse
          placeholder-muted dark:placeholder-muted
          transition-all duration-200
          focus:outline-none focus:ring-3 focus:ring-primary focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error focus:ring-error' : 'border-[var(--border)]'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';

// TextArea Component
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`
          px-4 py-2.5
          border rounded-lg
          bg-surface dark:bg-card
          text-primary dark:text-inverse
          placeholder-muted dark:placeholder-muted
          transition-all duration-200
          focus:outline-none focus:ring-3 focus:ring-primary focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-vertical
          ${error ? 'border-error focus:ring-error' : 'border-[var(--border)]'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

// Select Component
export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  error?: boolean;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onValueChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, fullWidth = true, options, className = '', onChange, onValueChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    return (
      <select
        ref={ref}
        className={`
          px-4 py-2.5
          border rounded-lg
          bg-surface dark:bg-card
          text-primary dark:text-inverse
          transition-all duration-200
          focus:outline-none focus:ring-3 focus:ring-primary focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error focus:ring-error' : 'border-gray-300 dark:border-border'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        onChange={handleChange}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

// Checkbox Component
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={`
            w-5 h-5
            border-2 border-gray-300 dark:border-border
            rounded
            text-primary
            focus:ring-3 focus:ring-primary focus:ring-offset-0
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {label && <span className="text-body-sm text-secondary dark:text-muted">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio Component
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="radio"
          className={`
            w-5 h-5
            border-2 border-gray-300 dark:border-border
            text-primary
            focus:ring-3 focus:ring-primary focus:ring-offset-0
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {label && <span className="text-body-sm text-secondary dark:text-muted">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

// FormGroup Component
export interface FormGroupProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, columns = 1 }) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={`grid ${columnClasses[columns]} gap-4`}>{children}</div>;
};

export default { FormField, TextInput, TextArea, Select, Checkbox, Radio, FormGroup };
