# Guia de Deployment: AI Tutors & Agents
## ICARUS v5.0

**Data:** 28 de Outubro de 2025  
**Versão:** 1.0.0

---

## 📋 Pré-requisitos

Antes de iniciar o deployment, certifique-se de ter:

- [x] Supabase CLI instalado (`npm install -g supabase`)
- [x] Login no Supabase realizado (`supabase login`)
- [x] Projeto ICARUS v5.0 configurado no Supabase
- [x] Node.js 18+ e pnpm instalados
- [x] Acesso ao repositório ICARUS v5.0

---

## 🚀 Deployment Automático (Recomendado)

### Opção 1: Script All-in-One

Execute o script de deployment automatizado:

```bash
# Tornar o script executável (se necessário)
chmod +x scripts/deploy-ai-agents.sh

# Executar deployment
./scripts/deploy-ai-agents.sh
```

Este script irá:
1. ✅ Verificar ambiente Supabase
2. ✅ Aplicar 4 migrations SQL
3. ✅ Deploy de 4 Edge Functions
4. ✅ Verificar health dos agentes
5. ✅ Gerar tipos TypeScript atualizados

---

## 🔧 Deployment Manual (Passo a Passo)

### Passo 1: Aplicar Migrations

```bash
# Navegar até a raiz do projeto
cd /path/to/icarus-v5.0

# Aplicar migrations via Supabase CLI
supabase db push

# OU aplicar uma por vez:
supabase db push --file supabase/migrations/20251028_ai_tutors_insights.sql
supabase db push --file supabase/migrations/20251028_ceo_intelligence_bridge.sql
supabase db push --file supabase/migrations/20251028_ceo_operational_feed_extended.sql
supabase db push --file supabase/migrations/20251028_ceo_notifications_system.sql
```

**Verificar no Supabase Dashboard:**
- Table Editor: Deve mostrar 11 novas tabelas
- SQL Editor: Execute `SELECT * FROM ai_tutor_insights LIMIT 1;`

### Passo 2: Deploy Edge Functions

```bash
# Deploy dos 4 agentes especializados
supabase functions deploy agent-clinical
supabase functions deploy agent-operations
supabase functions deploy agent-procurement
supabase functions deploy agent-logistics
```

**Verificar no Supabase Dashboard:**
- Edge Functions: Deve mostrar 4 functions deployadas e ativas

### Passo 3: Configuração Inicial

```bash
# Aplicar configurações iniciais (ajustar IDs conforme seu ambiente)
supabase db execute --file supabase/seed/ceo_intelligence_initial_config.sql
```

Ou execute manualmente via SQL Editor no Supabase Dashboard.

**IMPORTANTE:** Ajuste os seguintes valores no SQL:
- `empresa_id`: ID da empresa principal
- `usuario_id`: ID do usuário CEO

### Passo 4: Gerar Tipos TypeScript

```bash
# Gerar tipos atualizados
pnpm db:gen:types

# OU
supabase gen types typescript --local > src/types/database.types.ts
```

### Passo 5: Testar Integração

```bash
# Executar testes de integração
node scripts/qa/test-ai-agents-integration.mjs
```

---

## 🧪 Testes Pós-Deployment

### 1. Verificar Tabelas Criadas

Execute no SQL Editor do Supabase:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'ai_tutor_insights',
  'ceo_operational_feed',
  'ceo_intelligence_bridge',
  'ceo_strategic_alerts',
  'ceo_recommendations',
  'ceo_dashboard_metrics',
  'ceo_notifications',
  'ceo_notifications_realtime',
  'ceo_digests',
  'ceo_notification_preferences',
  'agent_actions_log'
)
ORDER BY table_name;
```

**Resultado esperado:** 11 tabelas

### 2. Testar Edge Functions

```bash
# Testar Agent Clinical
supabase functions invoke agent-clinical --body '{"action":"getMetrics"}'

# Testar Agent Operations
supabase functions invoke agent-operations --body '{"action":"getMetrics"}'

# Testar Agent Procurement
supabase functions invoke agent-procurement --body '{"action":"getMetrics"}'

# Testar Agent Logistics
supabase functions invoke agent-logistics --body '{"action":"getMetrics"}'
```

**Resultado esperado:** Resposta JSON com métricas (pode ser `{...}` se não houver dados)

### 3. Testar Frontend

```bash
# Iniciar dev server
pnpm dev

# Abrir browser
open http://localhost:5173
```

**Verificar:**
1. Dashboard Principal deve mostrar AITutor (canto inferior direito)
2. Módulo Cirurgias deve mostrar AITutor com sugestões
3. Módulo Estoque deve mostrar AITutor com alertas
4. CEO Intelligence Dashboard deve carregar sem erros (`/ceo-intelligence-dashboard`)

### 4. Executar Suite de Testes

```bash
# Testes de integração AI Agents
node scripts/qa/test-ai-agents-integration.mjs

# Testes unitários (se existirem)
pnpm test:unit

# Testes E2E
pnpm test:e2e
```

---

## 🔍 Troubleshooting

### Erro: "Migration failed"

**Solução:**
1. Verifique se já existe uma migration com mesmo nome
2. Revise o SQL para erros de sintaxe
3. Confirme que as tabelas referenciadas existem
4. Execute manualmente via SQL Editor

### Erro: "Edge Function deploy failed"

**Solução:**
1. Verifique se está logado: `supabase login`
2. Confirme o projeto: `supabase link`
3. Verifique logs: `supabase functions logs <function-name>`
4. Deploy individual: `supabase functions deploy <function-name> --no-verify-jwt`

### Erro: "Table does not exist"

**Solução:**
1. Verifique se as migrations foram aplicadas com sucesso
2. Execute `supabase db push` novamente
3. Confirme no Supabase Dashboard > Table Editor

### Erro: "RLS policy violation"

**Solução:**
1. Verifique se o usuário está autenticado
2. Confirme que `empresa_id` está correto no profile
3. Revise as políticas RLS: `SELECT * FROM pg_policies;`

---

## 📊 Monitoramento Pós-Deployment

### 1. Logs dos Agentes

```sql
-- Últimas 50 ações dos agentes
SELECT
  agent_name,
  action_type,
  success,
  execution_time_ms,
  created_at
FROM agent_actions_log
ORDER BY created_at DESC
LIMIT 50;
```

### 2. Feed Operacional CEO

```sql
-- Últimos eventos no feed do CEO
SELECT
  agente_origem,
  categoria,
  metrica,
  prioridade,
  created_at
FROM ceo_operational_feed
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Notificações Pendentes

```sql
-- Notificações pendentes do CEO
SELECT
  tipo,
  severidade,
  titulo,
  status,
  enviada_em
FROM ceo_notifications
WHERE status = 'pendente'
ORDER BY severidade DESC, enviada_em DESC;
```

### 4. Performance dos Agentes

```sql
-- Tempo médio de execução por agente
SELECT
  agent_name,
  COUNT(*) as total_execucoes,
  AVG(execution_time_ms) as tempo_medio_ms,
  MAX(execution_time_ms) as tempo_maximo_ms,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as taxa_sucesso
FROM agent_actions_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY agent_name
ORDER BY agent_name;
```

---

## 🔄 Rollback (Se Necessário)

### Reverter Migrations

```bash
# Listar migrations aplicadas
supabase migration list

# Reverter última migration
supabase db reset

# OU reverter manualmente via SQL
DROP TABLE IF EXISTS ceo_notifications CASCADE;
DROP TABLE IF EXISTS ceo_digests CASCADE;
-- ... etc
```

### Remover Edge Functions

```bash
# Deletar Edge Function
supabase functions delete agent-clinical
supabase functions delete agent-operations
supabase functions delete agent-procurement
supabase functions delete agent-logistics
```

---

## ✅ Checklist Final

Antes de considerar o deployment completo, verifique:

- [ ] Todas as 4 migrations aplicadas com sucesso
- [ ] Todas as 11 tabelas criadas e acessíveis
- [ ] Todas as 4 Edge Functions deployadas e respondendo
- [ ] Configuração inicial aplicada (preferências CEO)
- [ ] Tipos TypeScript gerados e sem erros
- [ ] Testes de integração passando (>80%)
- [ ] Frontend carregando sem erros de console
- [ ] AITutor visível nos 3 módulos piloto
- [ ] CEO Intelligence Dashboard acessível
- [ ] Notificações funcionando (se configuradas)
- [ ] Logs dos agentes sendo registrados

---

## 📞 Suporte

Em caso de problemas:

1. **Logs do Sistema:**
   ```bash
   # Ver logs das Edge Functions
   supabase functions logs agent-clinical --tail
   
   # Ver logs do Supabase
   supabase logs
   ```

2. **Documentação:**
   - Supabase: https://supabase.com/docs
   - ICARUS v5.0: Consulte `docs/` no repositório

3. **Contato:**
   - Issues: GitHub Issues do projeto
   - Equipe: Slack/Discord interno

---

**Deployment Guide v1.0.0** - ICARUS v5.0  
Última atualização: 28/10/2025

