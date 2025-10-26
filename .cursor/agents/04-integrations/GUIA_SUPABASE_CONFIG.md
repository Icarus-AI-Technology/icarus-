# 🔧 Guia de Configuração - Credenciais Supabase

## ⚠️ AÇÃO CRÍTICA NECESSÁRIA

As credenciais Supabase precisam ser configuradas imediatamente para que os serviços de **Auth**, **Storage** e **Realtime** funcionem corretamente.

---

## 📋 Passo a Passo

### 1. Acessar o Painel do Supabase

1. Acesse https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **icarus-make**

### 2. Obter as Credenciais

#### 2.1 - Project URL
1. No painel lateral, clique em **Settings** (Configurações)
2. Clique em **API**
3. Copie o valor de **Project URL**
   ```
   Exemplo: https://xyzabc123.supabase.co
   ```

#### 2.2 - Anon Key (Pública)
1. Na mesma página **API**
2. Em **Project API keys**, copie o valor de **anon / public**
   ```
   Exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### 2.3 - Service Role Key (Privada)
1. Na mesma página **API**
2. Em **Project API keys**, copie o valor de **service_role**
   ```
   ⚠️ ATENÇÃO: Esta chave é PRIVADA e nunca deve ser exposta no frontend!
   ```

### 3. Configurar no Projeto

#### 3.1 - Arquivo .env (Local)

Crie ou edite o arquivo `.env` na raiz do projeto:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

#### 3.2 - Vercel (Produção)

Se estiver usando Vercel:

1. Acesse o painel do Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione as 3 variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Faça um novo deploy para aplicar

#### 3.3 - Outras Plataformas

**Netlify:**
```bash
# netlify.toml
[build.environment]
  VITE_SUPABASE_URL = "https://sua-url.supabase.co"
  VITE_SUPABASE_ANON_KEY = "sua-anon-key"
```

**Railway / Render:**
- Adicione as variáveis no painel de Environment Variables

---

## 4. Testar a Configuração

Após configurar, execute o teste:

```bash
npx tsx .cursor/agents/04-integrations/subagents/4.2-supabase-services.ts
```

### Resultado Esperado:

```
✅ Auth: Funcional
✅ Storage: Funcional
✅ Realtime: Funcional
✅ Edge Functions: 8 funções encontradas

Score: 100/100
```

---

## 5. Configurar Buckets do Storage

Se o Storage estiver configurado mas sem buckets, criar manualmente:

### Via SQL no Supabase Dashboard:

```sql
-- Criar buckets necessários
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('documentos', 'documentos', false),
  ('nfe-xml', 'nfe-xml', false),
  ('anexos-cirurgias', 'anexos-cirurgias', false),
  ('relatorios', 'relatorios', false),
  ('temp', 'temp', false);

-- Configurar políticas de acesso (RLS)
CREATE POLICY "Usuários podem acessar seus próprios avatares"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem fazer upload de avatares"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 6. Verificar Edge Functions

As Edge Functions já estão deployadas. Para redesployar:

```bash
# Login no Supabase CLI
npx supabase login

# Deploy de uma função específica
npx supabase functions deploy ml-vectors

# Deploy de todas as funções
npx supabase functions deploy --all
```

---

## 🔒 Segurança

### ✅ Boas Práticas:

1. **NUNCA** commitar o arquivo `.env` no git
2. **SEMPRE** usar `.env.example` como template
3. **Service Role Key** só deve ser usada no backend
4. **Anon Key** é segura para uso no frontend
5. Ativar RLS (Row Level Security) em todas as tabelas sensíveis

### ⚠️ Checklist de Segurança:

- [ ] `.env` está no `.gitignore`
- [ ] RLS ativado em todas as tabelas
- [ ] Políticas de acesso configuradas
- [ ] Service Role Key não exposta no frontend
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativado

---

## 📊 Impacto da Configuração

### Antes (Score: 25/100):
- ❌ Auth não funcional
- ❌ Storage não funcional
- ❌ Realtime não funcional
- ✅ Edge Functions OK

### Depois (Score: 100/100):
- ✅ Auth funcional
- ✅ Storage funcional
- ✅ Realtime funcional
- ✅ Edge Functions OK

### Funcionalidades Desbloqueadas:
- 🔐 Autenticação de usuários
- 📦 Upload de arquivos (avatares, documentos, XML)
- ⚡ Atualizações em tempo real
- 🚀 Funções serverless operacionais

---

## 🆘 Problemas Comuns

### Erro: "Invalid API key"
- **Causa:** Credenciais incorretas
- **Solução:** Verificar se copiou as chaves corretamente do painel

### Erro: "Project not found"
- **Causa:** URL incorreta
- **Solução:** Verificar a URL do projeto no painel

### Storage não funciona
- **Causa:** Buckets não criados
- **Solução:** Executar o SQL de criação de buckets

### RLS bloqueando acesso
- **Causa:** Políticas muito restritivas
- **Solução:** Revisar políticas de RLS ou desativar temporariamente

---

## 📞 Suporte

Se precisar de ajuda:
- 📖 Documentação: https://supabase.com/docs
- 💬 Discord: https://discord.supabase.com
- 📧 Email: support@supabase.com

---

**Próxima Etapa:** Após configurar, rodar novamente o Agente 04 para validar.

