/**
 * IA Vendas Dashboard
 * Diretor / Gerente / Operador KPIs com gradientes e gráficos
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, RadialProgress } from "@/components/oraclusx-ds";
import { OrxLineChart } from "@/components/charts/OrxLineChart";
import { OrxBarChart } from "@/components/charts/OrxBarChart";
import { TrendingUp, Clock, FileText, ThumbsUp } from "lucide-react";

const sparkData = [
  { id: "vendas", data: Array.from({ length: 12 }, (_, i) => ({ x: `${i + 1}`, y: Math.round(40 + Math.random() * 60) })) },
];

const barData = [
  { canal: "Inbound", qtd: 120 },
  { canal: "Outbound", qtd: 95 },
  { canal: "Parceiros", qtd: 60 },
];

export const IAVendasDashboard: React.FC = () => {
  const kpisDiretor = [
    {
      title: "Vendas Departamento",
      value: 78,
      gradient: [
        { offset: "0%", color: "#4f46e5" },
        { offset: "100%", color: "#22d3ee" },
      ],
      icon: <TrendingUp size={16} />,
    },
    {
      title: "Metas Trimestre",
      value: 62,
      gradient: [
        { offset: "0%", color: "#16a34a" },
        { offset: "100%", color: "#84cc16" },
      ],
      icon: <Badge variant="default">Q3</Badge>,
    },
    {
      title: "Pipeline",
      value: 45,
      gradient: [
        { offset: "0%", color: "#f59e0b" },
        { offset: "100%", color: "#f97316" },
      ],
      icon: <FileText size={16} />,
    },
    {
      title: "Budget",
      value: 88,
      gradient: [
        { offset: "0%", color: "#e11d48" },
        { offset: "100%", color: "#f43f5e" },
      ],
      icon: <Badge variant="default">R$</Badge>,
      critical: true,
    },
  ];

  const kpisGerente = [
    { title: "Vendas Equipe", value: 74, icon: <TrendingUp size={16} /> },
    { title: "Metas Atingidas", value: 58, icon: <Badge variant="default">OKR</Badge> },
    { title: "Pedidos Pendentes", value: 23, icon: <FileText size={16} /> },
    { title: "Prazo Entrega", value: 91, icon: <Clock size={16} /> },
  ];

  const kpisOperador = [
    { title: "Tarefas Dia", value: 12, icon: <FileText size={16} /> },
    { title: "Docs Processados", value: 46, icon: <FileText size={16} /> },
    { title: "Tempo Resposta", value: 82, icon: <Clock size={16} /> },
    { title: "Satisfação", value: 96, icon: <ThumbsUp size={16} /> },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-heading-lg text-primary dark:text-gray-100">IA Vendas Dashboard</h1>
          <Badge variant="default">Realtime</Badge>
        </header>

        {/* Diretor */}
        <section>
          <h2 className="text-body-lg text-secondary dark:text-muted mb-3">Diretor</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpisDiretor.map((kpi) => (
              <Card key={kpi.title} className="group relative overflow-hidden">
                {/* Shine overlay */}
                <span className="pointer-events-none absolute -inset-[200%] bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-60%] group-hover:translate-x-[60%] transition-transform duration-700" aria-hidden="true" />
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-body-sm text-secondary dark:text-muted">{kpi.title}</p>
                      <div className="mt-2">
                        <RadialProgress
                          value={kpi.value}
                          size={96}
                          strokeWidth={10}
                          gradientStops={kpi.gradient}
                          critical={Boolean(kpi.critical)}
                          label={<span className="text-heading font-display">{kpi.value}%</span>}
                          progressClassName="[filter:drop-shadow(0_0_6px_rgba(0,0,0,0.15))]"
                        />
                      </div>
                    </div>
                    <div className="neuro-inset p-2 rounded-lg group-hover:animate-pulse">{kpi.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Gerente */}
        <section>
          <h2 className="text-body-lg text-secondary dark:text-muted mb-3">Gerente</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpisGerente.map((kpi) => (
              <Card key={kpi.title}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-body-sm text-secondary dark:text-muted">{kpi.title}</p>
                    <p className="text-heading font-display text-primary dark:text-gray-100 mt-1">{kpi.value}</p>
                  </div>
                  <div className="neuro-inset p-2 rounded-lg">{kpi.icon}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Operador */}
        <section>
          <h2 className="text-body-lg text-secondary dark:text-muted mb-3">Operador</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpisOperador.map((kpi) => (
              <Card key={kpi.title}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-body-sm text-secondary dark:text-muted">{kpi.title}</p>
                    <p className="text-heading font-display text-primary dark:text-gray-100 mt-1">{kpi.value}</p>
                  </div>
                  <div className="neuro-inset p-2 rounded-lg">{kpi.icon}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Charts */}
        <section className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Sparkline Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <OrxLineChart data={sparkData as any} height={220} enablePoints={false} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              <OrxBarChart data={barData as any} keys={["qtd"]} indexBy="canal" height={220} />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default IAVendasDashboard;


