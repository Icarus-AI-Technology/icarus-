# 🚀 ICARUS v5.0.1 - GUIA DE DEPLOYMENT COMPLETO

**Data:** 28 de Outubro de 2025  
**Versão:** 5.0.1 + CEO Intelligence Module  
**Status:** ✅ Production Ready

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Deploy Staging](#deploy-staging)
4. [Testes e Validação](#testes-e-validação)
5. [Deploy Produção](#deploy-produção)
6. [Monitoring e Alertas](#monitoring-e-alertas)
7. [Backup e Recovery](#backup-e-recovery)
8. [Troubleshooting](#troubleshooting)

---

## 1. Pré-requisitos

### Software Necessário

- [x] **Node.js** ≥ 18.0.0
- [x] **pnpm** ≥ 8.0.0
- [x] **Supabase CLI** ≥ 1.100.0
- [x] **Git** ≥ 2.30.0
- [x] **Docker** (opcional, para ambientes locais)

### Contas e Credenciais

- [ ] Conta Supabase (com projeto criado)
- [ ] Conta Vercel/Netlify (para frontend)
- [ ] Conta Sentry (para monitoring)
- [ ] Chaves de API externas:
  - [ ] ReceitaWS (CNPJ lookup)
  - [ ] Microsoft Graph API
  - [ ] Twilio (SMS/WhatsApp)
  - [ ] OpenAI (para IA)
  - [ ] Stripe (pagamentos)

---

## 2. Configuração do Ambiente

### 2.1. Clonar Repositório

```bash
git clone https://github.com/your-org/icarus-v5.0.git
cd icarus-v5.0
```

### 2.2. Instalar Dependências

```bash
pnpm install
```

### 2.3. Configurar Variáveis de Ambiente

#### Para Staging:

```bash
cp env.staging.example .env.staging
```

Edite `.env.staging` e preencha:

```env
# Supabase
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Sentry
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_ENVIRONMENT=staging

# APIs Externas (usar sandbox/test)
VITE_TWILIO_ACCOUNT_SID=ACtest...
TWILIO_AUTH_TOKEN=test...
OPENAI_API_KEY=sk-test...
```

#### Para Produção:

```bash
cp env.example .env.production
```

**⚠️ IMPORTANTE:** Use credenciais de **PRODUÇÃO** reais, não de teste!

### 2.4. Configurar Supabase

```bash
# Login no Supabase
supabase login

# Link ao projeto staging
supabase link --project-ref your-staging-project-ref
```

---

## 3. Deploy Staging

### 3.1. Executar Script Automatizado

```bash
chmod +x scripts/deploy-staging.sh
./scripts/deploy-staging.sh
```

O script irá:
1. ✅ Validar pré-requisitos
2. ✅ Instalar dependências
3. ✅ Rodar linting e type checking
4. ✅ Executar testes unitários
5. ✅ Build da aplicação
6. ✅ Aplicar migrations no Supabase
7. ✅ Deploy das Edge Functions
8. ✅ Deploy do frontend (Vercel/Netlify)
9. ✅ Health check

### 3.2. Deploy Manual (se necessário)

#### Build Frontend

```bash
cp .env.staging .env.local
pnpm build
```

#### Aplicar Migrations

```bash
supabase db push
```

#### Deploy Edge Functions

```bash
supabase functions deploy --project-ref your-project-ref
```

#### Deploy Frontend (Vercel)

```bash
vercel --prod --env staging
```

### 3.3. Verificar Deploy

Acesse: `https://staging.icarus.com.br`

Teste:
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Módulos principais acessíveis
- [ ] IA retorna respostas
- [ ] Notificações funcionam

---

## 4. Testes e Validação

### 4.1. Testes Unitários

```bash
pnpm test:unit
```

### 4.2. Testes E2E (Playwright)

```bash
pnpm test:e2e
```

Cobertura:
- ✅ Autenticação
- ✅ Módulo Cirurgias
- ✅ Módulo Financeiro
- ✅ Módulo Consignação
- ✅ IA e predições
- ✅ Notificações

### 4.3. Testes de Carga (k6)

```bash
k6 run scripts/load-testing.js
```

Métricas validadas:
- ✅ P95 < 500ms
- ✅ P99 < 1000ms
- ✅ Taxa de erro < 5%

### 4.4. Testes com Usuários Beta

Siga: [`docs/ops/BETA-TESTER-GUIDE.md`](./BETA-TESTER-GUIDE.md)

Objetivos:
- [ ] 5-10 usuários beta testarem por 2-4 semanas
- [ ] Coletar feedback estruturado
- [ ] Identificar bugs e melhorias de UX
- [ ] Validar fluxos críticos

---

## 5. Deploy Produção

### 5.1. Pré-Checklist de Produção

Antes de deployar em produção, **OBRIGATÓRIO**:

- [ ] ✅ Staging testado por pelo menos 2 semanas
- [ ] ✅ Todos os bugs críticos resolvidos
- [ ] ✅ NPS dos beta testers ≥ 8/10
- [ ] ✅ Performance validada (Lighthouse ≥ 90)
- [ ] ✅ Acessibilidade WCAG AA (100%)
- [ ] ✅ Compliance Abbott Score ≥ 98%
- [ ] ✅ Backup configurado e testado
- [ ] ✅ Monitoring ativo (Sentry)
- [ ] ✅ Alertas configurados
- [ ] ✅ Documentação atualizada
- [ ] ✅ Treinamento da equipe concluído
- [ ] ✅ Plano de rollback definido

### 5.2. Executar Deploy

```bash
# 1. Configurar variáveis de produção
cp .env.production .env.local

# 2. Build de produção
pnpm build

# 3. Link ao projeto de produção
supabase link --project-ref your-production-project-ref

# 4. Aplicar migrations (COM CUIDADO!)
supabase db push

# 5. Deploy Edge Functions
supabase functions deploy

# 6. Deploy frontend
vercel --prod

# 7. Verificar deploy
curl https://icarus.com.br/health
```

### 5.3. Smoke Tests Pós-Deploy

```bash
pnpm test:smoke-production
```

Validar:
- [ ] Homepage carrega
- [ ] Login funciona
- [ ] API responde
- [ ] Database conectado
- [ ] Edge Functions ativas
- [ ] Monitoring capturando eventos

### 5.4. Comunicação

**Enviar para:**
- ✅ Equipe interna (Slack/E-mail)
- ✅ Clientes beta (E-mail personalizado)
- ✅ Stakeholders (Relatório executivo)

**Conteúdo:**
- 🎉 Anúncio do lançamento
- 📋 Principais funcionalidades
- 📚 Link para documentação
- 🆘 Canal de suporte
- 📅 Agenda de treinamentos

---

## 6. Monitoring e Alertas

### 6.1. Configurar Sentry

Já configurado em `src/lib/sentry.ts`

**Verificar:**
- [ ] Erros sendo capturados
- [ ] Performance tracking ativo
- [ ] Session replay funcionando
- [ ] Alertas configurados

### 6.2. Configurar Alertas Críticos

**Via Sentry:**

1. Acesse: https://sentry.io/your-org/icarus/alerts/rules/
2. Criar regras:
   - **High Error Rate:** > 5% em 5 min → Slack + E-mail
   - **Critical Error:** Qualquer erro crítico → Imediato
   - **Performance Degradation:** P95 > 1s → Warning
   - **Database Down:** Supabase unreachable → URGENT

**Via Supabase:**

1. Acesse: Dashboard → Settings → Monitoring
2. Configurar:
   - **Database CPU > 80%:** Alert
   - **Storage > 90%:** Alert
   - **API Rate Limit:** Alert

### 6.3. Dashboard de Monitoring

Acessar:
- **Sentry:** https://sentry.io/your-org/icarus/
- **Supabase:** https://app.supabase.com/project/your-project/database
- **Vercel:** https://vercel.com/your-org/icarus

Monitorar:
- ✅ Error rate (< 1%)
- ✅ Response time (P95 < 500ms)
- ✅ Uptime (> 99.9%)
- ✅ Database performance
- ✅ API usage

---

## 7. Backup e Recovery

### 7.1. Backup Automático (Supabase)

Já configurado via Supabase:
- ✅ **Daily backups:** Retidos por 7 dias (staging) / 30 dias (prod)
- ✅ **Point-in-time recovery:** Últimas 24 horas (Pro plan)
- ✅ **Storage backups:** S3 replicado

### 7.2. Backup Manual (Semanal)

```bash
# Exportar schema
supabase db dump --schema public > backups/schema-$(date +%Y%m%d).sql

# Exportar dados críticos
supabase db dump --data-only --table=empresas,usuarios,cirurgias > backups/data-$(date +%Y%m%d).sql
```

### 7.3. Testar Recovery

**IMPORTANTE:** Testar recovery mensalmente!

```bash
# Em ambiente de staging
supabase db reset
supabase db restore backups/schema-20251028.sql
```

### 7.4. Plano de Disaster Recovery

**RTO (Recovery Time Objective):** 4 horas  
**RPO (Recovery Point Objective):** 1 hora

**Passos:**

1. **Detectar incidente:** Monitoring → Alerta
2. **Avaliar gravidade:** Crítico/Alto/Médio/Baixo
3. **Comunicar:** Time + Stakeholders
4. **Restaurar backup:** Último conhecido bom
5. **Validar:** Smoke tests
6. **Comunicar resolução:** Todos os canais

---

## 8. Troubleshooting

### 8.1. Problemas Comuns

#### ❌ Build falha com erro de TypeScript

```bash
# Limpar cache
rm -rf node_modules .next dist
pnpm install
pnpm build
```

#### ❌ Migrations falham no Supabase

```bash
# Verificar status
supabase migration list

# Reverter última migration
supabase migration down

# Re-aplicar
supabase db push
```

#### ❌ Edge Functions não respondem

```bash
# Ver logs
supabase functions logs cnpj-lookup --tail

# Re-deploy
supabase functions deploy cnpj-lookup
```

#### ❌ Frontend não conecta ao Supabase

1. Verificar `.env` (URLs e keys corretas)
2. Verificar CORS no Supabase Dashboard
3. Verificar RLS policies
4. Checar logs do browser (F12)

### 8.2. Logs e Debugging

**Frontend:**
```bash
# Vercel logs
vercel logs --follow

# Browser console
# F12 → Console
```

**Backend (Supabase):**
```bash
# Edge Functions
supabase functions logs <function-name> --tail

# Database
# Supabase Dashboard → Logs → Postgres Logs
```

**Sentry:**
- Acessar: https://sentry.io/your-org/icarus/issues/

### 8.3. Rollback de Emergência

**Se o deploy de produção falhar:**

```bash
# 1. Vercel: reverter para deploy anterior
vercel rollback

# 2. Supabase: reverter migrations
supabase migration down

# 3. Comunicar incidente
# Enviar para: #incidents, incidents@icarus.com.br

# 4. Investigar causa raiz
# Criar post-mortem
```

---

## 9. Pós-Deploy

### 9.1. Checklist Pós-Deploy

- [ ] ✅ Smoke tests passaram
- [ ] ✅ Monitoring ativo e capturando dados
- [ ] ✅ Alertas configurados
- [ ] ✅ Backup verificado
- [ ] ✅ Documentação atualizada
- [ ] ✅ Equipe treinada
- [ ] ✅ Clientes comunicados
- [ ] ✅ Suporte preparado

### 9.2. Métricas a Acompanhar (Primeira Semana)

- **Diariamente:**
  - [ ] Error rate
  - [ ] Response time
  - [ ] Uptime
  - [ ] Feedback de usuários

- **Semanalmente:**
  - [ ] NPS
  - [ ] Taxa de adoção
  - [ ] Uso de funcionalidades
  - [ ] Performance vs baseline

### 9.3. Retrospectiva

**Após 1 semana em produção:**

Reunir time e responder:
1. O que funcionou bem?
2. O que pode melhorar?
3. Surpresas/imprevistos?
4. Ações para próximo deploy?

Documentar em: `docs/retrospectives/YYYY-MM-DD.md`

---

## 10. Suporte

### Canais de Suporte

- **Emergências:** incidents@icarus.com.br
- **Bugs:** bugs@icarus.com.br
- **Suporte:** suporte@icarus.com.br
- **Slack:** #icarus-support

### SLA

| Prioridade | Tempo de Resposta | Tempo de Resolução |
|------------|-------------------|--------------------|
| **Crítico** (Sistema down) | 15 min | 4 horas |
| **Alto** (Funcionalidade crítica) | 1 hora | 8 horas |
| **Médio** (Bug não crítico) | 4 horas | 48 horas |
| **Baixo** (Melhoria/dúvida) | 24 horas | 7 dias |

---

## ✅ Conclusão

Parabéns! O **ICARUS v5.0.1** está deployado e pronto para transformar a gestão OPME! 🚀

Lembre-se:
- 📊 Monitorar métricas diariamente
- 🐛 Responder bugs rapidamente
- 💬 Coletar feedback dos usuários
- 📈 Iterar e melhorar continuamente

**Sucesso na sua jornada! 💙**

---

**ICARUS v5.0.1 - Sistema Enterprise OPME**  
**Powered by AI • Built with ❤️ • Made in Brazil 🇧🇷**

---

*Documento atualizado em: 28 de Outubro de 2025*  
*Versão: 1.0*  
*Autor: ICARUS DevOps Team*

