# Execução de Testes de Carga

## Pré-checklist

- Navegadores Playwright prontos (ver `docs/e2e-playwright-setup.md`).
- Arquivos sincronizados para `/Users/daxmeneghel/icarus-v5.0` via `scripts/ops/sync-to-prod.sh`.
- `k6` instalado localmente ou disponível via Docker (`docker run --rm -i grafana/k6 ...`).

## Exemplo (local)

```bash
cd /Users/daxmeneghel/icarus-v5.0
API_BASE_URL=http://localhost:5177/api/health npm run perf:k6
```

## Exemplo (Docker)

```bash
cd /Users/daxmeneghel/icarus-v5.0
API_BASE_URL=https://staging.icarus.dev/api/health \
  docker run --rm -i -v "$PWD":/workdir -w /workdir grafana/k6 \
  run tests/perf/k6-smoke.js
```

## Pós-execução

- Registrar resultados em `docs/performance-reports/` (criar se necessário).
- Atualizar indicadores no relatório de migração.
