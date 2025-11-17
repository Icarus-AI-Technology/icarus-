#!/usr/bin/env bash

# Wrapper para execução de smoke perf com fallback

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_FILE="${ROOT}/tests/perf/k6-smoke.js"

if command -v k6 >/dev/null 2>&1; then
  echo "🚀 Executando k6 local"
  exec k6 run "${TEST_FILE}"
fi

if command -v docker >/dev/null 2>&1; then
  echo "🐳 k6 não encontrado. Usando docker grafana/k6"
  exec docker run --rm -i -v "${ROOT}":/workdir -w /workdir grafana/k6 run "tests/perf/k6-smoke.js"
fi

echo "⚠️  k6 não disponível e docker ausente. Executando fallback HTTP check via Node."
node "${ROOT}/scripts/perf/http-smoke.mjs"
