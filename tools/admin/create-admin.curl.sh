#!/usr/bin/env bash
set -euo pipefail

# Simple idempotent Admin creation via Supabase Auth Admin API
# Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE(_KEY)

SUPABASE_URL=${SUPABASE_URL:-""}
SERVICE_ROLE=${SUPABASE_SERVICE_ROLE:-${SUPABASE_SERVICE_ROLE_KEY:-""}}

ADMIN_EMAIL=${ADMIN_EMAIL:-"dax@newortho.com.br"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"Admin@123456!"}
ADMIN_NAME=${ADMIN_NAME:-"Dax Meneghel"}

if [[ -z "$SUPABASE_URL" || -z "$SERVICE_ROLE" ]]; then
  echo "[admin:create:curl] Missing SUPABASE_URL or SERVICE_ROLE env" >&2
  exit 1
fi

AUTH_ENDPOINT="$SUPABASE_URL/auth/v1/admin/users"

echo "[admin:create:curl] Ensuring admin user exists: $ADMIN_EMAIL"

# Try create; treat 'already registered' as success
CREATE_BODY=$(cat <<JSON
{ "email": "$ADMIN_EMAIL", "password": "$ADMIN_PASSWORD", "email_confirm": true, "user_metadata": { "name": "$ADMIN_NAME" } }
JSON
)

HTTP_CODE=$(curl -sS -o /tmp/create_admin_resp.json -w "%{http_code}" \
  -H "apikey: $SERVICE_ROLE" \
  -H "Authorization: Bearer $SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -X POST "$AUTH_ENDPOINT" \
  -d "$CREATE_BODY") || true

RESP=$(cat /tmp/create_admin_resp.json)

if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "201" ]]; then
  echo "[admin:create:curl] Admin ensured (created)."
  exit 0
fi

if echo "$RESP" | grep -qi "already"; then
  echo "[admin:create:curl] Admin already exists. Proceeding."
  exit 0
fi

echo "[admin:create:curl] Unexpected response ($HTTP_CODE): $RESP" >&2
exit 1


