# 🔍 Relatório de Auditoria de Infraestrutura - ICARUS v5.0

**AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3**

📅 Data: 2025-10-20T16:12:37.317Z

---

## 📊 Sumário Executivo

| Métrica | Valor |
|---------|-------|
| Total de itens auditados | 71 |
| ✅ Conformes | 44 (62.0%) |
| ❌ Ausentes/Não conformes | 22 (31.0%) |
| 🚨 Prioridade CRÍTICA | 20 |

## Tabelas

- ✅ Presentes: **8**
- ❌ Ausentes: **0**

### ✅ Itens Presentes (Tabelas)

| Nome | Status | Arquivo/Path |
|------|--------|-------------|
| `cirurgias` | ✅ PRESENTE | `202510201244_01_cirurgias_tabelas.sql` |
| `cirurgia_materiais` | ✅ PRESENTE | `202510201244_01_cirurgias_tabelas.sql` |
| `materiais` | ✅ PRESENTE | `202510201244_01_cirurgias_tabelas.sql` |
| `medicos` | ✅ PRESENTE | `20251018_initial_schema.sql` |
| `pacientes` | ✅ PRESENTE | `0011_cadastros_completo.sql` |
| `hospitais` | ✅ PRESENTE | `20251018_initial_schema.sql` |
| `convenios` | ✅ PRESENTE | `0011_cadastros_completo.sql` |
| `cirurgia_eventos` | ✅ PRESENTE | `202510201244_01_cirurgias_tabelas.sql` |

## Views

- ✅ Presentes: **3**
- ❌ Ausentes: **0**

### ✅ Itens Presentes (Views)

| Nome | Status | Arquivo/Path |
|------|--------|-------------|
| `vw_dashboard_kpis` | ✅ PRESENTE | `202510201244_03_dashboard_views.sql` |
| `vw_cirurgias_proximas` | ✅ PRESENTE | `202510201244_03_dashboard_views.sql` |
| `vw_cirurgia_kit_detalhado` | ✅ PRESENTE | `202510201244_03_dashboard_views.sql` |

## Functions/RPC

- ✅ Presentes: **3**
- ❌ Ausentes: **0**

### ✅ Itens Presentes (Functions/RPC)

| Nome | Status | Arquivo/Path |
|------|--------|-------------|
| `get_dashboard_kpis` | ✅ PRESENTE | `202510201244_04_dashboard_functions.sql` |
| `get_agenda_cirurgias` | ✅ PRESENTE | `202510201244_04_dashboard_functions.sql` |
| `refresh_dashboard_kpis` | ✅ PRESENTE | `202510201244_04_dashboard_functions.sql` |

## Índices

- ✅ Presentes: **13**
- ❌ Ausentes: **0**

### ✅ Itens Presentes (Índices)

| Nome | Status | Arquivo/Path |
|------|--------|-------------|
| `cirurgias_empresa_id_data_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `cirurgias_status_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `cirurgia_materiais_cirurgia_id_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `materiais_codigo_interno_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `materiais_registro_anvisa_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `medicos_crm_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `medicos_empresa_id_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `pacientes_cpf_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `pacientes_empresa_id_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `hospitais_cnpj_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `hospitais_empresa_id_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `convenios_codigo_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |
| `cirurgia_eventos_cirurgia_id_idx` | ✅ PRESENTE | `202510201245_05_indices_performance.sql` |

## RLS - Habilitação

- ✅ Presentes: **0**
- ❌ Ausentes: **2**

### ❌ Itens Ausentes (RLS - Habilitação)

| Nome | Status | Ação Recomendada | Prioridade |
|------|--------|------------------|------------|
| `pacientes` | ❌ RLS NÃO HABILITADO | Habilitar RLS na tabela | **CRÍTICA** |
| `convenios` | ❌ RLS NÃO HABILITADO | Habilitar RLS na tabela | **CRÍTICA** |

## RLS - Policies

- ✅ Presentes: **14**
- ❌ Ausentes: **18**

### ❌ Itens Ausentes (RLS - Policies)

| Nome | Status | Ação Recomendada | Prioridade |
|------|--------|------------------|------------|
| `medicos_select_policy` | ❌ AUSENTE | Criar policy SELECT com filtro empresa_id | **CRÍTICA** |
| `medicos_insert_policy` | ❌ AUSENTE | Criar policy INSERT com filtro empresa_id | **CRÍTICA** |
| `medicos_update_policy` | ❌ AUSENTE | Criar policy UPDATE com filtro empresa_id | **CRÍTICA** |
| `medicos_delete_policy` | ❌ AUSENTE | Criar policy DELETE com filtro empresa_id | **CRÍTICA** |
| `pacientes_select_policy` | ❌ AUSENTE | Criar policy SELECT com filtro empresa_id | **CRÍTICA** |
| `pacientes_insert_policy` | ❌ AUSENTE | Criar policy INSERT com filtro empresa_id | **CRÍTICA** |
| `pacientes_update_policy` | ❌ AUSENTE | Criar policy UPDATE com filtro empresa_id | **CRÍTICA** |
| `pacientes_delete_policy` | ❌ AUSENTE | Criar policy DELETE com filtro empresa_id | **CRÍTICA** |
| `hospitais_select_policy` | ❌ AUSENTE | Criar policy SELECT com filtro empresa_id | **CRÍTICA** |
| `hospitais_insert_policy` | ❌ AUSENTE | Criar policy INSERT com filtro empresa_id | **CRÍTICA** |
| `hospitais_update_policy` | ❌ AUSENTE | Criar policy UPDATE com filtro empresa_id | **CRÍTICA** |
| `hospitais_delete_policy` | ❌ AUSENTE | Criar policy DELETE com filtro empresa_id | **CRÍTICA** |
| `convenios_select_policy` | ❌ AUSENTE | Criar policy SELECT com filtro empresa_id | **CRÍTICA** |
| `convenios_insert_policy` | ❌ AUSENTE | Criar policy INSERT com filtro empresa_id | **CRÍTICA** |
| `convenios_update_policy` | ❌ AUSENTE | Criar policy UPDATE com filtro empresa_id | **CRÍTICA** |
| `convenios_delete_policy` | ❌ AUSENTE | Criar policy DELETE com filtro empresa_id | **CRÍTICA** |
| `cirurgia_eventos_update_policy` | ❌ AUSENTE | Criar policy UPDATE com filtro cascade | **CRÍTICA** |
| `cirurgia_eventos_delete_policy` | ❌ AUSENTE | Criar policy DELETE com filtro cascade | **CRÍTICA** |

### ✅ Itens Presentes (RLS - Policies)

| Nome | Status | Arquivo/Path |
|------|--------|-------------|
| `cirurgias_select_policy` | ✅ PRESENTE | `202510201247_07_storage_config.sql` |
| `cirurgias_insert_policy` | ✅ PRESENTE | `202510201247_07_storage_config.sql` |
| `cirurgias_update_policy` | ✅ PRESENTE | `202510201247_07_storage_config.sql` |
| `cirurgias_delete_policy` | ✅ PRESENTE | `202510201247_07_storage_config.sql` |
| `cirurgia_materiais_select_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |
| `cirurgia_materiais_insert_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |
| `cirurgia_materiais_update_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |
| `cirurgia_materiais_delete_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |
| `materiais_select_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |
| `materiais_insert_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |
| `materiais_update_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |
| `materiais_delete_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |
| `cirurgia_eventos_select_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |
| `cirurgia_eventos_insert_policy` | ✅ PRESENTE | `202510201244_02_cirurgias_rls.sql` |

## Storage Buckets

- ✅ Presentes: **0**
- ❌ Ausentes: **0**
- ⚠️  Avisos: **5**

## Edge Functions

- ✅ Presentes: **3**
- ❌ Ausentes: **2**

### ❌ Itens Ausentes (Edge Functions)

| Nome | Status | Ação Recomendada | Prioridade |
|------|--------|------------------|------------|
| `ocr_danfe` | ❌ AUSENTE | Criar Edge Function (Deno/TypeScript) | **MÉDIA** |
| `notificacao_push` | ❌ AUSENTE | Criar Edge Function (Deno/TypeScript) | **MÉDIA** |

### ✅ Itens Presentes (Edge Functions)

| Nome | Status | Arquivo/Path |
|------|--------|-------------|
| `valida_crm_cfm` | ✅ PRESENTE | `/Users/daxmeneghel/icarus-make/supabase/functions/valida_crm_cfm/index.ts` |
| `consulta_anvisa_produto` | ✅ PRESENTE | `/Users/daxmeneghel/icarus-make/supabase/functions/consulta_anvisa_produto/index.ts` |
| `recalcular_kpis` | ✅ PRESENTE | `/Users/daxmeneghel/icarus-make/supabase/functions/recalcular_kpis/index.ts` |

---

## 🚀 Próximos Passos Recomendados

1. **Prioridade CRÍTICA:** Revisar e implementar todas as políticas RLS ausentes
2. **Prioridade ALTA:** Criar tabelas e views materializadas faltantes
3. **Prioridade MÉDIA:** Implementar índices de performance e Edge Functions
4. **Executar:** `npm run infra:plan` para gerar plano de migrations
5. **Aplicar:** `npm run infra:apply` (após revisão manual)

---

## 📚 Documentação de Referência

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [ICARUS v5 - Especificação Completa](../../ICARUS_V5_SPEC_COMPLETO.md)

---

*Relatório gerado automaticamente por AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3*
