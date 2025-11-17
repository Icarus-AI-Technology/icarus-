# 🔐 CREDENCIAIS DE ACESSO - ICARUS v5.0

**Sistema:** ICARUS v5.0 (OraclusX)  
**Ambiente:** Desenvolvimento  
**Data:** 26 de Janeiro de 2025

---

## 👤 USUÁRIO ADMIN PADRÃO

### Credenciais

```yaml
Email:    dax@newortho.com.br
Senha:    Admin@123456!

Alternativa (caso a primeira não funcione):
Email:    dax@newortho.com.br
Senha:    admin123
```

### Perfil

```yaml
Nome: Dax (Admin)
Role: admin / CEO
Empresa: NewOrtho (ou primeira organização)
Permissões: SYSTEM_ALL (acesso total)
```

---

## 🌐 COMO ACESSAR

### Passo 1: Abrir Sistema

```
URL: http://localhost:5173
```

### Passo 2: Fazer Login

1. Abra a URL acima no navegador
2. Será redirecionado para `/login`
3. Digite as credenciais:
   - **Email:** `dax@newortho.com.br`
   - **Senha:** `Admin@123456!` (ou `admin123`)
4. Clique em "Entrar"

### Passo 3: Explorar Sistema

Após o login você terá acesso a:

- ✅ Dashboard Principal
- ✅ Todos os 62 módulos
- ✅ Arquitetura e Diagramas
- ✅ EDR Research
- ✅ Configurações do sistema

---

## 🔧 SE O USUÁRIO NÃO EXISTIR

### Opção 1: Criar via Edge Function (RECOMENDADO)

```bash
# Configurar secrets no Supabase
supabase secrets set ADMIN_INITIAL_EMAIL=dax@newortho.com.br
supabase secrets set ADMIN_INITIAL_PASSWORD="Admin@123456!"
supabase secrets set ADMIN_INITIAL_NAME="Dax Admin"

# Chamar Edge Function
curl -X POST https://ttswvavcisdnonytslom.supabase.co/functions/v1/create-admin \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Opção 2: Criar via Supabase Dashboard

```
1. Acesse: https://app.supabase.com/project/ttswvavcisdnonytslom
2. Vá em: Authentication → Users
3. Clique em: "Add user"
4. Preencha:
   - Email: dax@newortho.com.br
   - Password: Admin@123456!
   - Confirm email: Yes
   - User metadata: {"role": "admin", "nome": "Dax Admin"}
5. Salve
```

### Opção 3: Criar via SQL

```sql
-- No Supabase SQL Editor
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  'dax@newortho.com.br',
  crypt('Admin@123456!', gen_salt('bf')),
  NOW(),
  '{"role": "admin", "nome": "Dax Admin"}'::jsonb
);
```

---

## 📋 VERIFICAR SE ADMIN EXISTE

### Via Supabase Dashboard

```
1. Acesse: https://app.supabase.com/project/ttswvavcisdnonytslom
2. Authentication → Users
3. Procure por: dax@newortho.com.br
```

### Via Script

```bash
# Executar script de verificação
cd /Users/daxmeneghel/icarus-make
npx supabase auth list
```

---

## 🔑 OUTROS USUÁRIOS DE TESTE

Se quiser criar usuários adicionais para teste:

### Usuário Gerente

```yaml
Email: gerente@icarus.com
Senha: Gerente@123
Role: manager
```

### Usuário Operador

```yaml
Email: operador@icarus.com
Senha: Operador@123
Role: user
```

### Usuário Visualizador

```yaml
Email: viewer@icarus.com
Senha: Viewer@123
Role: viewer
```

---

## 🛠️ TROUBLESHOOTING

### "Email ou senha incorretos"

```bash
Soluções:
1. Verificar se usuário existe no Dashboard
2. Resetar senha via Dashboard
3. Criar novo usuário
4. Verificar console do navegador (F12) para erros
```

### "Usuário não encontrado"

```bash
Criar usuário via:
- Edge Function create-admin
- Supabase Dashboard
- SQL direto
```

### "Sem permissão"

```bash
Verificar:
1. Role do usuário (deve ser "admin")
2. RLS policies ativas
3. Metadados do usuário
```

---

## 🎯 ACESSO RÁPIDO

### 1. Abrir Navegador

```
http://localhost:5173
```

### 2. Login

```
Email: dax@newortho.com.br
Senha: Admin@123456!
```

### 3. Explorar

```
✅ Dashboard → Ver KPIs
✅ Arquitetura → Ver diagramas
✅ EDR Research → Testar pesquisa IA
✅ Cirurgias → Gestão completa
✅ Estoque → IA e analytics
```

---

## 📞 SUPORTE

### Se tiver problemas de acesso

**Dashboard Supabase:**

```
https://app.supabase.com/project/ttswvavcisdnonytslom
→ Authentication → Users
```

**Criar novo admin manualmente:**

1. Dashboard → Authentication → Add user
2. Email: seu@email.com
3. Password: SuaSenhaSegura123!
4. Email confirmed: Yes
5. Save

---

## ✅ CHECKLIST

- [ ] Servidor rodando (http://localhost:5173) ✅
- [ ] Usuário admin existe no Supabase
- [ ] Credenciais testadas
- [ ] Login bem-sucedido
- [ ] Dashboard acessível
- [ ] Módulos funcionando

---

**Documento gerado em:** 26/01/2025  
**Sistema:** ICARUS v5.0 (OraclusX)  
**Status:** ✅ Sistema Rodando - Pronto para Login

---

# 🎯 ACESSE AGORA: http://localhost:5173

**Email:** `dax@newortho.com.br`  
**Senha:** `Admin@123456!` ou `admin123`
