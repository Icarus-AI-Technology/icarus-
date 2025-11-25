import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { legacySupabase } from '@/lib/legacySupabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/oraclusx-ds/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle, XCircle, Clock, MoreVertical, Eye, RefreshCw, X } from 'lucide-react';
type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }>;
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type AgentTaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

interface StatusDisplay {
  icon: LucideIcon;
  variant: BadgeVariant;
  label: string;
  className?: string;
}

const STATUS_CONFIG: Record<AgentTaskStatus, StatusDisplay> = {
  pending: { icon: Clock, variant: 'secondary', label: 'Pendente' },
  in_progress: {
    icon: RefreshCw,
    variant: 'default',
    label: 'Em Progresso',
    className: 'animate-pulse',
  },
  completed: {
    icon: CheckCircle,
    variant: 'default',
    label: 'Concluída',
    className: 'bg-emerald-500 text-white hover:bg-emerald-600 border-transparent',
  },
  failed: { icon: XCircle, variant: 'destructive', label: 'Falhou' },
  cancelled: { icon: X, variant: 'secondary', label: 'Cancelada' },
};

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
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('active');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      let query = legacySupabase
        .from('agent_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter === 'active') {
        query = query.in('status', ['pending', 'in_progress']);
      } else if (filter === 'completed') {
        query = query.eq('status', 'completed');
      } else if (filter === 'failed') {
        query = query.eq('status', 'failed');
      }

      const { data, error } = await query;

      if (error) throw error;
      const normalized = Array.isArray(data)
        ? data
            .map((item) => ({
              task_id: typeof item?.task_id === 'string' ? item.task_id : null,
              query_text: typeof item?.query_text === 'string' ? item.query_text : '',
              task_type: typeof item?.task_type === 'string' ? item.task_type : 'custom',
              status: typeof item?.status === 'string' ? item.status : 'pending',
              priority:
                typeof item?.priority === 'number'
                  ? item.priority
                  : Number(item?.priority ?? 0),
              created_at:
                typeof item?.created_at === 'string'
                  ? item.created_at
                  : new Date().toISOString(),
              started_at: typeof item?.started_at === 'string' ? item.started_at : undefined,
              completed_at: typeof item?.completed_at === 'string' ? item.completed_at : undefined,
              execution_time_ms:
                typeof item?.execution_time_ms === 'number' ? item.execution_time_ms : undefined,
              assigned_agent:
                typeof item?.assigned_agent === 'string' ? item.assigned_agent : undefined,
            }))
            .filter((item): item is AgentTask => Boolean(item.task_id))
        : [];
      setTasks(normalized);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTasks();

    const subscription = supabase
      .channel('tasks-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_tasks',
        },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadTasks]);

  function isAgentTaskStatus(value: string): value is AgentTaskStatus {
    return value in STATUS_CONFIG;
  }

  function getStatusBadge(status: string) {
    const config = isAgentTaskStatus(status) ? STATUS_CONFIG[status] : STATUS_CONFIG.pending;
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
      master_planning: 'Orquestração',
      data_internal: 'Dados Internos',
      data_external: 'Dados Externos',
      benchmark: 'Benchmark',
      compliance: 'Compliance',
      synthesis: 'Síntese',
      visualization: 'Visualização',
    };
    return labels[type] || type;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tarefas de Agentes</CardTitle>
            <CardDescription>Monitoramento em tempo real de tarefas</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'solid' : 'bordered'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'active' ? 'solid' : 'bordered'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Ativas
            </Button>
            <Button
              variant={filter === 'completed' ? 'solid' : 'bordered'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Concluídas
            </Button>
            <Button
              variant={filter === 'failed' ? 'solid' : 'bordered'}
              size="sm"
              onClick={() => setFilter('failed')}
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
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhuma tarefa encontrada
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell className="orx-orx-font-medium max-w-xs truncate">
                    {task.query_text}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTaskTypeLabel(task.task_type)}</Badge>
                  </TableCell>
                  <TableCell className="orx-text-sm text-muted-foreground">
                    {task.assigned_agent || '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.priority >= 8
                          ? 'destructive'
                          : task.priority >= 5
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      P{task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="orx-text-sm">
                    {task.execution_time_ms
                      ? `${(task.execution_time_ms / 1000).toFixed(1)}s`
                      : task.started_at
                        ? 'Em execução'
                        : '-'}
                  </TableCell>
                  <TableCell className="orx-text-sm text-muted-foreground">
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
                        {task.status === 'failed' && (
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retentar
                          </DropdownMenuItem>
                        )}
                        {['pending', 'in_progress'].includes(task.status) && (
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
