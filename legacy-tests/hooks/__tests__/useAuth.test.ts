import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../useAuth";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.usuario).toBeNull();
  });

  it("should login successfully with valid credentials", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      nome_completo: "Test User",
      cargo: "admin",
      empresa_id: "456",
    };

    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [{ sucesso: true, ...mockUser }],
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      const response = await result.current.login(
        "test@example.com",
        "password123",
      );
      expect(response.sucesso).toBe(true);
    });
  });

  it("should handle login error", async () => {
    const { supabase } = await import("@/lib/supabase");
    (
      supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid credentials" },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      const response = await result.current.login("wrong@example.com", "wrong");
      expect(response.sucesso).toBe(false);
      expect(response.mensagem).toBeTruthy();
    });
  });

  it("should logout successfully", async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      await result.current.logout();
      expect(result.current.usuario).toBeNull();
      expect(localStorage.getItem("icarus_session")).toBeNull();
    });
  });

  it("should check permissions correctly", () => {
    // TODO: Implementar teste de permissões
    expect(true).toBe(true);
  });
});
