# Diagramas de Arquitetura — ICARUS v5.0 (OraclusX)

**Data**: 2025-10-26  
**Versão**: 1.0.0  
**Complemento**: ARQUITETURA_ICARUS_V5_EDR.md

---

## 1. Diagrama de Integrações Externas

### IoT/RFID/Blockchain + Fornecedores + Regulatórios

Este diagrama mostra como o ICARUS v5.0 se integra com sistemas externos críticos para rastreabilidade de OPME, compliance regulatório e inteligência de mercado.

```mermaid
graph TB
  subgraph "IoT & Rastreabilidade"
    IoT[IoT Sensors / RFID Readers]
    Gateway[IoT Gateway]
    Blockchain[Blockchain Ledger<br/>Hyperledger/Ethereum]
    IoT -->|Leitura tags RFID| Gateway
    Gateway -->|Registra transações| Blockchain
  end

  subgraph "Fornecedores & Mercado"
    Fornecedores[Fornecedores OPME<br/>APIs REST/EDI]
    Distribuidores[Distribuidores<br/>Catálogos & Preços]
    Benchmark[Serviço de Benchmark<br/>Análise de Mercado]
    Fornecedores -->|Dados produtos| Benchmark
    Distribuidores -->|Preços & disponibilidade| Benchmark
  end

  subgraph "Regulatório & Compliance"
    ANVISA[ANVISA<br/>Registro UDI/RDC 925]
    ISO[Certificações ISO]
    BoasPraticas[Boas Práticas Clínicas]
    ANVISA -->|Validação rastreabilidade| ComplianceEngine
    ISO -->|Normas qualidade| ComplianceEngine
    BoasPraticas -->|Protocolos médicos| ComplianceEngine
    ComplianceEngine[Compliance Engine]
  end

  subgraph "ICARUS v5.0 Backend"
    API[API Gateway Supabase]
    AgentOrch[Orquestrador de Agentes]
    DB[(PostgreSQL)]

    Blockchain -->|Consulta histórico| API
    Gateway -->|Stream dados tempo real| API
    Benchmark -->|Relatórios comparativos| AgentOrch
    ComplianceEngine -->|Status conformidade| API

    API --> AgentOrch
    API --> DB
    AgentOrch --> DB
  end

  subgraph "Camada de Apresentação"
    Dashboard[Dashboard OraclusX]
    Mobile[App Mobile]
    Relatorios[Módulo Relatórios]
  end

  API --> Dashboard
  API --> Mobile
  AgentOrch --> Relatorios

  Dashboard --> Usuarios[Usuários Finais<br/>Hospitais/Médicos/Gestores]
  Mobile --> Usuarios
  Relatorios --> Usuarios

  style IoT fill:#e1f5ff
  style Blockchain fill:#fff4e1
  style ANVISA fill:#ffe1e1
  style AgentOrch fill:#e1ffe1
  style Dashboard fill:#f0e1ff
```

### Descrição dos Fluxos:

#### 1. IoT & Rastreabilidade

- **RFID Readers** capturam dados de materiais OPME em tempo real
- **IoT Gateway** agrega e normaliza dados de múltiplos sensores
- **Blockchain** registra transações imutáveis para rastreabilidade completa
- Dados fluem para API do ICARUS para processamento e armazenamento

#### 2. Fornecedores & Mercado

- **APIs de Fornecedores** fornecem catálogos, preços, disponibilidade
- **Distribuidores** compartilham informações de estoque e logística
- **Serviço de Benchmark** analisa e compara dados de mercado
- Agente de Benchmark usa essas informações para relatórios estratégicos

#### 3. Regulatório & Compliance

- **ANVISA** valida rastreabilidade via UDI (Unique Device Identification)
- **Certificações ISO** garantem conformidade com normas internacionais
- **Boas Práticas** asseguram protocolos clínicos adequados
- **Compliance Engine** consolida todas validações

---

## 2. Diagrama de Camada de Dados

### Banco de Dados, Buckets, Realtime, Storage & Vector Store

Este diagrama detalha a arquitetura de dados do ICARUS v5.0, incluindo persistência, cache, streaming e busca vetorial.

```mermaid
graph TB
  subgraph "Camada de Apresentação"
    Frontend[Frontend React/TypeScript<br/>OraclusX Design System]
    Mobile[Mobile App<br/>React Native]
  end

  subgraph "Camada de API"
    APIGateway[API Gateway]
    EdgeFunctions[Supabase Edge Functions<br/>Deno Runtime]
    GraphQL[GraphQL Endpoint]
    RestAPI[REST API]

    APIGateway --> EdgeFunctions
    APIGateway --> GraphQL
    APIGateway --> RestAPI
  end

  subgraph "Camada de Agentes IA"
    Orchestrator[Orquestrador Master]
    AgentERP[Agente Dados Internos]
    AgentBench[Agente Benchmark]
    AgentComp[Agente Compliance]
    AgentSynth[Agente Síntese]

    Orchestrator --> AgentERP
    Orchestrator --> AgentBench
    Orchestrator --> AgentComp
    AgentERP --> AgentSynth
    AgentBench --> AgentSynth
    AgentComp --> AgentSynth
  end

  subgraph "Camada de Persistência Supabase"
    PostgreSQL[(PostgreSQL 15+<br/>Tabelas Principais)]
    VectorDB[(pgvector<br/>Embeddings & Busca Semântica)]
    TimeSeries[(TimescaleDB Extension<br/>Dados IoT/Séries Temporais)]

    PostgreSQL -.->|Extensão| VectorDB
    PostgreSQL -.->|Extensão| TimeSeries
  end

  subgraph "Camada de Storage"
    Buckets[(Supabase Storage Buckets)]
    Documents[Bucket: documents<br/>PDFs, Contratos, Laudos]
    Images[Bucket: images<br/>Fotos produtos, Raio-X]
    Reports[Bucket: reports<br/>Relatórios gerados]
    Attachments[Bucket: attachments<br/>Anexos diversos]

    Buckets --> Documents
    Buckets --> Images
    Buckets --> Reports
    Buckets --> Attachments
  end

  subgraph "Camada de Realtime & Cache"
    Realtime[Supabase Realtime<br/>WebSocket/Server-Sent Events]
    Redis[(Redis Cache<br/>Sessions & Hot Data)]
    PubSub[Pub/Sub Channels<br/>Notificações em tempo real]

    Realtime --> PubSub
  end

  subgraph "Camada de Analytics"
    Materialized[Materialized Views<br/>Dashboards & Relatórios]
    OLAP[(OLAP Cube<br/>Análises Multidimensionais)]
    DataWarehouse[(Data Warehouse<br/>Histórico & Big Data)]
  end

  Frontend --> APIGateway
  Mobile --> APIGateway

  RestAPI --> PostgreSQL
  RestAPI --> Buckets
  RestAPI --> Redis
  GraphQL --> PostgreSQL
  GraphQL --> VectorDB

  EdgeFunctions --> Orchestrator
  EdgeFunctions --> PostgreSQL
  EdgeFunctions --> Realtime

  AgentERP --> PostgreSQL
  AgentERP --> TimeSeries
  AgentBench --> VectorDB
  AgentComp --> PostgreSQL
  AgentSynth --> Buckets
  AgentSynth --> Reports

  PostgreSQL --> Materialized
  PostgreSQL --> DataWarehouse
  TimeSeries --> OLAP

  Realtime --> Frontend
  Realtime --> Mobile
  PubSub --> Frontend

  style Frontend fill:#e1f5ff
  style PostgreSQL fill:#4a90e2
  style VectorDB fill:#7b68ee
  style Buckets fill:#ffa500
  style Realtime fill:#32cd32
  style Orchestrator fill:#ff69b4
  style Redis fill:#dc143c
```

### Descrição das Camadas:

#### 1. Camada de Apresentação

- **Frontend React**: Interface principal do sistema (desktop/web)
- **Mobile App**: Aplicativo nativo para dispositivos móveis
- Comunicação via REST API, GraphQL e WebSocket (Realtime)

#### 2. Camada de API

- **API Gateway**: Ponto único de entrada, autenticação, rate limiting
- **Edge Functions**: Lógica serverless em Deno para processamento
- **GraphQL**: Consultas flexíveis e eficientes
- **REST API**: Endpoints tradicionais para CRUD

#### 3. Camada de Agentes IA

- **Orquestrador Master**: Decompõe consultas e coordena agentes
- **Agentes Especializados**: Executam subtarefas específicas
- **Agente Síntese**: Consolida resultados e gera relatórios
- Acesso direto a diferentes camadas de dados conforme necessidade

#### 4. Camada de Persistência

- **PostgreSQL 15+**: Banco de dados relacional principal
- **pgvector**: Extensão para embeddings e busca semântica (RAG)
- **TimescaleDB**: Extensão para séries temporais (dados IoT)
- Suporte a JSONB, Full-Text Search, e índices avançados

#### 5. Camada de Storage

- **Supabase Storage**: Sistema de arquivos S3-compatible
- **Buckets organizados por tipo**: Documentos, imagens, relatórios, anexos
- Controle de acesso via RLS (Row Level Security)
- Suporte a CDN para distribuição global

#### 6. Camada de Realtime & Cache

- **Supabase Realtime**: WebSocket para atualizações em tempo real
- **Redis Cache**: Cache de sessões e dados frequentes
- **Pub/Sub**: Canais para notificações e eventos
- Redução de latência e carga no banco principal

#### 7. Camada de Analytics

- **Materialized Views**: Pré-agregações para dashboards rápidos
- **OLAP Cube**: Análises multidimensionais complexas
- **Data Warehouse**: Armazenamento histórico para big data

---

## 3. Fluxo de Dados Detalhado: Tarefa de Agente

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant API as API Gateway
    participant O as Orquestrador
    participant DB as PostgreSQL
    participant A1 as Agente Dados
    participant A2 as Agente Benchmark
    participant A3 as Agente Compliance
    participant S as Agente Síntese
    participant B as Storage Bucket

    U->>F: Solicita relatório OPME
    F->>API: POST /api/agent-tasks
    API->>DB: INSERT agent_tasks
    DB-->>API: task_id
    API->>O: Aciona orquestração
    O->>DB: UPDATE agent_tasks (metadata plano)

    par Execução Paralela
        O->>A1: Subtarefa: buscar dados ERP
        A1->>DB: SELECT estoque, cirurgias
        DB-->>A1: Dataset interno
        A1->>DB: INSERT agent_logs

        O->>A2: Subtarefa: benchmark mercado
        A2->>DB: SELECT pgvector embeddings
        DB-->>A2: Contexto relevante
        A2->>DB: INSERT agent_logs

        O->>A3: Subtarefa: validar compliance
        A3->>DB: SELECT rastreabilidade
        DB-->>A3: Status UDI/RDC
        A3->>DB: INSERT agent_logs
    end

    A1->>S: Resultado dados internos
    A2->>S: Resultado benchmark
    A3->>S: Resultado compliance

    S->>S: Gera relatório Markdown/HTML
    S->>B: Salva PDF em bucket reports
    B-->>S: report_url
    S->>DB: INSERT agent_reports

    DB->>API: Notificação via Realtime
    API->>F: WebSocket: relatório pronto
    F->>U: Exibe notificação + link download

    U->>F: Visualiza relatório
    F->>API: GET /api/reports/:id
    API->>B: Fetch documento
    B-->>API: PDF stream
    API-->>F: Relatório
    F-->>U: Exibe PDF no navegador
```

### Etapas do Fluxo:

1. **Iniciação**: Usuário solicita relatório via frontend
2. **Registro**: API cria registro em `agent_tasks` com status "pending"
3. **Orquestração**: Orquestrador analisa query e gera plano de subtarefas
4. **Execução Paralela**: Múltiplos agentes executam simultaneamente
5. **Logging**: Cada agente registra ações em `agent_logs`
6. **Síntese**: Agente de síntese consolida todos os resultados
7. **Geração**: Relatório é gerado em Markdown/HTML/PDF
8. **Armazenamento**: Documento salvo em Storage Bucket
9. **Notificação**: Frontend recebe atualização via Realtime
10. **Entrega**: Usuário visualiza/baixa relatório finalizado

---

## 4. Diagrama de Segurança & Compliance

```mermaid
graph TB
  subgraph "Autenticação & Autorização"
    Auth[Supabase Auth<br/>JWT Tokens]
    RBAC[Role-Based Access Control]
    RLS[Row Level Security<br/>PostgreSQL Policies]
    MFA[Multi-Factor Authentication]

    Auth --> RBAC
    Auth --> MFA
    RBAC --> RLS
  end

  subgraph "Auditoria & Rastreabilidade"
    AuditLog[(Audit Log Table)]
    AgentLogs[(Agent Logs)]
    AccessLog[(Access Log)]
    ChangeTracking[Change Data Capture]

    AuditLog --> Compliance
    AgentLogs --> Compliance
    AccessLog --> Compliance
    ChangeTracking --> AuditLog
  end

  subgraph "Criptografia"
    AtRest[Encryption at Rest<br/>AES-256]
    InTransit[Encryption in Transit<br/>TLS 1.3]
    FieldLevel[Field-Level Encryption<br/>Dados sensíveis]

    AtRest --> DB[(Database)]
    InTransit --> API[APIs]
    FieldLevel --> DB
  end

  subgraph "Compliance Regulatório"
    ANVISA_Check[Validação ANVISA/UDI]
    LGPD[Conformidade LGPD]
    HIPAA[Padrões HIPAA<br/>Dados médicos]
    ISO27001[ISO 27001<br/>Segurança da informação]

    ANVISA_Check --> Compliance[Compliance Engine]
    LGPD --> Compliance
    HIPAA --> Compliance
    ISO27001 --> Compliance
  end

  subgraph "Monitoramento & Alertas"
    SIEM[SIEM System<br/>Security Information]
    Alerts[Sistema de Alertas]
    Monitoring[Monitoring Dashboard]

    AuditLog --> SIEM
    SIEM --> Alerts
    Alerts --> Monitoring
  end

  Users[Usuários] --> Auth
  Auth --> API
  API --> DB

  DB --> ChangeTracking
  API --> AccessLog

  Compliance --> Monitoring

  style Auth fill:#4a90e2
  style RLS fill:#32cd32
  style AuditLog fill:#ffa500
  style Compliance fill:#dc143c
  style AtRest fill:#9370db
```

### Controles de Segurança Implementados:

#### Autenticação & Autorização

- JWT tokens com refresh automático
- RBAC com perfis: Admin, Médico, Enfermeiro, Gestor, Operadora
- RLS no PostgreSQL para segregação multi-tenant
- MFA opcional para usuários críticos

#### Auditoria & Rastreabilidade

- Logs de todas operações CRUD
- Registro completo de ações dos agentes
- Log de acesso com IP, timestamp, usuário
- Change Data Capture para histórico de alterações

#### Criptografia

- AES-256 para dados em repouso
- TLS 1.3 para dados em trânsito
- Criptografia em nível de campo para CPF, dados médicos sensíveis

#### Compliance

- Validação automática de requisitos ANVISA
- Conformidade LGPD (Lei Geral de Proteção de Dados)
- Padrões HIPAA para dados de saúde
- Certificação ISO 27001 para segurança da informação

---

## 5. Diagrama de Deployment (Produção)

```mermaid
graph TB
  subgraph "CDN & Edge"
    CloudFlare[CloudFlare CDN]
    EdgeCache[Edge Cache<br/>Assets estáticos]
  end

  subgraph "Load Balancer"
    LB[Load Balancer<br/>Round-robin]
  end

  subgraph "Application Servers"
    App1[App Server 1<br/>Supabase Edge]
    App2[App Server 2<br/>Supabase Edge]
    App3[App Server N<br/>Supabase Edge]
  end

  subgraph "Database Cluster"
    Primary[(PostgreSQL Primary<br/>Read/Write)]
    Replica1[(Replica 1<br/>Read-only)]
    Replica2[(Replica 2<br/>Read-only)]

    Primary -.->|Replicação streaming| Replica1
    Primary -.->|Replicação streaming| Replica2
  end

  subgraph "Storage & Cache"
    S3[S3-Compatible Storage<br/>Supabase Buckets]
    RedisCluster[Redis Cluster<br/>Cache distribuído]
  end

  subgraph "AI & Analytics"
    AgentWorkers[Agent Workers<br/>Queue-based]
    MLServices[ML Services<br/>Inference & Training]
    Analytics[Analytics Engine]
  end

  subgraph "Monitoring"
    Prometheus[Prometheus<br/>Métricas]
    Grafana[Grafana<br/>Dashboards]
    Sentry[Sentry<br/>Error Tracking]
  end

  Users[Usuários] --> CloudFlare
  CloudFlare --> EdgeCache
  EdgeCache --> LB
  LB --> App1
  LB --> App2
  LB --> App3

  App1 --> Primary
  App2 --> Replica1
  App3 --> Replica2

  App1 --> S3
  App2 --> S3
  App3 --> S3

  App1 --> RedisCluster
  App2 --> RedisCluster
  App3 --> RedisCluster

  App1 --> AgentWorkers
  AgentWorkers --> MLServices
  AgentWorkers --> Primary

  Primary --> Analytics

  App1 --> Prometheus
  App2 --> Prometheus
  App3 --> Prometheus
  Prometheus --> Grafana

  App1 --> Sentry
  App2 --> Sentry
  App3 --> Sentry

  style CloudFlare fill:#ff6b35
  style LB fill:#4a90e2
  style Primary fill:#32cd32
  style AgentWorkers fill:#ff69b4
  style Prometheus fill:#e74c3c
```

---

## 6. Referências & Ferramentas

### Ferramentas de Visualização

- **Mermaid Live Editor**: https://mermaid.live
- **PlantUML**: https://plantuml.com
- **Draw.io**: https://app.diagrams.net

### Documentação Técnica

- Supabase Architecture: https://supabase.com/docs/guides/platform
- PostgreSQL Extensions: https://www.postgresql.org/docs/current/extensions.html
- pgvector: https://github.com/pgvector/pgvector
- TimescaleDB: https://docs.timescale.com

### Framework EDR

- Salesforce AI Research - Enterprise Deep Research
- Multi-Agent Orchestration Patterns
- RAG (Retrieval-Augmented Generation) Architecture

---

**Última Atualização**: 2025-10-26  
**Mantenedor**: Equipe OraclusX DS  
**Versão do Sistema**: ICARUS v5.0
