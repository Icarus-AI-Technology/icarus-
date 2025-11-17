#!/usr/bin/env bash

# Sync curated artifacts from the dev workspace to /Users/daxmeneghel/icarus-v5.0
# Requires rsync (macOS default). Uses docs/prod-sync-allowlist.txt.

set -euo pipefail

DEV_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROD_ROOT="/Users/daxmeneghel/icarus-v5.0"
ALLOWLIST_FILE="${DEV_ROOT}/docs/prod-sync-allowlist.txt"
TMP_LIST="$(mktemp)"

if [[ ! -d "${PROD_ROOT}" ]]; then
  echo "Criando diretório de produção em ${PROD_ROOT}" >&2
  mkdir -p "${PROD_ROOT}"
fi

if [[ ! -f "${ALLOWLIST_FILE}" ]]; then
  echo "Allowlist não encontrada: ${ALLOWLIST_FILE}" >&2
  exit 1
fi

echo "📋 Gerando lista de arquivos existentes..."
while IFS= read -r entry || [[ -n "${entry}" ]]; do
  [[ -z "${entry}" || "${entry}" =~ ^# ]] && continue
  path="${DEV_ROOT}/${entry}"
  if [[ -e "${path}" ]]; then
    echo "${entry}" >> "${TMP_LIST}"
  else
    echo "⚠️  Ignorando (não encontrado): ${entry}"
  fi
done < "${ALLOWLIST_FILE}"

echo "🚚 Iniciando sync dev → prod"
SYNC_EXIT=0
if [[ -s "${TMP_LIST}" ]]; then
  set +e
  rsync -av --files-from="${TMP_LIST}" "${DEV_ROOT}/" "${PROD_ROOT}/"
  SYNC_EXIT=$?
  set -e
else
  echo "Nenhum arquivo elegível encontrado. Abortando sync."
fi

rm -f "${TMP_LIST}"

if [[ ${SYNC_EXIT} -ne 0 ]]; then
  echo "⚠️  Sync não conseguiu copiar todos os arquivos (código ${SYNC_EXIT})."
  echo "    Verifique permissões de escrita em ${PROD_ROOT} e execute novamente quando possível."
  exit 0
fi

echo "✅ Sync finalizado. Execute verificação em ${PROD_ROOT}."
