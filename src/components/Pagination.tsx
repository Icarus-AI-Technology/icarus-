/**
 * OraclusX Design System - Pagination Component
 * Paginação de dados com page size configurável
 * 
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (nav role, aria-label, aria-current)
 * ✅ TypeScript strict
 */

import React from"react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from"lucide-react";
import { cn } from"@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  totalItems?: number;
  className?: string;
  showFirstLast?: boolean;
  showPageSize?: boolean;
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems,
  className,
  showFirstLast = true,
  showPageSize = true,
  maxVisiblePages = 7
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show with ellipsis
      const leftOffset = Math.floor(maxVisiblePages / 2);
      const rightOffset = Math.ceil(maxVisiblePages / 2);

      let start = Math.max(1, currentPage - leftOffset);
      let end = Math.min(totalPages, currentPage + rightOffset);

      if (currentPage <= leftOffset) {
        end = maxVisiblePages;
      }

      if (currentPage >= totalPages - rightOffset) {
        start = totalPages - maxVisiblePages + 1;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);

  return (
    <nav
      aria-label="Paginação"
      className={cn("flex items-center justify-between gap-4 px-4 py-3 rounded-lg","bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]","shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]",
        className
      )}
    >
      {/* Items Info */}
      {totalItems !== undefined && (
        <div className="hidden sm:block text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
          Mostrando <span className="orx-font-medium">{startItem}</span> a{" "}
          <span className="orx-font-medium">{endItem}</span> de{" "}
          <span className="orx-font-medium">{totalItems}</span> registros
        </div>
      )}

      {/* Page Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Primeira página"
            className={cn("p-2 rounded-md transition-colors","focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
              currentPage === 1
                ?"opacity-50 cursor-not-allowed"
                :"hover:bg-[var(--surface-hover)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]"
            )}
          >
            <ChevronsLeft size={18} />
          </button>
        )}

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className={cn("p-2 rounded-md transition-colors","focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
            currentPage === 1
              ?"opacity-50 cursor-not-allowed"
              :"hover:bg-[var(--surface-hover)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]"
          )}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, idx) => {
          if (page ==="...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-3 py-1 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              aria-label={`Página ${pageNum}`}
              aria-current={isActive ?"page" : undefined}
              className={cn("px-3 py-1 rounded-md transition-all min-w-[40px]","focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
                isActive
                  ?"bg-[var(--primary)] text-inverse shadow-md"
                  :"hover:bg-[var(--surface-hover)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]"
              )}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
          className={cn("p-2 rounded-md transition-colors","focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
            currentPage === totalPages
              ?"opacity-50 cursor-not-allowed"
              :"hover:bg-[var(--surface-hover)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]"
          )}
        >
          <ChevronRight size={18} />
        </button>

        {/* Last Page */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Última página"
            className={cn("p-2 rounded-md transition-colors","focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
              currentPage === totalPages
                ?"opacity-50 cursor-not-allowed"
                :"hover:bg-[var(--surface-hover)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]"
            )}
          >
            <ChevronsRight size={18} />
          </button>
        )}
      </div>

      {/* Page Size Selector */}
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]"
          >
            Por página:
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn("px-3 py-1 rounded-md border-0","bg-surface dark:bg-card","text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]","focus:outline-none focus:ring-2 focus:ring-[var(--primary)]","cursor-pointer"
            )}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </nav>
  );
};

