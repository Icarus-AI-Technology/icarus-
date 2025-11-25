# 🔐 GUIA: OBTER TOKEN VERCEL VÁLIDO

**Data:** 26 de Outubro de 2025  
**Projeto:** ICARUS v5.0.2  
**Status:** Token inválido detectado

---

## ⚠️ PROBLEMA IDENTIFICADO

O token fornecido contém caracteres inválidos:

```
Token: zfkd#UIjNfz9lHXWsJOuQSnyx@nso02p&Rn_kJzA&15RzM
Erro: Must not contain: "#", "&", "@"
```

**Motivo:** Tokens Vercel válidos não contêm `#`, `&` ou `@`.

---

## ✅ SOLUÇÕES (3 Opções)

### OPÇÃO 1: Login Interativo (RECOMENDADO)

Mais simples e seguro para deploy via Cursor:

```bash
# 1. Fazer login no Vercel
npx vercel login

# 2. Seguir instruções no terminal
# - Email será solicitado
# - Verificação por email
# - Login automático

# 3. Após login, fazer deploy
pnpm deploy:vercel
```

**Vantagens:**

- ✅ Simples e rápido
- ✅ Seguro (sem token armazenado)
- ✅ Funciona imediatamente
- ✅ Ideal para desenvolvimento local

---

### OPÇÃO 2: Obter Token Válido do Dashboard

Para automação completa com token:

#### Passo 1: Acessar Vercel Dashboard

1. Vá para: https://vercel.com/account/tokens
2. Faça login se necessário

#### Passo 2: Criar Novo Token

1. Clique em **Create**
2. Nome: `icarus-cursor-deploy`
3. Scope: Selecione a organização/conta
4. Expiration:
   - `No Expiration` (mais prático)
   - Ou `Custom` com data futura
5. Clique em **Create Token**

#### Passo 3: Copiar Token

1. **IMPORTANTE:** Copie o token IMEDIATAMENTE
2. Ele será mostrado apenas UMA VEZ
3. Format: `v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxx` (sem `#`, `&`, `@`)

#### Passo 4: Configurar Token

**Via Variável de Ambiente:**

```bash
# macOS/Linux (.zshrc ou .bashrc)
echo 'export VERCEL_TOKEN="v1_seu_token_aqui"' >> ~/.zshrc
source ~/.zshrc

# Windows (PowerShell)
[Environment]::SetEnvironmentVariable("VERCEL_TOKEN", "v1_seu_token_aqui", "User")
```

**Via .env (Alternativa):**

```bash
# Criar/editar .env
echo 'VERCEL_TOKEN=v1_seu_token_aqui' >> .env
```

**Testar:**

```bash
pnpm deploy:vercel
# Deve fazer deploy sem pedir login
```

---

### OPÇÃO 3: Deploy Manual via Dashboard

Sem usar CLI:

#### Passo 1: Conectar Repositório

1. Acesse: https://vercel.com/new
2. **Import Git Repository**
3. Conecte GitHub: `Icarus-AI-Technology/icarus-newortho`
4. Clique em **Import**

#### Passo 2: Configurar Projeto

```
Framework Preset: Vite
Root Directory: ./
Build Command: pnpm run build
Output Directory: dist
Install Command: pnpm install --no-frozen-lockfile
```

#### Passo 3: Variáveis de Ambiente

Adicione ANTES do primeiro deploy:

```bash
VITE_SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=https://icarus-newortho.vercel.app
NODE_ENV=production
```

#### Passo 4: Deploy

1. Clique em **Deploy**
2. Aguarde ~3 minutos
3. ✅ Projeto no ar!

---

## 🚀 QUICK START (MÉTODO MAIS RÁPIDO)

Recomendado para começar agora:

```bash
# 1. Login uma vez
npx vercel login
# Verificar email e confirmar

# 2. Deploy preview
pnpm deploy:vercel

# 3. Se tudo OK, deploy produção
pnpm deploy:vercel:prod
```

**Tempo estimado:** 5 minutos

---

## 📋 COMANDOS DISPONÍVEIS

Após configurar autenticação:

```bash
# Deploy preview (testes)
pnpm deploy:vercel

# Deploy produção
pnpm deploy:vercel:prod

# Deploy rápido (pula checks)
pnpm deploy:vercel:skip

# Ajuda
pnpm vercel:help

# Login manual
npx vercel login

# Logout
npx vercel logout

# Ver whoami
npx vercel whoami

# Listar deploys
npx vercel ls
```

---

## 🔍 VERIFICAR TOKEN ATUAL

Se já tem um token:

```bash
# Ver token atual
echo $VERCEL_TOKEN

# Se vazio, não configurado
# Se contém #, &, @ → INVÁLIDO
# Se começa com v1_ → VÁLIDO

# Testar token
npx vercel whoami --token=$VERCEL_TOKEN
```

---

## 🐛 TROUBLESHOOTING

### Erro: "You defined --token, but its contents are invalid"

**Causa:** Token contém `#`, `&` ou `@`  
**Solução:** Use OPÇÃO 1 (Login) ou OPÇÃO 2 (Token novo)

### Erro: "Authentication required"

**Causa:** Não está logado  
**Solução:**

```bash
npx vercel login
```

### Erro: "No such file or directory: vercel"

**Causa:** Vercel CLI não instalado  
**Solução:**

```bash
pnpm add -D vercel
# ou
npm install -g vercel
```

### Erro: "Build failed"

**Causa:** Erros no código  
**Solução:**

```bash
# Testar build local
pnpm run build

# Ver erros
pnpm run type-check
```

---

## 📚 DOCUMENTAÇÃO OFICIAL

- **Vercel CLI:** https://vercel.com/docs/cli
- **Tokens:** https://vercel.com/docs/cli#commands/login
- **Authentication:** https://vercel.com/account/tokens
- **Deployments:** https://vercel.com/docs/deployments

---

## ✅ RECOMENDAÇÃO FINAL

**Para desenvolvimento local (Cursor):**

```bash
# Método mais simples:
npx vercel login
pnpm deploy:vercel
```

**Para CI/CD (GitHub Actions):**

```bash
# Criar token válido no dashboard
# Adicionar como secret: VERCEL_TOKEN
# Usar no workflow
```

**Para equipe:**

```bash
# Cada desenvolvedor faz login
npx vercel login

# Ou compartilhar token de projeto (não recomendado)
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Escolher método:** Login (5min) ou Token (10min)
2. **Configurar autenticação**
3. **Executar:** `pnpm deploy:vercel`
4. **Verificar:** https://vercel.com/dashboard
5. **Testar:** Acessar URL de deploy
6. **Configurar:** Variáveis de ambiente no dashboard
7. **Produção:** `pnpm deploy:vercel:prod`

---

**🔥 MÉTODO RECOMENDADO: OPÇÃO 1 - Login Interativo**

É o mais simples, seguro e rápido para começar agora!

---

_Guia criado em 26/10/2025_  
_ICARUS v5.0.2 - Agente Vercel Deploy_  
_NEW ORTHO - Excelência em Gestão Hospitalar_
