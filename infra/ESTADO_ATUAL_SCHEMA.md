# 📊 Estado Atual do Schema - ICARUS v5.0

**Data:** 2025-10-20  
**Status:** Schema Parcial (69% conformidade)  
**Estratégia:** Completar Schema ANTES de RLS

---

## ✅ Tabelas Confirmadas (8/100+)

### Core Business
1. ✅ `cirurgias` - Gestão de cirurgias
2. ✅ `medicos` - Cadastro de médicos
3. ✅ `hospitais` - Cadastro de hospitais
4. ✅ `empresas` - Empresas/clientes
5. ✅ `leads` - CRM/vendas
6. ✅ `transacoes` - Financeiro
7. ✅ `fornecedores` - Compras
8. ✅ `pedidos_compra` - Pedidos

### Status
- **Confirmadas via API:** 8 tabelas
- **Em migrations (não confirmadas):** 50+ tabelas
- **Total esperado:** 100+ tabelas (58 módulos)

---

## 📋 Migrations Existentes (42 arquivos)

Análise dos arquivos em `supabase/migrations/`:

### Já Criadas
1. `0001_init_schema.sql` - Schema inicial
2. `0011_cadastros_completo.sql` - Cadastros
3. `0012_compras_completo.sql` - Compras
4. `20251018_initial_schema.sql` - 10 tabelas base
5. `20251018_entregas.sql` - Entregas
6. `20251018_faturas.sql` - Faturamento
7. `20251019_chatbot_navegacao_ptbr.sql` - Chatbot
8. `20251019_compliance_auditoria_completo.sql` - Compliance
9. `20251019_consignacao_avancada_completo.sql` - Consignação
10. `20251019_contracts_crm.sql` - Contratos/CRM
11. `20251019_estoque_inteligente_completo.sql` - Estoque
12. `20251019_portais_opme.sql` - Portais OPME
13. `20251019_validacoes_cache.sql` - Cache validações
14. `20251020_advanced_features.sql` - Features avançadas
15. `20251020_api_gateway.sql` - API Gateway
16. `20251020_bi_analytics.sql` - BI Analytics
17. `20251020_gestao_contabil.sql` - Contábil
18. `20251020_kpi_dashboard_consolidado.sql` - KPIs
19. `20251020_licitacoes_propostas.sql` - Licitações
20. `20251020_microsoft365_integration.sql` - Microsoft 365
21. `20251020_nfes_distribuidoras_opme.sql` - NF-es
22. `20251020_pluggy_tables.sql` - Pluggy
23. `20251020_rbac_usuarios_permissoes.sql` - RBAC
24. `20251020_relatorios_regulatorios.sql` - Rel. Regulatórios
25. `20251020_workflow_builder.sql` - Workflows

### Recém Criadas (Orquestrador v3)
26. `202510201244_01_cirurgias_tabelas.sql` - Cirurgias completo
27. `202510201244_02_cirurgias_rls.sql` - RLS cirurgias (não aplicar ainda!)
28. `202510201244_03_dashboard_views.sql` - Views Dashboard
29. `202510201244_04_dashboard_functions.sql` - Functions RPC
30. `202510201245_05_indices_performance.sql` - Índices
31. `202510201246_06_seeds_demo.sql` - Seeds demonstração
32. `202510201247_07_storage_config.sql` - Storage

---

## ⚠️ Problema Identificado

**Migrations criadas MAS não aplicadas no banco!**

- ✅ Arquivos existem (42 migrations)
- ❌ Apenas 8 tabelas confirmadas no banco
- 🔍 Diferença: 50+ tabelas em migrations não foram aplicadas

### Causa Provável
- Migrations antigas nunca foram aplicadas via Dashboard
- Aplicação via API foi parcial (apenas últimas 7 migrations)
- Necessário aplicar TODAS as migrations históricas

---

## 🎯 Plano de Ação Corrigido

### Fase 1: Aplicar Todas as Migrations Históricas (URGENTE)

**Ordem de aplicação:**
```bash
# 1. Base inicial
supabase/migrations/0001_init_schema.sql
supabase/migrations/20251018_initial_schema.sql

# 2. Cadastros
supabase/migrations/0011_cadastros_completo.sql

# 3. Compras e entregas
supabase/migrations/0012_compras_completo.sql
supabase/migrations/20251018_entregas.sql
supabase/migrations/20251018_faturas.sql

# 4. Módulos específicos (ordem alfabética)
supabase/migrations/20251019_chatbot_navegacao_ptbr.sql
supabase/migrations/20251019_compliance_auditoria_completo.sql
supabase/migrations/20251019_consignacao_avancada_completo.sql
supabase/migrations/20251019_contracts_crm.sql
supabase/migrations/20251019_estoque_inteligente_completo.sql
supabase/migrations/20251019_portais_opme.sql
supabase/migrations/20251019_validacoes_cache.sql

# 5. Recursos avançados
supabase/migrations/20251020_advanced_features.sql
supabase/migrations/20251020_api_gateway.sql
supabase/migrations/20251020_bi_analytics.sql
supabase/migrations/20251020_gestao_contabil.sql
supabase/migrations/20251020_kpi_dashboard_consolidado.sql
supabase/migrations/20251020_licitacoes_propostas.sql
supabase/migrations/20251020_microsoft365_integration.sql
supabase/migrations/20251020_nfes_distribuidoras_opme.sql
supabase/migrations/20251020_pluggy_tables.sql
supabase/migrations/20251020_rbac_usuarios_permissoes.sql
supabase/migrations/20251020_relatorios_regulatorios.sql
supabase/migrations/20251020_workflow_builder.sql

# 6. Orquestrador v3 (sem RLS)
supabase/migrations/202510201244_01_cirurgias_tabelas.sql
supabase/migrations/202510201244_03_dashboard_views.sql
supabase/migrations/202510201244_04_dashboard_functions.sql
supabase/migrations/202510201245_05_indices_performance.sql
supabase/migrations/202510201246_06_seeds_demo.sql
supabase/migrations/202510201247_07_storage_config.sql

# 7. PULAR (aplicar por último)
# supabase/migrations/202510201244_02_cirurgias_rls.sql
# supabase/migrations/20251018_rls_policies.sql
# supabase/migrations/0002_rls_policies.sql
```

### Fase 2: Validar Schema Completo
- Contar tabelas criadas (deve ser 100+)
- Verificar relacionamentos
- Validar nomenclatura pt-BR

### Fase 3: Criar Migrations Faltantes
- Identificar módulos sem tabelas
- Criar migrations necessárias
- Manter padrão pt-BR

### Fase 4: Performance
- Índices adicionais
- Views materializadas
- Functions RPC

### Fase 5: RLS (FINAL)
- Aplicar policies incrementalmente
- Testar cada policy
- Validar acesso multi-tenant

---

## 🚀 Ação Imediata

**Via Dashboard Supabase:**
1. Acessar: https://app.supabase.com/project/ttswvavcisdnonytslom/sql/new
2. Aplicar migrations na ordem acima (PULAR as de RLS)
3. Validar após cada 5 migrations
4. Documentar problemas

**Tempo estimado:** 2-3 horas para todas as migrations

---

## ✅ Critério de Sucesso

- [ ] 100+ tabelas confirmadas no banco
- [ ] Todas as migrations aplicadas (exceto RLS)
- [ ] Schema pt-BR validado
- [ ] Relacionamentos intactos
- [ ] Sem bloqueios de acesso
- [ ] Pronto para desenvolvimento

---

**Próximo:** Aplicar TODAS as migrations históricas via Dashboard
