# Plano de Testes de Carga e Integração – ICARUS v5.0

## Objetivo

Garantir que o ambiente de produção (`/Users/daxmeneghel/icarus-v5.0`) suportará a demanda real após a migração, reutilizando o pipeline atual como _smoke gate_ e acrescentando testes de integração/carga graduais.

## 1. Pré-requisitos

- Copiar artefatos aprovados para `/Users/daxmeneghel/icarus-v5.0` conforme `docs/migration-plan-v5.md`.
- Variáveis de ambiente já provisionadas (Supabase, Vercel, Ollama, etc.).
- Browsers Playwright disponíveis (ver `docs/e2e-playwright-setup.md`).
- Scripts de migração Supabase executados com sucesso.

## 2. Pipeline Smoke (já ativo)

1. `scripts/ops/run-missing-tests.sh` – agora 100% verde (E2E opcional via `REQUIRE_E2E=1`).
2. Vitest unit/integration (`npm run test -- --run`).
3. ESLint/Type-check (`npm run lint`, `npm run type-check`).

## 3. Testes de Integração (próximos passos)

- Reativar gradualmente casos de `legacy-tests/test/integration/` migrando para `src/__tests__/`.
- Priorizar fluxos críticos:
  - Autenticação Supabase.
  - Orquestração de agentes (rotas `/agentes`).
  - Filas BullMQ (mock Redis ou container dedicado).
- Utilizar Playwright para smoke UI (login + dashboard) após browsers disponíveis.
- Configurar `PLAYWRIGHT_TEST_BASE_URL` apontando para `http://localhost:5177` (dev) ou URL de staging.

## 4. Testes de Carga

### Ferramentas sugeridas

| Ferramenta     | Uso                               | Observações                                          |
| -------------- | --------------------------------- | ---------------------------------------------------- |
| **k6**         | APIs Supabase e endpoints Express | Suporte a scripts JS; fácil integrar em CI.          |
| **Artillery**  | Workflows HTTP + WebSocket        | Permite cenários para realtime Supabase.             |
| **Playwright** | Smoke visual com `tracing.start`  | Ampliar para cenários de 10-20 usuários simultâneos. |

### Sequência recomendada

1. **Baseline API** (k6):
   - `supabase/functions/*` (Edge) – 50 RPS, 5 min.
   - `server/api/contact` – 20 RPS, 3 min.
2. **Queue Stress**:
   - Emular jobs `emailQueue`/`smsQueue` com scripts dedicados (mock Twilio/SendGrid).
3. **Front-end Smoke**:
   - Playwright com rastreados (`npx playwright test --project=smoke`).
4. **Observabilidade**:
   - Validar dashboards (Grafana/PostHog) durante os testes.

## 5. Automação & Agendamento

- Criar workflow (`.github/workflows/perf-smoke.yml`) disparado manualmente ou por tag.
- Etapas:
  1. Setup ambiente (`npm ci`, `npx playwright install` se necessário).
  2. Run smoke (`scripts/ops/run-missing-tests.sh` com `REQUIRE_E2E=1`).
  3. Executar k6/Artillery (`npm run perf:k6`, `npm run perf:artillery` – scripts a criar).
  4. Publicar relatórios (Artillery JSON, k6 summary, Playwright trace).

## 6. Entregáveis

- Relatório consolidado (Markdown) por execução contendo:
  - Data/hora
  - Ambiente
  - Resultados (latência, throughput, erro)
  - Observações/alertas
- Histórico armazenado em `docs/performance-reports/`.

## 7. Riscos & Mitigações

- **Rede restrita**: executar em runner com acesso externo ou utilizar download offline (vide guia Playwright).
- **Supabase quotas**: usar project de staging para evitar custo/limite.
- **Dependências externas (Twilio/SendGrid)**: mock/localstack para evitar cobranças.

## 8. Próximos passos imediatos

1. Provisionar navegadores (ou CI com acesso) via `scripts/setup-playwright-offline.sh` e ativar `REQUIRE_E2E=1`.
2. Sincronizar artefatos com `scripts/ops/sync-to-prod.sh` (utiliza `docs/prod-sync-allowlist.txt`).
3. Executar `npm run perf:k6` (ou variações) a partir do diretório de produção para gerar baseline.
