# 📋 CHECKLIST DE VARIÁVEIS DE AMBIENTE - ICARUS v5.0.1

**Data:** 28 de Outubro de 2025  
**Versão:** 5.0.1 + CEO Intelligence Module  
**Ambiente:** Staging → Produção

---

## 🎯 Objetivo

Este checklist garante que todas as variáveis de ambiente estejam corretamente configuradas antes do deploy.

---

## ✅ CHECKLIST DE VALIDAÇÃO

### 📦 1. SUPABASE (CRÍTICO)

#### Staging
- [ ] `VITE_SUPABASE_URL` - URL do projeto staging
  - Formato: `https://[projeto-id].supabase.co`
  - Obtido em: Supabase Dashboard → Settings → API → Project URL
  
- [ ] `VITE_SUPABASE_ANON_KEY` - Chave anônima (pública)
  - Formato: `eyJhbGc...` (JWT token)
  - Obtido em: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (privada)
  - Formato: `eyJhbGc...` (JWT token)
  - Obtido em: Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
  - ⚠️ **NUNCA expor no frontend!**

**Validação:**
```bash
# Testar conexão
curl -X GET "${VITE_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}"
# Deve retornar: {}
```

---

### 🔐 2. AUTENTICAÇÃO E SEGURANÇA

- [ ] `JWT_SECRET` - Secret para assinatura de tokens
  - Gerar: `openssl rand -base64 32`
  - Tamanho mínimo: 32 caracteres
  
- [ ] `ENCRYPTION_KEY` - Chave para criptografia
  - Gerar: `openssl rand -hex 32`
  - Tamanho: 64 caracteres (hexadecimal)
  
- [ ] `SESSION_SECRET` - Secret para sessões
  - Gerar: `openssl rand -base64 32`

**Validação:**
```bash
# Verificar tamanho
echo -n "$JWT_SECRET" | wc -c  # Deve ser ≥ 32
```

---

### 📊 3. SENTRY (MONITORING)

- [ ] `VITE_SENTRY_DSN` - Data Source Name
  - Formato: `https://[key]@o[org].ingest.sentry.io/[project]`
  - Obtido em: Sentry.io → Settings → Projects → [projeto] → Client Keys (DSN)
  
- [ ] `VITE_SENTRY_ENVIRONMENT` - Nome do ambiente
  - Valores: `development`, `staging`, `production`
  
- [ ] `VITE_GOOGLE_ANALYTICS_ID` (opcional)
  - Formato: `G-XXXXXXXXXX` ou `UA-XXXXXXXX-X`

**Validação:**
```bash
# Testar DSN
curl -X POST "${VITE_SENTRY_DSN}" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test from CLI"}'
```

---

### 🌐 4. APIs EXTERNAS - ANVISA

- [ ] `VITE_ANVISA_API_URL`
  - Valor: `https://consultas.anvisa.gov.br`
  - Não requer chave de API
  
- [ ] `ANVISA_API_KEY` (se aplicável)
  - Obtido em: Credenciamento junto à ANVISA

**Validação:**
```bash
# Testar endpoint
curl "${VITE_ANVISA_API_URL}/api/consulta/medicamentos"
```

---

### 📞 5. TWILIO (SMS/WHATSAPP)

#### Test Account (Staging)
- [ ] `VITE_TWILIO_ACCOUNT_SID` - Test Account SID
  - Formato: `ACtest...`
  - Obtido em: Twilio Console → Trial Account
  
- [ ] `TWILIO_AUTH_TOKEN` - Test Auth Token
  - Formato: String alfanumérica
  - Obtido em: Twilio Console → Auth Token
  
- [ ] `VITE_TWILIO_PHONE_NUMBER` - Número de teste
  - Formato: `+15551234567`
  
- [ ] `VITE_TWILIO_WHATSAPP_NUMBER` - WhatsApp Sandbox
  - Valor: `whatsapp:+14155238886` (sandbox oficial)

#### Production Account
- [ ] Substituir por credenciais de produção
- [ ] Verificar billing habilitado
- [ ] Configurar números verificados

**Validação:**
```bash
# Testar API (staging)
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/${VITE_TWILIO_ACCOUNT_SID}/Messages.json" \
  --data-urlencode "Body=Test message" \
  --data-urlencode "From=${VITE_TWILIO_PHONE_NUMBER}" \
  --data-urlencode "To=+5511999999999" \
  -u "${VITE_TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}"
```

---

### 📈 6. MICROSOFT GRAPH API

- [ ] `VITE_MS_GRAPH_CLIENT_ID` - Application (client) ID
  - Formato: GUID (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
  - Obtido em: Azure Portal → App registrations → [app] → Overview
  
- [ ] `VITE_MS_GRAPH_TENANT_ID` - Directory (tenant) ID
  - Formato: GUID
  - Obtido em: Azure Portal → App registrations → [app] → Overview
  
- [ ] `MS_GRAPH_CLIENT_SECRET` - Client secret
  - Formato: String alfanumérica
  - Obtido em: Azure Portal → App registrations → [app] → Certificates & secrets
  - ⚠️ Expira! Agendar renovação.

**Validação:**
```bash
# Obter token
curl -X POST "https://login.microsoftonline.com/${VITE_MS_GRAPH_TENANT_ID}/oauth2/v2.0/token" \
  -d "client_id=${VITE_MS_GRAPH_CLIENT_ID}" \
  -d "client_secret=${MS_GRAPH_CLIENT_SECRET}" \
  -d "scope=https://graph.microsoft.com/.default" \
  -d "grant_type=client_credentials"
```

---

### 📊 7. POWER BI

- [ ] `VITE_POWERBI_WORKSPACE_ID` - Workspace ID
  - Formato: GUID
  - Obtido em: Power BI → Workspace → Settings → Workspace ID
  
- [ ] `POWERBI_CLIENT_ID` - Application ID (mesmo do Graph API)
  
- [ ] `POWERBI_CLIENT_SECRET` - Client secret (mesmo do Graph API)

**Validação:**
```bash
# Listar workspaces
curl -X GET "https://api.powerbi.com/v1.0/myorg/groups" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

### 🤖 9. OPENAI (IA)

- [ ] `OPENAI_API_KEY` - API Key
  - Formato: `sk-...`
  - Obtido em: OpenAI Platform → API keys
  
- [ ] `VITE_OPENAI_MODEL` - Modelo a usar
  - Valores: `gpt-4-turbo-preview`, `gpt-4`, `gpt-3.5-turbo`
  
- [ ] `OPENAI_MAX_TOKENS` - Limite de tokens
  - Valor recomendado: `4000`
  
- [ ] `OPENAI_TEMPERATURE` - Temperatura (criatividade)
  - Valor: `0.0` (determinístico) a `1.0` (criativo)
  - Recomendado: `0.7`

**Validação:**
```bash
# Testar API
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer ${OPENAI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 50
  }'
```

---

### 🏦 10. PLUGGY (OPEN BANKING)

#### Sandbox (Staging)
- [ ] `VITE_PLUGGY_CLIENT_ID` - Client ID (sandbox)
  - Obtido em: Pluggy Dashboard → API Keys → Sandbox
  
- [ ] `PLUGGY_CLIENT_SECRET` - Client Secret (sandbox)
  
- [ ] `VITE_PLUGGY_ENVIRONMENT` - Ambiente
  - Valor: `sandbox`

#### Production
- [ ] Substituir por credenciais de produção
- [ ] Configurar webhooks
- [ ] Validar compliance PSD2

**Validação:**
```bash
# Obter token
curl -X POST "https://api.pluggy.ai/auth" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "'${VITE_PLUGGY_CLIENT_ID}'",
    "clientSecret": "'${PLUGGY_CLIENT_SECRET}'"
  }'
```

---

### 📧 11. E-MAIL (SENDGRID/SMTP)

- [ ] `SMTP_HOST` - Servidor SMTP
  - Exemplo: `smtp.sendgrid.net`
  
- [ ] `SMTP_PORT` - Porta
  - Valores: `587` (TLS) ou `465` (SSL)
  
- [ ] `SMTP_USER` - Usuário
  - SendGrid: `apikey`
  
- [ ] `SMTP_PASSWORD` - Senha/API Key
  - SendGrid: API Key obtida no dashboard
  
- [ ] `SMTP_FROM_EMAIL` - E-mail remetente
  - Exemplo: `noreply@icarus.com.br`
  - ⚠️ Deve estar verificado no SendGrid
  
- [ ] `SMTP_FROM_NAME` - Nome do remetente
  - Exemplo: `ICARUS Sistema`

**Validação:**
```bash
# Testar envio (usando swaks)
swaks --to test@example.com \
  --from "${SMTP_FROM_EMAIL}" \
  --server "${SMTP_HOST}:${SMTP_PORT}" \
  --auth LOGIN \
  --auth-user "${SMTP_USER}" \
  --auth-password "${SMTP_PASSWORD}" \
  --tls \
  --header "Subject: Test Email"
```

---

### 🌍 12. APIs PÚBLICAS BRASIL

- [ ] `VITE_RECEITA_WS_URL` - ReceitaWS (CNPJ)
  - Valor: `https://receitaws.com.br/v1`
  - Gratuito até 3 requisições/minuto
  
- [ ] `VITE_VIACEP_URL` - ViaCEP
  - Valor: `https://viacep.com.br/ws`
  - Gratuito, sem chave

**Validação:**
```bash
# Testar ReceitaWS
curl "${VITE_RECEITA_WS_URL}/cnpj/00000000000191"

# Testar ViaCEP
curl "${VITE_VIACEP_URL}/01310100/json/"
```

---

### 🔧 13. CONFIGURAÇÕES GERAIS

- [ ] `NODE_ENV` - Ambiente Node.js
  - Valores: `development`, `staging`, `production`
  
- [ ] `VITE_APP_ENV` - Ambiente da aplicação
  - Valores: `development`, `staging`, `production`
  
- [ ] `VITE_API_URL` - URL da API backend
  - Staging: `https://staging-api.icarus.com.br`
  - Produção: `https://api.icarus.com.br`
  
- [ ] `CORS_ORIGIN` - Origens permitidas (CORS)
  - Staging: `https://staging.icarus.com.br,http://localhost:5173`
  - Produção: `https://icarus.com.br,https://www.icarus.com.br`

---

### 📦 14. STORAGE E DATABASE

- [ ] `VITE_STORAGE_BUCKET` - Bucket Supabase Storage
  - Staging: `icarus-staging-uploads`
  - Produção: `icarus-uploads`
  
- [ ] `MAX_FILE_SIZE` - Tamanho máximo de arquivo (bytes)
  - Recomendado: `10485760` (10 MB)
  
- [ ] `DATABASE_URL` - URL do banco (PostgreSQL)
  - Formato: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`
  - Obtido em: Supabase Dashboard → Settings → Database → Connection string

---

### 🔄 15. RATE LIMITING

- [ ] `RATE_LIMIT_WINDOW_MS` - Janela de tempo (ms)
  - Staging: `60000` (1 minuto)
  - Produção: `60000`
  
- [ ] `RATE_LIMIT_MAX_REQUESTS` - Máximo de requisições
  - Staging: `200` (mais permissivo)
  - Produção: `100`

---

### 🤖 16. IA E ML

- [ ] `AI_MODELS_PATH` - Caminho dos modelos
  - Exemplo: `/opt/ml/models`
  
- [ ] `AI_MODELS_VERSION` - Versão dos modelos
  - Exemplo: `v1.0.0`

---

### 💾 17. BACKUP

- [ ] `BACKUP_ENABLED` - Habilitar backups automáticos
  - Valores: `true`, `false`
  
- [ ] `BACKUP_SCHEDULE` - Agendamento (cron)
  - Exemplo: `0 2 * * *` (todo dia às 2h)
  
- [ ] `BACKUP_RETENTION_DAYS` - Dias de retenção
  - Staging: `7`
  - Produção: `30`

---

## 🚀 SCRIPT DE VALIDAÇÃO AUTOMÁTICA

Crie um arquivo `scripts/validate-env.sh`:

```bash
#!/bin/bash

echo "🔍 Validando variáveis de ambiente..."

ERRORS=0

# Função para validar variável
check_var() {
  if [ -z "${!1}" ]; then
    echo "❌ $1 não está definida!"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ $1"
  fi
}

# Variáveis críticas
check_var "VITE_SUPABASE_URL"
check_var "VITE_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY"
check_var "JWT_SECRET"
check_var "VITE_SENTRY_DSN"

# Variáveis de APIs
check_var "OPENAI_API_KEY"
check_var "VITE_TWILIO_ACCOUNT_SID"
check_var "SMTP_HOST"

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ Todas as variáveis críticas estão configuradas!"
  exit 0
else
  echo "❌ $ERRORS variável(is) faltando!"
  exit 1
fi
```

Execute:
```bash
chmod +x scripts/validate-env.sh
source .env.staging && ./scripts/validate-env.sh
```

---

## 📋 CHECKLIST FINAL

Antes de fazer deploy:

- [ ] Todas as variáveis críticas configuradas
- [ ] Credenciais de **STAGING** em `.env.staging`
- [ ] Credenciais de **PRODUÇÃO** em `.env.production`
- [ ] Nenhum secret commitado no Git
- [ ] Script de validação passou sem erros
- [ ] Testes de conectividade realizados
- [ ] Documentação atualizada

---

## 🆘 Troubleshooting

### Erro: "Invalid Supabase URL"
- Verificar formato: `https://[projeto-id].supabase.co`
- Sem barra final (`/`)

### Erro: "Unauthorized" no Supabase
- Verificar se `VITE_SUPABASE_ANON_KEY` está correto
- Verificar RLS policies no banco

### Erro: "CORS blocked"
- Adicionar domínio em `CORS_ORIGIN`
- Configurar CORS no Supabase Dashboard

### Erro: "Sentry not capturing events"
- Verificar DSN está correto
- Verificar `VITE_SENTRY_ENVIRONMENT` corresponde ao ambiente
- Testar com `Sentry.captureMessage("Test")`

---

## 📚 Referências

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development)
- [Sentry Configuration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Twilio API Reference](https://www.twilio.com/docs/usage/api)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

**ICARUS v5.0.1 - Sistema Enterprise OPME**  
**Powered by AI • Built with ❤️ • Made in Brazil 🇧🇷**

---

*Documento atualizado em: 28 de Outubro de 2025*  
*Versão: 1.0*

