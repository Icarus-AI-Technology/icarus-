/**
 * NeomorphicIconBox - ICARUS v5.0
 * Mini-card neumórfico premium com efeito 3D
 *
 * Características:
 * - 4 camadas de sombras (2 externas + 2 internas)
 * - 3 tamanhos (sm, md, lg)
 * - 17 variantes de cores
 * - Interatividade completa (hover, active)
 * - Animação suave (300ms cubic-bezier)
 * - Modo claro/escuro automático
 */

import { LucideIcon } from "lucide-react";
import { CSSProperties } from "react";

// Type aliases para exports
export type IconColorVariant =
  | "indigo"
  | "purple"
  | "orange"
  | "red"
  | "green"
  | "blue"
  | "pink"
  | "yellow"
  | "teal"
  | "cyan"
  | string;

export type IconSize = "sm" | "md" | "lg";

export interface NeomorphicIconBoxProps {
  icon: LucideIcon;
  colorVariant?: IconColorVariant;
  size?: IconSize;
  className?: string;
  iconColor?: string;
}

// Mapa de cores pré-definidas (agora com transparência para Liquid Glass)
const COLOR_VARIANTS: Record<string, string> = {
  indigo: "rgba(129, 140, 248, 0.85)", // linear-gradient convertido para rgba
  purple: "rgba(167, 139, 250, 0.85)",
  orange: "rgba(251, 146, 60, 0.85)",
  red: "rgba(248, 113, 113, 0.85)",
  green: "rgba(52, 211, 153, 0.85)",
  blue: "rgba(96, 165, 250, 0.85)",
  pink: "rgba(244, 114, 182, 0.85)",
  yellow: "rgba(251, 191, 36, 0.85)",
  teal: "rgba(45, 212, 191, 0.85)",
  cyan: "rgba(34, 211, 238, 0.85)",
};

// Dimensões por tamanho
const SIZES = {
  sm: { box: 40, icon: 16 },
  md: { box: 56, icon: 20 },
  lg: { box: 64, icon: 24 },
};

export function NeomorphicIconBox({
  icon: Icon,
  colorVariant = "indigo",
  size = "md",
  className = "",
  iconColor = "#ffffff",
}: NeomorphicIconBoxProps) {
  const dimensions = SIZES[size];
  const background = COLOR_VARIANTS[colorVariant] || colorVariant;

  // Sombras baseadas no tamanho
  const getShadows = (intensity: "normal" | "hover") => {
    const baseBlur = size === "sm" ? 12 : size === "md" ? 16 : 20;
    const factor = intensity === "hover" ? 1.5 : 1;

    return `
      ${baseBlur * factor}px ${baseBlur * factor}px ${baseBlur * 2 * factor}px rgba(0, 0, 0, 0.${intensity === "hover" ? "25" : "2"}),
      -${baseBlur * 0.5 * factor}px -${baseBlur * 0.5 * factor}px ${baseBlur * 1.5 * factor}px rgba(255, 255, 255, 0.0${intensity === "hover" ? "8" : "5"}),
      inset ${baseBlur * 0.25}px ${baseBlur * 0.25}px ${baseBlur * 0.75}px rgba(0, 0, 0, 0.${intensity === "hover" ? "2" : "15"}),
      inset -${baseBlur * 0.25}px -${baseBlur * 0.25}px ${baseBlur * 0.75}px rgba(255, 255, 255, 0.1${intensity === "hover" ? "2" : ""})
    `;
  };

  const baseStyle: CSSProperties = {
    width: `${dimensions.box}px`,
    height: `${dimensions.box}px`,
    background,
    backdropFilter: "blur(12px) saturate(180%)", // Liquid Glass
    WebkitBackdropFilter: "blur(12px) saturate(180%)", // Safari
    border: "1px solid rgba(255, 255, 255, 0.18)", // Borda translúcida
    borderRadius: "8px",
    boxShadow: getShadows("normal"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    flexShrink: 0,
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
        e.currentTarget.style.boxShadow = getShadows("hover");
        // Efeitos Liquid Glass no hover
        e.currentTarget.style.backdropFilter = "blur(16px) saturate(200%)";
        e.currentTarget.style.setProperty(
          "-webkit-backdrop-filter",
          "blur(16px) saturate(200%)",
        );
        // Aumenta opacidade no hover (de 0.85 para 0.95)
        if (COLOR_VARIANTS[colorVariant]) {
          const colorValue = COLOR_VARIANTS[colorVariant].replace(
            "0.85",
            "0.95",
          );
          e.currentTarget.style.background = colorValue;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = getShadows("normal");
        // Restaura efeitos Liquid Glass
        e.currentTarget.style.backdropFilter = "blur(12px) saturate(180%)";
        e.currentTarget.style.setProperty(
          "-webkit-backdrop-filter",
          "blur(12px) saturate(180%)",
        );
        // Restaura opacidade original
        if (COLOR_VARIANTS[colorVariant]) {
          e.currentTarget.style.background = COLOR_VARIANTS[colorVariant];
        }
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
      }}
    >
      <Icon size={dimensions.icon} color={iconColor} strokeWidth={2} />
    </div>
  );
}
