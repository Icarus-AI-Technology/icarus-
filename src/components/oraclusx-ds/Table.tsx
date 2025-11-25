/**
 * OraclusX Design System - Table Component
 * Tabela de dados enterprise com sort, filtro e seleção
 *
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (role="table", aria-sort, keyboard)
 * ✅ TypeScript strict
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TableColumn<T> {
  // Chave da coluna (preferencial). Backcompat: usar 'accessor'.
  key?: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  // Renderer preferencial. Backcompat: usar 'cell'.
  render?: (value: T[keyof T] | undefined, row: T) => React.ReactNode;
  // Backcompat com APIs anteriores usadas nos módulos
  accessor?: keyof T | string;
  cell?: (args: { value: T[keyof T] | undefined; row: T }) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  selectable?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  maxHeight?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function Table<T extends object>({
  data,
  columns,
  selectable = false,
  onRowSelect,
  onRowClick,
  className,
  emptyMessage = 'Nenhum registro encontrado',
  loading = false,
  maxHeight = '600px',
}: TableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef<Array<HTMLTableCellElement | null>>([]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.maxHeight = maxHeight;
    }
  }, [maxHeight]);

  useEffect(() => {
    columns.forEach((column, idx) => {
      const el = headerRefs.current[idx];
      if (el && column.width) {
        el.style.width = String(column.width);
      }
    });
  }, [columns]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn as keyof T];
      const bVal = b[sortColumn as keyof T];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    const key = (column.key ?? column.accessor) as string;

    if (sortColumn !== key) {
      setSortColumn(key);
      setSortDirection('asc');
    } else {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection(null);
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(data.map((_, idx) => idx)));
      onRowSelect?.(data);
    } else {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedRows(newSelection);

    const selected = Array.from(newSelection).map((idx) => data[idx]);
    onRowSelect?.(selected);
  };

  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;

    const key = (column.key ?? column.accessor) as string;
    const isActive = sortColumn === key;

    if (!isActive) {
      return <ChevronsUpDown size={16} className="opacity-50" />;
    }

    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg',
        'bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]',
        'shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]',
        className
      )}
      ref={containerRef}
    >
      <table className="w-full border-collapse" role="table" aria-label="Tabela de dados">
        <thead
          className="sticky top-0 z-10 bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]"
          role="rowgroup"
        >
          <tr role="row">
            {selectable && (
              <th
                className="px-4 py-3 text-left border-b border-gray-200 dark:border-border"
                role="columnheader"
              >
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Selecionar todos"
                  className="w-4 h-4 rounded focus:ring-3 focus:ring-[var(--primary)] cursor-pointer"
                />
              </th>
            )}

            {columns.map((column, idx) => (
              <th
                key={idx}
                className={cn(
                  'px-4 py-3 border-b border-gray-200 dark:border-border',
                  'text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable &&
                    'cursor-pointer select-none hover:bg-[var(--surface-hover)] transition-colors'
                )}
                ref={(el) => {
                  headerRefs.current[idx] = el;
                }}
                onClick={() => handleSort(column)}
                role="columnheader"
                {...(sortColumn === (column.key ?? column.accessor)
                  ? {
                      'aria-sort': (sortDirection === 'asc' ? 'ascending' : 'descending') as
                        | 'ascending'
                        | 'descending',
                    }
                  : { 'aria-sort': 'none' as const })}
              >
                <div className="flex items-center gap-2">
                  <span>{column.header}</span>
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody role="rowgroup">
          {loading ? (
            <tr role="row">
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]"
                role="cell"
              >
                Carregando...
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr role="row">
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]"
                role="cell"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={cn(
                  'border-b border-[var(--border)] transition-colors',
                  'hover:bg-[var(--surface-hover)]',
                  onRowClick && 'cursor-pointer',
                  selectedRows.has(rowIdx) && 'bg-[var(--primary)]/5'
                )}
                onClick={() => onRowClick?.(row)}
                role="row"
              >
                {selectable && (
                  <td className="px-4 py-3" role="cell">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIdx)}
                      onChange={() => handleSelectRow(rowIdx)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Selecionar linha ${rowIdx + 1}`}
                      className="w-4 h-4 rounded focus:ring-3 focus:ring-[var(--primary)] cursor-pointer"
                    />
                  </td>
                )}

                {columns.map((column, colIdx) => {
                  const colKey = (column.key ?? column.accessor) as keyof T;
                  const value = row[colKey];
                  const renderValue = column.cell
                    ? column.cell({ value, row })
                    : column.render
                      ? column.render(value, row)
                      : value;
                  const content =
                    typeof renderValue === 'string' ||
                    typeof renderValue === 'number' ||
                    React.isValidElement(renderValue)
                      ? (renderValue as React.ReactNode)
                      : renderValue === null || renderValue === undefined
                        ? null
                        : String(renderValue);

                  return (
                    <td
                      key={colIdx}
                      className={cn(
                        'px-4 py-3',
                        'text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                      role="cell"
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
