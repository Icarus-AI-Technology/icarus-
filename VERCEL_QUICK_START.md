# 🚀 ICARUS - VERCEL DEPLOY VIA CURSOR

> **Status:** ✅ Pronto para Deploy  
> **Versão:** 1.0.0  
> **Última atualização:** 26/10/2025

---

## ⚡ QUICK START (2 Minutos)

```bash
# 1. Login no Vercel (apenas uma vez)
npx vercel login

# 2. Deploy preview (para testes)
pnpm deploy:vercel

# 3. Deploy produção (quando pronto)
pnpm deploy:vercel:prod
```

**Pronto! Seu sistema estará no ar em ~3 minutos! 🎉**

---

## 📋 COMANDOS DISPONÍVEIS

```bash
# Deploy preview com verificações completas
pnpm deploy:vercel

# Deploy preview sem verificações (mais rápido)
pnpm deploy:vercel:skip

# Deploy produção
pnpm deploy:vercel:prod

# Ajuda
pnpm vercel:help

# Login no Vercel
npx vercel login

# Ver quem está logado
npx vercel whoami
```

---

## 🔐 AUTENTICAÇÃO

### Opção 1: Login Interativo (RECOMENDADO)

```bash
npx vercel login
```

### Opção 2: Token de Ambiente

```bash
# Obter em: https://vercel.com/account/tokens
export VERCEL_TOKEN="v1_seu_token_aqui"
```

---

## 🌐 VARIÁVEIS NO VERCEL DASHBOARD

Configure em: https://vercel.com/dashboard → Projeto → Settings → Environment Variables

```env
# Obrigatórias
VITE_SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=https://icarus-newortho.vercel.app
NODE_ENV=production
```

⚠️ **Importante:** Após adicionar variáveis, faça **Redeploy**!

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **[VERCEL_DEPLOY_RELATORIO_FINAL.md](./VERCEL_DEPLOY_RELATORIO_FINAL.md)** - Relatório completo
- **[VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)** - Guia detalhado de uso
- **[VERCEL_TOKEN_GUIDE.md](./VERCEL_TOKEN_GUIDE.md)** - Guia de autenticação
- **[VERCEL_ENV_COMPLETO.md](./VERCEL_ENV_COMPLETO.md)** - Variáveis de ambiente

---

## 🎯 VERIFICAÇÕES AUTOMÁTICAS

O script executa automaticamente:

✅ Pré-requisitos (Node, pnpm, Git, Vercel CLI)  
✅ TypeScript check  
✅ Build de produção  
✅ Análise de status Git  
✅ Verificação de .env

---

## 📊 O QUE FOI CRIADO

```
📁 Estrutura
├── .cursor/scripts/deploy-vercel.js  # Script automatizado
├── api/contact.ts                     # API serverless
├── vercel.json                        # Config otimizada
├── VERCEL_DEPLOY_*.md                 # 4 guias completos
└── package.json                       # 5 novos scripts
```

---

## 🚀 FLUXO DE DEPLOY

```
pnpm deploy:vercel
    ↓
✅ Verificações automáticas
    ↓
✅ TypeScript check
    ↓
✅ Build produção
    ↓
✅ Deploy Vercel
    ↓
🎉 Site no ar!
```

---

## 🐛 PROBLEMAS COMUNS

### ❌ Token Inválido

```bash
# Solução: Use login interativo
npx vercel login
```

### ❌ Build Failed

```bash
# Teste local primeiro
pnpm run build
pnpm run type-check
```

### ❌ Supabase Not Initialized

```bash
# Adicione variáveis no Dashboard Vercel
# Depois: Redeploy
```

---

## 📦 RECURSOS

### Script de Deploy

- ✅ 300+ linhas de código
- ✅ Logs coloridos
- ✅ Validações completas
- ✅ Error handling robusto

### API Serverless

- ✅ POST `/api/contact`
- ✅ Validação de dados
- ✅ CORS configurado
- ✅ TypeScript tipado

### Segurança

- ✅ Headers HTTP configurados
- ✅ Token protegido
- ✅ CORS restrito

---

## 🎯 PRÓXIMOS PASSOS

1. **Login:**

   ```bash
   npx vercel login
   ```

2. **Deploy Preview:**

   ```bash
   pnpm deploy:vercel
   ```

3. **Configurar Variáveis:**
   - Dashboard Vercel
   - Adicionar 4 variáveis obrigatórias
   - Redeploy

4. **Testar:**
   - Acessar URL de deploy
   - Testar login
   - Validar funcionalidades

5. **Deploy Produção:**
   ```bash
   pnpm deploy:vercel:prod
   ```

---

## 💡 DICAS

- Use `pnpm deploy:vercel:skip` para deploys rápidos
- Configure domínio customizado no Dashboard
- Monitore logs em tempo real: `npx vercel logs -f`
- Veja todos os deploys: `npx vercel ls`

---

## 📞 SUPORTE

- **Dashboard:** https://vercel.com/dashboard
- **Docs:** https://vercel.com/docs
- **CLI Docs:** https://vercel.com/docs/cli

---

## ✅ TUDO PRONTO!

**Execute agora:**

```bash
npx vercel login && pnpm deploy:vercel
```

**Em ~5 minutos seu sistema estará no ar! 🚀**

---

_ICARUS v5.0.2 - Vercel Deploy Automation_  
_NEW ORTHO - Excelência em Gestão Hospitalar_
