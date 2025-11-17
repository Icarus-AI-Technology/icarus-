/**
 * Layout System - Container Component
 * Sistema de container responsivo com máxima largura configurável
 * Integrado com OraclusX DS (Neumorphic 3D Premium)
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * Tamanho máximo do container
   * - sm: 640px
   * - md: 768px
   * - lg: 1024px
   * - xl: 1280px (padrão)
   * - 2xl: 1536px
   * - full: 100%
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /**
   * Padding horizontal
   * - none: 0
   * - sm: 1rem (16px)
   * - md: 1.5rem (24px) - padrão
   * - lg: 2rem (32px)
   */
  padding?: "none" | "sm" | "md" | "lg";
  /**
   * Centralizar horizontalmente
   */
  center?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-screen-sm", // 640px
  md: "max-w-screen-md", // 768px
  lg: "max-w-screen-lg", // 1024px
  xl: "max-w-screen-xl", // 1280px
  "2xl": "max-w-screen-2xl", // 1536px
  full: "max-w-full",
};

const paddingClasses = {
  none: "px-0",
  sm: "px-4", // 16px
  md: "px-6", // 24px
  lg: "px-8", // 32px
};

/**
 * Container Component
 * Wrapper responsivo para conteúdo da página
 */
export function Container({
  children,
  className,
  maxWidth = "xl",
  padding = "md",
  center = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && "mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
