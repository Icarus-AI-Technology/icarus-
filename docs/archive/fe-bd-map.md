# Matriz FE ↔ BD (Supabase)

Relação entre páginas/componentes e tabelas/campos no banco (pt-BR), com FKs e índices.

## Autenticação
- Hook: `src/hooks/useAuth.ts`
  - Tabelas reais: `usuarios(id, empresa_id, email, nome_completo, avatar_url, perfil, excluido_em)`; `empresas(id, nome, cnpj, status, excluido_em)`
  - FKs: `usuarios.empresa_id → empresas.id`
  - Índices: `usuarios(empresa_id)`, `empresas(id)`
  - Triggers: `trg_auth_user_created` → popula `usuarios` no signup (ver `0002_rls_policies.sql`)

## Feature Flags (opcional)
- Lib: `src/lib/feature-flags.ts` → tabela `feature_flags(name, enabled, rollout_percentage, user_segments, description)`
  - Índices: `feature_flags(name) UNIQUE`
  - Fonte: `supabase/migrations/0009_tutores_economia_corrigido.sql`

## Módulos (parcial)
- Cadastros (`/cadastros`): `medicos(id, empresa_id, ...); hospitais(id, empresa_id, ...)`
  - RLS: SELECT/INSERT/UPDATE por `empresa_id` e `perfil` (admin/comercial)
- Estoque (`/estoque`): `produtos(id, empresa_id, ...); lotes(id, produto_id, ...)`
  - RLS: via `empresa_id` ou EXISTS pelo produto da empresa
- Compras (`/compras`): `fornecedores(id, empresa_id, ...); pedidos_compra(id, empresa_id, ...); itens_kit(kid_id → kits.id)`
  - RLS: perfis admin/estoque/financeiro conforme operação
- Financeiro (`/financeiro`): `transacoes(id, empresa_id, ...); faturas(id, empresa_id, ...)`
  - RLS: perfis admin/financeiro
- Cirurgias (`/cirurgias`): `cirurgias(id, empresa_id, ...)`
  - RLS: perfis admin/operador/comercial

## RLS/RBAC (essência)
- Funções JWT: `current_empresa()`, `current_perfil()`, `current_user_id()`
- RLS habilitado: `empresas, usuarios, produtos, lotes, medicos, hospitais, cirurgias, kits, itens_kit, leads, transacoes, fornecedores, pedidos_compra, faturas, audit_log`
- Políticas: por `empresa_id` e `perfil` (admin, operador, comercial, estoque, financeiro)
- Referência: `supabase/migrations/0002_rls_policies.sql`
