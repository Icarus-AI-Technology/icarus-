# Inventário – Pendências, Falhas e Duplicatas

## Resolvido nesta sessão
- Duplicata removida: `src/pages/LoginPage.tsx` (ficou `src/pages/Login.tsx`).
- Storybook: porta padrão ajustada para 6007; duplicates em `Card.stories.tsx` solucionados.
- Workflow CI: `.github/workflows/storybook.yml` unificado (PR artifact + Pages em main).
- QA Integrações (mocks): Meili, Tesseract, Ollama, Email, BullMQ = OK; PostHog = SKIP (sem chave).

## Pendências
- PostHog: definir `VITE_POSTHOG_API_KEY` (opcional) para validar no QA sem SKIP.
- Admin bootstrap: requer `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `SUPABASE_DB_URL` (executar `npm run admin:all`).
- RLS: implementar por último (após bootstrap), com testes de acesso por role/tenant.
- Markdown lint: avisos de formatação nos MD longos; não bloqueia build, ajustar depois.

## Sugestões
- Fixar porta Storybook no script de CI se necessário.
- Adicionar plays restantes conforme necessidade (Tabs/Card) com `@storybook/test`.
- Publicar Storybook Pages e validar link nas PRs.
