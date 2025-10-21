# Supabase — Auditoria (RLS/Índices/Pooling/Storage)

## RLS & Policies
- RLS habilitado em tabelas principais (ver `supabase/migrations/0002_rls_policies.sql`).
- Funções helpers: `current_empresa()`, `current_perfil()`, `current_user_id()`.
- Policies multi-tenant por `empresa_id` cobrindo `empresas, usuarios, produtos, lotes, medicos, hospitais, cirurgias, kits, itens_kit, leads, transacoes, fornecedores, pedidos_compra, faturas, audit_log`.
- Recomendação: adicionar políticas de DELETE soft onde faltantes; revisar exceções de leitura para perfis.

## Índices & Performance
- Índices compostos, parciais e GIN conforme `supabase/migrations/0003_indexes_perf.sql`.
- MV `mv_kpis_empresa` com índice único e função `refresh_mv_kpis()`.
- Ação: agendar refresh via job (BullMQ/cron) a cada 5 min.

## Pooling (PgBouncer)
- Ação: habilitar Supabase Pooler em modo transaction.
- Tuning recomendado:
  - server_idle_timeout: 60s
  - min_pool_size: 1-2; default_pool_size: 5-10 (workload leve)
  - statement_timeout app-side: 10s

## Storage Policies
- Verificar buckets e policies específicas por `empresa_id`/perfil (não versionadas aqui).
- Ação: criar `storage_policies.sql` por bucket: leitura restrita, escrita por perfil.

## Paginação & Limites
- Keyset pagination aplicada nos índices (DESC com id/created_at).
- Ação: revisar endpoints para usar `range()` do Supabase e limites < 200.

## Observabilidade
- Ativar `pg_stat_statements` para slow queries e revisar mensalmente.
- Ação: checklist de 5 principais queries por módulo.

## Checklist de Ações
- [ ] Habilitar PgBouncer (transaction) e validar conexão.
- [ ] Agendar refresh `refresh_mv_kpis()` (cron/BullMQ).
- [ ] Escrever policies de Storage por bucket (empresa/perfil).
- [ ] Validar RLS de DELETE (soft) onde aplicável (ex.: `lotes`).
- [ ] Adicionar suite de validação SQL em ambiente de staging.


