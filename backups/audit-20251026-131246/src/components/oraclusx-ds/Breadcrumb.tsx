/**
 * OraclusX Design System - Breadcrumb Component
 * Migalhas de pão para navegação hierárquica
 *
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (nav role, aria-label, aria-current)
 * ✅ TypeScript strict
 */

import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  className?: string;
  maxItems?: number;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight size={16} />,
  showHome = true,
  className,
  maxItems,
}) => {
  // If maxItems is set, truncate middle items
  let displayItems = items;
  if (maxItems && items.length > maxItems) {
    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(-(maxItems - 1));
    displayItems = [
      ...firstItems,
      { label: "...", href: undefined },
      ...lastItems,
    ];
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg",
        "bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]",
        "shadow-[var(--shadow-light-inner)] dark:shadow-[var(--shadow-dark-inner)]",
        className,
      )}
    >
      <ol className="flex items-center gap-2 list-none">
        {showHome && (
          <>
            <li>
              <a
                href="/"
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md",
                  "text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]",
                  "hover:text-[var(--primary)] hover:bg-[var(--surface-hover)]",
                  "transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
                )}
                aria-label="Home"
              >
                <Home size={16} />
              </a>
            </li>
            {displayItems.length > 0 && (
              <li
                aria-hidden="true"
                className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]"
              >
                {separator}
              </li>
            )}
          </>
        )}

        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isTruncated = item.label === "...";

          return (
            <React.Fragment key={index}>
              <li>
                {isLast ? (
                  <span
                    className="flex items-center gap-2 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] font-medium"
                    aria-current="page"
                  >
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                  </span>
                ) : isTruncated ? (
                  <span className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded-md",
                      "text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]",
                      "hover:text-[var(--primary)] hover:bg-[var(--surface-hover)]",
                      "transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
                    )}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                  </a>
                )}
              </li>

              {!isLast && (
                <li
                  aria-hidden="true"
                  className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]"
                >
                  {separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
