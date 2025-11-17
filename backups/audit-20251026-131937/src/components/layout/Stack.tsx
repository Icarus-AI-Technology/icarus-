/**
 * Layout System - Stack Component
 * Sistema flexbox para layouts verticais e horizontais
 * Integrado com OraclusX DS (Neumorphic 3D Premium)
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface StackProps {
  children: ReactNode;
  className?: string;
  /**
   * Direção do stack
   * - vertical: coluna (padrão)
   * - horizontal: linha
   */
  direction?: "vertical" | "horizontal";
  /**
   * Espaçamento entre itens
   * - xs: 0.5rem (8px)
   * - sm: 1rem (16px)
   * - md: 1.5rem (24px) - padrão
   * - lg: 2rem (32px)
   * - xl: 3rem (48px)
   */
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Alinhamento dos itens no eixo principal
   */
  align?: "start" | "center" | "end" | "stretch";
  /**
   * Justificação dos itens no eixo secundário
   */
  justify?: "start" | "center" | "end" | "between" | "around";
  /**
   * Wrap (quebrar linha quando não couber)
   */
  wrap?: boolean;
  /**
   * Largura completa (100%)
   */
  fullWidth?: boolean;
}

const spacingClasses = {
  xs: "gap-2", // 8px
  sm: "gap-4", // 16px
  md: "gap-6", // 24px
  lg: "gap-8", // 32px
  xl: "gap-12", // 48px
};

const alignClasses = {
  vertical: {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  },
  horizontal: {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  },
};

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

/**
 * Stack Component (Vertical ou Horizontal)
 */
export function Stack({
  children,
  className,
  direction = "vertical",
  spacing = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  fullWidth = false,
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        spacingClasses[spacing],
        alignClasses[direction][align],
        justifyClasses[justify],
        wrap && "flex-wrap",
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * VStack Component (Stack Vertical - atalho)
 */
export function VStack(props: Omit<StackProps, "direction">) {
  return <Stack {...props} direction="vertical" />;
}

/**
 * HStack Component (Stack Horizontal - atalho)
 */
export function HStack(props: Omit<StackProps, "direction">) {
  return <Stack {...props} direction="horizontal" />;
}

/**
 * Spacer Component
 * Adiciona espaço flex entre elementos
 */
export function Spacer({ className }: { className?: string }) {
  return <div className={cn("flex-1", className)} />;
}

/**
 * Divider Component
 * Linha divisória horizontal ou vertical
 */
export interface DividerProps {
  className?: string;
  /**
   * Orientação do divider
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Espaçamento (margin) ao redor
   */
  spacing?: "sm" | "md" | "lg";
}

const dividerSpacingClasses = {
  horizontal: {
    sm: "my-2", // 8px
    md: "my-4", // 16px
    lg: "my-6", // 24px
  },
  vertical: {
    sm: "mx-2",
    md: "mx-4",
    lg: "mx-6",
  },
};

export function Divider({
  className,
  orientation = "horizontal",
  spacing = "md",
}: DividerProps) {
  return (
    <div
      className={cn(
        "bg-[var(--border)]",
        orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
        dividerSpacingClasses[orientation][spacing],
        className,
      )}
    />
  );
}
