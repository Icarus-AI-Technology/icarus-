import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLeads, type Lead } from "@/hooks/useLeads";

// Mock do Supabase
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() =>
          Promise.resolve({
            data: mockLeads,
            error: null,
          }),
        ),
      })),
      insert: vi.fn(() => Promise.resolve({ data: mockLeads[0], error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockLeads[0], error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

const mockLeads: Lead[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@example.com",
    telefone: "11999999999",
    empresa: "Hospital ABC",
    cargo: "Gerente",
    origem: "site",
    status: "novo",
    temperatura: "quente",
    interesseServico: "OPME",
    mensagem: "Interessado em saber mais",
    criado_em: "2025-10-27T00:00:00Z",
    atualizado_em: "2025-10-27T00:00:00Z",
  },
];

describe("useLeads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve inicializar com estado vazio", () => {
    const { result } = renderHook(() => useLeads());

    expect(result.current.leads).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("deve carregar leads com sucesso", async () => {
    const { result } = renderHook(() => useLeads());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.leads).toHaveLength(1);
    expect(result.current.leads[0].nome).toBe("João Silva");
    expect(result.current.error).toBeNull();
  });

  it("deve adicionar um novo lead", async () => {
    const { result } = renderHook(() => useLeads());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newLead = {
      nome: "Maria Santos",
      email: "maria@example.com",
      telefone: "11888888888",
      empresa: "Clínica XYZ",
      origem: "indicacao",
      status: "novo",
      temperatura: "morno",
    };

    await result.current.addLead(newLead);

    expect(result.current.error).toBeNull();
  });

  it("deve atualizar um lead existente", async () => {
    const { result } = renderHook(() => useLeads());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updateLead("1", { status: "em_contato" });

    expect(result.current.error).toBeNull();
  });

  it("deve deletar um lead", async () => {
    const { result } = renderHook(() => useLeads());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.deleteLead("1");

    expect(result.current.error).toBeNull();
  });
});
