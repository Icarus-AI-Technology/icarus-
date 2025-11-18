import { useState, type FC } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/oraclusx-ds";
import {
  Wrench,
  Truck,
  Calendar,
  CheckCircle,
  Settings,
  TrendingUp,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { id: "geral", label: "Geral", icon: Wrench, count: 124, trend: "+15" },
  { id: "detalhes", label: "Detalhes", icon: Truck, count: 89, trend: "+8" },
  { id: "analytics", label: "Analytics", icon: Calendar, count: 56, trend: "+12" },
  { id: "config", label: "Config", icon: CheckCircle, count: 34, trend: "+5" },
] as const;

const KPI_CARDS = [
  { title: "Total", value: "303", trend: "+40", icon: Wrench, color: "blue" },
  { title: "Taxa", value: "97.3%", trend: "+2%", icon: Truck, color: "green" },
  { title: "IA", value: "97.3%", trend: "on", icon: Settings, color: "indigo" },
  { title: "Perf", value: "98%", trend: "+1%", icon: TrendingUp, color: "yellow" },
] as const;

const KPI_COLOR_CLASSES: Record<
  (typeof KPI_CARDS)[number]["color"],
  string
> = {
  blue:
    "bg-blue-100 dark:bg-blue-900/30 text-accent dark:text-accent-light",
  green:
    "bg-success/10 dark:bg-green-900/30 text-success dark:text-green-400",
  indigo:
    "bg-indigo-100 dark:bg-indigo-900/30 text-primary dark:text-indigo-400",
  yellow:
    "bg-warning/10 dark:bg-yellow-900/30 text-warning dark:text-yellow-400",
};

export const ManutencaoFrota: FC = () => {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORY_OPTIONS)[number]["id"]>("geral");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-2 font-display text-heading-lg text-primary dark:text-gray-100">
              Manutenção Frota IA
            </h1>
            <p className="text-secondary dark:text-muted">Sistema IA</p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2">
            <Settings className="animate-spin-slow text-inverse" size={20} />
            <div className="text-left">
              <p className="orx-orx-font-medium text-body-sm text-inverse">IA</p>
              <p className="text-body-xs text-indigo-100">97.3%</p>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {CATEGORY_OPTIONS.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`relative rounded-xl p-4 transition-all duration-200 ${
                    isActive
                      ? "scale-105 bg-primary text-inverse shadow-lg"
                      : "bg-surface hover:shadow-md dark:bg-card"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`rounded-lg p-2 ${
                        isActive ? "bg-surface/20" : "bg-surface dark:bg-muted"
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="orx-orx-font-medium mb-1 text-body-xs">
                        {category.label}
                      </p>
                      <span className="font-display text-[0.813rem] text-heading">
                        {category.count}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {KPI_CARDS.map((kpi, index) => {
            const Icon = kpi.icon;
            const colorClass = KPI_COLOR_CLASSES[kpi.color];

            return (
              <Card key={index} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-sm text-secondary dark:text-muted">
                      {kpi.title}
                    </p>
                    <p className="mt-1 font-display text-heading text-primary dark:text-gray-100">
                      {kpi.value}
                    </p>
                    <Badge variant="default" size="sm" className="mt-2">
                      {kpi.trend}
                    </Badge>
                  </div>
                  <div className={`rounded-lg p-3 ${colorClass}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manutenção Frota IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <Wrench className="mx-auto mb-4 text-muted" size={64} />
              <p className="text-secondary dark:text-muted">Módulo IA</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManutencaoFrota;
