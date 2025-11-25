# 🚀 GUIA DE EXECUÇÃO PRÁTICA - ICARUS v5.0.1

**Data:** 28 de Outubro de 2025  
**Status:** 🟢 Pronto para Execução  
**Tempo Estimado:** 2-4 horas (primeira vez)

---

## 📋 OVERVIEW

Este guia fornece instruções práticas e executáveis para colocar o ICARUS v5.0.1 em staging.

### Pré-requisitos Verificados
- [ ] Node.js ≥ 18.0.0 instalado
- [ ] pnpm instalado
- [ ] Supabase CLI instalado
- [ ] Git configurado
- [ ] Acesso ao repositório ICARUS

---

## 🎯 PASSO 1: VALIDAR AMBIENTE LOCAL

### 1.1. Verificar Instalações

```bash
# Verificar Node.js
node --version  # Deve ser ≥ 18.0.0

# Verificar pnpm
pnpm --version  # Qualquer versão ≥ 8.0.0

# Verificar Supabase CLI
supabase --version  # Qualquer versão ≥ 1.100.0

# Verificar Git
git --version
```

### 1.2. Clonar/Atualizar Repositório

```bash
# Se ainda não clonou
git clone https://github.com/your-org/icarus-v5.0.git
cd icarus-v5.0

# Se já tem o repo, atualizar
git pull origin main
```

### 1.3. Instalar Dependências

```bash
# Instalar todas as dependências
pnpm install

# Verificar se build funciona
pnpm build
```

**✅ Checkpoint:** Build deve completar sem erros.

### 1.4. Criar Arquivo .env.staging

```bash
# Copiar template
cp env.staging.example .env.staging

# Editar com suas credenciais
nano .env.staging
# ou
code .env.staging  # VS Code
```

**⚠️ IMPORTANTE:** Por enquanto, deixe os placeholders. Vamos preenchê-los nos próximos passos.

### 1.5. Executar Validador (Primeira Vez - Esperado Falhar)

```bash
# Dar permissão de execução
chmod +x scripts/validate-env.sh

# Executar (vai mostrar o que está faltando)
source .env.staging && ./scripts/validate-env.sh
```

**Resultado Esperado:** Vários erros (normal!). Anote quais variáveis estão faltando.

---

## 🎯 PASSO 2: CONFIGURAR SUPABASE

### 2.1. Criar Conta Supabase (se necessário)

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub/Google/E-mail

### 2.2. Criar Projeto Staging

1. No dashboard, clique em **"New Project"**
2. Preencher:
   - **Name:** `icarus-staging`
   - **Database Password:** Gerar senha forte
     ```bash
     # Gerar senha segura (Linux/Mac)
     openssl rand -base64 20
     ```
     **⚠️ SALVE ESTA SENHA!** Você vai precisar.
   
   - **Region:** Escolher mais próxima (ex: South America - São Paulo)
   - **Pricing Plan:** Free (para testes) ou Pro ($25/mês)

3. Clicar em **"Create new project"**
4. Aguardar 2-3 minutos (criação do projeto)

### 2.3. Obter Credenciais

1. Quando projeto estiver ativo, vá em **Settings** → **API**
2. Copiar:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public:** `eyJhbGciOi...` (key longa)
   - **service_role secret:** `eyJhbGciOi...` (diferente da anon)

### 2.4. Atualizar .env.staging

```bash
# Editar .env.staging
nano .env.staging
```

Preencher:
```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co  # Cole aqui
VITE_SUPABASE_ANON_KEY=eyJhbGc...  # Cole a anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Cole a service_role key
```

### 2.5. Testar Conexão

```bash
# Testar se as credenciais funcionam
curl "${VITE_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}"

# Deve retornar: {}
```

**✅ Checkpoint:** Curl deve retornar `{}` sem erros.

### 2.6. Link Local ao Projeto Remoto

```bash
# Login no Supabase CLI
supabase login

# Obter Project Ref
# No dashboard: Settings → General → Reference ID

# Link ao projeto
supabase link --project-ref your-project-ref-here

# Quando pedir senha, usar a senha do database do passo 2.2
```

### 2.7. Aplicar Migrations

```bash
# Ver migrations disponíveis
supabase migration list

# Aplicar TODAS as migrations
supabase db push

# Isso pode levar 2-5 minutos
```

**✅ Checkpoint:** Todas as 93 migrations devem ser aplicadas com sucesso.

### 2.8. Verificar Tabelas Criadas

1. No dashboard Supabase, vá em **Table Editor**
2. Verificar se existem tabelas como:
   - `empresas`
   - `usuarios`
   - `cirurgias`
   - `bi_fato_cirurgias`
   - `notifications`
   - etc.

**✅ Checkpoint:** Pelo menos 50+ tabelas devem estar visíveis.

### 2.9. Configurar Storage Buckets

```bash
# Criar buckets via CLI
supabase storage create icarus-staging-uploads --public=false
supabase storage create icarus-staging-avatars --public=true
```

Ou via Dashboard:
1. Vá em **Storage**
2. Clicar **"New bucket"**
3. Nome: `icarus-staging-uploads`, Public: No

### 2.10. Deploy Edge Functions

```bash
# Ver functions disponíveis
ls -la supabase/functions/

# Deploy todas
supabase functions deploy --project-ref your-project-ref
```

**✅ Checkpoint:** Edge functions deployadas sem erros.

---

## 🎯 PASSO 3: CONFIGURAR SENTRY

### 3.1. Criar Conta Sentry (se necessário)

1. Acesse: https://sentry.io/signup/
2. Escolha plano **Developer** (gratuito)
3. Fazer signup com GitHub/Google/E-mail

### 3.2. Criar Organização

- **Organization Name:** `icarus` (ou nome da sua empresa)
- **URL:** `icarus.sentry.io`

### 3.3. Criar Projeto Staging

1. Clicar **"Create Project"**
2. Escolher:
   - **Platform:** React
   - **Project Name:** `icarus-staging`
   - **Team:** Default

3. Copiar o **DSN** mostrado:
   ```
   https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
   ```

### 3.4. Atualizar .env.staging

```bash
nano .env.staging
```

Adicionar:
```env
# Sentry
VITE_SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=staging
```

### 3.5. Instalar Dependências Sentry

```bash
# Instalar pacotes (se ainda não instalou)
pnpm add @sentry/react @sentry/tracing
```

### 3.6. Testar Sentry

```bash
# Build com Sentry configurado
pnpm build

# Iniciar dev server
pnpm dev

# No browser (http://localhost:5173), abrir console e executar:
# Sentry.captureMessage("Teste Sentry Staging");
```

1. Acessar http://localhost:5173
2. Abrir DevTools (F12) → Console
3. Executar:
   ```javascript
   Sentry.captureMessage("Teste Sentry Staging", "info");
   ```

4. Ir ao dashboard Sentry: https://icarus.sentry.io/issues/
5. Verificar se a mensagem "Teste Sentry Staging" aparece

**✅ Checkpoint:** Evento deve aparecer no Sentry em ~10 segundos.

---

## 🎯 PASSO 4: CONFIGURAR SERVIÇOS EXTERNOS (OPCIONAL)

### 4.1. Twilio (SMS/WhatsApp) - OPCIONAL

**Para Staging: Usar Test Account (gratuito)**

1. Acesse: https://www.twilio.com/try-twilio
2. Criar conta trial
3. No dashboard, copiar:
   - **Account SID:** `ACtest...`
   - **Auth Token:** `...`
   - **Phone Number:** `+155512...` (número de teste)

4. Atualizar .env.staging:
```env
VITE_TWILIO_ACCOUNT_SID=ACtest...
TWILIO_AUTH_TOKEN=...
VITE_TWILIO_PHONE_NUMBER=+155512...
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 4.2. OpenAI (IA) - RECOMENDADO

1. Acesse: https://platform.openai.com/api-keys
2. Clicar **"Create new secret key"**
3. Copiar key: `sk-...`

4. Atualizar .env.staging:
```env
OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-4-turbo-preview
```

### 4.3. SendGrid (E-mail) - RECOMENDADO
1. Acesse: https://app.sendgrid.com/settings/api_keys
2. Criar API Key
3. Copiar key

4. Atualizar .env.staging:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=[sua-api-key]
SMTP_FROM_EMAIL=noreply@staging.icarus.com.br
SMTP_FROM_NAME=ICARUS Staging
```

---

## 🎯 PASSO 5: VALIDAR AMBIENTE COMPLETO

### 5.1. Executar Validador

```bash
# Recarregar .env.staging
source .env.staging

# Executar validador
./scripts/validate-env.sh
```

**Resultado Esperado:** 
- ✅ Todas as variáveis críticas configuradas
- ⚠️ Alguns warnings em opcionais (OK)
- ❌ 0 erros

### 5.2. Se Houver Erros

Revisar `.env.staging` e corrigir variáveis faltando.

```bash
# Ver quais estão faltando
grep -E "^#" .env.staging | grep -v "^# ─"
```

---

## 🎯 PASSO 6: DEPLOY STAGING

### 6.1. Executar Script de Deploy

```bash
# Dar permissão (se ainda não deu)
chmod +x scripts/deploy-staging.sh

# Executar deploy
./scripts/deploy-staging.sh
```

O script vai:
1. ✅ Validar pré-requisitos
2. ✅ Instalar dependências
3. ✅ Rodar linting e type checking
4. ✅ Build da aplicação
5. ✅ Aplicar migrations (já feitas)
6. ✅ Deploy Edge Functions (já feitas)
7. ✅ Build do frontend
8. ✅ Health check

**Tempo estimado:** 5-10 minutos

### 6.2. Deploy Frontend (Vercel/Netlify)

#### Opção A: Vercel

```bash
# Instalar Vercel CLI (se necessário)
npm install -g vercel

# Login
vercel login

# Deploy staging
vercel --env staging

# Seguir prompts no terminal
```

#### Opção B: Netlify

```bash
# Instalar Netlify CLI (se necessário)
npm install -g netlify-cli

# Login
netlify login

# Deploy staging
netlify deploy --prod --dir=dist
```

#### Opção C: Manual (Upload dist/)

1. Build local já foi feito pelo script
2. Fazer upload da pasta `dist/` para seu servidor/CDN

### 6.3. Verificar Deploy

```bash
# Se deployou com Vercel/Netlify, anotar URL
# Exemplo: https://icarus-staging-abc123.vercel.app

# Testar URL
curl https://sua-url-staging.com

# Deve retornar HTML
```

**✅ Checkpoint:** URL deve estar acessível e retornar a homepage.

---

## 🎯 PASSO 7: SMOKE TESTS

### 7.1. Testes Básicos no Browser

1. Acessar: `https://sua-url-staging.com`
2. Verificar:
   - [ ] Homepage carrega
   - [ ] Sem erros no console (F12)
   - [ ] Tema dark/light funciona
   - [ ] Links principais funcionam

### 7.2. Teste de Login

1. Ir para `/login`
2. Tentar login com credenciais de teste:
   - E-mail: `admin@staging.icarus.com.br`
   - Senha: `StagingPassword123!@#`
   
   (Criado na migration)

3. Verificar:
   - [ ] Login redireciona para dashboard
   - [ ] Nome do usuário aparece no header
   - [ ] Módulos estão acessíveis

### 7.3. Teste de API

```bash
# Testar endpoint Supabase via frontend
curl https://sua-url-staging.com/api/health

# Ou testar diretamente no Supabase
curl "${VITE_SUPABASE_URL}/rest/v1/empresas?select=*&limit=1" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}"
```

### 7.4. Teste de Sentry

1. Na aplicação staging, forçar um erro:
   - Acessar uma rota que não existe: `/rota-inexistente`
   
2. Ir ao Sentry: https://icarus.sentry.io/issues/
3. Verificar se erro foi capturado

**✅ Checkpoint:** Erro 404 deve aparecer no Sentry.

---

## 🎯 PASSO 8: INICIAR BETA TESTING

### 8.1. Preparar Lista de Beta Testers

Criar arquivo `beta-testers.md`:

```markdown
# Beta Testers - ICARUS v5.0.1

## Lista de Convites

1. João Silva - joao@empresa.com - Perfil: ADMIN
2. Maria Santos - maria@empresa.com - Perfil: FINANCEIRO
3. Pedro Costa - pedro@empresa.com - Perfil: MEDICO
4. Ana Lima - ana@empresa.com - Perfil: AUDITOR
5. Carlos Souza - carlos@empresa.com - Perfil: COMPRADOR

## Datas
- Convites enviados: [DATA]
- Início beta: [DATA]
- Fim beta: [DATA + 6 semanas]
```

### 8.2. Criar Usuários Beta no Supabase

```sql
-- No Supabase SQL Editor

-- Criar usuário beta 1
INSERT INTO auth.users (
  instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, role
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'joao@empresa.com',
  crypt('BetaTester123!@#', gen_salt('bf')),
  now(), now(), now(),
  '{"name": "João Silva"}'::jsonb,
  'authenticated'
);

-- Repetir para outros usuários...
```

### 8.3. Enviar E-mails de Convite

Use o template em `docs/ops/BETA-TESTER-GUIDE.md` seção "E-mail de Convite".

Exemplo:
```
Assunto: Convite Exclusivo - Beta Tester ICARUS v5.0.1

Olá João,

Você foi selecionado para ser Beta Tester do ICARUS v5.0.1!

Acesso:
- URL: https://staging.icarus.com.br
- Login: joao@empresa.com
- Senha: BetaTester123!@#

Documentação:
- Guia completo: [link para BETA-TESTER-GUIDE.md]

Prazo: 6 semanas (até [DATA])

Suporte: beta@icarus.com.br

Obrigado!
Equipe ICARUS
```

### 8.4. Criar Canal de Suporte

Opções:
- **Slack:** Criar canal `#icarus-beta`
- **WhatsApp:** Criar grupo "ICARUS Beta Testers"
- **E-mail:** Configurar `beta@icarus.com.br`

### 8.5. Agendar Check-ins Semanais

- **Semana 1:** Check-in inicial (onboarding)
- **Semana 2:** Review de primeiras impressões
- **Semana 3:** Testes de funcionalidades críticas
- **Semana 4:** Testes de IA e integrações
- **Semana 5:** Performance e UX
- **Semana 6:** Feedback final e retrospectiva

---

## 🎯 PASSO 9: MONITORAR E ITERAR

### 9.1. Monitoramento Diário (Primeira Semana)

**Checklist Diário:**
- [ ] Verificar Sentry (erros novos?)
- [ ] Verificar Supabase (database healthy?)
- [ ] Verificar logs de acesso
- [ ] Responder dúvidas beta testers

### 9.2. Métricas a Acompanhar

| Métrica | Como Medir | Meta |
|---------|------------|------|
| **Uptime** | Sentry / Vercel | > 99% |
| **Error Rate** | Sentry | < 1% |
| **Response Time** | Supabase Dashboard | P95 < 500ms |
| **Beta Engagement** | Logins por dia | ≥ 70% testers ativos |
| **Feedback Positivo** | Pesquisas | NPS ≥ 8 |

### 9.3. Coletar Feedback

**Semana 2:**
- Enviar formulário: "Primeiras Impressões"

**Semana 4:**
- Enviar formulário: "Funcionalidades e Bugs"

**Semana 6:**
- Enviar formulário: "Avaliação Final"

Templates em: `docs/ops/BETA-TESTER-GUIDE.md`

---

## ✅ CHECKLIST FINAL

Antes de considerar staging completo:

### Infraestrutura
- [ ] ✅ Supabase projeto criado e configurado
- [ ] ✅ 93 migrations aplicadas
- [ ] ✅ Edge Functions deployadas
- [ ] ✅ Storage buckets criados
- [ ] ✅ RLS ativo

### Monitoring
- [ ] ✅ Sentry projeto criado
- [ ] ✅ DSN configurado
- [ ] ✅ Teste de captura funcionando
- [ ] ✅ Alertas configurados

### Deploy
- [ ] ✅ Frontend deployado (Vercel/Netlify)
- [ ] ✅ URL staging acessível
- [ ] ✅ Smoke tests passaram
- [ ] ✅ Health check OK

### Beta Program
- [ ] ✅ 5-10 beta testers selecionados
- [ ] ✅ Usuários criados no Supabase
- [ ] ✅ E-mails de convite enviados
- [ ] ✅ Canal de suporte criado
- [ ] ✅ Check-ins agendados

---

## 🆘 PROBLEMAS COMUNS

### "Migration failed"
**Solução:** Verificar se database está acessível e senha está correta.
```bash
supabase db reset  # CUIDADO: apaga tudo!
supabase db push
```

### "Build failed"
**Solução:** Limpar cache e reinstalar.
```bash
rm -rf node_modules dist .next
pnpm install
pnpm build
```

### "Sentry não captura eventos"
**Solução:** Verificar DSN e environment.
```bash
# Ver se VITE_SENTRY_DSN está definido
echo $VITE_SENTRY_DSN

# Deve começar com https://
```

### "Deploy Vercel failed"
**Solução:** Verificar .env no Vercel dashboard.
1. Ir em Vercel → Settings → Environment Variables
2. Adicionar todas as variáveis de `.env.staging`

---

## 🎉 PARABÉNS!

Se você chegou até aqui, o **ICARUS v5.0.1 está em STAGING e pronto para BETA TESTING**! 🚀

### Próximos Marcos:
1. ✅ **Staging ativo** (você está aqui)
2. → **Beta testing** (6 semanas)
3. → **Ajustes baseados em feedback**
4. → **Deploy produção**

---

**ICARUS v5.0.1 - Sistema Enterprise OPME**  
**Powered by AI • Built with ❤️ • Made in Brazil 🇧🇷**

---

*Documento atualizado em: 28 de Outubro de 2025*  
*Versão: 1.0*

