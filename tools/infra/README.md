# 🏗️ AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

**ICARUS v5.0 - Infraestrutura, Execução e Automação**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)]()

---

## 📋 Visão Geral

O **AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3** é responsável pela **infraestrutura e execução** do ICARUS v5.0, trabalhando em paralelo ao **AGENTE_DESIGNER_NEUMORPHIC_PREVIEW** (UI/UX).

### 🎯 Princípios Fundamentais

- ✅ **Sem conflito com UI:** Este agente NÃO altera layout/componentes; apenas infra/contratos/dados
- ✅ **Auth por último:** Login/Autenticação deixada para fase final; usa mocks de sessão
- ✅ **Previews automáticos:** Captura recorrente light/dark para validação visual
- ✅ **Compatibilidade contínua:** Migrations versionadas, views de compatibilidade
- ✅ **Observabilidade desde o início:** Healthchecks, logs, métricas, alertas

---

## 🚀 Quick Start

### 1️⃣ Auditoria Inicial

```bash
npm run infra:audit
```

Gera relatório completo das lacunas de infraestrutura em `docs/infra/relatorio-orquestrador.md`.

### 2️⃣ Planejamento

```bash
npm run infra:plan
```

Gera migrations SQL e documentação em `docs/infra/plano-migrations.md`.

### 3️⃣ Healthcheck

```bash
npm run infra:health
```

Valida conectividade e configuração:
- ICARUS_WEB_URL (preview)
- Supabase (URL, ANON_KEY, SERVICE_ROLE_KEY)
- Meilisearch (opcional)

### 4️⃣ Aplicação (Manual)

```bash
npm run infra:apply
```

Gera guia de aplicação manual em `docs/infra/guia-aplicacao.md`.

---

## 📦 Entregáveis

### 🗄️ Banco de Dados

- **Schemas:** Tabelas multi-tenant (empresa_id)
- **RLS:** Políticas de segurança por linha
- **RBAC:** Controle de acesso por papel/módulo
- **Views materializadas:** KPIs pré-calculados
- **Índices:** Performance otimizada
- **Triggers:** Auditoria automática

### 🔒 Segurança

- **RLS multi-tenant** por `empresa_id`
- **RBAC** por módulo/ação
- **Auditoria** de acesso e alterações
- **LGPD** compliance (minimização, acesso)
- **ANVISA** rastreabilidade OPME

### 📦 Storage

Buckets segregados:
- `cirurgias` (10MB, image/pdf)
- `faturamento` (50MB, pdf/xml)
- `compliance` (10MB, pdf/image)
- `consignacao` (10MB, pdf/image)
- `uploads` (10MB, image/pdf/text)

### 🌐 Edge Functions (Deno/TS)

- `valida_crm_cfm` - Validação CFM
- `consulta_anvisa_produto` - Consulta ANVISA
- `ocr_danfe` - OCR de notas fiscais
- `notificacao_push` - Notificações
- `recalcular_kpis` - Recálculo de KPIs

### 🔄 Realtime Channels

- `cirurgias:*` - Mudanças em cirurgias
- `dashboard_kpis:*` - Atualizações de KPIs
- `consignacao_alertas:*` - Alertas de consignação
- `estoque_critico:*` - Estoque crítico

---

## 🏗️ Domínio Cirurgias (Core)

### Tabelas Principais

```
cirurgias
├── id (UUID, PK)
├── empresa_id (UUID, FK → empresas)
├── paciente_id (UUID, FK → pacientes)
├── medico_id (UUID, FK → medicos)
├── hospital_id (UUID, FK → hospitais)
├── convenio_id (UUID, FK → convenios, nullable)
├── data_agendada (TIMESTAMP)
├── duracao_estimada_min (INTEGER)
├── status_cirurgia (ENUM)
├── sala (VARCHAR)
└── observacoes (TEXT)

cirurgia_materiais
├── id (UUID, PK)
├── cirurgia_id (UUID, FK → cirurgias)
├── material_id (UUID, FK → materiais)
├── quantidade (DECIMAL)
├── lote (VARCHAR)
├── validade (DATE)
├── rastreamento_anvisa (VARCHAR)
└── status_item (ENUM)

cirurgia_eventos (timeline)
├── id (UUID, PK)
├── cirurgia_id (UUID, FK → cirurgias)
├── tipo_evento (VARCHAR)
├── descricao (TEXT)
├── data_hora (TIMESTAMP)
└── usuario_id (UUID, FK → auth.users)
```

### Status Enums

```sql
status_cirurgia: agendada | confirmada | em_andamento | concluida | cancelada
status_item: pendente | separado | entregue | utilizado | devolvido | perdido
```

### Views & Functions

- `vw_dashboard_kpis` (materialized) - KPIs agregados
- `vw_cirurgias_proximas` - Agenda 7 dias
- `vw_cirurgia_kit_detalhado` - Kit completo
- `get_dashboard_kpis(empresa_id, periodo)` - RPC KPIs
- `get_agenda_cirurgias(empresa_id, inicio, fim)` - RPC Agenda
- `refresh_dashboard_kpis()` - Refresh cron

---

## 🔐 RLS & RBAC

### Exemplo: cirurgias

```sql
-- SELECT: usuários veem apenas da sua empresa
CREATE POLICY cirurgias_select_policy ON public.cirurgias
  FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- INSERT/UPDATE: apenas coordenadores, gerentes e admins
CREATE POLICY cirurgias_insert_policy ON public.cirurgias
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );
```

### Papéis (roles)

- `super_admin` - Acesso total
- `admin` - Acesso administrativo da empresa
- `gerente` - Gestão operacional
- `coordenador` - Coordenação de cirurgias/estoque
- `operador` - Operações básicas
- `visualizador` - Somente leitura

---

## 📊 Estrutura de Pastas

```
tools/infra/
├── audit.js          # Auditoria de lacunas
├── plan.js           # Gerador de migrations
├── apply.js          # Guia de aplicação
└── health.js         # Healthcheck

supabase/
├── migrations/       # Migrations SQL versionadas
│   ├── YYYYMMDD_01_cirurgias_tabelas.sql
│   ├── YYYYMMDD_02_cirurgias_rls.sql
│   ├── YYYYMMDD_03_dashboard_views.sql
│   └── YYYYMMDD_04_dashboard_functions.sql
└── functions/        # Edge Functions (Deno)
    ├── valida_crm_cfm/
    ├── consulta_anvisa_produto/
    ├── ocr_danfe/
    ├── notificacao_push/
    └── recalcular_kpis/

docs/infra/
├── relatorio-orquestrador.md    # Auditoria completa
├── plano-migrations.md          # Plano de execução
├── guia-aplicacao.md            # Guia de apply
├── healthcheck.md               # Resultados healthcheck
└── changelog-migrations.md      # Changelog migrations
```

---

## 🧪 Fluxo de Trabalho

### 1. Desenvolvimento Local

```bash
# 1. Iniciar Supabase (Docker)
supabase start

# 2. Auditar infraestrutura
npm run infra:audit

# 3. Gerar migrations
npm run infra:plan

# 4. Aplicar migrations
supabase db reset

# 5. Gerar tipos TypeScript
npm run db:gen:types

# 6. Validar
npm run infra:health
```

### 2. Deploy Staging/Production

```bash
# 1. Conectar ao projeto remoto
supabase link --project-ref [PROJECT_REF]

# 2. Aplicar migrations
supabase db push

# 3. Deploy Edge Functions
supabase functions deploy

# 4. Validar
npm run infra:health
```

---

## 📈 Performance

### Metas

- ✅ 50 usuários simultâneos
- ✅ Queries < 100ms (p95)
- ✅ Bundle < 1MB gzip
- ✅ Lighthouse > 90

### Otimizações

- **pgBouncer** (pooling)
- **Prepared statements**
- **Views materializadas** (refresh a cada 15min)
- **Índices estratégicos**
- **Realtime** apenas onde necessário
- **Debouncing** no cliente

---

## 🧯 Resiliência

- **Idempotência** em Edge Functions
- **Circuit breaker** para integrações externas
- **Rate limits** por IP/tenant
- **DLQ** (Dead Letter Queue) para jobs falhados
- **Feature flags** para mudanças críticas
- **Backups** automáticos diários
- **Point-in-time** recovery

---

## 📚 Documentação Adicional

- [AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR_v3.md](../../AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR_v3.md) - Especificação completa
- [AGENTE_DESIGNER_NEUMORPHIC_PREVIEW.md](../../AGENTE_DESIGNER_NEUMORPHIC_PREVIEW.md) - Agente de UI (paralelo)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## ⚙️ Intents (Ações Rápidas)

```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"auditarInfra","params":{}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"gerarMigrations","params":{"alvos":["cirurgias","consignacao","compliance","dashboard_kpis"]}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"configurarRLS","params":{"tenant":"empresa_id"}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"recalcularKPIs","params":{"view":"vw_dashboard_kpis"}} }
```

---

## 🤝 Coordenação com Agente de Design

Este agente trabalha **em paralelo** ao **AGENTE_DESIGNER_NEUMORPHIC_PREVIEW**:

- **Orquestrador:** Infraestrutura, dados, contratos, segurança
- **Designer:** UI, UX, componentes, previews visuais, Neumorphism 3D

**Sem conflitos:** Cada agente tem seu escopo bem definido.

---

## ✅ Critérios de Aceite

- [ ] Previews automáticos ativos e prints light/dark em rotas-chave
- [ ] Auth deixada para fase final (sem bloqueios)
- [ ] RLS/RBAC implementados com testes de fumaça
- [ ] Views/RPC performáticas para Dashboard/Cirurgias
- [ ] Pipelines de indexação Meili e OCR DANFE funcionais
- [ ] Healthchecks verdes (ICARUS_WEB_URL, Meili, ENVs Supabase)
- [ ] Documentação `docs/infra/*` atualizada e versionada

---

## 📝 Changelog

### v3.0.0 (2025-10-20)

- ✨ Ampliação de escopo funcional
- ✨ Automações de auditoria, planejamento e healthcheck
- ✨ Templates de migrations para domínio Cirurgias
- ✨ Scripts de infraestrutura (audit, plan, apply, health)
- ✨ Documentação expandida com troubleshooting
- ✨ Integração com PM2 para previews automáticos

### v2.0.0

- ✨ RLS multi-tenant por empresa_id
- ✨ Views materializadas para KPIs
- ✨ Edge Functions (validações, OCR, notificações)

### v1.0.0

- 🎉 Release inicial
- ✨ Schema básico e migrations
- ✨ Storage buckets

---

## 📞 Contato & Suporte

- **Issues:** GitHub Issues
- **Docs:** `/docs/infra/`
- **Specs:** `AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR_v3.md`

---

**Desenvolvido por AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3**  
**ICARUS v5.0 - Healthcare OPME Management System**

