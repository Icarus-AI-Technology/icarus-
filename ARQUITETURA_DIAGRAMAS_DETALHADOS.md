# ICARUS v5.0 — Diagramas de Arquitetura Detalhados

> **Diagramas Complementares de Arquitetura**  
> Versão: 5.0  
> Última Atualização: 17 de novembro de 2025

---

## 📋 Índice

1. [Diagrama de Sequência: Autenticação](#1-diagrama-de-sequência-autenticação)
2. [Diagrama de Sequência: Geração de Relatório IA](#2-diagrama-de-sequência-geração-de-relatório-ia)
3. [Diagrama de Componentes: Frontend](#3-diagrama-de-componentes-frontend)
4. [Diagrama de Deployment](#4-diagrama-de-deployment)
5. [Diagrama C4: Contexto do Sistema](#5-diagrama-c4-contexto-do-sistema)
6. [Diagrama C4: Container](#6-diagrama-c4-container)
7. [Diagrama de Classes: Domain Model](#7-diagrama-de-classes-domain-model)
8. [Fluxograma: Processo de Cirurgia](#8-fluxograma-processo-de-cirurgia)

---

## 1. Diagrama de Sequência: Autenticação

```mermaid
sequenceDiagram
    actor Usuario
    participant UI as React UI
    participant Auth as Supabase Auth
    participant API as Business API
    participant DB as PostgreSQL
    
    Usuario->>UI: Digita credenciais
    UI->>Auth: POST /auth/signin<br/>{email, password}
    Auth->>DB: Valida credenciais
    DB-->>Auth: Usuário encontrado
    Auth->>DB: Busca roles e permissões
    DB-->>Auth: Roles: [admin, gestor]
    Auth->>Auth: Gera JWT com claims
    Auth-->>UI: {access_token, refresh_token, user}
    UI->>UI: Armazena tokens (localStorage)
    UI->>API: GET /api/v1/me<br/>Authorization: Bearer {token}
    API->>Auth: Valida token
    Auth-->>API: Token válido + user claims
    API->>DB: Busca perfil completo
    DB-->>API: Perfil + permissões
    API-->>UI: {user, permissions, preferences}
    UI->>UI: Redireciona para dashboard
    UI-->>Usuario: Dashboard carregado
```

---

## 2. Diagrama de Sequência: Geração de Relatório IA

```mermaid
sequenceDiagram
    actor Gestor
    participant UI as React UI
    participant API as Business API
    participant Orch as Orquestrador
    participant AgentInt as Agente Interno
    participant AgentBench as Agente Benchmark
    participant AgentSynth as Agente Síntese
    participant DB as PostgreSQL
    participant External as APIs Externas
    
    Gestor->>UI: Solicita relatório de consumo
    UI->>API: POST /api/v1/relatorios/consumo<br/>{periodo, unidade}
    API->>Orch: Aciona pipeline<br/>{tipo: consumo, params}
    
    par Processamento Paralelo
        Orch->>AgentInt: Coleta dados internos
        AgentInt->>DB: SELECT consumo_materiais<br/>WHERE periodo...
        DB-->>AgentInt: Dados históricos
        AgentInt->>AgentInt: Calcula médias, tendências
        
        Orch->>AgentBench: Busca benchmarks
        AgentBench->>External: GPT Researcher<br/>"consumo hospitalar 2025"
        External-->>AgentBench: Dados de mercado
        AgentBench->>AgentBench: Extrai KPIs relevantes
    end
    
    AgentInt-->>Orch: {consumo_interno, tendencias}
    AgentBench-->>Orch: {benchmarks, comparacoes}
    
    Orch->>AgentSynth: Sintetiza relatório<br/>{interno, benchmark}
    AgentSynth->>AgentSynth: Gera insights com LLM
    AgentSynth->>AgentSynth: Cria visualizações
    AgentSynth->>AgentSynth: Formata PDF executivo
    AgentSynth-->>Orch: {relatorio_pdf, insights_json}
    
    Orch-->>API: Relatório completo
    API->>DB: Salva em relatorios_gerados
    API-->>UI: {relatorio_url, insights}
    UI-->>Gestor: Exibe relatório + download
```

---

## 3. Diagrama de Componentes: Frontend

```mermaid
graph TB
    subgraph "Frontend Application"
        App[App Root]
        Router[React Router]
        
        subgraph "Core Components"
            Layout[Layout System]
            Sidebar[Sidebar]
            Topbar[Topbar]
            Theme[Theme Provider]
        end
        
        subgraph "Feature Modules"
            Dashboard[Dashboard]
            Cirurgias[Módulo Cirurgias]
            Estoque[Módulo Estoque]
            Compras[Módulo Compras]
            Vendas[Módulo Vendas]
            Financeiro[Módulo Financeiro]
            Compliance[Módulo Compliance]
            Chatbot[Chatbot IA]
        end
        
        subgraph "Shared Components"
            Forms[Form Components]
            Tables[Data Tables]
            Charts[Chart Components]
            Modals[Modal System]
        end
        
        subgraph "State Management"
            ReactQuery[React Query<br/>Server State]
            Zustand[Zustand<br/>Client State]
            AuthStore[Auth Store]
        end
        
        subgraph "API Layer"
            SupabaseClient[Supabase Client]
            RestAPI[REST API Client]
            WebSocket[WebSocket Client]
        end
    end
    
    App --> Router
    Router --> Layout
    Layout --> Sidebar
    Layout --> Topbar
    Layout --> Theme
    
    Router --> Dashboard
    Router --> Cirurgias
    Router --> Estoque
    Router --> Compras
    Router --> Vendas
    Router --> Financeiro
    Router --> Compliance
    Router --> Chatbot
    
    Dashboard --> Forms
    Dashboard --> Tables
    Dashboard --> Charts
    
    Cirurgias --> Forms
    Cirurgias --> Tables
    Cirurgias --> Modals
    
    Forms --> ReactQuery
    Tables --> ReactQuery
    Charts --> ReactQuery
    
    ReactQuery --> SupabaseClient
    ReactQuery --> RestAPI
    
    AuthStore --> Zustand
    SupabaseClient --> AuthStore
    
    WebSocket -.->|real-time| Tables
```

---

## 4. Diagrama de Deployment

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "CDN Layer - Vercel Edge"
        CDN[Global Edge Network<br/>Static Assets]
    end
    
    subgraph "Frontend - Vercel"
        SSR[SSR Functions<br/>React 18]
        Static[Static Pages<br/>Pre-rendered]
    end
    
    subgraph "Backend - Supabase Cloud"
        subgraph "Edge Functions"
            AuthFunc[Auth Functions]
            APIFunc[Business API Functions]
            WebhookFunc[Webhook Functions]
        end
        
        subgraph "Database"
            PG[(PostgreSQL 15<br/>Primary)]
            PGReplica[(Read Replica)]
        end
        
        subgraph "Storage"
            S3[Object Storage<br/>S3-compatible]
        end
        
        subgraph "Realtime"
            RT[Realtime Engine<br/>WebSockets]
        end
    end
    
    subgraph "AI Agents - Cloud Run / Lambda"
        Orchestrator[Orquestrador<br/>Node.js Container]
        AgentPool[Agent Pool<br/>3 workers]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API<br/>GPT-4]
        ANVISA[ANVISA API]
        RFID[RFID Gateway]
        Blockchain[Blockchain Node]
    end
    
    Browser --> CDN
    Mobile --> CDN
    CDN --> SSR
    CDN --> Static
    
    SSR --> AuthFunc
    SSR --> APIFunc
    
    AuthFunc --> PG
    APIFunc --> PG
    APIFunc --> PGReplica
    APIFunc --> S3
    APIFunc --> RT
    APIFunc --> Orchestrator
    
    RT -.->|WebSocket| Browser
    
    Orchestrator --> AgentPool
    AgentPool --> PG
    AgentPool --> OpenAI
    AgentPool --> ANVISA
    
    APIFunc --> RFID
    APIFunc --> Blockchain
    
    WebhookFunc --> PG
```

---

## 5. Diagrama C4: Contexto do Sistema

```mermaid
C4Context
    title Diagrama de Contexto - ICARUS v5.0
    
    Person(medico, "Médico", "Agenda e executa cirurgias")
    Person(enfermeiro, "Enfermeiro", "Assiste cirurgias e controla materiais")
    Person(gestor, "Gestor", "Monitora operações e relatórios")
    Person(comprador, "Comprador", "Gerencia compras e fornecedores")
    Person(admin, "Administrador", "Gerencia sistema e usuários")
    
    System(icarus, "ICARUS v5.0", "Plataforma de Gestão Hospitalar Integrada")
    
    System_Ext(anvisa, "ANVISA API", "Validação de registros médicos")
    System_Ext(openai, "OpenAI", "Inteligência Artificial para relatórios")
    System_Ext(rfid, "Sistema RFID", "Rastreamento de materiais")
    System_Ext(blockchain, "Blockchain", "Registro imutável de transações")
    System_Ext(erp, "ERP Hospitalar", "Sistema legado (integração futura)")
    
    Rel(medico, icarus, "Agenda cirurgias, consulta estoque")
    Rel(enfermeiro, icarus, "Registra consumo, atualiza status")
    Rel(gestor, icarus, "Visualiza dashboards, gera relatórios")
    Rel(comprador, icarus, "Cria pedidos, negocia com fornecedores")
    Rel(admin, icarus, "Configura sistema, gerencia usuários")
    
    Rel(icarus, anvisa, "Valida códigos UDI", "HTTPS")
    Rel(icarus, openai, "Gera relatórios com IA", "HTTPS")
    Rel(icarus, rfid, "Recebe eventos de rastreamento", "MQTT")
    Rel(icarus, blockchain, "Registra transações críticas", "RPC")
    Rel_Back(erp, icarus, "Sincroniza dados (futuro)", "REST API")
    
    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## 6. Diagrama C4: Container

```mermaid
C4Container
    title Diagrama de Container - ICARUS v5.0
    
    Person(user, "Usuário", "Profissional de saúde ou gestor")
    
    Container_Boundary(icarus, "ICARUS v5.0") {
        Container(webapp, "Web Application", "React 18, TypeScript", "Interface do usuário moderna e responsiva")
        Container(api, "Business API", "Supabase Edge Functions", "Lógica de negócio e orquestração")
        Container(auth, "Auth Service", "Supabase Auth", "Autenticação e autorização (JWT, RBAC)")
        Container(db, "Database", "PostgreSQL 15", "Armazenamento persistente com RLS")
        Container(storage, "File Storage", "Supabase Storage", "Documentos, imagens, relatórios")
        Container(realtime, "Realtime Engine", "Supabase Realtime", "Updates em tempo real via WebSocket")
        
        Container_Boundary(agents, "Pipeline de Agentes IA") {
            Container(orchestrator, "Orquestrador", "Node.js, MCP", "Coordena execução de agentes")
            Container(agent_int, "Agente Interno", "Python, LangChain", "Análise de dados internos")
            Container(agent_bench, "Agente Benchmark", "Python, GPT Researcher", "Pesquisa externa")
            Container(agent_synth, "Agente Síntese", "Python, OpenAI", "Gera relatórios executivos")
        }
    }
    
    System_Ext(openai, "OpenAI API", "GPT-4 para LLM")
    System_Ext(anvisa, "ANVISA API", "Validação regulatória")
    
    Rel(user, webapp, "Acessa via navegador", "HTTPS")
    Rel(webapp, auth, "Autentica", "JWT")
    Rel(webapp, api, "Consome APIs", "REST/GraphQL")
    Rel(webapp, realtime, "Recebe updates", "WebSocket")
    
    Rel(api, auth, "Valida tokens", "Internal")
    Rel(api, db, "Lê/escreve dados", "SQL")
    Rel(api, storage, "Upload/download arquivos", "S3 API")
    Rel(api, orchestrator, "Solicita relatórios", "HTTP")
    
    Rel(orchestrator, agent_int, "Dispara coleta interna", "RPC")
    Rel(orchestrator, agent_bench, "Dispara benchmark", "RPC")
    Rel(agent_int, db, "Consulta dados", "SQL")
    Rel(agent_bench, openai, "Pesquisa com IA", "HTTPS")
    Rel(agent_bench, anvisa, "Valida registros", "HTTPS")
    Rel(agent_int, agent_synth, "Envia dados", "JSON")
    Rel(agent_bench, agent_synth, "Envia benchmarks", "JSON")
    Rel(agent_synth, openai, "Gera texto", "HTTPS")
    Rel(agent_synth, storage, "Salva relatório", "S3 API")
    
    UpdateRelStyle(user, webapp, $offsetY="-40")
    UpdateRelStyle(webapp, api, $offsetX="-50")
```

---

## 7. Diagrama de Classes: Domain Model

```mermaid
classDiagram
    class Hospital {
        +UUID id
        +String nome
        +String cnpj
        +String endereco
        +Boolean ativo
        +getUnidades()
    }
    
    class Unidade {
        +UUID id
        +UUID hospital_id
        +String nome
        +String tipo
        +getCirurgias()
        +getEstoque()
    }
    
    class Usuario {
        +UUID id
        +String email
        +String nome
        +String[] roles
        +Boolean ativo
        +hasPermission(permission)
    }
    
    class Cirurgia {
        +UUID id
        +UUID unidade_id
        +UUID medico_id
        +DateTime data_hora
        +String status
        +Decimal valor_total
        +adicionarMaterial()
        +calcularValorTotal()
        +finalizarCirurgia()
    }
    
    class CirurgiaMaterial {
        +UUID id
        +UUID cirurgia_id
        +UUID material_id
        +Integer quantidade
        +Decimal valor_unitario
        +Decimal subtotal
    }
    
    class Material {
        +UUID id
        +String codigo
        +String nome
        +String categoria
        +Decimal preco_medio
        +String unidade_medida
        +verificarEstoque(unidade)
        +getLotes()
    }
    
    class Lote {
        +UUID id
        +UUID material_id
        +String numero_lote
        +Date data_validade
        +Integer quantidade_atual
        +Boolean bloqueado
        +isVencido()
        +isVencendo(dias)
    }
    
    class MovimentacaoEstoque {
        +UUID id
        +UUID material_id
        +UUID lote_id
        +String tipo
        +Integer quantidade
        +DateTime data_hora
        +UUID usuario_id
        +registrarMovimentacao()
    }
    
    class Consignacao {
        +UUID id
        +UUID fornecedor_id
        +UUID unidade_id
        +DateTime data_entrada
        +String status
        +adicionarItem()
        +faturar()
    }
    
    class Fornecedor {
        +UUID id
        +String razao_social
        +String cnpj
        +String[] categorias
        +Decimal rating
        +getContratos()
        +getMateriais()
    }
    
    class PedidoCompra {
        +UUID id
        +UUID fornecedor_id
        +DateTime data_pedido
        +String status
        +Decimal valor_total
        +aprovar()
        +receberMercadoria()
    }
    
    class NotaFiscal {
        +UUID id
        +String numero
        +Date data_emissao
        +Decimal valor_total
        +String tipo
        +validar()
        +integrarContabilidade()
    }
    
    Hospital "1" --> "*" Unidade
    Unidade "1" --> "*" Cirurgia
    Usuario "1" --> "*" Cirurgia : realiza
    Cirurgia "1" --> "*" CirurgiaMaterial
    Material "1" --> "*" CirurgiaMaterial
    Material "1" --> "*" Lote
    Lote "1" --> "*" MovimentacaoEstoque
    Material "1" --> "*" MovimentacaoEstoque
    Fornecedor "1" --> "*" Consignacao
    Unidade "1" --> "*" Consignacao
    Fornecedor "1" --> "*" PedidoCompra
    PedidoCompra "1" --> "1" NotaFiscal
    Cirurgia "1" --> "0..1" NotaFiscal
```

---

## 8. Fluxograma: Processo de Cirurgia

```mermaid
flowchart TD
    Start([Início]) --> AgendarCirurgia[Médico agenda cirurgia]
    AgendarCirurgia --> SelecionarMateriais[Selecionar materiais necessários]
    SelecionarMateriais --> VerificarEstoque{Estoque disponível?}
    
    VerificarEstoque -->|Sim| ReservarMateriais[Reservar materiais]
    VerificarEstoque -->|Não| SolicitarConsignacao[Solicitar consignação]
    
    SolicitarConsignacao --> AguardarEntrega[Aguardar entrega]
    AguardarEntrega --> ReservarMateriais
    
    ReservarMateriais --> AguardarDataCirurgia[Aguardar data da cirurgia]
    AguardarDataCirurgia --> SepararMateriais[Separar materiais no CC]
    SepararMateriais --> IniciarCirurgia[Iniciar cirurgia]
    
    IniciarCirurgia --> RegistrarConsumo[Enfermeiro registra consumo real]
    RegistrarConsumo --> TodosMaterialsRegistrados{Todos materiais<br/>registrados?}
    
    TodosMaterialsRegistrados -->|Não| RegistrarConsumo
    TodosMaterialsRegistrados -->|Sim| FinalizarCirurgia[Finalizar cirurgia]
    
    FinalizarCirurgia --> AtualizarEstoque[Atualizar estoque]
    AtualizarEstoque --> CalcularCusto[Calcular custo total]
    CalcularCusto --> GerarCobranca{Paciente particular?}
    
    GerarCobranca -->|Sim| EmitirNF[Emitir nota fiscal]
    GerarCobranca -->|Não| RegistrarRepasse[Registrar repasse SUS/Convênio]
    
    EmitirNF --> RegistrarFinanceiro[Registrar no financeiro]
    RegistrarRepasse --> RegistrarFinanceiro
    
    RegistrarFinanceiro --> AtualizarIndicadores[Atualizar indicadores]
    AtualizarIndicadores --> FoiConsignacao{Foi usada<br/>consignação?}
    
    FoiConsignacao -->|Sim| FaturarConsignacao[Faturar consignação]
    FoiConsignacao -->|Não| End
    
    FaturarConsignacao --> GerarPagamentoFornecedor[Gerar pagamento para fornecedor]
    GerarPagamentoFornecedor --> End([Fim])
    
    style Start fill:#90EE90
    style End fill:#FFB6C1
    style VerificarEstoque fill:#FFD700
    style TodosMaterialsRegistrados fill:#FFD700
    style GerarCobranca fill:#FFD700
    style FoiConsignacao fill:#FFD700
```

---

## 9. Diagrama de Estados: Ciclo de Vida da Cirurgia

```mermaid
stateDiagram-v2
    [*] --> Agendada: Médico agenda
    
    Agendada --> Materiais_Reservados: Reservar materiais
    Agendada --> Aguardando_Consignacao: Solicitar consignação
    
    Aguardando_Consignacao --> Materiais_Reservados: Consignação chegou
    Aguardando_Consignacao --> Cancelada: Cancelar cirurgia
    
    Materiais_Reservados --> Em_Preparacao: Dia da cirurgia
    Materiais_Reservados --> Cancelada: Cancelar cirurgia
    
    Em_Preparacao --> Em_Andamento: Iniciar cirurgia
    Em_Preparacao --> Cancelada: Emergência/Cancelamento
    
    Em_Andamento --> Finalizando: Procedimento concluído
    
    Finalizando --> Finalizada: Registrar todos materiais
    Finalizando --> Em_Andamento: Material adicional necessário
    
    Finalizada --> Faturada: Emitir cobrança
    
    Faturada --> [*]
    Cancelada --> [*]
    
    note right of Agendada
        Status inicial após
        criação do registro
    end note
    
    note right of Materiais_Reservados
        Materiais bloqueados
        no estoque
    end note
    
    note right of Em_Andamento
        Centro cirúrgico
        em operação
    end note
    
    note right of Finalizada
        Custo calculado,
        estoque atualizado
    end note
```

---

## 10. Diagrama de Entidade-Relacionamento (Simplificado)

```mermaid
erDiagram
    HOSPITAIS ||--o{ UNIDADES : possui
    UNIDADES ||--o{ CIRURGIAS : realiza
    UNIDADES ||--o{ ESTOQUE : mantém
    USUARIOS ||--o{ CIRURGIAS : executa
    CIRURGIAS ||--o{ CIRURGIA_MATERIAIS : consome
    MATERIAIS ||--o{ CIRURGIA_MATERIAIS : usado_em
    MATERIAIS ||--o{ LOTES : possui
    MATERIAIS ||--o{ ESTOQUE : armazenado_em
    LOTES ||--o{ MOVIMENTACOES_ESTOQUE : registra
    FORNECEDORES ||--o{ CONSIGNACOES : fornece
    UNIDADES ||--o{ CONSIGNACOES : recebe
    CONSIGNACOES ||--o{ CONSIGNACAO_ITENS : contém
    FORNECEDORES ||--o{ PEDIDOS_COMPRA : recebe
    PEDIDOS_COMPRA ||--o{ PEDIDO_ITENS : contém
    CIRURGIAS ||--o| NOTAS_FISCAIS : gera
    PEDIDOS_COMPRA ||--o| NOTAS_FISCAIS : origina
    
    HOSPITAIS {
        uuid id PK
        string nome
        string cnpj UK
        boolean ativo
    }
    
    UNIDADES {
        uuid id PK
        uuid hospital_id FK
        string nome
        string tipo
    }
    
    CIRURGIAS {
        uuid id PK
        uuid unidade_id FK
        uuid medico_id FK
        timestamp data_hora
        string status
        decimal valor_total
    }
    
    MATERIAIS {
        uuid id PK
        string codigo UK
        string nome
        string categoria
        decimal preco_medio
    }
    
    LOTES {
        uuid id PK
        uuid material_id FK
        string numero_lote
        date data_validade
        integer quantidade_atual
    }
    
    FORNECEDORES {
        uuid id PK
        string razao_social
        string cnpj UK
        decimal rating
    }
    
    CONSIGNACOES {
        uuid id PK
        uuid fornecedor_id FK
        uuid unidade_id FK
        timestamp data_entrada
        string status
    }
    
    PEDIDOS_COMPRA {
        uuid id PK
        uuid fornecedor_id FK
        date data_pedido
        string status
        decimal valor_total
    }
    
    NOTAS_FISCAIS {
        uuid id PK
        string numero UK
        date data_emissao
        decimal valor_total
        string tipo
    }
```

---

## Referências

- [Arquitetura Geral](./ARQUITETURA_ICARUS_V5_VISAO_GERAL.md)
- [Documentação Técnica](./DOCUMENTACAO_TECNICA_COMPLETA.md)
- [Inventário de Módulos](./INVENTARIO_58_MODULOS_COMPLETO.md)

---

**Mantido por**: Equipe de Arquitetura ICARUS  
**Data**: 17 de novembro de 2025

