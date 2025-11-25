import { useCallback, useEffect, useState } from 'react';
import { legacySupabase } from '@/lib/legacySupabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

type AgentTaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface AgentPerformanceSummaryRow {
  task_type: string | null;
  total_tasks: number;
  completed_count: number;
  failed_count: number;
  avg_execution_time_ms: number;
}

interface AgentTaskDailyRow {
  created_at: string;
  status: AgentTaskStatus;
}

interface DailyStats {
  date: string;
  total: number;
  completed: number;
  failed: number;
  pending: number;
}

interface PerformanceData {
  agentPerformance: AgentPerformanceSummaryRow[];
  dailyStats: DailyStats[];
}

interface AgentChartData {
  name: string;
  total: number;
  completed: number;
  failed: number;
  avgTime: number;
}

interface StatusSummary {
  completed: number;
  failed: number;
  pending: number;
}

export function AgentPerformance() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPerformanceData = useCallback(async () => {
    try {
      // Buscar dados da view de performance
      const { data: agentPerf } = await legacySupabase.from('agent_performance_summary').select('*');

      // Buscar dados de tarefas por dia (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: tasksByDay } = await legacySupabase
        .from('agent_tasks')
        .select('created_at, status')
        .gte('created_at', sevenDaysAgo.toISOString());

      const normalizedPerf = Array.isArray(agentPerf)
        ? (agentPerf as AgentPerformanceSummaryRow[])
        : [];
      // Processar dados
      const dailyStats = processTasksByDay((tasksByDay as AgentTaskDailyRow[] | null) || []);

      setPerformanceData({
        agentPerformance: normalizedPerf,
        dailyStats,
      });
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  function processTasksByDay(tasks: AgentTaskDailyRow[]): DailyStats[] {
    const dayMap: Record<string, DailyStats> = {};

    tasks.forEach((task) => {
      const date = new Date(task.created_at).toLocaleDateString('pt-BR');
      if (!dayMap[date]) {
        dayMap[date] = {
          date,
          total: 0,
          completed: 0,
          failed: 0,
          pending: 0,
        };
      }
      dayMap[date].total++;
      if (task.status === 'completed') dayMap[date].completed++;
      else if (task.status === 'failed') dayMap[date].failed++;
      else dayMap[date].pending++;
    });

    return Object.values(dayMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!performanceData) {
    return <div>Não há dados disponíveis.</div>;
  }

  const agentData: AgentChartData[] = performanceData.agentPerformance.map((agent) => ({
    name: agent.task_type ?? 'Desconhecido',
    total: agent.total_tasks,
    completed: agent.completed_count,
    failed: agent.failed_count,
    avgTime: agent.avg_execution_time_ms / 1000,
  }));

  const statusData = agentData.reduce<StatusSummary>(
    (acc, agent) => {
      acc.completed += agent.completed;
      acc.failed += agent.failed;
      acc.pending += agent.total - agent.completed - agent.failed;
      return acc;
    },
    { completed: 0, failed: 0, pending: 0 }
  );

  const pieData = [
    { name: 'Concluídas', value: statusData.completed || 0 },
    { name: 'Falhadas', value: statusData.failed || 0 },
    { name: 'Pendentes', value: statusData.pending || 0 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Tarefas por Dia (Últimos 7 Dias)</CardTitle>
          <CardDescription>Volume de tarefas criadas e concluídas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
              <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Concluídas" />
              <Line type="monotone" dataKey="failed" stroke="#ff7c7c" name="Falhadas" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Tipo de Agente</CardTitle>
          <CardDescription>Comparação de execução</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#82ca9d" name="Concluídas" />
              <Bar dataKey="failed" fill="#ff7c7c" name="Falhadas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Status</CardTitle>
          <CardDescription>Visão geral das tarefas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Tempo Médio de Execução por Agente</CardTitle>
          <CardDescription>Performance em segundos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgTime" fill="#8884d8" name="Tempo Médio (s)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
