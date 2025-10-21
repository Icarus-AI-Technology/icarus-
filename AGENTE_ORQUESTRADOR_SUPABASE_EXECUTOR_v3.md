
# 🧭 AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR — ICARUS v5.0 (v3)

**Atualização 2025-10-20**  
Ampliação de escopo funcional, automações e padrões operacionais. Mantém 100% das diretrizes anteriores, incluindo **Auth por último** e **Previews automáticos recorrentes**.

> Trabalha **em paralelo** ao **AGENTE_DESIGNER_NEUMORPHIC_PREVIEW** (preview/UI/Neumorphism 3D + shadcn + OraclusX DS) — sem conflitos, apenas provendo **infra/contratos/dados** e automatizando validações. (ver agente de design para alinhamento visual)

---

## 🧭 Princípios (inalterados + reforços)
1. **Sem conflito com UI:** este agente **não altera** layout/componentes; apenas **infra**, **contratos** e **dados**.
2. **Auth no fim:** Login/Autenticação **por último**; usar **mocks de sessão** para liberar rotas durante a validação visual.
3. **Previews automáticos:** agendar **preview + captura light/dark** para rotas-chave a cada *N* minutos (PM2/cron).
4. **Compatibilidade contínua:** *migrations* versionadas; *views* de compatibilidade e *feature-flags* para mudanças disruptivas.
5. **Observabilidade desde o início:** healthchecks, logs, métricas, alertas e relatórios automatizados.

---

## 🏗️ Entregáveis Ampliados (Infra + Execução)
- **Banco:** schemas, tabelas, **views materializadas para KPIs**, **RPC** (funções), **triggers**, **índices** bem projetados.
- **Segurança:** **RLS** multi-tenant (por `empresa_id`) + **RBAC** por módulo/ação; auditoria de acesso e alterações.
- **Storage:** buckets segregados por domínio (cirurgias, faturamento, compliance, consignacao, uploads) + **signed URLs**.
- **Realtime:** canais por módulo crítico (cirurgias, dashboard_kpis, consignacao_alertas, estoque_critico).
- **Edge Functions (TS/Deno):** validações externas (CFM/ANVISA), OCR DANFE, notificação (FCM/Resend/SES), recálculo de KPIs.
- **Jobs/Filas:** **BullMQ** (Redis) p/ rotinas: reindexação, auditorias, *refresh* de views, limpeza, ETL leve.
- **Busca:** **Meilisearch** (OSS) para cadastros/materiais/procedimentos com *pipelines* de indexação.
- **LLM local (opcional):** **Ollama** (contexto curto, embeddings p/ busca semântica de docs).
- **Observabilidade:** **Sentry** (erros), **PostHog** (analytics), **pg_stat_statements/auto_explain** (perf SQL).
- **Backups & DR:** *dump* agendado, *point-in-time* (quando disponível), *restore playbook* validado.
- **Conformidade:** LGPD (minimização/acesso), ANVISA rastreabilidade OPME (campos obrigatórios), trilhas de auditoria.

---

## 📚 Domínio Cirurgias (modelo mínimo recomendado)
**Tabelas principais (pt-br snake_case):**
- `cirurgias` (`id`, `empresa_id`, `paciente_id`, `medico_id`, `hospital_id`, `convenio_id`, `data_agendada`, `duracao_estimada_min`, `status_cirurgia`, `sala`, `observacoes`)
- `cirurgia_materiais` (`id`, `cirurgia_id`, `material_id`, `quantidade`, `lote`, `validade`, `rastreamento_anvisa`, `status_item`)
- `materiais` (`id`, `codigo_interno`, `descricao`, `registro_anvisa`, `fabricante`, `unidade`, `custo`, `preco`)
- `medicos`, `pacientes`, `hospitais`, `convenios`
- `cirurgia_eventos` (linha do tempo: criado, confirmado, separado, entregue, em_andamento, concluído, faturado, etc.)

**Enums sugeridos:**
- `status_cirurgia`: `agendada|confirmada|em_andamento|concluida|cancelada`
- `status_item`: `pendente|separado|entregue|utilizado|devolvido|perdido`

**Views/RPC:**  
- `vw_dashboard_kpis` (agregados por período/empresa)  
- `vw_cirurgias_proximas` (agenda por dia/semana)  
- `vw_cirurgia_kit_detalhado` (join materiais+status)  
- `get_dashboard_kpis(empresa_id, periodo)`  
- `get_agenda_cirurgias(empresa_id, data_inicio, data_fim)`

**Índices:**  
- `cirurgias(empresa_id, data_agendada)`; `cirurgias(status_cirurgia)`  
- `cirurgia_materiais(cirurgia_id)`; `materiais(codigo_interno, registro_anvisa)`  
- `GIN` p/ busca texto quando houver JSONB/tsvector.

---

## 🔐 RLS & RBAC (modelos prontos)
```sql
-- Leitura limitada ao tenant
CREATE POLICY cirurgias_select_por_empresa ON public.cirurgias
FOR SELECT USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

-- Edição limitada ao tenant
CREATE POLICY cirurgias_update_por_empresa ON public.cirurgias
FOR UPDATE USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

-- Inserção por papéis autorizados
CREATE POLICY cirurgias_insert_roles ON public.cirurgias
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.empresa_id = cirurgias.empresa_id
      AND p.role IN ('coordenador','gerente','admin','super_admin')
  )
);
```

**RBAC (tabelas):** `roles`, `permissoes`, `role_permissoes`, `usuario_roles` — com *claims* em JWT para *cache* de checagens no frontend.

---

## 🧪 Dados de Demonstração (sem auth) — DEV/STAGING
- Seeds com **10 empresas**, **15 médicos**, **20 pacientes**, **80 materiais** e **30 cirurgias** com diferentes estados.  
- **Mocks/stubs** em rotas do preview para preencher dashboards e listas.  
- Dados sensíveis **falsos/anonimizados** (LGPD).

---

## 🚀 Pipelines de Indexação (Meilisearch)
1. *Cron job* (BullMQ) que gera *payloads* por coleção (`materiais`, `cirurgias`, `clientes`).  
2. *Edge function* `search_reindex` invocável manualmente (webhook seguro).  
3. **Campos indexáveis**: `descricao`, `codigo_interno`, `registro_anvisa`, `status`, `data_agendada`.  
4. **Relevância** ajustada p/ `empresa_id` (filtragem por tenant).

---

## 📄 OCR DANFE (Tesseract) — fluxo sugerido
- Upload de PDF para `bucket faturamento/ocr/entrada/` → job dispara `ocr_danfe` (Edge).  
- Extrair `chave_nfe`, `cnpj_emitente`, `itens (descricao, qtd, valor)`, `datas` → salvar em `ocr_resultados`.  
- Conferência humana via UI (fila de validação) → *merge* com `contas_receber`/`faturamento`.

---

## 🛰️ Integrações regulatórias (ANVISA/CFM)
- **CFM (CRM médico):** `valida_crm_cfm` (Edge) → cache (tabela `crm_cache`) com *ttl*.  
- **ANVISA (OPME):** `consulta_anvisa_produto` → registro + *cache* (tabela `anvisa_cache`).  
- **Auditoria:** guardar request/response resumidos (hash + campos úteis) para rastreabilidade.

---

## 🧯 Resiliência & Confiabilidade
- **Idempotência** em Edge Functions (chave por operação) e *retries com backoff*.  
- **Circuit breaker** para integrações externas; **rate limits** por IP/tenant.  
- **DLQ (Dead Letter Queue)** para jobs que falharem repetidamente.  
- **Blue/Green** (quando aplicável) ou pelo menos *feature flags* para alterações críticas.

---

## 📈 Performance (meta: 50 usuários simultâneos)
- **Pooling** (pgBouncer) quando disponível; **prepared statements**; **explain analyze** para endpoints críticos.  
- **Views materializadas** para KPIs; *refresh* incremental (cron) ou por evento.  
- **Realtime** só onde importa; payload enxuto; debouncing no cliente.  
- **Bundle** (front) < 1MB gz; imagens/SVG otimizados (orientação repassada ao agente de UI).

---

## 🗂️ Migrations & Convenções
- Pastas: `supabase/migrations/{YYYYMMDDhhmm}_{slug}.sql`  
- **Uma alteração por migration**; scripts de **rollback** no cabeçalho como comentário.  
- **Changelog:** `docs/infra/changelog-migrations.md` atualizado automaticamente pelo *apply*.  
- **Comentários SQL** em todas as tabelas/colunas críticas para *autodoc*.

---

## 🔍 Auditorias Automáticas (scripts)
- `infra:audit`: levanta lacunas (tabela ausente, view/KPI, índice faltando, policy ausente).  
- `infra:plan`: gera plano de ação (migrations/rls/storage/edge).  
- `infra:apply` (stub): orienta `supabase migration up` e *deploy* de functions.  
- `infra:health`: checa **ICARUS_WEB_URL** (default `http://localhost:3000`), **Meili**, presença de **SUPABASE_URL/ANON/SERVICE_ROLE**.

**Relatórios:**  
`docs/infra/relatorio-orquestrador.md` • `plano-migrations.md` • `integracoes-healthchecks.md` • `politicas-rls.md` (se aplicável)

---

## 🖼️ Previews Automáticos (reforçado)
- `preview:start` (Vite preview) e `preview:capture` (Puppeteer/Playwright) gerando prints em `docs/design/prints/*`.  
- **PM2/cron** mantém *preview* e captura recorrente (cada 20 min, ajustar conforme necessidade).  
- Documentos auxiliares: `docs/design/preview-url.md`, `figma-to-code-map.md`.

---

## 📦 Scripts (trechos package.json — projeto)
```jsonc
{
  "scripts": {
    "preview:start": "vite preview --host --port 5173",
    "preview:capture": "node tools/design/capture-previews.js",

    "infra:audit": "node tools/infra/audit.js",
    "infra:plan": "node tools/infra/plan.js",
    "infra:apply": "node tools/infra/apply.js",
    "infra:health": "node tools/infra/health.js",

    "db:gen:types": "supabase gen types typescript --local > src/types/database.types.ts",
    "db:migrate": "supabase migration up",
    "db:diff": "supabase db diff --linked",
    "edge:deploy": "supabase functions deploy --project-ref $SUPABASE_REF",

    "search:reindex": "node tools/search/reindex-meili.js",
    "ocr:test": "node tools/ocr/test-danfe.js",
    "notify:test": "node tools/notify/test-notify.js"
  }
}
```

**PM2 (preview):**
```js
// ecosystem.preview.js
module.exports = {
  apps: [
    { name: "icarus-web-preview", script: "npm", args: "run preview:start" },
    { name: "icarus-preview-capture", script: "npm", args: "run preview:capture", cron_restart: "*/20 * * * *" }
  ]
}
```

---

## ✅ Critérios de Aceite (complementados)
- [ ] Previews automáticos ativos e prints light/dark em rotas-chave.  
- [ ] Auth deixada para a **fase final** (sem bloqueios durante a validação visual).  
- [ ] RLS/RBAC implementados nas tabelas sensíveis com testes de fumaça.  
- [ ] Views/RPC performáticas para Dashboard/Cirurgias (com materialized views quando aplicável).  
- [ ] Pipelines de indexação Meili e OCR DANFE funcionais (stub ok → produção quando disponível).  
- [ ] Healthchecks verdes (**ICARUS_WEB_URL**, Meili, presença das ENVs Supabase).  
- [ ] Documentação `docs/infra/*` e `docs/design/*` atualizadas e versionadas.

---

## ⚙️ Intents (Ações Rápidas — exemplos)
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"auditarInfra","params":{}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"gerarMigrations","params":{"alvos":["cirurgias","consignacao","compliance","dashboard_kpis"]}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"aplicarMigrations","params":{"modo":"safe"}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"configurarRLS","params":{"tenant":"empresa_id"}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"provisionarBuckets","params":{"buckets":["cirurgias","faturamento","compliance","consignacao","uploads"]}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"recalcularKPIs","params":{"view":"vw_dashboard_kpis"}} }
```

---

## 🧪 Testes & QA (infra)
- **RLS Smoke:** `node tools/infra/rls-smoke.js` (SELECT com `ANON_KEY` — resultado OK esperado).  
- **Perf SQL:** amostrar queries com `pg_stat_statements` e otimizar as piores.  
- **Edge:** *ping tests* (email/push/ocr/anvisa/cfm).  
- **Backups:** executar *restore* em ambiente de teste ao menos 1x por mês.

---

## 🧰 Runbooks (exemplos)
- **Incidente Meili fora do ar:** pausar reindex, manter cache local, alertar canal #ops, reiniciar container e reexecutar `search:reindex`.  
- **Erro em Edge Function:** checar Sentry, repetir manualmente com **idempotency-key**, avaliar DLQ, abrir *hotfix*.  
- **Queda de performance:** habilitar `auto_explain`, coletar *plans*, adicionar índice/materialized view temporária, revisitar desenho.

---

> **Nota:** *Este agente mantém o foco em infra/execução sem invadir UI.* A coordenação com o agente de design (preview + Neumorphism/shadcn) garante a validação visual contínua enquanto a camada de dados/segurança/serviços amadurece.
