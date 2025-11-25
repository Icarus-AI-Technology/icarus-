import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { LucideIcon } from "lucide-react";

interface DashboardKPIProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export const DashboardKPI: React.FC<DashboardKPIProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive,
  subtitle,
  color = "primary",
}) => {
  const colors = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  };

  return (
    <Card className="border-white/5 bg-white/5 backdrop-blur-xl shadow-lg">
      <CardBody className="flex flex-row items-center justify-between gap-4 p-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-400">{title}</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {trend && (
              <Chip
                size="sm"
                variant="flat"
                color={trendPositive ? "success" : "danger"}
                classNames={{
                  content: "font-semibold px-1",
                }}
              >
                {trend}
              </Chip>
            )}
          </div>
          {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </CardBody>
    </Card>
  );
};

