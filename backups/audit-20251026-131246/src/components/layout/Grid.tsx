/**
 * Layout System - Grid Component
 * Sistema de grid responsivo com breakpoints personalizados
 * Integrado com OraclusX DS (Neumorphic 3D Premium)
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface GridProps {
  children: ReactNode;
  className?: string;
  /**
   * Número de colunas por breakpoint
   * Sintaxe: { sm: 1, md: 2, lg: 3, xl: 4 }
   */
  cols?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  /**
   * Gap entre itens (usando CSS variables)
   * - xs: 0.5rem (8px)
   * - sm: 1rem (16px)
   * - md: 1.5rem (24px) - padrão
   * - lg: 2rem (32px)
   * - xl: 3rem (48px)
   */
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Alinhamento vertical dos itens
   */
  align?: "start" | "center" | "end" | "stretch";
  /**
   * Justificação horizontal dos itens
   */
  justify?: "start" | "center" | "end" | "between" | "around";
}

const gapClasses = {
  xs: "gap-2", // 8px
  sm: "gap-4", // 16px
  md: "gap-6", // 24px
  lg: "gap-8", // 32px
  xl: "gap-12", // 48px
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

/**
 * Gera classes Tailwind para grid columns responsivo
 */
function getGridColsClasses(cols?: GridProps["cols"]): string {
  if (!cols) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; // Padrão

  const classes: string[] = [];

  if (cols.base) classes.push(`grid-cols-${cols.base}`);
  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
  if (cols["2xl"]) classes.push(`2xl:grid-cols-${cols["2xl"]}`);

  return classes.join(" ");
}

/**
 * Grid Component
 * Layout em grade responsivo e configurável
 */
export function Grid({
  children,
  className,
  cols,
  gap = "md",
  align = "stretch",
  justify = "start",
}: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        getGridColsClasses(cols),
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * GridItem Component
 * Item individual do grid com span configurável
 */
export interface GridItemProps {
  children: ReactNode;
  className?: string;
  /**
   * Número de colunas que o item ocupa por breakpoint
   */
  colSpan?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  /**
   * Número de linhas que o item ocupa
   */
  rowSpan?: number;
}

function getColSpanClasses(colSpan?: GridItemProps["colSpan"]): string {
  if (!colSpan) return "";

  const classes: string[] = [];

  if (colSpan.base) classes.push(`col-span-${colSpan.base}`);
  if (colSpan.sm) classes.push(`sm:col-span-${colSpan.sm}`);
  if (colSpan.md) classes.push(`md:col-span-${colSpan.md}`);
  if (colSpan.lg) classes.push(`lg:col-span-${colSpan.lg}`);
  if (colSpan.xl) classes.push(`xl:col-span-${colSpan.xl}`);
  if (colSpan["2xl"]) classes.push(`2xl:col-span-${colSpan["2xl"]}`);

  return classes.join(" ");
}

export function GridItem({
  children,
  className,
  colSpan,
  rowSpan,
}: GridItemProps) {
  return (
    <div
      className={cn(
        getColSpanClasses(colSpan),
        rowSpan && `row-span-${rowSpan}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
