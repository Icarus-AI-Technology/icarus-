import {
  Activity,
  User2,
  Package,
  CalendarDays,
  FileSpreadsheet,
  AlertTriangle,
  Truck,
  Cpu,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Card, CardBody } from '@heroui/react';
import { Button } from '@/components/oraclusx-ds/Button';
import { DashboardKPI } from '../components/DashboardKPI';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Dados Mockados para os Gráficos
const dataFaturamento = [
  { name: 'Jan', valor: 2400 },
  { name: 'Fev', valor: 1398 },
  { name: 'Mar', valor: 9800 },
  { name: 'Abr', valor: 3908 },
  { name: 'Mai', valor: 4800 },
  { name: 'Jun', valor: 3800 },
  { name: 'Jul', valor: 4300 },
];

const dataDistribuicao = [
  { name: 'SP', value: 400 },
  { name: 'RJ', value: 300 },
  { name: 'MG', value: 300 },
  { name: 'RS', value: 200 },
];

const COLORS = ['#6366f1', '#2dd4bf', '#f43f5e', '#f59e0b'];

// Custom Tooltip para o tema Dark Glass
interface ChartTooltipPayload {
  name?: string;
  value?: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#181b29] border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload?.[0] && (
          <p className="text-primary text-sm">
            {`${payload[0].name ?? 'Valor'}: ${payload[0].value ?? 0}`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function DashboardPrincipal() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* HEADER DA PÁGINA */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Dashboard Principal
          </h1>
          <p className="text-sm text-slate-400">
            Visão geral do sistema ICARUS v5.0
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            color="success"
            variant="shadow"
            startContent={<Activity size={18} />}
            className="font-medium text-white"
          >
            Atualizar Dados
          </Button>
          <Button
            color="primary"
            variant="shadow"
            startContent={<FileSpreadsheet size={18} />}
            className="font-medium text-white"
          >
            Relatório Completo
          </Button>
        </div>
      </section>

      {/* LINHA DE KPIs PRINCIPAIS */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardKPI
          title="Sistema Status"
          value="98%"
          icon={Activity}
          subtitle="Disponibilidade"
          trend="+2.3%"
          trendPositive={true}
          color="secondary"
        />
        <DashboardKPI
          title="Médicos Ativos"
          value="1.847"
          icon={User2}
          subtitle="Últimos 30 dias"
          trend="+12.5%"
          trendPositive={true}
          color="primary"
        />
        <DashboardKPI
          title="Produtos OPME"
          value="12.4K"
          icon={Package}
          subtitle="Catálogo homologado"
          trend="+5.2%"
          trendPositive={true}
          color="warning"
        />
        <DashboardKPI
          title="Pedidos Urgentes"
          value="89"
          icon={CalendarDays}
          subtitle="Últimos 7 dias"
          trend="-8.1%"
          trendPositive={false}
          color="danger"
        />
      </section>

      {/* SEGUNDA LINHA: FATURAMENTO + DISTRIBUIÇÃO */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-white/5 bg-white/5 backdrop-blur-xl shadow-lg min-h-[350px]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-success/10 text-success">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 className="text-slate-400 font-medium">
                    Faturamento Mensal
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">R$ 3.8M</span>
                    <span className="text-success text-sm font-medium flex items-center">
                      <TrendingUp size={14} className="mr-1" /> +15.3%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataFaturamento}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="valor" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="border-white/5 bg-white/5 backdrop-blur-xl shadow-lg min-h-[350px]">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-slate-400 font-medium">
                    Distribuição Geográfica
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">147</span>
                    <span className="text-slate-500 text-sm">unidades em 28 cidades</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[250px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataDistribuicao}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataDistribuicao.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-[-20px]">
              {dataDistribuicao.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-slate-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>

      {/* TERCEIRA LINHA: ESTOQUE + LOGÍSTICA + PERFORMANCE */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estoque Crítico */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-xl shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-danger/10 text-danger">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-slate-300 font-medium">Estoque Crítico</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">8</div>
            <p className="text-sm text-slate-500">produtos em falta</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-danger h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </CardBody>
        </Card>

        {/* Logística */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-xl shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <Truck size={20} />
              </div>
              <h3 className="text-slate-300 font-medium">Logística</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">96.2%</div>
            <p className="text-sm text-slate-500">entregas no prazo</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-success h-full rounded-full" style={{ width: '96%' }}></div>
            </div>
          </CardBody>
        </Card>

        {/* Performance IA */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-xl shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <Cpu size={20} />
              </div>
              <h3 className="text-slate-300 font-medium">Performance IA</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">97.3%</div>
            <p className="text-sm text-slate-500">precisão do sistema</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '97%' }}></div>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
