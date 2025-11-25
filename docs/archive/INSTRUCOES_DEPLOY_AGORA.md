# ✅ DEPLOY PREVIEW - INSTRUÇÕES FINAIS

**Projeto:** ICARUS NEWORTHO v5.0.0  
**Status:** 🟢 Pronto para deploy  
**Tempo estimado:** 15 minutos

---

## 🎯 Resumo

Você solicitou fazer o **Deploy para Vercel Preview**. Tudo está pronto!

---

## 🚀 Comandos para Executar AGORA

### 1. Login no Vercel (1 minuto)

```bash
npx vercel login
```

- Escolha o método de login (GitHub recomendado)
- Autorize no navegador
- Aguarde confirmação

### 2. Deploy Preview (2-3 minutos)

```bash
cd /Users/daxmeneghel/icarus-make
npx vercel --prod=false
```

**O Vercel vai perguntar:**
- "Set up and deploy?" → **Yes**
- "Which scope?" → Selecione sua conta
- "Link to existing project?" → **No** (primeira vez)
- "What's your project's name?" → `icarus-newortho`
- "In which directory is your code located?" → **.**

**Depois vai:**
- ✅ Fazer upload dos arquivos
- ✅ Instalar dependências
- ✅ Executar build
- ✅ Fazer deploy
- ✅ Retornar URL do preview

---

## ⚠️ IMPORTANTE: Environment Variables

### Opção A: Durante o Deploy (CLI)

Quando o Vercel perguntar sobre environment variables:

```bash
# OBRIGATÓRIO
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# RECOMENDADO
VITE_APP_URL=https://icarus-newortho.vercel.app
VITE_APP_ENV=production
```

### Opção B: Depois do Deploy (Dashboard)

1. Acesse: https://vercel.com/dashboard
2. Selecione projeto `icarus-newortho`
3. Vá em **Settings** → **Environment Variables**
4. Adicione as variáveis acima
5. Re-deploy: `npx vercel --prod=false --force`

---

## 📋 Checklist Pós-Deploy

Quando receber a URL (ex: `https://icarus-make-abc123.vercel.app`):

### Testes Básicos
- [ ] Abrir a URL no navegador
- [ ] Verificar se página carrega
- [ ] Abrir DevTools (F12) e verificar se não há erros no console
- [ ] Verificar se styles carregam corretamente

### Testes de Navegação
- [ ] Clicar nos menus
- [ ] Testar navegação entre páginas
- [ ] Verificar se sidebar/topbar funcionam

### Testes de Funcionalidades
- [ ] Dashboard principal carrega
- [ ] Formulário de contato funciona (POST para /api/contact)
- [ ] Se configurou Supabase: Login/Logout funciona

### Performance
- [ ] Executar Lighthouse (Chrome DevTools → Lighthouse)
- [ ] Verificar score > 80

---

## 🔧 Se Algo der Errado

### Erro: Build falhou

```bash
# Ver logs detalhados
npx vercel logs [URL-do-deploy]

# Testar build localmente
pnpm run build

# Re-deploy com força
npx vercel --prod=false --force
```

### Erro: 404 nas rotas

Verificar `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Erro: Environment variables não carregam

- Verificar que começam com `VITE_`
- Adicionar via dashboard
- Re-deploy depois

---

## 🎉 Após Deploy Bem-Sucedido

### Se funcionou ✅

1. **Testar tudo** (checklist acima)
2. **Fazer Lighthouse audit**
3. **Deploy produção:**
   ```bash
   npx vercel --prod
   ```
4. **Configurar domínio customizado** (opcional)
5. **Ativar Vercel Analytics**

### Se falhou ❌

1. Ver logs: `npx vercel logs`
2. Corrigir erros
3. Testar localmente
4. Re-deploy

---

## 📚 Documentação Completa

- **Guia Detalhado:** `GUIA_DEPLOY_VERCEL_PREVIEW.md`
- **Troubleshooting:** Ver guia completo
- **Comandos úteis:** Ver guia completo

---

## ✨ Comando Final

**Execute agora no terminal:**

```bash
npx vercel login
```

**Depois:**

```bash
npx vercel --prod=false
```

**Boa sorte! 🚀**

---

**Nota:** Se precisar de ajuda durante o deploy, o Vercel CLI é interativo e vai guiá-lo através do processo. Apenas responda as perguntas e aguarde o deploy concluir.

**Tempo total estimado:** 15 minutos (incluindo testes)

