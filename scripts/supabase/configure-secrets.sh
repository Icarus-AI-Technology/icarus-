#!/bin/bash
# =============================================================================
# Configurar secrets necessários nas Edge Functions do Supabase
# =============================================================================

set -euo pipefail

PROJECT_REF="${SUPABASE_PROJECT_REF:-gvbkviozlhxorjoavmky}"

if ! command -v supabase >/dev/null 2>&1; then
  echo "❌ supabase CLI não encontrado. Instale com 'npm i -g supabase'." >&2
  exit 1
fi

echo "🔐 Configurando secrets no projeto ${PROJECT_REF}"
echo ""

read -rp "E-mail do admin inicial [admin@icarus.com.br]: " ADMIN_INITIAL_EMAIL
ADMIN_INITIAL_EMAIL="${ADMIN_INITIAL_EMAIL:-admin@icarus.com.br}"

read -rsp "Senha do admin inicial (obrigatória): " ADMIN_INITIAL_PASSWORD
echo ""
if [[ -z "${ADMIN_INITIAL_PASSWORD}" ]]; then
  echo "❌ Senha obrigatória." >&2
  exit 1
fi

read -rp "Nome do admin inicial [Administrador Sistema]: " ADMIN_INITIAL_NAME
ADMIN_INITIAL_NAME="${ADMIN_INITIAL_NAME:-Administrador Sistema}"

read -rp "Ativar AI Tutor em Cirurgias? [Y/n]: " FF_TUTOR_CIRURGIAS
FF_TUTOR_CIRURGIAS="${FF_TUTOR_CIRURGIAS:-Y}"

read -rp "Ativar fila de ML? [Y/n]: " FF_ML_QUEUE
FF_ML_QUEUE="${FF_ML_QUEUE:-Y}"

read -rp "Ativar EDR Research? [Y/n]: " FF_EDR_RESEARCH
FF_EDR_RESEARCH="${FF_EDR_RESEARCH:-Y}"

read -rp "Ativar Agent Orchestration? [Y/n]: " FF_AGENT_ORCHESTRATION
FF_AGENT_ORCHESTRATION="${FF_AGENT_ORCHESTRATION:-Y}"

set_secret() {
  local KEY=$1
  local VALUE=$2
  echo "→ definindo ${KEY}"
  supabase secrets set "${KEY}=${VALUE}" --project-ref "${PROJECT_REF}" >/dev/null
}

set_secret ADMIN_INITIAL_EMAIL "${ADMIN_INITIAL_EMAIL}"
set_secret ADMIN_INITIAL_PASSWORD "${ADMIN_INITIAL_PASSWORD}"
set_secret ADMIN_INITIAL_NAME "${ADMIN_INITIAL_NAME}"

[[ "${FF_TUTOR_CIRURGIAS^^}" == "Y" ]] && set_secret FF_TUTOR_CIRURGIAS "true" || set_secret FF_TUTOR_CIRURGIAS "false"
[[ "${FF_ML_QUEUE^^}" == "Y" ]] && set_secret FF_ML_QUEUE "true" || set_secret FF_ML_QUEUE "false"
[[ "${FF_EDR_RESEARCH^^}" == "Y" ]] && set_secret FF_EDR_RESEARCH "true" || set_secret FF_EDR_RESEARCH "false"
[[ "${FF_AGENT_ORCHESTRATION^^}" == "Y" ]] && set_secret FF_AGENT_ORCHESTRATION "true" || set_secret FF_AGENT_ORCHESTRATION "false"

echo ""
echo "✅ Secrets configurados. Verifique com:"
echo "   supabase secrets list --project-ref ${PROJECT_REF}"

