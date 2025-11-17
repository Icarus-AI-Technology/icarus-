/**
 * Hook: useAuth
 * Gerenciamento de autenticação com Supabase
 */

import { useState, useEffect, useCallback } from "react";
import type {
  Session as SupabaseSession,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: "admin" | "medico" | "financeiro" | "estoque" | "vendas";
}

interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  status?: "ativa" | "inativa" | "suspensa";
}

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [empresaAtual, setEmpresaAtual] = useState<Empresa | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEmpresa = useCallback(async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome, cnpj, status")
        .eq("id", empresaId)
        .single();

      if (error) throw error;
      setEmpresaAtual(data as Empresa);
    } catch (error) {
      const err = error as Error;
      console.error("Error loading empresa:", err);
      setEmpresaAtual(null);
    }
  }, []);

  const loadProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
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
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    },
    [loadEmpresa],
  );

  useEffect(() => {
    const loadSessionAndProfile = async () => {
      // 🔧 MODO MOCK: Verificar se deve usar mock
      const useMockAuth =
        localStorage.getItem("icarus_use_mock_auth") === "true" ||
        import.meta.env.VITE_USE_MOCK_AUTH === "true";

      if (useMockAuth) {
        console.log(
          "🔧 useAuth: MODO MOCK ativo - pulando verificação Supabase",
        );

        // Carregar sessão mock do localStorage se existir
        const mockSession = localStorage.getItem("sb-auth-token");
        if (mockSession) {
          try {
            const parsed = JSON.parse(mockSession);
            setUser(parsed.user);
            setProfile({
              id: parsed.user.id,
              email: parsed.user.email,
              full_name: "Dax Meneghel (DEMO)",
              role: "admin",
            });
            setEmpresaAtual({
              id: "mock-empresa-001",
              nome: "NewOrtho DEMO",
              cnpj: "00.000.000/0001-00",
              status: "ativa",
            });
          } catch (e) {
            console.warn("Mock session inválida");
          }
        }
        setLoading(false);
        return;
      }

      // Modo normal com Supabase
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data.session ?? null;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadProfile(currentSession.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        // Se falhar ao conectar, ativar modo mock automaticamente
        const err = error as Error;
        console.warn(
          "⚠️ Falha ao conectar com Supabase. Ativando MODO MOCK automaticamente...",
          err.message,
        );
        localStorage.setItem("icarus_use_mock_auth", "true");
        setLoading(false);
      }
    };

    loadSessionAndProfile().catch((error) => {
      const err = error as Error;
      console.error("Error loading session:", err);
      localStorage.setItem("icarus_use_mock_auth", "true");
      setLoading(false);
    });

    // 🔧 Apenas configurar listener se NÃO estiver em modo mock
    const useMockAuth =
      localStorage.getItem("icarus_use_mock_auth") === "true" ||
      import.meta.env.VITE_USE_MOCK_AUTH === "true";

    if (useMockAuth) {
      console.log("🔧 useAuth: Modo MOCK - pulando onAuthStateChange listener");
      return () => {}; // Cleanup vazio
    }

    // Modo normal: listener do Supabase
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, sessionChanged) => {
        setSession(sessionChanged);
        setUser(sessionChanged?.user ?? null);

        if (sessionChanged?.user) {
          loadProfile(sessionChanged.user.id).catch((error) => {
            const err = error as Error;
            console.error("Error loading profile:", err);
          });
        } else {
          setProfile(null);
          setEmpresaAtual(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      localStorage.setItem("icarus_use_mock_auth", "true");
      return () => {};
    }
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    // 🔧 MODO MOCK: Detectar se deve usar autenticação mockada
    const useMockAuth =
      localStorage.getItem("icarus_use_mock_auth") === "true" ||
      import.meta.env.VITE_USE_MOCK_AUTH === "true";

    if (useMockAuth) {
      console.log("🔧 useAuth: MODO MOCK ativado");
      return await signInMock(email, password);
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      // Se falhar conexão, ativar modo mock automaticamente
      const err = error as Error;
      if (err.message?.includes("fetch") || err.message?.includes("network")) {
        console.warn("⚠️ Falha de conexão. Ativando MODO MOCK...");
        localStorage.setItem("icarus_use_mock_auth", "true");
        return await signInMock(email, password);
      }
      throw error;
    }
  };

  // 🔧 FUNÇÃO MOCK: Login mockado para desenvolvimento offline
  const signInMock = async (email: string, password: string) => {
    // Credenciais mockadas
    const mockCredentials = [
      { email: "dax@newortho.com.br", password: "Admin@123456!" },
      { email: "dax@newortho.com.br", password: "admin123" },
      { email: "admin@icarus.com", password: "admin123" },
    ];

    const isValid = mockCredentials.some(
      (cred) =>
        cred.email.toLowerCase() === email.toLowerCase() &&
        cred.password === password,
    );

    if (!isValid) {
      throw new Error(
        "🔧 MOCK MODE: Credenciais inválidas. Use: dax@newortho.com.br / Admin@123456!",
      );
    }

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Criar usuário mock
    const mockUser = {
      id: "mock-user-id-001",
      email,
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as SupabaseUser;

    const mockProfile: Profile = {
      id: mockUser.id,
      email,
      full_name: "Dax Meneghel (DEMO)",
      role: "admin",
      avatar_url: undefined,
    };

    const mockEmpresa: Empresa = {
      id: "mock-empresa-001",
      nome: "NewOrtho DEMO",
      cnpj: "00.000.000/0001-00",
      status: "ativa",
    };

    // Salvar no state
    setUser(mockUser);
    setProfile(mockProfile);
    setEmpresaAtual(mockEmpresa);

    // Salvar sessão mock
    const mockSession = {
      access_token: "mock-token-" + Date.now(),
      refresh_token: "mock-refresh-" + Date.now(),
      user: mockUser,
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
    };

    localStorage.setItem("sb-auth-token", JSON.stringify(mockSession));

    console.log("✅ MOCK MODE: Login bem-sucedido!", mockProfile);

    return {
      user: mockUser,
      session: mockSession as any,
    };
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
    if (!user) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
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
    isAdmin: profile?.role === "admin",
  };
}
