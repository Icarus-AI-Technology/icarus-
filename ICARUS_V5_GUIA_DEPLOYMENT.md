# 🚀 ICARUS v5.0 — Guia Completo de Deployment

**Data**: 27 de Outubro de 2025  
**Versão**: 1.0.0  
**Ambiente**: Produção (Vercel + Supabase)

---

## ✅ Status de Preparação

### Completado ✅

- [x] Deno instalado (Supabase CLI)
- [x] Migração Dev → Prod executada
- [x] Dependências instaladas (1120 pacotes)
- [x] Estrutura de produção validada
- [x] Migração RLS gerada
- [x] Guias de configuração criados
- [x] Scripts de automação prontos

### Aguardando Configuração ⚠️

- [ ] Substituir valores no `.env.prod`
- [ ] Aplicar migração RLS no Supabase
- [ ] Configurar domínio na Vercel
- [ ] Configurar secrets na Vercel

---

## 📋 Pré-requisitos

### Contas e Acessos

- ✅ Conta Vercel (deploy)
- ✅ Projeto Supabase (database)
- ⚠️ Conta Meilisearch (search) - opcional
- ⚠️ Conta Ollama/Replicate (IA) - opcional

### Ferramentas Instaladas

- ✅ Node.js v22.20.0
- ✅ pnpm 10.19.0
- ✅ Deno 2.5.4
- ✅ Git

---

## 🔐 Passo 1: Configurar Variáveis de Ambiente

### 1.1 Obter Credenciais do Supabase

```bash
# 1. Acesse https://supabase.com/dashboard
# 2. Selecione seu projeto
# 3. Settings → API
# 4. Copie:
#    - Project URL
#    - anon public key
```

### 1.2 Editar .env.prod

```bash
cd /Users/daxmeneghel/icarus-v5.0/
nano .env.prod
```

**Substituir**:

```bash
# ANTES
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# DEPOIS
VITE_SUPABASE_URL=https://seu-projeto-real.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.3 Validar .env.prod

```bash
# Voltar para dev
cd /Users/daxmeneghel/icarus-make/

# Validar
node tools/env/validate-env.js /Users/daxmeneghel/icarus-v5.0/.env.prod
```

---

## 🔒 Passo 2: Aplicar Migração RLS

### 2.1 Revisar Migração

```bash
cd /Users/daxmeneghel/icarus-make/
cat supabase/migrations/20251027013614_enable_rls_critical_tables.sql
```

### 2.2 Aplicar via Supabase CLI

```bash
# Fazer backup primeiro
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql

# Aplicar migração
supabase db push

# Verificar
supabase db diff
```

### 2.3 Aplicar via Dashboard (Alternativa)

```bash
# 1. Copiar conteúdo da migração
cat supabase/migrations/20251027013614_enable_rls_critical_tables.sql | pbcopy

# 2. Acessar: https://supabase.com/dashboard
# 3. SQL Editor → New Query
# 4. Colar SQL → Run
```

---

## 🏗️ Passo 3: Build de Produção

### 3.1 Executar Build

```bash
cd /Users/daxmeneghel/icarus-v5.0/

# Build
pnpm build

# Verificar output
ls -lh dist/
```

### 3.2 Preview Local

```bash
pnpm preview

# Acessar: http://localhost:4173
# Testar funcionalidades críticas:
# - Login
# - Dashboard
# - Navegação
# - Busca
```

### 3.3 Testes Automatizados

```bash
# Type-check
pnpm type-check

# Lint
pnpm lint

# Testes unitários (se houver)
pnpm test
```

---

## ☁️ Passo 4: Deploy na Vercel

### 4.1 Via CLI (Recomendado)

```bash
# Instalar Vercel CLI (se necessário)
npm i -g vercel

# Login
vercel login

# Deploy preview (teste primeiro)
cd /Users/daxmeneghel/icarus-v5.0/
vercel

# Deploy production
vercel --prod
```

### 4.2 Configurar Environment Variables

```bash
# Adicionar variáveis
vercel env add VITE_SUPABASE_URL production
# Colar valor: https://seu-projeto.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Colar valor: eyJhbGciOiJIUzI1N...

vercel env add VITE_MEILISEARCH_URL production
vercel env add VITE_OLLAMA_URL production
vercel env add VITE_ENVIRONMENT production
```

### 4.3 Via Dashboard (Alternativa)

```bash
# 1. Conectar repositório Git
# 2. Import project
# 3. Configure:
#    - Framework Preset: Vite
#    - Build Command: pnpm build
#    - Output Directory: dist
#    - Install Command: pnpm install --frozen-lockfile
# 4. Environment Variables → Add
# 5. Deploy
```

---

## 🔍 Passo 5: Validação Pós-Deploy

### 5.1 Checklist de Funcionalidades

```bash
# URL de produção
PROD_URL="https://seu-app.vercel.app"

# Testar endpoints
curl $PROD_URL # Deve retornar 200
curl $PROD_URL/api/health # Health check
```

### 5.2 Testes Manuais

- [ ] ✅ Homepage carrega
- [ ] ✅ Login funciona
- [ ] ✅ Dashboard exibe dados
- [ ] ✅ Navegação funciona
- [ ] ✅ Busca retorna resultados (se configurado)
- [ ] ✅ Forms submetem dados
- [ ] ✅ RLS protege dados corretamente
- [ ] ✅ Performance aceitável (< 3s LCP)
- [ ] ✅ Mobile responsivo

### 5.3 Monitoramento

```bash
# Logs Vercel
vercel logs --prod

# Logs Supabase
# Dashboard → Logs → Database/API
```

---

## 🐛 Troubleshooting

### Erro: "Build failed"

```bash
# Verificar logs
vercel logs

# Build local
cd /Users/daxmeneghel/icarus-v5.0/
pnpm build

# Verificar erros de type
pnpm type-check
```

### Erro: "Supabase connection failed"

```bash
# Verificar variáveis
vercel env ls

# Testar conexão
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
     "$VITE_SUPABASE_URL/rest/v1/"
```

### Erro: "RLS blocking access"

```bash
# Verificar políticas
supabase db diff

# Ver logs de acesso negado
# Dashboard Supabase → Logs → "permission denied"

# Ajustar políticas se necessário
```

### Performance Lenta

```bash
# Verificar Lighthouse
npx lighthouse https://seu-app.vercel.app \
  --output=html \
  --output-path=./lighthouse-report.html

# Otimizar:
# - Code splitting
# - Image optimization
# - Cache headers
```

---

## 📊 Passo 6: Configurações Avançadas

### 6.1 Domínio Customizado

```bash
# Via CLI
vercel domains add seu-dominio.com

# Configurar DNS:
# Type: CNAME
# Name: @
# Value: cname.vercel-dns.com
```

### 6.2 SSL/TLS

```bash
# Vercel provisiona automaticamente
# Let's Encrypt SSL

# Verificar
curl -I https://seu-dominio.com
```

### 6.3 Analytics

```bash
# Vercel Analytics (grátis)
# Dashboard → Analytics → Enable

# PostHog (opcional)
vercel env add VITE_POSTHOG_KEY production
```

### 6.4 Edge Functions

```bash
# Se usar Edge Functions
vercel deploy --prod --edge-config

# Configurar limites
# Dashboard → Settings → Edge Functions
```

---

## 🔄 Passo 7: CI/CD (Opcional mas Recomendado)

### 7.1 GitHub Actions

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      - uses: pnpm/action-setup@v4

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

---

## 📈 Métricas de Sucesso

### Performance

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **TTI**: < 3.5s

### Disponibilidade

- **Uptime**: > 99.9%
- **TTFB**: < 600ms
- **Error Rate**: < 1%

### Funcionalidade

- **Todas rotas**: 200 OK
- **Auth**: Login/Logout funcionando
- **RLS**: Dados protegidos
- **Search**: Resultados corretos

---

## 🎉 Checklist Final

### Antes do Go-Live

- [ ] ✅ Build passa sem erros
- [ ] ✅ Testes automatizados passam
- [ ] ✅ RLS aplicado e testado
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Preview testado
- [ ] ✅ Performance verificada
- [ ] ✅ Mobile testado
- [ ] ✅ Backup do banco criado
- [ ] ✅ Domínio configurado (opcional)
- [ ] ✅ Equipe notificada

### Após Go-Live

- [ ] 📊 Monitoring ativo
- [ ] 🔔 Alerts configurados
- [ ] 📝 Documentação atualizada
- [ ] 👥 Usuários notificados
- [ ] 🐛 Bug tracker preparado

---

## 📞 Suporte

### Recursos

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev

### Logs e Debugging

```bash
# Logs Vercel
vercel logs --prod --follow

# Logs Supabase
# Dashboard → Logs

# Browser DevTools
# Console, Network, Performance
```

---

## 🚨 Rollback

Se algo der errado:

```bash
# Rollback Vercel
vercel rollback

# Rollback Supabase
psql < backup_YYYYMMDD_HHMMSS.sql

# Restaurar RLS
# SQL Editor → DROP POLICY ... / DISABLE RLS
```

---

**Status**: ✅ Pronto para Deploy  
**Próximo**: Executar Passo 1  
**Tempo estimado**: 30-45 minutos  
**Risco**: Baixo (com backup e testes)
