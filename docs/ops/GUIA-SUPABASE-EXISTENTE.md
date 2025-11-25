# 🔗 GUIA RÁPIDO - USANDO SUPABASE EXISTENTE

**Data:** 28 de Outubro de 2025  
**Project Ref Detectado:** `ttswvavcisdnonytslom`  
**Status:** ✅ Projeto Supabase JÁ CONFIGURADO

---

## 🎯 SITUAÇÃO ATUAL

Você **JÁ TEM** um projeto Supabase configurado com:
- ✅ Project Ref: `ttswvavcisdnonytslom`
- ✅ 93 migrations no repositório local
- ✅ Estrutura completa de banco de dados
- ✅ Edge Functions definidas

**O que falta:** Apenas criar o arquivo `.env.local` ou `.env.staging` com as credenciais.

---

## ⚡ SETUP RÁPIDO (5 MINUTOS)

### PASSO 1: Obter Credenciais do Supabase

1. Acesse o dashboard: https://supabase.com/dashboard/project/ttswvavcisdnonytslom

2. Vá em **Settings → API**

3. Copie as seguintes informações:
   - **Project URL:** `https://ttswvavcisdnonytslom.supabase.co`
   - **anon public key:** Começa com `eyJhbGc...`
   - **service_role key:** Começa com `eyJhbGc...` (diferente da anon)

### PASSO 2: Criar .env.local

```bash
cd /Users/daxmeneghel/icarus-v5.0

# Criar arquivo .env.local
cat > .env.local << 'EOF'
# ============================================
# SUPABASE (EXISTENTE)
# ============================================
VITE_SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
VITE_SUPABASE_ANON_KEY=cole_aqui_sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=cole_aqui_sua_service_role_key

# ============================================
# SEGURANÇA (GERAR NOVAS)
# ============================================
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -base64 32)

# ============================================
# AMBIENTE
# ============================================
NODE_ENV=development
VITE_APP_ENV=development

# ============================================
# SENTRY (OPCIONAL - Pode deixar vazio por ora)
# ============================================
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=development

# ============================================
# APIs EXTERNAS (OPCIONAL - Configurar depois)
# ============================================
OPENAI_API_KEY=
VITE_TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
# ============================================
# SMTP/EMAIL (OPCIONAL)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@icarus.local
SMTP_FROM_NAME=ICARUS Sistema

# ============================================
# OUTROS
# ============================================
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Editar para adicionar as keys do Supabase
nano .env.local  # ou code .env.local
```

**⚠️ IMPORTANTE:** Substitua `cole_aqui_sua_anon_key` e `cole_aqui_sua_service_role_key` pelas chaves reais do dashboard.

### PASSO 3: Validar Credenciais

```bash
# Carregar variáveis
source .env.local

# Testar conexão
curl "${VITE_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}"

# Deve retornar: {}
```

**✅ Se retornou `{}`, as credenciais estão corretas!**

---

## 🔄 VERIFICAR ESTADO DO BANCO

### Opção A: Via Supabase CLI

```bash
# Ver status do link
supabase db remote list

# Ver migrations aplicadas
supabase migration list --linked

# Ver tabelas existentes
supabase db remote get
```

### Opção B: Via Dashboard

1. Acesse: https://supabase.com/dashboard/project/ttswvavcisdnonytslom/editor
2. Vá em **Table Editor**
3. Verificar se existem tabelas como:
   - `empresas`
   - `usuarios`
   - `cirurgias`
   - `bi_fato_cirurgias`
   - `notifications`
   - etc.

---

## 🚀 INICIAR DESENVOLVIMENTO

### 1. Instalar Dependências (se necessário)

```bash
pnpm install
```

### 2. Iniciar Dev Server

```bash
# Dev server do frontend
pnpm dev

# Ou dev completo (frontend + backend)
pnpm dev:full
```

### 3. Acessar Aplicação

Abra o navegador em: http://localhost:5173

---

## 🔍 VERIFICAR SE MIGRATIONS ESTÃO APLICADAS

### Via SQL Editor no Supabase:

```sql
-- Ver migrations aplicadas
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 10;

-- Contar tabelas
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Listar tabelas principais
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name 
LIMIT 20;
```

---

## 📊 SE MIGRATIONS NÃO ESTIVEREM APLICADAS

Se o banco estiver vazio ou incompleto:

```bash
# Aplicar todas as 93 migrations
supabase db push

# Ou aplicar remotamente
supabase migration up --linked
```

---

## 🧪 RODAR TESTES

### Type Check

```bash
pnpm type-check
```

### Lint

```bash
pnpm lint
```

### Build

```bash
pnpm build
```

### Testes E2E

```bash
# Iniciar preview server
pnpm preview &

# Rodar Playwright
pnpm test:e2e
```

---

## 📋 CHECKLIST RÁPIDO

- [ ] ✅ Project ref encontrado: `ttswvavcisdnonytslom`
- [ ] ✅ Obtidas credenciais do dashboard Supabase
- [ ] ✅ Criado `.env.local` com as credenciais
- [ ] ✅ Testada conexão com Supabase (curl retornou `{}`)
- [ ] ✅ Verificado que migrations estão aplicadas
- [ ] ✅ `pnpm install` executado
- [ ] ✅ `pnpm dev` funcionando
- [ ] ✅ Aplicação acessível em http://localhost:5173
- [ ] ✅ Login funciona
- [ ] ✅ Sem erros no console do browser

---

## 🎯 PRÓXIMOS PASSOS PARA STAGING

Se tudo funcionou em local e você quer ir para staging:

### 1. Criar .env.staging

```bash
cp .env.local .env.staging

# Editar para ambiente staging
nano .env.staging
```

Alterar:
```env
NODE_ENV=staging
VITE_APP_ENV=staging
VITE_SENTRY_DSN=https://...  # Adicionar DSN do Sentry staging
# ... outras configs específicas de staging
```

### 2. Build de Staging

```bash
# Carregar env staging
source .env.staging

# Build
pnpm build
```

### 3. Deploy

```bash
# Via Vercel
vercel --env staging

# Via Netlify
netlify deploy --prod

# Ou script automatizado
./scripts/deploy-staging.sh
```

---

## 🆘 TROUBLESHOOTING

### "Cannot connect to Supabase"

**Solução:** Verificar se credenciais estão corretas
```bash
# Ver valor atual
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Re-carregar .env.local
source .env.local
```

### "Migration already applied"

**Isso é NORMAL!** Significa que o banco já tem as migrations.

### "RLS policy prevents access"

**Solução:** Verificar se está usando a chave correta:
- Frontend: `VITE_SUPABASE_ANON_KEY`
- Backend/Admin: `SUPABASE_SERVICE_ROLE_KEY`

### "Port 5173 already in use"

**Solução:** Matar processo anterior
```bash
lsof -ti:5173 | xargs kill -9
pnpm dev
```

---

## 💡 DICAS

1. **Sempre use `source .env.local`** antes de rodar comandos que dependem de env vars

2. **Não commite .env.local** no Git (já está no .gitignore)

3. **Para desenvolvimento rápido:**
   ```bash
   # Terminal 1: Frontend
   pnpm dev
   
   # Terminal 2: Backend (se necessário)
   pnpm dev:server
   ```

4. **Para debug de Supabase:**
   - Console do navegador (F12)
   - Network tab para ver requisições
   - Supabase Dashboard → Logs

---

## 🎉 RESUMO

Como você **JÁ TEM** o Supabase configurado:

1. ✅ Obter credenciais do dashboard (2 min)
2. ✅ Criar `.env.local` (1 min)
3. ✅ Testar conexão (1 min)
4. ✅ `pnpm dev` (1 min)

**Total: ~5 minutos para estar rodando! 🚀**

---

**ICARUS v5.0.1 - Sistema Enterprise OPME**  
**Powered by AI • Built with ❤️ • Made in Brazil 🇧🇷**

---

*Documento atualizado em: 28 de Outubro de 2025*  
*Project Ref: ttswvavcisdnonytslom*

