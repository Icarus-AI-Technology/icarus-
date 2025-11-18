/**
 * Sistema de Autenticação Customizado
 * Gerencia login, logout, sessão e permissões
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

// Tipos
export interface Usuario {
  id: string;
  email: string;
  nome_completo: string;
  cargo: string;
  empresa_id: string;
  empresa_nome?: string;
  avatar_url?: string;
  perfil?: string;
}

export interface Permissao {
  codigo: string;
  nome: string;
  recurso: string;
  acao: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  permissoes: Permissao[];
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; mensagem: string }>;
  logout: () => Promise<void>;
  temPermissao: (codigo: string) => boolean;
  temAcessoRecurso: (recurso: string, acao?: string) => boolean;
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar sessão salva no localStorage
  useEffect(() => {
    const sessaoSalva = localStorage.getItem('icarus_session');
    if (sessaoSalva) {
      try {
        const dados = JSON.parse(sessaoSalva);
        setUsuario(dados.usuario);
        setPermissoes(dados.permissoes || []);
      } catch (error) {
        const err = error as Error;
        console.error('Erro ao carregar sessão:', err);
        localStorage.removeItem('icarus_session');
      }
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);

      // 1) Tenta login via RPC (contrato legado)
      const { data, error } = await supabase.rpc('validar_login', {
        p_email: email,
        p_senha: senha,
      });

      let usuarioCompleto: Usuario | null = null;
      let permsData: Permissao[] = [];

      if (!error && Array.isArray(data) && data[0]?.sucesso) {
        const u = data[0] as Record<string, unknown>;
        usuarioCompleto = {
          id: String(u.usuario_id || ''),
          email: String(u.email || email),
          nome_completo: String(u.nome_completo || ''),
          cargo: String(u.cargo || ''),
          empresa_id: String(u.empresa_id || ''),
          empresa_nome: (u.empresa_nome as string | undefined) || undefined,
        };

        const { data: perms } = await supabase.rpc('obter_permissoes_usuario', {
          p_usuario_id: usuarioCompleto.id,
        });
        permsData = (perms as Permissao[]) || [];
      } else {
        // 2) Fallback: usa auth nativa do Supabase
        const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (authErr) {
          return { sucesso: false, mensagem: authErr.message || 'Credenciais inválidas' };
        }

        const supaUser = auth.user;
        // perfil opcional
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, empresa_id, role, company_name')
          .eq('id', supaUser.id)
          .maybeSingle();

        usuarioCompleto = {
          id: supaUser.id,
          email: supaUser.email || email,
          nome_completo: (profile?.full_name as string | undefined) || (supaUser.user_metadata?.full_name as string | undefined) || '',
          cargo: (profile?.role as string | undefined) || 'user',
          empresa_id: (profile?.empresa_id as string | undefined) || '',
          empresa_nome: (profile?.company_name as string | undefined) || undefined,
        };

        const { data: perms } = await supabase.rpc('obter_permissoes_usuario', {
          p_usuario_id: usuarioCompleto.id,
        });
        permsData = (perms as Permissao[]) || [];
      }

      setUsuario(usuarioCompleto);
      setPermissoes(permsData);

      localStorage.setItem(
        'icarus_session',
        JSON.stringify({ usuario: usuarioCompleto, permissoes: permsData, timestamp: new Date().toISOString() })
      );

      return { sucesso: true, mensagem: 'Login realizado com sucesso!' };
    } catch (error) {
      const err = error as Error;
      console.error('Erro no login:', err);
      return { sucesso: false, mensagem: err.message || 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setUsuario(null);
    setPermissoes([]);
    localStorage.removeItem('icarus_session');
  };

  // Verificar se tem permissão específica
  const temPermissao = (codigo: string): boolean => {
    if (!usuario) return false;
    
    // CEO e SYSTEM_ALL tem acesso a tudo
    if (permissoes.some(p => p.codigo === 'SYSTEM_ALL')) return true;
    
    return permissoes.some(p => p.codigo === codigo);
  };

  // Verificar acesso a recurso específico
  const temAcessoRecurso = (recurso: string, acao?: string): boolean => {
    if (!usuario) return false;
    
    // CEO e SYSTEM_ALL tem acesso a tudo
    if (permissoes.some(p => p.codigo === 'SYSTEM_ALL')) return true;
    
    return permissoes.some(p => {
      const recursoMatch = p.recurso === recurso;
      const acaoMatch = !acao || p.acao === acao || p.acao === 'all' || p.acao === 'manage';
      return recursoMatch && acaoMatch;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        permissoes,
        loading,
        login,
        logout,
        temPermissao,
        temAcessoRecurso,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

