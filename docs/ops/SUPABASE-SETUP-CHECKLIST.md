# 🗄️ CHECKLIST DE CONFIGURAÇÃO - SUPABASE STAGING

**Data:** 28 de Outubro de 2025  
**Versão:** 5.0.1 + CEO Intelligence Module  
**Ambiente:** Staging

---

## 🎯 Objetivo

Este guia fornece um passo a passo completo para configurar um projeto Supabase para staging do ICARUS v5.0.1.

---

## 📋 PRÉ-REQUISITOS

- [ ] Conta Supabase criada ([supabase.com](https://supabase.com))
- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] Git configurado
- [ ] Node.js ≥ 18.0.0

---

## 🚀 PASSO A PASSO

### 1. CRIAR PROJETO NO SUPABASE

#### 1.1. Acessar Dashboard
1. Acesse: https://app.supabase.com
2. Faça login
3. Clique em **"New Project"**

#### 1.2. Configurar Projeto
- [ ] **Name:** `icarus-staging`
- [ ] **Database Password:** Gerar senha forte (mínimo 12 caracteres)
  - ⚠️ **SALVAR EM LOCAL SEGURO!**
- [ ] **Region:** Escolher região mais próxima (ex: `São Paulo (sa-east-1)`)
- [ ] **Pricing Plan:** 
  - Staging: **Free** ou **Pro** ($25/mês)
  - Produção: **Pro** ou **Team**

#### 1.3. Aguardar Criação
- Leva ~2 minutos
- Status ficará "Active"

---

### 2. OBTER CREDENCIAIS

#### 2.1. Project URL e API Keys

1. No dashboard, vá em **Settings** → **API**
2. Copiar:
   - [ ] **Project URL:** `https://[project-ref].supabase.co`
   - [ ] **anon public key:** `eyJhbGc...` (começando com `eyJ`)
   - [ ] **service_role secret key:** `eyJhbGc...` (diferente da anon)

#### 2.2. Salvar no .env.staging

```env
VITE_SUPABASE_URL=https://[seu-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc[...]
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc[...]
```

⚠️ **NUNCA commitar .env.staging no Git!**

---

### 3. CONFIGURAR AUTENTICAÇÃO

#### 3.1. Habilitar Providers

1. Vá em **Authentication** → **Providers**
2. Configurar:
   - [ ] **Email:** Enabled
   - [ ] **Magic Link:** Enabled (opcional)
   - [ ] **Google OAuth:** Configurar se necessário
   - [ ] **Microsoft OAuth:** Configurar para Graph API

#### 3.2. Configurar URLs

1. Vá em **Authentication** → **URL Configuration**
2. Configurar:
   - [ ] **Site URL:** `https://staging.icarus.com.br`
   - [ ] **Redirect URLs:**
     ```
     https://staging.icarus.com.br
     https://staging.icarus.com.br/auth/callback
     http://localhost:5173
     http://localhost:5173/auth/callback
     ```

#### 3.3. Configurar E-mail Templates

1. Vá em **Authentication** → **Email Templates**
2. Personalizar templates:
   - [ ] **Confirm signup:** Mensagem de confirmação
   - [ ] **Magic Link:** Link mágico de login
   - [ ] **Change Email Address:** Confirmação de mudança
   - [ ] **Reset Password:** Reset de senha

Exemplo de customização:
```html
<h2>Bem-vindo ao ICARUS!</h2>
<p>Olá {{ .Email }},</p>
<p>Confirme seu cadastro clicando no link abaixo:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar E-mail</a></p>
```

---

### 4. CONFIGURAR DATABASE

#### 4.1. Habilitar Extensions

1. Vá em **Database** → **Extensions**
2. Habilitar:
   - [ ] **uuid-ossp:** Geração de UUIDs
   - [ ] **pgcrypto:** Criptografia
   - [ ] **pg_stat_statements:** Estatísticas de queries
   - [ ] **pg_trgm:** Busca fuzzy/full-text
   - [ ] **postgis:** Geolocalização (se necessário)

SQL alternativo (via SQL Editor):
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

#### 4.2. Configurar Connection Pooler

1. Vá em **Database** → **Connection Pooling**
2. Anotar:
   - [ ] **Connection String:** Para conexões diretas
   - [ ] **Pool Mode:** Transaction (recomendado)

---

### 5. APLICAR MIGRATIONS

#### 5.1. Link Local com Projeto Remoto

```bash
cd /Users/daxmeneghel/icarus-v5.0

# Login no Supabase CLI
supabase login

# Link ao projeto staging
supabase link --project-ref your-staging-project-ref
```

Quando solicitado:
- **Database password:** A senha que você criou no passo 1.2

#### 5.2. Verificar Migrations

```bash
# Listar migrations locais
ls -la supabase/migrations/

# Verificar status
supabase migration list
```

#### 5.3. Aplicar Migrations

```bash
# Aplicar TODAS as migrations
supabase db push

# Ou aplicar migration específica
supabase migration up --file 20251028_create_ceo_intelligence_module.sql
```

#### 5.4. Verificar Sucesso

```bash
# Ver tabelas criadas
supabase db dump --schema public --data-only
```

Ou no dashboard:
1. Vá em **Table Editor**
2. Verificar se todas as tabelas estão criadas:
   - `empresas`
   - `usuarios`
   - `cirurgias`
   - `bi_dimensao_medico`
   - `bi_fato_cirurgias`
   - `notifications`
   - etc.

---

### 6. CONFIGURAR ROW LEVEL SECURITY (RLS)

#### 6.1. Verificar RLS Ativo

1. Vá em **Authentication** → **Policies**
2. Verificar se todas as tabelas críticas têm RLS ativo:
   - [ ] `empresas`
   - [ ] `usuarios`
   - [ ] `cirurgias`
   - [ ] `contas_receber`
   - [ ] `contas_pagar`
   - [ ] `notifications`

#### 6.2. Testar Policies

No **SQL Editor**, executar:

```sql
-- Testar como usuário autenticado
SET ROLE authenticated;
SELECT * FROM public.empresas LIMIT 1;
-- Deve retornar apenas empresas que o usuário tem acesso

-- Testar como anônimo
SET ROLE anon;
SELECT * FROM public.empresas LIMIT 1;
-- Deve retornar erro ou vazio (dependendo da policy)

-- Voltar ao normal
RESET ROLE;
```

---

### 7. CONFIGURAR STORAGE

#### 7.1. Criar Buckets

1. Vá em **Storage**
2. Criar buckets:

```sql
-- Via SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('icarus-staging-uploads', 'icarus-staging-uploads', false),
  ('icarus-staging-avatars', 'icarus-staging-avatars', true);
```

Ou via Dashboard:
- [ ] **Bucket Name:** `icarus-staging-uploads`
- [ ] **Public:** No
- [ ] **File Size Limit:** 10 MB
- [ ] **Allowed MIME types:** `image/*,application/pdf,text/csv`

#### 7.2. Configurar Storage Policies

```sql
-- Policy: Usuários podem fazer upload de arquivos
CREATE POLICY "Users can upload files" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'icarus-staging-uploads');

-- Policy: Usuários podem ver seus próprios arquivos
CREATE POLICY "Users can view own files" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'icarus-staging-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Usuários podem deletar seus próprios arquivos
CREATE POLICY "Users can delete own files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'icarus-staging-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

### 8. DEPLOY EDGE FUNCTIONS

#### 8.1. Verificar Edge Functions Locais

```bash
ls -la supabase/functions/
```

Você deve ver:
- `cnpj-lookup/`
- `powerbi-embed-token/`
- `twilio-send/`
- etc.

#### 8.2. Deploy de Todas as Functions

```bash
# Deploy todas de uma vez
supabase functions deploy

# Ou deploy individual
supabase functions deploy cnpj-lookup
supabase functions deploy powerbi-embed-token
```

#### 8.3. Configurar Secrets das Functions

```bash
# Definir secrets para Edge Functions
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set TWILIO_AUTH_TOKEN=...
supabase secrets set POWERBI_CLIENT_SECRET=...
```

#### 8.4. Testar Edge Function

```bash
# Testar localmente
curl -X POST \
  'https://[project-ref].supabase.co/functions/v1/cnpj-lookup' \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"cnpj": "00000000000191"}'
```

---

### 9. CONFIGURAR CORS

#### 9.1. Adicionar Domínios Permitidos

1. Vá em **Settings** → **API** → **CORS Configuration**
2. Adicionar origins:
   ```
   https://staging.icarus.com.br
   http://localhost:5173
   http://localhost:3000
   ```

#### 9.2. Verificar CORS

Teste no browser console:
```javascript
fetch('https://[project-ref].supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGc...',
  }
}).then(r => console.log('CORS OK:', r.status));
```

---

### 10. CONFIGURAR MONITORING

#### 10.1. Habilitar Logs

1. Vá em **Logs**
2. Habilitar:
   - [ ] **API Logs**
   - [ ] **Database Logs**
   - [ ] **Auth Logs**
   - [ ] **Realtime Logs**

#### 10.2. Configurar Alertas

1. Vá em **Settings** → **Monitoring**
2. Configurar alertas para:
   - [ ] **CPU > 80%**
   - [ ] **Storage > 90%**
   - [ ] **API Rate Limit atingido**
   - [ ] **Database connections > 90%**

Email para alertas: `alerts@icarus.com.br`

---

### 11. CRIAR USUÁRIO ADMIN DE TESTE

#### 11.1. Via SQL Editor

```sql
-- Criar usuário de teste
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@staging.icarus.com.br',
  crypt('StagingPassword123!@#', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Admin Staging"}'::jsonb,
  'authenticated'
);

-- Buscar o ID do usuário criado
SELECT id, email FROM auth.users WHERE email = 'admin@staging.icarus.com.br';
```

#### 11.2. Criar Perfil de Usuário

```sql
-- Inserir na tabela usuarios (ajuste conforme seu schema)
INSERT INTO public.usuarios (id, email, nome, perfil, ativo)
VALUES (
  '[id-do-usuario-criado-acima]',
  'admin@staging.icarus.com.br',
  'Admin Staging',
  'ADMIN',
  true
);
```

---

### 12. TESTAR CONEXÃO

#### 12.1. Teste via Supabase CLI

```bash
# Testar consulta
supabase db execute "SELECT version();"
```

#### 12.2. Teste via Frontend Local

```typescript
// Em src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Testar
supabase.from('empresas').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) console.error('Erro:', error);
    else console.log('Sucesso:', data);
  });
```

---

### 13. BACKUP E RECOVERY

#### 13.1. Configurar Backups Automáticos

1. Vá em **Database** → **Backups**
2. Verificar configuração:
   - [ ] **Daily backups:** Enabled
   - [ ] **Retention:** 7 days (staging) / 30 days (prod)
   - [ ] **Point-in-time recovery:** Enabled (Pro plan)

#### 13.2. Fazer Backup Manual

```bash
# Dump completo
supabase db dump -f backup-staging-$(date +%Y%m%d).sql

# Apenas schema
supabase db dump --schema public -f schema-$(date +%Y%m%d).sql

# Apenas dados
supabase db dump --data-only -f data-$(date +%Y%m%d).sql
```

---

### 14. CHECKLIST FINAL

Antes de considerar a configuração completa:

- [ ] ✅ Projeto criado e ativo
- [ ] ✅ Credenciais salvas em `.env.staging`
- [ ] ✅ Autenticação configurada
- [ ] ✅ Extensions habilitadas
- [ ] ✅ Migrations aplicadas (93 migrations)
- [ ] ✅ RLS ativo em todas as tabelas críticas
- [ ] ✅ Storage buckets criados e configurados
- [ ] ✅ Edge Functions deployadas
- [ ] ✅ CORS configurado
- [ ] ✅ Monitoring e alertas ativos
- [ ] ✅ Usuário admin de teste criado
- [ ] ✅ Teste de conexão bem-sucedido
- [ ] ✅ Backup configurado

---

## 🆘 TROUBLESHOOTING

### Erro: "Failed to link project"
**Solução:**
```bash
# Deslinkar e religar
supabase unlink
supabase link --project-ref your-project-ref
```

### Erro: "Migration failed"
**Solução:**
1. Ver logs detalhados: `supabase migration list`
2. Aplicar migrations uma por uma
3. Verificar dependências (ordem das migrations)

### Erro: "RLS prevents access"
**Solução:**
1. Verificar policies: `SELECT * FROM pg_policies WHERE tablename = 'sua_tabela';`
2. Temporariamente desabilitar RLS para debug: `ALTER TABLE sua_tabela DISABLE ROW LEVEL SECURITY;`
3. **Não esquecer de reabilitar depois!**

### Erro: "Edge Function timeout"
**Solução:**
- Aumentar timeout no código da função
- Otimizar queries lentas
- Verificar logs: `supabase functions logs nome-da-funcao`

---

## 📚 REFERÊNCIAS

- [Supabase Docs](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

## 🎉 PRÓXIMOS PASSOS

Após completar este checklist:
1. ✅ Executar `scripts/validate-env.sh` para validar configuração
2. ✅ Executar `scripts/deploy-staging.sh` para deploy do frontend
3. ✅ Rodar smoke tests básicos
4. ✅ Convidar usuários beta

---

**ICARUS v5.0.1 - Sistema Enterprise OPME**  
**Powered by AI • Built with ❤️ • Made in Brazil 🇧🇷**

---

*Documento atualizado em: 28 de Outubro de 2025*  
*Versão: 1.0*

