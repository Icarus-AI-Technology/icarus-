#!/bin/bash
# =============================================================================
# Invoca a Edge Function create-admin no Supabase
# =============================================================================

set -euo pipefail

PROJECT_REF="${SUPABASE_PROJECT_REF:-gvbkviozlhxorjoavmky}"
BASE_URL="https://${PROJECT_REF}.supabase.co"
FUNCTION_SLUG="${1:-create-admin}"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [[ -z "${SERVICE_ROLE_KEY}" ]]; then
  read -rsp "Cole a SUPABASE_SERVICE_ROLE_KEY: " SERVICE_ROLE_KEY
  echo ""
fi

if [[ -z "${SERVICE_ROLE_KEY}" ]]; then
  echo "❌ SERVICE_ROLE_KEY é obrigatória." >&2
  exit 1
fi

echo "🚀 Invocando Edge Function ${FUNCTION_SLUG} em ${BASE_URL}"

HTTP_RESPONSE=$(
  curl -sS -X POST \
    "${BASE_URL}/functions/v1/${FUNCTION_SLUG}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"invokedFrom":"scripts/supabase/create-admin.sh"}'
)

echo "${HTTP_RESPONSE}"

