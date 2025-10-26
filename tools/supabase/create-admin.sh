#!/usr/bin/env bash
set -euo pipefail

# Usage:
#  SUPABASE_PROJECT_REF=ttswvavcisdnonytslom \
#  SUPABASE_ACCESS_TOKEN=... \  # opcional
#  SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co \
#  SUPABASE_SERVICE_ROLE='...' \
#  ADMIN_INITIAL_EMAIL='dax@newortho.com.br' \
#  ADMIN_INITIAL_PASSWORD="%Ortho#New&25’" \
#  ADMIN_INITIAL_NAME='Dax Meneghel' \
#  bash tools/supabase/create-admin.sh

require_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "Erro: '$1' não encontrado." >&2; exit 1; }; }

require_cmd supabase

PROJECT_REF=${SUPABASE_PROJECT_REF:-}
ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN:-}

# Login opcional via token
if [ -n "$ACCESS_TOKEN" ]; then
  supabase login --token "$ACCESS_TOKEN" >/dev/null
fi

if [ -n "$PROJECT_REF" ]; then
  supabase link --project-ref "$PROJECT_REF" >/dev/null
fi

# Definir secrets se fornecidas
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_ROLE:-}" ] && \
   [ -n "${ADMIN_INITIAL_EMAIL:-}" ] && [ -n "${ADMIN_INITIAL_PASSWORD:-}" ] && \
   [ -n "${ADMIN_INITIAL_NAME:-}" ]; then
  supabase secrets set \
    SUPABASE_URL="$SUPABASE_URL" \
    SUPABASE_SERVICE_ROLE="$SUPABASE_SERVICE_ROLE" \
    ADMIN_INITIAL_EMAIL="$ADMIN_INITIAL_EMAIL" \
    ADMIN_INITIAL_PASSWORD="$ADMIN_INITIAL_PASSWORD" \
    ADMIN_INITIAL_NAME="$ADMIN_INITIAL_NAME"
fi

echo "🚀 Deploying Edge Function 'create-admin'..."
supabase functions deploy create-admin --no-verify-jwt

echo "▶️ Invoking Edge Function 'create-admin'..."
supabase functions invoke create-admin --no-verify-jwt || true

echo "ℹ️  Logs recentes (15m):"
supabase functions logs -f create-admin --since 15m || true

echo "✅ Finalizado. Verifique Authentication → Users no dashboard."


