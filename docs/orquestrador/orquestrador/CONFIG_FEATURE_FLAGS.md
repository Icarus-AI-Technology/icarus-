# 🔐 Configuração de Feature Flags - Autenticação

**ICARUS v5.0**  
**Data:** 20 de outubro de 2025

---

## 📋 Variáveis de Ambiente

### Desenvolvimento (.env.development)
```bash
# ====================================
# AUTENTICAÇÃO (DESLIGADA em DEV)
# ====================================
VITE_AUTH_REQUIRED=false
VITE_MOCK_DATA=true
VITE_SKIP_AUTH=true

# ====================================
# PREVIEW & VALIDAÇÃO VISUAL
# ====================================
VITE_PREVIEW_MODE=true
VITE_PREVIEW_URL=http://localhost:4173

# ====================================
# SUPABASE (DEV)
# ====================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# ====================================
# DADOS DE DEMONSTRAÇÃO
# ====================================
VITE_DEV_EMPRESA_ID=empresa-demo-001
VITE_DEV_USER_EMAIL=dev@icarus.local
VITE_DEV_USER_NAME=Desenvolvedor
VITE_DEV_USER_ROLE=admin
```

### Produção (.env.production)
```bash
# ====================================
# AUTENTICAÇÃO (LIGADA em PROD)
# ====================================
VITE_AUTH_REQUIRED=true
VITE_MOCK_DATA=false
VITE_SKIP_AUTH=false

# ====================================
# PREVIEW & VALIDAÇÃO VISUAL
# ====================================
VITE_PREVIEW_MODE=false

# ====================================
# SUPABASE (PROD)
# ====================================
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key

# ====================================
# SEGURANÇA
# ====================================
VITE_ENABLE_RLS=true
VITE_ENABLE_RBAC=true
VITE_SESSION_TIMEOUT=3600
```

---

## 🛠️ Implementação

### 1. Arquivo de Configuração

**Criar:** `src/config/features.ts`

```typescript
/**
 * Feature Flags - ICARUS v5.0
 * 
 * Controla funcionalidades ativadas/desativadas por ambiente
 */

export const FEATURES = {
  // ====================================
  // AUTENTICAÇÃO
  // ====================================
  
  /** Requer autenticação para acessar rotas */
  AUTH_REQUIRED: import.meta.env.VITE_AUTH_REQUIRED === 'true',
  
  /** Pular validação de autenticação (dev only) */
  SKIP_AUTH: import.meta.env.VITE_SKIP_AUTH === 'true',
  
  /** Usar dados mockados ao invés de Supabase */
  MOCK_DATA: import.meta.env.VITE_MOCK_DATA === 'true',
  
  // ====================================
  // AMBIENTE
  // ====================================
  
  /** Modo de desenvolvimento */
  DEV_MODE: import.meta.env.DEV,
  
  /** Modo de preview (validação visual) */
  PREVIEW_MODE: import.meta.env.VITE_PREVIEW_MODE === 'true',
  
  /** URL do preview */
  PREVIEW_URL: import.meta.env.VITE_PREVIEW_URL || 'http://localhost:4173',
  
  // ====================================
  // SEGURANÇA
  // ====================================
  
  /** Row Level Security ativo */
  ENABLE_RLS: import.meta.env.VITE_ENABLE_RLS === 'true',
  
  /** Role-Based Access Control ativo */
  ENABLE_RBAC: import.meta.env.VITE_ENABLE_RBAC === 'true',
  
  /** Timeout de sessão (segundos) */
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600', 10),
  
  // ====================================
  // DADOS DE DESENVOLVIMENTO
  // ====================================
  
  DEV_EMPRESA_ID: import.meta.env.VITE_DEV_EMPRESA_ID || 'empresa-demo-001',
  DEV_USER_EMAIL: import.meta.env.VITE_DEV_USER_EMAIL || 'dev@icarus.local',
  DEV_USER_NAME: import.meta.env.VITE_DEV_USER_NAME || 'Desenvolvedor',
  DEV_USER_ROLE: import.meta.env.VITE_DEV_USER_ROLE || 'admin',
} as const;

// ====================================
// HELPERS
// ====================================

/** Verifica se está em modo de desenvolvimento */
export const isDev = () => FEATURES.DEV_MODE;

/** Verifica se auth está desligada */
export const isAuthDisabled = () => !FEATURES.AUTH_REQUIRED || FEATURES.SKIP_AUTH;

/** Verifica se deve usar dados mockados */
export const useMockData = () => FEATURES.MOCK_DATA || (FEATURES.DEV_MODE && !FEATURES.AUTH_REQUIRED);

/** Verifica se está em modo de preview */
export const isPreviewMode = () => FEATURES.PREVIEW_MODE;

/** Loga configuração atual (dev only) */
export const logFeatureFlags = () => {
  if (!FEATURES.DEV_MODE) return;
  
  console.group('🚩 Feature Flags');
  console.log('AUTH_REQUIRED:', FEATURES.AUTH_REQUIRED);
  console.log('SKIP_AUTH:', FEATURES.SKIP_AUTH);
  console.log('MOCK_DATA:', FEATURES.MOCK_DATA);
  console.log('PREVIEW_MODE:', FEATURES.PREVIEW_MODE);
  console.log('DEV_MODE:', FEATURES.DEV_MODE);
  console.groupEnd();
};

// Log automático em dev
if (FEATURES.DEV_MODE) {
  logFeatureFlags();
}
```

---

### 2. Mock de Sessão de Desenvolvimento

**Criar:** `src/lib/dev-session.ts`

```typescript
/**
 * Sessão de Desenvolvimento (Mock)
 * 
 * Usada quando AUTH_REQUIRED=false para permitir
 * desenvolvimento e validação visual sem fricção de login
 */

import { FEATURES } from '@/config/features';

export interface DevSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    empresa_id: string;
  };
  isAuthenticated: true;
  isDevelopment: true;
}

export const DEV_SESSION: DevSession = {
  user: {
    id: 'dev-user-001',
    email: FEATURES.DEV_USER_EMAIL,
    name: FEATURES.DEV_USER_NAME,
    role: FEATURES.DEV_USER_ROLE,
    empresa_id: FEATURES.DEV_EMPRESA_ID,
  },
  isAuthenticated: true,
  isDevelopment: true,
};

/**
 * Retorna sessão de desenvolvimento se auth estiver desligada
 */
export function getDevSession(): DevSession | null {
  if (FEATURES.SKIP_AUTH || !FEATURES.AUTH_REQUIRED) {
    return DEV_SESSION;
  }
  return null;
}

/**
 * Verifica se deve usar sessão de desenvolvimento
 */
export function shouldUseDevSession(): boolean {
  return FEATURES.DEV_MODE && (FEATURES.SKIP_AUTH || !FEATURES.AUTH_REQUIRED);
}
```

---

### 3. Hook de Autenticação com Bypass

**Criar:** `src/hooks/useAuth.ts`

```typescript
/**
 * Hook de Autenticação - com suporte a bypass em dev
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FEATURES } from '@/config/features';
import { DEV_SESSION, getDevSession, shouldUseDevSession } from '@/lib/dev-session';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | typeof DEV_SESSION | null;
  user: User | typeof DEV_SESSION.user | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDevelopment: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isDevelopment: false,
  });

  useEffect(() => {
    // ====================================
    // MODO DESENVOLVIMENTO: usar mock
    // ====================================
    if (shouldUseDevSession()) {
      const devSession = getDevSession();
      setState({
        session: devSession,
        user: devSession?.user || null,
        isLoading: false,
        isAuthenticated: true,
        isDevelopment: true,
      });
      return;
    }

    // ====================================
    // MODO PRODUÇÃO: usar Supabase Auth
    // ====================================
    let mounted = true;

    async function getSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          setState({
            session,
            user: session?.user || null,
            isLoading: false,
            isAuthenticated: !!session,
            isDevelopment: false,
          });
        }
      } catch (error) {
        console.error('Erro ao obter sessão:', error);
        if (mounted) {
          setState({
            session: null,
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isDevelopment: false,
          });
        }
      }
    }

    getSession();

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setState({
            session,
            user: session?.user || null,
            isLoading: false,
            isAuthenticated: !!session,
            isDevelopment: false,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ====================================
  // AÇÕES
  // ====================================

  const login = async (email: string, password: string) => {
    if (FEATURES.SKIP_AUTH) {
      console.warn('Login ignorado: SKIP_AUTH está ativo');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const logout = async () => {
    if (FEATURES.SKIP_AUTH) {
      console.warn('Logout ignorado: SKIP_AUTH está ativo');
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (FEATURES.SKIP_AUTH) {
      console.warn('SignUp ignorado: SKIP_AUTH está ativo');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
  };

  return {
    ...state,
    login,
    logout,
    signUp,
  };
}
```

---

### 4. Protected Route com Bypass

**Criar:** `src/components/ProtectedRoute.tsx`

```typescript
/**
 * Rota Protegida - com suporte a bypass em dev
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FEATURES } from '@/config/features';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, isDevelopment } = useAuth();

  // ====================================
  // BYPASS: Auth não requerida
  // ====================================
  if (!FEATURES.AUTH_REQUIRED || FEATURES.SKIP_AUTH) {
    return <>{children}</>;
  }

  // ====================================
  // MODO DESENVOLVIMENTO: permitir acesso
  // ====================================
  if (isDevelopment) {
    return <>{children}</>;
  }

  // ====================================
  // LOADING
  // ====================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ====================================
  // VALIDAÇÃO: redirecionar se não autenticado
  // ====================================
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
```

---

## 🧪 Testes

### Desenvolvimento (Auth Desligada)
```bash
# Configurar env
cp .env.development .env

# Iniciar dev server
npm run dev

# Acessar qualquer rota (sem login)
# http://localhost:3000/dashboard ✅
```

### Produção (Auth Ligada)
```bash
# Configurar env
cp .env.production .env

# Build e preview
npm run build
npm run preview

# Acessar rota protegida (redireciona para /login)
# http://localhost:4173/dashboard → /login ✅
```

---

## ✅ Checklist

- [x] Arquivo `src/config/features.ts` criado
- [x] Arquivo `src/lib/dev-session.ts` criado
- [ ] Arquivo `src/hooks/useAuth.ts` criado
- [ ] Arquivo `src/components/ProtectedRoute.tsx` criado
- [ ] Arquivo `.env.development` configurado
- [ ] Arquivo `.env.production` configurado (quando for ativar auth)
- [ ] Testes de bypass em desenvolvimento
- [ ] Validação de redirecionamento em produção

---

**Status:** 📝 DOCUMENTAÇÃO COMPLETA  
**Próximos Passos:** Implementar arquivos TypeScript e testar bypass

---

