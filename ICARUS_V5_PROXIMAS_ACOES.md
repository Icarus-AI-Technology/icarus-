# 🚀 ICARUS v5.0 — Próximas Ações para Produção

**Data**: 27 de Outubro de 2025  
**Status**: Pronto para Deploy  
**Tempo estimado**: 45-60 minutos

---

## 🎯 Objetivo

Levar o ICARUS v5.0 para produção com segurança e validação completa.

---

## 📋 Checklist de Pré-Deploy

### ✅ Já Completado

- [x] Estrutura de agentes configurada
- [x] Scripts de automação criados
- [x] Cobertura de testes expandida (7%)
- [x] Políticas RLS geradas
- [x] Ambiente de produção preparado
- [x] Dependências instaladas (1.120 pacotes)
- [x] Documentação completa (166 KB)
- [x] Deno instalado

### ⚠️ Aguardando Execução

- [ ] Configurar valores reais no .env.prod
- [ ] Obter credenciais Supabase
- [ ] Revisar e ajustar políticas RLS
- [ ] Aplicar migração RLS
- [ ] Build de produção
- [ ] Deploy Vercel
- [ ] Testes pós-deploy

---

## 🔐 Ação 1: Obter Credenciais (15 min)

### 1.1 Supabase

```bash
# 1. Acesse o dashboard
open https://supabase.com/dashboard

# 2. Selecione ou crie um projeto
# 3. Navegue para: Settings → API
# 4. Copie:
#    - Project URL (ex: https://abcdefghijk.supabase.co)
#    - anon public key (ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
```

**Salvar para uso**:

```bash
# Guardar temporariamente
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_ANON="eyJhbGciOiJIUzI1NiIs..."
```

### 1.2 Meilisearch (Opcional)

**Opção A: Cloud (Recomendado)**

```bash
# 1. Acesse https://cloud.meilisearch.com
# 2. Crie projeto
# 3. Copie URL e Master Key

export MEILI_URL="https://ms-xxxxx.meilisearch.io"
export MEILI_KEY="sua-master-key"
```

**Opção B: Local (Dev)**

```bash
export MEILI_URL="http://localhost:7700"
```

### 1.3 Ollama/IA (Opcional)

**Opção A: Replicate**

```bash
# 1. Acesse https://replicate.com
# 2. Account → API Tokens
# 3. Copie token

export OLLAMA_URL="https://api.replicate.com"
export OLLAMA_TOKEN="r8_seu-token"
```

**Opção B: Local**

```bash
export OLLAMA_URL="http://localhost:11434"
```

---

## 🔧 Ação 2: Configurar .env.prod (10 min)

### 2.1 Editar Arquivo

```bash
cd /Users/daxmeneghel/icarus-v5.0/
nano .env.prod
```

### 2.2 Template Completo

```bash
# ============================================
# ICARUS v5.0 - PRODUÇÃO
# ============================================

# Ambiente
VITE_ENVIRONMENT=production
NODE_ENV=production

# ============================================
# SUPABASE (Obrigatório)
# ============================================
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# MEILISEARCH (Opcional - use localhost se não tiver cloud)
# ============================================
VITE_MEILISEARCH_URL=http://localhost:7700
# VITE_MEILISEARCH_KEY=sua-master-key

# ============================================
# OLLAMA/IA (Opcional - use localhost se não tiver cloud)
# ============================================
VITE_OLLAMA_URL=http://localhost:11434
# VITE_OLLAMA_TOKEN=seu-token

# ============================================
# EMAIL/SMTP (Opcional - configurar depois)
# ============================================
# VITE_SMTP_HOST=smtp.sendgrid.net
# VITE_SMTP_PORT=587

# ============================================
# FEATURES
# ============================================
VITE_ENABLE_AI=true
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_SEARCH=true
```

### 2.3 Validar (Dev)

```bash
# Voltar para dev para usar ferramenta de validação
cd /Users/daxmeneghel/icarus-make/

# Validar
node tools/env/validate-env.js /Users/daxmeneghel/icarus-v5.0/.env.prod

# Deve retornar: ✅ Todas as variáveis obrigatórias estão presentes!
```

---

## 🔒 Ação 3: Revisar e Aplicar RLS (15 min)

### 3.1 Fazer Backup do Banco

```bash
# IMPORTANTE: Sempre fazer backup antes!
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Verificar backup criado
ls -lh backup_*.sql
```

### 3.2 Revisar Migração RLS

```bash
cd /Users/daxmeneghel/icarus-make/

# Visualizar migração
cat supabase/migrations/20251027013614_enable_rls_critical_tables.sql | less

# Principais tabelas protegidas:
# - usuarios, medicos, hospitais
# - cirurgias, materiais_opme
# - leads, transacoes, fornecedores
# - pedidos_compra, faturas
# - pacientes, profiles, audit_log
```

### 3.3 Aplicar Migração

**Método 1: CLI (Recomendado)**

```bash
# Adicionar Deno ao PATH (se necessário)
export PATH="$HOME/.deno/bin:$PATH"

# Verificar versão
deno --version

# Link ao projeto Supabase
supabase link --project-ref seu-projeto-id

# Aplicar migração
supabase db push

# Verificar aplicação
supabase db diff
```

**Método 2: Dashboard (Alternativa)**

```bash
# 1. Copiar SQL
cat supabase/migrations/20251027013614_enable_rls_critical_tables.sql | pbcopy

# 2. Abrir Supabase Dashboard
open https://supabase.com/dashboard/project/seu-projeto-id/sql

# 3. SQL Editor → New Query
# 4. Colar SQL
# 5. Run (botão verde)
# 6. Verificar: Success! ✅
```

### 3.4 Testar RLS

```bash
# No Supabase Dashboard → SQL Editor
# Executar testes:

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('usuarios', 'medicos', 'pacientes');
-- Deve retornar rowsecurity = true

-- Listar políticas
SELECT * FROM pg_policies
WHERE tablename IN ('usuarios', 'medicos');
-- Deve retornar as 4 políticas por tabela
```

---

## 🏗️ Ação 4: Build de Produção (10 min)

### 4.1 Build Local

```bash
cd /Users/daxmeneghel/icarus-v5.0/

# Type-check
pnpm type-check
# Deve passar sem erros

# Lint
pnpm lint
# Deve passar sem erros

# Build
pnpm build
# Deve gerar dist/
```

### 4.2 Verificar Output

```bash
# Verificar tamanho do build
du -sh dist/
# Deve ser ~5-10 MB

# Listar arquivos gerados
ls -lh dist/assets/

# Verificar index.html
cat dist/index.html | grep -i "vite"
```

### 4.3 Preview Local

```bash
# Iniciar preview
pnpm preview

# Abrir navegador
open http://localhost:4173

# Testar:
# ✅ Homepage carrega
# ✅ Assets carregam (CSS, JS, imagens)
# ✅ Console sem erros
# ✅ Navegação funciona
```

---

## ☁️ Ação 5: Deploy Vercel (10 min)

### 5.1 Instalar Vercel CLI

```bash
# Se não tiver instalado
npm i -g vercel

# Verificar
vercel --version
```

### 5.2 Login e Setup

```bash
# Login
vercel login
# Seguir instruções no navegador

# Ir para diretório de produção
cd /Users/daxmeneghel/icarus-v5.0/
```

### 5.3 Deploy Preview (Teste)

```bash
# Deploy de teste (não é produção ainda)
vercel

# Vercel vai perguntar:
# ? Set up and deploy "~/icarus-v5.0"? [Y/n] y
# ? Which scope? [selecione sua conta]
# ? Link to existing project? [N/y] n
# ? What's your project's name? icarus-v5
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n

# Aguardar build e deploy
# URL de preview: https://icarus-v5-xxxxx.vercel.app
```

### 5.4 Configurar Environment Variables

```bash
# Adicionar variáveis uma por uma
vercel env add VITE_SUPABASE_URL production
# Colar: https://seu-projeto.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Colar: eyJhbGciOiJIUzI1NiIs...

vercel env add VITE_MEILISEARCH_URL production
# Colar: http://localhost:7700 (ou cloud URL)

vercel env add VITE_OLLAMA_URL production
# Colar: http://localhost:11434 (ou cloud URL)

vercel env add VITE_ENVIRONMENT production
# Colar: production

# Confirmar
vercel env ls
```

### 5.5 Deploy Produção

```bash
# Deploy final em produção
vercel --prod

# Aguardar...
# ✅ Production: https://icarus-v5.vercel.app
```

---

## ✅ Ação 6: Validação Pós-Deploy (10 min)

### 6.1 Testes Básicos

```bash
# URL de produção
PROD_URL="https://icarus-v5.vercel.app"

# 1. Homepage
curl -I $PROD_URL
# Deve retornar: 200 OK

# 2. Assets
curl -I $PROD_URL/assets/index-xxx.js
# Deve retornar: 200 OK

# 3. Abrir navegador
open $PROD_URL
```

### 6.2 Checklist Manual

Abrir **DevTools** (F12) e testar:

```
✅ Funcionalidade                     Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Homepage carrega sem erros        ___
[ ] Console limpo (sem erros)         ___
[ ] Network: Todos assets 200 OK      ___
[ ] Supabase conectado                ___
[ ] Login funciona                    ___
[ ] Dashboard exibe dados             ___
[ ] Navegação entre páginas           ___
[ ] Busca retorna resultados          ___
[ ] Forms submetem dados              ___
[ ] RLS protege dados corretamente    ___
[ ] Performance: LCP < 3s             ___
[ ] Mobile responsivo                 ___
```

### 6.3 Testes de Performance

```bash
# Lighthouse
npx lighthouse $PROD_URL \
  --output=html \
  --output-path=./lighthouse-prod.html \
  --view

# Metas:
# Performance: > 80
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

### 6.4 Monitorar Logs

```bash
# Logs Vercel (em tempo real)
vercel logs --follow

# Logs Supabase
# Dashboard → Logs → API/Database

# Procurar por:
# ❌ Erros 500
# ❌ Permission denied (RLS)
# ❌ Connection errors
```

---

## 🎯 Ação 7: Configurações Finais (Opcional)

### 7.1 Domínio Customizado

```bash
# Adicionar domínio
vercel domains add seu-dominio.com

# Configurar DNS (no seu provedor):
# Type: CNAME
# Name: @
# Value: cname.vercel-dns.com
# TTL: Auto

# Aguardar propagação (5-10 min)
# Verificar: https://seu-dominio.com
```

### 7.2 Analytics

```bash
# Habilitar Vercel Analytics
# Dashboard → Analytics → Enable

# Ou via CLI
vercel --prod --enable-analytics
```

### 7.3 Monitoramento

```bash
# Configurar alertas
# Dashboard → Settings → Notifications
# - Deployment Failed
# - Error Rate Spike
# - Performance Degradation
```

---

## 🚨 Troubleshooting

### Build Falha

```bash
# Verificar logs
vercel logs

# Testar localmente
cd /Users/daxmeneghel/icarus-v5.0/
pnpm build

# Verificar errors
pnpm type-check
pnpm lint
```

### RLS Bloqueando Acesso

```bash
# Verificar políticas
# Supabase Dashboard → Authentication → Policies

# Testar com usuário admin
# SQL Editor:
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'admin-uuid';
SELECT * FROM usuarios;
```

### Variáveis Não Carregam

```bash
# Verificar se têm VITE_ prefix
vercel env ls

# Re-adicionar se necessário
vercel env rm VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_URL production

# Redeployar
vercel --prod
```

---

## 📊 Checklist Final

```
✅ Ação                                      Status  Tempo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] 1. Obter credenciais Supabase           ___     15min
[ ] 2. Configurar .env.prod                 ___     10min
[ ] 3. Backup do banco                      ___     2min
[ ] 4. Aplicar migração RLS                 ___     5min
[ ] 5. Build de produção                    ___     5min
[ ] 6. Deploy Vercel (preview)              ___     5min
[ ] 7. Configurar env vars Vercel           ___     5min
[ ] 8. Deploy produção                      ___     3min
[ ] 9. Validação pós-deploy                 ___     10min
[ ] 10. Testes de performance               ___     5min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total estimado:                                     60min
```

---

## 🎉 Conclusão

Após completar todas essas ações, você terá:

- ✅ Sistema em produção
- ✅ RLS protegendo dados
- ✅ Monitoramento ativo
- ✅ Performance validada
- ✅ Logs acessíveis

---

## 📞 Comandos de Referência

```bash
# Status do projeto
vercel ls

# Logs em tempo real
vercel logs --follow

# Rollback (se necessário)
vercel rollback

# Redeployar
vercel --prod

# Ver env vars
vercel env ls

# Ver domínios
vercel domains ls
```

---

## 🔗 Links Úteis

- 📖 [Guia de Deployment](./ICARUS_V5_GUIA_DEPLOYMENT.md)
- 🔒 [Guia RLS](./ICARUS_V5_GUIA_RLS.md)
- 🔐 [Guia ENV](./ICARUS_V5_GUIA_ENV_PROD.md)
- 📊 [Relatório Final](./ICARUS_V5_RELATORIO_FINAL.md)

---

**Status**: ✅ Pronto para executar  
**Tempo**: 45-60 minutos  
**Risco**: Baixo (tudo documentado)  
**Próximo**: Obter credenciais Supabase
