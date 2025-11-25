# Credenciais de Acesso - ICARUS v5.0

## 🔐 Usuário Admin Principal

**Email:** `dax@newortho.com.br`  
**Senha:** `NewOrtho@2025`  
**Role:** `admin`

---

## 🌐 Acesso à Aplicação

### Desenvolvimento Local
```
URL: http://localhost:5173/login
```

### Comandos
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Rodar testes E2E
npx playwright test tests/e2e/verify-real-login.spec.ts
```

---

## 📋 Páginas Principais

Após login, você terá acesso a:

- **Dashboard:** `http://localhost:5173/dashboard`
- **Gerenciador de Credenciais:** `http://localhost:5173/integracoes/credenciais`
- **Estoque:** `http://localhost:5173/estoque`
- **Financeiro:** `http://localhost:5173/financeiro`
- **Produtos OPME:** `http://localhost:5173/produtos-opme`

---

## ✅ Status de Validação

- ✅ Credenciais validadas no Supabase Auth
- ✅ Perfil com `role = 'admin'` na tabela `profiles`
- ✅ Políticas RLS configuradas corretamente
- ✅ Teste E2E de login passando

---

## 🔧 Troubleshooting

### Se o login falhar:

1. **Verificar se o servidor está rodando:**
   ```bash
   npm run dev
   ```

2. **Verificar se o usuário existe no Supabase:**
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'dax@newortho.com.br';
   ```

3. **Recriar usuário se necessário:**
   ```sql
   INSERT INTO profiles (id, email, full_name, role)
   SELECT id, email, raw_user_meta_data->>'full_name', 'admin'
   FROM auth.users
   WHERE email = 'dax@newortho.com.br'
   ON CONFLICT (id) DO UPDATE 
   SET role = 'admin';
   ```

---

## 📝 Notas

- Estas credenciais são para **desenvolvimento/teste**
- Para produção, use credenciais diferentes e mais seguras
- A senha deve ser alterada em produção
