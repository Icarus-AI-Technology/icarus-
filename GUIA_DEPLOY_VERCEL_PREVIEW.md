# 🚀 GUIA DE DEPLOY - VERCEL PREVIEW

**Projeto:** ICARUS NEWORTHO v5.0.0  
**Data:** 17 de Novembro de 2025  
**Status:** Pronto para deploy

---

## ✅ Pré-requisitos Verificados

- ✅ Build funcionando (`pnpm run build`)
- ✅ TypeScript sem erros
- ✅ ESLint sem erros
- ✅ Vercel CLI disponível (v48.6.0 via npx)
- ✅ Configurações otimizadas

---

## 🚀 Passo a Passo - Deploy Preview

### Passo 1: Login no Vercel

```bash
npx vercel login
```

**Opções de login:**
- GitHub
- GitLab
- Bitbucket
- Email

**Recomendado:** Login via GitHub (mais rápido)

---

### Passo 2: Link do Projeto (Primeira vez)

```bash
npx vercel link
```

**O Vercel vai perguntar:**
1. "Set up and deploy?" → **Yes**
2. "Which scope?" → Selecione sua conta/team
3. "Link to existing project?" → **No** (se primeira vez)
4. "What's your project's name?" → `icarus-newortho` (ou outro nome)
5. "In which directory is your code located?" → `.` (diretório atual)

**Configurações detectadas automaticamente:**
- Framework: Vite
- Build Command: `pnpm run build`
- Output Directory: `dist`
- Install Command: `pnpm install --no-frozen-lockfile`

---

### Passo 3: Configurar Environment Variables

#### Opção A: Via Dashboard (Recomendado)

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `icarus-newortho`
3. Vá em **Settings** → **Environment Variables**
4. Adicione as variáveis:

```bash
# OBRIGATÓRIO
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# RECOMENDADO
VITE_APP_ENV=production
VITE_APP_URL=https://icarus-newortho.vercel.app
NODE_ENV=production

# OPCIONAL (se tiver)
VITE_API_GATEWAY_URL=
VITE_SENTRY_DSN=
VITE_POSTHOG_KEY=
VERCEL_ANALYTICS_ID=
```

5. Selecione os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

#### Opção B: Via CLI

```bash
# OBRIGATÓRIO
npx vercel env add VITE_SUPABASE_URL
# Cole o valor: https://seu-projeto.supabase.co

npx vercel env add VITE_SUPABASE_ANON_KEY
# Cole o valor: sua-chave-anon-aqui

# RECOMENDADO
npx vercel env add VITE_APP_URL
# Cole o valor: https://icarus-newortho.vercel.app
```

---

### Passo 4: Deploy Preview

```bash
# Deploy para preview (NÃO vai para produção)
npx vercel --prod=false

# OU use o comando mais curto:
npx vercel
```

**O que acontece:**
1. Vercel faz upload dos arquivos
2. Instala dependências (`pnpm install`)
3. Executa build (`pnpm run build`)
4. Faz deploy do `dist/`
5. Retorna a URL do preview

**Exemplo de URL:**
```
https://icarus-make-abc123xyz.vercel.app
```

**Tempo estimado:** 2-3 minutos

---

### Passo 5: Testar Preview

Quando o deploy concluir, acesse a URL fornecida e teste:

#### ✅ Checklist de Testes Manuais

**Carregamento Inicial:**
- [ ] Página carrega sem erros
- [ ] Sem erros no console (F12)
- [ ] Styles carregam corretamente
- [ ] Imagens/ícones aparecem

**Navegação:**
- [ ] Menu de navegação funciona
- [ ] Links internos funcionam
- [ ] Sidebar/Topbar funcionam
- [ ] Transições suaves

**Funcionalidades Principais:**
- [ ] Dashboard principal carrega
- [ ] Formulário de contato funciona
- [ ] Login/Logout funciona (se tiver Supabase configurado)
- [ ] Dados carregam (se tiver Supabase configurado)

**Performance:**
- [ ] Lighthouse Score > 80
- [ ] Carregamento < 3 segundos
- [ ] Sem lag na navegação

**Responsividade:**
- [ ] Mobile funciona
- [ ] Tablet funciona
- [ ] Desktop funciona

---

### Passo 6: Lighthouse Audit

```bash
# Executar Lighthouse no preview
npx lighthouse https://icarus-make-abc123xyz.vercel.app \
  --preset=desktop \
  --output=json \
  --output-path=./lighthouse-preview.json
```

**Métricas esperadas:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

---

### Passo 7: Deploy Produção (Após validar preview)

```bash
# Deploy para produção
npx vercel --prod

# OU com alias personalizado
npx vercel --prod --alias icarus-newortho
```

**ATENÇÃO:**
- ⚠️ Este comando vai para **PRODUÇÃO**
- ⚠️ Certifique-se de ter testado o preview
- ⚠️ Valide que não há erros críticos

---

## 🔧 Troubleshooting

### Problema: Build Falha

**Erro:** Build falhou no Vercel

**Soluções:**
1. Verificar logs no dashboard do Vercel
2. Garantir que `.nvmrc` ou `engines` em `package.json` especifica Node >=18
3. Verificar se todas as env vars obrigatórias estão configuradas
4. Testar build localmente: `pnpm run build`

### Problema: Environment Variables Não Carregam

**Erro:** Variáveis de ambiente undefined

**Soluções:**
1. Verificar que variáveis começam com `VITE_`
2. Verificar que foram adicionadas no ambiente correto (Preview/Production)
3. Re-deploy após adicionar vars: `npx vercel --prod=false --force`

### Problema: 404 em Rotas

**Erro:** Rotas retornam 404

**Solução:**
Verificar `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Problema: Build Timeout

**Erro:** Build ultrapassa limite de tempo

**Soluções:**
1. Otimizar chunks grandes
2. Implementar lazy loading
3. Verificar dependências não utilizadas
4. Usar plano Vercel Pro (limites maiores)

---

## 📊 Comandos Úteis

```bash
# Ver lista de deploys
npx vercel ls

# Ver logs de um deploy
npx vercel logs [URL]

# Remover um deployment
npx vercel rm [URL]

# Ver configuração do projeto
npx vercel inspect

# Promover preview para produção
npx vercel promote [URL]

# Ver environment variables
npx vercel env ls

# Pull env vars para local
npx vercel env pull .env.local
```

---

## 🎯 Próximos Passos Após Deploy

### Se Preview Funcionar ✅

1. Deploy para produção: `npx vercel --prod`
2. Configurar domínio customizado (se tiver)
3. Ativar Vercel Analytics
4. Configurar monitoring (Sentry, PostHog)
5. Implementar CI/CD com GitHub Actions

### Se Preview Falhar ❌

1. Verificar logs do build
2. Corrigir erros identificados
3. Testar build localmente
4. Re-deploy: `npx vercel --prod=false --force`

---

## 📚 Recursos

### Documentação
- [Vercel Docs](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Vite + Vercel](https://vercel.com/docs/frameworks/vite)

### Dashboard
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Domains](https://vercel.com/docs/custom-domains)

### Suporte
- [Vercel Support](https://vercel.com/support)
- [Community](https://github.com/vercel/vercel/discussions)

---

## ✨ Conclusão

Projeto **ICARUS NEWORTHO v5.0.0** está pronto para deploy!

**Próximo comando:**
```bash
npx vercel login
npx vercel --prod=false
```

Boa sorte com o deploy! 🚀

