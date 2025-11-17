import React from "react";
import { cn } from "@/lib/utils";

export interface MiniCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
  dense?: boolean;
}

const variantToClass: Record<NonNullable<MiniCardProps["variant"]>, string> = {
  default: "bg-[var(--orx-bg-light)]",
  success: "bg-[var(--orx-surface)]",
  warning: "bg-[var(--orx-surface)]",
  danger: "bg-[var(--orx-surface)]",
  info: "bg-[var(--orx-surface)]",
};

export const MiniCard: React.FC<MiniCardProps> = ({
  title,
  value,
  hint,
  icon,
  variant = "default",
  className,
  dense = true,
}) => {
  return (
    <div
      className={cn(
        "neumorphic-card rounded-xl border border-[var(--orx-border)]",
        variantToClass[variant],
        dense ? "p-4" : "p-6",
        className,
      )}
      role="group"
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[var(--orx-text-secondary)] mb-1 text-[0.813rem]">
            {title}
          </div>
          <div className="text-[var(--orx-text-primary)] font-bold">
            {value}
          </div>
          {hint && (
            <div className="mt-1 text-[var(--orx-text-muted)] text-[0.75rem]">
              {hint}
            </div>
          )}
        </div>
        {icon && <div className="neuro-inset p-2 rounded-lg">{icon}</div>}
      </div>
    </div>
  );
};
