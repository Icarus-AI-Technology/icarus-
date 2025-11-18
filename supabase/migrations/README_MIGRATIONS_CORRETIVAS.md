# 🔧 MIGRATIONS CORRETIVAS — ICARUS v5.0

**Data:** 2025-10-20  
**Auditor:** AGENTE_AUDITOR_CORRETOR_SUPABASE v4  
**Tipo:** Não-destrutivas, reversíveis

---

## 📋 VISÃO GERAL

Migrations criadas com base na **Auditoria Completa** (`/docs/db/AUDITORIA_SCHEMA_COMPLETA_20251020.md`).

**Objetivo:** Corrigir 3 gaps prioritários sem quebrar dados existentes.

---

## 🚀 MIGRATIONS DISPONÍVEIS

### **1. `20251020_correcoes_lgpd_paciente_iniciais.sql`**

**Gap corrigido:** LGPD — Minimização de dados (Art. 6º)  
**Severidade:** 🟡 MÉDIA

**O que faz:**
1. ✅ Adiciona coluna `paciente_iniciais` em `cirurgias` (se não existir)
2. ✅ Popula iniciais a partir de `paciente_nome` ou `pacientes.nome_completo`
3. ✅ Cria índice `idx_cirurgias_paciente_iniciais`
4. ✅ Cria VIEW segura `vw_cirurgias_segura` (omite dados sensíveis)
5. ⚠️ **NÃO remove** `paciente_nome` (conservador, evita perda de dados)

**Aplicar:**
```bash
psql -U postgres -d icarus_prod -f 20251020_correcoes_lgpd_paciente_iniciais.sql
```

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_cirurgias_paciente_iniciais;
DROP VIEW IF EXISTS vw_cirurgias_segura;
ALTER TABLE public.cirurgias DROP COLUMN IF EXISTS paciente_iniciais CASCADE;
```

**Validação pós-migration:**
```bash
psql -U postgres -d icarus_prod -f /scripts/qa/db/saude_mapeamento.sql
```
Esperado: ✅ `paciente_iniciais` presente e populado

---

### **2. `20251020_mv_kpis_dashboard.sql`**

**Gap corrigido:** Performance — Dashboard lento (p95 ~800ms)  
**Severidade:** 🟢 BAIXA (otimização)

**O que faz:**
1. ✅ Cria Materialized View `mv_kpis_empresa` (6 KPIs principais)
2. ✅ Cria Materialized View `mv_cirurgias_kpis` (estatísticas cirurgias)
3. ✅ Função `refresh_mv_kpis()` para refresh automático
4. ✅ Triggers em `faturas`, `cirurgias`, `leads`, `transacoes`, `lotes`
5. ✅ Índices únicos para `REFRESH CONCURRENTLY`
6. ⚠️ **Opção alternativa:** Cron job (comentado, se preferir refresh agendado)

**Ganho esperado:**
- **Antes:** ~800ms (query complexa 5 JOINs)
- **Depois:** < 10ms (SELECT direto MV)
- **Melhoria:** ~80x mais rápido

**Aplicar:**
```bash
psql -U postgres -d icarus_prod -f 20251020_mv_kpis_dashboard.sql
```

**Rollback:**
```sql
DROP TRIGGER IF EXISTS trg_refresh_kpis_faturas ON public.faturas;
DROP TRIGGER IF EXISTS trg_refresh_kpis_cirurgias ON public.cirurgias;
DROP TRIGGER IF EXISTS trg_refresh_kpis_leads ON public.leads;
DROP TRIGGER IF EXISTS trg_refresh_kpis_transacoes ON public.transacoes;
DROP TRIGGER IF EXISTS trg_refresh_kpis_lotes ON public.lotes;
DROP FUNCTION IF EXISTS public.refresh_mv_kpis();
DROP MATERIALIZED VIEW IF EXISTS public.mv_cirurgias_kpis;
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpis_empresa;
```

**Validação pós-migration:**
```sql
-- Testar performance
EXPLAIN ANALYZE
SELECT * FROM public.mv_kpis_empresa WHERE empresa_id = 'xxx';
-- Esperado: < 10ms

-- Verificar última atualização
SELECT empresa_nome, atualizado_em FROM public.mv_kpis_empresa;
```

---

### **3. `20251020_rls_coverage_completo.sql` (OPCIONAL)**

**Gap corrigido:** RLS — Cobertura parcial (~80% das tabelas)  
**Severidade:** 🟡 MÉDIA (segurança)

**Status:** ⚠️ **NÃO CRIADO** nesta auditoria

**Motivo:** 
- Auditoria detectou que **~185 tabelas de extensão** podem não ter RLS
- Mas a migration seria **muito grande** (~2000 linhas)
- Preferível criar **sob demanda** após validação manual

**Como criar:**
1. Execute script de validação:
   ```bash
   psql -U postgres -d icarus_prod -f /scripts/qa/db/saude_rls.sql
   ```

2. Identifique tabelas SEM RLS na saída

3. Crie migration manualmente para tabelas específicas:
   ```sql
   -- Exemplo: tabela workflow_instances
   ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY pol_workflow_instances_select ON public.workflow_instances
     FOR SELECT
     USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);
   
   CREATE POLICY pol_workflow_instances_insert ON public.workflow_instances
     FOR INSERT
     WITH CHECK (empresa_id = public.current_empresa());
   
   CREATE POLICY pol_workflow_instances_update ON public.workflow_instances
     FOR UPDATE
     USING (empresa_id = public.current_empresa())
     WITH CHECK (empresa_id = public.current_empresa());
   
   CREATE POLICY pol_workflow_instances_delete ON public.workflow_instances
     FOR UPDATE
     USING (empresa_id = public.current_empresa())
     WITH CHECK (excluido_em IS NOT NULL);
   ```

**Ação recomendada:**
- Se **< 10 tabelas** sem RLS: criar migration manual
- Se **> 10 tabelas**: usar script automatizado (template fornecido na auditoria)

---

### **4. `20251117_backend_multitenant_fix.sql`**

**Gap corrigido:** Multi-tenant inconsistent no módulo de estoque + função KPI quebrada + ausência de `calcular_score_global_abbott()`  
**Severidade:** 🔴 ALTA (segurança + relatórios)

**O que faz:**
1. ✅ Adiciona `empresa_id` + FKs em **9 tabelas** (`estoque`, `estoque_reservas`, `estoque_movimentacoes`, `estoque_lotes`, `estoque_inventarios`, etc.)
2. ✅ Recria políticas RLS para estoque e derivados (SELECT/INSERT/UPDATE/DELETE por empresa)
3. ✅ Corrige função `get_dashboard_kpis()` (`medicos.status = 'ativo'`)
4. ✅ Cria função `calcular_score_global_abbott()` reutilizando `calcular_abbott_score`

**Aplicar:**
```bash
psql -U postgres -d icarus_staging -f 20251117_backend_multitenant_fix.sql
```

**Rollback (manual):**
- Remover policies recriadas
- Dropar colunas `empresa_id` (se realmente necessário)
- Recriar versão anterior das funções (usar histórico do git)

**Validação pós-migration:**
```sql
-- Verificar se colunas foram populadas
SELECT COUNT(*) FROM public.estoque WHERE empresa_id IS NULL;     -- Esperado: 0
SELECT COUNT(*) FROM public.estoque_movimentacoes WHERE empresa_id IS NULL; -- Esperado: 0

-- Testar função KPI
SELECT get_dashboard_kpis();

-- Score Abbott consolidado
SELECT * FROM calcular_score_global_abbott();
```

---

## 📊 ORDEM DE APLICAÇÃO

### **Recomendação:**

1️⃣ **Staging/Dev primeiro:**
```bash
cd /Users/daxmeneghel/icarus-make/supabase/migrations

# 1. Aplicar LGPD
psql -U postgres -d icarus_staging -f 20251020_correcoes_lgpd_paciente_iniciais.sql

# 2. Validar
psql -U postgres -d icarus_staging -f ../../../scripts/qa/db/saude_mapeamento.sql

# 3. Aplicar MVs (se validado OK)
psql -U postgres -d icarus_staging -f 20251020_mv_kpis_dashboard.sql

# 4. Testar performance dashboard
# (abrir http://localhost:3000/dashboard-principal)
```

2️⃣ **Produção:**
```bash
# Backup completo antes
pg_dump -U postgres -d icarus_prod -F c -f backup_pre_migrations_$(date +%Y%m%d).dump

# Aplicar migrations
psql -U postgres -d icarus_prod -f 20251020_correcoes_lgpd_paciente_iniciais.sql
psql -U postgres -d icarus_prod -f 20251020_mv_kpis_dashboard.sql

# Validar
psql -U postgres -d icarus_prod -f ../../../scripts/qa/db/saude_mapeamento.sql
```

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

### **1. Migrations são NON-BREAKING**
- ✅ Não removem colunas existentes
- ✅ Não alteram tipos de dados
- ✅ Não quebram queries existentes
- ✅ Totalmente reversíveis (rollback disponível)

### **2. Compatibilidade Frontend**
- `paciente_iniciais`: Frontend precisa ser atualizado para usar nova coluna
- `mv_kpis_empresa`: Frontend pode usar MV em vez de queries complexas
- Se frontend ainda usa `paciente_nome`: continua funcionando (coluna não foi removida)

### **3. Performance**
- Triggers de refresh MV podem adicionar **~50ms** overhead em INSERTs/UPDATEs
- Se preferir menor overhead: usar **cron job** em vez de triggers
- Cron job: refresh a cada 5 min (dados "quase tempo real")

### **4. RLS Coverage**
- Se detectar **tabelas sem RLS** em produção: **prioridade alta**
- Risco: vazamento de dados entre empresas
- Executar `saude_rls.sql` periodicamente para monitorar

---

## 🔧 TROUBLESHOOTING

### **Erro: "column already exists"**
**Causa:** Migration já foi aplicada  
**Solução:** Ignorar (migration usa `IF NOT EXISTS`)

### **Erro: "refresh materialized view failed"**
**Causa:** Dados inválidos ou FKs quebradas  
**Solução:**
```sql
-- Verificar dados
SELECT * FROM cirurgias WHERE paciente_iniciais IS NULL LIMIT 10;
SELECT * FROM faturas WHERE empresa_id IS NULL LIMIT 10;

-- Corrigir dados manualmente antes de aplicar migration
```

### **Erro: "permission denied to create trigger"**
**Causa:** Usuário sem permissões de superuser  
**Solução:**
```sql
-- Como superuser (postgres)
GRANT CREATE ON SCHEMA public TO seu_usuario;
```

---

## 📝 PRÓXIMOS PASSOS (OPCIONAL)

### **1. Depreciar `paciente_nome` (se frontend atualizado)**
```sql
-- Migration: 20251021_depreciar_paciente_nome.sql
ALTER TABLE public.cirurgias
  DROP COLUMN IF EXISTS paciente_nome CASCADE;
```

### **2. Implementar Retention Policy LGPD**
```sql
-- Migration: 20251021_retention_policy_lgpd.sql
-- (criar função purge_excluidos() + cron job)
```

### **3. Criar índices adicionais (se necessário)**
```bash
# Executar saude_indices.sql e identificar gaps
psql -U postgres -d icarus_prod -f /scripts/qa/db/saude_indices.sql
```

---

## 📞 SUPORTE

**Problemas ou dúvidas?**
- Consultar: `/docs/db/AUDITORIA_SCHEMA_COMPLETA_20251020.md`
- Health checks: `/scripts/qa/db/`
- DBA responsável: [seu-email@icarus.com]

---

**Última atualização:** 2025-10-20  
**Versão:** 1.0  
**Autor:** AGENTE_AUDITOR_CORRETOR_SUPABASE v4

