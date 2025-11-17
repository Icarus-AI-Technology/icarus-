/**
 * Página: Diagrama de Camada de Dados
 * Exibe a arquitetura de dados: PostgreSQL, Buckets, Realtime, Vector Store
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/oraclusx-ds";
import {
  Database,
  HardDrive,
  Zap,
  Network,
  Layers,
  Server,
  Cloud,
  CheckCircle2,
} from "lucide-react";

export default function DataLayerDiagram() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-heading flex items-center gap-2">
              <Database size={28} />
              Camada de Dados ICARUS v5.0
            </CardTitle>
            <p className="text-body-sm text-muted-foreground mt-2">
              Arquitetura completa de armazenamento e processamento de dados.
            </p>
          </CardHeader>
        </Card>

        {/* Diagrama Principal */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers size={24} />
              Arquitetura de Dados em Camadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <pre className="mermaid text-sm">
                {`graph TD
  subgraph Storage_Layer
    DB[(PostgreSQL Supabase)]
    StorageBuckets[(Supabase Buckets)]
    Realtime[(Supabase Realtime)]
    VectorDB[(Vector Store pgvector/faiss)]
  end

  subgraph Application_Layer
    BackendAPI[Backend API]
    Functions[Edge Functions]
  end

  subgraph Presentation_Layer
    Frontend[Frontend React/OraclusX UI]
  end

  Frontend -->|REST/GraphQL| BackendAPI
  BackendAPI --> DB
  BackendAPI --> StorageBuckets
  BackendAPI --> Realtime
  BackendAPI --> VectorDB
  Functions --> VectorDB
  Functions --> DB`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Camadas da Arquitetura */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Storage Layer */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HardDrive size={20} className="text-blue-500" />
                Storage Layer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Camada de armazenamento persistente
              </p>
              <ul className="space-y-2 text-body-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>PostgreSQL 15 (Principal)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Supabase Buckets (Arquivos)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Realtime (WebSockets)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>pgvector (Embeddings)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Application Layer */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server size={20} className="text-green-500" />
                Application Layer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Camada de lógica de negócio
              </p>
              <ul className="space-y-2 text-body-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Backend API (REST + GraphQL)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Edge Functions (Deno)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Auth & RBAC</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Business Rules Engine</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Presentation Layer */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud size={20} className="text-purple-500" />
                Presentation Layer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Camada de interface com usuário
              </p>
              <ul className="space-y-2 text-body-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>React 18 + TypeScript</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>OraclusX Design System</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>State Management (Context API)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Realtime Updates</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento dos Componentes */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Detalhamento dos Componentes de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* PostgreSQL */}
              <div>
                <h4 className="text-body-md font-semibold mb-3 flex items-center gap-2">
                  <Database size={18} />
                  1. PostgreSQL 15 (Principal)
                </h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-body-sm mb-3">
                    <strong>Função:</strong> Banco de dados relacional principal
                    com todas as tabelas transacionais.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Características
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• ACID Compliant (transações garantidas)</li>
                        <li>• Row Level Security (RLS) habilitado</li>
                        <li>• Triggers para auditoria automática</li>
                        <li>• Stored Procedures para lógica complexa</li>
                        <li>• Particionamento de tabelas grandes</li>
                        <li>• Índices B-Tree, Hash, GiST</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Tabelas Principais
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• cirurgias (Procedimentos cirúrgicos)</li>
                        <li>• produtos_opme (Produtos médicos)</li>
                        <li>• estoque (Movimentações)</li>
                        <li>• pedidos_compra (Compras)</li>
                        <li>• faturas (Financeiro)</li>
                        <li>• agent_* (Pipeline de agentes)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supabase Buckets */}
              <div>
                <h4 className="text-body-md font-semibold mb-3 flex items-center gap-2">
                  <HardDrive size={18} />
                  2. Supabase Storage Buckets
                </h4>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-body-sm mb-3">
                    <strong>Função:</strong> Armazenamento de arquivos binários
                    (documentos, imagens, PDFs).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Buckets Configurados
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>
                          • <code>documentos-dpo</code> (Documentos legais)
                        </li>
                        <li>
                          • <code>notas-fiscais</code> (NFe/XMLs)
                        </li>
                        <li>
                          • <code>imagens-produtos</code> (Fotos OPME)
                        </li>
                        <li>
                          • <code>relatorios</code> (PDFs gerados)
                        </li>
                        <li>
                          • <code>certificados</code> (ISO, ANVISA)
                        </li>
                        <li>
                          • <code>avatares</code> (Fotos de usuários)
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Políticas de Acesso
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• RLS por organização</li>
                        <li>• Uploads autenticados apenas</li>
                        <li>• Assinatura de URLs temporárias</li>
                        <li>• Transformação de imagens (resize, crop)</li>
                        <li>• CDN global para performance</li>
                        <li>• Versionamento de arquivos críticos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Realtime */}
              <div>
                <h4 className="text-body-md font-semibold mb-3 flex items-center gap-2">
                  <Zap size={18} />
                  3. Supabase Realtime (WebSockets)
                </h4>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-body-sm mb-3">
                    <strong>Função:</strong> Sincronização em tempo real de
                    dados entre cliente e servidor.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Casos de Uso
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• Dashboard de cirurgias ao vivo</li>
                        <li>• Notificações de estoque crítico</li>
                        <li>• Chat entre equipes médicas</li>
                        <li>• Status de agentes IA em execução</li>
                        <li>• Alertas de compliance</li>
                        <li>• Atualizações de pedidos</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Configuração
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• WebSocket over TLS (wss://)</li>
                        <li>• Heartbeat a cada 30s</li>
                        <li>• Reconnect automático</li>
                        <li>• Broadcast Channels para multi-tenant</li>
                        <li>• Presença (quem está online)</li>
                        <li>• Throttling de eventos (rate limit)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vector Store */}
              <div>
                <h4 className="text-body-md font-semibold mb-3 flex items-center gap-2">
                  <Network size={18} />
                  4. Vector Store (pgvector + FAISS)
                </h4>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className="text-body-sm mb-3">
                    <strong>Função:</strong> Armazenamento de embeddings para
                    busca semântica e IA.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Tecnologias
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• pgvector (PostgreSQL extension)</li>
                        <li>• FAISS (Facebook AI Similarity Search)</li>
                        <li>• Sentence Transformers (embeddings)</li>
                        <li>• Cosine Similarity para ranking</li>
                        <li>• HNSW index para velocidade</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Aplicações
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• Busca semântica de produtos</li>
                        <li>• Recomendação de OPME similares</li>
                        <li>• Chatbot com contexto</li>
                        <li>• Detecção de duplicatas</li>
                        <li>• Análise de documentos (RAG)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap size={24} />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={20} className="text-blue-500" />
                  <h5 className="font-semibold text-body-sm">PostgreSQL</h5>
                </div>
                <ul className="text-body-xs space-y-1">
                  <li>• Queries &lt; 50ms (P95)</li>
                  <li>• 5000 conexões simultâneas</li>
                  <li>• 500GB armazenamento</li>
                  <li>• Backup diário automático</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive size={20} className="text-green-500" />
                  <h5 className="font-semibold text-body-sm">
                    Storage Buckets
                  </h5>
                </div>
                <ul className="text-body-xs space-y-1">
                  <li>• Upload &lt; 2s (10MB)</li>
                  <li>• CDN latency &lt; 100ms</li>
                  <li>• 2TB armazenamento</li>
                  <li>• 99.9% disponibilidade</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={20} className="text-purple-500" />
                  <h5 className="font-semibold text-body-sm">Realtime</h5>
                </div>
                <ul className="text-body-xs space-y-1">
                  <li>• Latency &lt; 200ms</li>
                  <li>• 10k conexões WebSocket</li>
                  <li>• 1M mensagens/dia</li>
                  <li>• 99.8% uptime</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
