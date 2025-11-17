# 🧪 Agente V5-02 — Quality Ops

**Missão**: garantir execução de testes, validação de ambiente e consistência de dependências.

## Subagentes

- [ ] `V5-02-01` — Test Executor (scripts faltantes)
- [ ] `V5-02-02` — Env Auditor (conferência `.env` vs `env.example`)
- [ ] `V5-02-03` — Dependency Auditor (checagem de libs)
- [ ] `V5-02-04` — Quality Gates (lint/type-check/build)

## Scripts Associados

- `scripts/ops/run-missing-tests.sh`
- `scripts/ops/validate-environment.mjs`
- `scripts/ops/check-dependencies.mjs`

## Entregáveis

- Logs em `test-results/quality-report-*.log`
- Relatório consolidado neste diretório (`REPORT.md`)
