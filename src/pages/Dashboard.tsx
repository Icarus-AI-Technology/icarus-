import { useEffect, useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  Input, 
  Avatar, 
  Badge, 
  Progress,
  CircularProgress,
} from "@heroui/react";
import {
  Search,
  Bell,
  Activity,
  MessageSquare,
  Settings,
  LogOut,
  Package,
  Truck,
  TrendingUp,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { AIChatWidget } from '../components/AIChatWidget';
import {
  fetchDashboardKpis,
  fetchDashboardMonthlyRevenue,
  fetchDashboardSpecialties,
  fetchDashboardStates,
} from '@/lib/api/dashboard';

// --- TYPE DEFINITIONS ---

interface ChartDataPoint {
  year?: string;
  name?: string;
  v?: number;
  v1?: number;
  v2?: number;
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface StateSeries {
  state: string;
  series: number[];
  color: string;
}

interface ProgressItem {
  label: string;
  val: number;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface CircularStatItem {
  val: number;
  label: string;
  sub: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface SliderMetric {
  l: string;
  v: number;
  max: number;
}

interface Notification {
  msg: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof Activity;
}

// --- MOCK DATA (Contexto: Distribuidora Médica) ---

const fallbackLineChartData: ChartDataPoint[] = [
  { year: '2019', v1: 30, v2: 45 },
  { year: '2020', v1: 45, v2: 35 },
  { year: '2021', v1: 35, v2: 55 },
  { year: '2022', v1: 50, v2: 40 },
  { year: '2023', v1: 45, v2: 60 },
  { year: '2024', v1: 60, v2: 50 },
];

const fallbackAreaChartData: ChartDataPoint[] = [
  { name: 'Jan', v1: 30, v2: 20 },
  { name: 'Fev', v1: 45, v2: 30 },
  { name: 'Mar', v1: 35, v2: 45 },
  { name: 'Abr', v1: 50, v2: 35 },
  { name: 'Mai', v1: 40, v2: 50 },
  { name: 'Jun', v1: 60, v2: 40 },
];

const barChartData: ChartDataPoint[] = [
  { name: '2019', v: 65 },
  { name: '2020', v: 45 },
  { name: '2021', v: 75 },
  { name: '2022', v: 55 },
  { name: '2023', v: 85 },
];

const fallbackPieData: PieDataPoint[] = [
  { name: 'Ortopedia', value: 68, color: '#2dd4bf' },
  { name: 'Cardiologia', value: 37, color: '#6366f1' },
  { name: 'Neurologia', value: 49, color: '#10b981' },
];

const fallbackProgressItems: ProgressItem[] = [
  { label: 'VENDAS', val: 87, color: 'primary' },
  { label: 'ENTREGAS', val: 91, color: 'secondary' },
  { label: 'ESTOQUE', val: 63, color: 'success' },
  { label: 'DEVOLUÇÃO', val: 12, color: 'warning' },
  { label: 'CLIENTES', val: 89, color: 'danger' },
  { label: 'CONTRATOS', val: 48, color: 'primary' }
];

const fallbackCircularStats: CircularStatItem[] = [
  { val: 57, label: 'PEDIDOS', sub: 'Em Aberto', color: 'success' },
  { val: 43, label: 'LOGÍSTICA', sub: 'Em Trânsito', color: 'secondary' },
  { val: 36, label: 'FATURAMENTO', sub: 'Meta Mensal', color: 'primary' }
];

const fallbackStateDistribution: StateSeries[] = [
  { state: 'SP', series: [12, 15, 14, 18, 21, 19, 22], color: '#2dd4bf' },
  { state: 'RJ', series: [8, 9, 7, 11, 13, 12, 14], color: '#6366f1' },
  { state: 'MG', series: [5, 6, 7, 6, 8, 7, 9], color: '#f43f5e' },
  { state: 'RS', series: [4, 5, 4, 6, 7, 6, 8], color: '#f59e0b' },
];

const sliderMetrics: SliderMetric[] = [
  { l: 'RESSONÂNCIA', v: 80, max: 34 },
  { l: 'ULTRASSOM', v: 60, max: 82 },
  { l: 'RAIO-X DIGITAL', v: 45, max: 56 },
  { l: 'MONITORES', v: 30, max: 120 }
];

const notifications: Notification[] = [
  { msg: "Pedido #1234 aprovado", time: "2 min", type: "success" },
  { msg: "Alerta: Estoque baixo (Seringas)", time: "15 min", type: "warning" },
  { msg: "Novo cadastro: Hospital Central", time: "1h", type: "info" },
  { msg: "Falha no backup automático", time: "3h", type: "danger" },
];

// --- COMPONENTS ---

interface SparklineProps {
  color: string;
  data?: number[];
}

function Sparkline({ color, data }: SparklineProps) {
  const source = data && data.length > 0 ? data : [10, 15, 8, 12, 20, 16];
  const sparklineData = source.map((value, index) => ({ value, index }));

  return (
    <div className="h-8 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sparklineData}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TooltipPayload {
  name?: string;
  value?: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-lg shadow-xl">
        <p className="text-white text-xs font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-xs">
            {entry.name || 'Valor'}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(fallbackProgressItems);
  const [circularData, setCircularData] = useState(fallbackCircularStats);
  const [specialtyData, setSpecialtyData] = useState(fallbackPieData);
  const [stateMetrics, setStateMetrics] = useState(fallbackStateDistribution);
  const [areaData, setAreaData] = useState(fallbackAreaChartData);
  const [lineData, setLineData] = useState(fallbackLineChartData);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: Activity },
    { id: 'sales', label: 'Vendas', icon: TrendingUp },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'logistics', label: 'Logística', icon: Truck },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  useEffect(() => {
    let active = true;

    const loadMetrics = async () => {
      setMetricsLoading(true);
      setMetricsError(null);

      try {
        const results = await Promise.allSettled([
          fetchDashboardKpis(),
          fetchDashboardSpecialties(),
          fetchDashboardStates(),
          fetchDashboardMonthlyRevenue('12m'),
        ]);

        if (!active) return;

        const [kpis, specialties, states, revenue] = results;
        let hadFailure = false;

        if (kpis.status === 'fulfilled') {
          const mappedProgress: ProgressItem[] =
            kpis.value.progress?.map((item, index) => ({
              label: item.label.toUpperCase(),
              val: item.value,
              color: fallbackProgressItems[index]?.color ?? 'primary',
            })) ?? fallbackProgressItems;
          const mappedCircular: CircularStatItem[] =
            kpis.value.circular?.map((item, index) => ({
              val: item.value,
              label: item.label.toUpperCase(),
              sub: item.subLabel,
              color: fallbackCircularStats[index]?.color ?? 'primary',
            })) ?? fallbackCircularStats;
          setProgressData(mappedProgress);
          setCircularData(mappedCircular);
        } else {
          hadFailure = true;
          console.error('Falha ao carregar KPIs do dashboard.', kpis.reason);
        }

        if (specialties.status === 'fulfilled') {
          const slices =
            specialties.value.slices?.map((slice, index) => ({
              name: slice.name,
              value: slice.value,
              color: slice.color ?? fallbackPieData[index % fallbackPieData.length].color,
            })) ?? fallbackPieData;
          setSpecialtyData(slices);
        } else {
          hadFailure = true;
          console.error('Falha ao carregar distribuição por especialidade.', specialties.reason);
        }

        if (states.status === 'fulfilled') {
          const mappedStates =
            states.value.states?.map((entry, index) => ({
              state: entry.state,
              series: entry.series,
              color: fallbackStateDistribution[index % fallbackStateDistribution.length].color,
            })) ?? fallbackStateDistribution;
          setStateMetrics(mappedStates);
        } else {
          hadFailure = true;
          console.error('Falha ao carregar distribuição por estado.', states.reason);
        }

        if (revenue.status === 'fulfilled') {
          const areaSeries = revenue.value.series.map((point) => ({
            name: point.month,
            v1: Math.round(point.faturamento * 1000),
            v2: point.pedidosUrgentes,
          }));
          const lineSeries = revenue.value.series.map((point) => ({
            year: point.month,
            v1: point.capacidadeOperacional,
            v2: point.pedidosUrgentes,
          }));
          setAreaData(areaSeries);
          setLineData(lineSeries);
        } else {
          hadFailure = true;
          console.error('Falha ao carregar faturamento mensal.', revenue.reason);
        }

        if (hadFailure) {
          setMetricsError('Falha ao sincronizar métricas em tempo real. Exibindo dados offline.');
        }
      } catch (error) {
        if (!active) return;
        console.error('Erro inesperado ao carregar métricas do dashboard.', error);
        setMetricsError('Erro inesperado ao sincronizar métricas. Exibindo dados offline.');
      } finally {
        if (active) {
          setMetricsLoading(false);
        }
      }
    };

    loadMetrics();

    return () => {
      active = false;
    };
  }, []);

  const getNotificationColor = (type: Notification['type']): string => {
    const colorMap: Record<Notification['type'], string> = {
      success: 'bg-success',
      warning: 'bg-warning',
      info: 'bg-primary',
      danger: 'bg-danger'
    };
    return colorMap[type];
  };

  return (
    <div className="flex h-screen overflow-hidden bg-orx-bg-app text-foreground font-sans selection:bg-primary/30">
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-72 shrink-0 hidden md:flex flex-col gap-4 p-4 border-r border-white/5 bg-orx-bg-app/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="p-2 bg-gradient-to-tr from-primary to-secondary rounded-xl shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            <Activity className="text-black" size={24} />
          </div>
          <div className="hidden lg:flex flex-col">
            <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-white">
              ICARUS
            </p>
            <p className="text-[10px] text-default-500 tracking-widest uppercase">v6.0 Gestão AI</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 mt-4">
          {navItems.map((item, i) => (
            <Button 
              key={item.id} 
              variant={i === 0 ? "flat" : "light"} 
              color={i === 0 ? "primary" : "default"}
              className={`justify-start h-12 ${i === 0 ? 'bg-primary/10 text-primary' : 'text-default-400 hover:text-white'}`}
              startContent={
                <item.icon size={20} className={i === 0 ? "text-primary" : "text-default-400"} />
              }
              onClick={() => item.id === 'dashboard' && navigate('/')}
            >
              <span className="hidden lg:block">{item.label}</span>
            </Button>
          ))}
        </div>

        <div className="mt-auto">
          <Card className="bg-white/5 border border-white/5 backdrop-blur-md shadow-none">
             <CardBody className="flex flex-row gap-3 items-center p-3 overflow-hidden">
               <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" isBordered color="secondary" size="sm" />
               <div className="hidden lg:block overflow-hidden">
                 <p className="text-sm font-bold text-white truncate">Dr. Silva</p>
                 <p className="text-xs text-default-400">Administrador</p>
               </div>
             </CardBody>
          </Card>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Decorative Background Glows */}
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-orx-bg-app/80 backdrop-blur-md z-10">
          <div className="w-96">
            <Input 
              classNames={{
                base: "max-w-full h-10",
                mainWrapper: "h-full",
                input: "text-small text-white",
                inputWrapper: "h-full font-normal text-default-500 bg-white/5 border border-white/10 hover:border-primary/50 focus-within:!border-primary/80 transition-colors",
              }}
              placeholder="Buscar dispositivos, lotes ou clientes..."
              size="sm"
              startContent={<Search size={18} />}
              isClearable
              type="search"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="light" isIconOnly className="text-default-400 hover:text-white">
              <MessageSquare size={20} />
            </Button>
            <div className="relative">
              <Button variant="light" isIconOnly className="text-default-400 hover:text-white">
                <Bell size={20} />
              </Button>
              <Badge
                variant="error"
                size="sm"
                className="absolute -top-1 -right-1 border-none shadow-[0_0_8px_rgba(243,18,96,0.5)] px-1.5 py-0 text-[10px]"
              >
                3
              </Badge>
            </div>
            <Button 
              className="bg-white/5 border border-white/10 text-default-400 hover:text-white hover:bg-white/10"
              endContent={<LogOut size={16} />}
            >
              Sair
            </Button>
          </div>
        </header>

        {(metricsLoading || metricsError) && (
          <div className="px-8 pt-2 space-y-1">
            {metricsLoading && !metricsError && (
              <p className="text-[11px] text-default-500">
                Sincronizando métricas em tempo real...
              </p>
            )}
            {metricsError && (
              <p className="text-[11px] text-warning flex items-center gap-1">
                <AlertTriangle size={12} />
                {metricsError}
              </p>
            )}
          </div>
        )}

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">

            {/* --- LEFT COLUMN (3/12) --- */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* 1. PROGRESS STATS */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl">
                <CardBody className="p-6 gap-5">
                  {progressData.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-default-400 w-20">{item.label}</span>
                      <Progress 
                        aria-label={item.label}
                        value={item.val} 
                        color={item.color} 
                        size="sm" 
                        className="flex-1"
                        classNames={{
                          track: "bg-white/5",
                          indicator: "shadow-[0_0_10px_currentColor]"
                        }}
                      />
                      <span className="text-xs font-bold text-white w-8 text-right">{item.val}%</span>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {/* 2. PIE CHART & SPARKLINES */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl min-h-[320px]">
                <CardBody className="p-6 flex flex-col items-center justify-center relative">
                  {/* Chart */}
                  <div className="w-48 h-48 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={specialtyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {specialtyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                      <span className="text-2xl font-bold text-white">
                        {specialtyData[0]?.value ?? 0}%
                      </span>
                      <span className="text-[10px] text-default-400">
                        {specialtyData[0]?.name ?? 'Especialidade'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Sparklines Grid */}
                  <div className="grid grid-cols-4 gap-2 w-full mt-6 border-t border-white/5 pt-4">
                    {stateMetrics.map((entry) => (
                      <div key={entry.state} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-default-400">{entry.state}</span>
                        <Sparkline color={entry.color} data={entry.series} />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* 3. BAR CHART */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl flex-1 min-h-[200px]">
                 <CardBody className="p-0 pb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{top: 20, right: 20, bottom: 0, left: 0}}>
                        <Bar dataKey="v" fill="#2dd4bf" radius={[4, 4, 0, 0]} className="opacity-80 hover:opacity-100 transition-opacity" />
                        <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                      </BarChart>
                    </ResponsiveContainer>
                 </CardBody>
              </Card>

            </div>

            {/* --- CENTER COLUMN (5/12) --- */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* 1. CIRCULAR STATS */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl">
                <CardBody className="p-8 flex justify-around items-center">
                  {circularData.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <CircularProgress 
                          value={item.val} 
                          color={item.color} 
                          size="lg" 
                          strokeWidth={4}
                          classNames={{
                            svg: "w-24 h-24 drop-shadow-[0_0_10px_currentColor]",
                            track: "stroke-white/5",
                            value: "text-lg font-bold text-white"
                          }}
                          showValueLabel={true}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-white">{item.label}</p>
                        <p className="text-[10px] text-default-400 uppercase">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {/* 2. GEOGRAPHIC DISTRIBUTION PLACEHOLDER (Replacing react-simple-maps) */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl flex-1 min-h-[300px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.05)_0%,transparent_70%)] pointer-events-none" />
                <CardBody className="p-6 relative flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Distribuição Geográfica</h3>
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-[10px] text-gray-300">Unidades Ativas</span>
                    </div>
                  </div>
                  
                  {/* Simplified Map Representation */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                      {[
                        { name: 'Rio de Janeiro', units: 12, status: 'Operacional' },
                        { name: 'Niterói', units: 8, status: 'Operacional' },
                        { name: 'Vitória', units: 6, status: 'Operacional' },
                        { name: 'Vila Velha', units: 5, status: 'Operacional' },
                      ].map((location, idx) => (
                        <div key={idx} className="glass-panel p-4 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-xs font-bold text-white">{location.name}</h4>
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_currentColor]"></div>
                          </div>
                          <p className="text-[10px] text-default-400">{location.units} unidades</p>
                          <p className="text-[10px] text-success">{location.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 3. STATS & DOT MATRIX */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl">
                <CardBody className="p-6">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { l: 'PEDIDOS HOJE', v: 124 }, 
                      { l: 'NOVOS CLIENTES', v: 86 },
                      { l: 'EM TRÂNSITO', v: 42 }, 
                      { l: 'CIRURGIAS', v: 315 }
                    ].map((s, i) => (
                       <div key={i} className="text-center">
                         <h3 className="text-xl font-bold text-white">{s.v}</h3>
                         <p className="text-[10px] font-bold text-default-500 mt-1">{s.l}</p>
                         <p className="text-[8px] text-default-400 mt-1">agendadas</p>
                       </div>
                    ))}
                  </div>
                  
                  {/* Dot Matrix Simulation */}
                  <div className="bg-black/20 rounded-xl p-4 flex flex-col gap-3">
                    {['MATERIAIS', 'IMPLANTES', 'DESCART.', 'EQUIPAM.'].map((rowLabel, rowIdx) => (
                      <div key={rowIdx} className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-default-400 w-16">{rowLabel}</span>
                        <div className="flex-1 flex justify-between">
                          {Array.from({ length: 20 }).map((_, colIdx) => (
                            <div 
                              key={colIdx} 
                              className={`w-1.5 h-1.5 rounded-full ${
                                Math.random() > 0.7 ? 'bg-primary shadow-[0_0_5px_currentColor]' : 'bg-white/10'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-default-500 w-12 text-right">R$ {3 + rowIdx}K</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

            </div>

            {/* --- RIGHT COLUMN (4/12) --- */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* 1. LINE CHART */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl min-h-[300px]">
                <CardBody className="p-0 pb-4 pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="year" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="v1" stroke="#2dd4bf" strokeWidth={3} dot={false} className="drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                      <Line type="monotone" dataKey="v2" stroke="#6366f1" strokeWidth={3} dot={false} className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {/* 2. AREA WAVE CHART */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl min-h-[250px]">
                 <CardHeader className="px-6 pt-6 pb-0 flex justify-between items-start">
                   <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded bg-primary" />
                       <span className="text-xs text-default-400">R$ 64.7k</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded bg-secondary" />
                       <span className="text-xs text-default-400">R$ 73.9k</span>
                     </div>
                   </div>
                 </CardHeader>
                 <CardBody className="p-0">
                   <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={areaData} margin={{top: 20, right: 0, left: 0, bottom: 0}}>
                       <defs>
                         <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <Tooltip content={<CustomTooltip />} />
                       <Area type="monotone" dataKey="v1" stroke="#2dd4bf" fill="url(#splitColor)" strokeWidth={2} />
                       <Area type="monotone" dataKey="v2" stroke="#6366f1" fill="transparent" strokeWidth={2} />
                     </AreaChart>
                   </ResponsiveContainer>
                 </CardBody>
              </Card>

              {/* 3. SLIDER METRICS */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl">
                <CardBody className="p-6 gap-6">
                  {sliderMetrics.map((item, i) => (
                    <div key={i} className="relative">
                      <div className="flex justify-between text-[10px] text-default-400 mb-1 font-bold tracking-wider">
                        <span>{item.l}</span>
                        <span>{item.max} un.</span>
                      </div>
                      {/* Custom Slider Visual using Progress styled like a slider */}
                      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${item.v}%` }} 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/50 to-primary rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
                        />
                        {/* Glowing Dot at the end */}
                        <div 
                          style={{ left: `${item.v}%` }} 
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                        />
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {/* 4. NOTIFICAÇÕES DO SISTEMA */}
              <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl flex-1">
                <CardHeader className="px-6 pt-6 pb-2">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-default-400 tracking-wider">NOTIFICAÇÕES</span>
                    <span className="inline-flex items-center justify-center text-[10px] font-bold text-white bg-red-500/80 rounded-full w-5 h-5 shadow-[0_0_8px_rgba(243,18,96,0.5)]">
                      5
                    </span>
                  </div>
                </CardHeader>
                <CardBody className="p-6 pt-2 gap-4">
                  {notifications.map((note, i) => (
                    <div key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-none last:pb-0">
                      <div className={`mt-1 w-2 h-2 rounded-full ${getNotificationColor(note.type)}`} />
                      <div className="flex-1">
                        <p className="text-xs text-white font-medium">{note.msg}</p>
                        <p className="text-[10px] text-default-500">{note.time} atrás</p>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

            </div>
            
          </div>
        </div>

        {/* Floating Chatbot */}
        <AIChatWidget />
      </main>
    </div>
  );
}
