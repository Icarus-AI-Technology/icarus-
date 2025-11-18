type NeuVariant = "raised" | "inset" | "flat";

export type BlurLevel = "sm" | "md" | "lg" | "xl";

export type AnimationType = "fade" | "slide" | "scale" | "bounce";

const neuVariantMap: Record<NeuVariant, string> = {
  raised: "neuro-raised",
  inset: "neuro-inset",
  flat: "neuro-flat",
};

export function neuStyle(variant: NeuVariant = "flat"): string {
  return neuVariantMap[variant] ?? neuVariantMap.flat;
}

export function enterAnimationStyle(delay = 0, duration = 300): {
  animationDelay: string;
  animationDuration: string;
} {
  return {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
  };
}

export function staggerDelay(index: number, baseDelay = 50): number {
  return index * baseDelay;
}

