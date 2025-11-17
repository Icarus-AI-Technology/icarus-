/**
 * Página: Arquitetura ICARUS v5.0
 * Exibe a arquitetura em visão geral do sistema
 */

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/oraclusx-ds";
import {
  Network,
  Database,
  Cloud,
  Brain,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Interface para status dos componentes
interface ComponentStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: string;
}

export default function Architecture() {
  const [componentsStatus, setComponentsStatus] = useState<ComponentStatus[]>([
    { name: "Frontend React/TS", status: "online", uptime: "99.9%" },
    { name: "Backend Supabase", status: "online", uptime: "99.8%" },
    { name: "Auth & RBAC", status: "online", uptime: "99.9%" },
    { name: "PostgreSQL", status: "online", uptime: "99.7%" },
    { name: "Orquestrador de Agentes", status: "online", uptime: "98.5%" },
    { name: "IoT/RFID/Blockchain", status: "online", uptime: "97.2%" },
    { name: "Compliance/ANVISA", status: "online", uptime: "99.1%" },
  ]);

  // Simular atualização de status
  useEffect(() => {
    const interval = setInterval(() => {
      setComponentsStatus((prev) =>
        prev.map((comp) => ({
          ...comp,
          status: Math.random() > 0.1 ? "online" : "degraded",
        })),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle2 size={20} className="text-green-500" />;
      case "degraded":
        return <AlertCircle size={20} className="text-yellow-500" />;
      case "offline":
        return <AlertCircle size={20} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "degraded":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "offline":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-heading flex items-center gap-2">
              <Network size={28} />
              Arquitetura ICARUS v5.0 (OraclusX)
            </CardTitle>
            <p className="text-body-sm text-muted-foreground mt-2">
              Visão geral da arquitetura do sistema, componentes principais e
              integrações.
            </p>
          </CardHeader>
        </Card>

        {/* Diagrama Mermaid */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Network size={24} />
              Diagrama de Arquitetura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <pre className="mermaid text-sm">
                {`%%{init:{"theme":"forest"}}%%
architecture-beta
  group Frontend(browser)[Frontend (App React/TS)] 
    service UI(server)[UI React 18] in Frontend  
  group Backend(cloud)[Backend (Supabase + Func)] 
    service Auth(server)[Auth & RBAC] in Backend  
    service API(server)[Business API] in Backend  
    service DB(database)[PostgreSQL] in Backend  
  group Agents(robot)[Pipeline de Agentes] 
    service Orchestrator(server)[Orquestrador] in Agents  
    service AgentInt(server)[Agente Dados Internos] in Agents  
    service AgentBench(server)[Agente Benchmark Externo] in Agents  
    service AgentSynth(server)[Agente Síntese Relatório] in Agents  
  group Integrations(cloud)[Integrações Externas] 
    service IoT(server)[IoT/RFID/Blockchain] in Integrations  
    service Regul(server)[Compliance/ANVISA/UDI] in Integrations  

  UI:R --> L:Auth  
  Auth:R --> L:API  
  API:R --> L:DB  
  API:R --> L:Orchestrator  
  Orchestrator:R --> L:AgentInt  
  Orchestrator:R --> L:AgentBench  
  AgentInt:R --> L:AgentSynth  
  AgentBench:R --> L:AgentSynth  
  AgentSynth:R --> L:API  
  IoT:R --> L:API  
  Regul:R --> L:API`}
              </pre>
            </div>
            <div className="mt-4 text-body-sm text-muted-foreground">
              <p>
                <strong>Nota:</strong> Para visualizar o diagrama, instale a
                extensão Mermaid no navegador ou utilize um visualizador online
                de diagramas Mermaid.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Componentes Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Frontend */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap size={20} className="text-blue-500" />
                Frontend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-body-sm">
                <li>• React 18 + TypeScript</li>
                <li>• Vite (Build Tool)</li>
                <li>• Tailwind CSS + OraclusX DS</li>
                <li>• React Router v6</li>
                <li>• React Hook Form + Zod</li>
              </ul>
            </CardContent>
          </Card>

          {/* Backend */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database size={20} className="text-green-500" />
                Backend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-body-sm">
                <li>• Supabase (BaaS)</li>
                <li>• PostgreSQL 15</li>
                <li>• Auth & RBAC</li>
                <li>• Row Level Security (RLS)</li>
                <li>• Edge Functions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Agentes IA */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain size={20} className="text-purple-500" />
                Pipeline de Agentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-body-sm">
                <li>• Orquestrador Central</li>
                <li>• Agente Dados Internos</li>
                <li>• Agente Benchmark Externo</li>
                <li>• Agente Síntese de Relatórios</li>
                <li>• GPT-Researcher Integration</li>
              </ul>
            </CardContent>
          </Card>

          {/* Integrações */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud size={20} className="text-indigo-500" />
                Integrações Externas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-body-sm">
                <li>• IoT/RFID</li>
                <li>• Blockchain (Rastreamento)</li>
                <li>• ANVISA/UDI</li>
                <li>• SEFAZ (NFe)</li>
                <li>• Brasil API (CEP/CNPJ)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={20} className="text-red-500" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-body-sm">
                <li>• LGPD Compliance</li>
                <li>• HIPAA Ready</li>
                <li>• Criptografia E2E</li>
                <li>• Auditoria de Logs</li>
                <li>• Rate Limiting</li>
              </ul>
            </CardContent>
          </Card>

          {/* Observabilidade */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 size={20} className="text-teal-500" />
                Observabilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-body-sm">
                <li>• Sentry (Error Tracking)</li>
                <li>• PostHog (Analytics)</li>
                <li>• Vercel Analytics</li>
                <li>• Custom Metrics</li>
                <li>• Health Checks</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Status dos Componentes */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 size={24} />
              Status dos Componentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {componentsStatus.map((component, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(component.status)}
                    <span className="text-body-md font-medium">
                      {component.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-body-sm text-muted-foreground">
                      Uptime: {component.uptime}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-body-xs font-semibold ${getStatusColor(component.status)}`}
                    >
                      {component.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fluxo de Dados */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Network size={24} />
              Fluxo de Dados Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="text-body-md font-medium">
                    Usuário interage com UI React
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    Interface neumórfica com feedback em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="text-body-md font-medium">
                    Requisição passa por Auth & RBAC
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    Verificação de permissões e autenticação JWT
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="text-body-md font-medium">
                    Business API processa a lógica
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    Validação, transformação e orquestração de dados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <p className="text-body-md font-medium">
                    Persistência no PostgreSQL
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    Banco de dados relacional com RLS e auditoria
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <p className="text-body-md font-medium">
                    Orquestrador de Agentes (Opcional)
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    Processamento inteligente com IA para insights e análises
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <p className="text-body-md font-medium">
                    Resposta ao Cliente
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    Dados formatados e otimizados retornam para a UI
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tecnologias Chave */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Stack Tecnológico Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-body-md font-semibold mb-3">Frontend</h4>
                <ul className="space-y-1 text-body-sm text-muted-foreground">
                  <li>• React 18.3 + TypeScript 5.6</li>
                  <li>• Vite 5.4 (Build Tool)</li>
                  <li>• Tailwind CSS 3.4</li>
                  <li>• Radix UI Primitives</li>
                  <li>• React Router v6</li>
                  <li>• React Hook Form + Zod</li>
                  <li>• Recharts + Nivo (Gráficos)</li>
                  <li>• Lucide React (Ícones)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-body-md font-semibold mb-3">
                  Backend & Database
                </h4>
                <ul className="space-y-1 text-body-sm text-muted-foreground">
                  <li>• Supabase (BaaS)</li>
                  <li>• PostgreSQL 15</li>
                  <li>• Supabase Auth + RLS</li>
                  <li>• Edge Functions (Deno)</li>
                  <li>• Realtime Subscriptions</li>
                  <li>• Storage (Arquivos)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-body-md font-semibold mb-3">
                  Integrações & APIs
                </h4>
                <ul className="space-y-1 text-body-sm text-muted-foreground">
                  <li>• ANVISA (UDI/Device Registry)</li>
                  <li>• SEFAZ (NFe/NFSe)</li>
                  <li>• Brasil API (CEP/CNPJ)</li>
                  <li>• SendGrid (Email)</li>
                  <li>• Twilio (SMS/WhatsApp)</li>
                  <li>• Tesseract.js (OCR)</li>
                  <li>• MeiliSearch (Search)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-body-md font-semibold mb-3">
                  IA & Machine Learning
                </h4>
                <ul className="space-y-1 text-body-sm text-muted-foreground">
                  <li>• GPT-Researcher (Research)</li>
                  <li>• Ollama (Local LLMs)</li>
                  <li>• pgvector (Embeddings)</li>
                  <li>• Agentes Autônomos</li>
                  <li>• Análise Preditiva</li>
                </ul>
              </div>

              <div>
                <h4 className="text-body-md font-semibold mb-3">
                  DevOps & Infraestrutura
                </h4>
                <ul className="space-y-1 text-body-sm text-muted-foreground">
                  <li>• Vercel (Hosting)</li>
                  <li>• GitHub Actions (CI/CD)</li>
                  <li>• Docker (Containers)</li>
                  <li>• PM2 (Process Manager)</li>
                  <li>• Nginx (Reverse Proxy)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-body-md font-semibold mb-3">
                  Qualidade & Testes
                </h4>
                <ul className="space-y-1 text-body-sm text-muted-foreground">
                  <li>• Vitest (Unit Tests)</li>
                  <li>• Playwright (E2E Tests)</li>
                  <li>• ESLint + Prettier</li>
                  <li>• Lighthouse (Performance)</li>
                  <li>• Axe (Acessibilidade)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
