/**
 * Página: Fluxo de Agentes ICARUS v5.0
 * Exibe o fluxo de dados e pipeline de agentes IA
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/oraclusx-ds";
import {
  Brain,
  Database,
  Network,
  FileText,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  User,
  Activity,
} from "lucide-react";

// Interface para tarefa de agente
interface AgentTask {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "failed";
  agent: string;
  startTime: string;
  endTime?: string;
  progress: number;
}

export default function AgentsFlow() {
  const [activeTasks, setActiveTasks] = useState<AgentTask[]>([
    {
      id: "task-001",
      title: "Análise de Estoque OPME",
      status: "running",
      agent: "Agente Dados Internos",
      startTime: "2024-01-15 10:30:00",
      progress: 65,
    },
    {
      id: "task-002",
      title: "Benchmark de Preços",
      status: "running",
      agent: "Agente Benchmark Externo",
      startTime: "2024-01-15 10:30:05",
      progress: 45,
    },
    {
      id: "task-003",
      title: "Verificação de Compliance",
      status: "completed",
      agent: "Agente Compliance",
      startTime: "2024-01-15 10:25:00",
      endTime: "2024-01-15 10:29:30",
      progress: 100,
    },
    {
      id: "task-004",
      title: "Geração de Relatório",
      status: "pending",
      agent: "Agente Síntese",
      startTime: "2024-01-15 10:30:00",
      progress: 0,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "running":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={20} className="text-green-500" />;
      case "running":
        return <Activity size={20} className="text-blue-500 animate-pulse" />;
      case "pending":
        return <Clock size={20} className="text-yellow-500" />;
      case "failed":
        return <Clock size={20} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-heading flex items-center gap-2">
              <Brain size={28} />
              Fluxo de Dados & Pipeline de Agentes
            </CardTitle>
            <p className="text-body-sm text-muted-foreground mt-2">
              Visualize o fluxo de tarefas dos agentes IA e o processamento de
              dados em tempo real.
            </p>
          </CardHeader>
        </Card>

        {/* Fluxo Visual */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Network size={24} />
              Fluxo de Tarefa: Usuário → Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <pre className="mermaid text-sm">
                {`flowchart LR
  U[Usuário submete consulta] --> A1[Orquestrador]  
  A1 --> A2[Agente Dados Internos]  
  A1 --> A3[Agente Benchmark Externo]  
  A1 --> A4[Agente Compliance]  
  A2 --> S[Agente Síntese]  
  A3 --> S  
  A4 --> S  
  S --> R[Relatório Gerado]  
  R --> U`}
              </pre>
            </div>
            <div className="mt-4 text-body-sm text-muted-foreground">
              <p>
                <strong>Nota:</strong> O orquestrador distribui tarefas em
                paralelo para maximizar eficiência.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agentes Especializados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Orquestrador */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain size={20} className="text-purple-500" />
                Orquestrador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Cérebro central que coordena todos os agentes especializados.
              </p>
              <ul className="space-y-2 text-body-sm">
                <li>• Analisa consulta do usuário</li>
                <li>• Cria plano de subtarefas</li>
                <li>• Distribui para agentes</li>
                <li>• Monitora progresso</li>
                <li>• Gera logs de auditoria</li>
              </ul>
            </CardContent>
          </Card>

          {/* Agente Dados Internos */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database size={20} className="text-blue-500" />
                Agente Dados Internos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Extrai e processa dados do ERP e sistemas internos.
              </p>
              <ul className="space-y-2 text-body-sm">
                <li>• Consulta banco de dados</li>
                <li>• Integra com IoT/RFID</li>
                <li>• Analisa histórico</li>
                <li>• Identifica padrões</li>
                <li>• Calcula métricas KPI</li>
              </ul>
            </CardContent>
          </Card>

          {/* Agente Benchmark Externo */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp size={20} className="text-green-500" />
                Agente Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Coleta dados de mercado e comparativos externos.
              </p>
              <ul className="space-y-2 text-body-sm">
                <li>• Pesquisa de preços</li>
                <li>• Análise de concorrência</li>
                <li>• Tendências de mercado</li>
                <li>• Benchmarks setoriais</li>
                <li>• Índices de referência</li>
              </ul>
            </CardContent>
          </Card>

          {/* Agente Compliance */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={20} className="text-red-500" />
                Agente Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Verifica conformidade regulatória e rastreabilidade.
              </p>
              <ul className="space-y-2 text-body-sm">
                <li>• Valida com ANVISA</li>
                <li>• Verifica UDI/Device ID</li>
                <li>• Checa certificações</li>
                <li>• Audita documentação</li>
                <li>• Gera alertas críticos</li>
              </ul>
            </CardContent>
          </Card>

          {/* Agente Síntese */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={20} className="text-indigo-500" />
                Agente Síntese
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Consolida resultados e gera relatórios executivos.
              </p>
              <ul className="space-y-2 text-body-sm">
                <li>• Agrega dados processados</li>
                <li>• Identifica insights chave</li>
                <li>• Gera visualizações</li>
                <li>• Formata relatório final</li>
                <li>• Aplica templates personalizados</li>
              </ul>
            </CardContent>
          </Card>

          {/* GPT Researcher */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap size={20} className="text-yellow-500" />
                GPT Researcher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Assistente de pesquisa avançada com IA generativa.
              </p>
              <ul className="space-y-2 text-body-sm">
                <li>• Pesquisa web profunda</li>
                <li>• Análise de documentos</li>
                <li>• Resumos executivos</li>
                <li>• Perguntas e respostas</li>
                <li>• Contextualização de dados</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tarefas Ativas */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity size={24} />
              Tarefas Ativas no Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <h4 className="text-body-md font-medium">
                          {task.title}
                        </h4>
                        <p className="text-body-sm text-muted-foreground">
                          {task.agent} • ID: {task.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-body-xs font-semibold ${getStatusColor(task.status)}`}
                    >
                      {task.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mb-2">
                    <div className="flex justify-between text-body-xs text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex items-center gap-4 text-body-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Início: {task.startTime}
                    </span>
                    {task.endTime && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Fim: {task.endTime}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metadados e Rastreabilidade */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Metadados & Rastreabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Tabelas de Dados */}
              <div>
                <h4 className="text-body-md font-semibold mb-3 flex items-center gap-2">
                  <Database size={18} />
                  Estrutura de Dados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h5 className="font-semibold text-body-sm mb-2">
                      agent_tasks
                    </h5>
                    <ul className="text-body-xs space-y-1 text-muted-foreground">
                      <li>• ID da tarefa</li>
                      <li>• Status (pending, running, completed)</li>
                      <li>• Plano de subtarefas</li>
                      <li>• Prioridade</li>
                      <li>• Timestamps</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <h5 className="font-semibold text-body-sm mb-2">
                      agent_logs
                    </h5>
                    <ul className="text-body-xs space-y-1 text-muted-foreground">
                      <li>• Nome do agente</li>
                      <li>• Timestamp da ação</li>
                      <li>• Fonte de dados</li>
                      <li>• Tipo de operação</li>
                      <li>• Resultados parciais</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <h5 className="font-semibold text-body-sm mb-2">
                      agent_reports
                    </h5>
                    <ul className="text-body-xs space-y-1 text-muted-foreground">
                      <li>• ID do relatório</li>
                      <li>• Status (draft, published)</li>
                      <li>• Conteúdo formatado</li>
                      <li>• Metadados de geração</li>
                      <li>• Histórico de versões</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              <div>
                <h4 className="text-body-md font-semibold mb-3">
                  Benefícios do Pipeline de Agentes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <User size={20} className="text-blue-500 mt-1" />
                    <div>
                      <h5 className="font-semibold text-body-sm">
                        Supervisão Humana
                      </h5>
                      <p className="text-body-xs text-muted-foreground">
                        Usuário pode intervir após orquestrador gerar plano de
                        tarefas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <CheckCircle2 size={20} className="text-green-500 mt-1" />
                    <div>
                      <h5 className="font-semibold text-body-sm">
                        Transparência Total
                      </h5>
                      <p className="text-body-xs text-muted-foreground">
                        Saber exatamente quais agentes, fontes e passos foram
                        executados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Zap size={20} className="text-yellow-500 mt-1" />
                    <div>
                      <h5 className="font-semibold text-body-sm">
                        Automação com Controle
                      </h5>
                      <p className="text-body-xs text-muted-foreground">
                        Reduz esforço manual mantendo auditoria de processos
                        críticos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Shield size={20} className="text-red-500 mt-1" />
                    <div>
                      <h5 className="font-semibold text-body-sm">
                        Rastreabilidade OPME
                      </h5>
                      <p className="text-body-xs text-muted-foreground">
                        Compliance completo para dispositivos médicos e
                        rastreamento
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exemplo de Uso */}
              <div>
                <h4 className="text-body-md font-semibold mb-3">
                  Exemplo de Uso: Análise de Estoque
                </h4>
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
                  <ol className="space-y-2 text-body-sm">
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-600">1.</span>
                      <span>
                        Usuário solicita: "Gere relatório de estoque de OPME com
                        análise de compliance"
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-purple-600">2.</span>
                      <span>
                        Orquestrador cria plano: [Dados Internos, Compliance,
                        Benchmark, Síntese]
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-green-600">3.</span>
                      <span>
                        Agentes executam em paralelo e registram logs detalhados
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">4.</span>
                      <span>
                        Agente Síntese consolida resultados em relatório
                        executivo
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-teal-600">5.</span>
                      <span>
                        Relatório disponível em "draft" para revisão antes de
                        publicação
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
