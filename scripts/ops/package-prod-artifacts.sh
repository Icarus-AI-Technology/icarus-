#!/usr/bin/env bash

# Empacota os artefatos aprovados em um .tar.gz usando a allowlist

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ALLOWLIST_FILE="${ROOT}/docs/prod-sync-allowlist.txt"
OUTPUT="${ROOT}/prod-sync-$(date +%Y%m%d-%H%M%S).tar.gz"
TMP_LIST="$(mktemp)"

if [[ ! -f "${ALLOWLIST_FILE}" ]]; then
  echo "Allowlist não encontrada: ${ALLOWLIST_FILE}" >&2
  exit 1
fi

while IFS= read -r entry || [[ -n "${entry}" ]]; do
  [[ -z "${entry}" || "${entry}" =~ ^# ]] && continue
  if [[ -e "${ROOT}/${entry}" ]]; then
    echo "${entry}" >> "${TMP_LIST}"
  else
    echo "⚠️  Ignorando (não encontrado): ${entry}"
  fi
done < "${ALLOWLIST_FILE}"

if [[ ! -s "${TMP_LIST}" ]]; then
  echo "Nenhum arquivo disponível para empacotar." >&2
  rm -f "${TMP_LIST}"
  exit 0
fi

echo "📦 Gerando pacote ${OUTPUT}"
tar -czf "${OUTPUT}" -C "${ROOT}" -T "${TMP_LIST}"
rm -f "${TMP_LIST}"

echo "✅ Pacote criado. Copie para o host de produção e extraia com:"
echo "   tar -xzf $(basename "${OUTPUT}") -C /Users/daxmeneghel/icarus-v5.0"
