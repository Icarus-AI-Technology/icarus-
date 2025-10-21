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

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

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
      } catch (_error) {
        console.error('Erro ao carregar sessão:', error);
        localStorage.removeItem('icarus_session');
      }
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);

      // Chamar função RPC de validação de login
      const { data, error } = await supabase.rpc('validar_login', {
        p_email: email,
        p_senha: senha,
      });

      if (error) throw error;

      if (!data || data.length === 0 || !data[0].sucesso) {
        return {
          sucesso: false,
          mensagem: data?.[0]?.mensagem || 'Credenciais inválidas',
        };
      }

      const usuarioData = data[0];

      // Carregar permissões
      const { data: permsData } = await supabase.rpc('obter_permissoes_usuario', {
        p_usuario_id: usuarioData.usuario_id,
      });

      const usuarioCompleto: Usuario = {
        id: usuarioData.usuario_id,
        email: usuarioData.email,
        nome_completo: usuarioData.nome_completo,
        cargo: usuarioData.cargo,
        empresa_id: usuarioData.empresa_id,
        empresa_nome: usuarioData.empresa_nome,
      };

      setUsuario(usuarioCompleto);
      setPermissoes(permsData || []);

      // Salvar no localStorage
      localStorage.setItem(
        'icarus_session',
        JSON.stringify({
          usuario: usuarioCompleto,
          permissoes: permsData || [],
          timestamp: new Date().toISOString(),
        })
      );

      return {
        sucesso: true,
        mensagem: 'Login realizado com sucesso!',
      };
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao fazer login',
      };
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

