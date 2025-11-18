# Arquitetura – OraclusX

- Frontend: React 18 + TypeScript 5 + Vite, Tailwind 3, Storybook.
- Backend: Supabase (Postgres/Auth/Realtime/Storage) com RLS obrigatória.
- Integrações principais: Meilisearch, BullMQ/Redis, SMTP, Tesseract, Ollama, PostHog.
- Design System: OraclusX (neumórfico), temas claro/escuro, acessibilidade AA.
- CI: `supabase-audit` + QA automáticos no GitHub Actions.

