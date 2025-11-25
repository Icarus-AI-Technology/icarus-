# 🔐 Diretriz Prioritária: Autenticação é a ÚLTIMA Etapa

**AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v2.0**  
**Data:** 20 de outubro de 2025  
**Status:** ✅ DIRETRIZ ATIVA

---

## 📌 Princípio Fundamental

> **"Autenticação e controles de acesso são implementados APENAS após validação visual completa de todo o frontend."**

Durante o desenvolvimento e validação visual, **NÃO** ativar:
- ✋ Fluxos de login obrigatório
- ✋ Bloqueios de rotas por autenticação
- ✋ Guards de segurança que impeçam visualização
- ✋ Validações de sessão ativa
- ✋ Redirecionamentos forçados para `/login`

---

## 🎯 Objetivos

### 1. Desenvolvimento Ágil
- **Foco total** na interface e experiência do usuário
- **Iterações rápidas** sem fricção de login
- **Validação visual** 1:1 com design Figma
- **Testes automáticos** sem complexidade de auth

### 2. Validação Contínua
- **Previews frequentes** sem barreiras
- **Screenshots automáticos** de todas as rotas
- **Comparações visuais** light/dark mode
- **Feedback rápido** de stakeholders

### 3. Qualidade do Código
- **Separação de responsabilidades**: UI primeiro, segurança depois
- **Testes isolados**: componentes sem dependências de auth
- **Refatoração segura**: mudanças visuais sem afetar auth
- **Deploy gradual**: frontend validado → backend seguro

---

## 🛠️ Estratégias de Implementação

### Durante Desenvolvimento (SEM Auth)

#### 1. Mocks de Sessão (__DEV_SESSION__)
```typescript
// src/lib/dev-session.ts
export const DEV_SESSION = {
  user: {
    id: 'dev-user-001',
    email: 'dev@icarus.local',
    name: 'Desenvolvedor',
    role: 'admin',
    empresa_id: 'empresa-demo-001'
  },
  isAuthenticated: true,
  isDevelopment: true
};

// src/hooks/useAuth.ts
export function useAuth() {
  // Durante desenvolvimento
  if (import.meta.env.DEV || import.meta.env.VITE_SKIP_AUTH === 'true') {
    return {
      session: DEV_SESSION,
      isLoading: false,
      isAuthenticated: true,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
    };
  }
  
  // Produção: usar Supabase Auth real
  const { data: session, isLoading } = useSupabaseSession();
  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    login: () => supabase.auth.signIn(),
    logout: () => supabase.auth.signOut(),
  };
}
```

#### 2. Feature Flags
```typescript
// src/config/features.ts
export const FEATURES = {
  // Desligado até fase final
  AUTH_REQUIRED: import.meta.env.VITE_AUTH_REQUIRED === 'true',
  
  // Ativo durante desenvolvimento
  DEV_MODE: import.meta.env.DEV,
  MOCK_DATA: import.meta.env.VITE_MOCK_DATA === 'true',
};

// src/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth();
  
  // Bypass durante desenvolvimento
  if (!FEATURES.AUTH_REQUIRED) {
    return <>{children}</>;
  }
  
  // Produção: validar auth
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}
```

#### 3. Dados de Demonstração
```typescript
// src/lib/mock-data.ts
export const MOCK_CIRURGIAS = [
  {
    id: 'cirurgia-001',
    paciente: 'João Silva',
    procedimento: 'Artroplastia de Quadril',
    data: '2025-10-25',
    status: 'agendada',
    empresa_id: 'empresa-demo-001'
  },
  // ... mais dados
];

// src/services/cirurgias.ts
export async function getCirurgias() {
  // Durante desenvolvimento: retornar mocks
  if (FEATURES.MOCK_DATA) {
    return { data: MOCK_CIRURGIAS, error: null };
  }
  
  // Produção: buscar do Supabase
  return await supabase
    .from('cirurgias')
    .select('*')
    .eq('empresa_id', session.user.empresa_id);
}
```

#### 4. RLS Parcial (Somente Leitura)
```sql
-- Durante desenvolvimento: permitir leitura de dados demo
CREATE POLICY "dev_read_cirurgias"
ON cirurgias
FOR SELECT
USING (
  empresa_id = 'empresa-demo-001'
  OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
);

-- Policies de escrita DESATIVADAS até fase final
-- CREATE POLICY "insert_cirurgias" ... (comentado)
-- CREATE POLICY "update_cirurgias" ... (comentado)
-- CREATE POLICY "delete_cirurgias" ... (comentado)
```

---

### Fase Final (COM Auth)

#### 1. Ativar Supabase Auth
```bash
# Configurar Supabase Auth
cd supabase
supabase db push  # Aplicar migrations de auth

# Configurar providers
# - Email/Password
# - Magic Link
# - SSO (Azure AD se aplicável)
```

#### 2. Implementar Fluxos de Login
```typescript
// src/pages/Login.tsx
export function Login() {
  const { login } = useAuth();
  
  async function handleLogin(email: string, password: string) {
    const { error } = await login(email, password);
    if (error) {
      toast.error('Erro ao fazer login');
    } else {
      navigate('/dashboard');
    }
  }
  
  return (
    <form onSubmit={handleLogin}>
      {/* UI de login */}
    </form>
  );
}
```

#### 3. Ativar Guards de Rota
```typescript
// src/App.tsx
function App() {
  return (
    <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Protegidas */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Welcome />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* ... outras rotas */}
        </Route>
      </Routes>
    </Router>
  );
}
```

#### 4. Ativar RLS Completo
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
-- ... outras tabelas

-- Criar policies de escrita
CREATE POLICY "insert_cirurgias"
ON cirurgias
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND empresa_id = (
    SELECT empresa_id FROM profiles WHERE id = auth.uid()
  )
);

-- ... outras policies (UPDATE, DELETE)
```

#### 5. Implementar RBAC
```sql
-- Tabela de permissões por módulo
CREATE TABLE user_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function para checar permissão
CREATE OR REPLACE FUNCTION check_module_permission(
  p_module_name TEXT,
  p_action TEXT -- 'read', 'write', 'delete'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_module_permissions
    WHERE user_id = auth.uid()
    AND module_name = p_module_name
    AND (
      (p_action = 'read' AND can_read)
      OR (p_action = 'write' AND can_write)
      OR (p_action = 'delete' AND can_delete)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ✅ Checklist de Transição

### Antes de Ativar Auth

- [ ] **Validação visual 100%** de todas as rotas críticas
- [ ] **Prints light/dark** capturados e aprovados
- [ ] **Comparação Figma → Code** sem gaps significativos
- [ ] **Testes E2E** passando sem auth
- [ ] **Aprovação de stakeholders** no design
- [ ] **Documentação técnica** completa

### Durante Ativação de Auth

- [ ] **Migrations de auth** aplicadas no Supabase
- [ ] **Tabela `profiles`** criada e populada
- [ ] **RLS policies** definidas e testadas
- [ ] **Feature flags** atualizadas (`AUTH_REQUIRED=true`)
- [ ] **Variáveis de ambiente** configuradas
- [ ] **Fluxos de login/logout** implementados
- [ ] **Redirecionamentos** configurados
- [ ] **Session management** ativo

### Após Ativação de Auth

- [ ] **Testes de login** em diferentes browsers
- [ ] **Validação de permissões** por módulo
- [ ] **RLS funcionando** corretamente
- [ ] **Auditoria de segurança** (penetration testing)
- [ ] **Performance** não degradada
- [ ] **Logs e observabilidade** ativos
- [ ] **Documentação de usuário** atualizada

---

## 🚫 Anti-Patterns a Evitar

### ❌ Implementar auth no início
```typescript
// ERRADO: Auth bloqueando desenvolvimento
function App() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <Dashboard />;
}
```

### ✅ Implementar auth no final
```typescript
// CORRETO: Auth opcional durante dev
function App() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated && FEATURES.AUTH_REQUIRED) {
    return <Navigate to="/login" />;
  }
  
  return <Dashboard />;
}
```

---

### ❌ RLS bloqueando dados demo
```sql
-- ERRADO: Policy muito restritiva desde o início
CREATE POLICY "select_cirurgias"
ON cirurgias FOR SELECT
USING (
  auth.uid() IS NOT NULL  -- Bloqueia acesso sem login
  AND empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
);
```

### ✅ RLS permitindo dados demo
```sql
-- CORRETO: Policy flexível para desenvolvimento
CREATE POLICY "select_cirurgias"
ON cirurgias FOR SELECT
USING (
  empresa_id = 'empresa-demo-001'  -- Dados públicos demo
  OR (
    auth.uid() IS NOT NULL
    AND empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
  )
);
```

---

## 🔄 Cronograma de Implementação

### Fase 1: Desenvolvimento (6-8 semanas) ← **ATUAL**
- ✅ Design System implementado
- ✅ Componentes base (shadcn + OraclusX DS)
- ✅ Layout (Topbar, Sidebar, Routing)
- ✅ Módulos principais (Dashboard, Cirurgias, etc.)
- ✅ Previews automáticos ativos
- ✅ **SEM autenticação ativa**

### Fase 2: Validação Visual (1-2 semanas)
- ✅ Capturas automáticas light/dark
- ✅ Comparação Figma vs Código
- ✅ Refinamentos de UI/UX
- ✅ Aprovação de stakeholders
- ✅ **SEM autenticação ativa**

### Fase 3: Backend & Integrações (2-3 semanas)
- ⏳ APIs REST e GraphQL
- ⏳ Webhooks e Jobs
- ⏳ Integrações externas (ERP, CRM, etc.)
- ⏳ Observabilidade (Sentry, PostHog)
- ✅ **SEM autenticação ativa**

### Fase 4: Autenticação & Segurança (1-2 semanas) ← **FINAL**
- ⏳ Supabase Auth configurado
- ⏳ Fluxos de login/logout
- ⏳ RLS completo
- ⏳ RBAC por módulo
- ⏳ Testes de segurança
- ⚠️ **COM autenticação ativa**

### Fase 5: Deploy & Go-Live (1 semana)
- ⏳ Deploy em staging
- ⏳ Testes de carga
- ⏳ Treinamento de usuários
- ⏳ Deploy em produção
- ⚠️ **COM autenticação obrigatória**

---

## 📚 Referências

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- `docs/PLANEJAMENTO_AUTENTICACAO.md` - Plano detalhado de auth

---

## 🔗 Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/dev-session.ts` | Mock de sessão para desenvolvimento |
| `src/config/features.ts` | Feature flags (incluindo `AUTH_REQUIRED`) |
| `src/hooks/useAuth.ts` | Hook de autenticação com bypass dev |
| `supabase/migrations/999-enable-auth.sql` | Migration de ativação de auth (executar por último) |
| `docs/design/preview-url.md` | URLs de preview sem auth |
| `.env.development` | `VITE_AUTH_REQUIRED=false` |
| `.env.production` | `VITE_AUTH_REQUIRED=true` |

---

## ✅ Critérios de Aceite da Diretriz

- [x] **Documentação clara** sobre quando NÃO usar auth
- [x] **Mocks de sessão** disponíveis para desenvolvimento
- [x] **Feature flags** implementadas e documentadas
- [x] **RLS parcial** para dados demo (somente leitura)
- [x] **Checklist de transição** para fase de auth
- [x] **Anti-patterns** documentados
- [x] **Cronograma** com fase de auth no final

---

**Status:** ✅ DIRETRIZ ATIVA  
**Fase Atual:** 1 - Desenvolvimento (SEM auth)  
**Próxima Fase:** 2 - Validação Visual (SEM auth)  
**Ativação de Auth:** Fase 4 (6-10 semanas)

---

> **"Valide a experiência do usuário primeiro, proteja depois."**

