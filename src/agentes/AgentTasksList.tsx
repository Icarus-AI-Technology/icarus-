import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgentTask {
  task_id: string;
  query_text: string;
  task_type: string;
  status: string;
  priority: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  execution_time_ms?: number;
  assigned_agent?: string;
}

export function AgentTasksList() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "failed"
  >("active");

  useEffect(() => {
    loadTasks();

    // Realtime subscription
    const subscription = supabase
      .channel("tasks-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_tasks",
        },
        () => {
          loadTasks();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filter]);

  async function loadTasks() {
    try {
      let query = supabase
        .from("agent_tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (filter === "active") {
        query = query.in("status", ["pending", "in_progress"]);
      } else if (filter === "completed") {
        query = query.eq("status", "completed");
      } else if (filter === "failed") {
        query = query.eq("status", "failed");
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, any> = {
      pending: { icon: Clock, variant: "secondary", label: "Pendente" },
      in_progress: {
        icon: RefreshCw,
        variant: "default",
        label: "Em Progresso",
        className: "animate-pulse",
      },
      completed: { icon: CheckCircle, variant: "success", label: "Concluída" },
      failed: { icon: XCircle, variant: "destructive", label: "Falhou" },
      cancelled: { icon: X, variant: "secondary", label: "Cancelada" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  function getTaskTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      master_planning: "Orquestração",
      data_internal: "Dados Internos",
      data_external: "Dados Externos",
      benchmark: "Benchmark",
      compliance: "Compliance",
      synthesis: "Síntese",
      visualization: "Visualização",
    };
    return labels[type] || type;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tarefas de Agentes</CardTitle>
            <CardDescription>
              Monitoramento em tempo real de tarefas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              Ativas
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
            >
              Concluídas
            </Button>
            <Button
              variant={filter === "failed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("failed")}
            >
              Falhas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Consulta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Agente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead>Criada</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhuma tarefa encontrada
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {task.query_text}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTaskTypeLabel(task.task_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.assigned_agent || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.priority >= 8
                          ? "destructive"
                          : task.priority >= 5
                            ? "default"
                            : "secondary"
                      }
                    >
                      P{task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {task.execution_time_ms
                      ? `${(task.execution_time_ms / 1000).toFixed(1)}s`
                      : task.started_at
                        ? "Em execução"
                        : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(task.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Logs
                        </DropdownMenuItem>
                        {task.status === "failed" && (
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retentar
                          </DropdownMenuItem>
                        )}
                        {["pending", "in_progress"].includes(task.status) && (
                          <DropdownMenuItem className="text-destructive">
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
