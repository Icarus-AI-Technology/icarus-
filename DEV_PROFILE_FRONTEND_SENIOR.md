# Perfil Técnico – Dev Frontend Senior (ICARUS v5.0)

## Objetivo
Garantir continuidade sem regressões de tipagem, mantendo padrão OraclusX DS, CI estável e integrações funcionando (mock → produção).

## Requisitos Fundamentais
- TypeScript: strict mode, generics, type narrowing, discriminated unions, utility types, JSX typing.
- React 18: hooks avançados, Suspense/lazy, context, memoização, controle de render.
- Vite 5: alias `@`, env `import.meta.env`, otimizações, troubleshoot EADDRINUSE.
- Storybook 9 (react-vite): CSF3/CSFv4, docs/autodocs, decorators, `@storybook/test` (plays), CI/Pages.
- CSS/UI: Tailwind 3, Radix UI primitives, tokens OraclusX DS (cores/sombras/typography), dark/light.
- Qualidade: ESLint 9, Prettier 3, Vitest, Playwright básico, Lighthouse/axe.
- Integrações: Meilisearch, BullMQ/Redis, Email SMTP, PostHog, Tesseract, Ollama (mocks e reais).
- Supabase: auth, `auth.users`, RLS (conceitos), RPC, migrações, SERVICE_ROLE; `usuario_id` FK.
- Operação: PM2, GitHub Actions (build, artifacts, Pages), troubleshooting de logs.

## Conhecimentos Esperados (Detalhe)
- TypeScript
  - Modelagem de props, padrões para componentes controlados/não controlados.
  - Composição de tipos para hooks e services (result types, error handling tipado).
  - Integração com bibliotecas de terceiros sem `any`, criação de d.ts quando necessário.
- React
  - Code-splitting (lazy/Suspense), prefetch condicional, memoização com dependências estáveis.
  - Acessibilidade: foco, aria, keyboard nav; testes com axe.
- Vite/Tooling
  - Aliases (`@` → `/src`), `optimizeDeps.exclude` para libs server-only.
  - Scripts: `dev`, `build`, `preview`, `type-check`, `qa:*`.
- Storybook
  - Escrita de stories (CSF), decoradores globais, backgrounds, temas dark/light.
  - Plays com `@storybook/test` para Dialog/Toast/Dropdown/Popover/Tooltip/Accordion.
  - Build estático e publicação (artifact em PR, Pages no main).
- OraclusX DS
  - Aplicação consistente dos tokens (sombras, gradientes, glass, spacing, tipografia).
  - Aderência aos componentes base (Card, Button, Input, etc.).
- Integrações
  - Meilisearch health/indexes, BullMQ HTTP ping, Email health, PostHog key, Tesseract worker, Ollama `/api/tags`.
  - Alternar mocks↔reais via envs e `npm run mocks:*`.
- Supabase/Postgres
  - Garantir admin e backfill `usuario_id` (scripts `admin:*`).
  - Deferir políticas RLS para a etapa final (design por módulo/tenant).

## Domínios Complementares
- Performance: evitar re-render, suspense boundaries, cache leve; lazy prefetch oportunista.
- DX/CI: manutenção da pipeline, auditoria mínima (type-check + lint + build) em PRs.
- Observabilidade: PostHog (quando chave presente) e logs de PM2.

## Padrões para Evitar Falhas de Tipagem
- Proibir `any` e casts inseguros; usar tipos explícitos exportados.
- Centralizar tipos compartilhados em `types/` e gerar tipos do Supabase quando possível.
- Nunca silenciar erros de linter/ts; corrigir na origem.
- Manter histórias com `Meta<typeof Component>` e `StoryObj<typeof Component>`.

## Erros Comuns e Correções
- EADDRINUSE: liberar porta (`lsof -ti tcp:<port> | xargs kill -9`) antes de subir dev/Storybook.
- `password authentication failed`: revisar `DATABASE_URL` (URL-encode senha) e variáveis.
- `MODULE_NOT_FOUND`: verificar deps e alias `@`, reinstalar somente se necessário.
- `Identifier 'meta' has already been declared`: remover duplicadas (um único `meta` e `default`).
- Addons Storybook não resolvidos: manter apenas os instalados em `.storybook/main.ts`.

## Checklists Operacionais
- Dev local
  ```bash
  npm run type-check && npm run lint && npm run build
  npm run storybook   # http://localhost:6007
  npm run qa:integrations
  ```
- Mocks
  ```bash
  npm run mocks:start:bg
  # ...trabalhar/validar
  npm run mocks:stop
  ```
- Admin bootstrap (quando tiver segredos)
  ```bash
  export SUPABASE_URL=...; export SUPABASE_SERVICE_ROLE=...; export SUPABASE_DB_URL=...
  export ADMIN_EMAIL='dax@newortho.com.br'; export ADMIN_PASSWORD='admin123'
  npm run admin:all && npx pm2 start ecosystem.icarus-admin.config.cjs --update-env
  ```

## Expectativas de Entrega
- Zero erros de tipagem e linter no CI.
- Stories com plays nas interações principais.
- Integrações validadas (OK ou SKIP documentado por env ausente).
- Documentação concisa no PR sobre feature/impacto e envs.
