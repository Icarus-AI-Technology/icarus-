#!/usr/bin/env bash

# Offline Playwright bootstrap (friendly mode)
# --------------------------------------------
# Usage:
#   scripts/setup-playwright-offline.sh /path/to/playwright-browsers.tgz
#   scripts/setup-playwright-offline.sh --skip   # apenas marca ambiente como configurado

set -euo pipefail

WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${WORKDIR}/.playwright-browsers"

ARCHIVE_PATH="${1:-}"

mkdir -p "${DEST}"

if [[ "${ARCHIVE_PATH}" == "--skip" ]]; then
  echo "⚠️  Nenhum bundle fornecido. Registrando placeholder em ${DEST}"
  echo "placeholder: browsers não instalados" > "${DEST}/README.txt"
  echo " ℹ️  Quando tiver acesso, execute novamente com o arquivo .tgz real."
  exit 0
fi

if [[ -z "${ARCHIVE_PATH}" ]]; then
  echo "Uso: $0 /caminho/para/playwright-browsers.tgz" >&2
  echo "     $0 --skip   # cria placeholder e sai com sucesso" >&2
  exit 0
fi

if [[ ! -f "${ARCHIVE_PATH}" ]]; then
  echo "Arquivo não encontrado: ${ARCHIVE_PATH}" >&2
  exit 1
fi

echo "📦 Extraindo bundle Playwright para ${DEST}"
rm -rf "${DEST:?}/"*
mkdir -p "${DEST}"

tar -xzf "${ARCHIVE_PATH}" -C "${DEST}" --strip-components=1

echo "✅ Extração concluída"

if command -v tree >/dev/null 2>&1; then
  tree -L 2 "${DEST}"
else
  find "${DEST}" -maxdepth 2 -type d
fi

echo "ℹ️  Para obrigar E2E: REQUIRE_E2E=1 scripts/ops/run-missing-tests.sh"
