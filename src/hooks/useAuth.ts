/**
 * Hook: useAuth
 * Gerenciamento de autenticação com Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [empresaAtual, setEmpresaAtual] = useState<Empresa | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
    } catch (_error) {
      console.error('Error loading empresa:', error);
      setEmpresaAtual(null);
    }
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
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
    } catch (_error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [loadEmpresa]);

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
      console.error('Error loading session:', error);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sessionChanged) => {
      setSession(sessionChanged);
      setUser(sessionChanged?.user ?? null);

      if (sessionChanged?.user) {
        loadProfile(sessionChanged.user.id).catch((error) => {
          console.error('Error loading profile:', error);
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
  };
}

