# Guia — Auditoria de Backend (Supabase + API + UI)
## Pré-requisitos
- Node 20+, pnpm
- Variáveis de ambiente (.env) para Supabase (SUPABASE_URL, SUPABASE_SERVICE_ROLE, DB_HOST, DB_USER, DB_PASSWORD), TARGET_API_URL e TARGET_BASE_URL
- Manual disponível em `docs/MANUAL.md`

## Passos rápidos
1. Instalação:
```bash
corepack enable && corepack prepare pnpm@latest --activate
pnpm install
```

2. Banco de Dados:
```bash
pnpm db:health
pnpm db:audit
```

Opcional (Supabase SQL Editor - somente leitura, sem RLS):
```
sql/editor/01_discovery.sql
sql/editor/02_missing_fk_indexes.sql
sql/editor/03_sequences_unowned.sql
sql/editor/04_extensions_status.sql
sql/editor/05_not_null_candidates.sql
```

3. UI local (necessária para algumas verificações):
```bash
pnpm preview:start &
```

4. QA/API/UI e E2E:
```bash
pnpm qa:all
pnpm qa:a11y
pnpm qa:perf
pnpm test:e2e
pnpm qa:manual
```

5. Relatórios:
- Consolidar artefatos e salvar em `docs/REPORTS/`:
  - `executive.md`
  - `technical.md`
  - `index.html`

> Observações: Não expor segredos; use variáveis de ambiente. Mantenha links relativos entre `docs/*` e `docs/REPORTS/*`.

## Orquestração automática
Para executar tudo e consolidar relatórios automaticamente:
```bash
pnpm audit:all
```


