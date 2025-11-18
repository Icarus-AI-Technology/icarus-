# Arquitetura ICARUS v5.0 (OraclusX) — Visão Geral

> **Documento de Arquitetura de Alto Nível**  
> Versão: 5.0  
> Última Atualização: 17 de novembro de 2025

---

## 📋 Índice

1. [Panorama Geral](#1-panorama-geral)
2. [Componentes Principais](#2-componentes-principais)
3. [Fluxos de Dados](#3-fluxos-de-dados)
4. [Tecnologias Utilizadas](#4-tecnologias-utilizadas)
5. [Segurança e Compliance](#5-segurança-e-compliance)
6. [Escalabilidade](#6-escalabilidade)

---

## 1. Panorama Geral

O ICARUS v5.0 (OraclusX) é uma plataforma hospitalar completa que integra gestão de estoque, cirurgias, compras, vendas, CRM, financeiro e compliance regulatório. A arquitetura é baseada em microsserviços com orquestração inteligente de agentes.

### Diagrama de Arquitetura

```mermaid
%%{init:{"theme":"forest"}}%%
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
  Regul:R --> L:API  
```

---

## 2. Componentes Principais

### 2.1 Frontend (App React/TS)

**Descrição**: Interface do usuário moderna e responsiva construída com React 18 e TypeScript.

**Responsabilidades**:
- Renderização da UI com componentes reutilizáveis
- Gerenciamento de estado (React Query, Zustand)
- Comunicação com o backend via REST/GraphQL
- Validação de formulários e feedback ao usuário
- Design System baseado em OraclusX (Neumorphic)

**Tecnologias**:
- React 18 com TypeScript
- Vite como bundler
- TailwindCSS + shadcn/ui
- React Query para data fetching
- React Router para navegação

**Módulos Principais**:
- Dashboard Principal
- Gestão de Cirurgias
- Estoque e Consignação
- Compras e Fornecedores
- Vendas e CRM
- Financeiro e Faturamento
- Compliance e Auditoria
- Chatbot com GPT Researcher

---

### 2.2 Backend (Supabase + Functions)

**Descrição**: Camada de backend serverless com PostgreSQL gerenciado e funções edge.

#### 2.2.1 Auth & RBAC

**Responsabilidades**:
- Autenticação de usuários (JWT)
- Controle de acesso baseado em roles (RBAC)
- Gestão de sessões e tokens
- Row Level Security (RLS)

**Roles do Sistema**:
- `super_admin`: Acesso total
- `admin`: Gestão operacional
- `gestor`: Visualização e relatórios
- `operacional`: Operações diárias
- `auditor`: Auditoria e compliance
- `medico`: Gestão de cirurgias
- `enfermeiro`: Assistência cirúrgica
- `comprador`: Gestão de compras
- `vendedor`: Gestão de vendas

#### 2.2.2 Business API

**Responsabilidades**:
- Lógica de negócios
- Validações de dados
- Processamento de transações
- Integração com orquestrador de agentes
- Webhooks para eventos

**Endpoints Principais**:
```
/api/v1/cirurgias
/api/v1/estoque
/api/v1/consignacao
/api/v1/compras
/api/v1/vendas
/api/v1/financeiro
/api/v1/compliance
/api/v1/relatorios
/api/v1/chatbot
```

#### 2.2.3 PostgreSQL Database

**Responsabilidades**:
- Armazenamento persistente de dados
- Triggers e stored procedures
- Materialized views para relatórios
- Auditoria de mudanças (trigger-based)

**Schemas Principais**:
- `public`: Tabelas principais
- `auth`: Autenticação (Supabase)
- `storage`: Arquivos e documentos
- `audit`: Logs de auditoria

**Tabelas Core** (58 tabelas no total):
- `hospitais`, `unidades`, `usuarios`
- `cirurgias`, `cirurgia_materiais`
- `materiais`, `lotes`, `movimentacoes_estoque`
- `consignacoes`, `consignacao_itens`
- `compras`, `pedidos_compra`
- `vendas`, `contratos`, `crm_leads`
- `contas_pagar`, `contas_receber`, `notas_fiscais`
- `compliance_registros`, `auditorias`

---

### 2.3 Pipeline de Agentes (Orquestração IA)

**Descrição**: Sistema de inteligência artificial multi-agente para análise de dados, benchmarking e geração de relatórios.

#### 2.3.1 Orquestrador

**Responsabilidades**:
- Coordenação da pipeline de agentes
- Distribuição de tarefas
- Monitoramento de execução
- Tratamento de erros e retry logic

**Tecnologia**: Node.js com MCP (Model Context Protocol)

#### 2.3.2 Agente Dados Internos

**Responsabilidades**:
- Extração de dados do banco de dados
- Agregação de métricas operacionais
- Análise de tendências históricas
- Detecção de anomalias

**Saídas**:
- KPIs operacionais
- Análises de consumo
- Previsões de demanda

#### 2.3.3 Agente Benchmark Externo

**Responsabilidades**:
- Pesquisa de dados externos (GPT Researcher)
- Comparação com benchmarks de mercado
- Análise de preços e fornecedores
- Compliance regulatório (ANVISA, UDI)

**Fontes de Dados**:
- APIs públicas de saúde
- Bancos de dados de preços médicos
- Regulamentações ANVISA
- Base UDI (Unique Device Identification)

#### 2.3.4 Agente Síntese Relatório

**Responsabilidades**:
- Consolidação de dados internos e externos
- Geração de relatórios executivos
- Visualizações e dashboards
- Recomendações baseadas em IA

**Formatos de Saída**:
- PDF executivo
- Excel com análises
- JSON para dashboards
- Gráficos interativos

---

### 2.4 Integrações Externas

#### 2.4.1 IoT/RFID/Blockchain

**Responsabilidades**:
- Rastreamento de materiais via RFID
- Integração com dispositivos IoT
- Registro imutável em blockchain (opcional)
- Controle de temperatura e condições de armazenamento

**Protocolos**:
- MQTT para IoT
- REST APIs para RFID readers
- Ethereum/Hyperledger para blockchain

#### 2.4.2 Compliance/ANVISA/UDI

**Responsabilidades**:
- Validação de registros ANVISA
- Verificação de códigos UDI
- Alertas de vencimento e recalls
- Relatórios regulatórios automáticos

**Integrações**:
- API ANVISA (Consulta de Registros)
- Base UDI Global (GUDID)
- e-SUS (Sistema Único de Saúde)

---

## 3. Fluxos de Dados

### 3.1 Fluxo de Autenticação

```
1. Usuário faz login → UI
2. UI envia credenciais → Auth
3. Auth valida e gera JWT → UI
4. UI armazena token e redireciona
```

### 3.2 Fluxo de Operação (CRUD)

```
1. UI envia requisição → Auth (validação de token)
2. Auth verifica permissões → API
3. API executa lógica de negócio → DB
4. DB retorna dados → API
5. API formata resposta → UI
```

### 3.3 Fluxo de Geração de Relatório

```
1. UI solicita relatório → API
2. API aciona → Orchestrator
3. Orchestrator dispara → AgentInt (dados internos)
4. Orchestrator dispara → AgentBench (dados externos)
5. AgentInt consulta → DB
6. AgentBench consulta → APIs externas
7. AgentInt + AgentBench → AgentSynth
8. AgentSynth gera relatório → API
9. API retorna → UI
```

### 3.4 Fluxo de Compliance ANVISA

```
1. Material cadastrado → UI
2. API valida código UDI → Regul (ANVISA)
3. Regul retorna validação → API
4. API registra em compliance_registros → DB
5. API retorna status → UI
```

### 3.5 Fluxo de Rastreamento RFID

```
1. Leitor RFID detecta tag → IoT
2. IoT envia evento → API
3. API registra movimentação → DB
4. API dispara webhook (se configurado)
5. UI recebe atualização em tempo real (WebSocket)
```

---

## 4. Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.6+ | Type safety |
| Vite | 5.4+ | Build tool |
| TailwindCSS | 3.4+ | Styling |
| shadcn/ui | Latest | Component library |
| React Query | 5.x | Data fetching |
| Zustand | 4.x | State management |
| React Router | 6.x | Routing |

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Supabase | Latest | BaaS platform |
| PostgreSQL | 15+ | Database |
| PostgREST | Auto | REST API |
| pg_cron | Latest | Scheduled jobs |
| pgvector | Latest | Vector embeddings (IA) |

### Agentes IA
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Node.js | 20+ | Runtime |
| MCP | Latest | Model Context Protocol |
| GPT Researcher | Latest | External research |
| OpenAI API | GPT-4 | LLM |
| LangChain | Latest | Orchestration |

### Integrações
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| MQTT | 5.0 | IoT messaging |
| REST APIs | - | HTTP integration |
| WebSockets | - | Real-time updates |
| Blockchain SDK | - | Immutable records (opt) |

---

## 5. Segurança e Compliance

### 5.1 Autenticação e Autorização

- **JWT Tokens**: Tokens assinados com expiração
- **Row Level Security (RLS)**: Políticas no PostgreSQL
- **RBAC**: 8 roles com permissões granulares
- **MFA**: Autenticação multifator (opcional)

### 5.2 Proteção de Dados

- **Criptografia em trânsito**: TLS 1.3
- **Criptografia em repouso**: AES-256
- **Dados sensíveis**: Hash bcrypt para senhas
- **LGPD**: Consentimento, anonimização, direito ao esquecimento

### 5.3 Auditoria

- **Trigger-based audit**: Registro automático de todas as mudanças
- **Logs centralizados**: Armazenamento de 90 dias
- **Compliance regulatório**: ANVISA, CFM, LGPD
- **Relatórios de auditoria**: Exportação em PDF/Excel

### 5.4 Compliance Regulatório

- **ANVISA**: Validação de registros de materiais médicos
- **UDI**: Unique Device Identification obrigatório
- **CFM**: Conformidade com normas do Conselho Federal de Medicina
- **LGPD**: Lei Geral de Proteção de Dados

---

## 6. Escalabilidade

### 6.1 Estratégia de Escalabilidade

**Horizontal**:
- Frontend: CDN (Vercel Edge Network)
- Backend: Supabase autoscaling
- Database: Read replicas (Supabase Pro)
- Agentes: Containerização com Docker/Kubernetes

**Vertical**:
- Database: Upgrade de plano Supabase
- Edge Functions: Memory allocation increase

### 6.2 Performance

**Otimizações**:
- Materialized views para relatórios complexos
- Índices em colunas de busca frequente
- Query caching (React Query)
- Code splitting no frontend
- Lazy loading de módulos

**Metas de Performance**:
- Tempo de resposta API: < 200ms (p95)
- Tempo de carregamento página: < 2s (LCP)
- Disponibilidade: 99.9% (SLA)

### 6.3 Monitoramento

**Ferramentas**:
- Supabase Dashboard (métricas de DB)
- Vercel Analytics (frontend)
- Custom logging (Winston/Pino)
- Error tracking (Sentry - opcional)

**Alertas**:
- Uso de CPU/memória > 80%
- Taxa de erro > 1%
- Tempo de resposta > 500ms
- Falhas em integração externa

---

## 7. Próximos Passos

### Roadmap Técnico

**Q1 2025**:
- [ ] Implementação completa de todos os 58 módulos
- [ ] Integração blockchain para rastreabilidade
- [ ] Mobile app (React Native)

**Q2 2025**:
- [ ] IA preditiva para gestão de estoque
- [ ] Integração com ERP hospitalar externo
- [ ] Relatórios avançados com ML

**Q3 2025**:
- [ ] Multi-tenancy completo
- [ ] Marketplace de materiais médicos
- [ ] API pública para integradores

---

## 8. Referências

- [Documentação Técnica Completa](./DOCUMENTACAO_TECNICA_COMPLETA.md)
- [Guia de Deploy](./GUIA_DEPLOY_COMPLETO.md)
- [Inventário de 58 Módulos](./INVENTARIO_58_MODULOS_COMPLETO.md)
- [Auditoria de Qualidade](./AUDITORIA_COMPLETA_FINAL.md)

---

**Documento mantido por**: Equipe de Arquitetura ICARUS  
**Contato**: dev@oraclusx.com  
**Última revisão**: 17 de novembro de 2025

