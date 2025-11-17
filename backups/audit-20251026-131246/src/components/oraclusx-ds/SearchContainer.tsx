/**
 * OraclusX Design System - SearchContainer Component
 * Container de busca avançada com filtros
 */

import React, { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchContainerProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  showFilters?: boolean;
  onFilterClick?: () => void;
  className?: string;
}

export const SearchContainer: React.FC<SearchContainerProps> = ({
  placeholder = "Buscar médicos, cirurgias, produtos...",
  onSearch,
  onClear,
  showFilters = true,
  onFilterClick,
  className,
}) => {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    onClear?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-center gap-2 w-full max-w-2xl", className)}
    >
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--orx-text-secondary,var(--orx-gray-400))]">
          <Search size={20} />
        </div>
        <input
          type="search"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="orx-input w-full pl-12 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-secondary dark:hover:text-gray-300 transition-colors"
            title="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {showFilters && (
        <button
          type="button"
          onClick={onFilterClick}
          className="orx-button p-3"
          aria-label="Filtros"
        >
          <SlidersHorizontal size={20} />
        </button>
      )}
    </form>
  );
};

SearchContainer.displayName = "OraclusXSearchContainer";

export default SearchContainer;
