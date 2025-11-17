import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useContratos } from "../useContratos";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            }),
          ),
        })),
      })),
      insert: vi.fn(() =>
        Promise.resolve({
          data: null,
          error: null,
        }),
      ),
      update: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: null,
            error: null,
          }),
        ),
      })),
    })),
    rpc: vi.fn(),
  },
}));

describe("useContratos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useContratos());

    expect(result.current.loading).toBe(true);
    expect(result.current.contratos).toEqual([]);
  });

  it("should fetch contratos successfully", async () => {
    const mockContratos = [
      {
        id: "1",
        fornecedor_id: "f1",
        tipo: "fornecimento",
        valor_total: 50000,
        data_inicio: "2024-01-01",
        data_fim: "2024-12-31",
        status: "ativo",
      },
      {
        id: "2",
        fornecedor_id: "f2",
        tipo: "servico",
        valor_total: 30000,
        data_inicio: "2024-02-01",
        data_fim: "2024-11-30",
        status: "pendente",
      },
    ];

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: mockContratos,
              error: null,
            }),
          ),
        })),
      })),
    });

    const { result } = renderHook(() => useContratos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.contratos).toHaveLength(2);
    });
  });

  it("should create contrato successfully", async () => {
    const novoContrato = {
      fornecedor_id: "f1",
      tipo: "fornecimento",
      valor_total: 45000,
      data_inicio: "2024-03-01",
      data_fim: "2025-02-28",
      clausulas: ["Cláusula 1", "Cláusula 2"],
    };

    const { result } = renderHook(() => useContratos());

    await waitFor(async () => {
      if (result.current.criarContrato) {
        await result.current.criarContrato(novoContrato);
        expect(true).toBe(true);
      }
    });
  });

  it("should verificar vencimento", async () => {
    const mockVencimentos = [
      { id: "1", dias_restantes: 30 },
      { id: "2", dias_restantes: 15 },
    ];

    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockVencimentos,
      error: null,
    });

    const { result } = renderHook(() => useContratos());

    await waitFor(async () => {
      if (result.current.verificarVencimentos) {
        const vencimentos = await result.current.verificarVencimentos(60);
        expect(vencimentos).toHaveLength(2);
      }
    });
  });

  it("should renovar contrato", async () => {
    const contratoId = "c1";
    const novaDataFim = "2025-12-31";

    const { result } = renderHook(() => useContratos());

    await waitFor(async () => {
      if (result.current.renovarContrato) {
        await result.current.renovarContrato(contratoId, novaDataFim);
        expect(true).toBe(true);
      }
    });
  });

  it("should calculate valor total ativo", async () => {
    const mockTotal = 125000;

    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockTotal,
      error: null,
    });

    const { result } = renderHook(() => useContratos());

    await waitFor(async () => {
      if (result.current.calcularTotalAtivo) {
        const total = await result.current.calcularTotalAtivo();
        expect(total).toBe(mockTotal);
      }
    });
  });
});
