# Sprint Planning - Dia 2 (ICARUS v6.0)
Atualizado em 2025-11-24 00:05

## Objetivos do Ciclo
- Concluir hardening de CI/CD (pnpm + secrets + pipeline local).
- Formalizar backlog técnico para os novos endpoints do dashboard/KPIs.
- Garantir disponibilidade do Chatbot + Edge Function `ai-tutor-financeiro`.

## Backlog Prioritário
| Ordem | Item | Owner sugerido | Critérios de Aceite |
| --- | --- | --- | --- |
| 1 | **CI/CD: aplicar pnpm + secret gate** | DevOps | Workflows atualizados, validação automática de `VITE_SUPABASE_*` e `VERCEL_*`, relatório no `ci-cd-status.md`. |
| 2 | **CI/CD: pipeline local lint+test+build** | Frontend Lead | Logs recentes (Dia 2) anexados ao PR e documentação no README. |
| 3 | **API `/api/dashboard/kpis`** | Backend Lead | Endpoint mock + testes + documentação no `dashboard-endpoints.md`. |
| 4 | **API distribuição + séries históricas** | Backend Lead | Endpoints `/api/dashboard/distribuicao-especialidades` e `/api/dashboard/faturamento-mensal` com fixtures e testes. |
| 5 | **Chatbot + Edge Function** | AI Lead | Checklist de prompts revisado, função `ai-tutor-financeiro` com healthcheck e variáveis ANTHROPIC.* definidas. |

## Definition of Ready
- Design/contratos publicados (ver `docs/proximos-passos/dashboard-endpoints.md`).
- Issues correspondentes abertos no GitHub (`scripts/create-github-issues.sh`).
- Variáveis sensíveis registradas no `ops/ENV-VARIABLES-CHECKLIST.md`.

## Definition of Done
- Pipelines do GitHub Actions passando com pnpm (lint + type-check + build).
- Pipeline local `pnpm lint && pnpm test && pnpm build` executado e anexado no PR.
- Novo backend exposto via `src/pages/api/dashboard/*.ts` (mock) com testes unitários.
- Documentação atualizada: `dashboard-checklist.md`, `dashboard-endpoints.md`, `status-digest.md`.

## Dependências
- Supabase projeto `gvbkviozlhxorjoavmky` (logs de autenticação).
- Variáveis `ANTHROPIC_API_KEY` e `ANTHROPIC_FINANCE_MODEL` para Edge Function.
- Time de Infra para liberar secrets no GitHub (Vercel + Supabase).

## Próximos Passos
1. Revisar issues gerados pelo script e atribuir responsáveis.
2. Abrir PR com ajustes de CI/CD (já alinhado com pnpm).
3. Implementar endpoints mockados do dashboard (ver seção "Implementação" abaixo).
4. Atualizar Chatbot logs com a execução do menu Option 1 (já disponível em `backups/proximos-passos`).

## Implementação Técnica dos Endpoints
- **Local**: `src/pages/api/dashboard/` (novo diretório).
- **Arquitetura**: handlers `export const GET` com `NextResponse.json`, importando `NextRequest` apenas quando necessário.
- **Mock Data Sources**: `src/data/dashboard/metrics.ts` (novo) para reutilização entre rotas.
- **Testes**: usar Vitest (`tests/api/dashboard/*.test.ts`).
- **Execução local**: usar `pnpm dev:full` para iniciar Vite + Express (`server/index.ts`) simultaneamente.

## Observações
- Os logs do script `QUICK_START_PROXIMOS_PASSOS.sh` já foram anexados ao digest (`docs/proximos-passos/status-digest.md`).
- Manter a agenda diária documentada no final de cada arquivo de status.
