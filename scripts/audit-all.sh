#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORTS_DIR="$ROOT_DIR/docs/REPORTS"

mkdir -p "$REPORTS_DIR"

echo "==> Instalação de dependências (se necessário)"
if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable && corepack prepare pnpm@latest --activate
fi

pnpm install --no-frozen-lockfile || pnpm install

echo "==> Audit DB"
pnpm db:health || true
pnpm db:audit || true

echo "==> Build e iniciando preview (background)"
pnpm build || true
pnpm preview:start &
PREVIEW_PID=$!
sleep 5

cleanup() {
  echo "==> Encerrando preview (PID=$PREVIEW_PID)"
  kill "$PREVIEW_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "==> QA UI/Integrations"
pnpm qa:all || true
pnpm qa:a11y || true
pnpm qa:perf || true

echo "==> E2E"
pnpm test:e2e || true

echo "==> Consolidando artefatos em $REPORTS_DIR"
node -e '
const fs=require("fs");
const path=require("path");
const out=path.resolve("docs/REPORTS");
if(!fs.existsSync(out)) fs.mkdirSync(out,{recursive:true});
const stamp=new Date().toISOString();
fs.writeFileSync(path.join(out,"executive.md"), `# Relatório Executivo\n\nGerado em: ${stamp}\n\nResumo: Consulte technical.md para detalhes.\n`);
fs.writeFileSync(path.join(out,"technical.md"), `# Relatório Técnico\n\nGerado em: ${stamp}\n\n- Verifique docs/lh-*.json, docs/qa-*.json, docs/perf-report.json se presentes.\n- Outputs adicionais podem estar em docs/*.json.\n`);
fs.writeFileSync(path.join(out,"index.html"), `<!doctype html><meta charset=utf-8><title>ICARUS Audit Dashboard</title><h1>ICARUS Audit Dashboard</h1><ul><li><a href=executive.md>Executive</a></li><li><a href=technical.md>Technical</a></li></ul>`);
'

echo "==> Concluído. Relatórios em $REPORTS_DIR"


