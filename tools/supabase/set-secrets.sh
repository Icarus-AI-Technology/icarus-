#!/usr/bin/env bash
set -euo pipefail

# Usage:
#  export SUPABASE_PROJECT_REF=ttswvavcisdnonytslom
#  export SUPABASE_ACCESS_TOKEN=...   # opcional
#  export SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
#  export SUPABASE_SERVICE_ROLE='...'
#  export ADMIN_INITIAL_EMAIL='dax@newortho.com.br'
#  export ADMIN_INITIAL_PASSWORD="%Ortho#New&25’"
#  export ADMIN_INITIAL_NAME='Dax Meneghel'
#  # opcional
#  export SUPABASE_JWT_SECRET='...'
#  bash tools/supabase/set-secrets.sh

require_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "Erro: '$1' não encontrado." >&2; exit 1; }; }
require_cmd supabase

PROJECT_REF=${SUPABASE_PROJECT_REF:-}
ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN:-}

if [ -n "$ACCESS_TOKEN" ]; then
  supabase login --token "$ACCESS_TOKEN" >/dev/null || true
fi

if [ -n "$PROJECT_REF" ]; then
  supabase link --project-ref "$PROJECT_REF" >/dev/null || true
fi

# Monta lista de pares para secrets set
args=()
for key in SUPABASE_URL SUPABASE_SERVICE_ROLE ADMIN_INITIAL_EMAIL ADMIN_INITIAL_PASSWORD ADMIN_INITIAL_NAME SUPABASE_JWT_SECRET; do
  val=${!key-}
  if [ -n "${val}" ]; then
    args+=("$key=$val")
  fi
done

if [ ${#args[@]} -eq 0 ]; then
  echo "Nenhuma variável para setar (verifique env)." >&2
  exit 1
fi

echo "🔐 Definindo secrets do Supabase (${#args[@]} chaves)..."
supabase secrets set "${args[@]}"

echo "✅ Secrets aplicadas com sucesso."


