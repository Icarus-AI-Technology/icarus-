/**
 * Hook: useAuth
 * Gerenciamento de autenticação com Supabase
 * Compatível com AuthContext (usuario) e Supabase (user)
 */

import { useState, useEffect, useCallback } from 'react';
import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'admin' | 'medico' | 'financeiro' | 'estoque' | 'vendas';
}

interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  status?: 'ativa' | 'inativa' | 'suspensa';
}

export function useAuth() {
  // Importar contexto para compatibilidade
  const authContext = useAuthContext();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [empresaAtual, setEmpresaAtual] = useState<Empresa | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEmpresa = useCallback(async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, cnpj, status')
        .eq('id', empresaId)
        .single();

      if (error) throw error;
      setEmpresaAtual(data as Empresa);
    } catch (error) {
      const err = error as Error;
      console.error('Error loading empresa:', err);
      setEmpresaAtual(null);
    }
  }, []);

  const loadProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
        if (data?.empresa_id) {
          await loadEmpresa(data.empresa_id);
        } else {
          setEmpresaAtual(null);
        }
      } catch (error) {
        const err = error as Error;
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    },
    [loadEmpresa]
  );

  useEffect(() => {
    const loadSessionAndProfile = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
    };

    loadSessionAndProfile().catch((error) => {
      const err = error as Error;
      console.error('Error loading session:', err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sessionChanged) => {
      setSession(sessionChanged);
      setUser(sessionChanged?.user ?? null);

      if (sessionChanged?.user) {
        loadProfile(sessionChanged.user.id).catch((error) => {
          const err = error as Error;
          console.error('Error loading profile:', err);
        });
      } else {
        setProfile(null);
        setEmpresaAtual(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  return {
    // Supabase Auth (compatibilidade com código existente)
    user,
    profile,
    empresaAtual,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',

    // AuthContext (compatibilidade com novos hooks)
    usuario:
      authContext?.usuario ||
      (user
        ? {
            id: user.id,
            email: user.email || '',
            nome_completo: profile?.full_name || '',
            cargo: profile?.role || '',
            empresa_id: empresaAtual?.id || '',
            empresa_nome: empresaAtual?.nome,
            avatar_url: profile?.avatar_url,
          }
        : null),
    permissoes: authContext?.permissoes || [],
    temPermissao: authContext?.temPermissao || (() => false),
    temAcessoRecurso: authContext?.temAcessoRecurso || (() => false),
  };
}
