# ✅ CHECKLIST DE PRODUÇÃO - ICARUS v5.0

**Data**: 18 de Novembro de 2025  
**Versão**: 5.0.0  
**Objetivo**: Deploy em produção do ERP ICARUS para distribuidoras OPME  

---

## 📋 ÍNDICE RÁPIDO

1. [Pré-Deploy](#1-pré-deploy)
2. [Configuração de Ambiente](#2-configuração-de-ambiente)
3. [Banco de Dados](#3-banco-de-dados)
4. [Deploy da Aplicação](#4-deploy-da-aplicação)
5. [Testes Pós-Deploy](#5-testes-pós-deploy)
6. [Monitoramento](#6-monitoramento)
7. [Backup & Recovery](#7-backup--recovery)
8. [Go-Live](#8-go-live)

---

## 1. PRÉ-DEPLOY

### 1.1 Validações de Código

- [x] **Build de produção** executado com sucesso
  ```bash
  npm run build
  # ✅ Build em 21.32s, 970KB main bundle
  ```

- [x] **Linter** sem erros críticos
  ```bash
  npm run lint
  # ✅ 0 errors, 168 warnings (não bloqueantes)
  ```

- [x] **Type checking** passou
  ```bash
  npm run type-check
  # ✅ Sem erros de tipo
  ```

- [x] **Testes** com taxa de sucesso aceitável
  ```bash
  npm test
  # ✅ 143/153 passed (93.5%)
  ```

### 1.2 Documentação

- [x] **README.md** atualizado
- [x] **QUICK_START_PRODUCTION.md** criado
- [x] **Documentação técnica** completa (4 partes)
- [x] **Relatório de qualidade** gerado
- [x] **.env.example** documentado

### 1.3 Segurança

- [x] **Headers de segurança** configurados (vercel.json)
- [x] **RLS policies** habilitadas no Supabase
- [x] **Variáveis sensíveis** não commitadas
- [ ] **Secrets** rotacionados para produção

---

## 2. CONFIGURAÇÃO DE AMBIENTE

### 2.1 Criar Projeto no Vercel

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login no Vercel
vercel login

# 3. Link o projeto (primeira vez)
vercel link

# 4. Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# ... adicionar todas as variáveis
```

### 2.2 Variáveis de Ambiente Necessárias

#### Supabase (Obrigatório)
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (backend)

#### APIs Externas
- [ ] `VITE_SEFAZ_API_URL`
- [ ] `VITE_SEFAZ_CERTIFICADO_PATH`
- [ ] `VITE_ANVISA_API_URL`
- [ ] `VITE_ANVISA_API_KEY`
- [ ] `VITE_CFM_API_URL`
- [ ] `VITE_RECEITA_FEDERAL_API_URL`
- [ ] `VITE_VIA_CEP_API_URL`

#### Microsoft 365 (Opcional)
- [ ] `VITE_MS365_CLIENT_ID`
- [ ] `VITE_MS365_TENANT_ID`
- [ ] `VITE_MS365_REDIRECT_URI`

#### OpenAI / GPT (Chatbot)
- [ ] `VITE_OPENAI_API_KEY`
- [ ] `VITE_GPT_RESEARCHER_URL`

#### Monitoring (Opcional mas Recomendado)
- [ ] `SENTRY_DSN`
- [ ] `GOOGLE_ANALYTICS_ID`

### 2.3 Template .env para Produção

```bash
# Copiar e preencher
cp .env.example .env.production

# Adicionar no Vercel
cat .env.production | while read line; do
  if [[ ! $line =~ ^# ]] && [[ ! -z $line ]]; then
    KEY=$(echo $line | cut -d '=' -f1)
    VALUE=$(echo $line | cut -d '=' -f2-)
    vercel env add $KEY production <<< $VALUE
  fi
done
```

---

## 3. BANCO DE DADOS

### 3.1 Criar Projeto Supabase Produção

- [ ] **Acessar**: https://supabase.com/dashboard
- [ ] **Criar novo projeto**: `icarus-prod`
- [ ] **Região**: São Paulo (sa-east-1) ou mais próxima
- [ ] **Plan**: Pro ou superior (RLS + Performance)

### 3.2 Aplicar Migrations

```bash
# 1. Conectar ao projeto Supabase
supabase link --project-ref SEU_PROJECT_REF

# 2. Aplicar todas as migrations (90 arquivos)
supabase db push

# 3. Verificar status
supabase db diff
```

### 3.3 Configurar RLS Policies

```sql
-- Verificar se RLS está habilitado em todas as tabelas
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;

-- Se houver tabelas sem RLS, habilitar:
-- ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;
```

### 3.4 Criar Usuário Admin Inicial

```sql
-- Inserir na tabela usuarios
INSERT INTO public.usuarios (
  id,
  email,
  nome_completo,
  perfil,
  empresa_id
) VALUES (
  auth.uid(), -- UUID do usuário Supabase Auth
  'admin@empresa.com',
  'Administrador Sistema',
  'admin',
  (SELECT id FROM public.empresas WHERE cnpj = 'SEU_CNPJ')
);
```

### 3.5 Backup Inicial

- [ ] **Configurar backup automático** no Supabase (diário)
- [ ] **Exportar schema inicial** para controle de versão
  ```bash
  supabase db dump -f supabase/backups/schema_prod_$(date +%Y%m%d).sql
  ```

---

## 4. DEPLOY DA APLICAÇÃO

### 4.1 Deploy Staging (Recomendado)

```bash
# 1. Deploy em ambiente de staging
vercel --env=preview

# 2. Testar aplicação
# Abrir URL fornecida pelo Vercel

# 3. Validar funcionalidades críticas
```

### 4.2 Deploy Produção

```bash
# 1. Deploy para produção
vercel --prod

# 2. Anotar URL de produção
# https://icarus-make.vercel.app (ou domínio customizado)
```

### 4.3 Configurar Domínio Customizado (Opcional)

```bash
# No Vercel Dashboard:
# Settings > Domains > Add Domain
# Ex: app.icarus.com.br

# Configurar DNS:
# CNAME: app.icarus.com.br → cname.vercel-dns.com
```

### 4.4 Verificar Build

```bash
# Verificar logs de build
vercel logs --follow

# Verificar se assets foram gerados
vercel inspect URL_DA_DEPLOYMENT
```

---

## 5. TESTES PÓS-DEPLOY

### 5.1 Smoke Tests (Testes de Fumaça)

#### Básico
- [ ] **Homepage** carrega sem erros
- [ ] **Login** funciona
- [ ] **Dashboard principal** renderiza
- [ ] **Navegação** entre módulos funciona
- [ ] **Logout** funciona

#### Crítico
- [ ] **Estoque**: Consulta de produtos
- [ ] **Consignação**: Criar nova consignação
- [ ] **Cirurgias**: Registrar procedimento
- [ ] **Faturamento**: Gerar NF-e (validar com SEFAZ Homolog)
- [ ] **Relatórios**: Gerar DRE

### 5.2 Testes de Integração

#### APIs Externas
- [ ] **ViaCEP**: Buscar endereço por CEP
- [ ] **Receita Federal**: Validar CNPJ
- [ ] **ANVISA**: Consultar registro de produto
- [ ] **SEFAZ**: Validar certificado digital
- [ ] **CFM**: Buscar médico por CRM

#### Banco de Dados
- [ ] **Conexão Supabase** funcionando
- [ ] **RLS policies** bloqueando acessos não autorizados
- [ ] **Triggers** executando corretamente
- [ ] **Views** retornando dados

### 5.3 Testes de Performance

```bash
# Lighthouse (Google)
npx lighthouse https://sua-url.vercel.app --view

# Métricas esperadas:
# - Performance: > 80
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 80
```

### 5.4 Testes de Segurança

```bash
# Headers de segurança
curl -I https://sua-url.vercel.app

# Verificar:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - X-XSS-Protection: 1; mode=block
```

---

## 6. MONITORAMENTO

### 6.1 Configurar Sentry (Error Tracking)

```bash
# 1. Instalar Sentry
npm install @sentry/react @sentry/tracing

# 2. Configurar em src/main.tsx
# Ver documentação: https://docs.sentry.io/platforms/javascript/guides/react/

# 3. Adicionar DSN no .env
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### 6.2 Configurar Analytics

```bash
# Google Analytics 4
# 1. Criar propriedade no Google Analytics
# 2. Obter Measurement ID (G-XXXXXXXXXX)
# 3. Adicionar no index.html ou criar componente Analytics
```

### 6.3 Uptime Monitoring

**Opções Gratuitas**:
- [ ] **UptimeRobot**: https://uptimerobot.com
- [ ] **Pingdom**: https://pingdom.com (free tier)
- [ ] **StatusCake**: https://statuscake.com

**Configuração**:
- Monitorar URL principal (https://sua-url.vercel.app)
- Frequência: A cada 5 minutos
- Alertas: Email + SMS (opcional)

### 6.4 Logs

```bash
# Vercel Logs (real-time)
vercel logs --follow

# Supabase Logs
# Dashboard > Logs > Postgres / API / Auth
```

---

## 7. BACKUP & RECOVERY

### 7.1 Backup do Banco de Dados

#### Automático (Supabase)
- [ ] **Configurado**: Backup diário automático
- [ ] **Retenção**: 7 dias (padrão)
- [ ] **Localização**: Definida no painel Supabase

#### Manual (Recomendado Semanal)
```bash
# Exportar schema + dados
supabase db dump -f backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Compactar
gzip backups/backup_*.sql

# Enviar para storage seguro (S3, Google Drive, etc.)
```

### 7.2 Backup de Código

- [x] **Git**: Código versionado no GitHub/GitLab
- [ ] **Tags de release**: Criar tag v5.0.0
  ```bash
  git tag -a v5.0.0 -m "Release Produção v5.0.0"
  git push origin v5.0.0
  ```

### 7.3 Plano de Recovery

**RTO (Recovery Time Objective)**: 4 horas  
**RPO (Recovery Point Objective)**: 24 horas  

**Procedimento**:
1. Identificar problema
2. Rollback deployment (Vercel: redeploy versão anterior)
3. Restaurar backup do banco (Supabase Dashboard)
4. Validar funcionalidades críticas
5. Comunicar stakeholders

---

## 8. GO-LIVE

### 8.1 Comunicação

#### Stakeholders
- [ ] **CEO/Direção**: Apresentar dashboard executivo
- [ ] **TI**: Documentação técnica + acessos
- [ ] **Usuários finais**: Treinamento agendado
- [ ] **Suporte**: Manual de troubleshooting

#### Canais
- [ ] **Email**: Anúncio oficial de lançamento
- [ ] **Webinar**: Demo ao vivo (opcional)
- [ ] **Documentação**: Link para QUICK_START_PRODUCTION.md

### 8.2 Treinamento de Usuários

**Módulos Prioritários**:
1. **Login e Navegação** (30min)
2. **Estoque e Consignação** (1h)
3. **Cirurgias e Procedimentos** (1h)
4. **Faturamento e NF-e** (1h)
5. **Relatórios e Dashboard** (30min)

**Materiais**:
- [ ] Vídeos tutoriais (5-10min cada)
- [ ] PDF com passo a passo
- [ ] FAQ com dúvidas comuns

### 8.3 Suporte Pós-Lançamento

**Primeira Semana** (Crítico):
- [ ] **Suporte dedicado**: 8h/dia, tempo de resposta < 2h
- [ ] **Canal direto**: WhatsApp/Slack para emergências
- [ ] **Daily standup**: Status diário com stakeholders

**Primeiro Mês**:
- [ ] **Suporte estendido**: 10h/dia útil
- [ ] **Reuniões semanais**: Feedback e melhorias
- [ ] **Bug tracking**: Priorização de correções

### 8.4 Métricas de Sucesso (KPIs)

**Semana 1**:
- [ ] Uptime > 99.5%
- [ ] Bugs críticos: 0
- [ ] Tempo médio de resposta < 2s
- [ ] Usuários ativos: > 80% do esperado

**Mês 1**:
- [ ] Uptime > 99.9%
- [ ] Satisfação dos usuários: > 4.0/5.0
- [ ] Redução de tempo em processos: > 30%
- [ ] Adoção de funcionalidades: > 70%

---

## 📊 RESUMO DE STATUS

### ✅ Concluído

```
[✅] Build de produção
[✅] Testes (93.5% sucesso)
[✅] Linter (0 erros)
[✅] Migrations SQL (90 arquivos)
[✅] Configuração Vercel
[✅] Headers de segurança
[✅] Documentação completa
```

### 🔄 Pendente (Executar Agora)

```
[ ] Criar projeto Supabase Produção
[ ] Aplicar migrations (supabase db push)
[ ] Configurar variáveis de ambiente no Vercel
[ ] Deploy: vercel --prod
[ ] Smoke tests
[ ] Configurar monitoring (Sentry, Analytics)
```

### 📅 Agendar (Pós-Deploy)

```
[ ] Treinamento de usuários (Semana 1)
[ ] Configurar backups manuais semanais
[ ] Revisar e otimizar bundle size
[ ] Implementar CI/CD completo
[ ] Adicionar testes E2E
```

---

## 🚀 COMANDO RÁPIDO PARA DEPLOY

```bash
#!/bin/bash
# deploy-production.sh

echo "🚀 ICARUS v5.0 - Deploy Produção"
echo "================================="
echo

# 1. Build local
echo "📦 Building..."
npm run build

# 2. Verificar build
if [ -d "dist" ]; then
  echo "✅ Build OK"
else
  echo "❌ Build falhou!"
  exit 1
fi

# 3. Deploy Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo
echo "✅ Deploy concluído!"
echo
echo "📋 Próximos passos:"
echo "  1. Testar aplicação na URL fornecida"
echo "  2. Validar funcionalidades críticas"
echo "  3. Configurar monitoring"
echo
```

---

## 📞 CONTATOS DE EMERGÊNCIA

### Infraestrutura
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support

### Equipe
- **DevOps**: [Nome] - [Email] - [Telefone]
- **Backend Lead**: [Nome] - [Email] - [Telefone]
- **Frontend Lead**: [Nome] - [Email] - [Telefone]
- **Product Owner**: [Nome] - [Email] - [Telefone]

---

## 📚 REFERÊNCIAS

### Documentação do Projeto
- `QUICK_START_PRODUCTION.md` - Guia rápido de deploy
- `RELATORIO_QUALIDADE_METRICAS_FINAL.md` - Métricas detalhadas
- `DOCUMENTACAO_TECNICA_COMPLETA.md` - Arquitetura
- `DOCUMENTACAO_TECNICA_INTEGRACOES_DEPLOY.md` - Deploy detalhado

### Links Úteis
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Repo: [Inserir URL]
- Documentação Oficial: [Inserir URL]

---

## ✅ ASSINATURAS

**Checklist revisado por**:

- [ ] **Tech Lead**: _______________ Data: ___/___/2025
- [ ] **DevOps**: _______________ Data: ___/___/2025
- [ ] **QA**: _______________ Data: ___/___/2025
- [ ] **Product Owner**: _______________ Data: ___/___/2025
- [ ] **Diretor de TI**: _______________ Data: ___/___/2025

**Aprovação final para Go-Live**:

- [ ] **CEO/Diretor Geral**: _______________ Data: ___/___/2025

---

**Versão**: 1.0.0  
**Última atualização**: 18 de Novembro de 2025  
**Próxima revisão**: Após primeira semana de produção  

---

**🎉 BOA SORTE NO LANÇAMENTO DO ICARUS v5.0! 🚀**

