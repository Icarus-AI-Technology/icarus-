/**
 * OraclusX Design System - NeumoSearchBar Component
 * Barra de Busca Neumórfica 3D Premium
 *
 * Barra de busca com visual neumórfico integrado, ícone de lupa,
 * suporte a filtros e loading state.
 */

import React, { forwardRef, useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NeumoSearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Callback quando há mudança no valor */
  onSearch?: (value: string) => void;

  /** Callback ao limpar o campo */
  onClear?: () => void;

  /** Callback ao clicar no botão de filtros */
  onFiltersClick?: () => void;

  /** Mostra o botão de filtros */
  showFilters?: boolean;

  /** Estado de loading */
  loading?: boolean;

  /** Tamanho da barra de busca */
  size?: 'sm' | 'md' | 'lg';

  /** Classe CSS adicional para o container */
  containerClassName?: string;
}

const sizeStyles = {
  sm: 'h-9 pl-9 pr-3 orx-text-sm',
  md: 'h-11 pl-10 pr-4 orx-text-base',
  lg: 'h-13 pl-12 pr-5 text-md',
};

const iconSizes = {
  sm: 16,
  md: 18,
  lg: 20,
};

export const NeumoSearchBar = forwardRef<HTMLInputElement, NeumoSearchBarProps>(
  (
    {
      onSearch,
      onClear,
      onFiltersClick,
      showFilters = true,
      loading,
      size = 'md',
      containerClassName,
      className,
      placeholder = 'Buscar...',
      value: controlledValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('');
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const hasValue = typeof value === 'string' && value.length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(e);
      onSearch?.(newValue);
    };

    const handleClear = () => {
      if (controlledValue === undefined) {
        setInternalValue('');
      }
      onClear?.();
      onSearch?.('');
    };

    return (
      <div className={cn('relative w-full', containerClassName)}>
        {/* Ícone de Busca */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search
            size={iconSizes[size]}
            className={cn('text-orx-text-muted transition-colors', loading && 'animate-pulse')}
          />
        </div>

        {/* Input */}
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            // Base
            'w-full rounded-lg',
            'bg-orx-bg-surface',
            'text-orx-text-primary placeholder:text-orx-text-muted',
            'border border-orx-border-subtle',
            'transition-all duration-200',
            // Neumórfico
            'shadow-neumo-sm-inset',
            'focus:shadow-neumo-inset',
            // Estados
            'focus:outline-none focus:ring-3 focus:ring-orx-primary/20',
            // Tamanho
            sizeStyles[size],
            // Espaçamento para botões à direita
            (hasValue || showFilters) && 'pr-20',
            className
          )}
          {...props}
        />

        {/* Botões à Direita */}
        {(hasValue || showFilters) && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Botão Limpar */}
            {hasValue && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'p-1.5 rounded-lg',
                  'text-orx-text-muted hover:text-orx-text-primary',
                  'hover:bg-orx-bg-light',
                  'transition-colors',
                  'focus:outline-none focus:ring-3 focus:ring-orx-primary/20'
                )}
                aria-label="Limpar busca"
              >
                <X size={iconSizes[size] - 2} />
              </button>
            )}

            {/* Botão Filtros */}
            {showFilters && onFiltersClick && (
              <button
                type="button"
                onClick={onFiltersClick}
                className={cn(
                  'p-1.5 rounded-lg',
                  'text-orx-text-muted hover:text-orx-primary',
                  'hover:bg-orx-primary-light',
                  'transition-colors',
                  'focus:outline-none focus:ring-3 focus:ring-orx-primary/20'
                )}
                aria-label="Abrir filtros"
              >
                <SlidersHorizontal size={iconSizes[size] - 2} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

NeumoSearchBar.displayName = 'NeumoSearchBar';

export default NeumoSearchBar;
