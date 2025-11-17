"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, CheckCircle, XCircle, Clock } from "lucide-react";

type AgentStatus = {
  name: string;
  status: "online" | "offline";
  commands: number;
  commandsList: string[];
  lastCheck: string;
};

type DashboardData = {
  agents: AgentStatus[];
  totalAgents: number;
  totalCommands: number;
  validation: any;
  metrics?: {
    totalExecutions: number;
    avgExecutionTime: number;
    successRate: number;
    executions: Array<{
      agent: string;
      action: string;
      executionTime: number;
      success: boolean;
      timestamp: string;
    }>;
  };
};

export default function AdminAgentesPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, metricsRes] = await Promise.all([
        fetch("/api/agents/status"),
        fetch("/api/agents/metrics"),
      ]);

      const statusData = await statusRes.json();
      const metricsData = await metricsRes.json();

      setData({
        ...statusData,
        metrics: metricsData.metrics,
      });
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5000); // Refresh a cada 5s

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Agentes ICARUS</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Agentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalAgents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ativos e operacionais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Comandos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalCommands || 0}</div>
            <p className="text-xs text-muted-foreground">Total de ações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.metrics?.successRate?.toFixed(1) || "100"}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.metrics?.totalExecutions || 0} execuções
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.metrics?.avgExecutionTime?.toFixed(0) || "0"}ms
            </div>
            <p className="text-xs text-muted-foreground">Performance média</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Agentes</CardTitle>
          <CardDescription>
            Estado atual de cada agente do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      agent.status === "online" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {agent.commands} comandos disponíveis
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{agent.status}</Badge>
                  <Button variant="outline" size="sm">
                    Ver Comandos
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      {data?.metrics?.executions && data.metrics.executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execuções Recentes</CardTitle>
            <CardDescription>
              Últimas ações executadas pelos agentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.metrics.executions
                .slice(-10)
                .reverse()
                .map((exec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      {exec.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {exec.agent} → {exec.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(exec.timestamp).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{exec.executionTime}ms</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Status */}
      {data?.validation && (
        <Card>
          <CardHeader>
            <CardTitle>Última Validação de Topologia IA</CardTitle>
            <CardDescription>
              Status da validação de configurações de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  variant={
                    data.validation.status === "PASS"
                      ? "default"
                      : "destructive"
                  }
                >
                  {data.validation.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Modo:</span>
                <span>{data.validation.mode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Violações:</span>
                <span
                  className={
                    data.validation.violations > 0 ? "text-red-500" : ""
                  }
                >
                  {data.validation.violations}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Avisos:</span>
                <span>{data.validation.warnings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Timestamp:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(data.validation.timestamp).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
