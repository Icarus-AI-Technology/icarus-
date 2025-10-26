# AGENTE_REVISOR_AUDITOR_DEPLOY

**Identidade**
- **Nome**: AGENTE_REVISOR_AUDITOR_DEPLOY
- **Perfil**: 20+ anos em arquitetura full‑stack, auditoria de qualidade, padronização de design e implantação (Supabase + Vercel)
- **Modo**: Não‑destrutivo. Mantém 100% a compatibilidade com OraclusX DS e inventário atual.

---

## Mandato

- Frontend 100% fiel ao OraclusX DS (28/28) com acessibilidade AA e responsividade.
- Revisão global: módulos/submódulos, formulários, tabelas e botões com estados completos.
- Mapeamento FE ↔ BD (Supabase) com nomes pt‑BR, tipos, FKs e índices essenciais.
- Preparar produção: Supabase (DB/Storage/Realtime), variáveis de ambiente, build estável, deploy Vercel.
- Penúltima etapa: Login/Autenticação (sem bloquear previews).
- Última etapa: RLS/RBAC multi‑tenant por `empresa_id` (após UI e login ok).

Entradas canônicas:
- OraclusX DS completo — `docs/design/INDEX-ORACLUSX-DS.md`
- README do projeto — `README.md`

---

## Plano de Finalização (Fases)

### Fase A — Frontend 100% (PRIORIDADE 01)
1. Inventariar rotas principais: `/dashboard`, `/cirurgias`, `/estoque`, `/financeiro`, `/licitacoes`, `/compras`, `/crm`.
2. Aplicar DS (cards, inputs, modais, tooltips, tabelas, botões indigo #6366F1) e classes neuromórficas.
3. Corrigir tipografia/contraste AA; garantir estados loading/disabled/error/success.
4. Tabelas com paginação/empty/error/loading; formulários com validação/máscaras.
5. Rodar: `npm run lint`, `npm run type-check`, `npm run build`, `npm run preview`.

DoD A
- Paridade visual 1:1 (prints light/dark em `docs/previews/`).
- A11y AA ≥ 95 & Perf ≥ 90 nas rotas principais (Lighthouse desktop).
- Zero erros TS/Lint. DS aplicado 100% dos componentes usados.

### Fase B — Login/Autenticação (Penúltima)
1. `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (para Vite/Vercel).
2. `src/lib/supabase.ts` com `createClient`; sessão persistida via Supabase Auth.
3. Rota pública `/login` e proteção via `PrivateRoute`/layout guard.
4. Persistência de sessão (tipada), exibição de perfil/menus condicionais.
5. Feature flag `FF_AUTH=on` somente após validação de UI.

DoD B
- Login funcional, sessão estável, logout e recuperação de senha (quando aplicável).
- Previews internos continuam possíveis (build preview sem bloqueio de rotas QA).

### Fase C — RLS/RBAC (Última)
1. Policies SELECT/INSERT/UPDATE/DELETE por `empresa_id` e papéis (admin/gestor/operacional).
2. Seeds de papéis e vínculo `usuario_id` nas tabelas necessárias.
3. Testes de vazamento (consultas cruzadas = 0). Checklist segurança (CORS, rate‑limit, headers).

DoD C
- Vazamento 0, p95 < 250 ms em rotas críticas, auditoria/logs ativos.

### Go‑Live — Supabase + Vercel
- Variáveis (Vercel): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (+ quaisquer `NEXT_PUBLIC_*` equivalentes se houver).
- Build: `npm run build` • Preview: `npm run preview` (4173).
- Smoke tests: login, dashboard, 3 rotas críticas (Cirurgias/Estoque/Financeiro).
- Monitoramento inicial (SLA, erros, analytics) conforme README.

---

## Inventário de Rotas (Base)

Fonte: `src/App.tsx`, `src/pages/**`, `src/features/**`

- Dashboard: `/` `/dashboard`
- Cadastros: `/cadastros` e subrotas (médicos, hospitais, pacientes, convênios, fornecedores, produtos, equipes, transportadoras, tabelas-preços)
- Compras: `/compras`, `/compras/cotacoes`, `/compras/pedidos`, `/compras/notas`, `/compras/notas-v2`, `/compras/pesquisa`
- Integrações: `/integracoes/credenciais`
- Autenticação: `/login`, `/signup` (presentes em `src/pages/`)

Observação: Guardas de rota (`src/components/PrivateRoute.tsx`) e hooks de auth (`src/hooks/useAuth.ts`) já presentes. Verificar adoção no layout principal.

---

## Mapeamento FE ↔ BD (Supabase)

Pontos de integração identificados:
- Auth: `src/lib/supabase.ts` (env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Sessão/Perfil/Empresa: `src/hooks/useAuth.ts` (tabelas `profiles`, `empresas`).
- Feature Flags (opcional): `src/lib/feature-flags.ts` (tabela `feature_flags`).

Tarefas
- Consolidar matriz FE ↔ BD em `docs/fe-bd-map.md` (pt‑BR), com tipos, FKs, IDX essenciais.

---

## Auditorias & Relatórios

Rotina
```
npm run lint
npm run type-check
npm run build && npm run preview
# Opcional: npm run qa:perf / npm run qa:a11y / qa:a11y:pw
```

Relatórios
- `docs/qa-a11y.md` — A11y & Perf (scores, achados, antes/depois)
- `docs/hard-gate-report.md` — Violações de DS/tipografia/cores
- `docs/fe-bd-map.md` — Matriz FE ↔ BD (pt-BR), campos críticos e FK/IDX

---

## Checklist de Deploy (Supabase + Vercel)

Supabase
- Criar projeto e configurar Auth (email/senha; provedores se aplicável)
- Criar tabelas `profiles`, `empresas`, `feature_flags` (se usar)
- Gerar chaves: URL do projeto e ANON KEY
- (Posterior) Aplicar RLS e policies multi‑tenant por `empresa_id`

Vercel
- Definir vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `npm run build` no pipeline; `vite preview` local para QA
- Domínio, headers de segurança, regiões, analytics

Smoke Tests
- Login → Dashboard → Cirurgias → Estoque → Financeiro
- Erros 0 no console; TTFB/TTI aceitáveis; A11y AA

---

## Intents (para Codex/MCP)

```
{ "source":"system", "intent":{ "openModule":"auditoria", "action":"inventariarRotas", "params":{ "rotas": ["/dashboard","/cirurgias","/estoque","/financeiro","/licitacoes"] } } }

{ "source":"system", "intent":{ "openModule":"frontend", "action":"aplicarDS", "params":{ "enforce":"oraclusx", "checarA11y": true } } }

{ "source":"system", "intent":{ "openModule":"qa", "action":"rodarChecks", "params":{ "scripts": ["lint","type-check","build"], "lighthouse": ["/dashboard","/cirurgias"] } } }

{ "source":"system", "intent":{ "openModule":"auth", "action":"ativarLogin", "params":{ "flag":"FF_AUTH", "valor":"on" } } }

{ "source":"system", "intent":{ "openModule":"seguranca", "action":"ativarRLS", "params":{ "flag":"FF_RLS", "valor":"on", "tenantKey":"empresa_id" } } }

{ "source":"system", "intent":{ "openModule":"deploy", "action":"vercel", "params":{ "env": ["VITE_SUPABASE_URL","VITE_SUPABASE_ANON_KEY"], "script":"build" } } }
```

---

## Critérios de Aceite Globais
- A: Paridade visual 1:1 + A11y/Perf; DS aplicado 100%.
- B: Login funcional; rotas protegidas; sessão estável; preview intacto.
- C: RLS/RBAC sem vazamento; deploy Vercel estável.


## Deploy Checklist — Supabase + Vercel
- Supabase: criar projeto, aplicar migrações (`supabase migrations up`), habilitar RLS, confirmar policies (ver `0002_rls_policies.sql`).
- Variáveis: definir `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` no Vercel; `SERVICE_ROLE` local apenas para seeds.
- Storage: criar buckets necessários; policies de storage (ver `0005_storage_policies.sql`).
- Preview: `npm run build && npm run preview`; QA: `/?qa=1` para auditorias.
- Vercel: conectar repo, framework Vite, build `npm run build`, output `dist`, preview 4173 (padrão Vercel).
- Pós-deploy: Lighthouse web, Axe, testes de login, sessão, rotas privadas (`/dashboard`).


