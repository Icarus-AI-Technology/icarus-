#!/bin/bash

# Script para adicionar credenciais no Vercel de forma interativa
# Uso: bash scripts/add-vercel-credentials.sh

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     Configurar Credenciais no Vercel - ICARUS v5.0.3        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Array de credenciais
declare -a CREDENTIALS=(
  "VITE_TWILIO_ACCOUNT_SID:Twilio Account SID"
  "VITE_TWILIO_AUTH_TOKEN:Twilio Auth Token"
  "VITE_TWILIO_PHONE_NUMBER:Twilio Phone Number"
  "VITE_WHATSAPP_ACCESS_TOKEN:WhatsApp Access Token"
  "VITE_SENDGRID_API_KEY:SendGrid API Key"
  "VITE_SENDGRID_FROM_EMAIL:SendGrid From Email"
  "VITE_MAILCHIMP_API_KEY:Mailchimp API Key"
  "VITE_MAILCHIMP_DC:Mailchimp Data Center"
  "VITE_ABBOTT_API_KEY:Abbott API Key"
  "VITE_MEDTRONIC_CLIENT_ID:Medtronic Client ID"
  "VITE_MEDTRONIC_CLIENT_SECRET:Medtronic Client Secret"
  "VITE_JJ_TRACELINK_TOKEN:J&J TraceLink Token"
  "VITE_STRYKER_API_KEY:Stryker API Key"
  "VITE_BOSTON_SCIENTIFIC_TOKEN:Boston Scientific Token"
  "VITE_INFOSIMPLES_TOKEN:InfoSimples Token"
)

echo "Este script irá guiá-lo na adição das 15 credenciais."
echo ""
echo "⚠️  IMPORTANTE: As credenciais são adicionadas UMA POR VEZ."
echo ""
echo "Deseja continuar? (s/n)"
read -r CONTINUE

if [[ "$CONTINUE" != "s" && "$CONTINUE" != "S" ]]; then
  echo "❌ Cancelado pelo usuário."
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Contador
SUCCESS=0
SKIP=0
ERROR=0

# Para cada credencial
for CRED in "${CREDENTIALS[@]}"; do
  IFS=':' read -r VAR_NAME VAR_DESC <<< "$CRED"
  
  echo ""
  echo "📌 Configurando: $VAR_DESC"
  echo "   Nome da variável: $VAR_NAME"
  echo ""
  
  # Perguntar se deseja configurar
  echo "Deseja configurar esta credencial agora? (s/n/c para cancelar tudo)"
  read -r CONFIGURE
  
  if [[ "$CONFIGURE" == "c" || "$CONFIGURE" == "C" ]]; then
    echo "❌ Cancelado pelo usuário."
    break
  fi
  
  if [[ "$CONFIGURE" != "s" && "$CONFIGURE" != "S" ]]; then
    echo "⏭️  Pulando $VAR_NAME"
    ((SKIP++))
    continue
  fi
  
  # Solicitar o valor
  echo "Digite o valor para $VAR_NAME:"
  read -r VAR_VALUE
  
  if [[ -z "$VAR_VALUE" ]]; then
    echo "⚠️  Valor vazio, pulando."
    ((SKIP++))
    continue
  fi
  
  # Adicionar no Vercel
  echo ""
  echo "Adicionando no Vercel..."
  
  if echo "$VAR_VALUE" | npx vercel env add "$VAR_NAME" production preview development 2>&1; then
    echo "✅ $VAR_NAME configurado com sucesso!"
    ((SUCCESS++))
  else
    echo "❌ Erro ao configurar $VAR_NAME"
    ((ERROR++))
  fi
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
done

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     RESULTADO FINAL                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "   ✅ Configuradas: $SUCCESS/15"
echo "   ⏭️  Puladas: $SKIP/15"
echo "   ❌ Erros: $ERROR/15"
echo ""

if [[ $SUCCESS -gt 0 ]]; then
  echo "🎉 Credenciais configuradas com sucesso!"
  echo ""
  echo "🎯 Próximos passos:"
  echo "   1. Faça um redeploy no Vercel"
  echo "   2. Execute: npm run sync:from-vercel"
  echo "   3. Acesse: http://localhost:5173/integracoes/credenciais"
  echo ""
else
  echo "⚠️  Nenhuma credencial foi configurada."
  echo ""
  echo "💡 Você pode configurar manualmente em:"
  echo "   https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

