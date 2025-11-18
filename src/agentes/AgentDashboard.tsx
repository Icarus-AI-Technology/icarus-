import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { AgentTasksList } from "./AgentTasksList";
import { AgentReportsList } from "./AgentReportsList";
import { AgentPerformance } from "./AgentPerformance";
import { CreateTaskDialog } from "./CreateTaskDialog";

interface DashboardStats {
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingReports: number;
  publishedReports: number;
  avgExecutionTime: number;
  complianceScore: number;
}

export function AgentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    pendingReports: 0,
    publishedReports: 0,
    avgExecutionTime: 0,
    complianceScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  useEffect(() => {
    loadDashboardStats();

    // Realtime subscription para atualizações
    const subscription = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_tasks",
        },
        () => {
          loadDashboardStats();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_reports",
        },
        () => {
          loadDashboardStats();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadDashboardStats() {
    try {
      // Buscar estatísticas de tarefas
      const { data: tasks } = await supabase
        .from("agent_tasks")
        .select("status, execution_time_ms");

      const activeTasks =
        tasks?.filter((t) => ["pending", "in_progress"].includes(t.status))
          .length || 0;

      const completedTasks =
        tasks?.filter((t) => t.status === "completed").length || 0;
      const failedTasks =
        tasks?.filter((t) => t.status === "failed").length || 0;

      const completedTasksData =
        tasks?.filter((t) => t.status === "completed" && t.execution_time_ms) ||
        [];

      const avgExecutionTime =
        completedTasksData.length > 0
          ? completedTasksData.reduce(
              (sum, t) => sum + t.execution_time_ms,
              0,
            ) / completedTasksData.length
          : 0;

      // Buscar estatísticas de relatórios
      const { data: reports } = await supabase
        .from("agent_reports")
        .select("status");

      const pendingReports =
        reports?.filter((r) => ["draft", "pending_review"].includes(r.status))
          .length || 0;

      const publishedReports =
        reports?.filter((r) => r.status === "published").length || 0;

      // Buscar score de compliance (última tarefa de compliance)
      const { data: lastCompliance } = await supabase
        .from("agent_tasks")
        .select("result_data")
        .eq("task_type", "compliance")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      const complianceScore =
        lastCompliance?.result_data?.summary?.compliance_score || 0;

      setStats({
        activeTasks,
        completedTasks,
        failedTasks,
        pendingReports,
        publishedReports,
        avgExecutionTime: Math.round(avgExecutionTime),
        complianceScore: parseFloat(complianceScore),
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes IA</h1>
          <p className="text-muted-foreground">
            Dashboard de orquestração e supervisão de agentes
          </p>
        </div>
        <Button onClick={() => setCreateTaskOpen(true)} size="lg">
          <PlayCircle className="mr-2 h-4 w-4" />
          Nova Análise
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Ativas
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedReports}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingReports} pendentes revisão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.avgExecutionTime / 1000).toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground">Por tarefa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.complianceScore >= 95
                ? "Excelente"
                : stats.complianceScore >= 80
                  ? "Bom"
                  : "Atenção"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">
            <Activity className="mr-2 h-4 w-4" />
            Tarefas
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <AgentTasksList />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <AgentReportsList />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <AgentPerformance />
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
      />
    </div>
  );
}
